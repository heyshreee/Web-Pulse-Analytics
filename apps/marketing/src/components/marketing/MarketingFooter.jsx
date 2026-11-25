import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Logo from '../Logo';
import { getCanonicalAppUrl } from '../../utils/urls';

export const REPO_URL = 'https://github.com/heyshreee/Web-Pulse-Analytics';

export default function MarketingFooter() {
  const v1Url = getCanonicalAppUrl('v1');
  const v2Url = getCanonicalAppUrl('v2');
  const year = new Date().getFullYear();

  const columns = [
    {
      heading: 'Product',
      links: [
        { to: '/features', label: 'Features' },
        { to: '/integrations', label: 'Integrations' },
        { to: '/pricing', label: 'Pricing' },
        { to: '/api', label: 'REST API' },
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
      heading: 'Consoles',
      links: [
        { to: `${v1Url}/login`, label: 'V1 Console login', externalSameTab: true },
        { to: `${v1Url}/register`, label: 'Create V1 account', externalSameTab: true },
        { to: `${v2Url}/login`, label: 'V2 Beta entry', externalSameTab: true },
        { to: '/security', label: 'Security disclosure' },
      ],
    },
    {
      heading: 'Company & Legal',
      links: [
        { to: '/blog', label: 'Engineering blog' },
        { to: '/community', label: 'Community' },
        { to: '/help', label: 'Help center' },
        { to: '/privacy', label: 'Privacy policy' },
        { to: '/terms', label: 'Terms of service' },
        { to: '/cookies', label: 'Cookie policy' },
      ],
    },
  ];

  return (
    <footer className="relative bg-[#0A0A0A]">
      <div className="mkt-container py-14 lg:py-20">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4 lg:grid-cols-12">
          <div className="col-span-2 md:col-span-4 lg:col-span-4">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#B3B3AF]">
              WebPulse Analytics. Fast, cookie-conscious web telemetry built for developers
              who want answers without ad-tech bloat.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mkt-btn mkt-btn-secondary mkt-btn-sm"
              >
                Open source on GitHub
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <nav key={col.heading} aria-label={col.heading} className="lg:col-span-2">
              <h2 className="mb-4 text-[13px] font-medium text-[#969690]">
                {col.heading}
              </h2>
              <ul className="space-y-2.5">
                {col.links.map((item) => (
                  <li key={item.label}>
                    {item.external ? (
                      <a
                        href={item.to}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-[#C8C8C4] transition-colors hover:text-[#FFFFFF]"
                      >
                        {item.label}
                        <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                      </a>
                    ) : item.externalSameTab ? (
                      <a
                        href={item.to}
                        className="inline-block text-sm text-[#C8C8C4] transition-colors hover:text-[#FFFFFF]"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        to={item.to}
                        className="inline-block text-sm text-[#C8C8C4] transition-colors hover:text-[#FFFFFF]"
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 pt-6 sm:flex-row sm:items-center">
          <p className="text-[13px] text-[#969690]">
            &copy; {year} WebPulse Analytics &middot; Built in the open
          </p>
          <p className="text-[13px] text-[#969690]">
            Zero client cookies &middot; Socket.IO + REST telemetry
          </p>
        </div>
      </div>
    </footer>
  );
}
