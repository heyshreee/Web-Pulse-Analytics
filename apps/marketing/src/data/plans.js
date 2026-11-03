/**
 * Canonical WebPulse plan definitions.
 *
 * Shared by the landing pricing teaser, /pricing, and the Billing page so plan
 * names, prices, limits, and display copy cannot drift apart. `amount` is the
 * INR price per month and matches the value charged by the backend.
 *
 * `limits` is intentionally limited to the values a visitor needs to compare
 * plans: monthly tracked events, projects, allowed domains, and dashboard
 * refresh rate. Display features are deliberately short and only describe
 * verified capabilities.
 */
export const plans = [
  {
    id: 'free',
    name: 'Free',
    amount: 0,
    description: 'For learning, prototypes, and personal projects.',
    leadIn: 'Included features',
    limits: [
      { label: 'Tracked events / month', value: '1,000' },
      { label: 'Projects', value: '1' },
      { label: 'Allowed domains / project', value: '1' },
      { label: 'Dashboard refresh interval', value: '60 seconds' },
    ],
    features: [
      'Website traffic analytics',
      'Pages, sources, devices, and geography',
      'Custom events and REST API',
      'Historical analytics and CSV activity export',
    ],
    cta: 'Start for free',
    kind: 'secondary',
  },
  {
    id: 'basic',
    name: 'Basic',
    amount: 299,
    description: 'For independent developers running a few small websites.',
    leadIn: 'Everything in Free, plus',
    limits: [
      { label: 'Tracked events / month', value: '50,000' },
      { label: 'Projects', value: '5' },
      { label: 'Allowed domains / project', value: '3' },
      { label: 'Dashboard refresh interval', value: '10 seconds' },
    ],
    features: [
      '50× the Free monthly event allowance',
      'Track up to 5 projects',
      'Manage up to 3 allowed domains per project',
      'Dashboard refresh interval of 10 seconds',
    ],
    cta: 'Choose Basic',
    kind: 'secondary',
  },
  {
    id: 'pro',
    name: 'Pro',
    amount: 999,
    description: 'For growing products that need live activity logs and public reports.',
    leadIn: 'Everything in Basic, plus',
    limits: [
      { label: 'Tracked events / month', value: '500,000' },
      { label: 'Projects', value: '15' },
      { label: 'Allowed domains / project', value: '10' },
      { label: 'Dashboard refresh interval', value: '1 second' },
    ],
    features: [
      '10× the Basic monthly event allowance',
      'Live activity logs',
      'Up to 5 public reports',
      'Dashboard refresh interval of 1 second',
    ],
    cta: 'Choose Pro',
    kind: 'primary',
  },
  {
    id: 'business',
    name: 'Business',
    amount: 2999,
    description: 'For high-traffic sites tracking millions of events across many projects.',
    leadIn: 'Everything in Pro, plus',
    limits: [
      { label: 'Tracked events / month', value: '5,000,000' },
      { label: 'Projects', value: '100' },
      { label: 'Allowed domains / project', value: '100' },
      { label: 'Dashboard refresh interval', value: '1 second' },
    ],
    features: [
      '10× the Pro monthly event allowance',
      'Up to 100 public reports',
      'Up to 100 projects and 100 allowed domains per project',
      'Dashboard refresh interval of 1 second',
    ],
    plannedNote: 'Team access is planned and is not included today.',
    cta: 'Choose Business',
    kind: 'secondary',
  },
];

const inrFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

export const formatINR = (amount) => `₹${inrFormatter.format(amount)}`;

export const getPlanById = (id) => plans.find((plan) => plan.id === id);
