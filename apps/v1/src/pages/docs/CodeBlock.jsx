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
        <div className="mkt-panel">
            <div className="flex items-center justify-between border-b border-white/[0.07] bg-white/[0.02] px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5" aria-hidden="true">
                        <div className="h-3 w-3 rounded-full bg-red-500/60"></div>
                        <div className="h-3 w-3 rounded-full bg-amber-500/60"></div>
                        <div className="h-3 w-3 rounded-full bg-emerald-500/60"></div>
                    </div>
                    <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{title || language}</span>
                </div>
                <button
                    type="button"
                    onClick={handleCopy}
                    aria-label="Copy code"
                    className="inline-flex items-center gap-2 rounded-lg border border-transparent px-3 py-1.5 text-slate-400 transition-all hover:border-white/10 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                >
                    {copied ? (
                        <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400">Copied</span>
                        </>
                    ) : (
                        <>
                            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                            <span className="text-[10px] font-semibold uppercase tracking-widest">Copy Code</span>
                        </>
                    )}
                </button>
            </div>
            <div className="overflow-x-auto p-6">
                <SyntaxHighlighter
                    language={language}
                    style={atomDark}
                    customStyle={{
                        background: 'transparent',
                        padding: 0,
                        margin: 0,
                        fontSize: '14px',
                        lineHeight: '1.8',
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        fontWeight: '500'
                    }}
                    wrapLongLines={true}
                >
                    {code}
                </SyntaxHighlighter>
            </div>
        </div>
    );
}
