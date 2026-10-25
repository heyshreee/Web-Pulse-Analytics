import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PreviewFrame from './PreviewFrame';
import Reveal from '../marketing/Reveal';
import DashboardPreview from './DashboardPreview';
import ChartPreview from './ChartPreview';
import LiveEventStream from './LiveEventStream';
import AnimatedNumber from './AnimatedNumber';
import { SAMPLE_KPIS, SAMPLE_REFERRERS, makeTrafficSeries, TRAFFIC_RANGES } from './sampleData';

function KpiTile({ label, value, accent, decimals = 0, suffix = '' }) {
  const isNumeric = typeof value === 'number';
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="metric-num mt-1.5 text-xl font-bold sm:text-2xl" style={{ color: accent }}>
        {isNumeric ? (
          <AnimatedNumber end={value} decimals={decimals} suffix={suffix} duration={1.6} />
        ) : (
          value
        )}
      </p>
    </div>
  );
}

export default function Hero() {
  const [range, setRange] = useState('30d');
  const series = useMemo(() => makeTrafficSeries(range), [range]);

  return (
    <section className="relative overflow-hidden pb-16 pt-14 sm:pt-20 lg:pb-24">
      {/* Brand glow — the only decorative gradient in the hero. */}
      <div
        aria-hidden="true"
        className="mkt-glow left-1/2 top-[-140px] h-[420px] w-[720px] max-w-[110vw] -translate-x-1/2 bg-violet-600/25"
      />

      <div className="mkt-container relative">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mkt-chip mx-auto">
            <span className="mkt-live-dot" aria-hidden="true" />
            Real-time web analytics
          </p>

          <h1 className="mkt-h1 mt-6">
            Your website is always talking.
            <br />
            <span className="mkt-accent-text">WebPulse listens.</span>
          </h1>

          <p className="mkt-lead mx-auto mt-6 max-w-2xl">
            Understand your traffic, follow visitor activity, and discover which pages bring
            people in. All from one real-time analytics dashboard built for developers.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/register" className="mkt-btn mkt-btn-primary mkt-btn-lg w-full sm:w-auto">
              Start tracking free
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              href="#product-preview"
              className="mkt-btn mkt-btn-secondary mkt-btn-lg w-full sm:w-auto"
            >
              Explore the preview
            </a>
          </div>

          <p className="mt-5 text-xs text-slate-500">
            Free plan available · No credit card required
          </p>
        </div>

        {/* Product preview — presentation-only, clearly labelled as sample data. */}
        <Reveal id="product-preview" className="mx-auto mt-14 max-w-5xl scroll-mt-24 lg:mt-16">
          <PreviewFrame title="WebPulse · Dashboard" note="Illustrative sample data">
            <DashboardPreview>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {SAMPLE_KPIS.map((kpi) => (
                  <KpiTile key={kpi.label} {...kpi} />
                ))}
              </div>

              <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Traffic momentum
                    </p>
                    <div className="flex items-center gap-0.5 rounded-full border border-white/[0.08] bg-white/[0.03] p-0.5">
                      {TRAFFIC_RANGES.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRange(r)}
                          aria-pressed={range === r}
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                            range === r
                              ? 'bg-violet-500/90 text-white'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-40 sm:h-48">
                    <ChartPreview data={series} dark />
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Referral sources
                  </p>
                  <ul className="space-y-3">
                    {SAMPLE_REFERRERS.map((r) => (
                      <li key={r.label}>
                        <div className="mb-1.5 flex items-center justify-between text-xs">
                          <span className="text-slate-400">{r.label}</span>
                          <span className="metric-num font-semibold" style={{ color: r.accent }}>
                            {r.value}%
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${r.value * 2}%`, background: r.accent, opacity: 0.85 }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Live activity
                  </p>
                  <span className="text-[11px] text-slate-600">Visitors arriving now</span>
                </div>
                <div className="h-[168px]">
                  <LiveEventStream maxItems={4} seedCount={4} />
                </div>
              </div>
            </DashboardPreview>
          </PreviewFrame>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              {
                label: 'Traffic',
                text: 'Page views and sessions across 24 hours, 7 days, or 30 days.',
              },
              {
                label: 'Visitor activity',
                text: 'Events as visitors move through your site, labeled with page and time.',
              },
              {
                label: 'Acquisition',
                text: 'The channels and referrers that brought those visitors in.',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-left"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-violet-300">
                  {item.label}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-400">{item.text}</p>
              </div>
            ))}
          </div>

          <p className="mt-3 text-center text-xs text-slate-500">
            The dashboard above uses illustrative sample data — not customer data or live traffic.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
