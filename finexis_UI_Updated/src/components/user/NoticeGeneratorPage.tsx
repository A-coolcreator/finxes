import { useState } from "react";
import {
  FileSignature, Lock, BadgeCheck, Edit3, Download,
  ChevronUp, AlertTriangle, Scale,
  Building2, Landmark, CreditCard, ShieldAlert,
  FileText, CheckCircle2, Trash2, Copy, Eye,
} from "lucide-react";
import Topbar from "./Topbar";

// ─── Types ────────────────────────────────────────────────────────────────────
type NoticeType =
  | "94-bnss"
  | "bank-freeze"
  | "account-details"
  | "payment-gateway"
  | "ncrp-reference"
  | "wallet-freeze"
  | "crypto-exchange"
  | "court-production";

interface NoticeTemplate {
  id: NoticeType;
  name: string;
  shortName: string;
  icon: typeof Scale;
  authority: string;
  description: string;
  legalBasis: string;
  turnaround: string;
  fields: TemplateField[];
}

interface TemplateField {
  key: string;
  label: string;
  type: "text" | "textarea" | "date" | "select";
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

interface DraftedNotice {
  id: string;
  type: NoticeType;
  name: string;
  createdAt: string;
  caseRef: string;
  status: "draft" | "final";
  content: string;
}

// ─── Templates ────────────────────────────────────────────────────────────────
const TEMPLATES: NoticeTemplate[] = [
  {
    id: "94-bnss",
    name: "Section 94 BNSS — Production of Documents",
    shortName: "S.94 BNSS",
    icon: Scale,
    authority: "Magistrate / Court",
    description: "Summons requiring a person or institution to produce a document or thing for investigation or trial.",
    legalBasis: "Section 94, Bharatiya Nagarik Suraksha Sanhita, 2023",
    turnaround: "7–14 days",
    fields: [
      { key: "caseRef", label: "Case / FIR number", type: "text", placeholder: "e.g. FIR No. 142/2024, PS Cyber", required: true },
      { key: "recipientName", label: "Recipient (bank / entity name)", type: "text", placeholder: "e.g. State Bank of India, Andheri Branch", required: true },
      { key: "recipientAddress", label: "Recipient address", type: "textarea", placeholder: "Full registered address...", required: true },
      { key: "accountNumbers", label: "Account number(s)", type: "textarea", placeholder: "List all account numbers, one per line", required: true },
      { key: "documentType", label: "Documents required", type: "select", options: ["Bank account statements", "Account opening KYC", "Transaction logs", "CCTV footage", "Call records", "All of the above"], required: true },
      { key: "periodFrom", label: "Period from", type: "date", required: true },
      { key: "periodTo", label: "Period to", type: "date", required: true },
      { key: "officerName", label: "Investigating officer name", type: "text", placeholder: "Full name and rank", required: true },
      { key: "officerDesignation", label: "Designation", type: "text", placeholder: "e.g. Sub-Inspector, Cybercrime Unit", required: true },
      { key: "psName", label: "Police station / unit", type: "text", placeholder: "e.g. Cybercrime PS, Mumbai", required: true },
    ],
  },
  {
    id: "bank-freeze",
    name: "Bank Account Freeze Request",
    shortName: "Account Freeze",
    icon: Landmark,
    authority: "Bank Nodal Officer",
    description: "Request to freeze a bank account pending investigation, preventing further debits and credits.",
    legalBasis: "Section 17 PMLA / Section 102 BNSS / NCRP Helpline 1930",
    turnaround: "2–4 hours (urgent) / 24 hours",
    fields: [
      { key: "caseRef", label: "Case / FIR / Complaint number", type: "text", required: true },
      { key: "bankName", label: "Bank name", type: "text", placeholder: "e.g. HDFC Bank Ltd.", required: true },
      { key: "branchName", label: "Branch name & IFSC", type: "text", placeholder: "e.g. Connaught Place, HDFC0000123", required: true },
      { key: "nodalEmail", label: "Nodal officer email", type: "text", placeholder: "e.g. lawenforcement@hdfcbank.com", required: true },
      { key: "accountHolder", label: "Account holder name", type: "text", required: true },
      { key: "accountNumber", label: "Account number", type: "text", required: true },
      { key: "freezeType", label: "Freeze type", type: "select", options: ["Full freeze (no debit / credit)", "Debit freeze only", "Credit freeze only"], required: true },
      { key: "urgencyLevel", label: "Urgency", type: "select", options: ["Urgent — within 2 hours", "Standard — within 24 hours"], required: true },
      { key: "reason", label: "Reason for freeze (brief)", type: "textarea", placeholder: "e.g. Account used as mule in online fraud — victim complaint ref ...", required: true },
      { key: "officerName", label: "Requesting officer", type: "text", required: true },
      { key: "officerContact", label: "Mobile / official email", type: "text", required: true },
      { key: "psName", label: "Police station / unit", type: "text", required: true },
    ],
  },
  {
    id: "account-details",
    name: "Account Holder Details — KYC Request",
    shortName: "KYC Details",
    icon: Building2,
    authority: "Bank Nodal Officer",
    description: "Request for account holder identity details, KYC documents, and associated contact information.",
    legalBasis: "Section 91 BNSS / Section 94 BNSS / RBI KYC Master Direction 2016",
    turnaround: "3–5 working days",
    fields: [
      { key: "caseRef", label: "Case / complaint reference", type: "text", required: true },
      { key: "bankName", label: "Bank name", type: "text", required: true },
      { key: "accountNumber", label: "Account number", type: "text", required: true },
      { key: "ifscCode", label: "IFSC code", type: "text", placeholder: "e.g. SBIN0001234" },
      { key: "infoRequired", label: "Information required", type: "select", options: ["Account holder name, address, PAN, mobile", "Full KYC set (all documents)", "Linked mobile numbers", "Nominee details", "All associated accounts", "Complete customer profile"], required: true },
      { key: "officerName", label: "Requesting officer", type: "text", required: true },
      { key: "officerDesignation", label: "Designation", type: "text", required: true },
      { key: "psName", label: "Police station / unit", type: "text", required: true },
      { key: "officerContact", label: "Official contact / email", type: "text", required: true },
    ],
  },
  // {
  //   id: "payment-gateway",
  //   name: "Payment Gateway — Merchant KYC & Transaction Hold",
  //   shortName: "PG Hold",
  //   icon: CreditCard,
  //   authority: "Payment Gateway Nodal Officer",
  //   description: "Request to hold merchant settlement and obtain transaction logs from a payment gateway (Razorpay, PayU, Cashfree, etc.).",
  //   legalBasis: "Section 94 BNSS / RBI Payment Aggregator Guidelines 2020",
  //   turnaround: "4–8 hours (urgent)",
  //   fields: [
  //     { key: "caseRef", label: "Case / FIR reference", type: "text", required: true },
  //     { key: "pgName", label: "Payment gateway name", type: "text", placeholder: "e.g. Razorpay Software Pvt. Ltd.", required: true },
  //     { key: "merchantId", label: "Merchant ID / VPA", type: "text", placeholder: "e.g. RZPMERCH01234 or merchant@razorpay", required: true },
  //     { key: "merchantName", label: "Merchant / business name", type: "text" },
  //     { key: "actionRequired", label: "Action required", type: "select", options: ["Hold pending settlement", "Provide transaction logs", "Provide merchant KYC", "Freeze + provide all details"], required: true },
  //     { key: "periodFrom", label: "Transaction period from", type: "date", required: true },
  //     { key: "periodTo", label: "Transaction period to", type: "date", required: true },
  //     { key: "officerName", label: "Requesting officer", type: "text", required: true },
  //     { key: "officerContact", label: "Mobile / official email", type: "text", required: true },
  //     { key: "psName", label: "Police station / unit", type: "text", required: true },
  //   ],
  // },
  // {
  //   id: "ncrp-reference",
  //   name: "NCRP Acknowledgement Reference Letter",
  //   shortName: "NCRP Letter",
  //   icon: ShieldAlert,
  //   authority: "Bank / Intermediary",
  //   description: "Formal letter citing NCRP complaint number for urgent bank action under MHA cybercrime helpline 1930 protocol.",
  //   legalBasis: "MHA Cyber Crime Helpline 1930 / NPCI UDIR Framework",
  //   turnaround: "1–2 hours",
  //   fields: [
  //     { key: "ncrpRef", label: "NCRP complaint number", type: "text", placeholder: "e.g. 14/2024/CY/00847291", required: true },
  //     { key: "victimName", label: "Victim name", type: "text", required: true },
  //     { key: "victimMobile", label: "Victim mobile number", type: "text", required: true },
  //     { key: "fraudAmount", label: "Fraud amount (₹)", type: "text", placeholder: "e.g. ₹4,82,000", required: true },
  //     { key: "fraudDate", label: "Date of fraud", type: "date", required: true },
  //     { key: "suspectAccount", label: "Suspect account / UPI ID", type: "text", required: true },
  //     { key: "bankName", label: "Target bank name", type: "text", required: true },
  //     { key: "officerName", label: "Requesting officer", type: "text", required: true },
  //     { key: "officerContact", label: "Mobile", type: "text", required: true },
  //     { key: "psName", label: "Police station", type: "text", required: true },
  //   ],
  // },
  {
    id: "wallet-freeze",
    name: "Wallet / UPI Account Freeze",
    shortName: "Wallet Freeze",
    icon: CreditCard,
    authority: "Paytm / PhonePe / GPay Nodal Officer",
    description: "Emergency freeze request for a UPI wallet or prepaid instrument used in fraud.",
    legalBasis: "Section 102 BNSS / RBI PPI Master Directions / NPCI Guidelines",
    turnaround: "1–4 hours",
    fields: [
      { key: "caseRef", label: "Case / complaint reference", type: "text", required: true },
      { key: "walletProvider", label: "Wallet / UPI provider", type: "select", options: ["Paytm (One97 Communications)", "PhonePe Pvt. Ltd.", "Google Pay (India)", "Amazon Pay India", "BHIM (NPCI)", "MobiKwik"], required: true },
      { key: "upiId", label: "UPI ID / mobile number", type: "text", placeholder: "e.g. suspect@paytm or 9XXXXXXXXX", required: true },
      { key: "fraudAmount", label: "Amount transacted (₹)", type: "text", required: true },
      { key: "transactionDate", label: "Transaction date", type: "date", required: true },
      { key: "utrNumber", label: "UTR / transaction reference", type: "text", placeholder: "e.g. T2406091234567890" },
      { key: "actionRequired", label: "Action required", type: "select", options: ["Freeze wallet immediately", "Provide KYC of VPA holder", "Provide transaction history", "Freeze + full details"], required: true },
      { key: "officerName", label: "Requesting officer", type: "text", required: true },
      { key: "officerContact", label: "Mobile / email", type: "text", required: true },
      { key: "psName", label: "Police station", type: "text", required: true },
    ],
  },
  {
    id: "crypto-exchange",
    name: "Crypto Exchange — Account Freeze & KYC",
    shortName: "Crypto Freeze",
    icon: ShieldAlert,
    authority: "Exchange Compliance / Nodal Officer",
    description: "Freeze cryptocurrency account and obtain KYC and transaction records from an Indian crypto exchange.",
    legalBasis: "Section 94 BNSS / PMLA / FIU-IND Reporting Obligations",
    turnaround: "24–48 hours",
    fields: [
      { key: "caseRef", label: "Case / FIR reference", type: "text", required: true },
      { key: "exchangeName", label: "Crypto exchange name", type: "select", options: ["WazirX (Zanmai Labs)", "CoinDCX (Primestack Pvt. Ltd.)", "ZebPay", "Bitbns (Awlencan Innovations)", "CoinSwitch", "Other"], required: true },
      { key: "upiId", label: "UPI ID / email linked to account", type: "text", placeholder: "e.g. user@okicici", required: true },
      { key: "linkedMobile", label: "Linked mobile number", type: "text" },
      { key: "actionRequired", label: "Action required", type: "select", options: ["Freeze account immediately", "Provide KYC details", "Provide transaction history", "All of the above"], required: true },
      { key: "cryptoAmount", label: "Crypto / fiat amount involved (approx.)", type: "text", placeholder: "e.g. ₹88,000 / 0.002 BTC" },
      { key: "periodFrom", label: "Period from", type: "date" },
      { key: "periodTo", label: "Period to", type: "date" },
      { key: "officerName", label: "Requesting officer", type: "text", required: true },
      { key: "officerDesignation", label: "Designation", type: "text", required: true },
      { key: "psName", label: "Police station / unit", type: "text", required: true },
      { key: "officerContact", label: "Official email / mobile", type: "text", required: true },
    ],
  },
  // {
  //   id: "court-production",
  //   name: "Court Production Notice (Evidence)",
  //   shortName: "Court Production",
  //   icon: FileText,
  //   authority: "Magistrate / Sessions Court",
  //   description: "Notice to produce digital evidence, electronic records, or call detail records before a competent court.",
  //   legalBasis: "Section 94 BNSS / Section 65B Indian Evidence Act (now BSA 2023)",
  //   turnaround: "As directed by court",
  //   fields: [
  //     { key: "caseRef", label: "Case / CC / Sessions Case No.", type: "text", required: true },
  //     { key: "courtName", label: "Court name", type: "text", placeholder: "e.g. Chief Judicial Magistrate, Hyderabad", required: true },
  //     { key: "recipientName", label: "Respondent / entity name", type: "text", required: true },
  //     { key: "evidenceType", label: "Evidence required", type: "select", options: ["Bank account statements", "CDR (Call Detail Records)", "IP logs / login records", "Transaction logs", "Email records", "CCTV footage", "All electronic records"], required: true },
  //     { key: "periodFrom", label: "Period from", type: "date", required: true },
  //     { key: "periodTo", label: "Period to", type: "date", required: true },
  //     { key: "hearingDate", label: "Date of next hearing", type: "date", required: true },
  //     { key: "judgeName", label: "Presiding judge / magistrate", type: "text" },
  //     { key: "applicantName", label: "Applicant / IO name", type: "text", required: true },
  //     { key: "applicantDesignation", label: "Designation", type: "text", required: true },
  //   ],
  // },
];

// ─── Notice content generator ─────────────────────────────────────────────────
function generateNoticeContent(template: NoticeTemplate, values: Record<string, string>): string {
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const refNo = `FX/NOT/${Math.floor(Math.random() * 90000) + 10000}/${new Date().getFullYear()}`;

  const headers: Record<NoticeType, string> = {
    "94-bnss": `NOTICE UNDER SECTION 94, BHARATIYA NAGARIK SURAKSHA SANHITA, 2023\nProduction of Documents / Electronic Records`,
    "bank-freeze": `URGENT REQUEST FOR FREEZE OF BANK ACCOUNT\nPending Investigation under ${values.caseRef || "[Case Ref]"}`,
    "account-details": `REQUEST FOR ACCOUNT HOLDER DETAILS AND KYC DOCUMENTS`,
    "payment-gateway": `REQUEST FOR MERCHANT KYC AND TRANSACTION HOLD\nPayment Gateway Compliance`,
    "ncrp-reference": `URGENT REQUEST FOR CYBERCRIME FRAUD REVERSAL\nUnder NCRP / MHA Cyber Helpline 1930 Protocol`,
    "wallet-freeze": `URGENT REQUEST FOR WALLET / UPI ACCOUNT FREEZE`,
    "crypto-exchange": `REQUEST FOR ACCOUNT FREEZE AND KYC DETAILS\nVirtual Digital Asset (VDA) Account — PMLA Compliance`,
    "court-production": `NOTICE FOR PRODUCTION OF ELECTRONIC RECORDS / DOCUMENTS\nUnder Section 94, BNSS, 2023`,
  };

  const bodies: Record<NoticeType, string> = {
    "94-bnss": `
To,
The Branch Manager / Nodal Officer,
${values.recipientName || "[Recipient Name]"},
${values.recipientAddress || "[Address]"}

Sir / Madam,

Subject: Production of Documents in connection with Case No. ${values.caseRef || "[Case Ref]"}

I am ${values.officerName || "[Officer Name]"}, ${values.officerDesignation || "[Designation]"}, ${values.psName || "[PS Name]"}, presently investigating the above-referenced case registered under the Bharatiya Nyaya Sanhita, 2023.

In connection with the aforesaid investigation, you are hereby directed under Section 94 of the Bharatiya Nagarik Suraksha Sanhita, 2023 to produce the following documents / information:

DOCUMENTS REQUIRED:
${values.documentType || "[Document Type]"} for the following account number(s):
${values.accountNumbers || "[Account Numbers]"}

PERIOD: ${values.periodFrom || "[From]"} to ${values.periodTo || "[To]"}

You are directed to provide the above documents in electronic format (PDF / Excel / CSV) on or before 7 (seven) working days from the receipt of this notice. Failure to comply constitutes an offence punishable under applicable law.

Please acknowledge receipt of this notice via official email / letter.

Yours faithfully,

${values.officerName || "[Officer Name]"}
${values.officerDesignation || "[Designation]"}
${values.psName || "[Police Station]"}
    `.trim(),

    "bank-freeze": `
To,
The Nodal Officer (Law Enforcement),
${values.bankName || "[Bank Name]"},
Branch: ${values.branchName || "[Branch / IFSC]"}
Email: ${values.nodalEmail || "[Nodal Email]"}

Sir / Madam,

Subject: URGENT — Request for Freeze of Account No. ${values.accountNumber || "[Account No.]"} — ${values.urgencyLevel || "Urgent"}

This is to bring to your notice that account number ${values.accountNumber || "[Account No.]"} held in the name of ${values.accountHolder || "[Account Holder]"} at your bank is being used in connection with Case No. ${values.caseRef || "[Case Ref]"} being investigated by this office.

REASON: ${values.reason || "[Reason]"}

You are hereby requested to immediately implement a ${(values.freezeType || "[Freeze Type]").toLowerCase()} on the above account pending investigation and further orders from competent court / authority.

REQUEST URGENCY: ${values.urgencyLevel || "[Urgency]"}

Kindly confirm freeze action via email to ${values.officerContact || "[Contact]"} at the earliest. Non-compliance may attract action under applicable law.

Yours faithfully,

${values.officerName || "[Officer Name]"}
${values.psName || "[Police Station]"}
Contact: ${values.officerContact || "[Contact]"}
    `.trim(),

    "account-details": `
To,
The Nodal Officer (Law Enforcement),
${values.bankName || "[Bank Name]"}

Sir / Madam,

Subject: Request for Account Holder Details — Account No. ${values.accountNumber || "[Account No.]"}

In connection with Case No. ${values.caseRef || "[Case Ref]"} under investigation by ${values.psName || "[PS Name]"}, you are requested to furnish the following information for account ${values.accountNumber || "[Account No.]"} (IFSC: ${values.ifscCode || "[IFSC]"}):

INFORMATION REQUIRED: ${values.infoRequired || "[Info Required]"}

The above information is required for the purpose of investigation. Please provide the same within 3 working days of receipt of this request. This is a statutory request under Section 91/94 BNSS.

Yours faithfully,

${values.officerName || "[Officer Name]"}
${values.officerDesignation || "[Designation]"}
${values.psName || "[PS Name]"}
Contact: ${values.officerContact || "[Contact]"}
    `.trim(),

    "payment-gateway": `
To,
The Nodal Compliance Officer,
${values.pgName || "[Payment Gateway]"}

Sir / Madam,

Subject: Request for Merchant Hold and Transaction Records — Merchant ID: ${values.merchantId || "[Merchant ID]"}

This office is investigating Case No. ${values.caseRef || "[Case Ref]"} involving fraudulent transactions routed through your payment gateway.

MERCHANT DETAILS:
Merchant ID / VPA: ${values.merchantId || "[Merchant ID]"}
Merchant Name: ${values.merchantName || "[Merchant Name]"}

ACTION REQUIRED: ${values.actionRequired || "[Action Required]"}

TRANSACTION PERIOD: ${values.periodFrom || "[From]"} to ${values.periodTo || "[To]"}

You are hereby requested to comply with the above action immediately and share the required records with this office. This request is made under Section 94 BNSS and RBI Payment Aggregator Guidelines 2020.

Yours faithfully,

${values.officerName || "[Officer Name]"}
${values.psName || "[PS Name]"}
Contact: ${values.officerContact || "[Contact]"}
    `.trim(),

    "ncrp-reference": `
To,
The Nodal Officer (Cybercrime / Law Enforcement),
${values.bankName || "[Bank Name]"}

Sir / Madam,

Subject: URGENT — Cybercrime Fraud — NCRP Reference No. ${values.ncrpRef || "[NCRP Ref]"} — Request for Immediate Action

With reference to the above NCRP complaint lodged on the National Cybercrime Reporting Portal (cybercrime.gov.in) / MHA Helpline 1930, the details are as under:

Victim Name: ${values.victimName || "[Victim Name]"}
Victim Mobile: ${values.victimMobile || "[Mobile]"}
Fraud Amount: ${values.fraudAmount || "[Amount]"}
Date of Fraud: ${values.fraudDate || "[Date]"}
Suspect Account / UPI: ${values.suspectAccount || "[Account / UPI]"}

You are urgently requested to freeze the above account / hold the credited amount and share the account holder details with this office immediately.

Delay in action may result in the fraudulent amount being withdrawn, causing irreversible financial loss to the victim.

Yours faithfully,

${values.officerName || "[Officer Name]"}
${values.psName || "[Police Station]"}
Contact: ${values.officerContact || "[Contact]"}
    `.trim(),

    "wallet-freeze": `
To,
The Nodal Compliance Officer (Law Enforcement),
${values.walletProvider || "[Wallet Provider]"}

Sir / Madam,

Subject: URGENT — Request for Wallet / UPI Account Freeze — ${values.upiId || "[UPI ID]"}

In connection with Case No. ${values.caseRef || "[Case Ref]"}, you are hereby requested to take the following action on the UPI ID / wallet account ${values.upiId || "[UPI ID]"} immediately:

ACTION: ${values.actionRequired || "[Action Required]"}

TRANSACTION DETAILS:
Amount: ${values.fraudAmount || "[Amount]"}
Date: ${values.transactionDate || "[Date]"}
UTR / Reference: ${values.utrNumber || "[UTR]"}

This request is made under Section 102 BNSS, RBI PPI Master Directions, and NPCI Guidelines. Please confirm action within 2 hours of receipt.

Yours faithfully,

${values.officerName || "[Officer Name]"}
${values.psName || "[Police Station]"}
Contact: ${values.officerContact || "[Contact]"}
    `.trim(),

    "crypto-exchange": `
To,
The Compliance / Nodal Officer (Law Enforcement Cell),
${values.exchangeName || "[Exchange Name]"}

Sir / Madam,

Subject: Request for Account Freeze and KYC Details — PMLA / BNSS

In connection with Case No. ${values.caseRef || "[Case Ref]"}, this office is investigating suspected proceeds of crime routed through a cryptocurrency account on your platform.

ACCOUNT DETAILS:
UPI ID / Email: ${values.upiId || "[UPI / Email]"}
Linked Mobile: ${values.linkedMobile || "[Mobile]"}
Amount Involved: ${values.cryptoAmount || "[Amount]"}
Period: ${values.periodFrom || "[From]"} to ${values.periodTo || "[To]"}

ACTION REQUIRED: ${values.actionRequired || "[Action Required]"}

This request is made under the Prevention of Money Laundering Act, 2002 (as amended), FIU-IND reporting obligations, and Section 94 BNSS. You are directed to comply within 24 hours.

Yours faithfully,

${values.officerName || "[Officer Name]"}
${values.officerDesignation || "[Designation]"}
${values.psName || "[PS Name]"}
Contact: ${values.officerContact || "[Contact]"}
    `.trim(),

    "court-production": `
IN THE COURT OF ${(values.courtName || "[Court Name]").toUpperCase()}
Case No.: ${values.caseRef || "[Case No.]"}

NOTICE UNDER SECTION 94, BHARATIYA NAGARIK SURAKSHA SANHITA, 2023

To,
${values.recipientName || "[Recipient]"}

WHEREAS in the above case, the following evidence is required to be produced before this Court:

EVIDENCE: ${values.evidenceType || "[Evidence Type]"}
PERIOD: ${values.periodFrom || "[From]"} to ${values.periodTo || "[To]"}

YOU ARE HEREBY DIRECTED to produce the above evidence / electronic records in certified form before this Court on or before ${values.hearingDate || "[Hearing Date]"} (date of next hearing).

Failure to comply with this notice may render you liable to punishment as provided under the Bharatiya Nagarik Suraksha Sanhita, 2023.

Given under my hand and seal of the Court.

${values.judgeName || "[Magistrate / Judge Name]"}
${values.courtName || "[Court Name]"}

Submitted by:
${values.applicantName || "[Applicant Name]"}
${values.applicantDesignation || "[Designation]"}
    `.trim(),
  };

  return [
    `Ref. No.: ${refNo}`,
    `Date: ${today}`,
    ``,
    `${"─".repeat(60)}`,
    headers[template.id],
    `${"─".repeat(60)}`,
    ``,
    bodies[template.id] || "",
    ``,
    `${"─".repeat(60)}`,
    `Generated by FinExis Notice Generator — LEA Licensed`,
    `This notice is a legally formatted draft. Review with qualified counsel before dispatch.`,
  ].join("\n");
}

// ─── License gate ─────────────────────────────────────────────────────────────
function LicenseGate({ onUnlock }: { onUnlock: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 border border-amber-100">
        <Lock size={28} className="text-amber-500" />
      </div>
      <h2 className="font-display text-[22px] font-semibold text-ink mb-3">LEA License Required</h2>
      <p className="max-w-md text-[14px] text-ink-muted leading-relaxed mb-6">
        The Notice Generator is available exclusively to verified Law Enforcement Agencies, forensic firms, and licensed legal teams. Upgrade your FinExis plan to access automated legal notice drafting.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="rounded-xl border border-line bg-surface p-5 text-left shadow-card w-[240px]">
          <BadgeCheck size={18} className="text-forensic-500 mb-2" />
          <p className="text-[13px] font-semibold text-ink mb-1">What you get</p>
          <ul className="space-y-1.5 text-[12px] text-ink-muted">
            <li>• S.94 BNSS production notices</li>
            <li>• Bank account freeze letters</li>
            <li>• Payment gateway holds</li>
            <li>• Wallet / UPI freeze requests</li>
            <li>• Crypto exchange KYC demands</li>
            <li>• NCRP urgency references</li>
            <li>• Court production notices</li>
          </ul>
        </div>
        <div className="rounded-xl border border-forensic-100 bg-forensic-50 p-5 text-left shadow-card w-[240px]">
          <Scale size={18} className="text-forensic-600 mb-2" />
          <p className="text-[13px] font-semibold text-forensic-700 mb-1">LEA License includes</p>
          <ul className="space-y-1.5 text-[12px] text-forensic-600">
            <li>• Auto-populated from case data</li>
            <li>• Edit before dispatch</li>
            <li>• Download as PDF / DOCX</li>
            <li>• Saved to Evidence Locker</li>
            <li>• Full audit trail</li>
          </ul>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onUnlock}
          className="flex items-center gap-2 rounded-xl bg-forensic-500 px-6 py-3 text-[14px] font-semibold text-white hover:bg-forensic-600 transition-colors shadow-card"
        >
          <BadgeCheck size={16} />
          Activate LEA License (Demo)
        </button>
        <button className="flex items-center gap-2 rounded-xl border border-line bg-surface px-6 py-3 text-[14px] font-medium text-ink-muted hover:text-ink transition-colors">
          Contact sales
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function NoticeGeneratorPage() {
  const [licensed, setLicensed] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<NoticeTemplate | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [drafts, setDrafts] = useState<DraftedNotice[]>([
    {
      id: "d1",
      type: "bank-freeze",
      name: "SBI Freeze — FX-2847",
      createdAt: "Jul 8, 2026",
      caseRef: "FX-2847",
      status: "final",
      content: "",
    },
    {
      id: "d2",
      type: "94-bnss",
      name: "S.94 BNSS — HDFC Account Details",
      createdAt: "Jul 7, 2026",
      caseRef: "FX-2847",
      status: "draft",
      content: "",
    },
  ]);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string | null>(null);

  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<"compose" | "drafts">("compose");

  function handleFieldChange(key: string, value: string) {
    setFormValues((v) => ({ ...v, [key]: value }));
  }

  function handlePreview() {
    if (!selectedTemplate) return;
    const content = generateNoticeContent(selectedTemplate, formValues);
    setPreviewContent(content);
    setEditContent(content);
    setShowPreview(true);
  }

  function handleSaveDraft(status: "draft" | "final") {
    if (!selectedTemplate || !previewContent) return;
    const notice: DraftedNotice = {
      id: `d${Date.now()}`,
      type: selectedTemplate.id,
      name: `${selectedTemplate.shortName} — ${formValues.caseRef || "New case"}`,
      createdAt: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      caseRef: formValues.caseRef || "—",
      status,
      content: editContent || previewContent,
    };
    setDrafts((d) => [notice, ...d]);
    setShowPreview(false);
    setSelectedTemplate(null);
    setFormValues({});
    setActiveTab("drafts");
  }

  function handleDownload() {
    const content = editContent || previewContent || "";
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedTemplate?.shortName || "Notice"}_${formValues.caseRef || "draft"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDeleteDraft(id: string) {
    setDrafts((d) => d.filter((x) => x.id !== id));
  }

  const typeIconMap: Record<NoticeType, typeof Scale> = {
    "94-bnss": Scale,
    "bank-freeze": Landmark,
    "account-details": Building2,
    "payment-gateway": CreditCard,
    "ncrp-reference": ShieldAlert,
    "wallet-freeze": CreditCard,
    "crypto-exchange": ShieldAlert,
    "court-production": FileText,
  };

  if (!licensed) {
    return (
      <div>
        <Topbar title="Notice Generator" subtitle="Automated legal notice drafting for LEA — S.94 BNSS, bank freeze, payment gateway holds, and more" />
        <LicenseGate onUnlock={() => setLicensed(true)} />
      </div>
    );
  }

  return (
    <div>
      <Topbar title="Notice Generator" subtitle="Draft, edit, and download legal notices — LEA License active" />

      <div className="px-5 py-6 lg:px-8 lg:py-8">
        {/* License badge */}
        <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-forensic-100 bg-forensic-50 px-4 py-2.5 w-fit">
          <BadgeCheck size={15} className="text-forensic-500" />
          <span className="text-[12.5px] font-semibold text-forensic-700">LEA License active — SPYINT Technologies Pvt. Ltd.</span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-line">
          {(["compose", "drafts"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setActiveTab(t); setShowPreview(false); }}
              className={`px-5 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-colors capitalize ${activeTab === t ? "border-forensic-500 text-forensic-600" : "border-transparent text-ink-muted hover:text-ink"}`}
            >
              {t === "compose" ? "Compose notice" : `Saved notices (${drafts.length})`}
            </button>
          ))}
        </div>

        {/* COMPOSE TAB */}
        {activeTab === "compose" && !showPreview && (
          <div className="space-y-6">
            {/* Template picker */}
            <div>
              <p className="text-[13px] font-semibold text-ink mb-3">Select notice type</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TEMPLATES.map((t) => {
                  const Icon = t.icon;
                  const active = selectedTemplate?.id === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => { setSelectedTemplate(t); setFormValues({}); }}
                      className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all ${active ? "border-forensic-300 bg-forensic-50 shadow-card" : "border-line bg-surface hover:border-forensic-200 shadow-card"}`}
                    >
                      <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${active ? "bg-forensic-100 text-forensic-600" : "bg-paper text-ink-muted"}`}>
                        <Icon size={17} />
                      </span>
                      <span className={`text-[12px] font-semibold leading-snug ${active ? "text-forensic-700" : "text-ink"}`}>{t.shortName}</span>
                      <span className="text-[11px] text-ink-faint leading-snug line-clamp-2">{t.description.split(".")[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form */}
            {selectedTemplate && (
              <div className="rounded-xl border border-line bg-surface shadow-card overflow-hidden">
                {/* Header */}
                <div className="flex items-start gap-4 p-5 border-b border-line-soft bg-paper">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-forensic-50 text-forensic-600 shrink-0 mt-0.5">
                    <selectedTemplate.icon size={18} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-ink">{selectedTemplate.name}</p>
                    <p className="text-[12px] text-ink-muted mt-0.5">{selectedTemplate.legalBasis}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="rounded-full bg-amber-50 border border-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-600">
                      To: {selectedTemplate.authority}
                    </span>
                    <span className="text-[11px] text-ink-faint">{selectedTemplate.turnaround}</span>
                  </div>
                </div>

                {/* Fields */}
                <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedTemplate.fields.map((f) => (
                      <div key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                        <label className="block text-[12px] font-medium text-ink-muted mb-1.5">
                          {f.label}
                          {f.required && <span className="text-flag-500 ml-0.5">*</span>}
                        </label>
                        {f.type === "textarea" ? (
                          <textarea
                            rows={3}
                            placeholder={f.placeholder}
                            value={formValues[f.key] || ""}
                            onChange={(e) => handleFieldChange(f.key, e.target.value)}
                            className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-[13px] text-ink placeholder:text-ink-faint focus:border-forensic-300 focus:outline-none focus:ring-1 focus:ring-forensic-100 resize-none"
                          />
                        ) : f.type === "select" ? (
                          <select
                            value={formValues[f.key] || ""}
                            onChange={(e) => handleFieldChange(f.key, e.target.value)}
                            className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-[13px] text-ink focus:border-forensic-300 focus:outline-none"
                          >
                            <option value="">Select...</option>
                            {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <input
                            type={f.type}
                            placeholder={f.placeholder}
                            value={formValues[f.key] || ""}
                            onChange={(e) => handleFieldChange(f.key, e.target.value)}
                            className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-[13px] text-ink placeholder:text-ink-faint focus:border-forensic-300 focus:outline-none focus:ring-1 focus:ring-forensic-100"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center gap-3 pt-4 border-t border-line-soft">
                    <button
                      onClick={handlePreview}
                      className="flex items-center gap-2 rounded-lg bg-forensic-500 px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-forensic-600 transition-colors"
                    >
                      <Eye size={14} />
                      Preview &amp; edit notice
                    </button>
                    <button
                      onClick={() => { setSelectedTemplate(null); setFormValues({}); }}
                      className="flex items-center gap-2 rounded-lg border border-line bg-paper px-4 py-2.5 text-[13px] font-medium text-ink-muted hover:text-ink transition-colors"
                    >
                      Clear
                    </button>
                    <div className="flex items-center gap-1.5 ml-auto text-[11.5px] text-ink-faint">
                      <AlertTriangle size={12} />
                      Review with qualified counsel before dispatch
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PREVIEW / EDIT */}
        {activeTab === "compose" && showPreview && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[14px] font-semibold text-ink">{selectedTemplate?.name}</p>
                <p className="text-[12px] text-ink-muted mt-0.5">Edit the notice below before saving or downloading</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPreview(false)}
                  className="flex items-center gap-1.5 rounded-lg border border-line bg-paper px-3.5 py-2 text-[13px] font-medium text-ink-muted hover:text-ink transition-colors"
                >
                  <ChevronUp size={14} /> Back
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3.5 py-2 text-[13px] font-medium text-ink hover:border-forensic-200 transition-colors"
                >
                  <Download size={14} /> Download .txt
                </button>
                <button
                  onClick={() => handleSaveDraft("draft")}
                  className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2 text-[13px] font-medium text-amber-700 hover:bg-amber-100 transition-colors"
                >
                  Save as draft
                </button>
                <button
                  onClick={() => handleSaveDraft("final")}
                  className="flex items-center gap-1.5 rounded-lg bg-forensic-500 px-4 py-2 text-[13px] font-semibold text-white hover:bg-forensic-600 transition-colors"
                >
                  <CheckCircle2 size={14} /> Mark final
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-line bg-surface shadow-card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-line-soft bg-paper">
                <Edit3 size={13} className="text-ink-faint" />
                <span className="text-[12px] text-ink-muted">Editable notice — all changes are local until saved</span>
              </div>
              <textarea
                value={editContent || ""}
                onChange={(e) => setEditContent(e.target.value)}
                rows={32}
                className="w-full px-6 py-5 font-mono text-[12.5px] text-ink leading-relaxed bg-surface focus:outline-none resize-none"
                spellCheck={false}
              />
            </div>
          </div>
        )}

        {/* DRAFTS TAB */}
        {activeTab === "drafts" && (
          <div className="space-y-3">
            {drafts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <FileSignature size={32} className="text-ink-faint mb-3" />
                <p className="text-[14px] font-medium text-ink-muted">No notices saved yet</p>
                <p className="text-[12px] text-ink-faint mt-1">Compose a notice and save it here</p>
              </div>
            )}
            {drafts.map((d) => {
              const Icon = typeIconMap[d.type] || FileText;
              return (
                <div key={d.id} className="rounded-xl border border-line bg-surface shadow-card p-4 flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-forensic-50 text-forensic-600 shrink-0">
                    <Icon size={17} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-semibold text-ink truncate">{d.name}</p>
                    <p className="text-[11.5px] text-ink-muted mt-0.5">Case: {d.caseRef} · {d.createdAt}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${d.status === "final" ? "bg-forensic-50 border-forensic-100 text-forensic-700" : "bg-amber-50 border-amber-100 text-amber-700"}`}>
                    {d.status === "final" ? "Final" : "Draft"}
                  </span>
                  <div className="flex gap-1.5">
                    <button className="flex items-center gap-1.5 rounded-lg border border-line bg-paper px-3 py-1.5 text-[12px] font-medium text-ink-muted hover:text-ink transition-colors">
                      <Eye size={12} /> View
                    </button>
                    <button className="flex items-center gap-1.5 rounded-lg border border-line bg-paper px-3 py-1.5 text-[12px] font-medium text-ink-muted hover:text-ink transition-colors">
                      <Download size={12} /> Download
                    </button>
                    <button className="flex items-center gap-1.5 rounded-lg border border-line bg-paper px-3 py-1.5 text-[12px] font-medium text-ink-muted hover:text-ink transition-colors">
                      <Copy size={12} /> Duplicate
                    </button>
                    <button
                      onClick={() => handleDeleteDraft(d.id)}
                      className="flex items-center gap-1.5 rounded-lg border border-line bg-paper px-3 py-1.5 text-[12px] font-medium text-ink-muted hover:text-flag-500 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
