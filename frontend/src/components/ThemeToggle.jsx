import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = "" }) {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-all duration-300 hover:bg-slate-200 dark:hover:bg-slate-800 group ${className}`}
            aria-label="Toggle Theme"
        >
            {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-yellow-500 group-hover:rotate-45 transition-transform duration-500" />
            ) : (
                <Moon className="h-5 w-5 text-slate-700 group-hover:-rotate-12 transition-transform duration-500" />
            )}
        </button>
    );
}
