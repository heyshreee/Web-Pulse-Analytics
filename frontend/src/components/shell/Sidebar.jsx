import { useState, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import Icon from '../ui/Icon';
import { Popover, MenuItem, MenuLabel, MenuSep } from '../ui/Overlay';
import { useProject } from '../../context/ProjectContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { route: '/dashboard', label: 'Dashboard', icon: 'dashboard', end: true }
    ]
  },
  {
    label: 'Analytics',
    items: [
      { route: '/dashboard/visitors', label: 'Visitors', icon: 'users' },
      { route: '/dashboard/sessions', label: 'Sessions', icon: 'activity' },
      { route: '/dashboard/pages', label: 'Pages', icon: 'file' },
      { route: '/dashboard/events', label: 'Events', icon: 'zap' },
      { route: '/dashboard/sources', label: 'Sources', icon: 'link' },
      { route: '/dashboard/geography', label: 'Geography', icon: 'globe' }
    ]
  },
  {
    label: 'Monitoring',
    items: [
      { route: '/dashboard/live', label: 'Live Activity', icon: 'radio', live: true },
      { route: '/dashboard/alerts', label: 'Alerts', icon: 'flag', count: 3 }
    ]
  },
  {
    label: 'Manage',
    items: [
      { route: '/dashboard/projects', label: 'Projects', icon: 'folder' },
      { route: '/dashboard/api-key', label: 'API Keys', icon: 'key' },
      { route: '/integrations', label: 'Integrations', icon: 'link' }
    ]
  },
  {
    label: 'Account',
    items: [
      { route: '/dashboard/billing', label: 'Billing', icon: 'card' },
      { route: '/dashboard/settings', label: 'Settings', icon: 'sliders' },
      { route: '/docs', label: 'Help & Docs', icon: 'book' }
    ]
  }
];

export default function Sidebar({ user, onLogout }) {
  const { projects, selectedProjectId, setSelectedProjectId, currentProject, openAddProject } = useProject();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const projectSwitchRef = useRef(null);
  const userCardRef = useRef(null);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'WP';

  const handleSelectProject = (id) => {
    setSelectedProjectId(id);
    setProjectMenuOpen(false);
    const p = id === 'all' ? { name: 'All Projects' } : projects.find((x) => x.id === id);
    showToast(`Switched to ${p?.name || 'project'}`);
  };

  return (
    <aside className="sidebar" aria-label="Application sidebar">
      <div className="sidebar-head">
        <NavLink to="/dashboard" className="brand" aria-label="WebPulse Home">
          <span className="brand-mark" aria-hidden="true">
            <Icon name="activity" size={17} />
          </span>
          <span className="brand-text">
            <span className="brand-name">WebPulse</span>
            <span className="brand-sub">Real-time web analytics</span>
          </span>
        </NavLink>

        <button
          ref={projectSwitchRef}
          type="button"
          className="project-switch"
          id="project-switch"
          aria-haspopup="menu"
          aria-expanded={projectMenuOpen}
          onClick={() => setProjectMenuOpen((v) => !v)}
          title="Switch project"
        >
          <span
            className="project-dot"
            aria-hidden="true"
            style={{ background: currentProject?.installed ? 'var(--success)' : 'var(--warning)' }}
          />
          <span className="project-switch-text">
            <span className="project-switch-name">{currentProject?.name || 'All Projects'}</span>
            <span className="project-switch-env">{currentProject?.env || 'Production'}</span>
          </span>
          <span aria-hidden="true" style={{ color: 'var(--muted-foreground)' }}>
            <Icon name="chevronDown" size={14} />
          </span>
        </button>

        <Popover
          open={projectMenuOpen}
          onClose={() => setProjectMenuOpen(false)}
          anchorEl={projectSwitchRef.current}
          align="left"
          className="w-64"
        >
          <MenuLabel>Projects</MenuLabel>
          <MenuItem
            icon={selectedProjectId === 'all' ? 'check' : 'database'}
            active={selectedProjectId === 'all'}
            onClick={() => handleSelectProject('all')}
          >
            All Projects
          </MenuItem>
          {projects.map((p) => (
            <MenuItem
              key={p.id}
              icon={selectedProjectId === p.id ? 'check' : 'folder'}
              active={selectedProjectId === p.id}
              onClick={() => handleSelectProject(p.id)}
            >
              <span className="truncate">{p.name}</span>
            </MenuItem>
          ))}
          <MenuSep />
          <MenuItem
            icon="plus"
            onClick={() => {
              setProjectMenuOpen(false);
              openAddProject();
            }}
          >
            Add project
          </MenuItem>
        </Popover>
      </div>

      <nav className="sidebar-scroll" aria-label="Main">
        {NAV_GROUPS.map((group) => (
          <div className="nav-group" key={group.label} data-group={group.label}>
            <div className="nav-group-head">
              <span>{group.label}</span>
            </div>
            <div className="nav-group-items">
              {group.items.map((item) => {
                const isActive = item.end
                  ? location.pathname === item.route
                  : location.pathname.startsWith(item.route);

                return (
                  <NavLink
                    key={item.route}
                    to={item.route}
                    className={`nav-item ${isActive ? 'is-active' : ''}`}
                    title={item.label}
                  >
                    <span className="nav-icon">
                      <Icon name={item.icon} size={16} />
                    </span>
                    <span className="nav-item-label">{item.label}</span>
                    {item.live ? (
                      <span className="nav-trailing">
                        <span className="live-dot" aria-hidden="true" />
                      </span>
                    ) : null}
                    {item.count ? (
                      <span className="nav-trailing">
                        <span className="nav-count">{item.count}</span>
                      </span>
                    ) : null}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="sidebar-foot">
        <button
          ref={userCardRef}
          type="button"
          className="user-card"
          aria-haspopup="menu"
          aria-expanded={userMenuOpen}
          onClick={() => setUserMenuOpen((v) => !v)}
          title="Account menu"
        >
          <span className="avatar" aria-hidden="true">
            {initials}
          </span>
          <span className="user-meta">
            <span className="user-name">{user?.name || 'Account'}</span>
            <span className="user-mail">{user?.email || 'admin@webpulse.io'}</span>
          </span>
          <span aria-hidden="true" style={{ color: 'var(--muted-foreground)' }} className="nav-trailing">
            <Icon name="more" size={16} />
          </span>
        </button>

        <Popover
          open={userMenuOpen}
          onClose={() => setUserMenuOpen(false)}
          anchorEl={userCardRef.current}
          align="left"
          className="w-60"
        >
          <MenuLabel>{user?.email || 'User Account'}</MenuLabel>
          <MenuItem
            icon="user"
            onClick={() => {
              setUserMenuOpen(false);
              navigate('/dashboard/settings');
            }}
          >
            Account settings
          </MenuItem>
          <MenuItem
            icon="card"
            onClick={() => {
              setUserMenuOpen(false);
              navigate('/dashboard/billing');
            }}
          >
            Billing
          </MenuItem>
          <MenuItem
            icon="book"
            onClick={() => {
              setUserMenuOpen(false);
              navigate('/docs');
            }}
          >
            Help & docs
          </MenuItem>
          <MenuSep />
          <MenuItem
            icon={theme === 'dark' ? 'sun' : 'moon'}
            onClick={() => {
              toggleTheme();
              setUserMenuOpen(false);
            }}
          >
            {theme === 'dark' ? 'Light appearance' : 'Dark appearance'}
          </MenuItem>
          <MenuItem
            icon="logout"
            danger
            onClick={() => {
              setUserMenuOpen(false);
              onLogout?.();
            }}
          >
            Sign out
          </MenuItem>
        </Popover>
      </div>
    </aside>
  );
}
