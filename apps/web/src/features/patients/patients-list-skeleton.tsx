const DESKTOP_ROWS = ['row-1', 'row-2', 'row-3', 'row-4', 'row-5'];
const MOBILE_CARDS = ['card-1', 'card-2', 'card-3'];

export function PatientsListSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading patients" aria-live="polite">
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px_160px_120px]">
          <div className="space-y-2">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-10 animate-pulse rounded-md bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            <div className="h-10 animate-pulse rounded-md bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-10 animate-pulse rounded-md bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-10 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-sm md:block">
        <div className="grid grid-cols-6 gap-4 border-b border-border bg-muted/70 px-4 py-3">
          <div className="h-4 animate-pulse rounded bg-muted" />
          <div className="h-4 animate-pulse rounded bg-muted" />
          <div className="h-4 animate-pulse rounded bg-muted" />
          <div className="h-4 animate-pulse rounded bg-muted" />
          <div className="h-4 animate-pulse rounded bg-muted" />
          <div className="h-4 animate-pulse rounded bg-muted" />
        </div>
        <div className="divide-y divide-border">
          {DESKTOP_ROWS.map((row) => (
            <div key={row} className="grid grid-cols-6 gap-4 px-4 py-4">
              <div className="space-y-2">
                <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-4 animate-pulse rounded bg-muted" />
              <div className="h-4 animate-pulse rounded bg-muted" />
              <div className="h-4 animate-pulse rounded bg-muted" />
              <div className="h-4 animate-pulse rounded bg-muted" />
              <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {MOBILE_CARDS.map((card) => (
          <div key={card} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="h-5 w-40 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-4 w-56 max-w-full animate-pulse rounded bg-muted" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="h-12 animate-pulse rounded bg-muted" />
              <div className="h-12 animate-pulse rounded bg-muted" />
            </div>
            <div className="mt-4 h-9 w-28 animate-pulse rounded-md bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
