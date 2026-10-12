const STORAGE_KEY = 'webpulse_api_keys';

function getStoredKeys() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveStoredKeys(keys) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  } catch {
    // ignore
  }
}

const DEFAULT_KEYS = [
  {
    id: 'k1',
    name: 'Production Ingest Key',
    key_prefix: 'wp_live_91af',
    created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    last_used_at: new Date().toISOString(),
    revoked_at: null,
    project_id: null
  },
  {
    id: 'k2',
    name: 'CI/CD Exporter Key',
    key_prefix: 'wp_live_83b1',
    created_at: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
    last_used_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    revoked_at: null,
    project_id: null
  }
];

export async function getApiKeys({ projectId } = {}) {
  let stored = getStoredKeys();
  if (!stored) {
    stored = DEFAULT_KEYS;
    saveStoredKeys(stored);
  }
  if (projectId) {
    return stored.filter((k) => !k.project_id || k.project_id === projectId);
  }
  return stored;
}

export async function createApiKey({ projectId, name }) {
  const randomSuffix = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
  const fullKey = `wp_live_${randomSuffix}`;
  const key_prefix = fullKey.slice(0, 12);
  const newKey = {
    id: `k_${Date.now()}`,
    name: name || 'API Key',
    fullKey,
    key_prefix,
    created_at: new Date().toISOString(),
    last_used_at: null,
    revoked_at: null,
    project_id: projectId || null
  };
  const keys = (getStoredKeys() || DEFAULT_KEYS).slice();
  keys.unshift(newKey);
  saveStoredKeys(keys);
  return newKey;
}

export async function revokeApiKey(id) {
  const keys = (getStoredKeys() || DEFAULT_KEYS).map((k) => {
    if (k.id === id) {
      return { ...k, revoked_at: new Date().toISOString() };
    }
    return k;
  });
  saveStoredKeys(keys);
  return { success: true, id };
}
