import { Home, Link2, Wallet, User, Settings, Crown } from "lucide-react";
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

const ITEM_TRIBO = { id: "tribo" as AbaPainel, label: "Tribo", icone: Crown };
const ITENS_BASE: { id: AbaPainel; label: string; icone: typeof Home }[] = [
  { id: "inicio", label: "Início", icone: Home },
  { id: "meus_links", label: "Links", icone: Link2 },
  { id: "carteira", label: "Carteira", icone: Wallet },
  { id: "perfil", label: "Perfil", icone: User },
  { id: "configuracoes", label: "Config", icone: Settings },
];

const ITENS_SOMENTE_DONO: { id: AbaPainel; label: string; icone: typeof Home }[] = [
  { id: "tribo", label: "Tribo", icone: Crown },
  { id: "carteira", label: "Carteira", icone: Wallet },
  { id: "configuracoes", label: "Config", icone: Settings },
];

export function NavegacaoInferior({
  abaAtiva,
  onMudar,
  mostrarTribo = false,
  modoSomenteDono = false,
  activeModules,
}: NavegacaoInferiorProps) {
  const itensBrutos = modoSomenteDono
    ? ITENS_SOMENTE_DONO
    : mostrarTribo
      ? [ITENS_BASE[0], ITEM_TRIBO, ...ITENS_BASE.slice(1)]
      : ITENS_BASE;

  const itens = itensBrutos.filter((i) => abaPermitida(i.id, activeModules));

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around h-14">
        {itens.map(({ id, label, icone: Icone }) => {
          const ativo = abaAtiva === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onMudar(id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 transition-colors ${
                ativo ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icone className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
