import { TEXTOS_LANDING_SERVICOS } from "../constants/constantes_triboservicos";

export function SecaoComoFunciona() {
  const t = TEXTOS_LANDING_SERVICOS.comoFunciona;

  return (
    <section className="py-16 md:py-24 bg-card/20">
      <div className="max-w-5xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground tracking-tight">
            {t.titulo}
          </h2>
          <p className="text-muted-foreground">{t.subtitulo}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {t.passos.map((passo) => (
            <div key={passo.numero} className="relative space-y-3">
              <div className="text-5xl font-bold text-primary/30 leading-none">
                {passo.numero}
              </div>
              <h3 className="text-lg font-semibold text-foreground">{passo.titulo}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{passo.descricao}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
