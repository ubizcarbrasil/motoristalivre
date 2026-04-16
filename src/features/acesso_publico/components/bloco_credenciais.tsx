import { CREDENCIAIS_DEMO } from "../constants/constantes_acesso";

export function BlocoCredenciais() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div>
        <h3 className="text-sm font-medium text-foreground">Credenciais de teste</h3>
        <p className="text-xs text-muted-foreground">Use no /entrar ou /dev/personas</p>
      </div>
      <div className="space-y-2">
        {CREDENCIAIS_DEMO.map((c) => (
          <div key={c.email} className="rounded-md bg-muted/50 px-3 py-2 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">{c.papel}</span>
              <span className="font-mono text-muted-foreground">{c.senha}</span>
            </div>
            <div className="font-mono text-muted-foreground">{c.email}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
