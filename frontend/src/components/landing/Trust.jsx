import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  BookOpen,
  Code2,
  Github,
  Globe2,
  KeyRound,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import SectionHead from '../marketing/SectionHead';
import Reveal from '../marketing/Reveal';
import { REPO_URL } from '../marketing/MarketingFooter';

/**
 * Trust section built only from verifiable facts about this project:
 * open repository, documented API, per-project tracking IDs with allowed
 * origins, authenticated console sessions, and the published legal pages.
 * No certifications, customer logos, or statistics are claimed.
 */
const ITEMS = [
  {
    icon: Github,
    title: 'Open source',
    body: 'The full application — frontend, API, and tracker — is public on GitHub. Review the code, open issues, or contribute.',
    to: REPO_URL,
    cta: 'Browse the repository',
    external: true,
  },
  {
    icon: Globe2,
    title: 'Origin-restricted tracking',
    body: 'Each project stores the domains allowed to send browser events, so a tracking ID cannot be reused from an unapproved site.',
    to: '/docs/security',
    cta: 'How tracking keys work',
  },
  {
    icon: Lock,
    title: 'Authenticated console',
    body: 'Dashboard access uses session tokens delivered as HttpOnly cookies. Passwords are hashed, and active sessions can be reviewed and revoked from settings.',
    to: '/security',
    cta: 'Security overview',
  },
  {
    icon: Code2,
    title: 'Documented REST API',
    body: 'Send page views and custom events, or read analytics programmatically. The tracking layer is a single documented endpoint.',
    to: '/docs/api',
    cta: 'Read the API reference',
  },
];

export default function Trust() {
  return (
    <section className="mkt-section border-y border-white/[0.06] bg-white/[0.012]">
      <div className="mkt-container">
        <SectionHead
          eyebrow="Trust & transparency"
          title="Analytics you can verify, not just believe."
          description="WebPulse is an early-stage, open-source product. Everything below is something you can inspect in the repository or in the documentation today."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            const link = item.external ? (
              <a
                href={item.to}
                target="_blank"
                rel="noopener noreferrer"
                className="mkt-link mt-5"
              >
                {item.cta}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            ) : (
              <Link to={item.to} className="mkt-link mt-5">
                {item.cta}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            );

            return (
              <Reveal key={item.title} className="mkt-card mkt-card-hover p-6">
                <span className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <h3 className="mkt-h4">{item.title}</h3>
                <p className="mkt-body mt-2 text-sm">{item.body}</p>
                {link}
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 rounded-2xl border border-white/[0.06] bg-white/[0.015] px-6 py-5 text-center">
          <span className="inline-flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-violet-300" aria-hidden="true" />
            Every collected field is documented
          </span>
          <span className="inline-flex items-center gap-2 text-xs text-slate-400">
            <KeyRound className="h-4 w-4 text-violet-300" aria-hidden="true" />
            Tracking IDs are public identifiers — never secrets
          </span>
          <span className="inline-flex items-center gap-2 text-xs text-slate-400">
            <BookOpen className="h-4 w-4 text-violet-300" aria-hidden="true" />
            Setup and limits documented publicly
          </span>
        </Reveal>
      </div>
    </section>
  );
}
