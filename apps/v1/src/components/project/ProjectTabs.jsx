import React from 'react';

export default function ProjectTabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'integration', label: 'Integration' },
    { id: 'settings', label: 'Settings' }
  ];

  return (
    <div className="inline-flex items-center p-0.5 rounded-md border border-[var(--wp-border-default)] bg-[var(--wp-bg-surface)] text-xs mb-1">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`h-6 px-3 rounded text-[11px] font-mono transition-colors focus:outline-none ${
              isActive
                ? 'bg-[var(--wp-bg-active)] text-[var(--wp-text-primary)] font-medium'
                : 'text-[var(--wp-text-secondary)] hover:text-[var(--wp-text-primary)]'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
