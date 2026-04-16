import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, User, Trophy, Info } from "lucide-react";
import { toast } from "sonner";
import type { MotoristaRanking } from "../types/tipos_painel";
import { buscarRankingMotoristas } from "../services/servico_painel";

interface AbaTriboProps {
  tenantId: string;
  tenantNome: string;
  tenantSlug: string;
  motoristaSlug: string;
}

export function AbaTribo({ tenantId, tenantNome, tenantSlug, motoristaSlug }: AbaTriboProps) {
  const [ranking, setRanking] = useState<MotoristaRanking[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    buscarRankingMotoristas(tenantId)
      .then(setRanking)
      .finally(() => setCarregando(false));
  }, [tenantId]);

  const linkMotorista = `https://${tenantSlug}.tribocar.com/${motoristaSlug}`;

  const copiarLink = async () => {
    await navigator.clipboard.writeText(linkMotorista);
    toast.success("Link copiado");
  };

  const compartilharWhatsApp = () => {
    const texto = encodeURIComponent(`Peça sua corrida pelo meu link: ${linkMotorista}`);
    window.open(`https://wa.me/?text=${texto}`, "_blank");
  };

  return (
    <div className="pt-12 pb-20 px-5 space-y-6">
      <h2 className="text-lg font-semibold text-foreground">{tenantNome}</h2>

      {/* Link do motorista */}
      <div className="rounded-xl bg-card border border-border p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Seu link</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs bg-secondary rounded-lg px-3 py-2 text-foreground truncate">
            {linkMotorista}
          </code>
          <Button variant="outline" size="icon" onClick={copiarLink}>
            <Copy className="w-4 h-4" />
          </Button>
        </div>
        <Button variant="outline" className="w-full" onClick={compartilharWhatsApp}>
          Compartilhar via WhatsApp
        </Button>
      </div>

      {/* Comissão */}
      <div className="rounded-xl bg-card border border-border p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          <p className="text-sm font-medium text-foreground">Como funciona a comissão</p>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Quando um passageiro acessa pelo seu link e faz uma corrida com outro motorista do grupo,
          você recebe uma comissão de transbordo sobre o valor da corrida. O valor é definido pelo
          administrador do grupo.
        </p>
      </div>

      {/* Ranking */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">Ranking do grupo</p>
        </div>

        {carregando ? (
          <p className="text-xs text-muted-foreground">Carregando...</p>
        ) : ranking.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nenhum motorista no ranking</p>
        ) : (
          <div className="space-y-2">
            {ranking.slice(0, 10).map((m, i) => (
              <div key={m.id} className="flex items-center gap-3 rounded-xl bg-card border border-border p-3">
                <span className={`text-sm font-bold w-6 text-center ${i < 3 ? "text-primary" : "text-muted-foreground"}`}>
                  {i + 1}
                </span>
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  {m.avatar_url ? (
                    <img src={m.avatar_url} alt={m.nome} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{m.nome}</p>
                  <p className="text-[10px] text-muted-foreground">{m.corridas} corridas</p>
                </div>
                <span className="text-xs font-semibold text-foreground">
                  R${m.faturamento.toFixed(2).replace(".", ",")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
