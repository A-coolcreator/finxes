import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = __dirname;
const projectRoot = path.resolve(backendDir, "..");

const testPdf = path.join(projectRoot, "python_scripts", "pdfs", "BANK", "UNION_BANK.pdf");
const logPath = path.join(backendDir, "backend.log");

function printBackendLog() {
  if (fs.existsSync(logPath)) {
    console.log("\n--- RECENT BACKEND LOGS ---");
    const logs = fs.readFileSync(logPath, "utf-8");
    // Print the last 1500 characters of logs to keep it focused
    console.log(logs.slice(-1500));
  } else {
    console.log(`\n[DIAGNOSTIC] backend.log does not exist at ${logPath}`);
  }
}

async function runIntegrationTest() {
  console.log("=========================================");
  console.log("STARTING UPLOAD PARSING INTEGRATION TEST");
  console.log("=========================================");

  if (!fs.existsSync(testPdf)) {
    console.error(`Error: Test PDF not found at: ${testPdf}`);
    process.exit(1);
  }

  // Clear previous log file if any to keep test output fresh
  if (fs.existsSync(logPath)) {
    fs.unlinkSync(logPath);
  }

  console.log(`1. Reading PDF file from disk: ${path.basename(testPdf)}`);
  const fileBuffer = fs.readFileSync(testPdf);
  const base64 = fileBuffer.toString("base64");

  const payload = {
    caseNumber: `TEST-INT-${Date.now()}`,
    title: "Integration Test Case",
    subtitle: "Automated verification of PDF upload and parsing flow",
    status: "ACTIVE",
    files: [
      {
        filename: "UNION_BANK.pdf",
        base64: base64,
        personName: "Lakshit Verma (Automation Test)"
      }
    ]
  };

  console.log("2. Submitting POST request to http://localhost:3000/api/cases...");
  
  try {
    const response = await fetch("http://localhost:3000/api/cases", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    console.log(`3. Response status: ${response.status} ${response.statusText}`);
    const data = await response.json();

    if (response.ok) {
      console.log("4. Response JSON payload received successfully:");
      console.log(JSON.stringify(data, null, 2));

      if (data.triggerCount && data.triggerCount > 0) {
        console.log(`\n=========================================`);
        console.log(`🎉 SUCCESS! The PDF was parsed successfully.`);
        console.log(`Saved ${data.triggerCount} transactions to case ID: ${data.id}`);
        console.log(`=========================================`);
        process.exit(0);
      } else {
        console.log(`\n=========================================`);
        console.log(`❌ FAILURE: Case was created, but 0 transactions were parsed.`);
        console.log(`=========================================`);
        printBackendLog();
        process.exit(1);
      }
    } else {
      console.log(`\n=========================================`);
      console.log(`❌ FAILURE: API responded with error status.`);
      console.log(`Response body:`, data);
      console.log(`=========================================`);
      printBackendLog();
      process.exit(1);
    }
  } catch (error) {
    console.log(`\n=========================================`);
    console.log(`❌ FAILURE: Could not connect to local server.`);
    console.log(`Is the server running on http://localhost:3000?`);
    console.log(`Error: ${error.message}`);
    console.log(`=========================================`);
    printBackendLog();
    process.exit(1);
  }
}

runIntegrationTest();
