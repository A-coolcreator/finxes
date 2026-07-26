// Uses Node.js built-in sqlite (Node 22+) — no native compilation required
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Support Railway persistent volume via DATABASE_PATH env var, fallback to local data/
const dataDir = process.env.DATABASE_PATH
  ? path.dirname(process.env.DATABASE_PATH)
  : path.join(__dirname, "data");
const dbFile = process.env.DATABASE_PATH || path.join(dataDir, "finexis.sqlite");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new DatabaseSync(dbFile);

// Enable WAL mode and foreign keys
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

// --- Schema ---
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    tenant TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS cases (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    caseNumber TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    subtitle TEXT,
    status TEXT NOT NULL,
    triggerCount INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    archivedAt TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS persons (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    caseId TEXT NOT NULL,
    name TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    FOREIGN KEY(userId) REFERENCES users(id),
    FOREIGN KEY(caseId) REFERENCES cases(id)
  );

  CREATE TABLE IF NOT EXISTS metadata (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    personId TEXT NOT NULL,
    documentType TEXT,
    bankName TEXT,
    platform TEXT,
    accountHolderName TEXT,
    accountNumber TEXT,
    ifscCode TEXT,
    startDate TEXT,
    endDate TEXT,
    rawMetadataJson TEXT,
    createdAt TEXT NOT NULL,
    FOREIGN KEY(userId) REFERENCES users(id),
    FOREIGN KEY(personId) REFERENCES persons(id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    personId TEXT NOT NULL,
    date TEXT,
    description TEXT,
    chqNo TEXT,
    amount REAL,
    type TEXT,
    balance REAL,
    category TEXT,
    flow TEXT,
    rawTransactionJson TEXT,
    createdAt TEXT NOT NULL,
    flagged INTEGER DEFAULT 0,
    FOREIGN KEY(userId) REFERENCES users(id),
    FOREIGN KEY(personId) REFERENCES persons(id)
  );
`);

// --- Migrations ---
// Normalize existing person names to uppercase
try {
  const persons = db.prepare("SELECT id, name FROM persons").all();
  const updateName = db.prepare("UPDATE persons SET name = ? WHERE id = ?");
  db.exec("BEGIN");
  try {
    for (const p of persons) {
      const upper = String(p.name || "").trim().toUpperCase();
      if (p.name !== upper) updateName.run(upper, p.id);
    }
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
} catch (e) {
  console.error("Migration error:", e);
}

// --- Seeding ---
// Check if users table has data
const userCount = db.prepare("SELECT COUNT(*) AS count FROM users").get().count;

if (userCount === 0) {
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password, tenant, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();
  // Default password is "password123" (bcrypt would be used in production)
  const seedUsers = [
    ["USER-001", "admin@finexis.io", "password123", "FinExis Internal", now, now],
    ["USER-002", "arjun@ashokapolice.gov.in", "password123", "Ashoka State Police", now, now],
    ["USER-003", "divya@northbridge-bank.com", "password123", "Northbridge Bank", now, now],
  ];

  db.exec("BEGIN");
  try {
    for (const row of seedUsers) insertUser.run(...row);
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}

// Seed cases if no userId column data exists (migration for existing databases)
try {
  const caseWithoutUser = db.prepare("SELECT id FROM cases WHERE userId IS NULL LIMIT 1").get();
  if (caseWithoutUser) {
    db.exec("BEGIN");
    try {
      db.prepare("UPDATE cases SET userId = ? WHERE userId IS NULL").run("USER-001");
      db.exec("COMMIT");
    } catch (e) {
      db.exec("ROLLBACK");
    }
  }
} catch (e) {
  // Column might not exist yet, ignore
}

const seedCount = db.prepare("SELECT COUNT(*) AS count FROM cases").get().count;

if (seedCount === 0) {
  const insertCase = db.prepare(`
    INSERT INTO cases (id, userId, caseNumber, title, subtitle, status, triggerCount, createdAt, updatedAt, archivedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();
  const archivedNow = new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString();

  const seedCases = [
    ["CASE-001", "USER-001", "FX-2024-001", "Alpha Quantum Nexus", "Cross-border shadow entity cluster", "CRITICAL", 8, now, now, null],
    ["CASE-002", "USER-001", "FX-2024-004", "Project Midnight Drift", "Velocity anomalies in offshore nodes", "ACTIVE", 3, now, now, null],
    ["CASE-003", "USER-001", "FX-2023-992", "Lumina Group Audit", "Routine high-value asset verification", "ACTIVE", 0, now, now, null],
    ["CASE-004", "USER-002", "FX-2023-871", "Vector Holdings Liquid", "Confirmed compliance remediation", "CLOSED", 0, now, now, null],
    ["CASE-005", "USER-002", "FX-2024-012", "Epsilon Wire Breach", "Suspicious SWIFT traffic at APAC node", "CRITICAL", 14, now, now, null],
    ["CASE-101", "USER-001", "FX-2022-044", "Northstar Suspense Review", "Legacy investigations moved to archive", "ARCHIVED", 0, archivedNow, archivedNow, archivedNow],
    ["CASE-102", "USER-003", "FX-2021-880", "Blue Ridge Dormant Network", "Closed and archived after disposition", "ARCHIVED", 0, archivedNow, archivedNow, archivedNow],
  ];

  db.exec("BEGIN");
  try {
    for (const row of seedCases) insertCase.run(...row);
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}

// --- User Helper Functions ---
function rowToUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    tenant: row.tenant,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// --- User Exported Functions ---
export function getUserById(id) {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  return rowToUser(row);
}

export function getUserByEmail(email) {
  const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  return rowToUser(row);
}

export function verifyUser(email, password) {
  const row = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password);
  return rowToUser(row);
}

export function createUser({ email, password, tenant }) {
  const now = new Date().toISOString();
  const userId = `USER-${Date.now()}`;
  db.prepare(`
    INSERT INTO users (id, email, password, tenant, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, email, password, tenant, now, now);
  return getUserById(userId);
}

export function listUsers() {
  const rows = db.prepare("SELECT * FROM users ORDER BY createdAt DESC").all();
  return rows.map(rowToUser);
}

// --- Helpers ---
function rowToCase(row) {
  if (!row) return null;
  return {
    id: row.id,
    caseNumber: row.caseNumber,
    title: row.title,
    subtitle: row.subtitle,
    status: row.status,
    triggerCount: row.triggerCount,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    archivedAt: row.archivedAt,
  };
}

// --- Exported Functions ---
export function listCases(status) {
  const rows = status
    ? db.prepare("SELECT * FROM cases WHERE status = ? ORDER BY updatedAt DESC").all(status.toUpperCase())
    : db.prepare("SELECT * FROM cases ORDER BY updatedAt DESC").all();
  return rows.map(rowToCase);
}

export function getCaseByIdentifier(identifier) {
  return rowToCase(
    db.prepare("SELECT * FROM cases WHERE id = ? OR caseNumber = ? LIMIT 1").get(identifier, identifier)
  );
}

export function createCaseRecord(userId, payload) {
  const now = new Date().toISOString();
  const caseId = `CASE-${Date.now()}`;
  const status = String(payload.status || "ACTIVE").toUpperCase();

  const record = {
    id: caseId,
    userId,
    caseNumber: payload.caseNumber,
    title: payload.title,
    subtitle: payload.subtitle || null,
    status,
    triggerCount: 0,
    createdAt: now,
    updatedAt: now,
    archivedAt: status === "ARCHIVED" ? now : null,
  };

  db.prepare(`
    INSERT INTO cases (id, userId, caseNumber, title, subtitle, status, triggerCount, createdAt, updatedAt, archivedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(record.id, record.userId, record.caseNumber, record.title, record.subtitle, record.status, record.triggerCount, record.createdAt, record.updatedAt, record.archivedAt);

  return record;
}

export function updateCaseRecord(identifier, payload) {
  const existing = getCaseByIdentifier(identifier);
  if (!existing) return null;

  const updated = {
    ...existing,
    caseNumber: payload.caseNumber ?? existing.caseNumber,
    title: payload.title ?? existing.title,
    subtitle: payload.subtitle ?? existing.subtitle,
    status: payload.status ? String(payload.status).toUpperCase() : existing.status,
    updatedAt: new Date().toISOString(),
  };

  if (updated.status === "ARCHIVED") {
    updated.archivedAt = updated.updatedAt;
  }

  db.prepare(`
    UPDATE cases
    SET caseNumber = ?, title = ?, subtitle = ?, status = ?, updatedAt = ?, archivedAt = ?
    WHERE id = ?
  `).run(updated.caseNumber, updated.title, updated.subtitle, updated.status, updated.updatedAt, updated.archivedAt, updated.id);

  return updated;
}

export function archiveCaseRecord(identifier) {
  const existing = getCaseByIdentifier(identifier);
  if (!existing) return null;

  const updatedAt = new Date().toISOString();
  db.prepare(`UPDATE cases SET status = 'ARCHIVED', updatedAt = ?, archivedAt = ? WHERE id = ?`)
    .run(updatedAt, updatedAt, existing.id);

  return getCaseByIdentifier(existing.id);
}

export function unarchiveCaseRecord(identifier) {
  const existing = getCaseByIdentifier(identifier);
  if (!existing) return null;

  const updatedAt = new Date().toISOString();
  db.prepare(`UPDATE cases SET status = 'ACTIVE', updatedAt = ?, archivedAt = NULL WHERE id = ?`)
    .run(updatedAt, existing.id);

  return getCaseByIdentifier(existing.id);
}

export function deleteCaseRecord(caseId) {
  db.exec("BEGIN");
  try {
    db.prepare(`DELETE FROM transactions WHERE personId IN (SELECT id FROM persons WHERE caseId = ?)`).run(caseId);
    db.prepare(`DELETE FROM metadata WHERE personId IN (SELECT id FROM persons WHERE caseId = ?)`).run(caseId);
    db.prepare(`DELETE FROM persons WHERE caseId = ?`).run(caseId);
    db.prepare(`DELETE FROM cases WHERE id = ?`).run(caseId);
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}

export function createPersonRecord(userId, caseId, name) {
  const normalizedName = String(name || "").trim().toUpperCase();
  const personId = `PERSON-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  db.prepare(`INSERT INTO persons (id, userId, caseId, name, createdAt) VALUES (?, ?, ?, ?, ?)`)
    .run(personId, userId, caseId, normalizedName, now);
  return personId;
}

export function saveMetadataRecord(userId, personId, meta) {
  const metaId = `META-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  const docType = meta.document_type || "UNKNOWN";
  const bankName = meta.institution?.bank_name || "UNKNOWN";
  const platform = meta.institution?.platform || "UNKNOWN";
  const holderName = String(meta.account_holder?.name || "UNKNOWN").trim().toUpperCase();
  const accountNo = meta.account_profile?.account_number || "UNKNOWN";
  const ifsc = meta.routing_identifiers?.ifsc_code || "UNKNOWN";
  const start = meta.statement_details?.start_date || "UNKNOWN";
  const end = meta.statement_details?.end_date || "UNKNOWN";
  const rawJson = JSON.stringify(meta);

  db.prepare(`
    INSERT INTO metadata (id, userId, personId, documentType, bankName, platform, accountHolderName, accountNumber, ifscCode, startDate, endDate, rawMetadataJson, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(metaId, userId, personId, docType, bankName, platform, holderName, accountNo, ifsc, start, end, rawJson, now);
}

function normalizeTransaction(tx) {
  const keys = Object.keys(tx);
  const findKey = (patterns) => {
    const key = keys.find(k => patterns.some(p => k.toLowerCase().includes(p.toLowerCase())));
    return key ? tx[key] : null;
  };

  const dateVal = findKey(["transaction date", "txn date", "value date", "post date", "booking date", "date"]) || "";
  const descVal = findKey(["transaction remarks", "remarks", "transaction narration", "transaction description", "particulars", "narration", "description", "activity", "details"]) || "";
  const chqVal = findKey(["cheque number", "cheque no", "cheque / ref no", "chq no", "cheque/ref no.", "reference number", "ref no", "txn id", "wallet txn id", "cheque"]) || "";

  let amtVal = 0.0;
  let typeVal = "debit";

  const debitKey = keys.find(k => ["withdrawal amount", "withdrawal amt", "withdrawals", "debit", "withdrawal"].some(p => k.toLowerCase().includes(p)));
  const creditKey = keys.find(k => ["deposit amount", "deposit amt", "deposits", "credit", "deposit"].some(p => k.toLowerCase().includes(p)));

  if (debitKey || creditKey) {
    const debValue = debitKey ? parseFloat(String(tx[debitKey]).replace(/,/g, "")) : 0.0;
    const credValue = creditKey ? parseFloat(String(tx[creditKey]).replace(/,/g, "")) : 0.0;

    if (!isNaN(credValue) && credValue > 0) {
      amtVal = credValue;
      typeVal = "credit";
    } else if (!isNaN(debValue) && debValue > 0) {
      amtVal = debValue;
      typeVal = "debit";
    }
  } else {
    const amountKey = keys.find(k => ["amount", "txn amt", "transaction amount", "value"].some(p => k.toLowerCase().includes(p)));
    if (amountKey) {
      let rawAmt = String(tx[amountKey]).replace(/,/g, "");
      const isNegative = rawAmt.startsWith("-") || rawAmt.includes("Dr");
      amtVal = Math.abs(parseFloat(rawAmt)) || 0.0;

      const typeKey = keys.find(k => ["type", "cr/dr", "debit/credit", "transaction type"].some(p => k.toLowerCase().includes(p)));
      if (typeKey) {
        const rawType = String(tx[typeKey]).toLowerCase();
        typeVal = (rawType.includes("cr") || rawType.includes("credit") || rawType.includes("dep")) ? "credit" : "debit";
      } else {
        typeVal = isNegative ? "debit" : "credit";
      }
    }
  }

  const balRaw = findKey(["closing balance", "available balance", "balance amount", "balance"]) || "0.0";
  const balVal = parseFloat(String(balRaw).replace(/,/g, "")) || 0.0;

  let catVal = "UPI";
  const descLower = String(descVal).toLowerCase();
  if (descLower.includes("upi") || descLower.includes("vpa") || descLower.includes("gpay") || descLower.includes("phonepe") || descLower.includes("paytm")) {
    catVal = "UPI";
  } else if (descLower.includes("aeps") || descLower.includes("aadhaar")) {
    catVal = "AEPS";
  } else if (descLower.includes("enach") || descLower.includes("nach") || descLower.includes("mandate")) {
    catVal = "ENACH";
  } else if (descLower.includes("cash") || descLower.includes("self") || descLower.includes("wdl")) {
    catVal = "CASH";
  } else if (descLower.includes("card") || descLower.includes("pos") || descLower.includes("visa") || descLower.includes("mastercard") || descLower.includes("rupay") || descLower.includes("online")) {
    catVal = "CARD";
  } else if (descLower.includes("imps") || descLower.includes("neft") || descLower.includes("rtgs") || descLower.includes("transfer")) {
    catVal = "IMPS";
  } else if (descLower.includes("crypto") || descLower.includes("binance") || descLower.includes("wazirx")) {
    catVal = "CRYPTO";
  }

  let flowVal = typeVal === "credit"
    ? (catVal === "CASH" ? "cash deposit" : "inflow")
    : (catVal === "CASH" ? "cash withdrawal" : "outflow");

  return { date: dateVal, description: descVal, chqNo: chqVal, amount: amtVal, type: typeVal, balance: balVal, category: catVal, flow: flowVal };
}

export function saveTransactionsBatch(userId, personId, transactions) {
  console.log(`[DB-LOG] saveTransactionsBatch called for User ID="${userId}", Person ID="${personId}" with ${transactions ? transactions.length : 0} items.`);
  if (!transactions || transactions.length === 0) return;

  const now = new Date().toISOString();
  const insert = db.prepare(`
    INSERT INTO transactions (id, userId, personId, date, description, chqNo, amount, type, balance, category, flow, rawTransactionJson, createdAt, flagged)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  db.exec("BEGIN");
  let count = 0;
  try {
    for (const tx of transactions) {
      const txId = `TX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const norm = normalizeTransaction(tx);
      const isFlagged = norm.amount > 50000 ? 1 : 0;
      insert.run(txId, userId, personId, norm.date, norm.description, norm.chqNo, norm.amount, norm.type, norm.balance, norm.category, norm.flow, JSON.stringify(tx), now, isFlagged);
      count++;
    }
    db.exec("COMMIT");
    console.log(`[DB-LOG] Successfully committed ${count} transactions into SQLite DB for User ID="${userId}", Person ID="${personId}".`);
  } catch (e) {
    db.exec("ROLLBACK");
    console.error(`[DB-LOG] ERROR saving transactions batch for User ID="${userId}", Person ID="${personId}":`, e);
    throw e;
  }
}

export function updateCaseTriggerCount(caseId, triggerCount) {
  console.log(`[DB-LOG] Updating case "${caseId}" triggerCount to ${triggerCount}`);
  db.prepare(`UPDATE cases SET triggerCount = ?, updatedAt = ? WHERE id = ?`)
    .run(triggerCount, new Date().toISOString(), caseId);
}

export function getPersonByName(userId, caseId, name) {
  const normalizedName = String(name || "").trim().toUpperCase();
  return db.prepare("SELECT * FROM persons WHERE userId = ? AND caseId = ? AND name = ? LIMIT 1")
    .get(userId, caseId, normalizedName) || null;
}

export function getTransactionsForCase(caseId) {
  console.log(`[DB-LOG] Querying transactions for caseId="${caseId}"`);
  const rows = db.prepare(`
    SELECT t.*, p.name as personName,
           (SELECT ifscCode FROM metadata WHERE personId = p.id LIMIT 1) as metaIfscCode
    FROM transactions t
    JOIN persons p ON t.personId = p.id
    WHERE p.caseId = ?
  `).all(caseId);
  console.log(`[DB-LOG] getTransactionsForCase returned ${rows.length} transactions.`);
  return rows;
}

export function getPersonsForCase(caseId) {
  return db.prepare("SELECT * FROM persons WHERE caseId = ?").all(caseId);
}

export function deletePersonRecord(personId) {
  db.exec("BEGIN");
  try {
    db.prepare("DELETE FROM transactions WHERE personId = ?").run(personId);
    db.prepare("DELETE FROM metadata WHERE personId = ?").run(personId);
    db.prepare("DELETE FROM persons WHERE id = ?").run(personId);
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}

export function getMetadataForPerson(personId) {
  return db.prepare("SELECT * FROM metadata WHERE personId = ? LIMIT 1").get(personId) || null;
}

// Persist flagged state changes in database
export function toggleTransactionFlag(txId) {
  const tx = db.prepare("SELECT flagged FROM transactions WHERE id = ?").get(txId);
  if (!tx) return null;
  const newFlagged = tx.flagged === 1 ? 0 : 1;
  db.prepare("UPDATE transactions SET flagged = ? WHERE id = ?").run(newFlagged, txId);
  return { id: txId, flagged: newFlagged };
}

// --- Admin Schema (Users & Tenants) ---
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    segment TEXT NOT NULL,
    plan TEXT NOT NULL DEFAULT 'Trial',
    seats_used INTEGER NOT NULL DEFAULT 0,
    seats_limit INTEGER NOT NULL DEFAULT 10,
    status TEXT NOT NULL DEFAULT 'Trial',
    region TEXT NOT NULL DEFAULT 'ap-south-1',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    tenant_id TEXT,
    role TEXT NOT NULL DEFAULT 'Viewer',
    status TEXT NOT NULL DEFAULT 'Invited',
    last_active_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(tenant_id) REFERENCES admin_tenants(id)
  );
`);

// --- Admin Migrations ---
try {
  // Add indexes for better query performance
  db.exec("CREATE INDEX IF NOT EXISTS idx_admin_users_tenant_id ON admin_users(tenant_id)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_admin_users_status ON admin_users(status)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_admin_tenants_status ON admin_tenants(status)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_admin_tenants_plan ON admin_tenants(plan)");
} catch (e) {
  // Indexes may already exist
}

// --- Admin Helpers ---
function rowToAdminUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    tenantId: row.tenant_id,
    tenant: row.tenant_name || "",
    role: row.role,
    status: row.status,
    lastActiveAt: row.last_active_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToAdminTenant(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    segment: row.segment,
    plan: row.plan,
    seatsUsed: row.seats_used,
    seatsLimit: row.seats_limit,
    status: row.status,
    region: row.region,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// --- Admin Seeding ---
const tenantCount = db.prepare("SELECT COUNT(*) AS count FROM admin_tenants").get().count;

if (tenantCount === 0) {
  const insertTenant = db.prepare(`
    INSERT INTO admin_tenants (id, name, segment, plan, seats_used, seats_limit, status, region, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertUser = db.prepare(`
    INSERT INTO admin_users (id, name, email, tenant_id, role, status, last_active_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();

  const seedTenants = [
    ["TENANT-001", "FinExis (Internal)", "Internal", "Enterprise", 1, 100, "Active", "ap-south-1", now, now],
    ["TENANT-002", "Ashoka State Police", "Law enforcement", "Enterprise", 38, 40, "Active", "ap-south-1", now, now],
    ["TENANT-003", "Northbridge Bank", "Banking & compliance", "Enterprise", 112, 150, "Active", "ap-south-1", now, now],
    ["TENANT-004", "Vertex Fraud Unit", "Fraud investigations", "Team", 18, 20, "Active", "ap-south-1", now, now],
    ["TENANT-005", "RBI Liaison Office", "Regulatory", "Enterprise", 9, 25, "Suspended", "ap-south-1", now, now],
    ["TENANT-006", "Meridian Cyber Cell", "Law enforcement", "Team", 24, 25, "Active", "ap-south-1", now, now],
    ["TENANT-007", "Suraksha Cyber Cell", "Law enforcement", "Trial", 6, 10, "Trial", "ap-south-1", now, now],
  ];

  const seedUsers = [
    ["USER-001", "Rhea Sharma", "rhea.sharma@finexis.io", "TENANT-001", "Super admin", "Active", now, now, now],
    ["USER-002", "Arjun Nair", "arjun.nair@ashokapolice.gov.in", "TENANT-002", "Tenant admin", "Active", now, now, now],
    ["USER-003", "Divya Menon", "d.menon@northbridge-bank.com", "TENANT-003", "Investigator", "Active", now, now, now],
    ["USER-004", "Kabir Malhotra", "kabir.m@vertexfraud.com", "TENANT-004", "Analyst", "Invited", null, now, now],
    ["USER-005", "Sanya Iyer", "s.iyer@rbi-liaison.gov.in", "TENANT-005", "Viewer", "Suspended", now, now, now],
    ["USER-006", "Farhan Qureshi", "farhan.q@meridiancyber.in", "TENANT-006", "Investigator", "Active", now, now, now],
    ["USER-007", "Priya Deshmukh", "priya.d@surakshacyber.gov.in", "TENANT-007", "Tenant admin", "Active", now, now, now],
  ];

  db.exec("BEGIN");
  try {
    for (const row of seedTenants) insertTenant.run(...row);
    for (const row of seedUsers) insertUser.run(...row);
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}

// --- Admin Exported Functions ---
export function listAdminUsers({ status, role, tenantId, search, limit = 50, offset = 0 } = {}) {
  let sql = `
    SELECT u.*, t.name as tenant_name
    FROM admin_users u
    LEFT JOIN admin_tenants t ON u.tenant_id = t.id
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    sql += " AND u.status = ?";
    params.push(status.toUpperCase());
  }
  if (role) {
    sql += " AND u.role = ?";
    params.push(role);
  }
  if (tenantId) {
    sql += " AND u.tenant_id = ?";
    params.push(tenantId);
  }
  if (search) {
    sql += " AND (u.name LIKE ? OR u.email LIKE ? OR t.name LIKE ?)";
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  sql += " ORDER BY u.created_at DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  const rows = db.prepare(sql).all(...params);
  const total = db.prepare("SELECT COUNT(*) as count FROM admin_users").get().count;

  return { data: rows.map(rowToAdminUser), total, limit, offset };
}

export function getAdminUserById(id) {
  const row = db.prepare(`
    SELECT u.*, t.name as tenant_name
    FROM admin_users u
    LEFT JOIN admin_tenants t ON u.tenant_id = t.id
    WHERE u.id = ?
  `).get(id);
  return rowToAdminUser(row);
}

export function createAdminUser({ name, email, tenantId, role = "Viewer", status = "Invited" }) {
  const now = new Date().toISOString();
  const userId = `USER-${Date.now()}`;
  db.prepare(`
    INSERT INTO admin_users (id, name, email, tenant_id, role, status, last_active_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(userId, name, email, tenantId, role, status, null, now, now);
  return getAdminUserById(userId);
}

export function updateAdminUser(id, { name, email, tenantId, role, status }) {
  const existing = getAdminUserById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE admin_users
    SET name = COALESCE(?, name),
        email = COALESCE(?, email),
        tenant_id = COALESCE(?, tenant_id),
        role = COALESCE(?, role),
        status = COALESCE(?, status),
        updated_at = ?
    WHERE id = ?
  `).run(name, email, tenantId, role, status, now, id);
  return getAdminUserById(id);
}

export function deleteAdminUser(id) {
  const result = db.prepare("DELETE FROM admin_users WHERE id = ?").run(id);
  return result.changes > 0;
}

export function listAdminTenants({ status, plan, search, limit = 50, offset = 0 } = {}) {
  let sql = "SELECT * FROM admin_tenants WHERE 1=1";
  const params = [];

  if (status) {
    sql += " AND status = ?";
    params.push(status);
  }
  if (plan) {
    sql += " AND plan = ?";
    params.push(plan);
  }
  if (search) {
    sql += " AND (name LIKE ? OR segment LIKE ?)";
    const term = `%${search}%`;
    params.push(term, term);
  }

  sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  const rows = db.prepare(sql).all(...params);
  const total = db.prepare("SELECT COUNT(*) as count FROM admin_tenants").get().count;

  return { data: rows.map(rowToAdminTenant), total, limit, offset };
}

export function getAdminTenantById(id) {
  const row = db.prepare("SELECT * FROM admin_tenants WHERE id = ?").get(id);
  return rowToAdminTenant(row);
}

export function createAdminTenant({ name, segment, plan = "Trial", seatsLimit = 10, status = "Trial", region = "ap-south-1" }) {
  const now = new Date().toISOString();
  const tenantId = `TENANT-${Date.now()}`;
  db.prepare(`
    INSERT INTO admin_tenants (id, name, segment, plan, seats_used, seats_limit, status, region, created_at, updated_at)
    VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?, ?)
  `).run(tenantId, name, segment, plan, seatsLimit, status, region, now, now);
  return getAdminTenantById(tenantId);
}

export function updateAdminTenant(id, { name, segment, plan, seatsLimit, status, region }) {
  const existing = getAdminTenantById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE admin_tenants
    SET name = COALESCE(?, name),
        segment = COALESCE(?, segment),
        plan = COALESCE(?, plan),
        seats_limit = COALESCE(?, seats_limit),
        status = COALESCE(?, status),
        region = COALESCE(?, region),
        updated_at = ?
    WHERE id = ?
  `).run(name, segment, plan, seatsLimit, status, region, now, id);

  // Auto-suspend users when tenant is suspended
  if (status && status.toUpperCase() === "SUSPENDED") {
    db.prepare("UPDATE admin_users SET status = 'SUSPENDED', updated_at = ? WHERE tenant_id = ?").run(now, id);
  }

  return getAdminTenantById(id);
}

// --- Dashboard Tables ---
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_activity (
    id TEXT PRIMARY KEY,
    who TEXT NOT NULL,
    what TEXT NOT NULL,
    metadata TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admin_requests (
    id TEXT PRIMARY KEY,
    org TEXT NOT NULL,
    type TEXT NOT NULL,
    meta TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

// --- Dashboard Stats Functions ---
export function getDashboardStats() {
  const activeTenants = db.prepare("SELECT COUNT(*) as count FROM admin_tenants WHERE status = 'Active'").get().count;
  const totalUsers = db.prepare("SELECT COUNT(*) as count FROM admin_users").get().count;
  const casesCount = db.prepare("SELECT COUNT(*) as count FROM cases WHERE status NOT IN ('CLOSED', 'ARCHIVED')").get().count;
  const flaggedTransactions = db.prepare("SELECT COUNT(*) as count FROM transactions WHERE flagged = 1").get().count;

  return {
    activeTenants,
    totalUsers,
    casesCount,
    flaggedTransactions,
  };
}

export function listAdminActivity(limit = 10) {
  const rows = db.prepare("SELECT * FROM admin_activity ORDER BY created_at DESC LIMIT ?").all(limit);
  return rows.map(row => ({
    id: row.id,
    who: row.who,
    what: row.what,
    metadata: row.metadata,
    time: getRelativeTime(row.created_at),
  }));
}

export function listAdminRequests(status = "pending") {
  const rows = db.prepare("SELECT * FROM admin_requests WHERE status = ? ORDER BY created_at DESC").all(status);
  return rows.map(row => ({
    id: row.id,
    org: row.org,
    type: row.type,
    meta: row.meta,
    status: row.status,
    createdAt: row.created_at,
  }));
}

function getRelativeTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} days ago`;
  return d.toLocaleDateString();
}

// --- Seed Dashboard Data ---
const activityCount = db.prepare("SELECT COUNT(*) as count FROM admin_activity").get().count;
if (activityCount === 0) {
  const insertActivity = db.prepare("INSERT INTO admin_activity (id, who, what, metadata, created_at) VALUES (?, ?, ?, ?, ?)");
  const now = new Date().toISOString();
  const activities = [
    ["ACT-001", "Ashoka State Police", "created case CS-4471 · Mule network — Sector 12", null, now],
    ["ACT-002", "Northbridge Bank Compliance", "uploaded 3 NCRP complaint exports", null, new Date(Date.now() - 22 * 60000).toISOString()],
    ["ACT-003", "Vertex Fraud Unit", "invited 2 new investigators", null, new Date(Date.now() - 48 * 60000).toISOString()],
    ["ACT-004", "System", "flagged 128 transactions above ₹2L threshold", null, new Date(Date.now() - 60 * 60000).toISOString()],
    ["ACT-005", "Meridian Cyber Cell", "exported fund-flow map for CS-4402", null, new Date(Date.now() - 120 * 60000).toISOString()],
  ];
  for (const row of activities) insertActivity.run(...row);
}

const requestCount = db.prepare("SELECT COUNT(*) as count FROM admin_requests").get().count;
if (requestCount === 0) {
  const insertRequest = db.prepare("INSERT INTO admin_requests (id, org, type, meta, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)");
  const now = new Date().toISOString();
  const requests = [
    ["REQ-001", "Kavach Financial Crimes Unit", "New tenant request", "Enterprise · 40 seats", "pending", now, now],
    ["REQ-002", "delta.iyer@rbi-liaison.gov.in", "Access request", "Northbridge Bank tenant", "pending", now, now],
    ["REQ-003", "Suraksha Cyber Cell", "Plan upgrade", "Team → Enterprise", "pending", now, now],
  ];
  for (const row of requests) insertRequest.run(...row);
}

// Schema migration to add flagged column to transactions if missing
try {
  db.exec("ALTER TABLE transactions ADD COLUMN flagged INTEGER DEFAULT 0");
  // One-time update to flag existing high value transactions
  db.exec("UPDATE transactions SET flagged = 1 WHERE amount > 50000");
} catch (e) {
  // Column already exists, ignore
}
// --- User-Scoped Data Functions ---
// All data access functions filter by userId for multi-tenant security

export function listCasesForUser(userId, status = null) {
  let sql = "SELECT * FROM cases WHERE userId = ?";
  const params = [userId];
  if (status) {
    sql += " AND status = ?";
    params.push(status.toUpperCase());
  }
  sql += " ORDER BY updatedAt DESC";
  const rows = db.prepare(sql).all(...params);
  return rows.map(rowToCase);
}

export function getCaseByIdForUser(userId, identifier) {
  const row = db.prepare("SELECT * FROM cases WHERE userId = ? AND (id = ? OR caseNumber = ?) LIMIT 1")
    .get(userId, identifier, identifier);
  return rowToCase(row);
}

export function getPersonsForCaseForUser(userId, caseId) {
  return db.prepare("SELECT * FROM persons WHERE userId = ? AND caseId = ? ORDER BY createdAt DESC")
    .all(userId, caseId);
}

export function getTransactionsForCaseForUser(userId, caseId) {
  const rows = db.prepare(`
    SELECT t.*, p.name as personName,
           (SELECT ifscCode FROM metadata WHERE personId = p.id LIMIT 1) as metaIfscCode
    FROM transactions t
    JOIN persons p ON t.personId = p.id
    WHERE t.userId = ? AND p.caseId = ?
  `).all(userId, caseId);
  return rows;
}

export function getPersonByNameForUser(userId, caseId, name) {
  const normalizedName = String(name || "").trim().toUpperCase();
  return db.prepare("SELECT * FROM persons WHERE userId = ? AND caseId = ? AND name = ? LIMIT 1")
    .get(userId, caseId, normalizedName) || null;
}

export function getMetadataForPersonForUser(userId, personId) {
  return db.prepare("SELECT * FROM metadata WHERE userId = ? AND personId = ? LIMIT 1")
    .get(userId, personId) || null;
}

export function toggleTransactionFlagForUser(userId, txId) {
  const tx = db.prepare("SELECT flagged FROM transactions WHERE userId = ? AND id = ?").get(userId, txId);
  if (!tx) return null;
  const newFlagged = tx.flagged === 1 ? 0 : 1;
  db.prepare("UPDATE transactions SET flagged = ? WHERE userId = ? AND id = ?").run(newFlagged, userId, txId);
  return { id: txId, flagged: newFlagged };
}

// --- Schema Migration for existing databases ---
// Add userId columns and foreign keys to existing tables if they don't exist
try {
  db.exec("ALTER TABLE cases ADD COLUMN userId TEXT REFERENCES users(id)");
  console.log("[DB-LOG] Migrated cases table to add userId column");
} catch (e) {
  // Column already exists
}

try {
  db.exec("ALTER TABLE persons ADD COLUMN userId TEXT REFERENCES users(id)");
  console.log("[DB-LOG] Migrated persons table to add userId column");
} catch (e) {
  // Column already exists
}

try {
  db.exec("ALTER TABLE metadata ADD COLUMN userId TEXT REFERENCES users(id)");
  console.log("[DB-LOG] Migrated metadata table to add userId column");
} catch (e) {
  // Column already exists
}

try {
  db.exec("ALTER TABLE transactions ADD COLUMN userId TEXT REFERENCES users(id)");
  console.log("[DB-LOG] Migrated transactions table to add userId column");
} catch (e) {
  // Column already exists
}