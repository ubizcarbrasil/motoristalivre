import { PASSOS_COMISSAO } from "../constants/constantes_afiliado";

export function ExplicacaoComissao() {
  return (
    <div className="space-y-3 px-5">
      <h2 className="text-sm font-semibold text-foreground">Como funciona</h2>
      <div className="space-y-3">
        {PASSOS_COMISSAO.map((passo) => (
          <div key={passo.numero} className="flex gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
              {passo.numero}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{passo.titulo}</p>
              <p className="text-xs text-muted-foreground">{passo.descricao}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
