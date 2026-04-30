import { Info } from "lucide-react";
import { CardLinkCanal } from "./card_link_canal";
import type { CanalLink } from "../types/tipos_meus_links";
import type { TriboMotorista } from "../types/tipos_tribos";

interface AbaMeusLinksDonoProps {
  tribo: TriboMotorista;
  modulosAtivos?: string[];
}

/**
 * Versão simplificada de Meus Links para donos de tribo que ainda não
 * têm perfil de motorista. Mostra apenas o link público do grupo.
 */
export function AbaMeusLinksDono({ tribo, modulosAtivos }: AbaMeusLinksDonoProps) {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const ehSomenteServicos =
    !!modulosAtivos &&
    modulosAtivos.includes("services") &&
    !modulosAtivos.includes("mobility");

  const urlGrupo = ehSomenteServicos
    ? `${base}/s/${tribo.slug}`
    : `${base}/${tribo.slug}`;

  const canal: CanalLink = {
    tipo: "grupo",
    titulo: `Link do grupo ${tribo.nome}`,
    descricao: ehSomenteServicos
      ? "Vitrine pública de serviços da sua tribo. Compartilhe para captar clientes."
      : "Página pública do seu grupo. Compartilhe para captar passageiros.",
    url: urlGrupo,
    handle: `@${tribo.slug}`,
    cor: "verde",
    stats: { corridas: 0, ganhos: 0, conversao: 0 },
  };

  return (
    <div className="pt-12 pb-24 px-4 space-y-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">Meus Links</h2>
        <p className="text-xs text-muted-foreground">
          Link público da sua tribo. Compartilhe para receber agendamentos e clientes.
        </p>
      </div>

      <CardLinkCanal canal={canal} />

      <div className="rounded-xl border border-border bg-card/50 p-3 flex gap-2">
        <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Quer aparecer como profissional dentro do seu grupo? Ative seu perfil de
          motorista/profissional na aba Tribo.
        </p>
      </div>
    </div>
  );
}
