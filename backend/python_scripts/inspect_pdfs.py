import os
import glob
import pdfplumber

def inspect():
    python_scripts_dir = r"c:\Users\dell\Downloads\finexis_frontend\python_scripts"
    pdf_dirs = [
        os.path.join(python_scripts_dir, "pdfs", "BANK"),
        os.path.join(python_scripts_dir, "pdfs", "UPI")
    ]
    
    pdf_files = []
    for pdf_dir in pdf_dirs:
        if os.path.exists(pdf_dir):
            pdf_files.extend(glob.glob(os.path.join(pdf_dir, "*.pdf")))
            
    print(f"Inspecting {len(pdf_files)} PDF files:\n" + "="*50)
    
    for pdf_path in sorted(pdf_files):
        rel_path = os.path.relpath(pdf_path, python_scripts_dir)
        print(f"File: {rel_path}")
        
        try:
            with pdfplumber.open(pdf_path) as pdf:
                num_pages = len(pdf.pages)
                print(f"  Pages: {num_pages}")
                
                # Check text content of first page
                first_page = pdf.pages[0]
                text = first_page.extract_text()
                if text:
                    lines = [line.strip() for line in text.split('\n') if line.strip()]
                    print(f"  Text layer: Yes (Length={len(text)} chars)")
                    print("  First 5 lines:")
                    for line in lines[:5]:
                        print(f"    | {line}")
                else:
                    print("  Text layer: NO (or empty)")
                
                # Check tables on first page
                tables = first_page.extract_tables()
                if tables:
                    print(f"  Tables on Page 1: {len(tables)}")
                    for idx, t in enumerate(tables):
                        num_rows = len(t)
                        num_cols = len(t[0]) if t else 0
                        print(f"    Table {idx+1}: {num_rows} rows x {num_cols} cols")
                        if num_rows > 0:
                            print(f"      Headers/Sample: {t[0][:5]}")
                else:
                    print("  Tables on Page 1: None")
                    
        except Exception as e:
            print(f"  Error inspecting: {e}")
        print("-" * 50)

if __name__ == "__main__":
    import sys
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass
    inspect()
