function Pagination({ page, totalPages, onChange, label }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label={label}>
      <button type="button" onClick={() => onChange(1)} disabled={page === 1} aria-label="Go to first page">
        «
      </button>
      <button type="button" onClick={() => onChange(page - 1)} disabled={page === 1} aria-label="Go to previous page">
        ‹
      </button>
      <span>{page} / {totalPages}</span>
      <button type="button" onClick={() => onChange(page + 1)} disabled={page >= totalPages} aria-label="Go to next page">
        ›
      </button>
      <button type="button" onClick={() => onChange(totalPages)} disabled={page >= totalPages} aria-label="Go to last page">
        »
      </button>
    </nav>
  );
}

export default Pagination;
