import React from 'react';

export default function ProjectTabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'analytics', label: 'Project Analytics' },
    { id: 'integration', label: 'Integration' },
    { id: 'settings', label: 'Settings' }
  ];

  return (
    <div className="flex gap-6 mb-8 border-b border-slate-200 dark:border-slate-800/50">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`py-2 text-sm font-medium transition-all border-b-2 -mb-[1px] ${
            activeTab === tab.id
              ? 'text-blue-600 dark:text-white border-blue-500'
              : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
