import { Home, Link2, Wallet, User, Settings, Crown } from "lucide-react";
import type { AbaPainel } from "../types/tipos_painel";

interface NavegacaoInferiorProps {
  abaAtiva: AbaPainel;
  onMudar: (aba: AbaPainel) => void;
  mostrarTribo?: boolean;
}

const ITEM_TRIBO = { id: "tribo" as AbaPainel, label: "Tribo", icone: Crown };
const ITENS_BASE: { id: AbaPainel; label: string; icone: typeof Home }[] = [
  { id: "inicio", label: "Início", icone: Home },
  { id: "meus_links", label: "Links", icone: Link2 },
  { id: "carteira", label: "Carteira", icone: Wallet },
  { id: "perfil", label: "Perfil", icone: User },
  { id: "configuracoes", label: "Config", icone: Settings },
];

export function NavegacaoInferior({ abaAtiva, onMudar }: NavegacaoInferiorProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border">
      <div className="flex items-center justify-around h-14">
        {ITENS.map(({ id, label, icone: Icone }) => {
          const ativo = abaAtiva === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onMudar(id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 transition-colors ${
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
