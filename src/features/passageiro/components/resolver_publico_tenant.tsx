import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Estado =
  | "carregando"
  | "ok"
  | "redirecionar_servicos"
  | "redirecionar_handle"
  | "nao_encontrado";

interface Props {
  children: ReactNode;
}

/**
 * Resolve o link público "/:slug" baseado no módulo da tribo:
 * - slug começa com "@" (ou "%40") → trata como handle e redireciona para "/@:handle"
 * - tribo só de services → redireciona pra "/s/:slug" (vitrine de serviços)
 * - tribo de mobility (ou hibrida) → renderiza children (PaginaPassageiro)
 * Evita que clientes de uma tribo de serviços vejam UI de corridas.
 */
export function ResolverPublicoTenant({ children }: Props) {
  const { slug } = useParams<{ slug: string }>();
  const [estado, setEstado] = useState<Estado>("carregando");
  const [handleDetectado, setHandleDetectado] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setEstado("nao_encontrado");
      return;
    }

    let slugDecodificado = slug;
    try {
      slugDecodificado = decodeURIComponent(slug);
    } catch {
      // mantém valor original
    }

    // Intercepta handles que chegaram via /:slug por encoding (%40) ou ranking de rota
    if (slugDecodificado.startsWith("@")) {
      setHandleDetectado(slugDecodificado.replace(/^@+/, ""));
      setEstado("redirecionar_handle");
      return;
    }

    let cancelado = false;
    async function resolver() {
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
      const temMobilidade = modulos.includes("mobility");
      const temServicos = modulos.includes("services");

      if (!temMobilidade && temServicos) {
        setEstado("redirecionar_servicos");
        return;
      }
      setEstado("ok");
    }
    resolver();
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

  if (estado === "redirecionar_handle" && handleDetectado) {
    return <Navigate to={`/@${handleDetectado}`} replace />;
  }

  if (estado === "redirecionar_servicos") {
    return <Navigate to={`/s/${slug}`} replace />;
  }

  // "nao_encontrado" deixa a página de passageiro mostrar o erro próprio
  return <>{children}</>;
}
