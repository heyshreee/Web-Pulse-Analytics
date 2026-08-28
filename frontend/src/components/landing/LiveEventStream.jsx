import { useEffect, useState, useRef } from 'react';

const COUNTRIES = [
  { flag: '🇺🇸', name: 'United States', device: 'Chrome' },
  { flag: '🇮🇳', name: 'India', device: 'Chrome' },
  { flag: '🇩🇪', name: 'Germany', device: 'Firefox' },
  { flag: '🇬🇧', name: 'United Kingdom', device: 'Safari' },
  { flag: '🇯🇵', name: 'Japan', device: 'Edge' },
  { flag: '🇫🇷', name: 'France', device: 'Chrome' },
  { flag: '🇧🇷', name: 'Brazil', device: 'Safari' },
  { flag: '🇨🇦', name: 'Canada', device: 'Chrome' },
];

const ACTIONS = [
  { action: 'Viewed', page: '/pricing' },
  { action: 'Viewed', page: '/features' },
  { action: 'Viewed', page: '/blog/security' },
  { action: 'Started checkout', page: '/checkout' },
  { action: 'Clicked "Start Tracking"', page: '/' },
  { action: 'Viewed', page: '/live' },
  { action: 'Signed up', page: '/register' },
  { action: 'Viewed', page: '/analytics' },
];

let idCounter = 0;
function makeEvent() {
  const c = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
  const a = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
  const now = new Date();
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return {
    id: idCounter++,
    time: `${mm}:${ss}`,
    flag: c.flag,
    country: c.name,
    device: c.device,
    action: a.action,
    page: a.page,
    color: Math.random() > 0.8 ? '#A78BFA' : Math.random() > 0.5 ? '#8B5CF6' : '#48E6A1',
    timestamp: now.getTime(),
  };
}

export default function LiveEventStream({ maxItems = 6 }) {
  const [events, setEvents] = useState(() =>
    Array.from({ length: 5 }, () => makeEvent())
  );
  const listRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setEvents((prev) => [...prev.slice(-(maxItems - 1)), makeEvent()]);
    }, 4000);
    return () => clearInterval(interval);
  }, [maxItems]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [events]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div
        ref={listRef}
        className="h-full overflow-y-auto space-y-2 pr-1 obs-scroll-thin"
      >
        {events.map((e) => (
          <div
            key={e.id}
            className="event-enter glass-obs rounded-xl px-3.5 py-2.5 flex items-center gap-3"
          >
            <div className="text-lg leading-none">{e.flag}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-white"
                  style={{ color: e.color }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: e.color }} />
                  {e.country} · {e.device}
                </span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                {e.action} <span className="font-mono text-violet-600 dark:text-violet-400">{e.page}</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono shrink-0">
              {e.time}
            </span>
          </div>
        ))}
      </div>
      <style>{`
        .obs-scroll-thin::-webkit-scrollbar { width: 4px; }
        .obs-scroll-thin::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.35); border-radius: 4px; }
        .obs-scroll-thin::-webkit-scrollbar-track { background: transparent; }
        @keyframes eventEnter { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .event-enter { animation: eventEnter 0.5s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .event-enter { animation: none; }
        }
      `}</style>
    </div>
  );
}
