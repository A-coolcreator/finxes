import os
import sys
# pyrefly: ignore [missing-import]
import pdfplumber

# Check if a folder path was provided
if len(sys.argv) < 2:
    print("Usage error! Correct format: python script.py <path_to_folder>")
    sys.exit(1)

folder_path = sys.argv[1]

# Verify if the provided path is a valid directory
if not os.path.isdir(folder_path):
    print(f"Error: '{folder_path}' is not a valid folder directory.")
    sys.exit(1)

# List all files in the folder and filter for .pdf files
pdf_files = [f for f in os.listdir(folder_path) if f.lower().endswith('.pdf')]

if not pdf_files:
    print(f"No PDF files found in folder: {folder_path}")
    sys.exit(0)

# Define the single master output file path
output_md_path = os.path.join(
    folder_path, "combined_output.md")

print(f"Found {len(pdf_files)} PDF(s) to process.")
print(f"All output will be appended to: {output_md_path}\n" + "-"*40)

# Open the single master file in write mode ('w') to clear old content, or 'a' to append to existing files
with open(output_md_path, "w", encoding="utf-8") as master_md:
    master_md.write("# Master PDF Extraction Summary\n\n")
    
    # Loop through each PDF file one by one
    for filename in pdf_files:
        pdf_path = os.path.join(folder_path, filename)
        print(f"Processing: {filename}...")
        
        try:
            with pdfplumber.open(pdf_path) as pdf:
                if not pdf.pages:
                    print(f"-> Skipped: {filename} has no pages.")
                    continue
                    
                # Extract text from the first page
                first_page_text = pdf.pages[0].extract_text()
                
                if not first_page_text:
                    first_page_text = "[No readable text found on this page]"
                
                # Keep your 5000 character limit from the original script
                final_text = first_page_text[:5000]

            # Append this specific PDF's content to the single master file
            master_md.write(f"## File: {filename}\n")
            master_md.write(f"{final_text}\n")
            master_md.write("\n" + "-"*20 + "\n\n")  # Add a visual separator between files
            print("-> Successfully added to master file.")

        except Exception as e:
            print(f"-> Error processing {filename}: {e}")

print("-"*40 + "\nAll files processed! Check 'combined_output.md'.")
