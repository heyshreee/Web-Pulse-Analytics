export const docsNav = [
    {
        label: 'Getting Started',
        items: [
            { label: 'Introduction', to: '/docs/getting-started' },
            { label: 'Quick Start', to: '/docs/getting-started#quick-start' },
            { label: 'Concepts', to: '/docs/getting-started#concepts' }
        ]
    },
    {
        label: 'Tracking',
        items: [
            { label: 'Installation', to: '/docs/tracking#installation' },
            { label: 'Tracking ID', to: '/docs/tracking#tracking-id' },
            { label: 'Page Views', to: '/docs/tracking#page-views' },
            { label: 'Custom Events', to: '/docs/tracking/events' },
            { label: 'Sessions', to: '/docs/tracking#sessions' }
        ]
    },
    {
        label: 'API',
        items: [
            { label: 'Overview', to: '/docs/api' },
            { label: 'Authentication', to: '/docs/api/authentication' },
            { label: 'Track Events', to: '/docs/api/events' },
            { label: 'Analytics', to: '/docs/api/analytics' },
            { label: 'Errors', to: '/docs/api#errors' }
        ]
    },
    {
        label: 'JavaScript',
        items: [
            { label: 'Tracker', to: '/docs/javascript#tracker' },
            { label: 'Configuration', to: '/docs/javascript#configuration' },
            { label: 'Events', to: '/docs/javascript#events' }
        ]
    },
    {
        label: 'Guides',
        items: [
            { label: 'React', to: '/docs/guides/react' },
            { label: 'JavaScript Website', to: '/docs/guides#javascript-website' },
            { label: 'Custom Events', to: '/docs/guides#custom-events' },
            { label: 'Analytics API', to: '/docs/guides#analytics-api' }
        ]
    },
    {
        label: 'Security',
        items: [
            { label: 'API Keys', to: '/docs/security#api-keys' },
            { label: 'Allowed Origins', to: '/docs/security#allowed-origins' },
            { label: 'Best Practices', to: '/docs/security#best-practices' }
        ]
    }
];

/**
 * Every navigation entry, split into its path and anchor. The split lets the
 * active entry be resolved from the URL *and* from the section the reader is
 * currently looking at, so a page never ends up with an unhighlighted rail.
 */
export const navItems = docsNav.flatMap((group) =>
    group.items.map((item) => {
        const [path, hash] = item.to.split('#');
        return { ...item, path, hash: hash || null };
    })
);

/**
 * Resolve which nav entry should be highlighted.
 *
 * 1. An explicit URL fragment wins.
 * 2. Otherwise the section currently on screen.
 * 3. Otherwise a plain page link ("Overview" -> /docs/api).
 * 4. Otherwise the first entry that lives on the current page.
 */
export function resolveActiveTo(pathname, hash, sectionId, sectionIds) {
    const onPage = navItems.filter((item) => item.path === pathname);
    if (!onPage.length) return null;

    if (hash) {
        const exact = onPage.find((item) => item.hash === hash);
        if (exact) return exact.to;
    }

    if (sectionId) {
        const exact = onPage.find((item) => item.hash === sectionId);
        if (exact) return exact.to;

        // The section on screen is not itself a nav entry (an overview
        // heading, for example) — fall back to the next entry below it.
        const index = sectionIds.indexOf(sectionId);
        if (index >= 0) {
            const after = onPage
                .filter((item) => item.hash && sectionIds.indexOf(item.hash) > index)
                .sort((a, b) => sectionIds.indexOf(a.hash) - sectionIds.indexOf(b.hash))[0];
            if (after) return after.to;
        }
    }

    const pageLink = onPage.find((item) => !item.hash);
    if (pageLink) return pageLink.to;

    return onPage[0].to;
}
