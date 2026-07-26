export function initSidebar() {
  const mount =
    document.getElementById("app-sidebar") ||
    document.querySelector("aside#app-sidebar") ||
    document.querySelector("nav#app-sidebar") ||
    document.querySelector("aside.app-sidebar") ||
    document.querySelector("nav.app-sidebar") ||
    document.querySelector("aside");

  if (!mount) return;

  // Read URL params
  const params = new URLSearchParams(window.location.search);
  const caseId = params.get("caseId") || params.get("id");

  // Determine current page filename
  const pathParts = window.location.pathname.split("/");
  const currentPage = pathParts[pathParts.length - 1] || "case-manager.html";

  // Build links
  const dashHref = "case-manager.html";
  const overviewHref = caseId ? `case-dashboard.html?id=${caseId}` : "#";
  const txHref = caseId ? `transactions.html?caseId=${caseId}` : "#";
  const noticeHref = caseId ? `notice-generator.html?caseId=${caseId}` : "#";
  const spendHref = caseId ? `spend-analysis.html?caseId=${caseId}` : "#";
  const cryptoHref = caseId ? `crypto.html?caseId=${caseId}` : "#";
  const muleHref = caseId ? `mule.html?caseId=${caseId}` : "#";
  const fundHref = caseId ? `fund-flow.html?caseId=${caseId}` : "#";
  const archivesHref = "archives.html";

  const isActive = (pageName) => {
    if (Array.isArray(pageName)) return pageName.includes(currentPage);
    return currentPage === pageName;
  };

  const getLinkState = (pageName, href) => {
    if (isActive(pageName)) {
      return { href, cls: "sidebar-link sidebar-link-active", active: true };
    }
    if (!caseId && href === "#") {
      return { href: "#", cls: "sidebar-link sidebar-link-disabled", active: false };
    }
    return { href, cls: "sidebar-link", active: false };
  };

  const dashState = getLinkState("case-manager.html", dashHref);
  const overviewState = getLinkState("case-dashboard.html", overviewHref);
  const txState = getLinkState(["transactions.html", "transactions_new.html"], txHref);
  const noticeState = getLinkState("notice-generator.html", noticeHref);
  const spendState = getLinkState("spend-analysis.html", spendHref);
  const cryptoState = getLinkState("crypto.html", cryptoHref);
  const muleState = getLinkState("mule.html", muleHref);
  const fundState = getLinkState("fund-flow.html", fundHref);
  const archivesState = getLinkState("archives.html", archivesHref);

  const iconAttrs = (active) =>
    active ? ' style="font-variation-settings: \'FILL\' 1"' : "";

  const link = (id, state, icon, label) => `
    <a id="${id}" class="${state.cls}" href="${state.href}">
      <span class="material-symbols-outlined"${iconAttrs(state.active)}>${icon}</span>
      <span class="text-sm font-medium">${label}</span>
    </a>`;

  mount.classList.add("app-sidebar");
  if (!mount.id) mount.id = "app-sidebar";

  mount.innerHTML = `
    <div class="p-6 flex items-center gap-3 shrink-0">
      <div class="w-8 h-8 rounded bg-[#0A4F44] flex items-center justify-center shrink-0 text-white">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white"/>
          <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="flex flex-col min-w-0">
        <span class="font-bold text-[16px] leading-tight text-gray-900">Finexis OS</span>
        <span class="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Intelligence</span>
      </div>
    </div>

    <div class="flex-1 px-3 py-4 overflow-y-auto flex flex-col gap-[2px] sidebar-nav-container">
      ${link("sidebar-dashboard-link", dashState, "dashboard", "Dashboard")}
      ${link("sidebar-overview-link", overviewState, "analytics", "Overview")}
      ${link("sidebar-transactions-link", txState, "payments", "Transactions")}
      ${link("sidebar-notice-link", noticeState, "gavel", "Notice Generator")}
      ${link("sidebar-spend-link", spendState, "shopping_cart", "Spend Analysis")}
      ${link("sidebar-crypto-link", cryptoState, "currency_bitcoin", "Crypto")}
      ${link("sidebar-mule-link", muleState, "person_search", "Mule")}
      ${link("sidebar-fund-flow-link", fundState, "account_tree", "Fund Flow")}

      <div class="sidebar-section-label">System</div>

      <a class="sidebar-link" href="#">
        <span class="material-symbols-outlined">notifications</span>
        <span class="text-sm font-medium">Alerts</span>
      </a>
      <a id="sidebar-archives-link" class="${archivesState.cls}" href="${archivesState.href}">
        <span class="material-symbols-outlined"${iconAttrs(archivesState.active)}>inventory_2</span>
        <span class="text-sm font-medium">Archives</span>
      </a>
      <a class="sidebar-link" href="#">
        <span class="material-symbols-outlined">settings</span>
        <span class="text-sm font-medium">Settings</span>
      </a>
    </div>

    <div class="p-[14px_16px] border-t border-[#e5e7eb] flex items-center gap-3 hover:bg-gray-50 cursor-pointer transition-colors shrink-0">
      <div class="w-8 h-8 rounded-full bg-[#0e6e5e] text-white flex items-center justify-center text-sm font-bold shrink-0">
        AD
      </div>
      <div class="flex flex-col flex-1 min-w-0">
        <span class="text-sm font-semibold text-gray-900 truncate">Admin User</span>
        <span class="text-xs text-gray-500 truncate">admin@finexis.os</span>
      </div>
      <span class="material-symbols-outlined text-gray-400 text-[18px]">unfold_more</span>
    </div>
  `;
}
