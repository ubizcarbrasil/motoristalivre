import { useState } from "react";
import { Eye } from "lucide-react";
import { PreviewVitrine } from "./preview_vitrine";

interface Props {
  driverId: string;
}

export function BotaoPreviewVitrine({ driverId }: Props) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="fixed right-4 bottom-24 z-30 flex items-center gap-2 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 px-4 h-12 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
        aria-label="Ver vitrine ao vivo"
      >
        <Eye className="w-4 h-4" />
        <span>Ver vitrine</span>
      </button>

      <PreviewVitrine
        aberto={aberto}
        onAbertoChange={setAberto}
        driverId={driverId}
      />
    </>
  );
}
