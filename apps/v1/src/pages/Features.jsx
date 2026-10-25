import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Bug,
  Calendar,
  Check,
  Code2,
  FileDown,
  Gauge,
  Github,
  Globe,
  History,
  LayoutDashboard,
  MapPin,
  Megaphone,
  Monitor,
  MousePointerClick,
  Share2,
  ShieldCheck,
  Smartphone,
  Tablet,
} from 'lucide-react';
import MarketingShell from '../components/marketing/MarketingShell';
import { REPO_URL } from '../components/marketing/MarketingFooter';
import SectionHead from '../components/marketing/SectionHead';
import Reveal from '../components/marketing/Reveal';

/* ---------------------------------------------------------------------------
   SEO — the SPA has a single static <head>, so the features route sets its
   own title, description, and canonical tags and restores the previous values
   on unmount.
--------------------------------------------------------------------------- */

const SEO_TITLE = 'WebPulse Features — Real-Time Website Analytics';
const SEO_DESCRIPTION =
  'Explore WebPulse features for real-time website analytics, visitor activity, traffic sources, custom events, and developer-friendly integrations.';
const SEO_URL = 'https://obs-real-time-tracker.vercel.app/features';

const SEO_META = [
  { selector: 'meta[name="description"]', name: 'description', content: SEO_DESCRIPTION },
  { selector: 'meta[property="og:title"]', property: 'og:title', content: SEO_TITLE },
  { selector: 'meta[property="og:description"]', property: 'og:description', content: SEO_DESCRIPTION },
  { selector: 'meta[property="og:url"]', property: 'og:url', content: SEO_URL },
  { selector: 'meta[name="twitter:title"]', name: 'twitter:title', content: SEO_TITLE },
  { selector: 'meta[name="twitter:description"]', name: 'twitter:description', content: SEO_DESCRIPTION },
];

function useFeaturesSeo() {
  useEffect(() => {
    const previousTitle = document.title;
    const previousMeta = SEO_META.map(({ selector }) => {
      const tag = document.head.querySelector(selector);
      return {
        selector,
        existed: Boolean(tag),
        content: tag?.getAttribute('content') ?? null,
      };
    });
    const canonical = document.head.querySelector('link[rel="canonical"]');
    const previousCanonical = canonical?.getAttribute('href') ?? null;

    document.title = SEO_TITLE;
    SEO_META.forEach(({ selector, name, property, content }) => {
      let tag = document.head.querySelector(selector);
      if (!tag) {
        tag = document.createElement('meta');
        if (name) tag.setAttribute('name', name);
        if (property) tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });
    if (canonical) canonical.setAttribute('href', SEO_URL);

    return () => {
      document.title = previousTitle;
      previousMeta.forEach(({ selector, existed, content }) => {
        const tag = document.head.querySelector(selector);
        if (!tag) return;
        if (!existed) {
          tag.remove();
        } else if (content !== null) {
          tag.setAttribute('content', content);
        }
      });
      if (canonical && previousCanonical !== null) {
        canonical.setAttribute('href', previousCanonical);
      }
    };
  }, []);
}

/* ---------------------------------------------------------------------------
   Illustrative sample values. These mirror the shape of real dashboard data
   (page views, sessions, referrers, devices, locations) and are labelled as
   samples everywhere they appear.
--------------------------------------------------------------------------- */

const TRAFFIC_BARS = [38, 44, 41, 52, 48, 57, 63, 59, 68, 72, 66, 78, 74, 83, 88, 92];

const HERO_STATS = [
  { label: 'Page views', value: '48.2k', delta: '+12.4%' },
  { label: 'Sessions', value: '19.4k', delta: '+8.1%' },
  { label: 'Active now', value: '128', live: true },
];

const LIVE_ROWS = [
  { title: 'Pricing', path: '/pricing', device: 'Desktop', location: 'Mumbai, IN', time: 'now' },
  { title: 'Getting started', path: '/docs/getting-started', device: 'Mobile', location: 'Berlin, DE', time: '8s' },
  { title: 'Features', path: '/features', device: 'Desktop', location: 'Austin, US', time: '21s' },
  { title: 'Home', path: '/', device: 'Tablet', location: 'Toronto, CA', time: '34s' },
];

const TOP_PAGES = [
  { path: '/', views: 12480, share: 100 },
  { path: '/pricing', views: 8341, share: 67 },
  { path: '/docs/getting-started', views: 5182, share: 42 },
  { path: '/features', views: 3210, share: 26 },
];

const SOURCES = [
  { label: 'Direct', value: 38, color: '#8B5CF6' },
  { label: 'google.com', value: 27, color: '#10B981' },
  { label: 'x.com', value: 14, color: '#F59E0B' },
  { label: 'github.com', value: 9, color: '#3B82F6' },
  { label: 'Other referrers', value: 12, color: '#64748B' },
];

const DEVICES = [
  { label: 'Desktop', value: 54, Icon: Monitor },
  { label: 'Mobile', value: 39, Icon: Smartphone },
  { label: 'Tablet', value: 7, Icon: Tablet },
];

const LOCATIONS = [
  { label: 'India', value: 31 },
  { label: 'United States', value: 24 },
  { label: 'Germany', value: 11 },
  { label: 'United Kingdom', value: 9 },
];

/* ---------------------------------------------------------------------------
   Preview visuals — presentation-only widgets modelled on the real console.
--------------------------------------------------------------------------- */

function HeroPreview() {
  return (
    <div className="mkt-panel relative p-2">
      <div
        aria-hidden="true"
        className="mkt-glow right-[-80px] top-[-100px] h-[240px] w-[240px] bg-violet-600/25"
      />
      <div className="relative rounded-2xl border border-white/[0.06] bg-[#0B0F17]/80">
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-500/15">
              <Activity className="h-3.5 w-3.5 text-violet-300" aria-hidden="true" />
            </span>
            <p className="text-xs font-semibold text-slate-300">
              webpulse.io <span aria-hidden="true" className="text-slate-600">/</span> overview
            </p>
          </div>
          <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium text-slate-400">
            Last 30 days
          </span>
        </div>

        <div className="grid grid-cols-3 divide-x divide-white/[0.06] border-b border-white/[0.06]">
          {HERO_STATS.map((stat) => (
            <div key={stat.label} className="px-3 py-3.5 sm:px-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                {stat.label}
              </p>
              <p className="metric-num mt-1.5 flex items-baseline gap-2 font-display text-lg font-bold text-slate-100">
                {stat.value}
                {stat.live ? (
                  <span className="mkt-live-dot !h-1.5 !w-1.5" aria-hidden="true" />
                ) : (
                  <span className="text-[10px] font-semibold text-emerald-300">{stat.delta}</span>
                )}
              </p>
            </div>
          ))}
        </div>

        <div className="px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Page views
            </p>
            <span className="metric-num text-[10px] text-slate-500">30 days</span>
          </div>
          <div className="flex h-24 items-end gap-1" aria-hidden="true">
            {TRAFFIC_BARS.map((height, i) => (
              <span
                key={i}
                className={`flex-1 rounded-t-sm ${
                  i >= TRAFFIC_BARS.length - 3 ? 'bg-violet-400/80' : 'bg-violet-500/25'
                }`}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
      </div>
      <p className="relative px-3 pb-1 pt-3 text-center text-[10px] text-slate-500">
        Illustrative sample data — not live production activity.
      </p>
    </div>
  );
}

function VisualFrame({ title, meta = 'Sample data', note, children }) {
  return (
    <div className="mkt-card p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          {title}
        </p>
        <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-slate-500">
          {meta}
        </span>
      </div>
      {children}
      {note && (
        <p className="mt-5 border-t border-white/[0.06] pt-4 text-[11px] leading-relaxed text-slate-500">
          {note}
        </p>
      )}
    </div>
  );
}

function LiveVisual() {
  return (
    <VisualFrame
      title="Live activity"
      note="Active visitors are counted over the last five minutes."
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
          <span className="mkt-live-dot !h-1.5 !w-1.5" aria-hidden="true" />
          128 active now
        </span>
        <span className="text-[11px] text-slate-500">All projects</span>
      </div>
      <ul className="space-y-2.5">
        {LIVE_ROWS.map((row) => (
          <li
            key={row.path}
            className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
              <Globe className="h-4 w-4 text-violet-300" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold text-slate-200">
                {row.title}
              </span>
              <span className="block truncate font-mono text-[11px] text-slate-500">
                {row.path}
              </span>
            </span>
            <span className="hidden text-right text-[11px] leading-relaxed text-slate-400 sm:block">
              <span className="block">{row.device}</span>
              <span className="block text-slate-500">{row.location}</span>
            </span>
            <span className="metric-num w-10 shrink-0 text-right text-[11px] text-slate-500">
              {row.time}
            </span>
          </li>
        ))}
      </ul>
    </VisualFrame>
  );
}

function TrafficVisual() {
  return (
    <VisualFrame title="Traffic">
      <div className="mb-4 flex gap-1.5">
        {['24h', '7d', '30d'].map((range) => (
          <span
            key={range}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
              range === '30d'
                ? 'bg-violet-500/15 text-violet-200 ring-1 ring-inset ring-violet-400/30'
                : 'text-slate-500'
            }`}
          >
            {range}
          </span>
        ))}
      </div>
      <div className="flex h-28 items-end gap-1.5" aria-hidden="true">
        {TRAFFIC_BARS.map((height, i) => (
          <span
            key={i}
            className={`flex-1 rounded-t-sm ${
              i >= TRAFFIC_BARS.length - 3 ? 'bg-violet-400/80' : 'bg-violet-500/25'
            }`}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
      <div className="mt-5 border-t border-white/[0.06] pt-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Top pages
        </p>
        <ul className="space-y-2.5">
          {TOP_PAGES.slice(0, 3).map((page) => (
            <li key={page.path} className="flex items-center gap-3">
              <span className="w-36 truncate font-mono text-[11px] text-slate-300 sm:w-44">
                {page.path}
              </span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                <span
                  className="block h-full rounded-full bg-violet-500/70"
                  style={{ width: `${page.share}%` }}
                />
              </span>
              <span className="metric-num w-14 text-right text-[11px] text-slate-400">
                {page.views.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </VisualFrame>
  );
}

function SourcesVisual() {
  return (
    <VisualFrame
      title="Traffic sources"
      note="Direct visits are grouped separately. Sources are derived from the referring page attached to each session."
    >
      <ul className="space-y-4">
        {SOURCES.map((source) => (
          <li key={source.label}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
              <span className="flex items-center gap-2 text-slate-300">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: source.color }}
                  aria-hidden="true"
                />
                {source.label}
              </span>
              <span className="metric-num font-semibold text-slate-200">{source.value}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full"
                style={{ width: `${source.value}%`, backgroundColor: source.color }}
              />
            </div>
          </li>
        ))}
      </ul>
    </VisualFrame>
  );
}

function AudienceVisual() {
  return (
    <VisualFrame
      title="Audience"
      note="Device, browser, operating system, and approximate location are recorded with each session."
    >
      <div className="grid grid-cols-3 gap-2.5">
        {DEVICES.map((device) => {
          const Icon = device.Icon;
          return (
            <div
              key={device.label}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
            >
              <Icon className="h-4 w-4 text-violet-300" aria-hidden="true" />
              <p className="metric-num mt-2 text-lg font-bold text-slate-100">{device.value}%</p>
              <p className="text-[11px] text-slate-500">{device.label}</p>
            </div>
          );
        })}
      </div>
      <p className="mb-3 mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        Top locations
      </p>
      <ul className="space-y-3">
        {LOCATIONS.map((location) => (
          <li key={location.label} className="flex items-center gap-3 text-xs">
            <span className="flex w-32 items-center gap-1.5 text-slate-300">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />
              <span className="truncate">{location.label}</span>
            </span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
              <span
                className="block h-full rounded-full bg-violet-400/70"
                style={{ width: `${(location.value / LOCATIONS[0].value) * 100}%` }}
              />
            </span>
            <span className="metric-num w-9 text-right text-slate-400">{location.value}%</span>
          </li>
        ))}
      </ul>
    </VisualFrame>
  );
}

/* ---------------------------------------------------------------------------
   Page content
--------------------------------------------------------------------------- */

const CORE_FEATURES = [
  {
    index: '01',
    label: 'Real-time monitoring',
    title: 'See activity as it happens.',
    body: 'Follow incoming page views as they reach your dashboard. See which pages visitors are opening right now, how many are active, and what is happening across your projects.',
    bullets: [
      'Live activity feed with page and visitor context',
      'Active visitor count over the last five minutes',
      'Project-level activity across connected websites',
    ],
    visual: LiveVisual,
  },
  {
    index: '02',
    label: 'Traffic & engagement',
    title: 'Discover which pages get attention.',
    body: 'Track page views and sessions over time, find your most-visited pages, and switch between the reporting windows your console supports.',
    bullets: [
      'Page views and sessions over time',
      'Top pages ranked by views',
      '24-hour, 7-day, and 30-day windows',
    ],
    visual: TrafficVisual,
  },
  {
    index: '03',
    label: 'Traffic acquisition',
    title: 'Know where your visitors come from.',
    body: 'Understand how people discover your website through direct visits and referring domains. Top sources are grouped from the referring page attached to each session.',
    bullets: [
      'Referrer attribution',
      'Direct and referred traffic separated',
      'Top source breakdown by visitors',
    ],
    visual: SourcesVisual,
  },
  {
    index: '04',
    label: 'Audience insights',
    title: 'Understand the devices behind the visits.',
    body: 'Add context to every session with device type, browser, operating system, and approximate location. See how your audience splits across devices and where visits come from.',
    bullets: [
      'Desktop, mobile, and tablet split',
      'Browser and operating system captured per session',
      'Approximate country and city context',
    ],
    visual: AudienceVisual,
  },
];

const MINI_FEATURES = [
  {
    icon: MousePointerClick,
    label: '05 · Event collection',
    badge: 'Limited in V1',
    badgeTone: 'amber',
    title: 'Instrument actions beyond page views.',
    body: 'The JavaScript tracker and REST API accept named events, so you can capture interactions such as button clicks and signup starts. In V1, those events follow the page-view pipeline — persisted event names and custom properties are still on the roadmap.',
    points: [
      'Tracker and REST API endpoints',
      'Bot filtering and duplicate protection',
      'Event-level breakdowns: roadmap',
    ],
    to: '/docs/tracking/events',
    linkLabel: 'Event tracking docs',
  },
  {
    icon: Code2,
    label: '06 · Developer integration',
    title: 'Add analytics without changing your stack.',
    body: 'Load the tracker with a script tag, or send supported analytics data through the REST API. The public endpoints and integration workflow are documented.',
    points: ['JavaScript tracker', 'REST API under /api/v1', 'Setup and API reference'],
    to: '/docs/api',
    linkLabel: 'API reference',
  },
  {
    icon: ShieldCheck,
    label: '07 · Project control',
    title: "Keep each website's analytics organized.",
    body: 'Separate analytics by project with a dedicated tracking ID, project time zone, and allowed-origin rules for browser tracking.',
    points: ['Project tracking IDs', 'Allowed origins', 'Per-project time zones'],
    to: '/docs/security#allowed-origins',
    linkLabel: 'Security and origins',
  },
  {
    icon: Share2,
    label: '08 · Shared reports',
    badge: 'Pro & Business',
    badgeTone: 'violet',
    title: 'Share a read-only view of a project.',
    body: 'Publish a 30-day report for a project and revoke the link whenever you need to. Shared reports are available on paid plans.',
    points: ['Traffic, sources, and devices', 'Read-only public link', 'Revoke access at any time'],
    to: '/pricing',
    linkLabel: 'See plans',
  },
];

const ROADMAP_ITEMS = [
  {
    icon: Megaphone,
    title: 'Campaign & UTM attribution',
    status: 'Planned',
    body: 'Persist campaign parameters so acquisition reports can separate campaigns from referring domains.',
  },
  {
    icon: FileDown,
    title: 'Reports & analytics exports',
    status: 'Planned',
    body: 'Generated reports and exports for pages, sessions, and events beyond the current read-only share links.',
  },
  {
    icon: Bell,
    title: 'Alerts & webhooks',
    status: 'Planned',
    body: 'Threshold-based notifications and webhook delivery for the signals that matter to your team.',
  },
  {
    icon: History,
    title: 'Retention controls',
    status: 'Planned',
    body: 'Configurable retention and cleanup policies for stored analytics data.',
  },
  {
    icon: Gauge,
    title: 'Performance monitoring',
    status: 'Not in V1',
    body: 'Page load and response-time metrics. V1 focuses on traffic, sessions, and visitor context.',
  },
  {
    icon: LayoutDashboard,
    title: 'Custom dashboards',
    status: 'Not in V1',
    body: 'Configurable dashboard layouts. The V1 console uses a fixed analytics overview.',
  },
  {
    icon: Bug,
    title: 'Application error tracking',
    status: 'Not in V1',
    body: 'Exception capture and application monitoring are not part of WebPulse today.',
  },
  {
    icon: Calendar,
    title: 'Custom date ranges',
    status: 'Not in V1',
    body: 'V1 exposes 24-hour, 7-day, and 30-day windows. Custom ranges and period comparisons are not available yet.',
  },
];

const BADGE_TONES = {
  amber: 'border-amber-400/25 bg-amber-400/10 text-amber-300',
  violet: 'border-violet-400/25 bg-violet-500/10 text-violet-300',
};

function CoreFeature({ index, label, title, body, bullets, visual, flipped }) {
  const Visual = visual;
  return (
    <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
      <Reveal className={flipped ? 'lg:order-2' : ''}>
        <p className="mkt-eyebrow">
          <span className="metric-num text-slate-500">{index}</span>
          <span className="h-px w-6 bg-white/15" aria-hidden="true" />
          {label}
        </p>
        <h3 className="mkt-h3 mt-4 !text-[1.5rem] sm:!text-[1.75rem]">{title}</h3>
        <p className="mkt-body mt-4 max-w-lg">{body}</p>
        <ul className="mt-6 space-y-2.5">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2.5 text-sm text-slate-300">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" aria-hidden="true" />
              {bullet}
            </li>
          ))}
        </ul>
      </Reveal>
      <Reveal delay={80} className={flipped ? 'lg:order-1' : ''}>
        <Visual />
      </Reveal>
    </div>
  );
}

function MiniFeature({ icon, label, title, body, points, to, linkLabel, badge, badgeTone }) {
  const Icon = icon;
  return (
    <article className="mkt-card mkt-card-hover flex h-full flex-col p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
          <Icon className="h-5 w-5 text-violet-300" aria-hidden="true" />
        </div>
        {badge && (
          <span
            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${
              BADGE_TONES[badgeTone] || BADGE_TONES.violet
            }`}
          >
            {badge}
          </span>
        )}
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-300/90">
        {label}
      </p>
      <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-100">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-400">{body}</p>
      <ul className="mt-5 space-y-2">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-2 text-xs text-slate-400">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-violet-400/80" aria-hidden="true" />
            {point}
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-6">
        <Link to={to} className="mkt-link !text-sm">
          {linkLabel}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

function RoadmapCard({ icon, title, status, body }) {
  const Icon = icon;
  const planned = status === 'Planned';
  return (
    <article className="mkt-card h-full p-5 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
            planned
              ? 'border-violet-400/20 bg-violet-500/10'
              : 'border-white/[0.08] bg-white/[0.03]'
          }`}
        >
          <Icon
            className={`h-5 w-5 ${planned ? 'text-violet-300' : 'text-slate-400'}`}
            aria-hidden="true"
          />
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${
            planned
              ? 'border-violet-400/25 bg-violet-500/10 text-violet-300'
              : 'border-white/[0.08] bg-white/[0.03] text-slate-500'
          }`}
        >
          {status}
        </span>
      </div>
      <h3 className="text-base font-semibold tracking-tight text-slate-100">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{body}</p>
    </article>
  );
}

export default function Features() {
  useFeaturesSeo();

  return (
    <MarketingShell tone="hero">
      {/* Hero */}
      <section className="relative pb-14 pt-10 sm:pt-14 lg:pb-20">
        <div className="mkt-container">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <p className="mkt-eyebrow">Features · V1</p>
              <h1 className="mkt-h1 mt-5">
                Everything happening on your website.{' '}
                <span className="mkt-accent-text">One clear view.</span>
              </h1>
              <p className="mkt-lead mt-6 max-w-xl">
                Track visitor activity, understand your traffic sources, and explore how people
                interact with your website. WebPulse brings your analytics together in one
                developer-friendly dashboard.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to="/register" className="mkt-btn mkt-btn-primary mkt-btn-lg">
                  Start tracking free
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link to="/docs/getting-started" className="mkt-btn mkt-btn-secondary mkt-btn-lg">
                  Read the documentation
                </Link>
              </div>
              <p className="mt-6 text-xs font-medium text-slate-500">
                V1 preview
                <span aria-hidden="true" className="mx-1.5 text-slate-700">·</span>
                Open source
                <span aria-hidden="true" className="mx-1.5 text-slate-700">·</span>
                Free plan available
              </p>
            </Reveal>
            <Reveal delay={100}>
              <HeroPreview />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Core features */}
      <section className="mkt-section-tight">
        <div className="mkt-container">
          <SectionHead
            eyebrow="Available today"
            title="Built around the analytics you can use now."
            description="Everything in this section ships in the current release. Each preview reflects the kind of data you see in the WebPulse console."
          />
          <div className="mt-16 space-y-20 lg:space-y-24">
            {CORE_FEATURES.map((feature, i) => (
              <CoreFeature key={feature.index} {...feature} flipped={i % 2 === 1} />
            ))}
          </div>
        </div>
      </section>

      {/* Supporting features */}
      <section className="mkt-section-tight">
        <div className="mkt-container">
          <SectionHead
            eyebrow="More in V1"
            title="The practical pieces around the dashboard."
            description="Project controls, developer access, and sharing — with the limits of each capability stated plainly."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {MINI_FEATURES.map((feature, i) => (
              <Reveal key={feature.label} delay={(i % 4) * 60} className="h-full">
                <MiniFeature {...feature} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Open source */}
      <section className="mkt-section-tight">
        <div className="mkt-container">
          <Reveal>
            <div className="mkt-panel relative overflow-hidden p-7 sm:p-9">
              <div
                aria-hidden="true"
                className="mkt-glow right-[-120px] top-[-120px] h-[280px] w-[420px] bg-violet-600/15"
              />
              <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
                <div className="flex gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10">
                    <Github className="h-6 w-6 text-violet-300" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="mkt-eyebrow">Open source</p>
                    <h2 className="mkt-h3 mt-3 !text-xl sm:!text-2xl">
                      Know how your analytics work.
                    </h2>
                    <p className="mkt-body mt-3 max-w-xl">
                      WebPulse is built in the open. Inspect the tracking implementation, the API,
                      and the data model, or follow development in the public repository.
                    </p>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {['Tracking implementation', 'REST API', 'Data model'].map((item) => (
                        <li key={item} className="mkt-chip !px-3 !py-1 !text-[11px]">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 lg:justify-end">
                  <a
                    href={REPO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mkt-btn mkt-btn-primary mkt-btn-md"
                  >
                    View the repository
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                  <Link to="/docs" className="mkt-btn mkt-btn-secondary mkt-btn-md">
                    Read the docs
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Roadmap */}
      <section className="mkt-section-tight">
        <div className="mkt-container">
          <SectionHead
            eyebrow="Roadmap"
            title="What's next — and what isn't in V1."
            description={
              <>
                These capabilities are not available today.{' '}
                <strong className="font-semibold text-slate-300">Planned</strong> items appear in
                the public roadmap;{' '}
                <strong className="font-semibold text-slate-300">Not in V1</strong> items are not
                currently supported.
              </>
            }
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {ROADMAP_ITEMS.map((item, i) => (
              <Reveal key={item.title} delay={(i % 4) * 60} className="h-full">
                <RoadmapCard {...item} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="pb-20 pt-6">
        <div className="mkt-container">
          <Reveal>
            <div className="mkt-panel relative overflow-hidden px-6 py-14 text-center sm:px-12">
              <div
                aria-hidden="true"
                className="mkt-glow left-1/2 top-[-160px] h-[320px] w-[560px] max-w-[110vw] -translate-x-1/2 bg-violet-600/20"
              />
              <div className="relative">
                <p className="mkt-eyebrow">Get started</p>
                <h2 className="mkt-h2 mt-4">Make your website easier to understand.</h2>
                <p className="mkt-lead mx-auto mt-4 max-w-xl">
                  Create your first project, connect your website, and start learning from the
                  activity it generates.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <Link to="/register" className="mkt-btn mkt-btn-primary mkt-btn-lg">
                    Start tracking free
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link
                    to="/docs/getting-started"
                    className="mkt-btn mkt-btn-secondary mkt-btn-lg"
                  >
                    Read the documentation
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </MarketingShell>
  );
}
