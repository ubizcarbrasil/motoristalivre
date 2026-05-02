import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, ShieldCheck, Zap, CalendarPlus, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  chamarBookService,
} from "@/features/servicos/services/servico_servicos";
import {
  FormularioBriefing,
  validarBriefing,
} from "@/features/triboservicos/components/formulario_briefing";
import {
  lerOrigemIndicacao,
  limparOrigemIndicacao,
} from "@/features/triboservicos/services/servico_origem_indicacao";
import type {
  TipoServico,
  DisponibilidadeProfissional,
  AgendamentoServico,
  FormaPagamentoServico,
} from "@/features/servicos/types/tipos_servicos";
import {
  gerarSlotsDoDia,
  formatarDuracao,
  type SlotDisponivel,
} from "../utils/calcular_slots_disponiveis";
import { baixarIcs } from "../utils/gerador_ics";
import { BlocosDisponibilidade } from "./blocos_disponibilidade";
import { ResumoServicoSticky } from "./resumo_servico_sticky";
import { GradeSlotsPeriodo } from "./grade_slots_periodo";

const STORAGE_KEY_GUEST_DADOS = "tribocar_guest_dados";

interface DriverInfo {
  id: string;
  full_name: string;
  avatar_url: string | null;
  credential_verified: boolean;
  credential_type: string | null;
  credential_number: string | null;
  tenant_slug: string;
  slug: string;
}

interface Props {
  driver: DriverInfo;
  tenantId: string;
  serviceTypes: TipoServico[];
  availability: DisponibilidadeProfissional[];
  preSelectedServiceId?: string | null;
  onVoltar?: () => void;
}

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function carregarGuestStorage(): { nome: string; whatsapp: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GUEST_DADOS);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function salvarGuestStorage(dados: { nome: string; whatsapp: string }) {
  try {
    localStorage.setItem(STORAGE_KEY_GUEST_DADOS, JSON.stringify(dados));
  } catch {
    // ignore
  }
}

function formatarDataLonga(d: Date): string {
  return `${DIAS_SEMANA[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`;
}

export function AgendamentoServico({
  driver,
  tenantId,
  serviceTypes,
  availability,
  preSelectedServiceId,
  onVoltar,
}: Props) {
  const ativos = useMemo(() => serviceTypes.filter((s) => s.is_active), [serviceTypes]);
  const [servicoId, setServicoId] = useState<string | null>(
    preSelectedServiceId ?? ativos[0]?.id ?? null,
  );
  const [diaSelecionado, setDiaSelecionado] = useState<Date | null>(null);
  const [slotSelecionado, setSlotSelecionado] = useState<SlotDisponivel | null>(null);
  const [agendamentos, setAgendamentos] = useState<
    Pick<AgendamentoServico, "scheduled_at" | "duration_minutes">[]
  >([]);
  const [carregandoAgenda, setCarregandoAgenda] = useState(true);

  const guestSalvo = useMemo(() => carregarGuestStorage(), []);
  const [nome, setNome] = useState(guestSalvo?.nome ?? "");
  const [whatsapp, setWhatsapp] = useState(guestSalvo?.whatsapp ?? "+55");
  const [observacoes, setObservacoes] = useState("");
  const [pagamento, setPagamento] = useState<FormaPagamentoServico>("cash");
  const [enviando, setEnviando] = useState(false);
  const [confirmado, setConfirmado] = useState<{
    quando: Date;
    servico: TipoServico;
  } | null>(null);
  const [briefing, setBriefing] = useState<Record<string, unknown>>({});
  const [mapaCategorias, setMapaCategorias] = useState<Map<string, string>>(new Map());

  const servicoAtual = ativos.find((s) => s.id === servicoId) ?? null;
  const slugCategoriaAtual = servicoAtual?.category_id
    ? mapaCategorias.get(servicoAtual.category_id) ?? null
    : null;

  // Reseta o briefing ao trocar de serviço (categorias podem ter campos diferentes)
  useEffect(() => {
    setBriefing({});
  }, [servicoId]);

  // Carrega o mapa id → slug das categorias usadas pelos serviços ativos
  useEffect(() => {
    const ids = Array.from(
      new Set(ativos.map((s) => s.category_id).filter(Boolean) as string[]),
    );
    if (ids.length === 0) return;
    let cancelado = false;
    (async () => {
      const { data } = await supabase
        .from("service_categories" as any)
        .select("id, slug")
        .in("id", ids);
      if (cancelado || !data) return;
      const m = new Map<string, string>();
      for (const row of data as unknown as Array<{ id: string; slug: string }>) {
        m.set(row.id, row.slug);
      }
      setMapaCategorias(m);
    })();
    return () => {
      cancelado = true;
    };
  }, [ativos]);

  // Carrega agendamentos futuros do driver para cálculo de conflitos
  useEffect(() => {
    let cancelado = false;
    async function carregar() {
      setCarregandoAgenda(true);
      const inicio = new Date();
      inicio.setHours(0, 0, 0, 0);
      const fim = new Date(inicio);
      fim.setDate(fim.getDate() + 16);
      const { data } = await supabase
        .from("service_bookings" as any)
        .select("scheduled_at, duration_minutes, status")
        .eq("driver_id", driver.id)
        .gte("scheduled_at", inicio.toISOString())
        .lt("scheduled_at", fim.toISOString())
        .in("status", ["pending", "confirmed", "in_progress"]);
      if (cancelado) return;
      setAgendamentos((data ?? []) as any);
      setCarregandoAgenda(false);
    }
    carregar();
    return () => {
      cancelado = true;
    };
  }, [driver.id]);

  const dias14 = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(hoje);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, []);

  const slotsPorDia = useMemo(() => {
    if (!servicoAtual) return new Map<string, SlotDisponivel[]>();
    const map = new Map<string, SlotDisponivel[]>();
    for (const d of dias14) {
      const slots = gerarSlotsDoDia({
        data: d,
        blocos: availability,
        agendamentos,
        duracaoServicoMin: servicoAtual.duration_minutes,
      });
      map.set(d.toDateString(), slots);
    }
    return map;
  }, [dias14, availability, agendamentos, servicoAtual]);

  const slotsDoDiaSelecionado = diaSelecionado
    ? slotsPorDia.get(diaSelecionado.toDateString()) ?? []
    : [];

  const validarWhatsapp = (v: string) => v.replace(/\D/g, "").length >= 12; // +55 + DDD + número

  const confirmar = async () => {
    if (!servicoAtual) return toast.error("Selecione um serviço");
    if (!slotSelecionado) return toast.error("Selecione um horário");
    if (nome.trim().length < 2) return toast.error("Informe seu nome completo");
    if (!validarWhatsapp(whatsapp)) return toast.error("WhatsApp inválido. Use formato +55…");

    salvarGuestStorage({ nome: nome.trim(), whatsapp: whatsapp.trim() });
    setEnviando(true);
    try {
      // Lê origem de indicação (driver que indicou via /s/:slug/a/:driver_slug)
      // e ignora se a origem for o próprio profissional do agendamento.
      const origemIndicacao = lerOrigemIndicacao(
        (typeof window !== "undefined" && window.location.pathname.split("/")[2]) || "",
      );
      const originDriverId =
        origemIndicacao && origemIndicacao !== driver.id ? origemIndicacao : null;

      await chamarBookService({
        tenant_id: tenantId,
        driver_id: driver.id,
        service_type_id: servicoAtual.id,
        scheduled_at: slotSelecionado.iso,
        payment_method: pagamento,
        notes: observacoes.trim() || undefined,
        guest: { full_name: nome.trim(), whatsapp: whatsapp.trim() },
        origin_driver_id: originDriverId,
      });
      if (originDriverId) limparOrigemIndicacao();
      setConfirmado({ quando: new Date(slotSelecionado.iso), servico: servicoAtual });
    } catch (erro: any) {
      const mensagem = String(erro?.message ?? erro?.context?.error ?? "");
      // Edge function retorna 409 com code SLOT_TAKEN
      if (mensagem.includes("409") || mensagem.toLowerCase().includes("reservado") || mensagem.includes("SLOT_TAKEN")) {
        toast.error("Horário já reservado — escolha outro");
        setSlotSelecionado(null);
        // recarrega agenda dentro da mesma janela de 14 dias usada na carga inicial
        const inicio = new Date();
        inicio.setHours(0, 0, 0, 0);
        const fim = new Date(inicio);
        fim.setDate(fim.getDate() + 16);
        const { data } = await supabase
          .from("service_bookings" as any)
          .select("scheduled_at, duration_minutes, status")
          .eq("driver_id", driver.id)
          .gte("scheduled_at", inicio.toISOString())
          .lt("scheduled_at", fim.toISOString())
          .in("status", ["pending", "confirmed", "in_progress"]);
        setAgendamentos((data ?? []) as any);
      } else {
        toast.error(mensagem || "Erro ao agendar");
      }
    } finally {
      setEnviando(false);
    }
  };

  const adicionarCalendario = () => {
    if (!confirmado) return;
    baixarIcs({
      titulo: `${confirmado.servico.name} com ${driver.full_name}`,
      descricao: `Agendamento confirmado pelo TriboServ.`,
      inicio: confirmado.quando,
      duracaoMinutos: confirmado.servico.duration_minutes,
    }, `agendamento-${confirmado.quando.toISOString().slice(0, 10)}.ics`);
  };

  const iniciais = driver.full_name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Tela de confirmação
  if (confirmado) {
    return (
      <div className="fixed inset-0 bg-background overflow-y-auto">
        <div className="px-6 py-10 max-w-md mx-auto space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-xl font-semibold text-foreground text-center">
              Agendamento confirmado!
            </h1>
            <p className="text-sm text-muted-foreground text-center">
              Você receberá uma confirmação no WhatsApp.
            </p>
          </div>

          <div className="rounded-xl bg-card border border-border p-4 space-y-3">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Serviço
              </p>
              <p className="text-sm font-semibold text-foreground">{confirmado.servico.name}</p>
            </div>
            <Separator />
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Profissional
              </p>
              <p className="text-sm font-semibold text-foreground">{driver.full_name}</p>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Data
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {formatarDataLonga(confirmado.quando)}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Horário
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {String(confirmado.quando.getHours()).padStart(2, "0")}:
                  {String(confirmado.quando.getMinutes()).padStart(2, "0")}
                </p>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Valor
              </p>
              <p className="text-base font-semibold text-primary">
                R$ {Number(confirmado.servico.price).toFixed(2)}
              </p>
            </div>
          </div>

          <Button onClick={adicionarCalendario} variant="outline" className="w-full h-12 gap-2">
            <CalendarPlus className="w-4 h-4" />
            Adicionar ao calendário
          </Button>

          {onVoltar && (
            <Button onClick={onVoltar} className="w-full h-12">
              Concluir
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background overflow-y-auto">
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-background/85 backdrop-blur-sm border-b border-border">
        {onVoltar && (
          <button
            onClick={onVoltar}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <span className="text-sm font-medium text-foreground">Agendar serviço</span>
      </div>

      <ResumoServicoSticky
        servico={servicoAtual}
        slotHora={slotSelecionado?.hora ?? null}
        slotData={diaSelecionado ? formatarDataLonga(diaSelecionado) : null}
      />

      <div className="px-4 py-5 pb-32 max-w-md mx-auto space-y-6">
        {/* Header profissional */}
        <div className="flex items-center gap-3">
          <Avatar className="h-14 w-14 border border-border">
            <AvatarImage src={driver.avatar_url ?? undefined} alt={driver.full_name} />
            <AvatarFallback>{iniciais}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-semibold text-foreground truncate">
                {driver.full_name}
              </h1>
              {driver.credential_verified && (
                <Badge className="bg-primary text-primary-foreground gap-1 px-1.5 py-0 h-5">
                  <ShieldCheck className="w-3 h-3" />
                  Verificado
                </Badge>
              )}
            </div>
            {driver.credential_verified && driver.credential_type && (
              <p className="text-[11px] text-muted-foreground">
                {driver.credential_type.toUpperCase()}
                {driver.credential_number ? ` ${driver.credential_number}` : ""}
              </p>
            )}
          </div>
        </div>

        {/* Seleção de serviço */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Escolha o serviço</h2>
          {ativos.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Este profissional ainda não cadastrou serviços.
            </p>
          ) : (
            <div className="space-y-2">
              {ativos.map((s) => {
                const ativo = servicoId === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setServicoId(s.id);
                      setSlotSelecionado(null);
                    }}
                    className={`w-full text-left rounded-xl border p-3 transition-colors ${
                      ativo
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:bg-secondary/40"
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground">{s.name}</p>
                      {s.is_immediate && (
                        <Badge variant="outline" className="border-primary text-primary gap-1 px-1.5 py-0 h-5">
                          <Zap className="w-3 h-3" />
                          Imediato
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {formatarDuracao(s.duration_minutes)} · R$ {Number(s.price).toFixed(2)}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Blocos de disponibilidade */}
        {servicoAtual && <BlocosDisponibilidade blocos={availability} />}

        {/* Calendário 14 dias - scroll horizontal */}
        {servicoAtual && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-foreground">Escolha a data</h2>
            {carregandoAgenda ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
                {dias14.map((d) => {
                  const slots = slotsPorDia.get(d.toDateString()) ?? [];
                  const desabilitado = slots.length === 0;
                  const ativo = diaSelecionado?.toDateString() === d.toDateString();
                  return (
                    <button
                      key={d.toISOString()}
                      type="button"
                      disabled={desabilitado}
                      onClick={() => {
                        setDiaSelecionado(d);
                        setSlotSelecionado(null);
                      }}
                      className={`snap-start shrink-0 w-[72px] rounded-xl p-2.5 text-center transition-colors border ${
                        ativo
                          ? "border-primary bg-primary/15 text-foreground"
                          : desabilitado
                          ? "border-border bg-card/40 text-muted-foreground/40 cursor-not-allowed"
                          : "border-border bg-card text-foreground hover:bg-secondary/40"
                      }`}
                    >
                      <p className="text-[10px] uppercase tracking-wider">
                        {DIAS_SEMANA[d.getDay()]}
                      </p>
                      <p className="text-lg font-semibold leading-tight">{d.getDate()}</p>
                      <p className="text-[10px] text-muted-foreground">{MESES[d.getMonth()]}</p>
                      <p
                        className={`text-[10px] mt-1 font-medium ${
                          desabilitado ? "text-muted-foreground/40" : "text-primary"
                        }`}
                      >
                        {desabilitado ? "—" : `${slots.length} hr`}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Slots do dia agrupados por período */}
        {diaSelecionado && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-foreground">Horários disponíveis</h2>
            <GradeSlotsPeriodo
              slots={slotsDoDiaSelecionado}
              selecionado={slotSelecionado}
              onSelecionar={setSlotSelecionado}
            />
          </div>
        )}

        {/* Identificação */}
        {slotSelecionado && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Seus dados</h2>
            <div className="space-y-1.5">
              <Label htmlFor="ag_nome">Nome completo</Label>
              <Input
                id="ag_nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Como você se chama"
                maxLength={100}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ag_zap">WhatsApp</Label>
              <Input
                id="ag_zap"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+55 11 90000-0000"
                maxLength={20}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ag_obs">Observações (opcional)</Label>
              <Textarea
                id="ag_obs"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Alguma informação útil?"
                rows={2}
                maxLength={500}
              />
            </div>

            <div className="space-y-2">
              <Label>Forma de pagamento</Label>
              <RadioGroup
                value={pagamento}
                onValueChange={(v) => setPagamento(v as FormaPagamentoServico)}
                className="grid grid-cols-3 gap-2"
              >
                {(["cash", "pix", "card"] as FormaPagamentoServico[]).map((m) => (
                  <label
                    key={m}
                    className={`flex items-center justify-center gap-2 rounded-lg border p-2 cursor-pointer transition-colors ${
                      pagamento === m
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card"
                    }`}
                  >
                    <RadioGroupItem value={m} className="sr-only" />
                    <span className="text-xs font-medium text-foreground">
                      {m === "cash" ? "Dinheiro" : m === "pix" ? "PIX" : "Cartão"}
                    </span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          </div>
        )}
      </div>

      {/* CTA fixo */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border">
        <Button
          className="w-full h-12 text-base font-semibold"
          disabled={!servicoAtual || !slotSelecionado || enviando}
          onClick={confirmar}
        >
          {enviando ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : servicoAtual && slotSelecionado ? (
            `Confirmar · R$ ${Number(servicoAtual.price).toFixed(2)}`
          ) : (
            "Confirmar agendamento"
          )}
        </Button>
      </div>
    </div>
  );
}
