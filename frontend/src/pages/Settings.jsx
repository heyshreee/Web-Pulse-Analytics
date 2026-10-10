import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { PageHead, CodeBlock, CopyButton } from '../components/ui/Page';
import { Card, CardHead, CardTitle, CardSub, CardBody } from '../components/ui/Card';
import { Dialog } from '../components/ui/Overlay';
import { Badge } from '../components/ui/Display';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { apiRequest } from '../utils/api';

const SECTIONS = [
  { id: 'general', label: 'General', icon: 'sliders' },
  { id: 'tracking', label: 'Tracking', icon: 'code' },
  { id: 'team', label: 'Team', icon: 'users' },
  { id: 'data', label: 'Data & privacy', icon: 'shield' }
];

export default function Settings() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const { currentProject, refreshProjects, setSelectedProjectId } = useProject();
  const { showToast } = useToast();

  const [activeSection, setActiveSection] = useState(tab || 'general');

  useEffect(() => {
    if (tab && SECTIONS.some((s) => s.id === tab)) {
      setActiveSection(tab);
    }
  }, [tab]);

  // Form states
  const [projectName, setProjectName] = useState(currentProject?.name || 'My Website');
  const [websiteUrl, setWebsiteUrl] = useState(currentProject?.allowed_origins || 'https://example.com');
  const [timezone, setTimezone] = useState('UTC+05:30 — Asia/Kolkata');
  const [dateFormat, setDateFormat] = useState('DD MMM YYYY');

  // Tracking options
  const [trackingOptions, setTrackingOptions] = useState({
    pageViews: true,
    sessions: true,
    events: true,
    scrollDepth: true,
    dnt: true,
    cookies: false
  });

  // Data retention
  const [dataOptions, setDataOptions] = useState({
    retention: true,
    anonymizeIp: true,
    consentMode: false
  });

  // Team
  const [team, setTeam] = useState([
    { name: 'Aditya Rao', email: 'aditya@webpulse.io', role: 'Owner', initials: 'AR' },
    { name: 'Priya Sharma', email: 'priya@webpulse.io', role: 'Editor', initials: 'PS' }
  ]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Editor');

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (currentProject) {
      setProjectName(currentProject.name);
      setWebsiteUrl(currentProject.allowed_origins || 'https://example.com');
    }
  }, [currentProject]);

  const handleSelectSection = (id) => {
    setActiveSection(id);
    navigate(`/dashboard/settings/${id}`, { replace: true });
  };

  const handleSaveGeneral = async (e) => {
    e?.preventDefault();
    if (!currentProject?.id || currentProject.isAll) {
      showToast('Select a specific project to edit settings', 'warning');
      return;
    }
    try {
      await apiRequest(`/projects/${currentProject.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: projectName,
          allowedOrigins: websiteUrl.replace(/^https?:\/\//, '')
        })
      });
      await refreshProjects();
      showToast('Settings saved', 'Project preferences have been updated.');
    } catch (err) {
      showToast(err.message || 'Failed to update settings', 'error');
    }
  };

  const handleInviteSubmit = (e) => {
    e?.preventDefault();
    if (!inviteEmail.trim()) return;
    setTeam((prev) => [
      ...prev,
      {
        name: inviteEmail.split('@')[0],
        email: inviteEmail.trim(),
        role: inviteRole,
        initials: inviteEmail.slice(0, 2).toUpperCase()
      }
    ]);
    setInviteOpen(false);
    setInviteEmail('');
    showToast('Teammate invited', `An invite email was sent to ${inviteEmail}`);
  };

  const handleDeleteProject = async () => {
    if (!currentProject?.id || currentProject.isAll) return;
    try {
      await apiRequest(`/projects/${currentProject.id}`, { method: 'DELETE' });
      showToast('Project deleted', `${currentProject.name} was removed.`);
      setDeleteConfirmOpen(false);
      setSelectedProjectId('all');
      await refreshProjects();
      navigate('/dashboard/projects');
    } catch (err) {
      showToast(err.message || 'Failed to delete project', 'error');
    }
  };

  const snippet = `<!-- WebPulse Analytics · Add before </body> -->\n<script defer src="https://cdn.webpulse.io/p.js" data-site="${currentProject?.tracking_id || 'wp_a1b2c3'}"></script>`;

  return (
    <div className="page animate-fade-in">
      <PageHead title="Settings" desc="Project, tracking, team, and security preferences." />

      <div className="settings-layout mt-4">
        {/* Navigation Sidebar */}
        <nav className="settings-nav" aria-label="Settings sections">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`settings-nav-item ${activeSection === s.id ? 'is-active' : ''}`}
              aria-current={activeSection === s.id ? 'true' : undefined}
              onClick={() => handleSelectSection(s.id)}
            >
              <Icon name={s.icon} size={15} />
              <span>{s.label}</span>
            </button>
          ))}
        </nav>

        {/* Section Body */}
        <div className="flex-1 space-y-6">
          {activeSection === 'general' && (
            <Card>
              <CardHead>
                <div>
                  <CardTitle>Project details</CardTitle>
                  <CardSub>How this project appears across WebPulse</CardSub>
                </div>
              </CardHead>
              <CardBody>
                <form onSubmit={handleSaveGeneral} className="space-y-4">
                  <div className="field">
                    <label className="label" htmlFor="s-pname">
                      Project name
                    </label>
                    <input
                      id="s-pname"
                      className="input"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label className="label" htmlFor="s-purl">
                      Website URL / Domain
                    </label>
                    <input
                      id="s-purl"
                      className="input"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label className="label" htmlFor="s-ptz">
                      Reporting timezone
                    </label>
                    <select
                      id="s-ptz"
                      className="select"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                    >
                      <option>UTC+05:30 — Asia/Kolkata</option>
                      <option>UTC+00:00 — Europe/London</option>
                      <option>UTC−05:00 — America/New_York</option>
                      <option>UTC+01:00 — Europe/Berlin</option>
                    </select>
                  </div>

                  <div className="field">
                    <label className="label" htmlFor="s-pdf">
                      Date format
                    </label>
                    <select
                      id="s-pdf"
                      className="select"
                      value={dateFormat}
                      onChange={(e) => setDateFormat(e.target.value)}
                    >
                      <option>DD MMM YYYY</option>
                      <option>MMM D, YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <Button type="submit">Save changes</Button>
                    <button
                      type="button"
                      className="btn btn--ghost"
                      onClick={() => showToast('Preferences reset')}
                    >
                      Reset
                    </button>
                  </div>
                </form>
              </CardBody>
            </Card>
          )}

          {activeSection === 'tracking' && (
            <div className="space-y-6">
              <Card>
                <CardHead>
                  <div>
                    <CardTitle>Tracking features</CardTitle>
                    <CardSub>Configure what WebPulse records for this property</CardSub>
                  </div>
                </CardHead>
                <CardBody className="divide-y divide-border">
                  <div className="setting-row py-3">
                    <div className="setting-row-text">
                      <div className="setting-row-title">Page views</div>
                      <p className="setting-row-desc">
                        Record every page load with title, path, and referrer.
                      </p>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={trackingOptions.pageViews}
                        onChange={(e) =>
                          setTrackingOptions((v) => ({ ...v, pageViews: e.target.checked }))
                        }
                      />
                      <span className="switch-track" />
                      <span className="switch-thumb" />
                    </label>
                  </div>

                  <div className="setting-row py-3">
                    <div className="setting-row-text">
                      <div className="setting-row-title">Sessions</div>
                      <p className="setting-row-desc">
                        Group page views into sessions with a 30-minute inactivity window.
                      </p>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={trackingOptions.sessions}
                        onChange={(e) =>
                          setTrackingOptions((v) => ({ ...v, sessions: e.target.checked }))
                        }
                      />
                      <span className="switch-track" />
                      <span className="switch-thumb" />
                    </label>
                  </div>

                  <div className="setting-row py-3">
                    <div className="setting-row-text">
                      <div className="setting-row-title">Custom events</div>
                      <p className="setting-row-desc">Accept track() calls from your frontend code.</p>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={trackingOptions.events}
                        onChange={(e) =>
                          setTrackingOptions((v) => ({ ...v, events: e.target.checked }))
                        }
                      />
                      <span className="switch-track" />
                      <span className="switch-thumb" />
                    </label>
                  </div>

                  <div className="setting-row py-3">
                    <div className="setting-row-text">
                      <div className="setting-row-title">Respect Do Not Track</div>
                      <p className="setting-row-desc">
                        Exclude visitors whose browser sends the DNT header.
                      </p>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={trackingOptions.dnt}
                        onChange={(e) =>
                          setTrackingOptions((v) => ({ ...v, dnt: e.target.checked }))
                        }
                      />
                      <span className="switch-track" />
                      <span className="switch-thumb" />
                    </label>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHead>
                  <div>
                    <CardTitle>Installation snippet</CardTitle>
                    <CardSub>Add this to every page you want to measure</CardSub>
                  </div>
                </CardHead>
                <CardBody className="space-y-4">
                  <CodeBlock
                    lang="html"
                    code={snippet}
                    action={<CopyButton value={snippet} label="Copy snippet" />}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Already installed?</span>
                    <button
                      type="button"
                      className="btn btn--outline btn--sm"
                      onClick={() => showToast('Installation verified and reporting')}
                    >
                      Verify installation
                    </button>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {activeSection === 'team' && (
            <Card>
              <CardHead>
                <div>
                  <CardTitle>Team members</CardTitle>
                  <CardSub>People with access to this workspace</CardSub>
                </div>
                <div className="card-actions">
                  <Button icon="plus" size="sm" onClick={() => setInviteOpen(true)}>
                    Invite teammate
                  </Button>
                </div>
              </CardHead>
              <CardBody className="p-0">
                <div className="divide-y divide-border">
                  {team.map((m) => (
                    <div key={m.email} className="p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="avatar avatar--sm">{m.initials}</span>
                        <div>
                          <div className="font-semibold text-foreground text-sm">{m.name}</div>
                          <div className="text-xs text-muted-foreground">{m.email}</div>
                        </div>
                      </div>
                      <Badge variant="outline">{m.role}</Badge>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {activeSection === 'data' && (
            <div className="space-y-6">
              <Card>
                <CardHead>
                  <div>
                    <CardTitle>Data &amp; privacy</CardTitle>
                    <CardSub>Retention policies and anonymization</CardSub>
                  </div>
                </CardHead>
                <CardBody className="divide-y divide-border">
                  <div className="setting-row py-3">
                    <div className="setting-row-text">
                      <div className="setting-row-title">Archive after 30 days</div>
                      <p className="setting-row-desc">
                        Raw events older than 30 days are rolled up into daily aggregates.
                      </p>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={dataOptions.retention}
                        onChange={(e) =>
                          setDataOptions((v) => ({ ...v, retention: e.target.checked }))
                        }
                      />
                      <span className="switch-track" />
                      <span className="switch-thumb" />
                    </label>
                  </div>

                  <div className="setting-row py-3">
                    <div className="setting-row-text">
                      <div className="setting-row-title">Anonymize IP addresses</div>
                      <p className="setting-row-desc">
                        Truncate the last octet of IPv4 addresses before storage.
                      </p>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={dataOptions.anonymizeIp}
                        onChange={(e) =>
                          setDataOptions((v) => ({ ...v, anonymizeIp: e.target.checked }))
                        }
                      />
                      <span className="switch-track" />
                      <span className="switch-thumb" />
                    </label>
                  </div>
                </CardBody>
              </Card>

              {/* Danger Zone */}
              <Card className="border-destructive/40">
                <CardHead>
                  <div>
                    <CardTitle className="text-destructive">Danger zone</CardTitle>
                    <CardSub>Destructive actions that cannot be reversed</CardSub>
                  </div>
                </CardHead>
                <CardBody>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="font-semibold text-foreground text-sm">
                        Delete this project ({currentProject?.name})
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Removes the project, API keys, tracking scripts, and all historical analytics.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn--destructive btn--sm shrink-0"
                      onClick={() => setDeleteConfirmOpen(true)}
                    >
                      Delete project
                    </button>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      <Dialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite a teammate"
        description="They will receive an email link to join this workspace."
        footer={
          <div className="flex w-full items-center justify-between">
            <button type="button" className="btn btn--ghost" onClick={() => setInviteOpen(false)}>
              Cancel
            </button>
            <Button onClick={handleInviteSubmit}>Send invite</Button>
          </div>
        }
      >
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <div className="field">
            <label className="label" htmlFor="inv-email">
              Email address<span className="req">*</span>
            </label>
            <input
              id="inv-email"
              type="email"
              className="input"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="teammate@company.com"
              autoFocus
            />
          </div>

          <div className="field">
            <label className="label">Role</label>
            <select
              className="select"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
            >
              <option value="Editor">Editor</option>
              <option value="Viewer">Viewer</option>
              <option value="Owner">Owner</option>
            </select>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title={`Delete ${currentProject?.name}?`}
        description="All collected analytics, page views, API keys, and settings will be permanently destroyed."
        footer={
          <div className="flex w-full items-center justify-between">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn--destructive"
              onClick={handleDeleteProject}
            >
              Delete project
            </button>
          </div>
        }
      >
        <p className="text-sm text-foreground">
          This action is permanent and cannot be undone. Please type the project name to confirm if required.
        </p>
      </Dialog>
    </div>
  );
}
