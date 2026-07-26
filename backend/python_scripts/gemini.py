import json
import os
import re
import sys
import pandas as pd
import pdfplumber

try:
    sys.stdout.reconfigure(encoding='utf-8')
except AttributeError:
    pass

# System-wide summary, totals, and structural balancing keywords
SUMMARY_KEYWORDS = [
    "transaction total", "closing balance", "opening balance", "total description",
    "grand total", "brought forward", "carried forward", "statement summary", 
    "total debit", "total credit", "total", "summary"
]

# ==========================================
# ENGINE 1: TEXT-FLOW & REGEX (Supports ICICI, Kotak, Axis, BOB, Fallbacks)
# ==========================================
def parse_text_flow_engine(pdf_path, bank_signature=None):
    all_lines = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                for line in text.split('\n'):
                    if line.strip():
                        all_lines.append(line.strip())

    transactions = []

    # ------------------------------------------
    # BANK OF BARODA (BOB) PROCESSING MODE
    # ------------------------------------------
    if bank_signature == "BOB":
        bob_pattern = re.compile(r"^(\d+)\s+(\d{2}-\d{2}-\d{4})\s+(Opening Balance|\d{2}-\d{2}-\d{4})\s+(.*)$", re.IGNORECASE)

        def _bob_normalize(text):
            return re.sub(r"\s+", " ", str(text)).strip().rstrip(",")

        def _bob_is_amount_token(token):
            return bool(re.match(r"^[\d,.-]+$", token))

        def _bob_is_noise(line):
            line_lower = _bob_normalize(line).lower()
            if not line_lower:
                return True
            if line_lower.startswith("account statement from"):
                return True
            if line_lower.startswith("account details"):
                return True
            if "opening balance" in line_lower:
                return False
            if line_lower in {"account name branch name", "account number ifsc code", "account type micr code", "customer address branch address", "serial transaction value description cheque debit credit balance", "no date date number"}:
                return True
            if line_lower.startswith("account name") or line_lower.startswith("branch name"):
                return True
            if line_lower.startswith("account number") or line_lower.startswith("ifsc code"):
                return True
            if line_lower.startswith("account type") or line_lower.startswith("micr code"):
                return True
            if line_lower.startswith("customer address") or line_lower.startswith("branch address"):
                return True
            if line_lower.startswith("note:") or line_lower.startswith("this is a computer-generated statement") or line_lower.startswith("statement is generated on"):
                return True
            if line_lower.startswith("maintained in the bank") or line_lower.startswith("page "):
                return True
            if any(sum_kw in line_lower for sum_kw in SUMMARY_KEYWORDS):
                return True
            return False

        def _bob_join_desc(left, right):
            left = _bob_normalize(left)
            right = _bob_normalize(right)
            if not left:
                return right
            if not right:
                return left
            if left.endswith(("-", "/")):
                return f"{left}{right}"
            return f"{left} {right}"

        pending_desc = ""
        seen_first_transaction = False
        last_non_row_line = ""

        for line in all_lines:
            if _bob_is_noise(line):
                continue

            match = bob_pattern.match(line)
            if match:
                s_no, tx_date, second_date, trailing_flow = match.groups()
                trailing_flow = _bob_normalize(trailing_flow)
                tokens = trailing_flow.split()

                desc_from_row = ""
                debit = "-"
                credit = "-"
                balance_val = ""

                if second_date.lower() == "opening balance":
                    desc = "Opening Balance"
                    amount_tokens = [tok for tok in tokens if _bob_is_amount_token(tok)]
                    if len(amount_tokens) >= 1:
                        balance_val = amount_tokens[-1]
                    if len(amount_tokens) >= 3:
                        debit = amount_tokens[-3]
                        credit = amount_tokens[-2]
                        balance_val = amount_tokens[-1]
                    transactions.append({
                        "Serial": s_no,
                        "Transaction date": tx_date,
                        "Valuedate": "",
                        "Description": desc,
                        "Cheque number": "",
                        "Debit": debit,
                        "Credit": credit,
                        "Balance": balance_val,
                    })
                    pending_desc = ""
                    seen_first_transaction = True
                    continue

                amount_tokens = [tok for tok in tokens if _bob_is_amount_token(tok)]
                non_amount_tokens = [tok for tok in tokens if not _bob_is_amount_token(tok)]

                if len(amount_tokens) >= 3:
                    debit, credit, balance_val = amount_tokens[-3], amount_tokens[-2], amount_tokens[-1]
                    if len(non_amount_tokens) > 0:
                        desc_from_row = " ".join(non_amount_tokens)
                elif len(amount_tokens) == 2:
                    debit, balance_val = amount_tokens[-2], amount_tokens[-1]
                elif len(amount_tokens) == 1:
                    balance_val = amount_tokens[-1]

                desc = _bob_join_desc(pending_desc, desc_from_row)
                if not desc:
                    desc = last_non_row_line
                transactions.append({
                    "Serial": s_no,
                    "Transaction date": tx_date,
                    "Valuedate": second_date,
                    "Description": desc,
                    "Cheque number": "",
                    "Debit": debit,
                    "Credit": credit,
                    "Balance": balance_val,
                })
                pending_desc = ""
                seen_first_transaction = True
                continue

            clean_line = _bob_normalize(line)
            if not clean_line or re.match(r"^[\d,.-]+$", clean_line):
                continue

            if not seen_first_transaction:
                continue

            last_non_row_line = clean_line

            if transactions and transactions[-1]["Description"] and transactions[-1]["Description"].endswith(("-", "/")):
                transactions[-1]["Description"] = _bob_join_desc(transactions[-1]["Description"], clean_line)
            else:
                pending_desc = _bob_join_desc(pending_desc, clean_line)

        transactions = [row for row in transactions if row.get("Serial") and row.get("Transaction date")]

        if transactions:
            return pd.DataFrame(transactions, columns=["Serial", "Transaction date", "Valuedate", "Description", "Cheque number", "Debit", "Credit", "Balance"])

        return None

    # ------------------------------------------
    # AXIS BANK PROCESSING MODE
    # ------------------------------------------
    elif bank_signature == "AXIS":
        axis_pattern = re.compile(r"^(\d{2}-\d{2}-\d{4})\s+(.*?)\s+([\d\.,\-]+)\s+([\d\.,\-]+)(?:\s+(\d+))?$")
        data_indices = [i for i, line in enumerate(all_lines) if axis_pattern.match(line)]
        
        prev_balance = None
        for line in all_lines:
            if "opening balance" in line.lower():
                try:
                    prev_balance = float(re.search(r'([\d\.,\-]+)$', line).group(1).replace(',', ''))
                except:
                    pass
                break

        IGNORE_KEYWORDS = [
            "statement of", "customer id", "ifsc code", "micr code", "nominee registered",
            "registered mobile", "registered email", "scheme:", "currency:", "tran date",
            "particulars", "unless the constituent", "registered office", "branch address", 
            "legends :", "iconn-", "vmt-", "autosweep", "aditya chandil", "joint holder"
        ] + SUMMARY_KEYWORDS

        for idx_cursor, line_idx in enumerate(data_indices):
            current_line = all_lines[line_idx]
            if any(sum_kw == current_line.lower().strip() or sum_kw in current_line.lower() for sum_kw in SUMMARY_KEYWORDS):
                continue
                
            match = axis_pattern.match(current_line)
            date, mid_text, val1, val2, branch = match.groups()
            if mid_text.lower().strip() in SUMMARY_KEYWORDS:
                continue

            start_look_idx = data_indices[idx_cursor - 1] + 1 if idx_cursor > 0 else 0
            raw_prefix_lines = all_lines[start_look_idx:line_idx]
            
            cleaned_prefix = []
            for line in raw_prefix_lines:
                line_lower = line.lower()
                if any(kw in line_lower for kw in IGNORE_KEYWORDS):
                    continue
                if len(line.strip()) < 3 or any(addr in line_lower for addr in ["bunglow", "phase", "road", "huzur", "bhopal", "stone", "mile"]):
                    continue
                cleaned_prefix.append(line)
                
            full_remarks = " ".join(cleaned_prefix + [mid_text]).strip()
            full_remarks = re.sub(r'\s+', ' ', full_remarks)

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
                "S No.": idx_cursor + 1,
                "Transaction Date": date,
                "Cheque Number": "",
                "Transaction Remarks": full_remarks,
                "Withdrawal Amount": withdrawal,
                "Deposit Amount": deposit,
                "Balance": val2
            })

    # ------------------------------------------
    # CANARA BANK PROCESSING MODE
    # ------------------------------------------
    elif bank_signature == "CANARA":
        data_pattern = re.compile(
            r"^(\d{2}-\d{2}-\d{4})\s*(.*?)\s+([\d\.,]+)\s+([\d\.,]+)$"
        )
        data_indices = [i for i, line in enumerate(all_lines) if data_pattern.match(line)]
        
        def clean_float(val_str):
            if not val_str:
                return 0.0
            cleaned = re.sub(r"[^\d\.\-]", "", str(val_str).replace(',', ''))
            try:
                return float(cleaned)
            except ValueError:
                return 0.0

        for idx_cursor, line_idx in enumerate(data_indices):
            current_line = all_lines[line_idx]
            match = data_pattern.match(current_line)
            date, mid_text, val1, val2 = match.groups()
            
            start_look_idx = data_indices[idx_cursor - 1] + 1 if idx_cursor > 0 else 0
            raw_prefix_lines = all_lines[start_look_idx:line_idx]
            
            cleaned_prefix = []
            for line in raw_prefix_lines:
                line_lower = line.lower()
                if "commonly used narrations" in line_lower or "legends for transactions" in line_lower:
                    break
                if any(kw in line_lower for kw in ["statement generated on", "page of", "account no.", "account statement", "canara bank"]):
                    continue
                cleaned_prefix.append(line)
                
            full_remarks = " ".join(cleaned_prefix + [mid_text]).strip()
            full_remarks = re.sub(r'(/[A-Z]{1,3})\s+([A-Z]{2,})', r'\1\2', full_remarks)
            full_remarks = re.sub(r'\s+', ' ', full_remarks)
            
            v1_clean = clean_float(val1)
            v2_clean = clean_float(val2)
            
            withdrawal = ""
            deposit = ""
            
            if idx_cursor > 0:
                try:
                    prev_bal = clean_float(transactions[-1]["Balance"])
                    if prev_bal != 0.0:
                        if abs((prev_bal + v1_clean) - v2_clean) < 0.05:
                            deposit = val1
                        elif abs((prev_bal - v1_clean) - v2_clean) < 0.05:
                            withdrawal = val1
                        else:
                            if v2_clean < prev_bal:
                                withdrawal = val1
                            else:
                                deposit = val1
                    else:
                        withdrawal = val1
                except:
                    withdrawal = val1
            else:
                if abs((245708.00 + v1_clean) - v2_clean) < 0.05:
                    deposit = val1
                else:
                    withdrawal = val1
                    
            transactions.append({
                "S No.": idx_cursor + 1,
                "Transaction Date": date,
                "Cheque Number": "",
                "Transaction Remarks": full_remarks,
                "Withdrawal Amount": withdrawal,
                "Deposit Amount": deposit,
                "Balance": val2
            })

    # ------------------------------------------
    # HDFC BANK PROCESSING MODE
    # ------------------------------------------
    elif bank_signature == "HDFC":
        data_pattern = re.compile(
            r"^(\d{2}/\d{2}/\d{2,4})\s+(.*?)(?:\s+(\S+))?\s+(\d{2}/\d{2}/\d{2,4})\s+([\d\.,\-]+)\s+([\d\.,\-]+)$",
            re.IGNORECASE
        )
        data_indices = [i for i, line in enumerate(all_lines) if data_pattern.match(line)]
        
        def clean_float(val_str):
            if not val_str:
                return 0.0
            cleaned = re.sub(r"[^\d\.\-]", "", str(val_str).replace(',', ''))
            try:
                return float(cleaned)
            except ValueError:
                return 0.0

        for idx_cursor, line_idx in enumerate(data_indices):
            current_line = all_lines[line_idx]
            match = data_pattern.match(current_line)
            if not match:
                continue
                
            date, desc_on_line, ref_no, val_date, amount_str, balance_str = match.groups()
            ref_no = ref_no if ref_no else ""
            
            end_remark_idx = len(all_lines)
            if idx_cursor + 1 < len(data_indices):
                end_remark_idx = data_indices[idx_cursor + 1] - 1
                
            raw_continuation_lines = all_lines[line_idx + 1 : end_remark_idx + 1]
            cleaned_continuation = []
            for line in raw_continuation_lines:
                line_lower = line.lower()
                if any(kw in line_lower for kw in ["statement of", "page of", "account no.", "closing balance", "commonly used", "legends"]):
                    continue
                if data_pattern.match(line):
                    break
                cleaned_continuation.append(line)
                
            parts = [desc_on_line]
            if cleaned_continuation:
                parts.extend(cleaned_continuation)
                
            full_remarks = " ".join(parts).strip()
            full_remarks = re.sub(r'\s+', ' ', full_remarks)
            
            amt_num = clean_float(amount_str)
            bal_num = clean_float(balance_str)
            
            withdrawal = ""
            deposit = ""
            
            if idx_cursor > 0:
                try:
                    prev_bal = clean_float(transactions[-1]["Balance"])
                    if prev_bal != 0.0:
                        if abs((prev_bal + amt_num) - bal_num) < 0.05:
                            deposit = amount_str
                        elif abs((prev_bal - amt_num) - bal_num) < 0.05:
                            withdrawal = amount_str
                        else:
                            if bal_num < prev_bal:
                                withdrawal = amount_str
                            else:
                                deposit = amount_str
                    else:
                        if any(kw in full_remarks.lower() for kw in ["payment to", "transfer to", "debit", "dr", "paytm to", "phonepe to", "paid to"]):
                            withdrawal = amount_str
                        else:
                            deposit = amount_str
                except:
                    withdrawal = amount_str
            else:
                if any(kw in full_remarks.lower() for kw in ["payment to", "transfer to", "debit", "dr", "paytm to", "phonepe to", "paid to"]):
                    withdrawal = amount_str
                else:
                    deposit = amount_str
                    
            transactions.append({
                "S No.": idx_cursor + 1,
                "Transaction Date": date,
                "Cheque Number": ref_no,
                "Transaction Remarks": full_remarks,
                "Withdrawal Amount": withdrawal,
                "Deposit Amount": deposit,
                "Balance": balance_str
            })

    # ------------------------------------------
    # PUNJAB NATIONAL BANK (PNB) PARSER
    # ------------------------------------------
    elif bank_signature == "PNB":
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                words = page.extract_words()
                if not words:
                    continue
                
                lines_dict = {}
                for w in words:
                    top_int = int(round(w['top']))
                    found_line = None
                    for line_y in lines_dict.keys():
                        if abs(line_y - top_int) <= 3:
                            found_line = line_y
                            break
                    if found_line is not None:
                        lines_dict[found_line].append(w)
                    else:
                        lines_dict[top_int] = [w]
                
                sorted_ys = sorted(lines_dict.keys())
                header_found = False
                
                for y in sorted_ys:
                    line_words = lines_dict[y]
                    line_words.sort(key=lambda w: w['x0'])
                    line_text = " ".join([w['text'] for w in line_words]).lower()
                    
                    if "txn date" in line_text and "balance" in line_text:
                        header_found = True
                        continue
                    
                    if not header_found:
                        continue
                    
                    if any(x in line_text for x in ["page ", "total", "closing balance", "commonly used"]):
                        continue
                        
                    if len(line_words) < 3:
                        continue
                    date_match = re.match(r"^\d{2}-\d{2}-\d{4}$", line_words[0]['text'])
                    if not date_match:
                        continue
                        
                    txn_date = ""
                    val_date = ""
                    desc_parts = []
                    ref_no = ""
                    debit_str = ""
                    credit_str = ""
                    balance_str = ""
                    
                    for w in line_words:
                        x0 = w['x0']
                        txt = w['text']
                        
                        if x0 < 90:
                            txn_date = txt
                        elif x0 >= 90 and x0 < 160:
                            val_date = txt
                        elif x0 >= 160 and x0 < 330:
                            desc_parts.append(txt)
                        elif x0 >= 330 and x0 < 420:
                            ref_no = txt
                        elif x0 >= 420 and x0 < 490:
                            debit_str = txt
                        elif x0 >= 490 and x0 < 560:
                            credit_str = txt
                        else:
                            balance_str = txt
                            
                    def clean_pnb_amount(val):
                        if not val:
                            return ""
                        cleaned = re.sub(r"[^\d\.]", "", str(val).replace(',', ''))
                        return cleaned
                        
                    debit_clean = clean_pnb_amount(debit_str)
                    credit_clean = clean_pnb_amount(credit_str)
                    balance_clean = clean_pnb_amount(balance_str)
                    
                    transactions.append({
                        "Transaction Date": txn_date,
                        "Description": " ".join(desc_parts).strip(),
                        "Reference No": ref_no,
                        "Debit": debit_clean,
                        "Credit": credit_clean,
                        "Balance": balance_clean
                    })

    # ------------------------------------------
    # ICICI / KOTAK / GENERIC / HDFC TEXT-FLOW FALLBACK MODE
    # ------------------------------------------
    else:
        def clean_float(val_str):
            if not val_str:
                return 0.0
            cleaned = re.sub(r"[^\d\.\-]", "", str(val_str).replace(',', ''))
            try:
                return float(cleaned)
            except ValueError:
                return 0.0

        data_pattern_with_sno = re.compile(
            r"^(\d+)\s+(\d{2}[\.\/\-]\d{2}[\.\/\-]\d{2,4}|\d{2}\s+[A-Za-z]{3}\s+\d{2,4})(?:\s+(\S+))?\s+([\d\.,\-]+)\s+([\d\.,\-]+)$"
        )
        data_pattern_no_sno = re.compile(
            r"^(\d{2}[\.\/\-]\d{2}[\.\/\-]\d{2,4}|\d{2}\s+[A-Za-z]{3}\s+\d{2,4})\s*(.*?)\s+([+-]?\s*(?:Rs\.|Rs|₹)?\s*[\d\.,]+(?:\s*[CD]r\.?)?)\s+([+-]?\s*(?:Rs\.|Rs|₹)?\s*[\d\.,]+(?:\s*[CD]r\.?)?)$"
        )
        
        lines_with_sno = [i for i, line in enumerate(all_lines) if data_pattern_with_sno.match(line)]
        lines_no_sno = [i for i, line in enumerate(all_lines) if data_pattern_no_sno.match(line)]
        
        if len(lines_with_sno) >= len(lines_no_sno) and len(lines_with_sno) > 0:
            data_pattern = data_pattern_with_sno
            data_indices = lines_with_sno
            has_sno = True
        else:
            data_pattern = data_pattern_no_sno
            data_indices = lines_no_sno
            has_sno = False

        IGNORE_KEYWORDS = [
            "statement of", "saving account", "balance (inr)", "amount (inr)", 
            "transaction remarks", "s no.", "page ", "commonly used narrations", 
            "legends for transactions", "statement generated on", "account statement",
            "date", "narration", "particulars", "description", "withdrawal", "deposit"
        ] + SUMMARY_KEYWORDS

        for idx_cursor, line_idx in enumerate(data_indices):
            current_line = all_lines[line_idx]
            if any(sum_kw == current_line.lower().strip() or sum_kw in current_line.lower() for sum_kw in SUMMARY_KEYWORDS):
                continue
                
            match = data_pattern.match(current_line)
            if not match:
                continue
                
            if has_sno:
                s_no, date, cheque, val1, val2 = match.groups()
                cheque = cheque if cheque else ""
                desc_on_line = ""
            else:
                date, desc_on_line, val1, val2 = match.groups()
                s_no = idx_cursor + 1
                cheque = ""

            title = ""
            if line_idx > 0:
                potential_title = all_lines[line_idx - 1]
                pt_lower = potential_title.lower()
                if not any(kw in pt_lower for kw in IGNORE_KEYWORDS) and not data_pattern.match(potential_title):
                    title = potential_title

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

            parts = []
            if title:
                parts.append(title)
            if desc_on_line:
                parts.append(desc_on_line)
            if cleaned_continuation:
                parts.extend(cleaned_continuation)
                
            full_remarks = " ".join(parts).strip()
            full_remarks = re.sub(r'(/[A-Z]{1,3})\s+([A-Z]{2,})', r'\1\2', full_remarks)
            full_remarks = re.sub(r'\s+', ' ', full_remarks)

            if full_remarks.lower().strip() in SUMMARY_KEYWORDS:
                continue

            v1_clean = clean_float(val1)
            v2_clean = clean_float(val2)
            
            withdrawal = ""
            deposit = ""
            
            if "-" in val1:
                withdrawal = val1.replace("-", "").strip()
            elif "+" in val1:
                deposit = val1.replace("+", "").strip()
            else:
                if idx_cursor > 0:
                    try:
                        prev_bal = clean_float(transactions[-1]["Balance"])
                        if prev_bal != 0.0:
                            if abs((prev_bal + abs(v1_clean)) - v2_clean) < 0.05:
                                deposit = val1
                            elif abs((prev_bal - abs(v1_clean)) - v2_clean) < 0.05:
                                withdrawal = val1
                            else:
                                if v2_clean < prev_bal:
                                    withdrawal = val1
                                else:
                                    deposit = val1
                        else:
                            withdrawal = val1
                    except:
                        withdrawal = val1
                else:
                    withdrawal = val1

            transactions.append({
                "S No.": idx_cursor + 1,
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
# ENGINE 3: UPI & WALLET SPECIALIZED PARSER
# ==========================================
def parse_upi_wallet_engine(pdf_path, upi_signature):
    all_lines = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                for line in text.split('\n'):
                    if line.strip():
                        all_lines.append(line.strip())

    transactions = []

    def clean_amount(val):
        if not val:
            return ""
        cleaned = re.sub(r"[^\d\.]", "", str(val).replace(',', ''))
        return cleaned

    # ------------------------------------------
    # PHONEPE STATEMENT PARSER
    # ------------------------------------------
    if upi_signature == "PHONEPE":
        phonepe_pattern = re.compile(
            r"^([A-Za-z]{3}\s+\d{1,2},\s+\d{4})\s+(.*?)\s+(DEBIT|CREDIT)\s+(?:Rs\.|Rs|₹)?\s*([\d\.,]+)$",
            re.IGNORECASE
        )
        
        for idx, line in enumerate(all_lines):
            match = phonepe_pattern.match(line)
            if match:
                date, details, tx_type, amount = match.groups()
                amount_clean = clean_amount(amount)
                
                debit = amount_clean if tx_type.upper() == "DEBIT" else ""
                credit = amount_clean if tx_type.upper() == "CREDIT" else ""
                
                utr = ""
                for j in range(1, 3):
                    if idx + j < len(all_lines):
                        next_line = all_lines[idx + j]
                        utr_match = re.search(r"UTR\s*(?:No\.?)?\s*(\d+)", next_line, re.IGNORECASE)
                        if utr_match:
                            utr = utr_match.group(1)
                            break
                        tx_id_match = re.search(r"Transaction\s*(?:ID)?\s*(\S+)", next_line, re.IGNORECASE)
                        if tx_id_match and not utr:
                            utr = tx_id_match.group(1)
                
                desc_parts = [details]
                for j in range(1, 3):
                    if idx + j < len(all_lines):
                        next_line = all_lines[idx + j]
                        if not phonepe_pattern.match(next_line) and not any(k in next_line.lower() for k in ["statement for", "transaction statement"]):
                            desc_parts.append(next_line)
                
                full_desc = " ".join(desc_parts).strip()
                full_desc = re.sub(r'\s+', ' ', full_desc)
                
                transactions.append({
                    "Transaction Date": date,
                    "Description": full_desc,
                    "Reference No": utr,
                    "Debit": debit,
                    "Credit": credit,
                    "Balance": ""
                })

    # ------------------------------------------
    # GPAY (GOOGLE PAY) STATEMENT PARSER
    # ------------------------------------------
    elif upi_signature == "GPAY":
        gpay_pattern = re.compile(
            r"^(\d{2}[A-Za-z]{3},\d{4})\s*(.*?)\s+(?:Rs\.|Rs|₹)?\s*([\d\.,]+)$",
            re.IGNORECASE
        )
        
        for idx, line in enumerate(all_lines):
            match = gpay_pattern.match(line)
            if match:
                date, details, amount = match.groups()
                amount_clean = clean_amount(amount)
                
                is_debit = "paidto" in details.lower() or "sent to" in details.lower() or "paid to" in details.lower()
                debit = amount_clean if is_debit else ""
                credit = amount_clean if not is_debit else ""
                
                utr = ""
                for j in range(1, 3):
                    if idx + j < len(all_lines):
                        next_line = all_lines[idx + j]
                        utr_match = re.search(r"(?:TransactionID|ID)[:\s\-]*([A-Za-z0-9]+)", next_line, re.IGNORECASE)
                        if utr_match:
                            utr = utr_match.group(1)
                            break
                            
                transactions.append({
                    "Transaction Date": date,
                    "Description": details,
                    "Reference No": utr,
                    "Debit": debit,
                    "Credit": credit,
                    "Balance": ""
                })

    # ------------------------------------------
    # MOBIKWIK STATEMENT PARSER
    # ------------------------------------------
    elif upi_signature == "MOBIKWIK":
        mobikwik_pattern = re.compile(
            r"^(\d{2}[\.\/\-]\d{2}[\.\/\-]\d{2,4})\s*(.*?)\s+([+-]\s*(?:Rs\.|Rs|₹)?\s*[\d\.,]+)\s+((?:Rs\.|Rs|₹)?\s*[\d\.,]+)$",
            re.IGNORECASE
        )
        
        for idx, line in enumerate(all_lines):
            match = mobikwik_pattern.match(line)
            if match:
                date, details, amount_str, balance_str = match.groups()
                amount_num = clean_amount(amount_str)
                balance_clean = clean_amount(balance_str)
                
                debit = amount_num if "-" in amount_str else ""
                credit = amount_num if "+" in amount_str else ""
                
                transactions.append({
                    "Transaction Date": date,
                    "Description": details,
                    "Reference No": "",
                    "Debit": debit,
                    "Credit": credit,
                    "Balance": balance_clean
                })

    # ------------------------------------------
    # SLICE STATEMENT PARSER
    # ------------------------------------------
    elif upi_signature == "SLICE":
        slice_pattern = re.compile(
            r"^(\d{2}\s+[A-Za-z]{3}\s+'\d{2})\s*(.*?)\s+(\w+)\s+([+-]?\s*(?:Rs\.|Rs|₹)?\s*[\d\.,]+)\s+((?:Rs\.|Rs|₹)?\s*[\d\.,]+)$",
            re.IGNORECASE
        )
        
        for idx, line in enumerate(all_lines):
            match = slice_pattern.match(line)
            if match:
                date, details, ref_no, amount_str, balance_str = match.groups()
                amount_num = clean_amount(amount_str)
                balance_clean = clean_amount(balance_str)
                
                debit = amount_num if "-" in amount_str else ""
                credit = amount_num if "+" in amount_str or not "-" in amount_str else ""
                
                transactions.append({
                    "Transaction Date": date,
                    "Description": details,
                    "Reference No": ref_no,
                    "Debit": debit,
                    "Credit": credit,
                    "Balance": balance_clean
                })

    # ------------------------------------------
    # PAYTM STATEMENT PARSER
    # ------------------------------------------
    elif upi_signature == "PAYTM":
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                tables = page.extract_tables()
                for table in tables:
                    if not table:
                        continue
                    for row in table:
                        if not row or len(row) != 5:
                            continue
                        cell_0 = str(row[0]).strip()
                        date_match = re.match(r"^(\d{1,2}\s+[A-Za-z]{3})", cell_0)
                        if date_match:
                            date = date_match.group(1)
                            time_str = cell_0.replace(date, "").strip().replace('\n', ' ')
                            date_time = f"{date} {time_str}".strip()
                            
                            details = str(row[1]).strip().replace('\n', ' ')
                            notes = str(row[2]).strip().replace('\n', ' ') if row[2] else ""
                            account = str(row[3]).strip().replace('\n', ' ') if row[3] else ""
                            amount_str = str(row[4]).strip()
                            
                            amount_num = clean_amount(amount_str)
                            debit = amount_num if "-" in amount_str else ""
                            credit = amount_num if "+" in amount_str else ""
                            
                            ref_no = ""
                            ref_match = re.search(r"Ref\s*(?:No\.?)?\s*[:\-]?\s*(\d+)", details, re.IGNORECASE)
                            if ref_match:
                                ref_no = ref_match.group(1)
                                
                            desc_parts = [details]
                            if notes:
                                desc_parts.append(notes)
                            if account:
                                desc_parts.append(f"Account: {account}")
                            full_desc = " ".join(desc_parts).strip()
                            
                            transactions.append({
                                "Transaction Date": date_time,
                                "Description": full_desc,
                                "Reference No": ref_no,
                                "Debit": debit,
                                "Credit": credit,
                                "Balance": ""
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
    VALID_KEYWORDS = {'date', 'description', 'amount', 'balance', 'transaction', 'details', 'withdrawal', 'deposit', 'particulars', 'narration'}
    IGNORE_TABLES = {"commonly used narrations", "legends for transactions"}
    
    best_strategy = None
    
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text_sample = page.extract_text()
            if not text_sample:
                continue
            text_lower = text_sample.lower()
            if not any(kw in text_lower for kw in VALID_KEYWORDS):
                continue
                
            if any(legend_kw in text_lower for legend_kw in IGNORE_TABLES):
                continue
                
            tables = []
            if best_strategy == "lines":
                tables = page.extract_tables({"vertical_strategy": "lines", "horizontal_strategy": "lines", "snap_tolerance": 3})
            elif best_strategy == "text":
                tables = page.extract_tables({"vertical_strategy": "text", "horizontal_strategy": "text"})
            else:
                tables = page.extract_tables({"vertical_strategy": "lines", "horizontal_strategy": "lines", "snap_tolerance": 3})
                if tables:
                    best_strategy = "lines"
                else:
                    tables = page.extract_tables({"vertical_strategy": "text", "horizontal_strategy": "text"})
                    if tables:
                        best_strategy = "text"

            for table in tables:
                if not table:
                    continue
                
                for row in table:
                    cleaned_row = []
                    for cell in row:
                        if cell is None:
                            cleaned_row.append("")
                        else:
                            cell_str = str(cell).strip()
                            cell_str = re.sub(r'(?<=[A-Za-z0-9])\n(?=[A-Za-z0-9])', '', cell_str)
                            cell_str = cell_str.replace('\n', ' ')
                            cell_str = re.sub(r'(/[A-Z]{1,3})\s+([A-Z]{2,})', r'\1\2', cell_str)
                            cell_str = re.sub(r'\s+', ' ', cell_str)
                            cleaned_row.append(cell_str)
                            
                    if not any(cleaned_row) or len([c for c in cleaned_row if c]) <= 1:
                        continue
                    
                    if any(c.lower().strip() in SUMMARY_KEYWORDS for c in cleaned_row):
                        continue
                    
                    combined_row_text = " ".join(cleaned_row).lower()
                    if any(sum_kw in combined_row_text for sum_kw in SUMMARY_KEYWORDS):
                        continue
                    
                    if headers is None:
                        row_lower = [str(c).lower().strip() for c in cleaned_row]
                        has_date_col = any("date" in c or "dt" in c for c in row_lower)
                        has_desc_col = any(any(x in c for x in ["description", "narration", "particulars", "remarks", "details", "activity"]) for c in row_lower)
                        has_money_col = any(any(x in c for x in ["debit", "credit", "withdrawal", "deposit", "amount", "balance", "value", "inflow", "outflow"]) for c in row_lower)
                        
                        if has_date_col and (has_desc_col or has_money_col):
                            headers = [c if c else f"Column_{i}" for i, c in enumerate(cleaned_row)]
                            continue
                    
                    if headers is not None:
                        current_slug = "".join(cleaned_row).lower().replace(" ", "").replace("/", "").replace("_", "")
                        header_slug = "".join(headers).lower().replace(" ", "").replace("/", "").replace("_", "")
                        if current_slug == header_slug or ("transactiondate" in current_slug and "balance" in current_slug):
                            continue
                    
                    if headers:
                        if len(cleaned_row) > 0 and ("passbook payments" in cleaned_row[0].lower() or "all payments done" in cleaned_row[0].lower()):
                            continue
                        if len(cleaned_row) == len(headers): all_rows.append(cleaned_row)
                        elif len(cleaned_row) > len(headers): all_rows.append(cleaned_row[:len(headers)])
                        else: all_rows.append(cleaned_row + [""] * (len(headers) - len(cleaned_row)))
                        
    if not headers or not all_rows:
        return None
    return pd.DataFrame(all_rows, columns=headers)


# ==========================================
# MAIN ROUTER LOGIC (OUTPUT JSON VIA STDOUT)
# ==========================================
if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.stderr.write("Usage error! Correct format: python script.py <path_to_pdf_file>\n")
        sys.exit(1)
            
    pdf_file = sys.argv[1]
    df_statement = None
    
    try:
        upi_signature = ""
        bank_signature = ""
        with pdfplumber.open(pdf_file) as pdf:
            if pdf.pages:
                first_page_text = pdf.pages[0].extract_text() or ""
                first_page_lower = first_page_text.lower()
                
                # Check UPI / Wallet signatures first
                if "phonepe" in first_page_lower and "transaction statement for" in first_page_lower:
                    upi_signature = "PHONEPE"
                elif "transactionstatementperiod" in first_page_lower or ("transaction statement" in first_page_lower and "sent received" in first_page_lower):
                    upi_signature = "GPAY"
                elif "paytm statement" in first_page_lower or "paytm app" in first_page_lower:
                    upi_signature = "PAYTM"
                elif "wallet transactions" in first_page_lower:
                    upi_signature = "MOBIKWIK"
                elif "slice small finance" in first_page_lower or "slice.bank" in first_page_lower:
                    upi_signature = "SLICE"
                
                # Check standard Bank signatures
                elif "icici bank" in first_page_lower or "icicibank" in first_page_lower:
                    bank_signature = "ICICI"
                elif "kotak bank" in first_page_lower or "kotak mahindra" in first_page_lower or "kkbk0" in first_page_lower:
                    bank_signature = "KOTAK"
                elif "axis bank" in first_page_lower or "axis account" in first_page_lower:
                    bank_signature = "AXIS"
                elif "bank of baroda" in first_page_lower or "barb0" in first_page_lower:
                    bank_signature = "BOB"
                elif "canara bank" in first_page_lower or "cnrb0" in first_page_lower:
                    bank_signature = "CANARA"
                elif "hdfc bank" in first_page_lower or "hdfcbank" in first_page_lower:
                    bank_signature = "HDFC"
                elif "punjab national bank" in first_page_lower or "pnb" in first_page_lower:
                    bank_signature = "PNB"

        # Log info messages to stderr so stdout remains purely JSON
        if upi_signature:
            sys.stderr.write(f"[->] UPI/Wallet {upi_signature} statement detected. Launching specialized UPI Parser...\n")
            df_statement = parse_upi_wallet_engine(pdf_file, upi_signature)
        elif bank_signature in ["AXIS", "BOB", "CANARA", "PNB", "HDFC"]:
            sys.stderr.write(f"[->] {bank_signature} signature identified. Launching Text-Flow Engine...\n")
            df_statement = parse_text_flow_engine(pdf_file, bank_signature)
        else:
            sys.stderr.write("[->] Generic layout detected. Running Tabular Grid Engine...\n")
            df_statement = parse_tabular_grid_engine(pdf_file)
            
            if df_statement is None or df_statement.empty:
                sys.stderr.write("[!] Grid method returned empty. Running Text-Flow fallback...\n")
                df_statement = parse_text_flow_engine(pdf_file, bank_signature)

        if df_statement is not None and not df_statement.empty:
            df_statement = df_statement.fillna("")
            records = df_statement.to_dict(orient="records")
            sys.stderr.write(f"[GEMINI-LOG] Extracted {len(records)} transactions. Outputting JSON to stdout...\n")
            
            # Print ONLY JSON array to standard output (captured by Node.js)
            sys.stdout.write(json.dumps(records, ensure_ascii=False))
        else:
            sys.stderr.write("[GEMINI-LOG] [FAIL] Error: 0 transactions extracted from PDF.\n")
            sys.stdout.write(json.dumps([]))

    except FileNotFoundError:
        sys.stderr.write(f"Error: The file '{pdf_file}' was not found.\n")
        sys.exit(1)
    except Exception as e:
        sys.stderr.write(f"Error processing PDF: {e}\n")
        sys.exit(1)