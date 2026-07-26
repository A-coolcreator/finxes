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
  // --- Existing Core Chips (Updated & Guarded) ---
  {
    id: "salary",
    label: "Salary",
    regex: /\b(SALARY|SAL\s+CREDIT|PAYROLL|PAYSLIP|PAY\s+CREDIT|SAL\s+CR|WAGES|MONTHLY\s+SALARY|EMPLOYEE\s+PAY|MONTHLY\s+PAY|SALPAY|NEFT\s+SALARY)\b/i,
    keywords: ["SALARY", "SAL CREDIT", "PAYROLL", "PAYSLIP", "PAY CREDIT", "SAL CR", "WAGES", "MONTHLY SALARY", "EMPLOYEE PAY", "MONTHLY PAY", "SALPAY", "HRMS", "SAL TRANSFER", "NEFT SALARY"]
  },
  {
    id: "check_bounce",
    label: "Check Bounce",
    keywords: ["CHQ RETURN", "CHEQUE RETURN", "RETURN CHQ", "CHQ BOUNCE", "INSUFFICIENT FUNDS", "RETURNED CHEQUE", "CTS RETURN", "CHEQUE DISHONOUR"]
  },
  {
    id: "ecs",
    label: "ECS Return",
    regex: /(ECS|NACH|AUTODEBIT|ACH)\b.*\b(BOUNCE|BOUNCED|RETURN|DISHONOUR|INSUFFICIENT|FAIL|FAILED|REJECT|REJECTED)/i,
    keywords: ["ECS RETURN", "ACH RETURN", "NACH RETURN", "RETURN ECS", "RETURN ACH", "RETURN NACH", "ACH FAILED", "ECS FAILED", "MANDATE FAILED", "AUTO DEBIT FAILED", "ACH REVERSAL", "NACH REVERSAL", "RETURN CHARGES", "INSUFFICIENT FUNDS"]
  },
  {
    id: "auto_debit",
    label: "Auto debit",
    regex: /\b(AUTO\s*DEBIT|AUTODEBIT|AUTO-DR|AUTO\s*PAY|AUTOPAY|AUTO\s*PAYMENT|AUTO\s*PMT|AUTO\s*COLLECTION|AUTO\s*RECOVERY|AUTO\s*CHARGE|AUTO\s*TRANSFER|AUTO\s*TRF|AUTO\s*SWEEP|AUTO\s*SETTLEMENT|STANDING\s+INSTRUCTION|STANDING\s+INST|\bSI\b\s+PAYMENT|\bSI\s+DEBIT|MANDATE|MANDATE\s+DEBIT|MANDATE\s+PAYMENT|E-MANDATE|EMANDATE|\bE\s+NACH\b|\bNACH\b|\bACH\b|\bECS\b|RECURRING\s+PAYMENT|RECURRING\s+DEBIT|RECURRING\s+BILL|AUTO\s+BILL\s+PAY|AUTO\s+BILL\s+PAYMENT|SCHEDULED\s+PAYMENT|SCHEDULED\s+DEBIT)\b/i,
    keywords: ["AUTO DEBIT", "AUTODEBIT", "AUTO-DR", "AUTO PAY", "AUTOPAY", "AUTO PAYMENT", "AUTO PMT", "AUTO COLLECTION", "AUTO RECOVERY", "AUTO CHARGE", "AUTO TRANSFER", "AUTO TRF", "AUTO SWEEP", "AUTO SETTLEMENT", "STANDING INSTRUCTION", "STANDING INST", "SI PAYMENT", "SI DEBIT", "MANDATE", "MANDATE DEBIT", "MANDATE PAYMENT", "E-MANDATE", "EMANDATE", "E NACH", "NACH", "ACH", "ECS", "RECURRING PAYMENT", "RECURRING DEBIT", "RECURRING BILL", "AUTO BILL PAY", "AUTO BILL PAYMENT", "SCHEDULED PAYMENT", "SCHEDULED DEBIT"]
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
    keywords: ["NETFLIX", "AMAZON PRIME", "PRIME VIDEO", "SPOTIFY", "APPLE", "APPLE.COM", "GOOGLE", "GOOGLE PLAY", "YOUTUBE", "YOUTUBE PREMIUM", "HOTSTAR", "JIOCINEMA", "SONYLIV", "CHATGPT", "OPENAI", "MICROSOFT", "ADOBE", "CANVA", "DROPBOX", "ZOOM", "SLACK", "NOTION", "FIGMA", "GITHUB", "RENTOMOJO"]
  },
  {
    id: "emi_payments",
    label: "EMI payments",
    keywords: ["EMI", "LOAN EMI", "AUTO LOAN", "HOME LOAN", "PERSONAL LOAN", "VEHICLE LOAN", "NACH EMI", "ECS EMI", "ACH EMI", "LOAN REPAYMENT", "BAJAJ FINSERV", "TATA CAPITAL", "HDFC LOAN", "ICICI LOAN", "SBI LOAN", "KOTAK LOAN", "IDFC LOAN", "AXIS LOAN"]
  },
  {
    id: "insurance_premium",
    label: "Insurance premium",
    keywords: ["LIC", "LIC PREMIUM", "LICI", "HDFC LIFE", "ICICI PRU", "ICICI LOMBARD", "SBI LIFE", "MAX LIFE", "TATA AIA", "TATA AIG", "BAJAJ ALLIANZ", "ADITYA BIRLA SUN", "STAR HEALTH", "NIVA BUPA", "CARE HEALTH", "ACKO", "PREMIUM", "INSURANCE", "POLICY", "POLICYBAZAAR", "NEW INDIA ASSURANCE"]
  },
  {
    id: "sip_investments",
    label: "SIP/investments",
    keywords: ["SIP", "MUTUAL FUND", "MF", "CAMS", "KFINTECH", "ICICI PRU", "HDFC MF", "SBI MF", "NIPPON", "MIRAE", "AXIS MF", "KOTAK MF", "GROWW SIP", "ZERODHA COIN", "PPFAS", "PARAG PARIKH", "QUANT MF", "ELSS", "NPS", "PPF", "SOVEREIGN GOLD BOND"]
  },
  {
    id: "loan_disbursal",
    label: "Loan disbursal",
    keywords: ["LOAN DISB", "DISBURSEMENT", "SANCTION", "NBFC", "FINANCE", "LOAN CREDIT", "PERSONAL LOAN", "HOME LOAN"]
  },
  {
    id: "pg_settlement",
    label: "Payment Gateway Settlements",
    keywords: ["RAZORPAY SETTLEMENT", "CASHFREE SETTLEMENT", "PAYU SETTLEMENT", "CCAVENUE SETTLEMENT", "BILLDESK", "PAYTM PG", "PHONEPE PG", "PAYTM SETTLEMENT", "PAYU PAYOUT", "INSTAMOJO", "EASEBUZZ", "AIRPAY", "JUSPAY", "PAYTM GATEWAY", "PG SETTLEMENT"]
  },
  {
    id: "foreign_remittance",
    label: "Foreign Remittance",
    regex: /\b(SWIFT|REMITTANCE|FOREIGN\s+INWARD|FOREIGN\s+OUTWARD|WIRE\s+TRANSFER|\bTT\b|FCY|USD|EUR|GBP|REMITLY|WISE|TRANSFERWISE|WESTERN\s+UNION|MONEYGRAM|XOOM|PAYONEER|DEEL|RIPPLING|PAYPAL|WORLDREMIT|RIA\s+MONEY\s+TRANSFER|SKRILL|REVOLUT|MONEY2INDIA|MONEY2WORLD|FOREXPLUS|INSTAREM|BOOKMYFOREX|THOMAS\s+COOK\s+FOREX|NOSTRO|VOSTRO|FIRC|FEMA|LRS|PURPOSE\s+CODE|LETTER\s+OF\s+CREDIT)\b/i,
    keywords: ["SWIFT", "REMITTANCE", "FOREIGN INWARD", "FOREIGN OUTWARD", "WIRE TRANSFER", "TT", "FCY", "USD", "EUR", "GBP", "REMITLY", "WISE", "WESTERN UNION", "MONEYGRAM", "XOOM", "PAYONEER", "DEEL", "RIPPLING", "PAYPAL", "TRANSFERWISE", "WORLDREMIT", "RIA MONEY TRANSFER", "MONEY2INDIA", "MONEY2WORLD", "BOOKMYFOREX"]
  },
  {
    id: "merchant_payouts",
    label: "Merchant Payouts",
    keywords: ["PAYOUT", "SETTLEMENT", "MERCHANT PAYOUT", "BULK PAYOUT", "VENDOR PAYMENT", "SETTLED", "DISBURSEMENT", "PAYOUT REF"]
  },
  {
    id: "ecommerce_seller",
    label: "E-comm Seller Payouts",
    keywords: ["AMAZON SELLER", "FLIPKART SELLER", "MEESHO SELLER", "SHOPIFY PAYOUT", "AJIO SELLER", "NYKAA SELLER", "SNAPDEAL SELLER", "JIOMART SELLER", "SELLER PAYMENT", "AMAZON SETTLEMENT", "FLIPKART SETTLEMENT", "MEESHO SETTLEMENT", "AJIO PAYOUT", "MYNTRA PAYOUT"]
  },
  {
    id: "refunds",
    label: "Refunds",
    keywords: ["REFUND", "REVERSAL", "REV", "CHARGEBACK", "REVERSED", "REFUND CREDIT", "UPI REVERSAL", "CARD REFUND", "FAILED TXN REFUND"]
  },
  {
    id: "marketplace_payments",
    label: "Marketplace Payments",
    keywords: ["AMAZON", "FLIPKART", "MEESHO", "AJIO", "SNAPDEAL", "NYKAA", "ETSY", "EBAY", "JIOMART", "INDIA MART", "TRADEINDIA", "MYNTRA", "SHOPSY", "FIRSTCRY"]
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
    regex: /\b(DONATION|CHARITY|NGO|GIVEINDIA|KETTO|MILAAP|PM\s+CARES|CM\s+RELIEF|TEMPLE\s+DONATION|TRUST\s+DONATION|ZAKAT|GURUDWARA|PMNRF|AKSHAYA\s+PATRA|CRY|GOONJ|SMILE\s+FOUNDATION|HELPAGE|ISKCON|TTD\s+TIRUPATI|SHIRDI\s+SAI|VAISHNO\s+DEVI|WAQF|RED\s+CROSS)\b/i,
    keywords: ["DONATION", "CHARITY", "NGO", "GIVEINDIA", "KETTO", "MILAAP", "PM CARES", "CM RELIEF", "TEMPLE DONATION", "TRUST DONATION", "ZAKAT", "GURUDWARA", "PMNRF", "AKSHAYA PATRA", "CRY", "GOONJ", "ISKCON", "RED CROSS"]
  },
  {
    id: "govt_challans",
    label: "Govt Challans",
    keywords: ["CHALLAN", "GRAS", "EGRAS", "BHARATKOSH", "GST CHALLAN", "INCOME TAX", "NSDL TAX", "TIN NSDL", "MCA", "PARIVAHAN", "VAHAN", "TREASURY", "EPFO", "ESIC", "ADVANCE TAX", "SELF ASSESSMENT TAX", "CUSTOM DUTY", "PROFESSIONAL TAX", "ROAD TAX", "OLTAS"]
  },
  {
    id: "business_gst",
    label: "Business GST",
    keywords: ["GST", "GSTN", "GST PAYMENT", "GST REFUND", "GST CHALLAN", "GSTIN", "CBIC", "TAX PAYMENT", "INPUT TAX", "OUTPUT TAX", "GSTR1", "GSTR3B", "GST COMPOSITION", "EWAY BILL", "ITC", "CGST", "SGST", "IGST"]
  },

  // --- New Categories (CAT Taxonomy Integration) ---
  {
    id: "upi_app",
    label: "UPI Apps",
    keywords: ["GOOGLEPAY", "GPAY", "G-PAY", "GOOGLE PAY", "PHONEPE", "PHONE PE", "PAYTM UPI", "BHIM", "BHIM UPI", "AMAZONPAY", "WHATSAPP PAY", "CRED UPI", "SUPERMONEY", "MOBIKWIK", "FREECHARGE", "SLICE", "JUPITER", "FI MONEY"]
  },
  {
    id: "payment_gateway",
    label: "Payment Gateways",
    keywords: ["RAZORPAY", "RAZORPAYX", "CASHFREE", "PAYU", "PAYTM PG", "CCAVENUE", "BILLDESK", "JUSPAY", "EASEBUZZ", "AIRPAY", "PINELABS", "ATOMTECH", "OPEN MONEY"]
  },
  {
    id: "aeps",
    label: "AEPS / Micro-ATM",
    keywords: ["AEPS", "AADHAARPAY", "AADHAAR PAY", "NPCI AEPS", "MICRO ATM", "BC AGENT", "BANK MITRA", "CSP"]
  },
  {
    id: "atm",
    label: "ATM Cash Withdrawal",
    keywords: ["ATM WDL", "ATM CASH", "CASH WDL", "NFS ATM", "VISA ATM", "RUPAY ATM"]
  },
  {
    id: "merchant_pos",
    label: "Merchant POS",
    keywords: ["POS", "EPOS", "SWIPE", "MERCHANT POS", "CARD SWIPE", "VISA POS", "MASTER POS", "POS PURCHASE"]
  },
  {
    id: "food_delivery",
    label: "Food Delivery",
    keywords: ["SWIGGY", "ZOMATO", "BLINKIT", "INSTAMART", "ZEPTO", "EATCLUB", "DOMINOS", "PIZZAHUT"]
  },
  {
    id: "mobility",
    label: "Mobility & Rides",
    keywords: ["UBER", "OLA", "RAPIDO", "BLUSMART", "NAMMA YATRI"]
  },
  {
    id: "loan_app",
    label: "Loan Apps",
    keywords: ["KREDITBEE", "MONEYVIEW", "CASHE", "FIBE", "EARLYSALARY", "NAVI", "LAZYPAY", "MPOKKET", "BRANCH", "KISSHT", "SNAPMINT", "MONEYTAP", "PAYSENSE", "STASHFIN", "TRUEBALANCE", "CASHBEAN", "DHANI", "INDIALENDS", "ZYPE", "NIRA", "FLEXSALARY", "HOME CREDIT", "AXIO", "POONAWALLA FINCORP", "RUPEEK", "FINNABLE", "PAYME INDIA"]
  },
  {
    id: "nbfc",
    label: "NBFC Payments",
    keywords: ["BAJAJ FINANCE", "TATA CAPITAL", "L&T FINANCE", "SHRIRAM FINANCE", "MUTHOOT FINANCE", "MANAPPURAM", "CHOLAMANDALAM", "MAHINDRA FINANCE", "SUNDARAM FINANCE", "HDB FINANCIAL SERVICES", "ADITYA BIRLA FINANCE", "PIRAMAL FINANCE", "INDIABULLS HOUSING FINANCE", "PNB HOUSING FINANCE", "LIC HOUSING FINANCE", "IIFL FINANCE", "HERO FINCORP", "MUTHOOT FINCORP", "IIFL HOME FINANCE", "MAS FINANCIAL", "NORTHERN ARC", "VIVRITI CAPITAL", "FEDBANK FINANCIAL", "UGRO CAPITAL", "FIVE STAR BUSINESS FINANCE", "VASTU HOUSING FINANCE", "AAVAS FINANCIERS", "HOME FIRST FINANCE"]
  },
  {
    id: "broker",
    label: "Brokers & Trading",
    keywords: ["ZERODHA", "KITE", "GROWW", "UPSTOX", "ANGELONE", "ANGEL ONE", "DHAN", "PAYTM MONEY", "ICICI DIRECT", "KRAZYBEE", "KOTAK SEC", "KOTAK SECURITIES", "MOTILAL OSWAL", "SHAREKHAN", "5PAISA", "IIFL SECURITIES", "HDFC SECURITIES", "AXIS DIRECT", "YES SECURITIES", "EDELWEISS BROKING", "RELIGARE BROKING", "GEOJIT", "INDIABULLS SECURITIES", "SMC GLOBAL", "ALICE BLUE", "FYERS", "TRADEJINI", "JM FINANCIAL SECURITIES"]
  },
  {
    id: "crypto",
    label: "Crypto Exchanges",
    keywords: ["COINDCX", "COINSWITCH", "WAZIRX", "GIOTTUS", "MUDREX", "BITBNS", "BUYUCOIN", "BINANCE", "BYBIT", "KUCOIN", "OKX", "MEXC", "GATEIO"]
  },
  {
    id: "crypto_p2p",
    label: "Crypto P2P",
    keywords: ["BINANCE P2P", "BUY CRYPTO", "SELL CRYPTO", "USDT", "BTC", "ETH", "TRX"]
  },
  {
    id: "betting",
    label: "Betting & Gambling",
    keywords: ["1XBET", "PARIMATCH", "STAKE", "LOTUS365", "FAIRPLAY", "BET365", "WOLF777", "DIAMOND EXCHANGE", "SKYEXCH"]
  },
  {
    id: "cash_deposit",
    label: "Cash Deposit",
    keywords: ["CDM", "CASH DEP", "CASH DEPOSIT", "SELF CASH", "BRANCH CASH"]
  },
  {
    id: "wallet",
    label: "Digital Wallets",
    keywords: ["PAYTM WALLET", "MOBIKWIK", "FREECHARGE", "OLA MONEY", "AMAZON PAY BALANCE"]
  },
  {
    id: "high_risk",
    label: "High Risk / STR",
    keywords: ["USDT", "CASHOUT", "AGENT", "COMMISSION", "RENT ACCOUNT", "PG SETTLEMENT", "HAWALA", "LOTTERY", "GAMING"]
  },
  {
    id: "recharge",
    label: "Recharge & DTH",
    keywords: ["JIO", "AIRTEL", "VODAFONE", "VI", "IDEA", "BSNL", "TATAPLAY", "DTH", "MOBILE RECHARGE", "FASTAG RECHARGE"]
  },
  {
    id: "fastag",
    label: "FASTag Toll",
    keywords: ["FASTAG", "NHAI", "IDFC FASTAG", "ICICI FASTAG", "PAYTM FASTAG", "TOLL PAYMENT"]
  },
  {
    id: "utility",
    label: "Utility Bills",
    keywords: ["ELECTRICITY", "BESCOM", "TSSPDCL", "APSPDCL", "MSEB", "WATER BILL", "GAS BILL", "PNG", "LPG", "BROADBAND", "JIO FIBER", "ACT FIBERNET"]
  },
  {
    id: "bill_payment",
    label: "Bill Payment",
    keywords: ["BBPS", "BHARAT BILLPAY", "BILL PAYMENT", "CREDIT CARD BILL"]
  },
  {
    id: "education",
    label: "Education Fees",
    keywords: ["SCHOOL FEES", "COLLEGE FEES", "TUITION", "BYJU", "UNACADEMY", "VEDANTU", "UPGRAD", "COURSERA", "UDEMY"]
  },
  {
    id: "credit_card",
    label: "Credit Card Payment",
    keywords: ["CC PAYMENT", "CARD PAYMENT", "HDFC CARD", "SBI CARD", "ICICI CARD", "AXIS CARD"]
  },
  {
    id: "card_settlement",
    label: "Card Settlement",
    keywords: ["VISA SETTLEMENT", "MASTERCARD SETTLEMENT", "RUPAY SETTLEMENT", "CARD SETTLEMENT", "POS SETTLEMENT"]
  },
  {
    id: "wallet_load",
    label: "Wallet Load",
    keywords: ["WALLET LOAD", "PAYTM LOAD", "MOBIKWIK LOAD", "FREECHARGE LOAD"]
  },
  {
    id: "escrow",
    label: "Escrow & Nodal",
    keywords: ["ESCROW", "ESCROW ACCOUNT", "NODAL ACCOUNT"]
  },
  {
    id: "gig_economy",
    label: "Gig Economy Payouts",
    keywords: ["SWIGGY PAYOUT", "ZOMATO PAYOUT", "UBER PAYOUT", "OLA PAYOUT", "RAPIDO PAYOUT", "PORTER PAYOUT", "URBAN COMPANY PAYOUT"]
  },
  {
    id: "fd",
    label: "Fixed Deposit",
    keywords: ["FD", "FIXED DEPOSIT", "TERM DEPOSIT", "FD BOOKING", "FD MATURITY"]
  },
  {
    id: "rd",
    label: "Recurring Deposit",
    keywords: ["RD", "RECURRING DEPOSIT", "RD INSTALLMENT"]
  },
  {
    id: "demat",
    label: "Demat & Securities",
    keywords: ["NSDL", "CDSL", "DEMAT", "SECURITIES", "BROKERAGE"]
  },
  {
    id: "dividend",
    label: "Dividend Income",
    keywords: ["DIVIDEND", "INTERIM DIVIDEND", "FINAL DIVIDEND"]
  },
  {
    id: "rent",
    label: "Rent Payments",
    keywords: ["RENT", "HOUSE RENT", "OFFICE RENT", "LEASE RENT"]
  },
  {
    id: "real_estate",
    label: "Real Estate & Stamp Duty",
    keywords: ["REGISTRATION", "STAMP DUTY", "PROPERTY PAYMENT", "BUILDER PAYMENT"]
  },
  {
    id: "travel",
    label: "Travel & Flights",
    keywords: ["IRCTC", "MAKEMYTRIP", "YATRA", "CLEARTRIP", "GOIBIBO", "INDIGO", "AIR INDIA", "AKASA"]
  },
  {
    id: "healthcare",
    label: "Healthcare & Hospitals",
    keywords: ["APOLLO", "FORTIS", "MAX HEALTHCARE", "MEDANTA", "PRACTO", "PHARMEASY", "TATA 1MG"]
  },
  {
    id: "govt_benefit",
    label: "Govt Direct Benefit Transfer",
    keywords: ["SCHOLARSHIP", "DBT", "SUBSIDY", "PM KISAN", "MNREGA", "GOVT BENEFIT"]
  },
  {
    id: "self_transfer",
    label: "Self / Internal Transfer",
    keywords: ["SELF", "OWN ACCOUNT", "ACCOUNT TRANSFER", "INTERNAL TRANSFER", "FUND TRANSFER"]
  },
  {
    id: "failed_transaction",
    label: "Failed Transaction",
    keywords: ["RETURN", "REVERSAL", "FAILED", "REJECTED", "BOUNCE", "RETURN CHARGE"]
  },
  {
    id: "bnpl",
    label: "BNPL Pay Later",
    keywords: ["SIMPL", "ZESTMONEY", "UNI CARDS", "AMAZON PAY LATER", "FLIPKART PAY LATER", "OLA MONEY POSTPAID", "LAZYPAY"]
  },
  {
    id: "neobank",
    label: "Neobanks",
    regex: /\b(JUPITER|FI\s+MONEY|NIYO|OPEN\s+MONEY|FYP|RAZORPAYX)\b/i,
    keywords: ["JUPITER", "FI MONEY", "NIYO", "OPEN MONEY", "FYP", "RAZORPAYX"]
  },
  {
    id: "payroll_hrms",
    label: "Payroll & HRMS",
    keywords: ["KEKA", "GREYTHR", "ZOHO PAYROLL", "RAZORPAYX PAYROLL", "ADP", "RAMCO HR", "DARWINBOX"]
  },
  {
    id: "skill_gaming",
    label: "Skill Gaming",
    keywords: ["WINZO", "ZUPEE", "MY11CIRCLE", "GAMES24X7", "JUNGLEE GAMES", "LUDO KING", "RUMMYCIRCLE"]
  },
  {
    id: "real_estate_platform",
    label: "Real Estate Platforms",
    keywords: ["NOBROKER", "HOUSING.COM", "MAGICBRICKS", "99ACRES", "NESTAWAY"]
  },
  {
    id: "forex_travel_card",
    label: "Forex Travel Cards",
    keywords: ["NIYO GLOBAL", "BOOKMYFOREX PREPAID", "THOMAS COOK BORDERLESS", "MULTI CURRENCY CARD", "ICICI FOREX CARD"]
  },
  {
    id: "cross_border_ecommerce",
    label: "Cross-Border E-Commerce",
    keywords: ["ALIEXPRESS", "SHEIN", "EBAY", "ETSY", "IHERB", "WISH", "ALIBABA"]
  },
  {
    id: "gift_card_prepaid",
    label: "Gift Cards & Vouchers",
    keywords: ["QWIKCILVER", "WOOHOO", "AMAZON PAY GIFT CARD", "FLIPKART GIFT CARD", "VISTAPRINT VOUCHER"]
  },
  {
    id: "microfinance_nbfc",
    label: "Microfinance SFB",
    keywords: ["BANDHAN BANK", "UJJIVAN SFB", "EQUITAS SFB", "CREDITACCESS GRAMEEN", "SPANDANA SPHOORTY", "SATIN CREDITCARE"]
  },
  {
    id: "insurance_aggregator",
    label: "Insurance Aggregators",
    keywords: ["POLICYBAZAAR", "ACKO", "GO DIGIT", "DIGIT INSURANCE", "TURTLEMINT"]
  },
  {
    id: "fuel_ev",
    label: "Fuel & EV Charging",
    keywords: ["IOCL", "HPCL", "BPCL", "INDIAN OIL", "SHELL", "RELIANCE PETROL", "TATA POWER EZ CHARGE", "STATIQ", "CHARGEPOINT"]
  },
  {
    id: "wellness_fitness",
    label: "Wellness & Fitness",
    keywords: ["CULT.FIT", "CULTFIT", "HEALTHIFYME", "GYMPIK"]
  },
  {
    id: "intl_subscription",
    label: "International Subscriptions",
    keywords: ["DISNEY+", "DISNEY PLUS", "APPLE MUSIC", "ADOBE", "MICROSOFT 365", "LINKEDIN PREMIUM", "CANVA"]
  },
  {
    id: "payment_infra_b2b",
    label: "B2B Payment Infra",
    keywords: ["SETU", "M2P FINTECH", "ZETA", "DECENTRO", "YAP"]
  },
  {
    id: "political_donation",
    label: "Political Donation",
    regex: /\b(ELECTORAL\s+BOND|ELECTORAL\s+TRUST|PARTY\s+FUND|POLITICAL\s+FUND|AAM\s+AADMI\s+PARTY|INDIAN\s+NATIONAL\s+CONGRESS|BHARATIYA\s+JANATA\s+PARTY)\b/i,
    keywords: ["ELECTORAL BOND", "ELECTORAL TRUST", "PARTY FUND", "POLITICAL FUND", "AAM AADMI PARTY", "INDIAN NATIONAL CONGRESS", "BHARATIYA JANATA PARTY"]
  },
  {
    id: "business_payment",
    label: "Business B2B Payment",
    keywords: ["VENDOR PAYMENT", "SUPPLIER PAYMENT", "PURCHASE ORDER", "INVOICE PAYMENT", "B2B PAYMENT", "WORKING CAPITAL", "CASH CREDIT", "OVERDRAFT", "BANK GUARANTEE", "CC LIMIT", "TRADE CREDIT", "CONTRACTOR PAYMENT", "FREELANCE PAYMENT", "CONSULTANCY FEE", "PROFESSIONAL FEE", "RETAINER"]
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
  const descUpper = desc.toUpperCase();

  // Initial candidate matching
  let matchedChips = CHIP_DEFINITIONS.filter(chip => 
    chip.regex ? chip.regex.test(desc) : chip.keywords.some(kw => descLower.includes(kw.toLowerCase()))
  );

  // --- Disambiguation & False-Positive Suppression Layer ---

  // 1. RENTOMOJO: Subscription override over Rent
  if (descUpper.includes("RENTOMOJO")) {
    matchedChips = matchedChips.filter(c => c.id !== "rent");
  }

  // 2. CASHFREE: Payment Gateway override over Cash Deposit
  if (descUpper.includes("CASHFREE")) {
    matchedChips = matchedChips.filter(c => c.id !== "cash_deposit");
  }

  // 3. AMAZON disambiguation
  if (descUpper.includes("AMAZON PAY BALANCE")) {
    matchedChips = matchedChips.filter(c => c.id !== "marketplace_payments" && c.id !== "upi_app");
  } else if (descUpper.includes("AMAZON PAY") || descUpper.includes("AMAZONPAY")) {
    matchedChips = matchedChips.filter(c => c.id !== "marketplace_payments");
  } else if (descUpper.includes("AMAZON PRIME")) {
    matchedChips = matchedChips.filter(c => c.id !== "marketplace_payments");
  } else if (descUpper.includes("AMAZON SETTLEMENT")) {
    matchedChips = matchedChips.filter(c => c.id !== "marketplace_payments" && c.id !== "upi_app");
  }

  // 4. Gig Economy Payout vs Food Delivery / Mobility Spend
  if (descUpper.includes("SWIGGY PAYOUT") || descUpper.includes("ZOMATO PAYOUT")) {
    matchedChips = matchedChips.filter(c => c.id !== "food_delivery");
  }
  if (descUpper.includes("UBER PAYOUT") || descUpper.includes("OLA PAYOUT") || descUpper.includes("RAPIDO PAYOUT")) {
    matchedChips = matchedChips.filter(c => c.id !== "mobility");
  }

  // 5. MAX Life vs MAX Healthcare
  if (descUpper.includes("MAX LIFE")) {
    matchedChips = matchedChips.filter(c => c.id !== "healthcare");
  }
  if (descUpper.includes("MAX HEALTHCARE")) {
    matchedChips = matchedChips.filter(c => c.id !== "insurance_premium");
  }

  // 6. VISA / MasterCard / RuPay POS vs Card Settlement
  if (descUpper.includes("SETTLEMENT") && (descUpper.includes("VISA") || descUpper.includes("MASTERCARD") || descUpper.includes("RUPAY"))) {
    matchedChips = matchedChips.filter(c => c.id !== "merchant_pos");
  }

  return {
    phone: phoneMatch ? phoneMatch[0] : null,
    upi: upiMatch && upiMatch[0] !== "@" ? upiMatch[0] : null,
    ifsc: metaIfsc || descIfsc,
    matchedChips
  };
};

export const detectTransactionChannel = (desc: string): string => {
  const textUpper = desc.toUpperCase();

  if (/\bUPI\b|@/.test(textUpper)) return "UPI";
  if (/\bIMPS\b|P2A|P2M/.test(textUpper)) return "IMPS";
  if (/\bNEFT\b/.test(textUpper)) return "NEFT";
  if (/\bRTGS\b/.test(textUpper)) return "RTGS";
  if (/\b(NACH|ENACH|ECS|ACH|MANDATE|STANDING INSTRUCTION)\b/.test(textUpper)) return "NACH/ECS/Mandate";
  if (/\b(CHQ|CHEQUE|CTS|INSTR)\b/.test(textUpper)) return "Cheque/CTS";
  if (/\b(AEPS|AADHAAR PAY|MICRO ATM|BC AGENT|BANK MITRA|CSP)\b/.test(textUpper)) return "AEPS / Micro-ATM";
  if (/\b(ATM WDL|ATM CASH|NFS ATM|VISA ATM|RUPAY ATM)\b/.test(textUpper)) return "ATM";
  if (/\b(POS|EPOS|SWIPE|CARD SWIPE)\b/.test(textUpper)) return "POS/EPOS";
  if (/\b(CDM|CASH DEP|SELF CASH|BRANCH CASH|CASH)\b/.test(textUpper)) return "Cash";
  if (/\b(SELF|OWN ACCOUNT|INTERNAL TRANSFER)\b/.test(textUpper)) return "Internal/Self Transfer";

  return "Unknown";
};

export const extractEntities = (txn: TransactionRow) => {
  const desc = txn.desc || "";

  const upiVpa = desc.match(/[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}/)?.[0] || null;
  const ifsc = desc.match(/\b[A-Z]{4}0[A-Z0-9]{6}\b/)?.[0] || null;
  const mobile = desc.match(/\b[6-9]\d{9}\b/)?.[0] || null;
  const gstin = desc.match(/\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}\b/)?.[0] || null;
  const rrn = desc.match(/\b\d{12}\b/)?.[0] || null;
  const utr = desc.match(/\b[A-Z]{4}[A-Z0-9]{11}\b/)?.[0] || null;

  return { upiVpa, ifsc, mobile, gstin, rrn, utr };
};

export const calculateRisk = (txn: TransactionRow): "High" | "Medium" | "Low" => {
  if (txn.risk) return txn.risk;

  const desc = (txn.desc || "").toUpperCase();

  const highRiskKw = [
    "AEPS", "AADHARPAY", "CSP", "BC AGENT", "MICRO ATM", "KREDITBEE", "MONEYVIEW", 
    "COINDCX", "WAZIRX", "BINANCE", "1XBET", "STAKE", "HAWALA", "CASHOUT", 
    "RENT ACCOUNT", "LOTTERY", "GAMING", "WINZO", "ZUPEE", "MY11CIRCLE", "PARIMATCH", 
    "LOTUS365", "FAIRPLAY", "BET365", "WOLF777", "DIAMOND EXCHANGE", "SKYEXCH", "USDT", 
    "CRYPTO P2P", "ELECTORAL BOND", "POLITICAL FUND"
  ];

  const medRiskKw = [
    "RAZORPAY", "CASHFREE", "PAYU", "SETTLEMENT", "PAYOUT", "SWIFT", "WISE", 
    "SIMPL", "ZESTMONEY", "LAZYPAY", "PAYTM PG", "CCAVENUE", "JUSPAY", "EASEBUZZ", 
    "AIRPAY", "FOREX", "REMITTANCE", "WESTERN UNION", "MONEYGRAM"
  ];

  if (highRiskKw.some(kw => desc.includes(kw))) return "High";
  if (medRiskKw.some(kw => desc.includes(kw))) return "Medium";
  return "Low";
};