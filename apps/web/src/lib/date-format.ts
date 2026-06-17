const dateFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

function toValidDate(value: string): Date | null {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: string): string {
  const date = toValidDate(value);

  return date ? dateFormatter.format(date) : '—';
}

export function formatDateTime(value: string): string {
  const date = toValidDate(value);

  return date ? dateTimeFormatter.format(date) : '—';
}
