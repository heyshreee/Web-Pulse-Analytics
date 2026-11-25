import { Link } from 'react-router-dom';

const USE_CASES = [
  {
    audience: 'Indie Hackers & Solo Devs',
    headline: 'Watch launch traffic without complex setup.',
    body: 'Ship a landing page, drop in one script tag, and follow real-time page momentum without configuring multi-tab ad dashboards.',
    link: '/features',
    linkLabel: 'Explore workspace features',
  },
  {
    audience: 'SaaS & Product Teams',
    headline: 'Track docs, marketing, and app signups together.',
    body: 'Assign separate Tracking IDs per environment, restrict hostnames with allowed_origins, and collaborate across Pro or Max seats.',
    link: '/integrations',
    linkLabel: 'View framework guides',
  },
  {
    audience: 'Open-Source Maintainers',
    headline: 'See which docs pages developers read.',
    body: 'Inspect top documentation routes, embed hit counters via GET /api/v1/analytics/count, and publish read-only share links on paid plans.',
    link: '/docs',
    linkLabel: 'Read integration docs',
  },
  {
    audience: 'Agencies & Freelancers',
    headline: 'One-screen reports clients actually understand.',
    body: 'Isolate up to 50 properties inside a single workspace with dedicated keys and concise reporting instead of bloated walkthroughs.',
    link: '/pricing',
    linkLabel: 'Compare project quotas',
  },
];

export default function UseCases() {
  return (
    <section id="use-cases" className="py-20 sm:py-24 bg-[#050505]">
      <div className="mkt-container">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="mkt-h2">Built for people who ship.</h2>
            <p className="mkt-lead mt-4 max-w-[42ch] text-[#B3B3AF]">
              Whether you are running a weekend side project or a production SaaS application.
            </p>
          </div>

          <div className="space-y-4 lg:col-span-8">
            {USE_CASES.map((item) => (
              <article
                key={item.audience}
                className="grid grid-cols-1 gap-5 bg-[#0A0A0A] p-6 sm:p-7 md:grid-cols-12 md:items-start"
              >
                <div className="md:col-span-5">
                  <p className="text-sm font-medium text-[#FFFFFF]">{item.audience}</p>
                  <h3 className="mkt-h3 mt-2">{item.headline}</h3>
                </div>

                <div className="md:col-span-7">
                  <p className="mkt-body max-w-[52ch] text-[#B3B3AF]">{item.body}</p>
                  <div className="mt-4">
                    <Link to={item.link} className="mkt-link">
                      {item.linkLabel}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
