// src/utils/txnRules.ts

export interface ChipDefinition {
  id: string;
  label: string;
  keywords: string[];
  regex?: RegExp;
}

export interface TransactionRow {
  id: string;
  date: string;
  sortDate?: string;
  desc: string;
  amount: number | string;
  drCr: string;
  type: string;
  category?: string;
  beneficiary?: string;
  ref?: string;
  chqNo?: string;
  balance?: number | string;
  personId?: string;
  personName?: string;
  risk?: "High" | "Medium" | "Low";
  tags?: string[];
  flagged?: boolean;
  metaIfscCode?: string;
}

export const CHIP_DEFINITIONS: ChipDefinition[] = [
  {
    id: "salary",
    label: "Salary",
    keywords: ["SALARY", "SAL", "SAL PAY", "PAYROLL", "PAYSLIP", "PAY CREDIT", "SAL CR", "WAGES", "MONTHLY SALARY", "PAYROLL CREDIT", "HRMS", "SAL TRANSFER", "SALA", "PAYR", "EMP SAL", "NEFT SALARY"]
  },
  {
    id: "check_bounce",
    label: "Check Bounce",
    keywords: ["CHQ RETURN", "CHEQUE RETURN", "RETURN CHQ", "CHQ BOUNCE", "INSUFFICIENT FUNDS", "RETURNED CHEQUE", "CTS RETURN", "CHEQUE DISHONOUR"]
  },
  {
    id: "ecs",
    label: "ECS",
    regex: /(ECS|NACH|AUTODEBIT|ACH)\b.*\b(BOUNCE|BOUNCED|RETURN|DISHONOUR|INSUFFICIENT|FAIL|FAILED|REJECT|REJECTED)/i,
    keywords: ["ECS RETURN", "ACH RETURN", "NACH RETURN", "RETURN ECS", "RETURN ACH", "RETURN NACH", "ACH FAILED", "ECS FAILED", "MANDATE FAILED", "AUTO DEBIT FAILED", "ACH REVERSAL", "NACH REVERSAL", "RETURN CHARGES", "INSUFFICIENT FUNDS"]
  },
  {
    id: "auto_debit",
    label: "Auto debit",
    keywords: ["AUTO DEBIT", "AUTODEBIT", "AUTO-DR", "AUTO PAY", "AUTOPAY", "AUTO PAYMENT", "AUTO PMT", "AUTO COLLECTION", "AUTO RECOVERY", "AUTO CHARGE", "AUTO TRANSFER", "AUTO TRF", "AUTO SWEEP", "AUTO SETTLEMENT", "STANDING INSTRUCTION", "STANDING INST", "SI", "SI PAYMENT", "SI DEBIT", "MANDATE", "MANDATE DEBIT", "MANDATE PAYMENT", "E-MANDATE", "EMANDATE", "E NACH", "NACH", "ACH", "ECS", "RECURRING PAYMENT", "RECURRING DEBIT", "RECURRING BILL", "AUTO BILL PAY", "AUTO BILL PAYMENT", "SCHEDULED PAYMENT", "SCHEDULED DEBIT"]
  },
  {
    id: "upi_autopay",
    label: "UPI autopay",
    keywords: ["UPI AUTOPAY", "AUTOPAY", "AUTO PAY", "UPI MANDATE", "UPI SUBSCRIPTION", "UPI RECURRING", "UPI SI", "UPI AUTO DEBIT", "MANDATE EXECUTION", "AUTOPAY DEBIT"]
  },
  {
    id: "card_mandates",
    label: "Card mandates",
    keywords: ["CARD MANDATE", "CARD AUTO PAY", "VISA MANDATE", "MASTERCARD MANDATE", "RUPAY MANDATE", "AMEX MANDATE", "TOKENIZED PAYMENT", "RECURRING CARD", "ECOM RECURRING"]
  },
  {
    id: "subscriptions",
    label: "Subscriptions",
    keywords: ["NETFLIX", "AMAZON PRIME", "PRIME VIDEO", "SPOTIFY", "APPLE", "APPLE.COM", "GOOGLE", "GOOGLE PLAY", "YOUTUBE", "HOTSTAR", "JIOCINEMA", "SONYLIV", "CHATGPT", "OPENAI", "MICROSOFT", "ADOBE", "CANVA", "DROPBOX", "ZOOM", "SLACK", "NOTION", "FIGMA", "GITHUB"]
  },
  {
    id: "emi_payments",
    label: "EMI payments",
    keywords: ["EMI", "LOAN EMI", "AUTO LOAN", "HOME LOAN", "PERSONAL LOAN", "VEHICLE LOAN", "NACH EMI", "ECS EMI", "ACH EMI", "LOAN REPAYMENT", "BAJAJ FINSERV", "TATA CAPITAL", "HDFC LOAN", "ICICI LOAN", "SBI LOAN", "KOTAK LOAN", "IDFC LOAN", "AXIS LOAN"]
  },
  {
    id: "insurance_premium",
    label: "Insurance premium",
    keywords: ["LIC", "LIC PREMIUM", "LICI", "HDFC LIFE", "ICICI PRU", "SBI LIFE", "MAX LIFE", "TATA AIA", "BAJAJ ALLIANZ", "ADITYA BIRLA SUN", "STAR HEALTH", "NIVA BUPA", "CARE HEALTH", "ACKO", "PREMIUM", "INSURANCE", "POLICY"]
  },
  {
    id: "sip_investments",
    label: "SIP/investments",
    keywords: ["SIP", "MUTUAL FUND", "MF", "CAMS", "KFINTECH", "ICICI PRU", "HDFC MF", "SBI MF", "NIPPON", "MIRAE", "AXIS MF", "KOTAK MF", "GROWW SIP", "ZERODHA COIN"]
  },
  {
    id: "loan_disbursal",
    label: "Loan disbursal",
    keywords: ["LOAN DISB", "DISBURSEMENT", "SANCTION", "NBFC", "FINANCE", "LOAN CREDIT", "PERSONAL LOAN", "HOME LOAN"]
  },
  {
    id: "pg_settlement",
    label: "Payment Gateway Settlements",
    keywords: ["RAZORPAY SETTLEMENT", "CASHFREE SETTLEMENT", "PAYU SETTLEMENT", "CCAVENUE SETTLEMENT", "BILLDESK", "PAYTM PG", "PHONEPE PG", "PAYTM SETTLEMENT", "PAYU PAYOUT", "INSTAMOJO", "EASEBUZZ", "AIRPAY", "JUSPAY", "PAYTM GATEWAY"]
  },
  {
    id: "foreign_remittance",
    label: "Foreign Remittance",
    keywords: ["SWIFT", "REMITTANCE", "FOREIGN INWARD", "FOREIGN OUTWARD", "WIRE TRANSFER", "TT", "FCY", "USD", "EUR", "GBP", "REMITLY", "WISE", "WESTERN UNION", "MONEYGRAM", "XOOM", "PAYONEER", "DEEL", "RIPPLING"]
  },
  {
    id: "merchant_payouts",
    label: "Merchant Payouts",
    keywords: ["PAYOUT", "SETTLEMENT", "MERCHANT PAYOUT", "BULK PAYOUT", "VENDOR PAYMENT", "SETTLED", "DISBURSEMENT", "PAYOUT REF"]
  },
  {
    id: "ecommerce_seller",
    label: "E-comm Seller Payouts",
    keywords: ["AMAZON SELLER", "FLIPKART SELLER", "MEESHO SELLER", "SHOPIFY PAYOUT", "AJIO SELLER", "NYKAA SELLER", "SNAPDEAL SELLER", "JIOMART SELLER", "SELLER PAYMENT"]
  },
  {
    id: "refunds",
    label: "Refunds",
    keywords: ["REFUND", "REVERSAL", "REV", "CHARGEBACK", "REVERSED", "REFUND CREDIT", "UPI REVERSAL", "CARD REFUND", "FAILED TXN REFUND"]
  },
  {
    id: "marketplace_payments",
    label: "Marketplace Payments",
    keywords: ["AMAZON", "FLIPKART", "MEESHO", "AJIO", "SNAPDEAL", "NYKAA", "ETSY", "EBAY", "JIOMART", "INDIA MART", "TRADEINDIA"]
  },
  {
    id: "cashbacks",
    label: "Cashbacks",
    keywords: ["CASHBACK", "REWARD", "REWARD POINTS", "BONUS", "CB", "PROMO CREDIT", "INCENTIVE", "OFFER CREDIT", "WALLET CASHBACK"]
  },
  {
    id: "interest_credits",
    label: "Interest Credits",
    keywords: ["INT CR", "INTEREST", "SAVINGS INTEREST", "FD INTEREST", "RD INTEREST", "INTEREST CREDITED", "BANK INTEREST"]
  },
  {
    id: "donations",
    label: "Donations",
    keywords: ["DONATION", "CHARITY", "NGO", "GIVEINDIA", "KETTO", "MILAAP", "PM CARES", "CM RELIEF", "TEMPLE DONATION", "TRUST DONATION", "ZAKAT", "GURUDWARA"]
  },
  {
    id: "govt_challans",
    label: "Govt Challans",
    keywords: ["CHALLAN", "GRAS", "EGRAS", "BHARATKOSH", "GST CHALLAN", "INCOME TAX", "NSDL TAX", "TIN NSDL", "MCA", "PARIVAHAN", "VAHAN", "TREASURY", "EPFO", "ESIC"]
  },
  {
    id: "business_gst",
    label: "Business GST",
    keywords: ["GST", "GSTN", "GST PAYMENT", "GST REFUND", "GST CHALLAN", "GSTIN", "CBIC", "TAX PAYMENT", "INPUT TAX", "OUTPUT TAX"]
  }
];

export const parseAmountNumber = (val: number | string | undefined | null): number => {
  if (val === undefined || val === null) return 0;
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  const cleaned = val.replace(/[^0-9.-]+/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const parseCustomDate = (dateStr?: string): Date | null => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  return null;
};

export const formatCurrency = (val: number | string | undefined | null): string => {
  const num = parseAmountNumber(val);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(num);
};

export const extractTxnDetails = (txn: TransactionRow) => {
  const desc = txn.desc || "";
  
  const phoneMatch = desc.match(/\b[6-9]\d{4}[\d*]{4}\d{1}\b|\b[6-9]\d{9}\b/);
  const upiMatch = desc.match(/[\w.\-+]+@[\w\-]*/);
  const descIfsc = desc.match(/\b[A-Z]{4}0[A-Z0-9]{6}\b/)?.[0] || null;
  const metaIfsc = txn.metaIfscCode && txn.metaIfscCode !== "UNKNOWN" ? txn.metaIfscCode : null;

  const descLower = desc.toLowerCase();
  const matchedChips = CHIP_DEFINITIONS.filter(chip => 
    chip.regex ? chip.regex.test(desc) : chip.keywords.some(kw => descLower.includes(kw.toLowerCase()))
  );

  return {
    phone: phoneMatch ? phoneMatch[0] : null,
    upi: upiMatch && upiMatch[0] !== "@" ? upiMatch[0] : null,
    ifsc: metaIfsc || descIfsc,
    matchedChips
  };
};

export const calculateRisk = (txn: TransactionRow): "High" | "Medium" | "Low" => {
  if (txn.risk) return txn.risk;
  const desc = (txn.desc || "").toUpperCase();
  const highRiskKw = [
    "AEPS", "AADHARPAY", "CSP", "BC AGENT", "MICRO ATM", "KREDITBEE", "MONEYVIEW", 
    "COINDCX", "WAZIRX", "BINANCE", "1XBET", "STAKE", "HAWALA"
  ];
  const medRiskKw = ["RAZORPAY", "CASHFREE", "PAYU", "SETTLEMENT", "PAYOUT", "SWIFT", "WISE"];

  if (highRiskKw.some(kw => desc.includes(kw))) return "High";
  if (medRiskKw.some(kw => desc.includes(kw))) return "Medium";
  return "Low";
};