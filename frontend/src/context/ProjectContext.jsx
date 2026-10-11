import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { apiRequest } from '../utils/api';

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedProjectId, setSelectedProjectIdState] = useState(() => {
    try {
      const prefs = JSON.parse(localStorage.getItem('webpulse.prefs') || '{}');
      return prefs.projectId || 'all';
    } catch {
      return 'all';
    }
  });

  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [installSnippetTarget, setInstallSnippetTarget] = useState(null);

  const setSelectedProjectId = useCallback((id) => {
    setSelectedProjectIdState(id);
    try {
      const prefs = JSON.parse(localStorage.getItem('webpulse.prefs') || '{}');
      prefs.projectId = id;
      localStorage.setItem('webpulse.prefs', JSON.stringify(prefs));
    } catch {
      // ignore
    }
  }, []);

  const refreshProjects = useCallback(async () => {
    try {
      const data = await apiRequest('/projects');
      const list = Array.isArray(data) ? data : [];
      setProjects(list);
      return list;
    } catch (err) {
      console.error('Failed to load projects in ProjectContext', err);
      return [];
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  const currentProject = useMemo(() => {
    if (!projects.length) {
      return {
        id: 'default',
        name: 'My Website',
        env: 'Production',
        installed: false,
        tracking_id: 'trk_sample'
      };
    }
    if (selectedProjectId === 'all') {
      return {
        id: 'all',
        name: 'All Projects',
        env: `${projects.length} website${projects.length > 1 ? 's' : ''}`,
        installed: projects.some((p) => p.installed || (p.visitors && p.visitors > 0)),
        isAll: true
      };
    }
    const found = projects.find((p) => p.id === selectedProjectId || p.name === selectedProjectId);
    return found || projects[0];
  }, [projects, selectedProjectId]);

  const openAddProject = useCallback(() => setAddProjectOpen(true), []);
  const closeAddProject = useCallback(() => setAddProjectOpen(false), []);
  const openInstallSnippet = useCallback((proj) => setInstallSnippetTarget(proj || currentProject), [currentProject]);
  const closeInstallSnippet = useCallback(() => setInstallSnippetTarget(null), []);

  const value = useMemo(
    () => ({
      projects,
      loadingProjects,
      selectedProjectId,
      setSelectedProjectId,
      currentProject,
      refreshProjects,
      addProjectOpen,
      openAddProject,
      closeAddProject,
      installSnippetTarget,
      openInstallSnippet,
      closeInstallSnippet
    }),
    [
      projects,
      loadingProjects,
      selectedProjectId,
      setSelectedProjectId,
      currentProject,
      refreshProjects,
      addProjectOpen,
      openAddProject,
      closeAddProject,
      installSnippetTarget,
      openInstallSnippet,
      closeInstallSnippet
    ]
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return ctx;
}
