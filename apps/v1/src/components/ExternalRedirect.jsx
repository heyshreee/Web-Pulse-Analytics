import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Redirects the visitor to the canonical Marketing site:
 * - Production default: https://webpulseanalytics.tech
 * - Local development: http://localhost:5174
 */
export default function ExternalRedirect({ to }) {
  const location = useLocation();
  const isProdDomain = typeof window !== 'undefined' &&
    (window.location.hostname === 'webpulseanalytics.tech' || window.location.hostname.endsWith('.webpulseanalytics.tech'));
  const defaultMarketing = isProdDomain ? 'https://webpulseanalytics.tech' : 'http://localhost:5174';
  const marketingBase = (import.meta.env.VITE_MARKETING_URL || defaultMarketing).replace(/\/+$/, '');
  const targetPath = to || location.pathname;
  const targetUrl = `${marketingBase}${targetPath.startsWith('/') ? targetPath : `/${targetPath}`}`;

  useEffect(() => {
    window.location.assign(targetUrl);
  }, [targetUrl]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <p className="text-slate-400 mb-2">Redirecting to WebPulse...</p>
      <a href={targetUrl} className="text-violet-400 hover:underline text-sm">
        Click here if not redirected automatically
      </a>
    </div>
  );
}
