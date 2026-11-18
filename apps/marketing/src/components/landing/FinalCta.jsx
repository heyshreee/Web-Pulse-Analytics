import { ArrowRight } from 'lucide-react';
import Reveal from '../marketing/Reveal';
import { getCanonicalAppUrl } from '../../utils/urls';

export default function FinalCta() {
  const v1Url = getCanonicalAppUrl('v1');
  return (
    <section className="relative overflow-hidden py-24 sm:py-28">
      <div
        aria-hidden="true"
        className="mkt-glow bottom-[-160px] left-1/2 h-[360px] w-[640px] max-w-[110vw] -translate-x-1/2 bg-violet-600/20"
      />

      <div className="mkt-container relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="mkt-h2">
            Stop guessing what your
            <br className="hidden sm:block" /> website is telling you.
          </h2>
          <p className="mkt-lead mx-auto mt-5 max-w-xl">
            Create a project, add the tracker, and watch the first visitors arrive. The free plan
            is enough to get real analytics on a real site.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href={`${v1Url}/register`} className="mkt-btn mkt-btn-primary mkt-btn-lg w-full sm:w-auto">
              Start tracking free
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a href={`${v1Url}/login`} className="mkt-btn mkt-btn-secondary mkt-btn-lg w-full sm:w-auto">
              Log in to your dashboard
            </a>
          </div>

          <p className="mt-5 text-xs text-slate-500">
            Free plan · No credit card required · Developer-friendly setup · Open source
          </p>
        </Reveal>
      </div>
    </section>
  );
}
