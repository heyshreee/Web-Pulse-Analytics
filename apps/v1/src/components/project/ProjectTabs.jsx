import React from 'react';

export default function ProjectTabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'integration', label: 'Integration' },
    { id: 'settings', label: 'Settings' }
  ];

  return (
    <div className="flex gap-6 border-b border-line mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`pb-2.5 text-xs sm:text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
            activeTab === tab.id
              ? 'text-ink border-ink'
              : 'text-ink-secondary border-transparent hover:text-ink hover:border-line'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
