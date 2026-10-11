import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useSearchParams, useOutletContext } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import { PageHead } from '../components/ui/Page';
import { Card, CardBody } from '../components/ui/Card';
import { EmptyState } from '../components/ui/State';
import { useProject } from '../context/ProjectContext';
import GeneralSection from '../components/settings/GeneralSection';
import TrackingSection from '../components/settings/TrackingSection';
import TeamSection from '../components/settings/TeamSection';
import PrivacySection from '../components/settings/PrivacySection';
import AlertsSection from '../components/settings/AlertsSection';
import IntegrationsSection from '../components/settings/IntegrationsSection';
import AccountSection from '../components/settings/AccountSection';
import DangerSection from '../components/settings/DangerSection';

const SECTIONS = [
  { id: 'general', label: 'General', icon: 'sliders' },
  { id: 'tracking', label: 'Tracking & Installation', icon: 'code' },
  { id: 'team', label: 'Team & Permissions', icon: 'users' },
  { id: 'privacy', label: 'Data & Privacy', icon: 'shield' },
  { id: 'alerts', label: 'Alerts & Notifications', icon: 'bell' },
  { id: 'integrations', label: 'Integrations & API', icon: 'link' },
  { id: 'account', label: 'Account & Security', icon: 'user' },
  { id: 'danger', label: 'Danger Zone', icon: 'warn' }
];

const PROJECT_SCOPED = new Set([
  'general',
  'tracking',
  'team',
  'privacy',
  'alerts',
  'integrations',
  'danger'
]);

export default function Settings() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loadUser } = useOutletContext() || {};
  const { projects, selectedProjectId, setSelectedProjectId, refreshProjects } = useProject();

  const [activeSection, setActiveSection] = useState(
    tab && SECTIONS.some((s) => s.id === tab) ? tab : 'general'
  );
  const [projectId, setProjectId] = useState(
    selectedProjectId && selectedProjectId !== 'all' ? selectedProjectId : ''
  );

  useEffect(() => {
    if (tab && SECTIONS.some((s) => s.id === tab)) {
      setActiveSection(tab);
    }
  }, [tab]);

  // Honour ?project=<id> deep links.
  useEffect(() => {
    const requested = searchParams.get('project');
    if (requested && projects.some((p) => p.id === requested)) {
      setProjectId(requested);
    }
  }, [searchParams, projects]);

  // Ensure a concrete project is selected for project-scoped sections.
  useEffect(() => {
    if (!projectId && projects.length) {
      setProjectId(projects[0].id);
    }
  }, [projectId, projects]);

  const activeProject = useMemo(
    () => projects.find((p) => p.id === projectId) || null,
    [projects, projectId]
  );

  const isProjectScoped = PROJECT_SCOPED.has(activeSection);

  const handleSelectSection = (id) => {
    setActiveSection(id);
    navigate(`/dashboard/settings/${id}`, { replace: true });
  };

  const handleProjectChange = (id) => {
    setProjectId(id);
    setSelectedProjectId(id);
  };

  const handleProjectsChanged = async () => {
    await refreshProjects();
  };

  const sectionProps = {
    project: activeProject,
    user,
    onSaved: handleProjectsChanged,
    onChanged: handleProjectsChanged
  };

  return (
    <div className="page animate-fade-in">
      <PageHead
        meta={false}
        eyebrow="WebPulse Analytics"
        title="Project settings"
        desc="Website configuration, tracking, privacy, and account preferences."
      />

      {isProjectScoped && projects.length > 0 ? (
        <div className="field" style={{ maxWidth: 320, marginBottom: 'var(--space-4)' }}>
          <label className="label" htmlFor="settings-project">
            Project
          </label>
          <select
            id="settings-project"
            className="select"
            value={projectId}
            onChange={(e) => handleProjectChange(e.target.value)}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="settings-layout mt-4">
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

        <div className="space-y-6" style={{ minWidth: 0 }}>
          {isProjectScoped && projects.length === 0 ? (
            <Card>
              <CardBody>
                <EmptyState
                  icon="folder"
                  title="No projects yet"
                  text="Create a project first, then come back to configure its settings."
                />
              </CardBody>
            </Card>
          ) : (
            <>
              {activeSection === 'general' && <GeneralSection {...sectionProps} />}
              {activeSection === 'tracking' && <TrackingSection {...sectionProps} />}
              {activeSection === 'team' && <TeamSection />}
              {activeSection === 'privacy' && <PrivacySection {...sectionProps} />}
              {activeSection === 'alerts' && <AlertsSection />}
              {activeSection === 'integrations' && <IntegrationsSection />}
              {activeSection === 'danger' && <DangerSection {...sectionProps} />}
            </>
          )}

          {activeSection === 'account' && <AccountSection user={user} loadUser={loadUser} />}
        </div>
      </div>
    </div>
  );
}
