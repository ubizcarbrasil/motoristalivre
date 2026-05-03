import { HeaderLanding } from "../components/header_landing";
import { HeroLanding } from "../components/hero_landing";
import { BeneficiosLanding } from "../components/beneficios_landing";
import { PlanosLanding } from "../components/planos_landing";
import { CtaLanding } from "../components/cta_landing";
import { RodapeLanding } from "../components/rodape_landing";
import { SecaoDescobertaHome } from "@/features/descoberta_tribos/components/secao_descoberta_home";

export default function PaginaLanding() {
  return (
    <div className="min-h-screen bg-background">
      <HeaderLanding />
      <main className="pt-14">
        <HeroLanding />
        <BeneficiosLanding />
        <SecaoDescobertaHome />
        <PlanosLanding />
        <CtaLanding />
      </main>
      <RodapeLanding />
    </div>
  );
}
