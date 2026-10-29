import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Spinner from './components/Spinner';
import ScrollToTop from './components/ScrollToTop';
import { ThemeSync } from './context/ThemeContext';
import './App.css';

// Lazy-loaded marketing pages
const Landing = lazy(() => import('./pages/Landing'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Blog = lazy(() => import('./pages/Blog'));
const Legal = lazy(() => import('./pages/Legal'));
const Features = lazy(() => import('./pages/Features'));
const API = lazy(() => import('./pages/API'));
const Integrations = lazy(() => import('./pages/Integrations'));
const Security = lazy(() => import('./pages/Security'));
const DocsLayout = lazy(() => import('./pages/docs/DocsLayout'));
const DocsIndex = lazy(() => import('./pages/docs/DocsIndex'));
const DocPage = lazy(() => import('./pages/docs/DocPage'));
const Community = lazy(() => import('./pages/Community'));
const HelpCenter = lazy(() => import('./pages/HelpCenter'));
const NotFound = lazy(() => import('./pages/NotFound'));

/**
 * Redirect handler for console / authentication routes when accessed
 * from the marketing site domain. Respects VITE_APP_URL if configured.
 */
function ConsoleRedirect({ target = '/login' }) {
    const appUrl = import.meta.env.VITE_APP_URL;
    if (appUrl) {
        window.location.assign(`${appUrl.replace(/\/$/, '')}${target}`);
        return null;
    }
    // Fallback: redirect to landing if no external app URL configured
    return <Navigate to="/" replace />;
}

function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <div className="min-h-screen">
                    <ScrollToTop />
                    <ThemeSync />
                    <Suspense fallback={<Spinner />}>
                        <Routes>
                            {/* Canonical Marketing Routes */}
                            <Route path="/" element={<Landing />} />
                            <Route path="/pricing" element={<Pricing />} />
                            <Route path="/features" element={<Features />} />
                            <Route path="/blog" element={<Blog />} />
                            <Route path="/community" element={<Community />} />
                            <Route path="/help" element={<HelpCenter />} />
                            <Route path="/security" element={<Security />} />
                            <Route path="/privacy" element={<Legal type="privacy" />} />
                            <Route path="/terms" element={<Legal type="terms" />} />
                            <Route path="/cookies" element={<Legal type="cookies" />} />
                            <Route path="/api" element={<API />} />
                            <Route path="/integrations" element={<Integrations />} />

                            {/* Documentation Rail */}
                            <Route path="/docs" element={<DocsLayout />}>
                                <Route index element={<DocsIndex />} />
                                <Route path="getting-started" element={<DocPage slug="getting-started" />} />
                                <Route path="tracking" element={<DocPage slug="tracking" />} />
                                <Route path="tracking/events" element={<DocPage slug="tracking-events" />} />
                                <Route path="api" element={<DocPage slug="api" />} />
                                <Route path="api/authentication" element={<DocPage slug="api-authentication" />} />
                                <Route path="api/events" element={<DocPage slug="api-events" />} />
                                <Route path="api/analytics" element={<DocPage slug="api-analytics" />} />
                                <Route path="javascript" element={<DocPage slug="javascript" />} />
                                <Route path="guides" element={<DocPage slug="guides" />} />
                                <Route path="guides/react" element={<DocPage slug="guide-react" />} />
                                <Route path="security" element={<DocPage slug="security" />} />
                            </Route>

                            {/* Console / Auth Handlers */}
                            <Route path="/login" element={<ConsoleRedirect target="/login" />} />
                            <Route path="/register" element={<ConsoleRedirect target="/register" />} />
                            <Route path="/dashboard/*" element={<ConsoleRedirect target="/dashboard" />} />

                            {/* Fallback 404 */}
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Suspense>
                </div>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;
