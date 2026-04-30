import { useEffect } from "react";
import { TemaServicos } from "../components/tema_servicos";
import { HeaderServicos } from "../components/header_servicos";
import { FooterServicos } from "../components/footer_servicos";
import { SecaoHero } from "../components/secao_hero";
import { SecaoQuemUsa } from "../components/secao_quem_usa";
import { SecaoComoFunciona } from "../components/secao_como_funciona";
import { SecaoDiferenciais } from "../components/secao_diferenciais";
import { SecaoCtaDual } from "../components/secao_cta_dual";

const TITLE = "TriboServiços — Agenda online com link próprio para profissionais";
const DESCRIPTION =
  "Agenda online, sinal antecipado, portfólio público e link exclusivo para profissionais de serviços. Estética, saúde, manutenção, motorista particular e mais.";

export default function PaginaLandingServicos() {
  useEffect(() => {
    const tituloAnterior = document.title;
    document.title = TITLE;

    const setMeta = (selector: string, attr: "name" | "property", key: string, content: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
      return el;
    };

    const metas = [
      setMeta('meta[name="description"]', "name", "description", DESCRIPTION),
      setMeta('meta[property="og:title"]', "property", "og:title", TITLE),
      setMeta('meta[property="og:description"]', "property", "og:description", DESCRIPTION),
      setMeta('meta[property="og:type"]', "property", "og:type", "website"),
    ];

    // Canonical
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}/s`;

    // JSON-LD
    const ldScript = document.createElement("script");
    ldScript.type = "application/ld+json";
    ldScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      name: "TriboServiços",
      description: DESCRIPTION,
      brand: { "@type": "Brand", name: "TriboCar" },
      url: `${window.location.origin}/s`,
    });
    document.head.appendChild(ldScript);

    return () => {
      document.title = tituloAnterior;
      ldScript.remove();
      metas.forEach((m) => m.remove());
    };
  }, []);

  return (
    <TemaServicos>
      <div className="min-h-screen bg-background">
        <HeaderServicos />
        <main className="pt-14">
          <SecaoHero />
          <SecaoQuemUsa />
          <SecaoComoFunciona />
          <SecaoDiferenciais />
          <SecaoCtaDual />
        </main>
        <FooterServicos />
      </div>
    </TemaServicos>
  );
}
