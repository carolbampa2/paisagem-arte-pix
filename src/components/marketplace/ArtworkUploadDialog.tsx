import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Loader2, FilePlus2 } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const uploadSchema = z.object({
  title: z.string().min(3, { message: "O título deve ter pelo menos 3 caracteres." }),
  description: z.string().optional(),
  image: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, "A imagem é obrigatória.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `O tamanho máximo do arquivo é 5MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Apenas os formatos .jpg, .jpeg, .png e .webp são suportados."
    ),
});

export function ArtworkUploadDialog() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof uploadSchema>>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { title: "", description: "" },
  });

  const uploadMutation = useMutation({
    mutationFn: async (values: z.infer<typeof uploadSchema>) => {
      if (!user) throw new Error("Usuário não autenticado.");

      const imageFile = values.image[0];
      const fileName = `${Date.now()}_${imageFile.name}`;
      const filePath = `${user.id}/${fileName}`;

      // 1. Upload image to storage
      const { error: uploadError } = await supabase.storage
        .from("artworks")
        .upload(filePath, imageFile);

      if (uploadError) throw new Error(`Erro no upload: ${uploadError.message}`);

      // 2. Insert record into database
      const { error: dbError } = await supabase.from("artworks").insert({
        artist_id: user.id,
        title: values.title,
        description: values.description,
        image_path: filePath,
        status: "pending",
      });

      if (dbError) throw new Error(`Erro ao salvar no banco: ${dbError.message}`);
    },
    onSuccess: () => {
      toast.success("Obra enviada para aprovação!");
      queryClient.invalidateQueries({ queryKey: ['artist-artworks'] }); // To refetch artworks list later
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function onSubmit(values: z.infer<typeof uploadSchema>) {
    uploadMutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <FilePlus2 className="mr-2 h-4 w-4" /> Enviar Nova Obra
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enviar Nova Obra</DialogTitle>
          <DialogDescription>
            Faça o upload da sua arte para ser revisada pela nossa equipe.
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
                        <FormLabel>Descrição (Opcional)</FormLabel>
                        <FormControl><Textarea {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="image" render={({ field: { onChange, value, ...rest } }) => (
                    <FormItem>
                        <FormLabel>Arquivo da Arte</FormLabel>
                        <FormControl>
                            <Input
                                type="file"
                                accept="image/png, image/jpeg, image/webp"
                                onChange={(e) => onChange(e.target.files)}
                                {...rest}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                 <DialogFooter>
                    <Button type="submit" disabled={uploadMutation.isPending}>
                        {uploadMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enviar para Aprovação
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
