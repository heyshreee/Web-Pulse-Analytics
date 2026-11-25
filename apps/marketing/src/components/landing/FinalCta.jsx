import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { getCanonicalAppUrl } from '../../utils/urls';

export default function FinalCta() {
  const v1Url = getCanonicalAppUrl('v1');
  const v2Url = getCanonicalAppUrl('v2');

  return (
    <section className="py-20 sm:py-24 bg-[#050505]">
      <div className="mkt-container">
        <div className="grid grid-cols-1 gap-8 bg-[#111111] p-8 sm:p-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-8">
            <h2 className="mkt-h2">
              Start on Nano.
              <br />
              Live in two minutes.
            </h2>
            <p className="mkt-lead mt-4 max-w-[52ch] text-[#B3B3AF]">
              No credit card required. Paste the script, refresh your site, and watch the
              first event land.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:col-span-4 lg:items-end">
            <a
              href={`${v1Url}/register`}
              className="mkt-btn mkt-btn-primary mkt-btn-lg w-full sm:w-auto lg:w-full"
            >
              Create free account
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <div className="grid w-full grid-cols-2 gap-3">
              <a
                href="#preview"
                className="mkt-btn mkt-btn-secondary mkt-btn-md text-center"
              >
                View live demo
              </a>
              <a
                href={`${v2Url}/login`}
                className="mkt-btn mkt-btn-secondary mkt-btn-md text-center"
              >
                V2 Beta
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
