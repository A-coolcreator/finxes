interface TablePaginationProps {
  totalItems: number;
  currentPage: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function TablePagination({
  totalItems,
  currentPage,
  rowsPerPage,
  onPageChange,
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const showingFrom = totalItems === 0 ? 0 : indexOfFirstRow + 1;
  const showingTo = Math.min(indexOfLastRow, totalItems);

  const prevLabel = rowsPerPage === 100 ? "Previous 100" : "Previous";
  const nextLabel = rowsPerPage === 100 ? "Next 100" : "Next";

  return (
    <div className="flex flex-col gap-3 border-t border-line bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[12.5px] text-ink-muted">
        Showing {showingFrom} to {showingTo} of {totalItems} entries
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="rounded-md border border-line px-3 py-1.5 text-[12.5px] font-medium text-ink-muted hover:bg-paper transition-colors disabled:opacity-40"
        >
          {prevLabel}
        </button>
        <span className="text-[12.5px] text-ink-faint">
          Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages || totalItems === 0}
          className="rounded-md border border-line px-3 py-1.5 text-[12.5px] font-medium text-ink-muted hover:bg-paper transition-colors disabled:opacity-40"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}

export function paginateRows<T>(rows: T[], currentPage: number, rowsPerPage: number) {
  const start = (currentPage - 1) * rowsPerPage;
  return rows.slice(start, start + rowsPerPage);
}
