import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useOutletContext, useNavigate, Link } from 'react-router-dom';
import { Plus, ArrowUpRight, Loader2, Copy, X, Lock, AlertTriangle } from 'lucide-react';
import { apiRequest } from '../utils/api';
import Modal from '../components/Modal';
import ErrorBoundary from '../components/ErrorBoundary';
import { useToast } from '../context/ToastContext';
import NetworkGlobe from '../components/dashboard/NetworkGlobe';
import { useTheme } from '../context/ThemeContext';
import AnimatedNumber from '../components/AnimatedNumber';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

function formatRelativeTime(dateInput) {
  if (!dateInput) return 'just now';
  const time = new Date(dateInput).getTime();
  if (isNaN(time)) return 'recently';
  const diffSec = Math.floor((Date.now() - time) / 1000);
  if (diffSec < 45) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

const DARK_WAVE_PALETTE = ['#ffffff', '#38bdf8', '#34d399', '#f472b6', '#a1a1aa', '#fbbf24', '#a78bfa', '#fb7185'];
const LIGHT_WAVE_PALETTE = ['#18181b', '#0284c7', '#059669', '#db2777', '#71717a', '#d97706', '#7c3aed', '#e11d48'];

const CustomTrafficTooltip = ({ active, payload, label, isCombined }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload || {};
  const dateStr = data.fullDate
    ? new Date(data.fullDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        ...(data.fullDate.includes(':')
          ? { hour: '2-digit', minute: '2-digit' }
          : { year: 'numeric' })
      })
    : label;

  if (!isCombined && payload.length > 0 && payload[0]?.dataKey !== 'views') {
    const sortedProjects = [...payload].sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
    return (
      <div className="bg-[var(--wp-bg-surface)] border border-[var(--wp-border-default)] rounded-md p-2.5 shadow-2xl text-[11px] font-mono space-y-1.5 z-50 min-w-[160px]">
        <div className="text-[var(--wp-text-muted)] font-medium text-[10px] uppercase border-b border-[var(--wp-border-subtle)] pb-1">
          {dateStr}
        </div>
        {sortedProjects.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-[var(--wp-text-secondary)] truncate max-w-[140px]">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: entry.color || entry.stroke }}
              />
              <span className="truncate">{entry.name}</span>
            </span>
            <span className="font-bold text-[var(--wp-text-primary)] tabular-nums">
              {(entry.value ?? 0).toLocaleString()}
            </span>
          </div>
        ))}
        {sortedProjects.length > 1 && (
          <div className="flex items-center justify-between gap-3 border-t border-[var(--wp-border-subtle)] pt-1 text-[10px]">
            <span className="text-[var(--wp-text-muted)]">Total</span>
            <span className="font-semibold text-[var(--wp-text-secondary)] tabular-nums">
              {sortedProjects.reduce((sum, entry) => sum + (entry.value ?? 0), 0).toLocaleString()}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[var(--wp-bg-surface)] border border-[var(--wp-border-default)] rounded-md p-2.5 shadow-2xl text-[11px] font-mono space-y-1.5 z-50 min-w-[130px]">
      <div className="text-[var(--wp-text-muted)] font-medium text-[10px] uppercase border-b border-[var(--wp-border-subtle)] pb-1">
        {dateStr}
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[var(--wp-text-secondary)]">Events:</span>
        <span className="font-bold text-[var(--wp-text-primary)] tabular-nums">
          {(data.views ?? 0).toLocaleString()}
        </span>
      </div>
      {data.visitors !== undefined && (
        <div className="flex items-center justify-between gap-3">
          <span className="text-[var(--wp-text-secondary)]">Visitors:</span>
          <span className="font-medium text-[var(--wp-text-secondary)] tabular-nums">
            {(data.visitors ?? 0).toLocaleString()}
          </span>
        </div>
      )}
      {data.sessions !== undefined && (
        <div className="flex items-center justify-between gap-3">
          <span className="text-[var(--wp-text-secondary)]">Sessions:</span>
          <span className="font-medium text-[var(--wp-text-secondary)] tabular-nums">
            {(data.sessions ?? 0).toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
};

export default function Dashboard() {
  const { user, loadUser, usageStats, socket, setIsPageLoading } = useOutletContext();
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [registerDomain, setRegisterDomain] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [dashboardStats, setDashboardStats] = useState({
    realTimeVisitors: 0,
    trafficData: [],
    sourceData: [],
    liveActivity: [],
    sparkline: []
  });

  const [timeRange, setTimeRange] = useState('30d');
  const [trafficViewMode, setTrafficViewMode] = useState('projects');
  const [hiddenProjectIds, setHiddenProjectIds] = useState(() => new Set());
  const [globeError, setGlobeError] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [showSnippetOverlay, setShowSnippetOverlay] = useState(true);
  const [orgSummary, setOrgSummary] = useState(null);
  const [alphaFeatures, setAlphaFeatures] = useState([]);
  const [recentAuditLogs, setRecentAuditLogs] = useState([]);
  const inFlightRef = useRef(false);
  const overviewCacheRef = useRef(new Map());
  const loadUserRef = useRef(loadUser);
  loadUserRef.current = loadUser;

  const refreshIntervalMs = Math.max(
    5000,
    Number(usageStats?.limits?.dashboard_refresh_seconds || 60) * 1000
  );

  const projectSeries = useMemo(() => {
    const palette = isDark ? DARK_WAVE_PALETTE : LIGHT_WAVE_PALETTE;
    return (projects || []).map((project, index) => ({
      id: project.id,
      name: project.name,
      color: palette[index % palette.length],
    }));
  }, [projects, isDark]);

  const activeProjectSeries = useMemo(
    () => projectSeries.filter((p) => !hiddenProjectIds.has(p.id)),
    [projectSeries, hiddenProjectIds]
  );

  const multiProjectTrafficData = useMemo(() => {
    const rawTraffic = dashboardStats?.trafficData;
    if (!Array.isArray(rawTraffic) || rawTraffic.length === 0) return [];
    return rawTraffic.map((point) => {
      const row = { ...point };
      for (const proj of projectSeries) {
        row[proj.id] = point.byProject?.[proj.id] ?? 0;
      }
      return row;
    });
  }, [dashboardStats?.trafficData, projectSeries]);

  const toggleProjectSeries = useCallback((projectId) => {
    setTrafficViewMode('projects');
    setHiddenProjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  }, []);

  const loadData = useCallback(async (showLoading = true) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    const cached = overviewCacheRef.current.get(timeRange);
    if (cached && showLoading) {
      setDashboardStats(cached);
    }
    if (showLoading && !cached) setLoading(true);
    try {
      const [projectsData, statsData] = await Promise.all([
        apiRequest('/projects'),
        apiRequest(`/analytics/overview?range=${timeRange}`).catch(() => null)
      ]);

      if (['max', 'enterprise'].includes(String(usageStats?.plan || user?.normalized_plan || '').toLowerCase())) {
        Promise.all([
          apiRequest(`/analytics/organization?range=${timeRange}`).catch(() => null),
          apiRequest('/alpha/features').catch(() => null),
          apiRequest('/audit-logs?limit=5').catch(() => null),
        ]).then(([org, alpha, audit]) => {
          if (org) setOrgSummary(org);
          if (alpha?.features) setAlphaFeatures(alpha.features);
          if (audit?.logs) setRecentAuditLogs(audit.logs);
        }).catch(() => {});
      }

      setGlobeError(!statsData);
      setProjects(projectsData);

      if (statsData) {
        overviewCacheRef.current.set(timeRange, statsData);
        setDashboardStats(statsData);
      }

      if (projectsData.length > 0) {
        const statsPromises = projectsData.map(p =>
          apiRequest(`/analytics/projects/${p.id}/overview`).catch(() => null)
        );
        const allStats = await Promise.all(statsPromises);

        const projectStats = projectsData.map((p, i) => ({
          ...p,
          views: allStats[i]?.current_month_views || 0,
          sessions: allStats[i]?.sessionCount || 0,
          storageUsed: allStats[i]?.storageUsed || 0,
        }));

        projectStats.sort((a, b) => b.views - a.views);
        setStats(projectStats);
      } else {
        setStats([]);
      }
    } catch (err) {
      if (showLoading) showToast(err.message, 'error');
      console.error(err);
    } finally {
      inFlightRef.current = false;
      if (showLoading) {
        setLoading(false);
        setIsPageLoading?.(false);
      }
    }
  }, [timeRange, showToast, setIsPageLoading]);

  useEffect(() => {
    if (!user?.id) return;
    loadData();

    const interval = setInterval(() => {
      if (typeof document === 'undefined' || !document.hidden) {
        loadData(false);
      }
    }, refreshIntervalMs);

    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        loadData(false);
      }
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    if (socket) {
      const handleVisitorUpdate = () => loadData(false);
      const handleUsageUpdate = () => loadUserRef.current?.();

      socket.on('visitor_update', handleVisitorUpdate);
      socket.on('usage_update', handleUsageUpdate);

      return () => {
        clearInterval(interval);
        if (typeof document !== 'undefined') {
          document.removeEventListener('visibilitychange', handleVisibilityChange);
        }
        socket.off('visitor_update', handleVisitorUpdate);
        socket.off('usage_update', handleUsageUpdate);
      };
    }

    return () => {
      clearInterval(interval);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [user?.id, refreshIntervalMs, socket, loadData]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (creating) return;

    setCreating(true);
    try {
      await apiRequest('/projects', {
        method: 'POST',
        body: JSON.stringify({ name: projectName }),
      });
      setProjectName('');
      setShowModal(false);
      showToast('Project created successfully!', 'success');
      loadData();
      loadUser();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  const cleanUp = () => {
    setShowModal(false);
    setRegisterDomain(false);
    setProjectName('');
    setDomain('');
  };

  const handleRegisterDomain = async (e) => {
    e.preventDefault();
    if (creating) return;

    if (!/^[a-zA-Z0-9_-]+$/.test(projectName)) {
      showToast('Project name can only contain letters, numbers, underscores, and hyphens', 'error');
      return;
    }

    setCreating(true);
    try {
      const project = await apiRequest('/projects', {
        method: 'POST',
        body: JSON.stringify({ name: projectName, allowedOrigins: domain }),
      });
      cleanUp();
      showToast('Domain registered successfully!', 'success');
      loadData();
      loadUser();
      if (project?.name) {
        navigate(`/dashboard/projects/${encodeURIComponent(project.name)}`);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  const formatUsagePercent = (used, limit) => {
    const numUsed = Number(used);
    const numLimit = Number(limit);
    if (!numLimit || isNaN(numLimit) || numLimit <= 0 || isNaN(numUsed)) return '0%';
    const pct = (numUsed / numLimit) * 100;
    if (pct > 0 && pct < 0.1) return '<0.1%';
    return `${Math.min(100, Math.max(0, Math.round(pct)))}%`;
  };

  const formatCompactLimit = (limit) => {
    const num = Number(limit);
    if (!num || isNaN(num) || num <= 0) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(0)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {/* Single-Row Toolbar Skeleton */}
        <div className="flex justify-between items-center h-8">
          <div className="space-y-1">
            <div className="h-4 w-32 bg-[var(--wp-border-default)] rounded" />
            <div className="h-3 w-48 bg-[var(--wp-border-subtle)] rounded hidden sm:block" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-36 bg-[var(--wp-border-subtle)] rounded hidden sm:block" />
            <div className="h-7 w-24 bg-[var(--wp-border-default)] rounded" />
          </div>
        </div>

        {/* Unified 4-Column KPI Bar Skeleton */}
        <div className="wp-panel min-h-[82px] grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[var(--wp-border-default)] bg-[var(--wp-bg-surface)]">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3.5 space-y-2">
              <div className="h-3 w-20 bg-[var(--wp-border-subtle)] rounded" />
              <div className="h-6 w-24 bg-[var(--wp-border-default)] rounded" />
              <div className="h-2.5 w-32 bg-[var(--wp-border-subtle)] rounded" />
            </div>
          ))}
        </div>

        {/* Studio Split Workspace Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[460px]">
          <div className="lg:col-span-7 wp-panel flex flex-col bg-[var(--wp-bg-surface)]">
            <div className="wp-panel-header">
              <div className="h-3.5 w-28 bg-[var(--wp-border-subtle)] rounded" />
              <div className="h-3 w-20 bg-[var(--wp-border-subtle)] rounded" />
            </div>
            <div className="wp-studio-canvas flex-1 min-h-[380px] p-4 flex items-center justify-center">
              <div className="w-full h-full bg-[var(--wp-border-subtle)]/30 rounded" />
            </div>
          </div>
          <div className="lg:col-span-5 wp-panel flex flex-col bg-[var(--wp-bg-surface)]">
            <div className="wp-panel-header">
              <div className="h-3.5 w-24 bg-[var(--wp-border-subtle)] rounded" />
              <div className="h-3 w-16 bg-[var(--wp-border-subtle)] rounded" />
            </div>
            <div className="wp-studio-canvas flex-1 min-h-[380px] p-4 flex items-center justify-center">
              <div className="w-40 h-40 rounded-full border border-[var(--wp-border-default)]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalViewsUsed = stats?.reduce((acc, curr) => acc + (Number(curr.views) || 0), 0) || 0;
  const viewLimit = Number(usageStats?.monthlyLimit) || 1000;
  const quotaUsed = usageStats?.totalViews !== undefined ? Number(usageStats.totalViews) || 0 : totalViewsUsed;
  const viewPercentage = Math.min(Math.max((quotaUsed / viewLimit) * 100, 0), 100);

  const projectsUsed = usageStats?.projectCount ?? projects.length;
  const projectLimit = usageStats?.projectLimit ?? 5;
  const projectLimitReached = projectsUsed >= projectLimit;

  const openCreateProject = () => {
    if (projectLimitReached) {
      showToast(`Project limit reached (${projectsUsed}/${projectLimit} on ${usageStats?.plan || 'free'} plan). Upgrade your plan to create more.`, 'error', {
        label: 'Go to Upgrade',
        icon: <ArrowUpRight className="h-3.5 w-3.5" />,
        onClick: () => navigate('/dashboard/billing'),
      });
      return;
    }
    setRegisterDomain(false);
    setDomain('');
    setShowModal(true);
  };

  const openRegisterDomain = () => {
    if (projectLimitReached) {
      showToast(`Project limit reached (${projectsUsed}/${projectLimit} on ${usageStats?.plan || 'free'} plan). Delete a project or upgrade your plan to register a new domain.`, 'error', {
        label: 'Go to Upgrade',
        icon: <ArrowUpRight className="h-3.5 w-3.5" />,
        onClick: () => navigate('/dashboard/billing'),
      });
      return;
    }
    setRegisterDomain(true);
    setDomain('');
    setShowModal(true);
  };

  const openIntegrationGuide = () => {
    if (projects.length > 0) {
      navigate(`/dashboard/projects/${encodeURIComponent(projects[0].name)}/integration`);
    } else {
      navigate('/dashboard/projects');
    }
  };

  const { realTimeVisitors = 0, liveActivity = [] } = dashboardStats || {};
  const totalSessionsCount = stats?.reduce((acc, curr) => acc + (Number(curr.sessions) || 0), 0) || Number(dashboardStats?.sessions) || totalViewsUsed || 0;
  const rangeLabel = timeRange === 'realtime' ? 'Live' : timeRange;
  const eventsCount = dashboardStats?.viewsTotal !== undefined ? Number(dashboardStats.viewsTotal) || 0 : totalViewsUsed;
  const sessionsCount = dashboardStats?.sessions !== undefined ? Number(dashboardStats.sessions) || 0 : totalSessionsCount;

  return (
    <div className="space-y-3 font-sans">
      {/* 1. Single-Row Studio Toolbar (height ~32px) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div>
          <h1 className="wp-title-page flex items-center gap-2">
            <span>Global Insights</span>
          </h1>
          <p className="text-[11.5px] text-[var(--wp-text-muted)] mt-0.5">
            Real-time visitor telemetry across connected domains.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Segmented Time Range Selector */}
          <div className="inline-flex items-center p-0.5 rounded-md border border-[var(--wp-border-default)] bg-[var(--wp-bg-surface)] text-xs">
            {['realtime', '24h', '7d', '30d'].map((range) => {
              const active = timeRange === range;
              return (
                <button
                  key={range}
                  type="button"
                  onClick={() => setTimeRange(range)}
                  className={`h-6 px-2.5 rounded text-[11px] font-mono capitalize transition-colors ${
                    active
                      ? 'bg-[var(--wp-bg-active)] text-[var(--wp-text-primary)] font-medium'
                      : 'text-[var(--wp-text-secondary)] hover:text-[var(--wp-text-primary)]'
                  }`}
                >
                  {range === 'realtime' ? 'Live' : range}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={openRegisterDomain}
            className="wp-btn wp-btn-secondary h-7 text-xs px-2.5 hidden sm:inline-flex"
          >
            Register Domain
          </button>
          <button
            onClick={openCreateProject}
            className="wp-btn wp-btn-primary h-7 text-xs px-2.5 gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Disrupted Telemetry Notice */}
      {globeError && (
        <div className="p-2.5 rounded-md border border-amber-500/30 bg-amber-500/5 text-amber-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span>Telemetry endpoint temporarily unreachable. Showing cached metrics.</span>
          </div>
          <button
            type="button"
            onClick={() => loadData(true)}
            className="text-[11px] font-mono underline hover:text-amber-300"
          >
            Retry sync
          </button>
        </div>
      )}

      {/* 0-Projects Onboarding Studio State */}
      {projects.length === 0 && (
        <div className="wp-panel p-5 bg-[var(--wp-bg-surface)] border border-dashed border-[var(--wp-border-strong)] rounded-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="wp-live-dot" />
                <h2 className="text-sm font-semibold text-[var(--wp-text-primary)]">
                  Your analytics workspace is ready
                </h2>
              </div>
              <p className="text-xs text-[var(--wp-text-muted)] mt-1 max-w-xl">
                Connect your first website to start streaming visitor telemetry, traffic channels, and real-time geographic maps.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={openRegisterDomain}
                className="wp-btn wp-btn-secondary text-xs h-7 px-3"
              >
                Register Domain
              </button>
              <button
                type="button"
                onClick={openCreateProject}
                className="wp-btn wp-btn-primary text-xs h-7 px-3"
              >
                Deploy Project
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-[var(--wp-border-subtle)] text-xs">
            <div className="p-2.5 rounded bg-[var(--wp-bg-subtle)] border border-[var(--wp-border-subtle)] space-y-1">
              <span className="font-mono text-[10px] text-[var(--wp-text-muted)]">01 / DOMAIN</span>
              <p className="font-medium text-[var(--wp-text-primary)]">Register your site</p>
              <p className="text-[11px] text-[var(--wp-text-muted)]">Whitelist your domain origin to authorize incoming hits.</p>
            </div>
            <div className="p-2.5 rounded bg-[var(--wp-bg-subtle)] border border-[var(--wp-border-subtle)] space-y-1">
              <span className="font-mono text-[10px] text-[var(--wp-text-muted)]">02 / SNIPPET</span>
              <p className="font-medium text-[var(--wp-text-primary)]">Embed lightweight tag</p>
              <p className="text-[11px] text-[var(--wp-text-muted)]">Privacy-first &lt;1KB tracking script tag.</p>
            </div>
            <div className="p-2.5 rounded bg-[var(--wp-bg-subtle)] border border-[var(--wp-border-subtle)] space-y-1">
              <span className="font-mono text-[10px] text-[var(--wp-text-muted)]">03 / TELEMETRY</span>
              <p className="font-medium text-[var(--wp-text-primary)]">Inspect live stream</p>
              <p className="text-[11px] text-[var(--wp-text-muted)]">Watch real-time visitors, geography, and momentum live.</p>
            </div>
          </div>
        </div>
      )}

      {/* Quota Warning / Limit Banner (80%, 90%, 100%) */}
      {viewLimit > 0 && quotaUsed / viewLimit >= 0.8 && (
        <div
          className={`wp-panel p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
            quotaUsed >= viewLimit
              ? 'border-rose-500/40 bg-rose-500/10 text-rose-200'
              : quotaUsed / viewLimit >= 0.9
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                : 'border-blue-500/40 bg-blue-500/10 text-blue-200'
          }`}
        >
          <div className="flex items-start sm:items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-semibold">
                {quotaUsed >= viewLimit
                  ? 'Monthly event quota reached (100%): '
                  : quotaUsed / viewLimit >= 0.9
                    ? 'Warning — 90%+ monthly quota used: '
                    : 'Heads up — 80%+ monthly quota used: '}
              </span>
              <span>
                {quotaUsed.toLocaleString()} / {viewLimit.toLocaleString()} events used.
                {quotaUsed >= viewLimit
                  ? ' New billable events are paused while your dashboard remains accessible.'
                  : ''}
                {usageStats?.resetDate
                  ? ` Resets ${new Date(usageStats.resetDate).toUTCString().slice(0, 16)} UTC.`
                  : ''}
              </span>
            </div>
          </div>
          <Link
            to="/dashboard/billing"
            className="wp-btn wp-btn-primary h-7 px-3 text-xs shrink-0 self-start sm:self-auto"
          >
            Upgrade Plan
          </Link>
        </div>
      )}

      {/* Max Workspace: Organization Analytics, Audit Logs & Alpha Flags */}
      {['max', 'enterprise'].includes(String(usageStats?.plan || user?.normalized_plan || '').toLowerCase()) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="wp-panel p-3.5 bg-[var(--wp-bg-surface)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="wp-title-card">Organization Analytics</span>
              <span className="text-[10px] font-mono text-[var(--wp-text-muted)] uppercase">Max</span>
            </div>
            <div className="text-xl font-bold font-mono text-[var(--wp-text-primary)]">
              {(orgSummary?.accountTotals?.totalEvents || 0).toLocaleString()} events
            </div>
            <p className="text-[11px] font-mono text-[var(--wp-text-muted)]">
              Across {orgSummary?.accountTotals?.activeProjects ?? projects.length} authorized projects
            </p>
          </div>

          <div className="wp-panel p-3.5 bg-[var(--wp-bg-surface)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="wp-title-card">Alpha Experimental</span>
              <span className="text-[10px] font-mono text-amber-400 uppercase">Unstable</span>
            </div>
            <div className="space-y-1 text-[11px] font-mono">
              {alphaFeatures.length > 0 ? alphaFeatures.map((f) => (
                <div key={f.key} className="flex items-center justify-between">
                  <span className="text-[var(--wp-text-secondary)] truncate">{f.name}</span>
                  <span className={f.enabled ? 'text-emerald-400' : 'text-[var(--wp-text-muted)]'}>
                    {f.enabled ? 'ON' : 'OFF'}
                  </span>
                </div>
              )) : (
                <p className="text-[var(--wp-text-muted)]">Eligible on Max accounts</p>
              )}
            </div>
          </div>

          <div className="wp-panel p-3.5 bg-[var(--wp-bg-surface)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="wp-title-card">Audit Trail</span>
              <span className="text-[10px] font-mono text-[var(--wp-text-muted)] uppercase">Immutable</span>
            </div>
            <div className="space-y-1 text-[11px] font-mono">
              {recentAuditLogs.length > 0 ? recentAuditLogs.slice(0, 3).map((l) => (
                <div key={l.id} className="flex items-center justify-between gap-2">
                  <span className="text-[var(--wp-text-secondary)] truncate">{l.action}</span>
                  <span className="text-[var(--wp-text-muted)] shrink-0">
                    {new Date(l.created_at).toLocaleDateString()}
                  </span>
                </div>
              )) : (
                <p className="text-[var(--wp-text-muted)]">No audit events recorded yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Unified 4-Column KPI Bar */}
      <div className="wp-panel grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[var(--wp-border-subtle)] bg-[var(--wp-bg-surface)]">
        {/* Col 1: Live Visitors */}
        <div className="p-3 sm:p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px]">
            <span className="wp-label-section uppercase">Live visitors</span>
            <span className="inline-flex items-center gap-1.5 text-[10.5px] font-mono text-[var(--wp-text-secondary)]">
              <span className="wp-live-dot" />
              Live
            </span>
          </div>
          <div className="mt-1">
            <span className="wp-kpi-value text-2xl font-bold tracking-tight text-[var(--wp-text-primary)] tabular-nums">
              <AnimatedNumber value={realTimeVisitors || 0} />
            </span>
          </div>
          <div className="text-[11px] font-mono text-[var(--wp-text-muted)] mt-1 truncate">
            {realTimeVisitors > 0 ? 'Concurrent active streams' : 'No active streams (last 5m)'}
          </div>
        </div>

        {/* Col 2: Events Tracked */}
        <div className="p-3 sm:p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px]">
            <span className="wp-label-section uppercase">Events tracked</span>
            <span className="text-[10.5px] font-mono text-[var(--wp-text-muted)] uppercase">{rangeLabel}</span>
          </div>
          <div className="mt-1">
            <span className="wp-kpi-value text-2xl font-bold tracking-tight text-[var(--wp-text-primary)] tabular-nums">
              {eventsCount.toLocaleString()}
            </span>
          </div>
          <div className="text-[11px] font-mono text-[var(--wp-text-muted)] mt-1 truncate">
            Recorded telemetry hits ({rangeLabel})
          </div>
        </div>

        {/* Col 3: Unique Sessions */}
        <div className="p-3 sm:p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px]">
            <span className="wp-label-section uppercase">Unique sessions</span>
            <span className="text-[10.5px] font-mono text-[var(--wp-text-muted)] uppercase">{rangeLabel}</span>
          </div>
          <div className="mt-1">
            <span className="wp-kpi-value text-2xl font-bold tracking-tight text-[var(--wp-text-primary)] tabular-nums">
              {sessionsCount.toLocaleString()}
            </span>
          </div>
          <div className="text-[11px] font-mono text-[var(--wp-text-muted)] mt-1 truncate">
            Distinct browsing visits across domains
          </div>
        </div>

        {/* Col 4: Capacity */}
        <div className="p-3 sm:p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px]">
            <span className="wp-label-section uppercase">Capacity</span>
            <span className="wp-metric-mono font-medium text-[var(--wp-text-primary)]">
              {formatUsagePercent(quotaUsed, viewLimit)}
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="wp-kpi-value text-xl font-bold tracking-tight text-[var(--wp-text-primary)] tabular-nums">
              {quotaUsed.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-[var(--wp-text-muted)]">
              / {formatCompactLimit(viewLimit)}
            </span>
          </div>
          <div className="mt-1.5 space-y-1">
            <div className="wp-meter-track">
              <div
                className="wp-meter-bar"
                style={{ width: `${Math.max(viewPercentage, quotaUsed > 0 ? 2 : 0)}%` }}
              />
            </div>
            <div className="text-[10px] font-mono text-[var(--wp-text-muted)] truncate">
              Monthly events allowance ({usageStats?.plan ? usageStats.plan.toUpperCase() : 'FREE'})
            </div>
          </div>
        </div>
      </div>

      {/* 3. Studio Split Workspace (7 / 5 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[460px]">
        {/* Col 7: Traffic Momentum */}
        <div className="lg:col-span-7 wp-panel flex flex-col bg-[var(--wp-bg-surface)]">
          <div className="wp-panel-header flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="wp-title-card">Traffic momentum</span>
              <span className="text-[10.5px] font-mono text-[var(--wp-text-muted)] px-1.5 py-0.5 rounded bg-[var(--wp-bg-subtle)] border border-[var(--wp-border-subtle)] uppercase">
                {timeRange}
              </span>
              {projectSeries.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap ml-1">
                  <button
                    type="button"
                    onClick={() => {
                      setTrafficViewMode('projects');
                      setHiddenProjectIds(new Set());
                    }}
                    className={`px-2 py-0.5 rounded text-[10.5px] font-mono border transition-colors ${
                      trafficViewMode === 'projects' && hiddenProjectIds.size === 0
                        ? 'bg-[var(--wp-bg-subtle)] text-[var(--wp-text-primary)] border-[var(--wp-border-default)]'
                        : 'text-[var(--wp-text-muted)] border-transparent hover:text-[var(--wp-text-secondary)]'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrafficViewMode('combined')}
                    className={`px-2 py-0.5 rounded text-[10.5px] font-mono border transition-colors ${
                      trafficViewMode === 'combined'
                        ? 'bg-[var(--wp-bg-subtle)] text-[var(--wp-text-primary)] border-[var(--wp-border-default)]'
                        : 'text-[var(--wp-text-muted)] border-transparent hover:text-[var(--wp-text-secondary)]'
                    }`}
                  >
                    Combined
                  </button>
                  {projectSeries.map((proj) => {
                    const isActive = trafficViewMode === 'projects' && !hiddenProjectIds.has(proj.id);
                    return (
                      <button
                        key={proj.id}
                        type="button"
                        onClick={() => toggleProjectSeries(proj.id)}
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10.5px] font-mono border transition-colors max-w-[130px] ${
                          isActive
                            ? 'bg-[var(--wp-bg-subtle)] text-[var(--wp-text-primary)] border-[var(--wp-border-default)]'
                            : 'text-[var(--wp-text-muted)] border-[var(--wp-border-subtle)] opacity-55 hover:opacity-85'
                        }`}
                        title={`Toggle ${proj.name}`}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: proj.color }}
                        />
                        <span className="truncate">{proj.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="text-[11px] font-mono text-[var(--wp-text-muted)]">
              {multiProjectTrafficData?.length || 0} data points
            </div>
          </div>

          <div className="wp-studio-canvas flex-1 min-h-[380px] p-2.5 sm:p-3 flex flex-col justify-between min-w-0">
            {multiProjectTrafficData && multiProjectTrafficData.length > 0 ? (
              <div className="w-full h-full min-h-[360px] min-w-0 flex-1 relative" style={{ minHeight: 360 }}>
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  minWidth={0}
                  minHeight={340}
                  initialDimension={{ width: 640, height: 340 }}
                  debounce={50}
                >
                  <AreaChart data={multiProjectTrafficData} margin={{ top: 12, right: 12, left: -10, bottom: 4 }}>
                    <defs>
                      <linearGradient id="studioTrafficGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--wp-chart-1)" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="var(--wp-chart-1)" stopOpacity={0.0} />
                      </linearGradient>
                      {activeProjectSeries.map((proj) => (
                        <linearGradient key={proj.id} id={`trafficGrad-${proj.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={proj.color} stopOpacity={0.2} />
                          <stop offset="100%" stopColor={proj.color} stopOpacity={0.0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--wp-chart-grid)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: 'var(--wp-text-muted)', fontSize: 10, fontFamily: 'monospace' }}
                      axisLine={{ stroke: 'var(--wp-border-subtle)' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: 'var(--wp-text-muted)', fontSize: 10, fontFamily: 'monospace' }}
                      axisLine={false}
                      tickLine={false}
                      width={34}
                      allowDecimals={false}
                      domain={[0, (dataMax) => Math.max(dataMax, 5)]}
                    />
                    <Tooltip
                      content={
                        <CustomTrafficTooltip
                          isCombined={trafficViewMode === 'combined' || activeProjectSeries.length === 0}
                        />
                      }
                    />
                    {trafficViewMode === 'projects' && activeProjectSeries.length > 0 ? (
                      activeProjectSeries.map((proj) => (
                        <Area
                          key={proj.id}
                          type="monotone"
                          dataKey={proj.id}
                          name={proj.name}
                          stroke={proj.color}
                          strokeWidth={1.75}
                          fillOpacity={1}
                          fill={`url(#trafficGrad-${proj.id})`}
                        />
                      ))
                    ) : (
                      <Area
                        type="monotone"
                        dataKey="views"
                        name="Events"
                        stroke="var(--wp-chart-1)"
                        strokeWidth={1.75}
                        fillOpacity={1}
                        fill="url(#studioTrafficGrad)"
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center p-6 space-y-2">
                <div className="text-xs font-mono text-[var(--wp-text-secondary)]">No traffic recorded yet</div>
                <p className="text-[11.5px] text-[var(--wp-text-muted)] max-w-sm">
                  Once your tracking snippet emits events, your momentum curve will render here in real time.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Col 5: Live Geography */}
        <div className="lg:col-span-5 wp-panel flex flex-col bg-[var(--wp-bg-surface)]">
          <div className="wp-panel-header">
            <div className="flex items-center gap-2">
              <span className="wp-title-card">Live geography</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--wp-text-secondary)]">
              <span className="wp-live-dot" />
              <span>{realTimeVisitors} active</span>
            </div>
          </div>

          <div className="wp-studio-canvas flex-1 min-h-[380px] relative flex flex-col items-center justify-center p-0 overflow-hidden">
            {usageStats?.features?.globe_analyze === false ? (
              <div className="w-full h-full min-h-[380px] p-4 flex flex-col justify-between bg-[var(--wp-bg-surface)]">
                <div className="border border-dashed border-[var(--wp-border-strong)] rounded-lg p-4 text-center space-y-2 bg-[var(--wp-bg-subtle)]">
                  <div className="mx-auto w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Lock className="h-4 w-4 text-amber-400" />
                  </div>
                  <p className="text-xs font-semibold text-[var(--wp-text-primary)]">
                    Globe Analyze is excluded from Nano
                  </p>
                  <p className="text-[11px] text-[var(--wp-text-muted)]">
                    Upgrade to Lite or higher to unlock the interactive 3D globe and regional heatmaps. Basic country statistics remain available below.
                  </p>
                  <Link
                    to="/dashboard/billing"
                    className="wp-btn wp-btn-primary h-7 px-3 text-[11px] inline-flex items-center"
                  >
                    Upgrade to unlock Globe Analyze
                  </Link>
                </div>

                <div className="mt-3 border border-[var(--wp-border-subtle)] rounded-md p-3 bg-[var(--wp-bg-canvas)]">
                  <div className="text-[10.5px] font-mono uppercase text-[var(--wp-text-muted)] mb-2">
                    Top Countries (Basic Geo)
                  </div>
                  {dashboardStats?.countryStats?.length > 0 ? (
                    <div className="space-y-1.5 text-xs">
                      {dashboardStats.countryStats.slice(0, 5).map((c) => (
                        <div key={c.country || c.name} className="flex items-center justify-between font-mono">
                          <span className="text-[var(--wp-text-primary)] truncate">{c.country || c.name || 'Unknown'}</span>
                          <span className="text-[var(--wp-text-muted)]">{(c.visitors || c.count || 0).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] font-mono text-[var(--wp-text-muted)]">
                      No country telemetry recorded yet.
                    </p>
                  )}
                </div>
              </div>
            ) : (
            <div className="w-full h-full relative min-h-[380px]">
              <ErrorBoundary scoped title="Live globe temporarily unavailable" message="Real-time map telemetry could not be loaded.">
                <NetworkGlobe
                  activityData={liveActivity}
                  loading={false}
                  error={globeError}
                  onRetry={() => loadData(false)}
                  realTimeVisitors={realTimeVisitors}
                  selectedLocation={selectedLocation}
                  onSelectLocation={setSelectedLocation}
                  isDark={isDark}
                />
              </ErrorBoundary>

              {/* Ready to stream snippet floating overlay when 0 visitors */}
              {realTimeVisitors === 0 && (
                showSnippetOverlay ? (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4 z-20">
                    <div className="pointer-events-auto w-full max-w-xs border border-dashed border-[var(--wp-border-strong)] rounded-lg p-3.5 text-center space-y-2.5 bg-[var(--wp-bg-surface)]/90 backdrop-blur-md shadow-2xl relative">
                      <button
                        type="button"
                        onClick={() => setShowSnippetOverlay(false)}
                        className="absolute top-2 right-2 p-1 rounded text-[var(--wp-text-muted)] hover:text-[var(--wp-text-primary)] hover:bg-[var(--wp-bg-hover)] transition-colors"
                        title="Minimize snippet"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-[var(--wp-text-secondary)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Ready to stream</span>
                      </div>
                      <p className="text-[11px] text-[var(--wp-text-muted)] leading-relaxed">
                        Embed telemetry snippet to stream real-time visitor geography on the globe.
                      </p>
                      <div className="text-left bg-[var(--wp-bg-subtle)] border border-[var(--wp-border-subtle)] rounded p-2 relative group">
                        <div className="text-[9.5px] font-mono text-[var(--wp-text-muted)] uppercase mb-0.5">Snippet</div>
                        <pre className="text-[10px] font-mono text-[var(--wp-text-secondary)] overflow-x-auto whitespace-pre p-0 m-0">
                          {`<script defer src="https://cdn.webpulseanalytics.tech/tracker.js" data-site="auto"></script>`}
                        </pre>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText('<script defer src="https://cdn.webpulseanalytics.tech/tracker.js" data-site="auto"></script>');
                            setCopiedSnippet(true);
                            setTimeout(() => setCopiedSnippet(false), 2000);
                          }}
                          className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-[var(--wp-bg-surface)] border border-[var(--wp-border-default)] text-[var(--wp-text-secondary)] hover:text-[var(--wp-text-primary)] transition-colors text-[9.5px] font-mono"
                          title="Copy snippet"
                        >
                          {copiedSnippet ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <div className="pt-0.5 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => loadData(true)}
                          className="wp-btn wp-btn-secondary text-[11px] h-6 w-full justify-center"
                        >
                          Verify telemetry
                        </button>
                        <button
                          type="button"
                          onClick={openIntegrationGuide}
                          className="wp-btn wp-btn-secondary text-[11px] h-6 w-full justify-center"
                        >
                          Guide
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="absolute bottom-3 right-3 z-20 pointer-events-auto">
                    <button
                      type="button"
                      onClick={() => setShowSnippetOverlay(true)}
                      className="wp-btn wp-btn-secondary h-6 px-2 text-[10px] font-mono inline-flex items-center gap-1 bg-[var(--wp-bg-surface)]/90 backdrop-blur-sm"
                    >
                      <span>Embed snippet</span>
                    </button>
                  </div>
                )
              )}
            </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Secondary Studio Workspace: Live Activity Feed (7 cols) + Ingress Sources (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left 7 Cols: Recent Live Activity Feed */}
        <div className="lg:col-span-7 wp-panel flex flex-col bg-[var(--wp-bg-surface)]">
          <div className="wp-panel-header">
            <div className="flex items-center gap-2">
              <span className="wp-title-card">Recent activity</span>
              <span className="text-[10.5px] font-mono text-[var(--wp-text-muted)] px-1.5 py-0.5 rounded bg-[var(--wp-bg-subtle)] border border-[var(--wp-border-subtle)] flex items-center gap-1">
                <span className="wp-live-dot" />
                Live stream
              </span>
            </div>
            <Link
              to="/dashboard/activity"
              className="text-[11px] font-mono text-[var(--wp-text-secondary)] hover:text-[var(--wp-text-primary)] transition-colors flex items-center gap-1"
            >
              <span>View full log</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="p-3 divide-y divide-[var(--wp-border-subtle)] min-h-[200px] flex flex-col justify-center">
            {liveActivity && liveActivity.length > 0 ? (
              <div className="space-y-0.5">
                {liveActivity.slice(0, 5).map((act, idx) => (
                  <div
                    key={act.id || idx}
                    className="py-2 px-2.5 rounded-md hover:bg-[var(--wp-bg-hover)] transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="wp-live-dot shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-[var(--wp-text-primary)] truncate">
                            {act.location && act.location !== 'Unknown Location' ? act.location : (act.site || 'Direct Visitor')}
                          </span>
                          <span className="text-[10.5px] font-mono text-[var(--wp-text-muted)] bg-[var(--wp-bg-subtle)] px-1.5 py-0.2 rounded border border-[var(--wp-border-subtle)] truncate max-w-[200px]">
                            {act.path || '/'}
                          </span>
                        </div>
                        <div className="text-[10.5px] font-mono text-[var(--wp-text-muted)] flex items-center gap-2 mt-0.5">
                          <span>{act.device || 'Desktop'}</span>
                          <span>•</span>
                          <span>{act.browser || 'Browser'}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10.5px] font-mono text-[var(--wp-text-muted)] whitespace-nowrap shrink-0">
                      {formatRelativeTime(act.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 space-y-1.5">
                <p className="text-xs font-mono text-[var(--wp-text-secondary)]">No incoming activity yet</p>
                <p className="text-[11px] text-[var(--wp-text-muted)]">
                  Live pageviews and custom telemetry events will populate here as visitors browse your domains.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Cols: Top Ingress Sources */}
        <div className="lg:col-span-5 wp-panel flex flex-col bg-[var(--wp-bg-surface)]">
          <div className="wp-panel-header">
            <div className="flex items-center gap-2">
              <span className="wp-title-card">Top ingress sources</span>
            </div>
            <span className="text-[10.5px] font-mono text-[var(--wp-text-muted)]">
              {dashboardStats?.sourceData?.length || 0} sources
            </span>
          </div>

          <div className="p-3 min-h-[200px] flex flex-col justify-center">
            {dashboardStats?.sourceData && dashboardStats.sourceData.length > 0 ? (
              <div className="space-y-2.5">
                {(() => {
                  const sources = dashboardStats.sourceData.slice(0, 5);
                  const maxVal = Math.max(...sources.map(s => Number(s.value) || 0), 1);
                  return sources.map((s, idx) => {
                    const val = Number(s.value) || 0;
                    const pct = Math.round((val / maxVal) * 100);
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-[var(--wp-text-primary)] truncate max-w-[180px]">
                            {s.name || 'Direct'}
                          </span>
                          <span className="font-mono text-[11px] text-[var(--wp-text-secondary)] tabular-nums">
                            {val.toLocaleString()} hits
                          </span>
                        </div>
                        <div className="wp-meter-track">
                          <div
                            className="wp-meter-bar"
                            style={{ width: `${Math.max(pct, 3)}%` }}
                          />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            ) : (
              <div className="text-center py-8 space-y-1.5">
                <p className="text-xs font-mono text-[var(--wp-text-secondary)]">No referral sources detected</p>
                <p className="text-[11px] text-[var(--wp-text-muted)]">
                  Traffic channels (Direct, Organic, Social, Referrals) will display here once recorded.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>



      {/* Create Project / Register Domain Modal */}
      <Modal
        isOpen={showModal}
        onClose={cleanUp}
        title={registerDomain ? 'Register Domain' : 'Create New Project'}
      >
        <form
          onSubmit={registerDomain ? handleRegisterDomain : handleCreateProject}
          className="space-y-4 font-sans"
        >
          <div>
            <label className="wp-label-section uppercase block mb-1">Project Name</label>
            <input
              type="text"
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="wp-input w-full text-xs h-8 px-2.5 rounded border border-[var(--wp-border-default)] bg-[var(--wp-bg-canvas)] text-[var(--wp-text-primary)] focus:outline-none focus:border-[var(--wp-text-primary)]"
              placeholder={registerDomain ? "e.g. my-website" : "e.g. My SaaS Platform"}
            />
          </div>
          {registerDomain && (
            <div>
              <label className="wp-label-section uppercase block mb-1">Domain / Allowed Origin</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="wp-input w-full text-xs h-8 px-2.5 rounded border border-[var(--wp-border-default)] bg-[var(--wp-bg-canvas)] text-[var(--wp-text-primary)] font-mono focus:outline-none focus:border-[var(--wp-text-primary)]"
                placeholder="https://example.com"
              />
              <p className="text-[10.5px] text-[var(--wp-text-muted)] mt-1 font-mono">
                Comma-separated list of domains allowed to track this project.
              </p>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={cleanUp}
              className="wp-btn wp-btn-secondary h-7 px-3 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="wp-btn wp-btn-primary h-7 px-3 text-xs gap-1.5"
            >
              {creating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {creating
                ? (registerDomain ? 'Registering...' : 'Processing...')
                : (registerDomain ? 'Register Domain' : 'Deploy Project')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Loading overlay for creation */}
      {creating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Loader2 className="h-7 w-7 text-[var(--wp-text-primary)] animate-spin" />
        </div>
      )}
    </div>
  );
}


