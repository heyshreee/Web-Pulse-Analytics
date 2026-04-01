import React from 'react';
import { Layout, BarChart2, Code2, Settings2 } from 'lucide-react';

export default function ProjectTabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'overview', label: 'Monitor', icon: <Layout className="h-4 w-4" /> },
    { id: 'analytics', label: 'Telemetry', icon: <BarChart2 className="h-4 w-4" /> },
    { id: 'integration', label: 'Protocol', icon: <Code2 className="h-4 w-4" /> },
    { id: 'settings', label: 'Nodes', icon: <Settings2 className="h-4 w-4" /> }
  ];

  return (
    <div className="flex flex-wrap bg-[#0C0E17] p-1.5 rounded-2xl border border-[#1E293B] mb-10 w-full md:w-fit shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-full bg-blue-600/5 blur-2xl pointer-events-none"></div>
      
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`group flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 relative ${
            activeTab === tab.id 
              ? 'bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.3)] z-10' 
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
          }`}
        >
          <div className={`${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110 group-hover:text-blue-500'} transition-all duration-300`}>
            {tab.icon}
          </div>
          <span className="relative z-10 italic">{tab.label}</span>
          
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-white/40 rounded-full blur-[1px]"></div>
          )}
        </button>
      ))}
    </div>
  );
}
