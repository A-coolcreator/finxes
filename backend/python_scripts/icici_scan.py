import os
import sys
import re
import pdfplumber
import pandas as pd

def parse_icici_raw_text(pdf_path):
    print(f"Opening ICICI Statement: {os.path.basename(pdf_path)}...")
    
    # 1. Extract clean raw text lines from all pages
    all_lines = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                for line in text.split('\n'):
                    if line.strip():
                        all_lines.append(line.strip())

    # 2. Regex to target the main numeric transaction row
    # Pattern tracks: S_No, Date, [Optional Cheque No], Amount_1, Amount_2 (Balance)
    data_pattern = re.compile(r"^(\d+)\s+(\d{2}\.\d{2}\.\d{4})(?:\s+(\S+))?\s+([\d\.,]+)\s+([\d\.,]+)$")
    
    # Find positions of all data lines
    data_indices = [i for i, line in enumerate(all_lines) if data_pattern.match(line)]
    
    transactions = []
    prev_balance = None
    
    # Keywords to prevent page headers/footers from being mistaken for transaction text
    IGNORE_KEYWORDS = ["statement of", "saving account", "balance (inr)", "amount (inr)", "transaction remarks", "s no.", "page"]

    for idx_cursor, line_idx in enumerate(data_indices):
        current_line = all_lines[line_idx]
        match = data_pattern.match(current_line)
        s_no, date, cheque, val1, val2 = match.groups()
        cheque = cheque if cheque else ""

        # A. Look-back: The line immediately before the data row is the transaction Title
        title = ""
        if line_idx > 0:
            potential_title = all_lines[line_idx - 1]
            title_lower = potential_title.lower()
            if not any(kw in title_lower for kw in IGNORE_KEYWORDS) and not data_pattern.match(potential_title):
                title = potential_title

        # B. Look-ahead: Gather continuation description lines until the next transaction block starts
        end_remark_idx = len(all_lines)
        if idx_cursor + 1 < len(data_indices):
            next_data_idx = data_indices[idx_cursor + 1]
            # Next transaction's title is at next_data_idx - 1, so read up to that
            end_remark_idx = next_data_idx - 1 
            
        continuation_lines = all_lines[line_idx + 1 : end_remark_idx]
        
        # C. Stitch the full remarks block together
        remarks_components = []
        if title:
            remarks_components.append(title)
        remarks_components.extend(continuation_lines)
        full_remarks = " ".join(remarks_components).strip()

        # D. Smart Balance Math: Determine if val1 is a Withdrawal or Deposit
        try:
            v1_num = float(val1.replace(',', ''))
            v2_num = float(val2.replace(',', ''))
            
            if prev_balance is None:
                # If first row and values match, it's a deposit opening from a 0 balance
                if abs(v1_num - v2_num) < 0.05:
                    withdrawal, deposit = "", v1_num
                else:
                    withdrawal, deposit = "", v1_num  # Default fallback
                prev_balance = v2_num
            else:
                # If previous balance + current amount == current balance -> Deposit
                if abs((prev_balance + v1_num) - v2_num) < 0.05:
                    withdrawal, deposit = "", v1_num
                # If previous balance - current amount == current balance -> Withdrawal
                elif abs((prev_balance - v1_num) - v2_num) < 0.05:
                    withdrawal, deposit = v1_num, ""
                else:
                    # Fallback guess based on direction
                    if v2_num > prev_balance:
                        withdrawal, deposit = "", v1_num
                    else:
                        withdrawal, deposit = v1_num, ""
                prev_balance = v2_num
        except Exception:
            withdrawal, deposit = val1, ""

        transactions.append({
            "S No.": s_no,
            "Transaction Date": date,
            "Cheque Number": cheque,
            "Transaction Remarks": full_remarks,
            "Withdrawal Amount (INR)": withdrawal,
            "Deposit Amount (INR)": deposit,
            "Balance (INR)": val2
        })

    if not transactions:
        raise ValueError("No valid transaction patterns found matching the ICICI text structure.")

    return pd.DataFrame(transactions)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage error! Correct format: python script.py <path_to_pdf_file>")
        sys.exit(1)
            
    pdf_file = sys.argv[1]
    try:
        df_statement = parse_icici_raw_text(pdf_file)
        
        output_folder = "csv"
        os.makedirs(output_folder, exist_ok=True)
        
        base_filename = os.path.splitext(os.path.basename(pdf_file))[0]
        destination_path = os.path.join(output_folder, f"{base_filename}.csv")
        
        df_statement.to_csv(destination_path, index=False)
        print(f"\n[✔] Cleanly compiled {len(df_statement)} transactions into: {destination_path}")
        
    except FileNotFoundError:
        print(f"Error: The file '{pdf_file}' was not found.")
    except Exception as e:
        print(f"Error processing PDF: {e}")
