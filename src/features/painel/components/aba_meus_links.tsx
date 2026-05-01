import { useEffect, useState } from "react";
import { Loader2, Plus, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CardLinkCanal } from "./card_link_canal";
import { GuiaLinksRapido } from "./guia_links_rapido";
import { buscarCanaisLinks } from "../services/servico_meus_links";
import type { CanalLink } from "../types/tipos_meus_links";
import type { PerfilMotorista } from "../types/tipos_painel";

interface AbaMeusLinksProps {
  perfil: PerfilMotorista;
  tenant: { id: string; name: string; slug: string; active_modules?: string[] };
  ehAdminGrupo: boolean;
}

export function AbaMeusLinks({ perfil, tenant, ehAdminGrupo }: AbaMeusLinksProps) {
  const [canais, setCanais] = useState<CanalLink[]>([]);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    buscarCanaisLinks({
      driverId: perfil.id,
      driverSlug: perfil.slug,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      tenantNome: tenant.name,
      ehAdminGrupo,
      professionalType: perfil.professional_type,
    })
      .then(setCanais)
      .finally(() => setCarregando(false));
  }, [
    perfil.id,
    perfil.slug,
    perfil.professional_type,
    tenant.id,
    tenant.slug,
    tenant.name,
    ehAdminGrupo,
  ]);

  return (
    <div className="pt-12 pb-24 px-4 space-y-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">Meus Links</h2>
        <p className="text-xs text-muted-foreground">
          Cada link é para um público diferente. Confira o guia abaixo antes de compartilhar.
        </p>
      </div>

      <GuiaLinksRapido
        tenantSlug={tenant.slug}
        driverSlug={perfil.slug}
        professionalType={perfil.professional_type}
      />

      {carregando ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-3">
          {canais.map((c) => (
            <CardLinkCanal key={c.tipo} canal={c} />
          ))}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card/50 p-3 flex gap-2">
        <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Não compartilhe links que comecem com <span className="font-mono">/cadastro</span>.
          Esses são para criar conta de motorista, não para clientes ou passageiros.
        </p>
      </div>

      {!ehAdminGrupo && (
        <Button
          variant="outline"
          className="w-full h-11 gap-2"
          onClick={() => navigate("/onboarding")}
        >
          <Plus className="w-4 h-4" />
          Criar meu próprio grupo
        </Button>
      )}
    </div>
  );
}
