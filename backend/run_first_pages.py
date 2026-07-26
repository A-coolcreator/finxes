import os
import sys
import glob
import subprocess

try:
    from PyPDF2 import PdfReader, PdfWriter
except ImportError:
    print("Error: PyPDF2 is not installed.")
    print("Please install it by running: pip install PyPDF2")
    sys.exit(1)

def extract_first_page(input_pdf_path, output_pdf_path):
    try:
        reader = PdfReader(input_pdf_path)
        writer = PdfWriter()
        if len(reader.pages) > 0:
            writer.add_page(reader.pages[0])
            with open(output_pdf_path, "wb") as f:
                writer.write(f)
            return True
        return False
    except Exception as e:
        print(f"Failed to read PDF {input_pdf_path}: {e}")
        return False

def process_pdfs(folders, gemini_script, output_txt_file):
    # Temporary PDF file that will be overwritten for each file
    temp_pdf = "temp_first_page.pdf"
    
    # Initialize the output text file
    with open(output_txt_file, "w", encoding="utf-8") as out_txt:
        out_txt.write("Combined Output from First Pages\n")
        out_txt.write("=================================\n\n")

    for folder in folders:
        if not os.path.exists(folder):
            print(f"Directory not found: {folder}")
            continue

        pdf_files = glob.glob(os.path.join(folder, "*.pdf"))
        print(f"Found {len(pdf_files)} PDFs in {folder}")

        for pdf_path in pdf_files:
            print(f"\nProcessing: {pdf_path}")
            
            try:
                # 1. Extract the first page
                success = extract_first_page(pdf_path, temp_pdf)
                if not success:
                    print(f"Skipping {pdf_path}, no pages found or read error.")
                    continue
                
                # 2. Run gemini.py on the temp PDF
                # It will output to csv/temp_first_page.csv
                print(f"Running gemini.py on the first page of {os.path.basename(pdf_path)}...")
                subprocess.run([sys.executable, gemini_script, temp_pdf], check=False)
                
                # 3. Read the output CSV
                csv_path = os.path.join("csv", "temp_first_page.csv")
                
                with open(output_txt_file, "a", encoding="utf-8") as out_txt:
                    out_txt.write(f"--- Output for: {os.path.basename(pdf_path)} ---\n")
                    if os.path.exists(csv_path):
                        with open(csv_path, "r", encoding="utf-8") as csv_file:
                            out_txt.write(csv_file.read())
                        out_txt.write("\n")
                        
                        # Clean up the CSV file after reading
                        os.remove(csv_path)
                    else:
                        out_txt.write("No CSV output generated (parsing failed or no transactions).\n\n")
                
            except Exception as e:
                print(f"Error processing {pdf_path}: {e}")
            finally:
                if os.path.exists(temp_pdf):
                    os.remove(temp_pdf)

    print(f"\nDone! All results have been compiled and saved to {output_txt_file}")

if __name__ == "__main__":
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    
    folders_to_process = [
        os.path.join(backend_dir, "python_scripts", "pdfs", "BANK"),
        os.path.join(backend_dir, "python_scripts", "pdfs", "UPI")
    ]
    
    gemini_script_path = os.path.join(backend_dir, "python_scripts", "gemini.py")
    output_text_path = os.path.join(backend_dir, "python_scripts", "combined_first_pages_output.txt")
    
    # Change directory to frontendDir to mimic server.js execution environment
    os.chdir(backend_dir)
    
    process_pdfs(folders_to_process, gemini_script_path, output_text_path)
