import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, Check } from "lucide-react";
import type { ProfissionalBusca } from "../types/tipos_convites";

interface Props {
  profissional: ProfissionalBusca;
  onConvidar: (driverId: string) => void | Promise<void>;
  enviando?: boolean;
}

export function CardResultadoProfissional({ profissional, onConvidar, enviando }: Props) {
  const inicial = profissional.nome.charAt(0).toUpperCase();
  const desabilitado =
    profissional.ja_e_membro ||
    profissional.ja_tem_convite_pendente ||
    profissional.ja_tem_solicitacao_pendente ||
    enviando;

  let labelBotao = "Convidar";
  if (profissional.ja_e_membro) labelBotao = "Já é membro";
  else if (profissional.ja_tem_convite_pendente) labelBotao = "Convite enviado";
  else if (profissional.ja_tem_solicitacao_pendente) labelBotao = "Solicitação pendente";

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <Avatar className="h-10 w-10">
        {profissional.avatar_url && <AvatarImage src={profissional.avatar_url} />}
        <AvatarFallback>{inicial}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{profissional.nome}</p>
        {profissional.handle && (
          <p className="text-xs text-muted-foreground font-mono truncate">@{profissional.handle}</p>
        )}
      </div>
      <Button
        size="sm"
        variant={desabilitado ? "outline" : "default"}
        disabled={desabilitado}
        onClick={() => onConvidar(profissional.driver_id)}
        className="gap-1.5"
      >
        {enviando ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : profissional.ja_tem_convite_pendente ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <UserPlus className="h-3.5 w-3.5" />
        )}
        {labelBotao}
      </Button>
    </div>
  );
}
