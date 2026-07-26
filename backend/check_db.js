import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import initSqlJs from "sql.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFile = path.join(__dirname, "data", "finexis.sqlite");

if (!fs.existsSync(dbFile)) {
  console.log("Database file finexis.sqlite does not exist at:", dbFile);
  process.exit(1);
}

const SQL = await initSqlJs({
  locateFile: (file) => path.join(__dirname, "node_modules", "sql.js", "dist", file),
});

const db = new SQL.Database(fs.readFileSync(dbFile));

function execAll(sql, params = []) {
  const statement = db.prepare(sql);
  try {
    statement.bind(params);
    const rows = [];
    while (statement.step()) {
      rows.push(statement.getAsObject());
    }
    return rows;
  } finally {
    statement.free();
  }
}

console.log("=== Database Table Summary ===");
const cases = execAll("SELECT * FROM cases");
console.log(`Cases Count: ${cases.length}`);
console.log(cases);

const persons = execAll("SELECT * FROM persons");
console.log(`\nPersons Count: ${persons.length}`);
console.log(persons);

const metadata = execAll("SELECT * FROM metadata");
console.log(`\nMetadata Count: ${metadata.length}`);
console.log(metadata.map(m => ({
  id: m.id,
  personId: m.personId,
  documentType: m.documentType,
  bankName: m.bankName,
  platform: m.platform,
  accountHolderName: m.accountHolderName,
  accountNumber: m.accountNumber,
  ifscCode: m.ifscCode,
  startDate: m.startDate,
  endDate: m.endDate,
})));

const transactions = execAll("SELECT * FROM transactions");
console.log(`\nTransactions Count: ${transactions.length}`);
if (transactions.length > 0) {
  console.log("First 5 transactions:");
  console.log(transactions.slice(0, 5));
}
