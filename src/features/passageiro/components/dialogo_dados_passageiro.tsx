import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { aplicarMascaraWhatsapp, whatsappValido } from "../utils/mascara_whatsapp";

export interface DadosGuestInput {
  nome: string;
  whatsapp: string;
}

interface DialogoDadosPassageiroProps {
  aberto: boolean;
  onFechar: () => void;
  onConfirmar: (dados: DadosGuestInput) => Promise<void> | void;
  enviando?: boolean;
  textoBotao?: string;
  titulo?: string;
  descricao?: string;
  valorInicial?: { nome?: string; whatsapp?: string };
}

export function DialogoDadosPassageiro({
  aberto,
  onFechar,
  onConfirmar,
  enviando = false,
  textoBotao = "Chamar motorista",
  titulo = "Quase lá!",
  descricao = "Para o motorista entrar em contato, deixe seu nome e WhatsApp.",
  valorInicial,
}: DialogoDadosPassageiroProps) {
  const [nome, setNome] = useState(valorInicial?.nome ?? "");
  const [whatsapp, setWhatsapp] = useState(valorInicial?.whatsapp ?? "");
  const [erro, setErro] = useState<string | null>(null);

  const podeEnviar = nome.trim().length >= 2 && whatsappValido(whatsapp);

  const enviar = async () => {
    setErro(null);
    if (!podeEnviar) {
      setErro("Preencha nome e WhatsApp válido.");
      return;
    }
    await onConfirmar({ nome: nome.trim(), whatsapp });
  };

  return (
    <Dialog open={aberto} onOpenChange={(o) => !o && !enviando && onFechar()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quase lá!</DialogTitle>
          <DialogDescription>
            Para o motorista entrar em contato, deixe seu nome e WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="guest-nome">Seu nome</Label>
            <Input
              id="guest-nome"
              autoFocus
              placeholder="Como o motorista vai te chamar"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={enviando}
              maxLength={60}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="guest-whatsapp">WhatsApp</Label>
            <Input
              id="guest-whatsapp"
              inputMode="tel"
              placeholder="(11) 99999-9999"
              value={whatsapp}
              onChange={(e) => setWhatsapp(aplicarMascaraWhatsapp(e.target.value))}
              disabled={enviando}
            />
          </div>

          {erro && <p className="text-sm text-destructive">{erro}</p>}

          <Button
            onClick={enviar}
            disabled={!podeEnviar || enviando}
            className="w-full h-12 font-semibold"
          >
            {enviando ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Chamar motorista
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Ao chamar, você concorda em compartilhar nome e WhatsApp com o motorista.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
