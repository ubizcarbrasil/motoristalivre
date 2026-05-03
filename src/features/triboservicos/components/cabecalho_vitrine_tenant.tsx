import { Briefcase, MapPin } from "lucide-react";
import bannerTriboServicos from "@/assets/banner_triboservicos.jpg";
import type { TenantPublicoServicos } from "../services/servico_vitrine_publica";

interface Props {
  tenant: TenantPublicoServicos;
}

export function CabecalhoVitrineTenant({ tenant }: Props) {
  const cover = tenant.branding?.cover_url;
  const logo = tenant.branding?.logo_url;
  const cidade = tenant.branding?.city;
  const descricao = tenant.branding?.description;

  const imagemBanner = cover || bannerTriboServicos;

  return (
    <header className="relative w-full">
      <div className="relative h-44 sm:h-56 w-full overflow-hidden bg-gradient-to-br from-primary/30 via-primary/10 to-background">
        <img
          src={imagemBanner}
          alt={tenant.name}
          className="absolute inset-0 w-full h-full object-cover"
          width={1536}
          height={640}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/20 pointer-events-none" />
        {!cover && (
          <div className="absolute inset-0 flex items-center justify-start px-6">
            <div className="space-y-1 max-w-[60%]">
              <p className="text-[10px] uppercase tracking-widest text-primary font-semibold">
                TriboServiços
              </p>
              <p className="text-sm sm:text-base font-semibold text-foreground leading-tight">
                Profissionais de confiança
              </p>
              <p className="text-xs text-muted-foreground">
                Agende ou peça orçamento
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-12 relative">
        <div className="flex items-end gap-4">
          <div className="w-24 h-24 rounded-2xl border-4 border-background bg-secondary overflow-hidden shrink-0 shadow-lg">
            {logo ? (
              <img src={logo} alt={tenant.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                <Briefcase className="w-9 h-9 text-primary" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 pb-2">
            <h1 className="text-2xl font-semibold text-foreground truncate">
              {tenant.name}
            </h1>
            {cidade && (
              <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate">{cidade}</span>
              </div>
            )}
          </div>
        </div>

        {descricao && (
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            {descricao}
          </p>
        )}
      </div>
    </header>
  );
}
