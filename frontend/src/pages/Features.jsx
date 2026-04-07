import { Link } from 'react-router-dom';
import { ArrowLeft, Activity, Layout, Bell, Zap, Shield, Globe } from 'lucide-react';

export default function Features() {
    const features = [
        {
            icon: <Activity className="h-8 w-8 text-blue-400" />,
            title: "Real-Time Tracking",
            description: "See every viewer join and leave your stream instantly. Our low-latency tracking ensures you're always up to date with your audience numbers."
        },
        {
            icon: <Layout className="h-8 w-8 text-purple-400" />,
            title: "Multi-Project Dashboard",
            description: "Manage multiple streams, channels, or shows from a single interface. Switch between projects with one click."
        },
        {
            icon: <Bell className="h-8 w-8 text-teal-400" />,
            title: "Smart Alerts",
            description: "Set custom thresholds for viewer counts or stream health metrics. Get notified via Discord, Email, or Slack when goals are met."
        },
        {
            icon: <Zap className="h-8 w-8 text-yellow-400" />,
            title: "Instant Setup",
            description: "No complex configuration. Just copy your unique tracking URL into your OBS browser source and you're live."
        },
        {
            icon: <Shield className="h-8 w-8 text-green-400" />,
            title: "Privacy First",
            description: "We respect your data and your viewers' privacy. We are GDPR compliant and never sell your data to third parties."
        },
        {
            icon: <Globe className="h-8 w-8 text-red-400" />,
            title: "Global CDN",
            description: "Our tracking pixels are served from edge locations around the world, ensuring minimal latency for viewers everywhere."
        }
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-[#0B0E14] text-slate-900 dark:text-slate-200 font-sans selection:bg-blue-500/30 transition-colors duration-500">
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
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter">Powerful Features for Modern Creators</h2>
                        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
                            Everything you need to understand your audience and grow your stream.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-slate-50 dark:bg-[#151921] border border-slate-200 dark:border-white/5 hover:border-blue-500/30 dark:hover:border-white/10 transition-all hover:shadow-xl shadow-sm">
                                <div className="mb-6 bg-slate-200/50 dark:bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">{feature.title}</h3>
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                    {feature.description}
                                </p>
                            </div>
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
