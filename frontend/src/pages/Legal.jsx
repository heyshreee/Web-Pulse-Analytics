import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import MarketingShell from '../components/marketing/MarketingShell';
import Reveal from '../components/marketing/Reveal';
import { apiRequest } from '../utils/api';
import { LEGAL_POLICIES } from './legal/policies';

const REPO_URL = 'https://github.com/heyshreee/Web-Pulse-Analytics';
const ISSUES_URL = `${REPO_URL}/issues`;

function renderInline(text) {
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('`') && part.endsWith('`')) {
            return (
                <code key={i} className="rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[0.85em] text-violet-300">
                    {part.slice(1, -1)}
                </code>
            );
        }
        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <strong key={i} className="font-semibold text-slate-100">
                    {part.slice(2, -2)}
                </strong>
            );
        }
        return part;
    });
}

function ContactBlock({ kind, meta }) {
    const isPrivacy = kind === 'privacy';
    const email = isPrivacy ? meta?.privacyEmail : meta?.supportEmail;
    return (
        <div className="mkt-card space-y-3 p-5">
            {email ? (
                <a
                    href={`mailto:${email}`}
                    className="mkt-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                >
                    {email} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
            ) : (
                <p className="text-sm leading-relaxed text-slate-400">
                    A dedicated {isPrivacy ? 'privacy' : 'support'} mailbox is being set up. Until it is live, please open a request
                    through GitHub Issues below.
                </p>
            )}
            <a
                href={ISSUES_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-300 transition-colors hover:text-violet-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
            >
                Open an issue on GitHub <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
        </div>
    );
}

export default function Legal({ type }) {
    const [meta, setMeta] = useState(null);
    const [activeId, setActiveId] = useState(() => LEGAL_POLICIES[type]?.sections?.[0]?.id || '');
    const [indicator, setIndicator] = useState({ top: 0, height: 0 });
    const tocListRef = useRef(null);
    const data = LEGAL_POLICIES[type] || LEGAL_POLICIES.privacy;

    useEffect(() => {
        let mounted = true;
        apiRequest('/meta')
            .then((res) => {
                if (mounted) setMeta(res);
            })
            .catch(() => {});
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        const onScroll = () => {
            const threshold = 200;
            let current = data.sections[0]?.id;
            for (const section of data.sections) {
                const el = document.getElementById(section.id);
                if (el && el.getBoundingClientRect().top <= threshold) {
                    current = section.id;
                }
            }
            const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 40;
            if (nearBottom && data.sections.length) {
                current = data.sections[data.sections.length - 1].id;
            }
            setActiveId(current);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, [data.sections]);

    useEffect(() => {
        const index = data.sections.findIndex((section) => section.id === activeId);
        const links = tocListRef.current?.querySelectorAll('a');
        const link = links?.[index > -1 ? index : 0];
        if (link) {
            const raf = requestAnimationFrame(() => {
                setIndicator({ top: link.offsetTop || 0, height: link.offsetHeight || 0 });
            });
            return () => cancelAnimationFrame(raf);
        }
        return undefined;
    }, [activeId, data.sections]);

    const renderBlock = (block) => {
        switch (block.type) {
            case 'p':
                return <p className="mkt-body">{renderInline(block.text)}</p>;
            case 'h':
                return (
                    <h4 className="mkt-eyebrow mt-6 mb-2">
                        {block.text}
                    </h4>
                );
            case 'list':
                return (
                    <ul className="space-y-2.5">
                        {block.items.map((item, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-400">
                                <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-violet-400" />
                                <span>{renderInline(item)}</span>
                            </li>
                        ))}
                    </ul>
                );
            case 'note':
                return (
                    <div className="rounded-xl border border-amber-400/20 bg-amber-500/[0.06] p-4 text-sm leading-relaxed text-slate-300">
                        {renderInline(block.text)}
                    </div>
                );
            case 'links':
                return (
                    <ul className="space-y-2.5">
                        {block.items.map((item, i) => (
                            <li key={i}>
                                <a
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mkt-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                                >
                                    <span className="flex-nowrap">{item.label}</span>
                                    <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                </a>
                            </li>
                        ))}
                    </ul>
                );
            case 'contact':
                return <ContactBlock kind={block.kind} meta={meta} />;
            default:
                return null;
        }
    };

    return (
        <MarketingShell>
            <section className="mkt-section">
                <div className="mkt-container">
                    <Reveal>
                        <div className="mb-10 border-b border-white/[0.07] pb-8 sm:mb-12">
                            <p className="mkt-eyebrow mb-3">Legal</p>
                            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                                <div className="max-w-2xl">
                                    <h1 className="mkt-h1 !text-4xl sm:!text-5xl">{data.title}</h1>
                                    <p className="mkt-lead mt-4">{data.intro}</p>
                                </div>
                                <p className="mkt-chip shrink-0">
                                    Last updated: <span className="font-medium text-slate-200">{data.lastUpdated}</span>
                                </p>
                            </div>
                        </div>
                    </Reveal>

                    <div className="grid gap-10 lg:grid-cols-[15rem_1fr] lg:gap-14">
                        <nav aria-label="Table of contents" className="hidden lg:block">
                            <div className="lg:sticky lg:top-28">
                                <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    Table of contents
                                </p>
                                <ul ref={tocListRef} className="relative space-y-1.5 border-l border-white/[0.08]">
                                    <span
                                        aria-hidden="true"
                                        className={`absolute left-[-2px] top-0 block w-[2px] rounded-full bg-violet-400 transition-all duration-300 ease-out ${
                                            indicator.height ? 'opacity-100' : 'opacity-0'
                                        }`}
                                        style={{ transform: `translateY(${indicator.top}px)`, height: `${indicator.height}px` }}
                                    />
                                    {data.sections.map((section) => {
                                        const isActive = section.id === activeId;
                                        return (
                                            <li key={section.id}>
                                                <a
                                                    href={`#${section.id}`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setActiveId(section.id);
                                                        document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                    }}
                                                    className={`block -ml-px border-l-2 py-1 pl-4 text-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 ${
                                                        isActive
                                                            ? 'border-violet-400 font-medium text-violet-300'
                                                            : 'border-transparent text-slate-400 hover:border-slate-600 hover:text-violet-300'
                                                    }`}
                                                >
                                                    {section.title.replace(/^\d+\.\s*/, '')}
                                                </a>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </nav>

                        <div className="min-w-0 space-y-12">
                            {data.sections.map((section) => (
                                <section key={section.id} id={section.id} className="scroll-mt-32">
                                    <h2 className="mkt-h3 mb-4">
                                        {section.title}
                                    </h2>
                                    <div className="space-y-3.5">
                                        {section.blocks.map((block, i) => (
                                            <React.Fragment key={i}>{renderBlock(block)}</React.Fragment>
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </MarketingShell>
    );
}
