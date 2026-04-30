import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { TemaServicos } from "../components/tema_servicos";
import { AgendamentoServico } from "@/features/passageiro/components/agendamento_servico";
import { useDadosServicoMotorista } from "@/features/passageiro/hooks/hook_dados_servico_motorista";
import { resolverDriverVitrine } from "../services/servico_vitrine_publica";

export default function PaginaAgendamentoServicos() {
  const { slug, driver_slug } = useParams<{ slug: string; driver_slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [resolucao, setResolucao] = useState<{
    driverId: string;
    tenantId: string;
  } | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    if (!slug || !driver_slug) return;
    let cancelado = false;
    async function carregar() {
      const r = await resolverDriverVitrine(slug!, driver_slug!);
      if (cancelado) return;
      if (!r) {
        setErro(true);
        setCarregando(false);
        return;
      }
      setResolucao(r);
      setCarregando(false);
    }
    carregar();
    return () => {
      cancelado = true;
    };
  }, [slug, driver_slug]);

  const dados = useDadosServicoMotorista(resolucao?.driverId ?? null);

  if (carregando || (resolucao && dados.carregando)) {
    return (
      <TemaServicos>
        <div className="fixed inset-0 bg-background flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </TemaServicos>
    );
  }

  if (erro || !resolucao) {
    return (
      <TemaServicos>
        <div className="fixed inset-0 bg-background flex items-center justify-center px-6">
          <div className="text-center space-y-2">
            <p className="text-base font-medium text-foreground">
              Profissional não encontrado
            </p>
            <p className="text-sm text-muted-foreground">
              Verifique se o endereço está correto.
            </p>
          </div>
        </div>
      </TemaServicos>
    );
  }

  const tipo = dados.professional_type;
  if (tipo !== "service_provider" && tipo !== "both") {
    return (
      <TemaServicos>
        <div className="fixed inset-0 bg-background flex items-center justify-center px-6">
          <div className="text-center space-y-3 max-w-sm">
            <p className="text-base font-medium text-foreground">
              Este profissional não oferece serviços
            </p>
          </div>
        </div>
      </TemaServicos>
    );
  }

  const driverInfo = {
    id: resolucao.driverId,
    full_name: dados.full_name,
    avatar_url: dados.avatar_url,
    credential_verified: dados.credential_verified,
    credential_type: dados.credential_type,
    credential_number: dados.credential_number,
    tenant_slug: slug!,
    slug: driver_slug!,
  };

  return (
    <TemaServicos>
      <AgendamentoServico
        driver={driverInfo}
        tenantId={resolucao.tenantId}
        serviceTypes={dados.serviceTypes}
        availability={dados.availability}
        preSelectedServiceId={searchParams.get("servico")}
        onVoltar={() => navigate(`/s/${slug}/${driver_slug}`)}
      />
    </TemaServicos>
  );
}
