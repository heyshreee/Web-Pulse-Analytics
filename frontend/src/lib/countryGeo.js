const COUNTRIES = [
  { iso2: 'US', name: 'United States', lat: 39.8283, lng: -98.5795 },
  { iso2: 'CA', name: 'Canada', lat: 56.1304, lng: -106.3468 },
  { iso2: 'MX', name: 'Mexico', lat: 23.6345, lng: -102.5528 },
  { iso2: 'BR', name: 'Brazil', lat: -14.235, lng: -51.9253 },
  { iso2: 'AR', name: 'Argentina', lat: -38.4161, lng: -63.6167 },
  { iso2: 'CL', name: 'Chile', lat: -35.6751, lng: -71.543 },
  { iso2: 'CO', name: 'Colombia', lat: 4.5709, lng: -74.2973 },
  { iso2: 'PE', name: 'Peru', lat: -9.19, lng: -75.0152 },
  { iso2: 'VE', name: 'Venezuela', lat: 6.4238, lng: -66.5897 },
  { iso2: 'GB', name: 'United Kingdom', lat: 55.3781, lng: -3.436 },
  { iso2: 'IE', name: 'Ireland', lat: 53.1424, lng: -7.6921 },
  { iso2: 'FR', name: 'France', lat: 46.2276, lng: 2.2137 },
  { iso2: 'DE', name: 'Germany', lat: 51.1657, lng: 10.4515 },
  { iso2: 'NL', name: 'Netherlands', lat: 52.1326, lng: 5.2913 },
  { iso2: 'BE', name: 'Belgium', lat: 50.5039, lng: 4.4699 },
  { iso2: 'ES', name: 'Spain', lat: 40.4637, lng: -3.7491 },
  { iso2: 'PT', name: 'Portugal', lat: 39.3999, lng: -8.2245 },
  { iso2: 'CH', name: 'Switzerland', lat: 46.8182, lng: 8.2275 },
  { iso2: 'AT', name: 'Austria', lat: 47.5162, lng: 14.5501 },
  { iso2: 'SE', name: 'Sweden', lat: 60.1282, lng: 18.6435 },
  { iso2: 'NO', name: 'Norway', lat: 60.472, lng: 8.4689 },
  { iso2: 'DK', name: 'Denmark', lat: 56.2639, lng: 9.5018 },
  { iso2: 'FI', name: 'Finland', lat: 61.9241, lng: 25.7482 },
  { iso2: 'PL', name: 'Poland', lat: 51.9194, lng: 19.1451 },
  { iso2: 'CZ', name: 'Czechia', lat: 49.8175, lng: 15.473 },
  { iso2: 'HU', name: 'Hungary', lat: 47.1625, lng: 19.5033 },
  { iso2: 'RO', name: 'Romania', lat: 45.9432, lng: 24.9668 },
  { iso2: 'GR', name: 'Greece', lat: 39.0742, lng: 21.8243 },
  { iso2: 'UA', name: 'Ukraine', lat: 48.3794, lng: 31.1656 },
  { iso2: 'RU', name: 'Russia', lat: 61.524, lng: 105.3188 },
  { iso2: 'TR', name: 'Turkey', lat: 38.9637, lng: 35.2433 },
  { iso2: 'SA', name: 'Saudi Arabia', lat: 23.8859, lng: 45.0792 },
  { iso2: 'AE', name: 'United Arab Emirates', lat: 23.4241, lng: 53.8478 },
  { iso2: 'IL', name: 'Israel', lat: 31.0461, lng: 34.8516 },
  { iso2: 'EG', name: 'Egypt', lat: 26.8206, lng: 30.8025 },
  { iso2: 'ZA', name: 'South Africa', lat: -30.5595, lng: 22.9375 },
  { iso2: 'NG', name: 'Nigeria', lat: 9.082, lng: 8.6753 },
  { iso2: 'KE', name: 'Kenya', lat: -0.0236, lng: 37.9062 },
  { iso2: 'GH', name: 'Ghana', lat: 7.9465, lng: -1.0232 },
  { iso2: 'MA', name: 'Morocco', lat: 31.7917, lng: -7.0926 },
  { iso2: 'IN', name: 'India', lat: 20.5937, lng: 78.9629 },
  { iso2: 'PK', name: 'Pakistan', lat: 30.3753, lng: 69.3451 },
  { iso2: 'BD', name: 'Bangladesh', lat: 23.685, lng: 90.3563 },
  { iso2: 'LK', name: 'Sri Lanka', lat: 7.8731, lng: 80.7718 },
  { iso2: 'NP', name: 'Nepal', lat: 28.3949, lng: 84.124 },
  { iso2: 'CN', name: 'China', lat: 35.8617, lng: 104.1954 },
  { iso2: 'JP', name: 'Japan', lat: 36.2048, lng: 138.2529 },
  { iso2: 'KR', name: 'South Korea', lat: 35.9078, lng: 127.7669 },
  { iso2: 'TW', name: 'Taiwan', lat: 23.6978, lng: 120.9605 },
  { iso2: 'HK', name: 'Hong Kong', lat: 22.3193, lng: 114.1694 },
  { iso2: 'SG', name: 'Singapore', lat: 1.3521, lng: 103.8198 },
  { iso2: 'MY', name: 'Malaysia', lat: 4.2105, lng: 101.9758 },
  { iso2: 'ID', name: 'Indonesia', lat: -0.7893, lng: 113.9213 },
  { iso2: 'TH', name: 'Thailand', lat: 15.87, lng: 100.9925 },
  { iso2: 'VN', name: 'Vietnam', lat: 14.0583, lng: 108.2772 },
  { iso2: 'PH', name: 'Philippines', lat: 12.8797, lng: 121.774 },
  { iso2: 'AU', name: 'Australia', lat: -25.2744, lng: 133.7751 },
  { iso2: 'NZ', name: 'New Zealand', lat: -40.9006, lng: 174.886 },
  { iso2: 'IT', name: 'Italy', lat: 41.8719, lng: 12.5674 },
  { iso2: 'GR', name: 'Greece', lat: 39.0742, lng: 21.8243 },
  { iso2: 'TR', name: 'Turkey', lat: 38.9637, lng: 35.2433 },
  { iso2: 'SA', name: 'Saudi Arabia', lat: 23.8859, lng: 45.0792 },
  { iso2: 'AE', name: 'United Arab Emirates', lat: 23.4241, lng: 53.8478 },
  { iso2: 'IL', name: 'Israel', lat: 31.0461, lng: 34.8516 },
];

const ALIASES = {
  'united states of america': 'US',
  usa: 'US',
  uk: 'GB',
  'great britain': 'GB',
  england: 'GB',
  uae: 'AE',
  'south korea': 'KR',
  korea: 'KR',
  'republic of korea': 'KR',
  'czech republic': 'CZ',
  'the netherlands': 'NL',
  holland: 'NL',
};

const byKey = {};
for (const c of COUNTRIES) {
  if (!byKey[c.iso2]) byKey[c.iso2] = c;
  const nameKey = c.name.toLowerCase();
  if (!byKey[nameKey]) byKey[nameKey] = c;
}

export function countryCentroid(nameOrCode) {
  if (!nameOrCode) return null;
  const raw = String(nameOrCode).trim();
  const direct = byKey[raw] || byKey[raw.toLowerCase()] || byKey[raw.toUpperCase()];
  if (direct) return { lat: direct.lat, lng: direct.lng, name: direct.name, iso2: direct.iso2 };
  const alias = ALIASES[raw.toLowerCase()];
  if (alias && byKey[alias]) {
    const c = byKey[alias];
    return { lat: c.lat, lng: c.lng, name: c.name, iso2: c.iso2 };
  }
  return null;
}

export default countryCentroid;
