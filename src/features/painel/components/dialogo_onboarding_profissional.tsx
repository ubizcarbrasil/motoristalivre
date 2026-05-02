import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2, Plus, X } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CampoUploadImagem } from "./campo_upload_imagem";
import { schemaOnboardingProfissional } from "../schemas/schema_onboarding_profissional";
import type { DadosOnboarding } from "../schemas/schema_onboarding_profissional";
import { salvarOnboardingProfissional } from "../services/servico_onboarding_profissional";
import type { DadosOnboardingProfissional } from "../hooks/hook_onboarding_profissional";
import { useHookAutoSaveOnboarding } from "../hooks/hook_autosave_onboarding";
import { IndicadorAutoSave } from "./indicador_autosave";
import { SeletorCategoriasServico } from "./seletor_categorias_servico";
import { iconePorSlug, nomePorSlug, slugValido } from "@/compartilhados/constants/constantes_categorias_servico";

function SeletorCategoriasServicoInline({
  selecionadas,
  onChange,
}: {
  selecionadas: string[];
  onChange: (lista: string[]) => void;
}) {
  const [aberto, setAberto] = useState(false);
  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => setAberto(true)}
        className="w-full h-11 gap-2"
      >
        <Plus className="w-4 h-4" />
        {selecionadas.length === 0
          ? "Selecionar categorias"
          : `Editar (${selecionadas.length}/10)`}
      </Button>
      {selecionadas.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selecionadas.map((slug) => {
            const Icone = iconePorSlug(slug);
            return (
              <Badge
                key={slug}
                variant="outline"
                className="border-primary/40 text-primary bg-primary/5 gap-1.5 pl-2 pr-1 py-1 text-[11px]"
              >
                <Icone className="w-3 h-3" />
                {nomePorSlug(slug)}
                <button
                  type="button"
                  onClick={() => onChange(selecionadas.filter((s) => s !== slug))}
                  className="rounded-full hover:bg-primary/10 p-0.5"
                  aria-label={`Remover ${nomePorSlug(slug)}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
      <SeletorCategoriasServico
        aberto={aberto}
        onFechar={() => setAberto(false)}
        selecionadas={selecionadas}
        onConfirmar={onChange}
        limite={10}
      />
    </div>
  );
}

interface DialogoOnboardingProfissionalProps {
  aberto: boolean;
  driverId: string;
  tenantId: string;
  dadosIniciais: DadosOnboardingProfissional | null;
  onConcluido: () => void;
  onFechar?: () => void;
}

const TOTAL_PASSOS = 4;

interface FormState {
  full_name: string;
  phone: string;
  cidade: string;
  professional_type: "driver" | "service_provider" | "both" | "";
  bio: string;
  service_categories: string[];
  avatar_url: string;
  cover_url: string;
}

export function DialogoOnboardingProfissional({
  aberto,
  driverId,
  tenantId,
  dadosIniciais,
  onConcluido,
  onFechar,
}: DialogoOnboardingProfissionalProps) {
  const [passo, setPasso] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState("");
  const [form, setForm] = useState<FormState>(montarFormInicial(dadosIniciais));

  useEffect(() => {
    if (aberto) {
      setForm(montarFormInicial(dadosIniciais));
      setPasso(0);
      setNovaCategoria("");
    }
  }, [aberto, dadosIniciais]);

  const { status: statusAutoSave } = useHookAutoSaveOnboarding({
    driverId,
    tenantId,
    dados: form,
    ativo: aberto,
  });

  const atualizar = <K extends keyof FormState>(campo: K, valor: FormState[K]) =>
    setForm((prev) => ({ ...prev, [campo]: valor }));

  const adicionarCategoria = () => {
    const valor = novaCategoria.trim();
    if (!valor) return;
    if (valor.length > 50) {
      toast.error("Categoria muito longa");
      return;
    }
    if (form.service_categories.some((c) => c.toLowerCase() === valor.toLowerCase())) {
      toast.error("Categoria já adicionada");
      return;
    }
    if (form.service_categories.length >= 10) {
      toast.error("Máximo de 10 categorias");
      return;
    }
    atualizar("service_categories", [...form.service_categories, valor]);
    setNovaCategoria("");
  };

  const removerCategoria = (cat: string) => {
    atualizar(
      "service_categories",
      form.service_categories.filter((c) => c !== cat),
    );
  };

  const validarPassoAtual = (): boolean => {
    try {
      if (passo === 0) {
        z.object({
          full_name: schemaOnboardingProfissional.shape.full_name,
          phone: schemaOnboardingProfissional.shape.phone,
          cidade: schemaOnboardingProfissional.shape.cidade,
        }).parse({
          full_name: form.full_name,
          phone: form.phone,
          cidade: form.cidade,
        });
      } else if (passo === 1) {
        z.object({
          professional_type: schemaOnboardingProfissional.shape.professional_type,
          service_categories: schemaOnboardingProfissional.shape.service_categories,
        }).parse({
          professional_type: form.professional_type,
          service_categories: form.service_categories,
        });
      } else if (passo === 2) {
        z.object({
          bio: schemaOnboardingProfissional.shape.bio,
        }).parse({ bio: form.bio });
      } else if (passo === 3) {
        z.object({
          avatar_url: schemaOnboardingProfissional.shape.avatar_url,
          cover_url: schemaOnboardingProfissional.shape.cover_url,
        }).parse({
          avatar_url: form.avatar_url,
          cover_url: form.cover_url,
        });
      }
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0]?.message ?? "Preencha os campos");
      }
      return false;
    }
  };

  const avancar = () => {
    if (!validarPassoAtual()) return;
    if (passo < TOTAL_PASSOS - 1) {
      setPasso(passo + 1);
    } else {
      concluir();
    }
  };

  const voltar = () => {
    if (passo > 0) setPasso(passo - 1);
  };

  const concluir = async () => {
    let dadosValidados: DadosOnboarding;
    try {
      dadosValidados = schemaOnboardingProfissional.parse(form);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0]?.message ?? "Preencha todos os campos");
      }
      return;
    }

    setSalvando(true);
    try {
      await salvarOnboardingProfissional(driverId, tenantId, dadosValidados);
      toast.success("Cadastro concluído");
      onConcluido();
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : "Erro ao salvar";
      toast.error(mensagem);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog
      open={aberto}
      onOpenChange={(open) => {
        if (!open && onFechar) onFechar();
      }}
    >
      <DialogContent
        className="max-w-md max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Complete seu perfil profissional</DialogTitle>
          <DialogDescription>
            Esses dados aparecem no seu link público e são obrigatórios para
            ativar categorias, portfólio e equipe.
          </DialogDescription>
        </DialogHeader>

        <BarraProgresso passoAtual={passo} total={TOTAL_PASSOS} />
        <div className="flex justify-end">
          <IndicadorAutoSave status={statusAutoSave} />
        </div>

        <div className="py-2">
          {passo === 0 && (
            <PassoDadosBasicos form={form} onChange={atualizar} />
          )}
          {passo === 1 && (
            <PassoTipoCategorias
              form={form}
              onChange={atualizar}
              novaCategoria={novaCategoria}
              setNovaCategoria={setNovaCategoria}
              onAdicionar={adicionarCategoria}
              onRemover={removerCategoria}
            />
          )}
          {passo === 2 && <PassoBio form={form} onChange={atualizar} />}
          {passo === 3 && (
            <PassoImagens form={form} driverId={driverId} onChange={atualizar} />
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={voltar}
            disabled={passo === 0 || salvando}
            className="h-10"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar
          </Button>

          <Button
            type="button"
            onClick={avancar}
            disabled={salvando}
            className="h-10 min-w-[120px]"
          >
            {salvando ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : passo === TOTAL_PASSOS - 1 ? (
              <>
                <Check className="w-4 h-4 mr-1" />
                Concluir
              </>
            ) : (
              <>
                Avançar
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// =====================================
// SUBCOMPONENTES
// =====================================

interface PropsPasso {
  form: FormState;
  onChange: <K extends keyof FormState>(campo: K, valor: FormState[K]) => void;
}

function BarraProgresso({
  passoAtual,
  total,
}: {
  passoAtual: number;
  total: number;
}) {
  const progresso = useMemo(
    () => Math.round(((passoAtual + 1) / total) * 100),
    [passoAtual, total],
  );
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          Passo {passoAtual + 1} de {total}
        </span>
        <span>{progresso}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${progresso}%` }}
        />
      </div>
    </div>
  );
}

function PassoDadosBasicos({ form, onChange }: PropsPasso) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">Nome completo</Label>
        <Input
          id="full_name"
          value={form.full_name}
          onChange={(e) => onChange("full_name", e.target.value)}
          placeholder="Como você quer ser chamado"
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">WhatsApp</Label>
        <Input
          id="phone"
          value={form.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          placeholder="(11) 99999-9999"
          maxLength={20}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cidade">Cidade onde atende</Label>
        <Input
          id="cidade"
          value={form.cidade}
          onChange={(e) => onChange("cidade", e.target.value)}
          placeholder="Ex: São Paulo"
          maxLength={80}
        />
      </div>
    </div>
  );
}

interface PropsPassoCategorias extends PropsPasso {
  novaCategoria: string;
  setNovaCategoria: (v: string) => void;
  onAdicionar: () => void;
  onRemover: (cat: string) => void;
}

function PassoTipoCategorias({
  form,
  onChange,
  novaCategoria,
  setNovaCategoria,
  onAdicionar,
  onRemover,
}: PropsPassoCategorias) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Tipo de profissional</Label>
        <Select
          value={form.professional_type}
          onValueChange={(v) =>
            onChange("professional_type", v as FormState["professional_type"])
          }
        >
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="driver">Somente motorista</SelectItem>
            <SelectItem value="service_provider">Prestador de serviços</SelectItem>
            <SelectItem value="both">Ambos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Categorias de serviço</Label>
        <p className="text-[11px] text-muted-foreground">
          Selecione até 10. Aparecem como filtros no seu perfil público.
        </p>
        <SeletorCategoriasServicoInline
          selecionadas={form.service_categories}
          onChange={(lista) => onChange("service_categories", lista)}
        />
      </div>
    </div>
  );
}

function PassoBio({ form, onChange }: PropsPasso) {
  return (
    <div className="space-y-2">
      <Label htmlFor="bio">Bio profissional</Label>
      <p className="text-[11px] text-muted-foreground">
        Conte rapidamente sobre seu trabalho, experiência e diferenciais.
      </p>
      <Textarea
        id="bio"
        value={form.bio}
        onChange={(e) => onChange("bio", e.target.value)}
        placeholder="Ex: Profissional com 5 anos de experiência em estética automotiva…"
        maxLength={500}
        rows={6}
      />
      <p className="text-right text-[11px] text-muted-foreground">
        {form.bio.length}/500
      </p>
    </div>
  );
}

function PassoImagens({
  form,
  driverId,
  onChange,
}: PropsPasso & { driverId: string }) {
  return (
    <div className="space-y-5">
      <CampoUploadImagem
        driverId={driverId}
        tipo="avatar"
        valor={form.avatar_url || null}
        onChange={(url) => onChange("avatar_url", url)}
        label="Foto de perfil"
        descricao="Quadrada. Aparece em todos os pontos do seu link público."
      />
      <CampoUploadImagem
        driverId={driverId}
        tipo="cover"
        valor={form.cover_url || null}
        onChange={(url) => onChange("cover_url", url)}
        label="Foto de capa"
        descricao="Aparece no topo do seu perfil. Use 16:9."
      />
    </div>
  );
}

function montarFormInicial(
  dados: DadosOnboardingProfissional | null,
): FormState {
  if (!dados) {
    return {
      full_name: "",
      phone: "",
      cidade: "",
      professional_type: "",
      bio: "",
      service_categories: [],
      avatar_url: "",
      cover_url: "",
    };
  }
  const tipo = dados.professional_type;
  return {
    full_name: dados.full_name ?? "",
    phone: dados.phone ?? "",
    cidade: dados.cidade ?? "",
    professional_type:
      tipo === "driver" || tipo === "service_provider" || tipo === "both"
        ? tipo
        : "",
    bio: dados.bio ?? "",
    service_categories: dados.service_categories ?? [],
    avatar_url: dados.avatar_url ?? "",
    cover_url: dados.cover_url ?? "",
  };
}
