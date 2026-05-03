import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Users } from "lucide-react";
import { useAutenticacao } from "@/features/autenticacao/hooks/hook_autenticacao";
import { TemaServicos } from "@/features/triboservicos/components/tema_servicos";
import { LogoTriboServicos } from "@/features/triboservicos/components/logo_triboservicos";
import {
  resolverTriboPorSignupSlug,
  entrarNaTriboPorSignupSlug,
  type TriboResolvida,
} from "../services/servico_tribo_signup";

const CHAVE_TRIBO_PENDENTE = "tribocar_pending_tribo_signup";

export default function PaginaCadastroPorTribo() {
  const { signup_slug } = useParams<{ signup_slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { usuario, carregando: carregandoAuth } = useAutenticacao();

  const [tribo, setTribo] = useState<TriboResolvida | null>(null);
  const [carregandoTribo, setCarregandoTribo] = useState(true);
  const [erroTribo, setErroTribo] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [emailEnviado, setEmailEnviado] = useState(false);

  useEffect(() => {
    let cancelado = false;
    if (!signup_slug) {
      setErroTribo(true);
      setCarregandoTribo(false);
      return;
    }
    (async () => {
      const resultado = await resolverTriboPorSignupSlug(signup_slug);
      if (cancelado) return;
      if (!resultado) {
        setErroTribo(true);
      } else {
        setTribo(resultado);
      }
      setCarregandoTribo(false);
    })();
    return () => {
      cancelado = true;
    };
  }, [signup_slug]);

  // Se usuário já estiver logado, vincula direto e redireciona
  useEffect(() => {
    if (carregandoAuth || !usuario || !signup_slug || !tribo) return;
    (async () => {
      try {
        await entrarNaTriboPorSignupSlug(signup_slug);
        toast({ title: `Você entrou na tribo ${tribo.tenantName}` });
        navigate("/painel?aba=tribos", { replace: true });
      } catch (err: any) {
        toast({
          title: "Erro ao entrar na tribo",
          description: err?.message || "Tente novamente",
          variant: "destructive",
        });
      }
    })();
  }, [carregandoAuth, usuario, signup_slug, tribo, navigate, toast]);

  if (carregandoAuth || carregandoTribo) {
    return (
      <TemaServicos>
        <div className="fixed inset-0 bg-background flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </TemaServicos>
    );
  }

  if (erroTribo || !tribo) {
    return <Navigate to="/s/cadastrar" replace />;
  }

  // Usuário logado — está sendo redirecionado pelo effect
  if (usuario) {
    return (
      <TemaServicos>
        <div className="fixed inset-0 bg-background flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </TemaServicos>
    );
  }

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    if (senha.length < 8) {
      toast({ title: "A senha deve ter no mínimo 8 caracteres", variant: "destructive" });
      return;
    }
    if (!signup_slug) return;

    setCarregando(true);

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha,
      options: {
        data: { full_name: nome.trim() },
        emailRedirectTo: `${window.location.origin}/s/cadastro/tribo/${signup_slug}`,
      },
    });

    if (error) {
      setCarregando(false);
      const msg = error.message || "";
      const descricao = /known to be weak|easy to guess|pwned|leaked/i.test(msg)
        ? "Essa senha é muito comum. Escolha uma mais forte."
        : /already registered|already exists/i.test(msg)
          ? "Este email já está cadastrado. Tente entrar."
          : msg;
      toast({ title: "Erro ao criar conta", description: descricao, variant: "destructive" });
      return;
    }

    // Tenta logar imediatamente para vincular já autenticado
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });

    if (!signInError) {
      try {
        await entrarNaTriboPorSignupSlug(signup_slug);
        setCarregando(false);
        toast({ title: `Bem-vindo à tribo ${tribo!.tenantName}` });
        navigate("/painel?aba=tribos", { replace: true });
        return;
      } catch (err: any) {
        toast({
          title: "Conta criada, mas não foi possível vincular à tribo",
          description: err?.message || "Tente novamente no painel.",
          variant: "destructive",
        });
      }
    } else {
      // Email confirmation ativa: marca intenção para vincular após confirmar
      try {
        localStorage.setItem(CHAVE_TRIBO_PENDENTE, signup_slug);
      } catch {
        // ignore
      }
    }

    setCarregando(false);
    setEmailEnviado(true);
  }

  if (emailEnviado) {
    return (
      <TemaServicos>
        <div className="fixed inset-0 bg-background flex items-center justify-center px-6">
          <div className="w-full max-w-sm text-center space-y-4">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-primary/10">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Verifique seu email</h1>
            <p className="text-sm text-muted-foreground">
              Enviamos um link de confirmação para <strong className="text-foreground">{email}</strong>.
              Após confirmar, você entra direto na tribo <strong className="text-foreground">{tribo.tenantName}</strong>.
            </p>
            <Button variant="outline" className="w-full" onClick={() => navigate("/s/entrar")}>
              Voltar para login
            </Button>
          </div>
        </div>
      </TemaServicos>
    );
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-medium">
              <Users className="w-3 h-3" />
              Convite para tribo
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Você foi convidado para a tribo
            </h1>
            <div className="rounded-lg border border-border bg-card/50 p-4 space-y-1">
              <p className="text-base font-semibold text-foreground">{tribo.tenantName}</p>
              {tribo.serviceCategoryName ? (
                <p className="text-xs text-muted-foreground">
                  Serviço: <span className="text-foreground">{tribo.serviceCategoryName}</span>
                </p>
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground">
              Crie sua conta para começar a atender pelos clientes da tribo.
            </p>
          </div>

          <form onSubmit={handleCadastro} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Seu nome</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                autoComplete="name"
                placeholder="Como aparece no seu perfil"
                required
              />
            </div>
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
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                required
                minLength={8}
              />
            </div>

            <Button type="submit" className="w-full h-11" disabled={carregando}>
              {carregando ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar na tribo"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link to="/s/entrar" className="text-primary hover:underline font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </TemaServicos>
  );
}
