import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { resolverHandle } from "../services/servico_handles";

/**
 * Resolve `/@:handle` para a URL canônica `/s/:tenant_slug/:driver_slug`.
 * Faz redirect 301-equivalente (replace) para preservar SEO.
 */
export default function PaginaResolverHandle() {
  const { handle } = useParams<{ handle: string }>();
  const [destino, setDestino] = useState<string | null>(null);
  const [naoEncontrado, setNaoEncontrado] = useState(false);

  useEffect(() => {
    if (!handle) {
      setNaoEncontrado(true);
      return;
    }
    let handleLimpo = handle;
    try {
      handleLimpo = decodeURIComponent(handle);
    } catch {
      // mantém valor original se decode falhar
    }
    handleLimpo = handleLimpo.replace(/^@+/, "").trim();
    if (!handleLimpo) {
      setNaoEncontrado(true);
      return;
    }
    resolverHandle(handleLimpo).then((res) => {
      if (!res) {
        setNaoEncontrado(true);
        return;
      }
      setDestino(`/s/${res.tenant_slug}/${res.driver_slug}`);
    });
  }, [handle]);

  if (naoEncontrado) return <Navigate to="/404" replace />;
  if (!destino) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm">Carregando perfil…</div>
      </div>
    );
  }
  return <Navigate to={destino} replace />;
}
