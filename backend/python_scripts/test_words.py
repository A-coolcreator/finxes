import pdfplumber
import json

pdf_path = r"c:\Users\dell\Downloads\finexis_frontend\python_scripts\pdfs\BANK\BOB.pdf"
with pdfplumber.open(pdf_path) as pdf:
    words = pdf.pages[0].extract_words()
    # Filter only words from the top part (top < 300)
    top_words = [w for w in words if w['top'] < 300]
    
    # Sort them by top, then x0
    top_words = sorted(top_words, key=lambda w: (w['top'], w['x0']))
    
    # Format them nicely
    lines = {}
    for w in top_words:
        top = w['top']
        matched_top = None
        for t in lines.keys():
            if abs(t - top) < 3.0:
                matched_top = t
                break
        if matched_top is None:
            lines[top] = [w]
        else:
            lines[matched_top].append(w)
            
    output = []
    for t in sorted(lines.keys()):
        line_words = sorted(lines[t], key=lambda w: w['x0'])
        line_str = " | ".join(["{} ({:.1f}-{:.1f})".format(w['text'], w['x0'], w['x1']) for w in line_words])
        output.append("Top {:.1f}: {}".format(t, line_str))
        
    with open("words_out.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(output))
print("Done")
