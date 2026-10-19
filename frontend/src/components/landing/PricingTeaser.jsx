import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import SectionHead from '../marketing/SectionHead';
import Reveal from '../marketing/Reveal';
import { plans } from '../../data/plans';

/**
 * Compact pricing summary on the landing page. Full comparison lives at
 * /pricing; both read from the same canonical plan definitions.
 */
export default function PricingTeaser() {
  return (
    <section className="mkt-section" id="pricing">
      <div className="mkt-container">
        <SectionHead
          eyebrow="Pricing"
          title="Start free. Upgrade when the traffic does."
          description="Every plan includes real-time analytics. Higher tiers raise your usage limits and add reporting, team, and support features."
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
                      Popular
                    </span>
                  )}
                </div>

                <p className="flex items-baseline gap-1.5">
                  <span className="metric-num mkt-h3 !text-[2rem] !font-extrabold !text-white">
                    {plan.price}
                  </span>
                  <span className="text-sm text-slate-500">/ month</span>
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{plan.tagline}</p>

                <ul className="mt-6 flex-1 space-y-2.5">
                  {(plan.items.slice(0, 4)).map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[13px] text-slate-300">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400/80" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/register"
                  className={`mkt-btn mkt-btn-md mt-7 w-full ${
                    highlighted ? 'mkt-btn-primary' : 'mkt-btn-secondary'
                  }`}
                >
                  {plan.id === 'free' ? 'Start free' : plan.id === 'business' ? 'Contact sales' : `Choose ${plan.name}`}
                </Link>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-10 text-center">
          <Link to="/pricing" className="mkt-link">
            Compare all plans and limits
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
