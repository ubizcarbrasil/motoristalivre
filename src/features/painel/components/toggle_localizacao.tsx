import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ToggleLocalizacaoProps {
  ativo: boolean;
  onToggle: () => void;
}

export function ToggleLocalizacao({ ativo, onToggle }: ToggleLocalizacaoProps) {
  return (
    <Button
      variant={ativo ? "default" : "outline"}
      size="sm"
      className="gap-2"
      onClick={onToggle}
    >
      <MapPin className={`w-4 h-4 ${ativo ? "animate-pulse" : ""}`} />
      {ativo ? "Compartilhando localização" : "Compartilhar localização"}
    </Button>
  );
}
