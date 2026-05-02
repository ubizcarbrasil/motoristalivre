import * as Icons from "lucide-react";
import { Home, Link2, Wallet, User, Settings, Crown, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import type { AbaPainel } from "../types/tipos_painel";
import { abaPermitida } from "../utils/abas_por_modulo";
import type { ModoPainel } from "../utils/modo_painel";
import { useConfigMenuOrcamento } from "../hooks/hook_config_menu_orcamento";

interface NavegacaoInferiorProps {
  abaAtiva: AbaPainel;
  onMudar: (aba: AbaPainel) => void;
  mostrarTribo?: boolean;
  modoSomenteDono?: boolean;
  activeModules?: string[];
  modo?: ModoPainel;
  tenantSlug?: string | null;
}

type ItemNav =
  | { id: AbaPainel; label: string; icone: LucideIcon; tipo?: "aba" }
  | {
      id: string;
      label: string;
      icone: LucideIcon;
      tipo: "rota";
      rota: string;
      cor?: string | null;
    };

const ITEM_TRIBO: ItemNav = { id: "tribo" as AbaPainel, label: "Tribo", icone: Crown };

const ITENS_BASE: ItemNav[] = [
  { id: "inicio" as AbaPainel, label: "Início", icone: Home },
  { id: "meus_links" as AbaPainel, label: "Links", icone: Link2 },
  { id: "carteira" as AbaPainel, label: "Carteira", icone: Wallet },
  { id: "perfil" as AbaPainel, label: "Perfil", icone: User },
  { id: "configuracoes" as AbaPainel, label: "Config", icone: Settings },
];

const ITENS_SOMENTE_DONO: ItemNav[] = [
  { id: "tribo" as AbaPainel, label: "Tribo", icone: Crown },
  { id: "carteira" as AbaPainel, label: "Carteira", icone: Wallet },
  { id: "configuracoes" as AbaPainel, label: "Config", icone: Settings },
];

function resolverIcone(nome: string): LucideIcon {
  const candidato = (Icons as unknown as Record<string, LucideIcon>)[nome];
  return candidato ?? FileText;
}

export function NavegacaoInferior({
  abaAtiva,
  onMudar,
  mostrarTribo = false,
  modoSomenteDono = false,
  activeModules,
  modo,
  tenantSlug,
}: NavegacaoInferiorProps) {
  const navigate = useNavigate();
  const cfgOrcamento = useConfigMenuOrcamento(tenantSlug);

  const itemOrcamento: ItemNav = {
    id: "orcamento_novo",
    label: cfgOrcamento.label,
    icone: resolverIcone(cfgOrcamento.icon),
    tipo: "rota",
    rota: "/orcamento/novo",
    cor: cfgOrcamento.color,
  };

  let itensBrutos: ItemNav[] = modoSomenteDono
    ? ITENS_SOMENTE_DONO
    : mostrarTribo
      ? [ITENS_BASE[0], ITEM_TRIBO, ...ITENS_BASE.slice(1)]
      : ITENS_BASE;

  // Em modo serviços, troca "Links" (mobility) por "Orçamento" customizável
  if (modo === "servicos" && !modoSomenteDono && cfgOrcamento.enabled) {
    itensBrutos = itensBrutos.map((i) => (i.id === "meus_links" ? itemOrcamento : i));
  }

  const itens = itensBrutos.filter((i) =>
    i.tipo === "rota" ? true : abaPermitida(i.id as AbaPainel, activeModules),
  );

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around h-14">
        {itens.map((item) => {
          const Icone = item.icone;
          const ativo = item.tipo !== "rota" && abaAtiva === item.id;
          const onClick = () =>
            item.tipo === "rota" ? navigate(item.rota) : onMudar(item.id as AbaPainel);
          const corCustom = item.tipo === "rota" ? item.cor : null;
          const style = corCustom ? { color: corCustom } : undefined;
          return (
            <button
              key={item.id}
              type="button"
              onClick={onClick}
              style={style}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-colors ${
                ativo
                  ? "text-primary"
                  : corCustom
                    ? ""
                    : "text-muted-foreground"
              }`}
            >
              <Icone className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
