import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ChevronRight, BadgeCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listarMotoristasDoTenant } from "../services/servico_passageiro";
import type { MotoristaListado } from "../types/tipos_passageiro";

interface Props {
  tenantSlug: string;
}

export function ListaMotoristasTenant({ tenantSlug }: Props) {
  const [motoristas, setMotoristas] = useState<MotoristaListado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    listarMotoristasDoTenant(tenantSlug).then((lista) => {
      setMotoristas(lista);
      setCarregando(false);
    });
  }, [tenantSlug]);

  if (carregando) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="max-w-md mx-auto space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground">
            Escolha um motorista
          </h1>
          <p className="text-sm text-muted-foreground">
            Selecione um motorista do grupo <strong>{tenantSlug}</strong> para solicitar uma corrida.
          </p>
        </div>

        {motoristas.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum motorista cadastrado neste grupo ainda.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {motoristas.map((m) => (
              <Card
                key={m.id}
                onClick={() => navigate(`/${tenantSlug}/${m.slug}`)}
                className="p-3 flex items-center gap-3 cursor-pointer hover:bg-accent/40 transition-colors"
              >
                <Avatar className="w-12 h-12">
                  <AvatarImage src={m.avatar_url ?? undefined} />
                  <AvatarFallback>{m.nome.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-medium text-foreground truncate">{m.nome}</p>
                    {m.is_verified && <BadgeCheck className="w-4 h-4 text-primary shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant={m.is_online ? "default" : "secondary"} className="text-xs">
                      {m.is_online ? "Online" : "Offline"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">@{m.slug}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
