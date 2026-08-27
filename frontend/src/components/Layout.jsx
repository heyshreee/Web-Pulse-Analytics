import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Folder,
    CreditCard,
    User,
    LogOut,
    Menu,
    X,
    Loader2,
    Activity,
    BarChart2,
    Key,
    LifeBuoy,
    Zap
} from 'lucide-react';
import { apiRequest } from '../utils/api';
import { io } from 'socket.io-client';
import Notifications from './Notifications';
import ThemeToggle from './ThemeToggle';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
const SOCKET_URL = API_URL.replace(/\/api$/, '').replace(/\/v1$/, '');

export default function Layout() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [pinnedProjects, setPinnedProjects] = useState([]);
    const [usageStats, setUsageStats] = useState({
        totalViews: 0,
        monthlyLimit: 1000,
        storageUsed: 0,
        storageLimit: 1024 * 1024 * 1024,
        plan: 'free',
        projectLimit: 5,
        liveLogs: false,
        emailIntegrity: false,
        allowedOriginsLimit: 1
    });
    const location = useLocation();
    const navigate = useNavigate();

    const [socket, setSocket] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        loadUser();
    }, []);

    useEffect(() => {
        if (!user) return;

        loadSidebarData();

        // Socket connection (Skip on Vercel)
        if (!API_URL.includes('vercel.app')) {
            const newSocket = io(SOCKET_URL, {
                withCredentials: true,
                transports: ['websocket', 'polling'],
                reconnectionAttempts: 5
            });

            socketRef.current = newSocket;
            window.socket = newSocket;
            setSocket(newSocket);

            newSocket.on('connect', () => {
                if (user) {
                    newSocket.emit('join', `user_${user.id}`);
                }
            });

            newSocket.on('connect_error', (err) => {
                console.error('❌ Socket.IO connection error:', err.message);
            });

            newSocket.on('usage_update', (data) => {
                setUsageStats(prev => ({
                    ...prev,
                    totalViews: data.totalViews,
                    storageUsed: data.storageUsed,
                    storageLimit: data.storageLimit
                }));
            });

            newSocket.on('new_notification', (data) => {
                window.dispatchEvent(new CustomEvent('notification_received', { detail: data }));
            });
        }

        const interval = setInterval(() => loadSidebarData(), 5000); // Poll every 5s

        return () => {
            clearInterval(interval);
            if (socketRef.current) {
                const s = socketRef.current;
                socketRef.current = null;
                // Small delay to avoid "WebSocket is closed before the connection is established" in dev
                setTimeout(() => {
                    if (s.connected) s.disconnect();
                    else s.close();
                }, 10);
            }
        };
    }, [user]);

    const loadUser = async () => {
        try {
            const userData = await apiRequest('/auth/me');
            setUser(userData);
        } catch (err) {
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    const loadSidebarData = async () => {
        try {
            const [projects, usage] = await Promise.all([
                apiRequest('/projects'),
                apiRequest('/usage')
            ]);

            setPinnedProjects(projects.filter(p => p.is_pinned));
            setUsageStats(usage);

            // Sync user plan if it changed
            if (usage.plan && user && usage.plan !== user.plan) {
                setUser(prev => ({ ...prev, plan: usage.plan }));
            }
        } catch (error) {
            console.error('Failed to load sidebar data', error);
        }
    };

    const handleLogout = async () => {
        try {
            await apiRequest('/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout failed', error);
        }
        navigate('/login');
    };

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/dashboard/projects', label: 'Projects', icon: Folder },
        { path: '/dashboard/activity', label: 'Activity Log', icon: Activity },
        { path: '/dashboard/api-key', label: 'API Keys', icon: Key },
        { path: '/dashboard/billing', label: 'Billing', icon: CreditCard },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
            </div>
        );
    }

    const usagePercentage = Math.min((usageStats.totalViews / usageStats.monthlyLimit) * 100, 100);
    const storagePct = Math.min((usageStats.storageUsed / usageStats.storageLimit) * 100, 100);

    const formatBytes = (bytes) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    };

    const isSettingsPage = location.pathname.startsWith('/dashboard/settings');

    return (
        <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex font-sans text-slate-900 dark:text-slate-200 transition-colors duration-300">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && !isSettingsPage && (
                <div
                    className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            {!isSettingsPage && (
                <aside className={`
            fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out flex flex-col
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
                    {/* Logo */}
                    <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800/80">
                        <Link to="/dashboard" className="flex items-center gap-3 group/logo flex-shrink-0">
                            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 dark:bg-violet-500 text-white shadow-soft transition-transform duration-300 group-hover/logo:scale-105">
                                <BarChart2 className="h-5 w-5" />
                            </div>
                            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                                WebPulse <span className="text-violet-600 dark:text-violet-300">Analytics</span>
                            </span>
                        </Link>
                    </div>

                    {/* Main Navigation */}
                    <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
                        <div>
                            <h3 className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">Menu</h3>
                            <div className="space-y-1">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.path ||
                                        (item.path === '/dashboard/projects' && location.pathname.startsWith('/dashboard/projects'));
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`group flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${isActive
                                                ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300'
                                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                                                }`}
                                        >
                                            <Icon className={`h-[18px] w-[18px] ${isActive ? 'text-violet-600 dark:text-violet-300' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-300'}`} />
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Pinned Projects */}
                        <div>
                            <h3 className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">Pinned Projects</h3>
                            <div className="space-y-0.5">
                                {pinnedProjects.length > 0 ? (
                                    pinnedProjects.map((project) => (
                                        <Link
                                            key={project.id}
                                            to={`/dashboard/projects/${encodeURIComponent(project.name)}`}
                                            className="group flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                                        >
                                            <span className="flex items-center gap-2.5">
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white truncate">{project.name}</span>
                                            </span>
                                        </Link>
                                    ))
                                ) : (
                                    <p className="px-3 py-2 text-xs text-slate-400 dark:text-slate-600">No pinned projects yet</p>
                                )}
                            </div>
                        </div>

                        {/* Usage widget */}
                        <div>
                            <h3 className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">Usage</h3>
                            <div className="card card-pad bg-slate-50 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-700/40 space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Events tracked</span>
                                        <span className="text-xs font-semibold text-slate-900 dark:text-white">{Math.round(usagePercentage)}%</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-slate-200/70 dark:bg-slate-700/60 overflow-hidden">
                                        <div className="h-full rounded-full bg-violet-500 transition-all duration-500" style={{ width: `${usagePercentage}%` }} />
                                    </div>
                                    <p className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                                        {usageStats.totalViews.toLocaleString()} / {usageStats.monthlyLimit.toLocaleString()} views
                                    </p>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Storage</span>
                                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                                            {formatBytes(usageStats.storageUsed)} <span className="font-normal text-slate-400">/ {formatBytes(usageStats.storageLimit)}</span>
                                        </span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-slate-200/70 dark:bg-slate-700/60 overflow-hidden">
                                        <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${storagePct}%` }} />
                                    </div>
                                </div>

                                <Link to="/dashboard/billing" className="btn-primary btn-sm w-full">
                                    <Zap className="h-3.5 w-3.5" />
                                    Upgrade plan
                                </Link>
                            </div>
                        </div>
                    </nav>

                    {/* Footer */}
                    <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-800/80">
                        <Link
                            to="/help"
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            <LifeBuoy className="h-[18px] w-[18px] text-slate-400 dark:text-slate-500" />
                            Help & Docs
                        </Link>
                    </div>
                </aside>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 transition-colors duration-300">
                    <div className="flex items-center gap-3">
                        {!isSettingsPage && (
                            <button
                                className="lg:hidden p-2 -ml-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                        )}
                        {isSettingsPage && (
                            <Link to="/dashboard" className="flex items-center gap-2.5 group/logo">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 dark:bg-violet-500 text-white">
                                    <BarChart2 className="h-4 w-4" />
                                </div>
                                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                                    WebPulse <span className="text-violet-600 dark:text-violet-300">Analytics</span>
                                </span>
                            </Link>
                        )}
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <ThemeToggle />

                        <div className="hidden sm:block h-5 w-px bg-slate-200 dark:bg-slate-800" />

                        <Notifications />

                        <div className="hidden sm:block h-5 w-px bg-slate-200 dark:bg-slate-800" />

                        {user && (
                            <div className="flex items-center gap-3 pl-1">
                                <div className="text-right hidden md:block leading-tight">
                                    <div className="text-sm font-medium text-slate-900 dark:text-white">{user.email}</div>
                                    <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                                        <span className="inline-flex items-center gap-1">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                            {user.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : 'Free'} Plan
                                        </span>
                                    </div>
                                </div>
                                <div className="relative group">
                                    <button className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-white overflow-hidden hover:ring-2 hover:ring-violet-500/30 transition-all">
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt={user.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <User className="h-4 w-4" />
                                        )}
                                    </button>

                                    {/* Dropdown Menu */}
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lift py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all origin-top-right z-50">
                                        <Link to="/dashboard/settings" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Profile Settings</Link>
                                        <Link to="/dashboard/billing" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Billing</Link>
                                        <div className="my-1 border-t border-slate-100 dark:border-slate-800"></div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto">
                    <div className="container-app py-6 sm:py-8">
                        <Outlet context={{ user, loadUser, loadSidebarData, usageStats, socket }} />
                    </div>
                </main>
            </div>
        </div>
    );
}
