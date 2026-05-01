import { useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PreviewVitrine } from "./preview_vitrine";

interface Props {
  driverId: string;
}

export function BotaoPreviewVitrine({ driverId }: Props) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <Button
        type="button"
        onClick={() => setAberto(true)}
        variant="default"
        className="w-full h-11 gap-2"
        aria-label="Ver vitrine ao vivo"
      >
        <Eye className="w-4 h-4" />
        Ver vitrine
      </Button>

      <PreviewVitrine
        aberto={aberto}
        onAbertoChange={setAberto}
        driverId={driverId}
      />
    </>
  );
}
