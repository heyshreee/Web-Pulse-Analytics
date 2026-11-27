/**
 * Canonical WebPulse plan definitions.
 *
 * Shared by the landing pricing teaser, /pricing, and the Billing page so plan
 * names, prices, limits, and display copy cannot drift apart. `amount` is the
 * INR price per month and matches the value charged by the backend.
 *
 * `limits` is intentionally limited to the values a visitor needs to compare
 * plans: monthly tracked events, projects, allowed domains, dashboard
 * refresh rate, and data retention. Display features describe verified capabilities.
 */
export const plans = [
  {
    id: 'nano',
    name: 'Nano',
    amount: 0,
    amountUSD: 0,
    description: 'For personal websites and testing.',
    leadIn: 'Included features',
    benefits: [
      'Core visitor analytics & page views',
      'Basic REST API access',
      'V1 Stable production dashboard',
    ],
    limits: [
      { label: 'Tracked events / month', value: '10,000' },
      { label: 'Projects', value: '1' },
      { label: 'Verified origins / project', value: '3' },
      { label: 'Data retention', value: '7 days' },
      { label: 'Dashboard refresh interval', value: '60 seconds' },
      { label: 'Shared reports / month', value: '1 (7-day expiry)' },
    ],
    features: [
      'Website traffic, pages, sources & devices',
      'Up to 3 verified origins per project',
      'Basic country statistics (Globe Analyze excluded)',
      '1 read-only shared report / month (7d expiry)',
      'Stable V1 production dashboard',
    ],
    cta: 'Start for free',
    kind: 'secondary',
  },
  {
    id: 'lite',
    name: 'Lite',
    amount: 199,
    amountUSD: 2.49,
    description: 'For individual developers.',
    leadIn: 'Everything in Nano, plus',
    benefits: [
      'Everything in Nano',
      'Globe Analyze & Advanced Filters',
      'CSV & PDF exports + 3 team seats',
    ],
    limits: [
      { label: 'Tracked events / month', value: '100,000' },
      { label: 'Projects', value: '3' },
      { label: 'Verified origins / project', value: '10' },
      { label: 'Team members / project', value: '3' },
      { label: 'Data retention', value: '30 days' },
      { label: 'Dashboard refresh interval', value: '30 seconds' },
      { label: 'Shared reports / month', value: '10 (30-day expiry)' },
    ],
    features: [
      '10× Nano quota (100,000 events shared)',
      'Up to 3 projects & 10 verified origins each',
      'Globe Analyze & regional geo breakdowns',
      'Advanced filters + CSV & PDF exports',
      '3 team members & 10 shared reports/month',
    ],
    cta: 'Choose Lite',
    kind: 'secondary',
  },
  {
    id: 'pro',
    name: 'Pro',
    amount: 699,
    amountUSD: 8.99,
    description: 'For growing projects.',
    leadIn: 'Everything in Lite, plus',
    benefits: [
      'Everything in Lite',
      'Live event logs & real-time refresh',
      'Full API access & V2 Beta dashboard',
    ],
    limits: [
      { label: 'Tracked events / month', value: '1,000,000' },
      { label: 'Projects', value: '10' },
      { label: 'Allowed domains / project', value: '10' },
      { label: 'Data retention', value: '90 days' },
      { label: 'Dashboard refresh interval', value: '5 seconds' },
    ],
    features: [
      '1,000,000 monthly events',
      'Up to 10 projects and 10 domains',
      '90-day data retention',
      'Live event logs & real-time monitoring',
      'Full Analytics API & advanced reports',
      'Team members (up to 3 seats)',
      'V2 Beta dashboard access',
    ],
    cta: 'Choose Pro',
    kind: 'primary',
  },
  {
    id: 'max',
    name: 'Max',
    amount: 1999,
    amountUSD: 24.99,
    description: 'For advanced users and teams.',
    leadIn: 'Everything in Pro, plus',
    benefits: [
      'Everything in Pro',
      'Organization analytics & Audit logs',
      'Alpha experimental access & Webhooks',
    ],
    limits: [
      { label: 'Tracked events / month', value: '2,000,000' },
      { label: 'Projects', value: '25' },
      { label: 'Verified origins / project', value: '50' },
      { label: 'Team members / project', value: '25' },
      { label: 'Data retention', value: 'Up to 365 days' },
      { label: 'Dashboard refresh interval', value: '5 seconds' },
      { label: 'Shared reports / month', value: '500 (up to 365d)' },
    ],
    features: [
      '2,000,000 monthly events (shared)',
      'Up to 25 projects & 50 verified origins each',
      'Up to 365-day retention & 5-second refresh',
      '25 team members (Owner, Admin, Analyst, Viewer)',
      'Organization-wide analytics & Advanced audit logs',
      '500 shared reports/mo, Webhooks & Custom dashboards',
      'Alpha access eligibility & priority support',
    ],
    cta: 'Choose Max',
    kind: 'secondary',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    amount: 'custom',
    amountUSD: 'custom',
    description: 'For companies requiring custom capacity, security and support.',
    leadIn: 'Everything in Max, plus',
    benefits: [
      'Negotiated event capacity & custom limits',
      'Advanced RBAC & dedicated SLA',
      'Configurable Beta & Alpha access',
    ],
    limits: [
      { label: 'Tracked events / month', value: 'Negotiated' },
      { label: 'Projects', value: 'Custom' },
      { label: 'Allowed domains / project', value: 'Custom' },
      { label: 'Data retention', value: 'Custom' },
      { label: 'Dashboard refresh interval', value: 'Dedicated (1s)' },
    ],
    features: [
      'Custom volume contracts & dedicated capacity',
      'Advanced role-based access control (RBAC)',
      'Configurable beta & explicitly granted alpha',
      'Custom integrations & custom domains',
      'Contractual SLA and dedicated support engineer',
    ],
    cta: 'Contact Sales',
    kind: 'secondary',
  },
];

export const individualPlans = plans.filter((plan) => plan.id !== 'enterprise');
export const enterprisePlan = plans.find((plan) => plan.id === 'enterprise');

const inrFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

export const formatINR = (amount) => {
  if (amount === 'custom' || amount === undefined || amount === null || typeof amount !== 'number') {
    return 'Custom';
  }
  return `₹${inrFormatter.format(amount)}`;
};

export const getPlanById = (id) => {
  const normalizedId = id === 'free' ? 'nano' : id === 'basic' ? 'lite' : id === 'business' ? 'max' : id;
  return plans.find((plan) => plan.id === normalizedId);
};
