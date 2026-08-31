interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  showPageSize?: boolean;
  pageSizeLabel?: string;
}

function getPageNumbers(currentPage: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i);
  const pages: (number | "…")[] = [0];
  const start = Math.max(1, currentPage - 1);
  const end = Math.min(totalPages - 2, currentPage + 1);
  if (start > 1) pages.push("…");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 2) pages.push("…");
  pages.push(totalPages - 1);
  return pages;
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  pageSize = 10,
  onPageSizeChange,
  showPageSize = false,
  pageSizeLabel = "Elementos por página",
}: PaginationProps) {
  if (totalPages <= 1 && !showPageSize) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <div className="pagination">
      <div className="pagination-pages">
        <button
          className="page-btn"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          aria-label="Página anterior"
        >
          ←
        </button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`e-${i}`} className="page-ellipsis">
              …
            </span>
          ) : (
            <button
              key={p}
              className={`page-btn ${p === page ? "page-btn--active" : ""}`}
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
            >
              {p + 1}
            </button>
          )
        )}
        <button
          className="page-btn"
          onClick={() => onPageChange(page + 1)}
          disabled={page + 1 >= totalPages}
          aria-label="Página siguiente"
        >
          →
        </button>
      </div>

      {showPageSize && onPageSizeChange && (
        <div className="page-size">
          <label htmlFor="page-size">{pageSizeLabel}</label>
          <select id="page-size" value={pageSize} onChange={e => onPageSizeChange(Number(e.target.value))}>
            {[5, 10, 15, 20].map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
