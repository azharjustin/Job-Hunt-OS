export function generateId(): string {
  return crypto.randomUUID();
}

export function now(): string {
  return new Date().toISOString();
}

export function formatDate(dateStr: string | undefined | null, options?: Intl.DateTimeFormatOptions): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function formatSalary(min?: number, max?: number, currency?: string): string {
  if (!min && !max) return '—';
  const fmt = (n: number) => {
    if (currency === 'INR' && n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(n);
  };
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

export function daysUntil(dateStr: string | undefined | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

export function deadlineLabel(days: number | null): { label: string; color: string } {
  if (days === null) return { label: '', color: '' };
  if (days < 0) return { label: 'Overdue', color: 'text-red-400' };
  if (days === 0) return { label: 'Due Today', color: 'text-orange-400' };
  if (days <= 2) return { label: `Due in ${days}d`, color: 'text-amber-400' };
  return { label: `${days}d left`, color: 'text-slate-400' };
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
