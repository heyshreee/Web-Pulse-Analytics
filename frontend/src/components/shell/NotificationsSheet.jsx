import { useState, useEffect, useMemo, useCallback } from 'react';
import { Sheet } from '../ui/Overlay';
import Icon from '../ui/Icon';
import { apiRequest } from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'security', label: 'Security' },
  { id: 'billing', label: 'Billing' },
  { id: 'system', label: 'System' }
];

const ICONS = {
  analytics: 'trend',
  security: 'shield',
  billing: 'card',
  system: 'info'
};

export default function NotificationsSheet({ open, onClose, onCountChange }) {
  const [tab, setTab] = useState('all');
  const [notifications, setNotifications] = useState([
    {
      id: 'n1',
      cat: 'analytics',
      title: 'Traffic spike detected',
      body: 'Visitors increased by +142% over the last 2 hours.',
      time: '12m ago',
      unread: true
    },
    {
      id: 'n2',
      cat: 'security',
      title: 'Origin verified',
      body: 'https://example.com was verified and added to tracking list.',
      time: '1h ago',
      unread: true
    },
    {
      id: 'n3',
      cat: 'billing',
      title: 'Monthly allowance reminder',
      body: 'You have used 18% of your included events this month.',
      time: '2h ago',
      unread: true
    },
    {
      id: 'n4',
      cat: 'system',
      title: 'Script updated',
      body: 'WebPulse tracking snippet version 2.4 is active.',
      time: '1d ago',
      unread: false
    }
  ]);

  const { showToast } = useToast();

  const loadNotifications = useCallback(async () => {
    try {
      const data = await apiRequest('/notifications');
      if (Array.isArray(data) && data.length > 0) {
        const formatted = data.map((n) => ({
          id: n.id,
          cat: n.type || 'system',
          title: n.title,
          body: n.message || n.body,
          time: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unread: !n.is_read
        }));
        setNotifications(formatted);
      }
    } catch {
      // keep fallback
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = useMemo(() => notifications.filter((n) => n.unread).length, [notifications]);

  useEffect(() => {
    onCountChange?.(unreadCount);
  }, [unreadCount, onCountChange]);

  const filtered = useMemo(() => {
    if (tab === 'all') return notifications;
    return notifications.filter((n) => n.cat === tab);
  }, [notifications, tab]);

  const markAllRead = async () => {
    try {
      await apiRequest('/notifications/read-all', { method: 'PUT' });
    } catch {
      // ignore
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    showToast('All notifications marked as read');
  };

  const markOneRead = async (id) => {
    try {
      await apiRequest(`/notifications/${id}/read`, { method: 'PUT' });
    } catch {
      // ignore
    }
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Notifications"
      description={`${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`}
      footer={
        <div className="flex w-full items-center justify-between">
          <button type="button" className="btn btn--ghost btn--sm" onClick={markAllRead}>
            Mark all read
          </button>
          <button type="button" className="btn btn--sm" onClick={onClose}>
            Close
          </button>
        </div>
      }
    >
      <div className="tabs mb-4" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className="tab"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground text-sm">
          No notifications in this category.
        </div>
      ) : (
        <div className="notif-list">
          {filtered.map((n) => (
            <button
              key={n.id}
              type="button"
              className={`notif-item text-left w-full ${n.unread ? 'is-unread' : ''}`}
              onClick={() => markOneRead(n.id)}
            >
              <span className={`notif-icon notif-icon--${n.cat}`} aria-hidden="true">
                <Icon name={ICONS[n.cat] || 'info'} size={15} />
              </span>
              <span className="notif-text flex-1">
                <span className="notif-title block">{n.title}</span>
                <span className="notif-body block text-xs">{n.body}</span>
              </span>
              <span className="notif-time text-xs">{n.time}</span>
              {n.unread ? <span className="unread-dot" aria-label="Unread" /> : null}
            </button>
          ))}
        </div>
      )}
    </Sheet>
  );
}
