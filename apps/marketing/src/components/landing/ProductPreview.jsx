import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PREVIEW_RANGES, TOP_PAGES, SAMPLE_STREAMS } from './sampleData';

function ChartSvg({ series }) {
  const width = 760;
  const height = 220;
  const padX = 12;
  const padTop = 18;
  const padBottom = 28;
  const plotW = width - padX * 2;
  const plotH = height - padTop - padBottom;

  const maxViews = Math.max(...series.map((d) => d.views), 1);

  const points = series.map((d, idx) => {
    const x = series.length === 1 ? padX : padX + (idx / (series.length - 1)) * plotW;
    const yViews = padTop + plotH - (d.views / maxViews) * plotH;
    const yVisitors = padTop + plotH - (d.visitors / maxViews) * plotH;
    return { ...d, x, yViews, yVisitors };
  });

  const viewsPath = points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.yViews.toFixed(1)}`)
    .join(' ');
  const visitorsPath = points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.yVisitors.toFixed(1)}`)
    .join(' ');
  const areaPath = `${viewsPath} L ${points[points.length - 1].x.toFixed(1)} ${(
    padTop + plotH
  ).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`;

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-52 w-full"
        role="img"
        aria-label="Sample page views and unique visitor trend over time"
      >
        <defs>
          <linearGradient id="noirWhiteFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75, 1].map((t) => {
          const y = padTop + plotH * (1 - t);
          return (
            <line
              key={t}
              x1={padX}
              x2={width - padX}
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.08)"
              strokeDasharray="3 4"
            />
          );
        })}

        <path d={areaPath} fill="url(#noirWhiteFill)" />
        <path
          d={visitorsPath}
          fill="none"
          stroke="rgba(245,245,244,0.45)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <path d={viewsPath} fill="none" stroke="#FFFFFF" strokeWidth="2" />

        {points.map((p) => (
          <g key={p.label}>
            <circle cx={p.x} cy={p.yViews} r="3.2" fill="#FFFFFF" />
            <text
              x={p.x}
              y={height - 6}
              textAnchor={
                p.x === points[0].x ? 'start' : p.x === points[points.length - 1].x ? 'end' : 'middle'
              }
              fill="#969690"
              fontSize="12"
              fontFamily="Geist, sans-serif"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function ProductPreview() {
  const [range, setRange] = useState('24h');
  const current = PREVIEW_RANGES[range] || PREVIEW_RANGES['24h'];

  return (
    <section id="preview" className="py-20 sm:py-24 bg-[#0A0A0A]">
      <div className="mkt-container">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <h2 className="mkt-h2">One screen. Live numbers.</h2>
            <p className="mkt-lead mt-4 max-w-[54ch] text-[#B3B3AF]">
              Active visitors, top pages, referrers, and geography, updated in real time
              without hitting refresh.
            </p>
          </div>
          <Link to="/features" className="mkt-link shrink-0">
            Inspect platform features
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10 border border-white/15 bg-[#050505]" data-ui="">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.11] px-4 py-3.5 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="mkt-live-dot" aria-hidden="true" />
              <span className="text-sm font-medium text-[#F5F5F4]">
                app.webpulseanalytics.tech / workspace
              </span>
              <span className="hidden text-[13px] text-[#969690] sm:inline">
                {current.label} · Sample dataset
              </span>
            </div>

            <div
              role="group"
              aria-label="Preview time range"
              className="inline-flex border border-white/15 bg-[#0A0A0A]"
            >
              {['24h', '7d', '30d'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  aria-pressed={range === r}
                  className={`px-3.5 py-1.5 text-[13px] transition-colors ${
                    range === r
                      ? 'bg-[#FFFFFF] font-semibold text-[#050505]'
                      : 'text-[#C8C8C4] hover:text-[#F5F5F4]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 divide-y divide-white/[0.11] border-b border-white/[0.11] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
            {current.kpis.map((kpi, idx) => (
              <div
                key={kpi.label}
                className={`p-5 sm:p-6 ${
                  idx % 2 === 1 ? 'sm:border-l sm:border-white/[0.11] lg:border-l-0' : ''
                } ${idx >= 2 ? 'sm:border-t sm:border-white/[0.11] lg:border-t-0' : ''}`}
              >
                <p className="text-[13px] text-[#969690]">{kpi.label}</p>
                <p
                  className={`mt-2 text-2xl font-semibold tracking-tight metric-num ${
                    kpi.accent ? 'text-[#FFFFFF]' : 'text-[#F5F5F4]'
                  }`}
                >
                  {kpi.value}
                </p>
                <p className="mt-1.5 text-[13px] text-[#B3B3AF]">{kpi.delta}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="border-b border-white/[0.11] p-5 sm:p-6 lg:col-span-7 lg:border-b-0 lg:border-r">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-medium text-[#F5F5F4]">Traffic momentum</h3>
                <div className="flex items-center gap-5 text-[13px] text-[#B3B3AF]">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-4 bg-[#FFFFFF]" aria-hidden="true" />
                    Page views
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-0.5 w-4 border-t border-dashed border-[#F5F5F4]/60" aria-hidden="true" />
                    Unique visitors
                  </span>
                </div>
              </div>
              <ChartSvg series={current.series} />
            </div>

            <div className="p-5 sm:p-6 lg:col-span-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-medium text-[#F5F5F4]">Top tracked routes</h3>
                <span className="text-[13px] text-[#969690]">Hits</span>
              </div>
              <div className="space-y-3">
                {TOP_PAGES.map((page) => (
                  <div key={page.path} className="space-y-1.5">
                    <div className="flex items-baseline justify-between gap-4 text-[13px]">
                      <code className="truncate font-mono text-[#F5F5F4]">{page.path}</code>
                      <span className="shrink-0 metric-num text-[#B3B3AF]">{page.views}</span>
                    </div>
                    <div className="h-[3px] w-full bg-white/[0.07]">
                      <div
                        className="h-full bg-[#FFFFFF]/80"
                        style={{ width: `${page.share}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.11] bg-[#0A0A0A] px-5 py-3 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-4 text-[13px] text-[#B3B3AF]">
              <span>
                Latest ingestion: <code className="font-mono">{SAMPLE_STREAMS[0].path}</code> ({SAMPLE_STREAMS[0].country})
              </span>
              <span className="text-[#969690]">Illustrative preview data · Zero client cookies</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
