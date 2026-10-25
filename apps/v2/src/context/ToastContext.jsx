import { createContext, useContext, useState, useCallback, useRef } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext();

let seq = 0;

export function ToastProvider({ children }) {
  // Stacked toasts, matching the exported `.toast-region` region behaviour.
  const [toasts, setToasts] = useState([]);
  const [notificationSpotlight, setNotificationSpotlight] = useState(false);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (toast) => {
      seq += 1;
      const id = seq;
      const entry = { id, duration: 4000, tone: 'info', ...toast };
      setToasts((list) => [...list, entry].slice(-4));
      if (entry.duration !== Infinity) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), entry.duration),
        );
      }
      return id;
    },
    [dismiss],
  );

  /**
   * Back-compatible signature used across the app: showToast(message, type, action).
   * `type` accepts success | error | info | warning.
   */
  const showToast = useCallback(
    (message, type = 'info', action = null) =>
      push({
        title: message,
        tone: type,
        description: null,
        action,
      }),
    [push],
  );

  /** Richer variant for multi-line notifications. */
  const toast = useCallback((opts) => push(opts), [push]);

  const triggerNotificationSpotlight = useCallback((duration = 3000) => {
    setNotificationSpotlight(true);
    setTimeout(() => setNotificationSpotlight(false), duration);
  }, []);

  return (
    <ToastContext.Provider
      value={{ showToast, toast, dismiss, notificationSpotlight, triggerNotificationSpotlight }}
    >
      {children}
      {toasts.length ? (
        <div className="toast-region" role="region" aria-label="Notifications">
          {toasts.map((t) => (
            <Toast
              key={t.id}
              title={t.title}
              message={t.title}
              description={t.description}
              type={t.tone}
              tone={t.tone}
              action={t.action}
              onClose={() => dismiss(t.id)}
            />
          ))}
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}