import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, ArrowRight } from 'lucide-react';

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
        <div className="min-h-screen bg-white dark:bg-[#0B0E14] text-slate-900 dark:text-slate-200 font-sans selection:bg-blue-500/30 transition-colors duration-500">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-[#0B0E14]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="font-medium">Back to Home</span>
                    </Link>
                </div>
            </header>

            <main className="pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter">Latest Updates</h2>
                        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
                            News, tips, and insights from the WebPulse team.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {posts.map((post, i) => (
                            <article key={i} className="group bg-slate-50 dark:bg-[#151921] border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden hover:border-blue-500/30 dark:hover:border-white/10 transition-all hover:shadow-2xl hover:shadow-blue-500/5">
                                <div className="h-60 relative overflow-hidden">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                </div>
                                <div className="p-8">
                                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-4">
                                        <span className="text-blue-400 uppercase tracking-wider">{post.category}</span>
                                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {post.date}</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {post.title}
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                            <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                            {post.author}
                                        </div>
                                        <span className="text-blue-500 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                            Read Article <ArrowRight className="h-4 w-4" />
                                        </span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </main>

            <footer className="border-t border-slate-200 dark:border-white/5 py-12 bg-white dark:bg-[#0B0E14] text-center">
                <p className="text-slate-500 dark:text-slate-600 text-[10px] font-black uppercase tracking-widest">© 2026 WebPulse Analytics Inc. All rights reserved.</p>
            </footer>
        </div>
    );
}
