import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon';
import { useTheme } from '../../context/ThemeContext';
import { useProject } from '../../context/ProjectContext';
import { useToast } from '../../context/ToastContext';

export default function CommandPalette({ open, onClose, onToggleNav, onMarkAllRead }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { currentProject, openAddProject, openInstallSnippet } = useProject();
  const { showToast } = useToast();

  const allCommands = useMemo(
    () => [
      { label: 'Dashboard', group: 'Go to', icon: 'dashboard', run: () => navigate('/dashboard') },
      { label: 'Visitors', group: 'Go to', icon: 'users', run: () => navigate('/dashboard/visitors') },
      { label: 'Sessions', group: 'Go to', icon: 'activity', run: () => navigate('/dashboard/sessions') },
      { label: 'Pages', group: 'Go to', icon: 'file', run: () => navigate('/dashboard/pages') },
      { label: 'Events', group: 'Go to', icon: 'zap', run: () => navigate('/dashboard/events') },
      { label: 'Sources', group: 'Go to', icon: 'link', run: () => navigate('/dashboard/sources') },
      { label: 'Geography', group: 'Go to', icon: 'globe', run: () => navigate('/dashboard/geography') },
      { label: 'Live Activity', group: 'Go to', icon: 'radio', run: () => navigate('/dashboard/live') },
      { label: 'Alerts', group: 'Go to', icon: 'flag', run: () => navigate('/dashboard/alerts') },
      { label: 'Projects', group: 'Go to', icon: 'folder', run: () => navigate('/dashboard/projects') },
      { label: 'API Keys', group: 'Go to', icon: 'key', run: () => navigate('/dashboard/api-key') },
      { label: 'Billing', group: 'Go to', icon: 'card', run: () => navigate('/dashboard/billing') },
      { label: 'Settings', group: 'Go to', icon: 'sliders', run: () => navigate('/dashboard/settings') },
      { label: 'Help & Docs', group: 'Go to', icon: 'book', run: () => navigate('/docs') },

      {
        label: 'Add a new project',
        group: 'Actions',
        icon: 'plus',
        run: () => openAddProject()
      },
      {
        label: 'Copy installation snippet',
        group: 'Actions',
        icon: 'code',
        run: () => {
          if (currentProject) {
            openInstallSnippet(currentProject);
          } else {
            showToast('Select a project first');
          }
        }
      },
      {
        label: 'Export current view as CSV',
        group: 'Actions',
        icon: 'download',
        run: () => showToast('Exporting analytics data as CSV...')
      },
      {
        label: 'Toggle light / dark theme',
        group: 'Preferences',
        icon: theme === 'dark' ? 'sun' : 'moon',
        run: () => {
          toggleTheme();
          showToast(`Switched to ${theme === 'dark' ? 'light' : 'dark'} mode`);
        }
      },
      {
        label: 'Toggle sidebar',
        group: 'Preferences',
        icon: 'panelLeft',
        run: () => onToggleNav?.()
      },
      {
        label: 'Mark all notifications read',
        group: 'Preferences',
        icon: 'check',
        run: () => {
          onMarkAllRead?.();
          showToast('Notifications marked as read');
        }
      }
    ],
    [navigate, theme, toggleTheme, currentProject, openAddProject, openInstallSnippet, showToast, onToggleNav, onMarkAllRead]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return allCommands;
    const q = query.toLowerCase();
    return allCommands.filter(
      (c) => c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q)
    );
  }, [allCommands, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (open) onClose();
        else {
          // Open handled by parent or state
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSelect = (idx) => {
    const cmd = filtered[idx];
    if (!cmd) return;
    onClose();
    cmd.run();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(filtered.length - 1, prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(selectedIndex);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return createPortal(
    <>
      <div className="scrim" onClick={onClose} />
      <div className="overlay-center" role="presentation">
        <div
          className="command"
          role="dialog"
          aria-modal="true"
          aria-label="Command menu"
        >
          <div className="command-input-row">
            <Icon name="search" size={16} />
            <input
              ref={inputRef}
              className="command-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search pages, actions, and preferences…"
              autoComplete="off"
              role="combobox"
              aria-expanded="true"
              aria-controls="command-list"
            />
            <span className="kbd">Esc</span>
          </div>

          <div className="command-list" id="command-list" ref={listRef} role="listbox">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No matching actions or pages for &ldquo;{query}&rdquo;
              </div>
            ) : (
              filtered.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={item.label + idx}
                    type="button"
                    className="command-item"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(idx)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <Icon name={item.icon} size={15} />
                    <span className="command-item-label">{item.label}</span>
                    <span className="menu-meta">{item.group}</span>
                  </button>
                );
              })
            )}
          </div>

          <div className="command-foot">
            <span className="command-hint">
              <span className="kbd">↑</span>
              <span className="kbd">↓</span> to navigate
            </span>
            <span className="command-hint">
              <span className="kbd">↵</span> to select
            </span>
            <span className="command-hint">
              <span className="kbd">Esc</span> to close
            </span>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
