const STORAGE_KEY = 'webpulse_alerts';

function getStoredAlerts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveStoredAlerts(alerts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  } catch {
    // ignore
  }
}

const DEFAULT_ALERTS = [
  {
    id: 'alt_1',
    name: 'Traffic spike trigger',
    metric: 'visitors',
    condition: 'spike above 150%',
    threshold: 'in 1 hour',
    enabled: true,
    last_triggered_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    project_id: null
  },
  {
    id: 'alt_2',
    name: 'Monthly event limit warning',
    metric: 'usage',
    condition: 'exceeds',
    threshold: '80% of monthly plan limit',
    enabled: true,
    last_triggered_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    project_id: null
  }
];

export async function getAlerts({ projectId } = {}) {
  let stored = getStoredAlerts();
  if (!stored) {
    stored = DEFAULT_ALERTS;
    saveStoredAlerts(stored);
  }
  if (projectId) {
    return stored.filter((a) => !a.project_id || a.project_id === projectId);
  }
  return stored;
}

export async function createAlert(alertData) {
  const alerts = (getStoredAlerts() || DEFAULT_ALERTS).slice();
  const newAlert = {
    id: `alt_${Date.now()}`,
    name: alertData.name || 'New alert',
    metric: alertData.metric || 'visitors',
    condition: alertData.condition || 'exceeds',
    threshold: alertData.threshold || '',
    enabled: alertData.enabled !== false,
    project_id: alertData.projectId || null,
    created_at: new Date().toISOString(),
    last_triggered_at: null
  };
  alerts.unshift(newAlert);
  saveStoredAlerts(alerts);
  return newAlert;
}

export async function deleteAlert(id) {
  const alerts = (getStoredAlerts() || DEFAULT_ALERTS).filter((a) => a.id !== id);
  saveStoredAlerts(alerts);
  return { success: true, id };
}
