
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
  const { profile, loading, user } = useAuth();

  console.log('Dashboard: Loading state:', loading);
  console.log('Dashboard: User:', user);
  console.log('Dashboard: Profile:', profile);
  console.log('Dashboard: Profile role:', profile?.role);

  if (loading) {
    return <FullPageSpinner />;
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Perfil não encontrado</h2>
          <p className="text-muted-foreground">Aguarde um momento ou tente fazer login novamente.</p>
        </div>
      </div>
    );
  }

  switch (profile?.role) {
    case 'artist':
      console.log('Dashboard: Rendering ArtistDashboard');
      return <ArtistDashboard />;
    case 'admin':
      console.log('Dashboard: Rendering AdminDashboard');
      return <AdminDashboard />;
    case 'buyer':
    default:
      console.log('Dashboard: Rendering BuyerDashboard for role:', profile?.role);
      return <BuyerDashboard />;
  }
};

export default Dashboard;
