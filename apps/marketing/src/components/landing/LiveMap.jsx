import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SAMPLE_REGIONS } from './sampleData';

export default function LiveMap() {
  return (
    <div className="border border-white/15 bg-[#050505] p-5 sm:p-6" data-ui="">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.11] pb-4">
        <div>
          <h3 className="text-base font-semibold text-[#F5F5F4]">
            Regional traffic breakdown
          </h3>
          <p className="mt-1 text-sm text-[#B3B3AF]">
            Country and city approximation resolved via HTTPS ipwho.is cache and geoip-lite fallback.
          </p>
        </div>
        <span className="text-[13px] text-[#969690]">Illustrative sample</span>
      </div>

      <div className="mt-5 divide-y divide-white/[0.08]">
        {SAMPLE_REGIONS.map((region) => (
          <div
            key={region.code}
            className="grid grid-cols-12 items-center gap-3 py-3 text-[13px]"
          >
            <code className="col-span-2 font-mono text-[#FFFFFF]">{region.code}</code>
            <div className="col-span-5 sm:col-span-4">
              <span className="text-sm font-medium text-[#F5F5F4]">
                {region.country}
              </span>
              <span className="block truncate text-[13px] text-[#969690]">
                {region.cities}
              </span>
            </div>
            <div className="col-span-3 sm:col-span-4">
              <div className="h-[4px] w-full bg-white/[0.08]">
                <div
                  className="h-full bg-[#FFFFFF]/80"
                  style={{ width: `${region.share}%` }}
                />
              </div>
            </div>
            <span className="col-span-2 text-right font-semibold metric-num text-[#F5F5F4]">
              {region.visitors}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.11] pt-4 text-sm text-[#B3B3AF]">
        <span>No GPS tracking or browser location prompts.</span>
        <Link to="/security" className="mkt-link">
          Inspect data disclosure
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
