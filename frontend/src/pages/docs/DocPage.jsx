import { Link } from 'react-router-dom';
import {
    ArrowRight, Check, Info, ShieldAlert, BookMarked
} from 'lucide-react';
import CodeBlock from './CodeBlock';
import { docsContent } from './docsContent';

const Inline = ({ text }) => {
    const parts = String(text).split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-semibold text-slate-800 dark:text-slate-100">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return (
                <code key={i} className="bg-slate-100 dark:bg-slate-800 text-violet-600 dark:text-violet-300 px-1.5 py-0.5 rounded-md font-mono text-[13px]">{part.slice(1, -1)}</code>
            );
        }
        return <span key={i}>{part}</span>;
    });
};

const Paragraph = ({ text }) => (
    <p className="prose-quiet text-[15px] leading-relaxed">{Inline({ text })}</p>
);

const ListBlock = ({ items }) => (
    <ul className="space-y-3">
        {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15 shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-emerald-500" />
                </span>
                <span>{Inline({ text: item })}</span>
            </li>
        ))}
    </ul>
);

const StepsBlock = ({ items }) => (
    <div className="space-y-8">
        {items.map((step, i) => (
            <div key={i} className="flex gap-5">
                <div className="flex-none h-10 w-10 rounded-full bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 flex items-center justify-center text-sm font-semibold text-violet-600 dark:text-violet-300">
                    {String(i + 1).padStart(2, '0')}
                </div>
                <div className="flex-1">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1.5 tracking-tight">{Inline({ text: step.title })}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{Inline({ text: step.desc })}</p>
                    {step.code && (
                        <div className="mt-4">
                            <CodeBlock
                                language={step.code.lang || 'text'}
                                code={step.code.code}
                            />
                        </div>
                    )}
                </div>
            </div>
        ))}
    </div>
);

const CalloutBlock = ({ tone, title, text }) => (
    <div className={`p-5 rounded-2xl border flex gap-4 items-start ${
        tone === 'warning'
            ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'
            : 'bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20'
    }`}>
        {tone === 'warning' ? (
            <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        ) : (
            <Info className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
        )}
        <div>
            {title && <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-widest mb-1">{title}</h4>}
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{Inline({ text })}</p>
        </div>
    </div>
);

const CodeBlockItem = ({ lang, title, code }) => (
    <CodeBlock language={lang || 'text'} title={title} code={code} />
);

const TableBlock = ({ headers, rows }) => (
    <div className="card card-pad !p-0 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-left text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        {headers.map((h, i) => (
                            <th key={i} className="px-5 py-3 bg-slate-50 dark:bg-slate-900/60">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                            {row.map((cell, j) => (
                                <td key={j} className="px-5 py-3 text-slate-600 dark:text-slate-300 align-top">
                                    {j === 0 && /^(GET|POST|PUT|PATCH|DELETE)$/.test(cell) ? (
                                        <span className="font-mono font-semibold text-violet-600 dark:text-violet-400">{cell}</span>
                                    ) : /^\//.test(cell) ? (
                                        <code className="font-mono text-[13px] text-slate-800 dark:text-slate-200">{cell}</code>
                                    ) : (
                                        <span>{Inline({ text: cell })}</span>
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const LinksBlock = ({ items }) => (
    <div className="grid sm:grid-cols-2 gap-4">
        {items.map((item, i) => (
            <Link key={i} to={item.to} className="card card-pad card-hover group/li block">
                <span className="font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 group-hover/li:text-violet-600 dark:group-hover/li:text-violet-400 transition-colors">
                    {item.label}
                    <ArrowRight className="h-4 w-4 text-violet-500 shrink-0" />
                </span>
                <p className="prose-quiet text-sm mt-1.5">{item.desc}</p>
            </Link>
        ))}
    </div>
);

const renderBlock = (block) => {
    switch (block.type) {
        case 'p': return <Paragraph text={block.text} />;
        case 'ul': return <ListBlock items={block.items} />;
        case 'steps': return <StepsBlock items={block.items} />;
        case 'callout': return <CalloutBlock tone={block.tone} title={block.title} text={block.text} />;
        case 'code': return <CodeBlockItem lang={block.lang} title={block.title} code={block.code} />;
        case 'table': return <TableBlock headers={block.headers} rows={block.rows} />;
        case 'links': return <LinksBlock items={block.items} />;
        default: return null;
    }
};

export default function DocPage({ slug }) {
    const page = docsContent[slug];

    if (!page) {
        return (
            <div className="pt-8">
                <p className="prose-quiet">This documentation page hasn&apos;t been written yet.</p>
                <Link to="/docs" className="inline-flex items-center gap-1 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors mt-4">
                    <BookMarked className="h-4 w-4" /> Back to documentation
                </Link>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10">
                        <BookMarked className="h-5 w-5 text-violet-500" />
                    </div>
                    <div>
                        <p className="eyebrow !mb-0">WebPulse Documentation</p>
                    </div>
                </div>
                <h1 className="page-title !text-3xl font-display tracking-tight">{page.title}</h1>
                <p className="page-sub !text-base mt-2">
                    {Inline({ text: page.description })}
                </p>
            </div>

            {page.sections.map((section) => (
                <section key={section.id} id={section.id} className="mb-16 scroll-mt-24">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="h-6 w-1 rounded-full bg-violet-500"></span>
                        <h2 className="text-xl font-display font-bold tracking-tight text-slate-900 dark:text-white">
                            {Inline({ text: section.heading })}
                        </h2>
                    </div>
                    <div className="space-y-6">
                        {section.blocks.map((block, i) => (
                            <div key={i}>{renderBlock(block)}</div>
                        ))}
                    </div>
                </section>
            ))}

            <div className="mt-16 pt-8 border-t border-slate-200 dark:border-white/[0.06]">
                <Link to="/docs" className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors">
                    <BookMarked className="h-4 w-4" /> Back to documentation home
                </Link>
            </div>
        </div>
    );
}