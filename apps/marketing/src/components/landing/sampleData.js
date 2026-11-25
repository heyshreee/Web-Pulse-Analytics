/**
 * Grounded, clearly-labeled illustrative datasets for landing page telemetry fragments.
 * Every number, route, and geo entry mirrors real WebPulse collector fields without
 * claiming live customer production traffic.
 */

export const SAMPLE_STREAMS = [
  { id: 'ev_01', time: '09:42:18', path: '/pricing', referrer: 'github.com', country: 'IN', city: 'Bengaluru', device: 'Desktop · Chrome', status: '202', latency: '18ms' },
  { id: 'ev_02', time: '09:42:14', path: '/docs/getting-started', referrer: 'google.com', country: 'DE', city: 'Berlin', device: 'Desktop · Firefox', status: '202', latency: '22ms' },
  { id: 'ev_03', time: '09:42:09', path: '/', referrer: 'direct', country: 'US', city: 'San Francisco', device: 'Mobile · Safari', status: '202', latency: '19ms' },
  { id: 'ev_04', time: '09:42:03', path: '/docs/api', referrer: 'news.ycombinator.com', country: 'GB', city: 'London', device: 'Desktop · Chrome', status: '202', latency: '21ms' },
  { id: 'ev_05', time: '09:41:56', path: '/integrations', referrer: 'github.com', country: 'JP', city: 'Tokyo', device: 'Desktop · Edge', status: '202', latency: '24ms' },
  { id: 'ev_06', time: '09:41:49', path: '/security', referrer: 'duckduckgo.com', country: 'CA', city: 'Toronto', device: 'Desktop · Safari', status: '202', latency: '17ms' },
];

export const SAMPLE_PAYLOAD = `{
  "trackingId": "wp_live_01J9K4M2",
  "url": "https://docs.example.dev/getting-started",
  "referrer": "https://github.com/heyshreee/Web-Pulse-Analytics",
  "title": "Getting started - Docs",
  "viewport": "1440x900",
  "timestamp": "2026-11-24T19:42:18.410Z"
}`;

export const PREVIEW_RANGES = {
  '24h': {
    label: 'Last 24 hours',
    kpis: [
      { label: 'Active sessions', value: '38', delta: 'Socket.IO room', accent: true },
      { label: 'Page views', value: '4,820', delta: '+14.2% vs prior 24h' },
      { label: 'Unique visitors', value: '1,940', delta: 'SHA-256 session hash' },
      { label: 'Custom events', value: '612', delta: 'signup_click · docs_copy' },
    ],
    series: [
      { label: '00:00', views: 120, visitors: 54 },
      { label: '03:00', views: 98, visitors: 42 },
      { label: '06:00', views: 164, visitors: 71 },
      { label: '09:00', views: 285, visitors: 124 },
      { label: '12:00', views: 412, visitors: 176 },
      { label: '15:00', views: 468, visitors: 198 },
      { label: '18:00', views: 510, visitors: 215 },
      { label: '21:00', views: 382, visitors: 164 },
      { label: 'Now', views: 446, visitors: 189 },
    ],
  },
  '7d': {
    label: 'Last 7 days',
    kpis: [
      { label: 'Active sessions', value: '38', delta: 'Socket.IO room', accent: true },
      { label: 'Page views', value: '31,490', delta: '+9.8% vs prior 7d' },
      { label: 'Unique visitors', value: '12,680', delta: 'Zero cookies stored' },
      { label: 'Custom events', value: '3,840', delta: 'track() SDK calls' },
    ],
    series: [
      { label: 'Mon', views: 3840, visitors: 1580 },
      { label: 'Tue', views: 4210, visitors: 1720 },
      { label: 'Wed', views: 4690, visitors: 1910 },
      { label: 'Thu', views: 5120, visitors: 2040 },
      { label: 'Fri', views: 4820, visitors: 1940 },
      { label: 'Sat', views: 4190, visitors: 1680 },
      { label: 'Sun', views: 4620, visitors: 1810 },
    ],
  },
  '30d': {
    label: 'Last 30 days',
    kpis: [
      { label: 'Active sessions', value: '38', delta: 'Socket.IO room', accent: true },
      { label: 'Page views', value: '128,450', delta: '+21.4% vs prior 30d' },
      { label: 'Unique visitors', value: '51,920', delta: 'Origin-verified hosts' },
      { label: 'Custom events', value: '14,210', delta: 'Top: snippet_copied' },
    ],
    series: [
      { label: 'W1', views: 26400, visitors: 10800 },
      { label: 'W2', views: 29800, visitors: 12100 },
      { label: 'W3', views: 34250, visitors: 13820 },
      { label: 'W4', views: 38000, visitors: 15200 },
    ],
  },
};

export const TOP_PAGES = [
  { path: '/docs/getting-started', views: '1,420', share: 88, trend: 'Docs entry' },
  { path: '/', views: '1,180', share: 73, trend: 'Landing' },
  { path: '/pricing', views: '764', share: 48, trend: '4 tiers' },
  { path: '/docs/api', views: '582', share: 36, trend: 'REST reference' },
  { path: '/security', views: '390', share: 24, trend: 'Data disclosure' },
];

export const TOP_REFERRERS = [
  { source: 'github.com', visitors: '642', pct: 33 },
  { source: 'Direct / None', visitors: '518', pct: 27 },
  { source: 'google.com', visitors: '412', pct: 21 },
  { source: 'news.ycombinator.com', visitors: '238', pct: 12 },
  { source: 'dev.to', visitors: '130', pct: 7 },
];

export const DEVICE_BREAKDOWN = [
  { label: 'Desktop', share: 71, detail: 'Chrome 48% · Firefox 14% · Safari 9%' },
  { label: 'Mobile', share: 25, detail: 'Safari 14% · Chrome Mobile 11%' },
  { label: 'Tablet', share: 4, detail: 'iPadOS 3% · Android 1%' },
];

export const SAMPLE_REGIONS = [
  { country: 'India', code: 'IN', cities: 'Bengaluru, Mumbai, Pune', visitors: '582', share: 86 },
  { country: 'United States', code: 'US', cities: 'San Francisco, New York, Austin', visitors: '448', share: 66 },
  { country: 'Germany', code: 'DE', cities: 'Berlin, Munich', visitors: '294', share: 44 },
  { country: 'United Kingdom', code: 'GB', cities: 'London, Manchester', visitors: '216', share: 32 },
  { country: 'Japan', code: 'JP', cities: 'Tokyo, Osaka', visitors: '142', share: 21 },
];
