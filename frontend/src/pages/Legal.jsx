import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Clock, ExternalLink, ShieldCheck } from 'lucide-react';
import MarketingShell from '../components/marketing/MarketingShell';
import Reveal from '../components/marketing/Reveal';
import { apiRequest } from '../utils/api';
import { LEGAL_POLICIES, getPolicySections } from './legal/policies';
import LegalContact from './legal/LegalContact';

const SITE_URL = 'https://obs-real-time-tracker.vercel.app';

/* ---------------------------------------------------------------------------
   SEO — the SPA has a single static <head>, so each legal route sets its own
   title, description and canonical tag and restores the previous values on
   unmount (same pattern as the security and features pages).
   --------------------------------------------------------------------------- */

function useLegalSeo(policy) {
    useEffect(() => {
        if (!policy?.seo) return undefined;

        const previousTitle = document.title;
        const meta = [
            { selector: 'meta[name="description"]', name: 'description', content: policy.seo.description },
            { selector: 'meta[property="og:title"]', property: 'og:title', content: policy.seo.title },
            { selector: 'meta[property="og:description"]', property: 'og:description', content: policy.seo.description },
            { selector: 'meta[property="og:url"]', property: 'og:url', content: `${SITE_URL}${policy.path}` },
            { selector: 'meta[name="twitter:title"]', name: 'twitter:title', content: policy.seo.title },
            { selector: 'meta[name="twitter:description"]', name: 'twitter:description', content: policy.seo.description },
        ];

        const previousMeta = meta.map(({ selector }) => {
            const tag = document.head.querySelector(selector);
            return {
                selector,
                existed: Boolean(tag),
                content: tag?.getAttribute('content') ?? null,
            };
        });
        const canonical = document.head.querySelector('link[rel="canonical"]');
        const previousCanonical = canonical?.getAttribute('href') ?? null;

        document.title = policy.seo.title;
        meta.forEach(({ selector, name, property, content }) => {
            let tag = document.head.querySelector(selector);
            if (!tag) {
                tag = document.createElement('meta');
                if (name) tag.setAttribute('name', name);
                if (property) tag.setAttribute('property', property);
                document.head.appendChild(tag);
            }
            tag.setAttribute('content', content);
        });
        if (canonical) canonical.setAttribute('href', `${SITE_URL}${policy.path}`);

        return () => {
            document.title = previousTitle;
            previousMeta.forEach(({ selector, existed, content }) => {
                const tag = document.head.querySelector(selector);
                if (!tag) return;
                if (!existed) {
                    tag.remove();
                } else if (content !== null) {
                    tag.setAttribute('content', content);
                }
            });
            if (canonical && previousCanonical !== null) {
                canonical.setAttribute('href', previousCanonical);
            }
        };
    }, [policy]);
}

/* ---------------------------------------------------------------------------
   Inline formatting
   --------------------------------------------------------------------------- */

const INLINE_PATTERN = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

/**
 * Scrolls to a clause on the current page. The scroll spy picks up the new
 * position on the next scroll event, so the table of contents follows along.
 */
function scrollToClause(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Renders the small subset of inline markup used by the policy text:
 * `code`, **bold** and [label](href). Internal links stay in the SPA;
 * external links open in a new tab and are marked for screen readers.
 */
function renderInline(text) {
    const parts = String(text).split(INLINE_PATTERN);
    return parts.map((part, i) => {
        if (!part) return null;

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

        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link) {
            const [, label, href] = link;
            const internal = href.startsWith('/');
            const anchor = href.startsWith('#');
            const className = 'font-medium text-violet-300 underline decoration-violet-400/40 underline-offset-2 transition-colors hover:text-violet-200 hover:decoration-violet-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60';

            // A link to a clause on this page: scroll to it instead of
            // navigating, so the reader keeps their place in the document.
            if (anchor) {
                const id = href.slice(1);
                return (
                    <a
                        key={i}
                        href={href}
                        onClick={(e) => {
                            e.preventDefault();
                            scrollToClause(id);
                        }}
                        className={className}
                    >
                        {label}
                    </a>
                );
            }

            if (internal) {
                return (
                    <Link key={i} to={href} className={className}>
                        {label}
                    </Link>
                );
            }

            return (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer" className={className}>
                    {label}
                    <span className="sr-only"> (opens in a new tab)</span>
                </a>
            );
        }

        return part;
    });
}

/* ---------------------------------------------------------------------------
   Blocks
   --------------------------------------------------------------------------- */

function TableBlock({ caption, head, rows }) {
    return (
        <figure className="overflow-hidden rounded-xl border border-white/[0.07]">
            {caption && (
                <figcaption className="border-b border-white/[0.07] bg-white/[0.02] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    {renderInline(caption)}
                </figcaption>
            )}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                    <thead>
                        <tr className="bg-white/[0.015]">
                            {head.map((cell) => (
                                <th
                                    key={cell}
                                    scope="col"
                                    className="whitespace-nowrap border-b border-white/[0.07] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-slate-400"
                                >
                                    {cell}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="align-top even:bg-white/[0.01]">
                                {row.map((cell, cellIndex) => (
                                    <td
                                        key={cellIndex}
                                        className={`border-b border-white/[0.05] px-4 py-3 leading-relaxed ${
                                            cellIndex === 0
                                                ? 'font-medium text-slate-200'
                                                : 'text-slate-400'
                                        }`}
                                    >
                                        {renderInline(cell)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </figure>
    );
}

function LinksBlock({ items }) {
    return (
        <ul className="space-y-2.5">
            {items.map((item) => {
                const internal = item.href.startsWith('/');
                const className = 'group flex items-start gap-2 text-sm leading-relaxed text-slate-400 transition-colors hover:text-violet-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60';

                if (internal) {
                    return (
                        <li key={item.href + item.label}>
                            <Link to={item.href} className={className}>
                                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-violet-400" aria-hidden="true" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        </li>
                    );
                }

                return (
                    <li key={item.href + item.label}>
                        <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={className}
                        >
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-violet-400" aria-hidden="true" />
                            <span className="font-medium">{item.label}</span>
                            <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            <span className="sr-only">(opens in a new tab)</span>
                        </a>
                    </li>
                );
            })}
        </ul>
    );
}

/* ---------------------------------------------------------------------------
   Page
   --------------------------------------------------------------------------- */

export default function Legal({ type }) {
    const [meta, setMeta] = useState(null);
    const policy = LEGAL_POLICIES[type] || LEGAL_POLICIES.privacy;
    const sections = useMemo(() => getPolicySections(policy), [policy]);

    const [activeId, setActiveId] = useState(sections[0]?.id || '');
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const tocNavRef = useRef(null);
    const [indicator, setIndicator] = useState({ top: 0, height: 0, groupId: null });

    const seoPolicy = useMemo(() => ({ ...policy, path: `/${type}` }), [policy, type]);
    useLegalSeo(seoPolicy);

    /* A link to a clause on another page — /cookies#managing — arrives with
       the hash set but the reader still at the top of the document. The
       client-side router does not scroll to the target, so do it here once
       the section is on the page. */
    const location = useLocation();
    useEffect(() => {
        const hash = location.hash;
        if (!hash || hash.length < 2) return undefined;

        const id = hash.slice(1);
        const raf = requestAnimationFrame(() => {
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        return () => cancelAnimationFrame(raf);
    }, [location.hash, location.pathname]);

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

    /* Scroll spy — highlight the clause the reader is on. */
    useEffect(() => {
        const onScroll = () => {
            const threshold = 200;
            let current = sections[0]?.id;
            for (const section of sections) {
                const el = document.getElementById(section.id);
                if (el && el.getBoundingClientRect().top <= threshold) {
                    current = section.id;
                }
            }
            const nearBottom =
                window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 40;
            if (nearBottom && sections.length) {
                current = sections[sections.length - 1].id;
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
    }, [sections]);

    const groups = useMemo(() => {
        const byId = new Map(sections.map((section) => [section.id, section]));
        return (policy.groups || [])
            .map((group) => ({
                ...group,
                sections: (group.sections || []).map((id) => byId.get(id)).filter(Boolean),
            }))
            .filter((group) => group.sections.length);
    }, [policy, sections]);

    /* Sliding indicator for the desktop table of contents. Each group has its
       own list, so the indicator is drawn inside the group that owns the
       active clause. */
    useEffect(() => {
        const nav = tocNavRef.current;
        if (!nav) return undefined;

        const link = nav.querySelector(`[data-toc-id="${activeId}"]`);
        const groupList = link?.closest('ul');
        if (!link || !groupList) return undefined;

        const top = link.offsetTop || 0;
        const height = link.offsetHeight || 0;
        const groupId = groupList.dataset.tocGroup || null;

        // Measure first, then apply on the next frame so the indicator never
        // moves while the browser is still laying the list out.
        const raf = requestAnimationFrame(() => {
            setIndicator({ top, height, groupId });
        });
        return () => cancelAnimationFrame(raf);
    }, [activeId, groups]);

    const scrollTo = (id) => {
        setActiveId(id);
        setMobileNavOpen(false);
        scrollToClause(id);
    };

    const activeLabel = sections.find((section) => section.id === activeId)?.label || 'Contents';

    const renderBlock = (block) => {
        switch (block.type) {
            case 'p':
                return <p className="mkt-body">{renderInline(block.text)}</p>;
            case 'h':
                return (
                    <h3 className="mkt-h4 mt-6 mb-2 text-slate-200">{renderInline(block.text)}</h3>
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
                return <LinksBlock items={block.items} />;
            case 'table':
                return <TableBlock caption={block.caption} head={block.head} rows={block.rows} />;
            case 'contact':
                return <LegalContact kind={block.kind} meta={meta} />;
            default:
                return null;
        }
    };

    return (
        <MarketingShell>
            <section className="mkt-section">
                <div className="mkt-container">
                    {/* Hero ------------------------------------------------- */}
                    <Reveal>
                        <div className="border-b border-white/[0.07] pb-8 sm:pb-10">
                            <p className="mkt-eyebrow mb-3">{policy.eyebrow}</p>
                            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                                <div className="max-w-2xl">
                                    <h1 className="mkt-h1 !text-4xl sm:!text-5xl">{policy.headline}</h1>
                                    <p className="mkt-lead mt-5">{policy.lead || policy.intro}</p>
                                    {policy.lead && (
                                        <p className="mkt-body mt-4 max-w-2xl text-sm">{policy.intro}</p>
                                    )}
                                </div>
                                <div className="flex shrink-0 flex-wrap items-center gap-3">
                                    <span className="mkt-chip">
                                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                                        Last updated:{' '}
                                        <span className="font-medium text-slate-200">{policy.lastUpdated}</span>
                                    </span>
                                    {policy.effective && (
                                        <span className="mkt-chip">
                                            Effective:{' '}
                                            <span className="font-medium text-slate-200">{policy.effective}</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Reveal>

                    {/* Summary cards ---------------------------------------- */}
                    {policy.summary?.length > 0 && (
                        <Reveal delay={60}>
                            <div className="mt-10 grid gap-4 md:grid-cols-3">
                                {policy.summary.map((card) => (
                                    <a
                                        key={card.title}
                                        href={card.href}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            scrollTo(card.href.replace('#', ''));
                                        }}
                                        className="mkt-card mkt-card-hover group flex flex-col p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                                    >
                                        <h2 className="mkt-h4 text-slate-100">{card.title}</h2>
                                        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{card.text}</p>
                                        <span className="mt-3 text-xs font-semibold text-violet-300">Read the clauses</span>
                                    </a>
                                ))}
                            </div>
                        </Reveal>
                    )}

                    {/* Mobile contents menu --------------------------------- */}
                    <div className="mt-10">
                        <div className="lg:hidden">
                            <div className="sticky top-16 z-30 -mx-5 border-y border-white/[0.07] bg-[#070A10]/92 px-5 py-2.5 backdrop-blur-xl sm:-mx-8 sm:px-8">
                                <button
                                    type="button"
                                    onClick={() => setMobileNavOpen((open) => !open)}
                                    aria-expanded={mobileNavOpen}
                                    aria-controls="legal-mobile-nav"
                                    className="flex w-full items-center justify-between gap-3 rounded-lg px-1 py-1 text-left text-sm font-medium text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                                >
                                    <span className="flex min-w-0 items-center gap-2">
                                        <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                            Contents
                                        </span>
                                        <span className="truncate text-slate-200">{activeLabel}</span>
                                    </span>
                                    <ChevronDown
                                        className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${
                                            mobileNavOpen ? 'rotate-180' : ''
                                        }`}
                                        aria-hidden="true"
                                    />
                                </button>

                                {mobileNavOpen && (
                                    <nav id="legal-mobile-nav" aria-label="Table of contents" className="mt-3 pb-3">
                                        {groups.map((group) => (
                                            <div key={group.id} className="mb-4 last:mb-0">
                                                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-300">
                                                    {group.label}
                                                </p>
                                                <ul className="space-y-1 border-l border-white/[0.08]">
                                                    {group.sections.map((section) => (
                                                        <li key={section.id}>
                                                            <a
                                                                href={`#${section.id}`}
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    scrollTo(section.id);
                                                                }}
                                                                aria-current={section.id === activeId ? 'true' : undefined}
                                                                className={`block -ml-px border-l-2 py-1 pl-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 ${
                                                                    section.id === activeId
                                                                        ? 'border-violet-400 font-medium text-violet-300'
                                                                        : 'border-transparent text-slate-400 hover:text-violet-300'
                                                                }`}
                                                            >
                                                                {section.label}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </nav>
                                )}
                            </div>
                        </div>

                        {/* Body --------------------------------------------- */}
                        <div className="mt-12 grid gap-10 lg:grid-cols-[15rem_1fr] lg:gap-14">
                            {/* Desktop navigator */}
                            <nav aria-label="Table of contents" className="hidden lg:block" ref={tocNavRef}>
                                <div className="lg:sticky lg:top-28">
                                    <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                        Table of contents
                                    </p>
                                    <div className="space-y-6">
                                        {groups.map((group) => (
                                            <div key={group.id}>
                                                <p className="mb-2 px-4 text-xs font-semibold text-slate-500">
                                                    {group.label}
                                                </p>
                                                <ul
                                                    data-toc-group={group.id}
                                                    className="relative space-y-1 border-l border-white/[0.08]"
                                                >
                                                    {group.sections.map((section) => {
                                                        const isActive = section.id === activeId;
                                                        return (
                                                            <li key={section.id}>
                                                                <a
                                                                    href={`#${section.id}`}
                                                                    data-toc-id={section.id}
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        scrollTo(section.id);
                                                                    }}
                                                                    aria-current={isActive ? 'true' : undefined}
                                                                    className={`block -ml-px border-l-2 py-1 pl-4 text-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 ${
                                                                        isActive
                                                                            ? 'border-violet-400 font-medium text-violet-300'
                                                                            : 'border-transparent text-slate-400 hover:border-slate-600 hover:text-violet-300'
                                                                    }`}
                                                                >
                                                                    {section.label}
                                                                </a>
                                                                {indicator.groupId === group.id && (
                                                                    <span
                                                                        aria-hidden="true"
                                                                        className={`pointer-events-none absolute left-[-2px] top-0 block w-[2px] rounded-full bg-violet-400 transition-all duration-300 ease-out ${
                                                                            indicator.height ? 'opacity-100' : 'opacity-0'
                                                                        }`}
                                                                        style={{
                                                                            transform: `translateY(${indicator.top}px)`,
                                                                            height: `${indicator.height}px`,
                                                                        }}
                                                                    />
                                                                )}
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 space-y-2 border-t border-white/[0.07] pt-6 text-sm">
                                        <p className="flex items-center gap-2 text-slate-400">
                                            <ShieldCheck className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                                            <Link
                                                to="/security"
                                                className="font-medium text-violet-300 underline decoration-violet-400/40 underline-offset-2 hover:text-violet-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                                            >
                                                Security page
                                            </Link>
                                        </p>
                                        <p className="flex items-center gap-2 text-slate-400">
                                            <ExternalLink className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                                            <Link
                                                to="/privacy"
                                                className="font-medium text-violet-300 underline decoration-violet-400/40 underline-offset-2 hover:text-violet-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                                            >
                                                Privacy Policy
                                            </Link>
                                        </p>
                                    </div>
                                </div>
                            </nav>

                            {/* Reading column */}
                            <article className="min-w-0 max-w-[52rem] space-y-12">
                                {sections.map((section) => (
                                    <section key={section.id} id={section.id} className="scroll-mt-32">
                                        <h2 className="mkt-h3 mb-4">{section.title}</h2>
                                        <div className="space-y-3.5">
                                            {section.blocks.map((block, i) => (
                                                <React.Fragment key={i}>{renderBlock(block)}</React.Fragment>
                                            ))}
                                        </div>
                                    </section>
                                ))}

                                <p className="border-t border-white/[0.07] pt-6 text-xs leading-relaxed text-slate-500">
                                    This page is the {policy.title.toLowerCase()} for WebPulse Analytics. The last
                                    update is shown at the top of the page. If anything here does not match what the
                                    Service actually does, the Service and this page should both be corrected —
                                    contact us and tell us which part is wrong.
                                </p>
                            </article>
                        </div>
                    </div>
                </div>
            </section>
        </MarketingShell>
    );
}
