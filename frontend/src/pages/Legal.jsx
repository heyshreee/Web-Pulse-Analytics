import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BarChart2, ExternalLink } from 'lucide-react';
import Logo from '../components/Logo';
import { apiRequest } from '../utils/api';
import { LEGAL_POLICIES } from './legal/policies';

const REPO_URL = 'https://github.com/heyshreee/Web-Pulse-Analytics';
const ISSUES_URL = `${REPO_URL}/issues`;

function renderInline(text) {
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('`') && part.endsWith('`')) {
            return (
                <code key={i} className="bg-slate-100 dark:bg-slate-800 text-violet-600 dark:text-violet-300 px-1.5 py-0.5 rounded-md font-mono text-[0.85em]">
                    {part.slice(1, -1)}
                </code>
            );
        }
        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <strong key={i} className="font-semibold text-slate-900 dark:text-white">
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
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-5 space-y-3">
            {email ? (
                <a href={`mailto:${email}`} className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:underline">
                    {email} <ExternalLink className="h-3.5 w-3.5" />
                </a>
            ) : (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    A dedicated {isPrivacy ? 'privacy' : 'support'} mailbox is being set up. Until it is live, please open a request
                    through GitHub Issues below.
                </p>
            )}
            <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400">
                Open an issue on GitHub <ArrowRight className="h-4 w-4" />
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
                return <p className="prose-quiet leading-relaxed">{renderInline(block.text)}</p>;
            case 'h':
                return (
                    <h4 className="mt-6 mb-2 text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300">
                        {block.text}
                    </h4>
                );
            case 'list':
                return (
                    <ul className="space-y-2">
                        {block.items.map((item, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                <span className="mt-2 h-1 w-1 rounded-full bg-violet-500 shrink-0" />
                                <span>{renderInline(item)}</span>
                            </li>
                        ))}
                    </ul>
                );
            case 'note':
                return (
                    <div className="rounded-xl border border-amber-200/80 dark:border-amber-500/20 bg-amber-50/70 dark:bg-amber-500/5 p-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {renderInline(block.text)}
                    </div>
                );
            case 'links':
                return (
                    <ul className="space-y-2">
                        {block.items.map((item, i) => (
                            <li key={i}>
                                <a
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm font-medium text-violet-600 dark:text-violet-400 hover:underline"
                                >
                                    <span className="flex-nowrap">{item.label}</span>
                                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
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
        <div className="min-h-screen bg-slate-50 dark:bg-[#070A10] text-slate-900 dark:text-slate-200 font-sans transition-colors duration-300">
            <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-space-900/75 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-white transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="font-medium text-sm">Back to Home</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link to="/register" className="btn-primary btn-sm">Get Started</Link>
                    </div>
                </div>
            </header>

            <main className="pt-28 pb-24">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="border-b border-slate-200 dark:border-white/[0.06] pb-8 mb-10">
                        <p className="eyebrow mb-3">Legal</p>
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                            <div className="max-w-2xl">
                                <h1 className="page-title !text-3xl sm:!text-4xl font-display">{data.title}</h1>
                                <p className="page-sub mt-4 leading-relaxed">{data.intro}</p>
                            </div>
                            <p className="text-xs text-slate-400 dark:text-slate-500 shrink-0">
                                Last updated: <span className="font-medium text-slate-600 dark:text-slate-300">{data.lastUpdated}</span>
                            </p>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-[15rem_1fr] gap-10">
                        <nav aria-label="Table of contents" className="hidden lg:block">
                            <div className="lg:sticky lg:top-28">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 mb-4">
                                    Table of contents
                                </p>
                                <ul ref={tocListRef} className="relative space-y-1.5 border-l border-slate-200 dark:border-slate-800">
                                    <span
                                        aria-hidden="true"
                                        className={`absolute block left-[-2px] top-0 w-[2px] rounded-full bg-violet-500 dark:bg-violet-400 transition-all duration-300 ease-out ${
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
                                                    className={`block -ml-px border-l-2 text-sm py-1 pl-4 transition-all duration-300 ${
                                                        isActive
                                                            ? 'border-violet-500 text-violet-600 dark:text-violet-300 font-medium'
                                                            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-300 hover:border-slate-300 dark:hover:border-slate-600'
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

                        <div className="min-w-0 space-y-10">
                            {data.sections.map((section) => (
                                <section key={section.id} id={section.id} className="scroll-mt-32">
                                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
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
            </main>

            <footer className="border-t border-slate-200 dark:border-white/[0.06] py-10 bg-slate-50 dark:bg-[#070A10] text-center">
                <div className="flex items-center justify-center gap-2 mb-4 opacity-70">
                <Logo />
            </div>
                <div className="flex items-center justify-center gap-5 mb-4">
                    <Link to="/privacy" className="text-xs text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Privacy</Link>
                    <Link to="/terms" className="text-xs text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Terms</Link>
                    <Link to="/cookies" className="text-xs text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Cookies</Link>
                    <Link to="/security" className="text-xs text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Security</Link>
                </div>
                <p className="text-slate-400 dark:text-slate-600 text-xs">© 2026 WebPulse</p>
            </footer>
        </div>
    );
}