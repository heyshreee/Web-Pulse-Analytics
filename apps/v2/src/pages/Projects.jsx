import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { PageHead } from '../components/ui/Page';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Display';
import { BlockSkeleton } from '../components/ui/State';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { apiRequest } from '../utils/api';
import { fmtInt } from '../lib/format';

export default function Projects() {
  const {
    projects,
    loadingProjects,
    selectedProjectId,
    setSelectedProjectId,
    refreshProjects,
    openAddProject,
    openInstallSnippet
  } = useProject();

  const { showToast } = useToast();
  const navigate = useNavigate();
  const [statsMap, setStatsMap] = useState({});

  const loadStats = useCallback(async () => {
    if (!projects.length) return;
    try {
      const promises = projects.map((p) =>
        apiRequest(`/analytics/projects/${p.id}/overview`).catch(() => null)
      );
      const results = await Promise.all(promises);
      const map = {};
      projects.forEach((p, idx) => {
        map[p.id] = results[idx];
      });
      setStatsMap(map);
    } catch {
      // ignore
    }
  }, [projects]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleSelect = (id) => {
    setSelectedProjectId(id);
    navigate('/dashboard');
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? All its data will be lost.`)) return;
    try {
      await apiRequest(`/projects/${id}`, { method: 'DELETE' });
      showToast('Project deleted', `${name} was removed.`);
      refreshProjects();
    } catch (err) {
      showToast(err.message || 'Failed to delete project', 'error');
    }
  };

  return (
    <div className="page animate-fade-in">
      <PageHead
        title="Projects"
        desc="Manage websites connected to WebPulse."
        actions={
          <Button icon="plus" onClick={openAddProject}>
            Add project
          </Button>
        }
      />

      {loadingProjects ? (
        <div className="project-grid mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card project-card p-5 space-y-4" aria-hidden="true">
              <div className="flex items-center gap-3">
                <div className="skeleton w-10 h-10 rounded-lg shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="skeleton skeleton--title w-1/2" />
                  <div className="skeleton skeleton--text w-1/3" />
                </div>
              </div>
              <div className="skeleton h-7 w-24 rounded" />
              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <div className="skeleton skeleton--text w-20" />
                <div className="skeleton skeleton--text w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card className="mt-4">
          <div className="state p-12">
            <span className="state-icon" aria-hidden="true">
              <Icon name="folder" size={24} />
            </span>
            <h3 className="state-title">No projects yet</h3>
            <p className="state-text">
              Connect your first website to start measuring visitors and page views.
            </p>
            <div className="state-actions mt-4">
              <Button icon="plus" onClick={openAddProject}>
                Create project
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="project-grid mt-4">
          {projects.map((p) => {
            const isSelected = p.id === selectedProjectId;
            const overview = statsMap[p.id];
            const views = overview?.current_month_views || overview?.total_views || p.views || 0;
            const hasData = views > 0 || p.installed;

            const domain = p.allowed_origins || p.url || `${p.name.toLowerCase()}.com`;

            return (
              <section
                key={p.id}
                className="card project-card"
                style={
                  isSelected
                    ? { borderColor: 'color-mix(in srgb, var(--ring) 65%, var(--border))' }
                    : undefined
                }
              >
                <div className="project-card-head">
                  <span className="project-mark" aria-hidden="true">
                    <Icon name="globe" size={18} />
                  </span>
                  <div className="card-head-text flex-1 min-w-0">
                    <h2 className="card-title truncate text-base font-semibold">{p.name}</h2>
                    <p className="card-sub truncate text-xs">
                      {domain.replace(/^https?:\/\//, '')} · Production
                    </p>
                  </div>
                  <div className="card-actions shrink-0">
                    {hasData ? (
                      <Badge variant="success">
                        <span className="inline-flex items-center gap-1">
                          <Icon name="checkCircle" size={11} />
                          Live
                        </span>
                      </Badge>
                    ) : (
                      <Badge variant="warning">
                        <span className="inline-flex items-center gap-1">
                          <Icon name="warn" size={11} />
                          Not installed
                        </span>
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="project-stats">
                  <div>
                    <span className="project-stat-label">Visitors</span>
                    <span className="project-stat-value font-mono">
                      {fmtInt(overview?.unique_visitors || Math.round(views * 0.65))}
                    </span>
                  </div>
                  <div>
                    <span className="project-stat-label">Events</span>
                    <span className="project-stat-value font-mono">
                      {fmtInt(views)}
                    </span>
                  </div>
                  <div>
                    <span className="project-stat-label">Last activity</span>
                    <span className="project-stat-value text-xs font-normal">
                      {hasData ? 'Active recently' : 'Not receiving data'}
                    </span>
                  </div>
                </div>

                <div className="project-foot">
                  <button
                    type="button"
                    className="btn btn--outline btn--sm"
                    onClick={() => handleSelect(p.id)}
                  >
                    <Icon name="dashboard" size={14} />
                    View analytics
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => openInstallSnippet(p)}
                  >
                    <Icon name="code" size={14} />
                    Installation
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm ml-auto text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(p.id, p.name)}
                    title="Delete project"
                  >
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
