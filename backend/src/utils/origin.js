import { resolveTxt } from 'node:dns/promises';

const HOST_REGEX =
  /^(localhost|([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}|(\d{1,3}\.){3}\d{1,3})$/i;

/**
 * Parses and normalizes a single origin string into canonical form:
 * `<scheme>://<lowercase-hostname>[:<non-default-port>]`.
 *
 * Wildcards (`*`), paths/queries/hashes, embedded credentials, and non-HTTP(S)
 * schemes are explicitly rejected.
 */
export function parseAndNormalizeOrigin(rawInput) {
  if (!rawInput || typeof rawInput !== 'string') {
    return { valid: false, error: 'Origin value is required' };
  }

  const trimmed = rawInput.trim();
  if (!trimmed || trimmed.includes('*') || /\s/.test(trimmed)) {
    return { valid: false, error: 'Wildcards and whitespace are not permitted in origins' };
  }

  const hasScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed);
  if (hasScheme && !/^https?:\/\//i.test(trimmed)) {
    return { valid: false, error: 'Only http:// and https:// origins are supported' };
  }

  const candidate = hasScheme ? trimmed : `https://${trimmed}`;

  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    return { valid: false, error: 'Invalid origin URL format' };
  }

  if (parsed.username || parsed.password) {
    return { valid: false, error: 'Credentials are not allowed in origin URLs' };
  }

  if ((parsed.pathname && parsed.pathname !== '/') || parsed.search || parsed.hash) {
    return { valid: false, error: 'Origins must not include paths, query parameters, or fragments' };
  }

  const hostname = parsed.hostname.toLowerCase();
  if (!HOST_REGEX.test(hostname)) {
    return { valid: false, error: 'Invalid origin hostname' };
  }

  const protocol = parsed.protocol.toLowerCase();
  const portPart = parsed.port ? `:${parsed.port}` : '';
  const canonicalOrigin = `${protocol}//${hostname}${portPart}`;

  return {
    valid: true,
    origin: canonicalOrigin,
    hostname,
    protocol,
    port: parsed.port || null,
  };
}

/**
 * Extracts and normalizes the exact origin from `Origin` or `Referer` request headers.
 * Returns `null` when neither header is present or valid.
 */
export function extractExactOriginFromHeaders(req) {
  const raw = req?.headers?.origin || req?.headers?.referer;
  if (!raw || typeof raw !== 'string' || raw === 'null') return null;

  try {
    const url = new URL(raw);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    const normalized = parseAndNormalizeOrigin(url.origin);
    return normalized.valid ? normalized.origin : null;
  } catch {
    return null;
  }
}

/**
 * Server-side DNS TXT ownership verification.
 * Checks `_webpulse-verify.<hostname>` (then `<hostname>`) for `webpulse-verification=<token>`.
 */
export async function verifyOriginDnsTxt(hostname, token, resolver = resolveTxt) {
  if (!hostname || !token) return { verified: false, reason: 'Missing hostname or token' };

  const expectedDirect = `webpulse-verification=${token}`;
  const candidates = [`_webpulse-verify.${hostname}`, hostname];

  for (const recordHost of candidates) {
    try {
      const records = await resolver(recordHost);
      const flattened = (records || []).map((chunks) =>
        Array.isArray(chunks) ? chunks.join('') : String(chunks)
      );
      if (flattened.some((txt) => txt.trim() === expectedDirect || txt.trim() === token)) {
        return { verified: true, recordHost };
      }
    } catch {
      // Try next candidate
    }
  }

  return {
    verified: false,
    reason: `DNS TXT record "${expectedDirect}" not found at _webpulse-verify.${hostname}`,
  };
}

/**
 * Server-side HTTP well-known verification file check.
 * Checks `<origin>/.well-known/webpulse-verify-<token>.txt` (then `webpulse-verify.txt`).
 */
export async function verifyOriginFile(origin, token, fetcher = globalThis.fetch) {
  if (!origin || !token || typeof fetcher !== 'function') {
    return { verified: false, reason: 'Missing origin, token, or fetch implementation' };
  }

  const expectedContent = `webpulse-verification=${token}`;
  const urls = [
    `${origin}/.well-known/webpulse-verify-${token}.txt`,
    `${origin}/.well-known/webpulse-verify.txt`,
  ];

  for (const url of urls) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    try {
      const res = await fetcher(url, {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: { Accept: 'text/plain' },
      });
      if (res && res.ok) {
        const body = (await res.text()).trim();
        if (body === expectedContent || body === token || body.includes(expectedContent)) {
          return { verified: true, url };
        }
      }
    } catch {
      // Try fallback path
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    verified: false,
    reason: `Verification file containing "${expectedContent}" not found at ${origin}/.well-known/webpulse-verify-${token}.txt`,
  };
}

export default {
  parseAndNormalizeOrigin,
  extractExactOriginFromHeaders,
  verifyOriginDnsTxt,
  verifyOriginFile,
};
