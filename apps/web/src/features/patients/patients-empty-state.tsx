type PatientsEmptyStateProps = {
  hasSearch: boolean;
  canCreate: boolean;
  onClearSearch: () => void;
  onCreatePatient: () => void;
};

export function PatientsEmptyState({
  hasSearch,
  canCreate,
  onClearSearch,
  onCreatePatient,
}: PatientsEmptyStateProps) {
  return (
    <section className="rounded-xl border border-border bg-card px-6 py-12 text-center text-card-foreground shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">
        {hasSearch ? 'No patients found' : 'No patients yet'}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {hasSearch
          ? 'Try adjusting or clearing your search.'
          : 'Patient records will appear here once they are added.'}
      </p>

      {hasSearch ? (
        <button
          className="mt-5 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring/40 focus:ring-offset-2 focus:ring-offset-background"
          type="button"
          onClick={onClearSearch}
        >
          Clear search
        </button>
      ) : canCreate ? (
        <button
          className="mt-5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:ring-offset-2 focus:ring-offset-background"
          type="button"
          onClick={onCreatePatient}
        >
          Create patient
        </button>
      ) : null}
    </section>
  );
}
