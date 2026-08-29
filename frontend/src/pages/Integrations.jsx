import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowDown, Activity, Braces, Atom, Server, Plug, BarChart2 } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';

function FlowDiagram({ steps }) {
    return (
        <div className="mt-6 flex flex-col items-center gap-1">
            {steps.map((s, i) => (
                <div key={s}>
                    <div className="rounded-lg bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 px-4 py-2 text-center text-xs font-semibold text-violet-600 dark:text-violet-400">
                        {s}
                    </div>
                    {i < steps.length - 1 && <ArrowDown className="h-4 w-4 text-slate-300 dark:text-slate-600 my-1 mx-auto" />}
                </div>
            ))}
        </div>
    );
}

const codeExample = `const data = await analytics.query({
  metric: "pageViews",
  startDate: "2026-01-01",
  endDate: "2026-01-31",
  groupBy: "day"
});`;

const integrations = [
    {
        icon: Activity,
        title: "WebPulse Tracking",
        headline: "Add analytics to your website.",
        description: "WebPulse provides a tracking layer for collecting page views and custom events from your application.",
        flow: ["Tracking ID", "Your website", "WebPulse", "Analytics"],
        link: { to: "/api", label: "Learn about tracking" }
    },
    {
        icon: Braces,
        title: "REST API",
        headline: "Build on top of your analytics.",
        description: "Query your WebPulse analytics data programmatically and connect it to your own applications, internal tools, and workflows.",
        code: codeExample,
        link: { to: "/api", label: "Explore the API" }
    },
    {
        icon: Atom,
        title: "React",
        headline: "Works naturally with React applications.",
        description: "WebPulse's current frontend is built with React, and the project documents a JavaScript analytics module that can be initialized with a tracking ID and endpoint.",
        flow: ["React application", "WebPulse Analytics", "Events", "Dashboard"],
        link: { to: "/register", label: "Get started" }
    },
    {
        icon: Server,
        title: "Node.js",
        headline: "Send analytics from your backend.",
        description: "Use the WebPulse API from your Node.js application to integrate analytics into your existing backend workflows.",
        flow: ["Node.js", "WebPulse API", "Analytics data"],
        link: { to: "/docs", label: "API documentation" }
    }
];

const supported = ['JavaScript', 'React', 'Node.js', 'REST API', 'Custom events', 'Page-view tracking'];

export default function Integrations() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070A10] text-slate-900 dark:text-slate-200 font-sans transition-colors duration-300">
            <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-space-900/75 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-white transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="font-medium text-sm">Back to Home</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <Link to="/register" className="btn-primary btn-sm">Get Started</Link>
                    </div>
                </div>
            </header>

            <main className="pt-28 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <p className="eyebrow mb-3">Integrations</p>
                        <h2 className="page-title !text-4xl font-display">Connect your <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 dark:from-violet-400 dark:to-fuchsia-300 bg-clip-text text-transparent">stack</span> to WebPulse</h2>
                        <p className="page-sub !text-base mt-3 max-w-2xl mx-auto">
                            Track events from your applications, query analytics through the API, and build the integrations your workflow needs.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-20">
                        {integrations.map((item) => (
                            <article key={item.title} className="card card-pad card-hover flex flex-col">
                                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10">
                                    <item.icon className="h-6 w-6 text-violet-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 tracking-tight">{item.title}</h3>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-100 mb-2">{item.headline}</p>
                                <p className="prose-quiet text-sm">{item.description}</p>

                                {item.flow && <FlowDiagram steps={item.flow} />}

                                {item.code && (
                                    <pre className="mt-6 rounded-xl bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 text-xs font-mono overflow-x-auto border border-slate-800">{item.code}</pre>
                                )}

                                <div className="mt-auto pt-6">
                                    <Link to={item.link.to} className="inline-flex items-center gap-1 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 transition-colors">
                                        {item.link.label} <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="card card-pad md:p-10 max-w-5xl mx-auto">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10">
                                <Plug className="h-5 w-5 text-violet-500" />
                            </div>
                            <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">Build your own integration</h3>
                        </div>
                        <p className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">WebPulse is API-first.</p>
                        <p className="prose-quiet mb-6">
                            You don't need a pre-built connector for every service. If your application can make an HTTP request, it can work with WebPulse.
                        </p>

                        <div className="flex flex-col items-center gap-1 mb-8">
                            {['Your App', 'WebPulse API', 'Analytics'].map((s, i, arr) => (
                                <div key={s}>
                                    <div className="rounded-lg bg-slate-900 dark:bg-violet-500 text-white px-5 py-2 text-center text-xs font-semibold">
                                        {s}
                                    </div>
                                    {i < arr.length - 1 && (
                                        <div className="flex items-center gap-2 justify-center my-1">
                                            <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500">{i === 0 ? 'Events' : 'Data'}</span>
                                            <ArrowDown className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-500 mb-3">Supported today</p>
                        <div className="flex flex-wrap gap-2">
                            {supported.map((s) => (
                                <span key={s} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <footer className="border-t border-slate-200 dark:border-white/[0.06] py-10 bg-slate-50 dark:bg-[#070A10] text-center">
                <div className="flex items-center justify-center gap-2 mb-4 opacity-70">
                    <Logo />
                </div>
                <p className="text-slate-400 dark:text-slate-600 text-xs">© 2026 WebPulse</p>
            </footer>
        </div>
    );
}