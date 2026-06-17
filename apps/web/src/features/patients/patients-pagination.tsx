type PatientsPaginationProps = {
  page: number;
  limit: number;
  total: number;
  isFetching: boolean;
  onPageChange: (page: number) => void;
};

function getVisiblePages(currentPage: number, totalPages: number): number[] {
  const maxVisiblePages = 5;
  const visibleCount = Math.min(maxVisiblePages, totalPages);
  const halfWindow = Math.floor(visibleCount / 2);
  const startPage = Math.min(
    Math.max(1, currentPage - halfWindow),
    Math.max(1, totalPages - visibleCount + 1),
  );

  return Array.from({ length: visibleCount }, (_, index) => startPage + index);
}

export function PatientsPagination({
  page,
  limit,
  total,
  isFetching,
  onPageChange,
}: PatientsPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <div className="flex flex-col gap-3 bg-card px-5 py-4 text-sm text-card-foreground sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground" aria-live="polite">
        Showing {from} to {to} of {total} patients
      </p>

      <div className="flex items-center gap-1">
        <button
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          disabled={page <= 1 || isFetching}
          onClick={() => onPageChange(page - 1)}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        {visiblePages.map((visiblePage) => {
          const isCurrentPage = visiblePage === page;

          return (
            <button
              key={visiblePage}
              className={
                isCurrentPage
                  ? 'flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground'
                  : 'flex h-8 w-8 items-center justify-center rounded-md border border-border text-sm font-medium text-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50'
              }
              type="button"
              disabled={isCurrentPage || isFetching}
              aria-current={isCurrentPage ? 'page' : undefined}
              onClick={() => onPageChange(visiblePage)}
            >
              {visiblePage}
            </button>
          );
        })}
        <button
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          disabled={page >= totalPages || isFetching}
          onClick={() => onPageChange(page + 1)}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}
