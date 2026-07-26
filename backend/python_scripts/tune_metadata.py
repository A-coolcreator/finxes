"""
tune_metadata.py  --  Human-in-the-loop extraction tuning loop
================================================================
Loops through every bank section in combined_output.md (or every PDF
in a folder), runs the existing regex engine from extract_metadata.py,
then shows a side-by-side view of the raw header text vs the extracted JSON.

Workflow per bank
  1. Crop header text (everything above the first table row)
  2. Run extract_metadata engine -> candidate JSON
  3. Print: RAW HEADER  |  EXTRACTED JSON
  4. QA summary: list every field still "UNKNOWN"
  5. Prompt:
        [A]pprove  -> save JSON to metadata/, move to next bank
        [S]kip     -> mark as skipped in tuning_log.json
        [R]etry    -> hot-reload extract_metadata.py (pick up your fixes) and re-run
        [Q]uit     -> save progress and exit
        <note>     -> log the correction note, stay on this bank
                      fix the engine, then press [R] to retry

Resume
  python tune_metadata.py --resume
  Skips already-approved/skipped banks.

Other commands
  python tune_metadata.py --log     # show log status
  python tune_metadata.py --reset   # clear the log
  python tune_metadata.py --pdf pdfs/BANK/   # PDF folder mode
"""

import os
import sys
import re
import json
import textwrap
import argparse
from datetime import datetime

# ---------------------------------------------------------------------------
# CONFIG  (edit these paths if needed)
# ---------------------------------------------------------------------------
_HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_MD      = os.path.join(_HERE, "pdfs", "BANK", "combined_output.md")
DEFAULT_PDF_DIR = os.path.join(_HERE, "pdfs", "BANK")
OUTPUT_DIR      = os.path.join(_HERE, "metadata")
LOG_FILE        = os.path.join(_HERE, "tuning_log.json")

# Patterns that mark the first line of the transaction table
TABLE_START_SIGNALS = [
    r"^\s*(sr\.?\s*no|serial\s*no|s\.no|sno)\b",
    r"^\s*(date\s+(narration|particulars|description|transaction|instrument|ref))\b",
    r"^\s*(tran\s*date|value\s*date|post\s*date)\b",
    r"^\s*(transaction\s+date\s+from|transaction\s+cheque)\b",
    r"^\s*(opening\s+balance|brought\s+forward)\b",
    r"^\s*#\s+date\s+description\b",
    r"^\s*snо\s+tran\b",
    r"^\s*(debit|credit|withdrawal|deposit|amount|balance)\s*\(",
    r"amount in\(inr\)",
]

# ---------------------------------------------------------------------------
# COLOUR helpers  (graceful fallback if colorama not installed)
# ---------------------------------------------------------------------------
try:
    import colorama
    colorama.init(autoreset=True)
    G = colorama.Fore.GREEN  + colorama.Style.BRIGHT
    Y = colorama.Fore.YELLOW + colorama.Style.BRIGHT
    C = colorama.Fore.CYAN   + colorama.Style.BRIGHT
    R = colorama.Fore.RED    + colorama.Style.BRIGHT
    M = colorama.Fore.MAGENTA+ colorama.Style.BRIGHT
    W = colorama.Fore.WHITE  + colorama.Style.BRIGHT
    RESET = colorama.Style.RESET_ALL
    HAS_COLOR = True
except ImportError:
    G = Y = C = R = M = W = RESET = ""
    HAS_COLOR = False


def col(color, text):
    return (color + text + RESET) if HAS_COLOR else text


# ---------------------------------------------------------------------------
# TUNING LOG
# ---------------------------------------------------------------------------

def load_log():
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"approved": {}, "skipped": {}, "corrections": {}}


def save_log(log):
    with open(LOG_FILE, "w", encoding="utf-8") as f:
        json.dump(log, f, indent=2, ensure_ascii=False)


# ---------------------------------------------------------------------------
# HEADER CROPPING
# ---------------------------------------------------------------------------

def crop_header(raw_text):
    """Return only lines above the first transaction table row (max 60 lines)."""
    lines = raw_text.split("\n")
    header = []
    for line in lines:
        ll = line.lower().strip()
        if any(re.search(p, ll) for p in TABLE_START_SIGNALS):
            break
        header.append(line)
        if len(header) > 60:
            break
    while header and not header[0].strip():
        header.pop(0)
    while header and not header[-1].strip():
        header.pop()
    return "\n".join(header)


# ---------------------------------------------------------------------------
# DISPLAY
# ---------------------------------------------------------------------------

WIDTH = 130


def divider(ch="─"):
    return ch * WIDTH


def wrap_text(text, width):
    """Wrap multi-line text block to `width`, return list of strings."""
    out = []
    for line in text.split("\n"):
        if not line.strip():
            out.append("")
            continue
        wrapped = textwrap.wrap(line, width) or [line]
        out.extend(wrapped)
    return out


def show_side_by_side(header_text, meta, bank_name, source):
    col_w = (WIDTH - 3) // 2
    print()
    title = "  {}  [{}]  ".format(source, bank_name)
    pad = (WIDTH - len(title)) // 2
    print(col(C, "=" * pad + title + "=" * (WIDTH - pad - len(title))))
    lh = "  RAW HEADER TEXT  ".center(col_w)
    rh = "  EXTRACTED METADATA  ".center(col_w)
    print(col(Y, lh) + " | " + col(G, rh))
    print(divider("-"))

    left  = wrap_text(header_text, col_w - 1)
    right = wrap_text(json.dumps(meta, indent=2, ensure_ascii=False), col_w - 1)
    rows  = max(len(left), len(right))
    for i in range(rows):
        lv = (left[i]  if i < len(left)  else "")[:col_w - 1].ljust(col_w - 1)
        rv = (right[i] if i < len(right) else "")[:col_w - 1]
        print(lv + " | " + rv)
    print(divider("-"))


def show_compact(header_text, meta, bank_name, source):
    print()
    print(col(C, "=" * 60))
    print(col(C, "  {}  [{}]".format(source, bank_name)))
    print(col(C, "=" * 60))
    print(col(Y, "\n-- RAW HEADER TEXT --"))
    print(header_text)
    print(col(G, "\n-- EXTRACTED METADATA --"))
    print(json.dumps(meta, indent=2, ensure_ascii=False))
    print(col(C, "=" * 60))


def render(header_text, meta, bank_name, source):
    try:
        import shutil
        cols = shutil.get_terminal_size(fallback=(120, 40)).columns
        if cols >= 100:
            show_side_by_side(header_text, meta, bank_name, source)
            return
    except Exception:
        pass
    show_compact(header_text, meta, bank_name, source)


# ---------------------------------------------------------------------------
# QA SUMMARY
# ---------------------------------------------------------------------------

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


def show_qa(meta):
    unknowns = list_unknowns(meta)
    if unknowns:
        print(col(Y, "\n  WARNING: {} field(s) still UNKNOWN:".format(len(unknowns))))
        for u in unknowns:
            print("       * {}".format(u))
    else:
        print(col(G, "\n  OK: All fields extracted!"))


# ---------------------------------------------------------------------------
# PROMPT
# ---------------------------------------------------------------------------

PROMPT = """
  +------------------------------------------------------------------------+
  |  [A] Approve  - save JSON and move to next bank                       |
  |  [S] Skip     - mark as skipped in log                                |
  |  [R] Retry    - hot-reload extract_metadata.py and re-run             |
  |  [Q] Quit     - save progress and exit                                |
  |  Or type a correction note and press Enter                            |
  +------------------------------------------------------------------------+
"""


def ask(source):
    print(col(M, PROMPT))
    try:
        return input(col(W, "  [{}] > ".format(source))).strip()
    except (EOFError, KeyboardInterrupt):
        return "q"


# ---------------------------------------------------------------------------
# EXTRACTOR BRIDGE
# ---------------------------------------------------------------------------

def load_extractor():
    """Dynamically import extract_metadata.py (re-importable for hot-reload)."""
    import importlib.util
    path = os.path.join(_HERE, "extract_metadata.py")
    spec = importlib.util.spec_from_file_location("extract_metadata", path)
    mod  = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def extract_text(text, label, extractor):
    return extractor._run_extraction(text, text, label)


def extract_pdf(pdf_path, extractor):
    try:
        import pdfplumber
    except ImportError:
        raise ImportError("pdfplumber required: pip install pdfplumber")
    full = ""
    first = ""
    with pdfplumber.open(pdf_path) as pdf:
        if pdf.pages:
            first = pdf.pages[0].extract_text() or ""
        for page in pdf.pages:
            t = page.extract_text()
            if t:
                full += t + "\n"
    meta = extractor._run_extraction(first, full, os.path.basename(pdf_path))
    return first, meta


# ---------------------------------------------------------------------------
# SAVE
# ---------------------------------------------------------------------------

def save_json(meta, source):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    base     = os.path.splitext(source)[0]
    out_path = os.path.join(OUTPUT_DIR, "{}_profile.json".format(base))
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)
    print(col(G, "\n  SAVED -> {}".format(out_path)))
    return out_path


# ---------------------------------------------------------------------------
# INNER LOOP  (shared between MD and PDF modes)
# ---------------------------------------------------------------------------

def process_one(source, header_fn, extractor_holder, log):
    """
    Runs the approve/skip/retry/quit loop for a single bank entry.
    header_fn()  -> (header_text, meta, bank_name)  -- called each time we render
    extractor_holder is a list[extractor_module] so we can mutate it on retry.

    Returns: "approved" | "skipped" | "quit"
    """
    while True:
        try:
            header_text, meta, bank_name = header_fn(extractor_holder[0])
        except Exception as e:
            print(col(R, "  Extraction error: {}".format(e)))
            header_text, meta, bank_name = "", {}, "ERROR"

        render(header_text, meta, bank_name, source)
        show_qa(meta)

        response = ask(source)

        if response.lower() in ("a", "approve", ""):
            save_json(meta, source)
            log["approved"][source] = {
                "timestamp": datetime.now().isoformat(),
                "bank_name": bank_name,
            }
            log["corrections"].pop(source, None)
            save_log(log)
            return "approved"

        elif response.lower() in ("s", "skip"):
            print(col(Y, "  Skipped: {}".format(source)))
            log["skipped"][source] = {"timestamp": datetime.now().isoformat()}
            save_log(log)
            return "skipped"

        elif response.lower() in ("r", "retry"):
            print(col(Y, "  Reloading extractor..."))
            try:
                extractor_holder[0] = load_extractor()
                print(col(G, "  Extractor reloaded OK."))
            except Exception as e:
                print(col(R, "  Could not reload: {}".format(e)))
            continue

        elif response.lower() in ("q", "quit"):
            return "quit"

        else:
            # Correction note
            log["corrections"][source] = {
                "timestamp": datetime.now().isoformat(),
                "bank_name": bank_name,
                "note": response,
                "raw_header": header_text[:500],
            }
            log["skipped"].pop(source, None)
            save_log(log)
            print(col(Y, "\n  Correction logged: \"{}\"".format(response)))
            print("  1. Open extract_metadata.py and fix the {} engine.".format(bank_name))
            print("  2. Press [R] to reload and retry, or [S] to skip for now.\n")
            # Stay in loop


# ---------------------------------------------------------------------------
# MD MODE
# ---------------------------------------------------------------------------

def tune_md(md_path, resume=False):
    extractor_holder = [load_extractor()]
    log = load_log()

    with open(md_path, "r", encoding="utf-8") as f:
        content = f.read()

    sections = re.split(r"^##\s+File:\s+(.+?)$", content, flags=re.MULTILINE)
    banks = []
    for i in range(1, len(sections), 2):
        filename = sections[i].strip()
        block    = sections[i + 1] if i + 1 < len(sections) else ""
        block    = re.sub(r"\n-{4,}\n", "", block).strip()
        banks.append((filename, block))

    total = len(banks)
    print(col(C, "\n" + "=" * 60))
    print(col(C, "  BANK METADATA TUNING LOOP  --  {} banks found".format(total)))
    print(col(C, "  Source: {}".format(md_path)))
    print(col(C, "=" * 60 + "\n"))

    for idx, (source, raw_text) in enumerate(banks):
        if resume and (source in log["approved"] or source in log["skipped"]):
            print(col(G, "  [{}/{}] {} -- already handled, skipping.".format(idx + 1, total, source)))
            continue

        print(col(W, "\n  [{}/{}] {}".format(idx + 1, total, source)))

        def header_fn(extractor, _raw=raw_text, _src=source):
            meta      = extract_text(_raw, _src, extractor)
            header    = crop_header(_raw)
            bank_name = meta.get("institution", {}).get("bank_name", "UNKNOWN")
            return header, meta, bank_name

        result = process_one(source, header_fn, extractor_holder, log)
        if result == "quit":
            break

    print_summary(log, total)


# ---------------------------------------------------------------------------
# PDF MODE
# ---------------------------------------------------------------------------

def tune_pdfs(pdf_dir, resume=False):
    extractor_holder = [load_extractor()]
    log = load_log()

    pdf_files = sorted(f for f in os.listdir(pdf_dir) if f.lower().endswith(".pdf"))
    total = len(pdf_files)
    print(col(C, "\n" + "=" * 60))
    print(col(C, "  BANK METADATA TUNING LOOP  --  {} PDFs".format(total)))
    print(col(C, "  Folder: {}".format(pdf_dir)))
    print(col(C, "=" * 60 + "\n"))

    for idx, pdf_file in enumerate(pdf_files):
        if resume and (pdf_file in log["approved"] or pdf_file in log["skipped"]):
            print(col(G, "  [{}/{}] {} -- already handled.".format(idx + 1, total, pdf_file)))
            continue

        print(col(W, "\n  [{}/{}] {}".format(idx + 1, total, pdf_file)))
        pdf_path = os.path.join(pdf_dir, pdf_file)

        def header_fn(extractor, _path=pdf_path, _file=pdf_file):
            first_page, meta = extract_pdf(_path, extractor)
            header    = crop_header(first_page)
            bank_name = meta.get("institution", {}).get("bank_name", "UNKNOWN")
            return header, meta, bank_name

        result = process_one(pdf_file, header_fn, extractor_holder, log)
        if result == "quit":
            break

    print_summary(log, total)


# ---------------------------------------------------------------------------
# SUMMARY
# ---------------------------------------------------------------------------

def print_summary(log, total):
    approved    = len(log.get("approved", {}))
    skipped     = len(log.get("skipped", {}))
    corrections = len(log.get("corrections", {}))
    remaining   = max(0, total - approved - skipped)

    print()
    print(col(C, "=" * WIDTH))
    print(col(C, "  SESSION SUMMARY"))
    print(col(C, "-" * WIDTH))
    print(col(G,  "  Approved   : {}".format(approved)))
    print(col(Y,  "  Skipped    : {}".format(skipped)))
    print(col(R,  "  Corrections: {}".format(corrections)))
    print(col(W,  "  Remaining  : {}".format(remaining)))
    print(col(C, "-" * WIDTH))

    if log.get("corrections"):
        print(col(Y, "\n  Banks needing fixes:"))
        for src, data in log["corrections"].items():
            print("    * {}  -->  {}".format(src, data.get("note", "")))
        print()
        print("  Fix extract_metadata.py, then run:  python tune_metadata.py --resume")

    print(col(C, "=" * WIDTH + "\n"))


def show_log_status():
    log = load_log()
    print(col(C, "\n  TUNING LOG"))
    print(col(C, "-" * 60))
    print(col(G, "  Approved ({}) :".format(len(log["approved"]))))
    for k, v in log["approved"].items():
        print("    + {}  [{}]  {}".format(k, v.get("bank_name", ""), v.get("timestamp", "")[:10]))
    print(col(Y, "\n  Skipped ({}) :".format(len(log["skipped"]))))
    for k, v in log["skipped"].items():
        print("    ~ {}  {}".format(k, v.get("timestamp", "")[:10]))
    print(col(R, "\n  Corrections ({}) :".format(len(log["corrections"]))))
    for k, v in log["corrections"].items():
        print("    ! {}  -->  {}".format(k, v.get("note", "")[:80]))
    print(col(C, "-" * 60 + "\n"))


# ---------------------------------------------------------------------------
# ENTRY POINT
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Interactive human-in-the-loop bank metadata tuning loop",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=textwrap.dedent("""
        Examples:
          python tune_metadata.py                       # MD mode, default path
          python tune_metadata.py --resume              # skip already-done banks
          python tune_metadata.py --log                 # show log status
          python tune_metadata.py --reset               # clear the log
          python tune_metadata.py --pdf pdfs/BANK/      # PDF folder mode
          python tune_metadata.py --md path/file.md     # custom MD path
        """)
    )
    parser.add_argument("--md",     metavar="PATH", help="Path to combined_output.md")
    parser.add_argument("--pdf",    metavar="DIR",  help="Path to folder of bank PDFs")
    parser.add_argument("--resume", action="store_true", help="Skip already-approved/skipped")
    parser.add_argument("--log",    action="store_true", help="Show log status and exit")
    parser.add_argument("--reset",  action="store_true", help="Clear tuning log and start fresh")
    args = parser.parse_args()

    if args.reset:
        if os.path.exists(LOG_FILE):
            os.remove(LOG_FILE)
            print(col(G, "  Tuning log cleared."))
        else:
            print("  No log file found.")
        return

    if args.log:
        show_log_status()
        return

    if args.pdf:
        tune_pdfs(args.pdf, resume=args.resume)
    else:
        md_path = args.md or DEFAULT_MD
        if not os.path.exists(md_path):
            print(col(R, "  File not found: {}".format(md_path)))
            print("  Pass --md <path> to specify the combined_output.md location.")
            sys.exit(1)
        tune_md(md_path, resume=args.resume)


if __name__ == "__main__":
    main()
