import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const ThemeContext = createContext();

const isDashboardPath = (pathname) =>
    pathname === '/dashboard' || pathname.startsWith('/dashboard/');

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) return storedTheme;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
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
        const root = window.document.documentElement;
        const applyDark = isDashboardPath(pathname) ? theme === 'dark' : true;
        if (applyDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
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
