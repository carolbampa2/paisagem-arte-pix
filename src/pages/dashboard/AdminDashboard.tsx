import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Package, Users, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];

const fetchPendingArtists = async (): Promise<Profile[]> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'artist')
        .eq('is_approved', false);

    if (error) {
        throw new Error(error.message);
    }
    return data || [];
};

const AdminDashboard = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: pendingArtists, isLoading, error } = useQuery({
    queryKey: ['pending-artists'],
    queryFn: fetchPendingArtists,
  });

  const approveArtistMutation = useMutation({
    mutationFn: async (userId: string) => {
        const { error } = await supabase
            .from('profiles')
            .update({ is_approved: true, updated_at: new Date().toISOString() })
            .eq('user_id', userId);
        if (error) throw error;
    },
    onSuccess: () => {
        toast.success("Artista aprovado com sucesso!");
        queryClient.invalidateQueries({ queryKey: ['pending-artists'] });
    },
    onError: (error) => {
        toast.error(`Erro ao aprovar artista: ${error.message}`);
    }
  });

  const rejectArtistMutation = useMutation({
    mutationFn: async (userId: string) => {
        // This is a hard delete. In a real app, you might want to soft delete.
        // We need to call an RPC function to delete the user from auth.users as well.
        // For now, let's just delete the profile for simplicity.
        // A proper implementation would require a cascading delete or a server-side function.
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('user_id', userId);
        if (error) throw error;
    },
    onSuccess: () => {
        toast.success("Artista rejeitado com sucesso!");
        queryClient.invalidateQueries({ queryKey: ['pending-artists'] });
    },
    onError: (error) => {
        toast.error(`Erro ao rejeitar artista: ${error.message}`);
    }
  });

  const handleApprove = (userId: string) => {
    approveArtistMutation.mutate(userId);
  };

  const handleReject = (userId: string) => {
    if (window.confirm("Tem certeza que deseja rejeitar e remover este artista? Esta ação não pode ser desfeita.")) {
        rejectArtistMutation.mutate(userId);
    }
  };


  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Painel do Administrador</h1>
        <p className="text-muted-foreground">
          Bem-vindo, {profile?.full_name || 'admin'}!
        </p>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* These cards would also be populated by real data in a real app */}
       </div>

      <Card>
        <CardHeader>
          <CardTitle>Artistas Pendentes de Aprovação</CardTitle>
          <CardDescription>Aprove ou rejeite os novos cadastros de artistas.</CardDescription>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : error ? (
                <div className="text-red-500 text-center">Erro ao carregar artistas.</div>
            ) : (
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
                    {pendingArtists && pendingArtists.length > 0 ? (
                        pendingArtists.map((artist) => (
                            <TableRow key={artist.id}>
                                <TableCell>
                                <div className="font-medium">{artist.full_name}</div>
                                <div className="text-sm text-muted-foreground">{artist.email}</div>
                                </TableCell>
                                <TableCell>{artist.pix_key}</TableCell>
                                <TableCell>{new Date(artist.created_at!).toLocaleDateString('pt-BR')}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm" className="mr-2" onClick={() => handleApprove(artist.user_id)} disabled={approveArtistMutation.isPending}>
                                        <CheckCircle className="h-4 w-4 text-green-500"/>
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleReject(artist.user_id)} disabled={rejectArtistMutation.isPending}>
                                        <XCircle className="h-4 w-4 text-red-500"/>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center">
                                Nenhum artista pendente.
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

export default AdminDashboard;
