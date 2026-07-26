import os
import sys
import json
import traceback

sys.path.append(r"c:\Users\dell\Downloads\finexis_frontend\python_scripts")
from extract_metadata import extract_pdf_metadata

pdf_dir = r"c:\Users\dell\Downloads\finexis_frontend\python_scripts\pdfs\UPI"
output_report = r"c:\Users\dell\Downloads\finexis_frontend\python_scripts\upi_metadata_summary.md"

pdfs = [f for f in os.listdir(pdf_dir) if f.lower().endswith(".pdf")]

report_lines = []
report_lines.append("# UPI App Statement Metadata Extraction Validation Summary\n")
report_lines.append("| PDF Filename | Platform | Mobile Number | Email | Transaction Count | Total Sent | Total Received | Status |")
report_lines.append("|---|---|---|---|---|---|---|---|")

detailed_results = {}

for pdf in pdfs:
    pdf_path = os.path.join(pdf_dir, pdf)
    print(f"Processing: {pdf}")
    try:
        meta = extract_pdf_metadata(pdf_path)
        
        platform = meta.get("institution", {}).get("platform", "UNKNOWN")
        phone = meta.get("account_holder", {}).get("mobile_number", "UNKNOWN")
        email = meta.get("account_holder", {}).get("email", "UNKNOWN")
        txn_count = meta.get("upi_summary", {}).get("transaction_count", "UNKNOWN")
        total_sent = meta.get("upi_summary", {}).get("total_sent", "UNKNOWN")
        total_received = meta.get("upi_summary", {}).get("total_received", "UNKNOWN")
        
        report_lines.append(f"| {pdf} | {platform} | {phone} | {email} | {txn_count} | {total_sent} | {total_received} | SUCCESS |")
        detailed_results[pdf] = meta
    except Exception as e:
        err_msg = str(e).replace("|", "\\|")
        report_lines.append(f"| {pdf} | ERROR | - | - | - | - | - | FAILED: {err_msg} |")
        print(f"Error on {pdf}:")
        traceback.print_exc()

report_lines.append("\n\n## Detailed Metadata Mapping\n")
for pdf, meta in detailed_results.items():
    report_lines.append(f"### {pdf}")
    report_lines.append("```json")
    report_lines.append(json.dumps(meta, indent=2))
    report_lines.append("```\n")

with open(output_report, "w", encoding="utf-8") as f:
    f.write("\n".join(report_lines))

print(f"\n[✔] Finished! Summary report written to: {output_report}")
