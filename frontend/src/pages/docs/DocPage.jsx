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
            return <strong key={i} className="font-semibold text-slate-100">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return (
                <code key={i} className="rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[13px] text-violet-300">{part.slice(1, -1)}</code>
            );
        }
        return <span key={i}>{part}</span>;
    });
};

const Paragraph = ({ text }) => (
    <p className="text-[15px] leading-relaxed text-slate-400">{Inline({ text })}</p>
);

const ListBlock = ({ items }) => (
    <ul className="space-y-3">
        {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10">
                    <Check className="h-3 w-3 text-emerald-300" aria-hidden="true" />
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
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/10 text-sm font-semibold text-violet-300">
                    {String(i + 1).padStart(2, '0')}
                </div>
                <div className="flex-1">
                    <h4 className="mb-1.5 text-base font-bold tracking-tight text-slate-100">{Inline({ text: step.title })}</h4>
                    <p className="text-sm leading-relaxed text-slate-400">{Inline({ text: step.desc })}</p>
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
    <div className={`flex items-start gap-4 rounded-2xl border p-5 ${
        tone === 'warning'
            ? 'border-amber-400/20 bg-amber-400/[0.07]'
            : 'border-violet-400/20 bg-violet-500/[0.07]'
    }`}>
        {tone === 'warning' ? (
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />
        ) : (
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-violet-300" aria-hidden="true" />
        )}
        <div>
            {title && <h4 className="mb-1 text-sm font-semibold uppercase tracking-widest text-slate-100">{title}</h4>}
            <p className="text-sm leading-relaxed text-slate-400">{Inline({ text })}</p>
        </div>
    </div>
);

const CodeBlockItem = ({ lang, title, code }) => (
    <CodeBlock language={lang || 'text'} title={title} code={code} />
);

const TableBlock = ({ headers, rows }) => (
    <div className="mkt-panel overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-white/[0.07] text-left text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                        {headers.map((h, i) => (
                            <th key={i} scope="col" className="bg-white/[0.02] px-5 py-3">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} className="border-t border-white/[0.05]">
                            {row.map((cell, j) => (
                                <td key={j} className="px-5 py-3 align-top text-slate-300">
                                    {j === 0 && /^(GET|POST|PUT|PATCH|DELETE)$/.test(cell) ? (
                                        <span className="font-mono font-semibold text-violet-300">{cell}</span>
                                    ) : /^\//.test(cell) ? (
                                        <code className="font-mono text-[13px] text-slate-200">{cell}</code>
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
    <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item, i) => (
            <Link key={i} to={item.to} className="mkt-card mkt-card-hover group/li block p-5">
                <span className="flex items-center gap-2 font-semibold tracking-tight text-slate-100 transition-colors group-hover/li:text-violet-300">
                    {item.label}
                    <ArrowRight className="h-4 w-4 shrink-0 text-violet-400" aria-hidden="true" />
                </span>
                <p className="mt-1.5 text-sm text-slate-400">{item.desc}</p>
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
                <p className="text-slate-400">This documentation page hasn&apos;t been written yet.</p>
                <Link to="/docs" className="mkt-link mt-4 inline-flex items-center gap-1">
                    <BookMarked className="h-4 w-4" aria-hidden="true" /> Back to documentation
                </Link>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-12">
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                        <BookMarked className="h-5 w-5 text-violet-300" aria-hidden="true" />
                    </div>
                    <p className="mkt-eyebrow !mb-0">WebPulse Documentation</p>
                </div>
                <h1 className="mkt-h2 !text-3xl">{page.title}</h1>
                <p className="mkt-lead mt-2 !text-base">
                    {Inline({ text: page.description })}
                </p>
            </div>

            {page.sections.map((section) => (
                <section key={section.id} id={section.id} className="mb-16 scroll-mt-24">
                    <div className="mb-6 flex items-center gap-3">
                        <span className="h-6 w-1 rounded-full bg-violet-500" aria-hidden="true"></span>
                        <h2 className="font-display text-xl font-bold tracking-tight text-slate-100">
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

            <div className="mt-16 border-t border-white/[0.07] pt-8">
                <Link to="/docs" className="mkt-link inline-flex items-center gap-1.5">
                    <BookMarked className="h-4 w-4" aria-hidden="true" /> Back to documentation home
                </Link>
            </div>
        </div>
    );
}
