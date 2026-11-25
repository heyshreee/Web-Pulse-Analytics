import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCanonicalAppUrl } from '../../utils/urls';
import { SAMPLE_PAYLOAD, SAMPLE_STREAMS } from './sampleData';

export default function Hero() {
  const v1Url = getCanonicalAppUrl('v1');
  const [probeTab, setProbeTab] = useState('stream');

  return (
    <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-24">
      <div className="mkt-container">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
          {/* Left editorial column */}
          <div className="lg:col-span-7">
            <h1 className="text-[1.6875rem] font-semibold leading-[1.05] tracking-[-0.036em] md:text-[2.35rem] lg:text-[3.25rem]">
              <span className="block text-[#B3B3AF]">Understand your traffic,</span>
              <span className="block text-[#FFFFFF]">not your users.</span>
            </h1>

            <p className="mkt-lead mt-6 max-w-[54ch] text-[#C8C8C4]">
              Real-time web analytics in one lightweight script. No cookies, no bloated
              dashboards, and full visibility into routes, sources, and custom events.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={`${v1Url}/register`}
                className="mkt-btn mkt-btn-primary mkt-btn-lg"
              >
                Start free
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="#preview"
                className="mkt-btn mkt-btn-secondary mkt-btn-lg"
              >
                Live demo
              </a>
              <Link
                to="/docs"
                className="mkt-btn mkt-btn-ghost mkt-btn-md text-[#C8C8C4]"
              >
                Read the docs
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            {/* Grounded micro-specs matching real collector code */}
            <dl className="mt-12 grid grid-cols-1 gap-6 bg-[#0A0A0A] p-5 sm:grid-cols-3">
              <div>
                <dt className="text-sm font-semibold text-[#F5F5F4]">&lt; 1.5 KB</dt>
                <dd className="mt-1 text-sm text-[#B3B3AF]">
                  540-byte gzipped collector. Loads async, never blocks rendering.
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-[#F5F5F4]">Zero cookies</dt>
                <dd className="mt-1 text-sm text-[#B3B3AF]">
                  Writes no visitor cookies and zero browser localStorage keys.
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-[#F5F5F4]">Socket.IO + REST</dt>
                <dd className="mt-1 text-sm text-[#B3B3AF]">
                  Events stream live over Socket.IO as requests hit your pages.
                </dd>
              </div>
            </dl>
          </div>

          {/* Right live telemetry probe */}
          <div className="lg:col-span-5" data-ui="">
            <div className="border border-white/15 bg-[#0A0A0A]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.11] px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="mkt-live-dot" aria-hidden="true" />
                  <span className="text-sm font-medium text-[#F5F5F4]">
                    Ingestion probe
                  </span>
                </div>
                <span className="text-[13px] text-[#969690]">
                  Illustrative sample
                </span>
              </div>

              <div
                role="tablist"
                aria-label="Telemetry probe mode"
                className="grid grid-cols-2 border-b border-white/[0.11] bg-[#0F0F0F]"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={probeTab === 'stream'}
                  onClick={() => setProbeTab('stream')}
                  className={`px-4 py-2.5 text-left text-sm transition-colors ${
                    probeTab === 'stream'
                      ? 'bg-[#171717] font-medium text-[#FFFFFF] border-b-2 border-[#FFFFFF]'
                      : 'text-[#B3B3AF] hover:text-[#F5F5F4]'
                  }`}
                >
                  Live event feed
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={probeTab === 'payload'}
                  onClick={() => setProbeTab('payload')}
                  className={`border-l border-white/[0.08] px-4 py-2.5 text-left text-sm transition-colors ${
                    probeTab === 'payload'
                      ? 'bg-[#171717] font-medium text-[#FFFFFF] border-b-2 border-[#FFFFFF]'
                      : 'text-[#B3B3AF] hover:text-[#F5F5F4]'
                  }`}
                >
                  <code className="font-mono text-[13px]">POST /track/events</code>
                </button>
              </div>

              {probeTab === 'stream' ? (
                <div role="tabpanel" className="divide-y divide-white/[0.08]">
                  {SAMPLE_STREAMS.slice(0, 5).map((row) => (
                    <div
                      key={row.id}
                      className="flex items-center justify-between gap-4 px-4 py-3 mkt-feed-item"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#F5F5F4]">
                          <code className="font-mono text-[13px]">{row.path}</code>
                        </p>
                        <p className="mt-0.5 truncate text-[13px] text-[#969690]">
                          {row.referrer} · {row.country} · {row.device}
                        </p>
                      </div>
                      <div className="shrink-0 text-right text-[13px] metric-num">
                        <span className="font-medium text-[#FFFFFF]">{row.status}</span>
                        <span className="block text-[#969690]">{row.time}</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between bg-[#0F0F0F] px-4 py-2.5 text-[13px] text-[#B3B3AF]">
                    <span>Origin check: verified</span>
                    <span className="text-[#FFFFFF]">Bot filter active</span>
                  </div>
                </div>
              ) : (
                <div role="tabpanel" className="p-4 sm:p-5">
                  <pre className="overflow-x-auto font-mono text-[13px] leading-relaxed text-[#C8C8C4]">
                    <code>{SAMPLE_PAYLOAD}</code>
                  </pre>
                  <div className="mt-4 border-t border-white/[0.08] pt-3 text-[13px] text-[#969690]">
                    Headers: <code className="font-mono text-[#F5F5F4]">x-api-key</code> · Zero client cookies written
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
