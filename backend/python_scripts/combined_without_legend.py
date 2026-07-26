import os
import sys
import re
import pdfplumber
import pandas as pd

# ==========================================
# ENGINE 1: TEXT-FLOW & REGEX (Best for ICICI / Kotak)
# ==========================================
def parse_text_flow_engine(pdf_path):
    all_lines = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                for line in text.split('\n'):
                    if line.strip():
                        all_lines.append(line.strip())

    # Tracks: S_No, Date (DD.MM.YYYY, DD/MM/YYYY, or DD MMM YYYY), [Optional Cheque No], Amount_1, Amount_2 (Balance)
    data_pattern = re.compile(r"^(\d+)\s+(\d{2}[\.\/\-]\d{2}[\.\/\-]\d{4}|\d{2}\s+[A-Za-z]{3}\s+\d{4})(?:\s+(\S+))?\s+([\d\.,\-]+)\s+([\d\.,\-]+)$")
    data_indices = [i for i, line in enumerate(all_lines) if data_pattern.match(line)]
    
    transactions = []
    prev_balance = None
    
    IGNORE_KEYWORDS = [
        "statement of", "saving account", "balance (inr)", "amount (inr)", 
        "transaction remarks", "s no.", "page ", "commonly used narrations", 
        "legends for transactions", "statement generated on", "account statement"
    ]

    for idx_cursor, line_idx in enumerate(data_indices):
        current_line = all_lines[line_idx]
        match = data_pattern.match(current_line)
        s_no, date, cheque, val1, val2 = match.groups()
        cheque = cheque if cheque else ""

        # Gather Title (line right before transaction numbers)
        title = ""
        if line_idx > 0:
            potential_title = all_lines[line_idx - 1]
            pt_lower = potential_title.lower()
            if not any(kw in pt_lower for kw in IGNORE_KEYWORDS) and not data_pattern.match(potential_title):
                title = potential_title

        # Gather wrapped continuation description text block safely
        end_remark_idx = len(all_lines)
        if idx_cursor + 1 < len(data_indices):
            end_remark_idx = data_indices[idx_cursor + 1] - 1 
            
        raw_continuation_lines = all_lines[line_idx + 1 : end_remark_idx]
        
        cleaned_continuation = []
        for line in raw_continuation_lines:
            line_lower = line.lower()
            if "commonly used narrations" in line_lower or "legends for transactions" in line_lower:
                break
            if any(kw in line_lower for kw in ["statement generated on", "page of", "account no.", "account statement"]):
                continue
            cleaned_continuation.append(line)

        full_remarks = " ".join([title] + cleaned_continuation).strip()

        # Deduce Withdrawal vs Deposit columns based on running balance math
        try:
            v1_num = float(val1.replace(',', '').replace('-', ''))
            v2_num = float(val2.replace(',', '').replace('-', ''))
            if prev_balance is None:
                withdrawal, deposit = "", v1_num
                prev_balance = v2_num
            else:
                if abs((prev_balance + v1_num) - v2_num) < 0.05:
                    withdrawal, deposit = "", v1_num
                elif abs((prev_balance - v1_num) - v2_num) < 0.05:
                    withdrawal, deposit = v1_num, ""
                else:
                    withdrawal, deposit = (v1_num, "") if v2_num < prev_balance else ("", v1_num)
                prev_balance = v2_num
        except:
            withdrawal, deposit = val1, ""

        transactions.append({
            "S No.": s_no,
            "Transaction Date": date,
            "Cheque Number": cheque,
            "Transaction Remarks": full_remarks,
            "Withdrawal Amount": withdrawal,
            "Deposit Amount": deposit,
            "Balance": val2
        })

    if not transactions:
        return None
    return pd.DataFrame(transactions)


# ==========================================
# ENGINE 2: STRUCTURAL TABULAR GRID
# ==========================================
def parse_tabular_grid_engine(pdf_path):
    all_rows = []
    headers = None
    VALID_KEYWORDS = {'date', 'description', 'amount', 'balance', 'transaction', 'details', 'withdrawal', 'deposit'}
    IGNORE_TABLES = {"commonly used narrations", "legends for transactions"}
    
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            tables = page.extract_tables({"vertical_strategy": "lines", "horizontal_strategy": "lines", "snap_tolerance": 3})
            if not tables:
                tables = page.extract_tables({"vertical_strategy": "text", "horizontal_strategy": "text"})

            for table in tables:
                if not table:
                    continue
                
                table_text_sample = " ".join([str(cell) for row in table for cell in row if cell]).lower()
                if any(legend_kw in table_text_sample for legend_kw in IGNORE_TABLES):
                    continue  
                
                for row in table:
                    cleaned_row = [str(cell).strip().replace('\n', ' ') if cell is not None else "" for cell in row]
                    if not any(cleaned_row) or len([c for c in cleaned_row if c]) <= 1:
                        continue
                    
                    if any(kw in " ".join(cleaned_row).lower() for kw in VALID_KEYWORDS) and headers is None:
                        headers = [c if c else f"Column_{i}" for i, c in enumerate(cleaned_row)]
                        continue
                    
                    if headers:
                        if len(cleaned_row) == len(headers): all_rows.append(cleaned_row)
                        elif len(cleaned_row) > len(headers): all_rows.append(cleaned_row[:len(headers)])
                        else: all_rows.append(cleaned_row + [""] * (len(headers) - len(cleaned_row)))
                        
    if not headers or not all_rows:
        return None
    return pd.DataFrame(all_rows, columns=headers)


# ==========================================
# MAIN ROUTER LOGIC
# ==========================================
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage error! Correct format: python script.py <path_to_pdf_file>")
        sys.exit(1)
            
    # Correctly grab the file path string from the arguments
    pdf_file = sys.argv[1]
    df_statement = None
    
    try:
        bank_signature = ""
        with pdfplumber.open(pdf_file) as pdf:
            # FIXED: Added [0] to extract text specifically from the first page object
            if pdf.pages:
                first_page_text = pdf.pages[0].extract_text() or ""
                if "icici" in first_page_text.lower():
                    bank_signature = "ICICI"
                elif "kotak" in first_page_text.lower():
                    bank_signature = "KOTAK"

        if bank_signature in ["ICICI", "KOTAK"]:
            print(f"[➔] {bank_signature} signature identified. Launching Text-Flow Engine...")
            df_statement = parse_text_flow_engine(pdf_file)
        else:
            print("[➔] Generic layout detected. Running Tabular Grid Engine...")
            df_statement = parse_tabular_grid_engine(pdf_file)
            
            if df_statement is None or df_statement.empty:
                print("[!] Grid method returned empty. Running Text-Flow fallback...")
                df_statement = parse_text_flow_engine(pdf_file)

        if df_statement is not None and not df_statement.empty:
            output_folder = "csv"
            os.makedirs(output_folder, exist_ok=True)
            
            base_filename = os.path.splitext(os.path.basename(pdf_file))[0]
            destination_path = os.path.join(output_folder, f"{base_filename}.csv")
            
            df_statement.to_csv(destination_path, index=False)
            print(f"[✔] Parsing Complete! Saved {len(df_statement)} rows into: {destination_path}")
        else:
            print("[✘] Error: Transactions could not be extracted. Verify your PDF has an active text layer.")

    except FileNotFoundError:
        print(f"Error: The file '{pdf_file}' was not found.")
    except Exception as e:
        print(f"Error processing PDF: {e}")
