import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Briefcase, Car, ShieldCheck } from "lucide-react";

interface Props {
  driverNome: string;
  driverAvatar: string | null;
  credenciado?: boolean;
  onEscolher: (modo: "ride" | "service") => void;
  onVoltar?: () => void;
}

export function EscolhaModoAtendimento({
  driverNome,
  driverAvatar,
  credenciado,
  onEscolher,
  onVoltar,
}: Props) {
  const iniciais = driverNome
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {onVoltar && (
        <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-background/85 backdrop-blur-sm border-b border-border">
          <button
            onClick={onVoltar}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-foreground">Como podemos ajudar?</span>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8 max-w-md mx-auto w-full">
        <div className="flex flex-col items-center gap-3">
          <Avatar className="h-20 w-20 border-2 border-border">
            <AvatarImage src={driverAvatar ?? undefined} alt={driverNome} />
            <AvatarFallback>{iniciais}</AvatarFallback>
          </Avatar>
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">{driverNome}</h1>
              {credenciado && (
                <Badge className="bg-primary text-primary-foreground gap-1 px-1.5 py-0 h-5">
                  <ShieldCheck className="w-3 h-3" />
                  Verificado
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">O que você precisa hoje?</p>
          </div>
        </div>

        <div className="w-full space-y-3">
          <Button
            className="w-full h-16 gap-3 text-base font-semibold justify-start px-5"
            variant="outline"
            onClick={() => onEscolher("ride")}
          >
            <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <Car className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">Solicitar corrida</p>
              <p className="text-[11px] text-muted-foreground font-normal">
                Transporte agora
              </p>
            </div>
          </Button>

          <Button
            className="w-full h-16 gap-3 text-base font-semibold justify-start px-5"
            onClick={() => onEscolher("service")}
          >
            <div className="w-10 h-10 rounded-lg bg-primary-foreground/15 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold">Agendar serviço</p>
              <p className="text-[11px] opacity-80 font-normal">
                Marque um horário
              </p>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
