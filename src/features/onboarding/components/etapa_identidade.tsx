import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useValidarSubdominio } from "../hooks/hook_validar_subdominio";
import { CampoUploadImagem } from "./campo_upload_imagem";
import type { DadosIdentidade } from "../types/tipos_onboarding";
import { Loader2, Check, X } from "lucide-react";

interface EtapaIdentidadeProps {
  dados: DadosIdentidade;
  onChange: (dados: DadosIdentidade) => void;
  onAvancar: () => void;
}

function StatusSubdominio({ status }: { status: string }) {
  if (status === "validando") return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  if (status === "disponivel") return <Check className="h-4 w-4 text-primary" />;
  if (status === "indisponivel") return <X className="h-4 w-4 text-destructive" />;
  return null;
}

function mensagemStatus(status: string): string | null {
  switch (status) {
    case "disponivel": return "Subdomínio disponível";
    case "indisponivel": return "Subdomínio já está em uso";
    case "invalido": return "Mínimo 3 caracteres, apenas letras, números e hífen";
    default: return null;
  }
}

export function EtapaIdentidade({ dados, onChange, onAvancar }: EtapaIdentidadeProps) {
  const statusSubdominio = useValidarSubdominio(dados.subdominio);

  const atualizar = (campo: keyof DadosIdentidade, valor: string) => {
    onChange({ ...dados, [campo]: valor });
  };

  const podeContinuar = dados.nome.trim().length > 0
    && dados.subdominio.trim().length >= 3
    && statusSubdominio === "disponivel";

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center md:text-left">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Identidade do grupo</h2>
        <p className="text-sm text-muted-foreground mt-1.5">
          Defina o nome e as informações básicas do seu grupo.
        </p>
      </div>

      {/* Card 1: Identidade essencial */}
      <section className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome do grupo</Label>
          <Input
            id="nome"
            placeholder="Ex: Tribo Recife"
            value={dados.nome}
            onChange={(e) => atualizar("nome", e.target.value)}
            maxLength={60}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subdominio">Subdomínio</Label>
          <div className="relative">
            <Input
              id="subdominio"
              placeholder="triborecife"
              value={dados.subdominio}
              onChange={(e) => atualizar("subdominio", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              maxLength={30}
              className="pr-10 h-11"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <StatusSubdominio status={statusSubdominio} />
            </div>
          </div>
          <p className={`text-xs ${statusSubdominio === "disponivel" ? "text-primary" : statusSubdominio === "indisponivel" || statusSubdominio === "invalido" ? "text-destructive" : "text-muted-foreground"}`}>
            {mensagemStatus(statusSubdominio) ?? `${dados.subdominio || "seugrupo"}.tribocar.com`}
          </p>
        </div>
      </section>

      {/* Card 2: Contato */}
      <section className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cidade">Cidade</Label>
          <Input
            id="cidade"
            placeholder="Ex: Recife, PE"
            value={dados.cidade}
            onChange={(e) => atualizar("cidade", e.target.value)}
            maxLength={60}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            type="tel"
            inputMode="tel"
            placeholder="(81) 99999-9999"
            value={dados.whatsapp}
            onChange={(e) => atualizar("whatsapp", e.target.value)}
            maxLength={20}
            className="h-11"
          />
        </div>
      </section>

      {/* Card 3: Visual */}
      <section className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <CampoUploadImagem
            label="Logo"
            valor={dados.logoUrl}
            pasta="logos"
            aspecto="square"
            dimensoesMinimas={{ largura: 200, altura: 200 }}
            onChange={(url) => atualizar("logoUrl", url)}
          />
          <CampoUploadImagem
            label="Imagem de capa"
            valor={dados.capaUrl}
            pasta="capas"
            aspecto="wide"
            dimensoesMinimas={{ largura: 800, altura: 300 }}
            onChange={(url) => atualizar("capaUrl", url)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            placeholder="Breve descrição sobre o grupo..."
            value={dados.descricao}
            onChange={(e) => atualizar("descricao", e.target.value)}
            maxLength={300}
            rows={3}
          />
          <p className="text-[11px] text-muted-foreground text-right tabular-nums">
            {dados.descricao.length}/300
          </p>
        </div>
      </section>

      <Button
        onClick={onAvancar}
        disabled={!podeContinuar}
        size="lg"
        className="w-full h-12 text-base font-semibold rounded-xl"
      >
        Continuar
      </Button>
    </div>
  );
}

