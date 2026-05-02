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
  Briefcase,
  Calendar,
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
import type { TipoProfissional } from "@/features/servicos/types/tipos_servicos";
import { CardAtivarMotorista } from "./card_ativar_motorista";
import { resolverModoPainel, type ModoPainel } from "../utils/modo_painel";

interface AbaTriboProps {
  tribo: TriboMotorista;
  semPerfilDriver?: boolean;
  onAtivarMotorista?: () => void;
  /** Tipo profissional do usuário logado. Quando é service_provider, força modo serviços
   *  mesmo que a tribo ainda tenha o módulo mobility ativo. */
  professionalType?: TipoProfissional | null;
}

interface PropsSecaoAdmin {
  modo: ModoPainel;
}

const SECOES: Record<SecaoAdmin, (props: PropsSecaoAdmin) => JSX.Element> = {
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

interface SubAbaConfig {
  id: SecaoAdmin;
  label: string;
  labelServicos?: string;
  icone: LucideIcon;
  iconeServicos?: LucideIcon;
  /** Modos em que a aba aparece. */
  modos: ModoPainel[];
}

const SUB_ABAS: SubAbaConfig[] = [
  { id: "dashboard", label: "Visão", icone: LayoutDashboard, modos: ["mobilidade", "servicos", "hibrido"] },
  {
    id: "motoristas",
    label: "Motoristas",
    labelServicos: "Profissionais",
    icone: Car,
    iconeServicos: Briefcase,
    modos: ["mobilidade", "servicos", "hibrido"],
  },
  { id: "afiliados", label: "Afiliados", icone: Users, modos: ["mobilidade", "hibrido"] },
  { id: "crm", label: "CRM", icone: UserCheck, modos: ["mobilidade", "servicos", "hibrido"] },
  {
    id: "corridas",
    label: "Corridas",
    labelServicos: "Agendamentos",
    icone: Route,
    iconeServicos: Calendar,
    modos: ["mobilidade", "servicos", "hibrido"],
  },
  { id: "carteira", label: "Carteira", icone: Wallet, modos: ["mobilidade", "servicos", "hibrido"] },
  { id: "identidade", label: "Visual", icone: Palette, modos: ["mobilidade", "servicos", "hibrido"] },
  { id: "regras", label: "Regras", icone: Settings, modos: ["mobilidade", "servicos", "hibrido"] },
  { id: "comissoes", label: "Comissões", icone: Percent, modos: ["mobilidade", "hibrido"] },
];

export function AbaTribo({ tribo, semPerfilDriver, onAtivarMotorista, professionalType }: AbaTriboProps) {
  const [secao, setSecao] = useState<SecaoAdmin>("dashboard");

  const modo = resolverModoPainel(professionalType ?? undefined, tribo.activeModules);
  const modoServicos = modo === "servicos";

  const subAbasVisiveis = SUB_ABAS.filter((s) => s.modos.includes(modo));

  if (tribo.papel !== "dono") {
    return (
      <div className="px-5 pt-12 pb-20 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{tribo.nome}</h2>
          <p className="text-xs text-muted-foreground">Você é membro deste grupo</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
          {modoServicos ? (
            <>
              Apenas o dono do grupo pode gerenciar profissionais, regras e configurações.
              Você gerencia seus agendamentos e ganhos na aba{" "}
              <strong className="text-foreground">Início</strong> e{" "}
              <strong className="text-foreground">Carteira</strong>.
            </>
          ) : (
            <>
              Apenas o dono do grupo pode gerenciar motoristas, afiliados, regras e comissões.
              Você recebe corridas e comissões deste grupo na sua aba{" "}
              <strong className="text-foreground">Início</strong> e{" "}
              <strong className="text-foreground">Carteira</strong>.
            </>
          )}
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
          {subAbasVisiveis.map((sub) => {
            const ativo = secao === sub.id;
            const Icone = modoServicos && sub.iconeServicos ? sub.iconeServicos : sub.icone;
            const label = modoServicos && sub.labelServicos ? sub.labelServicos : sub.label;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSecao(sub.id)}
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

      <div className="p-3 space-y-3">
        {semPerfilDriver && tribo.papel === "dono" && onAtivarMotorista && !modoServicos && (
          <CardAtivarMotorista
            tenantId={tribo.id}
            nomeTribo={tribo.nome}
            onAtivado={onAtivarMotorista}
          />
        )}
        <Conteudo modo={modo} />
      </div>
    </div>
  );
}
