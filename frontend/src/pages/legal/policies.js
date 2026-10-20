/**
 * Legal policy content.
 *
 * Everything a legal page renders lives here as plain data so the wording can
 * be reviewed without touching the page component. Each policy declares:
 *
 *   title / eyebrow / headline / intro / lead  — hero copy
 *   lastUpdated / effective                    — dates shown next to the title
 *   seo                                         — title + description for <head>
 *   summary                                     — the "what these terms cover" cards
 *   groups                                      — table-of-contents categories
 *   sections                                    — the numbered clauses
 *
 * Block types understood by pages/Legal.jsx:
 *   p, h, list, steps, note, links, table, contact
 */

const REPO_URL = 'https://github.com/heyshreee/Web-Pulse-Analytics';
const LICENSE_URL = `${REPO_URL}/blob/HEAD/LICENSE`;

export const LEGAL_POLICIES = {
    privacy: {
        title: 'Privacy Policy',
        eyebrow: 'Legal · Privacy Policy',
        headline: 'What we collect, why we collect it, and what you can control.',
        intro: 'WebPulse Analytics ("WebPulse", "we", "us", or "our") provides website analytics and monitoring services. This Privacy Policy explains what information we collect, how we use it, how we protect it, and the choices available to you.',
        lastUpdated: 'October 20, 2026',
        seo: {
            title: 'Privacy Policy | WebPulse Analytics',
            description:
                'Learn what WebPulse Analytics collects, how website visitor data is processed, how long it is retained, which providers process it, and how to exercise your privacy choices.'
        },
        summary: [
            {
                title: 'What is collected',
                text: 'Account details, the analytics fields listed in section 1, and the messages you send to support.',
                href: '#collect'
            },
            {
                title: 'How long it is kept',
                text: 'Retention varies by record type. Analytics data is kept until you delete the associated project.',
                href: '#retention'
            },
            {
                title: 'Your choices',
                text: 'Manage tracking configuration, allowed origins, and project deletion in the dashboard — or ask us privately.',
                href: '#rights'
            }
        ],
        groups: [
            {
                id: 'group-privacy-collection',
                label: 'Collection and use',
                sections: ['collect', 'use', 'visitors']
            },
            {
                id: 'group-privacy-lifecycle',
                label: 'Tracking and lifecycle',
                sections: ['cookies', 'retention', 'sharing']
            },
            {
                id: 'group-privacy-protection',
                label: 'Protection and rights',
                sections: ['security', 'api-keys', 'rights', 'children']
            },
            {
                id: 'group-privacy-operations',
                label: 'Operations and legal',
                sections: ['transfers', 'third-parties', 'changes', 'contact']
            }
        ],
        sections: [
            {
                id: 'collect',
                title: '1. Information We Collect',
                blocks: [
                    { type: 'p', text: 'We collect information in several ways.' },
                    { type: 'h', text: 'Account information' },
                    { type: 'p', text: 'When you create a WebPulse account, we may collect:' },
                    { type: 'list', items: [
                        'Email address',
                        'Account credentials, managed through our authentication provider',
                        'Account and project configuration',
                        'Authentication and session information, including the IP address and device used to sign in',
                        'Billing information, where you make a purchase'
                    ] },
                    { type: 'p', text: 'We collect only the information required to provide and secure the service.' },
                    { type: 'h', text: 'Website analytics data' },
                    { type: 'p', text: 'When a WebPulse customer installs the tracking script on a website, we record information about visitor activity. Based on the current implementation, this includes:' },
                    { type: 'list', items: [
                        'The full URL of the page visited, including any query string in it',
                        'The page title, where the tracking call provides one',
                        'Referrer information — the page that linked to the one being viewed',
                        'The time we received the page view',
                        'The visitor\u2019s user agent string, from which we derive browser, operating system, and device type',
                        'The visitor\u2019s IP address, stored as collected and not truncated, used to derive an approximate country and city, and for abuse prevention and duplicate filtering',
                        'A session identifier we derive from the IP address, user agent, and project, used to group a visitor\u2019s activity',
                        'Project and tracking identifiers'
                    ] },
                    { type: 'p', text: 'Each visitor record holds the most recent page URL and referrer for that visitor, alongside the page views recorded for them.' },
                    { type: 'p', text: 'We do not store latitude and longitude. When you open a visitor\u2019s location in the dashboard or the API, we derive approximate coordinates from the stored IP address at that moment and return them for display.' },
                    { type: 'p', text: 'The tracking script accepts custom event data. **Neither the name of a custom event nor the extra fields sent with it are stored today** — we record the page views and the visitor fields listed above, and nothing else from the event payload.' },
                    { type: 'p', text: 'The tracking script sends the page URL exactly as the browser shows it. If a URL carries personal information in its query string, that information is recorded, so please do not put personal information in a tracked URL.' },
                    { type: 'h', text: 'Information you provide' },
                    { type: 'p', text: 'We may also receive information when you contact support, submit feedback, report a bug, or request a feature.' },
                    { type: 'note', text: 'The exact fields above reflect the current WebPulse tracker and API, which are documented under /docs. We\u2019ll update this policy if the fields or processing change.' }
                ]
            },
            {
                id: 'use',
                title: '2. How We Use Information',
                blocks: [
                    { type: 'p', text: 'We use collected information to:' },
                    { type: 'list', items: [
                        'Provide WebPulse analytics and monitoring',
                        'Process and display analytics in the dashboard and API',
                        'Show you approximate visitor locations, so you can see where traffic comes from',
                        'Maintain your account and authenticate users',
                        'Secure the platform and detect abuse or unauthorized activity',
                        'Enforce plan limits (for example, monthly views, project, and allowed-origin limits)',
                        'Diagnose technical problems and improve WebPulse',
                        'Provide customer support',
                        'Process payments, where applicable',
                        'Communicate important service information'
                    ] },
                    { type: 'p', text: 'We don\u2019t use analytics data for purposes unrelated to providing and improving the service, unless otherwise disclosed. We do not sell it, and we do not use it to build advertising profiles.' }
                ]
            },
            {
                id: 'visitors',
                title: '3. Website Visitor Data',
                blocks: [
                    { type: 'p', text: 'When a website operator installs the WebPulse tracking script, WebPulse processes information about activity on that website to provide analytics. Three parties are involved:' },
                    { type: 'list', items: [
                        '**The website operator** — the WebPulse customer who decides to use analytics and configures the tracking.',
                        '**WebPulse** — the service provider that processes the analytics information so the customer can use the product.',
                        '**The website visitor** — the person whose browsing activity may be recorded.'
                    ] },
                    { type: 'p', text: 'The visitor information we record is listed in section 1. Website operators are responsible for configuring tracking appropriately, informing visitors about the relevant data processing, and determining whether consent or other notices are required for their use case. WebPulse customers should not send passwords, payment details, or other sensitive information through page URLs or event data.' },
                    { type: 'p', text: 'WebPulse processes analytics information to provide the service and to protect its operation. Our responsibilities and those of website operators depend on the applicable agreement and the law that applies to you.' },
                    { type: 'note', text: 'The exact legal roles — controller, processor, or a third party — differ by jurisdiction and by how you use the Service. This section describes the practical arrangement; it is not legal advice.' }
                ]
            },
            {
                id: 'cookies',
                title: '4. Cookies and Similar Technologies',
                blocks: [
                    { type: 'p', text: 'WebPulse uses one cookie, and it is in the product itself. The tracking script does not use cookies at all. Here is the difference:' },
                    { type: 'table',
                        caption: 'Cookies and tracking, side by side',
                        head: ['Where', 'What it does'],
                        rows: [
                            ['**WebPulse dashboard**', 'Sets a `token` cookie to keep you signed in. It is `HttpOnly` (page scripts cannot read it), `Secure` in production, `SameSite=None` in production and `SameSite=Lax` in development, lasts 7 days, and is scoped to the host that set it. The token is never written to `localStorage` and is never returned in an API response body.'],
                            ['**Website tracking script**', 'Sets and reads no cookies, uses no `localStorage`, and performs no browser fingerprinting. It records a page view with `navigator.sendBeacon`, or `fetch` with `keepalive` as a fallback.'],
                            ['**WebPulse marketing site**', 'Uses no advertising cookies and embeds no third-party advertising trackers.']
                        ]
                    },
                    { type: 'p', text: 'If you sign in with Google, Google may set its own cookies as part of the OAuth flow, under Google\u2019s privacy policy.' },
                    { type: 'note', text: 'WebPulse is not cookie-free as a whole. The authenticated dashboard uses a session cookie; the tracking script that runs on your visitors\u2019 browsers does not use cookies. Not using cookies does not by itself make a deployment exempt from consent or other privacy requirements — those depend on your jurisdiction and on how you use the Service.' },
                    { type: 'links', items: [
                        { label: 'Cookie Policy', href: '/cookies' },
                        { label: 'How to control cookies in your browser', href: '/cookies#managing' }
                    ] }
                ]
            },
            {
                id: 'retention',
                title: '5. Data Retention',
                blocks: [
                    { type: 'p', text: 'We keep information for as long as we need it to provide the service, keep it secure, meet legal obligations, and resolve disputes. The current behaviour, record type by record type, is:' },
                    { type: 'table',
                        caption: 'How long each record type is kept',
                        head: ['Record type', 'What happens'],
                        rows: [
                            ['Analytics records — visitors, page views, counters, monthly usage', 'Retained until you delete the associated project.'],
                            ['Project activity logs', 'Capped at the 1,000 most recent entries per project; the oldest are removed as new ones arrive. Account-level entries that are not tied to a project are not subject to this cap.'],
                            ['Activity log history', 'The dashboard shows the most recent 30 days of activity. Older entries stay in the log until the 1,000-entry cap removes them.'],
                            ['Authentication sessions', 'Expire 7 days after they are created, or earlier if you sign out, change your password, or revoke them from Account Settings. A revoked session is marked as revoked and kept as a record.'],
                            ['Password reset and email verification tokens', 'Expire after 15 minutes and 10 minutes respectively.'],
                            ['Duplicate tracking requests', 'Identical requests from the same IP address, user agent, and tracking ID are ignored within a short in-memory window — about 2 seconds on the current tracking endpoint. The window is held in memory only and is not persisted.'],
                            ['Geolocation lookups', 'Results are cached in memory for 24 hours and are not written to a separate store.'],
                            ['Backups and provider copies', 'Database backups and point-in-time recovery are managed by our database provider, and copies held by payment, email, and hosting providers follow those providers\u2019 own retention. We do not publish those windows, so confirm them with the provider before you rely on a deletion window.']
                        ]
                    },
                    { type: 'p', text: 'WebPulse does not currently offer configurable, time-based analytics retention. Deleting a project removes that project\u2019s page views, visitors, counters, and usage records, and the project itself, including any public share link.' },
                    { type: 'note', text: 'Deleting a project does not remove every trace of the data it produced. Activity log entries for that project are kept, and those entries can include the visitor IP address and the page URL that was recorded. They leave the log when the 1,000-entry cap removes them, or when you ask us to delete them. The audit and notification records created by the deletion itself are kept as well.' },
                    { type: 'p', text: 'If we add configurable retention windows or bulk-deletion controls, we\u2019ll document them here and in the docs.' }
                ]
            },
            {
                id: 'sharing',
                title: '6. Data Sharing',
                blocks: [
                    { type: 'p', text: 'We do not sell personal information. WebPulse shares information only in these circumstances:' },
                    { type: 'list', items: [
                        'With the service providers that operate WebPulse — hosting, database, authentication, email delivery, payment processing, avatar hosting, identity, and geolocation providers (see section 12)',
                        'With our geolocation provider, to derive an approximate country and city from a visitor\u2019s IP address. The IP address is sent over HTTPS for that lookup, and is not sent anywhere else',
                        'When you explicitly make something public — for example, a shared report link, which exposes aggregate traffic data for that project to anyone who holds the link',
                        'With legal authorities or others when we believe in good faith that disclosure is required by law, regulation, or legal process, or to protect rights, safety, or property'
                    ] },
                    { type: 'p', text: 'We do not share your analytics data with other WebPulse customers.' }
                ]
            },
            {
                id: 'security',
                title: '7. Data Security',
                blocks: [
                    { type: 'p', text: 'We use reasonable technical and organizational measures designed to protect information against unauthorized access, alteration, disclosure, or destruction. Controls implemented today include:' },
                    { type: 'list', items: [
                        'HTTPS on the service domains',
                        'Passwords stored and hashed through Supabase Auth — WebPulse never stores plaintext passwords',
                        'HttpOnly session cookies and JWTs, email verification, and project-scoped permissions',
                        'Per-project tracking IDs with configurable allowed origins, enforced by origin whitelisting on the backend',
                        'Server-side rate limiting and bot filtering on tracking endpoints',
                        'CSRF protection via a required custom request header'
                    ] },
                    { type: 'p', text: 'Visitor IP addresses are stored as collected, without truncation. Treat the analytics data in your dashboard as containing personal information, and export it accordingly.' },
                    { type: 'p', text: 'No method of transmission or storage is fully secure. We encourage following the security practices in our documentation, such as keeping tracking IDs scoped to the projects and origins you intend to track.' },
                    { type: 'links', items: [
                        { label: 'Security page', href: '/security' },
                        { label: 'Security documentation', href: '/docs/security' }
                    ] }
                ]
            },
            {
                id: 'api-keys',
                title: '8. API Keys and Credentials',
                blocks: [
                    { type: 'p', text: 'WebPulse exposes public tracking endpoints and an authenticated API.' },
                    { type: 'p', text: 'Tracking IDs are public by design: they identify a project and are safe to expose in the browser. Account credentials (passwords, OAuth tokens, and authenticated session credentials) are sensitive and should be treated as confidential — don\u2019t commit secrets to public repositories or ship them in client-side code.' },
                    { type: 'p', text: 'Users are responsible for keeping their credentials secure. Where WebPulse holds credentials, it protects them with server-side controls (HttpOnly cookies and server-held service keys).' }
                ]
            },
            {
                id: 'rights',
                title: '9. Your Rights and Choices',
                blocks: [
                    { type: 'p', text: 'Depending on the law that applies to you, you may have rights over your personal information. These may include the right to access it, correct it, delete it, restrict or object to how we process it, and receive it in a portable form.' },
                    { type: 'h', text: 'What you can do yourself' },
                    { type: 'list', items: [
                        'Delete a project to remove its analytics records — page views, visitors, counters, and usage',
                        'Change your password and update your profile in account settings',
                        'Manage allowed origins and tracking configuration per project',
                        'Revoke a sign-in session from Account Settings',
                        'Revoke a public share link from project settings'
                    ] },
                    { type: 'h', text: 'What you can ask us for' },
                    { type: 'p', text: 'Account deletion and data export are handled manually, through the private channel in section 14. Include the address on your account so we can find it and verify the request.' },
                    { type: 'p', text: 'We will review requests in line with the law that applies to you, and we will tell you what the current product can and cannot do — including where a request is limited because a record sits with a third-party provider.' },
                    { type: 'note', text: 'Account deletion is not currently available through self-service settings. When we delete an account we remove its projects and their analytics records; we keep payment and invoice records, security logs, and records needed to establish or defend a legal claim, for as long as that obligation lasts.' }
                ]
            },
            {
                id: 'children',
                title: '10. Children\u2019s Privacy',
                blocks: [
                    { type: 'p', text: 'WebPulse is not intended for children under 13 (or the minimum age under applicable law), and we do not knowingly collect personal information from children. If you believe a child has provided us personal information, contact us and we\u2019ll review and remove it where we can.' }
                ]
            },
            {
                id: 'transfers',
                title: '11. International Data Transfers',
                blocks: [
                    { type: 'p', text: 'WebPulse runs on cloud infrastructure, so information may be stored and processed outside the country you are in. The database and authentication run on Supabase, the marketing site and backend on Vercel, payments through Razorpay, transactional email through Resend, avatar storage through Cloudinary, and IP geolocation through IPWhois.io — each of which may process data in the countries where it and its sub-processors operate.' },
                    { type: 'p', text: 'Where a provider moves personal data across a border, it relies on its own transfer mechanism — for example, the European Commission\u2019s Standard Contractual Clauses where applicable. Those mechanisms are described in each provider\u2019s privacy information, linked in section 12. Where we transfer data ourselves, the basis is the agreement between us and, where applicable, your instructions as the website operator.' },
                    { type: 'p', text: 'We do not treat your use of WebPulse as a blanket authorization for international transfers. If you are in a jurisdiction that requires a particular safeguard, tell us through the contact channel and we will tell you what we can do and what we cannot.' },
                    { type: 'note', text: 'Which regions your data lands in depends on where your database is hosted and on the providers configured for a deployment. Ask us if you need that confirmed for your own setup.' }
                ]
            },
            {
                id: 'third-parties',
                title: '12. Third-Party Services',
                blocks: [
                    { type: 'p', text: 'WebPulse depends on third-party services. Each of them processes data under its own terms and privacy policy, and we do not control them:' },
                    { type: 'table',
                        caption: 'Providers, and what each one does',
                        head: ['Provider', 'What it does for us'],
                        rows: [
                            ['**Supabase**', 'Hosts the database and handles authentication. The region your data is stored in depends on where the database project is hosted. [Privacy policy](https://supabase.com/privacy)'],
                            ['**Razorpay**', 'Processes payments. [Privacy policy](https://razorpay.com/privacy-policy/)'],
                            ['**Resend**', 'Delivers transactional email — verification codes, receipts, and sign-in alerts. [Privacy policy](https://resend.com/legal/privacy-policy)'],
                            ['**Vercel**', 'Hosts the marketing site and runs the backend. [Privacy policy](https://vercel.com/legal/privacy-notice)'],
                            ['**Google**', 'Sign-in with Google. [Privacy policy](https://policies.google.com/privacy)'],
                            ['**Cloudinary**', 'Stores a profile picture, if you upload one. [Privacy policy](https://cloudinary.com/privacy)'],
                            ['**IPWhois.io**', 'Looks up an approximate country and city for a visitor\u2019s IP address. If that lookup fails, we fall back to an offline geolocation database that never sends the IP address anywhere. [Privacy policy](https://ipwhois.io/privacy)']
                        ]
                    },
                    { type: 'p', text: 'We are responsible for the Service we operate, but we are not responsible for a third-party provider\u2019s availability, security, or conduct, and we cannot control how a provider handles data once it receives it. If a provider is unavailable or changes its behaviour, part of the Service may be affected — a payment may fail at checkout, or sign-in may be interrupted.' }
                ]
            },
            {
                id: 'changes',
                title: '13. Changes to This Policy',
                blocks: [
                    { type: 'p', text: 'We may update this Privacy Policy from time to time. When we make changes, we\u2019ll update the "Last updated" date and, where appropriate, provide additional notice.' },
                    { type: 'p', text: 'For changes that materially affect you — what we collect, how long we keep it, or who we share it with — we will notify account holders by email or in the Service before the change takes effect, and describe what is changing. If something here does not match what the Service actually does, tell us and we will correct both.' }
                ]
            },
            {
                id: 'contact',
                title: '14. Contact',
                blocks: [
                    { type: 'p', text: 'If you have questions about this Privacy Policy or how WebPulse handles personal information — including access, correction, deletion, or portability requests — contact us using the private channel below. It reaches a monitored mailbox, not a public issue tracker.' },
                    { type: 'contact', kind: 'privacy' },
                    { type: 'p', text: 'Please do not include passwords, session tokens, or other sensitive personal information in a request. If you are asking about data collected from your own visitors, tell us which project and period you mean and we will look into it.' },
                    { type: 'links', items: [
                        { label: 'Security page', href: '/security' },
                        { label: 'Cookie Policy', href: '/cookies' },
                        { label: 'Terms of Service', href: '/terms' },
                        { label: 'Help Center', href: '/help' }
                    ] }
                ]
            }
        ]
    },
    terms: {
        title: 'Terms of Service',
        eyebrow: 'Legal · Terms of Service',
        headline: 'Clear terms for using WebPulse.',
        intro: 'These Terms of Service ("Terms") govern your access to and use of WebPulse Analytics ("WebPulse", "we", "us", or "our"). By creating an account or using WebPulse, you agree to these Terms. If you do not agree with these Terms, do not use the Service.',
        lead: 'These terms explain how you can use WebPulse Analytics, how accounts and subscriptions work, what responsibilities apply to website tracking, and what to expect as the service evolves.',
        lastUpdated: 'October 20, 2026',
        effective: 'October 20, 2026',
        seo: {
            title: 'Terms of Service | WebPulse Analytics',
            description:
                'Review the WebPulse Analytics terms covering account use, website tracking, plans, billing, data responsibilities, service availability, and termination.'
        },
        summary: [
            {
                title: 'Your account and responsibilities',
                text: 'Account security, acceptable use, and website visitor data.',
                href: '#accounts'
            },
            {
                title: 'Plans and payments',
                text: 'Pricing, plan limits, one-time orders, and refunds.',
                href: '#billing'
            },
            {
                title: 'Service and legal terms',
                text: 'Availability, termination, liability, and dispute handling.',
                href: '#availability'
            }
        ],
        groups: [
            {
                id: 'group-usage',
                label: 'Using WebPulse',
                sections: ['service', 'accounts', 'acceptable-use', 'visitors']
            },
            {
                id: 'group-data',
                label: 'Data and commercial terms',
                sections: ['your-data', 'api-keys', 'billing', 'free-plans', 'ip']
            },
            {
                id: 'group-operations',
                label: 'Service operations',
                sections: ['third-parties', 'availability', 'security', 'suspension', 'termination']
            },
            {
                id: 'group-legal',
                label: 'Legal provisions',
                sections: ['disclaimers', 'liability', 'indemnification', 'changes-terms', 'governing-law', 'contact']
            }
        ],
        sections: [
            {
                id: 'service',
                title: '1. The Service',
                blocks: [
                    { type: 'p', text: 'WebPulse provides website analytics, visitor tracking, event collection, monitoring, and related software services. "Service" means the hosted WebPulse application, its API and tracking endpoints, and the documentation and materials we publish for them.' },
                    { type: 'p', text: 'The features available to you depend on your plan and on the version of the Service deployed for your account. The documentation under /docs describes the version that is actually running, and is the reference for what the Service does today.' },
                    { type: 'p', text: 'We may add, change, or remove features as the Service evolves. We may also publish a roadmap, but a roadmap is not a commitment: it does not oblige us to deliver a feature, and it is not a guarantee that a feature will ship on any date.' },
                    { type: 'note', text: 'If a change materially reduces what a paid plan provides, we will describe the change on this page and give account holders notice before it takes effect.' }
                ]
            },
            {
                id: 'accounts',
                title: '2. Accounts',
                blocks: [
                    { type: 'p', text: 'You may need an account to use certain WebPulse features. If you use WebPulse on behalf of an organisation, you confirm that you can bind that organisation to these Terms.' },
                    { type: 'p', text: 'You must be at least 13 years old \u2014 or the minimum age at which you can enter into a binding contract where you live \u2014 and you must be legally able to enter into a binding contract.' },
                    { type: 'p', text: 'You are responsible for:' },
                    { type: 'list', items: [
                        'Providing accurate account information and keeping it current',
                        'Keeping your credentials secure',
                        'Maintaining the security of your account',
                        'All activity performed through your account',
                        'Notifying us promptly if you suspect unauthorized access',
                        'Ensuring that anyone you give access to follows these Terms'
                    ] },
                    { type: 'p', text: 'You must not share your account credentials with others in a way that compromises account security. Sharing one login between unrelated people is not permitted.' },
                    { type: 'p', text: 'If you believe your account has been accessed without permission, contact us through the channel in section 20. You can revoke affected sessions yourself from Account Settings while you wait for our reply.' }
                ]
            },
            {
                id: 'acceptable-use',
                title: '3. Acceptable Use',
                blocks: [
                    { type: 'p', text: 'You may use WebPulse only for lawful purposes. You must not use WebPulse to:' },
                    { type: 'list', items: [
                        'Violate applicable laws or regulations',
                        'Access systems or data without authorization',
                        'Interfere with the operation of the Service',
                        'Attempt to bypass security, rate, or usage controls',
                        'Abuse the tracking or API infrastructure',
                        'Distribute malware or malicious code',
                        'Conduct unauthorized surveillance',
                        'Collect information unlawfully',
                        'Attack or disrupt third-party services',
                        'Circumvent account, plan, or access restrictions'
                    ] },
                    { type: 'p', text: 'We may investigate suspected abuse and take appropriate action, including revoking credentials or suspending access. Where a lighter step resolves the issue \u2014 a warning, a lower limit, or a request to change your tracking configuration \u2014 we will take that step first, and we will explain the reason for anything we do.' }
                ]
            },
            {
                id: 'visitors',
                title: '4. Website Visitor Data',
                blocks: [
                    { type: 'p', text: 'If you use WebPulse to collect analytics from visitors to your website or application, **you decide** what is collected and why. WebPulse processes that data on your behalf, according to the configuration you set.' },
                    { type: 'p', text: 'You are responsible for:' },
                    { type: 'list', items: [
                        'Providing appropriate privacy notices',
                        'Obtaining consent where required',
                        'Configuring tracking appropriately',
                        'Avoiding unlawful collection of personal information',
                        'Responding to requests from your website users where applicable'
                    ] },
                    { type: 'p', text: 'WebPulse does not determine what information you choose to collect through your implementation. The tracking script stores the fields described in the Privacy Policy and the /docs tracking pages; the custom event name and any extra fields you send are not stored.' },
                    { type: 'p', text: 'Requests from your own visitors \u2014 an access or deletion request, for example \u2014 are yours to answer. We will help where a request concerns data we hold on your behalf, but we cannot answer a visitor request on your behalf unless you instruct us to.' }
                ]
            },
            {
                id: 'your-data',
                title: '5. Your Data',
                blocks: [
                    { type: 'p', text: 'You retain your rights to the data and content you submit to WebPulse. We do not claim ownership of your analytics data.' },
                    { type: 'p', text: 'You grant WebPulse a limited licence to process, store, transmit and display that data, and to operate, maintain, secure and improve the Service \u2014 including enforcing plan limits, providing support, and diagnosing technical problems. The licence is limited to what is necessary to provide the Service; it does not transfer ownership.' },
                    { type: 'p', text: 'That licence continues for as long as we hold the data. It also continues for the limited period during which a copy remains in a backup, or where we must keep a record to meet a legal, tax, fraud-prevention or security obligation. When the data is deleted and no such copy or obligation remains, the licence ends.' },
                    { type: 'p', text: 'We may create aggregated or de-identified statistics about how the Service is used, provided they cannot be linked back to you or to your visitors. We do not sell your analytics data, and we do not use it for purposes unrelated to providing and improving the Service unless we disclose that first.' }
                ]
            },
            {
                id: 'api-keys',
                title: '6. API Keys and Tracking Credentials',
                blocks: [
                    { type: 'p', text: 'WebPulse uses three different kinds of credential. They are not interchangeable, and they are not equally sensitive.' },
                    { type: 'h', text: 'Public identifiers' },
                    { type: 'p', text: 'Tracking IDs are public by design. They identify a project and are meant to be visible in the browser, so treat them as public. Restrict what a tracking ID can do by scoping it to the origins you intend to track.' },
                    { type: 'h', text: 'Private credentials' },
                    { type: 'p', text: 'Passwords, OAuth tokens, and session credentials are private. The session cookie is `HttpOnly` and cannot be read by page scripts, but you must still not publish it, commit it to a repository, or send it to anyone else.' },
                    { type: 'h', text: 'Share links' },
                    { type: 'p', text: 'Public report links are share tokens scoped to a single project. Anyone who holds the link can read that report, so treat a share link as public. You can regenerate or revoke a share link at any time from project settings.' },
                    { type: 'p', text: 'If you believe a credential has been compromised, contact us using the channel in section 20. WebPulse may revoke credentials when necessary to protect the Service or other users.' }
                ]
            },
            {
                id: 'billing',
                title: '7. Plans, Billing, and Payments',
                blocks: [
                    { type: 'p', text: 'WebPulse offers a Free plan and paid plans (Basic, Pro, and Business). Features, prices and limits are published on the pricing page, and the Service enforces the limits published for your plan.' },

                    { type: 'h', text: 'Payments and renewal' },
                    { type: 'p', text: 'Paid plans are purchased as one-time orders processed through Razorpay in Indian Rupees (INR). By placing an order you authorize Razorpay to charge the payment method you provide. Prices are shown per month on the pricing page and exclude any tax that applies to you; the amount charged is the amount shown at checkout.' },
                    { type: 'p', text: 'There is no subscription and no automatic renewal. We never charge your payment method without a new order that you place. To buy again, or to move to a higher plan, place a new order.' },
                    { type: 'p', text: 'Your plan is activated as soon as Razorpay confirms the payment, and the limits for the new plan apply immediately. If a payment is not completed, or confirmation fails, your plan is not changed and no order is recorded as paid.' },

                    { type: 'h', text: 'Plan changes' },
                    { type: 'p', text: '**Upgrades.** Place a new order for the plan you want. The higher limits apply as soon as the payment is confirmed. Events you have already tracked in the current calendar month still count towards the new plan\u2019s monthly allowance \u2014 upgrading raises your limit, it does not reset your usage.' },
                    { type: 'p', text: '**Downgrades.** You can move to the Free plan at any time from the Billing page. A downgrade takes effect immediately, and the Free plan\u2019s limits then apply. You cannot currently move straight from one paid plan to another; to change paid tier, place a new order for the plan you want.' },
                    { type: 'p', text: 'Because a paid order is a one-time payment rather than a period that renews, there is no paid period to carry forward or credit. An upgrade is a new payment, and a downgrade to the Free plan is not a refund.' },

                    { type: 'h', text: 'Usage limits' },
                    { type: 'p', text: 'Each plan has a monthly event allowance, a project limit, an allowed-origin limit per project, a storage limit, and a limit on public share reports. The published values are on the pricing page.' },
                    { type: 'p', text: 'The monthly event allowance resets at the start of each calendar month (UTC). Your Billing page shows the allowance you have used and when it next resets.' },
                    { type: 'p', text: 'When a limit is reached, the operation that depends on it is blocked until the limit resets or your plan changes: tracking stops while the monthly event or storage limit is reached, new projects cannot be created at the project limit, and new share links cannot be created at the share-report limit. Rejected events are not stored.' },

                    { type: 'h', text: 'Refunds and receipts' },
                    { type: 'p', text: 'Refunds are reviewed individually and are not automatic. To request one, contact us through the channel in section 20 with your account email and the payment reference. We will tell you the outcome of the review.' },
                    { type: 'p', text: 'A receipt is generated for every payment. You can download it from the Billing page or have it emailed to the address on your account.' },

                    { type: 'table',
                        caption: 'What happens when',
                        head: ['Situation', 'What happens'],
                        rows: [
                            ['Payment confirmed', 'The plan is activated immediately and the new limits apply.'],
                            ['Payment not completed or confirmation fails', 'The plan is unchanged and no order is recorded as paid. Place a new order to try again.'],
                            ['Upgrade', 'A new one-time order. The higher limit applies at once; usage already counted this month is not reset.'],
                            ['Downgrade to Free', 'Takes effect immediately. The Free plan\u2019s limits then apply.'],
                            ['Monthly event or storage limit reached', 'Tracking is blocked until the allowance resets or you upgrade. Rejected events are not stored.'],
                            ['Project or share-report limit reached', 'Creating a project or a share link is blocked until you upgrade or free up capacity.'],
                            ['Refund request', 'Reviewed individually. The outcome is confirmed to you by email.']
                        ]
                    }
                ]
            },
            {
                id: 'free-plans',
                title: '8. Free Plans and Limits',
                blocks: [
                    { type: 'p', text: 'The Free plan provides tracking with the limits published on the pricing page. We don\u2019t currently offer time-based trials \u2014 the Free plan is the entry tier, and it does not expire.' },
                    { type: 'p', text: 'We may change the limits of the Free plan, or remove a Free feature, as the Service evolves. If we change the limits, the new limits apply from the date the change takes effect, and we will describe the change on the pricing page and on this page.' },
                    { type: 'p', text: 'We may withdraw the Free plan or a Free feature entirely, where permitted by applicable law. If we do, we will tell account holders in advance, and you can move to a paid plan or close your account before it takes effect.' }
                ]
            },
            {
                id: 'ip',
                title: '9. Intellectual Property',
                blocks: [
                    { type: 'p', text: 'WebPulse and its underlying software, branding, documentation, designs, and other materials are protected by applicable intellectual-property laws. Unless we state otherwise, using the Service does not transfer ownership of WebPulse itself to you.' },
                    { type: 'p', text: '**The hosted service and the source code are licensed differently.** The hosted WebPulse service \u2014 the dashboard, the API, the tracking endpoints and the documentation \u2014 is provided to you under these Terms. The WebPulse source code is published publicly and is licensed under the **MIT License**, whose text is in the LICENSE file at the root of the repository.' },
                    { type: 'links', items: [
                        { label: 'MIT License (LICENSE file in the repository)', href: LICENSE_URL },
                        { label: 'The WebPulse source code', href: REPO_URL },
                        { label: 'Contributing guidelines', href: `${REPO_URL}/blob/HEAD/CONTRIBUTING.md` }
                    ] },
                    { type: 'p', text: 'Under the MIT License you may use, copy, modify, merge, publish, distribute, sublicense and sell copies of the source code, provided you include the copyright notice and the licence notice in all copies or substantial portions of the software. Contributions to the repository are accepted under the same licence.' },
                    { type: 'p', text: 'The MIT License does **not** grant rights to the WebPulse name, logo or other branding, to the hosted Service, or to third-party assets and dependencies that carry their own licences. Those remain subject to these Terms and to their own licences. If you want to use the WebPulse name or logo to describe your own product, ask us first.' }
                ]
            },
            {
                id: 'third-parties',
                title: '10. Third-Party Services',
                blocks: [
                    { type: 'p', text: 'WebPulse depends on third-party services to operate. Each of them processes data under its own terms and privacy policy, and we do not control them:' },
                    { type: 'links', items: [
                        { label: 'Database and authentication \u2014 Supabase', href: 'https://supabase.com/privacy' },
                        { label: 'Payment processing \u2014 Razorpay', href: 'https://razorpay.com/privacy-policy/' },
                        { label: 'Transactional email \u2014 Resend', href: 'https://resend.com/legal/privacy-policy' },
                        { label: 'Hosting \u2014 Vercel', href: 'https://vercel.com/legal/privacy-notice' },
                        { label: 'Sign-in \u2014 Google OAuth', href: 'https://policies.google.com/privacy' },
                        { label: 'Profile pictures \u2014 Cloudinary', href: 'https://cloudinary.com/privacy' },
                        { label: 'IP geolocation \u2014 IPWhois.io (with an offline geoip-lite fallback)', href: 'https://ipwhois.io/privacy' }
                    ] },
                    { type: 'p', text: 'We are responsible for the Service we operate, but we are not responsible for a third-party provider\u2019s availability, security, or conduct, and we cannot control how a provider handles data once it receives it. If a provider is unavailable or changes its behaviour, part of the Service may be affected \u2014 a payment may fail at checkout, or sign-in may be interrupted.' }
                ]
            },
            {
                id: 'availability',
                title: '11. Service Availability',
                blocks: [
                    { type: 'p', text: 'We aim to keep WebPulse available and reliable, but we do not guarantee that the Service will always be uninterrupted, error-free, or available. Scheduled maintenance, infrastructure failures, network problems, security incidents, and other circumstances may temporarily affect availability.' },
                    { type: 'note', text: 'We don\u2019t currently offer an SLA or uptime guarantee. Refresh intervals described on our plans (for example "real-time") describe dashboard polling behavior, not an uptime commitment.' }
                ]
            },
            {
                id: 'security',
                title: '12. Security',
                blocks: [
                    { type: 'p', text: 'We take reasonable technical and organizational measures to protect the Service and information processed through it. The controls implemented today are described on our [Security page](/security) and in [/docs/security](/docs/security).' },
                    { type: 'p', text: 'No internet-connected service can be guaranteed to be completely secure. We do not claim certifications we do not hold \u2014 WebPulse is not currently independently audited against SOC 2 or ISO 27001 \u2014 and we will update this page if that changes.' },
                    { type: 'p', text: 'You are responsible for protecting your own credentials and systems. Keep tracking IDs scoped to the projects and origins you intend to track, and revoke access you no longer need.' }
                ]
            },
            {
                id: 'suspension',
                title: '13. Suspension and Termination',
                blocks: [
                    { type: 'p', text: 'You may stop using WebPulse at any time. You may also delete projects yourself from the dashboard \u2014 see section 14 for what deletion removes.' },
                    { type: 'p', text: 'WebPulse may suspend or terminate access where reasonably necessary: where these Terms are violated, the Service is being abused, there is suspected unauthorized access, continued use creates a risk to the Service, its users or their data, or where a legal requirement obliges us to act.' },
                    { type: 'p', text: 'Where it is reasonably practicable, we will give notice before acting and explain the reason. We may act without prior notice where that is necessary to protect users, data or the Service, or to comply with a legal requirement \u2014 for example where an account appears to be compromised or is being used to attack the Service.' },
                    { type: 'p', text: 'If your access is suspended, you can contact us and ask us to review it. We will look again, and we will restore access if the reason for the suspension no longer applies.' }
                ]
            },
            {
                id: 'termination',
                title: '14. Effect of Termination',
                blocks: [
                    { type: 'p', text: 'After suspension or termination, access to all or part of the Service may end, credentials may be revoked, and your projects may become inaccessible. If you need a copy of your data, ask us before your access ends \u2014 exports are handled as a request through the contact channel rather than as a self-service download.' },
                    { type: 'p', text: '**Project deletion, account deletion and suspension are different actions.**' },
                    { type: 'p', text: 'Deleting a project is something you do yourself in the dashboard, and it is immediate and permanent: it removes that project\u2019s page views, visitors, counters and usage records, and it removes the project itself, including any public share link for it. There is no undo and no recycle bin. If you delete a project by mistake, contact us and we will see what can be recovered.' },
                    { type: 'p', text: 'Account deletion is different. It is not available through self-service settings and has to be requested through the contact channel in section 20. Suspension and termination by us are described in section 13.' },
                    { type: 'p', text: 'Analytics records are not deleted automatically on a timer. Some records may remain after an account is closed where we are required to keep them \u2014 payment and invoice records, security and abuse-prevention logs, and records needed to establish or defend a legal claim \u2014 and only for as long as that obligation lasts. We do not keep your analytics data for our own purposes once your account is closed.' },
                    { type: 'p', text: 'The handling of data that is not removed immediately is described in the [Privacy Policy](/privacy).' }
                ]
            },
            {
                id: 'disclaimers',
                title: '15. Disclaimers',
                blocks: [
                    { type: 'p', text: 'To the extent permitted by applicable law, the Service is provided "as is" and "as available". We do not guarantee that the Service will meet every particular requirement or that analytics will always be complete, uninterrupted, or error-free.' },
                    { type: 'p', text: 'Because analytics depend on client-side behavior, tracking can be affected by browser restrictions, ad blockers, network failures, incorrect implementation, client-side failures, and configuration errors. Visitor counts are best-effort and not certified.' },
                    { type: 'p', text: 'Nothing in these Terms excludes or limits a right or remedy that cannot lawfully be excluded or limited, including rights you have under mandatory consumer-protection law.' }
                ]
            },
            {
                id: 'liability',
                title: '16. Limitation of Liability',
                blocks: [
                    { type: 'p', text: 'To the maximum extent permitted by applicable law, WebPulse and its maintainers will not be liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits, revenue, data, or goodwill arising from your use of or inability to use the Service \u2014 even if we were told such damages were possible.' },
                    { type: 'p', text: 'To the maximum extent permitted by law, our total aggregate liability for all claims arising out of or relating to the Service is limited to the greater of: (a) the total amount you paid us for the Service in the twelve (12) months before the event giving rise to the claim; and (b) USD 100 or the equivalent amount in INR. The cap applies to the aggregate of all claims, not separately to each claim.' },
                    { type: 'p', text: 'The cap and the excluded damages do not apply where applicable law does not permit them to be limited \u2014 for example, to liability for death or personal injury caused by negligence, to fraud or wilful misconduct, or to any liability that cannot lawfully be limited.' },
                    { type: 'note', text: 'Liability caps and excluded damages vary by jurisdiction and business structure. This section is a starting point and should be reviewed by qualified legal counsel in the jurisdictions you operate in before it is relied on.' }
                ]
            },
            {
                id: 'indemnification',
                title: '17. Indemnification',
                blocks: [
                    { type: 'p', text: 'To the extent permitted by applicable law, you are responsible for claims arising from your unlawful use of the Service, your violation of these Terms, or your infringement of third-party rights (for example, by tracking websites without the notices or consent your use requires) \u2014 to the extent those claims arise from your breach of these Terms or your unlawful use.' },
                    { type: 'p', text: 'We will handle such a claim reasonably: we will tell you what we need from you, and you will give us the information and cooperation we reasonably request. We may settle a claim where we consider that the sensible outcome, but we will not settle in a way that admits liability on your behalf, or that imposes obligations on you, without your agreement \u2014 unless the law requires it.' },
                    { type: 'note', text: 'Indemnification clauses are jurisdiction-sensitive. Review the precise scope with legal counsel before relying on it, and decide whether WebPulse should give a reciprocal indemnity for third-party intellectual-property claims against customers who use the Service as permitted.' }
                ]
            },
            {
                id: 'changes-terms',
                title: '18. Changes to the Terms',
                blocks: [
                    { type: 'p', text: 'We may update these Terms as WebPulse evolves. We will update the "Last updated" date on this page when we do.' },
                    { type: 'p', text: 'For changes that materially affect you \u2014 pricing, plan limits, acceptable use, liability, or termination, for example \u2014 we will give account holders notice by email or in the Service before the change takes effect, and we will set out what is changing. Changes take effect on the date we publish them. If you continue to use the Service after that date, you accept the updated Terms where permitted by applicable law. If you do not accept them, you can stop using the Service and close your account.' }
                ]
            },
            {
                id: 'governing-law',
                title: '19. Governing Law and Disputes',
                blocks: [
                    { type: 'p', text: 'These Terms are governed by the laws of **[governing law jurisdiction]**, without regard to its conflict-of-law rules. **[operator legal name]** is the entity that operates WebPulse and that you contract with when you use the Service.' },
                    { type: 'p', text: '**Disputes.** The dispute process for these Terms is **to be confirmed** — for example, written notice and a good-faith negotiation period, then mediation, then the courts of [jurisdiction] or arbitration under [rules]. Nothing in this section limits a right you have to bring a claim in the courts of your own jurisdiction where applicable law allows it.' },
                    { type: 'note', text: 'This section is not yet complete. The operating entity, the governing law and the dispute process must be filled in and reviewed by qualified legal counsel before these Terms are relied on as binding production terms. The placeholders above are deliberate \u2014 they mark what is still to be decided rather than a jurisdiction we have chosen.' }
                ]
            },
            {
                id: 'contact',
                title: '20. Contact',
                blocks: [
                    { type: 'p', text: 'Questions about these Terms, a privacy request, a billing dispute, or a request to close your account? Use the private channel below. It reaches a monitored mailbox \u2014 not a public issue tracker.' },
                    { type: 'contact', kind: 'legal' },
                    { type: 'links', items: [
                        { label: 'Privacy Policy', href: '/privacy' },
                        { label: 'Cookie Policy', href: '/cookies' },
                        { label: 'Security page', href: '/security' }
                    ] }
                ]
            }
        ]
    },

    cookies: {
        title: 'Cookie Policy',
        eyebrow: 'Legal · Cookie Policy',
        headline: 'The cookies WebPulse uses, and the ones it does not.',
        lead: 'WebPulse uses cookies to keep authenticated users signed in. Our website tracking script is designed to collect analytics events without setting or reading cookies or using local storage or fingerprinting, according to its current implementation.',
        intro: 'This Cookie Policy explains how WebPulse Analytics ("WebPulse", "we", "us", or "our") uses cookies and similar technologies when you access the WebPulse product. It also explains how our website tracking script behaves and how you can manage cookies through your browser.',
        lastUpdated: 'October 20, 2026',
        seo: {
            title: 'Cookie Policy | WebPulse Analytics',
            description:
                'See exactly which cookies WebPulse sets for authentication, which tracking technologies it avoids, and how to control cookies in your browser.'
        },
        summary: [
            {
                title: 'Essential authentication cookies',
                text: 'Support sign-in and authenticated requests to the dashboard and API.',
                href: '#authentication'
            },
            {
                title: 'Analytics tracking script',
                text: 'The tracking script does not set or read cookies, and does not use local storage or fingerprinting.',
                href: '#tracking-script'
            },
            {
                title: 'Your browser controls',
                text: 'Learn how blocking or deleting cookies affects sign-in and the tracking script.',
                href: '#managing'
            }
        ],
        groups: [
            {
                id: 'group-cookies-usage',
                label: 'What we use, and what we don\u2019t',
                sections: ['authentication', 'tracking-script']
            },
            {
                id: 'group-cookies-choices',
                label: 'Your choices',
                sections: ['managing', 'changes', 'contact']
            }
        ],
        sections: [
            {
                id: 'authentication',
                title: '1. Cookies and Storage Used by WebPulse',
                blocks: [
                    { type: 'p', text: 'WebPulse uses one cookie to keep you signed in, plus a small amount of non-sensitive browser storage used by the dashboard interface. The tracking script that WebPulse customers install on their own websites is covered separately in section 2.' },
                    { type: 'h', text: 'Authentication cookies' },
                    { type: 'p', text: 'When you register or sign in, WebPulse issues an authentication cookie and uses it to maintain your session and authenticate requests to protected product features, including dashboard API calls and the live-updates WebSocket connection.' },
                    { type: 'table', caption: 'The `token` cookie, as configured in the deployed product', head: ['Attribute', 'Value'], rows: [
                        ['Name', '`token`'],
                        ['Purpose', 'Keeps you signed in and authenticates dashboard API and WebSocket requests. It is used for authentication and session management only.'],
                        ['Lifetime', '7 days. The server-side session record uses the same window, so the session ends when the cookie expires.'],
                        ['`HttpOnly`', 'Set. Client-side JavaScript cannot read the cookie\u2019s value.'],
                        ['`Secure`', 'Set in production, so the cookie is only transmitted over HTTPS and is never sent over an insecure connection.'],
                        ['`SameSite`', '`None` in production and `Lax` in development. `None` is what allows the dashboard \u2014 which is served from a different origin than the API \u2014 to send the cookie; modern browsers only accept `SameSite=None` together with `Secure`, and the production configuration sets both.'],
                        ['Domain', 'Host-only to the API host. No `Domain` attribute is set, so the cookie is not shared with other WebPulse properties or with the sites we track.'],
                        ['Path', '`/`, so the cookie is attached to every request the browser makes to the API host.'],
                        ['Browser storage', 'Not stored in `localStorage` or `sessionStorage`, and never returned in an API response body.']
                    ] },
                    { type: 'p', text: 'Blocking this cookie may prevent you from signing in or using authenticated features. Signing out revokes the session server-side and clears the cookie in your browser.' },
                    { type: 'note', text: 'Request authentication does not use a separate CSRF cookie. State-changing API requests are instead required to carry a custom header, so the product itself sets only the `token` cookie.' },
                    { type: 'h', text: 'Other browser storage in the dashboard' },
                    { type: 'p', text: 'The dashboard console keeps a small amount of non-sensitive information in your browser, so the interface can render correctly:' },
                    { type: 'table', caption: 'Browser storage used by the dashboard console', head: ['Storage', 'Key', 'What it holds'], rows: [
                        ['`localStorage`', '`webpulse:session`', 'A flag saying "this browser has a session". It holds no token and no personal data.'],
                        ['`localStorage`', '`theme`', 'Your light or dark theme preference.'],
                        ['`sessionStorage`', '`webpulse:v1-notice-dismissed`', 'Remembers that you dismissed the preview notice. It is cleared when you close the tab.']
                    ] },
                    { type: 'p', text: 'The API remains the authority on whether a request is authenticated. Clearing these entries only resets a convenience flag \u2014 it does not sign you out, because the session itself lives in the cookie described above.' },
                    { type: 'h', text: 'Third-party sign-in' },
                    { type: 'p', text: 'If you choose to sign in with Google, Google may use cookies or similar technologies as part of its authentication process. These technologies are governed by Google\u2019s applicable terms and privacy information.' }
                ]
            },
            {
                id: 'tracking-script',
                title: '2. Cookies and Technologies Not Used by the Tracking Script',
                blocks: [
                    { type: 'p', text: 'The WebPulse tracking script served at `/api/v1/track/script.js` is designed to collect analytics events without setting or reading cookies. According to the current tracking-script implementation, the script:' },
                    { type: 'list', items: [
                        'Does not set or read cookies.',
                        'Does not use `localStorage` or `sessionStorage`.',
                        'Does not use browser fingerprinting.',
                        'Sends tracking events using `navigator.sendBeacon`, or a `fetch` request with `keepalive` where `sendBeacon` is unavailable.'
                    ] },
                    { type: 'h', text: 'Advertising cookies and third-party trackers' },
                    { type: 'p', text: 'The WebPulse marketing website does not use advertising or personalization cookies and does not embed third-party advertising trackers, according to our current implementation. The only third-party sign-in we offer is Google, which is described in section 1.' },
                    { type: 'note', text: 'These statements describe the current WebPulse implementation. They do not mean that every website using WebPulse, every browser, or every third-party service is free of cookies or other tracking technologies.' }
                ]
            },
            {
                id: 'managing',
                title: '3. Managing Cookies',
                blocks: [
                    { type: 'p', text: 'You can block, restrict, or delete cookies through your browser settings.' },
                    { type: 'p', text: 'If you block the WebPulse authentication cookie, you may be unable to remain signed in or access features that require an authenticated session. Deleting the cookie may sign you out.' },
                    { type: 'p', text: 'Blocking cookies does not, by itself, disable the WebPulse tracking script, which does not rely on cookies according to its current implementation. Website operators remain responsible for evaluating the privacy and consent requirements applicable to their own tracking configuration.' },
                    { type: 'h', text: 'Clearing dashboard storage' },
                    { type: 'p', text: 'Clearing site data for the WebPulse dashboard also removes the non-sensitive flags described in section 1 \u2014 your sign-in state hint, theme preference, and notice dismissal. That resets the interface only; the session cookie is what determines whether you are signed in.' }
                ]
            },
            {
                id: 'changes',
                title: '4. Changes to This Policy',
                blocks: [
                    { type: 'p', text: 'We may update this Cookie Policy when the product or its use of cookies and similar technologies changes. We will update the "Last updated" date when we make substantive changes.' },
                    { type: 'p', text: 'Our [Privacy Policy](/privacy) and [Terms of Service](/terms) apply alongside this policy, and our [Security page](/security) describes how the dashboard and API are protected.' }
                ]
            },
            {
                id: 'contact',
                title: '5. Contact',
                blocks: [
                    { type: 'p', text: 'If you have questions about this Cookie Policy, use the private channel below. Please do not submit passwords, session tokens, or other sensitive information through public channels such as GitHub issues.' },
                    { type: 'contact', kind: 'privacy' }
                ]
            }
        ]
    }
};

/**
 * Section titles in document order, with the number stripped. Used by the
 * table of contents and by the scroll spy.
 */
export const getPolicySections = (policy) =>
    (policy?.sections || []).map((section) => ({
        ...section,
        label: section.title.replace(/^\d+\.\s*/, ''),
    }));
