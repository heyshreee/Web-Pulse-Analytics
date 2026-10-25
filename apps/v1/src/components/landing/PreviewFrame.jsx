
/**
 * Presentation-only browser frame used for marketing product previews.
 * Purely decorative chrome — it never renders a real iframe or touches the
 * dashboard application.
 */
export default function PreviewFrame({ title = 'WebPulse', note = 'Illustrative sample data', children, className = '' }) {
  return (
    <div className={`mkt-panel ${className}`.trim()}>
      <div className="flex items-center gap-3 border-b border-white/[0.07] bg-white/[0.02] px-4 py-3">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-xs font-medium text-slate-400">{title}</span>
        </div>
        {note && (
          <span className="ml-auto hidden shrink-0 items-center rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 sm:inline-flex">
            {note}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
