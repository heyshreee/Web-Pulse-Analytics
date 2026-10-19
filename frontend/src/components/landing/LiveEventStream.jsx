import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Illustrative live activity feed used in marketing previews.
 *
 * Country codes are rendered as two-letter chips instead of emoji flags so the
 * feed looks identical on every platform (Windows/Linux font stacks do not
 * render regional-indicator emoji). This component is presentation-only and is
 * always paired with an "illustrative sample data" label.
 */
const COUNTRIES = [
  { code: 'US', name: 'United States', browser: 'Chrome' },
  { code: 'IN', name: 'India', browser: 'Chrome' },
  { code: 'DE', name: 'Germany', browser: 'Firefox' },
  { code: 'GB', name: 'United Kingdom', browser: 'Safari' },
  { code: 'JP', name: 'Japan', browser: 'Edge' },
  { code: 'FR', name: 'France', browser: 'Chrome' },
  { code: 'BR', name: 'Brazil', browser: 'Safari' },
  { code: 'CA', name: 'Canada', browser: 'Chrome' },
];

const ACTIONS = [
  { action: 'Viewed', page: '/pricing' },
  { action: 'Viewed', page: '/features' },
  { action: 'Viewed', page: '/blog' },
  { action: 'Started signup', page: '/register' },
  { action: 'Clicked “Start tracking”', page: '/' },
  { action: 'Viewed', page: '/docs/getting-started' },
  { action: 'Signed up', page: '/register' },
  { action: 'Viewed', page: '/integrations' },
];

const ACCENTS = ['#8B5CF6', '#A78BFA', '#48E6A1'];

let idCounter = 0;
function makeEvent() {
  const c = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
  const a = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(
    now.getSeconds()
  ).padStart(2, '0')}`;
  return {
    id: idCounter++,
    time,
    code: c.code,
    country: c.name,
    browser: c.browser,
    action: a.action,
    page: a.page,
    accent: ACCENTS[idCounter % ACCENTS.length],
  };
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function LiveEventStream({ maxItems = 6, seedCount = 5 }) {
  const [events, setEvents] = useState(() => Array.from({ length: seedCount }, () => makeEvent()));
  const listRef = useRef(null);
  const reduced = useMemo(() => prefersReducedMotion(), []);

  useEffect(() => {
    if (reduced) return undefined;
    const interval = setInterval(() => {
      setEvents((prev) => [...prev.slice(-(maxItems - 1)), makeEvent()]);
    }, 4000);
    return () => clearInterval(interval);
  }, [maxItems, reduced]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [events]);

  return (
    <ul
      ref={listRef}
      aria-label="Illustrative live activity feed"
      className="mkt-feed-scroll h-full space-y-2 overflow-y-auto pr-1"
    >
      {events.slice(-maxItems).map((e) => (
        <li
          key={e.id}
          className="mkt-feed-item flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2.5"
        >
          <span
            className="flex h-7 w-8 shrink-0 items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.03] text-[10px] font-bold tracking-wide text-slate-300"
            aria-hidden="true"
          >
            {e.code}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11.5px] font-medium text-slate-200">
              <span className="sr-only">{e.country} · </span>
              {e.country} <span className="text-slate-500">·</span>{' '}
              <span className="text-slate-400">{e.browser}</span>
            </p>
            <p className="truncate text-[11px] text-slate-500">
              {e.action}{' '}
              <span className="font-mono" style={{ color: e.accent }}>
                {e.page}
              </span>
            </p>
          </div>
          <span className="metric-num shrink-0 text-[10px] text-slate-500">{e.time}</span>
        </li>
      ))}
    </ul>
  );
}
