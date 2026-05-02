import { Button } from "@/components/ui/button";
import { Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ModuloPlataforma } from "../types/tipos_onboarding";

interface EtapaConvitesProps {
  subdominio: string;
  onFinalizar: () => void;
  enviando: boolean;
  modulos?: ModuloPlataforma[];
}

function CampoLink({ titulo, descricao, link }: { titulo: string; descricao: string; link: string }) {
  const copiar = async () => {
    await navigator.clipboard.writeText(link);
    toast.success("Link copiado");
  };

  const compartilharWhatsApp = () => {
    const texto = encodeURIComponent(`Acesse: ${link}`);
    window.open(`https://wa.me/?text=${texto}`, "_blank");
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div>
        <p className="text-sm font-medium text-foreground">{titulo}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{descricao}</p>
      </div>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-xs bg-secondary rounded-lg px-3 py-2 text-foreground truncate">
          {link}
        </code>
        <Button variant="outline" size="icon" onClick={copiar} title="Copiar">
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      <Button variant="outline" className="w-full" onClick={compartilharWhatsApp}>
        Compartilhar via WhatsApp
      </Button>
    </div>
  );
}

export function EtapaConvites({ subdominio, onFinalizar, enviando, modulos }: EtapaConvitesProps) {
  const baseUrl = `${subdominio}.tribocar.com`;
  const temMobilidade = !modulos || modulos.includes("mobility");
  const temServicos = !!modulos?.includes("services");
  const modoServicosPuro = temServicos && !temMobilidade;

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Convide sua equipe</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {modoServicosPuro
            ? "Compartilhe o link abaixo para adicionar profissionais ao seu grupo."
            : "Compartilhe os links abaixo para adicionar motoristas e afiliados ao seu grupo."}
        </p>
      </div>

      <div className="space-y-4">
        {modoServicosPuro ? (
          <CampoLink
            titulo="Link para profissionais"
            descricao="Envie para profissionais que desejam se cadastrar no grupo."
            link={`https://${baseUrl}/cadastro?tipo=profissional`}
          />
        ) : (
          <>
            <CampoLink
              titulo="Link para motoristas"
              descricao="Envie para motoristas que desejam se cadastrar no grupo."
              link={`https://${baseUrl}/cadastro?tipo=motorista`}
            />
            <CampoLink
              titulo="Link para afiliados"
              descricao="Envie para parceiros que desejam indicar passageiros."
              link={`https://${baseUrl}/cadastro?tipo=afiliado`}
            />
          </>
        )}
      </div>

      <Button onClick={onFinalizar} disabled={enviando} className="w-full">
        {enviando ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Criando grupo...
          </>
        ) : (
          "Finalizar e acessar painel"
        )}
      </Button>
    </div>
  );
}
