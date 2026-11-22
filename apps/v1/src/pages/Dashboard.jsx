import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Plus, ArrowUpRight, Loader2, Copy } from 'lucide-react';
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
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

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
  const [globeError, setGlobeError] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  useEffect(() => {
    loadData();

    const interval = setInterval(() => loadData(false), 10000); // Poll every 10s as fallback

    if (socket) {
      const handleVisitorUpdate = () => loadData(false);
      const handleUsageUpdate = () => loadUser(); // Refresh usage stats via loadUser

      socket.on('visitor_update', handleVisitorUpdate);
      socket.on('usage_update', handleUsageUpdate);

      return () => {
        clearInterval(interval);
        socket.off('visitor_update', handleVisitorUpdate);
        socket.off('usage_update', handleUsageUpdate);
      };
    }

    return () => clearInterval(interval);
  }, [user?.id, timeRange, socket]);

  const loadData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [projectsData, statsData] = await Promise.all([
        apiRequest('/projects'),
        apiRequest(`/analytics/overview?range=${timeRange}`).catch(() => null)
      ]);

      setGlobeError(!statsData);
      setProjects(projectsData);

      if (statsData) {
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
      if (showLoading) {
        setLoading(false);
        setIsPageLoading?.(false);
      }
    }
  };

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
    if (!limit || limit === 0) return '0%';
    const pct = (used / limit) * 100;
    if (pct > 0 && pct < 0.1) return '<0.1%';
    return `${Math.round(pct)}%`;
  };

  const formatCompactLimit = (limit) => {
    if (!limit) return '0';
    if (limit >= 1000000) return `${(limit / 1000000).toFixed(0)}M`;
    if (limit >= 1000) return `${(limit / 1000).toFixed(0)}k`;
    return limit.toLocaleString();
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

  const totalViewsUsed = stats?.reduce((acc, curr) => acc + curr.views, 0) || 0;
  const viewLimit = usageStats?.monthlyLimit || 1000;
  const viewPercentage = Math.min((totalViewsUsed / viewLimit) * 100, 100);

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

  const { realTimeVisitors, trafficData, liveActivity } = dashboardStats;
  const totalSessionsCount = stats?.reduce((acc, curr) => acc + (curr.sessions || 0), 0) || totalViewsUsed || 0;

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
              <AnimatedNumber value={realTimeVisitors} />
            </span>
          </div>
          <div className="text-[11px] font-mono text-[var(--wp-text-muted)] mt-1 truncate">
            {realTimeVisitors > 0 ? 'Concurrent active streams' : 'No active streams'}
          </div>
        </div>

        {/* Col 2: Events Tracked */}
        <div className="p-3 sm:p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px]">
            <span className="wp-label-section uppercase">Events tracked</span>
            <span className="text-[10.5px] font-mono text-[var(--wp-text-muted)]">30d</span>
          </div>
          <div className="mt-1">
            <span className="wp-kpi-value text-2xl font-bold tracking-tight text-[var(--wp-text-primary)] tabular-nums">
              {totalViewsUsed.toLocaleString()}
            </span>
          </div>
          <div className="text-[11px] font-mono text-[var(--wp-text-muted)] mt-1 truncate">
            30-day recorded hits
          </div>
        </div>

        {/* Col 3: Unique Sessions */}
        <div className="p-3 sm:p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px]">
            <span className="wp-label-section uppercase">Unique sessions</span>
            <span className="text-[10.5px] font-mono text-[var(--wp-text-muted)]">Total</span>
          </div>
          <div className="mt-1">
            <span className="wp-kpi-value text-2xl font-bold tracking-tight text-[var(--wp-text-primary)] tabular-nums">
              {totalSessionsCount.toLocaleString()}
            </span>
          </div>
          <div className="text-[11px] font-mono text-[var(--wp-text-muted)] mt-1 truncate">
            Across connected domains
          </div>
        </div>

        {/* Col 4: Capacity */}
        <div className="p-3 sm:p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px]">
            <span className="wp-label-section uppercase">Capacity</span>
            <span className="wp-metric-mono font-medium text-[var(--wp-text-primary)]">
              {formatUsagePercent(totalViewsUsed, viewLimit)}
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="wp-kpi-value text-xl font-bold tracking-tight text-[var(--wp-text-primary)] tabular-nums">
              {totalViewsUsed.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-[var(--wp-text-muted)]">
              / {formatCompactLimit(viewLimit)}
            </span>
          </div>
          <div className="mt-1.5 space-y-1">
            <div className="wp-meter-track">
              <div
                className="wp-meter-bar"
                style={{ width: `${Math.max(viewPercentage, totalViewsUsed > 0 ? 2 : 0)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Studio Split Workspace (7 / 5 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[460px]">
        {/* Col 7: Traffic Momentum */}
        <div className="lg:col-span-7 wp-panel flex flex-col bg-[var(--wp-bg-surface)]">
          <div className="wp-panel-header">
            <div className="flex items-center gap-2">
              <span className="wp-title-card">Traffic momentum</span>
              <span className="text-[10.5px] font-mono text-[var(--wp-text-muted)] px-1.5 py-0.5 rounded bg-[var(--wp-bg-subtle)] border border-[var(--wp-border-subtle)] uppercase">
                {timeRange}
              </span>
            </div>
            <div className="text-[11px] font-mono text-[var(--wp-text-muted)]">
              {trafficData?.length || 0} data points
            </div>
          </div>

          <div className="wp-studio-canvas flex-1 min-h-[380px] p-2.5 sm:p-3 flex flex-col justify-between">
            {trafficData && trafficData.length > 0 ? (
              <div className="w-full h-full min-h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficData} margin={{ top: 12, right: 12, left: -20, bottom: 4 }}>
                    <defs>
                      <linearGradient id="studioTrafficGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--wp-chart-1)" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="var(--wp-chart-1)" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--wp-chart-grid)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: 'var(--wp-text-muted)', fontSize: 10, fontFamily: 'monospace' }}
                      axisLine={{ stroke: 'var(--wp-border-subtle)' }}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--wp-bg-surface)',
                        borderColor: 'var(--wp-border-default)',
                        borderRadius: '6px',
                        color: 'var(--wp-text-primary)',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        boxShadow: 'none',
                      }}
                      itemStyle={{ color: 'var(--wp-text-primary)' }}
                      labelStyle={{ color: 'var(--wp-text-muted)', marginBottom: '4px' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="views"
                      name="Events"
                      stroke="var(--wp-chart-1)"
                      strokeWidth={1.75}
                      fillOpacity={1}
                      fill="url(#studioTrafficGrad)"
                    />
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

          <div className="wp-studio-canvas flex-1 min-h-[380px] relative flex flex-col items-center justify-center p-3">
            {realTimeVisitors > 0 ? (
              <div className="w-full h-full relative">
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
              </div>
            ) : (
              <div className="w-full max-w-sm border border-dashed border-[var(--wp-border-strong)] rounded-lg p-4 sm:p-5 text-center space-y-3 bg-[var(--wp-bg-surface)]/90 backdrop-blur-sm">
                <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-[var(--wp-text-secondary)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--wp-border-strong)] animate-pulse" />
                  <span>Ready to stream</span>
                </div>
                <p className="text-[11.5px] text-[var(--wp-text-muted)] leading-relaxed">
                  Embed the telemetry snippet on your website to capture real-time visitor geography and events.
                </p>
                <div className="text-left bg-[var(--wp-bg-subtle)] border border-[var(--wp-border-subtle)] rounded p-2 relative group">
                  <div className="text-[10px] font-mono text-[var(--wp-text-muted)] uppercase mb-1">Snippet</div>
                  <pre className="text-[10.5px] font-mono text-[var(--wp-text-secondary)] overflow-x-auto whitespace-pre p-0 m-0">
                    {`<script defer src="https://cdn.webpulseanalytics.tech/tracker.js" data-site="auto"></script>`}
                  </pre>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('<script defer src="https://cdn.webpulseanalytics.tech/tracker.js" data-site="auto"></script>');
                      setCopiedSnippet(true);
                      setTimeout(() => setCopiedSnippet(false), 2000);
                    }}
                    className="absolute top-2 right-2 p-1 rounded bg-[var(--wp-bg-surface)] border border-[var(--wp-border-default)] text-[var(--wp-text-secondary)] hover:text-[var(--wp-text-primary)] transition-colors text-[10px]"
                    title="Copy snippet"
                  >
                    {copiedSnippet ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => loadData(true)}
                    className="wp-btn wp-btn-secondary text-xs w-full justify-center"
                  >
                    Verify telemetry
                  </button>
                  <button
                    type="button"
                    onClick={openIntegrationGuide}
                    className="wp-btn wp-btn-secondary text-xs w-full justify-center"
                  >
                    Integration guide
                  </button>
                </div>
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
        align={registerDomain ? 'bottom' : 'top'}
      >
        <form
          onSubmit={registerDomain ? handleRegisterDomain : handleCreateProject}
          className="space-y-5"
        >
          <div>
            <label className="label">Project Name</label>
            <input
              type="text"
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="input"
              placeholder={registerDomain ? "e.g. my-website" : "e.g. My SaaS Platform"}
            />
          </div>
          {registerDomain && (
            <div>
              <label className="label">Domain / Allowed Origin</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="input font-mono"
                placeholder="https://example.com"
              />
              <p className="field-hint">
                Comma-separated list of domains allowed to track this project.
              </p>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={cleanUp} className="btn-ghost btn-md">
              Cancel
            </button>
            <button type="submit" disabled={creating} className="btn-primary btn-md">
              {creating && <Loader2 className="h-4 w-4 animate-spin" />}
              {creating
                ? (registerDomain ? 'Registering...' : 'Processing...')
                : (registerDomain ? 'Register Domain' : 'Deploy Project')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Loading overlay for creation */}
      {creating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
          <Loader2 className="h-8 w-8 text-slate-500 animate-spin" />
        </div>
      )}
    </div>
  );
}


