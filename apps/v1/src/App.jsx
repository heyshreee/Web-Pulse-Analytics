import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import Spinner from './components/Spinner';
import ScrollToTop from './components/ScrollToTop';
import ExternalRedirect from './components/ExternalRedirect';
import { probeSession } from './utils/api';
import { isAuthenticated, setSession, clearSession, SESSION_FLAG } from './utils/auth';

const ShareReport = lazy(() => import('./pages/ShareReport'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const ProjectActivity = lazy(() => import('./pages/ProjectActivity'));
const Billing = lazy(() => import('./pages/Billing'));
const Settings = lazy(() => import('./pages/Settings'));
const APIKeys = lazy(() => import('./pages/APIKeys'));
const NotFound = lazy(() => import('./pages/NotFound'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const GoogleCallback = lazy(() => import('./pages/GoogleCallback'));
import { ToastProvider } from './context/ToastContext';
import { ThemeSync } from './context/ThemeContext';
import GoogleAuth from './components/GoogleAuth';
import './App.css';

function PrivateRoute({ children }) {
    const location = useLocation();
    const [checking, setChecking] = useState(!isAuthenticated());
    const [authed, setAuthed] = useState(isAuthenticated());

    useEffect(() => {
        const handleStorage = (e) => {
            if ((e.key === SESSION_FLAG && e.newValue !== '1') || e.key === null) {
                setAuthed(false);
                setChecking(false);
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    useEffect(() => {
        let isMounted = true;
        if (authed) {
            setChecking(false);
            return;
        }

        // Seamless SSO session restoration: check if HttpOnly cookie session exists (e.g. from V2)
        probeSession()
            .then((data) => {
                if (isMounted && data?.authenticated && data?.user?.id) {
                    setSession();
                    setAuthed(true);
                } else if (isMounted) {
                    clearSession();
                    setAuthed(false);
                }
            })
            .catch((err) => {
                if (isMounted) {
                    if (err?.status !== 503) {
                        clearSession();
                    }
                    setAuthed(false);
                }
            })
            .finally(() => {
                if (isMounted) setChecking(false);
            });

        return () => {
            isMounted = false;
        };
    }, [authed]);

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070A10]">
                <div className="h-6 w-6 rounded-full border-2 border-slate-300 dark:border-slate-700 border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!authed) {
        const returnUrl = encodeURIComponent(location.pathname + location.search);
        return (
            <Navigate
                to={`/login?returnUrl=${returnUrl}`}
                state={{ from: location, sessionChecked: true }}
                replace
            />
        );
    }
    return children;
}

function App() {
    return (
        <ErrorBoundary>
            <ToastProvider>
                <BrowserRouter>
                    <div className="min-h-screen">
                        <ScrollToTop />
                        <ThemeSync />
                        <Suspense fallback={<Spinner />}>
                            <Routes>
                                {/* Root entry: redirect to dashboard */}
                                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                                {/* Technical Auth Routes */}
                                <Route path="/share/:shareToken" element={<ShareReport />} />
                                <Route path="/login" element={<GoogleAuth><Login /></GoogleAuth>} />
                                <Route path="/register" element={<GoogleAuth><Register /></GoogleAuth>} />
                                <Route path="/verify-email" element={<VerifyEmail />} />
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route path="/reset-password" element={<ResetPassword />} />
                                <Route path="/auth/google/callback" element={<GoogleAuth><GoogleCallback /></GoogleAuth>} />

                                {/* Protected V1 Dashboard Routes */}
                                <Route
                                    element={
                                        <PrivateRoute>
                                            <Layout />
                                        </PrivateRoute>
                                    }
                                >
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/dashboard/projects" element={<Projects />} />
                                    <Route path="/dashboard/projects/:idOrName/:tab?" element={<ProjectDetail />} />
                                    <Route path="/dashboard/api-key" element={<APIKeys />} />
                                    <Route path="/dashboard/billing" element={<Billing />} />
                                    <Route path="/dashboard/settings/:tab?" element={<Settings />} />
                                    <Route path="/dashboard/projects/:idOrName/activity" element={<ProjectActivity />} />
                                    <Route path="/dashboard/activity" element={<ProjectActivity />} />
                                </Route>

                                {/* Public Marketing Redirects to Canonical Marketing Site */}
                                <Route path="/pricing" element={<ExternalRedirect to="/pricing" />} />
                                <Route path="/blog" element={<ExternalRedirect to="/blog" />} />
                                <Route path="/features" element={<ExternalRedirect to="/features" />} />
                                <Route path="/about" element={<ExternalRedirect to="/about" />} />
                                <Route path="/contact" element={<ExternalRedirect to="/contact" />} />
                                <Route path="/api" element={<ExternalRedirect to="/api" />} />
                                <Route path="/integrations" element={<ExternalRedirect to="/integrations" />} />
                                <Route path="/docs/*" element={<ExternalRedirect />} />
                                <Route path="/community" element={<ExternalRedirect to="/community" />} />
                                <Route path="/help" element={<ExternalRedirect to="/help" />} />
                                <Route path="/security" element={<ExternalRedirect to="/security" />} />
                                <Route path="/privacy" element={<ExternalRedirect to="/privacy" />} />
                                <Route path="/terms" element={<ExternalRedirect to="/terms" />} />
                                <Route path="/cookies" element={<ExternalRedirect to="/cookies" />} />

                                {/* Fallback 404 */}
                                <Route path="*" element={<NotFound />} />
                            </Routes>
                        </Suspense>
                    </div>
                </BrowserRouter>
            </ToastProvider>
        </ErrorBoundary>
    );
}

export default App;
