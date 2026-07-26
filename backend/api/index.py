from fastapi import FastAPI, UploadFile, File, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import tempfile
import os
import sys
import pandas as pd
import json

# Add parent directory and python_scripts directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
repo_root = os.path.dirname(backend_dir)
parent_dir = backend_dir
frontend_dir = os.path.join(repo_root, "finexis_ui_updated", "dist")
sys.path.append(backend_dir)
sys.path.append(os.path.join(parent_dir, "python_scripts"))

from extract_metadata import extract_pdf_metadata

# Import gemini parsing logic
import pdfplumber
from gemini import parse_upi_wallet_engine, parse_text_flow_engine, parse_tabular_grid_engine

# Import admin DB functions
sys.path.append(backend_dir)
from db import (
    listAdminUsers, getAdminUserById, createAdminUser, updateAdminUser, deleteAdminUser,
    listAdminTenants, getAdminTenantById, createAdminTenant, updateAdminTenant,
    getDashboardStats, listAdminActivity, listAdminRequests,
    # Auth functions
    verifyUser, createUser, getUserById, listUsers,
    # User-scoped data functions
    listCasesForUser, getCaseByIdForUser, getPersonsForCaseForUser,
    getTransactionsForCaseForUser, getPersonByNameForUser, getMetadataForPersonForUser,
    createCaseRecord, createPersonRecord, saveMetadataRecord, saveTransactionsBatch
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_index():
    return FileResponse(os.path.join(frontend_dir, "index.html"))

@app.get("/index.html")
async def read_index_html():
    return FileResponse(os.path.join(frontend_dir, "index.html"))

@app.post("/api/extract")
async def extract_statement(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    # Save uploaded file to a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        # 1. Run extract_metadata.py logic
        meta = extract_pdf_metadata(tmp_path)
        
        # Exclude opening/closing balance from summary snapshot as requested
        if "summary_snapshot" in meta:
            meta.pop("summary_snapshot", None)
            
        # 2. Run gemini.py transaction parsing logic
        df_transactions = None
        upi_signature = ""
        bank_signature = ""
        
        with pdfplumber.open(tmp_path) as pdf:
            if pdf.pages:
                first_page_text = pdf.pages[0].extract_text() or ""
                first_page_lower = first_page_text.lower()
                
                # Check UPI signatures
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
                
                # Check bank signatures
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

        if upi_signature:
            df_transactions = parse_upi_wallet_engine(tmp_path, upi_signature)
        elif bank_signature in ["ICICI", "KOTAK", "AXIS", "BOB", "CANARA", "HDFC"]:
            df_transactions = parse_text_flow_engine(tmp_path, bank_signature)
        else:
            df_transactions = parse_tabular_grid_engine(tmp_path)
            if df_transactions is None or df_transactions.empty:
                df_transactions = parse_text_flow_engine(tmp_path, bank_signature)

        transactions_list = []
        if df_transactions is not None and not df_transactions.empty:
            # Replace NaN/Infinity values with empty string or null to maintain JSON compliance
            df_transactions = df_transactions.fillna("")
            transactions_list = df_transactions.to_dict(orient="records")

        return {
            "metadata": meta,
            "transactions": transactions_list
        }

    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}\n{error_trace}")
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
# --- Admin User Endpoints ---
class CreateUserRequest(BaseModel):
    name: str
    email: str
    tenantId: str | None = None
    role: str = "Viewer"
    status: str = "Invited"

class UpdateUserRequest(BaseModel):
    name: str | None = None
    email: str | None = None
    tenantId: str | None = None
    role: str | None = None
    status: str | None = None

@app.get("/api/admin/users")
def list_users(
    status: str | None = None,
    role: str | None = None,
    tenant_id: str | None = None,
    search: str | None = None,
    limit: int = 50,
    offset: int = 0
):
    result = listAdminUsers({
        status: status,
        role: role,
        tenantId: tenant_id,
        search: search,
        limit: limit,
        offset: offset
    })
    return result

@app.get("/api/admin/users/{user_id}")
def get_user(user_id: str):
    user = getAdminUserById(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/api/admin/users", status_code=201)
def create_user(data: CreateUserRequest):
    return createAdminUser({
        "name": data.name,
        "email": data.email,
        "tenantId": data.tenantId,
        "role": data.role,
        "status": data.status
    })

@app.patch("/api/admin/users/{user_id}")
def update_user(user_id: str, data: UpdateUserRequest):
    user = updateAdminUser(user_id, {
        "name": data.name,
        "email": data.email,
        "tenantId": data.tenantId,
        "role": data.role,
        "status": data.status
    })
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.delete("/api/admin/users/{user_id}", status_code=204)
def delete_user(user_id: str):
    deleted = deleteAdminUser(user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")

# --- Admin Tenant Endpoints ---
class CreateTenantRequest(BaseModel):
    name: str
    segment: str
    plan: str = "Trial"
    seatsLimit: int = 10
    status: str = "Trial"
    region: str = "ap-south-1"

class UpdateTenantRequest(BaseModel):
    name: str | None = None
    segment: str | None = None
    plan: str | None = None
    seatsLimit: int | None = None
    status: str | None = None
    region: str | None = None

@app.get("/api/admin/tenants")
def list_tenants(
    status: str | None = None,
    plan: str | None = None,
    search: str | None = None,
    limit: int = 50,
    offset: int = 0
):
    result = listAdminTenants({
        status: status,
        plan: plan,
        search: search,
        limit: limit,
        offset: offset
    })
    return result

@app.get("/api/admin/tenants/{tenant_id}")
def get_tenant(tenant_id: str):
    tenant = getAdminTenantById(tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant

@app.post("/api/admin/tenants", status_code=201)
def create_tenant(data: CreateTenantRequest):
    return createAdminTenant({
        "name": data.name,
        "segment": data.segment,
        "plan": data.plan,
        "seatsLimit": data.seatsLimit,
        "status": data.status,
        "region": data.region
    })

@app.patch("/api/admin/tenants/{tenant_id}")
def update_tenant(tenant_id: str, data: UpdateTenantRequest):
    tenant = updateAdminTenant(tenant_id, {
        "name": data.name,
        "segment": data.segment,
        "plan": data.plan,
        "seatsLimit": data.seatsLimit,
        "status": data.status,
        "region": data.region
    })
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant
# --- Admin Dashboard Endpoints ---
@app.get("/api/admin/dashboard/stats")
def get_dashboard_stats():
    stats = getDashboardStats()
    return stats

@app.get("/api/admin/dashboard/activity")
def list_activity(limit: int = 10):
    return listAdminActivity(limit)

@app.get("/api/admin/dashboard/requests")
def list_requests(status: str = "pending"):
    return listAdminRequests(status)
# --- Authentication Endpoints ---
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    tenant: str | None = None

@app.post("/api/auth/login")
def login(data: LoginRequest):
    user = verifyUser(data.email, data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {
        "user": user,
        "token": f"token-{user['id']}-{data.email}"
    }

@app.post("/api/auth/register", status_code=201)
def register(data: RegisterRequest):
    existing = getUserById(data.email)  # This needs to be getUserByEmail
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = createUser({
        "email": data.email,
        "password": data.password,
        "tenant": data.tenant
    })
    return {
        "user": user,
        "token": f"token-{user['id']}-{data.email}"
    }

@app.get("/api/auth/me")
def get_me(user_id: str = "USER-001"):  # In production, extract from token
    user = getUserById(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# --- User Data Endpoints (requires user_id in query for now) ---
@app.get("/api/users")
def list_all_users():
    return listUsers()

# --- User-scoped Case Data Endpoints ---
@app.get("/api/cases")
def list_cases(user_id: str, status: str | None = None):
    return listCasesForUser(user_id, status)

@app.get("/api/cases/{case_id}")
def get_case(user_id: str, case_id: str):
    case = getCaseByIdForUser(user_id, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case

@app.post("/api/cases", status_code=201)
def create_case(request: Request, payload: dict = None):
    # Try to extract user_id from Authorization header token (format: token-{userId}-{email})
    auth_header = request.headers.get("Authorization", "")
    user_id = "USER-001"  # Default fallback
    if auth_header.startswith("Bearer token-"):
        try:
            # token-USER-001-email@example.com
            parts = auth_header.replace("Bearer token-", "").split("-")
            if len(parts) >= 2:
                user_id = parts[0] + "-" + parts[1]  # USER-001
        except:
            pass
    return createCaseRecord(user_id, payload if payload else {})

@app.get("/api/cases/{case_id}/persons")
def list_persons(user_id: str, case_id: str):
    return getPersonsForCaseForUser(user_id, case_id)

@app.post("/api/cases/{case_id}/persons")
def create_person(user_id: str, case_id: str, payload: dict):
    person_id = createPersonRecord(user_id, case_id, payload.get("name"))
    return {"id": person_id}

@app.get("/api/cases/{case_id}/transactions")
def list_transactions(user_id: str, case_id: str):
    return getTransactionsForCaseForUser(user_id, case_id)

@app.post("/api/cases/{case_id}/upload")
async def upload_case_document(user_id: str, case_id: str, file: UploadFile = File(...)):
    # Placeholder: In production, this would process the PDF and save metadata/transactions
    return {"message": "Upload processed", "case_id": case_id, "user_id": user_id}