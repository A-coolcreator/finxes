import cors from "cors";
import express from "express";
import path from "node:path";
import fs from "node:fs";
import { exec } from "node:child_process";
import util from "node:util";
import { fileURLToPath } from "node:url";
import {
  archiveCaseRecord,
  createCaseRecord,
  getCaseByIdentifier,
  listCases,
  unarchiveCaseRecord,
  updateCaseRecord,
  createPersonRecord,
  saveMetadataRecord,
  saveTransactionsBatch,
  updateCaseTriggerCount,
  getPersonByName,
  getTransactionsForCase,
  getPersonsForCase,
  deleteCaseRecord,
  deletePersonRecord,
  getMetadataForPerson,
  toggleTransactionFlag,
} from "./db.js";

const execPromise = util.promisify(exec);
const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const uiRoot = path.join(repoRoot, "finexis_ui_updated");
const frontendDir = path.join(uiRoot, "dist");
const workspaceDir = __dirname;

// Ensure runtime directories exist
const uploadsDir = path.join(__dirname, "uploads");
const csvDir = path.join(__dirname, "csv");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(csvDir)) fs.mkdirSync(csvDir, { recursive: true });

if (!fs.existsSync(frontendDir)) {
  console.warn(
    `[warn] UI build missing at ${frontendDir}. Run: cd finexis_ui_updated && npm run build`
  );
}

// =========================================================
// 1. SERVE STATIC FRONTEND ASSETS FIRST (Bypasses CORS)
// =========================================================
app.use(express.static(frontendDir));

// =========================================================
// 2. PARSERS & CORS CONFIGURATION FOR API ENDPOINTS
// =========================================================
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Origins allowed to access the API
const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://finexis-app-825929313912.us-central1.run.app',
  'https://73be-103-186-41-190.ngrok-free.app',
  'https://7985-103-186-41-190.ngrok-free.app',
  'https://563b-103-186-41-160.ngrok-free.app',
  'https://d1c8-103-186-41-160.ngrok-free.app',
];

const envOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : [];

const allowedOrigins = [...defaultAllowedOrigins, ...envOrigins];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (curl, Postman, mobile, static assets)
    if (!origin) return callback(null, true);

    // Automatically allow ngrok tunnels and Google Cloud Run domains
    if (
      origin.endsWith('.ngrok-free.app') ||
      origin.endsWith('.ngrok.io') ||
      origin.endsWith('.run.app')
    ) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

// Apply CORS strictly to API endpoints
app.use('/api', cors(corsOptions));

// Helper for file logging
function logToFile(message, error = null) {
  const logPath = path.join(__dirname, "backend.log");
  const timestamp = new Date().toISOString();
  let logMessage = `[${timestamp}] ${message}\n`;
  if (error) {
    logMessage += `Error stack: ${error.stack || error.message || error}\n`;
    if (error.stdout) logMessage += `Subprocess Stdout: ${error.stdout}\n`;
    if (error.stderr) logMessage += `Subprocess Stderr: ${error.stderr}\n`;
  }
  fs.appendFileSync(logPath, logMessage, "utf-8");
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: "modified" });
});

app.get("/api/cases", (req, res) => {
  const { status } = req.query;
  res.json(listCases(status));
});

app.get("/api/archives", (_req, res) => {
  res.json(listCases("ARCHIVED"));
});

app.get("/api/cases/:identifier", (req, res) => {
  const record = getCaseByIdentifier(req.params.identifier);
  if (!record) {
    res.status(404).json({ message: "Case not found" });
    return;
  }

  res.json(record);
});

app.get("/api/cases/:identifier/transactions", (req, res) => {
  const identifier = req.params.identifier;
  console.log(`[BACKEND-LOG] GET /api/cases/${identifier}/transactions requested`);
  const record = getCaseByIdentifier(identifier);
  if (!record) {
    console.warn(`[BACKEND-LOG] Case NOT FOUND for identifier: "${identifier}"`);
    res.status(404).json({ message: "Case not found" });
    return;
  }
  const txs = getTransactionsForCase(record.id);
  console.log(`[BACKEND-LOG] Resolved Case ID=${record.id}. Returning ${txs.length} transactions.`);
  if (txs.length > 0) {
    console.log(`[BACKEND-LOG] Sample 1st transaction:`, { id: txs[0].id, date: txs[0].date, amount: txs[0].amount, desc: txs[0].description });
  }
  res.json(txs);
});

app.get("/api/cases/:identifier/persons", (req, res) => {
  const identifier = req.params.identifier;
  console.log(`[BACKEND-LOG] GET /api/cases/${identifier}/persons requested`);
  const record = getCaseByIdentifier(identifier);
  if (!record) {
    console.warn(`[BACKEND-LOG] Case NOT FOUND for identifier: "${identifier}"`);
    res.status(404).json({ message: "Case not found" });
    return;
  }
  const persons = getPersonsForCase(record.id);
  console.log(`[BACKEND-LOG] Resolved Case ID=${record.id}. Returning ${persons.length} persons.`);
  res.json(persons);
});

function parseCSV(text) {
  const lines = text.split(/\r?\n/);
  if (lines.length === 0) return [];
  const headers = parseCSVLine(lines[0]);
  const results = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] !== undefined ? values[index] : "";
    });
    results.push(row);
  }
  return results;
}

function safeUnlinkSync(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.warn(`Warning: Could not remove file ${filePath}:`, err.message);
  }
}

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result.map(v => v.replace(/^"|"$/g, "").trim());
}

// Helper to parse Gemini stdout (JSON array)
function parseGeminiOutput(stdout) {
  if (!stdout) {
    console.log("[BACKEND-LOG] [parseGeminiOutput] Empty stdout received.");
    return [];
  }
  const trimmed = stdout.trim();
  console.log(`[BACKEND-LOG] [parseGeminiOutput] Trimming stdout. Length: ${trimmed.length} chars. First 150 chars: ${trimmed.slice(0, 150)}`);
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      console.log(`[BACKEND-LOG] [parseGeminiOutput] Successfully parsed JSON array with ${parsed.length} transaction records.`);
      return parsed;
    }
    console.warn(`[BACKEND-LOG] [parseGeminiOutput] Parsed JSON is not an array:`, typeof parsed);
  } catch (e) {
    console.warn(`[BACKEND-LOG] [parseGeminiOutput] Direct JSON parse failed (${e.message}). Attempting regex fallback for array pattern...`);
    const match = trimmed.match(/\[\s*\{.*\}\s*\]/s);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed)) {
          console.log(`[BACKEND-LOG] [parseGeminiOutput] Regex match parsed JSON array with ${parsed.length} transaction records.`);
          return parsed;
        }
      } catch (e2) {
        console.error(`[BACKEND-LOG] [parseGeminiOutput] Regex fallback JSON parse error:`, e2.message);
      }
    } else {
      console.error(`[BACKEND-LOG] [parseGeminiOutput] No JSON array pattern matched in stdout.`);
    }
  }
  return [];
}

app.post("/api/cases", async (req, res) => {
  const { caseNumber, title, subtitle, status, personName, files } = req.body || {};
  console.log(`\n==================================================`);
  console.log(`[BACKEND-LOG] POST /api/cases called`);
  console.log(`[BACKEND-LOG] caseNumber: "${caseNumber}", title: "${title}", status: "${status}", filesCount: ${files ? files.length : 0}`);
  logToFile(`POST /api/cases called. caseNumber=${caseNumber}, title=${title}, filesCount=${files ? files.length : 0}`);

  if (!caseNumber || !title || !status) {
    console.error(`[BACKEND-LOG] ERROR: Missing required fields (caseNumber, title, or status)`);
    res.status(400).json({ message: "caseNumber, title, and status are required" });
    return;
  }

  // Extract userId from Authorization header (token format: token-{userId}-{email})
  let userId = "USER-001"; // Default fallback
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer token-")) {
    const tokenParts = authHeader.replace("Bearer token-", "").split("-");
    if (tokenParts.length >= 2) {
      userId = `${tokenParts[0]}-${tokenParts[1]}`; // e.g., USER-001
      console.log(`[BACKEND-LOG] Extracted userId from token: ${userId}`);
    }
  }

  try {
    const record = createCaseRecord(userId, { caseNumber, title, subtitle, status });
    console.log(`[BACKEND-LOG] Created Case Record: ID=${record.id}, CaseNo=${record.caseNumber}`);
    let totalTransactionsCount = 0;

    if (files && Array.isArray(files) && files.length > 0) {
      const pythonCmd = process.platform === "win32" ? "python" : "python3";

      for (let idx = 0; idx < files.length; idx++) {
        const fileObj = files[idx];
        const base64Str = fileObj.base64 || fileObj.content;
        console.log(`\n--- [BACKEND-LOG] Processing File [${idx + 1}/${files.length}]: "${fileObj.filename}" ---`);

        if (!fileObj.filename || !base64Str) {
          console.warn(`[BACKEND-LOG] WARNING: Skipping file index ${idx} due to missing filename or base64 data.`);
          continue;
        }
        console.log(`[BACKEND-LOG] Base64 content length: ${base64Str.length} characters`);

        const baseName = `${path.basename(fileObj.filename, ".pdf")}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const tempPdfPath = path.join(uploadsDir, `${baseName}.pdf`);

        const buffer = Buffer.from(base64Str, "base64");
        fs.writeFileSync(tempPdfPath, buffer);
        const shellSafePdfPath = tempPdfPath.split(path.sep).join("/");
        console.log(`[BACKEND-LOG] Saved temporary PDF to: ${tempPdfPath} (${buffer.length} bytes)`);

        try {
          // 1. Extract Metadata
          try {
            console.log(`[BACKEND-LOG] Executing metadata extraction script...`);
            const metaRes = await execPromise(`"${pythonCmd}" python_scripts/extract_metadata.py "${shellSafePdfPath}"`, { cwd: workspaceDir, timeout: 300000 });
            console.log(`[BACKEND-LOG] Metadata script completed. Stdout length: ${metaRes.stdout ? metaRes.stdout.length : 0}`);
            if (metaRes.stderr) {
              console.warn(`[BACKEND-LOG] Metadata script stderr:`, metaRes.stderr);
            }
          } catch (metaErr) {
            console.error(`[BACKEND-LOG] Metadata script failed for ${fileObj.filename}:`, metaErr.message);
          }

          // 2. Execute Gemini Transaction Parser
          let geminiStdout = "";
          try {
            console.log(`[BACKEND-LOG] Executing gemini.py transaction parser script...`);
            const geminiRes = await execPromise(`"${pythonCmd}" python_scripts/gemini.py "${shellSafePdfPath}"`, { cwd: workspaceDir, timeout: 300000 });
            geminiStdout = geminiRes.stdout || "";
            console.log(`[BACKEND-LOG] Gemini script completed. Stdout length: ${geminiStdout.length} chars`);
            if (geminiRes.stderr) {
              console.log(`[BACKEND-LOG] Gemini script stderr output:\n${geminiRes.stderr}`);
            }
          } catch (gemErr) {
            console.error(`[BACKEND-LOG] ERROR running gemini.py for ${fileObj.filename}:`, gemErr.message);
          }

          let extractedName = fileObj.personName || "Unknown Holder";
          let metaContent = null;

          const metadataOutPath = path.join(workspaceDir, "metadata", `${baseName}_profile.json`);
          if (fs.existsSync(metadataOutPath)) {
            try {
              metaContent = JSON.parse(fs.readFileSync(metadataOutPath, "utf-8"));
              if (!fileObj.personName) {
                const holderName = metaContent.account_holder?.name;
                if (holderName && holderName !== "UNKNOWN" && holderName.trim() !== "") {
                  extractedName = holderName.trim();
                } else {
                  extractedName = path.basename(fileObj.filename, ".pdf").replace(/[_-]/g, " ").trim();
                }
              }
            } catch (e) {
              console.error(`[BACKEND-LOG] Error reading metadata profile JSON:`, e);
            }
          } else {
            if (!fileObj.personName) {
              extractedName = path.basename(fileObj.filename, ".pdf").replace(/[_-]/g, " ").trim();
            }
          }

          console.log(`[BACKEND-LOG] Account Holder Name resolved as: "${extractedName}"`);

          let personId;
          const existingPerson = getPersonByName(userId, record.id, extractedName);
          if (existingPerson) {
            personId = existingPerson.id;
            console.log(`[BACKEND-LOG] Found existing Person record: ID=${personId}`);
          } else {
            personId = createPersonRecord(userId, record.id, extractedName);
            console.log(`[BACKEND-LOG] Created new Person record: ID=${personId}`);
          }

          if (metaContent) {
            saveMetadataRecord(userId, personId, metaContent);
            console.log(`[BACKEND-LOG] Saved Metadata record for Person ID=${personId}`);
            safeUnlinkSync(metadataOutPath);
          }

          // 3. Parse and Batch Save Transactions
          let parsedTransactions = parseGeminiOutput(geminiStdout);
          if (parsedTransactions.length === 0) {
            console.log(`[BACKEND-LOG] Gemini stdout did not return transactions. Checking CSV fallbacks...`);
            let csvPath = path.join(workspaceDir, "csv", `${baseName}.csv`);
            if (fs.existsSync(csvPath)) {
              const csvText = fs.readFileSync(csvPath, "utf-8");
              parsedTransactions = parseCSV(csvText);
              console.log(`[BACKEND-LOG] Fallback CSV found at ${csvPath}. Parsed ${parsedTransactions.length} rows.`);
              safeUnlinkSync(csvPath);
            } else {
              console.log(`[BACKEND-LOG] No fallback CSV found at ${csvPath}`);
            }
          }

          console.log(`[BACKEND-LOG] Total parsed transactions for file "${fileObj.filename}": ${parsedTransactions.length}`);

          if (parsedTransactions.length > 0) {
            totalTransactionsCount += parsedTransactions.length;
            saveTransactionsBatch(userId, personId, parsedTransactions);
            console.log(`[BACKEND-LOG] Successfully saved ${parsedTransactions.length} transactions into SQLite DB for Person ID=${personId}.`);
          } else {
            console.warn(`[BACKEND-LOG] WARNING: 0 transactions were saved for file "${fileObj.filename}".`);
          }

        } catch (execErr) {
          console.error(`[BACKEND-LOG] Error in file execution loop for ${fileObj.filename}:`, execErr);
        } finally {
          if (fs.existsSync(tempPdfPath)) {
            safeUnlinkSync(tempPdfPath);
          }
        }
      }
    }

    console.log(`[BACKEND-LOG] Case processing completed. Total transactions added to case: ${totalTransactionsCount}`);
    if (totalTransactionsCount > 0) {
      updateCaseTriggerCount(record.id, totalTransactionsCount);
      record.triggerCount = totalTransactionsCount;
    }

    console.log(`[BACKEND-LOG] Returning HTTP 201 response with Case Record:`, record);
    console.log(`==================================================\n`);
    res.status(201).json(record);
  } catch (error) {
    console.error("[BACKEND-LOG] Create Case Error:", error);
    res.status(400).json({ message: error.message });
  }
});

app.post("/api/cases/:identifier/documents", async (req, res) => {
  const { files } = req.body || {};
  const caseId = req.params.identifier;

  const record = getCaseByIdentifier(caseId);
  if (!record) {
    res.status(404).json({ message: "Case not found" });
    return;
  }

  try {
    let totalTransactionsCount = 0;

    if (files && Array.isArray(files) && files.length > 0) {
      const pythonCmd = process.platform === "win32" ? "python" : "python3";

      for (const fileObj of files) {
        const base64Str = fileObj.base64 || fileObj.content;
        if (!fileObj.filename || !base64Str) continue;

        const baseName = `${path.basename(fileObj.filename, ".pdf")}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const tempPdfPath = path.join(uploadsDir, `${baseName}.pdf`);

        const buffer = Buffer.from(base64Str, "base64");
        fs.writeFileSync(tempPdfPath, buffer);

        try {
          const metaRes = await execPromise(`"${pythonCmd}" python_scripts/extract_metadata.py "${tempPdfPath}"`, { cwd: workspaceDir });
          console.log("Metadata script stdout:", metaRes.stdout);
          if (metaRes.stderr) console.error("Metadata script stderr:", metaRes.stderr);

          let geminiStdout = "";
          try {
            const geminiRes = await execPromise(`"${pythonCmd}" python_scripts/gemini.py "${tempPdfPath}"`, { cwd: workspaceDir });
            geminiStdout = geminiRes.stdout || "";
            console.log("Gemini script stdout:", geminiStdout);
            if (geminiRes.stderr) console.error("Gemini script stderr:", geminiRes.stderr);
          } catch (gemErr) {
            console.error(`Gemini script failed for ${fileObj.filename}:`, gemErr.message);
          }

          let extractedName = "Unknown Holder";
          let metaContent = null;

          const metadataOutPath = path.join(workspaceDir, "metadata", `${baseName}_profile.json`);
          if (fs.existsSync(metadataOutPath)) {
            try {
              metaContent = JSON.parse(fs.readFileSync(metadataOutPath, "utf-8"));
              const holderName = metaContent.account_holder?.name;
              if (holderName && holderName !== "UNKNOWN" && holderName.trim() !== "") {
                extractedName = holderName.trim();
              } else {
                extractedName = path.basename(fileObj.filename, ".pdf").replace(/[_-]/g, " ").trim();
              }
            } catch (e) {
              console.error("Error reading metadata profile:", e);
            }
          } else {
            extractedName = path.basename(fileObj.filename, ".pdf").replace(/[_-]/g, " ").trim();
          }

          let personId;
          const existingPerson = getPersonByName(userId, record.id, extractedName);
          if (existingPerson) {
            personId = existingPerson.id;
          } else {
            personId = createPersonRecord(userId, record.id, extractedName);
          }

          if (metaContent) {
            saveMetadataRecord(userId, personId, metaContent);
            safeUnlinkSync(metadataOutPath);
          }

          let parsedTransactions = parseGeminiOutput(geminiStdout);
          if (parsedTransactions.length === 0) {
            let csvPath = path.join(workspaceDir, "csv", `${baseName}.csv`);
            const bobCsvPath = path.join(workspaceDir, "csv", "bob.csv");
            if (fs.existsSync(bobCsvPath)) csvPath = bobCsvPath;

            if (fs.existsSync(csvPath)) {
              const csvText = fs.readFileSync(csvPath, "utf-8");
              parsedTransactions = parseCSV(csvText);
              safeUnlinkSync(csvPath);
            }
          }

          if (parsedTransactions.length > 0) {
            totalTransactionsCount += parsedTransactions.length;
            saveTransactionsBatch(userId, personId, parsedTransactions);
          }

        } catch (execErr) {
          console.error(`Error parsing file ${fileObj.filename}:`, execErr);
        } finally {
          if (fs.existsSync(tempPdfPath)) {
            safeUnlinkSync(tempPdfPath);
          }
        }
      }
    }

    if (totalTransactionsCount > 0) {
      const newTriggerCount = (record.triggerCount || 0) + totalTransactionsCount;
      updateCaseTriggerCount(record.id, newTriggerCount);
      record.triggerCount = newTriggerCount;
    }

    res.json({ success: true, triggerCount: record.triggerCount });
  } catch (error) {
    console.error("Upload Case Documents Error:", error);
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/cases/:identifier", (req, res) => {
  const record = updateCaseRecord(req.params.identifier, req.body || {});
  if (!record) {
    res.status(404).json({ message: "Case not found" });
    return;
  }

  res.json(record);
});

app.delete("/api/persons/:personId", (req, res) => {
  const { personId } = req.params;
  try {
    deletePersonRecord(personId);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete Person Error:", error);
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/persons/:personId/metadata", (req, res) => {
  const { personId } = req.params;
  try {
    const meta = getMetadataForPerson(personId);
    if (!meta) {
      res.status(404).json({ message: "Metadata not found for this person" });
      return;
    }
    res.json(meta);
  } catch (error) {
    console.error("Get Person Metadata Error:", error);
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/cases/:identifier", (req, res) => {
  const record = getCaseByIdentifier(req.params.identifier);
  if (!record) {
    res.status(404).json({ message: "Case not found" });
    return;
  }
  deleteCaseRecord(record.id);
  res.json({ success: true });
});

app.post("/api/cases/:identifier/archive", (req, res) => {
  const record = archiveCaseRecord(req.params.identifier);
  if (!record) {
    res.status(404).json({ message: "Case not found" });
    return;
  }

  res.json(record);
});

app.post("/api/cases/:identifier/unarchive", (req, res) => {
  const record = unarchiveCaseRecord(req.params.identifier);
  if (!record) {
    res.status(404).json({ message: "Case not found" });
    return;
  }

  res.json(record);
});

app.post("/api/transactions/:id/toggle-flag", (req, res) => {
  const { id } = req.params;
  try {
    const updated = toggleTransactionFlag(id);
    if (!updated) {
      res.status(404).json({ message: "Transaction not found" });
      return;
    }
    res.json(updated);
  } catch (error) {
    console.error("Toggle Transaction Flag Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// =========================================================
// 3. SPA FALLBACK ROUTE (Client-side Routing)
// =========================================================
app.get("*", (_req, res) => {
  res.sendFile(path.join(frontendDir, "index.html"));
});

app.listen(port, () => {
  console.log(`Finexis backend listening on http://localhost:${port}`);
});