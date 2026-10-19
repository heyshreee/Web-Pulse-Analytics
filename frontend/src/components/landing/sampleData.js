/**
 * Deterministic sample data for the marketing product previews.
 *
 * Every value in this file is illustrative — it exists only to render the
 * preview panels and is always displayed next to an "illustrative sample data"
 * note. Nothing here comes from a customer account, and no preview component
 * performs a network request.
 *
 * The series is generated with a fixed wave function (not Math.random) so the
 * preview never flickers between renders.
 */

export const SAMPLE_KPIS = [
  { label: 'Active visitors', value: 128, accent: '#8B5CF6' },
  { label: 'Page views · 30d', value: 84392, accent: '#A78BFA' },
  { label: 'Bounce rate', value: 31.8, decimals: 1, suffix: '%', accent: '#48E6A1' },
  { label: 'Avg. session', value: '4m 21s', accent: '#F59E0B' },
];

export const TRAFFIC_RANGES = ['24h', '7d', '30d'];

export function makeTrafficSeries(range) {
  const isHours = range === '24h';
  const count = isHours ? 24 : range === '7d' ? 7 : 30;
  const step = isHours ? 3600000 : 86400000;
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(now - (count - 1 - i) * step);
    const t = i / (count - 1 || 1);
    const wave =
      2600 +
      1500 * Math.sin(t * Math.PI * 2) +
      600 * Math.sin(t * Math.PI * 6 + 1.3) +
      450 * Math.sin(t * Math.PI * 11 + 4);
    return {
      name: isHours
        ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      views: Math.round(wave),
    };
  });
}

export const SAMPLE_REFERRERS = [
  { label: 'Direct', value: 42, accent: '#8B5CF6' },
  { label: 'Google', value: 26, accent: '#A78BFA' },
  { label: 'LinkedIn', value: 14, accent: '#48E6A1' },
  { label: 'YouTube', value: 9, accent: '#F59E0B' },
  { label: 'Other', value: 9, accent: '#94A3B8' },
];

export const SAMPLE_COUNTRIES = [
  { label: 'United States', value: 4218, share: 33 },
  { label: 'India', value: 2943, share: 23 },
  { label: 'Germany', value: 1201, share: 9 },
  { label: 'United Kingdom', value: 984, share: 7 },
  { label: 'Japan', value: 762, share: 6 },
];

export const SAMPLE_DEVICES = [
  { label: 'Desktop', value: 58 },
  { label: 'Mobile', value: 34 },
  { label: 'Tablet', value: 8 },
];

export const SAMPLE_PAGES = [
  { path: '/', views: 12480, share: 100 },
  { path: '/pricing', views: 8420, share: 67 },
  { path: '/features', views: 6180, share: 50 },
  { path: '/docs/getting-started', views: 4120, share: 33 },
  { path: '/blog', views: 2860, share: 23 },
];

/** Geographic markers for the live map preview. */
export const SAMPLE_CITIES = [
  { lat: 40.7128, lng: -74.006, name: 'New York', count: 4218 },
  { lat: 28.6139, lng: 77.209, name: 'New Delhi', count: 2943 },
  { lat: 52.52, lng: 13.405, name: 'Berlin', count: 1201 },
  { lat: 51.5072, lng: -0.1276, name: 'London', count: 984 },
  { lat: 35.6762, lng: 139.6503, name: 'Tokyo', count: 762 },
  { lat: 48.8566, lng: 2.3522, name: 'Paris', count: 689 },
  { lat: 37.7749, lng: -122.4194, name: 'San Francisco', count: 812 },
  { lat: -33.8688, lng: 151.2093, name: 'Sydney', count: 514 },
  { lat: 19.076, lng: 72.8777, name: 'Mumbai', count: 2310 },
  { lat: -23.5505, lng: -46.6333, name: 'São Paulo', count: 1210 },
];
