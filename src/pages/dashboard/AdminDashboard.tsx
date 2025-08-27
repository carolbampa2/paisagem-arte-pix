import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Package, Users, CheckCircle, XCircle } from "lucide-react";

const AdminDashboard = () => {
  const { profile } = useAuth();

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Painel do Administrador</h1>
        <p className="text-muted-foreground">
          Bem-vindo, {profile?.full_name || 'admin'}!
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">R$ 231.231,89</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Artistas Ativos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">+120</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Produtos Cadastrados</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">+842</div>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Artistas Pendentes de Aprovação</CardTitle>
          <CardDescription>Aprove ou rejeite os novos cadastros de artistas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Artista</TableHead>
                <TableHead>Chave PIX</TableHead>
                <TableHead>Data de Cadastro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Placeholder Data */}
              <TableRow>
                <TableCell>
                  <div className="font-medium">Artista Pendente 1</div>
                  <div className="text-sm text-muted-foreground">artista1@email.com</div>
                </TableCell>
                <TableCell>123.456.789-00</TableCell>
                <TableCell>25/08/2025</TableCell>
                <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="mr-2">
                        <CheckCircle className="h-4 w-4 text-green-500"/>
                    </Button>
                    <Button variant="outline" size="sm">
                        <XCircle className="h-4 w-4 text-red-500"/>
                    </Button>
                </TableCell>
              </TableRow>
               <TableRow>
                <TableCell>
                  <div className="font-medium">Artista Pendente 2</div>
                  <div className="text-sm text-muted-foreground">artista2@email.com</div>
                </TableCell>
                <TableCell>outro@email.com</TableCell>
                <TableCell>24/08/2025</TableCell>
                <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="mr-2">
                        <CheckCircle className="h-4 w-4 text-green-500"/>
                    </Button>
                    <Button variant="outline" size="sm">
                        <XCircle className="h-4 w-4 text-red-500"/>
                    </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
