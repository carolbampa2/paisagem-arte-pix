import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Package2 } from 'lucide-react';

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link to="#" className="flex items-center justify-center">
          <Package2 className="h-6 w-6" />
          <span className="sr-only">Paisagem</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            to="/login"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Cadastro
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Sua Arte, Seu Produto, Sua Marca.
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Bem-vindo à Paisagem, o marketplace onde artistas transformam
                  suas obras em produtos únicos. Venda sua arte, nós cuidamos da
                  produção e da entrega.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild>
                  <Link to="/signup">Quero ser Artista</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="#">Explorar Obras</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          &copy; 2025 Paisagem. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
};

export default Index;
