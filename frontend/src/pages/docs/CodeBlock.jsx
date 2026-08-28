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
        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 text-white shadow-lift">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-800/70 border-b border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-500/60"></div>
                        <div className="w-3 h-3 rounded-full bg-emerald-500/60"></div>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-400 ml-2">{title || language}</span>
                </div>
                <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-transparent hover:border-white/10"
                >
                    {copied ? (
                        <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest">Copied</span>
                        </>
                    ) : (
                        <>
                            <Copy className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-semibold uppercase tracking-widest">Copy Code</span>
                        </>
                    )}
                </button>
            </div>
            <div className="p-6 overflow-x-auto bg-slate-900">
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