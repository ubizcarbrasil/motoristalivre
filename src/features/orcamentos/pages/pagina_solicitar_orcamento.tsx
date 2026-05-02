import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ContextoAutenticacao } from "@/features/autenticacao/contexts/contexto_autenticacao";
import { ContextoTenant } from "@/features/tenant/contexts/contexto_tenant";
import {
  buscarTemplatePorCategoria,
  listarCategoriasAtivas,
} from "../services/servico_templates_orcamento";
import { criarPedidoOrcamento } from "../services/servico_orcamentos";
import type {
  CategoriaServico,
  ContatoOrcamento,
  RespostasOrcamento,
  TemplateOrcamento,
  UrgenciaOrcamento,
} from "../types/tipos_orcamento";
import type { EnderecoAtendimento } from "@/features/servicos/types/tipos_servicos";
import { PassoCategoria } from "../components/passo_categoria";
import { PassoPerguntas } from "../components/passo_perguntas";
import { PassoLocalData } from "../components/passo_local_data";
import { PassoContato } from "../components/passo_contato";
import { PassoResumo } from "../components/passo_resumo";
import { schemaContato, schemaEndereco } from "../schemas/schema_orcamento";
import { validarRespostasObrigatorias } from "../utils/utilitario_renderer_pergunta";
import {
  carregarRascunho,
  limparRascunho,
  useAutoSalvarRascunho,
} from "../hooks/hook_rascunho_orcamento";
import { BannerRascunho } from "../components/banner_rascunho";

type Passo = 1 | 2 | 3 | 4 | 5;

export default function PaginaSolicitarOrcamento() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { usuario } = useContext(ContextoAutenticacao);
  const { tenant } = useContext(ContextoTenant);

  const [categorias, setCategorias] = useState<CategoriaServico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [categoriaId, setCategoriaId] = useState<string | null>(params.get("categoria"));
  const [template, setTemplate] = useState<TemplateOrcamento | null>(null);
  const [carregandoTpl, setCarregandoTpl] = useState(false);

  const [respostas, setRespostas] = useState<RespostasOrcamento>({});
  const [endereco, setEndereco] = useState<EnderecoAtendimento>({});
  const [urgencia, setUrgencia] = useState<UrgenciaOrcamento>("esta_semana");
  const [dataDesejada, setDataDesejada] = useState<string | null>(null);
  const [contato, setContato] = useState<ContatoOrcamento>({ nome: "", whatsapp: "" });
  const [maxPropostas, setMaxPropostas] = useState(4);
  const [observacao, setObservacao] = useState("");
  const [passo, setPasso] = useState<Passo>(1);
  const [enviando, setEnviando] = useState(false);
  const [rascunhoEm, setRascunhoEm] = useState<number | null>(null);
  const [bannerVisivel, setBannerVisivel] = useState(false);
  const [hidratado, setHidratado] = useState(false);

  // Carrega rascunho ao montar
  useEffect(() => {
    const r = carregarRascunho(tenant?.id);
    if (r) {
      setRascunhoEm(r.atualizadoEm);
      setBannerVisivel(true);
    }
    setHidratado(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant?.id]);

  const continuarRascunho = () => {
    const r = carregarRascunho(tenant?.id);
    if (!r) return;
    setCategoriaId(r.categoriaId);
    setRespostas(r.respostas ?? {});
    setEndereco(r.endereco ?? {});
    setUrgencia(r.urgencia ?? "esta_semana");
    setDataDesejada(r.dataDesejada ?? null);
    setContato(r.contato ?? { nome: "", whatsapp: "" });
    setMaxPropostas(r.maxPropostas ?? 4);
    setObservacao(r.observacao ?? "");
    setPasso(((Math.min(5, Math.max(1, r.passo ?? 1))) as Passo));
    setBannerVisivel(false);
  };

  const descartarRascunho = () => {
    limparRascunho(tenant?.id);
    setBannerVisivel(false);
    setRascunhoEm(null);
  };

  // Auto-salva rascunho a cada alteração (após hidratado e fora do banner)
  useAutoSalvarRascunho({
    tenantId: tenant?.id,
    habilitado: hidratado && !bannerVisivel,
    dados: {
      categoriaId,
      respostas,
      endereco,
      urgencia,
      dataDesejada,
      contato,
      maxPropostas,
      observacao,
      passo,
    },
  });

  useEffect(() => {
    listarCategoriasAtivas()
      .then(setCategorias)
      .catch(() => toast.error("Não foi possível carregar categorias"))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    if (!categoriaId) return;
    setCarregandoTpl(true);
    buscarTemplatePorCategoria(categoriaId)
      .then((tpl) => {
        setTemplate(tpl);
        if (tpl) setRespostas({});
      })
      .catch(() => toast.error("Não foi possível carregar o formulário"))
      .finally(() => setCarregandoTpl(false));
  }, [categoriaId]);

  const categoria = useMemo(
    () => categorias.find((c) => c.id === categoriaId) ?? null,
    [categorias, categoriaId],
  );

  const podeAvancar = (): boolean => {
    if (passo === 1) return !!categoriaId;
    if (passo === 2 && template) {
      const v = validarRespostasObrigatorias(template.perguntas, respostas);
      if (!v.ok) {
        toast.error(`Responda: ${v.faltando[0]}`);
        return false;
      }
      return true;
    }
    if (passo === 3) {
      const r = schemaEndereco.safeParse(endereco);
      if (!r.success) {
        toast.error(r.error.issues[0]?.message ?? "Endereço incompleto");
        return false;
      }
      if (urgencia === "data_marcada" && !dataDesejada) {
        toast.error("Escolha a data desejada");
        return false;
      }
      return true;
    }
    if (passo === 4) {
      const r = schemaContato.safeParse(contato);
      if (!r.success) {
        toast.error(r.error.issues[0]?.message ?? "Contato inválido");
        return false;
      }
      return true;
    }
    return true;
  };

  const avancar = () => {
    if (!podeAvancar()) return;
    setPasso((p) => (Math.min(5, p + 1) as Passo));
  };
  const voltar = () => {
    if (passo === 1) {
      navigate(-1);
      return;
    }
    setPasso((p) => (Math.max(1, p - 1) as Passo));
  };

  const enviar = async () => {
    if (!template || !categoriaId || !tenant?.id) {
      toast.error("Faltam dados para enviar");
      return;
    }
    setEnviando(true);
    try {
      const resp = await criarPedidoOrcamento({
        tenant_id: tenant.id,
        category_id: categoriaId,
        template_id: template.id,
        perguntas_snapshot: template.perguntas,
        respostas,
        endereco: endereco as Required<EnderecoAtendimento>,
        urgencia,
        data_desejada: dataDesejada,
        max_propostas: maxPropostas,
        observacao: observacao || null,
        contato,
      });
      toast.success("Pedido enviado! Aguarde as propostas.");
      navigate(`/orcamento/${resp.id}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao enviar";
      toast.error(msg);
    } finally {
      setEnviando(false);
    }
  };

  if (carregando) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={voltar} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Passo {passo} de 5</p>
            <div className="h-1 bg-card rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(passo / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        {passo === 1 && (
          <PassoCategoria
            categorias={categorias}
            selecionada={categoriaId}
            onSelecionar={setCategoriaId}
          />
        )}
        {passo === 2 && (
          <>
            {carregandoTpl && (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            )}
            {!carregandoTpl && !template && (
              <p className="text-sm text-muted-foreground text-center py-10">
                Esta categoria ainda não tem formulário de orçamento.
              </p>
            )}
            {!carregandoTpl && template && (
              <PassoPerguntas
                perguntas={template.perguntas}
                respostas={respostas}
                onChange={setRespostas}
              />
            )}
          </>
        )}
        {passo === 3 && (
          <PassoLocalData
            endereco={endereco}
            onEnderecoChange={setEndereco}
            urgencia={urgencia}
            onUrgenciaChange={setUrgencia}
            dataDesejada={dataDesejada}
            onDataDesejadaChange={setDataDesejada}
          />
        )}
        {passo === 4 && (
          <PassoContato
            contato={contato}
            onContatoChange={setContato}
            maxPropostas={maxPropostas}
            onMaxPropostasChange={setMaxPropostas}
            observacao={observacao}
            onObservacaoChange={setObservacao}
          />
        )}
        {passo === 5 && template && (
          <PassoResumo
            categoria={categoria}
            perguntas={template.perguntas}
            respostas={respostas}
            endereco={endereco as Required<EnderecoAtendimento>}
            urgencia={urgencia}
            contato={contato}
            maxPropostas={maxPropostas}
            enviando={enviando}
            onEnviar={enviar}
          />
        )}
      </main>

      {passo < 5 && (
        <div className="fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur border-t border-border p-4">
          <div className="max-w-md mx-auto">
            <Button onClick={avancar} className="w-full h-12 text-base font-semibold">
              Continuar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
