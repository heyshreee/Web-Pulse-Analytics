import { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
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
import Sidebar from './shell/Sidebar';
import Header from './shell/Header';
import MobileNav from './shell/MobileNav';
import CommandPalette from './shell/CommandPalette';
import NotificationsSheet from './shell/NotificationsSheet';
import AddProjectWizard from './shell/AddProjectWizard';
import ProjectCodeModal from './shell/ProjectCodeModal';
import GlobalLoader from './GlobalLoader';
import { useProject } from '../context/ProjectContext';

export default function Layout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [usageStats, setUsageStats] = useState({
    totalViews: 0,
    monthlyLimit: 1000,
    storageUsed: 0,
    storageLimit: 1024 * 1024 * 1024,
    plan: 'free',
    projectLimit: 5
  });

  const [isMobile, setIsMobile] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [navPreference, setNavPreference] = useState(() => {
    try {
      const prefs = JSON.parse(localStorage.getItem('webpulse.prefs') || '{}');
      return prefs.nav === 'collapsed' ? 'collapsed' : 'expanded';
    } catch {
      return 'expanded';
    }
  });

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsSheetOpen, setNotificationsSheetOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);

  const {
    addProjectOpen,
    closeAddProject,
    installSnippetTarget,
    closeInstallSnippet,
  } = useProject();

  const location = useLocation();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const loggingOutRef = useRef(false);

  // Viewport resize tracking
  useEffect(() => {
    const checkViewport = () => {
      const mob = window.innerWidth <= 768;
      setIsMobile(mob);
      if (!mob) setMobileDrawerOpen(false);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Keyboard shortcut for command palette
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const loadUser = useCallback(async () => {
    try {
      const userData = await apiRequest('/auth/me');
      if (!userData || !userData.id) {
        clearSession();
        setUser(null);
        navigate('/login', { replace: true });
        return null;
      }
      setSession();
      setUser(userData);
      setLoading(false);
      return userData;
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
      return null;
    }
  }, [location.pathname, location.search, navigate]);

  const loadUsage = useCallback(async () => {
    if (loggingOutRef.current) return;
    try {
      const usage = await apiRequest('/usage');
      if (usage) setUsageStats(usage);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

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

  // Usage + Sockets connection (strictly gated on verified user & v2_beta surface access)
  const hasV2BetaAccess = user?.entitlements?.access?.v2_beta !== false;

  useEffect(() => {
    if (!user || isLoggingOut || !hasV2BetaAccess) return;

    loadUsage();

    if (isSocketEnabled()) {
      const socket = io(getSocketUrl(), {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        timeout: 10000
      });
      socketRef.current = socket;
      window.socket = socket;

      socket.on('connect', () => {
        socket.emit('join', `user_${user.id}`);
      });

      socket.on('usage_update', (data) => {
        setUsageStats((prev) => ({
          ...prev,
          totalViews: data.totalViews ?? prev.totalViews,
          storageUsed: data.storageUsed ?? prev.storageUsed,
          storageLimit: data.storageLimit ?? prev.storageLimit
        }));
      });

      socket.on('new_notification', () => {
        setUnreadNotifications((prev) => prev + 1);
      });

      return () => {
        setTimeout(() => {
          if (socket.connected) socket.disconnect();
          else socket.close();
        }, 10);
      };
    }
  }, [user, isLoggingOut, loadUsage]);

  const handleToggleNav = () => {
    if (isMobile) {
      setMobileDrawerOpen((prev) => !prev);
    } else {
      const next = navPreference === 'expanded' ? 'collapsed' : 'expanded';
      setNavPreference(next);
      try {
        const prefs = JSON.parse(localStorage.getItem('webpulse.prefs') || '{}');
        prefs.nav = next;
        localStorage.setItem('webpulse.prefs', JSON.stringify(prefs));
      } catch {
        // ignore
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
      // Proceed with local sign-out even if server call fails or session already expired
    } finally {
      setUser(null);
      markLoggedOut();
      setLoggingOut(false);
      navigate('/login', { replace: true, state: { loggedOut: true } });
    }
  };

  const navState = isMobile ? (mobileDrawerOpen ? 'open' : 'collapsed') : navPreference;

  if (loading || isLoggingOut || !user) {
    return (
      <GlobalLoader
        label="Authenticating workspace…"
        subLabel="Connecting to WebPulse secure telemetry"
      />
    );
  }

  if (!hasV2BetaAccess) {
    const planLabel = String(user?.normalized_plan || user?.plan || 'nano').toUpperCase();
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-black text-white">
        <div className="max-w-md w-full rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-4 text-center">
          <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
            V2 Beta Restricted · {planLabel} Plan
          </div>
          <h1 className="text-lg font-semibold tracking-tight">
            V2 Beta requires Pro or higher
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Your {planLabel} subscription includes full access to the V1 Stable production dashboard at{' '}
            <span className="font-mono text-zinc-200">app.webpulseanalytics.tech</span>. Upgrade to Pro or Max to unlock the V2 Beta workspace.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <a
              href="https://app.webpulseanalytics.tech/dashboard"
              className="flex-1 inline-flex items-center justify-center h-9 px-4 rounded-lg bg-white text-black text-xs font-medium hover:bg-zinc-200 transition-colors"
            >
              Open V1 Stable
            </a>
            <a
              href="https://app.webpulseanalytics.tech/dashboard/billing"
              className="flex-1 inline-flex items-center justify-center h-9 px-4 rounded-lg border border-zinc-700 text-zinc-200 text-xs font-medium hover:bg-zinc-900 transition-colors"
            >
              Upgrade Plan
            </a>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs font-mono text-zinc-500 hover:text-zinc-300 underline pt-1"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app" id="app" data-nav={navState}>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>

      <Sidebar user={user} plan={user?.plan || usageStats?.plan || 'free'} onLogout={handleLogout} />

      <div
        className="sidebar-scrim"
        onClick={() => setMobileDrawerOpen(false)}
        aria-hidden="true"
      />

      <div className="app-main">
        <Header
          isMobile={isMobile}
          onToggleNav={handleToggleNav}
          onOpenCommand={() => setCommandPaletteOpen(true)}
          onOpenNotifications={() => setNotificationsSheetOpen(true)}
          unreadNotificationsCount={unreadNotifications}
          user={user}
          plan={user?.plan || usageStats?.plan || 'free'}
          onLogout={handleLogout}
        />

        <main className="app-content" id="main" tabIndex="-1">
          <Outlet context={{ user, loadUser, usageStats, socket: socketRef.current }} />
        </main>

        <MobileNav />
      </div>

      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onToggleNav={handleToggleNav}
        onMarkAllRead={() => setUnreadNotifications(0)}
      />

      <NotificationsSheet
        open={notificationsSheetOpen}
        onClose={() => setNotificationsSheetOpen(false)}
        onCountChange={(count) => setUnreadNotifications(count)}
      />

      <AddProjectWizard open={addProjectOpen} onClose={closeAddProject} />

      <ProjectCodeModal
        project={installSnippetTarget}
        open={Boolean(installSnippetTarget)}
        onClose={closeInstallSnippet}
      />
    </div>
  );
}
