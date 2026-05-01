import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProvedorTenant } from "@/features/tenant/contexts/contexto_tenant";
import PaginaPassageiro from "@/features/passageiro/pages/pagina_passageiro";

type EstadoCarregamento = "carregando" | "ok" | "modulo_incorreto" | "nao_encontrado";

/**
 * Rota /m/:slug — EXCLUSIVA do módulo de Mobilidade.
 *
 * Se a tribo tem apenas 'services' ativo, mostra mensagem clara apontando
 * para o link de serviços (/s/{slug}).
 */
export default function PaginaPublicaMobilidade() {
  const { slug } = useParams<{ slug: string }>();
  const [estado, setEstado] = useState<EstadoCarregamento>("carregando");

  useEffect(() => {
    if (!slug) {
      setEstado("nao_encontrado");
      return;
    }
    let cancelado = false;
    async function resolverModulo() {
      const { data, error } = await supabase
        .from("tenants")
        .select("active_modules")
        .eq("slug", slug!)
        .maybeSingle();

      if (cancelado) return;

      if (error || !data) {
        setEstado("nao_encontrado");
        return;
      }

      const modulos = (data.active_modules ?? []) as string[];
      // Mobilidade é o módulo padrão; aceita se contiver 'mobility' OU se não contiver 'services'
      if (modulos.includes("mobility") || !modulos.includes("services")) {
        setEstado("ok");
      } else {
        setEstado("modulo_incorreto");
      }
    }
    resolverModulo();
    return () => {
      cancelado = true;
    };
  }, [slug]);

  if (estado === "carregando") {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (estado === "nao_encontrado") {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center px-6">
        <div className="text-center space-y-2">
          <p className="text-base font-medium text-foreground">Tribo não encontrada</p>
          <p className="text-sm text-muted-foreground">
            Verifique se o endereço está correto.
          </p>
        </div>
      </div>
    );
  }

  if (estado === "modulo_incorreto") {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center px-6">
        <div className="text-center space-y-3 max-w-sm">
          <p className="text-base font-medium text-foreground">
            Esta tribo não oferece corridas
          </p>
          <p className="text-sm text-muted-foreground">
            O link público desta tribo é o de serviços. Acesse:
          </p>
          <a
            href={`/s/${slug}`}
            className="inline-block text-sm font-medium text-primary underline"
          >
            /s/{slug}
          </a>
        </div>
      </div>
    );
  }

  return (
    <ProvedorTenant>
      <PaginaPassageiro />
    </ProvedorTenant>
  );
}
