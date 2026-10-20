import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import MarketingShell from '../components/marketing/MarketingShell';

export default function NotFound() {
  return (
    <MarketingShell>
      <section className="mkt-section flex min-h-[60vh] items-center">
        <div className="mkt-container text-center">
          <p
            aria-hidden="true"
            className="metric-num select-none font-display text-[7rem] font-bold leading-none tracking-tighter text-white/[0.06] sm:text-[10rem]"
          >
            404
          </p>
          <h1 className="mkt-h2 -mt-6 sm:-mt-10">Page not found</h1>
          <p className="mkt-lead mx-auto mt-4 max-w-lg">
            The page you're looking for doesn't exist or has been moved. Let's get you back on
            track.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/dashboard" className="mkt-btn mkt-btn-primary mkt-btn-md w-full sm:w-auto">
              <Home className="h-4 w-4" aria-hidden="true" />
              Back to dashboard
            </Link>
            <Link to="/" className="mkt-btn mkt-btn-secondary mkt-btn-md w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Go home
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
