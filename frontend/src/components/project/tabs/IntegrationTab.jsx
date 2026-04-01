import React from 'react';
import { 
  Code2, Database, ExternalLink, Shield, AlertTriangle, Settings, Plus, Trash2, 
  CheckCircle, Loader2, Hash, Globe, ChevronRight, Binary, Cpu
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import CopyButton from '../../CopyButton';

export default function IntegrationTab({
  snippetType, setSnippetType, activeSnippet, snippetLanguage, 
  trackingUrl, scriptUrl,
  allowedOrigins, setAllowedOrigins, editingSecurity, setEditingSecurity,
  saving, usageStats, onSaveSecurity
}) {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Integration Panel */}
      <div className="bg-[#0C0E17] border border-[#1E293B] rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-3xl rounded-full -mr-32 -mt-32"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-4 italic uppercase">
              <Code2 className="h-6 w-6 text-blue-500" />
              Protocol Dispatch
            </h2>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Initialize data synchronization across environments</p>
          </div>
          <div className="flex bg-[#06080F] p-1.5 rounded-xl border border-[#1E293B]">
            <span className="px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-blue-500 italic bg-blue-500/5 rounded-lg border border-blue-500/10">Active Cluster</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { id: 'frontend', type: 'vanilla', icon: <Globe className="h-5 w-5" />, title: 'Frontend Node', desc: 'React, Vue, SPAs & Static', activeTypes: ['vanilla', 'vanilla-count', 'react', 'react-footer', 'vue'] },
            { id: 'backend', type: 'node', icon: <Binary className="h-5 w-5" />, title: 'Backend Link', desc: 'Server-side API hit-tracking', activeTypes: ['node', 'php', 'python'] },
            { id: 'url', type: 'url', icon: <Cpu className="h-5 w-5" />, title: 'Direct Ingress', desc: 'OBS Widgets & Headless sources', activeTypes: ['url'] }
          ].map((platform) => (
            <button
              key={platform.id}
              onClick={() => setSnippetType(platform.type)}
              className={`p-6 rounded-[2rem] border transition-all duration-500 text-left relative overflow-hidden group/card ${platform.activeTypes.includes(snippetType) ? 'bg-blue-600/5 border-blue-500/40 shadow-[0_15px_40px_rgba(59,130,246,0.15)] shadow-inner' : 'bg-[#06080F]/50 border-[#1E293B] text-slate-500 hover:border-slate-700'}`}
            >
              <div className={`p-4 rounded-xl mb-6 inline-flex group-hover/card:scale-110 transition-transform shadow-lg ${platform.activeTypes.includes(snippetType) ? 'bg-blue-600 text-white shadow-blue-600/40' : 'bg-[#0B0D16] text-slate-600 border border-[#1E293B]'}`}>
                {platform.icon}
              </div>
              <h3 className={`text-sm font-black uppercase tracking-widest italic mb-2 ${platform.activeTypes.includes(snippetType) ? 'text-white' : 'text-slate-400'}`}>{platform.title}</h3>
              <p className="text-[10px] font-bold opacity-60 leading-relaxed uppercase tracking-tight">{platform.desc}</p>
              
              {platform.activeTypes.includes(snippetType) && (
                <div className="absolute top-6 right-6">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)] animate-pulse"></div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Framework Selectors */}
        <div className="bg-[#06080F]/80 border border-[#1E293B] rounded-2xl p-2 mb-12 flex flex-wrap items-center gap-2">
          {['vanilla', 'vanilla-count', 'react', 'react-footer', 'vue'].includes(snippetType) ? (
            <>
              {[
                { id: 'vanilla', label: 'Vanilla JS' },
                { id: 'vanilla-count', label: 'Vanilla + Sync' },
                { id: 'react', label: 'React Hooks' },
                { id: 'react-footer', label: 'React Badge' },
                { id: 'vue', label: 'Vue.js' }
              ].map(opt => (
                <button 
                  key={opt.id}
                  onClick={() => setSnippetType(opt.id)} 
                  className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] transition-all italic ${snippetType === opt.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-600 hover:text-slate-300 hover:bg-[#1E293B]/30'}`}
                >
                  {opt.label}
                </button>
              ))}
            </>
          ) : ['node', 'php', 'python'].includes(snippetType) ? (
            <>
              {[
                { id: 'node', label: 'Node.js / Axios' },
                { id: 'php', label: 'PHP / cURL' },
                { id: 'python', label: 'Python / Req' }
              ].map(opt => (
                <button 
                  key={opt.id}
                  onClick={() => setSnippetType(opt.id)} 
                  className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] transition-all italic ${snippetType === opt.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-600 hover:text-slate-300 hover:bg-[#1E293B]/30'}`}
                >
                  {opt.label}
                </button>
              ))}
            </>
          ) : (
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-700 px-4 py-2 italic">Direct Protocol Ingress (V2)</span>
          )}
        </div>

        {/* Snippet Block */}
        <div className="relative group/code">
          <div className="flex items-center justify-between mb-6 px-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] shadow-[0_0_8px_rgba(255,95,86,0.2)]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] shadow-[0_0_8px_rgba(255,189,46,0.2)]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] shadow-[0_0_8px_rgba(39,201,63,0.2)]"></span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-700 font-mono italic">
                {snippetLanguage}—{['node', 'php', 'python', 'react', 'react-footer', 'vue'].includes(snippetType) ? 'module' : 'legacy'}.node
              </span>
            </div>
            <CopyButton text={activeSnippet} label="Clone Source" size="sm" />
          </div>
          
          <div className="rounded-[2rem] overflow-hidden border border-[#1E293B] group-hover/code:border-blue-500/30 transition-all shadow-3xl bg-[#030612]">
            <SyntaxHighlighter
              language={snippetLanguage}
              style={atomDark}
              customStyle={{
                margin: 0,
                padding: '2.5rem',
                backgroundColor: 'transparent',
                fontSize: '12px',
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                lineHeight: '1.8',
                maxHeight: '500px'
              }}
              wrapLongLines={true}
            >
              {activeSnippet}
            </SyntaxHighlighter>
          </div>
        </div>

        {/* Global Access Points */}
        <div className="mt-12 p-8 bg-[#06080F] border border-[#1E293B] rounded-[2rem] relative overflow-hidden group/guide">
          <div className="absolute top-0 right-0 p-12 opacity-5 group-hover/guide:opacity-20 transition-all duration-1000 pointer-events-none">
            <Cpu className="h-32 w-32 text-blue-500 rotate-12" />
          </div>

          <div className="relative z-10">
            <div className="flex items-start gap-6 mb-10">
              <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/10">
                <Shield className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-2 italic">Endpoint Registry</h4>
                <p className="text-[10px] font-bold text-slate-600 leading-relaxed max-w-2xl uppercase tracking-wider">
                  {snippetType === 'url' 
                    ? 'Engineered for high-throughput headless streams. Use these endpoints for custom middleware or OBS monitoring panels.' 
                    : 'Universal telemetry nodes. These endpoints process encrypted ingress signals and synchronize them across the cluster.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-[#1E293B]/50">
              <div className="group/field relative">
                <div className="flex flex-col gap-4 p-5 bg-[#0B0D16] rounded-2xl border border-[#1E293B] hover:border-blue-500/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Hash className="h-4 w-4 text-blue-500" />
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">API Cluster</span>
                    </div>
                    <CopyButton text={trackingUrl} size="sm" />
                  </div>
                  <code className="text-[11px] text-blue-400 font-mono break-all selection:bg-blue-500/20 italic">{trackingUrl}</code>
                </div>
              </div>

              <div className="group/field relative">
                <div className="flex flex-col gap-4 p-5 bg-[#0B0D16] rounded-2xl border border-[#1E293B] hover:border-blue-500/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Binary className="h-4 w-4 text-blue-500" />
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Node Script</span>
                    </div>
                    <CopyButton text={scriptUrl} size="sm" />
                  </div>
                  <code className="text-[11px] text-blue-400 font-mono break-all selection:bg-blue-500/20 italic">{scriptUrl}</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Engine */}
      <div className="bg-[#0C0E17] border border-[#1E293B] rounded-[2.5rem] p-8 shadow-2xl overflow-hidden group">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-12">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-blue-500/10 rounded-[1.25rem] border border-blue-500/10">
              <Shield className="h-7 w-7 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight uppercase italic">Security Shield Engine</h2>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic pt-1">Domain-level authorization protocol</p>
            </div>
          </div>
          
          {!editingSecurity && (
            <button
              onClick={() => setEditingSecurity(true)}
              className="px-6 py-3 bg-[#06080F] border border-[#1E293B] text-slate-400 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all italic flex items-center gap-3 shadow-xl"
            >
              <Settings className="h-4 w-4" />
              Configure Shield
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <div className="space-y-4">
              {allowedOrigins.map((origin, index) => (
                <div key={index} className="flex gap-4 group/entry">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={origin}
                      disabled={!editingSecurity}
                      onChange={(e) => {
                        const newOrigins = [...allowedOrigins];
                        newOrigins[index] = e.target.value;
                        setAllowedOrigins(newOrigins);
                      }}
                      className="w-full bg-[#06080F] border border-[#1E293B] rounded-2xl px-6 py-4 text-xs font-bold text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 font-mono transition-all disabled:opacity-40 disabled:grayscale group-hover/entry:border-slate-700 italic"
                      placeholder="HTTPS://SOURCE.DOMAIN"
                    />
                  </div>
                  {editingSecurity && (
                    <button
                      onClick={() => {
                        const newOrigins = allowedOrigins.filter((_, i) => i !== index);
                        setAllowedOrigins(newOrigins);
                      }}
                      className="p-4 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all border border-transparent hover:border-red-500/20"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}

              {editingSecurity && (
                <div className="flex flex-col sm:flex-row items-center gap-6 mt-12 pt-10 border-t border-[#1E293B]/50">
                  <button
                    onClick={() => setAllowedOrigins([...allowedOrigins, ''])}
                    disabled={allowedOrigins.length >= (usageStats?.allowedOriginsLimit || 1)}
                    className="flex-1 w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-[#0B0D16] hover:bg-[#1E293B]/50 text-slate-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-20 border border-[#1E293B] italic"
                  >
                    <Plus className="h-4 w-4" />
                    Register Node
                  </button>
                  <button
                    onClick={onSaveSecurity}
                    disabled={saving}
                    className="flex-1 w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/30 transition-all disabled:opacity-50 italic"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                    Lock Protocol
                  </button>
                </div>
              )}

              {allowedOrigins.length >= (usageStats?.allowedOriginsLimit || 1) && (
                <div className="flex items-center gap-4 p-5 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl mt-6">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
                  <p className="text-[9px] uppercase font-black tracking-[0.15em] text-yellow-500 italic">
                    Quota Cap: {usageStats?.plan || 'restricted'} allows {usageStats?.allowedOriginsLimit || 1} node(s) max.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between p-8 bg-[#0B0D16] border border-[#1E293B] rounded-[2rem] relative overflow-hidden group/status">
            <div className="absolute top-0 right-0 p-10 opacity-0 group-hover/status:opacity-10 transition-opacity">
              <CheckCircle className="h-24 w-24 text-green-500" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                {allowedOrigins.some(o => o.trim() !== '') ? (
                  <div className="p-1.5 bg-green-500/10 rounded-lg"><CheckCircle className="h-5 w-5 text-green-500" /></div>
                ) : (
                  <div className="p-1.5 bg-yellow-500/10 rounded-lg"><AlertTriangle className="h-5 w-5 text-yellow-500" /></div>
                )}
                <h3 className="font-black text-white text-[10px] uppercase tracking-[0.2em] italic">Engine Status</h3>
              </div>
              <p className="text-[10px] text-slate-600 font-bold uppercase leading-relaxed mb-8 tracking-wider">
                {allowedOrigins.some(o => o.trim() !== '')
                  ? "Shield Active. Environment is strictly filtered. Data accepted only from authorized clusters."
                  : "Shield Open. Caution: No origin restriction. Telemetry nodes will accept signals from any source domain."}
              </p>
            </div>

            <div className="mt-auto pt-8 border-t border-[#1E293B]/50 flex items-center justify-between">
              <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest italic">Security Core v2.04</span>
              <div className="flex items-center gap-3">
                {allowedOrigins.some(o => o.trim() !== '') ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_12px_rgba(34,197,94,1)] border border-white/20" />
                    <span className="text-[10px] font-black text-green-500 tracking-[0.2em] italic uppercase">Protected</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_12px_rgba(234,179,8,1)] border border-white/20" />
                    <span className="text-[10px] font-black text-yellow-500 tracking-[0.2em] italic uppercase">Unfiltered</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
