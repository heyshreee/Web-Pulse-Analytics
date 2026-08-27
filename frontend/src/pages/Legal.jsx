import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart2 } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function Legal({ type }) {
    const content = {
        privacy: {
            title: "Privacy Policy",
            lastUpdated: "January 14, 2026",
            body: (
                <>
                    <p>At WebPulse Analytics, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information.</p>
                    <h3>1. Information We Collect</h3>
                    <p>We collect information you provide directly to us, such as when you create an account, subscribe to our newsletter, or contact customer support.</p>
                    <h3>2. How We Use Your Information</h3>
                    <p>We use the information we collect to provide, maintain, and improve our services, to develop new ones, and to protect WebPulse Analytics and our users.</p>
                </>
            )
        },
        terms: {
            title: "Terms of Service",
            lastUpdated: "January 14, 2026",
            body: (
                <>
                    <p>By accessing or using WebPulse Analytics, you agree to be bound by these Terms of Service.</p>
                    <h3>1. Use of Service</h3>
                    <p>You must follow any policies made available to you within the Services. You may not misuse our Services.</p>
                    <h3>2. Account Responsibilities</h3>
                    <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.</p>
                    <h3>3. Termination</h3>
                    <p>We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever.</p>
                </>
            )
        },
        cookies: {
            title: "Cookie Policy",
            lastUpdated: "January 14, 2026",
            body: (
                <>
                    <p>WebPulse Analytics uses cookies to improve your experience on our website.</p>
                    <h3>1. What are cookies?</h3>
                    <p>Cookies are small text files that are placed on your computer by websites that you visit.</p>
                    <h3>2. How we use cookies</h3>
                    <p>We use cookies to understand how you use our site and to improve your experience. This includes personalizing content and ads.</p>
                </>
            )
        }
    };

    const data = content[type] || content.privacy;

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
                        <Link to="/register" className="btn-primary btn-sm">Get Started</Link>
                    </div>
                </div>
            </header>

            <main className="pt-28 pb-20">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <p className="eyebrow mb-3">Legal</p>
                        <h2 className="page-title !text-3xl mb-2">{data.title}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Last updated: {data.lastUpdated}</p>
                    </div>

                    <div className="card card-pad space-y-6">
                        {React.Children.map(data.body, (child, idx) => (
                            child.type === 'h3'
                                ? <h3 key={idx} className="text-lg font-semibold text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800 first:border-t-0 first:pt-0">{child.props.children}</h3>
                                : <p key={idx} className="prose-quiet">{child.props.children}</p>
                        ))}
                    </div>
                </div>
            </main>

            <footer className="border-t border-slate-200 dark:border-slate-800 py-10 bg-white dark:bg-slate-950 text-center">
                <div className="flex items-center justify-center gap-2 mb-4 opacity-70">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 dark:bg-violet-500 text-white">
                        <BarChart2 className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">WebPulse Analytics</span>
                </div>
                <p className="text-slate-400 dark:text-slate-600 text-xs">© 2026 WebPulse Analytics Inc. All rights reserved.</p>
            </footer>
        </div>
    );
}
