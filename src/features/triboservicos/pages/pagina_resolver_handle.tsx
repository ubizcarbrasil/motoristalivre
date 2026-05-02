import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { resolverHandle } from "../services/servico_handles";

interface Props {
  /** Permite passar o handle diretamente (ex: vindo do ResolverPublicoTenant). */
  handle?: string;
}

/**
 * Resolve `@:handle` para a URL canônica `/s/:tenant_slug/:driver_slug`.
 * Aceita o handle via prop (preferencial) ou via param de rota.
 */
export default function PaginaResolverHandle({ handle: handleProp }: Props = {}) {
  const params = useParams<{ handle: string }>();
  const handleBruto = handleProp ?? params.handle;

  const [destino, setDestino] = useState<string | null>(null);
  const [naoEncontrado, setNaoEncontrado] = useState(false);

  useEffect(() => {
    if (!handleBruto) {
      setNaoEncontrado(true);
      return;
    }
    let limpo = handleBruto;
    try {
      limpo = decodeURIComponent(handleBruto);
    } catch {
      // mantém valor original se decode falhar
    }
    limpo = limpo.replace(/^@+/, "").trim().toLowerCase();
    if (!limpo) {
      setNaoEncontrado(true);
      return;
    }
    let cancelado = false;
    resolverHandle(limpo).then((res) => {
      if (cancelado) return;
      if (!res) {
        setNaoEncontrado(true);
        return;
      }
      setDestino(`/s/${res.tenant_slug}/${res.driver_slug}`);
    });
    return () => {
      cancelado = true;
    };
  }, [handleBruto]);

  if (naoEncontrado) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center px-6">
        <div className="text-center space-y-3 max-w-sm">
          <p className="text-base font-medium text-foreground">
            Perfil não encontrado
          </p>
          <p className="text-sm text-muted-foreground">
            O link que você acessou não corresponde a nenhum profissional ativo.
          </p>
          <a
            href="/"
            className="inline-block text-sm font-medium text-primary underline"
          >
            Voltar para a página inicial
          </a>
        </div>
      </div>
    );
  }

  if (!destino) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm">Carregando perfil…</div>
      </div>
    );
  }
  return <Navigate to={destino} replace />;
}
