"""
tune_webapp.py  --  Visual bank metadata tuning web app
=========================================================
Run:   python tune_webapp.py
Opens: http://localhost:5050

The browser shows the actual PDF on the left and extracted JSON
on the right. Use the buttons to Approve / Skip / log corrections.
Press [R] to hot-reload the extractor after fixing extract_metadata.py.
"""

import os
import re
import json
import importlib.util
from datetime import datetime
from flask import Flask, request, jsonify, send_file, abort, render_template_string

# ---------------------------------------------------------------------------
# CONFIG
# ---------------------------------------------------------------------------
_HERE           = os.path.dirname(os.path.abspath(__file__))
PDF_DIR         = os.path.join(_HERE, "pdfs", "BANK")
DEFAULT_MD      = os.path.join(_HERE, "pdfs", "BANK", "combined_output.md")
OUTPUT_DIR      = os.path.join(_HERE, "metadata")
LOG_FILE        = os.path.join(_HERE, "tuning_log.json")
EXTRACTOR_PATH  = os.path.join(_HERE, "extract_metadata.py")
PORT            = 5050

TABLE_START_SIGNALS = [
    r"^\s*(sr\.?\s*no|serial\s*no|s\.no|sno)\b",
    r"^\s*(date\s+(narration|particulars|description|transaction|instrument|ref))\b",
    r"^\s*(tran\s*date|value\s*date|post\s*date)\b",
    r"^\s*(transaction\s+date\s+from|transaction\s+cheque)\b",
    r"^\s*(opening\s+balance|brought\s+forward)\b",
    r"^\s*#\s+date\s+description\b",
    r"^\s*(debit|credit|withdrawal|deposit|amount|balance)\s*\(",
    r"amount in\(inr\)",
]

# ---------------------------------------------------------------------------
# APP STATE  (simple in-memory; persisted to LOG_FILE)
# ---------------------------------------------------------------------------
app = Flask(__name__)

state = {
    "banks": [],          # list of {"source": filename, "text": block, "type": "md"|"pdf"}
    "idx":   0,
    "extractor": None,
}


# ---------------------------------------------------------------------------
# HELPERS
# ---------------------------------------------------------------------------

def load_log():
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"approved": {}, "skipped": {}, "corrections": {}}


def save_log(log):
    with open(LOG_FILE, "w", encoding="utf-8") as f:
        json.dump(log, f, indent=2, ensure_ascii=False)


def load_extractor():
    spec = importlib.util.spec_from_file_location("extract_metadata", EXTRACTOR_PATH)
    mod  = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def crop_header(text):
    lines, out = text.split("\n"), []
    for line in lines:
        ll = line.lower().strip()
        if any(re.search(p, ll) for p in TABLE_START_SIGNALS):
            break
        out.append(line)
        if len(out) > 60:
            break
    while out and not out[0].strip():  out.pop(0)
    while out and not out[-1].strip(): out.pop()
    return "\n".join(out)


def list_unknowns(meta, prefix=""):
    out = []
    for k, v in meta.items():
        path = "{}.{}".format(prefix, k) if prefix else k
        if isinstance(v, dict):
            out.extend(list_unknowns(v, path))
        elif v == "UNKNOWN":
            out.append(path)
        elif isinstance(v, float) and v == 0.0 and "balance" in k.lower():
            out.append("{} (=0.0)".format(path))
    return out


def parse_md_banks(md_path):
    with open(md_path, "r", encoding="utf-8") as f:
        content = f.read()
    sections = re.split(r"^##\s+File:\s+(.+?)$", content, flags=re.MULTILINE)
    banks = []
    for i in range(1, len(sections), 2):
        filename = sections[i].strip()
        block    = sections[i + 1] if i + 1 < len(sections) else ""
        block    = re.sub(r"\n-{4,}\n", "", block).strip()
        banks.append({"source": filename, "text": block, "type": "md"})
    return banks


def parse_pdf_banks(pdf_dir):
    banks = []
    for f in sorted(os.listdir(pdf_dir)):
        if f.lower().endswith(".pdf"):
            banks.append({"source": f, "text": None, "type": "pdf", "path": os.path.join(pdf_dir, f)})
    return banks


def run_extraction(bank_entry):
    ext = state["extractor"]
    if bank_entry["type"] == "md":
        text = bank_entry["text"]
        meta = ext._run_extraction(text, text, bank_entry["source"])
        header = crop_header(text)
        return header, meta
    else:  # pdf
        try:
            import pdfplumber
        except ImportError:
            raise ImportError("pdfplumber not installed")
        full, first = "", ""
        with pdfplumber.open(bank_entry["path"]) as pdf:
            if pdf.pages:
                first = pdf.pages[0].extract_text() or ""
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    full += t + "\n"
        meta   = ext._run_extraction(first, full, bank_entry["source"])
        header = crop_header(first)
        return header, meta


def save_json(meta, source):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    base     = os.path.splitext(source)[0]
    out_path = os.path.join(OUTPUT_DIR, "{}_profile.json".format(base))
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)
    return out_path


# ---------------------------------------------------------------------------
# ROUTES — API
# ---------------------------------------------------------------------------

@app.route("/api/current")
def api_current():
    banks = state["banks"]
    idx   = state["idx"]
    log   = load_log()

    if idx >= len(banks):
        return jsonify({"done": True, "total": len(banks)})

    bank = banks[idx]
    source = bank["source"]

    try:
        header_text, meta = run_extraction(bank)
    except Exception as e:
        return jsonify({"error": str(e), "source": source, "idx": idx, "total": len(banks)})

    unknowns = list_unknowns(meta)
    bank_name = meta.get("institution", {}).get("bank_name", "UNKNOWN")

    return jsonify({
        "done":        False,
        "idx":         idx,
        "total":       len(banks),
        "source":      source,
        "bank_name":   bank_name,
        "header_text": header_text,
        "meta":        meta,
        "unknowns":    unknowns,
        "log_status":  {
            "approved":    list(log["approved"].keys()),
            "skipped":     list(log["skipped"].keys()),
            "corrections": {k: v.get("note", "") for k, v in log["corrections"].items()},
        },
        "pdf_available": bank["type"] == "pdf" or _find_pdf(source) is not None,
        "pdf_url":       "/pdf/{}".format(source) if _find_pdf(source) else None,
    })


@app.route("/api/action", methods=["POST"])
def api_action():
    data   = request.json
    action = data.get("action", "").lower()
    note   = data.get("note", "").strip()
    log    = load_log()
    banks  = state["banks"]
    idx    = state["idx"]

    if idx >= len(banks):
        return jsonify({"ok": False, "msg": "No more banks."})

    bank   = banks[idx]
    source = bank["source"]

    if action == "approve":
        try:
            _, meta = run_extraction(bank)
        except Exception as e:
            return jsonify({"ok": False, "msg": str(e)})
        saved = save_json(meta, source)
        bank_name = meta.get("institution", {}).get("bank_name", "UNKNOWN")
        log["approved"][source] = {
            "timestamp": datetime.now().isoformat(),
            "bank_name": bank_name,
            "output":    saved,
        }
        log["corrections"].pop(source, None)
        save_log(log)
        state["idx"] += 1
        return jsonify({"ok": True, "msg": "Approved and saved to {}".format(saved), "next": True})

    elif action == "skip":
        log["skipped"][source] = {"timestamp": datetime.now().isoformat()}
        save_log(log)
        state["idx"] += 1
        return jsonify({"ok": True, "msg": "Skipped {}".format(source), "next": True})

    elif action == "retry":
        try:
            state["extractor"] = load_extractor()
            return jsonify({"ok": True, "msg": "Extractor reloaded. Re-running extraction...", "next": False})
        except Exception as e:
            return jsonify({"ok": False, "msg": "Reload failed: {}".format(e)})

    elif action == "correct":
        if not note:
            return jsonify({"ok": False, "msg": "Please type a correction note."})
        bank_name = "UNKNOWN"
        try:
            _, meta = run_extraction(bank)
            bank_name = meta.get("institution", {}).get("bank_name", "UNKNOWN")
        except Exception:
            pass
        log["corrections"][source] = {
            "timestamp":  datetime.now().isoformat(),
            "bank_name":  bank_name,
            "note":       note,
        }
        log["skipped"].pop(source, None)
        save_log(log)
        return jsonify({"ok": True, "msg": "Correction logged. Fix extract_metadata.py then click Retry.", "next": False})

    elif action == "goto":
        target = int(data.get("idx", 0))
        if 0 <= target < len(banks):
            state["idx"] = target
            return jsonify({"ok": True, "msg": "Jumped to bank #{}.".format(target + 1), "next": False})
        return jsonify({"ok": False, "msg": "Invalid index."})

    return jsonify({"ok": False, "msg": "Unknown action: {}".format(action)})


@app.route("/api/log")
def api_log():
    return jsonify(load_log())


@app.route("/api/log/reset", methods=["POST"])
def api_log_reset():
    save_log({"approved": {}, "skipped": {}, "corrections": {}})
    state["idx"] = 0
    return jsonify({"ok": True})


@app.route("/api/jump_to_next_pending", methods=["POST"])
def api_jump_next_pending():
    log   = load_log()
    banks = state["banks"]
    done  = set(log["approved"].keys()) | set(log["skipped"].keys())
    for i, b in enumerate(banks):
        if b["source"] not in done:
            state["idx"] = i
            return jsonify({"ok": True, "idx": i})
    state["idx"] = len(banks)
    return jsonify({"ok": True, "idx": len(banks), "done": True})


def _find_pdf(source):
    """Return full path to PDF if it exists in PDF_DIR, else None."""
    # source could be "BOB.pdf" or "BOB" etc.
    name = source if source.lower().endswith(".pdf") else source + ".pdf"
    path = os.path.join(PDF_DIR, name)
    return path if os.path.exists(path) else None


@app.route("/pdf/<path:filename>")
def serve_pdf(filename):
    path = _find_pdf(filename)
    if not path:
        abort(404)
    return send_file(path, mimetype="application/pdf")


# ---------------------------------------------------------------------------
# MAIN PAGE
# ---------------------------------------------------------------------------

HTML = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Bank Metadata Tuner</title>
<style>
  :root {
    --bg:       #0f1117;
    --panel:    #181c27;
    --border:   #2a2f3e;
    --accent:   #5b7cf6;
    --green:    #22c55e;
    --yellow:   #f59e0b;
    --red:      #ef4444;
    --text:     #e2e8f0;
    --muted:    #64748b;
    --json-key: #7dd3fc;
    --json-str: #86efac;
    --json-num: #fda4af;
    --json-unk: #fbbf24;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; background: var(--bg); color: var(--text); font-family: 'Segoe UI', system-ui, sans-serif; }

  /* TOP BAR */
  #topbar {
    display: flex; align-items: center; gap: 12px;
    background: var(--panel); border-bottom: 1px solid var(--border);
    padding: 10px 18px; height: 54px; flex-shrink: 0;
  }
  #topbar .logo { font-weight: 700; font-size: 15px; color: var(--accent); letter-spacing: .5px; }
  #progress-wrap { flex: 1; display: flex; align-items: center; gap: 10px; }
  #progress-bar-track { flex: 1; background: var(--border); border-radius: 99px; height: 6px; }
  #progress-bar-fill  { height: 6px; border-radius: 99px; background: var(--accent); transition: width .4s; }
  #progress-text { font-size: 12px; color: var(--muted); white-space: nowrap; }
  #bank-badge {
    background: var(--accent); color: #fff; font-size: 11px; font-weight: 600;
    padding: 3px 10px; border-radius: 99px; letter-spacing: .5px;
  }

  /* LAYOUT */
  #layout {
    display: flex; height: calc(100vh - 54px - 68px);
  }

  /* PDF PANEL */
  #pdf-panel {
    flex: 0 0 52%; border-right: 1px solid var(--border);
    display: flex; flex-direction: column; overflow: hidden;
  }
  #pdf-panel-header {
    background: var(--panel); border-bottom: 1px solid var(--border);
    padding: 8px 14px; font-size: 12px; color: var(--muted); display: flex; align-items: center; gap: 8px;
  }
  #pdf-panel-header span { font-weight: 600; color: var(--text); }
  #pdf-frame { flex: 1; width: 100%; border: none; background: #fff; }
  #no-pdf {
    flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 12px; color: var(--muted);
  }
  #no-pdf .icon { font-size: 48px; opacity: .4; }
  #header-text-box {
    margin: 16px; background: var(--bg); border: 1px solid var(--border); border-radius: 8px;
    padding: 14px; font-family: 'Cascadia Code', 'Consolas', monospace; font-size: 12px;
    line-height: 1.6; color: #c9d1d9; overflow-y: auto; max-height: 100%;
    white-space: pre-wrap; word-break: break-word;
  }

  /* JSON PANEL */
  #json-panel {
    flex: 1; display: flex; flex-direction: column; overflow: hidden;
  }
  #json-panel-header {
    background: var(--panel); border-bottom: 1px solid var(--border);
    padding: 8px 14px; font-size: 12px; color: var(--muted); display: flex; align-items: center; justify-content: space-between;
  }
  #unknown-badge {
    font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 99px;
    background: #78350f; color: var(--yellow); display: none;
  }
  #json-scroll { flex: 1; overflow-y: auto; padding: 14px; }
  pre#json-display {
    font-family: 'Cascadia Code', 'Consolas', monospace; font-size: 12.5px; line-height: 1.7;
    white-space: pre-wrap; word-break: break-word;
  }
  .jk  { color: var(--json-key); }
  .jv  { color: var(--json-str); }
  .jn  { color: var(--json-num); }
  .junk { color: var(--json-unk); font-weight: 700; }

  /* UNKNOWN FIELDS LIST */
  #unknowns-panel {
    border-top: 1px solid var(--border); background: #1c1208;
    padding: 8px 14px; font-size: 11.5px; color: var(--yellow);
    max-height: 90px; overflow-y: auto; display: none;
  }
  #unknowns-panel strong { font-size: 12px; }
  #unknowns-list { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
  #unknowns-list span {
    background: #78350f44; border: 1px solid #92400e; border-radius: 4px;
    padding: 1px 7px; font-family: monospace;
  }

  /* BOTTOM ACTION BAR */
  #actionbar {
    display: flex; align-items: center; gap: 10px;
    background: var(--panel); border-top: 1px solid var(--border);
    padding: 12px 18px; height: 68px; flex-shrink: 0;
  }
  #note-input {
    flex: 1; background: var(--bg); border: 1px solid var(--border); border-radius: 8px;
    color: var(--text); padding: 8px 12px; font-size: 13px; outline: none;
    transition: border-color .2s;
  }
  #note-input:focus { border-color: var(--accent); }
  #note-input::placeholder { color: var(--muted); }
  button {
    padding: 8px 18px; border: none; border-radius: 8px;
    font-size: 13px; font-weight: 600; cursor: pointer; transition: all .15s;
    white-space: nowrap;
  }
  button:hover { filter: brightness(1.15); transform: translateY(-1px); }
  button:active { transform: translateY(0); }
  #btn-approve { background: var(--green);  color: #000; }
  #btn-skip    { background: var(--muted);  color: #fff; }
  #btn-retry   { background: var(--accent); color: #fff; }
  #btn-correct { background: var(--yellow); color: #000; }

  /* STATUS TOAST */
  #toast {
    position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
    background: #1e293b; border: 1px solid var(--border); border-radius: 10px;
    padding: 10px 20px; font-size: 13px; color: var(--text);
    opacity: 0; transition: opacity .3s; pointer-events: none;
    max-width: 500px; text-align: center; z-index: 999;
  }
  #toast.show { opacity: 1; }
  #toast.ok   { border-color: var(--green);  color: var(--green); }
  #toast.err  { border-color: var(--red);    color: var(--red); }
  #toast.info { border-color: var(--accent); color: #93c5fd; }

  /* SIDEBAR LOG */
  #log-toggle {
    position: fixed; top: 14px; right: 14px; z-index: 50;
    background: var(--border); color: var(--text); font-size: 12px;
    padding: 5px 12px; border-radius: 6px; cursor: pointer; border: none;
  }
  #log-panel {
    position: fixed; top: 54px; right: 0; width: 320px; bottom: 0;
    background: var(--panel); border-left: 1px solid var(--border);
    display: none; flex-direction: column; z-index: 40; overflow-y: auto;
  }
  #log-panel.open { display: flex; }
  #log-panel-inner { padding: 14px; font-size: 12px; }
  .log-section { margin-bottom: 16px; }
  .log-section h4 { font-size: 11px; text-transform: uppercase; letter-spacing: .6px; color: var(--muted); margin-bottom: 8px; }
  .log-item { padding: 5px 8px; border-radius: 6px; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; cursor: pointer; }
  .log-item:hover { background: var(--border); }
  .log-item .dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
  .dot-green  { background: var(--green); }
  .dot-yellow { background: var(--yellow); }
  .dot-red    { background: var(--red); }

  /* JUMP */
  #jump-input {
    width: 60px; background: var(--bg); border: 1px solid var(--border);
    border-radius: 6px; color: var(--text); padding: 6px 8px; font-size: 12px;
    text-align: center; outline: none;
  }
  #btn-jump { background: var(--border); color: var(--text); font-size: 12px; padding: 6px 10px; }

  /* DONE screen */
  #done-screen {
    display: none; position: fixed; inset: 0; z-index: 100;
    background: var(--bg); align-items: center; justify-content: center;
    flex-direction: column; gap: 20px; text-align: center;
  }
  #done-screen.show { display: flex; }
  #done-screen h1 { font-size: 36px; color: var(--green); }
  #done-screen p  { color: var(--muted); font-size: 16px; }
  #done-screen button { background: var(--accent); color: #fff; padding: 12px 30px; font-size: 15px; }
  #spinner {
    display: none; position: fixed; inset: 0; z-index: 200;
    background: rgba(15,17,23,.6); align-items: center; justify-content: center;
  }
  #spinner.show { display: flex; }
  .spin-circle { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin .7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
</head>
<body>

<!-- TOP BAR -->
<div id="topbar">
  <div class="logo">⚙ Bank Metadata Tuner</div>
  <div id="progress-wrap">
    <div id="progress-bar-track"><div id="progress-bar-fill" style="width:0%"></div></div>
    <div id="progress-text">Loading...</div>
  </div>
  <div id="bank-badge">—</div>
  <input id="jump-input" type="number" min="1" placeholder="#" title="Jump to bank number"/>
  <button id="btn-jump" onclick="jumpTo()">Go</button>
  <button id="log-toggle" onclick="toggleLog()">📋 Log</button>
</div>

<!-- LAYOUT -->
<div id="layout">
  <!-- PDF / HEADER PANEL -->
  <div id="pdf-panel">
    <div id="pdf-panel-header">
      📄 PDF View — <span id="pdf-source-name">—</span>
    </div>
    <iframe id="pdf-frame" style="display:none"></iframe>
    <div id="no-pdf">
      <div class="icon">📄</div>
      <div id="header-text-box" style="display:none; max-height: calc(100vh - 200px); overflow-y: auto;"></div>
      <div id="no-pdf-msg" style="font-size:14px;">No PDF available for this bank section</div>
    </div>
  </div>

  <!-- JSON PANEL -->
  <div id="json-panel">
    <div id="json-panel-header">
      <span>🧬 Extracted Metadata</span>
      <span id="unknown-badge">⚠ 0 UNKNOWN</span>
    </div>
    <div id="json-scroll">
      <pre id="json-display"></pre>
    </div>
    <div id="unknowns-panel">
      <strong>⚠ Fields still UNKNOWN:</strong>
      <div id="unknowns-list"></div>
    </div>
  </div>
</div>

<!-- ACTION BAR -->
<div id="actionbar">
  <button id="btn-approve" onclick="doAction('approve')">✔ Approve</button>
  <button id="btn-skip"    onclick="doAction('skip')">⏭ Skip</button>
  <button id="btn-retry"   onclick="doAction('retry')">↻ Retry</button>
  <input  id="note-input" type="text" placeholder="Type a correction note, then click Correct…"/>
  <button id="btn-correct" onclick="doCorrect()">✎ Log Correction</button>
</div>

<!-- TOAST -->
<div id="toast"></div>

<!-- DONE -->
<div id="done-screen">
  <h1>🎉 All Done!</h1>
  <p>All bank sections have been reviewed.</p>
  <button onclick="resetAndRestart()">Reset & Start Over</button>
</div>

<!-- LOG PANEL -->
<div id="log-panel">
  <div id="log-panel-inner"></div>
</div>

<!-- SPINNER -->
<div id="spinner"><div class="spin-circle"></div></div>

<script>
let currentData = null;

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('note-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') doCorrect();
  });
  document.addEventListener('keydown', e => {
    if (document.activeElement === document.getElementById('note-input')) return;
    if (e.key === 'a' || e.key === 'A') doAction('approve');
    if (e.key === 's' || e.key === 'S') doAction('skip');
    if (e.key === 'r' || e.key === 'R') doAction('retry');
    if (e.key === 'q' || e.key === 'Q') window.close();
  });
  loadCurrent();
});

/* ── LOAD CURRENT BANK ── */
async function loadCurrent() {
  spin(true);
  try {
    const res  = await fetch('/api/current');
    const data = await res.json();
    spin(false);
    if (data.done) { showDone(); return; }
    if (data.error) { toast(data.error, 'err'); return; }
    currentData = data;
    renderPage(data);
  } catch(e) {
    spin(false);
    toast('Failed to load: ' + e.message, 'err');
  }
}

/* ── RENDER ── */
function renderPage(data) {
  // Progress
  const pct = Math.round((data.idx / data.total) * 100);
  document.getElementById('progress-bar-fill').style.width = pct + '%';
  document.getElementById('progress-text').textContent =
    `${data.idx + 1} / ${data.total}  (${pct}%)`;
  document.getElementById('bank-badge').textContent = data.bank_name;
  document.getElementById('pdf-source-name').textContent = data.source;

  // PDF viewer
  const frame  = document.getElementById('pdf-frame');
  const noPdf  = document.getElementById('no-pdf');
  const hdrBox = document.getElementById('header-text-box');
  const noPdfMsg = document.getElementById('no-pdf-msg');

  if (data.pdf_url) {
    frame.src = data.pdf_url;
    frame.style.display = 'block';
    noPdf.style.display  = 'none';
    hdrBox.style.display = 'none';
    noPdfMsg.style.display = 'none';
  } else {
    frame.style.display  = 'none';
    frame.src = '';
    noPdf.style.display  = 'flex';
    noPdfMsg.style.display = 'none';
    hdrBox.style.display = 'block';
    hdrBox.textContent   = data.header_text || '(no header text)';
  }

  // JSON display
  document.getElementById('json-display').innerHTML = syntaxHighlight(data.meta);

  // Unknowns
  const unk = data.unknowns || [];
  const badge = document.getElementById('unknown-badge');
  const panel = document.getElementById('unknowns-panel');
  const list  = document.getElementById('unknowns-list');

  if (unk.length > 0) {
    badge.style.display = 'inline-block';
    badge.textContent   = `⚠ ${unk.length} UNKNOWN`;
    panel.style.display = 'block';
    list.innerHTML = unk.map(u => `<span>${u}</span>`).join('');
  } else {
    badge.style.display = 'none';
    panel.style.display = 'none';
    list.innerHTML = '';
  }

  // Clear note
  document.getElementById('note-input').value = '';
}

/* ── SYNTAX HIGHLIGHT ── */
function syntaxHighlight(obj) {
  const str = JSON.stringify(obj, null, 2);
  return str.replace(/(".*?")\s*:/g, (_, key) => {
    return `<span class="jk">${key}</span>:`;
  }).replace(/:\s*("(?!UNKNOWN)[^"]*")/g, (_, val) => {
    return `: <span class="jv">${val}</span>`;
  }).replace(/:\s*("UNKNOWN")/g, (_, val) => {
    return `: <span class="junk">${val}</span>`;
  }).replace(/:\s*(-?\d+\.?\d*)/g, (_, num) => {
    return `: <span class="jn">${num}</span>`;
  });
}

/* ── ACTIONS ── */
async function doAction(action) {
  spin(true);
  try {
    const res  = await fetch('/api/action', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({action})
    });
    const data = await res.json();
    spin(false);
    toast(data.msg, data.ok ? 'ok' : 'err');
    if (data.ok && data.next) {
      setTimeout(loadCurrent, 600);
    } else if (data.ok && !data.next) {
      // Retry - reload without advancing
      setTimeout(loadCurrent, 600);
    }
    if (data.ok) refreshLog();
  } catch(e) {
    spin(false);
    toast('Error: ' + e.message, 'err');
  }
}

async function doCorrect() {
  const note = document.getElementById('note-input').value.trim();
  if (!note) { toast('Please type a correction note first.', 'err'); return; }
  spin(true);
  try {
    const res  = await fetch('/api/action', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({action: 'correct', note})
    });
    const data = await res.json();
    spin(false);
    toast(data.msg, data.ok ? 'info' : 'err');
    if (data.ok) refreshLog();
  } catch(e) {
    spin(false);
    toast('Error: ' + e.message, 'err');
  }
}

/* ── JUMP ── */
function jumpTo() {
  const n = parseInt(document.getElementById('jump-input').value);
  if (isNaN(n)) return;
  fetch('/api/action', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({action: 'goto', idx: n - 1})
  }).then(r => r.json()).then(data => {
    toast(data.msg, data.ok ? 'ok' : 'err');
    if (data.ok) setTimeout(loadCurrent, 400);
  });
}

/* ── LOG PANEL ── */
function toggleLog() {
  const panel = document.getElementById('log-panel');
  panel.classList.toggle('open');
  if (panel.classList.contains('open')) refreshLog();
}

async function refreshLog() {
  const res  = await fetch('/api/log');
  const log  = await res.json();
  const banks = currentData ? Array.from({length: currentData.total}, (_, i) => i) : [];

  const approved    = Object.keys(log.approved || {});
  const skipped     = Object.keys(log.skipped  || {});
  const corrections = log.corrections || {};

  let html = '';

  html += `<div class="log-section">
    <h4>✔ Approved (${approved.length})</h4>`;
  approved.forEach(src => {
    const b = log.approved[src];
    html += `<div class="log-item" onclick="jumpToSource('${src}')">
      <div class="dot dot-green"></div>
      <div><div style="font-weight:600">${src}</div>
      <div style="color:var(--muted);font-size:11px">${(b.bank_name||'')} · ${(b.timestamp||'').slice(0,10)}</div></div>
    </div>`;
  });

  html += `</div><div class="log-section">
    <h4>⏭ Skipped (${skipped.length})</h4>`;
  skipped.forEach(src => {
    html += `<div class="log-item" onclick="jumpToSource('${src}')">
      <div class="dot dot-yellow"></div><div>${src}</div>
    </div>`;
  });

  html += `</div><div class="log-section">
    <h4>✎ Corrections (${Object.keys(corrections).length})</h4>`;
  Object.entries(corrections).forEach(([src, data]) => {
    html += `<div class="log-item" onclick="jumpToSource('${src}')">
      <div class="dot dot-red"></div>
      <div><div style="font-weight:600">${src}</div>
      <div style="color:var(--yellow);font-size:11px">${data.note||''}</div></div>
    </div>`;
  });

  html += `</div>
  <button onclick="resetLog()" style="background:var(--red);color:#fff;width:100%;margin-top:12px;padding:8px">
    🗑 Reset All
  </button>`;

  document.getElementById('log-panel-inner').innerHTML = html;
}

async function jumpToSource(source) {
  // Find index by source name
  const res  = await fetch('/api/current');
  const data = await res.json();
  // Try goto by iterating — server knows the index
  // We pass source as a hint; the server maps by goto idx
  // For simplicity, jump to next pending instead
  toast('Click on the bank in the list to jump to it — use the # field above.', 'info');
}

async function resetLog() {
  if (!confirm('Reset all tuning progress?')) return;
  await fetch('/api/log/reset', {method: 'POST'});
  toast('Log reset. Reloading...', 'info');
  setTimeout(loadCurrent, 500);
  refreshLog();
}

/* ── DONE ── */
function showDone() {
  document.getElementById('done-screen').classList.add('show');
}
async function resetAndRestart() {
  await fetch('/api/log/reset', {method: 'POST'});
  document.getElementById('done-screen').classList.remove('show');
  loadCurrent();
}

/* ── SPINNER ── */
function spin(on) {
  document.getElementById('spinner').classList.toggle('show', on);
}

/* ── TOAST ── */
let _toastTimer;
function toast(msg, type='ok') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'show ' + type;
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.className = '', 3500);
}
</script>
</body>
</html>"""


@app.route("/")
def index():
    return render_template_string(HTML)


# ---------------------------------------------------------------------------
# STARTUP
# ---------------------------------------------------------------------------

def init_state():
    state["extractor"] = load_extractor()
    # Try MD mode first
    if os.path.exists(DEFAULT_MD):
        state["banks"] = parse_md_banks(DEFAULT_MD)
        print("  [MD mode]  {} bank sections loaded from {}".format(len(state["banks"]), DEFAULT_MD))
    elif os.path.exists(PDF_DIR):
        state["banks"] = parse_pdf_banks(PDF_DIR)
        print("  [PDF mode] {} PDFs loaded from {}".format(len(state["banks"]), PDF_DIR))
    else:
        print("  WARNING: No combined_output.md or PDF folder found.")

    # Resume from last position in log
    log  = load_log()
    done = set(log["approved"].keys()) | set(log["skipped"].keys())
    for i, b in enumerate(state["banks"]):
        if b["source"] not in done:
            state["idx"] = i
            break
    else:
        state["idx"] = len(state["banks"])

    print("  [Resume]   Starting at bank #{} ({})".format(
        state["idx"] + 1,
        state["banks"][state["idx"]]["source"] if state["idx"] < len(state["banks"]) else "DONE"
    ))


if __name__ == "__main__":
    print()
    print("  ╔══════════════════════════════════════════╗")
    print("  ║   Bank Metadata Tuner  —  Web UI         ║")
    print("  ╚══════════════════════════════════════════╝")
    print()

    # Check Flask
    try:
        import flask
    except ImportError:
        print("  Flask not installed. Run:  pip install flask")
        exit(1)

    init_state()

    print()
    print("  Open in browser:  http://localhost:{}".format(PORT))
    print("  Keyboard shortcuts in browser:  A=Approve  S=Skip  R=Retry  Q=Quit")
    print()

    import webbrowser
    webbrowser.open("http://localhost:{}".format(PORT))

    app.run(host="127.0.0.1", port=PORT, debug=False)
