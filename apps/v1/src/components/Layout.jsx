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
    Zap,
    Sparkles
} from 'lucide-react';
import { apiRequest, getSocketUrl, isSocketEnabled } from '../utils/api';
import {
    clearSession,
    setSession,
    isAuthenticated,
    markLoggedOut,
    wasJustLoggedOut,
    setLoggingOut,
    SESSION_FLAG
} from '../utils/auth';
import { io } from 'socket.io-client';
import Notifications from './Notifications';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';
import PageTransition from './PageTransition';

export default function Layout() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [sidebarLoading, setSidebarLoading] = useState(true);
    const [isPageLoading, setIsPageLoading] = useState(true);
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
    const loggingOutRef = useRef(false);

    useEffect(() => {
        loadUser();
        const timer = setTimeout(() => {
            setIsPageLoading(false);
        }, 1200);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const handleStorage = (e) => {
            if ((e.key === SESSION_FLAG && e.newValue !== '1') || e.key === null) {
                if (socketRef.current) {
                    try {
                        socketRef.current.disconnect();
                    } catch {
                        // ignore
                    }
                    socketRef.current = null;
                }
                if (typeof window !== 'undefined' && window.socket) {
                    window.socket = undefined;
                }
                setUser(null);
                navigate('/login', { replace: true, state: { loggedOut: true } });
            }
        };
        const handlePageShow = (e) => {
            if (e.persisted && !isAuthenticated()) {
                clearSession();
                setUser(null);
                navigate('/login', { replace: true, state: { loggedOut: true } });
            }
        };
        window.addEventListener('storage', handleStorage);
        window.addEventListener('pageshow', handlePageShow);
        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('pageshow', handlePageShow);
        };
    }, [navigate]);

    useEffect(() => {
        if (!user || isLoggingOut) return;

        loadSidebarData(true);

        if (isSocketEnabled()) {
            const newSocket = io(getSocketUrl(), {
                withCredentials: true,
                transports: ['websocket', 'polling'],
                reconnectionAttempts: 5,
                reconnectionDelay: 2000,
                timeout: 10000,
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
                if (import.meta.env.DEV) {
                    console.debug('Socket.IO connection notice:', err.message);
                }
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

        const sidebarIntervalMs = Math.max(
            30000,
            Number(usageStats?.limits?.dashboard_refresh_seconds || 60) * 1000
        );
        const interval = setInterval(() => {
            if (typeof document === 'undefined' || !document.hidden) {
                loadSidebarData();
            }
        }, sidebarIntervalMs);

        return () => {
            clearInterval(interval);
            if (socketRef.current) {
                const s = socketRef.current;
                socketRef.current = null;
                if (s.connected) {
                    s.disconnect();
                } else {
                    s.once('connect', () => s.disconnect());
                    s.once('connect_error', () => s.disconnect());
                }
            }
        };
    }, [user?.id, isLoggingOut]);

    const loadUser = async () => {
        try {
            const userData = await apiRequest('/auth/me');
            if (!userData || !userData.id) {
                clearSession();
                setUser(null);
                navigate('/login', { replace: true });
                return;
            }
            setSession();
            setUser(userData);
            setLoading(false);
        } catch (err) {
            if (err?.status !== 503) {
                clearSession();
            }
            setUser(null);
            if (wasJustLoggedOut()) {
                navigate('/login', { replace: true, state: { loggedOut: true } });
            } else {
                const returnUrl = encodeURIComponent(location.pathname + location.search);
                navigate(`/login?returnUrl=${returnUrl}`, { replace: true });
            }
        }
    };

    const loadSidebarData = async (initial = false) => {
        if (loggingOutRef.current) return;
        try {
            const [projects, usage] = await Promise.all([
                apiRequest('/projects'),
                apiRequest('/usage')
            ]);

            setPinnedProjects(projects.filter(p => p.is_pinned));
            setUsageStats(usage);

            // Sync user plan only when normalized plan actually changed
            const currentNorm = user?.normalized_plan || user?.plan;
            if (usage.plan && currentNorm && usage.plan !== currentNorm) {
                setUser(prev => (prev ? { ...prev, plan: usage.plan, normalized_plan: usage.plan } : prev));
            }
        } catch (error) {
            console.error('Failed to load sidebar data', error);
        } finally {
            if (initial) {
                setSidebarLoading(false);
            }
        }
    };

    const handleLogout = async () => {
        if (loggingOutRef.current) return;
        loggingOutRef.current = true;
        setIsLoggingOut(true);
        setLoggingOut(true);

        if (socketRef.current) {
            try {
                socketRef.current.disconnect();
            } catch {
                // ignore
            }
            socketRef.current = null;
        }
        if (typeof window !== 'undefined' && window.socket) {
            window.socket = undefined;
        }

        clearSession();

        // Await server-side session revocation + cookie clearing before
        // navigating to /login so /auth/me cannot race and restore the session.
        try {
            const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
            const timer = controller ? setTimeout(() => controller.abort(), 5000) : null;
            try {
                await apiRequest('/auth/logout', {
                    method: 'POST',
                    ...(controller ? { signal: controller.signal } : {})
                });
            } finally {
                if (timer) clearTimeout(timer);
            }
        } catch {
            // Proceed with local sign-out even if server call fails or session already expired.
        } finally {
            setUser(null);
            markLoggedOut();
            setLoggingOut(false);
            navigate('/login', { replace: true, state: { loggedOut: true } });
        }
    };

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/dashboard/projects', label: 'Projects', icon: Folder },
        { path: '/dashboard/activity', label: 'Activity Log', icon: Activity },
        { path: '/dashboard/api-key', label: 'API Keys', icon: Key },
        { path: '/dashboard/billing', label: 'Billing', icon: CreditCard },
    ];

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

    const isSettingsPage = location.pathname.startsWith('/dashboard/settings');

    if (loading || isLoggingOut || !user) {
        return (
            <div className={`wp-shell font-sans text-[var(--wp-text-primary)] ${isSettingsPage ? 'wp-shell-full' : ''}`}>
                {/* Top Studio Bar Skeleton */}
                <header className="col-span-full h-[46px] border-b border-[var(--wp-border-default)] bg-[var(--wp-bg-canvas)] px-3 sm:px-4 flex items-center justify-between z-30 animate-pulse">
                    <div className="flex items-center gap-2">
                        <div className="w-[22px] h-[22px] rounded bg-[var(--wp-border-default)]" />
                        <div className="h-4 w-20 bg-[var(--wp-border-default)] rounded" />
                        <span className="text-[var(--wp-border-strong)] mx-1 text-xs select-none">/</span>
                        <div className="h-4 w-32 bg-[var(--wp-border-subtle)] rounded hidden sm:block" />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-7 w-16 bg-[var(--wp-border-subtle)] rounded hidden sm:block" />
                        <div className="h-7 w-7 bg-[var(--wp-border-subtle)] rounded" />
                        <div className="h-5 w-14 bg-[var(--wp-border-subtle)] rounded hidden sm:block" />
                        <div className="h-7 w-7 bg-[var(--wp-border-subtle)] rounded-full" />
                    </div>
                </header>

                {/* Left Control Rail Skeleton */}
                {!isSettingsPage && (
                    <aside className="w-[224px] min-w-[224px] max-w-[224px] border-r border-[var(--wp-border-default)] bg-[var(--wp-bg-canvas)] flex flex-col justify-between p-2.5 hidden lg:flex animate-pulse">
                        <div className="space-y-4">
                            <div>
                                <div className="h-3 w-14 bg-[var(--wp-border-subtle)] rounded mb-2 px-1" />
                                <div className="space-y-1">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="h-[30px] rounded-md px-2 flex items-center gap-2 bg-[var(--wp-bg-subtle)]/60">
                                            <div className="h-3.5 w-3.5 rounded bg-[var(--wp-border-default)]" />
                                            <div className={`h-3 rounded bg-[var(--wp-border-default)] ${i === 1 ? 'w-20' : i === 2 ? 'w-16' : i === 3 ? 'w-24' : 'w-14'}`} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="h-3 w-20 bg-[var(--wp-border-subtle)] rounded mb-2 px-1" />
                                <div className="h-[28px] rounded-md bg-[var(--wp-bg-subtle)]/40" />
                            </div>
                        </div>

                        <div className="border border-[var(--wp-border-default)] rounded-md p-2.5 space-y-2 bg-[var(--wp-bg-surface)]">
                            <div className="h-3 w-20 bg-[var(--wp-border-subtle)] rounded" />
                            <div className="h-1 w-full bg-[var(--wp-border-default)] rounded-full" />
                            <div className="h-6 w-full bg-[var(--wp-border-subtle)] rounded" />
                        </div>
                    </aside>
                )}

                {/* Main Viewport Skeleton */}
                <div className={`flex flex-col min-w-0 h-full overflow-hidden bg-[var(--wp-bg-canvas)] ${isSettingsPage ? 'col-span-full' : ''}`}>
                    <main className="flex-1 p-3 sm:p-4 space-y-3 animate-pulse">
                        <div className="flex justify-between items-center h-8">
                            <div className="h-4 w-32 bg-[var(--wp-border-default)] rounded" />
                            <div className="h-7 w-28 bg-[var(--wp-border-default)] rounded" />
                        </div>
                        <div className="wp-panel h-[82px] bg-[var(--wp-bg-surface)]" />
                        <div className="grid grid-cols-12 gap-3 h-[420px]">
                            <div className="col-span-7 wp-panel bg-[var(--wp-bg-surface)]" />
                            <div className="col-span-5 wp-panel bg-[var(--wp-bg-surface)]" />
                        </div>
                    </main>
                    <footer className="h-[28px] border-t border-[var(--wp-border-subtle)] px-4 flex items-center justify-between text-[11px] font-mono text-[var(--wp-text-muted)] bg-[var(--wp-bg-canvas)]">
                        <div className="h-2.5 w-48 bg-[var(--wp-border-subtle)] rounded" />
                        <div className="h-2.5 w-24 bg-[var(--wp-border-subtle)] rounded" />
                    </footer>
                </div>
            </div>
        );
    }

    const usagePercentage = Math.min((usageStats.totalViews / usageStats.monthlyLimit) * 100, 100);
    const storagePct = Math.min((usageStats.storageUsed / usageStats.storageLimit) * 100, 100);

    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return '0.0 MB';
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    };

    const isSidebarBusy = sidebarLoading || isPageLoading;

    const isProdDomain = typeof window !== 'undefined' &&
        (window.location.hostname === 'webpulseanalytics.tech' || window.location.hostname.endsWith('.webpulseanalytics.tech'));
    const defaultV2Url = isProdDomain ? 'https://beta.webpulseanalytics.tech' : 'http://localhost:5175';
    const v2AppUrl = import.meta.env.VITE_V2_APP_URL || defaultV2Url;

    return (
        <div className={`wp-shell font-sans text-[var(--wp-text-primary)] ${isSettingsPage ? 'wp-shell-full' : ''}`}>
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && !isSettingsPage && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Top Studio Bar (46px) */}
            <header className="col-span-full h-[46px] border-b border-[var(--wp-border-default)] bg-[var(--wp-bg-canvas)] px-3 sm:px-4 flex items-center justify-between z-30 select-none">
                <div className="flex items-center gap-2">
                    {!isSettingsPage && (
                        <button
                            className="lg:hidden p-1.5 -ml-1 text-[var(--wp-text-secondary)] hover:text-[var(--wp-text-primary)] hover:bg-[var(--wp-bg-hover)] rounded-md transition-colors"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Open navigation menu"
                        >
                            <Menu className="h-4 w-4" />
                        </button>
                    )}
                    <Link to="/dashboard" className="flex items-center gap-2 group">
                        <span className="wp-brand-mark flex items-center justify-center p-0.5">
                            <svg viewBox="0 0 706 204" className="w-3.5 h-auto" fill="currentColor">
                                <path d="M 43 102 L 43 147 L 89 147 L 90 145 L 89 102 Z" />
                                <path d="M 1 61 L 1 98 L 39 98 L 39 61 Z" />
                                <path d="M 705 121 L 705 93 L 609 92 L 581 127 L 526 2 L 496 2 L 415 128 L 347 52 L 298 52 L 214 138 L 114 21 L 46 21 L 200 203 L 231 202 L 325 111 L 406 203 L 426 203 L 510 66 L 564 191 L 582 191 L 621 122 Z" />
                            </svg>
                        </span>
                        <span className="text-[13px] font-semibold tracking-tight text-[var(--wp-text-primary)]">
                            WebPulse
                        </span>
                    </Link>
                    <span className="text-[var(--wp-border-strong)] mx-1 text-xs select-none">/</span>
                    <span className="wp-metric-mono text-[10.5px] text-[var(--wp-text-muted)] hidden sm:inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-[var(--wp-bg-subtle)] border border-[var(--wp-border-subtle)]">
                        Powered by Edge Telemetry
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <a
                        href={v2AppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="wp-btn wp-btn-secondary h-7 text-xs px-2.5 gap-1.5 hidden sm:inline-flex"
                    >
                        <Sparkles className="h-3 w-3" />
                        <span>V2 Beta</span>
                    </a>

                    <div className="h-4 w-px bg-[var(--wp-border-subtle)] hidden sm:block" />

                    <ThemeToggle />

                    <Notifications />

                    {user && (
                        <div className="flex items-center gap-2 pl-1 border-l border-[var(--wp-border-subtle)] ml-1">
                            <Link
                                to="/dashboard/billing"
                                className="wp-metric-mono text-[10px] uppercase font-semibold px-2 py-0.5 rounded border border-[var(--wp-border-default)] bg-[var(--wp-bg-surface)] text-[var(--wp-text-secondary)] hover:text-[var(--wp-text-primary)] hover:border-[var(--wp-border-strong)] transition-all inline-flex items-center gap-1.5 select-none"
                                title="Subscription plan — click to manage in Billing"
                            >
                                <span className={`h-1.5 w-1.5 rounded-full ${
                                    ['pro', 'business', 'enterprise'].includes((user.plan || usageStats?.plan || '').toLowerCase())
                                        ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]'
                                        : 'bg-[var(--wp-text-muted)]'
                                }`} />
                                <span>{(user.plan || usageStats?.plan || 'Free').toUpperCase()}</span>
                            </Link>

                            <div className="relative group">
                                <button className="h-7 w-7 rounded-full border border-[var(--wp-border-default)] bg-[var(--wp-bg-subtle)] flex items-center justify-center text-[var(--wp-text-primary)] overflow-hidden hover:border-[var(--wp-border-strong)] transition-all">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt={user.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-[11px] font-medium font-mono uppercase">
                                            {(user.name || user.email || 'U').charAt(0)}
                                        </span>
                                    )}
                                </button>
                                {/* Dropdown Menu */}
                                <div className="absolute right-0 mt-2 w-48 bg-[var(--wp-bg-surface)] border border-[var(--wp-border-default)] rounded-md shadow-2xl py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all origin-top-right z-50">
                                    <div className="px-3 py-1.5 border-b border-[var(--wp-border-subtle)]">
                                        <p className="text-xs font-medium text-[var(--wp-text-primary)] truncate">{user.email}</p>
                                        <p className="text-[10.5px] text-[var(--wp-text-muted)] font-mono flex items-center gap-1 mt-0.5">
                                            <span className="wp-live-dot" />
                                            {user.plan ? user.plan.toUpperCase() : 'FREE'} PLAN
                                        </p>
                                    </div>
                                    <Link to="/dashboard/settings" className="block px-3 py-1.5 text-xs text-[var(--wp-text-secondary)] hover:text-[var(--wp-text-primary)] hover:bg-[var(--wp-bg-hover)]">Profile Settings</Link>
                                    <Link to="/dashboard/billing" className="block px-3 py-1.5 text-xs text-[var(--wp-text-secondary)] hover:text-[var(--wp-text-primary)] hover:bg-[var(--wp-bg-hover)]">Billing</Link>
                                    <div className="my-1 border-t border-[var(--wp-border-subtle)]" />
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-red-500/10"
                                    >
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Left Control Rail (224px) */}
            {!isSettingsPage && (
                <aside className={`
                    fixed lg:static inset-y-[46px] left-0 z-40 w-[224px] min-w-[224px] max-w-[224px] bg-[var(--wp-bg-canvas)] border-r border-[var(--wp-border-default)] transform transition-transform duration-200 ease-in-out flex flex-col justify-between p-2.5 h-full min-h-0 overflow-hidden
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}>
                    <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1">
                        <div>
                            <div className="wp-label-section px-2 mb-1.5 uppercase">Workspace</div>
                            {isSidebarBusy ? (
                                <div className="space-y-1 animate-pulse" aria-label="Loading navigation">
                                    {[
                                        { path: '/dashboard', labelWidth: 'w-20', isRoute: location.pathname === '/dashboard' },
                                        { path: '/dashboard/projects', labelWidth: 'w-16', isRoute: location.pathname.startsWith('/dashboard/projects') },
                                        { path: '/dashboard/activity', labelWidth: 'w-24', isRoute: location.pathname === '/dashboard/activity' },
                                        { path: '/dashboard/api-key', labelWidth: 'w-16', isRoute: location.pathname === '/dashboard/api-key' },
                                        { path: '/dashboard/billing', labelWidth: 'w-14', isRoute: location.pathname === '/dashboard/billing' },
                                    ].map((item, idx) => (
                                        <div
                                            key={idx}
                                            className={`h-[30px] rounded-md px-2 flex items-center gap-2 ${
                                                item.isRoute ? 'bg-[var(--wp-bg-active)]' : 'bg-transparent'
                                            }`}
                                        >
                                            <div className="h-3.5 w-3.5 rounded bg-[var(--wp-border-default)]" />
                                            <div className={`h-3 rounded bg-[var(--wp-border-default)] ${item.labelWidth}`} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-0.5">
                                    {navItems.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = location.pathname === item.path ||
                                            (item.path === '/dashboard/projects' && location.pathname.startsWith('/dashboard/projects'));
                                        return (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                onClick={() => setSidebarOpen(false)}
                                                className={`h-[30px] px-2 rounded-md text-[12.5px] font-medium flex items-center gap-2 transition-colors ${isActive
                                                    ? 'bg-[var(--wp-bg-active)] text-[var(--wp-text-primary)]'
                                                    : 'text-[var(--wp-text-secondary)] hover:text-[var(--wp-text-primary)] hover:bg-[var(--wp-bg-hover)]'
                                                    }`}
                                            >
                                                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[var(--wp-text-primary)]' : 'text-[var(--wp-text-muted)]'}`} />
                                                <span>{item.label}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Pinned domains */}
                        <div>
                            <div className="wp-label-section px-2 mb-1.5 uppercase">Pinned domains</div>
                            {isSidebarBusy ? (
                                <div className="h-[28px] rounded-md bg-[var(--wp-bg-subtle)] animate-pulse" />
                            ) : (
                                <div>
                                    {pinnedProjects.length > 0 ? (
                                        <div className="space-y-0.5">
                                            {pinnedProjects.map((project) => (
                                                <Link
                                                    key={project.id}
                                                    to={`/dashboard/projects/${encodeURIComponent(project.name)}`}
                                                    className="h-[28px] px-2 rounded-md text-[12px] flex items-center gap-2 text-[var(--wp-text-secondary)] hover:text-[var(--wp-text-primary)] hover:bg-[var(--wp-bg-hover)] transition-colors truncate"
                                                >
                                                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--wp-status-live)] shrink-0" />
                                                    <span className="truncate">{project.name}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <Link
                                            to="/dashboard/projects"
                                            className="h-[28px] px-2 rounded-md text-[11.5px] text-[var(--wp-text-muted)] hover:text-[var(--wp-text-primary)] hover:bg-[var(--wp-bg-hover)] flex items-center gap-1.5 transition-colors"
                                        >
                                            <span>Pin a domain</span>
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recessed Capacity Card */}
                    <div className="border border-[var(--wp-border-default)] rounded-md p-2.5 space-y-2 bg-[var(--wp-bg-surface)] shrink-0 mt-2">
                        {isSidebarBusy ? (
                            <div className="space-y-2.5 animate-pulse" aria-label="Loading capacity">
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="h-2.5 w-12 bg-[var(--wp-border-subtle)] rounded" />
                                        <div className="h-2.5 w-8 bg-[var(--wp-border-subtle)] rounded" />
                                    </div>
                                    <div className="h-1 w-full bg-[var(--wp-border-default)] rounded-full" />
                                    <div className="h-2 w-24 bg-[var(--wp-border-subtle)] rounded mt-1.5" />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="h-2.5 w-12 bg-[var(--wp-border-subtle)] rounded" />
                                        <div className="h-2.5 w-14 bg-[var(--wp-border-subtle)] rounded" />
                                    </div>
                                    <div className="h-1 w-full bg-[var(--wp-border-default)] rounded-full" />
                                </div>
                                <div className="h-7 w-full bg-[var(--wp-border-subtle)] rounded mt-1" />
                            </div>
                        ) : (
                            <>
                                <div>
                                    <div className="flex items-center justify-between text-[11px] mb-1">
                                        <span className="text-[var(--wp-text-secondary)]">Events</span>
                                        <span className="wp-metric-mono font-medium text-[var(--wp-text-primary)]">
                                            {formatUsagePercent(usageStats?.totalViews, usageStats?.monthlyLimit)}
                                        </span>
                                    </div>
                                    <div className="wp-meter-track">
                                        <div
                                            className="wp-meter-bar"
                                            style={{ width: `${Math.max(usagePercentage, (usageStats?.totalViews || 0) > 0 ? 2 : 0)}%` }}
                                        />
                                    </div>
                                    <p className="wp-metric-mono text-[10.5px] text-[var(--wp-text-muted)] mt-1">
                                        {(usageStats?.totalViews || 0).toLocaleString()} / {formatCompactLimit(usageStats?.monthlyLimit)} views
                                    </p>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between text-[11px] mb-1">
                                        <span className="text-[var(--wp-text-secondary)]">Storage</span>
                                        <span className="wp-metric-mono font-medium text-[var(--wp-text-primary)]">
                                            {formatBytes(usageStats?.storageUsed || 0)}
                                        </span>
                                    </div>
                                    <div className="wp-meter-track">
                                        <div
                                            className="wp-meter-bar"
                                            style={{ width: `${Math.max(storagePct, (usageStats?.storageUsed || 0) > 0 ? 2 : 0)}%` }}
                                        />
                                    </div>
                                </div>

                                <Link to="/dashboard/billing" className="wp-btn wp-btn-secondary h-7 w-full text-xs justify-center mt-1">
                                    Manage plan
                                </Link>
                            </>
                        )}
                    </div>
                </aside>
            )}

            {/* Main Studio Viewport */}
            <div className={`flex flex-col min-w-0 h-full overflow-hidden bg-[var(--wp-bg-canvas)] ${isSettingsPage ? 'col-span-full' : ''}`}>
                <main className="flex-1 overflow-auto layout-scroll-content p-3 sm:p-4 min-h-0">
                    <PageTransition>
                        <Outlet context={{ user, loadUser, loadSidebarData, usageStats, socket, isPageLoading, setIsPageLoading }} />
                    </PageTransition>
                </main>

                {/* Minimal Studio Footer (28px) */}
                <footer className="h-[28px] border-t border-[var(--wp-border-subtle)] px-4 flex items-center justify-between text-[11px] font-mono text-[var(--wp-text-muted)] bg-[var(--wp-bg-canvas)] select-none shrink-0">
                    <div className="flex items-center gap-2">
                        <span>WebPulse Studio</span>
                        <span>•</span>
                        <span>Realtime Edge</span>
                        <span>•</span>
                        <a href="/features" className="hover:text-[var(--wp-text-secondary)] transition-colors">How it works</a>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="wp-live-dot" />
                        <span>100% operational</span>
                    </div>
                </footer>
            </div>
        </div>
    );
}
