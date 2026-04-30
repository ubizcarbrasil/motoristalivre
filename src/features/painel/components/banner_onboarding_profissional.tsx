import { AlertTriangle, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CampoOnboarding } from "../hooks/hook_onboarding_profissional";

const ROTULOS: Record<CampoOnboarding, string> = {
  full_name: "Nome completo",
  phone: "WhatsApp",
  professional_type: "Tipo de profissional",
  service_categories: "Categorias",
  bio: "Bio",
  avatar_url: "Foto de perfil",
  cover_url: "Foto de capa",
  cidade: "Cidade",
};

interface BannerOnboardingProfissionalProps {
  camposFaltantes: CampoOnboarding[];
  onAbrir: () => void;
}

export function BannerOnboardingProfissional({
  camposFaltantes,
  onAbrir,
}: BannerOnboardingProfissionalProps) {
  if (camposFaltantes.length === 0) return null;

  const rotulos = camposFaltantes.map((c) => ROTULOS[c]).join(", ");

  return (
    <div className="rounded-xl border border-primary/40 bg-primary/5 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm font-semibold text-foreground">
            Complete seu cadastro para ativar a vitrine
          </p>
          <p className="text-[12px] text-muted-foreground">
            Faltam {camposFaltantes.length}{" "}
            {camposFaltantes.length === 1 ? "campo" : "campos"} para liberar
            categorias, portfólio e equipe.
          </p>
          <p className="text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground/80">Pendente:</span>{" "}
            {rotulos}
          </p>
        </div>
      </div>

      <Button onClick={onAbrir} className="w-full h-10 gap-2">
        <AlertTriangle className="w-4 h-4" />
        Completar agora
        <ArrowRight className="w-4 h-4 ml-auto" />
      </Button>
    </div>
  );
}
