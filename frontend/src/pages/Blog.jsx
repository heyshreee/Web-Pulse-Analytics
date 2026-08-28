import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, ArrowRight, BarChart2 } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function Blog() {
    const posts = [
        {
            title: "Real-Time Analytics: Why Every Millisecond Counts",
            excerpt: "In the world of live streaming and high-traffic web apps, batch processing is a relic. Discover how WebPulse delivers data at the speed of thought.",
            date: "Oct 12, 2025",
            author: "Team WebPulse",
            category: "Technology",
            image: "/blog/speed.png"
        },
        {
            title: "Mastering the Global Pulse: Visualizing Your Audience",
            excerpt: "A deep dive into our 3D Globe visualization. Learn how to identify geographic trends and peak activity across the planet in real-time.",
            date: "Sep 28, 2025",
            author: "Sarah Jenkins",
            category: "Analytics",
            image: "/blog/globe_viz.png"
        },
        {
            title: "Scaling to Infinity: Behind the WebPulse Infrastructure",
            excerpt: "How we process millions of events per second with sub-100ms latency. An inside look at our Supabase and WebSocket architecture.",
            date: "Sep 15, 2025",
            author: "Mike Chen",
            category: "Architecture",
            image: "/blog/infra.png"
        },
        {
            title: "WebPulse API: Building Custom Analytics Dashboards",
            excerpt: "Turn your raw visitor data into a custom internal tool. Step-by-step guide on leveraging our REST and WebSocket APIs for your own backend.",
            date: "Aug 30, 2025",
            author: "Alex Rivera",
            category: "Developers",
            image: "/blog/api_dev.png"
        }
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans transition-colors duration-300">
            <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-white transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="font-medium text-sm">Back to Home</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <Link to="/features" className="hidden sm:block px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Features</Link>
                        <Link to="/register" className="btn-primary btn-sm">Get Started</Link>
                    </div>
                </div>
            </header>

            <main className="pt-28 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <p className="eyebrow mb-3">Blog</p>
                        <h2 className="page-title !text-4xl">Latest updates</h2>
                        <p className="page-sub !text-base mt-3 max-w-2xl mx-auto">
                            News, tips, and insights from the WebPulse team.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                        {posts.map((post, i) => (
                            <article key={i} className="card card-hover overflow-hidden group bg-white dark:bg-slate-900">
                                <div className="h-52 relative overflow-hidden">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                                <div className="p-7">
                                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">
                                        <span className="font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">{post.category}</span>
                                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {post.date}</span>
                                    </div>
                                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 tracking-tight group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                        {post.title}
                                    </h2>
                                    <p className="prose-quiet mb-5">{post.excerpt}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                            <div className="h-6 w-6 rounded-full bg-violet-100 dark:bg-violet-500/20"></div>
                                            {post.author}
                                        </div>
                                        <span className="text-violet-600 dark:text-violet-400 font-medium flex items-center gap-1 text-sm group-hover:gap-2 transition-all">
                                            Read article <ArrowRight className="h-4 w-4" />
                                        </span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </main>

            <footer className="border-t border-slate-200 dark:border-slate-800 py-10 bg-white dark:bg-slate-950 text-center">
                <div className="flex items-center justify-center gap-2 mb-4 opacity-70">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 dark:bg-violet-500 text-white">
                        <BarChart2 className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">WebPulse</span>
                </div>
                <p className="text-slate-400 dark:text-slate-600 text-xs">© 2026 WebPulse</p>
            </footer>
        </div>
    );
}
