import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowDown,
  Activity,
  Braces,
  Atom,
  Server,
  Plug,
} from 'lucide-react';
import MarketingShell from '../components/marketing/MarketingShell';
import SectionHead from '../components/marketing/SectionHead';
import Reveal from '../components/marketing/Reveal';
import CodeSnippet from '../components/marketing/CodeSnippet';

function FlowDiagram({ steps }) {
  return (
    <div className="mt-6 flex flex-col items-center gap-1">
      {steps.map((s, i) => (
        <div key={s}>
          <div className="rounded-lg border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-center text-xs font-semibold text-violet-300">
            {s}
          </div>
          {i < steps.length - 1 && (
            <ArrowDown className="mx-auto my-1 h-4 w-4 text-slate-600" aria-hidden="true" />
          )}
        </div>
      ))}
    </div>
  );
}

const codeExample = `const data = await analytics.query({
  metric: "pageViews",
  startDate: "2026-01-01",
  endDate: "2026-01-31",
  groupBy: "day"
});`;

const integrations = [
  {
    icon: Activity,
    title: 'WebPulse Tracking',
    headline: 'Add analytics to your website.',
    description:
      'WebPulse provides a tracking layer for collecting page views and custom events from your application.',
    flow: ['Tracking ID', 'Your website', 'WebPulse', 'Analytics'],
    link: { to: '/api', label: 'Learn about tracking' },
  },
  {
    icon: Braces,
    title: 'REST API',
    headline: 'Build on top of your analytics.',
    description:
      'Query your WebPulse analytics data programmatically and connect it to your own applications, internal tools, and workflows.',
    code: codeExample,
    link: { to: '/api', label: 'Explore the API' },
  },
  {
    icon: Atom,
    title: 'React',
    headline: 'Works naturally with React applications.',
    description:
      "WebPulse's current frontend is built with React, and the project documents a JavaScript analytics module that can be initialized with a tracking ID and endpoint.",
    flow: ['React application', 'WebPulse Analytics', 'Events', 'Dashboard'],
    link: { to: '/register', label: 'Get started' },
  },
  {
    icon: Server,
    title: 'Node.js',
    headline: 'Send analytics from your backend.',
    description:
      'Use the WebPulse API from your Node.js application to integrate analytics into your existing backend workflows.',
    flow: ['Node.js', 'WebPulse API', 'Analytics data'],
    link: { to: '/docs', label: 'API documentation' },
  },
];

const supported = [
  'JavaScript',
  'React',
  'Node.js',
  'REST API',
  'Custom events',
  'Page-view tracking',
];

export default function Integrations() {
  return (
    <MarketingShell>
      <section className="mkt-section">
        <div className="mkt-container">
          <SectionHead
            eyebrow="Integrations"
            title={
              <>
                Connect your <span className="mkt-accent-text">stack</span> to WebPulse
              </>
            }
            description="Track events from your applications, query analytics through the API, and build the integrations your workflow needs."
          />

          <div className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-2">
            {integrations.map((item, i) => (
              <Reveal key={item.title} delay={(i % 2) * 70} className="h-full">
                <article className="mkt-card mkt-card-hover flex h-full flex-col p-6 sm:p-7">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                    <item.icon className="h-6 w-6 text-violet-300" aria-hidden="true" />
                  </div>
                  <h2 className="text-lg font-semibold tracking-tight text-slate-100">
                    {item.title}
                  </h2>
                  <p className="mt-1.5 text-sm font-medium text-slate-200">{item.headline}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.description}</p>

                  {item.flow && <FlowDiagram steps={item.flow} />}

                  {item.code && (
                    <div className="mkt-panel mt-6">
                      <CodeSnippet code={item.code} />
                    </div>
                  )}

                  <div className="mt-auto pt-6">
                    <Link to={item.link.to} className="mkt-link">
                      {item.link.label}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          {/* Build your own */}
          <Reveal className="mx-auto mt-8 max-w-5xl">
            <div className="mkt-panel p-6 sm:p-10">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                  <Plug className="h-5 w-5 text-violet-300" aria-hidden="true" />
                </div>
                <h2 className="mkt-h3 !text-xl">Build your own integration</h2>
              </div>
              <p className="text-lg font-semibold text-slate-100">WebPulse is API-first.</p>
              <p className="mkt-body mt-1 max-w-2xl">
                You don't need a pre-built connector for every service. If your application can
                make an HTTP request, it can work with WebPulse.
              </p>

              <div className="mb-8 mt-8 flex flex-col items-center gap-1">
                {['Your App', 'WebPulse API', 'Analytics'].map((s, i, arr) => (
                  <div key={s}>
                    <div className="rounded-lg border border-violet-400/30 bg-violet-500/15 px-5 py-2 text-center text-xs font-semibold text-violet-200">
                      {s}
                    </div>
                    {i < arr.length - 1 && (
                      <div className="my-1 flex items-center justify-center gap-2">
                        <span className="text-[10px] uppercase tracking-widest text-slate-500">
                          {i === 0 ? 'Events' : 'Data'}
                        </span>
                        <ArrowDown className="h-4 w-4 text-slate-600" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Supported today
              </p>
              <div className="flex flex-wrap gap-2">
                {supported.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs font-medium text-slate-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </MarketingShell>
  );
}
