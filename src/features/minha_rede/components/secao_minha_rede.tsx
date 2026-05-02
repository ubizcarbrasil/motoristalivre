import { Users, TrendingUp, Calendar, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAutenticacao } from "@/features/autenticacao/hooks/hook_autenticacao";
import { useMinhaRede } from "../hooks/hook_minha_rede";

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatAnoMes(ym: string) {
  const [a, m] = ym.split("-");
  const meses = [
    "jan", "fev", "mar", "abr", "mai", "jun",
    "jul", "ago", "set", "out", "nov", "dez",
  ];
  return `${meses[Number(m) - 1] ?? m}/${a}`;
}

function CardKpi({
  icone: Icone,
  rotulo,
  valor,
  hint,
}: {
  icone: typeof Users;
  rotulo: string;
  valor: string;
  hint?: string;
}) {
  return (
    <Card className="p-3 border-border/60">
      <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
        <Icone className="w-3.5 h-3.5" />
        {rotulo}
      </div>
      <p className="text-lg font-semibold text-foreground mt-1">{valor}</p>
      {hint && <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p>}
    </Card>
  );
}

export function SecaoMinhaRede() {
  const { usuario } = useAutenticacao();
  const { kpis, recrutados, repasses, carregando } = useMinhaRede(usuario?.id);

  if (carregando) {
    return (
      <Card className="p-5 border-border/60">
        <p className="text-sm text-muted-foreground">Carregando minha rede…</p>
      </Card>
    );
  }

  if (!kpis || kpis.total_recrutados === 0) {
    return (
      <Card className="p-5 border-border/60 space-y-2">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <h3 className="text-base font-semibold">Minha rede</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Indique outros profissionais e ganhe 10% no cadastro + 5% recorrente
          enquanto a assinatura deles estiver ativa.
        </p>
      </Card>
    );
  }

  const proxima = kpis.proxima_recorrencia
    ? new Date(kpis.proxima_recorrencia).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
      })
    : "—";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-primary" />
        <h3 className="text-base font-semibold">Minha rede</h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <CardKpi
          icone={Users}
          rotulo="Recrutados"
          valor={String(kpis.total_recrutados)}
          hint={`${kpis.recrutados_ativos} ativos`}
        />
        <CardKpi
          icone={TrendingUp}
          rotulo="MRR estimado"
          valor={formatBRL(kpis.mrr_gerado)}
          hint="5% das mensalidades ativas"
        />
        <CardKpi
          icone={Wallet}
          rotulo="Total acumulado"
          valor={formatBRL(kpis.total_acumulado)}
          hint="Cadastro + recorrência"
        />
        <CardKpi
          icone={Calendar}
          rotulo="Próximo repasse"
          valor={proxima}
          hint="Processado às 03h"
        />
      </div>

      {recrutados.length > 0 && (
        <Card className="p-4 border-border/60 space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Profissionais indicados
          </p>
          <div className="space-y-2">
            {recrutados.slice(0, 5).map((r) => (
              <div
                key={r.referral_id}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {r.avatar_url ? (
                    <img
                      src={r.avatar_url}
                      alt={r.nome}
                      className="w-7 h-7 rounded-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[11px]">
                      {r.nome.charAt(0)}
                    </div>
                  )}
                  <p className="text-sm truncate">{r.nome}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {r.monthly_active ? (
                    <Badge variant="outline" className="text-[10px] py-0 h-5 border-primary/40 text-primary">
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] py-0 h-5">
                      Inativo
                    </Badge>
                  )}
                  <span className="text-xs font-medium text-foreground">
                    {formatBRL(r.signup_amount + r.total_monthly_earned)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {repasses.length > 0 && (
        <Card className="p-4 border-border/60 space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Últimos repasses recorrentes
          </p>
          <div className="space-y-1.5">
            {repasses.slice(0, 6).map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-muted-foreground">
                  {formatAnoMes(p.ano_mes)} · {p.recruited_nome}
                </span>
                <span className="font-medium text-primary">
                  +{formatBRL(p.amount)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
