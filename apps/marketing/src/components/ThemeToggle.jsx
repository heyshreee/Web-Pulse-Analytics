import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = "" }) {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 group ${className}`}
            aria-label="Toggle Theme"
        >
            {theme === 'dark' ? (
                <Sun className="h-[18px] w-[18px] text-slate-300 group-hover:text-amber-400 transition-colors" />
            ) : (
                <Moon className="h-[18px] w-[18px] text-slate-500 group-hover:text-slate-800 transition-colors" />
            )}
        </button>
    );
}
