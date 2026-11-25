import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Minus, Clock, Info, Shield, ArrowRight, Building2, Headphones, Sliders, Users } from 'lucide-react';
import MarketingShell from '../components/marketing/MarketingShell';
import SectionHead from '../components/marketing/SectionHead';
import Reveal from '../components/marketing/Reveal';
import { plans, individualPlans, enterprisePlan, formatINR } from '../data/plans';
import { isAuthenticated } from '../utils/auth';

const planLimit = (planId, label) =>
  plans.find((plan) => plan.id === planId)?.limits.find((limit) => limit.label === label)?.value ?? '-';

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
        className="inline-flex h-5 w-5 items-center justify-center border border-[#FFFFFF]/40 bg-[#FFFFFF]/10"
        title="Included"
      >
        <Check className="h-3 w-3 text-[#FFFFFF]" aria-hidden="true" />
        <span className="sr-only">Included</span>
      </span>
    );
  }
  if (value === 'no') {
    return (
      <>
        <Minus className="h-4 w-4 text-[#8E8E88]" aria-hidden="true" />
        <span className="sr-only">Not included</span>
      </>
    );
  }
  if (value === 'Planned') {
    return (
      <span
        className="inline-flex items-center border border-white/20 bg-white/[0.04] px-2.5 py-0.5 font-mono text-[13px] text-[#C8C8C4]"
        title="Planned, not available today"
      >
        Planned
        <span className="sr-only">, not available today</span>
      </span>
    );
  }
  return <span className="metric-num font-mono text-[13px] text-[#F5F5F4]">{value}</span>;
};

const faqs = [
  {
    q: 'Can I change my plan at any time?',
    a: 'Yes. From Billing you can place a new order to upgrade, or move to the Nano plan. Upgrades take effect as soon as payment is confirmed; moving to Nano takes effect immediately. Moving between paid plans works by placing a new order for the plan you want.',
  },
  {
    q: 'How is billing handled?',
    a: 'Prices are shown in INR per month of allowance. Paid plans are purchased as one-time orders through Razorpay; there is no subscription, no annual billing, and no automatic renewal. Monthly event allowances reset on the first day of each calendar month.',
  },
  {
    q: 'Does WebPulse offer a free plan?',
    a: 'Yes. The Nano plan includes one project, one allowed domain, and up to 10,000 tracked events per month. No credit card is required.',
  },
  {
    q: 'What happens when I reach my monthly event limit?',
    a: 'We notify you at 80% of your monthly event limit. At 100%, new tracked events are rejected until your allowance resets on the first day of the next calendar month or you upgrade. Rejected events are not stored.',
  },
  {
    q: 'What counts as a tracked event?',
    a: 'Each page view or custom event accepted by WebPulse counts as one tracked event. Requests rejected for duplicate detection, bot filtering, or plan-limit enforcement do not count.',
  },
  {
    q: 'How does Enterprise pricing work?',
    a: 'Enterprise plans are negotiated contracts based on your specific traffic volume, data retention needs, custom security controls, and SLA commitments.',
  },
  {
    q: 'When does my monthly event allowance reset?',
    a: 'Your event allowance resets on the first day of each calendar month. Your Billing page shows current usage and the next reset date.',
  },
  {
    q: 'Can I use WebPulse with my existing website or framework?',
    a: 'WebPulse works on websites that can load its JavaScript tracker. You can also send supported events through the REST API.',
  },
];

export default function Pricing() {
  const authenticated = isAuthenticated();
  const [category, setCategory] = useState('individual');

  return (
    <MarketingShell tone="hero" grid>
      <section className="relative pb-16 pt-12 sm:pt-16 lg:pb-20">
        <div className="mkt-container">
          <Reveal className="max-w-3xl">
            <p className="noir-meta mb-4 text-[#FFFFFF]">Pricing</p>
            <h1 className="mkt-h1">
              Simple, transparent <span className="text-[#FFFFFF]">pricing.</span>
            </h1>
            <p className="mkt-lead mt-5">
              Start free on Nano. Scale as your traffic grows with predictable event ceilings and
              zero surprise overage charges.
            </p>

            {/* Category Switcher */}
            <div className="mt-8">
              <div
                role="tablist"
                aria-label="Pricing category"
                className="inline-flex border border-white/15 bg-[#0A0A0A]"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={category === 'individual'}
                  onClick={() => setCategory('individual')}
                  className={`px-5 py-2.5 font-mono text-[13px] transition-colors ${
                    category === 'individual'
                      ? 'bg-[#FFFFFF] font-semibold text-[#050505]'
                      : 'text-[#C8C8C4] hover:text-[#F5F5F4]'
                  }`}
                >
                  Individual (4 tiers)
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={category === 'enterprise'}
                  onClick={() => setCategory('enterprise')}
                  className={`border-l border-white/15 px-5 py-2.5 font-mono text-[13px] transition-colors ${
                    category === 'enterprise'
                      ? 'bg-[#FFFFFF] font-semibold text-[#050505]'
                      : 'text-[#C8C8C4] hover:text-[#F5F5F4]'
                  }`}
                >
                  Business &amp; Enterprise
                </button>
              </div>
            </div>
          </Reveal>

          {category === 'individual' && (
            <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
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
                  <Reveal key={plan.id} delay={i * 40} className="h-full">
                    <div
                      className={`flex h-full flex-col justify-between border p-6 transition-colors ${
                        isPrimary
                          ? 'border-[#FFFFFF] bg-[#0F0F0F]'
                          : 'border-white/[0.13] bg-[#0B0B0B] hover:border-white/25'
                      }`}
                    >
                      <div>
                        <div className="flex min-h-[28px] items-center justify-between gap-2">
                          <h2 className="text-base font-semibold text-[#F5F5F4]">
                            {plan.name}
                          </h2>
                          {isPrimary && (
                            <span className="bg-[#FFFFFF] px-2.5 py-0.5 font-mono text-[13px] font-semibold text-[#050505]">
                              Most popular
                            </span>
                          )}
                        </div>

                        <div className="mt-5 flex items-baseline gap-1.5 border-t border-white/[0.08] pt-5">
                          <span className="metric-num text-3xl font-semibold text-[#F5F5F4]">
                            {formatINR(plan.amount)}
                          </span>
                          <span className="font-mono text-[13px] text-[#969690]">/ month</span>
                        </div>

                        <p className="mt-2.5 min-h-[2.75rem] text-sm leading-relaxed text-[#B3B3AF]">
                          {plan.description}
                        </p>

                        <div className="my-5 border-t border-white/[0.08]" />

                        <ul className="space-y-3 text-sm text-[#C8C8C4]">
                          {plan.benefits.map((benefit) => (
                            <li key={benefit} className="flex items-start gap-2.5 leading-snug">
                              <Check
                                className="mt-1 h-3.5 w-3.5 shrink-0 text-[#FFFFFF]"
                                aria-hidden="true"
                              />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-7">
                        <Link
                          to={ctaTo}
                          className={`mkt-btn mkt-btn-md w-full ${
                            isPrimary ? 'mkt-btn-primary' : 'mkt-btn-secondary'
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

          {category === 'enterprise' && enterprisePlan && (
            <div className="mt-12 max-w-4xl">
              <Reveal>
                <div className="border border-white/15 bg-[#0B0B0B] p-8 sm:p-10">
                  <div className="flex flex-col justify-between gap-6 border-b border-white/[0.11] pb-8 md:flex-row md:items-start">
                    <div>
                      <p className="noir-meta mb-3 text-[#FFFFFF]">Enterprise intelligence</p>
                      <h2 className="mkt-h2">Business &amp; Enterprise</h2>
                      <p className="mt-3 max-w-xl text-base leading-relaxed text-[#B3B3AF]">
                        Tailored for organizations requiring high-throughput pipelines,
                        granular governance, custom compliance controls, and contractual SLAs.
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col items-start md:items-end">
                      <span className="text-3xl font-semibold text-[#F5F5F4]">
                        Custom pricing
                      </span>
                      <span className="mt-1 font-mono text-[13px] text-[#969690]">
                        Commercial capacity agreement
                      </span>
                      <a
                        href="mailto:sales@webpulseanalytics.tech?subject=WebPulse%20Enterprise%20Inquiry"
                        className="mkt-btn mkt-btn-primary mkt-btn-md mt-4 w-full px-6 md:w-auto"
                      >
                        Contact Sales
                      </a>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="noir-meta mb-5 text-[#969690]">
                      Included enterprise capabilities
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {[
                        {
                          title: 'Negotiated event capacity',
                          desc: 'Dedicated ingestion pipelines handling high monthly volume without throttling.',
                          icon: Sliders,
                        },
                        {
                          title: 'Custom project and domain limits',
                          desc: 'Register as many properties and allowed origins as your organization needs.',
                          icon: Building2,
                        },
                        {
                          title: 'Advanced RBAC & governance',
                          desc: 'Organization-wide role-based access control, SSO options, and audit trails.',
                          icon: Users,
                        },
                        {
                          title: 'Configurable Beta & Alpha access',
                          desc: 'Early access to V2 Beta capabilities and opted-in experimental pipelines.',
                          icon: Shield,
                        },
                        {
                          title: 'Custom data retention',
                          desc: 'Extended retention schedules aligned with internal data policies.',
                          icon: Clock,
                        },
                        {
                          title: 'Dedicated support & SLA',
                          desc: 'Contractual uptime agreements and direct engineering escalation.',
                          icon: Headphones,
                        },
                      ].map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <div
                            key={item.title}
                            className="flex items-start gap-3.5 border border-white/[0.09] bg-[#050505] p-4"
                          >
                            <ItemIcon
                              className="mt-0.5 h-4 w-4 shrink-0 text-[#FFFFFF]"
                              aria-hidden="true"
                            />
                            <div>
                              <h4 className="text-sm font-semibold text-[#F5F5F4]">{item.title}</h4>
                              <p className="mt-1 text-sm leading-relaxed text-[#B3B3AF]">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col justify-between gap-4 border-t border-white/[0.11] pt-6 text-sm text-[#B3B3AF] sm:flex-row sm:items-center">
                    <p>Need custom procurement, invoicing, or security assessment documentation?</p>
                    <a
                      href="mailto:sales@webpulseanalytics.tech?subject=WebPulse%20Security%20and%20Compliance%20Inquiry"
                      className="mkt-link shrink-0"
                    >
                      Request security pack
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </Reveal>
            </div>
          )}

          <p className="mt-8 font-mono text-[13px] leading-relaxed text-[#969690]">
            Prices are in INR per month of allowance. Paid plans are one-time Razorpay orders with no
            automatic renewal; monthly allowances reset on the 1st of each calendar month.
          </p>
        </div>
      </section>

      {/* Feature comparison table */}
      <section className="noir-section bg-[#080808]" id="compare">
        <div className="mkt-container">
          <SectionHead
            eyebrow="Specification"
            title="Compare features and limits"
            description="Detailed quotas across all WebPulse tiers, from Nano to Enterprise deployments."
          />

          <div className="mt-10 border border-white/[0.11] bg-[#050505] overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <caption className="sr-only">Comparison of WebPulse plan features and limits</caption>
              <thead>
                <tr className="border-b border-white/[0.11]">
                  <th
                    scope="col"
                    className="px-6 py-5 font-mono text-[13px] font-medium text-[#969690]"
                  >
                    Feature
                  </th>
                  {plans.map((plan) => (
                    <th
                      key={plan.id}
                      scope="col"
                      className={`px-5 py-5 text-left ${
                        plan.id === 'pro' ? 'bg-[#FFFFFF]/[0.04]' : ''
                      }`}
                    >
                      <div className="text-sm font-semibold text-[#F5F5F4]">{plan.name}</div>
                      <div className="mt-0.5 font-mono text-[13px] font-normal text-[#969690]">
                        {formatINR(plan.amount)}
                        {plan.amount === 'custom' ? '' : ' / month'}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              {comparisonGroups.map((group) => (
                <tbody key={group.label} className="divide-y divide-white/[0.08]">
                  <tr className="bg-[#0B0B0B]">
                    <th
                      colSpan={6}
                      scope="rowgroup"
                      className="px-6 pb-2.5 pt-5 text-left font-mono text-[13px] font-medium text-[#FFFFFF]"
                    >
                      {group.label}
                    </th>
                  </tr>
                  {group.rows.map((row) => (
                    <tr key={row.feature} className="transition-colors hover:bg-white/[0.02]">
                      <th scope="row" className="px-6 py-4 text-sm font-medium text-[#C8C8C4]">
                        {row.feature}
                      </th>
                      {plans.map((plan) => (
                        <td
                          key={plan.id}
                          className={`px-5 py-4 text-sm ${
                            plan.id === 'pro' ? 'bg-[#FFFFFF]/[0.04]' : ''
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

          <div className="mt-8 border border-white/[0.11] bg-[#050505] p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#FFFFFF]" aria-hidden="true" />
              <div>
                <h2 className="text-base font-semibold text-[#F5F5F4]">
                  What the dashboard refresh interval means
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-[#B3B3AF]">
                  It is how often the dashboard requests fresh data from WebPulse. Actual visible
                  delivery varies with traffic spikes and network latency.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="noir-section bg-[#050505]">
        <div className="mkt-container max-w-4xl">
          <SectionHead
            eyebrow="Questions"
            title="Frequently asked questions"
            description="Details on WebPulse plans, monthly event limits, and billing cadence."
          />

          <div className="mt-10 divide-y divide-white/[0.11] border-y border-white/[0.11]">
            {faqs.map((faq) => (
              <div key={faq.q} className="py-6">
                <h3 className="text-base font-semibold text-[#F5F5F4]">{faq.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#B3B3AF]">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
