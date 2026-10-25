/** Shared number/date formatters used by the charts, KPI tiles and tables. */

export function fmtInt(v) {
  return Number(v || 0).toLocaleString('en-US');
}

/** Axis-friendly compact form: 1200 -> 1.2k, 15000 -> 15k, 1_200_000 -> 1.2M. */
export function compact(v) {
  const n = Number(v) || 0;
  if (Math.abs(n) >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(Math.abs(n) >= 10000 ? 0 : 1)}k`;
  return String(n);
}

export function fmtPct(v, digits = 1) {
  return `${(Math.round(Number(v) * 10) / 10).toFixed(digits)}%`;
}

/** Formats a KPI value according to its unit: int | pct | dur. */
export function kpiValue(value, format = 'int') {
  if (value == null || value === '') return '—';
  if (format === 'pct') return fmtPct(value);
  if (format === 'dur') return String(value);
  return fmtInt(value);
}

/** "3 min ago" / "2 h ago" / "just now" */
export function relTime(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const secs = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (secs < 45) return 'just now';
  if (secs < 3600) return `${Math.round(secs / 60)} min ago`;
  if (secs < 86400) return `${Math.round(secs / 3600)} h ago`;
  return `${Math.round(secs / 86400)} d ago`;
}

/** Clock time for timeline rails. */
export function clockTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** "12 Mar 2026, 14:03" */
export function dateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function dateOnly(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Triggers a browser download for generated CSV/JSON exports. */
export function downloadFile(filename, content, mime = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Escapes a value for CSV output. */
export function csvCell(value) {
  const s = value == null ? '' : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows, columns) {
  const head = columns.map((c) => csvCell(c.label)).join(',');
  const body = rows.map((row) => columns.map((c) => csvCell(c.csv ? c.csv(row) : row[c.key])).join(','));
  return [head, ...body].join('\n');
}