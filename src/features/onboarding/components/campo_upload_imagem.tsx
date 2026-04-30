import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface DimensoesMinimas {
  largura: number;
  altura: number;
}

interface CampoUploadImagemProps {
  label: string;
  valor: string;
  pasta: string;
  aspecto: "square" | "wide";
  dimensoesMinimas?: DimensoesMinimas;
  onChange: (url: string) => void;
}

function carregarImagem(arquivo: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(arquivo);
  });
}

export function CampoUploadImagem({ label, valor, pasta, aspecto, dimensoesMinimas, onChange }: CampoUploadImagemProps) {
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

    // Validar dimensões mínimas
    if (dimensoesMinimas) {
      try {
        const img = await carregarImagem(arquivo);
        const { largura, altura } = dimensoesMinimas;
        if (img.naturalWidth < largura || img.naturalHeight < altura) {
          toast.error(`Dimensões mínimas: ${largura}×${altura}px. Sua imagem: ${img.naturalWidth}×${img.naturalHeight}px`);
          URL.revokeObjectURL(img.src);
          return;
        }
        URL.revokeObjectURL(img.src);
      } catch {
        toast.error("Não foi possível ler as dimensões da imagem");
        return;
      }
    }

    setEnviando(true);

    // Durante o onboarding o usuário ainda não tem tenant_id.
    // Usamos o próprio userId como pasta de staging — a policy de INSERT
    // do bucket "branding" permite uploads de qualquer usuário autenticado.
    const { data: sessao } = await supabase.auth.getUser();
    const userId = sessao.user?.id;
    if (!userId) {
      toast.error("Sessão expirada. Faça login novamente.");
      setEnviando(false);
      return;
    }

    const { data: perfil } = await supabase
      .from("users")
      .select("tenant_id")
      .eq("id", userId)
      .maybeSingle();

    const pastaRaiz = perfil?.tenant_id ?? userId;
    const ext = arquivo.name.split(".").pop() ?? "jpg";
    const nomeArquivo = `${pastaRaiz}/${pasta}/${crypto.randomUUID()}.${ext}`;

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
      {dimensoesMinimas && (
        <p className="text-[10px] text-muted-foreground">
          Mín. {dimensoesMinimas.largura}×{dimensoesMinimas.altura}px
        </p>
      )}
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