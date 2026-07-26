import os
import glob
import subprocess
import sys

def test_bank_pdfs():
    script_dir = r"c:\Users\dell\Downloads\finexis_frontend\python_scripts"
    bank_dir = os.path.join(script_dir, "pdfs", "BANK")
    gemini_script = os.path.join(script_dir, "gemini.py")
    report_file = os.path.join(script_dir, "bank_parse_report.txt")
    
    os.chdir(script_dir)
    
    pdf_files = glob.glob(os.path.join(bank_dir, "*.pdf"))
    results = []
    
    print(f"Testing {len(pdf_files)} PDFs in BANK folder...\n")
    
    for pdf in pdf_files:
        basename = os.path.basename(pdf)
        print(f"Running gemini.py on: {basename}")
        
        # Run gemini.py
        process = subprocess.run(
            [sys.executable, gemini_script, pdf],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        stdout = process.stdout
        stderr = process.stderr
        
        # Check if successful parsing
        if "[OK] Parsing Complete!" in stdout:
            # Find the number of rows saved
            lines = stdout.split('\n')
            success_line = next((line for line in lines if "[OK] Parsing Complete!" in line), "")
            results.append(f"SUCCESS: {basename} -> {success_line}")
        else:
            # Failed
            fail_reason = "Unknown Error"
            if "[FAIL]" in stdout:
                lines = stdout.split('\n')
                fail_reason = next((line for line in lines if "[FAIL]" in line), "Fail line missing")
            elif process.returncode != 0:
                fail_reason = f"Crashed (Exit {process.returncode})\nStderr: {stderr.strip()[:100]}"
            
            # Did it fall back to grid engine?
            engine = "Text-Flow"
            if "Tabular Grid Engine" in stdout:
                engine = "Grid Fallback"
                
            results.append(f"FAILED:  {basename} -> Engine: {engine} | Reason: {fail_reason}")
            
    # Write report
    with open(report_file, "w", encoding="utf-8") as f:
        f.write("=== BANK PDF PARSING REPORT ===\n\n")
        f.write("\n".join(results))
        f.write("\n\nTotal Tested: " + str(len(pdf_files)))
        
    print(f"\nDone! Report saved to {report_file}")

if __name__ == "__main__":
    test_bank_pdfs()
