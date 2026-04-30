import { useState } from "react";
import { Link, useNavigate, Navigate, useSearchParams } from "react-router-dom";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAutenticacao } from "../hooks/hook_autenticacao";
import { criarTriboProfissional } from "../services/servico_criar_tribo_profissional";

type TipoCadastro = "grupo" | "motorista" | "passageiro" | "afiliado" | "profissional";

function resolverTipoInicial(valor: string | null): TipoCadastro {
  if (valor === "motorista") return "motorista";
  if (valor === "passageiro") return "passageiro";
  if (valor === "afiliado") return "afiliado";
  if (valor === "profissional") return "profissional";
  return "grupo";
}

export default function PaginaCadastro() {
  const { usuario, carregando: carregandoAuth } = useAutenticacao();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const tipoInicial = resolverTipoInicial(searchParams.get("tipo"));
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [slugGrupo, setSlugGrupo] = useState("");
  const [tipoCadastro, setTipoCadastro] = useState<TipoCadastro>(tipoInicial);
  const [carregando, setCarregando] = useState(false);
  const [carregandoGoogle, setCarregandoGoogle] = useState(false);
  const [emailEnviado, setEmailEnviado] = useState(false);

  if (carregandoAuth) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (usuario) {
    return <Navigate to="/painel" replace />;
  }

  // Passageiro NÃO precisa de slug — ele entra em qualquer tribo via link de motorista
  const precisaSlug = tipoCadastro === "afiliado" || tipoCadastro === "motorista";

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    if (precisaSlug && !slugGrupo.trim()) {
      toast({ title: "Informe o slug do grupo", variant: "destructive" });
      return;
    }
    if (senha.length < 8) {
      toast({ title: "A senha deve ter no mínimo 8 caracteres", variant: "destructive" });
      return;
    }
    setCarregando(true);

    const metadata: Record<string, string> = { full_name: nome.trim() };
    if (precisaSlug && slugGrupo.trim()) {
      metadata.tenant_slug = slugGrupo.trim();
    }
    if (tipoCadastro === "afiliado") {
      metadata.role = "affiliate";
    }
    // Motorista NÃO seta role aqui — vira driver só após aprovação do dono do grupo

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha,
      options: {
        data: metadata,
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setCarregando(false);
      const msg = error.message || "";
      const descricao = /known to be weak|easy to guess|pwned|leaked/i.test(msg)
        ? "Essa senha é muito comum e fácil de adivinhar. Escolha uma mais forte (misture letras, números e símbolos)."
        : /already registered|already exists/i.test(msg)
        ? "Este email já está cadastrado. Tente entrar."
        : msg;
      toast({ title: "Erro ao criar conta", description: descricao, variant: "destructive" });
      return;
    }

    // Se for motorista, cria a solicitação de entrada no grupo
    if (tipoCadastro === "motorista") {
      // Tenta logar imediatamente para chamar a RPC autenticado
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });
      if (!signInError) {
        const { error: rpcError } = await supabase.rpc("request_driver_join", {
          _tenant_slug: slugGrupo.trim(),
          _message: null,
        });
        if (rpcError) {
          toast({
            title: "Conta criada, mas houve erro ao solicitar entrada no grupo",
            description: rpcError.message,
            variant: "destructive",
          });
        }
      } else {
        // Email confirmation está ativa — guarda intenção pra criar a solicitação no primeiro login
        localStorage.setItem("tribocar_pending_driver_join", slugGrupo.trim());
      }
    }

    // Profissional autônomo: tenta criar tribo agora; se email confirmation estiver ativa,
    // marca intenção para criar no primeiro login.
    if (tipoCadastro === "profissional") {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });
      if (!signInError) {
        try {
          await criarTriboProfissional(nome.trim());
          setCarregando(false);
          navigate("/painel", { replace: true });
          return;
        } catch (err: any) {
          toast({
            title: "Conta criada, mas houve erro ao preparar seu espaço",
            description: err?.message || "Tente novamente no painel.",
            variant: "destructive",
          });
        }
      } else {
        localStorage.setItem("tribocar_pending_professional_setup", nome.trim());
      }
    }

    setCarregando(false);
    setEmailEnviado(true);
  }

  async function handleGoogle() {
    if (precisaSlug && !slugGrupo.trim()) {
      toast({ title: "Informe o slug do grupo", variant: "destructive" });
      return;
    }
    if (precisaSlug && slugGrupo.trim()) {
      localStorage.setItem("tribocar_tenant_slug", slugGrupo.trim());
    }
    if (tipoCadastro === "afiliado") {
      localStorage.setItem("tribocar_signup_role", "affiliate");
    }
    if (tipoCadastro === "motorista") {
      localStorage.setItem("tribocar_pending_driver_join", slugGrupo.trim());
    }
    if (tipoCadastro === "profissional") {
      localStorage.setItem("tribocar_pending_professional_setup", "1");
    }
    setCarregandoGoogle(true);
    const redirectPath = tipoCadastro === "grupo" ? "/onboarding" : "/painel";
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}${redirectPath}`,
    });
    if (result?.error) {
      toast({ title: "Erro ao entrar com Google", description: String(result.error), variant: "destructive" });
      setCarregandoGoogle(false);
    }
  }

  if (emailEnviado) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-primary/10">
            <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-foreground">Verifique seu email</h1>
          <p className="text-sm text-muted-foreground">
            Enviamos um link de confirmacao para <strong className="text-foreground">{email}</strong>.
            Clique no link para ativar sua conta.
          </p>
          {tipoCadastro === "motorista" && (
            <p className="text-xs text-muted-foreground">
              Após confirmar, sua solicitação para entrar no grupo será enviada e ficará aguardando aprovação do dono.
            </p>
          )}
          <Button variant="outline" className="w-full" onClick={() => navigate("/entrar")}>
            Voltar para login
          </Button>
        </div>
      </div>
    );
  }

  const opcoes: Array<{ valor: TipoCadastro; label: string }> = [
    { valor: "grupo", label: "Criar grupo" },
    { valor: "motorista", label: "Motorista" },
    { valor: "passageiro", label: "Passageiro" },
    { valor: "afiliado", label: "Afiliado" },
  ];

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center px-6 overflow-y-auto">
      <div className="w-full max-w-sm space-y-6 py-10">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Criar conta</h1>
          <p className="text-sm text-muted-foreground">Preencha os dados para comecar</p>
        </div>

        {/* Tipo de cadastro */}
        <div className="grid grid-cols-2 gap-2">
          {opcoes.map((opcao) => (
            <button
              key={opcao.valor}
              type="button"
              onClick={() => setTipoCadastro(opcao.valor)}
              className={`rounded-lg border px-2 py-3 text-xs font-medium transition-all ${
                tipoCadastro === opcao.valor
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-muted-foreground/30"
              }`}
            >
              {opcao.label}
            </button>
          ))}
        </div>

        {tipoCadastro === "passageiro" && (
          <p className="text-xs text-muted-foreground text-center -mt-2">
            Crie sua conta uma vez. Você pode pedir corrida em qualquer tribo abrindo o link do motorista.
          </p>
        )}

        <form onSubmit={handleCadastro} className="space-y-4">
          {precisaSlug && (
            <div className="space-y-2">
              <Label htmlFor="slugGrupo" className="text-foreground">Slug do grupo</Label>
              <Input
                id="slugGrupo"
                type="text"
                placeholder="ex: meu-grupo"
                value={slugGrupo}
                onChange={(e) => setSlugGrupo(e.target.value)}
                required
              />
              {tipoCadastro === "afiliado" && (
                <p className="text-xs text-muted-foreground">
                  Voce sera cadastrado como afiliado neste grupo.
                </p>
              )}
              {tipoCadastro === "motorista" && (
                <p className="text-xs text-muted-foreground">
                  Você enviará uma solicitação para entrar no grupo. O dono do grupo precisa aprovar antes de você começar a receber corridas.
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="nome" className="text-foreground">Nome completo</Label>
            <Input
              id="nome"
              type="text"
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoComplete="name"
              required
            />
          </div>

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
              placeholder="Mínimo 8 caracteres"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
            />
            <p className="text-xs text-muted-foreground">
              Use uma senha forte: misture letras, números e símbolos.
            </p>
          </div>

          <Button type="submit" className="w-full h-11" disabled={carregando}>
            {carregando ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar conta"}
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
              Cadastrar com Google
            </>
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Ja tem conta?{" "}
          <Link to="/entrar" className="text-primary hover:underline font-medium">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
