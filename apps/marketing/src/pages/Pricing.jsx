import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Minus, Clock, Info, Shield, ArrowRight, Building2, Headphones, Sliders, Users } from 'lucide-react';
import MarketingShell from '../components/marketing/MarketingShell';
import SectionHead from '../components/marketing/SectionHead';
import Reveal from '../components/marketing/Reveal';
import { plans, individualPlans, enterprisePlan, formatINR } from '../data/plans';
import { isAuthenticated } from '../utils/auth';

const planLimit = (planId, label) =>
  plans.find((plan) => plan.id === planId)?.limits.find((limit) => limit.label === label)?.value ?? '—';

const usageRow = (feature, label = feature) => ({
  feature,
  nano: planLimit('nano', label),
  lite: planLimit('lite', label),
  pro: planLimit('pro', label),
  max: planLimit('max', label),
  enterprise: planLimit('enterprise', label),
});

const featureRow = (feature, nano, lite = nano, pro = nano, max = nano, enterprise = max) => ({
  feature,
  nano,
  lite,
  pro,
  max,
  enterprise,
});

const comparisonGroups = [
  {
    label: 'Usage and limits',
    rows: [
      usageRow('Monthly events', 'Tracked events / month'),
      usageRow('Projects', 'Projects'),
      usageRow('Allowed domains', 'Allowed domains / project'),
      usageRow('Data retention', 'Data retention'),
      usageRow('Dashboard refresh interval', 'Dashboard refresh interval'),
    ],
  },
  {
    label: 'Analytics',
    rows: [
      featureRow('Website traffic analytics', 'yes'),
      featureRow('Pages, sources, devices and geography', 'yes'),
      featureRow('Advanced filters', 'no', 'Basic', 'yes', 'yes', 'yes'),
      featureRow('Live event logs', 'no', 'no', 'yes', 'yes', 'yes'),
      featureRow('Analytics API', 'Basic', 'Basic', 'Full', 'Full', 'Custom'),
      featureRow('CSV exports', 'no', 'Limited', 'yes', 'yes', 'yes'),
      featureRow('Advanced reports', 'no', 'no', 'yes', 'yes', 'yes'),
    ],
  },
  {
    label: 'Platform access',
    rows: [
      featureRow('V1 Stable access', 'yes'),
      featureRow('V2 Beta access', 'no', 'no', 'yes', 'yes', 'Configurable'),
      featureRow('Alpha access', 'no', 'no', 'no', 'Invitation', 'Explicitly granted'),
      featureRow('Custom dashboards', 'no', 'no', 'Basic', 'yes', 'yes'),
    ],
  },
  {
    label: 'Team and support',
    rows: [
      featureRow('Team member limits', '1', '1', '3', '10', 'Custom'),
      featureRow('Role-based access (RBAC)', 'no', 'no', 'Basic', 'Advanced', 'Custom'),
      featureRow('Priority support', 'no', 'no', 'no', 'yes', 'Dedicated'),
      featureRow('Custom integrations', 'no', 'no', 'Basic', 'Advanced', 'Custom'),
      featureRow('SLA', 'no', 'no', 'no', 'no', 'Contractual'),
    ],
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
    a: 'Yes. From Billing you can place a new order to upgrade, or move to the Nano plan. Upgrades take effect as soon as payment is confirmed; moving to Nano takes effect immediately. We do not currently support moving straight from one paid plan to another — place a new order for the plan you want. If you move to a lower plan, its limits apply, so you may need to reduce projects or allowed domains to fit.',
  },
  {
    q: 'How is billing handled?',
    a: 'Prices are shown in INR per month of allowance. Paid plans are purchased as one-time orders through Razorpay; there is no subscription, no annual billing, and no automatic renewal. A paid plan stays active until you change it or close your account — the amount is charged once, and your monthly event allowance resets on the first day of each calendar month. Amounts exclude applicable taxes.',
  },
  {
    q: 'Does WebPulse offer a free plan?',
    a: 'Yes. The Nano plan includes one project, one allowed domain, and up to 10,000 tracked events per month. No credit card is required.',
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
    q: 'How does Enterprise pricing work?',
    a: 'Enterprise plans are negotiated contracts based on your specific traffic volume, data retention needs, custom security controls, and SLA commitments. Contact our solutions team for a custom quote.',
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
  const [category, setCategory] = useState('individual'); // 'individual' | 'enterprise'

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
            <p className="mkt-body mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-slate-400">
              Privacy-first website analytics with clear usage boundaries and zero surprise overages.
              Choose the plan that matches your project today, and upgrade as your audience expands.
            </p>

            {/* Category Switcher */}
            <div className="mt-8 flex justify-center">
              <div
                role="tablist"
                aria-label="Pricing category"
                className="inline-flex items-center rounded-xl border border-white/[0.08] bg-white/[0.03] p-1.5 shadow-inner"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={category === 'individual'}
                  onClick={() => setCategory('individual')}
                  className={`rounded-lg px-5 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition-all ${
                    category === 'individual'
                      ? 'bg-violet-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Individual
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={category === 'enterprise'}
                  onClick={() => setCategory('enterprise')}
                  className={`rounded-lg px-5 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition-all ${
                    category === 'enterprise'
                      ? 'bg-violet-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Business & Enterprise
                </button>
              </div>
            </div>
          </Reveal>

          {/* Individual Category (Exactly 4 Cards) */}
          {category === 'individual' && (
            <div className="mt-12 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              {individualPlans.map((plan, i) => {
                const isPrimary = plan.kind === 'primary';
                const isNano = plan.id === 'nano';
                const ctaTo = authenticated
                  ? isNano
                    ? '/dashboard/billing'
                    : `/dashboard/billing?plan=${plan.id}`
                  : `/register?plan=${plan.id}`;
                const ctaLabel = authenticated
                  ? isNano
                    ? 'Manage plan'
                    : `Upgrade to ${plan.name}`
                  : plan.cta;

                return (
                  <Reveal key={plan.id} delay={i * 60} className="h-full">
                    <div
                      className={`mkt-card flex h-full flex-col justify-between p-6 transition-all ${
                        isPrimary
                          ? 'relative border-violet-500/60 bg-gradient-to-b from-violet-500/[0.08] to-transparent shadow-lg shadow-violet-950/20'
                          : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.16]'
                      }`}
                    >
                      <div>
                        {/* Header: Name & Most Popular badge */}
                        <div className="flex items-center justify-between gap-2 min-h-[24px]">
                          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">
                            {plan.name}
                          </h2>
                          {isPrimary && (
                            <span className="rounded-full border border-violet-400/40 bg-violet-600 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white shadow-sm">
                              Most popular
                            </span>
                          )}
                        </div>

                        {/* Price */}
                        <div className="mt-4 flex items-baseline gap-1.5">
                          <span className="metric-num font-display text-3xl font-extrabold text-white">
                            {formatINR(plan.amount)}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">/ month</span>
                        </div>

                        {/* Short Description */}
                        <p className="mt-2.5 text-xs leading-relaxed text-slate-400 min-h-[2.5rem]">
                          {plan.description}
                        </p>

                        <div className="my-5 border-t border-white/[0.06]" />

                        {/* Maximum 3 Differentiating Benefits */}
                        <ul className="space-y-3 text-xs text-slate-300">
                          {plan.benefits.map((benefit) => (
                            <li key={benefit} className="flex items-start gap-2.5 leading-snug">
                              <Check
                                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400"
                                aria-hidden="true"
                              />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* CTA */}
                      <div className="pt-6">
                        <Link
                          to={ctaTo}
                          className={`mkt-btn mkt-btn-md w-full text-xs font-semibold ${
                            isPrimary
                              ? 'mkt-btn-primary'
                              : 'mkt-btn-secondary'
                          }`}
                        >
                          {ctaLabel}
                        </Link>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          )}

          {/* Business & Enterprise Category */}
          {category === 'enterprise' && enterprisePlan && (
            <div className="mt-12 max-w-4xl mx-auto">
              <Reveal>
                <div className="mkt-card p-8 sm:p-10 border-white/[0.12] bg-gradient-to-b from-white/[0.04] to-transparent shadow-xl">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 border-b border-white/[0.08] pb-8">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-violet-300 mb-3">
                        <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Enterprise intelligence
                      </div>
                      <h2 className="text-2xl font-bold text-white tracking-tight">
                        Business & Enterprise
                      </h2>
                      <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
                        Tailored for high-scale organizations requiring high-throughput data pipelines,
                        granular governance, custom compliance, and contractual uptime guarantees.
                      </p>
                    </div>

                    <div className="flex flex-col items-start md:items-end shrink-0">
                      <span className="font-display text-3xl font-extrabold text-white">
                        Custom pricing
                      </span>
                      <span className="text-xs text-slate-400 mt-1">
                        Commercial agreement based on capacity
                      </span>
                      <a
                        href="mailto:sales@webpulseanalytics.tech?subject=WebPulse%20Enterprise%20Inquiry"
                        className="mkt-btn mkt-btn-primary mkt-btn-md mt-4 w-full md:w-auto text-xs font-semibold px-6"
                      >
                        Contact Sales
                      </a>
                    </div>
                  </div>

                  {/* Enterprise Capabilities Grid */}
                  <div className="mt-8">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 mb-5">
                      Included enterprise capabilities
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        {
                          title: 'Negotiated event capacity',
                          desc: 'Dedicated ingestion pipelines handling tens of millions of events per month with zero throttling.',
                          icon: Sliders,
                        },
                        {
                          title: 'Custom project and domain limits',
                          desc: 'Register as many properties and allowed origins as your business units demand.',
                          icon: Building2,
                        },
                        {
                          title: 'Advanced RBAC & governance',
                          desc: 'Organization-wide role-based access control, SSO, and complete audit logging.',
                          icon: Users,
                        },
                        {
                          title: 'Configurable Beta & Alpha access',
                          desc: 'Early access to V2 Beta features and explicitly granted experimental Alpha pipelines.',
                          icon: Shield,
                        },
                        {
                          title: 'Custom data retention',
                          desc: 'Extended retention policies (12 to 36+ months) matching your internal compliance rules.',
                          icon: Clock,
                        },
                        {
                          title: 'Dedicated support & SLA',
                          desc: '99.9% contractual uptime SLA, direct engineering channel, and priority resolution.',
                          icon: Headphones,
                        },
                      ].map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <div
                            key={item.title}
                            className="flex items-start gap-3.5 rounded-lg border border-white/[0.05] bg-white/[0.02] p-4"
                          >
                            <div className="rounded-md border border-violet-400/20 bg-violet-500/10 p-2 text-violet-300 shrink-0">
                              <ItemIcon className="h-4 w-4" aria-hidden="true" />
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold text-slate-200">{item.title}</h4>
                              <p className="mt-1 text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-slate-400">
                    <p>Need custom procurement, invoicing, or security assessment documentation?</p>
                    <a
                      href="mailto:sales@webpulseanalytics.tech?subject=WebPulse%20Security%20and%20Compliance%20Inquiry"
                      className="mkt-link text-violet-400 hover:text-violet-300 font-medium inline-flex items-center gap-1"
                    >
                      Request security pack
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </Reveal>
            </div>
          )}

          <Reveal className="mt-8">
            <p className="mx-auto max-w-3xl text-center text-xs leading-relaxed text-slate-500">
              Prices are in INR per month of allowance. Paid plans are one-time orders with no
              hidden fees and no automatic surprise renewal; your allowance resets on the first day
              of each calendar month.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Feature comparison table */}
      <section className="mkt-section-tight border-t border-white/[0.06]" id="compare">
        <div className="mkt-container">
          <SectionHead
            title="Compare features and limits"
            description="Detailed specifications across all WebPulse tiers, from personal testing to dedicated enterprise operations."
          />

          <Reveal className="mt-10">
            <div className="mkt-card overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left">
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
                        className={`px-5 py-5 text-left ${
                          plan.id === 'pro' ? 'bg-violet-500/[0.03]' : ''
                        }`}
                      >
                        <div className="font-semibold text-slate-100">{plan.name}</div>
                        <div className="mt-0.5 text-xs font-normal text-slate-500">
                          {formatINR(plan.amount)}{plan.amount === 'custom' ? '' : ' / month'}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                {comparisonGroups.map((group) => (
                  <tbody key={group.label} className="divide-y divide-white/[0.05]">
                    <tr className="bg-white/[0.02]">
                      <th
                        colSpan={6}
                        scope="rowgroup"
                        className="px-6 pb-2.5 pt-5 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500"
                      >
                        {group.label}
                      </th>
                    </tr>
                    {group.rows.map((row) => (
                      <tr key={row.feature} className="transition-colors hover:bg-white/[0.02]">
                        <th scope="row" className="px-6 py-4 text-xs font-medium text-slate-300">
                          {row.feature}
                        </th>
                        {plans.map((plan) => (
                          <td
                            key={plan.id}
                            className={`px-5 py-4 text-xs ${
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
          </Reveal>

          <Reveal className="mt-8">
            <div className="mkt-card mx-auto max-w-4xl p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-violet-300" aria-hidden="true" />
                <div>
                  <h2 className="text-sm font-semibold text-slate-100">
                    What the dashboard refresh interval means
                  </h2>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
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

      {/* FAQs */}
      <section className="mkt-section-tight border-t border-white/[0.06]">
        <div className="mkt-container max-w-4xl">
          <SectionHead
            eyebrow="Questions"
            title="Frequently asked questions"
            description="Everything you need to know about WebPulse plans, limits, and billing."
          />

          <div className="mt-10 divide-y divide-white/[0.06]">
            {faqs.map((faq) => (
              <Reveal key={faq.q} className="py-6 first:pt-0 last:pb-0">
                <h3 className="text-sm font-semibold text-slate-100">{faq.q}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{faq.a}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
