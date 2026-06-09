import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { authFetch } from '~/helpers/authHelper';

// Define your backend roles explicitly
export type ProjectRole = 'Super Admin' | 'Project Admin' | 'Member' | 'Viewer';

interface ProjectContextType {
  activeProjectId: string | null;
  userRole: ProjectRole | null;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isMember: boolean;
  isViewer: boolean;
  loading: boolean;
  refreshProjectState: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { id } = useParams<{ id: string }>(); // Grabs /projects/:projectId from URL
  const [userRole, setUserRole] = useState<ProjectRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRoleInProject = async () => {
    if (!id) {
      setUserRole(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Hit a backend endpoint that returns membership info for the current user in this project
      // e.g., @router.get('/projects/{project_id}/my-membership')
      const response = await authFetch(`/projects/${id}/members`);
      if (response.ok) {
        const data = await response.json(); // expected: { role: 'ADMIN' }
        setUserRole(data.role as ProjectRole);
      } else {
        setUserRole(null);
      }
    } catch (error) {
      console.error("Error fetching project membership role:", error);
      setUserRole(null);
    } finally {
      setLoading(false);
    }

    const response = await fetch(`/api/projects/${id}/members`);
    if (response.ok) {
      const data = await response.json();
      console.log("DEBUG: Raw role data received from backend:", data);
      console.log("DEBUG: Current userRole state being set to:", data.role);
    }
  };

  // Automatically re-fetch role whenever the user switches projects via the URL
  useEffect(() => {
    fetchUserRoleInProject();
  }, [id]);

  const value = {
    activeProjectId: id || null,
    userRole,
    isSuperAdmin: userRole === 'Super Admin',
    isAdmin: userRole === 'Project Admin',
    isMember: userRole === 'Member' || userRole === 'Project Admin',
    isViewer: userRole === 'Viewer',
    loading,
    refreshProjectState: fetchUserRoleInProject
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

// Custom Hook for easy consumption across components
export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};