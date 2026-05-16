export function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromDatetimeLocalValue(value: string): string {
  return new Date(value).toISOString();
}

export function formatReminder(iso: string): string {
  return new Date(iso).toLocaleString();
}

export function isReminderOverdue(reminder_at?: string | null): boolean {
  if (!reminder_at) return false;
  return new Date(reminder_at) < new Date();
}

export function defaultReminderValue(): string {
  const d = new Date();
  d.setHours(d.getHours() + 1, 0, 0, 0);
  return toDatetimeLocalValue(d.toISOString());
}
