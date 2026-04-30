import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import { useAutenticacao } from "@/features/autenticacao/hooks/hook_autenticacao";
import { useRedirecionamento } from "@/features/autenticacao/hooks/hook_redirecionamento";
import { TemaServicos } from "../components/tema_servicos";
import { LogoTriboServicos } from "../components/logo_triboservicos";

export default function PaginaEntrarServicos() {
  const { usuario, carregando: carregandoAuth } = useAutenticacao();
  const { destino, carregando: carregandoDestino } = useRedirecionamento();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  if (carregandoAuth || (usuario && carregandoDestino)) {
    return (
      <TemaServicos>
        <div className="fixed inset-0 bg-background flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </TemaServicos>
    );
  }

  if (usuario && destino) {
    return <Navigate to={destino} replace />;
  }

  async function handleEntrar(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !senha.trim()) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });
    setCarregando(false);
    if (error) {
      toast({ title: "Erro ao entrar", description: error.message, variant: "destructive" });
      return;
    }
    navigate("/painel", { replace: true });
  }

  return (
    <TemaServicos>
      <div className="fixed inset-0 bg-background flex items-center justify-center px-6 overflow-y-auto py-10">
        <div className="w-full max-w-sm space-y-6">
          <Link
            to="/s"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Voltar para a landing
          </Link>

          <div className="text-center space-y-3">
            <LogoTriboServicos className="text-lg" />
            <h1 className="text-2xl font-bold text-foreground">Entrar</h1>
            <p className="text-sm text-muted-foreground">Acesse seu painel TriboServiços.</p>
          </div>

          <form onSubmit={handleEntrar} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="seu@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="current-password"
                placeholder="Sua senha"
                required
              />
            </div>

            <Button type="submit" className="w-full h-11" disabled={carregando}>
              {carregando ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar"}
            </Button>
          </form>

          <div className="space-y-3 text-center text-sm">
            <p className="text-muted-foreground">
              Não tem conta?{" "}
              <Link to="/s/cadastro/profissional" className="text-primary hover:underline font-medium">
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </TemaServicos>
  );
}
