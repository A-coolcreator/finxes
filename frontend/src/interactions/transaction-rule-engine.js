/*
 * Finexis transaction rule engine.
 *
 * This module intentionally has no DOM or API dependencies.  It accepts the
 * legacy transaction shape returned by the API and returns an enriched copy;
 * consequently it can be moved to the ingestion/API layer without changing
 * the rules or consumers.
 */

const DAY = 24 * 60 * 60 * 1000;
const amountOf = tx => Number(tx.amount ?? (tx.type === "credit" ? tx.credit : tx.debit) ?? 0) || 0;
const directionOf = tx => String(tx.type || (tx.credit != null ? "credit" : "debit")).toLowerCase();
const clean = value => String(value || "").toLowerCase().replace(/[^a-z0-9@./\- ]+/g, " ").replace(/\s+/g, " ").trim();
const textOf = tx => clean(tx.description || tx.narration_raw || tx.narration || "");
const isCredit = tx => directionOf(tx) === "credit";
const isDebit = tx => directionOf(tx) === "debit";
const dateOf = tx => {
  const value = tx.date || tx.transactionDate || tx.value_date;
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};
const inHours = (a, b, hours) => {
  const da = dateOf(a), db = dateOf(b);
  return da && db && db >= da && db - da <= hours * 60 * 60 * 1000;
};
const between = (value, min, max) => value >= min && value <= max;
const any = (value, terms) => terms.some(term => value.includes(term));
const unique = values => [...new Set(values.filter(Boolean))];

/** DOCX §0.1 header aliases. New banks are data additions, not parser rewrites. */
export const BANK_STATEMENT_FORMATS = [
  ["SBI", ["txn date", "value date", "description", "ref no"]], ["HDFC", ["date", "narration", "withdrawal amt", "deposit amt"]], ["ICICI", ["transaction date", "transaction remarks", "debit", "credit"]], ["AXIS", ["tran date", "particulars", "withdrawal amt", "deposit amt"]], ["KOTAK", ["transaction date", "description", "debit", "credit"]], ["PNB", ["posting date", "transaction particulars", "dr amount", "cr amount"]], ["BANK_OF_BARODA", ["txn date", "description", "debit", "credit"]], ["CANARA", ["tran date", "description", "dr/cr", "amount"]], ["BANK_OF_INDIA", ["date", "particulars", "debit", "credit"]], ["UNION_BANK", ["date", "narration", "debit", "credit"]], ["YES_BANK", ["date", "narration", "debit", "credit"]], ["INDUSIND", ["value date", "transaction remarks", "debit", "credit"]], ["IDFC_FIRST", ["date", "description", "reference no", "debit", "credit"]], ["FEDERAL", ["transaction date", "particulars", "debit", "credit"]], ["RBL", ["date", "particulars", "debit", "credit"]], ["SOUTH_INDIAN", ["date", "description", "dr", "cr"]], ["DHANLAXMI", ["date", "narration", "debit", "credit"]], ["KARNATAKA", ["txn date", "particulars", "dr amt", "cr amt"]], ["UCO", ["date", "particulars", "debit", "credit"]], ["INDIAN_BANK", ["tran date", "description", "debit", "credit"]]
].map(([bank, headers]) => ({ bank, headers }));

export function detectBankStatementFormat(headers = []) {
  const normalized = headers.map(clean);
  return BANK_STATEMENT_FORMATS.map(format => ({ ...format, score: format.headers.filter(header => normalized.includes(header)).length })).sort((a, b) => b.score - a.score)[0] || null;
}

export function normaliseBankStatementRow(row = {}, { account_id = null, bank = null } = {}) {
  const entries = Object.entries(row); const get = aliases => entries.find(([key]) => aliases.includes(clean(key)))?.[1]; const number = value => Number(String(value ?? "").replace(/[,₹\s]/g, "")) || 0;
  const debit = number(get(["debit", "withdrawal amt", "dr amount", "dr amt", "dr"])); const credit = number(get(["credit", "deposit amt", "cr amount", "cr amt", "cr"])); const amount = number(get(["amount"])); const flag = clean(get(["dr/cr"]));
  return { account_id, bank, date: get(["txn date", "date", "transaction date", "tran date", "posting date", "value date"]), value_date: get(["value date"]), narration_raw: get(["description", "narration", "transaction remarks", "particulars", "transaction particulars"]) || "", reference_no: get(["ref no", "ref no./cheque no.", "chq./ref.no.", "chq no", "cheque no", "instrument id", "reference no."]) || null, debit: debit || (flag === "dr" ? amount : null), credit: credit || (flag === "cr" ? amount : null), balance: number(get(["balance", "closing balance", "running balance"])) || null };
}

export const RISK_RANK = { CLEAR: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4, CONFIRMED_MULE: 5 };
const maxRisk = (...levels) => levels.reduce((best, level) => RISK_RANK[level] > RISK_RANK[best] ? level : best, "LOW");

export const TXN_TYPE_RULES = [
  ["NACH_DEBIT", "NACH", /nach|ecs dr|ach dr|mandate|nach rtn/], ["NACH_CREDIT", "NACH", /nach cr|ecs cr|ach cr/],
  ["ATM_WITHDRAWAL", "ATM", /\batm\b|cash wdl|\batw\b|cash withdrawal|atm-|cash@|atmdp/], ["ATM_DEPOSIT", "ATM", /\bcdm\b|cash deposit machine|cash dep|crm dep/],
  ["CASH_DEPOSIT", "CASH", /cash dep|by cash|deposit-cash|by clg|teller dep/], ["CASH_WITHDRAWAL", "CASH", /cash wdl|cash paid|teller wdl|counter cash/],
  ["UPI_CREDIT", "UPI", /upi\/cr|upi-cr|upiinw|^upi.*@/], ["UPI_DEBIT", "UPI", /upi\/dr|upi-dr|upiout|^upi.*@/],
  ["IMPS_CREDIT", "IMPS", /imps\/cr|imps cr|imps-cr|inward imps/], ["IMPS_DEBIT", "IMPS", /imps\/dr|imps dr|imps-dr|outward imps/],
  ["NEFT_CREDIT", "NEFT", /neft\/cr|neft cr|neft-cr|inward neft|in neft/], ["NEFT_DEBIT", "NEFT", /neft\/dr|neft dr|neft-dr|outward neft|neft out/],
  ["RTGS_CREDIT", "RTGS", /rtgs\/cr|rtgs cr|rtgs-cr|inward rtgs/], ["RTGS_DEBIT", "RTGS", /rtgs\/dr|rtgs dr|rtgs-dr|outward rtgs/],
  ["CHEQUE_DEBIT", "CHEQUE", /clg dr|chq dr|cheque|cts|by clearing|pd chq/], ["CHEQUE_CREDIT", "CHEQUE", /clg cr|chq cr|transfer by clearing|inward clg/],
  ["CHEQUE_BOUNCE", "CHEQUE", /chq rtn|cheque return|clg rtn|inward rtn|dishonour/], ["POS_PURCHASE", "POS", /\bpos\b|purchase|merchant|visa purchase|master purchase/],
  ["INTERNATIONAL", "FOREX", /forex|intl|international|fcy|\busd\b|\beur\b|\bgbp\b|\baed\b|\bsgd\b/], ["INTEREST_CREDIT", "SYSTEM", /int cr|interest credit|int paid|saving interest/],
  ["CHARGES_DEBIT", "SYSTEM", /charges|service chg|sms chg|annual fee|locker|processing fee|processing chg|penalty/], ["TDS_DEBIT", "SYSTEM", /tds|tax deducted|income tax/],
  ["REFUND_CREDIT", "VARIOUS", /refund|reversal|ref cr|credit adj|cashback/], ["TRANSFER_IN", "INTERNAL", /self transfer|own account|own a\/c|trf cr/], ["TRANSFER_OUT", "INTERNAL", /self transfer dr|trf dr|own account dr/]
];

export const KEYWORD_RULES = {
  SALARY: ["salary", "sal", "payroll", "stipend", "wages", "ctc", "monthly pay", "remuneration", "pay credit", "staff payment", "employee"],
  EMI: ["emi", "installment", "instlmt", "equated monthly", "loan emi", "car emi", "home emi", "personal loan emi", "emi payment"],
  LOAN_REPAYMENT: ["loan repayment", "loan payment", "loan closure", "principal payment", "loan outstanding", "bajaj finserv", "hdfc loan", "sbi loan", "axis loan", "icici loan", "full settlement", "part payment loan"],
  LOAN_DISBURSEMENT: ["loan disbursement", "loan credited", "personal loan credit", "home loan disbursed", "vehicle loan cr", "gold loan credit", "education loan"],
  ECS_MANDATE: ["ecs", "nach", "ach", "mandate", "auto debit", "standing instruction", "si debit", "recurring debit", "si dr"],
  GST_PAYMENT: ["gst", "gstin", "igst", "cgst", "sgst", "gst payment", "tax payment to govt", "challan payment", "pmt-gst"], TDS: ["tds", "tds deducted", "income tax deducted", "194a", "194c", "194h", "194j"],
  INCOME_TAX: ["income tax", "itr", "advance tax", "self assessment tax", "tax refund", "it refund", "tax cr"], INSURANCE_PREMIUM: ["insurance", "lic", "policy premium", "life insurance", "health insurance", "term insurance", "motor insurance", "hdfc life", "sbi life", "icici prudential", "max life", "bajaj allianz", "star health", "care insurance"],
  MUTUAL_FUND: ["mutual fund", "mf", "sip", "systematic investment", "mf redemption", "mf purchase", "zerodha", "groww", "mirae", "hdfc mf", "icici pru mf", "sbi mf", "axis mf", "franklin"], STOCK_TRADING: ["zerodha", "angel broking", "upstox", "sharekhan", "motilal", "edelweiss", "5paisa", "nse clearing", "bse clearing", "nsccl", "sebi", "stock purchase", "trading account", "dp charges", "demat", "margin", "futures", "options"],
  RENT_PAYMENT: ["rent", "house rent", "flat rent", "rental", "pg payment", "hostel", "accommodation", "property rent", "rent to"], BILL_PAYMENT: ["bbps", "bill pay", "bill payment", "electricity", "ebill", "water bill", "gas bill", "piped gas"], TELECOM_RECHARGE: ["airtel", "jio", "vodafone", "idea", "bsnl", "mtnl", "recharge", "talktime", "data plan", "mobile recharge", "broadband", "fiber"],
  TOLL_FASTAG: ["fastag", "toll", "nhai", "highway toll", "plaza", "toll collection"], CHALLAN_FINE: ["challan", "traffic fine", "echallan", "court fine", "rto", "parivahan", "traffic police"], GOVT_SUBSIDY: ["pm kisan", "dbt", "direct benefit", "pfms", "government credit", "subsidy", "jandhan", "scholarship credit", "nsp"], CHEQUE_BOUNCE_FLAG: ["chq rtn", "cheque return", "clg rtn", "dishonour", "insufficient funds", "inward rtn", "bounce"], INTERNATIONAL_TXN: ["intl", "international", "forex", "fcy", "usd", "eur", "gbp", "aed", "sgd", "thb", "myr", "swift", "nostro", "vostro", "foreign currency"], SUSPICIOUS_KEYWORD: ["hawala", "hundi", "black money", "shell", "dummy", "benami", "fictitious", "land deal cash", "gold cash", "property cash"]
};

// Ordered: a transaction receives only the first matching primary spend category.
export const DIGITAL_CATEGORY_RULES = [
  ["BETTING_GAMBLING", "CRITICAL", "dream11 d11 my11circle my11c playerzon playerzpot paytm first games gameskraft rummycircle rummytime adda52 pokerbaazi junglee rummy ace2three khelo365 1xbet betwinner betway fairplay betbhai9 cricketbet cricbuzz bet sportibet wolf777 mostbet 10cric parimatch casinodays royalclub 22bet 4rabet bc game betfair lottoland lottosmile jackpot lottery gambling wager poker cash slot matka satta dpboss kalyan matka fix match betting tip"],
  ["CRYPTO_BLOCKCHAIN", "CRITICAL", "wazirx coindcx coinswitch kuber zebpay bitbns giottus unocoin buyucoin mudrex kucoin binance bybit okx kraken bitget huobi gate io coinbase gemini bitmex phemex deribit bitfinex blockchain crypto bitcoin btc ethereum eth usdt usdc sol bnb xrp dogecoin doge p2p crypto peer to peer crypto web3 defi nft token airdrop staking metamask wallet crypto ledger crypto trezor"],
  ["FOREX_INTERNATIONAL_TRANSFER", "HIGH", "western union wu transfer moneygram ria money transfast instarem wise remitly xoom paypal skrill neteller payoneer world remit bookmyforex thomas cook forex easyforex niyo global swift transfer foreign remittance outward remittance fema overseas international wire forex card"],
  ["GAMING_ESPORTS", "MEDIUM", "steam steamgames valve battlenet blizzard epic games epicgames riot games ea games ubisoft activision playstation psn xbox microsoft gaming nintendo garena free fire pubg mobile bgmi krafton supercell clash of clans clash royale mobile legends brawl stars pokemon go niantic playtonia nodwin skyesports fnatic s8ul esports godlike team vitality gaming zone cyber cafe gaming chair gaming subscription"],
  ["ADULT_CONTENT", "HIGH", "onlyfans fansly admireme justforfans manyvids naughtyamerica brazzers bangbros adult subscription xxx 18+ content adult website"], ["DARK_WEB_SUSPICIOUS_SERVICES", "CRITICAL", "vpn anonymous tor browser payment darknet dark web privacy coin monero zcash dash coin anonymous transfer no kyc offshore payment shell payment"],
  ["LOAN_APPS_PREDATORY", "HIGH", "kreditbee cashe moneyview navi loan slice loan lazypay paylater buy now pay later bnpl simpl earlysalary smartcoin loanfront kissht pay sense prefr moneytap fibe mpokket stashfin payrupik dhani olyv satya microfin spandana bharat financial"],
  ["OTT_VIDEO_STREAMING", "LOW", "netflix hotstar disney hotstar amazon prime prime video sony liv sonyliv jiocinema jio cinema mxplayer zee5 voot alt balaji eros now discovery plus shemaroo sun nxt hungama aha video apple tv mubi lionsgate play docubay hoichoi bongo chorki"], ["MUSIC_STREAMING", "LOW", "spotify apple music youtube premium youtube music amazon music gaana wynk jiosaavn hungama music resso tidal deezer soundcloud go"],
  ["FOOD_DELIVERY_DINING", "LOW", "swiggy zomato dunzo blinkit zepto bigbasket instamart mealsurf freshmenu faasos box8 oven story behrouz biryani pizza hut dominos kfc mcdonalds burger king subway starbucks cafe coffee day ccd barista barbeque nation social theobroma haldiram empire hotel restaurant"], ["GROCERY_DAILY_ESSENTIALS", "LOW", "bigbasket bb daily jiomart reliance smart dmart more supermarket metro cash nature basket spencer's nilgiri family fresh grofers milkbasket country delight supermarket kirana"],
  ["TRAVEL_TRANSPORT", "LOW", "irctc redbus makemytrip mmt goibibo yatra ixigo easemytrip cleartrip ola uber rapido vogo yulu bounce metro card dtc card namma metro mumbai metro indigo airindia vistara spicejet akasa airport cab booking taxi auto rickshaw app bus ticket"], ["HOTELS_ACCOMMODATION", "LOW", "oyo treebo fab hotels airbnb mmt hotels goibibo hotels booking.com agoda expedia taj hotel oberoi itc hotels radisson marriott hyatt hilton holiday inn club mahindra homestay"],
  ["ECOMMERCE_SHOPPING", "LOW", "amazon flipkart myntra meesho nykaa ajio tatacliq snapdeal limeroad shopclues indiamart jiomart reliance digital croma vijay sales poorvika firstcry hopscotch pepperfry urban ladder ikea decathlon h&m zara westside pantaloons lifestyle max fashion biba fabindia tanishq malabar gold joyalukkas pc jewellers"], ["HEALTH_PHARMACY", "LOW", "pharmeasy 1mg netmeds apollo pharmacy medplus healthkart tata 1mg lybrate practo mfine docprime cult fit cure fit healthifyme fitpass gym membership yoga studio physio diagnostics thyrocare lal path metropolis lab dr lal max lab"],
  ["EDUCATION_UPSKILLING", "LOW", "byjus byju's unacademy vedantu whitehat jr toppr meritnation extramarks udemy coursera linkedinlearning simplilearn upgrad talentedge great learning henry harvin skill india swayam edx khan academy college fee university fee school fee tuition coaching jee coaching neet coaching ielts gre gmat toefl"], ["INSURANCE_NON_MANDATORY", "LOW", "acko go digit toffee insurance riskcovry renewbuy policybazaar coverfox ditto insurance pet insurance gadget insurance travel insurance cancer cover critical illness"],
  ["INVESTMENT_WEALTH", "LOW", "zerodha groww kuvera coin by zerodha paytm money angel one iifl securities motilal oswal edelweiss smallcase wealthdesk us stocks international investment nps ppf sgb gold bond fd booking rd booking national savings post office"], ["SOFTWARE_SUBSCRIPTIONS", "LOW", "google one google workspace microsoft 365 office 365 adobe creative adobe acrobat canva pro notion slack zoom pro dropbox icloud bitdefender kaspersky quickheal norton mcafee tally busy marg erp zoho freshbooks hubspot salesforce github digitalocean aws azure gcp hostinger godaddy namecheap cloudflare"],
  ["SOCIAL_MEDIA_CREATOR", "LOW", "twitter blue x premium meta verified linkedin premium youtube facebook ads instagram ads snapchat+ telegram premium discord nitro medium substack patreon buymeacoffee razorpay pages instamojo"], ["UTILITIES_DIGITAL", "LOW", "electricity water bill gas bill igl mgl adani gas piped gas landline broadband wifi plan tata sky dish tv sun direct tata play hathway d2h airtel xtreme jio fiber act fibernet spectranet"], ["PERSONAL_CARE_WELLNESS", "LOW", "nykaa purplle sugar cosmetics dot and key mamaearth wow skin beardo bombay shaving ustraa plum forest essentials kama ayurveda salon beauty parlour spa massage wellness centre"],
  ["CHARITY_DONATIONS", "LOW", "giveindia milaap ketto impact guru cry india child rights pm relief cm relief fund red cross unicef pmo pm cares disaster relief ngo trust donation temple donation church offering masjid gurdwara religious donation bhumi foundation"], ["GOVERNMENT_CIVIC_PAYMENTS", "LOW", "bbps govt passport fee visa fee mca21 roc filing pan application aadhar update epfo esic pf withdrawal nps withdrawal court fee stamp duty registration sub-registrar property tax municipal tax vehicle tax rto fee driving licence"]
].map(([category, risk, terms]) => ({ category, risk, terms: terms.split(" ").join("|").split("|") }));

// The document lists multi-word merchant aliases.  The compact master list
// above is tokenised for maintainability; this guard prevents generic words
// (for example "cash", "payment" or "game") from becoming categories by
// themselves.  Merchant names and meaningful crypto/forex indicators remain
// eligible matches, while phrase-only aliases are represented by their most
// distinctive token.
const DIGITAL_GENERIC_TOKENS = new Set(["and", "the", "app", "apps", "game", "games", "cash", "card", "payment", "payments", "transfer", "wallet", "coin", "token", "service", "services", "content", "loan", "loans", "hotel", "hotels", "bank", "bills", "fee", "fees", "web", "shop", "store", "india", "digital", "online", "international", "subscription", "subscriptions", "insurance", "care", "fund", "funds", "gold", "money", "travel", "trust", "gas", "water", "office", "cloud"]);
const matchesDigitalCategory = (text, rule) => rule.terms.some(term => term.length >= 4 && !DIGITAL_GENERIC_TOKENS.has(term) && text.includes(term));

export const CRYPTO_EXCHANGES = [
  ["WazirX", "MEDIUM", "wazirx wzrx zanmai labs wazirx@hdfcbank wazirx@icici"], ["CoinDCX", "MEDIUM", "coindcx neblio technologies coindcx@kotak coindcx@yesbank"], ["CoinSwitch Kuber", "MEDIUM", "coinswitch kuber bitcipher labs coinswitch@icici kuber@upi"], ["ZebPay", "MEDIUM", "zebpay awlencan innovations zebpay@axis zebpay@hdfc"], ["BitBNS", "MEDIUM", "bitbns buyhatke internet bitbns@icici"], ["Giottus", "LOW", "giottus giottus@kotak"], ["Unocoin", "LOW", "unocoin unocoin@ybl"], ["BuyUCoin", "LOW", "buyucoin buyucoin@upi"], ["Mudrex", "LOW", "mudrex mudrex@icici"], ["Binance", "HIGH", "binance bnb"], ["Bybit", "HIGH", "bybit"], ["KuCoin", "HIGH", "kucoin"], ["OKX", "HIGH", "okx okex"], ["Coinbase", "CRITICAL", "coinbase coinbase inc usa"], ["Kraken", "CRITICAL", "kraken payward inc"]
].map(([entity, risk, terms]) => ({ entity, risk, terms: terms.split(" ").join("|").split("|") }));

const classify = tx => {
  const narration = textOf(tx);
  const matched = TXN_TYPE_RULES.find(([, , pattern]) => pattern.test(narration));
  let [txn_type = "UNKNOWN", channel = "UNKNOWN"] = matched || [];
  // Banks sometimes omit CR/DR in the narration (and UPI's documented
  // fallback pattern is necessarily broad).  The parsed debit/credit column
  // is authoritative in that case and prevents a UPI debit being labelled a
  // credit merely because it contains a VPA.
  if (txn_type.endsWith("_CREDIT") && isDebit(tx)) txn_type = txn_type.replace("_CREDIT", "_DEBIT");
  if (txn_type.endsWith("_DEBIT") && isCredit(tx)) txn_type = txn_type.replace("_DEBIT", "_CREDIT");
  return { txn_type, channel };
};

const parseUpi = narration => {
  const vpa = narration.match(/[a-z0-9._+\-]+@[a-z0-9._\-]+/i)?.[0]?.toLowerCase() || null;
  const parts = narration.split("/").map(value => value.trim()).filter(Boolean);
  const upiIndex = parts.findIndex(value => /^upi$/i.test(value));
  const directionIndex = upiIndex >= 0 && /^(cr|dr)$/i.test(parts[upiIndex + 1]) ? upiIndex + 1 : -1;
  const utr_no = directionIndex >= 0 ? parts[directionIndex + 1] || null : null;
  const counterparty_name = directionIndex >= 0 ? parts[directionIndex + 2] || null : null;
  const counterparty_mobile = vpa?.match(/^([6-9]\d{9})@/)?.[1] || null;
  return { counterparty_vpa: vpa, counterparty_mobile, counterparty_name, utr_no, upi_kind: vpa ? (counterparty_mobile ? "P2P" : "P2M_OR_P2P") : null };
};

const counterpartyOf = tx => tx.counterparty_name || tx.counterpartyName || tx.counterparty || tx.counterparty_vpa || tx.counterpartyVpa || parseUpi(tx.description || "").counterparty_name || parseUpi(tx.description || "").counterparty_vpa || null;
const institutionTerms = ["sbi", "hdfc", "icici", "axis", "kotak", "pnb", "bank", "lic", "pfms", "epfo", "nps", "gst", "nsccl", "bse clearing", "rbi", "nach", "amazon", "flipkart", "swiggy", "zomato", "uber", "ola"];
// Whole-term matching is essential here: `amit@okaxis` is a personal VPA,
// not an Axis Bank institution.  A substring whitelist suppresses genuine
// mule signals and would make the scoring model non-auditable.
const isInstitution = tx => {
  const value = `${textOf(tx)} ${clean(counterpartyOf(tx))}`;
  return institutionTerms.some(term => new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(value));
};

function addHit(tx, id, severity, details, weight = 0) {
  tx.rule_hits.push({ id, severity, details, weight });
  tx.risk_level = maxRisk(tx.risk_level, severity);
}

function applyPerTransactionRules(tx) {
  const text = tx.narration_clean;
  if (tx.digital_category === "DARK_WEB_SUSPICIOUS_SERVICES") addHit(tx, "DS-B07", "CRITICAL", "Dark web or anonymous-service payment");
  if (tx.crypto_entity) addHit(tx, "CR-01", "MEDIUM", `Direct exchange match: ${tx.crypto_entity}`);
  if (tx.counterparty_vpa && CRYPTO_EXCHANGES.some(exchange => exchange.terms.some(term => tx.counterparty_vpa.includes(term)))) addHit(tx, "CR-02", "MEDIUM", "Known crypto exchange VPA");
  if (/usdt|usdc|busd|\bdai\b|tether|stable ?coin/.test(text)) addHit(tx, "CR-12", "HIGH", "Stablecoin pattern");
  if (/\bnft\b|opensea|nifty gateway|foundation|rarible|token purchase|mint|gas fee/.test(text)) addHit(tx, "CR-13", "MEDIUM", "NFT pattern");
  if (/\bdefi\b|staking reward|yield|farming|\bapy\b|protocol|liquidity pool|wallet withdraw/.test(text)) addHit(tx, "CR-14", "MEDIUM", "DeFi or staking pattern");
  if (tx.crypto_entity && isDebit(tx) && amountOf(tx) % 1000 === 0) addHit(tx, "CR-06", "MEDIUM", "Round-number crypto purchase");
  if (tx.crypto_entity && /swift|foreign remittance|outward remittance/.test(text)) addHit(tx, "CR-11", "CRITICAL", "International crypto SWIFT/remittance");
  if (tx.channel === "UPI" && /crypto|bitcoin|\bbtc\b|ethereum|\beth\b|usdt|usdc|\btoken\b|\bp2p\b|\bweb3\b|\bnft\b/.test(text) && tx.upi_kind === "P2P") addHit(tx, "CR-03", "HIGH", "Suspected P2P crypto trade");
}

function orderedTransactions(transactions) { return [...transactions].sort((a, b) => (dateOf(a)?.getTime() || 0) - (dateOf(b)?.getTime() || 0)); }
function windowFrom(txs, start, hours) { const d = dateOf(start); return d ? txs.filter(tx => { const td = dateOf(tx); return td && td >= d && td - d <= hours * 3600000; }) : []; }
function addMuleHits(txs) {
  const ordered = orderedTransactions(txs);
  for (const credit of ordered.filter(isCredit)) {
    const within4 = windowFrom(ordered.filter(isDebit), credit, 4); const creditAmount = amountOf(credit);
    if (creditAmount > 5000 && !isInstitution(credit) && within4.reduce((sum, tx) => sum + amountOf(tx), 0) >= creditAmount * .8) addHit(credit, "MU-02", "CRITICAL", "80%+ drained within four hours", 35);
    const within24 = windowFrom(ordered, credit, 24); const inbound = windowFrom(ordered.filter(isCredit), credit, 24);
    if (inbound.length > 5 && inbound.length > 1 && (dateOf(inbound.at(-1)) - dateOf(inbound[0])) / (inbound.length - 1) < 15 * 60000 && !inbound.every(isInstitution)) addHit(credit, "MU-01", "HIGH", "Inbound velocity spike", 25);
    const fanIn = windowFrom(ordered.filter(isCredit), credit, 48); if (unique(fanIn.map(counterpartyOf)).length >= 5 && !fanIn.some(isInstitution)) addHit(credit, "MU-03", "HIGH", "Five or more distinct inward counterparties", 20);
    if (creditAmount > 20000 && unique(windowFrom(ordered.filter(isDebit), credit, 48).map(counterpartyOf)).filter(Boolean).length >= 5) addHit(credit, "MU-04", "HIGH", "Fan-out after large credit", 20);
    if (creditAmount > 10000 && windowFrom(ordered.filter(tx => tx.txn_type === "ATM_WITHDRAWAL"), credit, 24).reduce((sum, tx) => sum + amountOf(tx), 0) >= creditAmount * .6) addHit(credit, "MU-09", "HIGH", "ATM cash layering after credit", 25);
    if (creditAmount > 50000 && windowFrom(ordered.filter(tx => /swift|remit|foreign|international/.test(tx.narration_clean) && isDebit(tx)), credit, 48).length) addHit(credit, "MU-17", "CRITICAL", "International transfer after credit", 30);
    if (creditAmount > 10000 && windowFrom(ordered.filter(tx => tx.crypto_entity && isDebit(tx)), credit, 24).some(tx => amountOf(tx) >= creditAmount * .7)) addHit(credit, "MU-19", "CRITICAL", "Crypto exit after credit", 30);
    if (credit.keyword_tags.includes("LOAN_DISBURSEMENT") && windowFrom(ordered.filter(isDebit), credit, 168).some(tx => amountOf(tx) >= creditAmount * .85 && !isInstitution(tx))) addHit(credit, "MU-18", "HIGH", "Loan disbursement diverted", 25);
  }
  for (const tx of ordered) {
    const day = windowFrom(ordered.filter(isCredit), tx, 24);
    if (day.length >= 3 && day.every(item => amountOf(item) < 49000) && day.reduce((sum, item) => sum + amountOf(item), 0) >= 100000 && unique(day.map(counterpartyOf)).length > 1) addHit(tx, "MU-07", "HIGH", "Structured sub-threshold credits", 30);
    const upi = windowFrom(ordered.filter(item => isCredit(item) && item.channel === "UPI" && amountOf(item) < 2000), tx, 6); if (upi.length >= 10 && unique(upi.map(counterpartyOf)).length >= 10) addHit(tx, "MU-16", "HIGH", "Small UPI receipt aggregation", 25);
  }
  const byMonth = new Map(); ordered.forEach(tx => { const date = dateOf(tx); if (!date) return; const key = `${date.getFullYear()}-${date.getMonth()}`; const row = byMonth.get(key) || { credits: 0, debits: 0, balance: tx.balance }; row[isCredit(tx) ? "credits" : "debits"] += amountOf(tx); row.balance = tx.balance; byMonth.set(key, row); });
  if ([...byMonth.values()].filter(row => row.credits > 20000 && Number(row.balance) < 2000).length >= 3) ordered.forEach(tx => addHit(tx, "MU-08", "HIGH", "Near-zero month-end balance cycling", 25));
  if ([...byMonth.values()].filter(row => row.credits > 0 && Math.abs(row.credits - row.debits) / row.credits < .05).length >= 3) ordered.forEach(tx => addHit(tx, "MU-14", "MEDIUM", "Credit/debit pass-through symmetry", 15));
  const totalOut = ordered.filter(isDebit).reduce((sum, tx) => sum + amountOf(tx), 0); const outgoingByParty = new Map(); ordered.filter(isDebit).forEach(tx => outgoingByParty.set(counterpartyOf(tx), (outgoingByParty.get(counterpartyOf(tx)) || 0) + amountOf(tx))); if ([...outgoingByParty.values()].some(value => totalOut && value / totalOut > .7)) ordered.filter(isDebit).forEach(tx => addHit(tx, "MU-13", "HIGH", "Outgoing counterparty concentration", 20));
  return ordered;
}

function applyCrossTransactionRules(txs) {
  const ordered = addMuleHits(txs);
  const byCategory = category => ordered.filter(tx => tx.digital_category === category);
  if (byCategory("BETTING_GAMBLING").length > 5) byCategory("BETTING_GAMBLING").forEach(tx => addHit(tx, "DS-B01", "HIGH", "Betting frequency exceeds five transactions"));
  if (byCategory("BETTING_GAMBLING").filter(tx => amountOf(tx) < 1000).length > 10) byCategory("BETTING_GAMBLING").forEach(tx => addHit(tx, "DS-B05", "MEDIUM", "Rapid micro-bet pattern"));
  const totalDebits = ordered.filter(isDebit).reduce((sum, tx) => sum + amountOf(tx), 0); const betting = byCategory("BETTING_GAMBLING").reduce((sum, tx) => sum + amountOf(tx), 0); if (totalDebits && betting / totalDebits > .2) byCategory("BETTING_GAMBLING").forEach(tx => addHit(tx, "DS-B04", "HIGH", "Gambling exceeds 20% of debits"));
  for (const tx of ordered.filter(tx => tx.crypto_entity && isDebit(tx))) { const recentCredit = ordered.filter(other => isCredit(other) && inHours(other, tx, 72) && amountOf(other) > 10000).at(-1); if (recentCredit && !isInstitution(recentCredit)) addHit(tx, "DS-B03", "CRITICAL", "Crypto debit after unexplained large credit"); }
  for (const cryptoCredit of ordered.filter(tx => tx.crypto_entity && isCredit(tx))) if (windowFrom(ordered.filter(tx => tx.txn_type === "ATM_WITHDRAWAL"), cryptoCredit, 48).reduce((sum, tx) => sum + amountOf(tx), 0) >= amountOf(cryptoCredit) * .6) addHit(cryptoCredit, "CR-07", "CRITICAL", "Crypto proceeds withdrawn as cash");
  if (ordered.filter(tx => tx.crypto_entity && isDebit(tx) && amountOf(tx) < 5000).length >= 10) ordered.filter(tx => tx.crypto_entity).forEach(tx => addHit(tx, "CR-09", "MEDIUM", "High-frequency micro crypto purchases"));
  const monthKey = tx => { const date = dateOf(tx); return date && `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`; };
  const monthly = new Map();
  ordered.forEach(tx => { const key = monthKey(tx); if (!key) return; const row = monthly.get(key) || { betting: [], gaming: [], adult: [], crypto: [], forex: [], credits: 0 }; if (isCredit(tx)) row.credits += amountOf(tx); if (tx.digital_category === "BETTING_GAMBLING") row.betting.push(tx); if (tx.digital_category === "GAMING_ESPORTS") row.gaming.push(tx); if (tx.digital_category === "ADULT_CONTENT") row.adult.push(tx); if (tx.is_crypto) row.crypto.push(tx); if (tx.digital_category === "FOREX_INTERNATIONAL_TRANSFER") row.forex.push(tx); monthly.set(key, row); });
  const months = [...monthly.keys()].sort();
  months.forEach((key, index) => {
    const row = monthly.get(key), previous = monthly.get(months[index - 1]);
    const spend = list => list.reduce((sum, tx) => sum + amountOf(tx), 0);
    if (previous && spend(row.betting) > spend(previous.betting) * 2 && spend(previous.betting) > 0) row.betting.forEach(tx => addHit(tx, "DS-B02", "HIGH", "Betting spend doubled month-on-month"));
    if (row.adult.length > 3) row.adult.forEach(tx => addHit(tx, "DS-B09", "MEDIUM", "Repeated adult-content transactions"));
    if (row.credits && spend(ordered.filter(tx => monthKey(tx) === key && tx.digital_category === "FOOD_DELIVERY_DINING")) > row.credits * .4) ordered.filter(tx => monthKey(tx) === key && tx.digital_category === "FOOD_DELIVERY_DINING").forEach(tx => addHit(tx, "DS-B11", "LOW", "Food delivery exceeds 40% of monthly credits"));
    const priorCrypto = months.slice(Math.max(0, index - 3), index).flatMap(month => monthly.get(month).crypto); if (priorCrypto.length && spend(row.crypto) > (spend(priorCrypto) / Math.min(3, index)) * 3) row.crypto.forEach(tx => addHit(tx, "CR-10", "HIGH", "Monthly crypto volume spike"));
  });
  const internationalSpend = ordered.filter(tx => tx.digital_category === "FOREX_INTERNATIONAL_TRANSFER" || tx.txn_type === "INTERNATIONAL").reduce((sum, tx) => sum + amountOf(tx), 0); if (totalDebits && internationalSpend / totalDebits > .3) ordered.filter(tx => tx.digital_category === "FOREX_INTERNATIONAL_TRANSFER" || tx.txn_type === "INTERNATIONAL").forEach(tx => addHit(tx, "DS-B10", "MEDIUM", "International spend exceeds 30% of debits"));
  for (const exchangeDebit of ordered.filter(tx => tx.crypto_entity && isDebit(tx))) { const prior = ordered.filter(tx => isCredit(tx) && inHours(tx, exchangeDebit, 48) && !isInstitution(tx)); if (unique(prior.map(counterpartyOf)).length >= 3 && prior.reduce((sum, tx) => sum + amountOf(tx), 0) > 50000) addHit(exchangeDebit, "CR-04", "HIGH", "Crypto fan-in before exchange payment"); }
  for (const exchangeCredit of ordered.filter(tx => tx.crypto_entity && isCredit(tx))) { const recipients = unique(windowFrom(ordered.filter(isDebit), exchangeCredit, 24).map(counterpartyOf)); if (recipients.length >= 5) addHit(exchangeCredit, "CR-05", "HIGH", "Crypto-sale fan-out to multiple individuals"); }
  const exchangeCreditMonths = new Map(); ordered.filter(tx => tx.crypto_entity && isCredit(tx)).forEach(tx => { const key = monthKey(tx); if (key) exchangeCreditMonths.set(key, (exchangeCreditMonths.get(key) || 0) + 1); }); if (exchangeCreditMonths.size >= 2) ordered.filter(tx => tx.crypto_entity && isCredit(tx)).forEach(tx => addHit(tx, "CR-15", "HIGH", "Recurring exchange credits may be crypto income"));
  return ordered;
}

/** Enrich legacy API transactions without mutating them. */
export function enrichTransactions(transactions = []) {
  const enriched = transactions.map((source, index) => {
    const narration_raw = String(source.description || source.narration_raw || source.narration || "");
    const classification = classify({ ...source, description: narration_raw }); const upi = classification.channel === "UPI" ? parseUpi(narration_raw) : {};
    const narration_clean = clean(narration_raw); const keyword_tags = Object.entries(KEYWORD_RULES).filter(([, terms]) => any(narration_clean, terms)).map(([tag]) => tag);
    const digital = DIGITAL_CATEGORY_RULES.find(rule => matchesDigitalCategory(narration_clean, rule)); const exchange = CRYPTO_EXCHANGES.find(rule => any(`${narration_clean} ${upi.counterparty_vpa || ""}`, rule.terms));
    const type = directionOf(source); const txn_type = classification.txn_type === "UNKNOWN" ? (type === "credit" ? "UNKNOWN_CREDIT" : type === "debit" ? "UNKNOWN_DEBIT" : "UNKNOWN") : classification.txn_type;
    const tx = { ...source, txn_id: source.txn_id || source.id || `txn_${index}`, narration_raw, narration_clean, debit: type === "debit" ? amountOf(source) : null, credit: type === "credit" ? amountOf(source) : null, txn_type, channel: classification.channel, ...upi, counterparty_name: source.counterparty_name || source.counterpartyName || upi.counterparty_name || null, counterparty_account: source.counterparty_account || source.counterpartyAccount || null, counterparty_ifsc: source.counterparty_ifsc || source.metaIfscCode || narration_raw.match(/\b[A-Z]{4}0[A-Z0-9]{6}\b/i)?.[0] || null, reference_no: source.reference_no || source.referenceNumber || source.chqNo || null, keyword_tags, digital_category: digital?.category || "UNCATEGORISED", digital_risk_level: digital?.risk || "LOW", is_crypto: Boolean(exchange || digital?.category === "CRYPTO_BLOCKCHAIN"), crypto_entity: exchange?.entity || null, crypto_risk_level: exchange?.risk || null, crypto_direction: exchange ? (type === "debit" ? "OUT_TO_EXCHANGE" : "IN_FROM_EXCHANGE") : null, mule_score: 0, mule_rules_hit: [], rule_hits: [], risk_level: maxRisk(digital?.risk || "LOW", exchange?.risk || "LOW"), analysis_version: "2026.07", analysis_generated_at: new Date().toISOString() };
    applyPerTransactionRules(tx); return tx;
  });
  applyCrossTransactionRules(enriched);
  enriched.forEach(tx => { const muleHits = tx.rule_hits.filter(hit => hit.id.startsWith("MU-")); tx.mule_rules_hit = unique(muleHits.map(hit => hit.id)); tx.mule_score = Math.min(100, muleHits.reduce((sum, hit) => sum + hit.weight, 0)); const muleRisk = tx.mule_score >= 100 ? "CONFIRMED_MULE" : tx.mule_score >= 80 ? "CRITICAL" : tx.mule_score >= 60 ? "HIGH" : tx.mule_score >= 40 ? "MEDIUM" : tx.mule_score >= 20 ? "LOW" : "CLEAR"; tx.mule_risk_level = muleRisk; tx.risk_level = maxRisk(tx.risk_level, muleRisk === "CLEAR" ? "LOW" : muleRisk); });
  return enriched;
}

/**
 * Account-level Module 1 metrics and timeline findings.  Kept separate from
 * enrichment because these rules require the complete statement window.
 */
export function analyseTransactionVolume(transactions = []) {
  const txs = orderedTransactions(transactions); const findings = [];
  const days = new Map(); const months = new Map();
  txs.forEach(tx => { const date = dateOf(tx); if (!date) return; const day = date.toISOString().slice(0, 10); const month = day.slice(0, 7); const d = days.get(day) || { txs: [], debit: 0, credit: 0 }; d.txs.push(tx); d[isCredit(tx) ? "credit" : "debit"] += amountOf(tx); days.set(day, d); const m = months.get(month) || { debit: 0, credit: 0, last: tx }; m[isCredit(tx) ? "credit" : "debit"] += amountOf(tx); m.last = tx; months.set(month, m); });
  const orderedDays = [...days.entries()].sort(([a], [b]) => a.localeCompare(b));
  orderedDays.forEach(([day, row], index) => { const prior = orderedDays.slice(Math.max(0, index - 30), index).map(([, value]) => value); const avgDebit = prior.reduce((sum, value) => sum + value.debit, 0) / Math.max(prior.length, 1); const avgCredit = prior.reduce((sum, value) => sum + value.credit, 0) / Math.max(prior.length, 1); if (prior.length && row.debit > avgDebit * 3) findings.push({ id: "TXN-V01", severity: "MEDIUM", date: day, details: "Daily debit exceeds 3× 30-day average" }); if (prior.length && row.credit > avgCredit * 3) findings.push({ id: "TXN-V02", severity: "MEDIUM", date: day, details: "Daily credit exceeds 3× 30-day average" }); if (row.txs.length > 20) findings.push({ id: "TXN-V03", severity: "MEDIUM", date: day, details: "More than 20 transactions in one day" }); });
  txs.forEach((tx, index) => { const amount = amountOf(tx); if (amount > 100000) findings.push({ id: isCredit(tx) ? "TXN-V08" : "TXN-V07", severity: "MEDIUM", transaction_id: tx.txn_id || tx.id, details: "Single transaction exceeds ₹1 lakh" }); const previous = txs[index - 1]; if (previous && dateOf(tx) - dateOf(previous) > 60 * DAY) findings.push({ id: "TXN-V09", severity: "LOW", transaction_id: tx.txn_id || tx.id, details: "Dormant period exceeds 60 days" }); });
  [...months.entries()].forEach(([month, row]) => { if (row.debit > row.credit * 1.1) findings.push({ id: "TXN-V10", severity: "MEDIUM", month, details: "Monthly debits exceed credits by 10%" }); });
  const totalDebits = txs.filter(isDebit).reduce((sum, tx) => sum + amountOf(tx), 0); const atm = txs.filter(tx => tx.txn_type === "ATM_WITHDRAWAL").reduce((sum, tx) => sum + amountOf(tx), 0); if (totalDebits && atm / totalDebits > .4) findings.push({ id: "TXN-V11", severity: "HIGH", details: "ATM withdrawals exceed 40% of debits" }); const rounded = txs.filter(tx => amountOf(tx) && amountOf(tx) % 1000 === 0).length; if (txs.length && rounded / txs.length > .7) findings.push({ id: "TXN-V13", severity: "MEDIUM", details: "Over 70% round-number amounts" });
  const totalCredit = txs.filter(isCredit).reduce((sum, tx) => sum + amountOf(tx), 0); const totalDebit = txs.filter(isDebit).reduce((sum, tx) => sum + amountOf(tx), 0);
  return { findings, metrics: { total_credits: totalCredit, total_debits: totalDebit, net_flow: totalCredit - totalDebit, total_transactions: txs.length, average_daily_debit: totalDebit / Math.max(days.size, 1), average_credit_per_transaction: totalCredit / Math.max(txs.filter(isCredit).length, 1), unique_counterparties: unique(txs.map(counterpartyOf)).length } };
}

/** Build Module 5-compatible first-hop nodes, directed aggregate edges and alerts. */
export function buildFundFlowMetadata(transactions = [], { accountId = "TARGET_ACCOUNT", accountName = "Target account" } = {}) {
  const nodes = new Map([[accountId, { node_id: accountId, entity_name: accountName, entity_type: "ACCOUNT", is_verified: false, mule_score: 0, crypto_flag: false, txn_count: 0 }]]); const edges = new Map();
  transactions.forEach(tx => { const name = counterpartyOf(tx) || "Unknown counterparty"; const nodeId = clean(name) || "unknown"; const node = nodes.get(nodeId) || { node_id: nodeId, entity_name: name, entity_type: tx.crypto_entity ? "CRYPTO_EXCHANGE" : isInstitution(tx) ? "INSTITUTION" : "UNKNOWN", vpa_list: [], txn_count: 0, mule_score: 0, crypto_flag: false, is_verified: isInstitution(tx) }; node.txn_count += 1; node.crypto_flag ||= Boolean(tx.is_crypto); if (tx.counterparty_vpa) node.vpa_list = unique([...node.vpa_list, tx.counterparty_vpa]); node.mule_score = Math.max(node.mule_score, tx.mule_score || 0); nodes.set(nodeId, node); const sender = isDebit(tx) ? accountId : nodeId, receiver = isDebit(tx) ? nodeId : accountId, key = `${sender}→${receiver}`; const edge = edges.get(key) || { edge_id: key, sender, receiver, amount: 0, txn_count: 0, channels: [], transactions: [] }; edge.amount += amountOf(tx); edge.txn_count += 1; edge.channels = unique([...edge.channels, tx.channel]); edge.transactions.push(tx.txn_id || tx.id); edges.set(key, edge); });
  const edgeList = [...edges.values()]; const alertRules = []; edgeList.filter(edge => edge.amount > 1000000).forEach(edge => alertRules.push({ id: "FF-A01", severity: "HIGH", edge_id: edge.edge_id, details: "Single-hop aggregate exceeds ₹10 lakh" })); const inDegree = new Map(), outDegree = new Map(); edgeList.forEach(edge => { outDegree.set(edge.sender, (outDegree.get(edge.sender) || 0) + 1); inDegree.set(edge.receiver, (inDegree.get(edge.receiver) || 0) + 1); }); [...nodes.values()].forEach(node => { node.is_hub = (inDegree.get(node.node_id) || 0) >= 3 && (outDegree.get(node.node_id) || 0) >= 3; if (node.is_hub) alertRules.push({ id: "FF-A03", severity: "HIGH", node_id: node.node_id, details: "Bridge node has 3+ inward and outward connections" }); node.risk_level = node.mule_score >= 80 ? "CRITICAL" : node.mule_score >= 60 ? "HIGH" : node.mule_score >= 40 ? "MEDIUM" : node.mule_score >= 20 ? "LOW" : "CLEAR"; });
  return { nodes: [...nodes.values()], edges: edgeList, alerts: alertRules, top_beneficiaries: edgeList.filter(edge => edge.sender === accountId).sort((a, b) => b.amount - a.amount).slice(0, 10), top_sources: edgeList.filter(edge => edge.receiver === accountId).sort((a, b) => b.amount - a.amount).slice(0, 10) };
}

const timeMinutes = tx => {
  const explicit = String(tx.time || "").match(/^(\d{1,2}):(\d{2})/);
  if (explicit) return Number(explicit[1]) * 60 + Number(explicit[2]);
  const date = dateOf(tx); return date ? date.getUTCHours() * 60 + date.getUTCMinutes() : null;
};
const monthId = tx => { const date = dateOf(tx); return date && `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`; };
const valueOf = list => list.reduce((sum, tx) => sum + amountOf(tx), 0);

/**
 * Evaluates rules needing a full statement, linked statements or KYC.  The
 * optional context is deliberately explicit: a rule never fabricates KYC or
 * cross-case evidence when the case has not supplied it.
 */
export function evaluateAdvancedRules(transactions = [], context = {}) {
  const txs = orderedTransactions(transactions); const findings = [];
  const emit = (id, severity, details, evidence = {}) => findings.push({ id, severity, details, evidence });
  const credits = txs.filter(isCredit), debits = txs.filter(isDebit);
  // TXN-V04/V05/V06/V12/V14/V15.
  txs.filter(tx => between(timeMinutes(tx) ?? -1, 0, 299)).forEach(tx => emit("TXN-V04", "LOW", "Transaction between 00:00 and 05:00", { transaction_id: tx.txn_id }));
  if (txs.length && txs.filter(tx => [0, 6].includes(dateOf(tx)?.getUTCDay())).length / txs.length > .6) emit("TXN-V05", "LOW", "Weekend transactions exceed 60% in statement window");
  credits.filter(tx => amountOf(tx) > 10000).forEach(credit => { const drained = windowFrom(txs, credit, 4).some(tx => Number(tx.balance) < 500); if (drained) emit("TXN-V06", "HIGH", "Balance fell below ₹500 within four hours of large credit", { transaction_id: credit.txn_id }); });
  txs.forEach(tx => { if (windowFrom(txs, tx, 1).length > 8) emit("TXN-V12", "HIGH", "More than eight transactions within one hour", { transaction_id: tx.txn_id }); });
  const months = [...new Set(txs.map(monthId).filter(Boolean))].sort(); const monthlyCredits = months.map(month => valueOf(credits.filter(tx => monthId(tx) === month)));
  if (monthlyCredits.length >= 4 && monthlyCredits.slice(-4).every((value, index, values) => index === 0 || value > values[index - 1] * 1.5)) emit("TXN-V14", "MEDIUM", "Three consecutive months of credit growth above 50%");
  if (months.filter(month => { const last = txs.filter(tx => monthId(tx) === month).at(-1); return Number(last?.balance) < 1000; }).length >= 3) emit("TXN-V15", "HIGH", "Month-end balance below ₹1,000 for three months");
  // DS-B06/B08/B12.
  const subscriptionMerchants = unique(txs.filter(tx => ["OTT_VIDEO_STREAMING", "MUSIC_STREAMING", "SOFTWARE_SUBSCRIPTIONS", "SOCIAL_MEDIA_CREATOR"].includes(tx.digital_category)).map(counterpartyOf));
  if (subscriptionMerchants.length > 10) emit("DS-B06", "MEDIUM", "More than ten active subscription merchants", { merchants: subscriptionMerchants });
  const loanCycles = credits.filter(tx => tx.digital_category === "LOAN_APPS_PREDATORY" || tx.keyword_tags?.includes("LOAN_DISBURSEMENT")).filter(credit => windowFrom(debits, credit, 24 * 30).some(debit => debit.digital_category === "LOAN_APPS_PREDATORY" && amountOf(debit) >= amountOf(credit) * .7));
  if (loanCycles.length >= 3) emit("DS-B08", "HIGH", "Three or more predatory-loan credit/debit cycles");
  const gamingMonths = months.map(month => valueOf(txs.filter(tx => monthId(tx) === month && tx.digital_category === "GAMING_ESPORTS"))); if (gamingMonths.length >= 4 && gamingMonths.at(-1) > valueOf(gamingMonths.slice(-4, -1)) / 3 * 3) emit("DS-B12", "MEDIUM", "Gaming spend exceeds three-month average by 3×");
  // MU-05/MU-06/MU-10/MU-12/MU-15/MU-20 from the statement itself.
  credits.forEach(credit => { const candidate = txs.find(tx => isDebit(tx) && inHours(credit, tx, 24 * 7) && between(amountOf(tx), amountOf(credit) * .85, amountOf(credit) * 1.05) && counterpartyOf(tx) !== counterpartyOf(credit)); const returned = candidate && credits.find(tx => inHours(candidate, tx, 24 * 7) && between(amountOf(tx), amountOf(credit) * .85, amountOf(credit) * 1.05) && counterpartyOf(tx) !== counterpartyOf(credit)); if (returned) emit("MU-05", "CRITICAL", "Round-trip funds through different counterparties", { credit: credit.txn_id, debit: candidate.txn_id, return: returned.txn_id }); });
  txs.forEach(tx => { const before = txs.filter(other => dateOf(other) < dateOf(tx) && dateOf(tx) - dateOf(other) <= 90 * DAY); if (before.length < 3 && windowFrom(txs, tx, 24 * 7).length > 10) emit("MU-06", "MEDIUM", "Dormant account became active", { transaction_id: tx.txn_id }); });
  const offHourDays = unique(txs.filter(tx => between(timeMinutes(tx) ?? -1, 60, 299)).map(tx => dateOf(tx)?.toISOString().slice(0, 10))); if (offHourDays.length >= 3) emit("MU-12", "MEDIUM", "Off-hours activity on three or more days");
  credits.forEach(credit => { const bounce = txs.find(tx => tx.txn_type === "CHEQUE_BOUNCE" && inHours(credit, tx, 48) && amountOf(tx) > amountOf(credit) * .3); if (bounce) emit("MU-15", "MEDIUM", "Cheque bounce after staged inward credit", { credit: credit.txn_id, bounce: bounce.txn_id }); });
  const firstSeen = new Map(); debits.filter(tx => ["NEFT", "IMPS"].includes(tx.channel)).forEach(tx => { const party = counterpartyOf(tx); if (!firstSeen.has(party)) firstSeen.set(party, tx); }); if ([...firstSeen.values()].filter(tx => amountOf(tx) > 5000).length >= 3) emit("MU-20", "HIGH", "Three or more one-time NEFT/IMPS beneficiaries");
  // Contextual rules: these only run against data imported with the case.
  const linked = context.linkedTransactions || [];
  const linkedCrypto = new Set(linked.filter(tx => tx.crypto_entity || /wazirx|coindcx|coinswitch|binance|coinbase/.test(textOf(tx))).map(counterpartyOf));
  txs.filter(isDebit).filter(tx => linkedCrypto.has(counterpartyOf(tx))).forEach(tx => emit("CR-08", "CRITICAL", "Counterparty subsequently funds a known crypto exchange", { transaction_id: tx.txn_id }));
  const kyc = context.kycAccounts || []; const suspiciousKyc = kyc.filter(account => account.suspicious && (account.mobile || account.email || account.device_id)); const shared = suspiciousKyc.find(account => suspiciousKyc.filter(other => ["mobile", "email", "device_id"].some(key => account[key] && account[key] === other[key])).length >= 3); if (shared) emit("MU-11", "HIGH", "Three or more suspicious accounts share KYC/device identifier", { identifier: shared.mobile || shared.email || shared.device_id });
  const upiGraph = context.upiTransfers || []; const vpas = unique(upiGraph.flatMap(edge => [edge.sender, edge.receiver])); if (vpas.length >= 3 && upiGraph.some(edge => upiGraph.some(next => next.sender === edge.receiver && next.receiver === edge.sender))) emit("MU-10", "CRITICAL", "UPI round-robin cycle confirmed from linked transfer graph");
  const graphEdges = context.flowEdges || []; const nodeSet = new Set(graphEdges.flatMap(edge => [edge.sender, edge.receiver])); const outgoing = node => graphEdges.filter(edge => edge.sender === node); const hasCycle = start => { const visit = (node, path) => path.length <= 6 && outgoing(node).some(edge => edge.receiver === start || (!path.includes(edge.receiver) && visit(edge.receiver, [...path, edge.receiver]))); return visit(start, [start]); }; if ([...nodeSet].some(hasCycle)) emit("FF-A02", "CRITICAL", "Fund-flow cycle of six hops or fewer");
  const crossCases = context.crossCaseEntities || []; crossCases.filter(entity => Number(entity.case_count) >= 2).forEach(entity => emit("FF-A10", "HIGH", "Entity occurs in two or more investigation cases", { entity: entity.name }));
  return findings;
}

/** Evaluates FF-A04–FF-A09 from enriched multi-hop graph data. */
export function evaluateFundFlowAlerts(graph, context = {}) {
  const alerts = []; const emit = (id, severity, details, evidence = {}) => alerts.push({ id, severity, details, evidence });
  const nodes = graph?.nodes || [], edges = graph?.edges || []; const verified = new Set(context.verifiedNodeIds || nodes.filter(node => node.is_verified).map(node => node.node_id));
  const components = context.components || []; components.filter(component => !component.node_ids?.some(id => verified.has(id)) && Number(component.total_amount) > 100000).forEach(component => emit("FF-A04", "HIGH", "Unverified isolated cluster exceeds ₹1 lakh", { nodes: component.node_ids }));
  const cryptoNodes = new Set(context.cryptoGatewayNodeIds || nodes.filter(node => node.crypto_flag || node.entity_type === "CRYPTO_EXCHANGE").map(node => node.node_id));
  edges.filter(edge => cryptoNodes.has(edge.receiver) && edge.sender !== context.targetAccountId).forEach(edge => emit("FF-A05", "CRITICAL", "Intermediary routes funds to crypto gateway", { edge_id: edge.edge_id }));
  edges.filter(edge => edge.channels?.some(channel => /swift|forex|international/i.test(channel))).forEach(edge => emit("FF-A06", "CRITICAL", "International exit node detected", { edge_id: edge.edge_id }));
  const ghosts = nodes.filter(node => node.level === 1 && !node.is_verified && !node.known_identity && node.txn_count <= 1); if (ghosts.length >= 3) emit("FF-A07", "HIGH", "Three or more ghost beneficiaries", { node_ids: ghosts.map(node => node.node_id) });
  const events = context.flowEvents || []; const startNodes = unique(events.map(event => event.sender)); startNodes.forEach(start => { const first = events.find(event => event.sender === start); if (!first) return; const descendants = events.filter(event => event.sender === first.receiver && new Date(event.date) - new Date(first.date) <= DAY); if (unique(descendants.map(event => event.receiver)).length >= 5) emit("FF-A08", "CRITICAL", "Rapid fan-out cascade to five or more nodes", { source: start, bridge: first.receiver }); });
  const target = context.targetAccountId; if (target) { const links = new Map(); edges.forEach(edge => { const list = links.get(edge.sender) || []; list.push(edge.receiver); links.set(edge.sender, list); }); const returns = (node, path) => path.length <= 4 && (links.get(node) || []).some(next => next === target || (!path.includes(next) && returns(next, [...path, next]))); if (returns(target, [target])) emit("FF-A09", "CRITICAL", "Return-to-origin flow within two to four hops", { target }); }
  return alerts;
}
