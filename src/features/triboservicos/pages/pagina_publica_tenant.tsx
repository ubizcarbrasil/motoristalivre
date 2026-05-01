import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProvedorTenant } from "@/features/tenant/contexts/contexto_tenant";
import PaginaPassageiro from "@/features/passageiro/pages/pagina_passageiro";
import PaginaVitrineTenantServicos from "./pagina_vitrine_tenant_servicos";
import { TemaServicos } from "../components/tema_servicos";

type EstadoCarregamento = "carregando" | "servicos" | "mobility" | "nao_encontrado";

export default function PaginaPublicaTenant() {
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
      if (modulos.includes("services")) {
        setEstado("servicos");
      } else {
        setEstado("mobility");
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
      <TemaServicos>
        <div className="fixed inset-0 bg-background flex items-center justify-center px-6">
          <div className="text-center space-y-2">
            <p className="text-base font-medium text-foreground">Tribo não encontrada</p>
            <p className="text-sm text-muted-foreground">
              Verifique se o endereço está correto.
            </p>
          </div>
        </div>
      </TemaServicos>
    );
  }

  if (estado === "servicos") {
    return <PaginaVitrineTenantServicos />;
  }

  // mobility (fallback): renderiza página de corridas dentro do ProvedorTenant
  return (
    <ProvedorTenant>
      <PaginaPassageiro />
    </ProvedorTenant>
  );
}
