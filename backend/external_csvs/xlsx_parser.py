import os
import openpyxl
import pandas as pd

excel_path = r"c:\Users\dell\Downloads\finexis_frontend\external_csvs\Entities Classification Index.xlsx"
out_path = r"c:\Users\dell\Downloads\finexis_frontend\external_csvs\xlsx_summary.txt"

try:
    xls = pd.ExcelFile(excel_path)
    sheets = xls.sheet_names
    
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(f"Sheets in file: {sheets}\n\n")
        for sheet in sheets:
            f.write("="*80 + "\n")
            f.write(f"SHEET NAME: {sheet}\n")
            f.write("="*80 + "\n")
            df = pd.read_excel(excel_path, sheet_name=sheet)
            f.write(f"Shape: {df.shape}\n")
            f.write(f"Columns: {list(df.columns)}\n\n")
            f.write("First 100 rows:\n")
            f.write(df.head(100).to_string(index=False))
            f.write("\n\n")
    print("SUCCESS: Excel file dumped to", out_path)
except Exception as e:
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(f"ERROR: {str(e)}\n")
    print("ERROR:", e)
