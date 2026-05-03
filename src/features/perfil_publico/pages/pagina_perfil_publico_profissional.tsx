import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Share2, AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSeoBasico } from "@/compartilhados/hooks/hook_seo_basico";
import { CardTriboPublica } from "../components/card_tribo_publica";
import {
  buscarPerfilPublicoPorHandle,
  type PerfilPublicoProfissional,
} from "../services/servico_perfil_publico";

/**
 * Página pública agregada do profissional.
 * URL: /p/:handle  (ex: /p/joaomanuel)
 * Lista todas as tribos visíveis em que o profissional é dono ou membro.
 */
export default function PaginaPerfilPublicoProfissional() {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<PerfilPublicoProfissional | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    if (!handle) return;
    let cancelado = false;
    setCarregando(true);
    setErro(false);
    buscarPerfilPublicoPorHandle(handle).then((dados) => {
      if (cancelado) return;
      if (!dados) {
        setErro(true);
      } else {
        setPerfil(dados);
      }
      setCarregando(false);
    });
    return () => {
      cancelado = true;
    };
  }, [handle]);

  const tituloSeo = perfil?.fullName
    ? `${perfil.fullName} — Perfil profissional`
    : `@${handle ?? ""} — TriboCar`;
  const descricaoSeo = perfil?.bio
    ? perfil.bio.slice(0, 155)
    : perfil?.fullName
      ? `Conheça as tribos e agende serviços com ${perfil.fullName}.`
      : undefined;
  const canonicalSeo =
    perfil && typeof window !== "undefined"
      ? `${window.location.origin}/p/${perfil.handle}`
      : undefined;
  useSeoBasico({ titulo: tituloSeo, descricao: descricaoSeo, canonical: canonicalSeo });

  async function compartilhar() {
    if (!perfil) return;
    const url = `${window.location.origin}/p/${perfil.handle}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: perfil.fullName ?? `@${perfil.handle}`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copiado");
      }
    } catch {
      // usuário cancelou
    }
  }

  if (carregando) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (erro || !perfil) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center space-y-2">
          <p className="text-base font-medium text-foreground">Perfil não encontrado</p>
          <p className="text-sm text-muted-foreground">
            O @{handle} ainda não está cadastrado ou não está visível.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/")}
            className="mt-4"
          >
            Voltar ao início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      {/* Header com cover */}
      <div className="relative">
        {perfil.coverUrl ? (
          <div className="h-40 w-full overflow-hidden bg-secondary">
            <img
              src={perfil.coverUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="h-32 w-full bg-gradient-to-b from-primary/10 to-transparent" />
        )}

        <div className="absolute top-4 left-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="bg-background/70 backdrop-blur-sm rounded-full h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>

        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={compartilhar}
            className="bg-background/70 backdrop-blur-sm rounded-full h-9 w-9"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Avatar + Identidade */}
      <div className="px-5 -mt-10 relative">
        <div className="flex items-end gap-4">
          <div className="h-20 w-20 rounded-full border-4 border-background bg-secondary overflow-hidden shrink-0">
            {perfil.avatarUrl ? (
              <img
                src={perfil.avatarUrl}
                alt={perfil.fullName ?? perfil.handle}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-2xl font-semibold text-muted-foreground">
                {(perfil.fullName ?? perfil.handle).slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <h1 className="text-xl font-semibold text-foreground">
            {perfil.fullName ?? `@${perfil.handle}`}
          </h1>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <AtSign className="h-3 w-3" />
            <span>{perfil.handle}</span>
          </div>
          {perfil.bio && (
            <p className="text-sm text-muted-foreground pt-1 whitespace-pre-line">
              {perfil.bio}
            </p>
          )}
        </div>
      </div>

      {/* Tribos */}
      <div className="px-5 mt-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Tribos ({perfil.tribos.length})
          </h2>
        </div>
        {perfil.tribos.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            Este profissional ainda não está em nenhuma tribo pública.
          </div>
        ) : (
          <div className="space-y-2">
            {perfil.tribos.map((t) => (
              <CardTriboPublica
                key={t.tenantId}
                tribo={t}
                driverSlug={perfil.driverSlug}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
