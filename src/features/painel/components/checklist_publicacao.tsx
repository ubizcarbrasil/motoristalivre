import { useEffect, useState } from "react";
import { Check, Circle, ChevronRight, ListChecks } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  driverId: string;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  serviceCategories: string[];
  onIrParaServicos?: () => void;
  onIrParaPortfolio?: () => void;
  onIrParaPerfil?: () => void;
}

interface ItemChecklist {
  chave: string;
  label: string;
  descricao?: string;
  feito: boolean;
  acao?: () => void;
}

/**
 * Checklist de publicação do profissional.
 * Mostra de forma explícita o que ainda falta para a vitrine pública
 * ficar completa e contratável (serviços com preço, portfólio, etc).
 */
export function ChecklistPublicacao({
  driverId,
  bio,
  avatarUrl,
  coverUrl,
  serviceCategories,
  onIrParaServicos,
  onIrParaPortfolio,
  onIrParaPerfil,
}: Props) {
  const [totalServicos, setTotalServicos] = useState(0);
  const [totalPortfolio, setTotalPortfolio] = useState(0);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      setCarregando(true);
      const [{ count: cs }, { count: cp }] = await Promise.all([
        supabase
          .from("service_types" as any)
          .select("id", { count: "exact", head: true })
          .eq("driver_id", driverId)
          .eq("is_active", true),
        supabase
          .from("service_portfolio_items" as any)
          .select("id", { count: "exact", head: true })
          .eq("driver_id", driverId),
      ]);
      if (!ativo) return;
      setTotalServicos(cs ?? 0);
      setTotalPortfolio(cp ?? 0);
      setCarregando(false);
    }
    carregar();

    const canal = supabase
      .channel(`checklist_${driverId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "service_types", filter: `driver_id=eq.${driverId}` },
        carregar,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "service_portfolio_items", filter: `driver_id=eq.${driverId}` },
        carregar,
      )
      .subscribe();

    return () => {
      ativo = false;
      supabase.removeChannel(canal);
    };
  }, [driverId]);

  const itens: ItemChecklist[] = [
    {
      chave: "perfil",
      label: "Perfil preenchido",
      descricao: "Foto, capa e bio configurados",
      feito: !!avatarUrl && !!coverUrl && !!bio && bio.trim().length > 0,
      acao: onIrParaPerfil,
    },
    {
      chave: "especialidades",
      label: "Especialidades selecionadas",
      descricao: `${serviceCategories.length} especialidade${serviceCategories.length === 1 ? "" : "s"}`,
      feito: serviceCategories.length > 0,
      acao: onIrParaPerfil,
    },
    {
      chave: "servicos",
      label: "Serviços com preço cadastrados",
      descricao:
        totalServicos > 0
          ? `${totalServicos} serviço${totalServicos === 1 ? "" : "s"} ativo${totalServicos === 1 ? "" : "s"}`
          : "Necessário para que clientes possam agendar",
      feito: totalServicos > 0,
      acao: onIrParaServicos,
    },
    {
      chave: "portfolio",
      label: "Pelo menos 1 foto no portfólio",
      descricao:
        totalPortfolio > 0
          ? `${totalPortfolio} foto${totalPortfolio === 1 ? "" : "s"} publicada${totalPortfolio === 1 ? "" : "s"}`
          : "Aumenta muito a chance de ser contratado",
      feito: totalPortfolio > 0,
      acao: onIrParaPortfolio,
    },
  ];

  const concluidos = itens.filter((i) => i.feito).length;
  const total = itens.length;
  const progresso = (concluidos / total) * 100;
  const tudoPronto = concluidos === total;

  if (carregando) {
    return (
      <div className="rounded-xl bg-card border border-border p-4 animate-pulse">
        <div className="h-3 w-32 bg-secondary rounded mb-3" />
        <div className="h-2 w-full bg-secondary rounded" />
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card border border-border p-4 space-y-3">
      <div className="flex items-center gap-2">
        <ListChecks className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">
          {tudoPronto ? "Vitrine publicada" : "Falta pouco para publicar sua vitrine"}
        </h3>
        <span className="ml-auto text-[11px] text-muted-foreground">
          {concluidos}/{total}
        </span>
      </div>

      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${progresso}%` }}
        />
      </div>

      <ul className="space-y-1.5">
        {itens.map((item) => {
          const Icone = item.feito ? Check : Circle;
          return (
            <li key={item.chave}>
              <button
                type="button"
                onClick={item.acao}
                disabled={!item.acao}
                className={`w-full flex items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors ${
                  item.acao && !item.feito ? "hover:bg-secondary/50" : ""
                } disabled:cursor-default`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full shrink-0 ${
                    item.feito
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-muted-foreground"
                  }`}
                >
                  <Icone className="w-3 h-3" />
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-medium ${
                      item.feito ? "text-muted-foreground line-through" : "text-foreground"
                    }`}
                  >
                    {item.label}
                  </p>
                  {item.descricao && (
                    <p className="text-[10px] text-muted-foreground truncate">{item.descricao}</p>
                  )}
                </div>
                {item.acao && !item.feito && (
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
