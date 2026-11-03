import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import { useToast } from '../context/ToastContext';

export default function useProjectData(idOrName, timeRange) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [project, setProject] = useState(null);
  const [stats, setStats] = useState(null);
  const [overviewStats, setOverviewStats] = useState({
    realTimeVisitors: 0,
    trafficData: [],
    recentActivity: [],
    topReferrers: [],
    uniqueVisitors: 0,
    avgSessionDuration: '0m 0s'
  });
  
  const [loading, setLoading] = useState(true);
  const [loadingChart, setLoadingChart] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Settings sync states
  const [projectName, setProjectName] = useState('');
  const [allowedOrigins, setAllowedOrigins] = useState([]);
  const [targetUrl, setTargetUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [timezone, setTimezone] = useState('(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi');
  const [notifications, setNotifications] = useState({
    trafficSpikes: true,
    weeklyDigest: false
  });
  const [shareToken, setShareToken] = useState('');

  const loadStats = useCallback(async (projectId, showLoading = false) => {
    if (!projectId) return;
    try {
      if (showLoading) setLoadingChart(true);
      const [statsData, detailedStats] = await Promise.all([
        apiRequest(`/analytics/projects/${projectId}/overview`),
        apiRequest(`/analytics/projects/${projectId}/traffic?range=${timeRange}&timezone=${encodeURIComponent(timezone)}`)
      ]);
      setStats(statsData);
      setOverviewStats({
        ...detailedStats,
        recentActivity: detailedStats.activityList || []
      });
    } catch (err) {
      // Silent fail
    } finally {
      if (showLoading) setLoadingChart(false);
    }
  }, [timeRange, timezone]);
  
  const handleLiveUpdate = useCallback((projectId, data) => {
    if (!data) {
      loadStats(projectId);
      return;
    }

    setOverviewStats(prev => {
      // Avoid duplicate activity entries if possible (match id or timestamp)
      const isDuplicate = prev.recentActivity.some(a => a.id === data.id);
      if (isDuplicate) return prev;

      // Format location
      const city = data.city === 'Unknown' ? '' : data.city;
      const country = data.country === 'Unknown' ? '' : data.country;
      const location = [city, country].filter(Boolean).join(', ') || 'Unknown Location';

      const newActivity = {
        id: data.id,
        type: 'view',
        location,
        ip: data.ip_address,
        lat: data.lat,
        lng: data.lng,
        path: data.page_url ? new URL(data.page_url).pathname : '/',
        title: data.title || 'Unknown Page',
        timestamp: data.created_at || new Date().toISOString(),
        device: data.device_type
      };

      return {
        ...prev,
        realTimeVisitors: (prev.realTimeVisitors || 0) + 1,
        recentActivity: [newActivity, ...prev.recentActivity].slice(0, 50)
      };
    });

    setStats(prev => ({
      ...prev,
      total_views: (prev?.total_views || 0) + 1
    }));
  }, [loadStats]);

  const loadData = useCallback(async () => {
    try {
      setLoadingChart(true);
      const [projectData, statsData, detailedStats] = await Promise.all([
        apiRequest(`/projects/${idOrName}`),
        apiRequest(`/analytics/projects/${idOrName}/overview`),
        apiRequest(`/analytics/projects/${idOrName}/traffic?range=${timeRange}&timezone=${encodeURIComponent(timezone)}`).catch(() => null)
      ]);
      
      setProject(projectData);
      setProjectName(projectData.name);
      setAllowedOrigins(projectData.allowed_origins ? projectData.allowed_origins.split(',').map(o => o.trim()) : []);
      setTargetUrl(projectData.target_url || '');
      setIsActive(projectData.is_active !== false);
      setShareToken(projectData.share_token || '');
      if (projectData.timezone) setTimezone(projectData.timezone);
      if (projectData.notifications) setNotifications(projectData.notifications);

      setStats(statsData);
      if (detailedStats) {
        setOverviewStats({
          ...detailedStats,
          recentActivity: detailedStats.activityList || []
        });
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
      setLoadingChart(false);
    }
  }, [idOrName, timeRange, timezone, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveSettings = async (updatedData) => {
    setSaving(true);
    try {
      // If updatedData is provided, use it, otherwise use local states
      const nameToSave = updatedData?.name || projectName;
      
      if (!/^[a-zA-Z0-9_-]+$/.test(nameToSave)) {
        showToast('Project name can only contain letters, numbers, underscores, and hyphens', 'error');
        return false;
      }

      const body = {
        name: nameToSave,
        allowedOrigins: (updatedData?.allowedOrigins || allowedOrigins).filter(o => o.trim()).join(','),
        targetUrl: updatedData?.targetUrl || targetUrl,
        isActive: updatedData?.isActive !== undefined ? updatedData.isActive : isActive,
        timezone: updatedData?.timezone || timezone,
        notifications: updatedData?.notifications || notifications
      };

      const updatedProject = await apiRequest(`/projects/${project.id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });

      setProject(updatedProject);
      setProjectName(updatedProject.name);
      setAllowedOrigins(updatedProject.allowed_origins ? updatedProject.allowed_origins.split(',').map(o => o.trim()) : []);
      setTargetUrl(updatedProject.target_url || '');
      setIsActive(updatedProject.is_active !== false);
      setTimezone(updatedProject.timezone || timezone);
      setNotifications(updatedProject.notifications || notifications);
      
      showToast('Changes saved successfully', 'success');
      return updatedProject;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (confirmationName, loadUser) => {
    if (confirmationName !== project.name) {
      showToast('Project name mismatch', 'error');
      return false;
    }

    setDeleting(true);
    try {
      await apiRequest(`/projects/${project.id}`, { method: 'DELETE' });
      showToast('Project deleted successfully', 'success');
      loadUser();
      navigate('/dashboard/projects');
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      setDeleting(false);
      return false;
    }
  };

  return {
    project, stats, overviewStats, loading, loadingChart, saving, deleting,
    projectName, setProjectName, allowedOrigins, setAllowedOrigins, 
    targetUrl, setTargetUrl, isActive, setIsActive, timezone, setTimezone,
    notifications, setNotifications, shareToken, setShareToken,
    loadData, loadStats, handleSaveSettings, handleDelete, handleLiveUpdate
  };
}
