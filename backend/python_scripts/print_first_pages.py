import os
import pdfplumber

pdf_dir = r"c:\Users\dell\Downloads\finexis_frontend\python_scripts\pdfs\UPI"
pdfs = [f for f in os.listdir(pdf_dir) if f.lower().endswith(".pdf")]

for pdf in pdfs:
    pdf_path = os.path.join(pdf_dir, pdf)
    print("=" * 60)
    print(f"FILE: {pdf}")
    print("=" * 60)
    try:
        with pdfplumber.open(pdf_path) as doc:
            if doc.pages:
                text = doc.pages[0].extract_text() or ""
                lines = [l.strip() for l in text.split('\n') if l.strip()]
                for l in lines[:15]:
                    print(l)
            else:
                print("[EMPTY PAGE]")
    except Exception as e:
        print(f"ERROR: {e}")
    print("\n")
