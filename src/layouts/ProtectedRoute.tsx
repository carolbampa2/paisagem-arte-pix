import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import MainLayout from './MainLayout';
import { ReactNode } from 'react';

// A generic loading spinner component
const FullPageSpinner = () => (
    <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
    </div>
);


const ProtectedRoute = ({ children }: { children?: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <FullPageSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If children are provided, render them directly within the layout.
  // This is useful for role-specific routes.
  if (children) {
    return <MainLayout>{children}</MainLayout>;
  }

  // Otherwise, render the main layout which contains an Outlet
  return <MainLayout />;
};

export default ProtectedRoute;
