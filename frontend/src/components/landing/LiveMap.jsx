import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import Reveal from '../marketing/Reveal';
import useInView from '../../hooks/useInView';
import { SAMPLE_CITIES, SAMPLE_COUNTRIES } from './sampleData';
// three.js is only fetched once the map actually scrolls into view.
const HeroGlobe = lazy(() => import('./HeroGlobe'));

export default function LiveMap() {
  const [mapRef, inView] = useInView(0.1);

  return (
    <section className="mkt-section">
      <div className="mkt-container">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="mkt-eyebrow mb-4">Geography</p>
            <h2 className="mkt-h2">Where your visitors are, at a glance.</h2>
            <p className="mkt-lead mt-5">
              Country and city are estimated from each request, so you can see which markets
              your site reaches — and where it has room to grow.
            </p>

            <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Top countries · 30 days
            </p>
            <ul className="mt-4 space-y-5">
              {SAMPLE_COUNTRIES.slice(0, 4).map((c) => (
                <li key={c.label}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-slate-200">{c.label}</span>
                    <span className="metric-num text-slate-400">{c.value.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400"
                      style={{ width: `${c.share * 2.8}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>

            <Link to="/features" className="mkt-link mt-8">
              Explore geography analytics
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Reveal>

          <Reveal delay={80}>
            <div ref={mapRef} className="relative">
              <div className="mkt-panel relative aspect-square sm:aspect-[4/3.4] lg:aspect-square">
                <div className="absolute left-4 top-4 z-10 flex flex-col gap-1.5">
                  <span className="mkt-chip !border-white/[0.08] !bg-black/30 !text-[10px] uppercase tracking-[0.14em] backdrop-blur-sm">
                    Visitor map · 30 days
                  </span>
                  <span className="text-[10px] text-slate-500">Illustrative sample data</span>
                </div>

                {inView ? (
                  <Suspense
                    fallback={
                      <div className="flex h-full items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-violet-400" aria-hidden="true" />
                        <span className="sr-only">Loading map preview</span>
                      </div>
                    }
                  >
                    <HeroGlobe cities={SAMPLE_CITIES} className="absolute inset-0" />
                  </Suspense>
                ) : (
                  <div className="absolute inset-0" aria-hidden="true" />
                )}

                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-wrap items-center gap-x-4 gap-y-1 bg-gradient-to-t from-[#070A10] via-[#070A10]/70 to-transparent px-5 pb-4 pt-10">
                  {SAMPLE_CITIES.slice(0, 4).map((c) => (
                    <span key={c.name} className="text-[11px] text-slate-400">
                      <span className="font-medium text-slate-300">{c.name}</span>{' '}
                      <span className="metric-num">{c.count.toLocaleString()}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
