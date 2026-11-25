import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import MarketingShell from '../components/marketing/MarketingShell';

export default function NotFound() {
  return (
    <MarketingShell grid>
      <section className="noir-section flex min-h-[65vh] items-center">
        <div className="mkt-container text-center">
          <p
            aria-hidden="true"
            className="metric-num select-none font-mono text-[6rem] font-semibold leading-none tracking-tight text-white/[0.1] sm:text-[9rem]"
          >
            404
          </p>
          <h1 className="mkt-h2 -mt-4">Page not found</h1>
          <p className="mkt-lead mx-auto mt-4 max-w-lg text-[#B3B3AF]">
            The route requested does not exist or has moved. Return to the marketing home
            or launch your analytics workspace.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/dashboard" className="mkt-btn mkt-btn-primary mkt-btn-md w-full sm:w-auto">
              <Home className="h-4 w-4" aria-hidden="true" />
              Open workspace
            </Link>
            <Link to="/" className="mkt-btn mkt-btn-secondary mkt-btn-md w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Return home
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
