import { Users, Wallet, Car, Link2, BarChart3, Shield } from "lucide-react";

const BENEFICIOS = [
  {
    icone: Car,
    titulo: "App proprio com sua marca",
    descricao: "Link exclusivo, logo, cores e dominio personalizados. Seus passageiros acessam pelo seu link.",
  },
  {
    icone: Users,
    titulo: "Gestao de motoristas",
    descricao: "Cadastre motoristas, defina regras de despacho, monitore corridas e avaliações em tempo real.",
  },
  {
    icone: Wallet,
    titulo: "Carteira digital e saques",
    descricao: "Sistema financeiro completo com carteira, comissoes automaticas e saque via Pix.",
  },
  {
    icone: Link2,
    titulo: "Programa de afiliados",
    descricao: "Crie links de indicacao, gerencie comissoes e expanda sua rede com afiliados.",
  },
  {
    icone: BarChart3,
    titulo: "Dashboard completo",
    descricao: "Metricas de corridas, receita, MRR, motoristas ativos e desempenho da operacao.",
  },
  {
    icone: Shield,
    titulo: "Seguro e escalavel",
    descricao: "Infraestrutura robusta, dados isolados por grupo e controle total de acesso por role.",
  },
];

export function BeneficiosLanding() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Tudo que voce precisa para operar
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Uma plataforma completa para grupos de transporte de qualquer tamanho.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFICIOS.map((beneficio) => (
            <div
              key={beneficio.titulo}
              className="group rounded-xl border border-border bg-card p-6 space-y-4 transition-colors hover:border-primary/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <beneficio.icone className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{beneficio.titulo}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{beneficio.descricao}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
