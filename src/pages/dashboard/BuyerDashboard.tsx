import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const BuyerDashboard = () => {
  const { profile } = useAuth();

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Painel do Comprador</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta, {profile?.full_name || 'usuário'}!
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pedidos Recentes</CardTitle>
          <CardDescription>Aqui estão seus pedidos mais recentes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Artista</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Placeholder Data */}
              <TableRow>
                <TableCell>
                  <div className="font-medium">Pôster "Abstrato Azul"</div>
                </TableCell>
                <TableCell>Artista Exemplo 1</TableCell>
                <TableCell>
                  <Badge variant="outline">Enviado</Badge>
                </TableCell>
                <TableCell className="text-right">R$ 89,90</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="font-medium">Camiseta "Gato Espacial"</div>
                </TableCell>
                <TableCell>Artista Exemplo 2</TableCell>
                <TableCell>
                  <Badge variant="outline">Processando</Badge>
                </TableCell>
                <TableCell className="text-right">R$ 119,90</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default BuyerDashboard;
