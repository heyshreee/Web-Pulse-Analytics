import { randomUUID } from 'node:crypto';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const uuid = () => randomUUID();

export const isUuid = (value) =>
  typeof value === 'string' && UUID_REGEX.test(value);

/** Short random alphanumeric token (e.g. tracking ids). */
export const shortToken = (len = 12) =>
  randomUUID().replace(/-/g, '').slice(0, len);

export default { uuid, isUuid, shortToken };
