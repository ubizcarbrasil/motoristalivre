import { Play, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { previewSomChamada, type TipoSomChamada } from "../utils/audio_alerta";

interface OpcaoSom {
  id: TipoSomChamada;
  titulo: string;
  descricao: string;
}

const OPCOES: OpcaoSom[] = [
  { id: "suave", titulo: "Suave", descricao: "Uma nota discreta, ideal pra ambientes silenciosos" },
  { id: "padrao", titulo: "Padrão", descricao: "Ding-ding de duas notas, equilibrado" },
  { id: "sirene", titulo: "Sirene", descricao: "Alerta forte, difícil de ignorar" },
];

interface Props {
  valor: TipoSomChamada;
  onChange: (valor: TipoSomChamada) => void;
}

export function SeletorSomChamada({ valor, onChange }: Props) {
  const handlePreview = (e: React.MouseEvent, tipo: TipoSomChamada) => {
    e.stopPropagation();
    previewSomChamada(tipo);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Bell className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Som da chamada</h3>
      </div>
      <p className="text-[11px] text-muted-foreground -mt-2">
        Som tocado quando uma corrida chega. Toque no ícone pra testar.
      </p>

      <div className="space-y-2">
        {OPCOES.map((opcao) => {
          const ativo = valor === opcao.id;
          return (
            <button
              key={opcao.id}
              type="button"
              onClick={() => {
                onChange(opcao.id);
                previewSomChamada(opcao.id);
              }}
              className={cn(
                "w-full rounded-xl border p-3 flex items-center gap-3 text-left transition-colors",
                ativo
                  ? "bg-primary/10 border-primary"
                  : "bg-card border-border hover:border-foreground/30"
              )}
            >
              <div
                className={cn(
                  "shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center",
                  ativo ? "border-primary" : "border-muted-foreground"
                )}
              >
                {ativo && <div className="w-2 h-2 rounded-full bg-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{opcao.titulo}</p>
                <p className="text-[11px] text-muted-foreground truncate">{opcao.descricao}</p>
              </div>
              <button
                type="button"
                onClick={(e) => handlePreview(e, opcao.id)}
                aria-label={`Testar som ${opcao.titulo}`}
                className="shrink-0 w-8 h-8 rounded-full bg-secondary hover:bg-secondary/70 flex items-center justify-center text-foreground transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            </button>
          );
        })}
      </div>
    </div>
  );
}
