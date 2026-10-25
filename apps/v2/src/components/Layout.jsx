import { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { apiRequest } from '../utils/api';
import Sidebar from './shell/Sidebar';
import Header from './shell/Header';
import MobileNav from './shell/MobileNav';
import CommandPalette from './shell/CommandPalette';
import NotificationsSheet from './shell/NotificationsSheet';
import AddProjectWizard from './shell/AddProjectWizard';
import ProjectCodeModal from './shell/ProjectCodeModal';
import GlobalLoader from './GlobalLoader';
import { useProject } from '../context/ProjectContext';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
const SOCKET_URL = API_URL.replace(/\/api$/, '').replace(/\/v1$/, '');

export default function Layout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const navigate = useNavigate();
  const socketRef = useRef(null);

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
      setUser(userData);
      return userData;
    } catch {
      navigate('/login');
      return null;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const loadUsage = useCallback(async () => {
    try {
      const usage = await apiRequest('/usage');
      if (usage) setUsageStats(usage);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadUser();
    loadUsage();
  }, [loadUser, loadUsage]);

  // Sockets connection
  useEffect(() => {
    if (!user) return;

    if (!API_URL.includes('vercel.app')) {
      const socket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['polling', 'websocket'],
        reconnectionAttempts: 5
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
  }, [user]);

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
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navState = isMobile ? (mobileDrawerOpen ? 'open' : 'collapsed') : navPreference;

  if (loading) {
    return (
      <GlobalLoader
        label="Authenticating workspace…"
        subLabel="Connecting to WebPulse secure telemetry"
      />
    );
  }

  return (
    <div className="app" id="app" data-nav={navState}>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>

      <Sidebar user={user} onLogout={handleLogout} />

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
