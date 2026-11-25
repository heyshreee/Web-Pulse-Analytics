import { useState } from 'react';
import LiveMap from './LiveMap';
import { DEVICE_BREAKDOWN, TOP_PAGES, TOP_REFERRERS } from './sampleData';

const VIEWS = [
  {
    id: 'traffic',
    title: 'Pages & Routes',
    description:
      'Top landing paths, hit counts, exit pages, and route transitions tracked on your property.',
  },
  {
    id: 'acquisition',
    title: 'Referrers & UTMs',
    description:
      'External referring domains, search traffic, direct visits, and standard UTM query tags.',
  },
  {
    id: 'devices',
    title: 'Devices & Browsers',
    description:
      'OS, browser engine, and viewport share parsed from request headers without fingerprinting.',
  },
  {
    id: 'geography',
    title: 'Geography',
    description:
      'Country, region, and city approximation resolved server-side without browser location prompts.',
  },
];

export default function Capabilities() {
  const [active, setActive] = useState('traffic');

  return (
    <section id="capabilities" className="py-20 sm:py-24 bg-[#0A0A0A]">
      <div className="mkt-container">
        <div className="max-w-xl">
          <h2 className="mkt-h2">Every dimension, one view.</h2>
          <p className="mkt-lead mt-4 max-w-[54ch] text-[#B3B3AF]">
            Switch tabs to inspect routes, referrers, devices, and geography exposed by the
            console and REST API.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div
            role="tablist"
            aria-label="Analytics capability views"
            className="space-y-2 lg:col-span-5"
          >
            {VIEWS.map((view) => {
              const selected = active === view.id;
              return (
                <button
                  key={view.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActive(view.id)}
                  className={`w-full px-5 py-4 text-left transition-colors ${
                    selected
                      ? 'bg-[#161616] text-[#F5F5F4]'
                      : 'bg-[#0E0E0E] text-[#B3B3AF] hover:bg-[#131313]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-base font-semibold text-[#F5F5F4]">
                      {view.title}
                    </span>
                    {selected && (
                      <span className="h-2 w-2 shrink-0 bg-[#FFFFFF]" aria-hidden="true" />
                    )}
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#B3B3AF]">
                    {view.description}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-7" role="tabpanel">
            {active === 'traffic' && (
              <div className="border border-white/15 bg-[#050505] p-5 sm:p-6" data-ui="">
                <div className="flex items-center justify-between border-b border-white/[0.11] pb-4">
                  <h3 className="text-base font-semibold text-[#F5F5F4]">
                    Route performance index
                  </h3>
                  <code className="font-mono text-[13px] text-[#969690]">
                    GET /api/v1/analytics/*
                  </code>
                </div>
                <div className="mt-4 divide-y divide-white/[0.08]">
                  {TOP_PAGES.map((row) => (
                    <div
                      key={row.path}
                      className="grid grid-cols-12 items-center gap-3 py-3.5 text-[13px]"
                    >
                      <code className="col-span-5 truncate font-mono text-[#F5F5F4]">
                        {row.path}
                      </code>
                      <span className="col-span-4 text-[#969690]">{row.trend}</span>
                      <span className="col-span-3 text-right font-semibold metric-num text-[#FFFFFF]">
                        {row.views}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {active === 'acquisition' && (
              <div className="border border-white/15 bg-[#050505] p-5 sm:p-6" data-ui="">
                <div className="flex items-center justify-between border-b border-white/[0.11] pb-4">
                  <h3 className="text-base font-semibold text-[#F5F5F4]">
                    Referrer &amp; UTM attribution
                  </h3>
                  <span className="text-[13px] text-[#969690]">Illustrative sample</span>
                </div>
                <div className="mt-4 space-y-4">
                  {TOP_REFERRERS.map((ref) => (
                    <div key={ref.source} className="space-y-1.5">
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="text-[#F5F5F4]">{ref.source}</span>
                        <span className="metric-num text-[#B3B3AF]">
                          {ref.visitors} · {ref.pct}%
                        </span>
                      </div>
                      <div className="h-[4px] bg-white/[0.08]">
                        <div
                          className="h-full bg-[#FFFFFF]"
                          style={{ width: `${ref.pct * 2.5}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {active === 'devices' && (
              <div className="border border-white/15 bg-[#050505] p-5 sm:p-6" data-ui="">
                <div className="flex items-center justify-between border-b border-white/[0.11] pb-4">
                  <h3 className="text-base font-semibold text-[#F5F5F4]">
                    Environment &amp; viewport share
                  </h3>
                  <span className="text-[13px] text-[#969690]">User-Agent + Viewport</span>
                </div>
                <div className="mt-5 space-y-4">
                  {DEVICE_BREAKDOWN.map((dev) => (
                    <div key={dev.label} className="bg-[#0B0B0B] p-4">
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="text-base font-medium text-[#F5F5F4]">{dev.label}</span>
                        <span className="text-base font-semibold metric-num text-[#FFFFFF]">
                          {dev.share}%
                        </span>
                      </div>
                      <div className="mt-2.5 h-[4px] bg-white/[0.08]">
                        <div
                          className="h-full bg-[#FFFFFF]"
                          style={{ width: `${dev.share}%` }}
                        />
                      </div>
                      <p className="mt-2.5 text-[13px] text-[#B3B3AF]">{dev.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {active === 'geography' && <LiveMap />}
          </div>
        </div>
      </div>
    </section>
  );
}
