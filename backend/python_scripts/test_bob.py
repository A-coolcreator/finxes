import pdfplumber
import json

def extract_two_columns_from_page(pdf_page):
    if not pdf_page:
        return None
    words = pdf_page.extract_words()
    if not words:
        return None

    lines_dict = {}
    for w in words:
        top = w['top']
        matched_top = None
        for t in lines_dict.keys():
            if abs(t - top) < 3.0:
                matched_top = t
                break
        if matched_top is None:
            lines_dict[top] = [w]
        else:
            lines_dict[matched_top].append(w)

    sorted_tops = sorted(lines_dict.keys())
    mid_x = 320.0  # Safe middle threshold for A4 page width

    reconstructed_lines = []
    for top in sorted_tops:
        line_words = sorted(lines_dict[top], key=lambda w: w['x0'])
        left_words = [w['text'] for w in line_words if w['x0'] < mid_x]
        right_words = [w['text'] for w in line_words if w['x0'] >= mid_x]
        left_str = " ".join(left_words).strip()
        right_str = " ".join(right_words).strip()
        reconstructed_lines.append((left_str, right_str))
        
    return reconstructed_lines

# Read the BOB PDF and print the reconstructed lines to test_out.txt
pdf_path = r"c:\Users\dell\Downloads\finexis_frontend\python_scripts\pdfs\BANK\BOB.pdf"
with pdfplumber.open(pdf_path) as pdf:
    page = pdf.pages[0]
    cols = extract_two_columns_from_page(page)
    with open("test_out.txt", "w", encoding="utf-8") as f:
        f.write(json.dumps(cols, indent=2))
print("Done")
