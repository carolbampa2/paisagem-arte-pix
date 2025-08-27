import { Link, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Package2 } from 'lucide-react';

const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center shadow-sm">
        <Link to="/" className="flex items-center justify-center font-semibold">
          <Package2 className="h-6 w-6" />
          <span className="ml-2">Paisagem</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <Button variant="ghost" asChild>
            <Link
              to="/login"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Login
            </Link>
          </Button>
          <Button asChild>
            <Link
              to="/signup"
            >
              Cadastre-se
            </Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          &copy; 2025 Paisagem. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
};

export default PublicLayout;
