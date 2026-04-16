import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface CampoUploadImagemProps {
  label: string;
  valor: string;
  pasta: string;
  aspecto: "square" | "wide";
  onChange: (url: string) => void;
}

export function CampoUploadImagem({ label, valor, pasta, aspecto, onChange }: CampoUploadImagemProps) {
  const [enviando, setEnviando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const alturaClasse = aspecto === "wide" ? "h-32" : "h-32 w-32";

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    if (!arquivo.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem");
      return;
    }

    if (arquivo.size > 2 * 1024 * 1024) {
      toast.error("Imagem deve ter no máximo 2MB");
      return;
    }

    setEnviando(true);

    const ext = arquivo.name.split(".").pop() ?? "jpg";
    const nomeArquivo = `${pasta}/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("branding")
      .upload(nomeArquivo, arquivo, { upsert: true });

    if (error) {
      toast.error("Erro ao enviar imagem");
      setEnviando(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("branding")
      .getPublicUrl(nomeArquivo);

    onChange(urlData.publicUrl);
    setEnviando(false);
    toast.success("Imagem enviada!");
  }

  function remover() {
    onChange("");
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />

      {valor ? (
        <div className="relative group">
          <img
            src={valor}
            alt={label}
            className={`${alturaClasse} w-full rounded-lg border border-border object-cover`}
          />
          <button
            type="button"
            onClick={remover}
            className="absolute top-2 right-2 rounded-full bg-background/80 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4 text-foreground" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={enviando}
          className={`${alturaClasse} w-full rounded-lg border-2 border-dashed border-border bg-card flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/40 transition-colors`}
        >
          {enviando ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <ImagePlus className="h-6 w-6" />
              <span className="text-xs">Clique para enviar</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
