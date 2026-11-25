import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CopyButton({ text, label, className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`mkt-btn mkt-btn-secondary mkt-btn-sm ${className}`.trim()}
      aria-label={copied ? 'Copied to clipboard' : `Copy ${label || 'code'}`}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-[#FFFFFF]" aria-hidden="true" />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{label || 'Copy'}</span>
        </>
      )}
    </button>
  );
}
