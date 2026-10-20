import { Link } from 'react-router-dom';
import { Check, Minus, HelpCircle, Clock, Info } from 'lucide-react';
import MarketingShell from '../components/marketing/MarketingShell';
import SectionHead from '../components/marketing/SectionHead';
import Reveal from '../components/marketing/Reveal';
import { plans, formatINR } from '../data/plans';
import { isAuthenticated } from '../utils/auth';

const planLimit = (planId, label) =>
  plans.find((plan) => plan.id === planId)?.limits.find((limit) => limit.label === label)?.value ?? '—';

const usageRow = (feature, label = feature) => ({
  feature,
  free: planLimit('free', label),
  basic: planLimit('basic', label),
  pro: planLimit('pro', label),
  business: planLimit('business', label),
});

const featureRow = (feature, free, basic = free, pro = free, business = free) => ({
  feature,
  free,
  basic,
  pro,
  business,
});

const comparisonGroups = [
  {
    label: 'Usage limits',
    rows: [
      usageRow('Tracked events / month'),
      usageRow('Projects'),
      usageRow('Allowed domains / project'),
      usageRow('Dashboard refresh interval'),
    ],
  },
  {
    label: 'Analytics',
    rows: [
      featureRow('Website traffic analytics', 'yes'),
      featureRow('Pages, sources, devices, and geography', 'yes'),
      featureRow('Custom events and REST API', 'yes'),
      featureRow('Historical analytics', 'yes'),
    ],
  },
  {
    label: 'Activity and reporting',
    rows: [
      featureRow('CSV activity export', 'yes'),
      featureRow('Live activity logs', 'no', 'no', 'yes', 'yes'),
      featureRow('Public reports', 'no', 'no', '5', '100'),
    ],
  },
  {
    label: 'Access',
    rows: [featureRow('Team access', 'no', 'no', 'no', 'Planned')],
  },
];

const tableCell = (value) => {
  if (value === 'yes') {
    return (
      <span
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10"
        title="Included"
      >
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
  if (value === 'Planned') {
    return (
      <span
        className="inline-flex items-center rounded-full border border-violet-400/25 bg-violet-500/10 px-2.5 py-0.5 text-xs font-semibold text-violet-300"
        title="Planned, not available today"
      >
        Planned
        <span className="sr-only">, not available today</span>
      </span>
    );
  }
  return <span className="metric-num text-sm font-medium text-slate-200">{value}</span>;
};

const faqs = [
  {
    q: 'Can I change my plan at any time?',
    a: 'Yes. From Billing you can place a new order to upgrade, and move to the Free plan. Upgrades take effect as soon as payment is confirmed; moving to Free takes effect immediately. We do not currently support moving straight from one paid plan to another — place a new order for the plan you want. If you move to a lower plan, its limits apply, so you may need to reduce projects or allowed domains to fit.',
  },
  {
    q: 'How is billing handled?',
    a: 'Prices are shown in INR per month of allowance. Paid plans are purchased as one-time orders through Razorpay; there is no subscription, no annual billing, and no automatic renewal. A paid plan stays active until you change it or close your account — the amount is charged once, and your monthly event allowance resets on the first day of each calendar month. Amounts exclude applicable taxes.',
  },
  {
    q: 'Does WebPulse offer a free plan?',
    a: 'Yes. The Free plan includes one project, one allowed domain per project, and up to 1,000 tracked events per month. No credit card is required.',
  },
  {
    q: 'What happens when I reach my monthly event limit?',
    a: 'We notify you at 80% of your monthly event limit. At 100%, new tracked events are rejected until your allowance resets on the first day of the next calendar month or you upgrade. Rejected events are not stored. Project and domain limits are enforced separately.',
  },
  {
    q: 'What counts as a tracked event?',
    a: 'Each page view or custom event accepted by WebPulse counts as one tracked event. Requests rejected for duplicate detection, bot filtering, or plan-limit enforcement do not count. Events sent through the JavaScript tracker or REST API follow the same rules.',
  },
  {
    q: 'Which plans support public reports?',
    a: 'Pro includes up to five public reports, and Business includes up to 100. Free and Basic do not include public reports. A public report is a read-only, 30-day view of a project, so share the link only with people who should see that data.',
  },
  {
    q: 'When does my monthly event allowance reset?',
    a: 'Your event allowance resets on the first day of each calendar month. Your Billing page shows current usage and the next reset date. Upgrading raises your limit immediately but does not reset usage already counted in the current month.',
  },
  {
    q: 'Can I use WebPulse with my existing website or framework?',
    a: 'WebPulse works on websites that can load its JavaScript tracker. You can also send supported events through the REST API. See the documentation for setup and compatibility details.',
  },
];

export default function Pricing() {
  const authenticated = isAuthenticated();

  return (
    <MarketingShell tone="hero">
      <section className="relative pb-16 pt-10 sm:pt-14 lg:pb-20">
        <div className="mkt-container">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="mkt-eyebrow mb-4">Pricing</p>
            <h1 className="mkt-h1">
              Simple, transparent <span className="mkt-accent-text">pricing.</span>
            </h1>
            <p className="mkt-lead mt-5">Start free. Scale as your traffic grows.</p>
            <p className="mkt-body mx-auto mt-5 max-w-2xl">
              Get website analytics with clear usage limits and no unnecessary complexity. Choose
              the plan that fits your traffic today, and upgrade when you need more capacity.
            </p>
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
              {[
                'No credit card required for Free',
                'Clear monthly limits',
                'Built for developers',
              ].map((point) => (
                <li key={point} className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Plan cards */}
          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan, i) => {
              const isPrimary = plan.kind === 'primary';
              const ctaTo = authenticated
                ? plan.id === 'free'
                  ? '/dashboard/billing'
                  : `/dashboard/billing?plan=${plan.id}`
                : `/register?plan=${plan.id}`;
              const ctaLabel = authenticated
                ? plan.id === 'free'
                  ? 'Manage plan'
                  : `Upgrade to ${plan.name}`
                : plan.cta;

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

                    <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">
                      {plan.name}
                    </h2>
                    <p className="mt-3 min-h-[4rem] text-sm leading-relaxed text-slate-400">
                      {plan.description}
                    </p>
                    <div className="mt-3 flex items-baseline gap-1.5">
                      <span className="metric-num font-display text-3xl font-bold text-slate-100">
                        {formatINR(plan.amount)}
                      </span>
                      <span className="text-sm text-slate-500">/ month</span>
                    </div>

                    <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Usage limits
                    </p>
                    <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-4 border-y border-white/[0.06] py-4">
                      {plan.limits.map((limit) => (
                        <div key={limit.label}>
                          <dt className="text-[11px] leading-tight text-slate-500">{limit.label}</dt>
                          <dd className="metric-num mt-1 text-sm font-semibold text-slate-200">
                            {limit.value}
                          </dd>
                        </div>
                      ))}
                    </dl>

                    <p className="mt-5 text-sm font-semibold text-slate-200">{plan.leadIn}</p>
                    <ul className="mt-3 flex-1 space-y-2.5">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-300">
                          <Check
                            className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                            aria-hidden="true"
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {plan.plannedNote && (
                      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-slate-500">
                        <Clock
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400/80"
                          aria-hidden="true"
                        />
                        {plan.plannedNote}
                      </p>
                    )}

                    <Link
                      to={ctaTo}
                      className={`mkt-btn mkt-btn-md mt-7 w-full ${
                        isPrimary
                          ? 'mkt-btn-primary border border-transparent'
                          : 'mkt-btn-secondary'
                      }`}
                    >
                      {ctaLabel}
                    </Link>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Reveal className="mt-6">
            <p className="mx-auto max-w-3xl text-center text-[13px] leading-relaxed text-slate-400">
              Prices are in INR and shown per month of allowance. Paid plans are one-time orders
              with no subscription and no automatic renewal, and the plan stays active until you
              change it. Amounts exclude applicable taxes.
            </p>
          </Reveal>

          <Reveal className="mt-8">
            <div className="mkt-card mx-auto max-w-4xl p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-violet-300" aria-hidden="true" />
                <div>
                  <h2 className="text-sm font-semibold text-slate-100">
                    What the dashboard refresh interval means
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                    It is how often the dashboard requests fresh data from WebPulse. It is not a
                    guarantee that events are ingested, processed, or visible within that interval.
                    Actual delivery can vary with traffic and network conditions.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Feature comparison */}
      <section className="mkt-section-tight border-t border-white/[0.06]">
        <div className="mkt-container">
          <SectionHead
            title="Compare features and limits"
            description="Every plan includes the core analytics dashboard. The table below shows how usage limits and advanced features differ."
          />

          <Reveal className="mt-10">
            <div className="mkt-card overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <caption className="sr-only">Comparison of WebPulse plan features and limits</caption>
                <thead>
                  <tr className="border-b border-white/[0.07]">
                    <th
                      scope="col"
                      className="px-6 py-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500"
                    >
                      Feature
                    </th>
                    {plans.map((plan) => (
                      <th
                        key={plan.id}
                        scope="col"
                        className={`px-6 py-5 text-left ${
                          plan.id === 'pro' ? 'bg-violet-500/[0.03]' : ''
                        }`}
                      >
                        <div className="font-semibold text-slate-100">{plan.name}</div>
                        <div className="mt-0.5 text-xs font-normal text-slate-500">
                          {formatINR(plan.amount)} / month
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                {comparisonGroups.map((group) => (
                  <tbody key={group.label} className="divide-y divide-white/[0.05]">
                    <tr className="bg-white/[0.02]">
                      <th
                        colSpan={5}
                        scope="rowgroup"
                        className="px-6 pb-2.5 pt-5 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500"
                      >
                        {group.label}
                      </th>
                    </tr>
                    {group.rows.map((row) => (
                      <tr key={row.feature} className="transition-colors hover:bg-white/[0.02]">
                        <th scope="row" className="px-6 py-4 text-sm font-medium text-slate-300">
                          {row.feature}
                        </th>
                        {plans.map((plan) => (
                          <td
                            key={plan.id}
                            className={`px-6 py-4 text-sm ${
                              plan.id === 'pro' ? 'bg-violet-500/[0.03]' : ''
                            }`}
                          >
                            {tableCell(row[plan.id])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                ))}
              </table>
            </div>

            <div className="mt-5 space-y-2 text-xs leading-relaxed text-slate-400">
              <p>
                Dashboard refresh interval describes how often the dashboard requests fresh data. It
                is not a guarantee that events are ingested, processed, or visible within that
                interval.
              </p>
              <p>
                Allowed domains are configured per project. Historical analytics currently covers
                24-hour, 7-day, and 30-day views on every plan. CSV activity export covers the
                activity log, which is retained for 30 days; it is not a full analytics export.
              </p>
              <p>Team access is planned and is not available in any plan today.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="mkt-section-tight border-t border-white/[0.06]">
        <div className="mkt-container">
          <SectionHead
            title="Frequently asked questions"
            description="How billing, usage limits, and plan changes work."
          />
          <div className="mx-auto mt-10 max-w-3xl space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="mkt-card p-6">
                <h3 className="flex items-start gap-3 font-semibold text-slate-100">
                  <HelpCircle
                    className="mt-0.5 h-5 w-5 shrink-0 text-violet-300"
                    aria-hidden="true"
                  />
                  {faq.q}
                </h3>
                <p className="mkt-body ml-8 mt-2 !text-[0.9375rem]">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
