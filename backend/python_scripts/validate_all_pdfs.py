import os
import sys
import json
import traceback

sys.path.append(r"c:\Users\dell\Downloads\finexis_frontend\python_scripts")
from extract_metadata import extract_pdf_metadata

pdf_dir = r"c:\Users\dell\Downloads\finexis_frontend\python_scripts\pdfs\BANK"
output_report = r"c:\Users\dell\Downloads\finexis_frontend\python_scripts\metadata_summary.md"

pdfs = [f for f in os.listdir(pdf_dir) if f.lower().endswith(".pdf")]

report_lines = []
report_lines.append("# Bank Statement Metadata Extraction Validation Summary\n")
report_lines.append("| PDF Filename | Detected Bank | Account Holder Name | Account Number | IFSC Code | Opening Balance | Closing Balance | Status |")
report_lines.append("|---|---|---|---|---|---|---|---|")

detailed_results = {}

for pdf in pdfs:
    pdf_path = os.path.join(pdf_dir, pdf)
    print(f"Processing: {pdf}")
    try:
        meta = extract_pdf_metadata(pdf_path)
        
        bank_name = meta.get("institution", {}).get("bank_name", "UNKNOWN")
        name = meta.get("account_holder", {}).get("name", "UNKNOWN")
        acc_no = meta.get("account_profile", {}).get("account_number", "UNKNOWN")
        ifsc = meta.get("routing_identifiers", {}).get("ifsc_code", "UNKNOWN")
        op_bal = meta.get("summary_snapshot", {}).get("opening_balance", "UNKNOWN")
        cl_bal = meta.get("summary_snapshot", {}).get("closing_balance", "UNKNOWN")
        
        report_lines.append(f"| {pdf} | {bank_name} | {name} | {acc_no} | {ifsc} | {op_bal} | {cl_bal} | SUCCESS |")
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
