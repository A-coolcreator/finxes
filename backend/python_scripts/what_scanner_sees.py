import sys
import pdfplumber

# Check if a file path was provided
if len(sys.argv) < 2:
    print("Usage error! Correct format: python script.py <path_to_pdf_file>")
    sys.exit(1)

pdf_file = sys.argv[1]

with pdfplumber.open(pdf_file) as pdf:
    # Print just the first 5000 characters of text from page 1
    print(pdf.pages[0].extract_text()[:5000])
