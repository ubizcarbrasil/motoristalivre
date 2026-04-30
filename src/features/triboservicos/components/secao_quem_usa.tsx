import { TEXTOS_LANDING_SERVICOS } from "../constants/constantes_triboservicos";

export function SecaoQuemUsa() {
  const t = TEXTOS_LANDING_SERVICOS.quemUsa;

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground tracking-tight">
            {t.titulo}
          </h2>
          <p className="text-muted-foreground">{t.subtitulo}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {t.nichos.map((nicho) => (
            <div
              key={nicho.nome}
              className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-colors"
            >
              <div className="text-3xl mb-3">{nicho.icone}</div>
              <h3 className="text-base font-semibold text-foreground">{nicho.nome}</h3>
              <p className="text-sm text-muted-foreground mt-1">{nicho.exemplos}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
