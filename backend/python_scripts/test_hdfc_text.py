import pdfplumber

pdf_path = r"c:\Users\dell\Downloads\finexis_frontend\python_scripts\pdfs\BANK\HDFC.pdf"
with pdfplumber.open(pdf_path) as pdf:
    first_page_text = pdf.pages[0].extract_text() or ""
    with open("hdfc_text.txt", "w", encoding="utf-8") as f:
        f.write(first_page_text)
print("Done")
