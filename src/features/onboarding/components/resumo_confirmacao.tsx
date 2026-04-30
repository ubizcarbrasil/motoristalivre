import { Database, Palette } from "lucide-react";
import type {
  DadosIdentidade,
  ModuloPlataforma,
} from "../types/tipos_onboarding";

interface ResumoConfirmacaoProps {
  identidade: DadosIdentidade;
  modulos: ModuloPlataforma[];
  corPrimaria?: string;
}

interface LinhaResumoProps {
  rotulo: string;
  valor: string | null | undefined;
  destaque?: boolean;
}

function LinhaResumo({ rotulo, valor, destaque }: LinhaResumoProps) {
  const vazio = !valor || valor.trim().length === 0;
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border/40 last:border-0">
      <span className="text-xs text-muted-foreground font-mono shrink-0">{rotulo}</span>
      <span
        className={`text-xs text-right break-all ${
          vazio
            ? "text-muted-foreground/60 italic"
            : destaque
              ? "text-primary font-medium"
              : "text-foreground"
        }`}
      >
        {vazio ? "—" : valor}
      </span>
    </div>
  );
}

export function ResumoConfirmacao({
  identidade,
  modulos,
  corPrimaria,
}: ResumoConfirmacaoProps) {
  return (
    <div className="rounded-lg border border-border bg-card/50 p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          Confirme o que será salvo
        </h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Revise os dados antes de concluir o onboarding.
        </p>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground uppercase tracking-wide">
          <Database className="w-3 h-3" />
          tenants
        </div>
        <div className="rounded-md bg-background/40 px-3 py-1">
          <LinhaResumo rotulo="name" valor={identidade.nome} destaque />
          <LinhaResumo rotulo="slug" valor={identidade.subdominio} destaque />
          <LinhaResumo
            rotulo="active_modules"
            valor={modulos.length > 0 ? `{${modulos.join(", ")}}` : "{mobility}"}
          />
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground uppercase tracking-wide">
          <Palette className="w-3 h-3" />
          tenant_branding
        </div>
        <div className="rounded-md bg-background/40 px-3 py-1">
          <LinhaResumo rotulo="city" valor={identidade.cidade} />
          <LinhaResumo rotulo="description" valor={identidade.descricao} />
          <LinhaResumo rotulo="whatsapp" valor={identidade.whatsapp} />
          <LinhaResumo rotulo="logo_url" valor={identidade.logoUrl ? "✓ enviado" : null} />
          <LinhaResumo rotulo="cover_url" valor={identidade.capaUrl ? "✓ enviado" : null} />
          {corPrimaria && (
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-muted-foreground font-mono">primary_color</span>
              <div className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded border border-border"
                  style={{ backgroundColor: corPrimaria }}
                />
                <span className="text-xs text-foreground">{corPrimaria}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
