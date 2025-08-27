import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Loader2 } from "lucide-react";
import { ArtworkUploadDialog } from "@/components/marketplace/ArtworkUploadDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Database } from "@/integrations/supabase/types";

type Artwork = Database['public']['Tables']['artworks']['Row'];

const fetchArtistArtworks = async (artistId: string): Promise<Artwork[]> => {
    const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .eq('artist_id', artistId)
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(error.message);
    }
    return data || [];
};

const ArtistDashboard = () => {
  const { profile, user } = useAuth();

  const { data: artworks, isLoading } = useQuery({
    queryKey: ['artist-artworks', user?.id],
    queryFn: () => fetchArtistArtworks(user!.id),
    enabled: !!user, // Only run the query if the user is available
  });


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
                    <div className="text-2xl font-bold">R$ 0,00</div>
                    <p className="text-xs text-muted-foreground">Dados fictícios</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Vendas</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">0</div>
                     <p className="text-xs text-muted-foreground">Dados fictícios</p>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Minhas Obras</CardTitle>
                    <CardDescription>Gerencie suas obras de arte e produtos.</CardDescription>
                </div>
                <ArtworkUploadDialog />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Título</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Data de Envio</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {artworks && artworks.length > 0 ? (
                            artworks.map((artwork) => (
                                <TableRow key={artwork.id}>
                                    <TableCell className="font-medium">{artwork.title}</TableCell>
                                    <TableCell>
                                        <Badge variant={artwork.status === 'approved' ? 'default' : artwork.status === 'rejected' ? 'destructive' : 'outline'}>
                                            {artwork.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{new Date(artwork.created_at!).toLocaleDateString('pt-BR')}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center">
                                    Você ainda não enviou nenhuma obra.
                                </TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    </div>
  );
};

export default ArtistDashboard;
