import { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { apiRequest, getApiUrl } from '../utils/api';
import { useToast } from '../context/ToastContext';

// Hooks
import useProjectData from '../hooks/useProjectData';
import useProjectSocket from '../hooks/useProjectSocket';

// Utilities
import { getSnippets, getSnippetLanguage } from '../utils/snippetGenerator';

// Components
import ProjectHeader from '../components/project/ProjectHeader';
import ProjectTabs from '../components/project/ProjectTabs';

// Tabs
import OverviewTab from '../components/project/tabs/OverviewTab';
import AnalyticsTab from '../components/project/tabs/AnalyticsTab';
import IntegrationTab from '../components/project/tabs/IntegrationTab';
import SettingsTab from '../components/project/tabs/SettingsTab';

// Modals
import DeleteModal from '../components/project/modals/DeleteModal';
import DisableModal from '../components/project/modals/DisableModal';
import ShareModal from '../components/project/modals/ShareModal';
import PagesModal from '../components/project/modals/PagesModal';
import ActivityModal from '../components/project/modals/ActivityModal';

export default function ProjectDetail() {
  const { idOrName, tab } = useParams();
  const navigate = useNavigate();
  const { user, loadUser, usageStats, setIsPageLoading } = useOutletContext();
  const { showToast } = useToast();

  // Tab State
  const [activeTab, setActiveTab] = useState(tab || 'overview');
  const [snippetType, setSnippetType] = useState('vanilla');

  // Time Range Management
  const [timeRange, setTimeRange] = useState('7d');

  // Custom Data Hook
  const {
    project, stats, overviewStats, loading, loadingChart, saving, deleting,
    projectName, setProjectName, allowedOrigins, setAllowedOrigins,
    targetUrl, setTargetUrl, isActive, timezone, setTimezone,
    notifications, setNotifications, shareToken, setShareToken,
    loadStats, handleSaveSettings, handleDelete, handleLiveUpdate
  } = useProjectData(idOrName, timeRange);

  // WebSocket Hook
  useProjectSocket(project?.id, handleLiveUpdate);

  // Modal Visibility States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showPagesModal, setShowPagesModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [editingSecurity, setEditingSecurity] = useState(false);
  const [editing, setEditing] = useState(false);

  // Modal Data States
  const [activityData, setActivityData] = useState([]);
  const [pagesData, setPagesData] = useState([]);
  const [loadingModalData, setLoadingModalData] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // Sync tab with URL
  useEffect(() => {
    if (tab) setActiveTab(tab);
  }, [tab]);

  useEffect(() => {
    if (!loading) {
      setIsPageLoading?.(false);
    }
  }, [loading, setIsPageLoading]);

  // Derived Values
  const trackingId = project?.tracking_id;
  
  // Construct absolute tracking URL
  const getAbsoluteTrackingUrl = () => {
    if (!project) return '';
    const apiUrl = getApiUrl();
    
    // If it's a relative path, use the current origin
    if (apiUrl.startsWith('/')) {
      return `${window.location.protocol}//${window.location.host}${apiUrl}/track/${trackingId}`;
    }
    
    // If it's already an absolute URL (typical for production/remote API)
    return `${apiUrl}/track/${trackingId}`;
  };

  const trackingUrl = getAbsoluteTrackingUrl();
  const scriptUrl = trackingUrl ? `${trackingUrl}/script.js` : '';

  const snippets = project ? getSnippets({ trackingId, trackingUrl, user, project }) : {};
  const activeSnippet = snippets[snippetType] || '';
  const snippetLanguage = getSnippetLanguage(snippetType);

  // Handlers
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    navigate(`/dashboard/projects/${idOrName}/${newTab}`);
  };

  const handleRefresh = () => {
    loadStats(project?.id, true);
  };

  const handleShowActivity = async () => {
    setShowActivityModal(true);
    setLoadingModalData(true);
    try {
      const data = await apiRequest(`/analytics/projects/${project.id}/activity?range=${timeRange}`);
      setActivityData(data);
    } catch (err) {
      showToast('Failed to load activity', 'error');
    } finally {
      setLoadingModalData(false);
    }
  };

  const handleShowPages = async () => {
    setShowPagesModal(true);
    setLoadingModalData(true);
    try {
      const data = await apiRequest(`/analytics/projects/${project.id}/pages?range=${timeRange}`);
      setPagesData(data);
    } catch (err) {
      showToast('Failed to load pages', 'error');
    } finally {
      setLoadingModalData(false);
    }
  };

  const handleDisableSharing = async () => {
    try {
      await apiRequest(`/projects/${project.id}/share-token`, { method: 'DELETE' });
      setShareToken(null);
      showToast('Sharing disabled', 'success');
    } catch (err) {
      showToast('Failed to disable sharing', 'error');
    }
  };

  const handleGenerateLink = async () => {
    try {
      const data = await apiRequest(`/projects/${project.id}/share-token`, { method: 'POST' });
      setShareToken(data.share_token);
      showToast('New link generated', 'success');
    } catch (err) {
      showToast('Failed to generate link', 'error');
    }
  };

  const handleToggleActiveWrapper = async () => {
    if (isActive && !showDisableModal) {
      setShowDisableModal(true);
      return;
    }
    const result = await handleSaveSettings({ isActive: !isActive });
    if (result) {
      setShowDisableModal(false);
    }
  };

  const onSaveSecurity = () => handleSaveSettings();

  const handleSaveSettingsWrapper = async () => {
    const success = await handleSaveSettings();
    if (success) {
      setEditing(false);
    }
  };

  const onDeleteConfirm = async (name) => {
    const success = await handleDelete(name, loadUser);
    if (success) {
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3 font-sans animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--wp-border-subtle)]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-16 bg-[var(--wp-border-subtle)] rounded" />
              <span className="text-[var(--wp-border-strong)] text-xs">/</span>
              <div className="h-3 w-24 bg-[var(--wp-border-subtle)] rounded" />
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="h-6 w-44 bg-[var(--wp-border-default)] rounded" />
              <div className="h-5 w-20 bg-[var(--wp-border-subtle)] rounded" />
              <div className="h-5 w-32 bg-[var(--wp-border-subtle)] rounded hidden sm:block" />
            </div>
          </div>
          <div className="h-7 w-20 bg-[var(--wp-border-default)] rounded self-start sm:self-auto" />
        </div>

        {/* Tabs Bar Skeleton */}
        <div className="flex gap-5 border-b border-[var(--wp-border-subtle)] pb-2">
          {['Overview', 'Analytics', 'Integration', 'Settings'].map((tabLabel, idx) => (
            <div key={idx} className="h-4 w-16 bg-[var(--wp-border-subtle)] rounded" />
          ))}
        </div>

        {/* Unified 4-Column KPI Bar Skeleton */}
        <div className="wp-panel min-h-[82px] grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[var(--wp-border-default)] bg-[var(--wp-bg-surface)]">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-3 w-20 bg-[var(--wp-border-subtle)] rounded" />
                <div className="h-3.5 w-3.5 bg-[var(--wp-border-subtle)] rounded" />
              </div>
              <div className="h-6 w-24 bg-[var(--wp-border-default)] rounded font-mono" />
              <div className="h-2.5 w-28 bg-[var(--wp-border-subtle)] rounded" />
            </div>
          ))}
        </div>

        {/* Split Workspace Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[420px]">
          {/* Left: Live Activity / Main Panel (7 cols) */}
          <div className="col-span-12 lg:col-span-7 wp-panel flex flex-col bg-[var(--wp-bg-surface)]">
            <div className="wp-panel-header">
              <div className="h-3.5 w-32 bg-[var(--wp-border-subtle)] rounded" />
              <div className="h-3.5 w-20 bg-[var(--wp-border-subtle)] rounded" />
            </div>
            <div className="p-3.5 space-y-2 flex-1">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-9 rounded bg-[var(--wp-bg-subtle)]/70 flex items-center px-3 justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 bg-[var(--wp-border-subtle)] rounded" />
                    <div className="h-3 w-28 bg-[var(--wp-border-subtle)] rounded" />
                  </div>
                  <div className="h-3 w-16 bg-[var(--wp-border-subtle)] rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Telemetry / Status Ingress (5 cols) */}
          <div className="col-span-12 lg:col-span-5 wp-panel flex flex-col justify-between bg-[var(--wp-bg-surface)]">
            <div className="wp-panel-header">
              <div className="h-3.5 w-28 bg-[var(--wp-border-subtle)] rounded" />
              <div className="h-3.5 w-16 bg-[var(--wp-border-subtle)] rounded" />
            </div>
            <div className="py-12 flex flex-col items-center justify-center space-y-2">
              <div className="h-10 w-24 bg-[var(--wp-border-default)] rounded" />
              <div className="h-3 w-36 bg-[var(--wp-border-subtle)] rounded" />
            </div>
            <div className="p-3 border-t border-[var(--wp-border-subtle)] flex items-center justify-between">
              <div className="h-2.5 w-20 bg-[var(--wp-border-subtle)] rounded" />
              <div className="h-2.5 w-24 bg-[var(--wp-border-subtle)] rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!project) return (
    <div className="flex h-96 items-center justify-center text-center text-ink-muted text-sm font-mono">
      Project not found or access denied.
    </div>
  );

  return (
    <div className="space-y-3 font-sans">
      <ProjectHeader 
        project={project} 
        onShowShare={() => setShowShareModal(true)} 
      />

      <ProjectTabs 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
      />

      {activeTab === 'overview' && (
        <OverviewTab 
          stats={stats}
          overviewStats={overviewStats}
          loadingChart={loadingChart}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          onShowActivity={handleShowActivity}
          onShowPages={handleShowPages}
          onRefresh={handleRefresh}
        />
      )}

      {activeTab === 'analytics' && (
        <AnalyticsTab 
          overviewStats={overviewStats}
          loadingChart={loadingChart}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          onViewAllPages={handleShowPages}
          onRefresh={handleRefresh}
        />
      )}

      {activeTab === 'integration' && (
        <IntegrationTab 
          snippetType={snippetType}
          setSnippetType={setSnippetType}
          activeSnippet={activeSnippet}
          snippetLanguage={snippetLanguage}
          trackingUrl={trackingUrl}
          scriptUrl={scriptUrl}
          allowedOrigins={allowedOrigins}
          setAllowedOrigins={setAllowedOrigins}
          editingSecurity={editingSecurity}
          setEditingSecurity={setEditingSecurity}
          saving={saving}
          usageStats={usageStats}
          onSaveSecurity={onSaveSecurity}
        />
      )}

      {activeTab === 'settings' && (
        <SettingsTab 
          project={project}
          projectName={projectName}
          setProjectName={setProjectName}
          targetUrl={targetUrl}
          setTargetUrl={setTargetUrl}
          isActive={isActive}
          onToggleActive={handleToggleActiveWrapper}
          onDelete={() => setShowDeleteModal(true)}
          onSave={handleSaveSettingsWrapper}
          saving={saving}
          timezone={timezone}
          setTimezone={setTimezone}
          notifications={notifications}
          setNotifications={setNotifications}
          editing={editing}
          setEditing={setEditing}
        />
      )}

      {/* Modals Orchestration */}
      <DeleteModal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        onDelete={onDeleteConfirm}
        projectName={project.name}
        deleting={deleting}
        deleteConfirmation={deleteConfirmation}
        setDeleteConfirmation={setDeleteConfirmation}
      />

      <DisableModal 
        isOpen={showDisableModal} 
        onClose={() => setShowDisableModal(false)} 
        onToggleActive={handleToggleActiveWrapper}
        projectName={project.name}
      />

      <ShareModal 
        isOpen={showShareModal} 
        onClose={() => setShowShareModal(false)}
        shareToken={shareToken}
        onDisableSharing={handleDisableSharing}
        onGenerateLink={handleGenerateLink}
      />

      <PagesModal 
        isOpen={showPagesModal} 
        onClose={() => setShowPagesModal(false)}
        loading={loadingModalData}
        pagesData={pagesData}
      />

      <ActivityModal 
        isOpen={showActivityModal} 
        onClose={() => setShowActivityModal(false)}
        loading={loadingModalData}
        activityData={activityData}
      />
    </div>
  );
}
