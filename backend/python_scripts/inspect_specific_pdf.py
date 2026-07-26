import pdfplumber

def check_pdf(pdf_path):
    print(f"\n====================================\nChecking {pdf_path}\n====================================")
    with pdfplumber.open(pdf_path) as pdf:
        print(f"Total Pages: {len(pdf.pages)}")
        # Check text on page 2
        p2 = pdf.pages[1]
        text = p2.extract_text()
        print("Page 2 Text (first 20 lines):")
        if text:
            lines = text.split('\n')
            for l in lines[:30]:
                print(f"  | {l}")
        else:
            print("  [No Text]")
            
        tables = p2.extract_tables()
        print(f"Page 2 Tables: {len(tables)}")
        for idx, t in enumerate(tables):
            print(f"  Table {idx+1}: {len(t)} rows")
            for r in t[:5]:
                print(f"    {r}")

if __name__ == "__main__":
    import sys
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass
    check_pdf(r"c:\Users\dell\Downloads\finexis_frontend\python_scripts\pdfs\BANK\ICICI_current.pdf")
    check_pdf(r"c:\Users\dell\Downloads\finexis_frontend\python_scripts\pdfs\BANK\HDFC.pdf")
