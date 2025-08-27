import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Index from './Index';

// A generic loading spinner component
const FullPageSpinner = () => (
    <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
    </div>
);

const HomeRedirect = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <FullPageSpinner />;
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Index />;
};

export default HomeRedirect;
