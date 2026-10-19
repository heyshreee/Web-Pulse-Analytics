import { Link } from 'react-router-dom';
import { Check, Minus, HelpCircle } from 'lucide-react';
import MarketingShell from '../components/marketing/MarketingShell';
import SectionHead from '../components/marketing/SectionHead';
import Reveal from '../components/marketing/Reveal';
import { plans } from '../data/plans';

const tableRows = [
  { feature: 'Real-time monitoring', free: 'yes', basic: 'yes', pro: 'yes', business: 'yes' },
  { feature: 'Traffic analytics', free: 'yes', basic: 'yes', pro: 'yes', business: 'yes' },
  { feature: 'Visitor tracking', free: 'yes', basic: 'yes', pro: 'yes', business: 'yes' },
  { feature: 'Performance analytics', free: 'yes', basic: 'yes', pro: 'yes', business: 'yes' },
  { feature: 'Custom dashboards', free: 'yes', basic: 'yes', pro: 'yes', business: 'yes' },
  { feature: 'Historical data', free: 'yes', basic: 'yes', pro: 'yes', business: 'yes' },
  { feature: 'Alerts & notifications', free: 'yes', basic: 'yes', pro: 'yes', business: 'yes' },
  { feature: 'REST API', free: 'yes', basic: 'yes', pro: 'yes', business: 'yes' },
  { feature: 'Error tracking', free: 'yes', basic: 'yes', pro: 'yes', business: 'yes' },
  { feature: 'Report export', free: 'yes', basic: 'yes', pro: 'yes', business: 'yes' },
  { feature: 'Multiple projects', free: 'no', basic: 'yes', pro: 'yes', business: 'yes' },
  { feature: 'Advanced reporting', free: 'no', basic: 'no', pro: 'yes', business: 'yes' },
  { feature: 'Team access', free: 'no', basic: 'no', pro: 'no', business: 'Planned' },
];

const tableCell = (value) => {
  if (value === 'yes') {
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10">
        <Check className="h-3 w-3 text-emerald-300" aria-hidden="true" />
        <span className="sr-only">Included</span>
      </span>
    );
  }
  if (value === 'no') {
    return (
      <>
        <Minus className="h-4 w-4 text-slate-600" aria-hidden="true" />
        <span className="sr-only">Not included</span>
      </>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-violet-400/25 bg-violet-500/10 px-2.5 py-0.5 text-xs font-semibold text-violet-300">
      {value}
    </span>
  );
};

const faqs = [
  {
    q: 'Can I upgrade or downgrade?',
    a: 'Yes. Your plan determines the features and usage limits available to your account.',
  },
  {
    q: 'Is there a free plan?',
    a: 'Yes. WebPulse provides a free starting point for personal projects and experimentation.',
  },
  {
    q: 'What happens when I reach my usage limit?',
    a: "We'll notify you when you're approaching your plan's usage limit. Tracking behavior after the limit depends on your plan.",
  },
];

export default function Pricing() {
  return (
    <MarketingShell>
      <section className="mkt-section">
        <div className="mkt-container">
          <SectionHead
            eyebrow="Pricing"
            title={
              <>
                Simple pricing. <span className="mkt-accent-text">Start free.</span>
              </>
            }
            description="Explore WebPulse with the core analytics tools you need to understand your website. Upgrade as the platform grows."
          />

          {/* Plan cards */}
          <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan, i) => {
              const isPrimary = plan.kind === 'primary';
              return (
                <Reveal key={plan.id} delay={i * 60} className="h-full">
                  <div
                    className={`mkt-card flex h-full flex-col p-6 ${
                      isPrimary ? 'relative border-violet-400/40 bg-violet-500/[0.06]' : 'mkt-card-hover'
                    }`}
                  >
                    {isPrimary && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-violet-400/40 bg-violet-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-lg">
                        Most popular
                      </span>
                    )}

                    <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">
                      {plan.name}
                    </h3>
                    <div className="mt-3 flex items-baseline gap-1.5">
                      <span className="metric-num font-display text-3xl font-bold text-slate-100">
                        {plan.price}
                      </span>
                      <span className="text-sm text-slate-500">/ month</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{plan.tagline}</p>

                    <ul className="mt-6 flex-1 space-y-2.5">
                      {plan.leadIn && (
                        <li className="text-sm font-semibold text-slate-200">{plan.leadIn}</li>
                      )}
                      {plan.items.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                          <Check
                            className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                            aria-hidden="true"
                          />
                          {item}
                        </li>
                      ))}
                    </ul>

                    <Link
                      to="/register"
                      className={`mkt-btn mt-7 w-full ${
                        isPrimary ? 'mkt-btn-primary' : 'mkt-btn-secondary'
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* Feature comparison */}
          <Reveal className="mt-24">
            <h2 className="mkt-h3 text-center !text-2xl sm:!text-3xl">Compare plans</h2>
            <div className="mkt-card mt-10 overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-white/[0.07]">
                    <th
                      scope="col"
                      className="px-6 py-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500"
                    >
                      Feature
                    </th>
                    {plans.map((plan) => (
                      <th key={plan.id} scope="col" className="px-6 py-5 text-left">
                        <div className="font-semibold text-slate-100">{plan.name}</div>
                        <div className="mt-0.5 text-xs font-normal text-slate-500">
                          {plan.price} / month
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {tableRows.map((row) => (
                    <tr key={row.feature} className="transition-colors hover:bg-white/[0.02]">
                      <th
                        scope="row"
                        className="px-6 py-4 text-sm font-medium text-slate-300"
                      >
                        {row.feature}
                      </th>
                      <td className="px-6 py-4 text-sm">{tableCell(row.free)}</td>
                      <td className="px-6 py-4 text-sm">{tableCell(row.basic)}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-100">
                        {tableCell(row.pro)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-100">
                        {tableCell(row.business)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>

          {/* FAQ */}
          <Reveal className="mx-auto mt-24 max-w-3xl">
            <h2 className="mkt-h3 text-center !text-2xl sm:!text-3xl">
              Frequently asked questions
            </h2>
            <div className="mt-10 space-y-4">
              {faqs.map((faq) => (
                <div key={faq.q} className="mkt-card p-6">
                  <h3 className="flex items-start gap-3 font-semibold text-slate-100">
                    <HelpCircle
                      className="mt-0.5 h-5 w-5 shrink-0 text-violet-300"
                      aria-hidden="true"
                    />
                    {faq.q}
                  </h3>
                  <p className="mkt-body ml-8 mt-2 !text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </MarketingShell>
  );
}
