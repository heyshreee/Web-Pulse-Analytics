import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function CodeBlock({ code, language = 'javascript', title }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-white/15 bg-[#050505]">
      <div className="flex items-center justify-between border-b border-white/[0.11] bg-[#0B0B0B] px-4 py-3">
        <span className="font-mono text-[13px] font-medium text-[#FFFFFF]">
          {title || language}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code"
          className="inline-flex items-center gap-2 border border-white/15 bg-[#050505] px-3 py-1.5 font-mono text-[13px] text-[#C8C8C4] transition-colors hover:border-white/30 hover:text-[#F5F5F4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFFFFF]"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-[#FFFFFF]" aria-hidden="true" />
              <span className="text-[#FFFFFF]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto p-5 sm:p-6">
        <SyntaxHighlighter
          language={language}
          style={atomDark}
          customStyle={{
            background: 'transparent',
            padding: 0,
            margin: 0,
            fontSize: '13.5px',
            lineHeight: '1.75',
            fontFamily: '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontWeight: '400',
          }}
          wrapLongLines={true}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
