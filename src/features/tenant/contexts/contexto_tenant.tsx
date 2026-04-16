import { createContext, useEffect, useState, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import type { Tenant, ContextoTenantTipo } from "../types/tipos_tenant";
import { buscarTenantPorSlug } from "../services/servico_tenant";

export const ContextoTenant = createContext<ContextoTenantTipo>({
  tenant: null,
  carregando: true,
});

function extrairSlugDoSubdominio(): string | null {
  const hostname = window.location.hostname;
  const partes = hostname.split(".");
  if (partes.length >= 3) {
    const subdominio = partes[0];
    if (subdominio !== "www" && subdominio !== "app") {
      return subdominio;
    }
  }
  return null;
}

interface ProvedorTenantProps {
  children: ReactNode;
}

export function ProvedorTenant({ children }: ProvedorTenantProps) {
  const params = useParams<{ slug?: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const slug = params.slug || extrairSlugDoSubdominio();

    if (!slug) {
      setCarregando(false);
      return;
    }

    setCarregando(true);
    buscarTenantPorSlug(slug)
      .then((resultado) => {
        setTenant(resultado);
      })
      .catch(() => {
        setTenant(null);
      })
      .finally(() => {
        setCarregando(false);
      });
  }, [params.slug]);

  return (
    <ContextoTenant.Provider value={{ tenant, carregando }}>
      {children}
    </ContextoTenant.Provider>
  );
}
