import { Activity, CreditCard, Folder, KeyRound, LayoutDashboard } from 'lucide-react';

const RAIL = [
  { icon: LayoutDashboard, active: true },
  { icon: Folder },
  { icon: Activity },
  { icon: KeyRound },
  { icon: CreditCard },
];

/**
 * Static, presentation-only preview of the WebPulse dashboard surface.
 * Mirrors the real layout (Global Insights → live visitors, traffic momentum,
 * referral sources, live activity feed) but is built entirely from marketing
 * components with fixed sample values. It does not import or modify any
 * dashboard component.
 */
export default function DashboardPreview({ children }) {
  return (
    <div className="flex">
      {/* Mini navigation rail (decorative) */}
      <div
        aria-hidden="true"
        className="hidden w-14 shrink-0 flex-col items-center gap-1 border-r border-white/[0.06] bg-white/[0.015] py-4 md:flex"
      >
        <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-b from-violet-500 to-violet-700 text-[11px] font-bold text-white">
          W
        </div>
        {RAIL.map((item, i) => {
          const Icon = item.icon;
          return (
            <span
              key={i}
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                item.active ? 'bg-violet-500/15 text-violet-300' : 'text-slate-600'
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
            </span>
          );
        })}
      </div>

      <div className="min-w-0 flex-1">
        {/* Page header */}
        <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-5 py-4">
          <div>
            <p className="mkt-h4 !text-[0.9375rem] text-slate-100">Global Insights</p>
            <p className="mt-0.5 text-[11px] text-slate-500">All projects · last 30 days</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-300">
            <span className="mkt-live-dot !h-1.5 !w-1.5" aria-hidden="true" />
            Live
          </span>
        </div>

        <div className="space-y-4 p-5">{children}</div>
      </div>
    </div>
  );
}
