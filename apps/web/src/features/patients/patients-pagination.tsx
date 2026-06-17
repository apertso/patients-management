type PatientsPaginationProps = {
  page: number;
  limit: number;
  total: number;
  isFetching: boolean;
  onPageChange: (page: number) => void;
};

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

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground" aria-live="polite">
        Showing {from}-{to} of {total}
      </p>

      <div className="flex items-center gap-2">
        <button
          className="rounded-md border border-border px-3 py-2 font-medium text-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          disabled={page <= 1 || isFetching}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        <span className="min-w-20 text-center text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <button
          className="rounded-md border border-border px-3 py-2 font-medium text-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          disabled={page >= totalPages || isFetching}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
