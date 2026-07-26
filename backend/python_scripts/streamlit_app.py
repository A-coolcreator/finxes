import streamlit as st
import os
import sys
import json
import re
import tempfile
import subprocess
import pandas as pd

# Add the script path to search path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from extract_metadata import extract_pdf_metadata

# Set page configuration with premium dark look
st.set_page_config(
    page_title="FinExis Metadata Extractor",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for high-end dark glassmorphism design
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=JetBrains+Mono:wght@400;700&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Outfit', sans-serif;
    }
    
    .stApp {
        background: linear-gradient(135deg, #0e1117 0%, #161a24 100%);
    }
    
    .header-container {
        padding: 2rem 0rem 1rem 0rem;
        text-align: center;
        background: linear-gradient(90deg, #2b6cb0 0%, #319795 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    
    .glass-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.07);
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1rem;
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
    }
    
    .metric-value {
        font-family: 'Outfit', sans-serif;
        font-size: 1.8rem;
        font-weight: 800;
        color: #e2e8f0;
    }
    
    .metric-label {
        font-size: 0.9rem;
        color: #a0aec0;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    
    .badge-unknown {
        background-color: rgba(239, 68, 68, 0.15);
        color: #ef4444;
        border: 1px solid rgba(239, 68, 68, 0.3);
        padding: 3px 10px;
        border-radius: 20px;
        font-weight: 600;
        font-size: 0.75rem;
        display: inline-block;
        font-family: 'JetBrains Mono', monospace;
    }
    
    .badge-value {
        background-color: rgba(16, 185, 129, 0.15);
        color: #10b981;
        border: 1px solid rgba(16, 185, 129, 0.3);
        padding: 3px 10px;
        border-radius: 20px;
        font-weight: 600;
        font-size: 0.85rem;
        display: inline-block;
    }
    
    .json-code {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.9rem;
    }
</style>
""", unsafe_allow_html=True)

# Main Title Header
st.markdown('<div class="header-container"><h1 style="font-weight: 800; font-size: 3rem; margin-bottom: 0;">FinExis Parser Hub</h1><p style="font-size: 1.2rem; color: #a0aec0; margin-top: 0.5rem; font-weight: 300;">Extract profiles & transactions using custom engines</p></div>', unsafe_allow_html=True)

# Layout division
col_left, col_right = st.columns([1, 3])

with col_left:
    st.markdown('<div class="glass-card">', unsafe_allow_html=True)
    st.subheader("📤 Upload Statement")
    uploaded_file = st.file_uploader(
        "Upload a Bank or UPI PDF statement", 
        type=["pdf"],
        help="Upload a single PDF statement (first/last pages will be extracted for speed)."
    )
    st.markdown('</div>', unsafe_allow_html=True)

    st.markdown('<div class="glass-card">', unsafe_allow_html=True)
    st.subheader("💡 Tips")
    st.markdown("""
    * **Banks Supported**: SBI, HDFC, ICICI, Kotak, Axis, BOB, Canara, PNB, PSB, IOB, Union Bank.
    * **UPI Platforms**: Google Pay, PhonePe, Paytm, MobiKwik, super.money.
    * **Outputs**: Raw JSON schemas & full transaction ledgers in CSV.
    """)
    st.markdown('</div>', unsafe_allow_html=True)

if uploaded_file is not None:
    # Save the file to a temporary location
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(uploaded_file.getvalue())
        tmp_path = tmp.name

    try:
        # Run Extract Metadata logic
        with st.spinner("🔍 Analysing document structure and isolating metadata..."):
            meta = extract_pdf_metadata(tmp_path)

        # Run Gemini Parser (transactions table) using subprocess to keep stdout/writing isolated
        with st.spinner("📊 Extracting tabular transaction rows via Gemini parser..."):
            # gemini.py saves outputs relative to its own folder structure.
            # We can execute it and read the resulting output file name.
            script_dir = os.path.dirname(os.path.abspath(__file__))
            gemini_script = os.path.join(script_dir, "gemini.py")
            
            # Run the parsing engine
            process = subprocess.run(
                [sys.executable, gemini_script, tmp_path],
                capture_output=True,
                text=True,
                cwd=script_dir
            )
            
            # Check for generated CSV in the csv/ folder
            base_name = os.path.splitext(os.path.basename(tmp_path))[0]
            # gemini.py has a routing override: BOB saves to 'bob.csv', others save to '{basename}.csv'
            inst_name = meta.get("institution", {}).get("bank_name", "")
            if inst_name == "BANK OF BARODA":
                csv_filename = "bob.csv"
            else:
                csv_filename = f"{base_name}.csv"
                
            csv_path = os.path.join(script_dir, "csv", csv_filename)
            df_transactions = None
            if os.path.exists(csv_path):
                df_transactions = pd.read_csv(csv_path)

        # Render Key metrics summary cards at top of main view
        with col_right:
            st.subheader("📈 Summary Snapshot")
            
            # Detect Institution & Account Holder Name
            inst = meta.get("institution", {}).get("bank_name", "UNKNOWN")
            if inst == "UNKNOWN":
                inst = meta.get("institution", {}).get("platform", "UNKNOWN")
            
            name = meta.get("account_holder", {}).get("name", "UNKNOWN")
            acct_no = meta.get("account_profile", {}).get("account_number", "UNKNOWN")
            cl_bal = meta.get("summary_snapshot", {}).get("closing_balance", "UNKNOWN")
            
            # Layout the snapshot metrics
            m_col1, m_col2, m_col3, m_col4 = st.columns(4)
            
            def render_val(val, currency=False):
                if val == "UNKNOWN":
                    return '<span class="badge-unknown">UNKNOWN</span>'
                val_str = str(val)
                if currency and not val_str.startswith(("Rs", "₹")):
                    return f'<span class="badge-value">₹ {val_str}</span>'
                return f'<span class="badge-value">{val_str}</span>'

            with m_col1:
                st.markdown(f'<div class="glass-card" style="text-align: center;"><div class="metric-label">Institution</div><div class="metric-value">{render_val(inst)}</div></div>', unsafe_allow_html=True)
            with m_col2:
                st.markdown(f'<div class="glass-card" style="text-align: center;"><div class="metric-label">Account Holder</div><div class="metric-value" style="font-size: 1.3rem;">{render_val(name)}</div></div>', unsafe_allow_html=True)
            with m_col3:
                st.markdown(f'<div class="glass-card" style="text-align: center;"><div class="metric-label">Account Number</div><div class="metric-value">{render_val(acct_no)}</div></div>', unsafe_allow_html=True)
            with m_col4:
                st.markdown(f'<div class="glass-card" style="text-align: center;"><div class="metric-label">Closing Balance</div><div class="metric-value">{render_val(cl_bal, True)}</div></div>', unsafe_allow_html=True)

            # Tab layout
            tab_profile, tab_json, tab_transactions = st.tabs([
                "👤 Document Profile Schema", 
                "💻 Interactive JSON Output", 
                "💸 Transaction Ledger"
            ])

            with tab_profile:
                st.subheader("Profile Metadata Fields")
                
                # We group the values dynamically to show them cleanly
                section_cols = st.columns(2)
                
                with section_cols[0]:
                    st.markdown("#### 👤 Account Holder")
                    for k, v in meta.get("account_holder", {}).items():
                        st.markdown(f"**{k.replace('_', ' ').title()}**: {render_val(v)}", unsafe_allow_html=True)
                        
                    st.markdown("#### 💳 Account Profile")
                    for k, v in meta.get("account_profile", {}).items():
                        st.markdown(f"**{k.replace('_', ' ').title()}**: {render_val(v)}", unsafe_allow_html=True)
                
                with section_cols[1]:
                    st.markdown("#### 🗺️ Routing Identifiers")
                    for k, v in meta.get("routing_identifiers", {}).items():
                        st.markdown(f"**{k.replace('_', ' ').title()}**: {render_val(v)}", unsafe_allow_html=True)
                        
                    st.markdown("#### 📅 Statement Details")
                    for k, v in meta.get("statement_details", {}).items():
                        st.markdown(f"**{k.replace('_', ' ').title()}**: {render_val(v)}", unsafe_allow_html=True)

            with tab_json:
                st.subheader("Raw Profile JSON Schema Output")
                st.json(meta)
                
                # Copy JSON button helper
                st.download_button(
                    label="📥 Download JSON Metadata Profile",
                    data=json.dumps(meta, indent=2),
                    file_name=f"{base_name}_profile.json",
                    mime="application/json"
                )

            with tab_transactions:
                st.subheader("Parsed Transactions Ledger")
                if df_transactions is not None and not df_transactions.empty:
                    st.success(f"Successfully loaded {len(df_transactions)} transactions.")
                    st.dataframe(df_transactions, use_container_width=True)
                    
                    # Download CSV option
                    csv_data = df_transactions.to_csv(index=False).encode('utf-8')
                    st.download_button(
                        label="📥 Download Transactions CSV",
                        data=csv_data,
                        file_name=f"{base_name}_transactions.csv",
                        mime="text/csv"
                    )
                else:
                    st.warning("No transactions table extracted by the tabular parser. Make sure the PDF text layer is readable.")
                    if process.stdout:
                        st.text_area("Parser Log Output", process.stdout, height=200)

    except Exception as e:
        st.error(f"Failed to process statement: {e}")
        import traceback
        st.code(traceback.format_exc())
    finally:
        # Cleanup temp file
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

else:
    with col_right:
        st.info("👈 Please upload a bank statement PDF in the left sidebar to begin.")
