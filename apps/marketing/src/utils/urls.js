/**
 * Helper to determine default base URL based on runtime environment.
 * When hosted on webpulseanalytics.tech in production, defaults to the canonical
 * subdomains:
 * - Marketing: https://webpulseanalytics.tech
 * - Stable V1: https://app.webpulseanalytics.tech
 * - Beta V2: https://beta.webpulseanalytics.tech
 */
export function getCanonicalAppUrl(type = 'v1') {
    const isProdDomain = typeof window !== 'undefined' &&
        (window.location.hostname === 'webpulseanalytics.tech' || window.location.hostname.endsWith('.webpulseanalytics.tech'));

    if (type === 'v2' || type === 'beta') {
        return (import.meta.env.VITE_V2_APP_URL || (isProdDomain ? 'https://beta.webpulseanalytics.tech' : 'http://localhost:5175')).replace(/\/+$/, '');
    }
    if (type === 'marketing') {
        return (import.meta.env.VITE_MARKETING_URL || (isProdDomain ? 'https://webpulseanalytics.tech' : 'http://localhost:5174')).replace(/\/+$/, '');
    }
    return (import.meta.env.VITE_V1_APP_URL || import.meta.env.VITE_APP_URL || (isProdDomain ? 'https://app.webpulseanalytics.tech' : 'http://localhost:5173')).replace(/\/+$/, '');
}
