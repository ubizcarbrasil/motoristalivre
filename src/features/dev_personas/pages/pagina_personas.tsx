import { AlertTriangle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PERSONAS } from "../constants/constantes_personas";
import { CardPersona } from "../components/card_persona";
import { useDevPersonas } from "../hooks/hook_personas";

export default function PaginaPersonas() {
  const { criando, resultado, logando, handleCriar, handleLogin, copiarCredenciais } =
    useDevPersonas();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Card className="border-yellow-500/40 bg-yellow-500/10">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-100">
              <strong>Apenas para testes.</strong> Esta página é pública e cria
              usuários reais no banco. Remova a rota e a edge function antes de
              publicar em produção.
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Personas de teste</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Credenciais prontas para cada papel do sistema, do mais poderoso
              ao mais restrito.
            </p>
          </div>
          <Button onClick={handleCriar} disabled={criando} className="gap-2">
            <Sparkles className="w-4 h-4" />
            {criando ? "Criando..." : "Criar/Recriar personas"}
          </Button>
        </div>

        {resultado?.ok && resultado.personas && (
          <Card>
            <CardContent className="p-4 text-xs font-mono space-y-1">
              <div className="text-muted-foreground mb-2">
                Tenant: {resultado.tenant?.slug} ({resultado.tenant?.id})
              </div>
              {resultado.personas.map((p) => (
                <div key={p.email} className="flex justify-between gap-2">
                  <span>{p.email}</span>
                  <span
                    className={
                      p.status === "criado"
                        ? "text-primary"
                        : p.status === "ja_existia"
                          ? "text-muted-foreground"
                          : "text-destructive"
                    }
                  >
                    {p.status}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {PERSONAS.map((persona) => (
            <CardPersona
              key={persona.email}
              persona={persona}
              logando={logando === persona.email}
              onLogin={handleLogin}
              onCopiar={copiarCredenciais}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
