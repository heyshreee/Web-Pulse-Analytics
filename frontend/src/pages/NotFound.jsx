import React from 'react';
import { Link } from 'react-router-dom';
import { Layout, Power, Share2, HelpCircle } from 'lucide-react';
import notFoundImage from '../assets/404-island.png';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-white dark:bg-[#0B0E14] text-slate-900 dark:text-white flex flex-col relative overflow-hidden font-sans transition-colors duration-500">
            {/* Background Elements - Subtle Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 dark:bg-purple-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 dark:bg-blue-900/10 rounded-full blur-[120px]" />
            </div>

            {/* Header */}
            <header className="relative z-10 flex justify-between items-center p-6 md:px-12 md:py-8">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                        <div className="w-4 h-4 bg-white/20 rounded-md" />
                    </div>
                    <span className="font-black tracking-widest text-sm uppercase text-slate-900 dark:text-white">OBS <span className="text-indigo-600">TRACKER</span></span>
                </div>
                <nav className="hidden md:flex items-center gap-8 text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500">
                    <a href="#" className="hover:text-indigo-600 dark:hover:text-white transition-colors">NETWORK STATUS</a>
                    <a href="#" className="hover:text-indigo-600 dark:hover:text-white transition-colors">SUPPORT</a>
                </nav>
            </header>

            {/* Main Content */}
            <main className="flex-1 relative z-10 flex flex-col items-center justify-center px-4 text-center">
                {/* 404 Image Container */}
                <div className="relative mb-8 md:mb-12">
                    {/* Background number watermark */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20rem] font-black text-slate-900/[0.03] dark:text-white/[0.02] pointer-events-none select-none leading-none tracking-tighter">
                        404
                    </div>

                    {/* Floating Island Image */}
                    <div className="relative w-72 h-72 md:w-[28rem] md:h-[28rem] animate-float">
                        <div className="absolute inset-0 bg-indigo-500/10 dark:bg-blue-500/20 rounded-full blur-[80px] animate-pulse-slow" />
                        <img
                            src={notFoundImage}
                            alt="404 Floating Island"
                            className="w-full h-full object-contain relative z-10 drop-shadow-[0_35px_35px_rgba(0,0,0,0.25)]"
                        />
                    </div>
                </div>

                {/* Text Content */}
                <div className="max-w-2xl mx-auto space-y-6">
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter leading-tight font-serif italic">
                        404: Lost in Space
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-lg mx-auto opacity-80">
                        The tracking data you're looking for has drifted beyond the horizon. Let's get you back to the stream.
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-12">
                        <Link
                            to="/dashboard"
                            className="group relative px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl transition-all duration-300 flex items-center gap-3 overflow-hidden shadow-2xl shadow-black/10 dark:shadow-white/5 active:scale-95"
                        >
                            <Layout className="w-4 h-4 transition-transform group-hover:-rotate-12" />
                            <span className="text-sm font-black tracking-tight">BACK TO DASHBOARD</span>
                        </Link>

                        <Link
                            to="/dashboard/projects"
                            className="group px-10 py-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-2xl transition-all duration-300 flex items-center gap-3 active:scale-95 border border-slate-200 dark:border-white/5"
                        >
                            <Power className="w-4 h-4 transition-transform group-hover:scale-110" />
                            <span className="text-sm font-black tracking-tight">TRACK NEW SESSION</span>
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 flex flex-col md:flex-row justify-between items-center p-6 md:px-12 md:py-8 gap-4">
                <div className="text-[10px] font-black font-mono text-slate-400 dark:text-slate-600 tracking-[0.3em] uppercase">
                    Coordinates: 40.7128° N, 74.0060° W
                </div>

                <div className="flex items-center gap-4">
                    <button className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-indigo-600 dark:hover:text-white hover:border-indigo-600 dark:hover:border-slate-600 transition-all shadow-sm">
                        <Share2 className="w-4 h-4" />
                    </button>
                    <button className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-indigo-600 dark:hover:text-white hover:border-indigo-600 dark:hover:border-slate-600 transition-all shadow-sm">
                        <HelpCircle className="w-4 h-4" />
                    </button>
                </div>
            </footer>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animate-pulse-slow {
                    animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}</style>
        </div>
    );
}
