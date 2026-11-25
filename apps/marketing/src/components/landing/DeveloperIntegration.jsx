import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import CopyButton from '../CopyButton';
import CodeSnippet from '../marketing/CodeSnippet';

const SDK_EXAMPLES = [
  {
    id: 'html',
    label: 'HTML Script',
    filename: 'index.html',
    summary: 'Drop in <head>. Fires page_view once initialized with zero client cookies.',
    code: `<script src="https://api.webpulseanalytics.tech/api/v1/track/script.js" async></script>
<script>
  window.addEventListener('load', function () {
    if (window.tracker) {
      window.tracker('init', 'wp_live_your_tracking_id');
      window.tracker('track', 'page_view');
    }
  });
</script>`,
  },
  {
    id: 'react',
    label: 'React SPA',
    filename: 'AnalyticsProvider.jsx',
    summary: 'Load the script once and call window.tracker() inside your router effect on navigation.',
    code: `import { useEffect } from 'react';

export function AnalyticsProvider({ trackingId, children }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://api.webpulseanalytics.tech/api/v1/track/script.js';
    script.async = true;
    script.onload = () => {
      window.tracker?.('init', trackingId);
      window.tracker?.('track', 'page_view');
    };
    document.head.appendChild(script);
    return () => script.remove();
  }, [trackingId]);

  return children;
}`,
  },
  {
    id: 'events',
    label: 'Custom Events',
    filename: 'events.js',
    summary: 'Emit conversion or UI actions alongside optional JSON metadata.',
    code: `// Trigger on button click, form submit, or tier change
window.tracker?.('track', 'upgrade_clicked', {
  plan: 'pro',
  billing: 'monthly',
  source: 'pricing_table',
});`,
  },
  {
    id: 'rest',
    label: 'REST Ingestion',
    filename: 'ingest.sh',
    summary: 'Post server-side or backend telemetry directly via x-api-key header.',
    code: `curl -X POST https://api.webpulseanalytics.tech/api/v1/track/events \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: wp_live_your_tracking_id" \\
  -d '{
    "url": "https://example.com/pricing",
    "referrer": "https://github.com/heyshreee/Web-Pulse-Analytics",
    "event": "page_view"
  }'`,
  },
  {
    id: 'count',
    label: 'Count Endpoint',
    filename: 'count.js',
    summary: 'Fetch aggregate route hit counts for documentation badges or dashboards.',
    code: `const target = encodeURIComponent('https://example.com/docs/api');
const res = await fetch(
  \`https://api.webpulseanalytics.tech/api/v1/analytics/count?url=\${target}\`
);
const { count } = await res.json();`,
  },
];

export default function DeveloperIntegration() {
  const [selectedId, setSelectedId] = useState('html');
  const current = SDK_EXAMPLES.find((ex) => ex.id === selectedId) || SDK_EXAMPLES[0];

  return (
    <section id="integration" className="py-20 sm:py-24 bg-[#0A0A0A]">
      <div className="mkt-container">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
            <h2 className="mkt-h2">One script tag. Or the API.</h2>
            <p className="mkt-lead mt-4 max-w-[46ch] text-[#B3B3AF]">
              Works with plain HTML, React, Next.js, Astro, or Vite. Drop it in{' '}
              <code className="font-mono text-[#F5F5F4]">&lt;head&gt;</code> and send
              events straight to your project endpoint.
            </p>

            <div className="mt-8 space-y-3 bg-[#111111] p-5">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[#969690]">Script size</span>
                <span className="text-[#F5F5F4]">&lt; 1.5 KB (540 B gzip)</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[#969690]">Protocol</span>
                <code className="font-mono text-[#F5F5F4]">HTTPS / WSS</code>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[#969690]">Client API</span>
                <code className="font-mono text-[#FFFFFF]">window.tracker()</code>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-6">
              <Link to="/docs/getting-started" className="mkt-link">
                Read integration guide
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <Link to="/api" className="mkt-link">
                Explore API reference
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7" data-ui="">
            <div className="border border-white/15 bg-[#050505]">
              <div
                role="tablist"
                aria-label="SDK integration examples"
                className="flex flex-wrap border-b border-white/[0.11] bg-[#0F0F0F]"
              >
                {SDK_EXAMPLES.map((tab) => {
                  const active = tab.id === current.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setSelectedId(tab.id)}
                      className={`border-r border-white/[0.08] px-4 py-3 text-[13px] transition-colors ${
                        active
                          ? 'bg-[#171717] font-medium text-[#FFFFFF] border-b-2 border-b-[#FFFFFF]'
                          : 'text-[#B3B3AF] hover:text-[#F5F5F4]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-3">
                <code className="font-mono text-[13px] text-[#969690]">
                  {current.filename}
                </code>
                <CopyButton text={current.code} label="Copy snippet" />
              </div>

              <div role="tabpanel" className="bg-[#050505]">
                <CodeSnippet code={current.code} />
              </div>

              <div className="border-t border-white/[0.08] bg-[#0B0B0B] px-5 py-3">
                <p className="text-sm text-[#B3B3AF]">{current.summary}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
