import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  listarServicosPorMotorista,
  listarDisponibilidade,
  listarAgendamentosDoDia,
} from "../services/servico_servicos";
import type {
  TipoServico,
  DisponibilidadeProfissional,
  AgendamentoComCliente,
  TipoProfissional,
} from "../types/tipos_servicos";

interface DadosPerfilServico {
  professionalType: TipoProfissional;
  credentialVerified: boolean;
  credentialType: string | null;
  credentialNumber: string | null;
  servicos: TipoServico[];
  disponibilidade: DisponibilidadeProfissional[];
  agendaHoje: AgendamentoComCliente[];
  carregando: boolean;
  recarregar: () => Promise<void>;
}

export function useHookPerfilServico(driverId?: string | null): DadosPerfilServico {
  const [professionalType, setProfessionalType] = useState<TipoProfissional>("driver");
  const [credentialVerified, setCredentialVerified] = useState(false);
  const [credentialType, setCredentialType] = useState<string | null>(null);
  const [credentialNumber, setCredentialNumber] = useState<string | null>(null);
  const [servicos, setServicos] = useState<TipoServico[]>([]);
  const [disponibilidade, setDisponibilidade] = useState<DisponibilidadeProfissional[]>([]);
  const [agendaHoje, setAgendaHoje] = useState<AgendamentoComCliente[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    if (!driverId) {
      setCarregando(false);
      return;
    }
    setCarregando(true);
    try {
      const { data: driver } = await supabase
        .from("drivers")
        .select("professional_type, credential_verified, credential_type, credential_number")
        .eq("id", driverId)
        .maybeSingle();

      const tipo = ((driver as any)?.professional_type as TipoProfissional) ?? "driver";
      setProfessionalType(tipo);
      setCredentialVerified(!!(driver as any)?.credential_verified);
      setCredentialType(((driver as any)?.credential_type as string) ?? null);
      setCredentialNumber(((driver as any)?.credential_number as string) ?? null);

      if (tipo === "service_provider" || tipo === "both") {
        const [s, d, a] = await Promise.all([
          listarServicosPorMotorista(driverId),
          listarDisponibilidade(driverId),
          listarAgendamentosDoDia(driverId, new Date().toISOString()),
        ]);
        setServicos(s);
        setDisponibilidade(d);
        setAgendaHoje(a);
      } else {
        setServicos([]);
        setDisponibilidade([]);
        setAgendaHoje([]);
      }
    } catch (erro) {
      console.error("Erro carregando perfil de serviço:", erro);
    } finally {
      setCarregando(false);
    }
  }, [driverId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return {
    professionalType,
    credentialVerified,
    credentialType,
    credentialNumber,
    servicos,
    disponibilidade,
    agendaHoje,
    carregando,
    recarregar: carregar,
  };
}
