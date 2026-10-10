import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { PageHead } from '../components/ui/Page';
import { Card, CardHead, CardTitle, CardSub, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Display';
import { useToast } from '../context/ToastContext';
import { apiRequest } from '../utils/api';
import { fmtInt, downloadFile } from '../lib/format';

const PLANS = [
  {
    name: 'Free',
    amount: 0,
    period: 'forever',
    desc: 'For personal projects and testing.',
    feats: ['1,000 monthly events', '1 website project', '24h data retention', 'Community support'],
    cta: 'Current plan',
    current: true
  },
  {
    name: 'Pro',
    amount: 29,
    period: 'per month',
    desc: 'For growing websites and indie makers.',
    feats: [
      '100,000 monthly events',
      'Unlimited websites',
      '12-month data retention',
      'Real-time alerts & webhook integration',
      'Priority support'
    ],
    cta: 'Upgrade to Pro',
    current: false
  },
  {
    name: 'Enterprise',
    amount: 99,
    period: 'per month',
    desc: 'For high-scale apps and teams.',
    feats: [
      'Unlimited events',
      'Custom retention windows',
      'Team members & RBAC',
      'Dedicated IP and uptime SLA',
      '24/7 dedicated support'
    ],
    cta: 'Contact Sales',
    current: false
  }
];

export default function Billing() {
  const { user, usageStats, loadUser } = useOutletContext();
  const { showToast } = useToast();
  const [plans, setPlans] = useState(PLANS);
  const [invoices, setInvoices] = useState([
    { id: 'inv_3', month: 'Sep 2026', desc: 'Free plan · no charge', amount: '$0.00' },
    { id: 'inv_2', month: 'Aug 2026', desc: 'Free plan · no charge', amount: '$0.00' },
    { id: 'inv_1', month: 'Jul 2026', desc: 'Free plan · no charge', amount: '$0.00' }
  ]);

  const activePlanName = user?.plan || usageStats?.plan || 'Free';

  const eventsUsed = usageStats?.totalViews || 4;
  const eventsLimit = usageStats?.monthlyLimit || 1000;
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

        {/* Plans Grid */}
        <div>
          <h2 className="card-title mb-4">Subscription plans</h2>
          <div className="plan-grid">
            {plans.map((p) => {
              const isCurrent = p.name.toLowerCase() === activePlanName.toLowerCase();
              return (
                <article key={p.name} className="card plan-card flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="plan-name font-semibold text-lg">{p.name}</h3>
                      {isCurrent ? <Badge variant="info">Current plan</Badge> : null}
                    </div>

                    <div className="plan-price my-3">
                      <span className="plan-amount text-3xl font-bold font-mono">${p.amount}</span>
                      <span className="plan-period text-xs text-muted-foreground ml-1.5">{p.period}</span>
                    </div>

                    <p className="plan-desc text-xs text-muted-foreground mb-4">{p.desc}</p>

                    <ul className="plan-feats space-y-2 mb-6 text-xs">
                      {p.feats.map((f) => (
                        <li key={f} className="plan-feat flex items-center gap-2">
                          <span className="text-success-text shrink-0">
                            <Icon name="check" size={14} />
                          </span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    className={`btn w-full ${isCurrent ? 'btn--secondary opacity-60 cursor-not-allowed' : ''}`}
                    disabled={isCurrent}
                    onClick={() => handleUpgrade(p.name)}
                  >
                    {isCurrent ? 'Active Plan' : p.cta}
                  </button>
                </article>
              );
            })}
          </div>
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