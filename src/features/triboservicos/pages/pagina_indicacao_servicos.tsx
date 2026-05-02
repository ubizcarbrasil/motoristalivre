import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TemaServicos } from "../components/tema_servicos";
import { gravarOrigemIndicacao } from "../services/servico_origem_indicacao";

/**
 * Rota /s/:slug/a/:driver_slug — link de indicação de serviços.
 *
 * Marca o driver_slug informado como origem da indicação na sessão e
 * redireciona o visitante para a vitrine do grupo. Os agendamentos
 * subsequentes gravam o origin_driver_id correspondente para comissão.
 */
export default function PaginaIndicacaoServicos() {
  const { slug, driver_slug } = useParams<{ slug: string; driver_slug: string }>();
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    if (!slug || !driver_slug) {
      setErro(true);
      return;
    }
    let cancelado = false;

    async function resolver() {
      const { data: tenant, error: erroTenant } = await supabase
        .from("tenants")
        .select("id, active_modules")
        .eq("slug", slug!)
        .maybeSingle();

      if (cancelado) return;
      if (erroTenant || !tenant) {
        setErro(true);
        return;
      }

      const { data: driver, error: erroDriver } = await supabase
        .from("drivers")
        .select("id")
        .eq("tenant_id", tenant.id)
        .eq("slug", driver_slug!)
        .maybeSingle();

      if (cancelado) return;
      if (erroDriver || !driver) {
        setErro(true);
        return;
      }

      gravarOrigemIndicacao({
        origin_driver_id: driver.id,
        origin_driver_slug: driver_slug!,
        tenant_slug: slug!,
      });
      setPronto(true);
    }

    resolver();
    return () => {
      cancelado = true;
    };
  }, [slug, driver_slug]);

  if (erro) {
    return (
      <TemaServicos>
        <div className="fixed inset-0 bg-background flex items-center justify-center px-6">
          <div className="text-center space-y-2">
            <p className="text-base font-medium text-foreground">
              Indicação inválida
            </p>
            <p className="text-sm text-muted-foreground">
              O link que você abriu não está mais disponível.
            </p>
          </div>
        </div>
      </TemaServicos>
    );
  }

  if (pronto) {
    return <Navigate to={`/s/${slug}`} replace />;
  }

  return (
    <TemaServicos>
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    </TemaServicos>
  );
}
