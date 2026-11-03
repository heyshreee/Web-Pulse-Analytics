import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Logo from '../Logo';

export const REPO_URL = 'https://github.com/heyshreee/Web-Pulse-Analytics';

const columns = [
  {
    heading: 'Product',
    links: [
      { to: '/features', label: 'Features' },
      { to: '/integrations', label: 'Integrations' },
      { to: '/pricing', label: 'Pricing' },
      { to: '/api', label: 'API' },
    ],
  },
  {
    heading: 'Developers',
    links: [
      { to: '/docs', label: 'Documentation' },
      { to: '/docs/getting-started', label: 'Getting started' },
      { to: '/docs/api', label: 'API reference' },
      { to: REPO_URL, label: 'GitHub repository', external: true },
    ],
  },
  {
    heading: 'Company',
    links: [
      { to: '/blog', label: 'Blog' },
      { to: '/community', label: 'Community' },
      { to: '/help', label: 'Help center' },
      { to: '/security', label: 'Security' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { to: '/privacy', label: 'Privacy policy' },
      { to: '/terms', label: 'Terms of service' },
      { to: '/cookies', label: 'Cookie policy' },
    ],
  },
];

function FooterLink({ to, label, external }) {
  const className =
    'inline-block text-sm text-slate-400 transition-colors hover:text-slate-100';
  if (external) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" className={className}>
        {label}
      </a>
    );
  }
  return (
    <Link to={to} className={className}>
      {label}
    </Link>
  );
}

export default function MarketingFooter() {
  return (
    <footer className="relative border-t border-white/[0.07] bg-[#070A10]">
      <div className="mkt-container py-14 lg:py-16">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-3 lg:grid-cols-12">
          <div className="col-span-2 md:col-span-3 lg:col-span-4">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Real-time web analytics that turns page views, sessions, and custom events
              into a live view of your website.
            </p>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mkt-btn mkt-btn-secondary mkt-btn-sm mt-5"
            >
              Built in the open
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>

          {columns.map((col) => (
            <nav key={col.heading} aria-label={col.heading} className="lg:col-span-2">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                {col.heading}
              </h2>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <FooterLink {...l} />
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/[0.07] pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} WebPulse Analytics
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link to="/privacy" className="text-xs text-slate-500 transition-colors hover:text-slate-300">
              Privacy
            </Link>
            <Link to="/terms" className="text-xs text-slate-500 transition-colors hover:text-slate-300">
              Terms
            </Link>
            <Link to="/cookies" className="text-xs text-slate-500 transition-colors hover:text-slate-300">
              Cookies
            </Link>
            <a
              href={`${REPO_URL}/issues`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-500 transition-colors hover:text-slate-300"
            >
              Report an issue
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
