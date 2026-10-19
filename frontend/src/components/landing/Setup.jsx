import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import SectionHead from '../marketing/SectionHead';
import Reveal from '../marketing/Reveal';
import CodeSnippet from '../marketing/CodeSnippet';

const STEPS = [
  {
    n: '01',
    title: 'Create a project',
    desc: 'Sign up, create a project, and get its tracking ID. Each project keeps its own events, analytics, and allowed origins.',
  },
  {
    n: '02',
    title: 'Add the tracker',
    desc: 'Paste two script tags into your site. The tracker is a small dependency-free function — no build step required.',
  },
  {
    n: '03',
    title: 'Watch activity arrive',
    desc: 'Page views, sessions, and custom events appear in your dashboard as they are received.',
  },
];

const SNIPPET = `<script
  src="https://api.webpulse.app/api/v1/track/script.js"
></script>
<script>
  tracker('init', 'YOUR_TRACKING_ID');
  tracker('track', 'page_view');
</script>`;

const RECEIVING = ['Page views', 'Sessions', 'Custom events', 'Referrers', 'Devices', 'Location'];

export default function Setup() {
  return (
    <section className="mkt-section">
      <div className="mkt-container">
        <SectionHead
          eyebrow="Setup"
          title="Live analytics in three short steps."
          description="WebPulse is a script tag and a tracking ID. If your site can load JavaScript, it can send analytics."
        />

        <div className="mt-16 grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <ol className="space-y-8">
              {STEPS.map((s) => (
                <li key={s.n} className="flex gap-5">
                  <span className="metric-num mt-0.5 font-display text-sm font-bold text-violet-400">
                    {s.n}
                  </span>
                  <div>
                    <h3 className="mkt-h4">{s.title}</h3>
                    <p className="mkt-body mt-1.5 max-w-md">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link to="/docs/getting-started" className="mkt-btn mkt-btn-secondary mkt-btn-md">
                Read the quick start
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link to="/docs/javascript" className="mkt-link">
                JavaScript tracker docs
              </Link>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="mkt-panel">
              <div className="flex items-center gap-3 border-b border-white/[0.07] bg-white/[0.02] px-4 py-3">
                <span className="text-xs font-medium text-slate-400">index.html</span>
                <span className="ml-auto flex gap-1.5" aria-hidden="true">
                  <span className="h-2 w-2 rounded-full bg-white/15" />
                  <span className="h-2 w-2 rounded-full bg-white/15" />
                  <span className="h-2 w-2 rounded-full bg-white/15" />
                </span>
              </div>
              <CodeSnippet code={SNIPPET} />

              <div className="border-t border-white/[0.07] px-5 py-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="mkt-live-dot !h-1.5 !w-1.5" aria-hidden="true" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-300">
                    Receiving events
                  </span>
                </div>
                <ul className="grid grid-cols-2 gap-2">
                  {RECEIVING.map((r) => (
                    <li key={r} className="flex items-center gap-2 text-xs text-slate-400">
                      <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400/80" aria-hidden="true" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
