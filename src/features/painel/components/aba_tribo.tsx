import { useState } from "react";
import {
  LayoutDashboard,
  Car,
  Users,
  UserCheck,
  Route,
  Wallet,
  Palette,
  Settings,
  Percent,
  type LucideIcon,
} from "lucide-react";
import { SecaoDashboard } from "@/features/admin/components/secao_dashboard";
import { SecaoMotoristas } from "@/features/admin/components/secao_motoristas";
import { SecaoAfiliados } from "@/features/admin/components/secao_afiliados";
import { SecaoCRM } from "@/features/admin/components/secao_crm";
import { SecaoCorridas } from "@/features/admin/components/secao_corridas";
import { SecaoCarteira } from "@/features/admin/components/secao_carteira";
import { SecaoIdentidade } from "@/features/admin/components/secao_identidade";
import { SecaoRegras } from "@/features/admin/components/secao_regras";
import { SecaoComissoes } from "@/features/admin/components/secao_comissoes";
import type { SecaoAdmin } from "@/features/admin/types/tipos_admin";
import type { TriboMotorista } from "../types/tipos_tribos";

interface AbaTriboProps {
  tribo: TriboMotorista;
}

const SECOES: Record<SecaoAdmin, () => JSX.Element> = {
  dashboard: SecaoDashboard,
  motoristas: SecaoMotoristas,
  afiliados: SecaoAfiliados,
  crm: SecaoCRM,
  corridas: SecaoCorridas,
  carteira: SecaoCarteira,
  identidade: SecaoIdentidade,
  regras: SecaoRegras,
  comissoes: SecaoComissoes,
};

const SUB_ABAS: { id: SecaoAdmin; label: string; icone: LucideIcon }[] = [
  { id: "dashboard", label: "Visão", icone: LayoutDashboard },
  { id: "motoristas", label: "Motoristas", icone: Car },
  { id: "afiliados", label: "Afiliados", icone: Users },
  { id: "crm", label: "CRM", icone: UserCheck },
  { id: "corridas", label: "Corridas", icone: Route },
  { id: "carteira", label: "Carteira", icone: Wallet },
  { id: "identidade", label: "Visual", icone: Palette },
  { id: "regras", label: "Regras", icone: Settings },
  { id: "comissoes", label: "Comissões", icone: Percent },
];

export function AbaTribo({ tribo }: AbaTriboProps) {
  const [secao, setSecao] = useState<SecaoAdmin>("dashboard");

  if (tribo.papel !== "dono") {
    return (
      <div className="px-5 pt-12 pb-20 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{tribo.nome}</h2>
          <p className="text-xs text-muted-foreground">Você é membro deste grupo</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
          Apenas o dono do grupo pode gerenciar motoristas, afiliados, regras e comissões.
          Você recebe corridas e comissões deste grupo na sua aba <strong className="text-foreground">Início</strong> e{" "}
          <strong className="text-foreground">Carteira</strong>.
        </div>
      </div>
    );
  }

  const Conteudo = SECOES[secao];

  return (
    <div className="pb-20">
      <div className="px-5 pt-12 pb-3 space-y-2 border-b border-border">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Gerir tribo</p>
        <h2 className="text-lg font-semibold text-foreground truncate">{tribo.nome}</h2>
      </div>

      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex gap-1 overflow-x-auto px-3 py-2 scrollbar-none">
          {SUB_ABAS.map(({ id, label, icone: Icone }) => {
            const ativo = secao === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSecao(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                  ativo
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "text-muted-foreground border border-transparent hover:text-foreground"
                }`}
              >
                <Icone className="w-3.5 h-3.5" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-3">
        <Conteudo />
      </div>
    </div>
  );
}
