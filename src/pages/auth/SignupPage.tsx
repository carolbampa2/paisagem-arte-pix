import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const buyerSchema = z.object({
  fullName: z.string().min(3, { message: "O nome completo é obrigatório." }),
  email: z.string().email({ message: "E-mail inválido." }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
});

const artistSchema = z.object({
  fullName: z.string().min(3, { message: "O nome completo é obrigatório." }),
  email: z.string().email({ message: "E-mail inválido." }),
  pixKey: z.string().min(1, { message: "A chave PIX é obrigatória." }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
});

export function SignupPage() {
  const navigate = useNavigate();

  const { mutate: signup, isPending } = useMutation({
    mutationFn: async ({ email, password, fullName, role, pixKey }: { email: string; password: string; fullName: string; role: 'buyer' | 'artist'; pixKey?: string }) => {
      // Step 1: Sign up the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
            pix_key: role === 'artist' ? pixKey : undefined,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Cadastro bem-sucedido, mas os dados do usuário não foram retornados.");

      // Step 2: Invoke the Edge Function to create the profile
      const { error: functionError } = await supabase.functions.invoke('create-profile', {
        body: { user: authData.user },
      });

      if (functionError) {
        // Here you might want to try and delete the auth user for a clean rollback
        // For now, we'll just throw the error.
        throw new Error(`Erro ao criar perfil: ${functionError.message}`);
      }
    },
    onSuccess: () => {
      toast.success("Cadastro realizado com sucesso! Você já pode fazer o login.");
      navigate("/login");
    },
    onError: (error) => {
      toast.error(error.message || "Ocorreu um erro ao fazer o cadastro.");
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-xl">Cadastro</CardTitle>
          <CardDescription>
            Crie sua conta para começar a comprar ou vender arte.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="buyer" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="buyer">Comprador</TabsTrigger>
              <TabsTrigger value="artist">Artista</TabsTrigger>
            </TabsList>
            <TabsContent value="buyer">
              <BuyerSignupForm isPending={isPending} onSubmit={(values) => signup({ email: values.email, password: values.password, fullName: values.fullName, role: 'buyer' })} />
            </TabsContent>
            <TabsContent value="artist">
              <ArtistSignupForm isPending={isPending} onSubmit={(values) => signup({ email: values.email, password: values.password, fullName: values.fullName, role: 'artist', pixKey: values.pixKey })} />
            </TabsContent>
          </Tabs>
          <div className="mt-4 text-center text-sm">
            Já tem uma conta?{" "}
            <Link to="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const BuyerSignupForm = ({ isPending, onSubmit }: { isPending: boolean; onSubmit: (values: z.infer<typeof buyerSchema>) => void }) => {
  const form = useForm<z.infer<typeof buyerSchema>>({
    resolver: zodResolver(buyerSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 mt-4">
        <FormField control={form.control} name="fullName" render={({ field }) => (
          <FormItem>
            <FormLabel>Nome Completo</FormLabel>
            <FormControl><Input placeholder="Seu Nome Completo" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>E-mail</FormLabel>
            <FormControl><Input placeholder="nome@exemplo.com" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem>
            <FormLabel>Senha</FormLabel>
            <FormControl><Input type="password" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Criando..." : "Criar conta de Comprador"}
        </Button>
      </form>
    </Form>
  );
};

const ArtistSignupForm = ({ isPending, onSubmit }: { isPending: boolean; onSubmit: (values: z.infer<typeof artistSchema>) => void }) => {
  const form = useForm<z.infer<typeof artistSchema>>({
    resolver: zodResolver(artistSchema),
    defaultValues: { fullName: "", email: "", pixKey: "", password: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 mt-4">
        <FormField control={form.control} name="fullName" render={({ field }) => (
            <FormItem>
                <FormLabel>Nome Completo</FormLabel>
                <FormControl><Input placeholder="Seu Nome Completo" {...field} /></FormControl>
                <FormMessage />
            </FormItem>
        )} />
        <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl><Input placeholder="nome@exemplo.com" {...field} /></FormControl>
                <FormMessage />
            </FormItem>
        )} />
        <FormField control={form.control} name="pixKey" render={({ field }) => (
            <FormItem>
                <FormLabel>Chave PIX</FormLabel>
                <FormControl><Input placeholder="Sua chave PIX" {...field} /></FormControl>
                <FormMessage />
            </FormItem>
        )} />
        <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl><Input type="password" {...field} /></FormControl>
                <FormMessage />
            </FormItem>
        )} />
        <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Criando..." : "Criar conta de Artista"}
        </Button>
      </form>
    </Form>
  );
};
