import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import SectionHead from '../marketing/SectionHead';
import Reveal from '../marketing/Reveal';
import CodeSnippet from '../marketing/CodeSnippet';

const STEPS = [
  {
    n: '01',
    title: 'Create your project',
    desc: 'Sign up, create a project, and copy its tracking ID. Each project keeps its own events, analytics, and allowed origins.',
  },
  {
    n: '02',
    title: 'Install the tracker',
    desc: 'Add the tracker script to your site. It is a small dependency-free function — no build step or SDK required.',
  },
  {
    n: '03',
    title: 'Verify incoming events',
    desc: 'Confirm that page views and custom events appear in the dashboard before you rely on the numbers.',
  },
];

const SNIPPET = `<script
  src="https://api.webpulse.app/api/v1/track/script.js"
></script>
<script>
  tracker('init', 'YOUR_TRACKING_ID');
  tracker('track', 'page_view');
</script>`;

const CAPTURED = ['Page views', 'Sessions', 'Custom events', 'Referrers', 'Devices', 'Approximate location'];

export default function Setup() {
  return (
    <section className="mkt-section">
      <div className="mkt-container">
        <SectionHead
          eyebrow="Setup"
          title="From installation to insight in three steps."
          description="WebPulse is a tracker script and a tracking ID. If your site can load JavaScript, it can send analytics."
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
                  <Check className="h-3.5 w-3.5 text-emerald-400/80" aria-hidden="true" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-300">
                    Captured automatically
                  </span>
                </div>
                <ul className="grid grid-cols-2 gap-2">
                  {CAPTURED.map((r) => (
                    <li key={r} className="flex items-center gap-2 text-xs text-slate-400">
                      <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400/80" aria-hidden="true" />
                      {r}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 border-t border-white/[0.06] pt-3 text-[11px] leading-relaxed text-slate-500">
                  Replace <span className="font-mono text-slate-400">YOUR_TRACKING_ID</span> with the
                  ID shown in your project settings.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
