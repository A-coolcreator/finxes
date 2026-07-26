import { caseService } from "../services/caseService.js";
import { enrichTransactions } from "./transaction-rule-engine.js";

export function attachTransactionsListInteractions() {
  let allTransactions = [];
  let currentPage = 1;
  const itemsPerPage = 50;
  let drcrFilter = "all"; // 'all' | 'dr' | 'cr'
  let activeChips = new Set(); // Stores active quick filter chip IDs

  // ── Configurable keyword alert list & definitions ───────────────────────────
  const CHIP_DEFINITIONS = [
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
  // ─────────────────────────────────────────────────────────────────────────────


  let defaultMinDateStr = "2023-03-01";
  let defaultMaxDateStr = "2024-02-29";

  const parseCustomDate = (dateStr) => {
    if (!dateStr) return null;
    let d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d;
    }

    const parts = dateStr.split(/[\-\/]/);
    if (parts.length === 3) {
      if (parts[2].length === 4) {
        // DD-MM-YYYY
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        d = new Date(year, month, day);
        if (!isNaN(d.getTime())) return d;
      } else if (parts[2].length === 2) {
        // DD-MM-YY or DD/MM/YY
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        let year = parseInt(parts[2], 10);
        year = year > 50 ? 1900 + year : 2000 + year;
        d = new Date(year, month, day);
        if (!isNaN(d.getTime())) return d;
      } else if (parts[0].length === 4) {
        // YYYY-MM-DD
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        d = new Date(year, month, day);
        if (!isNaN(d.getTime())) return d;
      }
    }

    const wordParts = dateStr.split(/[\s\-\/]/);
    if (wordParts.length === 3) {
      const monthsMap = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
      };
      const day = parseInt(wordParts[0], 10);
      const monthStr = wordParts[1].toLowerCase().substring(0, 3);
      const year = parseInt(wordParts[2], 10);
      if (monthStr in monthsMap) {
        d = new Date(year, monthsMap[monthStr], day);
        if (!isNaN(d.getTime())) return d;
      }
    }

    return null;
  };

  const getQueryParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      caseId: params.get("caseId") || params.get("id"),
      rail: params.get("rail") || "all",
      personId: params.get("personId") || "all",
      startDate: params.get("startDate") || "",
      endDate: params.get("endDate") || "",
    };
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2
    }).format(val);
  };

  const getCategoryBadgeClass = (category) => {
    const cat = (category || "").toLowerCase();
    if (cat === "upi") return "bg-primary/10 text-primary";
    if (cat === "card") return "bg-secondary-container text-on-secondary-container";
    if (cat === "imps") return "bg-primary-container text-on-primary-container";
    if (cat === "aeps") return "bg-amber-500/10 text-amber-700 border border-amber-500/25";
    if (cat === "enach" || cat === "nach") return "bg-teal-500/10 text-teal-700 border border-teal-500/25";
    if (cat.startsWith("cash")) return "bg-surface-variant text-on-surface-variant";
    if (cat.startsWith("crypto")) return "bg-tertiary-container text-on-tertiary-container";
    return "bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400";
  };

  const getFilteredTransactions = () => {
    const { rail } = getQueryParams();
    const selectedPerson = document.getElementById("person-select")?.value || "all";
    const searchVal = document.getElementById("search-input")?.value?.toLowerCase() || "";
    const startDateStr = document.getElementById("start-date")?.value || defaultMinDateStr;
    const endDateStr = document.getElementById("end-date")?.value || defaultMaxDateStr;
    const categoryFilter = document.getElementById("category-filter")?.value || "all";
    const showHighValueOnly = document.getElementById("show-flagged-only")?.checked || false;

    const startLimit = parseCustomDate(startDateStr);
    const endLimit = parseCustomDate(endDateStr);

    let filtered = allTransactions;

    // Filter by URL rail param (legacy support)
    if (rail !== "all") {
      filtered = filtered.filter((t) => {
        const catLower = (t.category || "").toLowerCase();
        let group = "upi";
        if (catLower === "card") group = "card_pos_ecom";
        else if (catLower === "imps") group = "imps";
        else if (catLower.startsWith("cash")) group = "cash";
        else if (catLower.startsWith("crypto")) group = "crypto";
        return group === rail.toLowerCase();
      });
    }

    // Filter by category dropdown
    if (categoryFilter !== "all") {
      filtered = filtered.filter((t) => {
        const catLower = (t.category || "").toLowerCase();
        if (categoryFilter === "upi") return catLower === "upi";
        if (categoryFilter === "imps") return catLower === "imps";
        if (categoryFilter === "neft") return catLower === "neft" || catLower.startsWith("neft");
        if (categoryFilter === "card") return catLower === "card";
        if (categoryFilter === "cash") return catLower.startsWith("cash");
        if (categoryFilter === "crypto") return catLower.startsWith("crypto");
        if (categoryFilter === "aeps") return catLower === "aeps" || (t.description || "").toLowerCase().includes("aeps");
        if (categoryFilter === "enach") return catLower === "enach" || catLower === "nach" || (t.description || "").toLowerCase().includes("enach") || (t.description || "").toLowerCase().includes("nach");
        return true;
      });
    }

    // Filter by DR / CR toggle
    if (drcrFilter === "dr") {
      filtered = filtered.filter((t) => t.type === "debit");
    } else if (drcrFilter === "cr") {
      filtered = filtered.filter((t) => t.type === "credit");
    }

    // Filter by high-value (>50,000)
    if (showHighValueOnly) {
      filtered = filtered.filter((t) => (t.amount || 0) > 50000);
    }

    // Filter by person
    if (selectedPerson !== "all") {
      filtered = filtered.filter((t) => t.personId === selectedPerson || t.person === selectedPerson);
    }

    // Filter by date range
    if (startLimit && endLimit) {
      filtered = filtered.filter((t) => {
        if (!t.date) return false;
        const d = parseCustomDate(t.date);
        if (!d) return false;
        return d >= startLimit && d <= endLimit;
      });
    }

    // Filter by search query
    if (searchVal) {
      filtered = filtered.filter((t) => {
        const desc = (t.description || "").toLowerCase();
        const ref = (t.referenceNumber || t.chqNo || "").toLowerCase();
        const cat = (t.category || "").toLowerCase();
        return desc.includes(searchVal) || ref.includes(searchVal) || cat.includes(searchVal);
      });
    }

    // Filter by active keyword chips
    if (activeChips.size > 0) {
      filtered = filtered.filter((t) => {
        const descLower = (t.description || "").toLowerCase();
        for (const chipId of activeChips) {
          const chipDef = CHIP_DEFINITIONS.find(c => c.id === chipId);
          if (chipDef) {
            const hasMatch = chipDef.regex
              ? chipDef.regex.test(t.description || "")
              : chipDef.keywords.some(kw => descLower.includes(kw.toLowerCase()));
            if (hasMatch) return true; // Matches this active chip's keywords/regex
          }
        }
        return false;
      });
    }

    // Sort by date descending (newest first)
    filtered.sort((a, b) => {
      const da = parseCustomDate(a.date);
      const db = parseCustomDate(b.date);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return db - da;
    });

    return filtered;
  };

  const updateActiveBadges = () => {
    const area = document.getElementById("active-filters-area");
    if (!area) return;
    const pills = [];
    const category = document.getElementById("category-filter")?.value;
    if (category && category !== "all") pills.push(category.toUpperCase());
    if (drcrFilter !== "all") pills.push(drcrFilter === "dr" ? "DEBIT ONLY" : "CREDIT ONLY");
    if (document.getElementById("show-flagged-only")?.checked) pills.push("HIGH VALUE >₹50K");
    const search = document.getElementById("search-input")?.value;
    if (search) pills.push(`"${search}"`);
    
    // Add active chips to badges
    if (activeChips.size > 0) {
      activeChips.forEach(chipId => {
        const chip = CHIP_DEFINITIONS.find(c => c.id === chipId);
        if (chip) pills.push(chip.label.toUpperCase());
      });
    }

    if (pills.length === 0) {
      area.innerHTML = '<span class="text-xxs text-outline italic">No active filters</span>';
    } else {
      area.innerHTML = pills.map(p =>
        `<span class="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-bold rounded-full border border-primary/20">${p}</span>`
      ).join("");
    }
  };

  const updateLedgerUI = () => {
    const filtered = getFilteredTransactions();
    const categoryFilter = document.getElementById("category-filter")?.value || "all";

    // Swap column headers when cash filter is active
    const debitHeader = document.getElementById("col-debit-header");
    const creditHeader = document.getElementById("col-credit-header");
    if (debitHeader && creditHeader) {
      const isCashFilter = categoryFilter === "cash";
      debitHeader.textContent = isCashFilter ? "Withdraw (₹)" : "Debit (₹)";
      creditHeader.textContent = isCashFilter ? "Deposit (₹)" : "Credit (₹)";
    }

    // 1. Calculate Stats
    const count = filtered.length;
    const debits = filtered.filter((t) => t.type === "debit");
    const credits = filtered.filter((t) => t.type === "credit");

    const totalDebit = debits.reduce((sum, t) => sum + t.amount, 0);
    const totalCredit = credits.reduce((sum, t) => sum + t.amount, 0);

    document.getElementById("stat-count").textContent = count.toLocaleString();
    document.getElementById("stat-debit").textContent = formatCurrency(totalDebit);
    document.getElementById("stat-credit").textContent = formatCurrency(totalCredit);

    // 2. Render Table with Pagination
    const tbody = document.getElementById("transactions-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    const totalPages = Math.max(1, Math.ceil(count / itemsPerPage));
    if (currentPage > totalPages) currentPage = totalPages;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(count, startIndex + itemsPerPage);

    document.getElementById("showing-tx-range").textContent = `Showing ${count > 0 ? startIndex + 1 : 0}-${endIndex} of ${count} transactions`;
    document.getElementById("page-num-indicator").textContent = `Page ${currentPage} of ${totalPages}`;

    const prevBtn = document.getElementById("prev-page-btn");
    const nextBtn = document.getElementById("next-page-btn");
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;

    const pageSlice = filtered.slice(startIndex, endIndex);
    pageSlice.forEach((t) => {
      const row = document.createElement("tr");
      row.className = "hover:bg-surface-container-low transition-colors";

      const dateObj = parseCustomDate(t.date);
      const dateFormatted = dateObj 
        ? dateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) 
        : t.date || "N/A";

      const debitVal = t.type === "debit" ? formatCurrency(t.amount) : "-";
      const creditVal = t.type === "credit" ? formatCurrency(t.amount) : "-";
      const balVal = typeof t.balance === "number" ? formatCurrency(t.balance) : "-";


      const getSeverity = (txn) => {
        if (txn.flagged === 1) return "high";

        const desc = (txn.description || "").toUpperCase();

        // 1. HIGH RISK Keywords (AEPS, Loan Apps, Crypto, Betting, Commission Agents)
        const highRiskKeywords = [
          "AEPS", "AADHARPAY", "AADHAAR PAY", "CSP", "BC AGENT", "BANK MITRA", "MICRO ATM",
          "KREDITBEE", "MONEYVIEW", "CASHE", "FIBE", "EARLYSALARY", "NAVI LOAN", "NAVI FINSERV", "LAZYPAY",
          "COINDCX", "COINSWITCH", "WAZIRX", "ZANMAI LABS", "GIOTTUS", "MUDREX", "BITBNS", "BUYUCOIN", "BINANCE", "BYBIT", "KUCOIN", "OKX", "MEXC GLOBAL", "USDT", "CRYPTO", "P2P",
          "1XBET", "PARIMATCH", "STAKE", "LOTUS365", "FAIRPLAY", "WOLF777", "DIAMOND EXCHANGE", "DIAMOND EXC", "SKYEXCH", "BET365", "BETTING AGENT", "BETTING COMMISSION",
          "HAWALA", "MULE PATTERN", "LOTTERY WIN", "LOTTERY CREDIT", "COMMISSION AGENT", "CASHOUT AGENT", "P2P CASHOUT"
        ];

        // 2. MEDIUM RISK Keywords (Payment Gateways, Remittance, Wallets, settlements)
        const mediumRiskKeywords = [
          "RAZORPAY", "CASHFREE", "PAYU", "CCAVENUE", "BILLDESK", "BILL DESK", "JUSPAY", "EASEBUZZ", "PINELABS", "ATOMTECH", "OPEN FINANCIAL", "AIRPAY", "PAYTM PG",
          "SWIFT", "WIRE TRANSFER", "TT INWARD", "FOREX INWARD", "WESTERN UNION", "MONEYGRAM", "WISE", "PAYONEER", "TT OUTWARD", "FOREX", "REMIT",
          "PAYTM WALLET", "MOBIKWIK WALLET", "FREECHARGE WALLET", "OLA MONEY", "AMAZON PAY BALANCE", "WALLET TRANSFER", "WALLET LOAD",
          "PG SETTLEMENT", "PG SETTLE", "SETTLEMENT", "PAYOUT", "BULK PAYOUT", "VENDOR PAYOUT", "ECOMMERCE SETTLEMENT", "SELLER SETTLEMENT", "MERCHANT SETTLEMENT",
          "ZEPTO RUNNER", "SWIGGY DELIVERY", "ZOMATO DELIVERY", "GIG WORKER"
        ];

        // Match High Risk first
        if (highRiskKeywords.some(kw => desc.includes(kw))) {
          return "high";
        }

        // Match Medium Risk second
        if (mediumRiskKeywords.some(kw => desc.includes(kw))) {
          return "mid";
        }

        // Default to Low
        return "low";
      };

      const getSeverityPill = (txn) => {
        const severity = getSeverity(txn);
        if (severity === "high") {
          return `<span class="px-2 py-0.5 bg-red-100 text-red-700 text-[9px] font-bold rounded uppercase">High</span>`;
        } else if (severity === "mid") {
          return `<span class="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold rounded uppercase">Mid</span>`;
        } else {
          return `<span class="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-[9px] font-bold rounded uppercase">Low</span>`;
        }
      };

      const isCash = (t.category || "").toLowerCase().startsWith("cash");

      const debitCell = t.type === "debit"
        ? isCash
          ? `<span class="text-red-600 font-bold text-[11px]">Withdraw</span> <span class="text-red-600 font-bold text-[11px]">${formatCurrency(t.amount)}</span>`
          : `<span class="text-red-600 font-bold text-[11px]">${debitVal}</span>`
        : `<span class="text-outline/40 text-[11px]">—</span>`;

      const creditCell = t.type === "credit"
        ? isCash
          ? `<span class="text-status-success font-bold text-[11px]">Deposit</span> <span class="text-status-success font-bold text-[11px]">${formatCurrency(t.amount)}</span>`
          : `<span class="text-status-success font-bold text-[11px]">${creditVal}</span>`
        : `<span class="text-outline/40 text-[11px]">—</span>`;

      const isFlagged = t.flagged === 1;
      const flagIcon = `<button class="flag-toggle-btn focus:outline-none transition-transform hover:scale-115 active:scale-95" data-tx-id="${t.id}" title="${isFlagged ? 'Flagged Transaction (Click to Unflag)' : 'Unflagged Transaction (Click to Flag)'}">
        <span class="material-symbols-outlined text-[15px] align-middle ${isFlagged ? 'text-status-warning' : 'text-outline/30 hover:text-status-warning/60'}">${isFlagged ? 'warning' : 'check_circle'}</span>
      </button>`;

      // ── Regex extraction from description ─────────────────────────────────
      const desc = t.description || "";

      // Phone numbers: Indian 10-digit starting 6-9 (may be partially masked)
      const phoneMatch = desc.match(/\b[6-9]\d{4}[\d*]{4}\d{1}\b|\b[6-9]\d{9}\b/);
      const phoneCell = phoneMatch
        ? `<span class="font-mono text-[10px] text-blue-600 font-bold">${phoneMatch[0]}</span>`
        : `<span class="text-outline/30 text-[10px]">—</span>`;

      // UPI IDs: highly robust pattern matching standard, hyphenated, and truncated handles (like vpa@bank, vpa@ok-bank, or vpa@)
      const upiMatch = desc.match(/[\w.\-+]+@[\w\-]*/);
      const upiCell = upiMatch && upiMatch[0] !== "@"
        ? `<span class="font-mono text-[10px] text-purple-600 font-bold truncate max-w-[120px] block" title="${upiMatch[0]}">${upiMatch[0]}</span>`
        : `<span class="text-outline/30 text-[10px]">—</span>`;

      // IFSC: Prioritize parent metadata IFSC, fallback to regex in description
      const metaIfsc = (t.metaIfscCode && t.metaIfscCode !== "UNKNOWN") ? t.metaIfscCode : null;
      const descIfsc = desc.match(/\b[A-Z]{4}0[A-Z0-9]{6}\b/)?.[0] || null;
      const finalIfsc = metaIfsc || descIfsc;

      const ifscCell = finalIfsc
        ? `<span class="font-mono text-[10px] text-teal-600 font-bold" title="${metaIfsc ? 'Source: Suspect Metadata' : 'Source: Transaction Narration'}">${finalIfsc}</span>`
        : `<span class="text-outline/30 text-[10px]">—</span>`;

      // Keywords: scan description for any matches from CHIP_DEFINITIONS
      const descLower = desc.toLowerCase();
      const foundChips = CHIP_DEFINITIONS.filter(chip => {
        if (chip.regex) {
          return chip.regex.test(desc);
        }
        return chip.keywords.some(kw => descLower.includes(kw.toLowerCase()));
      });
      const keywordsCell = foundChips.length > 0
        ? foundChips.map(chip => {
            const hoverTitle = chip.regex ? `Matched Pattern: ${chip.regex.toString()}` : `Matched: ${chip.keywords.join(', ')}`;
            return `<span class="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold rounded border border-amber-300 cursor-help" title="${hoverTitle}">${chip.label}</span>`;
          }).join(" ")
        : `<span class="text-outline/30 text-[10px]">—</span>`;
      // ───────────────────────────────────────────────────────────────────────

      row.innerHTML = `
        <td class="px-4 py-3 text-[11px] font-medium text-secondary whitespace-nowrap">${dateFormatted}</td>
        <td class="px-4 py-3">${getSeverityPill(t)}</td>
        <td class="px-4 py-3">
          <div class="font-bold text-[11px] uppercase text-on-surface">${t.description || "N/A"}</div>
        </td>
        <td class="px-4 py-3 font-mono text-[10px] text-outline select-all">${t.referenceNumber || t.chqNo || "—"}</td>
        <td class="px-4 py-3">
          <span class="inline-block ${getCategoryBadgeClass(t.category)} px-2 py-0.5 rounded font-label-sm text-[9px] font-semibold uppercase">
            ${t.category || "UPI"}
          </span>
        </td>
        <td class="px-4 py-3 text-right">${debitCell}</td>
        <td class="px-4 py-3 text-right">${creditCell}</td>
        <td class="px-4 py-3 text-right font-mono text-[11px] font-bold text-secondary">${balVal}</td>
        <td class="px-4 py-3 text-center">${flagIcon}</td>
        <td class="px-4 py-3 max-w-[140px]">${keywordsCell}</td>
        <td class="px-4 py-3 whitespace-nowrap">${phoneCell}</td>
        <td class="px-4 py-3 max-w-[140px]">${upiCell}</td>
        <td class="px-4 py-3 whitespace-nowrap">${ifscCell}</td>
      `;
      tbody.appendChild(row);

    });
  };

  const generateMockTransactions = () => {
    const people = ["verma", "reliant", "ms_ent", "chandil"];
    const categories = [
      "upi", "upi", "upi", "upi",
      "card", "imps",
      "cash_withdrawal", "cash_deposit",
      "crypto_in", "crypto_out"
    ];

    const startDate = new Date("2023-03-01");
    const endDate = new Date("2024-02-29");
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    const txns = [];
    let seed = 12345;

    const random = () => {
      let x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    for (let d = 0; d < totalDays; d++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + d);
      const dateStr = currentDate.toISOString().split("T")[0];

      const isDayActive = random() < 0.75;
      if (!isDayActive) continue;

      const dailyTxns = Math.floor(random() * 8) + 1;

      for (let t = 0; t < dailyTxns; t++) {
        const person = people[Math.floor(random() * people.length)];
        const category = categories[Math.floor(random() * categories.length)];

        let type = "debit";
        if (category === "crypto_in" || category === "cash_deposit") {
          type = "credit";
        } else if (category === "crypto_out" || category === "cash_withdrawal") {
          type = "debit";
        } else {
          type = random() < 0.4 ? "credit" : "debit";
        }

        let amount = 0;
        if (category.startsWith("crypto")) {
          amount = Math.floor(random() * 10000) + 100;
        } else if (category === "cash_withdrawal" || category === "cash_deposit") {
          amount = Math.floor(random() * 45000) + 100;
        } else if (category === "card") {
          amount = Math.floor(random() * 15000) + 20;
        } else {
          amount = Math.floor(random() * 120000) + 10;
        }

        txns.push({
          date: dateStr,
          person,
          category,
          type,
          amount
        });
      }
    }
    return txns;
  };

  const init = async () => {
    const { caseId, rail, personId, startDate, endDate } = getQueryParams();
    if (!caseId) return;

    // Setup Back Links & Header Context
    const backUrl = `case-dashboard.html?id=${caseId}`;
    const backBtn = document.getElementById("header-back-btn");
    if (backBtn) backBtn.href = backUrl;

    const overviewLink = document.getElementById("sidebar-overview-link");
    const transactionsLink = document.getElementById("sidebar-transactions-link");
    const noticeLink = document.getElementById("sidebar-notice-link");
    const spendLink = document.getElementById("sidebar-spend-link");
    const cryptoLink = document.getElementById("sidebar-crypto-link");
    const fundFlowLink = document.getElementById("sidebar-fund-flow-link");
    
    if (overviewLink) overviewLink.href = backUrl;
    if (transactionsLink) transactionsLink.href = `transactions.html?caseId=${caseId}`;
    if (noticeLink) noticeLink.href = `notice-generator.html?caseId=${caseId}`;
    if (spendLink) spendLink.href = `spend-analysis.html?caseId=${caseId}`;
    if (cryptoLink) cryptoLink.href = `crypto.html?caseId=${caseId}`;
    if (fundFlowLink) fundFlowLink.href = `fund-flow.html?caseId=${caseId}`;

    const railBadge = document.getElementById("rail-badge");
    if (railBadge) {
      railBadge.textContent = rail.replace(/_/g, " ");
      if (rail.toLowerCase() === "upi") {
        railBadge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-md text-label-md bg-primary/10 text-primary font-semibold uppercase";
      } else if (rail.toLowerCase() === "card_pos_ecom") {
        railBadge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-md text-label-md bg-secondary-container text-on-secondary-container font-semibold uppercase";
      } else if (rail.toLowerCase() === "imps") {
        railBadge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-md text-label-md bg-primary-container text-on-primary-container font-semibold uppercase";
      } else if (rail.toLowerCase() === "cash") {
        railBadge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-md text-label-md bg-surface-variant text-on-surface-variant font-semibold uppercase";
      } else if (rail.toLowerCase() === "crypto") {
        railBadge.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-md text-label-md bg-tertiary-container text-on-tertiary-container font-semibold uppercase";
      }
    }

    try {
      // 1. Fetch Case details
      const caseData = await caseService.getCaseById(caseId);
      if (caseData) {
        document.getElementById("case-title-badge").textContent = `CASE ${caseData.caseNumber} - ${caseData.title}`;
      }

      // 2. Fetch target persons
      const persons = await caseService.getPersons(caseId);
      const personSelect = document.getElementById("person-select");
      if (personSelect && Array.isArray(persons)) {
        personSelect.innerHTML = '<option value="all">All Entities (Combined)</option>';
        
        if (persons.length > 0) {
          persons.forEach(p => {
            const opt = document.createElement("option");
            opt.value = p.id;
            opt.textContent = p.name;
            personSelect.appendChild(opt);
          });
        } else {
          // Fallback to mock option items
          personSelect.innerHTML = `
            <option value="all">All Entities (Combined)</option>
            <option value="verma">Lakshit Verma (Primary Target)</option>
            <option value="reliant">Reliant Holdings Pvt Ltd (Shell Corp)</option>
            <option value="ms_ent">M.S. Enterprises (Mule Node)</option>
            <option value="chandil">Aditya Chandil (Associate)</option>
          `;
        }
      }

      if (personSelect && personId) {
        personSelect.value = personId;
      }

      // 3. Fetch all case transactions
      const transactions = await caseService.getTransactions(caseId);
      if (Array.isArray(transactions) && transactions.length > 0) {
        // Preserve the API's legacy fields (category, type, etc.) while
        // layering canonical schema, classification, spend, mule and crypto
        // metadata used by the investigation screens.
        allTransactions = enrichTransactions(transactions);

        // Dynamic bounds setup
        let minDate = null;
        let maxDate = null;
        allTransactions.forEach(t => {
          if (!t.date) return;
          const d = parseCustomDate(t.date);
          if (!d) return;
          if (!minDate || d < minDate) minDate = d;
          if (!maxDate || d > maxDate) maxDate = d;
        });

        if (minDate && maxDate) {
          const formatYYYYMMDD = (date) => {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, "0");
            const d = String(date.getDate()).padStart(2, "0");
            return `${y}-${m}-${d}`;
          };
          defaultMinDateStr = formatYYYYMMDD(minDate);
          defaultMaxDateStr = formatYYYYMMDD(maxDate);
        }
      } else {
        allTransactions = [];
      }

      const renderKeywordChips = () => {
        const container = document.getElementById("keyword-chips-container");
        if (!container) return;

        container.innerHTML = CHIP_DEFINITIONS.map(chip => {
          const isActive = activeChips.has(chip.id);
          const activeClasses = isActive
            ? "bg-amber-500 text-white border-amber-600 shadow-sm"
            : "bg-surface text-secondary hover:bg-surface-variant hover:text-on-surface border-border-subtle";

          return `
            <button class="keyword-chip px-2.5 py-1 text-[9px] font-bold uppercase rounded-full border transition-all cursor-pointer ${activeClasses}" data-chip-id="${chip.id}">
              ${chip.label}
            </button>
          `;
        }).join("");

        // Register click handler for each chip
        container.querySelectorAll(".keyword-chip").forEach(btn => {
          btn.addEventListener("click", () => {
            const chipId = btn.getAttribute("data-chip-id");
            if (activeChips.has(chipId)) {
              activeChips.delete(chipId);
            } else {
              activeChips.add(chipId);
            }
            currentPage = 1;
            renderKeywordChips();
            updateLedgerUI();
            updateActiveBadges();
          });
        });
      };

      const startInput = document.getElementById("start-date");
      const endInput = document.getElementById("end-date");
      if (startInput) startInput.value = startDate || defaultMinDateStr;
      if (endInput) endInput.value = endDate || defaultMaxDateStr;

      renderKeywordChips();
      updateLedgerUI();

      // Flag toggling event delegation on table body
      const tableBody = document.getElementById("transactions-table-body");
      tableBody?.addEventListener("click", async (e) => {
        const btn = e.target.closest(".flag-toggle-btn");
        if (!btn) return;

        const txId = btn.getAttribute("data-tx-id");
        if (!txId) return;

        // Toggle state locally
        const localTx = allTransactions.find(x => x.id === txId);
        if (!localTx) return;

        const originalFlag = localTx.flagged;
        localTx.flagged = originalFlag === 1 ? 0 : 1;

        // Visual toggle in DOM
        const iconSpan = btn.querySelector("span");
        if (iconSpan) {
          const nowFlagged = localTx.flagged === 1;
          iconSpan.textContent = nowFlagged ? "warning" : "check_circle";
          iconSpan.className = `material-symbols-outlined text-[15px] align-middle ${nowFlagged ? 'text-status-warning' : 'text-outline/30 hover:text-status-warning/60'}`;
          btn.title = nowFlagged ? "Flagged Transaction (Click to Unflag)" : "Unflagged Transaction (Click to Flag)";
        }

        // Backend save
        try {
          await caseService.toggleTransactionFlag(txId);
        } catch (err) {
          console.error("Failed to toggle transaction flag:", err);
          // Rollback
          localTx.flagged = originalFlag;
          if (iconSpan) {
            const nowFlagged = originalFlag === 1;
            iconSpan.textContent = nowFlagged ? "warning" : "check_circle";
            iconSpan.className = `material-symbols-outlined text-[15px] align-middle ${nowFlagged ? 'text-status-warning' : 'text-outline/30 hover:text-status-warning/60'}`;
            btn.title = nowFlagged ? "Flagged Transaction (Click to Unflag)" : "Unflagged Transaction (Click to Flag)";
          }
        }
      });

      // ---- Listeners setup ----
      const triggerFilter = () => { currentPage = 1; updateLedgerUI(); updateActiveBadges(); };

      personSelect?.addEventListener("change", triggerFilter);
      startInput?.addEventListener("change", triggerFilter);
      endInput?.addEventListener("change", triggerFilter);
      document.getElementById("search-input")?.addEventListener("input", triggerFilter);
      document.getElementById("category-filter")?.addEventListener("change", triggerFilter);
      document.getElementById("show-flagged-only")?.addEventListener("change", triggerFilter);

      // DR / CR toggle buttons
      const setDrCr = (state) => {
        drcrFilter = state;
        const drBtn  = document.getElementById("filter-dr");
        const crBtn  = document.getElementById("filter-cr");
        const allBtn = document.getElementById("filter-all");
        [drBtn, crBtn, allBtn].forEach(b => {
          if (!b) return;
          b.style.background = "";
          b.style.color = "";
        });
        const active = state === "dr" ? drBtn : state === "cr" ? crBtn : allBtn;
        if (active) { active.style.background = "#005c54"; active.style.color = "white"; }
        triggerFilter();
      };
      document.getElementById("filter-dr")?.addEventListener("click", () => setDrCr("dr"));
      document.getElementById("filter-cr")?.addEventListener("click", () => setDrCr("cr"));
      document.getElementById("filter-all")?.addEventListener("click", () => setDrCr("all"));
      // Set ALL as default active
      setDrCr("all");

      document.getElementById("reset-filters")?.addEventListener("click", () => {
        if (personSelect) personSelect.value = personId || "all";
        if (startInput) startInput.value = startDate || defaultMinDateStr;
        if (endInput) endInput.value = endDate || defaultMaxDateStr;
        const searchInput = document.getElementById("search-input");
        if (searchInput) searchInput.value = "";
        const catFilter = document.getElementById("category-filter");
        if (catFilter) catFilter.value = "all";
        const flagged = document.getElementById("show-flagged-only");
        if (flagged) flagged.checked = false;
        setDrCr("all");
        activeChips.clear();
        renderKeywordChips();
        currentPage = 1;
        updateLedgerUI();
        updateActiveBadges();
      });

      document.getElementById("prev-page-btn")?.addEventListener("click", () => {
        if (currentPage > 1) {
          currentPage--;
          updateLedgerUI();
          document.querySelector("section").scrollTop = 0;
        }
      });

      document.getElementById("next-page-btn")?.addEventListener("click", () => {
        currentPage++;
        updateLedgerUI();
        document.querySelector("section").scrollTop = 0;
      });

    } catch (err) {
      console.error(err);
      allTransactions = [];
      updateLedgerUI();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
    return;
  }
  init();
}
