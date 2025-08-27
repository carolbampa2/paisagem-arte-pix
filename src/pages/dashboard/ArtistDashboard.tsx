import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FilePlus2, DollarSign, Package, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

const ArtistDashboard = () => {
  const { profile } = useAuth();

  if (!profile?.is_approved) {
    return (
      <div className="flex flex-col gap-4">
         <div className="space-y-1">
            <h1 className="text-2xl font-bold">Painel do Artista</h1>
            <p className="text-muted-foreground">
            Bem-vindo, {profile?.full_name || 'artista'}!
            </p>
        </div>
        <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Conta em Análise</AlertTitle>
            <AlertDescription>
                Sua conta de artista foi criada com sucesso e está aguardando aprovação da nossa equipe.
                Você receberá um e-mail assim que sua conta for aprovada.
            </AlertDescription>
        </Alert>
      </div>
    );
  }


  return (
    <div className="flex flex-col gap-4">
        <div className="space-y-1">
            <h1 className="text-2xl font-bold">Painel do Artista</h1>
            <p className="text-muted-foreground">
            Bem-vindo, {profile?.full_name || 'artista'}! Sua conta foi aprovada.
            </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ganhos Totais</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">R$ 4.231,89</div>
                    <p className="text-xs text-muted-foreground">+20.1% do último mês</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Vendas</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+235</div>
                    <p className="text-xs text-muted-foreground">+180.1% do último mês</p>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Minhas Obras</CardTitle>
                    <CardDescription>Gerencie suas obras de arte e produtos.</CardDescription>
                </div>
                <Button>
                    <FilePlus2 className="mr-2 h-4 w-4" /> Enviar Nova Obra
                </Button>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Você ainda não enviou nenhuma obra. Clique no botão acima para começar.</p>
                {/* Placeholder for artworks list */}
            </CardContent>
        </Card>
    </div>
  );
};

export default ArtistDashboard;
