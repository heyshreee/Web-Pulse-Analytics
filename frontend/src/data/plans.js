/**
 * Canonical WebPulse plan definitions.
 *
 * Shared by the landing page pricing teaser and the full /pricing page so the
 * plan names, prices, and feature lists can never drift apart. Prices are the
 * live values used by the billing flow (INR, per month).
 */
export const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    tagline: 'For personal projects and experimentation',
    leadIn: null,
    items: [
      '1 project',
      'Real-time monitoring',
      'Traffic analytics',
      'Visitor tracking',
      'Performance analytics',
      'Custom dashboard',
      'Historical analytics',
      'REST API access',
    ],
    cta: 'Start for free',
    kind: 'secondary',
  },
  {
    id: 'basic',
    name: 'Basic',
    price: '₹299',
    tagline: 'For developers and small websites',
    leadIn: 'Everything in Free, plus:',
    items: [
      'Multiple projects',
      'Extended analytics usage',
      'Advanced dashboard views',
      'Alerts & notifications',
      'Performance monitoring',
      'Report export',
    ],
    cta: 'Choose Basic',
    kind: 'secondary',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹999',
    tagline: 'For growing products and high-traffic websites',
    leadIn: 'Everything in Basic, plus:',
    items: [
      'Higher analytics limits',
      'Advanced monitoring',
      'Detailed visitor analytics',
      'Advanced reporting',
      'Priority support',
    ],
    cta: 'Start Pro',
    kind: 'primary',
  },
  {
    id: 'business',
    name: 'Business',
    price: '₹2,999',
    tagline: 'For teams that need more control',
    leadIn: 'Everything in Pro, plus:',
    items: [
      'Higher usage limits',
      'Team collaboration',
      'Advanced access controls',
      'Custom integrations',
      'Dedicated support',
    ],
    cta: 'Contact Sales',
    kind: 'secondary',
  },
];
