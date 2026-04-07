import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Plus, Globe, ExternalLink, Code, Activity, ArrowUpRight, TrendingUp, LayoutDashboard } from 'lucide-react';
import { apiRequest } from '../utils/api';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { useToast } from '../context/ToastContext';
import GlobalGlobe from '../components/dashboard/GlobalGlobe';
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
    { name: 'Used', value: totalViewsUsed, color: '#3B82F6' },
    { name: 'Remaining', value: Math.max(0, viewLimit - totalViewsUsed), color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div className="flex items-center gap-5">
          <div className="p-4 rounded-3xl bg-blue-600 shadow-2xl shadow-blue-600/20 group-hover:rotate-12 transition-transform duration-500">
            <LayoutDashboard className="h-8 w-8 text-white" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">Global Insights</h2>
            <p className="text-lg font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic opacity-80">Real-time visitor activity from across all tracked domains.</p>
          </div>
        </div>
      </div>

      {/* Hero Section: 3D Global View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white dark:bg-slate-900/40 backdrop-blur-2xl border border-slate-200 dark:border-slate-800/50 rounded-[2.5rem] overflow-hidden min-h-[550px] relative shadow-sm dark:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>
          <div className="relative h-full flex items-center justify-center">
            <GlobalGlobe activityData={liveActivity} />
          </div>
        </div>

        {/* Real-time stats sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-[2rem] p-8 flex flex-col justify-between h-[260px] shadow-sm dark:shadow-xl relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
             <div className="flex justify-between items-start relative z-10">
               <div>
                 <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Live Visitors</h3>
                 <div className="flex items-center gap-2 mt-4">
                   <span className="flex items-center gap-2 text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20 uppercase tracking-widest">
                     <span className="relative flex h-2 w-2">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                     </span>
                     Active Now
                   </span>
                 </div>
               </div>
               <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl">
                  <Activity className="h-5 w-5 text-blue-500" />
               </div>
             </div>
             <div className="mt-4 relative z-10">
               <span className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter drop-shadow-sm">{realTimeVisitors.toLocaleString()}</span>
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-[2rem] p-8 h-[260px] flex flex-col shadow-sm dark:shadow-xl relative overflow-hidden">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6 relative z-10">Traffic Momentum</h3>
            <div className="flex-1 w-full min-h-0 relative z-10">
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
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-[2rem] p-8 h-full min-h-[450px] flex flex-col shadow-sm dark:shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase tracking-widest flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-blue-500" />
                Traffic Trends
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Cross-domain historical analytics</p>
            </div>
            <div className="flex bg-slate-50 dark:bg-slate-950 rounded-2xl p-1.5 border border-slate-200 dark:border-slate-800 shadow-inner">
              {['24h', '7d', '30d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-6 py-2 text-xs font-black rounded-xl transition-all uppercase tracking-widest ${timeRange === range
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xl'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 w-full min-h-0 bg-slate-50/50 dark:bg-slate-950/30 rounded-[1.5rem] p-6 shadow-inner">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'} vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke={isDark ? '#475569' : '#94a3b8'}
                  fontSize={10}
                  fontWeight={900}
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
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    padding: '12px'
                  }}
                  itemStyle={{ color: '#3B82F6' }}
                  cursor={{ stroke: '#3B82F6', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#3B82F6"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorViews)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Referrals, Activity, Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3. Top Referral Sources */}
        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-[2rem] p-8 h-full flex flex-col shadow-sm dark:shadow-xl">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-8">Top Referral Sources</h3>
          <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {sourceData.map((source) => (
              <div key={source.name} className="group">
                <div className="flex justify-between text-xs mb-2 items-baseline">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: source.color }}></span>
                    <span className="text-slate-900 dark:text-white font-black uppercase tracking-tight truncate group-hover:text-blue-500 transition-colors">{source.name}</span>
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 font-black tabular-nums">{source.value.toLocaleString()} <span className="text-[10px] opacity-60">INGRESS</span></span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(source.value / (sourceData[0]?.value || 1)) * 100}%`, backgroundColor: source.color }}
                  ></div>
                </div>
              </div>
            ))}
            {sourceData.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-slate-500 opacity-30">
                <Globe className="h-10 w-10 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">No referral data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* 4. Live Activity */}
        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-[2rem] p-8 h-full flex flex-col shadow-sm dark:shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Live Activity</h3>
            <span className="text-[10px] font-black bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full uppercase border border-blue-500/20 tracking-widest">Live Feed</span>
          </div>
          <div className="space-y-6 relative flex-1 overflow-hidden">
            {/* Vertical line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-800/50"></div>

            {liveActivity.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex gap-5 relative group">
                <div className={`w-3.5 h-3.5 rounded-full mt-1 border-2 border-white dark:border-slate-900 z-10 flex-shrink-0 transition-transform group-hover:scale-125 duration-300 ${activity.type === 'session' ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' :
                  activity.type === 'view' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                  }`}></div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-900 dark:text-white truncate font-bold">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">New {activity.type} •</span> {activity.location || 'Unknown Location'}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono uppercase tracking-tight">
                    {new Date(activity.timestamp).toLocaleTimeString()} • <span className="text-blue-500 dark:text-blue-400 font-black">{activity.path}</span>
                  </p>
                </div>
              </div>
            ))}
            {liveActivity.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-slate-500 opacity-30">
                <Activity className="h-10 w-10 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">Waiting for activity...</p>
              </div>
            )}
          </div>
        </div>

        {/* 5. Monthly Usage */}
        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center h-full shadow-sm dark:shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-500/[0.02] dark:bg-blue-500/[0.02]"></div>
          <div className="relative w-48 h-48 mb-8 z-10">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={95}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                  paddingAngle={0}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{Math.round(viewPercentage)}%</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-500 uppercase font-black tracking-[0.2em] mt-1">CAPACITY</span>
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="text-slate-900 dark:text-white font-black text-xl mb-1 tracking-tight uppercase">Monthly Usage</h3>
            <p className="text-xs font-black text-slate-500 dark:text-slate-400 mb-6 uppercase tracking-widest">{totalViewsUsed.toLocaleString()} <span className="opacity-40">/</span> {viewLimit.toLocaleString()} events</p>
            <Link to="/dashboard/billing" className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-black rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm uppercase tracking-widest active:scale-95">
              Upgrade Capacity <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 6. Quick Actions */}
      <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 rounded-[2.5rem] p-10 flex flex-col md:flex-row justify-between items-center gap-10 shadow-sm dark:shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/[0.03] to-transparent pointer-events-none"></div>
        <div className="relative z-10 text-center md:text-left">
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Expand Your Reach</h3>
          <p className="text-base text-slate-500 dark:text-slate-400 font-medium">Deploy the global tracker script or integrate new domains in seconds.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full md:w-auto">
          <button className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_40px_-10px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3">
            <Code className="h-4 w-4" /> Integration Guide
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-[0_20px_40px_-10px_rgba(59,130,246,0.3)] flex items-center justify-center gap-3"
          >
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
        <form onSubmit={handleCreateProject} className="p-2">
          <div className="mb-8">
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">
              Project Name
            </label>
            <input
              type="text"
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[1.25rem] px-6 py-4 text-slate-900 dark:text-white text-lg font-black tracking-tight focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 shadow-inner"
              placeholder="e.g. My SaaS Platform"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setProjectName('');
              }}
              className="px-6 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-black text-xs uppercase tracking-widest transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
            >
              {creating && <Spinner fullScreen={false} className="h-4 w-4" />}
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
