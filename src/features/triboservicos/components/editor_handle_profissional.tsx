import { useEffect, useState } from "react";
import { AtSign, Check, Copy, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAutenticacao } from "@/features/autenticacao/hooks/hook_autenticacao";
import {
  atualizarHandle,
  buscarHandle,
} from "@/features/triboservicos/services/servico_handles";
import { useValidacaoHandle } from "@/features/triboservicos/hooks/hook_validacao_handle";

/**
 * Editor de @handle no painel do profissional. Mostra disponibilidade em tempo real
 * e permite copiar a URL pública resultante.
 */
export function EditorHandleProfissional() {
  const { usuario } = useAutenticacao();
  const { toast } = useToast();
  const [handleAtual, setHandleAtual] = useState<string | null>(null);
  const [valor, setValor] = useState("");
  const [salvando, setSalvando] = useState(false);
  const { estado } = useValidacaoHandle(valor, usuario?.id);

  useEffect(() => {
    if (!usuario?.id) return;
    buscarHandle(usuario.id).then((h) => {
      setHandleAtual(h);
      setValor(h ?? "");
    });
  }, [usuario?.id]);

  async function salvar() {
    if (!usuario?.id) return;
    setSalvando(true);
    const res = await atualizarHandle(usuario.id, valor);
    setSalvando(false);
    if (!res.ok) {
      toast({
        title: "Não foi possível salvar",
        description: res.erro ?? "Tente outro handle.",
        variant: "destructive",
      });
      return;
    }
    setHandleAtual(valor.replace(/^@/, "").trim().toLowerCase());
    toast({ title: "Handle atualizado", description: `Seu link agora é @${valor}` });
  }

  function copiarLink() {
    if (!handleAtual) return;
    const url = `${window.location.origin}/@${handleAtual}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copiado", description: url });
  }

  const podeSalvar =
    estado === "disponivel" &&
    valor.replace(/^@/, "").trim().toLowerCase() !== handleAtual;

  return (
    <Card className="p-5 space-y-4 border-border/60">
      <div className="space-y-1">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <AtSign className="w-4 h-4 text-primary" /> Seu @handle
        </h3>
        <p className="text-xs text-muted-foreground">
          URL curta e fácil de compartilhar. Ex.:{" "}
          <span className="font-mono">/@joao-eletricista</span>
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="handle">Handle</Label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              @
            </span>
            <Input
              id="handle"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="joao-eletricista"
              className="pl-7 font-mono"
              autoComplete="off"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {estado === "verificando" && (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              )}
              {estado === "disponivel" && (
                <Check className="w-4 h-4 text-primary" />
              )}
              {(estado === "indisponivel" || estado === "invalido") && (
                <X className="w-4 h-4 text-destructive" />
              )}
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground min-h-4">
          {estado === "invalido" &&
            "Use 3-30 caracteres: letras minúsculas, números, hífen ou underscore."}
          {estado === "indisponivel" && "Esse handle já está em uso."}
          {estado === "disponivel" && "Disponível!"}
          {estado === "verificando" && "Verificando disponibilidade…"}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={salvar} disabled={!podeSalvar || salvando}>
          {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar handle"}
        </Button>
        {handleAtual && (
          <Button variant="outline" onClick={copiarLink}>
            <Copy className="w-4 h-4 mr-2" />
            Copiar link público
          </Button>
        )}
      </div>
    </Card>
  );
}
