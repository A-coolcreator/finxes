import { caseService } from "../services/caseService.js";

export function attachCaseManagerInteractions() {
  const init = () => {
    const createCaseBtn = document.getElementById("create-case-btn");
    const modal = document.getElementById("create-case-modal");
    const form = document.getElementById("create-case-form");
    const cancelBtn = document.getElementById("create-case-cancel");
    const closeBtn = document.getElementById("create-case-close");
    const tableBody = document.getElementById("case-table-body");
    const searchInput = document.getElementById("case-search");
    const statusFilter = document.getElementById("status-filter");
    const dateFilter = document.getElementById("date-filter");
    let activeRowActionMenu = null;
    let activeRowActionTarget = null;
    let allActiveCases = [];
    let allCases = [];

    const openModal = () => {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
      document.body.classList.add("overflow-hidden");
      document.getElementById("case-number")?.focus();
    };

    const closeModal = () => {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      document.body.classList.remove("overflow-hidden");
      form.reset();
      document.getElementById("case-status").value = "ACTIVE";
    };

    const closeRowActionMenu = () => {
      activeRowActionMenu?.remove();
      activeRowActionMenu = null;
      activeRowActionTarget = null;
    };

    const formatUpdatedDate = (date) => {
      const day = String(date.getDate()).padStart(2, "0");
      const month = date.toLocaleString("en-GB", { month: "short" });
      const year = date.getFullYear();
      const time = date.toLocaleTimeString("en-GB", {
        hour: "numeric",
        minute: "2-digit",
      });
      return `${day} ${month} ${year}, ${time}`;
    };

    const statusMeta = {
      CRITICAL: {
        badgeClass: "bg-status-critical text-white",
        triggerClass: "bg-status-critical/10 text-status-critical",
      },
      ACTIVE: {
        badgeClass: "bg-primary text-white",
        triggerClass: "bg-primary/10 text-primary",
      },
      CLOSED: {
        badgeClass: "border border-status-success text-status-success",
        triggerClass: "bg-status-success/10 text-status-success",
      },
      ARCHIVED: {
        badgeClass: "border border-border-subtle text-secondary bg-surface-container-low",
        triggerClass: "bg-secondary/10 text-secondary",
      },
    };

    const formatCreatedDate = (date) => {
      const day = String(date.getDate()).padStart(2, "0");
      const month = date.toLocaleString("en-GB", { month: "short" });
      const year = date.getFullYear();
      const time = date.toLocaleTimeString("en-GB", {
        hour: "numeric",
        minute: "2-digit",
      });
      return `${day} ${month} ${year}, ${time}`;
    };

    const createTableRow = ({ caseId, caseNumber, title, subtitle, status, triggerCount, createdAt }) => {
      const meta = statusMeta[status] || statusMeta.ACTIVE;
      const row = document.createElement("tr");
      if (caseId) {
        row.dataset.caseId = caseId;
      }
      row.dataset.state = status;
      row.className = "group case-row-tile";

      row.innerHTML = `
        <td class="px-6 py-4 font-label-md text-label-md text-primary">${caseNumber}</td>
        <td class="px-6 py-4">
          <div class="font-bold text-on-surface">${title}</div>
          ${subtitle ? `<div class="text-body-sm text-secondary">${subtitle}</div>` : ""}
        </td>
        <td class="px-6 py-4">
          <span class="px-2 py-1 ${meta.badgeClass} text-[10px] font-bold rounded-sm uppercase">${status}</span>
        </td>
        <td class="px-6 py-4 text-center">
          <span class="inline-flex items-center justify-center w-6 h-6 rounded ${meta.triggerClass} font-bold text-[11px]">${String(triggerCount || 0).padStart(2, "0")}</span>
        </td>
        <td class="px-6 py-4 text-body-sm text-secondary">${createdAt}</td>
        <td class="px-6 py-4">
          <button type="button" class="material-symbols-outlined text-secondary opacity-0 group-hover:opacity-100 transition-opacity js-row-actions" aria-label="Row actions">more_vert</button>
        </td>
      `;

      row.addEventListener("click", () => {
        row.classList.add("bg-primary/5");
        setTimeout(() => row.classList.remove("bg-primary/5"), 200);
      });

      return row;
    };

    const renderRows = (cases) => {
      if (!tableBody) return;
      tableBody.innerHTML = "";

      cases.forEach((item) => {
        const formattedDate = item.createdAt
          ? formatCreatedDate(new Date(item.createdAt))
          : formatCreatedDate(new Date());

        const row = createTableRow({
          caseId: item.id,
          caseNumber: item.caseNumber,
          title: item.title,
          subtitle: item.subtitle,
          status: item.status,
          triggerCount: item.triggerCount,
          createdAt: formattedDate,
        });
        tableBody.appendChild(row);
      });
    };

    const applyFilters = () => {
      const searchQuery = searchInput?.value.toLowerCase().trim() || "";
      const statusValue = statusFilter?.value || "ALL";
      const dateValue = dateFilter?.value || "ALL";

      let filtered = [...allActiveCases];

      // 1. Status Filter
      if (statusValue !== "ALL") {
        filtered = filtered.filter((item) => item.status?.toUpperCase() === statusValue);
      }

      // 2. Date Filter
      if (dateValue !== "ALL") {
        const now = new Date();
        filtered = filtered.filter((item) => {
          if (!item.createdAt) return false;
          const date = new Date(item.createdAt);
          const diffMs = now - date;
          const diffDays = diffMs / (1000 * 60 * 60 * 24);

          if (dateValue === "24H") {
            return diffDays <= 1;
          } else if (dateValue === "7D") {
            return diffDays <= 7;
          } else if (dateValue === "30D") {
            return diffDays <= 30;
          } else if (dateValue === "6M") {
            return diffDays <= 180;
          } else if (dateValue === "1Y") {
            return diffDays <= 365;
          }
          return true;
        });
      }

      // 3. Search Query Filter
      if (searchQuery !== "") {
        filtered = filtered.filter((item) => {
          const title = (item.title || "").toLowerCase();
          const subtitle = (item.subtitle || "").toLowerCase();
          const caseNo = (item.caseNumber || "").toLowerCase();
          return title.includes(searchQuery) || subtitle.includes(searchQuery) || caseNo.includes(searchQuery);
        });
      }

      // Update DOM statistics
      const totalCount = allCases.length;
      const activeCount = allCases.filter(c => c.status === "ACTIVE" || c.status === "CRITICAL").length;
      const archiveCount = allCases.filter(c => c.status === "ARCHIVED").length;

      const totalEl = document.getElementById("stat-total-cases");
      const activeEl = document.getElementById("stat-active-cases");
      const archiveEl = document.getElementById("stat-archive-cases");
      if (totalEl) totalEl.textContent = totalCount.toLocaleString();
      if (activeEl) activeEl.textContent = activeCount.toLocaleString();
      if (archiveEl) archiveEl.textContent = archiveCount.toLocaleString();

      // Update showing count
      const showingCountEl = document.getElementById("table-showing-count");
      if (showingCountEl) {
        showingCountEl.innerHTML = `Showing <span class="text-on-surface font-bold">${filtered.length}</span> investigations`;
      }

      // Update pagination text
      const paginationTextEl = document.getElementById("pagination-text");
      if (paginationTextEl) {
        paginationTextEl.textContent = `Page 1 of 1`;
      }

      renderRows(filtered);
    };

    const loadCases = async () => {
      try {
        const cases = await caseService.listCases();
        allCases = cases;
        allActiveCases = cases.filter((item) => item.status !== "ARCHIVED");
        applyFilters();
      } catch (error) {
        console.error("Unable to load cases:", error);
      }
    };

    const archiveRow = async (row) => {
      await caseService.archiveCase(row.dataset.caseId || row.children[0]?.textContent?.trim());
      await loadCases();
    };

    const unarchiveRow = async (row) => {
      await caseService.unarchiveCase(row.dataset.caseId || row.children[0]?.textContent?.trim());
      await loadCases();
    };

    const openRowActionMenu = (button, row) => {
      closeRowActionMenu();

      const isArchived = row.dataset.state === "ARCHIVED";

      const buttonRect = button.getBoundingClientRect();
      const menu = document.createElement("div");
      menu.className =
        "fixed z-[200] min-w-48 rounded-xl border border-border-subtle bg-surface-container-lowest shadow-2xl overflow-hidden flex flex-col";
      menu.style.top = `${Math.min(buttonRect.bottom + 8, window.innerHeight - 150)}px`;
      menu.style.left = `${Math.max(12, buttonRect.right - 180)}px`;

      menu.innerHTML = `
        <button type="button" class="w-full flex items-center gap-3 px-4 py-3 text-left text-body-sm font-bold text-secondary hover:bg-surface-container transition-colors js-archive-row">
          <span class="material-symbols-outlined text-[18px]">${isArchived ? "unarchive" : "archive"}</span>
          <span>${isArchived ? "Unarchive" : "Move to Archive"}</span>
        </button>
        <button type="button" class="w-full flex items-center gap-3 px-4 py-3 text-left text-body-sm font-bold text-status-critical hover:bg-status-critical/10 transition-colors js-delete-row border-t border-border-subtle">
          <span class="material-symbols-outlined text-[18px] text-status-critical">delete</span>
          <span>Delete Case</span>
        </button>
      `;

      menu.addEventListener("click", (event) => event.stopPropagation());
      
      menu.querySelector(".js-archive-row")?.addEventListener("click", async () => {
        if (isArchived) {
          await unarchiveRow(row);
        } else {
          await archiveRow(row);
        }
        closeRowActionMenu();
      });

      menu.querySelector(".js-delete-row")?.addEventListener("click", () => {
        const caseId = row.dataset.caseId || row.children[0]?.textContent?.trim();
        const caseNo = row.children[0]?.textContent?.trim() || caseId;
        const caseTitle = row.children[1]?.querySelector(".font-bold")?.textContent?.trim() || "";

        activeDeleteCaseId = caseId;
        activeDeleteRowEl = row;

        if (deleteModalDesc) {
          deleteModalDesc.innerHTML = `Are you sure you want to permanently delete case <strong>"${caseNo}" (${caseTitle})</strong>? All associated targets, statements, and transaction records will be permanently removed. This action cannot be undone.`;
        }

        closeRowActionMenu();
        deleteModal?.classList.remove("hidden");
        deleteModal?.classList.add("flex");
      });

      document.body.appendChild(menu);
      activeRowActionMenu = menu;
      activeRowActionTarget = row;
    };

    createCaseBtn?.addEventListener("click", openModal);
    cancelBtn?.addEventListener("click", closeModal);
    closeBtn?.addEventListener("click", closeModal);

    modal?.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.classList.contains("hidden")) {
        closeModal();
      }

      if (event.key === "Escape") {
        closeRowActionMenu();
      }
    });

    document.addEventListener("click", (event) => {
      if (!activeRowActionMenu) {
        return;
      }

      if (
        activeRowActionMenu.contains(event.target) ||
        activeRowActionTarget?.contains(event.target)
      ) {
        return;
      }

      closeRowActionMenu();
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

    // UI elements for loading and success feedbacks
    const loadingOverlay = document.getElementById("parsing-loading-overlay");
    const loadingStatusText = document.getElementById("loading-status-text");
    const loadingProgressBar = document.getElementById("loading-progress-bar");
    const loadingProgressPercent = document.getElementById("loading-progress-percent");

    const successModal = document.getElementById("parsing-success-modal");
    const successModalDesc = document.getElementById("success-modal-description");
    const successModalOkBtn = document.getElementById("success-modal-ok-btn");

    successModalOkBtn?.addEventListener("click", () => {
      successModal.classList.add("hidden");
      successModal.classList.remove("flex");
    });

    // UI elements for delete confirmation
    const deleteModal = document.getElementById("delete-case-modal");
    const deleteModalDesc = document.getElementById("delete-case-modal-desc");
    const deleteModalCancel = document.getElementById("delete-case-cancel-btn");
    const deleteModalConfirm = document.getElementById("delete-case-confirm-btn");

    let activeDeleteCaseId = null;
    let activeDeleteRowEl = null;

    const closeDeleteModal = () => {
      deleteModal?.classList.add("hidden");
      deleteModal?.classList.remove("flex");
      activeDeleteCaseId = null;
      activeDeleteRowEl = null;
    };

    deleteModalCancel?.addEventListener("click", closeDeleteModal);

    deleteModalConfirm?.addEventListener("click", async () => {
      if (!activeDeleteCaseId || !activeDeleteRowEl) return;

      const originalText = deleteModalConfirm.innerText;
      deleteModalConfirm.disabled = true;
      deleteModalConfirm.innerText = "Deleting...";

      try {
        await caseService.deleteCase(activeDeleteCaseId);
        closeDeleteModal();
        await loadCases();
      } catch (err) {
        console.error(err);
        alert("Failed to delete case: " + err.message);
      } finally {
        deleteModalConfirm.disabled = false;
        deleteModalConfirm.innerText = originalText;
      }
    });

      const addSuspectBtn = document.getElementById("add-suspect-btn");
      const suspectsContainer = document.getElementById("suspects-container");

      if (addSuspectBtn && suspectsContainer) {
        addSuspectBtn.addEventListener("click", () => {
          const count = suspectsContainer.querySelectorAll(".suspect-entry").length + 1;
          const entry = document.createElement("div");
          entry.className = "suspect-entry flex flex-col gap-3 p-4 rounded-lg border border-border-subtle bg-surface-container-lowest";
          entry.innerHTML = `
            <div class="flex justify-between items-center">
              <span class="text-label-sm font-bold uppercase tracking-widest text-secondary suspect-number">Suspect ${count}</span>
              <button type="button" class="remove-suspect-btn text-status-critical hover:text-red-700 transition-colors">
                <span class="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
            <input type="text" name="suspectName" required placeholder="Suspect Name (e.g. Lakshit Verma)" class="h-10 px-3 rounded-lg border border-border-subtle bg-surface text-on-surface text-sm focus:outline-none focus:border-primary" />
            <input type="file" name="suspectFiles" multiple accept=".pdf" class="px-3 py-2 text-sm rounded-lg border border-border-subtle bg-surface text-on-surface focus:outline-none focus:border-primary" />
          `;
          
          entry.querySelector(".remove-suspect-btn").addEventListener("click", () => {
            entry.remove();
            // Re-number suspects
            const remaining = suspectsContainer.querySelectorAll(".suspect-entry");
            remaining.forEach((el, idx) => {
              el.querySelector(".suspect-number").textContent = `Suspect ${idx + 1}`;
            });
          });
          
          suspectsContainer.appendChild(entry);
        });
      }

      form?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const caseNumber = document.getElementById("case-number").value.trim();
      const title = document.getElementById("case-title").value.trim();
      const subtitle = document.getElementById("case-subtitle").value.trim();
      const status = document.getElementById("case-status").value;

      if (!caseNumber || !title || !status) {
        return;
      }

      // Read files BEFORE closing the modal (form.reset() inside closeModal clears file inputs!)
      const base64Files = [];
      try {
        const suspectEntries = document.querySelectorAll(".suspect-entry");
        for (const entry of suspectEntries) {
          const sName = entry.querySelector('input[name="suspectName"]')?.value.trim();
          const sFilesInput = entry.querySelector('input[name="suspectFiles"]');
          if (sName && sFilesInput && sFilesInput.files.length > 0) {
            const filePromises = Array.from(sFilesInput.files).map(async (file) => {
              const res = await readFileAsBase64(file);
              res.personName = sName;
              return res;
            });
            const results = await Promise.all(filePromises);
            base64Files.push(...results);
          }
        }
      } catch (readErr) {
        console.error("Failed to read PDF files:", readErr);
      }

      // Hide Case modal AFTER reading files (form.reset() clears file inputs)
      closeModal();
      loadingOverlay.classList.remove("hidden");
      loadingOverlay.classList.add("flex");

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
            stepText = "Persisting statements into local SQLite database...";
          }
          updateLocalProgress(nextVal, stepText);
        }
      }, 250);

      try {
        const createdCase = await caseService.createCase({
          caseNumber,
          title,
          subtitle,
          status,
          files: base64Files,
        });

        clearInterval(progressInterval);
        updateLocalProgress(100, "Database sync complete!");

        const createdAt = createdCase.createdAt
          ? formatCreatedDate(new Date(createdCase.createdAt))
          : formatCreatedDate(new Date());
        
        const newRow = createTableRow({
          caseId: createdCase.id || createdCase.caseNumber || caseNumber,
          caseNumber: createdCase.caseNumber || caseNumber,
          title: createdCase.title || title,
          subtitle: createdCase.subtitle || subtitle,
          status: (createdCase.status || status).toUpperCase(),
          triggerCount: createdCase.triggerCount || 0,
          createdAt,
        });

        tableBody?.prepend(newRow);

        // Transition Loading Overlay to Success popup modal
        await new Promise(resolve => setTimeout(resolve, 400));
        loadingOverlay.classList.add("hidden");
        loadingOverlay.classList.remove("flex");

        if (successModalDesc) {
          successModalDesc.innerText = `Case was successfully created! Automatically analyzed and resolved your statements. Saved ${createdCase.triggerCount || 0} transaction logs to your local database.`;
        }
        successModal.classList.remove("hidden");
        successModal.classList.add("flex");

      } catch (error) {
        clearInterval(progressInterval);
        loadingOverlay.classList.add("hidden");
        loadingOverlay.classList.remove("flex");
        console.error(error);
        alert("Unable to create the case right now: " + error.message);
      }
    });

    setInterval(() => {
      const badges = document.querySelectorAll(".bg-status-critical");
      badges.forEach((badge) => {
        badge.classList.add("ring-2", "ring-status-critical/50");
        setTimeout(
          () => badge.classList.remove("ring-2", "ring-status-critical/50"),
          1000,
        );
      });
    }, 3000);

    tableBody?.addEventListener("click", (event) => {
      const actionButton = event.target.closest("button");
      if (!actionButton) {
        const row = event.target.closest("tr");
        if (row) {
          const caseId = row.dataset.caseId || row.children[0]?.textContent?.trim();
          if (caseId) {
            window.location.href = `case-dashboard.html?id=${caseId}`;
          }
        }
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const row = actionButton.closest("tr");
      if (!row) {
        return;
      }

      openRowActionMenu(actionButton, row);
    });

    searchInput?.addEventListener("input", applyFilters);
    statusFilter?.addEventListener("change", applyFilters);
    dateFilter?.addEventListener("change", applyFilters);

    loadCases();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
    return;
  }

  init();
}
