import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type {
  TipoServico,
  DisponibilidadeProfissional,
  TipoProfissional,
} from "@/features/servicos/types/tipos_servicos";

interface DadosDriverServico {
  professional_type: TipoProfissional;
  full_name: string;
  avatar_url: string | null;
  credential_verified: boolean;
  credential_type: string | null;
  credential_number: string | null;
  serviceTypes: TipoServico[];
  availability: DisponibilidadeProfissional[];
  carregando: boolean;
}

/**
 * Carrega dados específicos de Serviços para o link público do passageiro.
 * Roda em paralelo ao fluxo de corrida sem alterá-lo.
 */
export function useDadosServicoMotorista(driverId: string | null | undefined): DadosDriverServico {
  const [estado, setEstado] = useState<DadosDriverServico>({
    professional_type: "driver",
    full_name: "",
    avatar_url: null,
    credential_verified: false,
    credential_type: null,
    credential_number: null,
    serviceTypes: [],
    availability: [],
    carregando: true,
  });

  useEffect(() => {
    if (!driverId) {
      setEstado((s) => ({ ...s, carregando: false }));
      return;
    }
    let cancelado = false;

    async function carregar() {
      const { data: driver } = await supabase
        .from("drivers")
        .select("professional_type, credential_verified, credential_type, credential_number")
        .eq("id", driverId!)
        .maybeSingle();

      const tipo = ((driver as any)?.professional_type as TipoProfissional) ?? "driver";

      const { data: usuario } = await supabase
        .from("users")
        .select("full_name, avatar_url")
        .eq("id", driverId!)
        .maybeSingle();

      let serviceTypes: TipoServico[] = [];
      let availability: DisponibilidadeProfissional[] = [];

      if (tipo === "service_provider" || tipo === "both") {
        const [{ data: servs }, { data: avail }] = await Promise.all([
          supabase
            .from("service_types" as any)
            .select("*")
            .eq("driver_id", driverId!)
            .eq("is_active", true)
            .order("created_at", { ascending: true }),
          supabase
            .from("professional_availability" as any)
            .select("*")
            .eq("driver_id", driverId!)
            .eq("is_active", true)
            .order("day_of_week", { ascending: true })
            .order("start_time", { ascending: true }),
        ]);
        serviceTypes = (servs ?? []) as unknown as TipoServico[];
        availability = (avail ?? []) as unknown as DisponibilidadeProfissional[];
      }

      if (cancelado) return;
      setEstado({
        professional_type: tipo,
        full_name: usuario?.full_name ?? "Profissional",
        avatar_url: usuario?.avatar_url ?? null,
        credential_verified: !!(driver as any)?.credential_verified,
        credential_type: ((driver as any)?.credential_type as string) ?? null,
        credential_number: ((driver as any)?.credential_number as string) ?? null,
        serviceTypes,
        availability,
        carregando: false,
      });
    }

    carregar();
    return () => {
      cancelado = true;
    };
  }, [driverId]);

  return estado;
}
