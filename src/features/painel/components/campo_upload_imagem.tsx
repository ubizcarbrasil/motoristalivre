import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  uploadImagemBranding,
  validarArquivoImagem,
} from "../services/servico_onboarding_profissional";

interface CampoUploadImagemProps {
  driverId: string;
  tipo: "avatar" | "cover";
  valor: string | null;
  onChange: (url: string) => void;
  label: string;
  descricao?: string;
}

export function CampoUploadImagem({
  driverId,
  tipo,
  valor,
  onChange,
  label,
  descricao,
}: CampoUploadImagemProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);

  const aspecto = tipo === "avatar" ? "aspect-square w-24" : "aspect-[16/9] w-full";

  const escolher = () => inputRef.current?.click();

  const handleArquivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    try {
      validarArquivoImagem(arquivo);
      setEnviando(true);
      const url = await uploadImagemBranding(driverId, arquivo, tipo);
      onChange(url);
      toast.success("Imagem enviada");
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : "Erro ao enviar imagem";
      toast.error(mensagem);
    } finally {
      setEnviando(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {descricao && (
          <p className="text-[11px] text-muted-foreground">{descricao}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div
          className={`${aspecto} rounded-xl bg-secondary/40 border border-border overflow-hidden flex items-center justify-center shrink-0`}
        >
          {valor ? (
            <img src={valor} alt={label} className="w-full h-full object-cover" />
          ) : (
            <Upload className="w-5 h-5 text-muted-foreground" />
          )}
        </div>

        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9"
            onClick={escolher}
            disabled={enviando}
          >
            {enviando ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                {valor ? "Trocar imagem" : "Enviar imagem"}
              </>
            )}
          </Button>
          {valor && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-muted-foreground hover:text-destructive"
              onClick={() => onChange("")}
            >
              <X className="w-3 h-3 mr-1" />
              Remover
            </Button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleArquivo}
      />
    </div>
  );
}
