import React from 'react';

export default function ProjectTabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'integration', label: 'Integration' },
    { id: 'settings', label: 'Settings' }
  ];

  return (
    <div className="flex gap-5 border-b border-[var(--wp-border-subtle)] pb-2 mb-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`pb-1 text-xs font-mono font-medium transition-colors border-b-2 -mb-[9px] ${
            activeTab === tab.id
              ? 'text-[var(--wp-text-primary)] border-[var(--wp-text-primary)] font-semibold'
              : 'text-[var(--wp-text-secondary)] border-transparent hover:text-[var(--wp-text-primary)] hover:border-[var(--wp-border-default)]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
