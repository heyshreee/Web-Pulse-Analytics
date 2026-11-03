import { useState } from 'react';
import { Dialog } from '../ui/Overlay';
import Icon from '../ui/Icon';
import { CodeBlock, CopyButton } from '../ui/Page';
import { apiRequest } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { useProject } from '../../context/ProjectContext';

export default function AddProjectWizard({ open, onClose }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [env, setEnv] = useState('Production');
  const [createdProject, setCreatedProject] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const { showToast } = useToast();
  const { refreshProjects, setSelectedProjectId } = useProject();

  const reset = () => {
    setStep(1);
    setName('');
    setUrl('');
    setEnv('Production');
    setCreatedProject(null);
    setVerifying(false);
    setVerifyResult(null);
    setErrorMsg('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleStep1Submit = async (e) => {
    e?.preventDefault();
    setErrorMsg('');

    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMsg('Please enter a project name');
      return;
    }

    // Backend validation for name
    if (!/^[a-zA-Z0-9_-]+$/.test(cleanName)) {
      setErrorMsg('Project name can only contain letters, numbers, underscores, and hyphens');
      return;
    }

    let cleanUrl = url.trim();
    if (!cleanUrl) {
      setErrorMsg('Please enter your website URL');
      return;
    }
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = `https://${cleanUrl}`;
    }

    try {
      let hostname = '';
      try {
        hostname = new URL(cleanUrl).hostname;
      } catch {
        hostname = cleanUrl;
      }

      const proj = await apiRequest('/projects', {
        method: 'POST',
        body: JSON.stringify({
          name: cleanName,
          allowedOrigins: hostname
        })
      });

      setCreatedProject(proj);
      await refreshProjects();
      showToast('Project created successfully');
      setStep(2);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create project');
    }
  };

  const handleRunVerify = async () => {
    if (!createdProject) return;
    setVerifying(true);
    setVerifyResult(null);

    try {
      const res = await apiRequest(`/projects/${createdProject.id}/verify`);
      setVerifyResult(res);
      if (res.verified) {
        showToast('Installation verified!');
      }
    } catch (err) {
      setVerifyResult({
        verified: false,
        message: err.message || 'Unable to check verification at this time.'
      });
    } finally {
      setVerifying(false);
    }
  };

  const getSnippetCode = () => {
    const trackingId = createdProject?.tracking_id || 'trk_your_id';
    return `<!-- WebPulse Analytics · Add before </body> -->\n<script defer src="https://cdn.webpulse.io/p.js" data-site="${trackingId}"></script>`;
  };

  const renderSteps = () => {
    const labels = ['Project details', 'Install snippet', 'Verify'];
    return (
      <div className="wizard-steps mb-6">
        {labels.map((l, i) => {
          const n = i + 1;
          const isDone = n < step;
          const isCurrent = n === step;
          return (
            <span key={l} className="inline-flex items-center">
              {i > 0 ? <span className="wizard-line" aria-hidden="true" /> : null}
              <span className={`wizard-step ${isCurrent ? 'is-current' : ''} ${isDone ? 'is-done' : ''}`}>
                <span className="wizard-num">
                  {isDone ? <Icon name="check" size={12} /> : n}
                </span>
                {l}
              </span>
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={step === 1 ? 'Add a project' : step === 2 ? 'Install the snippet' : 'Verify installation'}
      description={
        step === 1
          ? 'Track a new website. You can change any of this later.'
          : step === 2
          ? `Paste this into every page of ${createdProject?.name || 'your site'}.`
          : `We’ll check whether ${createdProject?.name || 'your site'} is reporting.`
      }
      wide={step === 2}
      footer={
        <div className="flex w-full items-center justify-between">
          {step === 1 ? (
            <>
              <button type="button" className="btn btn--ghost" onClick={handleClose}>
                Cancel
              </button>
              <button type="button" className="btn" onClick={handleStep1Submit}>
                Continue
                <Icon name="arrowRight" size={15} />
              </button>
            </>
          ) : step === 2 ? (
            <>
              <button type="button" className="btn btn--ghost" onClick={() => setStep(1)}>
                Back
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setStep(3);
                  handleRunVerify();
                }}
              >
                <Icon name="check" size={15} />
                I’ve installed it
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn--ghost" onClick={() => setStep(2)}>
                Back
              </button>
              {verifyResult?.verified ? (
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setSelectedProjectId(createdProject.id);
                    handleClose();
                  }}
                >
                  Open dashboard
                  <Icon name="arrowRight" size={15} />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn--outline"
                    onClick={() => {
                      setSelectedProjectId(createdProject?.id || 'all');
                      handleClose();
                    }}
                  >
                    Finish later
                  </button>
                  <button type="button" className="btn" onClick={handleRunVerify} disabled={verifying}>
                    <Icon name="refresh" size={15} />
                    {verifying ? 'Checking…' : 'Run verification'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      }
    >
      {renderSteps()}

      {step === 1 && (
        <form onSubmit={handleStep1Submit} className="space-y-4">
          {errorMsg ? (
            <div className="rounded-lg bg-error-soft border border-error p-3 text-sm text-error-text">
              {errorMsg}
            </div>
          ) : null}

          <div className="field">
            <label className="label" htmlFor="wz-name">
              Project name<span className="req">*</span>
            </label>
            <input
              id="wz-name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. marketing_site"
              autoFocus
            />
            <p className="hint">Letters, numbers, underscores, and hyphens only.</p>
          </div>

          <div className="field">
            <label className="label" htmlFor="wz-url">
              Website URL<span className="req">*</span>
            </label>
            <input
              id="wz-url"
              className="input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="wz-env">
              Environment
            </label>
            <select id="wz-env" className="select" value={env} onChange={(e) => setEnv(e.target.value)}>
              <option value="Production">Production</option>
              <option value="Development">Development</option>
              <option value="Staging">Staging</option>
            </select>
          </div>
        </form>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <CodeBlock
            lang="html"
            code={getSnippetCode()}
            action={<CopyButton value={getSnippetCode()} label="Copy snippet" />}
          />
          <p className="hint">
            Add it before the closing <code>&lt;/body&gt;</code> tag, then reload the page to start collecting data.
          </p>
        </div>
      )}

      {step === 3 && (
        <div className="py-6 text-center">
          {verifying ? (
            <div className="space-y-3">
              <span className="inline-block animate-spin text-primary">
                <Icon name="refresh" size={24} />
              </span>
              <h3 className="font-semibold text-lg text-foreground">Checking your website…</h3>
              <p className="text-sm text-muted-foreground">
                Listening for incoming tracking hits from {createdProject?.name}.
              </p>
            </div>
          ) : verifyResult?.verified ? (
            <div className="space-y-3">
              <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-success-soft text-success-text mx-auto">
                <Icon name="checkCircle" size={24} />
              </span>
              <h3 className="font-semibold text-lg text-foreground">Installation Verified!</h3>
              <p className="text-sm text-muted-foreground">
                Events from {createdProject?.name} are arriving successfully. First dashboard insights are ready.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-warning-soft text-warning-text mx-auto">
                <Icon name="warn" size={24} />
              </span>
              <h3 className="font-semibold text-lg text-foreground">No events received yet</h3>
              <p className="text-sm text-muted-foreground">
                {verifyResult?.message || 'Ensure the script tag is added and visit your website in a browser tab.'}
              </p>
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
}
