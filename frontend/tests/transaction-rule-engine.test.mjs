import test from "node:test";
import assert from "node:assert/strict";
import {
  analyseTransactionVolume,
  buildFundFlowMetadata,
  detectBankStatementFormat,
  evaluateAdvancedRules,
  evaluateFundFlowAlerts,
  enrichTransactions,
  normaliseBankStatementRow,
} from "../src/interactions/transaction-rule-engine.js";

let sequence = 0;
const tx = (overrides = {}) => ({
  id: `tx-${++sequence}`,
  date: "2024-03-01T10:00:00+05:30",
  description: "UPI/DR/100001/TEST MERCHANT/test@okaxis",
  amount: 1_000,
  type: "debit",
  balance: 20_000,
  ...overrides,
});
const analyse = transactions => enrichTransactions(transactions);
const hasHit = (transaction, id) => transaction.rule_hits.some(hit => hit.id === id);

test("M1: documented transaction priority and parsed direction classify the payment rail", () => {
  const [upiCredit, upiDebit, nach, atm, cheque, international] = analyse([
    tx({ description: "UPI/CR/1/AMIT/amit@okaxis", type: "credit" }),
    tx({ description: "UPI/DR/2/ZOMATO/zomato@icici", type: "debit" }),
    tx({ description: "NACH/DR/00012/HDFC BANK/BAJAJ FINANCE EMI" }),
    tx({ description: "ATM-SBI BRANCH MG ROAD CASH WDL 10000" }),
    tx({ description: "CHQ RTN 001234 INSUFFICIENT FUNDS" }),
    tx({ description: "INTL PURCHASE AMAZON.COM USD 29.99" }),
  ]);
  assert.equal(upiCredit.txn_type, "UPI_CREDIT");
  assert.equal(upiDebit.txn_type, "UPI_DEBIT");
  assert.equal(nach.txn_type, "NACH_DEBIT");
  assert.equal(atm.txn_type, "ATM_WITHDRAWAL");
  assert.equal(cheque.txn_type, "CHEQUE_BOUNCE");
  // POS is priority 18; INTERNATIONAL is priority 19, so "purchase" wins.
  assert.equal(international.txn_type, "POS_PURCHASE");
});

test("M0: bank headers are detected and rows are normalised to the canonical schema", () => {
  assert.equal(detectBankStatementFormat(["Date", "Narration", "Withdrawal Amt", "Deposit Amt"]).bank, "HDFC");
  const row = normaliseBankStatementRow({ Date: "15/03/24", Narration: "UPI/DR/1/SHOP/shop@upi", "Withdrawal Amt": "1,250.50", "Deposit Amt": "", "Closing Balance": "9,000" }, { account_id: "HDFC_1234", bank: "HDFC" });
  assert.equal(row.account_id, "HDFC_1234");
  assert.equal(row.debit, 1250.5);
  assert.equal(row.credit, null);
  assert.equal(row.balance, 9000);
});

test("M1: UPI parser extracts VPA, mobile-VPA, UTR, and counterparty", () => {
  const [row] = analyse([tx({ type: "credit", description: "UPI/CR/402183921083/AMIT SHARMA/9876543210@paytm" })]);
  assert.equal(row.counterparty_vpa, "9876543210@paytm");
  assert.equal(row.counterparty_mobile, "9876543210");
  assert.equal(row.counterparty_name, "AMIT SHARMA");
  assert.equal(row.utr_no, "402183921083");
  assert.equal(row.upi_kind, "P2P");
});

test("M1: keyword tags retain every matching category", () => {
  const [row] = analyse([tx({ description: "NACH DR HDFC LOAN EMI INSURANCE PREMIUM GST PAYMENT" })]);
  assert.deepEqual(row.keyword_tags.sort(), ["ECS_MANDATE", "EMI", "GST_PAYMENT", "INSURANCE_PREMIUM", "LOAN_REPAYMENT"].sort());
});

test("M2: high-priority digital categories win over lower-priority merchant categories", () => {
  const [betting, crypto, foreign, food] = analyse([
    tx({ description: "UPI DR dream11 amazon" }),
    tx({ description: "UPI DR WAZIRX bitcoin" }),
    tx({ description: "SWIFT transfer via wise" }),
    tx({ description: "UPI DR ZOMATO order" }),
  ]);
  assert.equal(betting.digital_category, "BETTING_GAMBLING");
  assert.equal(betting.digital_risk_level, "CRITICAL");
  assert.equal(crypto.digital_category, "CRYPTO_BLOCKCHAIN");
  assert.equal(foreign.digital_category, "FOREX_INTERNATIONAL_TRANSFER");
  assert.equal(food.digital_category, "FOOD_DELIVERY_DINING");
});

test("M4: exchange/VPA matching and stablecoin, NFT, and DeFi evidence are retained", () => {
  const [exchange, stable, nft, defi] = analyse([
    tx({ description: "UPI/DR/1/WAZIRX/wazirx@icici", amount: 10_000 }),
    tx({ description: "UPI DR USDT tether purchase" }),
    tx({ description: "CARD NFT OPENSEA mint gas fee" }),
    tx({ description: "UPI DR DEFI staking reward liquidity pool" }),
  ]);
  assert.equal(exchange.crypto_entity, "WazirX");
  assert.equal(exchange.crypto_direction, "OUT_TO_EXCHANGE");
  assert.ok(hasHit(exchange, "CR-01") && hasHit(exchange, "CR-02"));
  assert.ok(hasHit(stable, "CR-12"));
  assert.ok(hasHit(nft, "CR-13"));
  assert.ok(hasHit(defi, "CR-14"));
});

test("M3: drain and crypto-exit rules score an inbound credit", () => {
  const rows = analyse([
    tx({ id: "credit", type: "credit", amount: 60_000, balance: 60_000, description: "UPI/CR/1/AMIT/amit@okaxis", date: "2024-03-01T10:00:00+05:30" }),
    tx({ id: "exchange", type: "debit", amount: 50_000, balance: 10_000, description: "UPI/DR/2/WAZIRX/wazirx@icici", date: "2024-03-01T11:00:00+05:30" }),
  ]);
  const credit = rows.find(row => row.id === "credit");
  assert.ok(credit.mule_rules_hit.includes("MU-02"));
  assert.ok(credit.mule_rules_hit.includes("MU-19"));
  assert.ok(credit.mule_score >= 65);
});

test("M3: structured credits and small UPI aggregation are detected", () => {
  const start = Date.parse("2024-03-01T10:00:00+05:30");
  const rows = analyse(Array.from({ length: 10 }, (_, index) => tx({
    type: "credit", amount: 1_500, description: `UPI/CR/${index}/SENDER ${index}/sender${index}@okaxis`, date: new Date(start + index * 15 * 60_000).toISOString(),
  })).concat([
    tx({ type: "credit", amount: 45_000, description: "IMPS CR PERSON A", date: new Date(start).toISOString() }),
    tx({ type: "credit", amount: 45_000, description: "IMPS CR PERSON B", date: new Date(start + 30 * 60_000).toISOString() }),
    tx({ type: "credit", amount: 45_000, description: "IMPS CR PERSON C", date: new Date(start + 60 * 60_000).toISOString() }),
  ]));
  assert.ok(rows.some(row => row.mule_rules_hit.includes("MU-16")));
  assert.ok(rows.some(row => row.mule_rules_hit.includes("MU-07")));
});

test("M1 volume analytics returns reproducible findings and KPIs", () => {
  const rows = analyse(Array.from({ length: 21 }, (_, index) => tx({ id: `day-${index}`, date: "2024-03-02T10:00:00+05:30", amount: 1_000 })));
  const report = analyseTransactionVolume(rows);
  assert.equal(report.metrics.total_transactions, 21);
  assert.ok(report.findings.some(finding => finding.id === "TXN-V03"));
  assert.equal(report.metrics.total_debits, 21_000);
});

test("M5 fund-flow graph has directed aggregate edges, ranks, and hub alerts", () => {
  const rows = analyse([
    tx({ description: "UPI/DR/1/ALPHA/alpha@okaxis", amount: 600_000 }),
    tx({ description: "UPI/DR/2/ALPHA/alpha@okaxis", amount: 500_001 }),
    tx({ type: "credit", description: "UPI/CR/3/BETA/beta@okaxis", amount: 5_000 }),
  ]);
  const graph = buildFundFlowMetadata(rows, { accountId: "TARGET" });
  assert.ok(graph.edges.some(edge => edge.edge_id === "TARGET→alpha" && edge.amount === 1_100_001));
  assert.ok(graph.alerts.some(alert => alert.id === "FF-A01"));
  assert.equal(graph.top_beneficiaries[0].receiver, "alpha");
});

test("remaining time, linked-KYC, linked-crypto, and cycle rules require and use explicit evidence", () => {
  const rows = analyse([
    tx({ id: "night", time: "02:30", description: "UPI/DR/1/PEER/peer@okaxis", amount: 10_000 }),
    tx({ id: "p2p", description: "UPI/DR/2/PROXY/proxy@okaxis", amount: 10_000 }),
  ]);
  const findings = evaluateAdvancedRules(rows, {
    linkedTransactions: [{ description: "UPI DR WAZIRX", counterparty: "PROXY" }],
    kycAccounts: [
      { suspicious: true, mobile: "9876543210" }, { suspicious: true, mobile: "9876543210" }, { suspicious: true, mobile: "9876543210" },
    ],
    flowEdges: [{ sender: "A", receiver: "B" }, { sender: "B", receiver: "C" }, { sender: "C", receiver: "A" }],
  });
  const ids = findings.map(finding => finding.id);
  assert.ok(ids.includes("TXN-V04"));
  assert.ok(ids.includes("CR-08"));
  assert.ok(ids.includes("MU-11"));
  assert.ok(ids.includes("FF-A02"));
});

test("remaining fund-flow alerts use linked multi-hop graph evidence", () => {
  const graph = {
    nodes: [
      { node_id: "TARGET", is_verified: true }, { node_id: "BRIDGE" }, { node_id: "CRYPTO", crypto_flag: true },
      { node_id: "G1", level: 1, txn_count: 1 }, { node_id: "G2", level: 1, txn_count: 1 }, { node_id: "G3", level: 1, txn_count: 1 },
    ],
    edges: [
      { edge_id: "TARGET→BRIDGE", sender: "TARGET", receiver: "BRIDGE", channels: ["UPI"] },
      { edge_id: "BRIDGE→CRYPTO", sender: "BRIDGE", receiver: "CRYPTO", channels: ["SWIFT"] },
      { edge_id: "BRIDGE→TARGET", sender: "BRIDGE", receiver: "TARGET", channels: ["UPI"] },
    ],
  };
  const alerts = evaluateFundFlowAlerts(graph, {
    targetAccountId: "TARGET",
    components: [{ node_ids: ["G1", "G2", "G3"], total_amount: 150_000 }],
    flowEvents: [
      { sender: "TARGET", receiver: "BRIDGE", date: "2024-03-01T10:00:00Z" },
      ...Array.from({ length: 5 }, (_, i) => ({ sender: "BRIDGE", receiver: `DEST-${i}`, date: "2024-03-01T11:00:00Z" })),
    ],
  });
  const ids = alerts.map(alert => alert.id);
  ["FF-A04", "FF-A05", "FF-A06", "FF-A07", "FF-A08", "FF-A09"].forEach(id => assert.ok(ids.includes(id), id));
});
