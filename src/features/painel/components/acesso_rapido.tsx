import { Share2, Users, DollarSign, Car, Download, Calendar, Sparkles, Briefcase, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AbaPainel } from "../types/tipos_painel";
import type { ModoPainel } from "../utils/modo_painel";
import { useConfigMenuOrcamento } from "../hooks/hook_config_menu_orcamento";

interface AcessoRapidoProps {
  onNavegar: (aba: AbaPainel) => void;
  tenantSlug: string;
  modo: ModoPainel;
  driverSlug?: string;
}

function resolverIcone(nome: string): LucideIcon {
  const candidato = (Icons as unknown as Record<string, LucideIcon>)[nome];
  return candidato ?? FileText;
}

export function AcessoRapido({ onNavegar, tenantSlug, modo, driverSlug }: AcessoRapidoProps) {
  const navigate = useNavigate();
  const cfgOrcamento = useConfigMenuOrcamento(tenantSlug);

  const itemOrcamento = {
    label: cfgOrcamento.label,
    icone: resolverIcone(cfgOrcamento.icon),
    destaque: true,
    cor: cfgOrcamento.color,
    onClick: () => navigate("/orcamento/novo"),
  };

  const itens =
    modo === "servicos"
      ? [
          itemOrcamento,
          {
            label: "Minha vitrine",
            icone: Sparkles,
            onClick: () =>
              driverSlug ? navigate(`/s/${tenantSlug}/${driverSlug}`) : onNavegar("configuracoes"),
          },
          { label: "Serviços", icone: Briefcase, onClick: () => onNavegar("configuracoes") },
          { label: "Agenda", icone: Calendar, onClick: () => onNavegar("configuracoes") },
          { label: "Tribo", icone: Users, onClick: () => onNavegar("configuracoes") },
          { label: "Instalar app", icone: Download, onClick: () => navigate("/instalar") },
        ]
      : [
          itemOrcamento,
          {
            label: "Solicitar corrida",
            icone: Car,
            onClick: () => navigate(`/${tenantSlug}`),
          },
          { label: "Preços", icone: DollarSign, onClick: () => onNavegar("configuracoes") },
          { label: "Meus Links", icone: Share2, onClick: () => onNavegar("meus_links") },
          { label: "Grupos", icone: Users, onClick: () => onNavegar("configuracoes") },
          { label: "Instalar app", icone: Download, onClick: () => navigate("/instalar") },
        ];

  return (
    <div className="flex gap-3 px-5 overflow-x-auto pb-1 scrollbar-none">
      {itens.map((item) => {
        const destaque = (item as any).destaque;
        const cor = (item as any).cor as string | null | undefined;
        const styleBtn =
          destaque && cor ? { borderColor: cor, backgroundColor: `${cor}1a` } : undefined;
        const styleCor = destaque && cor ? { color: cor } : undefined;
        return (
          <button
            key={item.label}
            type="button"
            onClick={item.onClick}
            style={styleBtn}
            className={`flex flex-col items-center gap-1.5 min-w-[68px] py-2 px-3 rounded-xl border transition-colors ${
              destaque
                ? cor
                  ? ""
                  : "bg-primary/10 border-primary/40 hover:border-primary"
                : "bg-card border-border hover:border-primary/30"
            }`}
          >
            <item.icone
              style={styleCor}
              className={`w-4 h-4 ${
                destaque ? (cor ? "" : "text-primary") : "text-muted-foreground"
              }`}
            />
            <span
              style={styleCor}
              className={`text-[10px] whitespace-nowrap ${
                destaque
                  ? cor
                    ? "font-medium"
                    : "text-primary font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
