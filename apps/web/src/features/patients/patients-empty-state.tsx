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
    <section className="rounded-lg border border-border bg-background px-6 py-12 text-center shadow-sm">
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
          className="mt-5 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
          type="button"
          onClick={onClearSearch}
        >
          Clear search
        </button>
      ) : canCreate ? (
        <button
          className="mt-5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
          type="button"
          onClick={onCreatePatient}
        >
          Create patient
        </button>
      ) : null}
    </section>
  );
}
