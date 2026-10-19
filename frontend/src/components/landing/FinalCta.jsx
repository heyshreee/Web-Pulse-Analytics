import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Reveal from '../marketing/Reveal';

export default function FinalCta() {
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
            <Link to="/register" className="mkt-btn mkt-btn-primary mkt-btn-lg w-full sm:w-auto">
              Start tracking free
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/login" className="mkt-btn mkt-btn-secondary mkt-btn-lg w-full sm:w-auto">
              Log in to your dashboard
            </Link>
          </div>

          <p className="mt-5 text-xs text-slate-500">
            Free plan · No credit card required · Open source
          </p>
        </Reveal>
      </div>
    </section>
  );
}
