import { caseService } from "../services/caseService.js";

export function attachArchivesPageInteractions() {
  const init = () => {
    const tableBody = document.getElementById("archives-table-body");
    const emptyRow = document.getElementById("archives-empty-row");
    const archivedCountEl = document.getElementById("archived-case-count");
    const restorableCountEl = document.getElementById("restorable-count");
    const latestArchiveLabel = document.getElementById("latest-archive-label");
    const searchInput = document.getElementById("archive-search");
    let archivedCases = [];

    const formatArchiveDate = (value) => {
      if (!value) return "-";
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(value));
    };

    const renderRows = (cases) => {
      tableBody.querySelectorAll("tr[data-archive-row]").forEach((row) => row.remove());

      if (!cases.length) {
        emptyRow?.classList.remove("hidden");
        archivedCountEl.textContent = "0";
        restorableCountEl.textContent = "0";
        latestArchiveLabel.textContent = "No archived cases";
        return;
      }

      emptyRow?.classList.add("hidden");
      archivedCountEl.textContent = String(cases.length);
      restorableCountEl.textContent = String(cases.length);
      latestArchiveLabel.textContent = formatArchiveDate(cases[0].archivedAt || cases[0].updatedAt);

      const fragment = document.createDocumentFragment();
      cases.forEach((item) => {
        const row = document.createElement("tr");
        row.dataset.archiveRow = "true";
        row.className = "hover:bg-surface-container-lowest transition-colors group bg-surface-muted";
        row.innerHTML = `
          <td class="px-6 py-4 font-label-md text-label-md text-primary">${item.caseNumber}</td>
          <td class="px-6 py-4">
            <div class="font-bold text-on-surface">${item.title}</div>
            ${item.subtitle ? `<div class="text-body-sm text-secondary">${item.subtitle}</div>` : ""}
          </td>
          <td class="px-6 py-4 text-body-sm text-secondary">${formatArchiveDate(item.archivedAt || item.updatedAt)}</td>
          <td class="px-6 py-4">
            <span class="px-2 py-1 border border-border-subtle text-secondary bg-surface-container-low text-[10px] font-bold rounded-sm uppercase">Archived</span>
          </td>
          <td class="px-6 py-4 text-right">
            <button type="button" data-case-id="${item.id}" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-bold hover:brightness-110 transition-all active:scale-95 js-unarchive-case">
              <span class="material-symbols-outlined text-[18px]">unarchive</span>
              <span>Unarchive</span>
            </button>
          </td>
        `;
        fragment.appendChild(row);
      });

      tableBody.appendChild(fragment);
    };

    const loadArchives = async () => {
      try {
        archivedCases = await caseService.listArchivedCases();
        renderRows(archivedCases);
      } catch (error) {
        console.error(error);
        latestArchiveLabel.textContent = "Unable to load archived cases";
      }
    };

    tableBody?.addEventListener("click", async (event) => {
      const button = event.target.closest(".js-unarchive-case");
      if (!button) {
        return;
      }

      const caseId = button.dataset.caseId;
      if (!caseId) {
        return;
      }

      button.disabled = true;
      try {
        await caseService.unarchiveCase(caseId);
        await loadArchives();
      } catch (error) {
        console.error(error);
        alert("Unable to unarchive the case right now.");
        button.disabled = false;
      }
    });

    searchInput?.addEventListener("input", () => {
      const query = searchInput.value.trim().toLowerCase();
      if (!query) {
        renderRows(archivedCases);
        return;
      }

      renderRows(
        archivedCases.filter((item) => {
          return (
            item.caseNumber?.toLowerCase().includes(query) ||
            item.title?.toLowerCase().includes(query) ||
            item.subtitle?.toLowerCase().includes(query)
          );
        }),
      );
    });

    loadArchives();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
    return;
  }

  init();
}
