import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAutenticacao } from "@/features/autenticacao/hooks/hook_autenticacao";
import type {
  DadosMotorista,
  DadosAfiliado,
  ConfigPreco,
  TipoOrigem,
  EnderecoCompleto,
  DadosRota,
  EtapaSolicitacao,
  PrecoCalculado,
  FormaPagamento,
} from "../types/tipos_passageiro";
import {
  buscarMotorista,
  buscarAfiliado,
  buscarConfigPreco,
  buscarRota,
  calcularPreco,
  buscarTenantPorSlug,
} from "../services/servico_passageiro";
import { OPCOES_VEICULOS } from "../constants/constantes_passageiro";

export function useSolicitacao() {
  const params = useParams<{ slug: string; driver_slug?: string; affiliate_slug?: string }>();
  const { usuario } = useAutenticacao();

  const tipoOrigem: TipoOrigem = params.affiliate_slug ? "afiliado" : "motorista";
  const slugPerfil = params.affiliate_slug || params.driver_slug || "";

  const [motorista, setMotorista] = useState<DadosMotorista | null>(null);
  const [afiliado, setAfiliado] = useState<DadosAfiliado | null>(null);
  const [configPreco, setConfigPreco] = useState<ConfigPreco | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [tenantSemMotorista, setTenantSemMotorista] = useState<string | null>(null);

  const [origem, setOrigem] = useState<EnderecoCompleto | null>(null);
  const [destino, setDestino] = useState<EnderecoCompleto | null>(null);
  const [rota, setRota] = useState<DadosRota | null>(null);
  const [carregandoRota, setCarregandoRota] = useState(false);

  const [etapa, setEtapa] = useState<EtapaSolicitacao>("endereco");
  const [veiculoSelecionado, setVeiculoSelecionado] = useState("compacto");
  const [valorOferta, setValorOferta] = useState<number>(0);
  const [precos, setPrecos] = useState<PrecoCalculado[]>([]);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("dinheiro");
  const [confirmando, setConfirmando] = useState(false);
  const [rideRequestId, setRideRequestId] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      try {
        setCarregando(true);
        setTenantSemMotorista(null);

        // Caso especial: rota /:slug sem driver_slug nem affiliate_slug
        if (params.slug && !params.driver_slug && !params.affiliate_slug) {
          const tenant = await buscarTenantPorSlug(params.slug);
          if (!tenant) { setErro(true); return; }
          setTenantSemMotorista(params.slug);
          return;
        }

        if (tipoOrigem === "motorista" && params.slug) {
          const m = await buscarMotorista(params.slug, slugPerfil);
          if (!m) { setErro(true); return; }
          setMotorista(m);
          const config = await buscarConfigPreco(m.tenant_id);
          setConfigPreco(config);
        } else if (tipoOrigem === "afiliado" && params.slug) {
          const a = await buscarAfiliado(params.slug, slugPerfil);
          if (!a) { setErro(true); return; }
          setAfiliado(a);
          const config = await buscarConfigPreco(a.tenant_id);
          setConfigPreco(config);
        }
      } catch {
        setErro(true);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [params.slug, params.driver_slug, params.affiliate_slug, slugPerfil, tipoOrigem]);

  const buscarRotaCallback = useCallback(async () => {
    if (!origem || !destino || !configPreco) return;

    setCarregandoRota(true);
    const rotaResult = await buscarRota(origem.coordenada, destino.coordenada);
    if (rotaResult) {
      setRota(rotaResult);
      const precosCalc = OPCOES_VEICULOS.map((v) => ({
        veiculo: v,
        preco: calcularPreco(configPreco, rotaResult.distancia_km, rotaResult.duracao_min, v.multiplicador),
      }));
      setPrecos(precosCalc);
      const precoCompacto = precosCalc.find((p) => p.veiculo.id === "compacto");
      setValorOferta(Math.round(precoCompacto?.preco ?? 0));
      setEtapa("veiculo");
    }
    setCarregandoRota(false);
  }, [origem, destino, configPreco]);

  const tenantId = motorista?.tenant_id ?? afiliado?.tenant_id ?? null;
  const grupoNome = motorista?.grupo_nome ?? afiliado?.grupo_nome ?? "";

  const confirmarCorrida = useCallback(async () => {
    if (!usuario || !tenantId || !origem || !destino || !rota) {
      toast.error("Faça login para solicitar uma corrida");
      return;
    }
    setConfirmando(true);
    try {
      // Garante que o usuário logado existe como passageiro neste tenant
      const { error: errPassenger } = await supabase.rpc("ensure_passenger", {
        _tenant_id: tenantId,
      });
      if (errPassenger) throw errPassenger;

      const { data, error } = await supabase
        .from("ride_requests")
        .insert({
          tenant_id: tenantId,
          passenger_id: usuario.id,
          origin_type: motorista ? "driver_link" : "affiliate_link",
          origin_driver_id: motorista?.id ?? null,
          origin_affiliate_id: afiliado?.id ?? null,
          origin_lat: origem.coordenada.lat,
          origin_lng: origem.coordenada.lng,
          origin_address: origem.endereco,
          dest_lat: destino.coordenada.lat,
          dest_lng: destino.coordenada.lng,
          dest_address: destino.endereco,
          distance_km: rota.distancia_km,
          estimated_min: rota.duracao_min,
          offered_price: valorOferta,
          suggested_price: valorOferta,
          payment_method: formaPagamento,
          status: "pending",
        })
        .select("id")
        .single();

      if (error) throw error;
      setRideRequestId(data.id);
      setEtapa("buscando");
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string; details?: string; hint?: string };
      const code = err?.code ? ` [${err.code}]` : "";
      const msg = err?.message ?? "Erro desconhecido";
      toast.error(`Erro ao solicitar corrida${code}: ${msg}`);
      console.error("[solicitar corrida]", e);
    } finally {
      setConfirmando(false);
    }
  }, [usuario, tenantId, origem, destino, rota, motorista, afiliado, valorOferta, formaPagamento]);

  const voltarParaEnderecos = useCallback(() => {
    setEtapa("endereco");
    setRota(null);
    setPrecos([]);
  }, []);

  const irParaCorridaAceita = useCallback(() => {
    setEtapa("aceita");
  }, []);

  const resetarSolicitacao = useCallback(() => {
    setEtapa("endereco");
    setRota(null);
    setPrecos([]);
    setOrigem(null);
    setDestino(null);
    setRideRequestId(null);
    setValorOferta(0);
  }, []);

  return {
    tipoOrigem,
    motorista,
    afiliado,
    configPreco,
    carregando,
    erro,
    tenantSemMotorista,
    origem,
    setOrigem,
    destino,
    setDestino,
    rota,
    carregandoRota,
    buscarRotaCallback,
    etapa,
    setEtapa,
    veiculoSelecionado,
    setVeiculoSelecionado,
    valorOferta,
    setValorOferta,
    precos,
    formaPagamento,
    setFormaPagamento,
    confirmarCorrida,
    voltarParaEnderecos,
    confirmando,
    tenantId,
    grupoNome,
    rideRequestId,
    irParaCorridaAceita,
    resetarSolicitacao,
    passengerId: usuario?.id,
  };
}
