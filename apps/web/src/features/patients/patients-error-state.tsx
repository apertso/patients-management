type PatientsErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function PatientsErrorState({ message, onRetry }: PatientsErrorStateProps) {
  return (
    <section className="rounded-xl border border-error/20 bg-error/10 px-6 py-8 shadow-sm">
      <h2 className="text-lg font-semibold text-error">Unable to load patients</h2>
      <p className="mt-2 text-sm leading-6 text-error">{message}</p>
      <button
        className="mt-5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:ring-offset-2 focus:ring-offset-background"
        type="button"
        onClick={onRetry}
      >
        Try again
      </button>
    </section>
  );
}
