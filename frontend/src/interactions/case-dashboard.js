import { caseService } from "../services/caseService.js";

export function attachCaseDashboardInteractions() {
  let chartInstance = null;
  let allTransactions = [];
  let selectedInterval = "month"; // "day", "week", "month"
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

  const getCaseIdFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("id") || params.get("caseId");
  };

  const updateDashboardUI = (caseData) => {
    const numberBadge = document.getElementById("case-number-badge");
    const statusBadge = document.getElementById("case-status-badge");
    const statusDot = document.getElementById("case-status-dot");
    const statusText = document.getElementById("case-status-text");
    const titleEl = document.getElementById("case-title");
    const subtitleEl = document.getElementById("case-subtitle");

    if (numberBadge) {
      numberBadge.textContent = `CASE ${caseData.caseNumber}`;
    }

    if (titleEl) {
      titleEl.textContent = caseData.title;
    }

    const caseNameDisplay = document.getElementById("case-name-display");
    if (caseNameDisplay) {
      caseNameDisplay.textContent = `${caseData.caseNumber} - ${caseData.title}`;
    }

    if (subtitleEl) {
      subtitleEl.textContent = caseData.subtitle || "No description provided.";
    }

    if (statusBadge && statusDot && statusText) {
      statusText.textContent = caseData.status;

      // Reset classes
      statusBadge.className = "px-2 py-0.5 rounded-full flex items-center gap-1.5 font-label-sm text-label-sm";
      statusDot.className = "w-1.5 h-1.5 rounded-full";

      if (caseData.status === "CRITICAL") {
        statusBadge.classList.add("bg-status-critical/10", "text-status-critical");
        statusDot.classList.add("bg-status-critical");
      } else if (caseData.status === "CLOSED") {
        statusBadge.classList.add("border", "border-status-success", "text-status-success");
        statusDot.classList.add("bg-status-success");
      } else if (caseData.status === "ARCHIVED") {
        statusBadge.classList.add("border", "border-border-subtle", "text-secondary", "bg-surface-container-low");
        statusDot.classList.add("bg-secondary");
      } else {
        // ACTIVE
        statusBadge.classList.add("bg-primary/10", "text-primary");
        statusDot.classList.add("bg-primary");
      }
    }
  };

  const loadCaseDetails = async () => {
    const caseId = getCaseIdFromUrl();
    if (!caseId) {
      return;
    }

    const overviewLink = document.getElementById("sidebar-overview-link");
    const transactionsLink = document.getElementById("sidebar-transactions-link");
    const noticeLink = document.getElementById("sidebar-notice-link");
    const spendLink = document.getElementById("sidebar-spend-link");
    const cryptoLink = document.getElementById("sidebar-crypto-link");
    const fundFlowLink = document.getElementById("sidebar-fund-flow-link");
    
    if (overviewLink) overviewLink.href = `case-dashboard.html?id=${caseId}`;
    if (transactionsLink) transactionsLink.href = `transactions.html?caseId=${caseId}`;
    if (noticeLink) noticeLink.href = `notice-generator.html?caseId=${caseId}`;
    if (spendLink) spendLink.href = `spend-analysis.html?caseId=${caseId}`;
    if (cryptoLink) cryptoLink.href = `crypto.html?caseId=${caseId}`;
    if (fundFlowLink) fundFlowLink.href = `fund-flow.html?caseId=${caseId}`;

    try {
      console.log("[DEBUG] Fetching case data for identifier:", caseId);
      const caseData = await caseService.getCaseById(caseId);
      if (caseData) {
        updateDashboardUI(caseData);
      }

      // Fetch target persons
      console.log("[DEBUG] Fetching persons for case ID:", caseId);
      const persons = await caseService.getPersons(caseId);
      console.log("[DEBUG] Persons returned:", persons);
      const personSelect = document.getElementById("person-select");
      if (personSelect && Array.isArray(persons)) {
        personSelect.innerHTML = '<option value="all">All Entities (Combined)</option>';
        persons.forEach(p => {
          const opt = document.createElement("option");
          opt.value = p.id;
          opt.textContent = `${p.name}`;
          personSelect.appendChild(opt);
        });
      }

      // Fetch transactions
      console.log("[DEBUG] Fetching transactions for case ID:", caseId);
      const transactions = await caseService.getTransactions(caseId);
      console.log("[DEBUG] Transactions returned count:", transactions?.length);
      if (Array.isArray(transactions) && transactions.length > 0) {
        allTransactions = transactions;
        
        // Dynamically update date range bounds from data
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

          const startInput = document.getElementById("start-date");
          const endInput = document.getElementById("end-date");
          if (startInput) startInput.value = defaultMinDateStr;
          if (endInput) endInput.value = defaultMaxDateStr;

          const chartStartInput = document.getElementById("chart-start-date");
          const chartEndInput = document.getElementById("chart-end-date");
          if (chartStartInput) chartStartInput.value = defaultMinDateStr;
          if (chartEndInput) chartEndInput.value = defaultMaxDateStr;
        }
      } else {
        // Real case has 0 transactions (e.g. unsupported PDF)
        allTransactions = [];
      }

      updateMetrics();
    } catch (error) {
      console.error("Failed to load case details:", error);
      allTransactions = [];
      updateMetrics();
    }
  };

  // Helper to generate mock transaction ledger deterministically
  const generateMockTransactions = () => {
    const people = ["verma", "reliant", "ms_ent", "chandil"];
    const categories = [
      "upi", "upi", "upi", "upi", // High UPI density
      "card", "imps",
      "cash_withdrawal", "cash_deposit",
      "crypto_in", "crypto_out"
    ];

    const startDate = new Date("2023-03-01");
    const endDate = new Date("2024-02-29");
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1; // 366 days in leap year

    const txns = [];
    let seed = 12345; // Fixed seed for deterministic data generation

    const random = () => {
      let x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    for (let d = 0; d < totalDays; d++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + d);
      const dateStr = currentDate.toISOString().split("T")[0];

      // Deciding if today has activity (75% activity rate)
      const isDayActive = random() < 0.75;
      if (!isDayActive) continue;

      // 1 to 8 transactions per active day
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
          type = random() < 0.4 ? "credit" : "debit"; // 40% credits
        }

        let amount = 0;
        if (category.startsWith("crypto")) {
          // Crypto transaction in USD equivalent
          amount = Math.floor(random() * 10000) + 100;
        } else if (category === "cash_withdrawal" || category === "cash_deposit") {
          amount = Math.floor(random() * 45000) + 100;
        } else if (category === "card") {
          amount = Math.floor(random() * 15000) + 20;
        } else {
          // UPI/IMPS standard ranges
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

  // Maps target code to timeline PDF titles
  const pdfMap = {
    all: "COMBINED_STATEMENTS_AUDIT.pdf",
    verma: "LAKSHIT_VERMA_ICICI_SAVINGS.pdf",
    reliant: "RELIANT_HOLDINGS_HDFC_CURRENT.pdf",
    ms_ent: "MS_ENTERPRISES_KOTAK_CURRENT.pdf",
    chandil: "ADITYA_CHANDIL_AXIS_SAVINGS.pdf"
  };

  const getFilteredTransactions = () => {
    const selectedPerson = document.getElementById("person-select")?.value || "all";
    const startDateStr = document.getElementById("start-date")?.value || defaultMinDateStr;
    const endDateStr = document.getElementById("end-date")?.value || defaultMaxDateStr;

    const startLimit = parseCustomDate(startDateStr);
    const endLimit = parseCustomDate(endDateStr);

    let filtered = allTransactions;

    // Filter by person
    if (selectedPerson !== "all") {
      filtered = filtered.filter((t) => t.personId === selectedPerson || t.person === selectedPerson);
    }

    // Filter by date range
    filtered = filtered.filter((t) => {
      if (!t.date) return false;
      const d = parseCustomDate(t.date);
      if (!d) return false;
      return d >= startLimit && d <= endLimit;
    });

    // Sort by date ascending
    filtered.sort((a, b) => {
      const da = parseCustomDate(a.date);
      const db = parseCustomDate(b.date);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return da - db;
    });
    return filtered;
  };

  // Formats currency nicely
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2
    }).format(val);
  };

  // Recalculates metrics and updates dashboard elements
  const updateMetrics = () => {
    const filtered = getFilteredTransactions();

    // 1. Calculate Bento Metrics
    const ttlCount = filtered.length;
    const creditTxns = filtered.filter((t) => t.type === "credit");
    const debitTxns = filtered.filter((t) => t.type === "debit");

    const sumCredits = creditTxns
      .filter((t) => {
        const cat = (t.category || "").toLowerCase();
        return !cat.startsWith("crypto");
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const debitCount = debitTxns.length;
    const creditCount = creditTxns.length;

    const cashWithdrawals = filtered.filter((t) => {
      const cat = (t.category || "").toLowerCase();
      return cat === "cash_withdrawal" || (cat === "cash" && t.type === "debit");
    });
    const cashDeposits = filtered.filter((t) => {
      const cat = (t.category || "").toLowerCase();
      return cat === "cash_deposit" || (cat === "cash" && t.type === "credit");
    });

    const cashWithdrawalSum = cashWithdrawals.reduce((sum, t) => sum + t.amount, 0);
    const cashDepositSum = cashDeposits.reduce((sum, t) => sum + t.amount, 0);

    const cryptoIn = filtered.filter((t) => {
      const cat = (t.category || "").toLowerCase();
      return cat === "crypto_in" || (cat === "crypto" && t.type === "credit");
    });
    const cryptoOut = filtered.filter((t) => {
      const cat = (t.category || "").toLowerCase();
      return cat === "crypto_out" || (cat === "crypto" && t.type === "debit");
    });

    const cryptoInCount = cryptoIn.length;
    const cryptoOutCount = cryptoOut.length;
    const cryptoVolumeUSD = filtered
      .filter((t) => {
        const cat = (t.category || "").toLowerCase();
        return cat.startsWith("crypto");
      })
      .reduce((sum, t) => sum + t.amount, 0);

    // Update DOM Bento Metric Values
    document.getElementById("metric-ttl-transactions").textContent = ttlCount.toLocaleString();
    document.getElementById("metric-ttl-credits").textContent = formatCurrency(sumCredits);
    document.getElementById("metric-ttl-debit").textContent = debitCount.toLocaleString();
    document.getElementById("metric-ttl-credit").textContent = creditCount.toLocaleString();

    document.getElementById("metric-cash-withdrawals").textContent = cashWithdrawals.length.toLocaleString();
    document.getElementById("metric-cash-withdrawals-sum").textContent = `Sum: ${formatCurrency(cashWithdrawalSum)}`;

    document.getElementById("metric-cash-deposits").textContent = cashDeposits.length.toLocaleString();
    document.getElementById("metric-cash-deposits-sum").textContent = `Sum: ${formatCurrency(cashDepositSum)}`;

    document.getElementById("metric-crypto-txns").textContent = `${cryptoInCount} In / ${cryptoOutCount} Out`;
    document.getElementById("metric-crypto-sum").textContent = `Volume: $${cryptoVolumeUSD.toLocaleString()}`;

    // 2. Timeline Analysis Metrics (Image 1)
    const startDateStr = document.getElementById("start-date")?.value || "2023-03-01";
    const endDateStr = document.getElementById("end-date")?.value || "2024-02-29";
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    const totalPeriodDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    // Active days count (unique days with transactions)
    const activeDaysSet = new Set(filtered.map((t) => t.date));
    const activeDays = activeDaysSet.size;
    const idleDays = Math.max(0, totalPeriodDays - activeDays);

    const avgTxnsPerActiveDay = activeDays > 0 ? (filtered.length / activeDays).toFixed(1) : "0.0";

    // Find peak day
    const dayCounts = {};
    filtered.forEach((t) => {
      dayCounts[t.date] = (dayCounts[t.date] || 0) + 1;
    });

    let peakDayDate = "N/A";
    let peakDayCount = 0;
    Object.keys(dayCounts).forEach((d) => {
      if (dayCounts[d] > peakDayCount) {
        peakDayCount = dayCounts[d];
        peakDayDate = d;
      }
    });

    // Formatting dates nicely
    const formatLabelDate = (dStr) => {
      if (dStr === "N/A") return "N/A";
      const d = new Date(dStr);
      return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
    };

    document.getElementById("metric-active-days").textContent = activeDays;
    document.getElementById("metric-active-days-total").textContent = `of ${totalPeriodDays} total`;
    document.getElementById("metric-idle-days").textContent = idleDays;
    document.getElementById("metric-avg-txns").textContent = avgTxnsPerActiveDay;
    document.getElementById("metric-peak-day").textContent = peakDayCount;
    document.getElementById("metric-peak-day-date").textContent = formatLabelDate(peakDayDate);

    // Update timeline pdf header name
    const selectedPerson = document.getElementById("person-select")?.value || "all";
    document.getElementById("timeline-title").textContent = `Timeline · ${pdfMap[selectedPerson]}`;
    document.getElementById("timeline-range").innerHTML = `
      ${startDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
      &rarr;
      ${endDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
      &middot; ${totalPeriodDays} days
    `;

    // 3. Rail-wise counts table updates
    updateRailTable(filtered);

    // 4. Update the visual graph
    updateChart(filtered);
  };

  // Re-populates the Rail-wise table dynamically
  const updateRailTable = (txns) => {
    const railBody = document.getElementById("rail-table-body");
    if (!railBody) return;

    // Define rail groups
    const rails = {
      UPI: { count: 0, debit: 0, credit: 0, bg: "bg-primary/10 text-primary" },
      CARD_POS_ECOM: { count: 0, debit: 0, credit: 0, bg: "bg-secondary-container text-on-secondary-container" },
      IMPS: { count: 0, debit: 0, credit: 0, bg: "bg-primary-container text-on-primary-container" },
      CASH: { count: 0, debit: 0, credit: 0, bg: "bg-surface-variant text-on-surface-variant" },
      CRYPTO: { count: 0, debit: 0, credit: 0, bg: "bg-tertiary-container text-on-tertiary-container" }
    };

    txns.forEach((t) => {
      const catLower = (t.category || "").toLowerCase();
      let group = "UPI";
      if (catLower === "card") group = "CARD_POS_ECOM";
      else if (catLower === "imps") group = "IMPS";
      else if (catLower.startsWith("cash")) group = "CASH";
      else if (catLower.startsWith("crypto")) group = "CRYPTO";

      rails[group].count += 1;
      if (t.type === "debit") {
        rails[group].debit += t.amount;
      } else {
        rails[group].credit += t.amount;
      }
    });

    railBody.innerHTML = "";
    Object.keys(rails).forEach((k) => {
      const rail = rails[k];
      const row = document.createElement("tr");
      row.className = "hover:bg-surface-container-low transition-colors cursor-pointer";
      
      row.addEventListener("click", () => {
        const caseId = getCaseIdFromUrl();
        const selectedPerson = document.getElementById("person-select")?.value || "all";
        const startDate = document.getElementById("start-date")?.value || "";
        const endDate = document.getElementById("end-date")?.value || "";
        window.location.href = `transactions.html?caseId=${caseId}&rail=${k}&personId=${selectedPerson}&startDate=${startDate}&endDate=${endDate}`;
      });

      row.innerHTML = `
        <td class="px-6 py-3 font-medium">
          <span class="inline-block ${rail.bg} px-2 py-0.5 rounded font-label-sm">${k}</span>
        </td>
        <td class="px-6 py-3 text-right font-label-md">${rail.count}</td>
        <td class="px-6 py-3 text-right font-label-md">${rail.debit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
        <td class="px-6 py-3 text-right font-label-md">${rail.credit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
      `;
      railBody.appendChild(row);
    });
  };

  // Chart aggregation and rendering using Chart.js (Matches Image 2)
  const updateChart = (txns) => {
    const ctx = document.getElementById("activity-chart")?.getContext("2d");
    if (!ctx) return;

    // Filter by chart local start/end date picker
    const chartStartStr = document.getElementById("chart-start-date")?.value;
    const chartEndStr = document.getElementById("chart-end-date")?.value;
    let chartTxns = txns;

    if (chartStartStr && chartEndStr) {
      const cStart = new Date(chartStartStr);
      const cEnd = new Date(chartEndStr);
      chartTxns = txns.filter((t) => {
        const d = parseCustomDate(t.date);
        return d && d >= cStart && d <= cEnd;
      });
    }

    // Aggregate transactions based on interval (day, week, month)
    const grouped = {};

    chartTxns.forEach((t) => {
      const d = parseCustomDate(t.date);
      if (!d) return;
      let key = d.toISOString().split("T")[0]; // YYYY-MM-DD
      if (selectedInterval === "week") {
        // Group by week
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust start of week to Monday
        const monday = new Date(d.setDate(diff));
        key = monday.toISOString().split("T")[0];
      } else if (selectedInterval === "month") {
        // Group by month
        key = d.toISOString().substring(0, 7); // "YYYY-MM"
      }

      if (!grouped[key]) {
        grouped[key] = { credit: 0, debit: 0, count: 0 };
      }
      grouped[key].count += 1;
      if (t.type === "credit") {
        grouped[key].credit += t.amount;
      } else {
        grouped[key].debit += t.amount;
      }
    });

    const sortedKeys = Object.keys(grouped).sort();

    // Check zoom slider value
    const slider = document.getElementById("graph-zoom-slider");
    const zoomVal = slider ? parseInt(slider.value) : 0;
    
    // Zoom slides: slice the keys list based on slider percentage
    // Slider from 0 to 100 shifts the start index forward
    let displayKeys = sortedKeys;
    const minPoints = 10;
    if (sortedKeys.length > minPoints && zoomVal > 0) {
      const startIndex = Math.floor((zoomVal / 100) * (sortedKeys.length - minPoints));
      displayKeys = sortedKeys.slice(startIndex);
      
      const startRangeLabel = displayKeys[0];
      const endRangeLabel = displayKeys[displayKeys.length - 1];
      document.getElementById("slider-range-label").textContent = `${formatChartLabel(startRangeLabel)} to ${formatChartLabel(endRangeLabel)}`;
    } else {
      document.getElementById("slider-range-label").textContent = "All Dates";
    }

    const creditsData = displayKeys.map((k) => grouped[k].credit);
    const debitsData = displayKeys.map((k) => grouped[k].debit);
    const countsData = displayKeys.map((k) => grouped[k].count);
    const chartLabels = displayKeys.map(formatChartLabel);

    if (chartInstance) {
      chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: chartLabels,
        datasets: [
          {
            label: "Credit",
            data: creditsData,
            borderColor: "#10B981", // emerald-500
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            fill: true,
            tension: 0.3,
            yAxisID: "y"
          },
          {
            label: "Debit",
            data: debitsData,
            borderColor: "#DC2626", // red-600
            backgroundColor: "rgba(220, 38, 38, 0.1)",
            fill: true,
            tension: 0.3,
            yAxisID: "y"
          },
          {
            label: "Txn count",
            data: countsData,
            borderColor: "#1F2937", // dark grey/black
            borderDash: [5, 5],
            fill: false,
            tension: 0.1,
            yAxisID: "y1"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false
        },
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              usePointStyle: true,
              pointStyle: "circle",
              font: {
                family: "Inter",
                size: 11
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                family: "Inter",
                size: 9
              }
            }
          },
          y: {
            type: "linear",
            display: true,
            position: "left",
            title: {
              display: true,
              text: "Amount (₹)",
              font: {
                family: "Inter",
                size: 11,
                weight: "bold"
              }
            },
            grid: {
              color: "#F3F4F6"
            },
            ticks: {
              callback: (val) => {
                if (val >= 10000000) return `${(val / 10000000).toFixed(1)} Cr`;
                if (val >= 100000) return `${(val / 100000).toFixed(1)} L`;
                if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                return val;
              },
              font: {
                family: "Inter",
                size: 10
              }
            }
          },
          y1: {
            type: "linear",
            display: true,
            position: "right",
            title: {
              display: true,
              text: "Count",
              font: {
                family: "Inter",
                size: 11,
                weight: "bold"
              }
            },
            grid: {
              drawOnChartArea: false // only show grid lines for left Y axis
            },
            ticks: {
              font: {
                family: "Inter",
                size: 10
              }
            }
          }
        }
      }
    });
  };

  // Helper to format chart date strings to user-friendly text
  function formatChartLabel(key) {
    if (key.length === 7) {
      // YYYY-MM
      const parts = key.split("-");
      const d = new Date(parts[0], parts[1] - 1, 1);
      return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
    }
    const d = new Date(key);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
  }

  const setupInteractions = () => {
    // Seeding mock ledger removed since loadCaseDetails is async and fetches SQLite data

    // 2. Add event listeners
    const personSelect = document.getElementById("person-select");
    const startDateInput = document.getElementById("start-date");
    const endDateInput = document.getElementById("end-date");
    const resetBtn = document.getElementById("reset-filters");
    const zoomSlider = document.getElementById("graph-zoom-slider");
    const resetZoomBtn = document.getElementById("reset-zoom");

    const chartStartInput = document.getElementById("chart-start-date");
    const chartEndInput = document.getElementById("chart-end-date");

    personSelect?.addEventListener("change", () => {
      const deleteBtn = document.getElementById("delete-entity-btn");
      if (deleteBtn) {
        if (personSelect.value === "all") {
          deleteBtn.classList.add("hidden");
        } else {
          deleteBtn.classList.remove("hidden");
        }
      }
      updateMetrics();
    });
    startDateInput?.addEventListener("change", updateMetrics);
    endDateInput?.addEventListener("change", updateMetrics);
    chartStartInput?.addEventListener("change", updateMetrics);
    chartEndInput?.addEventListener("change", updateMetrics);

    resetBtn?.addEventListener("click", () => {
      if (personSelect) personSelect.value = "all";
      const deleteBtn = document.getElementById("delete-entity-btn");
      if (deleteBtn) deleteBtn.classList.add("hidden");
      if (startDateInput) startDateInput.value = defaultMinDateStr;
      if (endDateInput) endDateInput.value = defaultMaxDateStr;
      if (chartStartInput) chartStartInput.value = defaultMinDateStr;
      if (chartEndInput) chartEndInput.value = defaultMaxDateStr;
      if (zoomSlider) zoomSlider.value = "0";
      updateMetrics();
    });

    const deleteEntityBtn = document.getElementById("delete-entity-btn");
    deleteEntityBtn?.addEventListener("click", async () => {
      const selectedPersonId = personSelect?.value;
      if (!selectedPersonId || selectedPersonId === "all") return;

      const personText = personSelect.options[personSelect.selectedIndex]?.text || "selected entity";
      const confirmDelete = confirm(`Are you sure you want to delete the entity "${personText}" and all of its transaction logs? This action is permanent and cannot be undone.`);
      
      if (!confirmDelete) return;

      try {
        const response = await fetch(`/api/persons/${selectedPersonId}`, { method: "DELETE" });
        if (!response.ok) {
          throw new Error("Failed to delete entity");
        }
        
        alert("Entity deleted successfully!");
        
        if (personSelect) personSelect.value = "all";
        if (deleteEntityBtn) deleteEntityBtn.classList.add("hidden");
        
        await loadCaseDetails();
      } catch (err) {
        console.error("Error deleting entity:", err);
        alert(`Error deleting entity: ${err.message}`);
      }
    });

    zoomSlider?.addEventListener("input", updateMetrics);
    resetZoomBtn?.addEventListener("click", () => {
      if (zoomSlider) {
        zoomSlider.value = "0";
        updateMetrics();
      }
    });

    // Interval aggregation toggles (Day, Week, Month)
    const btnDay = document.getElementById("btn-interval-day");
    const btnWeek = document.getElementById("btn-interval-week");
    const btnMonth = document.getElementById("btn-interval-month");

    const updateIntervalActiveState = (activeBtn) => {
      [btnDay, btnWeek, btnMonth].forEach((btn) => {
        if (btn) {
          btn.className = "px-4 py-1.5 rounded-md font-bold transition-all text-secondary hover:text-on-surface";
        }
      });
      if (activeBtn) {
        activeBtn.className = "px-4 py-1.5 rounded-md font-bold transition-all bg-inverse-surface text-inverse-on-surface";
      }
    };

    btnDay?.addEventListener("click", () => {
      selectedInterval = "day";
      updateIntervalActiveState(btnDay);
      updateMetrics();
    });

    btnWeek?.addEventListener("click", () => {
      selectedInterval = "week";
      updateIntervalActiveState(btnWeek);
      updateMetrics();
    });

    btnMonth?.addEventListener("click", () => {
      selectedInterval = "month";
      updateIntervalActiveState(btnMonth);
      updateMetrics();
    });

    // Upload PDFs Modal Interactivity
    const uploadPdfsBtn = document.getElementById("upload-pdfs-btn");
    const uploadPdfsModal = document.getElementById("upload-pdfs-modal");
    const uploadPdfsClose = document.getElementById("upload-pdfs-close");
    const uploadPdfsCancel = document.getElementById("upload-pdfs-cancel");
    const uploadPdfsForm = document.getElementById("upload-pdfs-form");
    const statementFilesInput = document.getElementById("statement-files");

    const loadingOverlay = document.getElementById("parsing-loading-overlay");
    const loadingStatusText = document.getElementById("loading-status-text");
    const loadingProgressBar = document.getElementById("loading-progress-bar");
    const loadingProgressPercent = document.getElementById("loading-progress-percent");

    const successModal = document.getElementById("parsing-success-modal");
    const successModalDesc = document.getElementById("success-modal-description");
    const successModalOkBtn = document.getElementById("success-modal-ok-btn");

    const openUploadModal = () => {
      if (statementFilesInput) statementFilesInput.value = "";
      uploadPdfsModal?.classList.remove("hidden");
      uploadPdfsModal?.classList.add("flex");
    };

    const closeUploadModal = () => {
      uploadPdfsModal?.classList.add("hidden");
      uploadPdfsModal?.classList.remove("flex");
    };

    uploadPdfsBtn?.addEventListener("click", openUploadModal);
    uploadPdfsClose?.addEventListener("click", closeUploadModal);
    uploadPdfsCancel?.addEventListener("click", closeUploadModal);

    successModalOkBtn?.addEventListener("click", () => {
      successModal?.classList.add("hidden");
      successModal?.classList.remove("flex");
      window.location.reload();
    });

    const readFileAsBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result.split(",")[1];
          resolve({ filename: file.name, base64 });
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });
    };

    uploadPdfsForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const caseId = getCaseIdFromUrl();
      if (!caseId || !statementFilesInput) return;

      closeUploadModal();
      loadingOverlay?.classList.remove("hidden");
      loadingOverlay?.classList.add("flex");

      let progressVal = 5;
      const updateLocalProgress = (val, text) => {
        progressVal = val;
        if (loadingProgressBar) loadingProgressBar.style.width = `${val}%`;
        if (loadingProgressPercent) loadingProgressPercent.innerText = `${val}% Complete`;
        if (loadingStatusText) loadingStatusText.innerText = text;
      };

      updateLocalProgress(5, "Reading local statement PDF binary files...");

      const progressInterval = setInterval(() => {
        if (progressVal < 95) {
          const inc = Math.max(0.5, (95 - progressVal) * 0.05 + Math.random() * 2);
          const nextVal = Math.min(95, Math.floor(progressVal + inc));
          let stepText = "Running metadata layout extraction (Python)...";
          if (nextVal > 30 && nextVal <= 65) {
            stepText = "Analyzing statement transaction ledgers...";
          } else if (nextVal > 65 && nextVal <= 85) {
            stepText = "Categorizing transaction flows and channels...";
          } else if (nextVal > 85) {
            stepText = "Syncing records with local SQLite database...";
          }
          updateLocalProgress(nextVal, stepText);
        }
      }, 250);

      try {
        const base64Files = [];
        if (statementFilesInput.files.length > 0) {
          const filePromises = Array.from(statementFilesInput.files).map(readFileAsBase64);
          const results = await Promise.all(filePromises);
          base64Files.push(...results);
        }

        const res = await caseService.uploadCaseDocumentsJson(caseId, { files: base64Files });

        clearInterval(progressInterval);
        updateLocalProgress(100, "Database sync complete!");

        await new Promise(resolve => setTimeout(resolve, 400));
        loadingOverlay?.classList.add("hidden");
        loadingOverlay?.classList.remove("flex");

        if (successModalDesc) {
          successModalDesc.innerText = `Bank statements uploaded and parsed successfully! Synced transaction counts, metadata, and ledgers in the local SQLite database.`;
        }
        successModal?.classList.remove("hidden");
        successModal?.classList.add("flex");

      } catch (error) {
        clearInterval(progressInterval);
        loadingOverlay?.classList.add("hidden");
        loadingOverlay?.classList.remove("flex");
        console.error(error);
        alert("Unable to upload statements: " + error.message);
      }
    });

    // Run first calculation
    updateMetrics();
  };

  const init = () => {
    document.querySelectorAll("tr").forEach((row) => {
      row.addEventListener("click", () => {
        row.classList.add("scale-[0.99]");
        setTimeout(() => row.classList.remove("scale-[0.99]"), 100);
      });
    });

    window.toggleDarkMode = function toggleDarkMode() {
      document.documentElement.classList.toggle("dark");
    };

    loadCaseDetails();
    setupInteractions();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
    return;
  }

  init();
}

