import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AgendamentoServico } from "@/features/passageiro/components/agendamento_servico";
import { useDadosServicoMotorista } from "@/features/passageiro/hooks/hook_dados_servico_motorista";
import { TemaServicos } from "@/features/triboservicos/components/tema_servicos";

interface ResolucaoMotorista {
  driverId: string;
  tenantId: string;
  motoristaSlug: string;
  tenantSlug: string;
}

export default function PaginaServicosMotorista() {
  const { slug, driver_slug } = useParams<{ slug: string; driver_slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [resolucao, setResolucao] = useState<ResolucaoMotorista | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    if (!slug || !driver_slug) return;
    let cancelado = false;
    async function resolver() {
      const { data: tenant } = await supabase
        .from("tenants")
        .select("id")
        .eq("slug", slug!)
        .maybeSingle();
      if (!tenant) {
        if (!cancelado) {
          setErro(true);
          setCarregando(false);
        }
        return;
      }
      const { data: driver } = await supabase
        .from("drivers")
        .select("id")
        .eq("slug", driver_slug!)
        .eq("tenant_id", tenant.id)
        .maybeSingle();
      if (!driver) {
        if (!cancelado) {
          setErro(true);
          setCarregando(false);
        }
        return;
      }
      if (cancelado) return;
      setResolucao({
        driverId: driver.id,
        tenantId: tenant.id,
        motoristaSlug: driver_slug!,
        tenantSlug: slug!,
      });
      setCarregando(false);
    }
    resolver();
    return () => {
      cancelado = true;
    };
  }, [slug, driver_slug]);

  const dados = useDadosServicoMotorista(resolucao?.driverId ?? null);

  if (carregando || (resolucao && dados.carregando)) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (erro || !resolucao) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center px-6">
        <div className="text-center space-y-2">
          <p className="text-base font-medium text-foreground">Profissional não encontrado</p>
          <p className="text-sm text-muted-foreground">Verifique se o endereço está correto.</p>
        </div>
      </div>
    );
  }

  const tipo = dados.professional_type;
  if (tipo !== "service_provider" && tipo !== "both") {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center px-6">
        <div className="text-center space-y-3 max-w-sm">
          <p className="text-base font-medium text-foreground">
            Este profissional ainda não oferece serviços
          </p>
          <p className="text-sm text-muted-foreground">
            Tente novamente mais tarde ou entre em contato com a tribo.
          </p>
        </div>
      </div>
    );
  }

  const driverInfo = {
    id: resolucao.driverId,
    full_name: dados.full_name,
    avatar_url: dados.avatar_url,
    credential_verified: dados.credential_verified,
    credential_type: dados.credential_type,
    credential_number: dados.credential_number,
    tenant_slug: resolucao.tenantSlug,
    slug: resolucao.motoristaSlug,
  };

  return (
    <AgendamentoServico
      driver={driverInfo}
      tenantId={resolucao.tenantId}
      serviceTypes={dados.serviceTypes}
      availability={dados.availability}
      preSelectedServiceId={searchParams.get("servico")}
      onVoltar={() => navigate(`/${resolucao.tenantSlug}/servicos`)}
    />
  );
}
