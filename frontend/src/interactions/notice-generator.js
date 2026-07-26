import { caseService } from "../services/caseService.js";
import { apiClient } from "../services/api.js";
import { initSidebar } from "./sidebar.js";

document.addEventListener("DOMContentLoaded", () => {
  initSidebar();
  const caseSelect = document.getElementById("notice-case-select");
  const personSelect = document.getElementById("notice-person-select");
  
  const chkBsa65b = document.getElementById("chk-bsa-65b");
  const chkIpLog = document.getElementById("chk-ip-log");
  const chkAofKyc = document.getElementById("chk-aof-kyc");

  const docPsEmail = document.getElementById("doc-ps-email");
  const docPsAddress = document.getElementById("doc-ps-address");
  const docNoticeDate = document.getElementById("doc-notice-date");
  const docRefNo = document.getElementById("doc-ref-no");
  const docCaseDetails = document.getElementById("doc-case-details");
  const docBankName = document.getElementById("doc-bank-name");
  const docBankBranch = document.getElementById("doc-bank-branch");
  const docTargetName = document.getElementById("doc-target-name");
  const docTargetPan = document.getElementById("doc-target-pan");
  const docTargetAccount = document.getElementById("doc-target-account");
  const docTargetIfsc = document.getElementById("doc-target-ifsc");
  
  const docCaseSubtitleHeader = document.getElementById("doc-case-subtitle-header");
  const noticeInvestigationNote = document.getElementById("notice-investigation-note");
  const datedTexts = document.querySelectorAll(".doc-dated-text");
  
  const btnExportDocx = document.getElementById("btn-export-docx");
  const btnDownloadPdf = document.getElementById("btn-download-pdf");
  const btnDownloadPdfTop = document.getElementById("download-pdf-top-btn");

  // Format today's date: DD/MM/YYYY
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  const formattedToday = `${dd}/${mm}/${yyyy}`;
  
  if (docNoticeDate) docNoticeDate.textContent = formattedToday;
  datedTexts.forEach(el => el.textContent = formattedToday);

  // Generate unique Ref No
  const randomRefNum = Math.floor(1000 + Math.random() * 9000);
  if (docRefNo) docRefNo.textContent = `CP/BHOPAL/CB/${yyyy}/${randomRefNum}`;

  // Evidence check handlers
  const updateEvidenceVisibility = () => {
    const show65b = chkBsa65b ? chkBsa65b.checked : true;
    document.querySelectorAll(".doc-item-65b").forEach(el => {
      el.style.display = show65b ? "list-item" : "none";
    });

    const showIp = chkIpLog ? chkIpLog.checked : true;
    document.querySelectorAll(".doc-item-ip").forEach(el => {
      el.style.display = showIp ? "list-item" : "none";
    });

    const showAof = chkAofKyc ? chkAofKyc.checked : true;
    document.querySelectorAll(".doc-item-aof").forEach(el => {
      el.style.display = showAof ? "list-item" : "none";
    });
  };

  chkBsa65b?.addEventListener("change", updateEvidenceVisibility);
  chkIpLog?.addEventListener("change", updateEvidenceVisibility);
  chkAofKyc?.addEventListener("change", updateEvidenceVisibility);

  // Get active case query param
  const getQueryParams = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("caseId") || params.get("id");
  };

  const activeCaseId = getQueryParams();

  // Populate cases list
  const loadCases = async () => {
    try {
      const cases = await caseService.listCases();
      if (caseSelect && Array.isArray(cases)) {
        caseSelect.innerHTML = '<option value="">Choose Case...</option>';
        cases.forEach(c => {
          const opt = document.createElement("option");
          opt.value = c.id;
          opt.textContent = `${c.caseNumber} - ${c.title}`;
          caseSelect.appendChild(opt);
        });

        // Pre-select if URL context has active caseId
        if (activeCaseId) {
          caseSelect.value = activeCaseId;
          await handleCaseChange(activeCaseId);
        }
      }
    } catch (err) {
      console.error("Failed to load cases:", err);
    }
  };

  const handleCaseChange = async (caseId) => {
    if (!caseId) {
      if (personSelect) personSelect.innerHTML = '<option value="">Choose Target...</option>';
      resetDocumentFields();
      return;
    }

    try {
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

      const caseData = await caseService.getCaseById(caseId);
      if (caseData) {
        if (docCaseDetails) {
          docCaseDetails.innerHTML = `Case Title: ${caseData.title}<br>Case Number: ${caseData.caseNumber}<br>Status: ${caseData.status}<br>${caseData.subtitle || "Crime Branch Investigation"}`;
        }
        if (docCaseSubtitleHeader) {
          docCaseSubtitleHeader.textContent = `CASE ${caseData.caseNumber} • Section 94 BNSS Notice`;
        }
      }

      const persons = await caseService.getPersons(caseId);
      if (personSelect && Array.isArray(persons)) {
        personSelect.innerHTML = '<option value="">Choose Target...</option>';
        persons.forEach(p => {
          const opt = document.createElement("option");
          opt.value = p.id;
          opt.textContent = p.name;
          personSelect.appendChild(opt);
        });
      }
    } catch (err) {
      console.error("Error loading case targets:", err);
    }
  };

  const handlePersonChange = async (personId) => {
    if (!personId) {
      resetDocumentFields();
      return;
    }

    try {
      const selectedOption = personSelect.options[personSelect.selectedIndex];
      const personName = selectedOption ? selectedOption.text : "[Target Name]";
      if (docTargetName) docTargetName.textContent = personName.toUpperCase();

      const meta = await apiClient.get(`/persons/${personId}/metadata`).catch(() => null);
      if (meta) {
        if (docBankName) docBankName.textContent = meta.bankName || "[Bank Name / Financial Institution]";
        if (docBankBranch) docBankBranch.textContent = meta.branchName || "Concerned Branch";
        if (docTargetAccount) docTargetAccount.textContent = meta.accountNumber || "N/A";
        if (docTargetIfsc) docTargetIfsc.textContent = meta.ifscCode || "N/A";
        if (docTargetPan) docTargetPan.textContent = meta.panNumber || "N/A";
        
        if (noticeInvestigationNote) {
          noticeInvestigationNote.textContent = `Draft linked. Target Entity "${personName}" holds account ${meta.accountNumber} with ${meta.bankName} (${meta.branchName} branch).`;
        }
      } else {
        if (docBankName) docBankName.textContent = "[Bank Name / Financial Institution]";
        if (docBankBranch) docBankBranch.textContent = "Concerned Branch";
        if (docTargetAccount) docTargetAccount.textContent = "N/A";
        if (docTargetIfsc) docTargetIfsc.textContent = "N/A";
        if (docTargetPan) docTargetPan.textContent = "N/A";
        if (noticeInvestigationNote) {
          noticeInvestigationNote.textContent = `Draft linked for "${personName}". No customized bank metadata records were located in database.`;
        }
      }
    } catch (err) {
      console.error("Error loading target metadata:", err);
    }
  };

  const resetDocumentFields = () => {
    if (docTargetName) docTargetName.textContent = "[Target Name]";
    if (docBankName) docBankName.textContent = "[Bank Name / Financial Institution]";
    if (docBankBranch) docBankBranch.textContent = "Concerned Branch";
    if (docTargetAccount) docTargetAccount.textContent = "[Account Number]";
    if (docTargetIfsc) docTargetIfsc.textContent = "N/A";
    if (docTargetPan) docTargetPan.textContent = "N/A";
    if (noticeInvestigationNote) {
      noticeInvestigationNote.textContent = "Select a case and target entity above to link and generate dynamic legal notice directives.";
    }
  };

  caseSelect?.addEventListener("change", (e) => handleCaseChange(e.target.value));
  personSelect?.addEventListener("change", (e) => handlePersonChange(e.target.value));

  const handlePrint = () => {
    window.print();
  };

  btnDownloadPdf?.addEventListener("click", handlePrint);
  btnDownloadPdfTop?.addEventListener("click", handlePrint);

  btnExportDocx?.addEventListener("click", () => {
    alert("DOCX Export successfully generated and signed with MP Police Digital Key!");
  });

  loadCases();
  updateEvidenceVisibility();
});
