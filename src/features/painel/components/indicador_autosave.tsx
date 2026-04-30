import { Check, CloudOff, Loader2 } from "lucide-react";
import type { StatusAutoSave } from "../hooks/hook_autosave_onboarding";

interface IndicadorAutoSaveProps {
  status: StatusAutoSave;
}

export function IndicadorAutoSave({ status }: IndicadorAutoSaveProps) {
  if (status === "idle") return null;

  if (status === "salvando") {
    return (
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Loader2 className="w-3 h-3 animate-spin" />
        Salvando…
      </div>
    );
  }

  if (status === "salvo") {
    return (
      <div className="flex items-center gap-1.5 text-[11px] text-primary">
        <Check className="w-3 h-3" />
        Progresso salvo
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-[11px] text-destructive">
      <CloudOff className="w-3 h-3" />
      Falha ao salvar
    </div>
  );
}
