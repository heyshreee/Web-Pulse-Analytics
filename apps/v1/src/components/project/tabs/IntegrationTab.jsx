import { Link } from 'react-router-dom';
import {
  AlertTriangle, Settings, Plus, Trash2,
  CheckCircle, Loader2, Globe, Binary, Cpu, BookOpen
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import CopyButton from '../../CopyButton';

export default function IntegrationTab({
  snippetType, setSnippetType, activeSnippet, snippetLanguage,
  trackingUrl,
  allowedOrigins, setAllowedOrigins, editingSecurity, setEditingSecurity,
  saving, usageStats, onSaveSecurity
}) {
  return (
    <div className="space-y-3 font-sans">
      {/* Integration Panel */}
      <div className="wp-panel p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-sm font-medium text-ink mb-1">Integration Snippets</h2>
            <p className="text-xs text-ink-muted">Select your platform stack and embed telemetry tracking into your application.</p>
          </div>
          <Link
            to="/api"
            className="btn-secondary h-7 px-3 text-xs self-start sm:self-auto inline-flex items-center gap-1.5"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Full API Reference
          </Link>
        </div>

        {/* Platform Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {[
            { id: 'frontend', type: 'vanilla', icon: <Globe className="h-4 w-4" />, title: 'Frontend', desc: 'React, Vue, SPAs & Static', activeTypes: ['vanilla', 'vanilla-count', 'react', 'react-footer', 'vue'] },
            { id: 'backend', type: 'node', icon: <Binary className="h-4 w-4" />, title: 'Backend', desc: 'Server-side API hit-tracking', activeTypes: ['node', 'php', 'python'] },
            { id: 'curl', type: 'curl', icon: <Cpu className="h-4 w-4" />, title: 'Direct Endpoints', desc: 'Headless & raw API calls', activeTypes: ['curl'] }
          ].map((platform) => {
            const isSelected = platform.activeTypes.includes(snippetType);
            return (
              <button
                key={platform.id}
                onClick={() => setSnippetType(platform.type)}
                className={`p-3.5 rounded-lg border text-left flex items-start gap-3 transition-colors ${
                  isSelected
                    ? 'border-ink bg-surface text-ink ring-1 ring-ink/20'
                    : 'border-line bg-surface hover:bg-hover text-ink-secondary'
                }`}
              >
                <div className={`p-1.5 rounded border ${isSelected ? 'border-line bg-subtle text-ink' : 'border-line bg-surface text-ink-muted'}`}>
                  {platform.icon}
                </div>
                <div>
                  <h3 className={`text-xs font-medium mb-0.5 ${isSelected ? 'text-ink' : 'text-ink-secondary'}`}>{platform.title}</h3>
                  <p className="text-[11px] text-ink-muted">{platform.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Endpoint Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 pt-5 border-t border-line">
          <div>
            <label className="block text-[11px] font-mono text-ink-muted mb-1.5">Tracking API (POST)</label>
            <div className="flex items-center justify-between gap-2 p-2 bg-subtle border border-line rounded">
              <code className="text-xs text-ink font-mono truncate text-left">{trackingUrl.replace(/\/track\/[^/]+$/, '/track/events')}</code>
              <CopyButton text={trackingUrl.replace(/\/track\/[^/]+$/, '/track/events')} size="sm" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-mono text-ink-muted mb-1.5">Analytics API (GET)</label>
            <div className="flex items-center justify-between gap-2 p-2 bg-subtle border border-line rounded">
              <code className="text-xs text-ink font-mono truncate text-left">{trackingUrl.replace(/\/track\/[^/]+$/, '/analytics/count')}</code>
              <CopyButton text={trackingUrl.replace(/\/track\/[^/]+$/, '/analytics/count')} size="sm" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-mono text-ink-muted mb-1.5">Standard script URL</label>
            <div className="flex items-center justify-between gap-2 p-2 bg-subtle border border-line rounded">
              <code className="text-xs text-ink font-mono truncate text-left">{trackingUrl.replace(/\/track\/[^/]+$/, '/track/script.js')}</code>
              <CopyButton text={trackingUrl.replace(/\/track\/[^/]+$/, '/track/script.js')} size="sm" />
            </div>
          </div>
        </div>

        {/* Framework Selectors */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4 border-t border-line pt-5">
          {['vanilla', 'vanilla-count', 'react', 'react-footer', 'vue'].includes(snippetType) ? (
            <>
              {[
                { id: 'vanilla', label: 'Vanilla JS' },
                { id: 'vanilla-count', label: 'Live counter' },
                { id: 'react', label: 'React hooks' },
                { id: 'react-footer', label: 'Counter footer' },
                { id: 'vue', label: 'Vue.js' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSnippetType(opt.id)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                    snippetType === opt.id
                      ? 'bg-ink text-canvas font-semibold'
                      : 'border border-line bg-surface text-ink-secondary hover:text-ink hover:bg-hover'
                  }`}
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
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                    snippetType === opt.id
                      ? 'bg-ink text-canvas font-semibold'
                      : 'border border-line bg-surface text-ink-secondary hover:text-ink hover:bg-hover'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </>
          ) : (
            <span className="text-xs font-mono text-ink-muted">Direct API Endpoints</span>
          )}
        </div>

        {/* Snippet Block */}
        <div className="rounded-lg overflow-hidden border border-line bg-black">
          <div className="flex items-center justify-between px-3.5 py-2 border-b border-line bg-surface">
            <span className="text-[10px] font-medium text-ink-muted font-mono uppercase tracking-widest">
              {snippetLanguage} snippet
            </span>
            <CopyButton text={activeSnippet} label="Copy" size="sm" />
          </div>

          <SyntaxHighlighter
            language={snippetLanguage}
            style={atomDark}
            customStyle={{
              margin: 0,
              padding: '1.25rem',
              backgroundColor: '#000000',
              fontSize: '12px',
              fontFamily: 'Geist Mono, monospace',
              lineHeight: '1.5',
              maxHeight: '450px'
            }}
            wrapLongLines={true}
          >
            {activeSnippet}
          </SyntaxHighlighter>
        </div>
      </div>

      {/* Security Engine */}
      <div className="wp-panel p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-sm font-medium text-ink mb-1">Allowed Origins</h2>
            <p className="text-xs text-ink-muted">Restrict telemetry tracking to specific verified domains.</p>
          </div>

          {!editingSecurity && (
            <button
              onClick={() => setEditingSecurity(true)}
              className="btn-secondary h-7 px-3 text-xs self-start sm:self-auto inline-flex items-center gap-1.5"
            >
              <Settings className="h-3.5 w-3.5" />
              Edit Origins
            </button>
          )}
        </div>

        <div className="space-y-3 max-w-2xl">
          {allowedOrigins.map((origin, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={origin}
                disabled={!editingSecurity}
                onChange={(e) => {
                  const newOrigins = [...allowedOrigins];
                  newOrigins[index] = e.target.value;
                  setAllowedOrigins(newOrigins);
                }}
                className="input font-mono text-xs h-8 flex-1"
                placeholder="https://example.com"
              />
              {editingSecurity && (
                <button
                  onClick={() => {
                    const newOrigins = allowedOrigins.filter((_, i) => i !== index);
                    setAllowedOrigins(newOrigins);
                  }}
                  className="p-1.5 text-ink-muted hover:text-red-500 rounded transition-colors self-center"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}

          {editingSecurity && (
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-4 border-t border-line">
              <button
                onClick={() => setAllowedOrigins([...allowedOrigins, ''])}
                disabled={allowedOrigins.length >= (usageStats?.allowedOriginsLimit || 1)}
                className="btn-secondary h-7 px-3 text-xs inline-flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Domain
              </button>
              <button
                onClick={onSaveSecurity}
                disabled={saving}
                className="btn-primary h-7 px-3 text-xs inline-flex items-center gap-1.5"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Save Configuration
              </button>
            </div>
          )}

          {allowedOrigins.length >= (usageStats?.allowedOriginsLimit || 1) && (
            <div className="flex items-center gap-2 p-3 bg-subtle border border-line rounded text-xs text-ink-secondary">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
              <p>
                Limit reached: Your {usageStats?.plan || 'current'} plan allows a maximum of {usageStats?.allowedOriginsLimit || 1} allowed domains.
              </p>
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 p-3 bg-subtle border border-line rounded text-xs text-ink-secondary">
            {allowedOrigins.some(o => o.trim() !== '') ? (
              <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
            )}
            <p>
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
