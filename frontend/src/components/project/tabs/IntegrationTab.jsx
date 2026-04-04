import { Link } from 'react-router-dom';
import {
  Code2, Database, ExternalLink, Shield, AlertTriangle, Settings, Plus, Trash2,
  CheckCircle, Loader2, Hash, Globe, ChevronRight, Binary, Cpu, BookOpen
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
    <div className="space-y-6 pb-20">
      {/* Integration Panel */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">Integration Snippets</h2>
            <p className="text-sm text-slate-400">Choose your platform and copy the tracking code to your website.</p>
          </div>
          <Link 
            to="/api" 
            className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors px-4 py-2 rounded-lg bg-blue-500/5 border border-blue-500/10 shrink-0"
          >
            <BookOpen className="h-4 w-4" />
            Full API Reference
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { id: 'frontend', type: 'vanilla', icon: <Globe className="h-5 w-5" />, title: 'Frontend', desc: 'React, Vue, SPAs & Static', activeTypes: ['vanilla', 'vanilla-count', 'react', 'react-footer', 'vue'] },
            { id: 'backend', type: 'node', icon: <Binary className="h-5 w-5" />, title: 'Backend', desc: 'Server-side API hit-tracking', activeTypes: ['node', 'php', 'python'] },
            { id: 'curl', type: 'curl', icon: <Cpu className="h-5 w-5" />, title: 'Direct Endpoints', desc: 'Headless & raw API calls', activeTypes: ['curl'] }
          ].map((platform) => (
            <button
              key={platform.id}
              onClick={() => setSnippetType(platform.type)}
              className={`p-4 rounded-xl border transition-colors text-left flex items-start gap-4 ${platform.activeTypes.includes(snippetType) ? 'bg-blue-600/10 border-blue-500/30' : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'}`}
            >
              <div className={`p-2 rounded-lg ${platform.activeTypes.includes(snippetType) ? 'text-blue-500 bg-blue-500/10' : 'text-slate-400 bg-slate-800'}`}>
                {platform.icon}
              </div>
              <div>
                <h3 className={`text-sm font-medium mb-0.5 ${platform.activeTypes.includes(snippetType) ? 'text-white' : 'text-slate-300'}`}>{platform.title}</h3>
                <p className="text-xs text-slate-500">{platform.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Endpoint Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pt-8 border-t border-slate-800">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">Tracking API (POST)</label>
            <div className="flex items-center justify-between gap-4 p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <code className="text-xs text-emerald-400 font-mono truncate text-left">{trackingUrl.replace(/\/track\/[^\/]+$/, '/track/events')}</code>
              <CopyButton text={trackingUrl.replace(/\/track\/[^\/]+$/, '/track/events')} size="sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">Analytics API (GET)</label>
            <div className="flex items-center justify-between gap-4 p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <code className="text-xs text-blue-400 font-mono truncate text-left">{trackingUrl.replace(/\/track\/[^\/]+$/, '/analytics/count')}</code>
              <CopyButton text={trackingUrl.replace(/\/track\/[^\/]+$/, '/analytics/count')} size="sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">Standard Script URL</label>
            <div className="flex items-center justify-between gap-4 p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <code className="text-xs text-amber-400 font-mono truncate text-left">{trackingUrl.replace(/\/track\/[^\/]+$/, '/track/script.js')}</code>
              <CopyButton text={trackingUrl.replace(/\/track\/[^\/]+$/, '/track/script.js')} size="sm" />
            </div>
          </div>
        </div>

        {/* Framework Selectors */}
        <div className="flex flex-wrap items-center gap-2 mb-6 border-t border-slate-800 pt-8">
          {['vanilla', 'vanilla-count', 'react', 'react-footer', 'vue'].includes(snippetType) ? (
            <>
              {[
                { id: 'vanilla', label: 'Vanilla JS' },
                { id: 'vanilla-count', label: 'Live Counter' },
                { id: 'react', label: 'React Hooks' },
                { id: 'react-footer', label: 'Counter Footer' },
                { id: 'vue', label: 'Vue.js' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSnippetType(opt.id)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${snippetType === opt.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'}`}
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
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${snippetType === opt.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                >
                  {opt.label}
                </button>
              ))}
            </>
          ) : (
            <span className="text-sm font-medium text-slate-300 px-4 py-2">Direct API Endpoints</span>
          )}
        </div>

        {/* Snippet Block */}
        <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80">
            <span className="text-xs text-slate-400 font-mono">
              {snippetLanguage} snippet
            </span>
            <CopyButton text={activeSnippet} label="Copy" size="sm" />
          </div>

          <SyntaxHighlighter
            language={snippetLanguage}
            style={atomDark}
            customStyle={{
              margin: 0,
              padding: '1.5rem',
              backgroundColor: 'transparent',
              fontSize: '13px',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              lineHeight: '1.5',
              maxHeight: '500px'
            }}
            wrapLongLines={true}
          >
            {activeSnippet}
          </SyntaxHighlighter>
        </div>
      </div>

      {/* Security Engine */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">Allowed Origins</h2>
            <p className="text-sm text-slate-400">Restrict telemetry tracking to specific domains.</p>
          </div>

          {!editingSecurity && (
            <button
              onClick={() => setEditingSecurity(true)}
              className="px-4 py-2 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Edit Origins
            </button>
          )}
        </div>

        <div className="space-y-4 max-w-2xl">
          {allowedOrigins.map((origin, index) => (
            <div key={index} className="flex gap-4">
              <input
                type="text"
                value={origin}
                disabled={!editingSecurity}
                onChange={(e) => {
                  const newOrigins = [...allowedOrigins];
                  newOrigins[index] = e.target.value;
                  setAllowedOrigins(newOrigins);
                }}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm font-mono text-slate-200 focus:outline-none focus:border-blue-500 disabled:opacity-60 transition-colors"
                placeholder="https://example.com"
              />
              {editingSecurity && (
                <button
                  onClick={() => {
                    const newOrigins = allowedOrigins.filter((_, i) => i !== index);
                    setAllowedOrigins(newOrigins);
                  }}
                  className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}

          {editingSecurity && (
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-slate-800">
              <button
                onClick={() => setAllowedOrigins([...allowedOrigins, ''])}
                disabled={allowedOrigins.length >= (usageStats?.allowedOriginsLimit || 1)}
                className="px-4 py-2 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add Domain
              </button>
              <button
                onClick={onSaveSecurity}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save Configuration
              </button>
            </div>
          )}

          {allowedOrigins.length >= (usageStats?.allowedOriginsLimit || 1) && (
            <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mt-4">
              <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
              <p className="text-sm text-yellow-500">
                Limit reached: Your {usageStats?.plan || 'current'} plan allows a maximum of {usageStats?.allowedOriginsLimit || 1} allowed domains.
              </p>
            </div>
          )}

          <div className="mt-8 flex items-center gap-3 p-4 bg-slate-950/50 border border-slate-800 rounded-lg">
             {allowedOrigins.some(o => o.trim() !== '') ? (
               <CheckCircle className="h-5 w-5 text-green-500" />
             ) : (
               <AlertTriangle className="h-5 w-5 text-yellow-500" />
             )}
             <p className="text-sm text-slate-300">
               {allowedOrigins.some(o => o.trim() !== '')
                 ? "Security active. Tracking is restricted to your specified domains."
                 : "No origins restricted. Tracking will accept requests from any domain."}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
