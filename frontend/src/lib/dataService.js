import { apiRequest } from '../utils/api';

const COUNTRY_FLAGS = {
  'India': '🇮🇳',
  'United States': '🇺🇸',
  'United Kingdom': '🇬🇧',
  'Germany': '🇩🇪',
  'Canada': '🇨🇦',
  'France': '🇫🇷',
  'Australia': '🇦🇺',
  'Brazil': '🇧🇷',
  'Japan': '🇯🇵',
  'Netherlands': '🇳🇱',
  'Singapore': '🇸🇬',
  'Spain': '🇪🇸'
};

const CHART_COLORS = [
  'var(--chart-1, #4f46e5)',
  'var(--chart-2, #06b6d4)',
  'var(--chart-3, #10b981)',
  'var(--chart-4, #f59e0b)',
  'var(--chart-5, #8b5cf6)'
];

function relTime(dateStr) {
  if (!dateStr) return 'just now';
  const now = Date.now();
  const past = new Date(dateStr).getTime();
  const diffSec = Math.max(0, Math.floor((now - past) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

function formatDuration(sec) {
  if (!sec || isNaN(sec)) return '0s';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

function pctChange(current, previous) {
  if (!previous) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function capitalize(value) {
  if (!value) return 'Desktop';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Fetch and normalize analytics for any range and project scope.
 * Data is sourced exclusively from the Express backend, which reads Supabase
 * with the service role. No demo/sample fallback: when nothing is recorded the
 * result is simply empty (honest zeros).
 */
export async function fetchAnalyticsData({ projectId = 'all', range = '24h', timezone } = {}) {
  const pId = projectId && projectId !== 'all' ? projectId : null;

  const queryParams = new URLSearchParams();
  queryParams.set('range', range);
  if (pId) queryParams.set('projectId', pId);
  if (timezone) queryParams.set('timezone', timezone);
  queryParams.set('limit', '50');

  const raw = await apiRequest(`/analytics/overview?${queryParams.toString()}`) || {};

  const viewsTotal = Number(raw.viewsTotal || 0);
  const sessionsTotal = Number(raw.sessions || 0);
  const uniqueVisitors = Number(raw.uniqueVisitors ?? sessionsTotal);
  const realTimeVisitors = Number(raw.realTimeVisitors || 0);

  const trafficData = (raw.trafficData || []).map((d) => ({
    name: d.name,
    views: Number(d.views || 0),
    visitors: Number(d.visitors || 0),
    sessions: Number(d.sessions || 0),
    fullDate: d.fullDate,
    compare: Number(d.compare || 0)
  }));
  const sparkline = raw.sparkline || [];

  const pages = (raw.topPages || []).map((p) => {
    const path = p.url || p.path || '/';
    return {
      path,
      title: p.title || (path === '/' ? 'Home' : path.replace(/^\//, '').replace(/-/g, ' ')),
      views: Number(p.views || 0),
      visitors: Number(p.unique_visitors ?? 0),
      avg: '—',
      bounce: null,
      delta: null
    };
  });

  const sourceTotal = (raw.sourceData || []).reduce((a, s) => a + Number(s.value || 0), 0) || 1;
  const sources = (raw.sourceData || []).map((s, idx) => ({
    name: s.name || 'Direct',
    key: (s.name || 'direct').toLowerCase(),
    visitors: Number(s.value || 0),
    share: Math.round((Number(s.value || 0) / sourceTotal) * 1000) / 10,
    color: s.color || CHART_COLORS[idx % CHART_COLORS.length]
  }));

  const countryTotal = (raw.countryStats || []).reduce((a, c) => a + Number(c.value || 0), 0) || 1;
  const geography = (raw.countryStats || []).map((c) => ({
    name: c.name,
    flag: COUNTRY_FLAGS[c.name] || '🌐',
    visitors: Number(c.value || 0),
    sessions: Number(c.value || 0),
    bounce: null,
    share: Math.round((Number(c.value || 0) / countryTotal) * 1000) / 10
  }));

  const devices = (raw.deviceStats || []).map((d, i) => ({
    name: d.name,
    value: Number(d.value || 0),
    visitors: Number(d.value || 0),
    color: d.color || CHART_COLORS[i % CHART_COLORS.length]
  }));

  const browsers = (raw.browserStats || []).map((b, i) => ({
    name: b.name,
    value: Number(b.value || 0),
    color: CHART_COLORS[i % CHART_COLORS.length]
  }));

  const os = (raw.osStats || []).map((o) => ({
    name: o.name,
    value: Number(o.value || 0),
    sessions: Number(o.value || 0)
  }));

  const liveActivity = (raw.liveActivity || []).map((a) => {
    const locParts = (a.location || '').split(',');
    const country = locParts[locParts.length - 1]?.trim() || 'Unknown';
    return {
      id: a.id || `${a.timestamp}-${a.path}`,
      type: a.type || 'view',
      verb: 'Visited',
      label: a.title || 'Page view',
      page: a.path || '/',
      country,
      flag: COUNTRY_FLAGS[country] || '🌐',
      device: a.device || 'Desktop',
      browser: a.browser || 'Unknown',
      os: a.os || 'Unknown',
      timestamp: a.timestamp,
      secondsAgo: a.timestamp ? Math.max(0, Math.floor((Date.now() - new Date(a.timestamp).getTime()) / 1000)) : 0
    };
  });

  const sessionsList = (raw.sessionsList || []).map((s) => {
    const country = s.country_code || 'Unknown';
    const dur = Number(s.duration_seconds || 0);
    return {
      id: s.session_id || s.id,
      country,
      flag: COUNTRY_FLAGS[country] || '🌐',
      currentPage: s.exit_page || s.entry_page || '/',
      device: capitalize(s.device_type),
      browser: s.browser || 'Unknown',
      os: s.operating_system || 'Unknown',
      pages: s.page_views || 1,
      events: s.event_count || 0,
      duration: dur,
      durationLabel: formatDuration(dur),
      startedLabel: s.started_at ? relTime(s.started_at) : 'recently',
      started: s.started_at || null,
      timeline: [
        {
          time: s.started_at ? new Date(s.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '00:00',
          title: 'Entered via ' + (s.entry_page || '/'),
          desc: s.referrer ? `Referrer: ${s.referrer}` : 'Direct hit'
        },
        ...(s.event_count > 0
          ? [{
              time: s.last_activity_at ? new Date(s.last_activity_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '00:00',
              title: `Triggered ${s.event_count} custom event(s)`
            }]
          : []),
        {
          time: s.last_activity_at ? new Date(s.last_activity_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '00:00',
          title: 'Last active at ' + (s.exit_page || s.entry_page || '/')
        }
      ]
    };
  });

  const visitorsList = (raw.visitorsList || []).map((v) => {
    const country = v.country_name || v.country || 'Unknown';
    return {
      id: v.visitor_hash ? v.visitor_hash.substring(0, 16) : (v.session_id || v.id),
      country,
      flag: COUNTRY_FLAGS[country] || '🌐',
      city: v.city || 'Unknown',
      device: capitalize(v.device_type),
      browser: v.browser || 'Unknown',
      os: v.os || v.operating_system || 'Unknown',
      sessions: 1,
      pages: 1,
      pageViews: 1,
      events: 0,
      duration: '—',
      firstSeen: v.first_seen_at ? relTime(v.first_seen_at) : (v.created_at ? relTime(v.created_at) : 'recently'),
      lastSeen: v.last_seen_at ? relTime(v.last_seen_at) : (v.last_seen ? relTime(v.last_seen) : 'just now'),
      started: v.last_seen_at ? relTime(v.last_seen_at) : (v.last_seen ? relTime(v.last_seen) : 'just now'),
      status: v.is_active ? 'active' : 'idle'
    };
  });

  const eventsList = (raw.eventsSummary || []).map((e) => ({
    name: e.name,
    label: String(e.name || '').replace(/_/g, ' '),
    occurrences: Number(e.occurrences || 0),
    visitors: Number(e.visitors || 0),
    conversion: null,
    last: e.last ? relTime(e.last) : '—'
  }));

  const eventsTotal = eventsList.reduce((a, e) => a + e.occurrences, 0);

  return {
    sampleData: false,
    installed: viewsTotal > 0 || realTimeVisitors > 0,
    realTimeVisitors,
    kpis: [
      { key: 'visitors', label: 'Visitors', value: uniqueVisitors, delta: null, format: 'int', icon: 'users' },
      { key: 'sessions', label: 'Sessions', value: sessionsTotal, delta: pctChange(sessionsTotal, Number(raw.prevSessions || 0)), format: 'int', icon: 'activity' },
      { key: 'pageViews', label: 'Page views', value: viewsTotal, delta: pctChange(viewsTotal, Number(raw.prevViews || 0)), format: 'int', icon: 'eye' },
      { key: 'bounce', label: 'Bounce rate', value: raw.bounceRate != null ? Number(raw.bounceRate) : 0, delta: null, format: 'pct', invert: true, icon: 'percent' },
      { key: 'avg', label: 'Avg. session', value: formatDuration(Number(raw.avgSessionDuration || 0)), delta: null, format: 'dur', icon: 'timer' },
      { key: 'events', label: 'Events', value: eventsTotal, delta: null, format: 'int', icon: 'zap' }
    ],
    trafficData,
    sparkline,
    pages,
    sources,
    geography,
    devices,
    browsers,
    os,
    liveActivity,
    sessionsList,
    visitorsList,
    eventsList
  };
}

export default {
  fetchAnalyticsData
};
