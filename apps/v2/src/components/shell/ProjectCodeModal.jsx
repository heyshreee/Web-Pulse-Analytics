import { Dialog } from '../ui/Overlay';
import Icon from '../ui/Icon';
import { CodeBlock, CopyButton } from '../ui/Page';

export default function ProjectCodeModal({ project, open, onClose }) {
  if (!project) return null;

  const trackingId = project.tracking_id || project.trackingId || 'trk_sample';
  const snippet = `<!-- WebPulse Analytics · Add before </body> -->\n<script defer src="https://cdn.webpulse.io/p.js" data-site="${trackingId}"></script>`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Install WebPulse on ${project.name}`}
      description="Paste this snippet before the closing </body> tag on every page you want to measure."
      wide
      footer={
        <div className="flex w-full items-center justify-between">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Close
          </button>
          <CopyButton value={snippet} label="Copy snippet" />
        </div>
      }
    >
      <div className="space-y-4">
        <CodeBlock lang="html" code={snippet} action={<CopyButton value={snippet} label="Copy" />} />

        <div className="divide-y divide-border border-t border-border mt-4">
          <div className="py-3">
            <div className="font-medium text-sm text-foreground">Content security policy</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Allow <code>cdn.webpulse.io</code> in your <code>script-src</code> and <code>connect-src</code> directives.
            </p>
          </div>
          <div className="py-3">
            <div className="font-medium text-sm text-foreground">Single-page apps (React, Next.js, Vue)</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Client-side route changes and popstate events are recorded automatically once loaded.
            </p>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
