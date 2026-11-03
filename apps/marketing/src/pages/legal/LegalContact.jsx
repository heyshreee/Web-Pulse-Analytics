import { useState } from 'react';
import { ArrowRight, ExternalLink, Lock, Mail, ShieldAlert } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { useToast } from '../../context/ToastContext';

/**
 * Request kinds the backend knows how to route. Each one is delivered to a
 * dedicated mailbox (support / privacy / legal), so a data request never
 * ends up in a general support queue.
 */
const CHANNELS = {
    support: {
        kind: 'support',
        label: 'Support question',
        description: 'How to use WebPulse, a plan or limit question, or a problem with your account.',
        placeholder: 'Tell us what you were trying to do and what happened.',
    },
    privacy: {
        kind: 'privacy',
        label: 'Privacy or data request',
        description: 'Access, correction, deletion or portability of your data, or a question about how we handle it.',
        placeholder: 'Tell us which data you are asking about and what you would like us to do.',
    },
    legal: {
        kind: 'legal',
        label: 'Legal notice or terms question',
        description: 'A question about these Terms, a billing dispute, or a formal notice to WebPulse.',
        placeholder: 'Tell us what your request relates to and include any references you have.',
    },
};

/** Which kinds a page offers, and the one selected by default. */
const PAGE_CHANNELS = {
    support: { options: ['support', 'privacy', 'legal'], default: 'support' },
    privacy: { options: ['privacy', 'support'], default: 'privacy' },
    legal: { options: ['legal', 'privacy', 'support'], default: 'legal' },
};

const inputClass =
    'w-full rounded-lg border border-white/[0.09] bg-white/[0.03] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 transition-colors focus:border-violet-400/50 focus:outline-none focus:ring-2 focus:ring-violet-500/40';

const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500';

/**
 * Private contact channel for the legal pages.
 *
 * A public GitHub issue is the wrong place for a billing dispute, an account
 * deletion request, or anything confidential, so the form posts to the
 * monitored mailbox for the selected request kind instead. Public GitHub
 * issues stay available for public bug reports and feature requests, and
 * security reports use the private advisory channel.
 */
export default function LegalContact({ kind = 'support', meta }) {
    const { showToast } = useToast();
    const config = PAGE_CHANNELS[kind] || PAGE_CHANNELS.support;
    const [channel, setChannel] = useState(config.default);
    const [form, setForm] = useState({ name: '', email: '', account: '', subject: '', message: '' });
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState('');

    const active = CHANNELS[channel] || CHANNELS[config.default];
    const supportEmail = meta?.supportEmail;
    const privacyEmail = meta?.privacyEmail;
    const legalEmail = meta?.legalEmail;
    const issuesUrl = meta?.issues;
    const advisoriesUrl = meta?.securityAdvisories;

    const update = (field) => (event) => {
        setForm((prev) => ({ ...prev, [field]: event.target.value }));
        if (error) setError('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setStatus('sending');
        setError('');

        try {
            await apiRequest('/meta/contact', {
                method: 'POST',
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    account: form.account,
                    subject: form.subject || active.label,
                    message: form.message,
                    kind: active.kind,
                }),
            });
            setStatus('sent');
            setForm({ name: '', email: '', account: '', subject: '', message: '' });
            showToast('Your message has been sent. We will reply to the address you gave us.', 'success');
        } catch (err) {
            setStatus('idle');
            setError(
                err?.message === 'Request failed' || err?.status >= 500
                    ? 'We could not send your message right now. Please email us directly instead — the address is listed below.'
                    : err?.message || 'Something went wrong while sending your message.'
            );
        }
    };

    const mailbox = active.kind === 'privacy' ? privacyEmail : active.kind === 'legal' ? legalEmail : supportEmail;

    return (
        <div className="mkt-card space-y-6 p-5 sm:p-6">
            <div className="space-y-2">
                <p className="mkt-eyebrow">
                    <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                    Private channel
                </p>
                <p className="text-sm leading-relaxed text-slate-400">
                    This form goes straight to a monitored mailbox. Nothing you write here is posted to a
                    public issue tracker.
                </p>
            </div>

            {status === 'sent' ? (
                <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/[0.06] p-4 text-sm leading-relaxed text-emerald-200">
                    <p className="font-semibold">Message sent.</p>
                    <p className="mt-1 text-emerald-200/80">
                        We have it, and we will reply to the address you gave us. If your request is urgent,
                        use the direct mailbox below.
                    </p>
                    <button
                        type="button"
                        onClick={() => setStatus('idle')}
                        className="mt-3 text-sm font-semibold text-emerald-200 underline underline-offset-4 hover:text-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60"
                    >
                        Send another message
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {config.options.length > 1 && (
                        <div>
                            <label className={labelClass} htmlFor={`contact-kind-${kind}`}>
                                Request type
                            </label>
                            <select
                                id={`contact-kind-${kind}`}
                                value={channel}
                                onChange={(event) => setChannel(event.target.value)}
                                className={inputClass}
                            >
                                {config.options.map((option) => (
                                    <option key={option} value={option} className="bg-slate-900">
                                        {CHANNELS[option].label}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{active.description}</p>
                        </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className={labelClass} htmlFor={`contact-name-${kind}`}>
                                Your name
                            </label>
                            <input
                                id={`contact-name-${kind}`}
                                type="text"
                                value={form.name}
                                onChange={update('name')}
                                autoComplete="name"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass} htmlFor={`contact-email-${kind}`}>
                                Your email <span className="text-rose-400">*</span>
                            </label>
                            <input
                                id={`contact-email-${kind}`}
                                type="email"
                                required
                                value={form.email}
                                onChange={update('email')}
                                autoComplete="email"
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {active.kind === 'privacy' && (
                        <div>
                            <label className={labelClass} htmlFor={`contact-account-${kind}`}>
                                WebPulse account email
                            </label>
                            <input
                                id={`contact-account-${kind}`}
                                type="email"
                                value={form.account}
                                onChange={update('account')}
                                autoComplete="email"
                                placeholder="The address your WebPulse account uses"
                                className={inputClass}
                            />
                            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                                Include this so we can find your account and verify the request.
                            </p>
                        </div>
                    )}

                    <div>
                        <label className={labelClass} htmlFor={`contact-subject-${kind}`}>
                            Subject
                        </label>
                        <input
                            id={`contact-subject-${kind}`}
                            type="text"
                            value={form.subject}
                            onChange={update('subject')}
                            placeholder={active.label}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className={labelClass} htmlFor={`contact-message-${kind}`}>
                            Message <span className="text-rose-400">*</span>
                        </label>
                        <textarea
                            id={`contact-message-${kind}`}
                            required
                            rows={5}
                            minLength={10}
                            value={form.message}
                            onChange={update('message')}
                            placeholder={active.placeholder}
                            aria-describedby={error ? `contact-error-${kind}` : undefined}
                            className={`${inputClass} resize-y`}
                        />
                    </div>

                    {error && (
                        <p
                            id={`contact-error-${kind}`}
                            role="alert"
                            className="rounded-lg border border-amber-400/20 bg-amber-500/[0.06] px-3 py-2 text-sm leading-relaxed text-amber-200"
                        >
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={status === 'sending'}
                        className="mkt-btn mkt-btn-primary mkt-btn-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                    >
                        {status === 'sending' ? 'Sending\u2026' : 'Send message'}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                </form>
            )}

            <div className="space-y-3 border-t border-white/[0.07] pt-5">
                {mailbox && (
                    <p className="flex items-start gap-2 text-sm leading-relaxed text-slate-400">
                        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                        <span>
                            Prefer email? Write to{' '}
                            <a
                                href={`mailto:${mailbox}`}
                                className="mkt-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                            >
                                {mailbox}
                            </a>
                            .
                        </span>
                    </p>
                )}

                {advisoriesUrl && (
                    <p className="flex items-start gap-2 text-sm leading-relaxed text-slate-400">
                        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                        <span>
                            Found a security problem? Do not post it publicly — use the{' '}
                            <a
                                href={advisoriesUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mkt-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                            >
                                private advisory channel
                                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                            </a>
                            .
                        </span>
                    </p>
                )}

                {issuesUrl && (
                    <p className="flex items-start gap-2 text-sm leading-relaxed text-slate-400">
                        <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                        <span>
                            Reporting a public bug or asking for a feature?{' '}
                            <a
                                href={issuesUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mkt-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                            >
                                Open a GitHub issue
                                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                            </a>{' '}— but never post account, billing or personal data there.
                        </span>
                    </p>
                )}
            </div>
        </div>
    );
}
