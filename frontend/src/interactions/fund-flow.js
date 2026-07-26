import { caseService } from "../services/caseService.js";

const RULE_FILES = [
  { file: "E1_Exact_Match.csv", label: "Exact Match" },
  { file: "E2_Time_based_Matching.csv", label: "Time-based Matching" },
  { file: "E3_Velocity_Rules.csv", label: "Velocity Rules" },
  { file: "E4_Fund_Holding.csv", label: "Fund Holding" },
  { file: "E5_Pass_through_Accounts.csv", label: "Pass-through Accounts" },
  { file: "E6_Collection_Accounts.csv", label: "Collection Accounts" },
  { file: "E7_Distribution_Accounts.csv", label: "Distribution Accounts" },
  { file: "E8_Layering_Rules.csv", label: "Layering Rules" },
  { file: "E9_Structuring_Rules.csv", label: "Structuring Rules" },
  { file: "E10_Circular_Round_Trip.csv", label: "Circular Round Trip" },
];

const CATEGORY_META = {
  exact: { title: "Exact transfer patterns", ruleFile: "E1_Exact_Match.csv", ruleIdPrefix: "FF-001", grade: "A" },
  time: { title: "Time-based matching", ruleFile: "E2_Time_based_Matching.csv", ruleIdPrefix: "FF-011", grade: "B" },
  velocity: { title: "Velocity anomalies", ruleFile: "E3_Velocity_Rules.csv", ruleIdPrefix: "FF-021", grade: "C" },
  holding: { title: "Holding / pass-through timing", ruleFile: "E4_Fund_Holding.csv", ruleIdPrefix: "FF-031", grade: "B" },
  passthrough: { title: "Pass-through behavior", ruleFile: "E5_Pass_through_Accounts.csv", ruleIdPrefix: "FF-041", grade: "B" },
  collection: { title: "Collection account behavior", ruleFile: "E6_Collection_Accounts.csv", ruleIdPrefix: "FF-051", grade: "C" },
  distribution: { title: "Distribution account behavior", ruleFile: "E7_Distribution_Accounts.csv", ruleIdPrefix: "FF-061", grade: "C" },
  layering: { title: "Layering trails", ruleFile: "E8_Layering_Rules.csv", ruleIdPrefix: "FF-071", grade: "B" },
  structuring: { title: "Structuring / splitting", ruleFile: "E9_Structuring_Rules.csv", ruleIdPrefix: "FF-081", grade: "C" },
  circular: { title: "Circular round-trips", ruleFile: "E10_Circular_Round_Trip.csv", ruleIdPrefix: "FF-091", grade: "A" },
};

const SEVERITY_ORDER = { A: 4, B: 3, C: 2, D: 1 };
const SEVERITY_COLOR = {
  A: "#DC2626",
  B: "#F59E0B",
  C: "#2563EB",
  D: "#64748B",
};

const FOLDER_PREFIX = "mule and fund flow rules/csvs/";

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const normalize = (value) => String(value ?? "").trim().replace(/\s+/g, " ").toUpperCase();

const humanize = (value) =>
  String(value ?? "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value || 0));

const formatDateTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
};

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
};

const parseCSVLine = (line) => {
  const out = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      out.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  out.push(current.trim());
  return out.map((value) => value.replace(/^"|"$/g, "").trim());
};

const parseCSV = (text) => {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) return [];
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });
    return row;
  });
};

const getQueryCaseId = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("caseId") || params.get("id");
};

const parseFlexibleDate = (value) => {
  if (!value) return null;
  const cleaned = String(value).trim();
  if (!cleaned) return null;

  const direct = new Date(cleaned);
  if (!Number.isNaN(direct.getTime())) return direct;

  const parts = cleaned.split(/[\s\-\/]/).filter(Boolean);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      const year = Number(parts[0]);
      const month = Number(parts[1]) - 1;
      const day = Number(parts[2]);
      const d = new Date(year, month, day);
      if (!Number.isNaN(d.getTime())) return d;
    }
    if (parts[2].length === 4) {
      const day = Number(parts[0]);
      const month = Number(parts[1]) - 1;
      const year = Number(parts[2]);
      const d = new Date(year, month, day);
      if (!Number.isNaN(d.getTime())) return d;
    }
  }

  return null;
};

const getRawJson = (tx) => {
  if (!tx?.rawTransactionJson) return null;
  try {
    return typeof tx.rawTransactionJson === "string" ? JSON.parse(tx.rawTransactionJson) : tx.rawTransactionJson;
  } catch {
    return null;
  }
};

const collectStringValues = (value, out = []) => {
  if (!value) return out;
  if (typeof value === "string" || typeof value === "number") {
    out.push(String(value));
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectStringValues(item, out));
    return out;
  }
  if (typeof value === "object") {
    Object.values(value).forEach((item) => collectStringValues(item, out));
  }
  return out;
};

const extractReference = (tx) => {
  const blobs = [tx.description, tx.chqNo, tx.category, tx.flow, ...collectStringValues(getRawJson(tx))]
    .filter(Boolean)
    .map((value) => String(value).toUpperCase());

  const patterns = [
    /\b(UTR|RRN|IMPS|UPI|REF|CHEQUE|CHQ|TXN|TRANSACTION)\b[^A-Z0-9]*([A-Z0-9\-\/]{4,})/,
    /\b([A-Z0-9]{8,})\b/,
  ];

  for (const blob of blobs) {
    for (const pattern of patterns) {
      const match = blob.match(pattern);
      if (match) return `${match[1] || "REF"}-${match[2] || match[1]}`;
    }
  }
  return null;
};

const pickCounterpartyFromText = (text, internalNames) => {
  if (!text) return null;
  const patterns = [
    /\b(?:TO|FROM|VIA|PAID TO|RECEIVED FROM|SENT TO|PAID|TRANSFER TO|TRANSFER FROM)\s+([A-Z][A-Z0-9 &.,\-\/()]{2,})/i,
    /\b(?:BENEFICIARY|PAYEE|PAYER|MERCHANT|VENDOR|SELLER|REMITTER)\s*[:\-]\s*([A-Z][A-Z0-9 &.,\-\/()]{2,})/i,
    /\bUPI\s+(?:TO|FROM)\s+([A-Z][A-Z0-9 &.,\-\/()]{2,})/i,
    /@([A-Z0-9._\-]+)/i,
  ];

  for (const pattern of patterns) {
    const match = String(text).match(pattern);
    if (match?.[1]) {
      const candidate = normalize(match[1]);
      if (candidate && candidate.length > 1 && !internalNames.has(candidate)) {
        return candidate;
      }
    }
  }

  const upperText = normalize(text);
  for (const name of internalNames) {
    if (upperText.includes(name)) {
      return name;
    }
  }

  return null;
};

const getCounterparty = (tx, internalNames) => {
  const raw = getRawJson(tx);
  const candidates = [
    raw?.counterparty,
    raw?.counterpartyName,
    raw?.beneficiary,
    raw?.beneficiaryName,
    raw?.payer,
    raw?.payee,
    raw?.receiver,
    raw?.recipient,
    raw?.sender,
    raw?.remitter,
    raw?.from,
    raw?.to,
    raw?.accountName,
    raw?.name,
    raw?.party,
    tx.counterparty,
    tx.counterpartyName,
    tx.beneficiary,
    tx.beneficiaryName,
  ]
    .filter(Boolean)
    .map((value) => normalize(value));

  for (const candidate of candidates) {
    if (!internalNames.has(candidate)) return candidate;
  }

  const fromDesc = pickCounterpartyFromText(`${tx.description || ""} ${JSON.stringify(raw || {})}`, internalNames);
  if (fromDesc) return fromDesc;

  return tx.type === "credit" ? "EXTERNAL SOURCE" : "EXTERNAL BENEFICIARY";
};

const buildCounterpartyLabel = (name) => {
  const cleaned = normalize(name || "UNKNOWN");
  if (!cleaned) return "UNKNOWN";
  return cleaned.length > 26 ? `${cleaned.slice(0, 23)}…` : cleaned;
};

const buildShell = () => `
  <div class="h-full flex flex-col overflow-hidden">
    <div class="px-gutter py-5 border-b border-border-subtle bg-surface/90 backdrop-blur-sm">
      <div class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div class="flex flex-wrap items-center gap-3 mb-3">
            <span class="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-label-sm font-bold uppercase tracking-widest">Fund Flow</span>
            <span id="fund-flow-case-label" class="text-label-sm text-secondary uppercase tracking-widest">Loading case…</span>
          </div>
          <h1 id="fund-flow-case-title" class="text-headline-lg font-headline-lg text-on-surface">Pattern-linked transaction network</h1>
          <p class="text-body-sm text-text-body mt-1 max-w-3xl">
            This view only renders nodes and edges that are part of detected patterns. Non-pattern transfers are hidden.
          </p>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 min-w-full xl:min-w-[42rem]">
          <div class="card-elevated rounded-xl p-4">
            <div class="text-label-sm uppercase tracking-widest text-secondary">Transactions</div>
            <div id="fund-flow-total-tx" class="text-headline-md font-bold text-on-surface mt-1">0</div>
          </div>
          <div class="card-elevated rounded-xl p-4">
            <div class="text-label-sm uppercase tracking-widest text-secondary">Entities</div>
            <div id="fund-flow-entity-count" class="text-headline-md font-bold text-on-surface mt-1">0</div>
          </div>
          <div class="card-elevated rounded-xl p-4">
            <div class="text-label-sm uppercase tracking-widest text-secondary">Patterns</div>
            <div id="fund-flow-pattern-count" class="text-headline-md font-bold text-primary mt-1">0</div>
          </div>
          <div class="card-elevated rounded-xl p-4">
            <div class="text-label-sm uppercase tracking-widest text-secondary">View mode</div>
            <div id="fund-flow-time-span" class="text-headline-md font-bold text-on-surface mt-1">Pattern-only</div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_22rem] gap-4 p-gutter overflow-hidden">
      <section class="card-elevated card-elevated--static min-h-0 flex flex-col rounded-2xl overflow-hidden">
        <div class="px-5 py-3 border-b border-border-subtle bg-surface-muted flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 class="text-headline-md font-bold text-on-surface">Pattern subgraph</h2>
            <p class="text-body-sm text-secondary">Only detected pattern trails are displayed.</p>
          </div>
          <div class="flex flex-wrap items-center gap-2 text-label-sm text-secondary">
            <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low border border-border-subtle"><span class="w-2.5 h-2.5 rounded-full bg-primary"></span> Internal account</span>
            <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low border border-border-subtle"><span class="w-2.5 h-2.5 rounded-full bg-secondary"></span> External counterparty</span>
            <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low border border-border-subtle"><span class="w-2.5 h-2.5 rounded-full bg-status-critical"></span> Pattern hit</span>
          </div>
        </div>
        <div id="fund-flow-graph-scroll" class="flex-1 min-h-0 overflow-auto bg-[linear-gradient(180deg,#ffffff_0%,#fbfcfc_100%)]">
          <div id="fund-flow-graph-host" class="relative"></div>
        </div>
      </section>

      <aside class="card-elevated card-elevated--sidebar min-h-0 rounded-2xl overflow-hidden flex flex-col">
        <div class="px-5 py-4 border-b border-border-subtle bg-surface-muted">
          <h2 class="text-headline-md font-bold text-on-surface">Pattern insights</h2>
          <p id="fund-flow-analysis-status" class="text-body-sm text-secondary mt-1">Loading transaction graph and pattern rules…</p>
        </div>
        <div class="flex-1 min-h-0 overflow-auto p-5 space-y-5">
          <section class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-label-sm font-bold uppercase tracking-widest text-secondary">Detected patterns</h3>
              <span id="fund-flow-detected-badge" class="text-label-sm font-bold text-primary">0 hits</span>
            </div>
            <div id="fund-flow-findings" class="space-y-3"></div>
          </section>

          <section class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-label-sm font-bold uppercase tracking-widest text-secondary">Rule library</h3>
              <span id="fund-flow-rule-count" class="text-label-sm font-bold text-secondary">0 rules</span>
            </div>
            <div id="fund-flow-rule-list" class="space-y-2"></div>
          </section>

          <section class="space-y-3">
            <h3 class="text-label-sm font-bold uppercase tracking-widest text-secondary">Selected entity</h3>
            <div id="fund-flow-selection" class="card-elevated card-elevated--static card-elevated--tinted rounded-xl bg-surface-muted p-4 text-body-sm text-secondary">
              Click any lane label to inspect its aggregated stats.
            </div>
          </section>
        </div>
      </aside>
    </div>
  </div>
`;

const toDateKey = (date) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

const computeGraphData = (caseData, persons, transactions) => {
  const internalNames = new Set((Array.isArray(persons) ? persons : []).map((person) => normalize(person.name)).filter(Boolean));
  const ownerName = normalize(caseData?.caseNumber || caseData?.title || "CASE");

  const txs = (Array.isArray(transactions) ? transactions : [])
    .map((tx, index) => {
      const date = parseFlexibleDate(tx.date || tx.createdAt || tx.updatedAt || tx.timestamp) || parseFlexibleDate(tx.createdAt) || new Date(index);
      const amount = Math.abs(Number(tx.amount || 0));
      const counterparty = getCounterparty(tx, internalNames);
      const sender = normalize(tx.type) === "DEBIT" || normalize(tx.flow).includes("OUT") || normalize(tx.flow).includes("WITHDRAW")
        ? (normalize(tx.personName) || ownerName)
        : counterparty;
      const receiver = normalize(tx.type) === "CREDIT" || normalize(tx.flow).includes("IN") || normalize(tx.flow).includes("DEPOSIT")
        ? (normalize(tx.personName) || ownerName)
        : counterparty;

      return {
        ...tx,
        _index: index,
        _date: date,
        _amount: amount,
        _sender: sender,
        _receiver: receiver,
        _counterparty: counterparty,
        _reference: extractReference(tx),
        _dayKey: toDateKey(date),
      };
    })
    .sort((a, b) => a._date - b._date || a._index - b._index);

  const nodeMap = new Map();
  const touchNode = (name, kind) => {
    const key = normalize(name);
    if (!key) return;
    if (!nodeMap.has(key)) {
      nodeMap.set(key, {
        name: key,
        label: buildCounterpartyLabel(key),
        kind,
        txCount: 0,
        inflow: 0,
        outflow: 0,
        counterparties: new Set(),
        incomingFrom: new Set(),
        outgoingTo: new Set(),
        transactions: [],
      });
    }
    const node = nodeMap.get(key);
    if (kind === "internal") node.kind = "internal";
    return node;
  };

  txs.forEach((tx) => {
    const senderKind = internalNames.has(tx._sender) ? "internal" : "external";
    const receiverKind = internalNames.has(tx._receiver) ? "internal" : "external";
    const senderNode = touchNode(tx._sender, senderKind);
    const receiverNode = touchNode(tx._receiver, receiverKind);

    if (senderNode) {
      senderNode.txCount += 1;
      senderNode.outflow += tx._amount;
      senderNode.counterparties.add(tx._receiver);
      senderNode.outgoingTo.add(tx._receiver);
      senderNode.transactions.push({ txId: tx.id, role: "out" });
    }

    if (receiverNode) {
      receiverNode.txCount += 1;
      receiverNode.inflow += tx._amount;
      receiverNode.counterparties.add(tx._sender);
      receiverNode.incomingFrom.add(tx._sender);
      receiverNode.transactions.push({ txId: tx.id, role: "in" });
    }
  });

  const nodes = [...nodeMap.values()].sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "internal" ? -1 : 1;
    return b.txCount - a.txCount || a.name.localeCompare(b.name);
  });

  const nodeIndex = new Map(nodes.map((node, index) => [node.name, index]));
  const laneGap = 72;
  const topPadding = 100;
  const leftPadding = 190;
  const svgWidth = Math.max(1600, txs.length * 34 + leftPadding + 120);
  const svgHeight = Math.max(420, topPadding + nodes.length * laneGap + 80);

  const minDate = txs[0]?._date || new Date();
  const maxDate = txs[txs.length - 1]?._date || minDate;
  const spanMs = Math.max(1, maxDate.getTime() - minDate.getTime());
  const dateToX = (date) => leftPadding + 60 + ((date.getTime() - minDate.getTime()) / spanMs) * (svgWidth - leftPadding - 120);

  const dayBuckets = new Map();
  txs.forEach((tx) => {
    const bucket = tx._dayKey;
    dayBuckets.set(bucket, (dayBuckets.get(bucket) || 0) + 1);
  });

  const dayOffsets = new Map();
  const edges = txs.map((tx) => {
    const senderY = topPadding + (nodeIndex.get(tx._sender) || 0) * laneGap;
    const receiverY = topPadding + (nodeIndex.get(tx._receiver) || 0) * laneGap;
    const bucket = tx._dayKey;
    const dayIndex = dayOffsets.get(bucket) || 0;
    dayOffsets.set(bucket, dayIndex + 1);
    const jitter = Math.min(20, dayIndex * 5);
    const x = dateToX(tx._date) + jitter;

    return {
      id: tx.id,
      tx,
      x,
      senderY,
      receiverY,
      sender: tx._sender,
      receiver: tx._receiver,
      amount: tx._amount,
      date: tx._date,
      dayKey: bucket,
      senderIndex: nodeIndex.get(tx._sender) || 0,
      receiverIndex: nodeIndex.get(tx._receiver) || 0,
    };
  });

  return {
    caseData,
    persons,
    txs,
    nodes,
    edges,
    nodeIndex,
    internalNames,
    svgWidth,
    svgHeight,
    laneGap,
    topPadding,
    leftPadding,
    minDate,
    maxDate,
    spanDays: Math.max(1, Math.round(spanMs / (1000 * 60 * 60 * 24))),
    dayBuckets,
  };
};

const findTxnById = (edges, txId) => edges.find((edge) => edge.id === txId)?.tx;

const buildGraphHighlightMap = (findings) => {
  const map = new Map();
  findings.forEach((finding) => {
    const severity = finding.grade || "D";
    (finding.edgeIds || []).forEach((edgeId) => {
      const existing = map.get(edgeId);
      if (!existing || SEVERITY_ORDER[severity] > SEVERITY_ORDER[existing]) {
        map.set(edgeId, severity);
      }
    });
  });
  return map;
};

const detectPatterns = (graph) => {
  const findings = [];
  const { txs, nodes, internalNames } = graph;
  const edges = graph.edges;

  const byPair = new Map();
  const bySender = new Map();
  const byReceiver = new Map();
  const byNode = new Map();
  const byDayAndAmount = new Map();

  edges.forEach((edge) => {
    const tx = edge.tx;
    const pairKey = `${tx._sender}→${tx._receiver}→${Math.round(edge.amount)}`;
    if (!byPair.has(pairKey)) byPair.set(pairKey, []);
    byPair.get(pairKey).push(edge);

    if (!bySender.has(tx._sender)) bySender.set(tx._sender, []);
    bySender.get(tx._sender).push(edge);
    if (!byReceiver.has(tx._receiver)) byReceiver.set(tx._receiver, []);
    byReceiver.get(tx._receiver).push(edge);

    if (!byNode.has(tx._sender)) byNode.set(tx._sender, []);
    byNode.get(tx._sender).push(edge);
    if (!byNode.has(tx._receiver)) byNode.set(tx._receiver, []);
    byNode.get(tx._receiver).push(edge);

    const dayAmountKey = `${tx._dayKey}::${Math.round(edge.amount)}`;
    if (!byDayAndAmount.has(dayAmountKey)) byDayAndAmount.set(dayAmountKey, []);
    byDayAndAmount.get(dayAmountKey).push(edge);
  });

  const dateDiffDays = (a, b) => Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24);

  // Exact and time-based matching
  for (const [pairKey, edgesForPair] of byPair.entries()) {
    if (edgesForPair.length < 2) continue;
    const txIds = edgesForPair.slice(0, 2).map((edge) => edge.id);
    findings.push({
      id: `exact-${pairKey}`,
      category: "exact",
      ruleFile: CATEGORY_META.exact.ruleFile,
      ruleId: CATEGORY_META.exact.ruleIdPrefix,
      title: `${CATEGORY_META.exact.title}: repeated ${buildCounterpartyLabel(pairKey.split("→")[0])} → ${buildCounterpartyLabel(pairKey.split("→")[1])}`,
      grade: CATEGORY_META.exact.grade,
      summary: `${edgesForPair.length} repeated transfer(s) with the same amount were observed on the same sender/receiver pair.`,
      evidence: edgesForPair.slice(0, 3).map((edge) => `${formatDate(edge.date)} · ${formatCurrency(edge.amount)}`),
      edgeIds: txIds,
    });
  }

  const sameDayMatches = new Map();
  edges.forEach((edge) => {
    const key = `${edge.tx._sender}::${edge.tx._receiver}::${edge.tx._dayKey}`;
    if (!sameDayMatches.has(key)) sameDayMatches.set(key, []);
    sameDayMatches.get(key).push(edge);
  });

  for (const [key, matches] of sameDayMatches.entries()) {
    if (matches.length < 2) continue;
    const [sender, receiver] = key.split("::");
    findings.push({
      id: `time-${key}`,
      category: "time",
      ruleFile: CATEGORY_META.time.ruleFile,
      ruleId: CATEGORY_META.time.ruleIdPrefix,
      title: `${CATEGORY_META.time.title}: ${buildCounterpartyLabel(sender)} → ${buildCounterpartyLabel(receiver)}`,
      grade: CATEGORY_META.time.grade,
      summary: `${matches.length} transfers between the same entities were clustered on the same day.`,
      evidence: matches.slice(0, 3).map((edge) => `${formatDate(edge.date)} · ${formatCurrency(edge.amount)}`),
      edgeIds: matches.slice(0, 3).map((edge) => edge.id),
    });
    break;
  }

  // Velocity, holding, pass-through, collection/distribution
  nodes.forEach((node) => {
    const nodeEdges = byNode.get(node.name) || [];
    if (!nodeEdges.length) return;

    const incoming = nodeEdges.filter((edge) => edge.receiver === node.name);
    const outgoing = nodeEdges.filter((edge) => edge.sender === node.name);
    const incomingTotal = incoming.reduce((sum, edge) => sum + edge.amount, 0);
    const outgoingTotal = outgoing.reduce((sum, edge) => sum + edge.amount, 0);

    if (nodeEdges.length >= 6) {
      findings.push({
        id: `velocity-${node.name}`,
        category: "velocity",
        ruleFile: CATEGORY_META.velocity.ruleFile,
        ruleId: CATEGORY_META.velocity.ruleIdPrefix,
        title: `${CATEGORY_META.velocity.title}: ${buildCounterpartyLabel(node.name)}`,
        grade: CATEGORY_META.velocity.grade,
        summary: `${nodeEdges.length} transfers involve this lane, indicating sustained activity density.`,
        evidence: [`Incoming: ${incoming.length}`, `Outgoing: ${outgoing.length}`],
        edgeIds: nodeEdges.slice(0, 6).map((edge) => edge.id),
      });
    }

    if (incoming.length && outgoing.length && incomingTotal > 0) {
      const ratio = outgoingTotal / incomingTotal;
      const lastIncoming = [...incoming].sort((a, b) => b.date - a.date)[0];
      const firstOutgoing = [...outgoing].sort((a, b) => a.date - b.date)[0];
      const holdingDays = lastIncoming && firstOutgoing ? dateDiffDays(firstOutgoing.date, lastIncoming.date) : null;

      if (ratio >= 0.9) {
        findings.push({
          id: `passthrough-${node.name}`,
          category: "passthrough",
          ruleFile: CATEGORY_META.passthrough.ruleFile,
          ruleId: CATEGORY_META.passthrough.ruleIdPrefix,
          title: `${CATEGORY_META.passthrough.title}: ${buildCounterpartyLabel(node.name)}`,
          grade: ratio >= 0.98 ? "A" : "B",
          summary: `Outgoing volume is ${(ratio * 100).toFixed(1)}% of incoming volume, suggesting limited retention.`,
          evidence: [`Inflow: ${formatCurrency(incomingTotal)}`, `Outflow: ${formatCurrency(outgoingTotal)}`],
          edgeIds: [...incoming, ...outgoing].slice(0, 6).map((edge) => edge.id),
        });
      }

      if (holdingDays !== null && holdingDays <= 1 && incomingTotal > 0 && outgoingTotal > 0) {
        findings.push({
          id: `holding-${node.name}`,
          category: "holding",
          ruleFile: CATEGORY_META.holding.ruleFile,
          ruleId: CATEGORY_META.holding.ruleIdPrefix,
          title: `${CATEGORY_META.holding.title}: ${buildCounterpartyLabel(node.name)}`,
          grade: CATEGORY_META.holding.grade,
          summary: `Funds appear to circulate through this entity quickly, with the first clear outflow landing within the same day or next day.`,
          evidence: [
            `Last inflow: ${formatDateTime(lastIncoming?.date)}`,
            `First outflow: ${formatDateTime(firstOutgoing?.date)}`,
          ],
          edgeIds: [lastIncoming?.id, firstOutgoing?.id].filter(Boolean),
        });
      }
    }

    const uniqueSenders = new Set(incoming.map((edge) => edge.sender));
    const uniqueBeneficiaries = new Set(outgoing.map((edge) => edge.receiver));
    if (uniqueSenders.size >= 5) {
      findings.push({
        id: `collection-${node.name}`,
        category: "collection",
        ruleFile: CATEGORY_META.collection.ruleFile,
        ruleId: CATEGORY_META.collection.ruleIdPrefix,
        title: `${CATEGORY_META.collection.title}: ${buildCounterpartyLabel(node.name)}`,
        grade: uniqueSenders.size >= 10 ? "B" : CATEGORY_META.collection.grade,
        summary: `${uniqueSenders.size} distinct inbound counterparties were observed.`,
        evidence: [`Inbound counterparties: ${uniqueSenders.size}`],
        edgeIds: incoming.slice(0, 6).map((edge) => edge.id),
      });
    }
    if (uniqueBeneficiaries.size >= 5) {
      findings.push({
        id: `distribution-${node.name}`,
        category: "distribution",
        ruleFile: CATEGORY_META.distribution.ruleFile,
        ruleId: CATEGORY_META.distribution.ruleIdPrefix,
        title: `${CATEGORY_META.distribution.title}: ${buildCounterpartyLabel(node.name)}`,
        grade: uniqueBeneficiaries.size >= 10 ? "B" : CATEGORY_META.distribution.grade,
        summary: `${uniqueBeneficiaries.size} distinct outbound beneficiaries were observed.`,
        evidence: [`Outbound beneficiaries: ${uniqueBeneficiaries.size}`],
        edgeIds: outgoing.slice(0, 6).map((edge) => edge.id),
      });
    }
  });

  // Layering and circular trails
  for (let i = 0; i < edges.length; i += 1) {
    const first = edges[i];
    const nextFromReceiver = edges.filter((edge) => edge.sender === first.receiver && edge.date >= first.date);
    const candidate = nextFromReceiver.find((edge) => edge.amount > 0 && Math.abs(edge.amount - first.amount) / Math.max(first.amount, 1) <= 0.05);
    if (candidate && candidate.receiver !== first.sender) {
      findings.push({
        id: `layering-${first.id}-${candidate.id}`,
        category: "layering",
        ruleFile: CATEGORY_META.layering.ruleFile,
        ruleId: CATEGORY_META.layering.ruleIdPrefix,
        title: `${CATEGORY_META.layering.title}: ${buildCounterpartyLabel(first.sender)} → ${buildCounterpartyLabel(first.receiver)} → ${buildCounterpartyLabel(candidate.receiver)}`,
        grade: CATEGORY_META.layering.grade,
        summary: `A two-hop trail preserves a near-similar amount across two entities.`,
        evidence: [
          `${buildCounterpartyLabel(first.sender)} → ${buildCounterpartyLabel(first.receiver)} · ${formatCurrency(first.amount)}`,
          `${buildCounterpartyLabel(first.receiver)} → ${buildCounterpartyLabel(candidate.receiver)} · ${formatCurrency(candidate.amount)}`,
        ],
        edgeIds: [first.id, candidate.id],
      });
      break;
    }
  }

  for (let i = 0; i < edges.length; i += 1) {
    const first = edges[i];
    const samePairReverse = edges.find(
      (edge) => edge.sender === first.receiver && edge.receiver === first.sender && Math.abs(edge.amount - first.amount) / Math.max(first.amount, 1) <= 0.05,
    );
    if (samePairReverse) {
      findings.push({
        id: `circular-${first.id}-${samePairReverse.id}`,
        category: "circular",
        ruleFile: CATEGORY_META.circular.ruleFile,
        ruleId: CATEGORY_META.circular.ruleIdPrefix,
        title: `${CATEGORY_META.circular.title}: ${buildCounterpartyLabel(first.sender)} ↔ ${buildCounterpartyLabel(first.receiver)}`,
        grade: CATEGORY_META.circular.grade,
        summary: `Funds returned to the original sender with a matching or near-matching amount.`,
        evidence: [
          `${buildCounterpartyLabel(first.sender)} → ${buildCounterpartyLabel(first.receiver)} · ${formatCurrency(first.amount)}`,
          `${buildCounterpartyLabel(first.receiver)} → ${buildCounterpartyLabel(first.sender)} · ${formatCurrency(samePairReverse.amount)}`,
        ],
        edgeIds: [first.id, samePairReverse.id],
      });
      break;
    }
  }

  // Structuring / split transfer
  nodes.forEach((node) => {
    const incoming = edges.filter((edge) => edge.receiver === node.name);
    const outgoing = edges.filter((edge) => edge.sender === node.name);
    if (!incoming.length || outgoing.length < 2) return;

    const largestIncoming = [...incoming].sort((a, b) => b.amount - a.amount)[0];
    const recentOut = outgoing.filter((edge) => edge.date >= largestIncoming.date && dateDiffDays(edge.date, largestIncoming.date) <= 1);
    if (recentOut.length < 2) return;

    const totalOut = recentOut.reduce((sum, edge) => sum + edge.amount, 0);
    const splitFactor = totalOut / Math.max(largestIncoming.amount, 1);
    const closeSizes = recentOut.every((edge) => Math.abs(edge.amount - (largestIncoming.amount / recentOut.length)) / Math.max(largestIncoming.amount, 1) <= 0.15);

    if (splitFactor >= 0.7 && splitFactor <= 1.1 && closeSizes) {
      findings.push({
        id: `structuring-${node.name}`,
        category: "structuring",
        ruleFile: CATEGORY_META.structuring.ruleFile,
        ruleId: CATEGORY_META.structuring.ruleIdPrefix,
        title: `${CATEGORY_META.structuring.title}: ${buildCounterpartyLabel(node.name)}`,
        grade: CATEGORY_META.structuring.grade,
        summary: `A larger incoming credit appears to have been broken into multiple near-equal outward transfers within a short window.`,
        evidence: [
          `Incoming: ${formatCurrency(largestIncoming.amount)}`,
          `Split outflows: ${recentOut.length} transfers totalling ${formatCurrency(totalOut)}`,
        ],
        edgeIds: [largestIncoming.id, ...recentOut.map((edge) => edge.id)],
      });
    }
  });

  // Deduplicate by title+category.
  const unique = [];
  const seen = new Set();
  findings.forEach((finding) => {
    const key = `${finding.category}::${finding.title}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(finding);
    }
  });

  return unique.sort((a, b) => SEVERITY_ORDER[b.grade || "D"] - SEVERITY_ORDER[a.grade || "D"]);
};

const renderRuleLibrary = (ruleFiles) => {
  const totalRules = ruleFiles.reduce((sum, file) => sum + file.rows.length, 0);
  const ruleCountEl = document.getElementById("fund-flow-rule-count");
  if (ruleCountEl) ruleCountEl.textContent = `${totalRules} rules`;

  const host = document.getElementById("fund-flow-rule-list");
  if (!host) return;

  host.innerHTML = ruleFiles
    .map((file) => {
      const rows = file.rows.slice(0, 3);
      return `
        <details class="group card-elevated card-elevated--static card-elevated--tinted rounded-xl bg-surface-muted p-3 open:bg-surface-container-lowest">
          <summary class="cursor-pointer list-none flex items-center justify-between gap-3">
            <div>
              <div class="text-body-sm font-bold text-on-surface">${escapeHtml(file.label)}</div>
              <div class="text-label-sm text-secondary">${escapeHtml(file.file)} · ${file.rows.length} rules</div>
            </div>
            <span class="material-symbols-outlined text-secondary group-open:rotate-180 transition-transform">expand_more</span>
          </summary>
          <div class="mt-3 space-y-2">
            ${rows
              .map(
                (row) => `
                  <div class="card-elevated rounded-lg p-3">
                    <div class="flex items-center justify-between gap-3">
                      <span class="text-label-sm font-bold text-primary">${escapeHtml(row["Rule ID"] || "")}</span>
                      <span class="text-label-sm text-secondary">${escapeHtml(row["Evidence grade"] || row["Grade"] || row["Threshold"] || "")}</span>
                    </div>
                    <div class="mt-1 text-body-sm font-semibold text-on-surface">${escapeHtml(row["Rule name"] || "")}</div>
                    <div class="text-body-sm text-secondary mt-1">${escapeHtml(row["Output"] || row["Condition"] || "")}</div>
                  </div>
                `,
              )
              .join("")}
          </div>
        </details>
      `;
    })
    .join("");
};

const renderFindings = (findings, highlightMap) => {
  const host = document.getElementById("fund-flow-findings");
  const badge = document.getElementById("fund-flow-detected-badge");
  const count = findings.length;
  if (badge) badge.textContent = `${count} hit${count === 1 ? "" : "s"}`;

  if (!host) return;
  if (!findings.length) {
    host.innerHTML = `
      <div class="rounded-xl border border-dashed border-border-subtle bg-surface-muted p-4 text-body-sm text-secondary">
        No strong patterns were confirmed from the loaded transactions. Scroll the graph to inspect the raw transfer network.
      </div>
    `;
    return;
  }

  host.innerHTML = findings
    .map((finding) => {
      const totalEdges = finding.edgeIds?.length || 0;
      const color = SEVERITY_COLOR[finding.grade || "D"] || SEVERITY_COLOR.D;
      return `
        <div class="card-elevated card-elevated--tinted rounded-xl bg-surface-muted p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-[10px] font-bold" style="background:${color}">${escapeHtml(finding.grade || "D")}</span>
                <span class="text-label-sm font-bold uppercase tracking-widest text-secondary">${escapeHtml(finding.ruleId || "")}</span>
              </div>
              <div class="mt-2 text-body-sm font-bold text-on-surface">${escapeHtml(finding.title)}</div>
              <div class="mt-1 text-body-sm text-secondary">${escapeHtml(finding.summary)}</div>
            </div>
            <span class="text-label-sm font-bold text-primary">${totalEdges} edge${totalEdges === 1 ? "" : "s"}</span>
          </div>
          <div class="mt-3 flex flex-wrap gap-2">
            ${(finding.evidence || []).map((item) => `<span class="px-2 py-1 rounded-full text-label-sm bg-surface-container-low border border-border-subtle text-secondary">${escapeHtml(item)}</span>`).join("")}
          </div>
        </div>
      `;
    })
    .join("");
};

const renderSelection = (node) => {
  const host = document.getElementById("fund-flow-selection");
  if (!host || !node) return;
  host.innerHTML = `
    <div class="space-y-2">
      <div class="flex items-center justify-between gap-3">
        <div>
          <div class="text-label-sm uppercase tracking-widest text-secondary">Entity</div>
          <div class="text-body-sm font-bold text-on-surface">${escapeHtml(node.label)}</div>
        </div>
        <span class="px-2 py-1 rounded-full text-label-sm font-bold ${node.kind === "internal" ? "bg-primary/10 text-primary" : "bg-secondary-container text-on-secondary-container"}">${escapeHtml(node.kind)}</span>
      </div>
      <div class="grid grid-cols-2 gap-2 pt-2">
        <div class="card-elevated rounded-lg p-3">
          <div class="text-label-sm text-secondary uppercase tracking-widest">Transactions</div>
          <div class="text-body-sm font-bold text-on-surface mt-1">${node.txCount}</div>
        </div>
        <div class="card-elevated rounded-lg p-3">
          <div class="text-label-sm text-secondary uppercase tracking-widest">Counterparties</div>
          <div class="text-body-sm font-bold text-on-surface mt-1">${node.counterparties.size}</div>
        </div>
        <div class="card-elevated rounded-lg p-3">
          <div class="text-label-sm text-secondary uppercase tracking-widest">Inflow</div>
          <div class="text-body-sm font-bold text-on-surface mt-1">${formatCurrency(node.inflow)}</div>
        </div>
        <div class="card-elevated rounded-lg p-3">
          <div class="text-label-sm text-secondary uppercase tracking-widest">Outflow</div>
          <div class="text-body-sm font-bold text-on-surface mt-1">${formatCurrency(node.outflow)}</div>
        </div>
      </div>
    </div>
  `;
};

const renderGraph = (graph, findings) => {
  const host = document.getElementById("fund-flow-graph-host");
  const totalTxEl = document.getElementById("fund-flow-total-tx");
  const entityCountEl = document.getElementById("fund-flow-entity-count");
  const patternCountEl = document.getElementById("fund-flow-pattern-count");
  const spanEl = document.getElementById("fund-flow-time-span");
  const titleEl = document.getElementById("fund-flow-case-title");
  const labelEl = document.getElementById("fund-flow-case-label");
  const statusEl = document.getElementById("fund-flow-analysis-status");

  const patternEdgeIds = new Set(findings.flatMap((finding) => finding.edgeIds || []));
  const visibleEdgesRaw = patternEdgeIds.size
    ? graph.edges.filter((edge) => patternEdgeIds.has(edge.id))
    : [];

  const visibleNodeNames = new Set();
  visibleEdgesRaw.forEach((edge) => {
    visibleNodeNames.add(edge.sender);
    visibleNodeNames.add(edge.receiver);
  });

  const visibleNodes = graph.nodes.filter((node) => visibleNodeNames.has(node.name));
  const svgWidth = Math.max(980, 720 + visibleNodes.length * 42);
  const svgHeight = Math.max(620, 460 + visibleNodes.length * 26);
  const nodeRadius = 16;

  const positionByNode = new Map();
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;
  const initRadius = Math.min(svgWidth, svgHeight) * 0.28;

  visibleNodes.forEach((node, index) => {
    const angle = (index / Math.max(1, visibleNodes.length)) * Math.PI * 2;
    positionByNode.set(node.name, {
      x: centerX + initRadius * Math.cos(angle),
      y: centerY + initRadius * Math.sin(angle),
      vx: 0,
      vy: 0,
    });
  });

  const boundedX = (x) => Math.max(48, Math.min(svgWidth - 48, x));
  const boundedY = (y) => Math.max(48, Math.min(svgHeight - 48, y));

  const forceEdges = visibleEdgesRaw
    .filter((edge) => positionByNode.has(edge.sender) && positionByNode.has(edge.receiver))
    .map((edge) => ({
      ...edge,
      source: positionByNode.get(edge.sender),
      target: positionByNode.get(edge.receiver),
    }));

  const repulsionStrength = 18000;
  const springStrength = 0.015;
  const desiredLength = 170;
  const centerPull = 0.006;
  const damping = 0.86;

  for (let iter = 0; iter < 320; iter += 1) {
    // Repulsion between all visible nodes
    for (let i = 0; i < visibleNodes.length; i += 1) {
      const a = positionByNode.get(visibleNodes[i].name);
      for (let j = i + 1; j < visibleNodes.length; j += 1) {
        const b = positionByNode.get(visibleNodes[j].name);
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distSq = Math.max(1, dx * dx + dy * dy);
        const dist = Math.sqrt(distSq);
        const force = repulsionStrength / distSq;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      }
    }

    // Attraction along pattern edges
    forceEdges.forEach((edge) => {
      const dx = edge.target.x - edge.source.x;
      const dy = edge.target.y - edge.source.y;
      const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      const stretch = dist - desiredLength;
      const pull = springStrength * stretch;
      const fx = (dx / dist) * pull;
      const fy = (dy / dist) * pull;
      edge.source.vx += fx;
      edge.source.vy += fy;
      edge.target.vx -= fx;
      edge.target.vy -= fy;
    });

    // Centering + integrate
    visibleNodes.forEach((node) => {
      const p = positionByNode.get(node.name);
      p.vx += (centerX - p.x) * centerPull;
      p.vy += (centerY - p.y) * centerPull;
      p.vx *= damping;
      p.vy *= damping;
      p.x = boundedX(p.x + p.vx);
      p.y = boundedY(p.y + p.vy);
    });
  }

  const pairCounts = new Map();
  const pairIndex = new Map();
  forceEdges.forEach((edge) => {
    const key = `${edge.sender}=>${edge.receiver}`;
    pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
  });

  const visibleEdges = forceEdges.map((edge) => {
    const key = `${edge.sender}=>${edge.receiver}`;
    const idx = pairIndex.get(key) || 0;
    pairIndex.set(key, idx + 1);
    return {
      ...edge,
      pairOffsetIndex: idx,
      pairSize: pairCounts.get(key) || 1,
    };
  });

  if (totalTxEl) totalTxEl.textContent = String(visibleEdges.length);
  if (entityCountEl) entityCountEl.textContent = String(visibleNodes.length);
  if (patternCountEl) patternCountEl.textContent = String(findings.length);
  if (spanEl) spanEl.textContent = "Pattern-only";
  if (statusEl) statusEl.textContent = visibleEdges.length ? "Pattern-linked nodes and edges rendered." : "No pattern-linked edges found.";
  if (titleEl && graph.caseData) titleEl.textContent = `${graph.caseData.caseNumber} · ${graph.caseData.title}`;
  if (labelEl && graph.caseData) labelEl.textContent = graph.caseData.subtitle || `Case ID ${graph.caseData.id}`;

  if (!host) return;

  const highlightMap = buildGraphHighlightMap(findings);

  if (!visibleEdges.length) {
    host.innerHTML = `
      <div class="h-full min-h-[360px] flex items-center justify-center p-6">
        <div class="max-w-lg text-center rounded-xl border border-dashed border-border-subtle bg-surface-muted p-6">
          <div class="text-body-sm font-bold text-on-surface mb-2">No pattern subgraph available</div>
          <div class="text-body-sm text-secondary">Patterns were not detected for this case, so there are no linked nodes/edges to render yet.</div>
        </div>
      </div>
    `;
    return;
  }

  const edgeElements = visibleEdges
    .map((node, index) => {
      const tx = node.tx;
      const severity = highlightMap.get(node.id) || (Number(tx.amount || 0) >= 50000 ? "B" : "D");
      const color = SEVERITY_COLOR[severity] || SEVERITY_COLOR.D;
      const opacity = severity === "D" ? 0.38 : 0.82;
      const sx = node.source.x;
      const sy = node.source.y;
      const txX = node.target.x;
      const ty = node.target.y;

      const mx = (sx + txX) / 2;
      const my = (sy + ty) / 2;
      const dx = txX - sx;
      const dy = ty - sy;
      const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      const nx = -dy / dist;
      const ny = dx / dist;
      const centeredOffset = node.pairOffsetIndex - (node.pairSize - 1) / 2;
      const bend = centeredOffset * 14;
      const cx = mx + nx * bend;
      const cy = my + ny * bend;

      const amountLabel = node.amount >= 100000
        ? `<text x="${cx + 8}" y="${cy - 6}" fill="${color}" font-size="10" font-family="JetBrains Mono" font-weight="700">${escapeHtml(formatCurrency(node.amount))}</text>`
        : "";

      return `
        <g class="fund-flow-edge cursor-pointer" data-tx-id="${escapeHtml(node.id)}">
          <path d="M ${sx} ${sy} Q ${cx} ${cy} ${txX} ${ty}" fill="none" stroke="${color}" stroke-width="${severity === "A" ? 3.2 : 2.1}" opacity="${opacity}" marker-end="url(#fund-flow-arrow-${severity})" />
          ${amountLabel}
          <title>${escapeHtml(`${formatDateTime(node.date)} | ${node.sender} → ${node.receiver} | ${formatCurrency(node.amount)} | ${tx.description || ""}`)}</title>
        </g>
      `;
    })
    .join("");

  const nodeElements = visibleNodes
    .map((edge) => {
      const pos = positionByNode.get(edge.name);
      const nodeColor = edge.kind === "internal" ? "#005C54" : "#64748B";
      const ringColor = edge.kind === "internal" ? "rgba(0,92,84,0.20)" : "rgba(100,116,139,0.20)";
      const txCountSize = String(Math.min(13, 10 + Math.floor(edge.txCount / 6)));

      return `
        <g class="fund-flow-node cursor-pointer" data-node-name="${escapeHtml(edge.name)}">
          <circle cx="${pos.x}" cy="${pos.y}" r="${nodeRadius + 7}" fill="${ringColor}" />
          <circle cx="${pos.x}" cy="${pos.y}" r="${nodeRadius}" fill="${nodeColor}" />
          <text x="${pos.x}" y="${pos.y + 3}" text-anchor="middle" fill="#ffffff" font-size="${txCountSize}" font-family="JetBrains Mono" font-weight="700">${edge.txCount > 99 ? "99+" : edge.txCount}</text>
          <text x="${pos.x}" y="${pos.y + nodeRadius + 16}" text-anchor="middle" fill="#111827" font-size="11" font-family="Inter" font-weight="700">${escapeHtml(edge.label)}</text>
          <title>${escapeHtml(`${edge.name} | ${edge.txCount} tx | In ${formatCurrency(edge.inflow)} | Out ${formatCurrency(edge.outflow)}`)}</title>
        </g>
      `;
    })
    .join("");

  host.innerHTML = `
    <svg id="fund-flow-svg" xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" class="block select-none">
      <defs>
        <marker id="fund-flow-arrow-A" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="${SEVERITY_COLOR.A}" />
        </marker>
        <marker id="fund-flow-arrow-B" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="${SEVERITY_COLOR.B}" />
        </marker>
        <marker id="fund-flow-arrow-C" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="${SEVERITY_COLOR.C}" />
        </marker>
        <marker id="fund-flow-arrow-D" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="${SEVERITY_COLOR.D}" />
        </marker>
      </defs>
      <rect x="0" y="0" width="${svgWidth}" height="${svgHeight}" fill="transparent" />
      <text x="18" y="22" fill="#6B7280" font-size="11" font-family="JetBrains Mono">2D FORCE · PATTERN SUBGRAPH</text>
      ${edgeElements}
      ${nodeElements}
    </svg>
  `;

  host.querySelectorAll(".fund-flow-edge").forEach((edgeEl) => {
    edgeEl.addEventListener("click", () => {
      const txId = edgeEl.dataset.txId;
      const tx = findTxnById(graph.edges, txId);
      if (!tx) return;
      const selection = document.getElementById("fund-flow-selection");
      if (selection) {
        selection.innerHTML = `
          <div class="space-y-2">
            <div class="flex items-center justify-between gap-3">
              <div>
                <div class="text-label-sm uppercase tracking-widest text-secondary">Transaction</div>
                <div class="text-body-sm font-bold text-on-surface">${escapeHtml(tx.description || tx.id || "Transfer")}</div>
              </div>
              <span class="px-2 py-1 rounded-full text-label-sm font-bold bg-primary/10 text-primary">${escapeHtml(formatCurrency(tx.amount))}</span>
            </div>
            <div class="grid grid-cols-2 gap-2 pt-2">
              <div class="card-elevated rounded-lg p-3">
                <div class="text-label-sm text-secondary uppercase tracking-widest">Sender</div>
                <div class="text-body-sm font-bold text-on-surface mt-1">${escapeHtml(tx._sender)}</div>
              </div>
              <div class="card-elevated rounded-lg p-3">
                <div class="text-label-sm text-secondary uppercase tracking-widest">Receiver</div>
                <div class="text-body-sm font-bold text-on-surface mt-1">${escapeHtml(tx._receiver)}</div>
              </div>
              <div class="card-elevated rounded-lg p-3">
                <div class="text-label-sm text-secondary uppercase tracking-widest">Date</div>
                <div class="text-body-sm font-bold text-on-surface mt-1">${escapeHtml(formatDateTime(tx._date))}</div>
              </div>
              <div class="card-elevated rounded-lg p-3">
                <div class="text-label-sm text-secondary uppercase tracking-widest">Reference</div>
                <div class="text-body-sm font-bold text-on-surface mt-1">${escapeHtml(tx._reference || "-")}</div>
              </div>
            </div>
          </div>
        `;
      }
    });
  });

  host.querySelectorAll(".fund-flow-node").forEach((nodeEl) => {
    nodeEl.addEventListener("click", () => {
      const nodeName = nodeEl.dataset.nodeName;
      const node = visibleNodes.find((item) => item.name === nodeName);
      if (node) renderSelection(node);
    });
  });

  if (visibleNodes.length) renderSelection(visibleNodes[0]);
};

const loadRuleFiles = async () => {
  const results = [];
  for (const file of RULE_FILES) {
    const filePath = `${FOLDER_PREFIX}${file.file}`;
    try {
      const response = await fetch(encodeURI(filePath), { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      results.push({ ...file, rows: parseCSV(text) });
    } catch (error) {
      console.warn(`Unable to load rule file ${file.file}:`, error);
      results.push({ ...file, rows: [] });
    }
  }
  return results;
};

const renderLoadingState = (message) => {
  const status = document.getElementById("fund-flow-analysis-status");
  if (status) status.textContent = message;
};

const attachHorizontalScrollHint = () => {
  const scrollHost = document.getElementById("fund-flow-graph-scroll");
  if (!scrollHost) return;

  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  scrollHost.addEventListener("mousedown", (event) => {
    isDown = true;
    startX = event.pageX - scrollHost.offsetLeft;
    scrollLeft = scrollHost.scrollLeft;
    scrollHost.classList.add("cursor-grabbing");
  });

  window.addEventListener("mouseup", () => {
    isDown = false;
    scrollHost.classList.remove("cursor-grabbing");
  });

  window.addEventListener("mousemove", (event) => {
    if (!isDown) return;
    const x = event.pageX - scrollHost.offsetLeft;
    const walk = x - startX;
    scrollHost.scrollLeft = scrollLeft - walk;
  });

  scrollHost.addEventListener("wheel", (event) => {
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    scrollHost.scrollLeft += event.deltaY;
  }, { passive: true });
};

const init = async () => {
  const main = document.querySelector("main");
  if (!main) return;
  main.innerHTML = buildShell();
  attachHorizontalScrollHint();

  const caseId = getQueryCaseId();
  if (!caseId) {
    renderLoadingState("Open a case to inspect its fund flow graph.");
    const analysisStatus = document.getElementById("fund-flow-analysis-status");
    if (analysisStatus) analysisStatus.textContent = "No case selected. Use a case URL with ?caseId=... or ?id=...";
    return;
  }

  try {
    renderLoadingState("Loading case, transactions, and rule files…");
    const [caseData, persons, transactions, ruleFiles] = await Promise.all([
      caseService.getCaseById(caseId),
      caseService.getPersons(caseId),
      caseService.getTransactions(caseId),
      loadRuleFiles(),
    ]);

    const graph = computeGraphData(caseData, persons, transactions);
    const findings = detectPatterns(graph);

    renderRuleLibrary(ruleFiles);
    renderFindings(findings, buildGraphHighlightMap(findings));
    renderGraph(graph, findings);

    const summaryStatus = document.getElementById("fund-flow-analysis-status");
    if (summaryStatus) {
      summaryStatus.textContent = findings.length
        ? `Loaded ${graph.txs.length} transactions across ${graph.nodes.length} entities and surfaced ${findings.length} pattern hit${findings.length === 1 ? "" : "s"}.`
        : `Loaded ${graph.txs.length} transactions across ${graph.nodes.length} entities. No strong pattern hit met the current rule thresholds.`;
    }
  } catch (error) {
    console.error("Failed to initialize fund flow page:", error);
    const status = document.getElementById("fund-flow-analysis-status");
    if (status) status.textContent = "Unable to load the case graph right now.";
    const findingsHost = document.getElementById("fund-flow-findings");
    if (findingsHost) {
      findingsHost.innerHTML = `
        <div class="rounded-xl border border-status-critical/20 bg-status-critical/5 p-4 text-body-sm text-status-critical">
          The graph could not be built. Check that the backend is running and the case has transactions available.
        </div>
      `;
    }
  }
};

export function attachFundFlowInteractions() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
    return;
  }
  init();
}
