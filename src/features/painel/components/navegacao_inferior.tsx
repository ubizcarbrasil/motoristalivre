import { Home, Link2, Wallet, User, Settings, Crown, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { AbaPainel } from "../types/tipos_painel";
import { abaPermitida } from "../utils/abas_por_modulo";
import type { ModoPainel } from "../utils/modo_painel";

interface NavegacaoInferiorProps {
  abaAtiva: AbaPainel;
  onMudar: (aba: AbaPainel) => void;
  mostrarTribo?: boolean;
  modoSomenteDono?: boolean;
  activeModules?: string[];
  modo?: ModoPainel;
}

type ItemNav =
  | { id: AbaPainel; label: string; icone: typeof Home; tipo?: "aba" }
  | { id: string; label: string; icone: typeof Home; tipo: "rota"; rota: string };

const ITEM_TRIBO: ItemNav = { id: "tribo" as AbaPainel, label: "Tribo", icone: Crown };
const ITEM_ORCAMENTO: ItemNav = {
  id: "orcamento_novo",
  label: "Orçamento",
  icone: FileText,
  tipo: "rota",
  rota: "/orcamento/novo",
};

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

export function NavegacaoInferior({
  abaAtiva,
  onMudar,
  mostrarTribo = false,
  modoSomenteDono = false,
  activeModules,
  modo,
}: NavegacaoInferiorProps) {
  const navigate = useNavigate();

  let itensBrutos: ItemNav[] = modoSomenteDono
    ? ITENS_SOMENTE_DONO
    : mostrarTribo
      ? [ITENS_BASE[0], ITEM_TRIBO, ...ITENS_BASE.slice(1)]
      : ITENS_BASE;

  // Em modo serviços, troca "Links" (mobility) por "Orçamento"
  if (modo === "servicos" && !modoSomenteDono) {
    itensBrutos = itensBrutos.map((i) =>
      i.id === "meus_links" ? ITEM_ORCAMENTO : i,
    );
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
          return (
            <button
              key={item.id}
              type="button"
              onClick={onClick}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-colors ${
                ativo ? "text-primary" : "text-muted-foreground"
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
