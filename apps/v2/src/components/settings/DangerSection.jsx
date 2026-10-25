import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Card, CardHead, CardTitle, CardSub, CardBody } from '../ui/Card';
import { Badge } from '../ui/Display';
import { Dialog } from '../ui/Overlay';
import { Switch, SettingRow } from '../ui/Field';
import { useProject } from '../../context/ProjectContext';
import { useToast } from '../../context/ToastContext';
import { apiRequest } from '../../utils/api';

const UNAVAILABLE = [
  { title: 'Reset analytics data', desc: 'Purge all collected events and keep the project.' },
  { title: 'Transfer ownership', desc: 'Move this project to another account.' }
];

export default function DangerSection({ project, onChanged }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshProjects, setSelectedProjectId } = useProject();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [pausing, setPausing] = useState(false);

  if (!project) return null;

  const isActive = project.is_active !== false;

  const handleToggleActive = async (next) => {
    setPausing(true);
    try {
      await apiRequest(`/projects/${project.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: next })
      });
      await refreshProjects();
      await onChanged?.();
      toast({ title: next ? 'Data collection resumed' : 'Data collection paused', tone: 'success' });
    } catch (err) {
      toast({ title: err.message || 'Failed to update project', tone: 'error' });
    } finally {
      setPausing(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiRequest(`/projects/${project.id}`, { method: 'DELETE' });
      toast({ title: 'Project deleted', description: `${project.name} was removed.`, tone: 'success' });
      setConfirmOpen(false);
      setSelectedProjectId('all');
      await refreshProjects();
      navigate('/dashboard/projects');
    } catch (err) {
      toast({ title: err.message || 'Failed to delete project', tone: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const canDelete = confirmText.trim() === project.name;

  return (
    <div className="space-y-6">
      <Card className="border-destructive/40">
        <CardHead>
          <div>
            <CardTitle className="text-destructive">Danger zone</CardTitle>
            <CardSub>Destructive actions that cannot be reversed</CardSub>
          </div>
        </CardHead>
        <CardBody className="divide-y divide-border">
          <SettingRow
            title={isActive ? 'Pause data collection' : 'Resume data collection'}
            description={
              isActive
                ? 'Stop accepting new events for this project. Existing data is preserved.'
                : 'This project is paused. Turn tracking back on to resume collecting data.'
            }
            control={
              <Button
                variant="outline"
                loading={pausing}
                onClick={() => handleToggleActive(!isActive)}
              >
                {isActive ? 'Pause collection' : 'Resume collection'}
              </Button>
            }
          />
          <SettingRow
            title="Delete this project"
            description={`Permanently removes ${project.name}, its API keys, tracking, and all analytics data.`}
            control={
              <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
                Delete project
              </Button>
            }
          />
        </CardBody>
      </Card>

      <Card>
        <CardHead>
          <div>
            <CardTitle>More destructive actions</CardTitle>
            <CardSub>Not enabled in this release</CardSub>
          </div>
        </CardHead>
        <CardBody className="divide-y divide-border">
          {UNAVAILABLE.map((item) => (
            <SettingRow
              key={item.title}
              title={item.title}
              description={item.desc}
              control={<Badge tone="neutral">Coming soon</Badge>}
            />
          ))}
        </CardBody>
      </Card>

      <Dialog
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setConfirmText('');
        }}
        title={`Delete ${project.name}?`}
        description="All collected analytics, page views, API keys, and settings will be permanently destroyed."
        footer={
          <div className="flex w-full items-center justify-between">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                setConfirmOpen(false);
                setConfirmText('');
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn--destructive"
              disabled={!canDelete || deleting}
              onClick={handleDelete}
            >
              {deleting ? 'Deleting…' : 'Delete project'}
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-foreground">
            This action is permanent and cannot be undone. Type{' '}
            <strong>{project.name}</strong> to confirm.
          </p>
          <input
            className="input"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={project.name}
            autoFocus
          />
        </div>
      </Dialog>
    </div>
  );
}
