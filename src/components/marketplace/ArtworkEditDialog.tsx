
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type Artwork = Database['public']['Tables']['artworks']['Row'];

const editSchema = z.object({
  title: z.string().min(3, { message: "O título deve ter pelo menos 3 caracteres." }),
  description: z.string().optional(),
  price: z.string().optional(),
});

interface ArtworkEditDialogProps {
  artwork: Artwork;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ArtworkEditDialog({ artwork, open, onOpenChange }: ArtworkEditDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof editSchema>>({
    resolver: zodResolver(editSchema),
    defaultValues: { 
      title: artwork.title || "",
      description: artwork.description || "",
      price: artwork.price ? String(artwork.price) : "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof editSchema>) => {
      const price = values.price && values.price !== "" ? Number(values.price) : null;
      
      const { error } = await supabase
        .from("artworks")
        .update({
          title: values.title,
          description: values.description,
          price: price,
          updated_at: new Date().toISOString(),
        })
        .eq('id', artwork.id);

      if (error) throw new Error(`Erro ao atualizar: ${error.message}`);
    },
    onSuccess: () => {
      toast.success("Obra atualizada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['artist-artworks'] });
      queryClient.invalidateQueries({ queryKey: ['artist-stats'] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function onSubmit(values: z.infer<typeof editSchema>) {
    updateMutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Obra</DialogTitle>
          <DialogDescription>
            Atualize as informações da sua obra de arte.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Título da Obra</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl><Textarea {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="price" render={({ field }) => (
              <FormItem>
                <FormLabel>Preço (R$)</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    step="0.01" 
                    min="0"
                    placeholder="Ex: 150.00"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}