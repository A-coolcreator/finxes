import {
  analyseTransactionVolume,
  buildFundFlowMetadata,
  enrichTransactions,
} from "./transaction-rule-engine.js";
import type { CaseRecord } from "../types/case";
import type { PersonRecord } from "../types/person";
import type { ApiTransaction, EnrichedTransaction } from "../types/transaction";
import {
  amountOf,
  formatDate,
  formatInr,
  formatRelative,
  formatShortDate,
  mapSeverity,
  mapUiRisk,
} from "./formatters";

export interface FindingView {
  id: string;
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  evidence: string;
  txns: number;
  confidence: number;
  status: "Reviewed" | "Pending";
  analyst: string;
  date: string;
}

export interface TransactionRowView {
  id: string;
  date: string;
  time: string;
  sortDate: string;
  amount: string;
  drCr: "Dr" | "Cr";
  type: string;
  desc: string;
  ref: string;
  category: string;
  risk: "Low" | "Medium" | "High";
  beneficiary: string;
  tags: string[];
  flagged: boolean;
}

export interface StatementRowView {
  date: string;
  desc: string;
  ref: string;
  debit: string;
  credit: string;
  balance: string;
  mode: string;
  upi: string;
  ifsc: string;
  account: string;
  bank: string;
  category: string;
  risk: "Low" | "Medium" | "High";
}

export interface EvidenceFileView {
  name: string;
  category: string;
  size: string;
  hash: string;
  by: string;
  on: string;
  status: string;
}

export interface CaseWorkspaceAnalytics {
  enriched: EnrichedTransaction[];
  volume: ReturnType<typeof analyseTransactionVolume>;
  fundFlow: ReturnType<typeof buildFundFlowMetadata>;
  findings: FindingView[];
  transactionRows: TransactionRowView[];
  statementRows: StatementRowView[];
  summaryCards: { label: string; value: string }[];
  entitySegments: { label: string; value: number; color: string }[];
  timeline: { month: string; value: number }[];
  upiCards: { label: string; value: string }[];
  upiRows: Array<Record<string, string>>;
  cryptoCards: { label: string; value: string }[];
  cryptoRows: Array<Record<string, string>>;
  muleCards: { label: string; value: string }[];
  muleDetections: Array<Record<string, string | number>>;
  fundFlowCards: { label: string; value: string }[];
  fundFlowNodes: Array<{ id: string; x: number; y: number; label: string; amount: string; flag: boolean }>;
  fundFlowEdges: [string, string][];
  fundFlowChain: Array<Record<string, string>>;
  evidenceFiles: EvidenceFileView[];
  recentActivity: Array<{ text: string; time: string }>;
}

const TAG_LABELS: Record<string, string> = {
  SALARY: "Salary",
  EMI: "EMI",
  CASH_DEPOSIT: "Cash deposit",
  CASH_WITHDRAWAL: "Cash withdrawal",
  INTERNATIONAL_TXN: "High value",
  CHEQUE_BOUNCE_FLAG: "Cheque",
  SUSPICIOUS_KEYWORD: "Crypto",
};

const parseSortDate = (value?: string) => {
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const parseTime = (value?: string) => {
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(date);
};

const channelLabel = (tx: EnrichedTransaction) => {
  if (tx.channel) return tx.channel;
  if (tx.category) return String(tx.category).toUpperCase();
  if (tx.txn_type?.includes("UPI")) return "UPI";
  return "OTHER";
};

const buildTags = (tx: EnrichedTransaction) => {
  const tags = new Set<string>();
  (tx.rule_hits || []).slice(0, 3).forEach((hit) => {
    if (hit.details) tags.add(hit.details.split(".")[0].slice(0, 40));
  });
  (tx.keyword_tags || []).slice(0, 2).forEach((tag) => tags.add(TAG_LABELS[tag] || tag.replace(/_/g, " ")));
  if (amountOf(tx) >= 50000) tags.add("High value");
  if (tx.is_crypto) tags.add("Crypto");
  if ((tx.mule_score || 0) >= 40) tags.add("Rapid movement");
  return [...tags].slice(0, 4);
};

const collectFindings = (enriched: EnrichedTransaction[]): FindingView[] => {
  const grouped = new Map<string, FindingView>();

  enriched.forEach((tx) => {
    (tx.rule_hits || []).forEach((hit) => {
      const key = hit.id;
      const existing = grouped.get(key);
      if (!existing) {
        grouped.set(key, {
          id: hit.id,
          title: hit.details || hit.id,
          severity: mapSeverity(hit.severity),
          evidence: hit.details || `${hit.id} matched`,
          txns: 1,
          confidence: Math.min(99, 55 + (hit.weight || 10)),
          status: "Pending",
          analyst: "System",
          date: formatShortDate(tx.date),
        });
        return;
      }
      existing.txns += 1;
    });
  });

  return [...grouped.values()]
    .sort((a, b) => b.txns - a.txns)
    .slice(0, 20);
};

const buildTimeline = (enriched: EnrichedTransaction[]) => {
  const months = new Map<string, number>();
  enriched.forEach((tx) => {
    const key = parseSortDate(tx.date).slice(0, 7);
    if (!key) return;
    months.set(key, (months.get(key) || 0) + 1);
  });
  return [...months.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, value]) => ({
      month: new Intl.DateTimeFormat("en-GB", { month: "short" }).format(new Date(`${month}-01`)),
      value,
    }));
};

const buildEntitySegments = (enriched: EnrichedTransaction[]) => {
  const vpas = new Set(enriched.map((tx) => tx.counterparty_vpa).filter(Boolean));
  const mobiles = new Set(
    enriched
      .map((tx) => String(tx.description || "").match(/\b[6-9]\d{9}\b/)?.[0])
      .filter(Boolean)
  );
  const ifscs = new Set(enriched.map((tx) => tx.counterparty_ifsc).filter(Boolean));
  return [
    { label: "UPI IDs detected", value: vpas.size, color: "#0E6E5E" },
    { label: "Mobile numbers detected", value: mobiles.size, color: "#D97706" },
    { label: "IFSC codes detected", value: ifscs.size, color: "#3B6FD9" },
  ];
};

const buildTransactionRows = (enriched: EnrichedTransaction[]): TransactionRowView[] =>
  enriched.map((tx) => {
    const amount = amountOf(tx);
    const isCredit = String(tx.type || "").toLowerCase() === "credit";
    return {
      id: String(tx.id || tx.txn_id),
      date: formatDate(tx.date),
      time: parseTime(tx.date),
      sortDate: parseSortDate(tx.date),
      amount: formatInr(amount),
      drCr: isCredit ? "Cr" : "Dr",
      type: channelLabel(tx),
      desc: String(tx.description || "—"),
      ref: String(tx.reference_no || tx.chqNo || tx.id || "—"),
      category: String(tx.digital_category || tx.category || "Uncategorised").replace(/_/g, " "),
      risk: mapUiRisk(tx.risk_level),
      beneficiary: String(tx.counterparty_name || tx.personName || "—"),
      tags: buildTags(tx),
      flagged: Boolean(tx.flagged),
    };
  });

const buildStatementRows = (enriched: EnrichedTransaction[]): StatementRowView[] =>
  enriched.map((tx) => {
    const amount = amountOf(tx);
    const isCredit = String(tx.type || "").toLowerCase() === "credit";
    return {
      date: formatShortDate(tx.date),
      desc: String(tx.description || "—"),
      ref: String(tx.reference_no || tx.chqNo || "—"),
      debit: isCredit ? "—" : formatInr(amount),
      credit: isCredit ? formatInr(amount) : "—",
      balance: tx.balance != null ? formatInr(Number(tx.balance)) : "—",
      mode: channelLabel(tx),
      upi: String(tx.counterparty_vpa || "—"),
      ifsc: String(tx.counterparty_ifsc || "—"),
      account: String(tx.personName || "—"),
      bank: String(tx.metaIfscCode || tx.category || "—"),
      category: String(tx.digital_category || tx.category || "—").replace(/_/g, " "),
      risk: mapUiRisk(tx.risk_level),
    };
  });

const buildFundFlowVisual = (fundFlow: ReturnType<typeof buildFundFlowMetadata>) => {
  const nodes = fundFlow.nodes.slice(0, 6).map((node, index) => ({
    id: String.fromCharCode(65 + index),
    x: 90 + (index % 3) * 170,
    y: index < 3 ? 60 + (index % 2) * 30 : 150 + (index % 2) * 20,
    label: String(node.entity_name || node.node_id).slice(0, 18),
    amount: formatInr(Number(node.txn_count || 0) * 10000, true),
    flag: Boolean(node.crypto_flag || (node.mule_score || 0) >= 40),
  }));
  const edges: [string, string][] = [];
  fundFlow.edges.slice(0, 6).forEach((edge, index) => {
    const from = nodes.find((node) => node.label.includes(String(edge.sender).slice(0, 6))) || nodes[0];
    const to = nodes[(index + 1) % nodes.length] || nodes[0];
    if (from && to) edges.push([from.id, to.id]);
  });
  const chain = fundFlow.edges.slice(0, 4).map((edge) => ({
    from: String(edge.sender),
    to: String(edge.receiver),
    amount: formatInr(Number(edge.amount || 0)),
    date: formatShortDate(new Date().toISOString()),
    method: String((edge.channels || [])[0] || "Transfer"),
    ref: String(edge.edge_id || "—"),
  }));
  return { nodes, edges, chain };
};

const buildEvidenceFiles = (persons: PersonRecord[]): EvidenceFileView[] =>
  persons.map((person) => ({
    name: `${person.name.replace(/\s+/g, "_").toLowerCase()}_statement.pdf`,
    category: "Statement",
    size: "—",
    hash: person.id.slice(-8),
    by: "Investigator",
    on: formatShortDate(person.createdAt),
    status: "Verified",
  }));

export function buildCaseWorkspaceAnalytics(
  caseRecord: CaseRecord,
  persons: PersonRecord[],
  transactions: ApiTransaction[]
): CaseWorkspaceAnalytics {
  const enriched = enrichTransactions(transactions) as EnrichedTransaction[];
  const volume = analyseTransactionVolume(enriched);
  const fundFlow = buildFundFlowMetadata(enriched, {
    accountId: caseRecord.id,
    accountName: caseRecord.title,
  });
  const findings = collectFindings(enriched);
  const transactionRows = buildTransactionRows(enriched);
  const statementRows = buildStatementRows(enriched);
  const upiTxs = enriched.filter((tx) => tx.channel === "UPI" || String(tx.description || "").toLowerCase().includes("upi"));
  const cryptoTxs = enriched.filter((tx) => tx.is_crypto || tx.crypto_entity);
  const muleHits = enriched.filter((tx) => (tx.mule_score || 0) >= 20);
  const visual = buildFundFlowVisual(fundFlow);

  const credits = enriched.filter((tx) => String(tx.type).toLowerCase() === "credit");
  const debits = enriched.filter((tx) => String(tx.type).toLowerCase() === "debit");
  const cashCredits = credits.filter((tx) => String(tx.category || tx.flow || "").toLowerCase().includes("cash"));
  const cashDebits = debits.filter((tx) => String(tx.category || tx.flow || "").toLowerCase().includes("cash"));

  return {
    enriched,
    volume,
    fundFlow,
    findings,
    transactionRows,
    statementRows,
    summaryCards: [
      { label: "Credits", value: formatInr(volume.metrics.total_credits, true) },
      { label: "Debits", value: formatInr(volume.metrics.total_debits, true) },
      { label: "Cash", value: formatInr(cashCredits.reduce((s, tx) => s + amountOf(tx), 0), true) },
      { label: "Cheque", value: formatInr(debits.filter((tx) => String(tx.txn_type || "").includes("CHEQUE")).reduce((s, tx) => s + amountOf(tx), 0), true) },
      { label: "UPI", value: String(upiTxs.length) },
      { label: "IMPS", value: String(enriched.filter((tx) => String(tx.txn_type || "").includes("IMPS")).length) },
      { label: "NEFT", value: String(enriched.filter((tx) => String(tx.txn_type || "").includes("NEFT")).length) },
      { label: "RTGS", value: String(enriched.filter((tx) => String(tx.txn_type || "").includes("RTGS")).length) },
    ],
    entitySegments: buildEntitySegments(enriched),
    timeline: buildTimeline(enriched),
    upiCards: [
      { label: "UPI transactions", value: String(upiTxs.length) },
      { label: "Unique VPA", value: String(new Set(upiTxs.map((tx) => tx.counterparty_vpa).filter(Boolean)).size) },
      { label: "Collectors", value: String(upiTxs.filter((tx) => String(tx.description || "").toLowerCase().includes("collect")).length) },
      { label: "Merchants", value: String(upiTxs.filter((tx) => String(tx.description || "").toLowerCase().includes("merchant")).length) },
      { label: "QR payments", value: String(upiTxs.filter((tx) => String(tx.description || "").toLowerCase().includes("qr")).length) },
      { label: "Refunds", value: String(upiTxs.filter((tx) => String(tx.description || "").toLowerCase().includes("refund")).length) },
      { label: "Autopay", value: String(upiTxs.filter((tx) => String(tx.description || "").toLowerCase().includes("autopay")).length) },
      { label: "Failed UPI", value: "0" },
    ],
    upiRows: upiTxs.slice(0, 20).map((tx) => ({
      date: formatShortDate(tx.date),
      amount: formatInr(amountOf(tx)),
      upi: String(tx.counterparty_vpa || "—"),
      merchant: String(tx.counterparty_name || "—"),
      ref: String(tx.reference_no || tx.id || "—"),
      bank: String(tx.metaIfscCode || "—"),
      category: String(tx.digital_category || "UPI").replace(/_/g, " "),
      risk: mapUiRisk(tx.risk_level),
      beneficiary: String(tx.counterparty_name || tx.personName || "—"),
    })),
    cryptoCards: [
      { label: "Crypto hits", value: String(cryptoTxs.length) },
      { label: "Unique exchanges", value: String(new Set(cryptoTxs.map((tx) => tx.crypto_entity).filter(Boolean)).size) },
      { label: "High risk transactions", value: String(cryptoTxs.filter((tx) => mapUiRisk(tx.risk_level) === "High").length) },
      { label: "Total crypto exposure", value: formatInr(cryptoTxs.reduce((s, tx) => s + amountOf(tx), 0), true) },
      { label: "UPI pay-ins", value: formatInr(cryptoTxs.filter((tx) => String(tx.type).toLowerCase() === "credit").reduce((s, tx) => s + amountOf(tx), 0), true) },
      { label: "UPI pay-outs", value: formatInr(cryptoTxs.filter((tx) => String(tx.type).toLowerCase() === "debit").reduce((s, tx) => s + amountOf(tx), 0), true) },
    ],
    cryptoRows: cryptoTxs.slice(0, 20).map((tx) => ({
      date: formatShortDate(tx.date),
      exchange: String(tx.crypto_entity || "Unknown exchange"),
      amount: formatInr(amountOf(tx)),
      direction: String(tx.type).toLowerCase() === "credit" ? "Deposit" : "Withdrawal",
      method: channelLabel(tx),
      ref: String(tx.reference_no || tx.id || "—"),
      risk: mapUiRisk(tx.risk_level),
      reason: String((tx.rule_hits || [])[0]?.details || "Crypto-related transaction pattern"),
    })),
    muleCards: [
      { label: "Mule score", value: `${Math.min(100, Math.max(...enriched.map((tx) => tx.mule_score || 0), caseRecord.triggerCount || 0))}/100` },
      { label: "High risk accounts", value: String(new Set(muleHits.map((tx) => tx.personId)).size) },
      { label: "Rapid movement", value: String(enriched.filter((tx) => (tx.mule_rules_hit || []).length > 0).length) },
      { label: "Structuring", value: String(enriched.filter((tx) => (tx.rule_hits || []).some((hit) => hit.id.includes("MU-03") || hit.details?.includes("threshold"))).length) },
      { label: "Cash heavy", value: String(cashCredits.length + cashDebits.length) },
      { label: "Shared beneficiaries", value: String(new Set(enriched.map((tx) => tx.counterparty_name).filter(Boolean)).size) },
    ],
    muleDetections: muleHits.slice(0, 10).map((tx) => ({
      detection: String((tx.mule_rules_hit || [])[0] || "Mule pattern"),
      evidence: String((tx.rule_hits || [])[0]?.details || tx.description || "Pattern detected"),
      confidence: Math.min(99, 60 + (tx.mule_score || 0) / 2),
      status: (tx.mule_score || 0) >= 60 ? "Confirmed" : "Under review",
      amount: formatInr(amountOf(tx)),
      date: formatShortDate(tx.date),
    })),
    fundFlowCards: [
      { label: "Accounts", value: String(persons.length || fundFlow.nodes.length) },
      { label: "Beneficiaries", value: String(fundFlow.nodes.length) },
      { label: "Incoming funds", value: formatInr(volume.metrics.total_credits, true) },
      { label: "Outgoing funds", value: formatInr(volume.metrics.total_debits, true) },
      { label: "Circular flows", value: String(fundFlow.alerts.filter((alert) => alert.id === "FF-A03").length) },
      { label: "Rapid movement", value: String(muleHits.length) },
    ],
    fundFlowNodes: visual.nodes,
    fundFlowEdges: visual.edges,
    fundFlowChain: visual.chain,
    evidenceFiles: buildEvidenceFiles(persons),
    recentActivity: [
      {
        text: `Case ${caseRecord.caseNumber} synced with ${transactions.length} transactions`,
        time: formatRelative(caseRecord.updatedAt || caseRecord.createdAt),
      },
      ...findings.slice(0, 3).map((finding) => ({
        text: `Rule hit: ${finding.title}`,
        time: finding.date,
      })),
    ],
  };
}

export function mapCaseToDashboardRow(record: CaseRecord) {
  return {
    id: record.id,
    name: record.title,
    num: record.caseNumber,
    investigator: "—",
    status: record.status === "CLOSED" ? "Closed" : record.status === "CRITICAL" ? "Review" : "Active",
    risk: Math.min(100, Math.max(10, (record.triggerCount || 0) * 3 + 25)),
    statements: 0,
    txns: String(record.triggerCount || 0),
    updated: formatRelative(record.updatedAt || record.createdAt),
  };
}
