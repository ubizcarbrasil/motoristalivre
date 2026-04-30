import { Link } from "react-router-dom";
import { ArrowRight, Check, User, Users } from "lucide-react";
import { TEXTOS_LANDING_SERVICOS } from "../constants/constantes_triboservicos";

export function SecaoCtaDual() {
  const t = TEXTOS_LANDING_SERVICOS.ctaDual;

  return (
    <section className="py-16 md:py-24 bg-card/20">
      <div className="max-w-5xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground tracking-tight">
            {t.titulo}
          </h2>
          <p className="text-muted-foreground">{t.subtitulo}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <CardCaminho
            icone={<User className="w-5 h-5" />}
            badge={t.profissional.badge}
            titulo={t.profissional.titulo}
            descricao={t.profissional.descricao}
            bullets={[...t.profissional.bullets]}
            cta={t.profissional.cta}
            href="/s/cadastro/profissional"
            destaque
          />
          <CardCaminho
            icone={<Users className="w-5 h-5" />}
            badge={t.operadora.badge}
            titulo={t.operadora.titulo}
            descricao={t.operadora.descricao}
            bullets={[...t.operadora.bullets]}
            cta={t.operadora.cta}
            href="/s/cadastro/tribo"
          />
        </div>
      </div>
    </section>
  );
}

interface CardCaminhoProps {
  icone: React.ReactNode;
  badge: string;
  titulo: string;
  descricao: string;
  bullets: string[];
  cta: string;
  href: string;
  destaque?: boolean;
}

function CardCaminho({
  icone,
  badge,
  titulo,
  descricao,
  bullets,
  cta,
  href,
  destaque,
}: CardCaminhoProps) {
  return (
    <div
      className={`rounded-2xl border p-6 md:p-8 space-y-5 transition-all ${
        destaque
          ? "border-primary/50 bg-primary/[0.04] shadow-[0_10px_40px_-15px_hsl(33_47%_65%_/_0.4)]"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`inline-flex w-8 h-8 items-center justify-center rounded-lg ${
            destaque ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
          }`}
        >
          {icone}
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {badge}
        </span>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl md:text-2xl font-bold text-foreground">{titulo}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{descricao}</p>
      </div>

      <ul className="space-y-2">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-sm text-foreground">
            <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <Link
        to={href}
        className={`inline-flex items-center justify-center gap-2 w-full h-11 rounded-lg font-semibold transition-all ${
          destaque
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "border border-border text-foreground hover:bg-secondary"
        }`}
      >
        {cta}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
