import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const ThemeContext = createContext();

const isDashboardPath = (pathname) =>
    pathname === '/dashboard' || pathname.startsWith('/dashboard/');

const applyThemeToRoot = (theme, pathname) => {
    const root = window.document.documentElement;
    const applyDark = isDashboardPath(pathname) ? theme === 'dark' : true;
    root.classList.toggle('dark', applyDark);
    root.setAttribute('data-theme', applyDark ? 'dark' : 'light');
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) return storedTheme;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = (event) => {
        const next = theme === 'dark' ? 'light' : 'dark';
        const { pathname } = window.location;

        // Theme only changes the dashboard shell; everywhere else the UI stays dark.
        const supportsViewTransition = typeof document.startViewTransition === 'function';
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!isDashboardPath(pathname) || !supportsViewTransition || reduceMotion) {
            setTheme(next);
            return;
        }

        const root = document.documentElement;
        const x = event?.clientX ?? window.innerWidth / 2;
        const y = event?.clientY ?? window.innerHeight / 2;
        root.style.setProperty('--theme-x', `${x}px`);
        root.style.setProperty('--theme-y', `${y}px`);

        const transition = document.startViewTransition(() => {
            applyThemeToRoot(next, pathname);
        });

        transition.finished.finally(() => {
            root.style.removeProperty('--theme-x');
            root.style.removeProperty('--theme-y');
        });

        setTheme(next);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const ThemeSync = () => {
    const { theme } = useTheme();
    const { pathname } = useLocation();

    useEffect(() => {
        applyThemeToRoot(theme, pathname);
    }, [theme, pathname]);

    return null;
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
