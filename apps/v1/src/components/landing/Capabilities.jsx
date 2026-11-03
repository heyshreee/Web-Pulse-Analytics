import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SectionHead from '../marketing/SectionHead';
import Reveal from '../marketing/Reveal';
import ChartPreview from './ChartPreview';
import LiveEventStream from './LiveEventStream';
import {
  SAMPLE_BROWSERS,
  SAMPLE_DEVICES,
  SAMPLE_PAGES,
  SAMPLE_REFERRERS,
  makeTrafficSeries,
} from './sampleData';

/* ---------------------------------------------------------------------------
   Preview visuals — presentation-only widgets modelled on the real dashboard
   surface (traffic chart, breakdown lists, live feed). Fixed sample values.
--------------------------------------------------------------------------- */

function VisualHeader({ title, meta }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          {title}
        </p>
        <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-slate-500">
          Sample data
        </span>
      </div>
      {meta}
    </div>
  );
}

function LiveVisual() {
  return (
    <div className="mkt-card p-5">
      <VisualHeader
        title="Live activity"
        meta={
          <span className="inline-flex items-center gap-2 text-[11px] font-medium text-emerald-300">
            <span className="mkt-live-dot !h-1.5 !w-1.5" aria-hidden="true" />
            128 active
          </span>
        }
      />
      <div className="h-[232px]">
        <LiveEventStream maxItems={6} seedCount={6} />
      </div>
    </div>
  );
}

function TrafficVisual() {
  const series = useMemo(() => makeTrafficSeries('30d'), []);
  return (
    <div className="mkt-card p-5">
      <VisualHeader
        title="Traffic momentum"
        meta={<span className="text-[11px] text-slate-500">30 days</span>}
      />
      <div className="h-36">
        <ChartPreview data={series} dark />
      </div>
      <div className="mt-5 border-t border-white/[0.06] pt-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Top pages
        </p>
        <ul className="space-y-2.5">
          {SAMPLE_PAGES.slice(0, 4).map((p) => (
            <li key={p.path} className="flex items-center gap-3 text-xs">
              <span className="w-28 truncate font-mono text-slate-300 sm:w-40">{p.path}</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                <span
                  className="block h-full rounded-full bg-violet-500/70"
                  style={{ width: `${p.share}%` }}
                />
              </span>
              <span className="metric-num w-12 text-right text-slate-400">
                {p.views.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SourcesVisual() {
  return (
    <div className="mkt-card p-5">
      <VisualHeader
        title="Where visitors come from"
        meta={<span className="text-[11px] text-slate-500">30 days</span>}
      />
      <ul className="space-y-4">
        {SAMPLE_REFERRERS.map((r) => (
          <li key={r.label}>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-slate-300">{r.label}</span>
              <span className="metric-num font-semibold" style={{ color: r.accent }}>
                {r.value}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full rounded-full" style={{ width: `${r.value}%`, background: r.accent }} />
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-5 border-t border-white/[0.06] pt-4 text-xs leading-relaxed text-slate-500">
        Sources are derived from the referring document and campaign parameters attached to each
        event.
      </p>
    </div>
  );
}

function AudienceVisual() {
  return (
    <div className="mkt-card p-5">
      <VisualHeader
        title="Audience"
        meta={<span className="text-[11px] text-slate-500">30 days</span>}
      />
      <div className="mb-5 grid grid-cols-3 gap-3">
        {SAMPLE_DEVICES.map((d) => (
          <div key={d.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <p className="metric-num text-lg font-bold text-slate-100">{d.value}%</p>
            <p className="mt-0.5 text-xs text-slate-500">{d.label}</p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full rounded-full bg-violet-400/80" style={{ width: `${d.value}%` }} />
            </div>
          </div>
        ))}
      </div>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        Top browsers
      </p>
      <ul className="space-y-2.5">
        {SAMPLE_BROWSERS.map((b) => (
          <li key={b.label} className="flex items-center gap-3 text-xs">
            <span className="w-28 truncate text-slate-300 sm:w-32">{b.label}</span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
              <span
                className="block h-full rounded-full bg-emerald-400/70"
                style={{ width: `${b.value}%` }}
              />
            </span>
            <span className="metric-num w-12 text-right text-slate-400">{b.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Section
--------------------------------------------------------------------------- */

const CAPABILITIES = [
  {
    index: '01',
    label: 'Live monitoring',
    title: 'Watch visitors arrive while it is happening.',
    body: 'Events stream into your dashboard as they happen, so you can see how many visitors are active and which pages they are on right now.',
    bullets: ['Live activity feed per project', 'Active visitor count', 'No nightly report delay'],
    Visual: LiveVisual,
  },
  {
    index: '02',
    label: 'Traffic & engagement',
    title: 'See which pages carry your traffic.',
    body: 'Follow page views and sessions over 24 hours, 7 days, or 30 days — and find the pages that actually carry your traffic.',
    bullets: ['24-hour, 7-day, and 30-day ranges', 'Top pages by views', 'Per-project breakdown'],
    Visual: TrafficVisual,
  },
  {
    index: '03',
    label: 'Acquisition',
    title: 'Know which channels bring people in.',
    body: 'See which channels — direct, search, social, or referral — bring visitors in, and which ones deserve more attention.',
    bullets: ['Referrer and channel attribution', 'Campaign parameters included', 'Channel share at a glance'],
    Visual: SourcesVisual,
  },
  {
    index: '04',
    label: 'Audience',
    title: 'Understand the devices and browsers behind the visits.',
    body: 'Device, browser, and operating system are attached to every visitor, giving context to the numbers instead of a single anonymous total.',
    bullets: ['Desktop, mobile, and tablet split', 'Browser and OS breakdown', 'Ready for project-level filtering'],
    Visual: AudienceVisual,
  },
];

export default function Capabilities() {
  return (
    <section className="mkt-section" id="capabilities">
      <div className="mkt-container">
        <SectionHead
          eyebrow="What you get"
          title="Everything you need to understand your traffic."
          description="WebPulse turns page views, sessions, and custom events into insights you can use to improve your website."
        />

        <div className="mt-16 space-y-20 lg:space-y-24">
          {CAPABILITIES.map((cap, i) => {
            const { index, label, title, body, bullets, Visual } = cap;
            const flipped = i % 2 === 1;
            return (
              <div key={index} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
                <Reveal className={flipped ? 'lg:order-2' : ''}>
                  <p className="mkt-eyebrow">
                    <span className="metric-num text-slate-500">{index}</span>
                    <span className="h-px w-6 bg-white/15" aria-hidden="true" />
                    {label}
                  </p>
                  <h3 className="mkt-h3 mt-4 !text-[1.5rem] sm:!text-[1.75rem]">{title}</h3>
                  <p className="mkt-body mt-4 max-w-lg">{body}</p>
                  <ul className="mt-6 space-y-2.5">
                    {bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-sm text-slate-300">
                        <span
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400"
                          aria-hidden="true"
                        />
                        {b}
                      </li>
                    ))}
                  </ul>
                </Reveal>

                <Reveal delay={80} className={flipped ? 'lg:order-1' : ''}>
                  <Visual />
                </Reveal>
              </div>
            );
          })}
        </div>

        <Reveal className="mt-16 flex flex-col items-center justify-center gap-3 sm:flex-row lg:mt-20">
          <Link to="/features" className="mkt-btn mkt-btn-secondary mkt-btn-lg">
            Explore all features
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link to="/docs/getting-started" className="mkt-btn mkt-btn-ghost mkt-btn-lg">
            Read the quick start
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
