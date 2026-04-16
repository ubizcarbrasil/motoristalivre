import { AlertCircle } from "lucide-react";

interface EstadoNaoEncontradoProps {
  rideId?: string;
}

export function EstadoNaoEncontrado({ rideId }: EstadoNaoEncontradoProps) {
  return (
    <div className="flex flex-col items-center text-center py-12 px-6 gap-3">
      <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertCircle className="w-7 h-7 text-destructive" />
      </div>
      <h2 className="text-lg font-bold text-foreground">
        Comprovante não encontrado
      </h2>
      <p className="text-sm text-muted-foreground max-w-xs">
        Não localizamos uma corrida com este identificador. Verifique se o QR
        Code está íntegro e tente novamente.
      </p>
      {rideId && (
        <code className="mt-2 text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded">
          {rideId}
        </code>
      )}
    </div>
  );
}
