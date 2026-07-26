import os
from bankstatementparser.hybrid import smart_ingest

# 1. FORCE LiteLLM to use your local Ollama server correctly
os.environ["BSP_HYBRID_MODEL"] = "ollama/llama3.2:3b"  # or "ollama/mistral:latest"
os.environ["OLLAMA_API_BASE"] = "http://localhost:11434"

file_path = r"C:\Users\dell\Downloads\finexis.0.0\python_scripts\pdfs\BANK\AU.pdf"

print(f"Processing PDF using local LLM model...")

try:
    # 2. Run the hybrid extraction engine
    result = smart_ingest(file_path)
    
    # 3. Access your parsed DataFrame
    df = result.data
    print("\n--- Extraction Success ---")
    print(df.head())
    
    # Optional: Save to CSV
    output_csv = file_path.replace(".pdf", "_extracted.csv")
    df.to_csv(output_csv, index=False)
    print(f"\nSaved transactions to: {output_csv}")

except Exception as e:
    print(f"\nExtraction failed: {e}")
