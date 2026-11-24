import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { PageHead } from '../components/ui/Page';
import { Card, CardHead, CardTitle, CardSub, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Display';
import { useToast } from '../context/ToastContext';
import { fmtInt, downloadFile } from '../lib/format';

const INDIVIDUAL_PLANS = [
  {
    id: 'nano',
    name: 'Nano',
    amount: '₹0',
    period: '/ month',
    desc: 'For personal websites and testing.',
    benefits: [
      'Core visitor analytics & page views',
      'Basic REST API access',
      'V1 Stable production dashboard',
    ],
    cta: 'Current plan',
    kind: 'secondary'
  },
  {
    id: 'lite',
    name: 'Lite',
    amount: '₹199',
    period: '/ month',
    desc: 'For individual developers.',
    benefits: [
      'Everything in Nano',
      '30-day extended data retention',
      'CSV analytics activity export',
    ],
    cta: 'Upgrade to Lite',
    kind: 'secondary'
  },
  {
    id: 'pro',
    name: 'Pro',
    amount: '₹699',
    period: '/ month',
    desc: 'For growing projects.',
    popular: true,
    benefits: [
      'Everything in Lite',
      'Live event logs & real-time refresh',
      'Full API access & V2 Beta dashboard',
    ],
    cta: 'Upgrade to Pro',
    kind: 'primary'
  },
  {
    id: 'max',
    name: 'Max',
    amount: '₹1,999',
    period: '/ month',
    desc: 'For advanced users and teams.',
    benefits: [
      'Everything in Pro',
      '1-second high-frequency dashboard refresh',
      'Alpha experimental access eligibility',
    ],
    cta: 'Upgrade to Max',
    kind: 'secondary'
  }
];

const ENTERPRISE_PLAN = {
  id: 'enterprise',
  name: 'Business & Enterprise',
  amount: 'Custom',
  period: 'commercial',
  desc: 'Custom commercial agreements for organizations requiring enterprise-grade capacity, security, compliance, and dedicated engineering support.',
  capabilities: [
    'Negotiated monthly event volume & retention',
    'Custom projects & verified domain allowances',
    'Advanced RBAC & enterprise SSO integration',
    'Configurable V2 Beta and Alpha preview access',
    'Custom webhooks, data pipelines & API limits',
    'Contractual SLA & dedicated support engineer'
  ],
  cta: 'Contact Sales'
};

export default function Billing() {
  const { user, usageStats } = useOutletContext();
  const { showToast } = useToast();
  const [category, setCategory] = useState('individual');
  const [invoices] = useState([
    { id: 'inv_3', month: 'Sep 2026', desc: 'Nano plan · no charge', amount: '$0.00' },
    { id: 'inv_2', month: 'Aug 2026', desc: 'Nano plan · no charge', amount: '$0.00' },
    { id: 'inv_1', month: 'Jul 2026', desc: 'Nano plan · no charge', amount: '$0.00' }
  ]);

  const rawPlan = user?.plan || usageStats?.plan || 'Nano';
  const planAliasMap = { free: 'Nano', basic: 'Lite', business: 'Max' };
  const activePlanName = planAliasMap[rawPlan.toLowerCase()] || (rawPlan.charAt(0).toUpperCase() + rawPlan.slice(1));

  const eventsUsed = usageStats?.totalViews || 4;
  const eventsLimit = usageStats?.monthlyLimit || 10000;
  const eventsPct = Math.min(100, Math.round((eventsUsed / eventsLimit) * 1000) / 10);

  const storageUsedMB = Math.round((usageStats?.storageUsed || 116 * 1024 * 1024) / (1024 * 1024));
  const storageLimitMB = Math.round((usageStats?.storageLimit || 1024 * 1024 * 1024) / (1024 * 1024));
  const storagePct = Math.min(100, Math.round((storageUsedMB / storageLimitMB) * 1000) / 10);

  const handleUpgrade = (planName) => {
    showToast(`Upgrading to ${planName}…`, 'Redirecting to payment checkout.');
  };

  const handleDownloadInvoice = (inv) => {
    const text = `WebPulse Analytics Invoice\nPeriod: ${inv.month}\nAmount: ${inv.amount}\nStatus: Paid\nWorkspace: ${user?.email || 'Account'}`;
    downloadFile(`invoice-${inv.month.replace(' ', '-').toLowerCase()}.txt`, text, 'text/plain');
    showToast('Invoice downloaded', inv.month);
  };

  return (
    <div className="page animate-fade-in">
      <PageHead
        title="Billing"
        desc="Plan, usage, and invoices for this workspace."
        actions={
          <Button
            variant="outline"
            icon="download"
            onClick={() => showToast('Exporting all invoices…')}
          >
            Download invoices
          </Button>
        }
      />

      <div className="space-y-6 mt-4">
        {/* Current Plan & Usage */}
        <Card>
          <CardHead>
            <div>
              <CardTitle>Current plan</CardTitle>
              <CardSub>Renews on the 1st of next month</CardSub>
            </div>
            <div className="card-actions">
              <Badge variant="info" className="text-sm px-3 py-1">
                {activePlanName.toUpperCase()} PLAN
              </Badge>
            </div>
          </CardHead>
          <CardBody>
            <div className="usage-grid">
              <div className="usage-item">
                <div className="usage-item-head">
                  <span className="usage-label">Monthly events</span>
                  <span className="usage-value font-mono">
                    {fmtInt(eventsUsed)} of {fmtInt(eventsLimit)}
                  </span>
                </div>
                <div className="progress">
                  <div
                    className={`progress-bar ${
                      eventsPct >= 90 ? 'progress-bar--error' : eventsPct >= 75 ? 'progress-bar--warning' : ''
                    }`}
                    style={{ width: `${eventsPct}%` }}
                  />
                </div>
                <p className="hint mt-2 text-xs">
                  {eventsPct}% of this month&apos;s allowance consumed. ({fmtInt(Math.max(0, eventsLimit - eventsUsed))} remaining)
                </p>
              </div>

              <div className="usage-item">
                <div className="usage-item-head">
                  <span className="usage-label">Event storage</span>
                  <span className="usage-value font-mono">
                    {storageUsedMB} MB of {storageLimitMB} MB
                  </span>
                </div>
                <div className="progress">
                  <div
                    className="progress-bar progress-bar--info"
                    style={{ width: `${storagePct}%` }}
                  />
                </div>
                <p className="hint mt-2 text-xs">
                  {storagePct}% used. Fast indexed search enabled.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Plans Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="card-title">Subscription plans</h2>
              <p className="hint text-xs mt-0.5">Prepaid allowances with fixed ceilings and zero surprise overages.</p>
            </div>

            {/* Segmented Category Switcher */}
            <div className="inline-flex self-start sm:self-auto rounded-lg border border-border bg-card-bg p-0.5" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={category === 'individual'}
                onClick={() => setCategory('individual')}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  category === 'individual'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Individual
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={category === 'enterprise'}
                onClick={() => setCategory('enterprise')}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  category === 'enterprise'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Business & Enterprise
              </button>
            </div>
          </div>

          {category === 'individual' ? (
            <div className="plan-grid">
              {INDIVIDUAL_PLANS.map((p) => {
                const isCurrent = p.name.toLowerCase() === activePlanName.toLowerCase();
                const isPro = p.popular;
                return (
                  <article
                    key={p.name}
                    className={`card plan-card flex flex-col justify-between ${
                      isPro ? 'border-primary/40' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="plan-name font-semibold text-lg">{p.name}</h3>
                        {isCurrent ? (
                          <Badge variant="info">Current plan</Badge>
                        ) : isPro ? (
                          <Badge variant="primary" className="text-[10px] uppercase font-semibold">
                            Most popular
                          </Badge>
                        ) : null}
                      </div>

                      <div className="plan-price my-3">
                        <span className="plan-amount text-3xl font-bold font-mono">{p.amount}</span>
                        <span className="plan-period text-xs text-muted-foreground ml-1.5">{p.period}</span>
                      </div>

                      <p className="plan-desc text-xs text-muted-foreground mb-4 min-h-[32px]">{p.desc}</p>

                      <ul className="plan-feats space-y-2 mb-6 text-xs border-t border-border pt-3">
                        {p.benefits.map((b) => (
                          <li key={b} className="plan-feat flex items-center gap-2">
                            <span className="text-success-text shrink-0">
                              <Icon name="check" size={14} />
                            </span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      className={`btn w-full ${isCurrent ? 'btn--secondary opacity-60 cursor-not-allowed' : isPro ? 'btn--primary' : ''}`}
                      disabled={isCurrent}
                      onClick={() => handleUpgrade(p.name)}
                    >
                      {isCurrent ? 'Active Plan' : p.cta}
                    </button>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="card p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg text-foreground">{ENTERPRISE_PLAN.name}</h3>
                    <Badge variant="info">Custom agreement</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    {ENTERPRISE_PLAN.desc}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4 text-xs">
                    {ENTERPRISE_PLAN.capabilities.map((c) => (
                      <div key={c} className="flex items-start gap-2">
                        <span className="text-success-text shrink-0 mt-0.5">
                          <Icon name="check" size={14} />
                        </span>
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:border-l lg:border-border lg:pl-8 flex flex-col justify-center sm:min-w-[240px]">
                  <div className="text-[10.5px] font-mono text-muted-foreground uppercase tracking-wider">
                    Commercial Tier
                  </div>
                  <div className="text-xl font-bold font-mono mt-1 text-foreground">
                    Custom pricing
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Invoiced annually or quarterly with contractual SLA guarantees.
                  </p>
                  <a
                    href="mailto:sales@webpulseanalytics.tech?subject=WebPulse%20Enterprise%20Inquiry"
                    className="btn btn--primary mt-4 w-full text-center flex items-center justify-center"
                  >
                    {ENTERPRISE_PLAN.cta}
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Invoices List */}
        <Card>
          <CardHead>
            <div>
              <CardTitle>Invoices</CardTitle>
              <CardSub>Billing history and receipt downloads</CardSub>
            </div>
          </CardHead>
          <CardBody className="p-0">
            <div className="divide-y divide-border">
              {invoices.map((inv) => (
                <div key={inv.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-card border border-border">
                      <Icon name="card" size={16} />
                    </span>
                    <div>
                      <div className="font-semibold text-foreground text-sm">{inv.month}</div>
                      <div className="text-xs text-muted-foreground">{inv.desc}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-foreground font-semibold">{inv.amount}</span>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => handleDownloadInvoice(inv)}
                      title="Download invoice PDF"
                    >
                      <Icon name="download" size={14} />
                      PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}