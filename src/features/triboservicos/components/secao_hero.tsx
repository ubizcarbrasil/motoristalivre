import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { TEXTOS_LANDING_SERVICOS } from "../constants/constantes_triboservicos";

export function SecaoHero() {
  const t = TEXTOS_LANDING_SERVICOS.hero;

  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, hsl(33 47% 65% / 0.18), transparent 60%)",
        }}
      />

      <div className="max-w-4xl mx-auto px-4 pt-20 pb-16 md:pt-28 md:pb-24 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-medium">
          <Sparkles className="w-3 h-3" />
          {t.badge}
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-foreground tracking-tight leading-[1.1]">
          {t.titulo}
        </h1>

        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {t.subtitulo}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            to="/s/cadastro/profissional"
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-[0_10px_30px_-10px_hsl(33_47%_65%_/_0.5)] w-full sm:w-auto"
          >
            {t.ctaPrincipal}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/s/entrar"
            className="inline-flex items-center justify-center h-12 px-6 rounded-lg border border-border text-foreground hover:bg-card transition-colors w-full sm:w-auto"
          >
            {t.ctaSecundario}
          </Link>
        </div>
      </div>
    </section>
  );
}
