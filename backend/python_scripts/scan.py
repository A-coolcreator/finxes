import os
import sys
import pdfplumber
import pandas as pd

def parse_tabular_pdf(pdf_path):
    all_rows = []
    headers = None
    
    # Define common terms found in bank statement headers to validate them
    # Add keywords specific to your bank statement if needed
    VALID_HEADER_KEYWORDS = {'date', 'description', 'amount', 'balance', 'transaction', 'details', 'withdrawal', 'deposit'}
    
    print(f"Opening PDF: {os.path.basename(pdf_path)}...")
    with pdfplumber.open(pdf_path) as pdf:
        for index, page in enumerate(pdf.pages):
            # Extract tables using advanced explicit layout settings
            # This handles clean column separation even if visual borders are missing
            tables = page.extract_tables({
                "vertical_strategy": "lines",
                "horizontal_strategy": "lines",
                "snap_tolerance": 3,
            })
            
            # Fallback if the bank statement uses "text spacing" instead of strict box grid borders
            if not tables:
                tables = page.extract_tables({
                    "vertical_strategy": "text",
                    "horizontal_strategy": "text",
                })

            for table in tables:
                if not table or len(table) < 1:
                    continue
                
                for row_idx, row in enumerate(table):
                    # Clean and normalize cells inside the row
                    cleaned_row = [str(cell).strip().replace('\n', ' ') if cell is not None else "" for cell in row]
                    
                    # Ignore completely empty rows or rows with only one filled cell (like table sub-headers)
                    if not any(cleaned_row) or len([c for c in cleaned_row if c]) <= 1:
                        continue
                    
                    # Dynamic Header Detection Logic
                    # Looks for a row containing typical banking keywords
                    row_text_lower = " ".join(cleaned_row).lower()
                    is_header_row = any(keyword in row_text_lower for keyword in VALID_HEADER_KEYWORDS)
                    
                    if is_header_row:
                        # Set header mapping if it hasn't been set yet
                        if headers is None:
                            headers = [c if c else f"Column_{i}" for i, c in enumerate(cleaned_row)]
                        # Skip processing this row as transaction data (ignores duplicate headers on multi-page files)
                        continue
                    
                    # Row Verification against known layout schema
                    if headers and len(cleaned_row) == len(headers):
                        all_rows.append(cleaned_row)
                    elif headers and len(cleaned_row) > len(headers):
                        # Truncate accidental extra cells
                        all_rows.append(cleaned_row[:len(headers)])
                    elif headers and len(cleaned_row) < len(headers):
                        # Pad missing trailing cells with empty strings
                        padded_row = cleaned_row + [""] * (len(headers) - len(cleaned_row))
                        all_rows.append(padded_row)
                        
        print(f"  Processed page {index + 1}/{len(pdf.pages)}")
            
    if not headers:
        raise ValueError("Could not find a valid transaction table header containing columns like 'Date' or 'Amount'.")
    if not all_rows:
        raise ValueError("Detected table headers, but failed to isolate transaction data rows.")
        
    # Convert into a structured clean Pandas DataFrame
    df = pd.DataFrame(all_rows, columns=headers)
    
    # Final cleanup: Remove any accidental row that mimics headers or contains page numbers
    if 'Date' in df.columns:
        df = df[df['Date'].str.lower() != 'date']
        
    return df

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage error! Correct format: python script.py <path_to_pdf_file>")
        sys.exit(1)
            
    pdf_file = sys.argv[1]
    try:
        df_statement = parse_tabular_pdf(pdf_file)
        
        output_folder = "csv"
        os.makedirs(output_folder, exist_ok=True)
        
        base_filename = os.path.splitext(os.path.basename(pdf_file))[0]
        destination_path = os.path.join(output_folder, f"{base_filename}.csv")
        
        df_statement.to_csv(destination_path, index=False)
        print(f"\n[✔] Data cleanly exported ({len(df_statement)} rows) to: {destination_path}")
        
    except FileNotFoundError:
        print(f"Error: The file '{pdf_file}' was not found.")
    except Exception as e:
        print(f"Error processing PDF: {e}")
