import { useState } from "react";
import { Link, useNavigate, Navigate, useSearchParams } from "react-router-dom";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Briefcase } from "lucide-react";
import { useAutenticacao } from "../hooks/hook_autenticacao";
import { useRedirecionamento } from "../hooks/hook_redirecionamento";

export default function PaginaEntrar() {
  const { usuario, carregando: carregandoAuth } = useAutenticacao();
  const { destino, carregando: carregandoDestino } = useRedirecionamento();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const modoProfissional = searchParams.get("modo") === "profissional";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [slugGrupo, setSlugGrupo] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [carregandoGoogle, setCarregandoGoogle] = useState(false);

  if (carregandoAuth || (usuario && !redirectTo && carregandoDestino)) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (usuario && redirectTo) {
    return <Navigate to={redirectTo} replace />;
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
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    setCarregando(false);
    if (error) {
      toast({ title: "Erro ao entrar", description: error.message, variant: "destructive" });
    }
    // Redirecionamento será feito automaticamente pelo hook useRedirecionamento
  }

  async function handleGoogle() {
    // Slug é obrigatório apenas para passageiros novos.
    // Profissionais já cadastrados dispensam o slug — o redirecionamento usa o tenant_id do perfil.
    if (!modoProfissional && !slugGrupo.trim()) {
      toast({ title: "Informe o slug do grupo antes de continuar", variant: "destructive" });
      return;
    }
    if (slugGrupo.trim()) {
      localStorage.setItem("tribocar_tenant_slug", slugGrupo.trim());
    }
    setCarregandoGoogle(true);
    const redirectParam = redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : "";
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/entrar${redirectParam}`,
    });
    if (result?.error) {
      toast({ title: "Erro ao entrar com Google", description: String(result.error), variant: "destructive" });
      setCarregandoGoogle(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center px-6 overflow-y-auto py-10">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          {modoProfissional && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
              <Briefcase className="w-3 h-3" />
              Acesso do profissional
            </div>
          )}
          <h1 className="text-2xl font-bold text-foreground">
            {modoProfissional ? "Entrar no painel" : "Entrar"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {modoProfissional
              ? "Acesse o painel para gerenciar seu portfólio, equipe e categorias"
              : "Acesse sua conta para continuar"}
          </p>
        </div>

        <form onSubmit={handleEntrar} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="senha" className="text-foreground">Senha</Label>
            <Input
              id="senha"
              type="password"
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="current-password"
              required
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full h-11" disabled={carregando}>
            {carregando ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-2 text-muted-foreground">ou</span>
          </div>
        </div>

        <div className="space-y-3">
          {!modoProfissional && (
            <div className="space-y-2">
              <Label htmlFor="slugGrupoLogin" className="text-foreground">
                Slug do grupo <span className="text-muted-foreground font-normal">(passageiros)</span>
              </Label>
              <Input
                id="slugGrupoLogin"
                type="text"
                placeholder="ex: meu-grupo"
                value={slugGrupo}
                onChange={(e) => setSlugGrupo(e.target.value)}
              />
            </div>
          )}

          <Button
            variant="outline"
            className="w-full h-11"
            onClick={handleGoogle}
            disabled={carregandoGoogle}
          >
            {carregandoGoogle ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Entrar com Google
              </>
            )}
          </Button>
        </div>

        <div className="space-y-3 text-center text-sm">
          <p className="text-muted-foreground">
            Não tem conta?{" "}
            <Link
              to={redirectTo ? `/cadastro?redirectTo=${encodeURIComponent(redirectTo)}` : "/cadastro"}
              className="text-primary hover:underline font-medium"
            >
              Criar conta
            </Link>
          </p>

          {modoProfissional ? (
            <Link to="/entrar" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
              Sou passageiro
            </Link>
          ) : (
            <Link
              to="/entrar?modo=profissional"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Briefcase className="w-3 h-3" />
              Sou profissional
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
