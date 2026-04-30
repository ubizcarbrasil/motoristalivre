import { Search, CalendarCheck, Sparkles } from "lucide-react";

const PASSOS = [
  {
    icone: Search,
    titulo: "1. Escolha o profissional",
    descricao: "Veja portfólio, serviços e avaliações para escolher quem combina com você.",
  },
  {
    icone: CalendarCheck,
    titulo: "2. Agende o horário",
    descricao: "Selecione o serviço, escolha data e horário disponíveis e confirme em segundos.",
  },
  {
    icone: Sparkles,
    titulo: "3. Aproveite o atendimento",
    descricao: "Receba lembretes automáticos e curta um serviço com qualidade garantida.",
  },
];

export function SecaoComoAgendarTenant() {
  return (
    <section className="max-w-3xl mx-auto px-4 mt-12">
      <div className="rounded-2xl border border-border bg-card/40 p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Como agendar
          </h2>
          <p className="text-sm text-muted-foreground">
            Em três passos simples, do clique ao atendimento.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {PASSOS.map((passo) => {
            const Icone = passo.icone;
            return (
              <div key={passo.titulo} className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icone className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  {passo.titulo}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {passo.descricao}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
