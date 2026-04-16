import { CheckCircle2 } from "lucide-react";

interface SeloAutenticidadeProps {
  cor: string;
}

export function SeloAutenticidade({ cor }: SeloAutenticidadeProps) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-lg border"
      style={{
        borderColor: cor,
        backgroundColor: `${cor}15`,
      }}
    >
      <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: cor }} />
      <div className="flex-1">
        <p className="text-sm font-semibold" style={{ color: cor }}>
          Comprovante autêntico
        </p>
        <p className="text-xs text-muted-foreground leading-tight">
          Dados validados diretamente na plataforma
        </p>
      </div>
    </div>
  );
}
