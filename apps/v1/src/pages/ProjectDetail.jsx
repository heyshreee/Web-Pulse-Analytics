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
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center pb-4 border-b border-line">
          <div>
            <div className="h-3 w-28 bg-subtle rounded mb-2" />
            <div className="h-6 w-48 bg-subtle rounded" />
          </div>
          <div className="h-7 w-20 bg-subtle rounded" />
        </div>

        {/* Tabs Bar Skeleton */}
        <div className="flex gap-4 border-b border-line pb-2.5">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-4 w-16 bg-subtle rounded" />
          ))}
        </div>

        {/* Unified 4-Column KPI Bar Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="p-3.5 rounded-lg border border-line bg-surface space-y-2">
              <div className="h-3 w-20 bg-subtle rounded" />
              <div className="h-6 w-24 bg-subtle rounded" />
            </div>
          ))}
        </div>

        {/* Detail Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-lg border border-line bg-surface p-4 h-[380px] space-y-3">
            <div className="h-4 w-32 bg-subtle rounded mb-4" />
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-8 bg-subtle/50 rounded" />
            ))}
          </div>
          <div className="rounded-lg border border-line bg-surface p-4 h-[380px] space-y-3">
            <div className="h-4 w-32 bg-subtle rounded mb-4" />
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-8 bg-subtle/50 rounded" />
            ))}
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
    <div className="space-y-8">
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
