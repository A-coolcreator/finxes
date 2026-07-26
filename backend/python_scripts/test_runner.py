import os
import subprocess
import glob
import pandas as pd

def run_test():
    python_scripts_dir = r"c:\Users\dell\Downloads\finexis_frontend\python_scripts"
    pdf_dirs = [
        os.path.join(python_scripts_dir, "pdfs", "BANK"),
        os.path.join(python_scripts_dir, "pdfs", "UPI")
    ]
    
    pdf_files = []
    for pdf_dir in pdf_dirs:
        if os.path.exists(pdf_dir):
            pdf_files.extend(glob.glob(os.path.join(pdf_dir, "*.pdf")))
            
    print(f"Found {len(pdf_files)} PDFs to test.")
    
    results = []
    for pdf_path in pdf_files:
        rel_path = os.path.relpath(pdf_path, python_scripts_dir)
        print(f"\nRunning on: {rel_path}")
        
        # Run gemini.py
        cmd = ["python", "gemini.py", pdf_path]
        proc = subprocess.run(cmd, cwd=python_scripts_dir, capture_output=True, text=True)
        
        stdout = proc.stdout
        stderr = proc.stderr
        
        # Determine CSV output name based on gemini.py logic
        base_name = os.path.splitext(os.path.basename(pdf_path))[0]
        if "BOB" in base_name or "baroda" in base_name.lower() or "barb0" in base_name.lower():
            csv_name = "bob.csv"
        else:
            csv_name = f"{base_name}.csv"
            
        csv_path = os.path.join(python_scripts_dir, "csv", csv_name)
        
        status = "FAIL"
        rows = 0
        columns = []
        
        # If execution returned successful output or created/updated CSV
        if os.path.exists(csv_path):
            try:
                df = pd.read_csv(csv_path)
                rows = len(df)
                columns = list(df.columns)
                status = "SUCCESS" if rows > 0 else "EMPTY_CSV"
            except Exception as e:
                status = f"CSV_READ_ERROR: {e}"
        else:
            status = "NO_CSV_CREATED"
            
        results.append({
            "File": rel_path,
            "Status": status,
            "Rows": rows,
            "Columns": columns,
            "Stdout": stdout.strip().split("\n")[-2:] if stdout else [],
            "Stderr": stderr.strip() if stderr else ""
        })
        
    print("\n" + "="*50 + "\nRESULTS SUMMARY:\n" + "="*50)
    for r in results:
        cols_str = ", ".join(r["Columns"]) if r["Columns"] else "None"
        # Safe print for Windows terminal cp1252 limit
        cols_str = cols_str.replace('\u20b9', 'Rs.')
        print(f"File: {r['File']}")
        print(f"  Status: {r['Status']}")
        print(f"  Rows: {r['Rows']}")
        print(f"  Columns: {cols_str}")
        if r['Stderr']:
            print(f"  Stderr: {r['Stderr']}")
        print("-" * 30)

if __name__ == "__main__":
    import sys
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass
    run_test()
