/**
 * Safely extracts the client IP address from request headers.
 * Never trust x-forwarded-for blindly.
 */
export const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = forwarded.split(',').map((ip) => ip.trim());
    return ips[0];
  }

  return (
    req.ip ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.connection?.socket?.remoteAddress
  );
};

export const anonymizeIp = (ip) => {
  if (!ip || typeof ip !== 'string') return null;
  const trimmed = ip.trim();
  if (!trimmed) return null;

  // Handle IPv4-mapped IPv6 (e.g. ::ffff:192.168.1.42)
  const v4MappedMatch = trimmed.match(/^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3})\.\d{1,3}$/i);
  if (v4MappedMatch) {
    return `${v4MappedMatch[1]}.0`;
  }

  // Handle IPv4 (zero out last octet)
  const v4Match = trimmed.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3})\.\d{1,3}$/);
  if (v4Match) {
    return `${v4Match[1]}.0`;
  }

  // Handle IPv6 (keep first 3 hextets /48 prefix)
  if (trimmed.includes(':')) {
    const parts = trimmed.split(':').filter((p, idx, arr) => idx < 3 && (p !== '' || arr.length <= 3));
    return `${parts.slice(0, 3).join(':') || '::'}::`;
  }

  return null;
};

export default { getClientIp, anonymizeIp };
