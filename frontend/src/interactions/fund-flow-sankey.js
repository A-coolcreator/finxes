import { caseService } from "../services/caseService.js";

const d3Promise = Promise.all([
  import("https://cdn.jsdelivr.net/npm/d3@7/+esm"),
  import("https://cdn.jsdelivr.net/npm/d3-sankey@0.12/+esm"),
]).then(([d3, sankeyMod]) => ({ d3, ...sankeyMod }));

// --- Design tokens (kept in sync with the Tailwind config in fund-flow.html) ---
const COLORS = {
  edgeDefault: "#94A3B8",
  edgeHighlight: "#DC2626", // status-critical
  nodeInternal: "#005C54",  // primary
  nodeExternal: "#5B5E66",  // secondary
  text: "#181C1C",          // on-surface
  textMuted: "#6E7977",     // outline
};

const MAX_VISIBLE_LINKS = 60; // keep the diagram readable; smallest flows collapse into "Other"

// --- Utilities ---
const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const normalize = (value) => String(value ?? "").trim().replace(/\s+/g, " ").toUpperCase();

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatCompact = (value) => {
  const num = Number(value || 0);
  if (num >= 1e7) return `₹${(num / 1e7).toFixed(2)}Cr`;
  if (num >= 1e5) return `₹${(num / 1e5).toFixed(2)}L`;
  if (num >= 1e3) return `₹${(num / 1e3).toFixed(1)}K`;
  return formatCurrency(num);
};

const getQueryCaseId = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("caseId") || params.get("id");
};

const getRawJson = (tx) => {
  if (!tx?.rawTransactionJson) return null;
  try {
    return typeof tx.rawTransactionJson === "string" ? JSON.parse(tx.rawTransactionJson) : tx.rawTransactionJson;
  } catch {
    return null;
  }
};

const buildLabel = (name) => {
  const cleaned = normalize(name || "UNKNOWN");
  return cleaned.length > 24 ? `${cleaned.slice(0, 21)}…` : cleaned;
};

// Best-effort sender/receiver resolution. Prefers explicit fields on the
// transaction; falls back to type/flow direction against the case owner.
const resolveCounterparty = (tx) => {
  const raw = getRawJson(tx);
  const candidates = [
    tx.counterparty, tx.counterpartyName, tx.beneficiary, tx.beneficiaryName,
    tx.payee, tx.payer, raw?.counterparty, raw?.beneficiary, raw?.payee, raw?.payer,
  ].filter(Boolean);
  if (candidates.length) return normalize(candidates[0]);
  return tx.type === "credit" || normalize(tx.flow).includes("IN") ? "EXTERNAL SOURCE" : "EXTERNAL BENEFICIARY";
};

const resolveSenderReceiver = (tx, ownerName) => {
  if (tx.sender && tx.receiver) return { sender: normalize(tx.sender), receiver: normalize(tx.receiver) };

  const counterparty = resolveCounterparty(tx);
  const isOutgoing = normalize(tx.type) === "DEBIT" || normalize(tx.flow).includes("OUT") || normalize(tx.flow).includes("WITHDRAW");
  const isIncoming = normalize(tx.type) === "CREDIT" || normalize(tx.flow).includes("IN") || normalize(tx.flow).includes("DEPOSIT");

  const owner = normalize(tx.personName) || ownerName;
  if (isOutgoing) return { sender: owner, receiver: counterparty };
  if (isIncoming) return { sender: counterparty, receiver: owner };
  // Unknown direction: default to owner -> counterparty so the flow still renders.
  return { sender: owner, receiver: counterparty };
};

// --- Build aggregated node/link graph, breaking cycles so d3-sankey doesn't choke ---
const buildGraph = (caseData, persons, transactions) => {
  const internalNames = new Set((Array.isArray(persons) ? persons : []).map((p) => normalize(p.name)).filter(Boolean));
  const ownerName = normalize(caseData?.caseNumber || caseData?.title || "CASE OWNER");
  internalNames.add(ownerName);

  const nodeMeta = new Map(); // name -> { inflow, outflow, txCount, kind }
  const touch = (name) => {
    if (!nodeMeta.has(name)) {
      nodeMeta.set(name, { inflow: 0, outflow: 0, txCount: 0, kind: internalNames.has(name) ? "internal" : "external" });
    }
    return nodeMeta.get(name);
  };

  // Aggregate parallel transactions between the same pair into one link
  const linkAgg = new Map(); // "sender||receiver" -> { sender, receiver, amount, txIds, count }
  (Array.isArray(transactions) ? transactions : []).forEach((tx) => {
    const amount = Math.abs(Number(tx.amount || 0));
    if (!amount) return;
    const { sender, receiver } = resolveSenderReceiver(tx, ownerName);
    if (!sender || !receiver || sender === receiver) return;

    touch(sender).outflow += amount;
    touch(sender).txCount += 1;
    touch(receiver).inflow += amount;
    touch(receiver).txCount += 1;

    const key = `${sender}||${receiver}`;
    if (!linkAgg.has(key)) linkAgg.set(key, { sender, receiver, amount: 0, count: 0, txIds: [] });
    const entry = linkAgg.get(key);
    entry.amount += amount;
    entry.count += 1;
    if (tx.id) entry.txIds.push(tx.id);
  });

  // Cap to the largest flows so the diagram stays legible
  let links = [...linkAgg.values()].sort((a, b) => b.amount - a.amount);
  if (links.length > MAX_VISIBLE_LINKS) {
    const overflow = links.slice(MAX_VISIBLE_LINKS);
    const kept = links.slice(0, MAX_VISIBLE_LINKS);
    const overflowAmount = overflow.reduce((sum, l) => sum + l.amount, 0);
    const overflowCount = overflow.reduce((sum, l) => sum + l.count, 0);
    kept.push({ sender: "OTHER SOURCES", receiver: "OTHER FLOWS", amount: overflowAmount, count: overflowCount, txIds: [], isOverflow: true });
    links = kept;
  }

  // Break cycles: if we've already routed receiver->sender in this direction,
  // clone the receiver as a distinct "(return leg)" node so the DAG holds
  // (d3-sankey cannot lay out a graph with cycles).
  const seenDirected = new Set();
  const finalLinks = links.map((link) => {
    let { receiver } = link;
    if (seenDirected.has(`${receiver}->${link.sender}`)) {
      receiver = `${receiver} (RETURN)`;
      if (!nodeMeta.has(receiver)) {
        nodeMeta.set(receiver, { inflow: 0, outflow: 0, txCount: 0, kind: touch(link.receiver).kind });
      }
    }
    seenDirected.add(`${link.sender}->${receiver}`);
    return { ...link, receiver };
  });

  const nodeNamesFinal = new Set();
  finalLinks.forEach((l) => {
    nodeNamesFinal.add(l.sender);
    nodeNamesFinal.add(l.receiver);
  });

  const nodes = [...nodeNamesFinal].map((name) => {
    const meta = nodeMeta.get(name) || { inflow: 0, outflow: 0, txCount: 0, kind: "external" };
    return {
      id: name,
      name,
      label: buildLabel(name),
      kind: meta.kind,
      inflow: meta.inflow,
      outflow: meta.outflow,
      txCount: meta.txCount,
    };
  });

  const nodeIndex = new Map(nodes.map((n, i) => [n.id, i]));
  const graphLinks = finalLinks.map((l) => ({
    source: nodeIndex.get(l.sender),
    target: nodeIndex.get(l.receiver),
    value: l.amount,
    count: l.count,
    txIds: l.txIds,
    isOverflow: !!l.isOverflow,
  }));

  const totalVolume = finalLinks.reduce((sum, l) => sum + l.amount, 0);

  return { nodes, links: graphLinks, totalVolume, txTotal: (transactions || []).length };
};

const nodeColor = (node) => (node.kind === "internal" ? COLORS.nodeInternal : COLORS.nodeExternal);

const updateHeaderStats = (caseData, graph) => {
  const caseLabelEl = document.getElementById("fund-flow-case-id");
  const volumeEl = document.getElementById("fund-flow-total-volume");
  const hopEl = document.getElementById("fund-flow-hop-count");
  if (caseLabelEl) caseLabelEl.textContent = caseData?.caseNumber || caseData?.title || "—";
  if (volumeEl) volumeEl.textContent = formatCompact(graph.totalVolume);
  if (hopEl) hopEl.textContent = String(graph.nodes.length);
};

const populateSidebar = (link, sourceNode, targetNode) => {
  const host = document.getElementById("fund-flow-trail-details");
  if (!host) return;
  host.innerHTML = `
    <div class="p-4 bg-primary-container/10 border border-primary/20 rounded-lg">
      <div class="flex items-center gap-2 mb-2 text-primary">
        <span class="material-symbols-outlined text-[20px]">sync_alt</span>
        <span class="font-label-md text-label-md font-bold">Flow Detail</span>
      </div>
      <p class="text-body-sm text-on-surface-variant mb-4">
        ${escapeHtml(sourceNode.label)} → ${escapeHtml(targetNode.label)}
      </p>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <div class="text-[10px] text-outline uppercase font-bold">Amount</div>
          <div class="text-headline-md text-primary font-black">${formatCompact(link.value)}</div>
        </div>
        <div>
          <div class="text-[10px] text-outline uppercase font-bold">Transactions</div>
          <div class="font-label-md text-label-md text-on-surface">${link.count}</div>
        </div>
      </div>
    </div>
    <div class="mt-6 space-y-3">
      <div class="relative pl-6">
        <div class="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-primary border-2 border-white"></div>
        <div class="font-label-sm text-label-sm font-bold">${escapeHtml(sourceNode.label)}</div>
        <div class="text-[11px] text-outline">Out: ${formatCompact(sourceNode.outflow)} · In: ${formatCompact(sourceNode.inflow)}</div>
      </div>
      <div class="relative pl-6">
        <div class="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-secondary border-2 border-white"></div>
        <div class="font-label-sm text-label-sm font-bold">${escapeHtml(targetNode.label)}</div>
        <div class="text-[11px] text-outline">Out: ${formatCompact(targetNode.outflow)} · In: ${formatCompact(targetNode.inflow)}</div>
      </div>
    </div>
  `;
};

const renderEmptyState = (message) => {
  const svgWrapper = document.querySelector("main svg#fund-flow-canvas");
  if (!svgWrapper) return;
  svgWrapper.innerHTML = `
    <text x="50%" y="50%" text-anchor="middle" fill="#6E7977" font-family="Inter" font-size="14">
      ${escapeHtml(message)}
    </text>
  `;
};

// --- Core rendering ---
const drawSankey = async (graphData, caseData) => {
  const { d3, sankey, sankeyLinkHorizontal } = await d3Promise;

  const svgWrapper = d3.select("main svg#fund-flow-canvas");
  if (svgWrapper.empty()) return;
  svgWrapper.selectAll("*").remove();

  const bounds = svgWrapper.node().getBoundingClientRect();
  const width = Math.max(bounds.width || 0, 900);
  const height = Math.max(bounds.height || 0, 520);
  svgWrapper.attr("viewBox", `0 0 ${width} ${height}`).attr("preserveAspectRatio", "xMidYMid meet");

  const graph = {
    nodes: graphData.nodes.map((n) => ({ ...n })),
    links: graphData.links.map((l) => ({ ...l })),
  };

  const sankeyGenerator = sankey()
    .nodeWidth(18)
    .nodePadding(24)
    .extent([[1, 24], [width - 190, height - 24]]);

  try {
    sankeyGenerator(graph);
  } catch (err) {
    console.error("Sankey layout failed:", err);
    renderEmptyState("Unable to lay out this fund flow — the transaction graph may be too tangled.");
    return;
  }

  const defs = svgWrapper.append("defs");
  graph.links.forEach((d, i) => {
    const gradient = defs.append("linearGradient")
      .attr("id", `link-gradient-${i}`)
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", d.source.x1)
      .attr("x2", d.target.x0);
    gradient.append("stop").attr("offset", "0%").attr("stop-color", nodeColor(d.source)).attr("stop-opacity", 0.55);
    gradient.append("stop").attr("offset", "100%").attr("stop-color", nodeColor(d.target)).attr("stop-opacity", 0.55);
  });

  const g = svgWrapper.append("g");

  // Links
  const link = g.append("g")
    .attr("fill", "none")
    .selectAll("path")
    .data(graph.links)
    .join("path")
    .attr("d", sankeyLinkHorizontal())
    .attr("stroke", (d, i) => (d.isOverflow ? COLORS.edgeDefault : `url(#link-gradient-${i})`))
    .attr("stroke-width", (d) => Math.max(2, d.width))
    .attr("opacity", 0.55)
    .style("cursor", "pointer")
    .style("transition", "opacity 0.2s");

  link.append("title")
    .text((d) => `${d.source.name} → ${d.target.name}\n${formatCurrency(d.value)} across ${d.count} transaction${d.count === 1 ? "" : "s"}`);

  link
    .on("mouseover", function (event, d) {
      link.attr("opacity", (o) => (o === d ? 0.9 : 0.15));
    })
    .on("mouseout", function () {
      link.attr("opacity", 0.55);
    })
    .on("click", (event, d) => {
      if (d.isOverflow) return;
      populateSidebar(d, d.source, d.target);
    });

  // Nodes
  const node = g.append("g")
    .selectAll("g")
    .data(graph.nodes)
    .join("g")
    .attr("transform", (d) => `translate(${d.x0},${d.y0})`)
    .style("cursor", "pointer");

  node.append("rect")
    .attr("height", (d) => Math.max(4, d.y1 - d.y0))
    .attr("width", (d) => d.x1 - d.x0)
    .attr("fill", (d) => nodeColor(d))
    .attr("rx", 3)
    .attr("class", "node-glow")
    .on("mouseover", function () {
      d3.select(this).style("filter", "brightness(1.25)");
    })
    .on("mouseout", function () {
      d3.select(this).style("filter", null);
    });

  node.append("title")
    .text((d) => `${d.name}\nIn: ${formatCurrency(d.inflow)}\nOut: ${formatCurrency(d.outflow)}`);

  node.append("text")
    .attr("x", (d) => (d.x0 < width / 2 ? d.x1 - d.x0 + 8 : -8))
    .attr("y", (d) => (d.y1 - d.y0) / 2 - 6)
    .attr("dy", "0.35em")
    .attr("text-anchor", (d) => (d.x0 < width / 2 ? "start" : "end"))
    .attr("fill", COLORS.text)
    .attr("font-family", "Inter, system-ui, sans-serif")
    .attr("font-size", "12px")
    .attr("font-weight", "600")
    .text((d) => d.label);

  node.append("text")
    .attr("x", (d) => (d.x0 < width / 2 ? d.x1 - d.x0 + 8 : -8))
    .attr("y", (d) => (d.y1 - d.y0) / 2 + 10)
    .attr("dy", "0.35em")
    .attr("text-anchor", (d) => (d.x0 < width / 2 ? "start" : "end"))
    .attr("fill", COLORS.textMuted)
    .attr("font-family", "JetBrains Mono, monospace")
    .attr("font-size", "10px")
    .text((d) => formatCompact(Math.max(d.inflow, d.outflow)));

  updateHeaderStats(caseData, graphData);
};

const init = async () => {
  const caseId = getQueryCaseId();
  if (!caseId) {
    renderEmptyState("Open a case (use ?caseId=... in the URL) to see its fund flow.");
    return;
  }

  renderEmptyState("Loading transactions…");

  try {
    const [caseData, persons, transactions] = await Promise.all([
      caseService.getCaseById(caseId),
      caseService.getPersons(caseId),
      caseService.getTransactions(caseId),
    ]);

    if (!transactions || transactions.length === 0) {
      renderEmptyState("This case has no transactions to visualize yet.");
      return;
    }

    const graph = buildGraph(caseData, persons, transactions);
    if (!graph.links.length) {
      renderEmptyState("Transactions were found, but no sender/receiver pairs could be resolved.");
      return;
    }

    await drawSankey(graph, caseData);
  } catch (error) {
    console.error("Failed to load fund flow sankey:", error);
    renderEmptyState("Unable to load the case graph right now.");
  }
};

export const attachFundFlowSankeyInteractions = () => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  // Re-render on resize so the sankey extent stays correct.
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 250);
  });
};