import type { CorridaAfiliado } from "../types/tipos_afiliado";

interface ListaCorridasAfiliadoProps {
  corridas: CorridaAfiliado[];
}

export function ListaCorridasAfiliado({ corridas }: ListaCorridasAfiliadoProps) {
  return (
    <div className="space-y-3 px-5 pb-8">
      <h2 className="text-sm font-semibold text-foreground">Ultimas corridas geradas</h2>
      {corridas.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma corrida gerada ainda</p>
      ) : (
        <div className="space-y-2">
          {corridas.map((c) => (
            <div key={c.id} className="rounded-lg border border-border bg-card p-3">
              <div className="mb-1 flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">
                    {c.origemEndereco || "Origem"} → {c.destinoEndereco || "Destino"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Motorista: {c.motoristaNome || "—"}
                  </p>
                </div>
                <span className="ml-2 shrink-0 text-sm font-semibold text-primary">
                  +R$ {c.comissao.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(c.data).toLocaleDateString("pt-BR")}{" "}
                {new Date(c.data).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
