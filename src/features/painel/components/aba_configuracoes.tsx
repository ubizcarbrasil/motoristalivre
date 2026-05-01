import { useEffect, useState, useCallback } from "react";
import { Loader2, Plus, Users, Bell, Copy, Check, Smartphone, Download, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SecaoMeuPreco } from "./secao_meu_preco";
import { SecaoRegrasLink } from "./secao_regras_link";
import { CardConviteGrupo } from "./card_convite_grupo";
import { BuscaGrupo } from "./busca_grupo";
import { SeletorSomChamada } from "./seletor_som_chamada";
import { SecaoMeusServicos } from "./secao_meus_servicos";
import { SecaoMinhaDisponibilidade } from "./secao_minha_disponibilidade";
import { SecaoCategoriasAdmin } from "./secao_categorias_admin";
import { SecaoPortfolioAdmin } from "./secao_portfolio_admin";
import { SecaoEquipeAdmin } from "./secao_equipe_admin";
import { BotaoPreviewVitrine } from "./botao_preview_vitrine";
import { BannerOnboardingProfissional } from "./banner_onboarding_profissional";
import { BloqueioOnboarding } from "./bloqueio_onboarding";
import { DialogoOnboardingProfissional } from "./dialogo_onboarding_profissional";
import { useHookOnboardingProfissional } from "../hooks/hook_onboarding_profissional";
import {
  buscarMeusGrupos,
  buscarConvitesPendentes,
  responderConvite,
} from "../services/servico_configuracoes";
import { supabase } from "@/integrations/supabase/client";
import { useHookPerfilServico } from "@/features/servicos/hooks/hook_perfil_servico";
import type { TipoProfissional } from "@/features/servicos/types/tipos_servicos";
import { toast } from "sonner";
import type {
  GrupoMotorista,
  ConviteGrupo,
} from "../types/tipos_configuracoes";
import type { TipoSomChamada } from "../utils/audio_alerta";

interface AbaConfiguracoesProps {
  driverId: string;
  tenantId: string;
  ehAdmin: boolean;
  activeModules: string[];
  tipoSom: TipoSomChamada;
  onMudarSom: (tipo: TipoSomChamada) => void;
  onTestarAlerta?: () => void | Promise<void>;
}

export function AbaConfiguracoes({
  driverId,
  tenantId,
  ehAdmin,
  activeModules,
  tipoSom,
  onMudarSom,
  onTestarAlerta,
}: AbaConfiguracoesProps) {
  const [grupos, setGrupos] = useState<GrupoMotorista[]>([]);
  const [convites, setConvites] = useState<ConviteGrupo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [idCopiado, setIdCopiado] = useState(false);
  const [salvandoTipo, setSalvandoTipo] = useState(false);
  const [onboardingAberto, setOnboardingAberto] = useState(false);
  const navigate = useNavigate();

  const {
    professionalType,
    servicos,
    disponibilidade,
    recarregar: recarregarServico,
  } = useHookPerfilServico(driverId);

  const {
    dados: dadosOnboarding,
    camposFaltantes,
    precisaOnboarding,
    recarregar: recarregarOnboarding,
  } = useHookOnboardingProfissional(driverId, tenantId);

  const idCurto = driverId.slice(0, 8);

  const copiarId = async () => {
    try {
      await navigator.clipboard.writeText(driverId);
      setIdCopiado(true);
      toast.success("ID copiado");
      setTimeout(() => setIdCopiado(false), 2000);
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  const testar = async () => {
    if (!onTestarAlerta) return;
    await onTestarAlerta();
    toast.success("Tocando alerta por 5 segundos");
  };

  const recarregar = useCallback(async () => {
    const [g, c] = await Promise.all([
      buscarMeusGrupos(driverId),
      buscarConvitesPendentes(driverId),
    ]);
    setGrupos(g);
    setConvites(c);
  }, [driverId]);

  useEffect(() => {
    recarregar().finally(() => setCarregando(false));
  }, [recarregar]);

  const responder = async (id: string, resposta: "accepted" | "rejected") => {
    try {
      await responderConvite(id, resposta);
      toast.success(resposta === "accepted" ? "Convite aceito" : "Convite recusado");
      recarregar();
    } catch {
      toast.error("Erro ao responder");
    }
  };

  const alterarTipoProfissional = async (valor: TipoProfissional) => {
    setSalvandoTipo(true);
    try {
      const { error } = await supabase
        .from("drivers")
        .update({ professional_type: valor } as any)
        .eq("id", driverId);
      if (error) throw error;
      toast.success("Tipo de profissional atualizado");
      await recarregarServico();
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao atualizar");
    } finally {
      setSalvandoTipo(false);
    }
  };

  const temMobilidade = activeModules.includes("mobility");
  const temServicos = activeModules.includes("services");

  const ofereceServico =
    temServicos &&
    (professionalType === "service_provider" || professionalType === "both");

  return (
    <div className="pt-12 pb-24 px-4 space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Configurações</h2>

      {precisaOnboarding && temServicos && (
        <BannerOnboardingProfissional
          camposFaltantes={camposFaltantes}
          onAbrir={() => setOnboardingAberto(true)}
        />
      )}

      {temMobilidade && (
        <>
          <SecaoMeuPreco driverId={driverId} tenantId={tenantId} />
          <Separator />
          <SecaoRegrasLink driverId={driverId} tenantId={tenantId} ehAdmin={ehAdmin} />
          <Separator />
          <SeletorSomChamada valor={tipoSom} onChange={onMudarSom} />
          <Separator />
        </>
      )}

      {/* Tipo de profissional — só faz sentido quando a tribo tem mobilidade
          (define se atende corrida, serviço ou ambos). Em tribo só de serviços
          o tipo é fixo em service_provider. */}
      {temMobilidade && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" />
            <Label className="text-sm font-semibold text-foreground">
              Tipo de profissional
            </Label>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Define como você atende seus clientes neste link.
          </p>
          <Select
            value={professionalType}
            onValueChange={(v) => alterarTipoProfissional(v as TipoProfissional)}
            disabled={salvandoTipo}
          >
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="driver">Somente motorista</SelectItem>
              <SelectItem value="service_provider">Somente prestador de serviços</SelectItem>
              {temServicos && <SelectItem value="both">Ambos</SelectItem>}
            </SelectContent>
          </Select>
        </div>
      )}

      {ofereceServico && (
        <>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Módulo Serviços
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <SecaoMeusServicos
            driverId={driverId}
            tenantId={tenantId}
            servicos={servicos}
            onAtualizar={recarregarServico}
          />

          <SecaoMinhaDisponibilidade
            driverId={driverId}
            tenantId={tenantId}
            blocos={disponibilidade}
            onAtualizar={recarregarServico}
          />

          {precisaOnboarding ? (
            <div className="space-y-3">
              <BloqueioOnboarding
                titulo="Categorias visíveis"
                descricao="Conclua seu cadastro profissional para gerenciar as categorias da vitrine."
                onAbrir={() => setOnboardingAberto(true)}
              />
              <BloqueioOnboarding
                titulo="Portfólio de serviços"
                descricao="Conclua seu cadastro para enviar fotos e organizar seu portfólio."
                onAbrir={() => setOnboardingAberto(true)}
              />
              <BloqueioOnboarding
                titulo="Equipe"
                descricao="Conclua seu cadastro para adicionar membros à sua equipe pública."
                onAbrir={() => setOnboardingAberto(true)}
              />
            </div>
          ) : (
            <>
              <SecaoCategoriasAdmin driverId={driverId} />

              <SecaoPortfolioAdmin
                driverId={driverId}
                tenantId={tenantId}
                servicos={servicos}
              />

              <SecaoEquipeAdmin driverId={driverId} tenantId={tenantId} />
            </>
          )}

          <BotaoPreviewVitrine driverId={driverId} />
        </>
      )}

      <Separator />

      <div className="rounded-xl bg-primary/5 border border-primary/30 p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Instalar na tela inicial
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Acesso rápido como app, recebe chamadas mesmo com tela bloqueada.
            </p>
          </div>
        </div>
        <Button
          variant="default"
          className="w-full h-10 gap-2"
          onClick={() => navigate("/instalar")}
        >
          <Download className="w-4 h-4" />
          Como instalar
        </Button>
      </div>

      {onTestarAlerta && (
        <Button
          variant="outline"
          className="w-full h-12 gap-2"
          onClick={testar}
        >
          <Bell className="w-4 h-4" />
          Testar alerta de chamada (5 segundos)
        </Button>
      )}

      <div className="rounded-xl bg-card border border-border p-3 space-y-1">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          ID do motorista logado
        </p>
        <button
          type="button"
          onClick={copiarId}
          className="w-full flex items-center justify-between gap-2 rounded-lg bg-secondary/50 px-3 py-2 hover:bg-secondary transition-colors"
        >
          <span className="text-sm font-mono text-foreground">{idCurto}…</span>
          {idCopiado ? (
            <Check className="w-4 h-4 text-primary" />
          ) : (
            <Copy className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        <p className="text-[11px] text-muted-foreground">
          Use este ID no simulador de dispatch para testar.
        </p>
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Grupos e rede</h3>
          <p className="text-[11px] text-muted-foreground">
            Seus grupos ativos, convites e busca de novos grupos.
          </p>
        </div>

        {carregando ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {grupos.length > 0 && (
              <div className="space-y-2">
                {grupos.map((g) => (
                  <div
                    key={g.tenant_id}
                    className="rounded-xl bg-card border border-border p-3 flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                      <Users className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {g.tenant_nome}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        @{g.tenant_slug}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-primary font-medium block">
                        {g.papel === "tenant_admin" || g.papel === "manager"
                          ? "Admin"
                          : "Membro"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {g.corridas_mes} corridas/mês
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {convites.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Convites e solicitações
                </p>
                {convites.map((c) => (
                  <CardConviteGrupo key={c.id} convite={c} onResponder={responder} />
                ))}
              </div>
            )}

            <div className="space-y-2">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Entrar em um grupo
              </p>
              <BuscaGrupo driverId={driverId} onSolicitado={recarregar} />
            </div>
          </>
        )}

        <Button
          variant="outline"
          className="w-full h-11 gap-2"
          onClick={() => navigate("/onboarding")}
        >
          <Plus className="w-4 h-4" />
          Criar meu próprio grupo
        </Button>
      </div>

      <DialogoOnboardingProfissional
        aberto={onboardingAberto}
        driverId={driverId}
        tenantId={tenantId}
        dadosIniciais={dadosOnboarding}
        onConcluido={async () => {
          await recarregarOnboarding();
          await recarregarServico();
          setOnboardingAberto(false);
        }}
        onFechar={() => {
          // Se ainda falta algo, mantemos o banner; o usuário pode fechar e voltar depois.
          setOnboardingAberto(false);
        }}
      />
    </div>
  );
}
