import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PIPELINE_STAGES = [
  {
    stage: 'Edge Beacon',
    route: 'GET /api/v1/track/script.js',
    summary:
      'Sends a minimal JSON payload via navigator.sendBeacon (or fetch keepalive fallback) on initialization or window.tracker() calls.',
    notes: '0 cookies · 0 localStorage',
  },
  {
    stage: 'Guards & Geo',
    route: 'POST /api/v1/track/events',
    summary:
      'Checks per-project allowed_origins, filters known bots, deduplicates repeat hits, computes SHA-256 session signatures, and looks up region.',
    notes: 'allowed_origins · isBot · ipwho.is',
  },
  {
    stage: 'Live Broadcast',
    route: 'Socket.IO + REST /v1',
    summary:
      'Validated events emit room-scoped visitor_update broadcasts to active workspaces alongside authenticated REST query routes.',
    notes: 'V1 stable · V2 beta',
  },
  {
    stage: 'Postgres Storage',
    route: 'PostgreSQL / Supabase',
    summary:
      'Writes normalized rows across visitors, sessions, page_views, events, daily rollups, and counters. Visitor IP strings are retained as collected.',
    notes: 'Owner-scoped rows · SQL schema',
  },
];

export default function Architecture() {
  return (
    <section id="architecture" className="py-20 sm:py-24 bg-[#050505]">
      <div className="mkt-container">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="mkt-h2">How the data moves.</h2>
            <p className="mkt-lead mt-4 max-w-[44ch] text-[#B3B3AF]">
              A straightforward ingestion pipeline you can inspect directly in the
              repository.
            </p>
            <div className="mt-6">
              <Link to="/security" className="mkt-link">
                Read technical data disclosure
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <p className="mt-8 bg-[#0B0B0B] p-5 text-sm leading-relaxed text-[#B3B3AF]">
              <strong className="font-medium text-[#F5F5F4]">IP storage disclosure:</strong>{' '}
              Tracked browsers hold zero cookies. Our server records currently persist visitor IP strings on visitor rows alongside hashed daily session signatures.
            </p>
          </div>

          <div className="space-y-4 lg:col-span-8">
            {PIPELINE_STAGES.map((node) => (
              <div
                key={node.stage}
                className="grid grid-cols-1 gap-4 bg-[#0A0A0A] p-6 sm:grid-cols-12"
              >
                <div className="sm:col-span-5">
                  <h3 className="mkt-h3">{node.stage}</h3>
                  <code className="mt-1.5 block font-mono text-sm text-[#FFFFFF]">
                    {node.route}
                  </code>
                </div>
                <div className="sm:col-span-7">
                  <p className="text-sm leading-relaxed text-[#B3B3AF]">{node.summary}</p>
                  <p className="mt-3 text-sm text-[#C8C8C4]">{node.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
