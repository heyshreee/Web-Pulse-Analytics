import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Plus, Globe, ExternalLink, Code, Activity, ArrowUpRight } from 'lucide-react';
import { apiRequest } from '../utils/api';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { useToast } from '../context/ToastContext';
import GlobalGlobe from '../components/dashboard/GlobalGlobe';
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
    { name: 'Remaining', value: viewLimit - totalViewsUsed, color: '#1E293B' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Global Insights</h1>
          <p className="text-slate-400 mt-1">Real-time visitor activity from across all your tracked domains.</p>
        </div>
      </div>

      {/* Hero Section: 3D Global View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-[#0B0F1A]/80 backdrop-blur-2xl border border-slate-800/50 rounded-3xl overflow-hidden min-h-[500px] relative">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>
          <div className="relative h-full flex items-center justify-center">
            <GlobalGlobe activityData={liveActivity} />
          </div>
        </div>

        {/* Real-time stats sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 flex flex-col justify-between h-[240px]">
             <div className="flex justify-between items-start">
               <div>
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Live Visitors</h3>
                 <div className="flex items-center gap-2 mt-2">
                   <span className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20 uppercase tracking-widest">
                     <span className="relative flex h-2 w-2">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                     </span>
                     Active Now
                   </span>
                 </div>
               </div>
               <Activity className="h-5 w-5 text-blue-500" />
             </div>
             <div className="mt-4">
               <span className="text-7xl font-bold text-white tracking-tighter">{realTimeVisitors.toLocaleString()}</span>
             </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 h-[240px] flex flex-col">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Traffic Momentum</h3>
            <div className="flex-1 w-full min-h-0">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={sparkline || []}>
                   <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                     {(sparkline || []).map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={index === (sparkline?.length - 1) ? '#10B981' : '#1E293B'} />
                     ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Traffic Trends - Full Width */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 h-full min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Traffic Trends</h3>
              <p className="text-sm text-slate-400">Tracking views across all domains</p>
            </div>
            <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
              {['24h', '7d', '30d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${timeRange === range
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white'
                    }`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#64748B"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={30}
                  tickFormatter={(value) => value.toUpperCase()}
                  dy={10}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', color: '#F8FAFC', borderRadius: '8px' }}
                  itemStyle={{ color: '#F8FAFC' }}
                  cursor={{ stroke: '#3B82F6', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#3B82F6"
                  strokeWidth={3}
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
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 h-full flex flex-col">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Top Referral Sources</h3>
          <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {sourceData.map((source) => (
              <div key={source.name}>
                <div className="flex justify-between text-sm mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: source.color }}></span>
                    <span className="text-white font-medium truncate">{source.name}</span>
                  </div>
                  <span className="text-slate-400 font-mono">{source.value.toLocaleString()}</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(source.value / (sourceData[0]?.value || 1)) * 100}%`, backgroundColor: source.color }}
                  ></div>
                </div>
              </div>
            ))}
            {sourceData.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-slate-500">
                <p>No referral data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* 4. Live Activity */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Activity</h3>
            <span className="text-[10px] font-bold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded uppercase border border-blue-500/20">Streaming</span>
          </div>
          <div className="space-y-6 relative flex-1 overflow-hidden">
            {/* Vertical line */}
            <div className="absolute left-[5.5px] top-2 bottom-2 w-px bg-slate-800"></div>

            {liveActivity.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex gap-4 relative group">
                <div className={`w-3 h-3 rounded-full mt-1.5 border-2 border-slate-900 z-10 flex-shrink-0 transition-colors ${activity.type === 'session' ? 'bg-blue-500 group-hover:bg-blue-400' :
                  activity.type === 'view' ? 'bg-slate-500 group-hover:bg-slate-400' : 'bg-purple-500 group-hover:bg-purple-400'
                  }`}></div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white truncate">
                    <span className="text-slate-400">New {activity.type} from</span> <span className="font-medium text-white">{activity.location || 'Unknown Location'}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {new Date(activity.timestamp).toLocaleTimeString()} • <span className="text-blue-400">{activity.path}</span>
                  </p>
                </div>
              </div>
            ))}
            {liveActivity.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-slate-500">
                <p>Waiting for activity...</p>
              </div>
            )}
          </div>
        </div>

        {/* 5. Monthly Usage */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center h-full">
          <div className="relative w-48 h-48 mb-6">
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
                  cornerRadius={4}
                  paddingAngle={2}
                >
                  <Cell key="used" fill="#3B82F6" />
                  <Cell key="remaining" fill="#1E293B" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-white">{Math.round(viewPercentage)}%</span>
              <span className="text-xs text-slate-500 uppercase font-bold tracking-wider mt-1">Limit</span>
            </div>
          </div>
          <h3 className="text-white font-bold text-lg mb-1">Monthly Usage</h3>
          <p className="text-sm text-slate-400 mb-4">{totalViewsUsed.toLocaleString()} / {viewLimit.toLocaleString()} views</p>
          <Link to="/dashboard/billing" className="text-blue-400 text-sm hover:text-blue-300 flex items-center gap-1 font-medium transition-colors">
            Upgrade Capacity <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* 6. Quick Actions */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Quick Actions</h3>
          <p className="text-sm text-slate-400">Deploy tracker script or manage your domains</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-all shadow-lg shadow-white/5 flex items-center gap-2">
            <Code className="h-4 w-4" /> Get Tracker Script
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add New Domain
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
        <form onSubmit={handleCreateProject}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Project Name
            </label>
            <input
              type="text"
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="My Portfolio"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setProjectName('');
              }}
              className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating && <Spinner fullScreen={false} className="h-4 w-4" />}
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Global Spinner for creation */}
      {creating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
          <Spinner fullScreen={false} />
        </div>
      )}
    </div>
  );
}
