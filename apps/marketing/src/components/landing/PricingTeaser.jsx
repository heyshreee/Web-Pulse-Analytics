import { Link } from 'react-router-dom';
import { ArrowRight, Check, Clock } from 'lucide-react';
import SectionHead from '../marketing/SectionHead';
import Reveal from '../marketing/Reveal';
import { plans, formatINR } from '../../data/plans';

/**
 * Compact pricing summary on the landing page. Full comparison lives at
 * /pricing; both read from the same canonical plan definitions.
 */
export default function PricingTeaser() {
  return (
    <section className="mkt-section scroll-mt-24" id="pricing">
      <div className="mkt-container">
        <SectionHead
          eyebrow="Pricing"
          title="Start free. Upgrade when the traffic does."
          description="Start with 1,000 tracked events per month. Higher tiers raise your event, project, and domain limits; Pro and Business add live activity logs and public reports."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const highlighted = plan.kind === 'primary';
            return (
              <Reveal
                key={plan.id}
                className={`mkt-card flex flex-col p-6 ${
                  highlighted
                    ? '!border-violet-500/40 bg-gradient-to-b from-violet-500/[0.10] to-transparent'
                    : 'mkt-card-hover'
                }`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
                    {plan.name}
                  </h3>
                  {highlighted && (
                    <span className="rounded-full border border-violet-400/30 bg-violet-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-200">
                      Most popular
                    </span>
                  )}
                </div>

                <p className="flex items-baseline gap-1.5">
                  <span className="metric-num mkt-h3 !text-[2rem] !font-extrabold !text-white">
                    {formatINR(plan.amount)}
                  </span>
                  <span className="text-sm text-slate-500">/ month</span>
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{plan.description}</p>

                <dl className="mt-5 grid grid-cols-2 gap-x-3 gap-y-3 border-y border-white/[0.06] py-4">
                  {plan.limits.map((limit) => (
                    <div key={limit.label}>
                      <dt className="text-[11px] leading-tight text-slate-500">{limit.label}</dt>
                      <dd className="metric-num mt-1 text-sm font-semibold text-slate-200">
                        {limit.value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <ul className="mt-5 flex-1 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-300">
                      <Check
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400/80"
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
                  to={`/register?plan=${plan.id}`}
                  className={`mkt-btn mkt-btn-md mt-7 w-full ${
                    highlighted ? 'mkt-btn-primary border border-transparent' : 'mkt-btn-secondary'
                  }`}
                >
                  {plan.cta}
                </Link>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-10 flex flex-col items-center gap-3 text-center">
          <p className="max-w-3xl text-xs leading-relaxed text-slate-500">
            Prices are in INR per month of allowance. Paid plans are one-time orders with no
            subscription and no automatic renewal; the plan stays active until you change it, and
            amounts exclude applicable taxes. The Free plan does not require a credit card.
          </p>
          <Link to="/pricing" className="mkt-link">
            Compare all plans and limits
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
