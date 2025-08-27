import { useAuth } from "@/context/AuthContext";
import BuyerDashboard from "./BuyerDashboard";
import ArtistDashboard from "./ArtistDashboard";
import AdminDashboard from "./AdminDashboard";

const FullPageSpinner = () => (
    <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
    </div>
);

const Dashboard = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return <FullPageSpinner />;
  }

  switch (profile?.role) {
    case 'artist':
      return <ArtistDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'buyer':
    default:
      return <BuyerDashboard />;
  }
};

export default Dashboard;
