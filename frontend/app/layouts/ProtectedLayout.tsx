import { Outlet, Navigate } from "react-router";
import { ProjectProvider } from "../context/ProjectContext";
import { useAuth } from "~/context/AuthContext";

export default function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <ProjectProvider>
      <Outlet />
    </ProjectProvider>
  );
}