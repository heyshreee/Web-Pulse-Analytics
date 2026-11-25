import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const MANIFESTO_TOKENS = [
  { text: 'Most', accent: false },
  { text: 'analytics', accent: false },
  { text: 'tools', accent: false },
  { text: 'are', accent: false },
  { text: 'built', accent: false },
  { text: 'for', accent: false },
  { text: 'ad', accent: false },
  { text: 'networks,', accent: false },
  { text: 'not', accent: false },
  { text: 'for', accent: false },
  { text: 'builders.', accent: true },
  { text: 'Know', accent: false },
  { text: 'if', accent: false },
  { text: 'your', accent: false },
  { text: 'launch', accent: false },
  { text: 'works', accent: false },
  { text: 'without', accent: false },
  { text: 'invasive', accent: false },
  { text: 'replays.', accent: true },
];

const PLATFORM_PILLARS = [
  {
    title: 'Live visitor feed',
    summary:
      'See active sessions on your site now, which route they landed on, and where they came from as requests arrive over Socket.IO.',
    spec: 'Socket.IO visitor_update',
  },
  {
    title: 'Clean referrer attribution',
    summary:
      'Know whether traffic arrived from Hacker News, GitHub, X, or direct visits, alongside parsed UTM source, medium, and campaign tags.',
    spec: 'Referrers + UTM params',
  },
  {
    title: 'Route & page performance',
    summary:
      'Track page views, unique visits, exit pages, and single-page bounce rates per property, plus client navigation via window.tracker().',
    spec: 'Routes + exit pages',
  },
  {
    title: 'Custom event tracking',
    summary:
      'Fire a single window.tracker() call for signups, button clicks, or checkout steps. No external tag manager required.',
    spec: 'window.tracker("track")',
  },
];

export default function PlatformFeatures() {
  const manifestoRef = useRef(null);
  const [litCount, setLitCount] = useState(MANIFESTO_TOKENS.length);

  useEffect(() => {
    const el = manifestoRef.current;
    if (!el) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    const updateProgress = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const start = vh * 0.92;
      const end = vh * 0.25;
      const raw = (start - rect.top) / Math.max(start - end, 1);
      const clamped = Math.min(1, Math.max(0.18, raw));
      const next = Math.round(clamped * MANIFESTO_TOKENS.length);
      setLitCount(next);
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <section id="features" className="py-20 sm:py-28 bg-[#050505]">
      <div className="mkt-container">
        <div ref={manifestoRef} className="pb-16 lg:pb-20">
          <p className="max-w-3xl text-2xl font-medium leading-[1.35] tracking-[-0.02em] lg:text-[2rem]">
            {MANIFESTO_TOKENS.map((tok, i) => {
              const lit = i < litCount;
              return (
                <span
                  key={`${tok.text}-${i}`}
                  className={`editorial-word ${
                    tok.accent ? 'editorial-word-accent' : ''
                  } ${lit ? 'is-lit' : ''}`}
                >
                  {tok.text}{' '}
                </span>
              );
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="mkt-h2">What it actually tracks.</h2>
            <p className="mkt-lead mt-4 max-w-[42ch] text-[#B3B3AF]">
              The numbers you check every morning, stripped of everything you ignore.
            </p>
            <div className="mt-6">
              <Link to="/features" className="mkt-link">
                Review all platform features
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="space-y-4 lg:col-span-8">
            {PLATFORM_PILLARS.map((item) => (
              <div
                key={item.title}
                className="flex flex-col justify-between gap-4 bg-[#0B0B0B] p-6 sm:flex-row sm:items-start"
              >
                <div className="max-w-[54ch]">
                  <h3 className="mkt-h3">{item.title}</h3>
                  <p className="mkt-body mt-2 text-[#B3B3AF]">{item.summary}</p>
                </div>
                <span className="shrink-0 text-sm font-medium text-[#FFFFFF]">
                  {item.spec}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
