import { Copy, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Persona } from "../types/tipos_personas";

interface CardPersonaProps {
  persona: Persona;
  logando: boolean;
  onLogin: (p: Persona) => void;
  onCopiar: (p: Persona) => void;
}

export function CardPersona({ persona, logando, onLogin, onCopiar }: CardPersonaProps) {
  return (
    <Card className="border-border">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="font-mono text-xs">
                Nível {persona.nivel}
              </Badge>
              <Badge className="bg-primary/15 text-primary hover:bg-primary/20 border-0">
                {persona.role}
              </Badge>
            </div>
            <h3 className="font-semibold text-base text-foreground">
              {persona.titulo}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {persona.descricao}
            </p>
          </div>
        </div>

        <div className="space-y-2 rounded-md bg-muted/30 p-3 font-mono text-xs">
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">email</span>
            <span className="text-foreground truncate">{persona.email}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">senha</span>
            <span className="text-foreground">{persona.senha}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">rota</span>
            <span className="text-foreground">{persona.rotaDestino}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => onLogin(persona)}
            disabled={logando}
            className="flex-1 gap-2"
          >
            <LogIn className="w-4 h-4" />
            {logando ? "Entrando..." : "Login direto"}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onCopiar(persona)}
            aria-label="Copiar credenciais"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
