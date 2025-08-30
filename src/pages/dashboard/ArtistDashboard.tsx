import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, Edit, Trash2, Eye, MoreHorizontal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Loader2 } from "lucide-react";
import { ArtworkUploadDialog } from "@/components/marketplace/ArtworkUploadDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { ArtworkEditDialog } from "@/components/marketplace/ArtworkEditDialog";

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

const fetchArtistStats = async (artistId: string) => {
    const { data: artworks, error } = await supabase
        .from('artworks')
        .select('status, price')
        .eq('artist_id', artistId);

    if (error) throw new Error(error.message);

    const totalArtworks = artworks?.length || 0;
    const approvedArtworks = artworks?.filter(a => a.status === 'approved').length || 0;
    const pendingArtworks = artworks?.filter(a => a.status === 'pending').length || 0;
    const totalEarnings = artworks?.filter(a => a.status === 'approved')
        .reduce((sum, a) => sum + (Number(a.price) || 0), 0) || 0;

    return {
        totalArtworks,
        approvedArtworks,
        pendingArtworks,
        totalEarnings
    };
};

const ArtistDashboard = () => {
  const { profile, user } = useAuth();
  const queryClient = useQueryClient();
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);

  const { data: artworks, isLoading } = useQuery({
    queryKey: ['artist-artworks', user?.id],
    queryFn: () => fetchArtistArtworks(user!.id),
    enabled: !!user,
  });

  const { data: stats } = useQuery({
    queryKey: ['artist-stats', user?.id],
    queryFn: () => fetchArtistStats(user!.id),
    enabled: !!user,
  });

  const deleteArtworkMutation = useMutation({
    mutationFn: async (artworkId: string) => {
      // First get the artwork to find the image path
      const { data: artwork } = await supabase
        .from('artworks')
        .select('image_path')
        .eq('id', artworkId)
        .single();

      if (artwork?.image_path) {
        // Delete the image from storage
        await supabase.storage
          .from('artworks')
          .remove([artwork.image_path]);
      }

      // Delete the artwork record
      const { error } = await supabase
        .from('artworks')
        .delete()
        .eq('id', artworkId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Obra excluída com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['artist-artworks'] });
      queryClient.invalidateQueries({ queryKey: ['artist-stats'] });
    },
    onError: (error) => {
      toast.error(`Erro ao excluir obra: ${error.message}`);
    },
  });

  const handleDeleteArtwork = (artworkId: string, title: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a obra "${title}"? Esta ação não pode ser desfeita.`)) {
      deleteArtworkMutation.mutate(artworkId);
    }
  };

  const getImageUrl = (imagePath: string) => {
    const { data } = supabase.storage
      .from('artworks')
      .getPublicUrl(imagePath);
    return data.publicUrl;
  };


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
                    <CardTitle className="text-sm font-medium">Obras Totais</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalArtworks || 0}</div>
                    <p className="text-xs text-muted-foreground">Todas as obras enviadas</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.approvedArtworks || 0}</div>
                    <p className="text-xs text-muted-foreground">Disponíveis para venda</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                    <Terminal className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.pendingArtworks || 0}</div>
                    <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Valor Potencial</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        R$ {(stats?.totalEarnings || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs text-muted-foreground">Soma de obras aprovadas</p>
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
                                <TableHead>Obra</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Preço</TableHead>
                                <TableHead>Data de Envio</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {artworks && artworks.length > 0 ? (
                            artworks.map((artwork) => (
                                <TableRow key={artwork.id}>
                                    <TableCell>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 rounded-md overflow-hidden bg-muted">
                                                <img 
                                                    src={getImageUrl(artwork.image_path)} 
                                                    alt={artwork.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <div className="font-medium">{artwork.title}</div>
                                                {artwork.description && (
                                                    <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                                        {artwork.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            artwork.status === 'approved' ? 'default' : 
                                            artwork.status === 'rejected' ? 'destructive' : 'outline'
                                        }>
                                            {artwork.status === 'approved' ? 'Aprovada' :
                                             artwork.status === 'rejected' ? 'Rejeitada' : 'Pendente'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {artwork.price ? (
                                            <span className="font-medium">
                                                R$ {Number(artwork.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">Não definido</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{new Date(artwork.created_at!).toLocaleDateString('pt-BR')}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem 
                                                    onClick={() => window.open(getImageUrl(artwork.image_path), '_blank')}
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Visualizar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onClick={() => setEditingArtwork(artwork)}
                                                >
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onClick={() => handleDeleteArtwork(artwork.id, artwork.title)}
                                                    className="text-destructive"
                                                    disabled={deleteArtworkMutation.isPending}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Excluir
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">
                                    Você ainda não enviou nenhuma obra.
                                </TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>

        {editingArtwork && (
            <ArtworkEditDialog
                artwork={editingArtwork}
                open={!!editingArtwork}
                onOpenChange={(open) => !open && setEditingArtwork(null)}
            />
        )}
    </div>
  );
};

export default ArtistDashboard;
