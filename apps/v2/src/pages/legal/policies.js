export const LEGAL_POLICIES = {
    privacy: {
        title: 'Privacy Policy',
        lastUpdated: 'August 29, 2026',
        intro: 'WebPulse Analytics ("WebPulse", "we", "us", or "our") provides website analytics and monitoring services. This Privacy Policy explains what information we collect, how we use it, how we protect it, and the choices available to you.',
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
                        'Authentication and session information',
                        'Billing information, where you make a purchase'
                    ] },
                    { type: 'p', text: 'We collect only the information required to provide and secure the service.' },
                    { type: 'h', text: 'Website analytics data' },
                    { type: 'p', text: 'When a WebPulse customer installs the tracking script on a website, the service records information about visitor activity. Based on the current implementation, this includes:' },
                    { type: 'list', items: [
                        'Page URLs visited on the tracked site',
                        'Page titles, where provided',
                        'Referrer information (the page that linked to the one being viewed)',
                        'Timestamps for page views',
                        'The visitor\u2019s user agent string, from which we derive browser, operating system, and device type',
                        'The visitor\u2019s IP address, used to derive approximate country, city, and coordinates, and for abuse prevention and duplicate filtering',
                        'A session identifier used to group a visitor\u2019s activity over time',
                        'Project and tracking identifiers'
                    ] },
                    { type: 'p', text: 'The tracking script accepts custom event data. Additional fields passed alongside an event are transmitted to the API but are **not stored** by the current implementation \u2014 we record page views, titles, URLs, referrer, and the visitor fields above.' },
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
                        'Maintain your account and authenticate users',
                        'Secure the platform and detect abuse or unauthorized activity',
                        'Enforce plan limits (for example, monthly views, project, and allowed-origin limits)',
                        'Diagnose technical problems and improve WebPulse',
                        'Provide customer support',
                        'Process payments, where applicable',
                        'Communicate important service information'
                    ] },
                    { type: 'p', text: 'We don\u2019t use analytics data for purposes unrelated to providing and improving the service, unless otherwise disclosed.' }
                ]
            },
            {
                id: 'visitors',
                title: '3. Website Visitor Data',
                blocks: [
                    { type: 'p', text: 'If you use WebPulse to monitor your own website, **you are responsible** for determining what data you collect through your tracking configuration and for providing any notices to or obtaining consent from your visitors required by applicable law.' },
                    { type: 'p', text: 'WebPulse processes analytics data on your behalf according to your configuration and the applicable agreement. We store the fields described in section 1; you control which pages you track and which custom events you send.' }
                ]
            },
            {
                id: 'cookies',
                title: '4. Cookies and Similar Technologies',
                blocks: [
                    { type: 'p', text: 'The WebPulse product (the dashboard and API on your deployment) uses HTTP cookies to keep you signed in:' },
                    { type: 'list', items: [
                        'A `session` token cookie is set when you log in or register. It is `HttpOnly` (not readable by page scripts), lasts 24 hours, and is sent over HTTPS in production (`SameSite=Lax` in development, `SameSite=None` in production).',
                        'If you sign in with Google, the provider may set cookies as part of the OAuth flow.'
                    ] },
                    { type: 'p', text: 'The tracking script served at `/api/v1/track/script.js` does **not** set or read cookies and does not use `localStorage` or fingerprinting. It records an event with `navigator.sendBeacon` (or `fetch` with `keepalive`) when a page is loaded.' },
                    { type: 'note', text: 'The WebPulse marketing site uses no advertising cookies and embeds no third-party advertising trackers.' }
                ]
            },
            {
                id: 'retention',
                title: '5. Data Retention',
                blocks: [
                    { type: 'p', text: 'We retain account and analytics information for as long as necessary to provide the service, maintain security, comply with legal obligations, and resolve disputes.' },
                    { type: 'p', text: 'Based on the current implementation:' },
                    { type: 'list', items: [
                        'Project activity logs are automatically capped at the 1,000 most recent events per project; the oldest entries are removed as new ones are recorded.',
                        'Analytics records (visitors, page views, counters, and monthly usage) are retained until the associated project is deleted. Deleting a project removes its page views, visitors, counters, and usage records.',
                        'Identical tracking requests from the same IP, browser, and tracking ID are ignored within a short in-memory dedupe window (about 2 seconds). The in-memory window is not persisted.',
                        'There is currently no automatic time-based deletion of analytics records.'
                    ] },
                    { type: 'p', text: 'If we add configurable retention windows or bulk-deletion controls, we\u2019ll document them here and in the docs.' }
                ]
            },
            {
                id: 'sharing',
                title: '6. Data Sharing',
                blocks: [
                    { type: 'p', text: 'We do not sell personal information. WebPulse shares information only in these circumstances:' },
                    { type: 'list', items: [
                        'With service providers that operate WebPulse \u2014 hosting, database, authentication, email delivery, payment processing, and identity providers (see section 12)',
                        'When you explicitly make something public (for example, a shared report link)',
                        'With legal authorities or others when we believe in good faith that disclosure is required by law, regulation, or legal process, or to protect rights, safety, or property'
                    ] }
                ]
            },
            {
                id: 'security',
                title: '7. Data Security',
                blocks: [
                    { type: 'p', text: 'We use reasonable technical and organizational measures designed to protect information against unauthorized access, alteration, disclosure, or destruction. Controls implemented today include:' },
                    { type: 'list', items: [
                        'HTTPS on the service domains',
                        'Passwords stored and hashed through Supabase Auth \u2014 WebPulse never stores plaintext passwords',
                        'HttpOnly session cookies and JWTs, email verification, and project-scoped permissions',
                        'Per-project tracking IDs with configurable allowed origins, enforced by origin whitelisting on the backend',
                        'Server-side rate limiting and bot filtering on tracking endpoints',
                        'CSRF protection via a required custom request header'
                    ] },
                    { type: 'p', text: 'No method of transmission or storage is fully secure. We encourage following the security practices in our documentation, such as keeping tracking IDs scoped to the projects and origins you intend to track.' }
                ]
            },
            {
                id: 'api-keys',
                title: '8. API Keys and Credentials',
                blocks: [
                    { type: 'p', text: 'WebPulse exposes public tracking endpoints and an authenticated API.' },
                    { type: 'p', text: 'Tracking IDs are public by design: they identify a project and are safe to expose in the browser. Account credentials (passwords, OAuth tokens, and authenticated session credentials) are sensitive and should be treated as confidential \u2014 don\u2019t commit secrets to public repositories or ship them in client-side code.' },
                    { type: 'p', text: 'Users are responsible for keeping their credentials secure. Where WebPulse holds credentials, it protects them with server-side controls (HttpOnly cookies and server-held service keys).' }
                ]
            },
            {
                id: 'rights',
                title: '9. Your Rights and Choices',
                blocks: [
                    { type: 'p', text: 'Depending on applicable law, you may have rights regarding your personal information, which may include access, correction, deletion, restriction, objection to processing, and data portability.' },
                    { type: 'p', text: 'Today you can exercise some choices directly in the product:' },
                    { type: 'list', items: [
                        'Delete a project to remove its analytics records (page views, visitors, counters, and usage)',
                        'Change your password and update your profile in account settings',
                        'Manage allowed origins and tracking configuration per project'
                    ] },
                    { type: 'p', text: 'For other requests (for example, account deletion or data export), use the contact channel in section 14. We\u2019ll respond within a reasonable timeframe and confirm what the current product can do.' },
                    { type: 'note', text: 'Account deletion is not currently automated through self-service settings; it requires a request through the contact channel in section 14.' }
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
                    { type: 'p', text: 'WebPulse runs on cloud infrastructure: the database and authentication on Supabase, the marketing site on Vercel, and payments through Razorpay. Your data may be stored and processed in the countries where these providers and their sub-processors operate. By using WebPulse, you authorize such transfers.' }
                ]
            },
            {
                id: 'third-parties',
                title: '12. Third-Party Services',
                blocks: [
                    { type: 'p', text: 'WebPulse uses the following categories of providers, each of which processes data under its own terms and privacy policy:' },
                    { type: 'links', items: [
                        { label: 'Database, authentication, and object storage \u2014 Supabase', href: 'https://supabase.com' },
                        { label: 'Payment processing \u2014 Razorpay', href: 'https://razorpay.com' },
                        { label: 'Transactional email \u2014 Resend', href: 'https://resend.com' },
                        { label: 'Hosting \u2014 Vercel', href: 'https://vercel.com' },
                        { label: 'Sign-in \u2014 Google OAuth', href: 'https://policies.google.com/privacy' },
                        { label: 'IP geolocation \u2014 ip-api.com (with an offline geoip-lite fallback)', href: 'https://ip-api.com' }
                    ] }
                ]
            },
            {
                id: 'changes',
                title: '13. Changes to This Policy',
                blocks: [
                    { type: 'p', text: 'We may update this Privacy Policy from time to time. When we make changes, we\u2019ll update the \u201cLast updated\u201d date and, where appropriate, provide additional notice.' }
                ]
            },
            {
                id: 'contact',
                title: '14. Contact',
                blocks: [
                    { type: 'p', text: 'If you have questions about this Privacy Policy or how WebPulse handles personal information, contact us using the channel below. We\u2019ll aim to respond within a reasonable timeframe.' },
                    { type: 'contact', kind: 'privacy' }
                ]
            }
        ]
    },
    terms: {
        title: 'Terms of Service',
        lastUpdated: 'August 29, 2026',
        intro: 'These Terms of Service ("Terms") govern your access to and use of WebPulse Analytics ("WebPulse", "we", "us", or "our"). By creating an account or using WebPulse, you agree to these Terms. If you do not agree with these Terms, do not use the Service.',
        sections: [
            {
                id: 'service',
                title: '1. The Service',
                blocks: [
                    { type: 'p', text: 'WebPulse provides website analytics, visitor tracking, event collection, monitoring, and related software services.' },
                    { type: 'p', text: 'The features available to you depend on the product version, plan, and configuration associated with your account. Features that are implemented today are documented under /docs; the docs are part of how we describe the Service.' },
                    { type: 'p', text: 'We may add, modify, or remove features as the Service evolves.' }
                ]
            },
            {
                id: 'accounts',
                title: '2. Accounts',
                blocks: [
                    { type: 'p', text: 'You may need to create an account to use certain WebPulse features. You are responsible for:' },
                    { type: 'list', items: [
                        'Providing accurate account information',
                        'Keeping your credentials secure',
                        'Maintaining the security of your account',
                        'All activity performed through your account',
                        'Notifying us of unauthorized access'
                    ] },
                    { type: 'p', text: 'You must not share your account credentials with others in a way that compromises account security.' }
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
                    { type: 'p', text: 'We may investigate suspected abuse and take appropriate action, including revoking credentials or suspending access.' }
                ]
            },
            {
                id: 'visitors',
                title: '4. Website Visitor Data',
                blocks: [
                    { type: 'p', text: 'If you use WebPulse to collect analytics from visitors to your website or application, **you are responsible** for determining whether your use of the tracking technology complies with applicable privacy and data-protection requirements.' },
                    { type: 'p', text: 'You are responsible for:' },
                    { type: 'list', items: [
                        'Providing appropriate privacy notices',
                        'Obtaining consent where required',
                        'Configuring tracking appropriately',
                        'Avoiding unlawful collection of personal information',
                        'Responding to requests from your website users where applicable'
                    ] },
                    { type: 'p', text: 'WebPulse does not determine what information you choose to collect through your implementation. The tracking script stores the fields described in the Privacy Policy and the /docs tracking pages; custom event fields you send are not stored.' }
                ]
            },
            {
                id: 'your-data',
                title: '5. Your Data',
                blocks: [
                    { type: 'p', text: 'You retain your rights to the data and content you submit to WebPulse, subject to the rights necessary for us to operate the Service.' },
                    { type: 'p', text: 'You grant WebPulse the limited rights necessary to process, store, and display your analytics; provide the Service; maintain and secure the platform; and diagnose technical problems.' },
                    { type: 'p', text: 'We do not claim ownership of your analytics data.' }
                ]
            },
            {
                id: 'api-keys',
                title: '6. API Keys and Tracking Credentials',
                blocks: [
                    { type: 'p', text: 'You are responsible for protecting credentials associated with your WebPulse projects.' },
                    { type: 'p', text: 'Tracking IDs are public by design and are safe to expose in the browser. Authenticated credentials (passwords, OAuth tokens, and session credentials) are secret and must not be publicly exposed or shared with unauthorized parties.' },
                    { type: 'p', text: 'Share-report tokens can be regenerated in project settings. If you believe a credential has been compromised, contact us using the channel in section 20. WebPulse may revoke credentials when necessary to protect the Service.' }
                ]
            },
            {
                id: 'billing',
                title: '7. Plans, Billing, and Payments',
                blocks: [
                    { type: 'p', text: 'WebPulse offers a Free plan and paid plans (Basic, Pro, and Business). Paid features, pricing, and limits are described on the pricing page; the backend enforces the published limits (monthly views, projects, and allowed origins).' },
                    { type: 'p', text: 'Paid plans are one-time orders processed through Razorpay in Indian Rupees. By placing an order you authorize Razorpay to charge the payment method you provide. Amounts are exclusive of applicable taxes. Receipts are generated and also emailed to the address on your account.' },
                    { type: 'p', text: 'There is no automatic renewal; each paid order covers the plan period you purchase. Upgrading places a new one-time order. Downgrading to a lower plan is supported; downgrading from a paid plan places you on the Free plan with its limits.' },
                    { type: 'p', text: 'When a plan limit is reached (monthly views, projects, or allowed origins), additional tracking or project creation may be blocked until you upgrade or, for the monthly view allowance, until the next calendar month. The monthly view allowance resets at the start of each calendar month.' },
                    { type: 'p', text: 'Refunds are handled case by case and are not automatic. Contact us through the channel in section 20.' }
                ]
            },
            {
                id: 'free-plans',
                title: '8. Free Plans and Limits',
                blocks: [
                    { type: 'p', text: 'The Free plan provides tracking with the limits published on the pricing page, and free-plan features and limits may change as the Service evolves.' },
                    { type: 'p', text: 'We don\u2019t currently offer time-based trials; the Free plan is the entry tier. We may change or discontinue free-plan availability where permitted by applicable law.' }
                ]
            },
            {
                id: 'ip',
                title: '9. Intellectual Property',
                blocks: [
                    { type: 'p', text: 'WebPulse and its underlying software, branding, documentation, designs, and other materials are protected by applicable intellectual-property laws. Unless otherwise stated, using the Service doesn\u2019t grant you ownership of WebPulse itself.' },
                    { type: 'p', text: 'The WebPulse source code is published publicly at github.com/heyshreee/Web-Pulse-Analytics. Contributions to and reuse of that code are governed by the license stated in the repository. These Terms govern the hosted WebPulse service, its branding, and its documentation, which are separate from the licensed codebase.' },
                    { type: 'note', text: 'The repository does not yet include a license file. Contributors should treat the license stated in the repository as the one that applies once it is published.' }
                ]
            },
            {
                id: 'third-parties',
                title: '10. Third-Party Services',
                blocks: [
                    { type: 'p', text: 'WebPulse depends on third-party services, including infrastructure and hosted database/authentication (Supabase), payment processing (Razorpay), transactional email (Resend), and hosting (Vercel). Third-party services have their own terms and privacy policies.' },
                    { type: 'p', text: 'We are not responsible for services we do not control. Where WebPulse passes data to a provider to operate the Service, the provider\u2019s terms apply to that processing in addition to our Privacy Policy.' }
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
                    { type: 'p', text: 'We take reasonable measures to protect the Service and information processed through it, as described on the Security page and in /docs/security. No internet-connected service can be guaranteed to be completely secure.' },
                    { type: 'p', text: 'Users are responsible for protecting their own credentials and systems.' }
                ]
            },
            {
                id: 'suspension',
                title: '13. Suspension and Termination',
                blocks: [
                    { type: 'p', text: 'You may stop using WebPulse at any time and delete your projects from the dashboard.' },
                    { type: 'p', text: 'We may suspend or terminate access when reasonably necessary, including where these Terms are violated, the Service is being abused, there is suspected unauthorized access, continued use creates a security risk, or where required by law. Where reasonably possible, we\u2019ll give notice before a suspension.' }
                ]
            },
            {
                id: 'termination',
                title: '14. Effect of Termination',
                blocks: [
                    { type: 'p', text: 'After account suspension or termination, your access to the Service may end, your credentials may be revoked, and your projects may become inaccessible.' },
                    { type: 'p', text: 'Deleting a project removes its analytics records (page views, visitors, counters, and usage) as described in the Privacy Policy. There is currently no automatic time-based deletion of analytics records, and account-level deletion is not automated; it requires a request through the contact channel in section 20.' }
                ]
            },
            {
                id: 'disclaimers',
                title: '15. Disclaimers',
                blocks: [
                    { type: 'p', text: 'To the extent permitted by applicable law, the Service is provided "as is" and "as available". We do not guarantee that the Service will meet every particular requirement or that analytics will always be complete, uninterrupted, or error-free.' },
                    { type: 'p', text: 'Because analytics depend on client-side behavior, tracking can be affected by browser restrictions, ad blockers, network failures, incorrect implementation, client-side failures, and configuration errors. Visitor counts are best-effort and not certified.' }
                ]
            },
            {
                id: 'liability',
                title: '16. Limitation of Liability',
                blocks: [
                    { type: 'p', text: 'To the maximum extent permitted by applicable law, WebPulse and its maintainers won\u2019t be liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits, data, or goodwill arising from your use of or inability to use the Service.' },
                    { type: 'p', text: 'To the maximum extent permitted by law, our total aggregate liability for any claim is limited to the amount you paid for the Service.' },
                    { type: 'note', text: 'Liability caps and excluded damages vary by jurisdiction and business structure. This section is a starting point and should be reviewed by qualified legal counsel in the jurisdictions you operate in before it is relied on.' }
                ]
            },
            {
                id: 'indemnification',
                title: '17. Indemnification',
                blocks: [
                    { type: 'p', text: 'To the extent permitted by applicable law, you are responsible for claims arising from your unlawful use of the Service, your violation of these Terms, or your infringement of third-party rights (for example, by tracking websites without the notices or consent your use requires).' },
                    { type: 'note', text: 'Indemnification clauses are jurisdiction-sensitive; review the precise scope with legal counsel before relying on it.' }
                ]
            },
            {
                id: 'changes-terms',
                title: '18. Changes to the Terms',
                blocks: [
                    { type: 'p', text: 'We may update these Terms as WebPulse evolves. When we make material changes, we\u2019ll update the "Last updated" date and, where appropriate, provide notice through the Service. Continued use after the effective date may constitute acceptance where permitted by applicable law.' }
                ]
            },
            {
                id: 'governing-law',
                title: '19. Governing Law and Disputes',
                blocks: [
                    { type: 'p', text: 'These Terms will be governed by the laws of the jurisdiction where WebPulse is established. We are currently operating as an independent project; this section will name the legal entity, governing law, and dispute process once that entity is established.' },
                    { type: 'note', text: 'Do not assume a jurisdiction — this section must be set from your actual legal entity and location after legal advice.' }
                ]
            },
            {
                id: 'contact',
                title: '20. Contact',
                blocks: [
                    { type: 'p', text: 'Questions about these Terms? Contact us using the channel below.' },
                    { type: 'contact', kind: 'support' }
                ]
            }
        ]
    },
    cookies: {
        title: 'Cookie Policy',
        lastUpdated: 'August 29, 2026',
        intro: 'This Cookie Policy explains how WebPulse uses cookies and similar technologies when you use the WebPulse product, and what the tracking script does (and doesn\u2019t) set.',
        sections: [
            {
                id: 'what-we-set',
                title: '1. Cookies the Product Sets',
                blocks: [
                    { type: 'p', text: 'Authentication. When you log in or register, the WebPulse API sets an HttpOnly session token cookie that keeps you signed in. It lasts 24 hours and is used solely to authenticate API and WebSocket requests. It\u2019s `SameSite=Lax` in development and `SameSite=None` in production, sent over HTTPS.' },
                    { type: 'p', text: 'Third-party sign-in. If you sign in with Google, Google sets its own cookies as part of the OAuth flow, governed by Google\u2019s privacy policy.' }
                ]
            },
            {
                id: 'what-we-dont',
                title: '2. Cookies We Don\u2019t Use',
                blocks: [
                    { type: 'list', items: [
                        'No advertising or personalization cookies',
                        'No third-party advertising trackers on the WebPulse site',
                        'The tracking script does not set or read cookies, and does not use localStorage or fingerprinting'
                    ] }
                ]
            },
            {
                id: 'control',
                title: '3. How to Control Cookies',
                blocks: [
                    { type: 'p', text: 'You can block or delete cookies in your browser settings. Blocking the session cookie will prevent you from staying signed in to the WebPulse dashboard. Blocking cookies has no effect on the behavior of the analytics tracking script, which doesn\u2019t use them.' }
                ]
            }
        ]
    }
};