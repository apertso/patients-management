type PatientsErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function PatientsErrorState({ message, onRetry }: PatientsErrorStateProps) {
  return (
    <section className="rounded-lg border border-red-200 bg-red-50 px-6 py-8 shadow-sm">
      <h2 className="text-lg font-semibold text-red-900">Unable to load patients</h2>
      <p className="mt-2 text-sm leading-6 text-red-800">{message}</p>
      <button
        className="mt-5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
        type="button"
        onClick={onRetry}
      >
        Try again
      </button>
    </section>
  );
}
