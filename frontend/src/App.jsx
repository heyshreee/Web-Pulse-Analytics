import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import Spinner from './components/Spinner';
import ScrollToTop from './components/ScrollToTop';

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
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const GoogleCallback = lazy(() => import('./pages/GoogleCallback'));
import { ToastProvider } from './context/ToastContext';
import { isAuthenticated } from './utils/auth';
import './App.css';

function PrivateRoute({ children }) {
    return isAuthenticated() ? children : <Navigate to="/login" />;
}

function App() {
    return (
        <ErrorBoundary>
            <ToastProvider>
                <BrowserRouter>
                    <div className="min-h-screen">
                        <ScrollToTop />
                        <Suspense fallback={<Spinner />}>
                            <Routes>
                                {/* Public Routes */}
                                <Route path="/share/:shareToken" element={<ShareReport />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/verify-email" element={<VerifyEmail />} />
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route path="/reset-password" element={<ResetPassword />} />
                                <Route path="/auth/google/callback" element={<GoogleCallback />} />



                                {/* Protected Routes wrapped in Layout */}
                                <Route element={<Layout />}>
                                    <Route
                                        path="/dashboard"
                                        element={
                                            <PrivateRoute>
                                                <Dashboard />
                                            </PrivateRoute>
                                        }
                                    />
                                    <Route
                                        path="/dashboard/projects"
                                        element={
                                            <PrivateRoute>
                                                <Projects />
                                            </PrivateRoute>
                                        }
                                    />
                                    <Route
                                        path="/dashboard/projects/:idOrName/:tab?"
                                        element={
                                            <PrivateRoute>
                                                <ProjectDetail />
                                            </PrivateRoute>
                                        }
                                    />
                                    <Route
                                        path="/dashboard/api-key"
                                        element={
                                            <PrivateRoute>
                                                <APIKeys />
                                            </PrivateRoute>
                                        }
                                    />

                                    <Route
                                        path="/dashboard/billing"
                                        element={
                                            <PrivateRoute>
                                                <Billing />
                                            </PrivateRoute>
                                        }
                                    />
                                    <Route
                                        path="/dashboard/settings/:tab?"
                                        element={
                                            <PrivateRoute>
                                                <Settings />
                                            </PrivateRoute>
                                        }
                                    />
                                    <Route
                                        path="/dashboard/projects/:idOrName/activity"
                                        element={
                                            <PrivateRoute>
                                                <ProjectActivity />
                                            </PrivateRoute>
                                        }
                                    />
                                    <Route
                                        path="/dashboard/activity"
                                        element={
                                            <PrivateRoute>
                                                <ProjectActivity />
                                            </PrivateRoute>
                                        }
                                    />
                                </Route>

                                <Route path="/" element={<Landing />} />
                                <Route path="/pricing" element={<Pricing />} />
                                <Route path="/blog" element={<Blog />} />
                                <Route path="/features" element={<Features />} />
                                <Route path="/api" element={<API />} />
                                <Route path="/integrations" element={<Integrations />} />
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
                                <Route path="/community" element={<Community />} />
                                <Route path="/help" element={<HelpCenter />} />
                                <Route path="/security" element={<Security />} />
                                <Route path="/privacy" element={<Legal type="privacy" />} />
                                <Route path="/terms" element={<Legal type="terms" />} />
                                <Route path="/cookies" element={<Legal type="cookies" />} />
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
