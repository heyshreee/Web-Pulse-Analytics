import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle, Settings, Plus, Trash2,
  CheckCircle, Loader2, Globe, Binary, Cpu, BookOpen, Shield, ShieldOff, RefreshCw
} from 'lucide-react';
import { apiRequest } from '../../../utils/api';
import { useToast } from '../../../context/ToastContext';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import CopyButton from '../../CopyButton';

export default function IntegrationTab({
  snippetType, setSnippetType, activeSnippet, snippetLanguage,
  trackingUrl,
  allowedOrigins, setAllowedOrigins, editingSecurity, setEditingSecurity,
  saving, usageStats, onSaveSecurity
}) {
  const { idOrName } = useParams();
  const { showToast } = useToast();
  const [verifiedOrigins, setVerifiedOrigins] = useState([]);
  const [newOrigin, setNewOrigin] = useState('');
  const [verifyMethod, setVerifyMethod] = useState('dns_txt');
  const [originsLoading, setOriginsLoading] = useState(false);
  const [originActionId, setOriginActionId] = useState(null);

  const originLimit = usageStats?.limits?.origins_per_project ?? usageStats?.allowedOriginsLimit ?? 3;

  const loadVerifiedOrigins = useCallback(async () => {
    if (!idOrName) return;
    setOriginsLoading(true);
    try {
      const data = await apiRequest(`/projects/${encodeURIComponent(idOrName)}/origins`);
      setVerifiedOrigins(Array.isArray(data?.origins) ? data.origins : []);
    } catch {
      // ignore if project not resolved yet
    } finally {
      setOriginsLoading(false);
    }
  }, [idOrName]);

  useEffect(() => {
    loadVerifiedOrigins();
  }, [loadVerifiedOrigins]);

  const handleAddVerifiedOrigin = async (e) => {
    e.preventDefault();
    if (!newOrigin.trim() || !idOrName) return;
    setOriginActionId('add');
    try {
      await apiRequest(`/projects/${encodeURIComponent(idOrName)}/origins`, {
        method: 'POST',
        body: JSON.stringify({ origin: newOrigin.trim(), verification_method: verifyMethod })
      });
      setNewOrigin('');
      showToast('Origin registered. Complete DNS TXT or file verification.', 'success');
      await loadVerifiedOrigins();
    } catch (err) {
      showToast(err.message || 'Failed to add origin', 'error');
    } finally {
      setOriginActionId(null);
    }
  };

  const handleVerifyOrigin = async (originId, method) => {
    setOriginActionId(originId);
    try {
      await apiRequest(`/projects/${encodeURIComponent(idOrName)}/origins/${originId}/verify`, {
        method: 'POST',
        body: JSON.stringify({ method })
      });
      showToast('Origin verified successfully!', 'success');
      await loadVerifiedOrigins();
    } catch (err) {
      showToast(err.message || 'Verification failed', 'error');
    } finally {
      setOriginActionId(null);
    }
  };

  const handleToggleBlockOrigin = async (originId, blocked) => {
    setOriginActionId(originId);
    try {
      await apiRequest(`/projects/${encodeURIComponent(idOrName)}/origins/${originId}/block`, {
        method: 'PATCH',
        body: JSON.stringify({ blocked })
      });
      showToast(blocked ? 'Origin blocked' : 'Origin unblocked', 'success');
      await loadVerifiedOrigins();
    } catch (err) {
      showToast(err.message || 'Failed to update origin', 'error');
    } finally {
      setOriginActionId(null);
    }
  };

  const handleDeleteVerifiedOrigin = async (originId) => {
    setOriginActionId(originId);
    try {
      await apiRequest(`/projects/${encodeURIComponent(idOrName)}/origins/${originId}`, {
        method: 'DELETE'
      });
      showToast('Origin removed', 'success');
      await loadVerifiedOrigins();
    } catch (err) {
      showToast(err.message || 'Failed to remove origin', 'error');
    } finally {
      setOriginActionId(null);
    }
  };
  return (
    <div className="space-y-3 font-sans">
      {/* Integration Panel */}
      <div className="wp-panel p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="wp-title-card text-sm mb-0.5">Integration Snippets</h2>
            <p className="text-[11.5px] text-[var(--wp-text-muted)]">Select your platform stack and embed telemetry tracking into your application.</p>
          </div>
          <Link
            to="/api"
            className="wp-btn wp-btn-secondary h-7 px-2.5 text-xs self-start sm:self-auto inline-flex items-center gap-1.5"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Full API Reference
          </Link>
        </div>

        {/* Platform Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          {[
            { id: 'frontend', type: 'vanilla', icon: <Globe className="h-4 w-4" />, title: 'Frontend', desc: 'React, Vue, SPAs & Static', activeTypes: ['vanilla', 'vanilla-count', 'react', 'react-footer', 'vue'] },
            { id: 'backend', type: 'node', icon: <Binary className="h-4 w-4" />, title: 'Backend', desc: 'Server-side API hit-tracking', activeTypes: ['node', 'php', 'python'] },
            { id: 'curl', type: 'curl', icon: <Cpu className="h-4 w-4" />, title: 'Direct Endpoints', desc: 'Headless & raw API calls', activeTypes: ['curl'] }
          ].map((platform) => {
            const isSelected = platform.activeTypes.includes(snippetType);
            return (
              <button
                key={platform.id}
                type="button"
                onClick={() => setSnippetType(platform.type)}
                className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition-colors ${
                  isSelected
                    ? 'border-[var(--wp-border-strong)] bg-[var(--wp-bg-active)]'
                    : 'border-[var(--wp-border-default)] bg-[var(--wp-bg-surface)] hover:border-[var(--wp-border-strong)] hover:bg-[var(--wp-bg-hover)]'
                }`}
              >
                <div className={`p-1.5 rounded border ${isSelected ? 'border-[var(--wp-border-strong)] bg-[var(--wp-bg-surface)] text-[var(--wp-text-primary)]' : 'border-[var(--wp-border-subtle)] bg-[var(--wp-bg-subtle)] text-[var(--wp-text-muted)]'}`}>
                  {platform.icon}
                </div>
                <div>
                  <h3 className="wp-title-card text-xs mb-0.5">{platform.title}</h3>
                  <p className="text-[11px] font-mono text-[var(--wp-text-muted)]">{platform.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Endpoint Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5 pt-4 border-t border-[var(--wp-border-subtle)]">
          <div>
            <label className="wp-label-section uppercase block mb-1">Tracking API (POST)</label>
            <div className="flex items-center justify-between gap-2 p-2 bg-[var(--wp-bg-subtle)] border border-[var(--wp-border-default)] rounded">
              <code className="text-xs text-[var(--wp-text-primary)] font-mono truncate text-left">{trackingUrl.replace(/\/track\/[^/]+$/, '/track/events')}</code>
              <CopyButton text={trackingUrl.replace(/\/track\/[^/]+$/, '/track/events')} size="sm" />
            </div>
          </div>
          <div>
            <label className="wp-label-section uppercase block mb-1">Analytics API (GET)</label>
            <div className="flex items-center justify-between gap-2 p-2 bg-[var(--wp-bg-subtle)] border border-[var(--wp-border-default)] rounded">
              <code className="text-xs text-[var(--wp-text-primary)] font-mono truncate text-left">{trackingUrl.replace(/\/track\/[^/]+$/, '/analytics/count')}</code>
              <CopyButton text={trackingUrl.replace(/\/track\/[^/]+$/, '/analytics/count')} size="sm" />
            </div>
          </div>
          <div>
            <label className="wp-label-section uppercase block mb-1">Standard script URL</label>
            <div className="flex items-center justify-between gap-2 p-2 bg-[var(--wp-bg-subtle)] border border-[var(--wp-border-default)] rounded">
              <code className="text-xs text-[var(--wp-text-primary)] font-mono truncate text-left">{trackingUrl.replace(/\/track\/[^/]+$/, '/track/script.js')}</code>
              <CopyButton text={trackingUrl.replace(/\/track\/[^/]+$/, '/track/script.js')} size="sm" />
            </div>
          </div>
        </div>

        {/* Framework Selectors */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3.5 border-t border-[var(--wp-border-subtle)] pt-4">
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
                  type="button"
                  onClick={() => setSnippetType(opt.id)}
                  className={`h-6 px-2.5 rounded text-[11px] font-mono transition-colors ${
                    snippetType === opt.id
                      ? 'bg-[var(--wp-bg-active)] text-[var(--wp-text-primary)] font-medium border border-[var(--wp-border-strong)]'
                      : 'border border-[var(--wp-border-subtle)] bg-[var(--wp-bg-surface)] text-[var(--wp-text-secondary)] hover:text-[var(--wp-text-primary)] hover:bg-[var(--wp-bg-hover)]'
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
                  type="button"
                  onClick={() => setSnippetType(opt.id)}
                  className={`h-6 px-2.5 rounded text-[11px] font-mono transition-colors ${
                    snippetType === opt.id
                      ? 'bg-[var(--wp-bg-active)] text-[var(--wp-text-primary)] font-medium border border-[var(--wp-border-strong)]'
                      : 'border border-[var(--wp-border-subtle)] bg-[var(--wp-bg-surface)] text-[var(--wp-text-secondary)] hover:text-[var(--wp-text-primary)] hover:bg-[var(--wp-bg-hover)]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </>
          ) : (
            <span className="text-xs font-mono text-[var(--wp-text-muted)]">Direct API Endpoints</span>
          )}
        </div>

        {/* Snippet Block */}
        <div className="rounded-md overflow-hidden border border-[var(--wp-border-default)] bg-[var(--wp-bg-canvas)]">
          <div className="wp-panel-header">
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
                : "No origins restricted. Configure verified origins below for strict ingestion protection."}
            </p>
          </div>
        </div>
      </div>

      {/* Verified Origins Management (DNS TXT & File Verification) */}
      <div className="wp-panel p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-medium text-ink mb-1">
              Verified Origins ({verifiedOrigins.length} / {originLimit})
            </h2>
            <p className="text-xs text-ink-muted">
              Only exact, verified origins can ingest events. Subdomains are not automatically trusted.
            </p>
          </div>
          <button
            type="button"
            onClick={loadVerifiedOrigins}
            disabled={originsLoading}
            className="btn-secondary h-7 px-2.5 text-xs inline-flex items-center gap-1.5 self-start"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${originsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <form onSubmit={handleAddVerifiedOrigin} className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            type="url"
            value={newOrigin}
            onChange={(e) => setNewOrigin(e.target.value)}
            placeholder="https://example.com"
            disabled={verifiedOrigins.length >= originLimit}
            className="input font-mono text-xs h-8 flex-1"
            required
          />
          <select
            value={verifyMethod}
            onChange={(e) => setVerifyMethod(e.target.value)}
            className="input font-mono text-xs h-8 sm:w-36"
          >
            <option value="dns_txt">DNS TXT</option>
            <option value="file">Verification File</option>
          </select>
          <button
            type="submit"
            disabled={originActionId === 'add' || verifiedOrigins.length >= originLimit}
            className="btn-primary h-8 px-3 text-xs inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            {originActionId === 'add' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Add Origin
          </button>
        </form>

        <div className="space-y-2.5">
          {verifiedOrigins.map((item) => (
            <div key={item.id} className="p-3 rounded border border-line bg-subtle space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-ink font-medium">{item.origin}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] uppercase border ${
                      item.status === 'verified'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : item.status === 'blocked'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => handleVerifyOrigin(item.id, item.verification_method || 'dns_txt')}
                      disabled={originActionId === item.id}
                      className="btn-primary h-6 px-2 text-[11px]"
                    >
                      {originActionId === item.id ? 'Verifying…' : 'Verify'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleToggleBlockOrigin(item.id, item.status !== 'blocked')}
                    disabled={originActionId === item.id}
                    className="btn-secondary h-6 px-2 text-[11px] inline-flex items-center gap-1"
                  >
                    {item.status === 'blocked' ? <Shield className="h-3 w-3" /> : <ShieldOff className="h-3 w-3" />}
                    {item.status === 'blocked' ? 'Unblock' : 'Block'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteVerifiedOrigin(item.id)}
                    disabled={originActionId === item.id}
                    className="p-1 text-ink-muted hover:text-rose-400"
                    title="Remove origin"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              {item.status === 'pending' && item.verification_token && (
                <div className="text-[11px] font-mono text-ink-muted bg-black/30 p-2 rounded border border-line/60 space-y-1">
                  <div>
                    DNS TXT: <span className="text-ink-secondary">_webpulse-verify.{item.hostname}</span> →{' '}
                    <span className="text-emerald-400">webpulse-verification={item.verification_token}</span>
                  </div>
                  <div>
                    OR File: <span className="text-ink-secondary">{item.origin}/.well-known/webpulse-verify-{item.verification_token}.txt</span>
                  </div>
                </div>
              )}
            </div>
          ))}
          {verifiedOrigins.length === 0 && !originsLoading && (
            <p className="text-xs font-mono text-ink-muted">No origins registered yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
