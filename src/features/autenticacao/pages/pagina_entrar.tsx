import { useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Briefcase, Car, ShieldCheck } from "lucide-react";
import { useAutenticacao } from "../hooks/hook_autenticacao";
import { useRedirecionamento } from "../hooks/hook_redirecionamento";

type ModoEntrar = "padrao" | "profissional" | "motorista" | "admin";

function resolverModo(valor: string | null): ModoEntrar {
  if (valor === "profissional") return "profissional";
  if (valor === "motorista") return "motorista";
  if (valor === "admin") return "admin";
  return "padrao";
}

const TEXTOS_MODO: Record<ModoEntrar, { titulo: string; subtitulo: string; chip?: { label: string; Icone: typeof Briefcase } }> = {
  padrao: {
    titulo: "Entrar",
    subtitulo: "Acesse sua conta para continuar",
  },
  profissional: {
    titulo: "Acesso do profissional",
    subtitulo: "Acesse o painel para gerenciar seu portfólio, equipe e categorias",
    chip: { label: "Profissional", Icone: Briefcase },
  },
  motorista: {
    titulo: "Acesso do motorista",
    subtitulo: "Acesse o painel para receber corridas e gerenciar seu link",
    chip: { label: "Motorista", Icone: Car },
  },
  admin: {
    titulo: "Acesso administrativo",
    subtitulo: "Painel do administrador geral. Restrito a contas autorizadas.",
    chip: { label: "Administrador", Icone: ShieldCheck },
  },
};

export default function PaginaEntrar() {
  const { usuario, carregando: carregandoAuth } = useAutenticacao();
  const { destino, carregando: carregandoDestino } = useRedirecionamento();
  
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const modo = resolverModo(searchParams.get("modo"));
  const modoProfissional = modo === "profissional";
  const modoMotorista = modo === "motorista";
  const modoAdmin = modo === "admin";
  const ocultarSlugPassageiro = modoProfissional || modoMotorista || modoAdmin;
  const textosModo = TEXTOS_MODO[modo];

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
    // Aviso quando alguém tenta usar o link de admin sem permissão
    if (modoAdmin && destino !== "/root") {
      toast({
        title: "Conta sem permissão administrativa",
        description: "Esta conta não é administrador geral do sistema. Redirecionando para seu painel.",
        variant: "destructive",
      });
    }
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
    // Profissional, motorista e admin já cadastrados dispensam o slug — o redirecionamento usa o tenant_id do perfil.
    if (!ocultarSlugPassageiro && !slugGrupo.trim()) {
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
          {textosModo.chip && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
              <textosModo.chip.Icone className="w-3 h-3" />
              {textosModo.chip.label}
            </div>
          )}
          <h1 className="text-2xl font-bold text-foreground">{textosModo.titulo}</h1>
          <p className="text-sm text-muted-foreground">{textosModo.subtitulo}</p>
          {modoAdmin && (
            <p className="text-xs text-muted-foreground">
              Não há cadastro público de administrador. Use a conta autorizada pelo dono do sistema.
            </p>
          )}
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
          {!ocultarSlugPassageiro && (
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
          {modoAdmin ? (
            <p className="text-muted-foreground">
              Acesso restrito.{" "}
              <Link to="/entrar" className="text-primary hover:underline font-medium">
                Sou usuário comum
              </Link>
            </p>
          ) : (
            <p className="text-muted-foreground">
              Não tem conta?{" "}
              <Link
                to={
                  modoProfissional
                    ? "/profissional/cadastro"
                    : modoMotorista
                    ? "/motorista/cadastro"
                    : redirectTo
                    ? `/cadastro?redirectTo=${encodeURIComponent(redirectTo)}`
                    : "/cadastro"
                }
                className="text-primary hover:underline font-medium"
              >
                Criar conta
              </Link>
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            {modo !== "padrao" && (
              <Link to="/entrar" className="hover:text-foreground transition-colors">
                Sou passageiro
              </Link>
            )}
            {!modoProfissional && (
              <Link
                to="/profissional/acesso"
                className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <Briefcase className="w-3 h-3" />
                Sou profissional
              </Link>
            )}
            {!modoMotorista && (
              <Link
                to="/motorista/acesso"
                className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <Car className="w-3 h-3" />
                Sou motorista
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
