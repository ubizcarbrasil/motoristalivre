import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import { useAutenticacao } from "@/features/autenticacao/hooks/hook_autenticacao";
import { TemaServicos } from "../components/tema_servicos";
import { LogoTriboServicos } from "../components/logo_triboservicos";

export default function PaginaCadastroTribo() {
  const { usuario, carregando: carregandoAuth } = useAutenticacao();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [emailEnviado, setEmailEnviado] = useState(false);

  if (carregandoAuth) {
    return (
      <TemaServicos>
        <div className="fixed inset-0 bg-background flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </TemaServicos>
    );
  }

  if (usuario) {
    return <Navigate to="/onboarding?modulo=services" replace />;
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
    setCarregando(true);

    // Marca a intenção: ao cair no /onboarding, já vem com módulo Serviços ativo
    localStorage.setItem("triboservicos_modulo_inicial", "services");

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha,
      options: {
        data: { full_name: nome.trim() },
        emailRedirectTo: `${window.location.origin}/onboarding?modulo=services`,
      },
    });

    setCarregando(false);

    if (error) {
      const msg = error.message || "";
      const descricao = /known to be weak|easy to guess|pwned|leaked/i.test(msg)
        ? "Essa senha é muito comum. Escolha uma mais forte (letras, números e símbolos)."
        : /already registered|already exists/i.test(msg)
          ? "Este email já está cadastrado. Tente entrar."
          : msg;
      toast({ title: "Erro ao criar conta", description: descricao, variant: "destructive" });
      return;
    }

    setEmailEnviado(true);
  }

  if (emailEnviado) {
    return (
      <TemaServicos>
        <div className="fixed inset-0 bg-background flex items-center justify-center px-6">
          <div className="w-full max-w-sm text-center space-y-4">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-primary/10">
              <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-foreground">Verifique seu email</h1>
            <p className="text-sm text-muted-foreground">
              Enviamos um link de confirmação para <strong className="text-foreground">{email}</strong>.
              Após confirmar, você cai direto no setup da sua tribo de serviços.
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
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-medium">
              Operadora · Tribo de serviços
            </div>
            <h1 className="text-2xl font-bold text-foreground">Crie sua tribo</h1>
            <p className="text-sm text-muted-foreground">
              Você gerencia vários profissionais sob sua marca.
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
                placeholder="Como você quer ser chamado"
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
              {carregando ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar tribo"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link to="/s/entrar" className="text-primary hover:underline font-medium">
              Entrar
            </Link>
          </p>

          <p className="text-center text-xs text-muted-foreground">
            Atende sozinho?{" "}
            <Link to="/s/cadastro/profissional" className="text-foreground hover:underline">
              Sou profissional autônomo
            </Link>
          </p>
        </div>
      </div>
    </TemaServicos>
  );
}
