import pdfplumber

def check_upi_pdf(pdf_path):
    print(f"\n====================================\nChecking {pdf_path}\n====================================")
    with pdfplumber.open(pdf_path) as pdf:
        print(f"Total Pages: {len(pdf.pages)}")
        for idx, page in enumerate(pdf.pages):
            print(f"--- Page {idx+1} ---")
            text = page.extract_text()
            if text:
                print(text)
            else:
                print("[No Text]")
            tables = page.extract_tables()
            if tables:
                print(f"Tables: {len(tables)}")
                for t_idx, t in enumerate(tables):
                    print(f"  Table {t_idx+1}: {len(t)} rows")
                    for row in t[:3]:
                        print(f"    {row}")

if __name__ == "__main__":
    import sys
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass
    check_upi_pdf(r"c:\Users\dell\Downloads\finexis_frontend\python_scripts\pdfs\UPI\gpay_statement_20251201_20260531.pdf")
    check_upi_pdf(r"c:\Users\dell\Downloads\finexis_frontend\python_scripts\pdfs\UPI\MobiKwik Txn Statement 01_Jul_2025-29_Jun_2026.pdf")
    check_upi_pdf(r"c:\Users\dell\Downloads\finexis_frontend\python_scripts\pdfs\UPI\Paytm.pdf")
    check_upi_pdf(r"c:\Users\dell\Downloads\finexis_frontend\python_scripts\pdfs\UPI\Super_money.pdf")
