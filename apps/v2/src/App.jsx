import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import GlobalLoader from './components/GlobalLoader';
import ScrollToTop from './components/ScrollToTop';
import { ToastProvider } from './context/ToastContext';
import { ThemeSync } from './context/ThemeContext';
import { ProjectProvider } from './context/ProjectContext';
import GoogleAuth from './components/GoogleAuth';
import ExternalRedirect from './components/ExternalRedirect';
import { isAuthenticated } from './utils/auth';

const ShareReport = lazy(() => import('./pages/ShareReport'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Visitors = lazy(() => import('./pages/Visitors'));
const Sessions = lazy(() => import('./pages/Sessions'));
const Pages = lazy(() => import('./pages/Pages'));
const Events = lazy(() => import('./pages/Events'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
const Sources = lazy(() => import('./pages/Sources'));
const Geography = lazy(() => import('./pages/Geography'));
const LiveActivity = lazy(() => import('./pages/LiveActivity'));
const Alerts = lazy(() => import('./pages/Alerts'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const ProjectActivity = lazy(() => import('./pages/ProjectActivity'));
const Billing = lazy(() => import('./pages/Billing'));
const Settings = lazy(() => import('./pages/Settings'));
const APIKeys = lazy(() => import('./pages/APIKeys'));
const Integrations = lazy(() => import('./pages/Integrations'));
const NotFound = lazy(() => import('./pages/NotFound'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const GoogleCallback = lazy(() => import('./pages/GoogleCallback'));

function PrivateRoute({ children }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?returnUrl=${returnUrl}`} replace />;
  }
  return children;
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <ProjectProvider>
            <div className="min-h-screen">
              <ScrollToTop />
              <ThemeSync />
              <Suspense fallback={<GlobalLoader />}>
                <Routes>
                  {/* Root entry: redirect to dashboard */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />

                  {/* Public Auth Routes */}
                  <Route path="/share/:shareToken" element={<ShareReport />} />
                  <Route
                    path="/login"
                    element={
                      <GoogleAuth>
                        <Login />
                      </GoogleAuth>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <GoogleAuth>
                        <Register />
                      </GoogleAuth>
                    }
                  />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route
                    path="/auth/google/callback"
                    element={
                      <GoogleAuth>
                        <GoogleCallback />
                      </GoogleAuth>
                    }
                  />

                  {/* Protected Routes wrapped in App Shell Layout */}
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
                      path="/dashboard/visitors"
                      element={
                        <PrivateRoute>
                          <Visitors />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/dashboard/sessions"
                      element={
                        <PrivateRoute>
                          <Sessions />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/dashboard/pages"
                      element={
                        <PrivateRoute>
                          <Pages />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/dashboard/events"
                      element={
                        <PrivateRoute>
                          <Events />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/dashboard/events/:name"
                      element={
                        <PrivateRoute>
                          <EventDetail />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/dashboard/sources"
                      element={
                        <PrivateRoute>
                          <Sources />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/dashboard/geography"
                      element={
                        <PrivateRoute>
                          <Geography />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/dashboard/live"
                      element={
                        <PrivateRoute>
                          <LiveActivity />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/dashboard/alerts"
                      element={
                        <PrivateRoute>
                          <Alerts />
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
                    <Route
                      path="/dashboard/api-key"
                      element={
                        <PrivateRoute>
                          <APIKeys />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/dashboard/api-keys"
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
                      path="/dashboard/settings"
                      element={
                        <PrivateRoute>
                          <Settings />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/dashboard/settings/:tab"
                      element={
                        <PrivateRoute>
                          <Settings />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/dashboard/integrations"
                      element={
                        <PrivateRoute>
                          <Integrations />
                        </PrivateRoute>
                      }
                    />
                  </Route>

                  {/* Internal Aliases */}
                  <Route path="/api-keys" element={<Navigate to="/dashboard/api-key" replace />} />
                  <Route path="/api-key" element={<Navigate to="/dashboard/api-key" replace />} />
                  <Route path="/integrations" element={<Navigate to="/dashboard/integrations" replace />} />

                  {/* Public Marketing Redirects to Canonical Marketing Site */}
                  <Route path="/pricing" element={<ExternalRedirect to="/pricing" />} />
                  <Route path="/blog" element={<ExternalRedirect to="/blog" />} />
                  <Route path="/features" element={<ExternalRedirect to="/features" />} />
                  <Route path="/about" element={<ExternalRedirect to="/about" />} />
                  <Route path="/contact" element={<ExternalRedirect to="/contact" />} />
                  <Route path="/api" element={<ExternalRedirect to="/api" />} />
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
          </ProjectProvider>
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
