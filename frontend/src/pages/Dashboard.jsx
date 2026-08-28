import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Plus, Globe, Code, Activity, ArrowUpRight, TrendingUp, X, MapPin } from 'lucide-react';
import { apiRequest } from '../utils/api';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { useToast } from '../context/ToastContext';
import NetworkGlobe from '../components/dashboard/NetworkGlobe';
import { useTheme } from '../context/ThemeContext';
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export default function Dashboard() {
  const { user, loadUser, usageStats, socket } = useOutletContext();
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { showToast } = useToast();
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
      if (showLoading) setLoading(false);
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

  if (loading) return <Spinner />;

  const totalViewsUsed = stats?.reduce((acc, curr) => acc + curr.views, 0) || 0;
  const viewLimit = usageStats?.monthlyLimit || 1000;
  const viewPercentage = Math.min((totalViewsUsed / viewLimit) * 100, 100);

  const { realTimeVisitors, trafficData, sourceData, liveActivity, sparkline } = dashboardStats;

  const pieData = [
    { name: 'Used', value: totalViewsUsed, color: '#8b5cf6' },
    { name: 'Remaining', value: Math.max(0, viewLimit - totalViewsUsed), color: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)' },
  ];

  const muted = 'text-slate-500 dark:text-slate-400';
  const strong = 'text-slate-900 dark:text-white';

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-title">
          <div className="page-header-icon">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h1 className="page-title">Global Insights</h1>
            <p className="page-sub">Real-time visitor activity from across all tracked domains.</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary btn-md"
        >
          <Plus className="h-4 w-4" /> New Project
        </button>
      </div>

      {/* Hero Section: Data Network Globe */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="card overflow-hidden h-[400px] lg:h-[520px] relative flex">
            <div className="absolute inset-0 bg-violet-500/[0.03] pointer-events-none" />
            <div className="relative flex-1">
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
            </div>
          </div>

          {/* Selected location detail */}
          {selectedLocation && (
            <div className="card card-pad animate-fade-in">
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge-green">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      Active
                    </span>
                    <button
                      onClick={() => setSelectedLocation(null)}
                      className="ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      aria-label="Close location detail"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                    {selectedLocation.location || 'Unknown Location'}
                  </h3>
                  <p className="eyebrow mt-1">Location detail</p>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-4xl font-bold text-violet-600 dark:text-violet-400 tabular-nums tracking-tight">
                    {selectedLocation.count.toLocaleString()}
                  </span>
                  <p className="eyebrow mt-1">Active Visitors</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <InfoItem
                  icon={<MapPin className="h-4 w-4" />}
                  label="Device"
                  value={<span className="capitalize">{selectedLocation.device || 'Unknown'}</span>}
                />
                <InfoItem
                  icon={<TrendingUp className="h-4 w-4" />}
                  label="Current page"
                  value={<span className="font-mono truncate">{selectedLocation.path || '/'}</span>}
                />
                <InfoItem
                  icon={<Activity className="h-4 w-4" />}
                  label="Coordinates"
                  value={<span className="font-mono">{selectedLocation.lat?.toFixed(2)}, {selectedLocation.lng?.toFixed(2)}</span>}
                />
              </div>
            </div>
          )}
        </div>

        {/* Real-time stats sidebar */}
        <div className="space-y-6">
          <div className="card card-pad flex flex-col justify-between h-[240px] relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="eyebrow">Live Visitors</h3>
                <div className="flex items-center gap-2 mt-3">
                  <span className="badge-green">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Active Now
                  </span>
                </div>
              </div>
              <div className="p-3 bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400 rounded-xl">
                <Activity className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-[2rem] font-bold text-slate-900 dark:text-white tracking-tight tabular-nums">{realTimeVisitors.toLocaleString()}</span>
            </div>
          </div>

          <div className="card card-pad h-[240px] flex flex-col">
            <h3 className="eyebrow mb-6">Traffic Momentum</h3>
            <div className="flex-1 w-full min-h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sparkline || []}>
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {(sparkline || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === (sparkline?.length - 1) ? '#10B981' : isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'} />
                    ))}
                  </Bar>
                  <Tooltip
                    cursor={{ fill: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)' }}
                    contentStyle={{ display: 'none' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Traffic Trends - Full Width */}
      <div className="card card-pad h-full min-h-[420px] flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="section-title flex items-center gap-2.5">
              <TrendingUp className="h-5 w-5 text-violet-500" />
              Traffic Trends
            </h3>
            <p className="page-sub">Cross-domain historical analytics</p>
          </div>
          <div className="segmented">
            {['24h', '7d', '30d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`segmented-btn ${timeRange === range
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 w-full min-h-[280px] bg-slate-50 dark:bg-slate-950/40 rounded-xl p-4 sm:p-6 border border-slate-100 dark:border-slate-800">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart data={trafficData}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'} vertical={false} />
              <XAxis
                dataKey="name"
                stroke={isDark ? '#475569' : '#94a3b8'}
                fontSize={10}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
                tickFormatter={(value) => value.toUpperCase()}
                dy={15}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  color: isDark ? '#f8fafc' : '#1e293b',
                  borderRadius: '12px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  padding: '10px 14px'
                }}
                itemStyle={{ color: '#8b5cf6' }}
                cursor={{ stroke: '#8b5cf6', strokeWidth: 2, strokeDasharray: '5 5' }}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke="#8b5cf6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorViews)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row: Referrals, Activity, Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3. Top Referral Sources */}
        <div className="card card-pad h-full flex flex-col">
          <h3 className="eyebrow mb-6">Top Referral Sources</h3>
          <div className="space-y-5 flex-1 overflow-y-auto pr-2">
            {sourceData.map((source) => (
              <div key={source.name} className="group">
                <div className="flex justify-between text-sm mb-2 items-baseline">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: source.color }}></span>
                    <span className={`text-sm font-medium truncate ${strong} group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors`}>{source.name}</span>
                  </div>
                  <span className={`text-sm font-semibold tabular-nums ${muted}`}>{source.value.toLocaleString()}</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(source.value / (sourceData[0]?.value || 1)) * 100}%`, backgroundColor: source.color }}
                  ></div>
                </div>
              </div>
            ))}
            {sourceData.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400 dark:text-slate-600">
                <Globe className="h-10 w-10 mb-3" />
                <p className="text-xs font-medium">No referral data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* 4. Live Activity */}
        <div className="card card-pad h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="eyebrow">Live Activity</h3>
            <span className="badge-green">Live Feed</span>
          </div>
          <div className="space-y-5 relative flex-1 overflow-hidden">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-800"></div>

            {liveActivity.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex gap-5 relative group">
                <div className={`w-3 h-3 rounded-full mt-1.5 border-2 border-white dark:border-slate-900 z-10 flex-shrink-0 transition-transform group-hover:scale-125 duration-300 ${activity.type === 'session' ? 'bg-violet-500' :
                  activity.type === 'view' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}></div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm truncate font-medium ${strong}`}>
                    <span className={`font-normal ${muted}`}>New {activity.type} •</span> {activity.location || 'Unknown Location'}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
                    {new Date(activity.timestamp).toLocaleTimeString()} • <span className="text-violet-600 dark:text-violet-400 font-medium">{activity.path}</span>
                  </p>
                </div>
              </div>
            ))}
            {liveActivity.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400 dark:text-slate-600">
                <Activity className="h-10 w-10 mb-3" />
                <p className="text-xs font-medium">Waiting for activity...</p>
              </div>
            )}
          </div>
        </div>

        {/* 5. Monthly Usage */}
        <div className="card card-pad flex flex-col items-center justify-center text-center h-full relative overflow-hidden">
          <div className="relative w-44 h-44 mb-6">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{Math.round(viewPercentage)}%</span>
              <span className="eyebrow mt-1">Capacity</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Monthly Usage</h3>
            <p className={`text-sm mb-5 ${muted}`}>{totalViewsUsed.toLocaleString()} / {viewLimit.toLocaleString()} events</p>
            <Link to="/dashboard/billing" className="btn-secondary btn-sm">
              Upgrade capacity <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 6. Quick Actions */}
      <div className="card card-pad flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-violet-500/[0.02] pointer-events-none" />
        <div className="relative z-10 text-center md:text-left">
          <h3 className="section-title mb-1.5">Expand Your Reach</h3>
          <p className={`${muted} text-sm`}>Deploy the global tracker script or integrate new domains in seconds.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 relative z-10 w-full md:w-auto">
          <Link to="/dashboard/api-key" className="btn-secondary">
            <Code className="h-4 w-4" /> Integration Guide
          </Link>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> Register Domain
          </button>
        </div>
      </div>

      {/* Create Project Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setProjectName('');
        }}
        title="Create New Project"
      >
        <form onSubmit={handleCreateProject} className="space-y-5">
          <div>
            <label className="label">Project Name</label>
            <input
              type="text"
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="input"
              placeholder="e.g. My SaaS Platform"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setProjectName('');
              }}
              className="btn-ghost btn-md"
            >
              Cancel
            </button>
            <button type="submit" disabled={creating} className="btn-primary btn-md">
              {creating ? 'Processing...' : 'Deploy Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Global Spinner for creation */}
      {creating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
          <Spinner fullScreen={false} />
        </div>
      )}
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  const muted = 'text-slate-500 dark:text-slate-400';
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800">
      <div className="p-2 rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400 flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className={`text-[10px] uppercase tracking-[0.18em] font-bold mb-1 ${muted}`}>{label}</p>
        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{value}</p>
      </div>
    </div>
  );
}
