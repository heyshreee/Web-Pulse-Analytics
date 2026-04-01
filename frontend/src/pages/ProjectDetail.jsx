import { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { apiRequest, getApiUrl } from '../utils/api';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

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
  const { user, loadUser, usageStats } = useOutletContext();
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
    targetUrl, setTargetUrl, isActive, setIsActive, timezone, setTimezone,
    notifications, setNotifications, shareToken, setShareToken,
    loadData, loadStats, handleSaveSettings, handleDelete
  } = useProjectData(idOrName, timeRange);

  // WebSocket Hook
  useProjectSocket(project?.id, loadStats);

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

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <Spinner />
    </div>
  );
  if (!project) return (
    <div className="flex h-screen items-center justify-center text-red-400 font-bold bg-slate-950">
      Project not found or access denied.
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-32">
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
