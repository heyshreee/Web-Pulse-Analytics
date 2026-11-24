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
    description: 'Entry-level analytics for personal websites and testing.',
    leadIn: 'Included features',
    limits: [
      { label: 'Tracked events / month', value: '10,000' },
      { label: 'Projects', value: '1' },
      { label: 'Allowed domains / project', value: '1' },
      { label: 'Data retention', value: '7 days' },
      { label: 'Dashboard refresh interval', value: '60 seconds' },
    ],
    features: [
      'Website traffic analytics',
      'Pages, sources, devices, and geography',
      'Basic REST API access',
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
    description: 'Affordable analytics for individual developers and small websites.',
    leadIn: 'Everything in Nano, plus',
    limits: [
      { label: 'Tracked events / month', value: '100,000' },
      { label: 'Projects', value: '3' },
      { label: 'Allowed domains / project', value: '3' },
      { label: 'Data retention', value: '30 days' },
      { label: 'Dashboard refresh interval', value: '15 seconds' },
    ],
    features: [
      '10× the Nano monthly event allowance',
      'Track up to 3 projects & domains',
      '30-day extended data retention',
      'Dashboard refresh interval of 15 seconds',
      'CSV analytics activity export',
    ],
    cta: 'Choose Lite',
    kind: 'secondary',
  },
  {
    id: 'pro',
    name: 'Pro',
    amount: 699,
    amountUSD: 8.99,
    description: 'Advanced analytics, API access, and V2 beta access.',
    leadIn: 'Everything in Lite, plus',
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
    description: 'Full analytics capabilities, beta and invitation-only alpha access.',
    leadIn: 'Everything in Pro, plus',
    limits: [
      { label: 'Tracked events / month', value: '5,000,000' },
      { label: 'Projects', value: '50' },
      { label: 'Allowed domains / project', value: '25' },
      { label: 'Data retention', value: '12 months' },
      { label: 'Dashboard refresh interval', value: '1 second' },
    ],
    features: [
      '5,000,000 monthly events',
      'Up to 50 projects and 25 domains',
      '12-month data retention',
      '1-second high-frequency dashboard refresh',
      'Team members (up to 10 seats)',
      'Unlimited saved reports & custom dashboards',
      'Alpha invitation eligible & priority support',
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
