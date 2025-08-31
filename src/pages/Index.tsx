import { ProductGrid } from "@/components/marketplace/ProductGrid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ListFilter } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  return (
    <section className="container mx-auto px-4 md:px-6 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="w-full md:w-1/2">
            <h1 className="text-3xl font-bold tracking-tight">Explore as Obras</h1>
            <p className="text-muted-foreground">Encontre arte única para estampar sua vida.</p>
        </div>
        <div className="flex w-full md:w-1/2 items-center gap-4">
            <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Buscar por artista ou obra..."
                    className="pl-10 w-full"
                />
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="shrink-0">
                        <ListFilter className="mr-2 h-4 w-4" />
                        Filtros
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>
                        Camisetas
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                        Pôsteres
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                     <DropdownMenuCheckboxItem>
                        Mais Relevantes
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                        Mais Recentes
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                        Preço: Menor para Maior
                    </DropdownMenuCheckboxItem>
                     <DropdownMenuCheckboxItem>
                        Preço: Maior para Menor
                    </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>

      <ProductGrid />
    </section>
  );
};

export default Index;
