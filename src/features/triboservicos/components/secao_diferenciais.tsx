import {
  Calendar,
  Wallet,
  Link2,
  Image,
  CreditCard,
  Bell,
} from "lucide-react";
import { TEXTOS_LANDING_SERVICOS } from "../constants/constantes_triboservicos";

const ICONES = [Calendar, Wallet, Link2, Image, CreditCard, Bell];

export function SecaoDiferenciais() {
  const t = TEXTOS_LANDING_SERVICOS.diferenciais;

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground tracking-tight">
            {t.titulo}
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {t.itens.map((item, idx) => {
            const Icone = ICONES[idx] || Calendar;
            return (
              <div
                key={item.titulo}
                className="rounded-xl border border-border bg-card p-6 space-y-3"
              >
                <div className="inline-flex w-10 h-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icone className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-foreground">{item.titulo}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.descricao}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
