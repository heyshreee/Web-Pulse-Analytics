import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { individualPlans, formatINR } from '../../data/plans';

const getLimit = (plan, label) =>
  plan.limits?.find((item) => item.label === label)?.value ?? '-';

export default function PricingTeaser() {
  return (
    <section id="pricing" className="py-20 sm:py-24 bg-[#0A0A0A]">
      <div className="mkt-container">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <h2 className="mkt-h2">Simple limits. No surprises.</h2>
            <p className="mkt-lead mt-4 max-w-[54ch] text-[#B3B3AF]">
              Start free on Nano. Upgrade manually via one-time Razorpay orders only when
              your traffic outgrows it.
            </p>
          </div>
          <Link to="/pricing" className="mkt-link shrink-0">
            Full tier comparison &amp; Enterprise
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {individualPlans.map((plan) => {
            const featured = plan.kind === 'primary';
            return (
              <div
                key={plan.id}
                className={`flex flex-col justify-between p-6 ${
                  featured ? 'bg-[#151515]' : 'bg-[#0F0F0F]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="mkt-h3 text-[#F5F5F4]">{plan.name}</h3>
                    {featured && (
                      <span className="bg-[#FFFFFF] px-2.5 py-0.5 text-sm font-semibold text-[#050505]">
                        Popular
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-baseline gap-1.5">
                    <span className="text-3xl font-semibold tracking-tight metric-num text-[#F5F5F4]">
                      {formatINR(plan.amount)}
                    </span>
                    <span className="text-sm text-[#969690]">/ month</span>
                  </div>

                  <p className="mt-2.5 min-h-[2.75rem] text-sm text-[#B3B3AF]">
                    {plan.description}
                  </p>

                  <dl data-ui="" className="mt-5 grid grid-cols-2 gap-y-2.5 bg-[#080808] p-4 text-sm">
                    <dt className="text-[#969690]">Events / mo</dt>
                    <dd className="text-right metric-num text-[#F5F5F4]">
                      {getLimit(plan, 'Tracked events / month')}
                    </dd>
                    <dt className="text-[#969690]">Projects</dt>
                    <dd className="text-right metric-num text-[#F5F5F4]">
                      {getLimit(plan, 'Projects')}
                    </dd>
                    <dt className="text-[#969690]">Retention</dt>
                    <dd className="text-right text-[#F5F5F4]">
                      {getLimit(plan, 'Data retention')}
                    </dd>
                    <dt className="text-[#969690]">Refresh</dt>
                    <dd className="text-right text-[#F5F5F4]">
                      {getLimit(plan, 'Dashboard refresh interval')}
                    </dd>
                  </dl>

                  <ul className="mt-5 space-y-2 text-sm text-[#C8C8C4]">
                    {plan.features.slice(0, 4).map((feat) => (
                      <li key={feat}>{feat}</li>
                    ))}
                  </ul>
                </div>

                <Link
                  to={`/register?plan=${plan.id}`}
                  className={`mkt-btn mkt-btn-md mt-7 w-full text-center ${
                    featured ? 'mkt-btn-primary' : 'mkt-btn-secondary'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            );
          })}
        </div>

        <p className="mt-6 max-w-[60ch] text-sm text-[#969690]">
          Monthly event allocations reset on the 1st of each calendar month. Paid orders do not
          auto-renew.
        </p>
      </div>
    </section>
  );
}
