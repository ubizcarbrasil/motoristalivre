import { useState, useEffect, useCallback, useRef } from "react";
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
  criarCorridaGuest,
} from "../services/servico_passageiro";
import { OPCOES_VEICULOS } from "../constants/constantes_passageiro";

const STORAGE_KEY_GUEST = "tribocar_guest_ride";
const STORAGE_KEY_GUEST_DADOS = "tribocar_guest_dados";

interface GuestRideStorage {
  guest_passenger_id: string;
  ride_request_id: string;
  tenant_id: string;
  created_at: number;
}

interface GuestDadosStorage {
  nome: string;
  whatsapp: string;
}

function carregarGuestStorage(): GuestRideStorage | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GUEST);
    if (!raw) return null;
    const obj = JSON.parse(raw) as GuestRideStorage;
    if (Date.now() - obj.created_at > 2 * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEY_GUEST);
      return null;
    }
    return obj;
  } catch {
    return null;
  }
}

function carregarGuestDados(): GuestDadosStorage | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GUEST_DADOS);
    if (!raw) return null;
    return JSON.parse(raw) as GuestDadosStorage;
  } catch {
    return null;
  }
}

function salvarGuestDados(dados: GuestDadosStorage) {
  try {
    localStorage.setItem(STORAGE_KEY_GUEST_DADOS, JSON.stringify(dados));
  } catch {
    // ignore
  }
}

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
  const [guestPassengerId, setGuestPassengerId] = useState<string | null>(null);
  const [precisaDadosGuest, setPrecisaDadosGuest] = useState(false);
  const [dadosGuest, setDadosGuest] = useState<GuestDadosStorage | null>(() => carregarGuestDados());
  const [cancelando, setCancelando] = useState(false);

  useEffect(() => {
    async function carregar() {
      try {
        setCarregando(true);
        setTenantSemMotorista(null);

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

  // Restaura corrida guest do localStorage (ex.: refresh enquanto buscando)
  useEffect(() => {
    if (usuario) return;
    const tenantAtual = motorista?.tenant_id ?? afiliado?.tenant_id ?? null;
    if (!tenantAtual) return;

    const armazenado = carregarGuestStorage();
    if (armazenado && armazenado.tenant_id === tenantAtual) {
      setGuestPassengerId(armazenado.guest_passenger_id);
      setRideRequestId(armazenado.ride_request_id);
      setEtapa("buscando");
    }
  }, [usuario, motorista?.tenant_id, afiliado?.tenant_id]);

  // Vincula passageiro autenticado à tribo na primeira vez que abre o link
  // e mostra boas-vindas com o nome do grupo
  useEffect(() => {
    if (!usuario) return;
    const tenantAtual = motorista?.tenant_id ?? afiliado?.tenant_id ?? null;
    const nomeGrupo = motorista?.grupo_nome ?? afiliado?.grupo_nome ?? "";
    if (!tenantAtual) return;

    let cancelado = false;

    async function vincular() {
      try {
        // Verifica se já existe registro do passageiro neste tenant
        const { data: existente } = await supabase
          .from("passengers")
          .select("id, tenant_id")
          .eq("id", usuario!.id)
          .eq("tenant_id", tenantAtual!)
          .maybeSingle();

        if (cancelado) return;
        if (existente) return; // já vinculado, nada a fazer

        const { error } = await supabase.rpc("ensure_passenger", {
          _tenant_id: tenantAtual!,
        });
        if (error) throw error;
        if (cancelado) return;

        if (nomeGrupo) {
          toast.success(`Bem-vindo à ${nomeGrupo}! 🎉`, {
            description: "Você agora pode pedir corridas neste grupo.",
            duration: 5000,
          });
        }
      } catch (e) {
        console.error("[vincular tribo]", e);
      }
    }

    vincular();
    return () => { cancelado = true; };
  }, [usuario, motorista?.tenant_id, afiliado?.tenant_id, motorista?.grupo_nome, afiliado?.grupo_nome]);

  const buscarRotaCallback = useCallback(async () => {
    if (!origem || !destino || !configPreco) return;

    // Se for guest e ainda não tem dados, abre o popup ANTES de buscar
    if (!usuario && !dadosGuest) {
      setPrecisaDadosGuest(true);
      return;
    }

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
  }, [origem, destino, configPreco, usuario, dadosGuest]);

  // Quando guest preencher os dados via dialog (vindo do "Buscar motoristas"),
  // já calcula a rota e segue pra etapa de veículo
  const onSalvarDadosGuestEBuscar = useCallback(
    async (dados: { nome: string; whatsapp: string }) => {
      const novosDados: GuestDadosStorage = { nome: dados.nome, whatsapp: dados.whatsapp };
      salvarGuestDados(novosDados);
      setDadosGuest(novosDados);
      setPrecisaDadosGuest(false);

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
    },
    [origem, destino, configPreco]
  );


  const tenantId = motorista?.tenant_id ?? afiliado?.tenant_id ?? null;
  const grupoNome = motorista?.grupo_nome ?? afiliado?.grupo_nome ?? "";

  const validarParaConfirmar = useCallback((): boolean => {
    if (!tenantId || !origem || !destino || !rota) {
      toast.error("Defina origem e destino antes de confirmar");
      return false;
    }
    return true;
  }, [tenantId, origem, destino, rota]);

  // Cria corrida para usuário autenticado
  const criarCorridaAutenticado = useCallback(async () => {
    setConfirmando(true);
    try {
      const { error: errPassenger } = await supabase.rpc("ensure_passenger", {
        _tenant_id: tenantId!,
      });
      if (errPassenger) throw errPassenger;

      const { data, error } = await supabase
        .from("ride_requests")
        .insert({
          tenant_id: tenantId!,
          passenger_id: usuario!.id,
          origin_type: motorista ? "driver_link" : "affiliate_link",
          origin_driver_id: motorista?.id ?? null,
          origin_affiliate_id: afiliado?.id ?? null,
          origin_lat: origem!.coordenada.lat,
          origin_lng: origem!.coordenada.lng,
          origin_address: origem!.endereco,
          dest_lat: destino!.coordenada.lat,
          dest_lng: destino!.coordenada.lng,
          dest_address: destino!.endereco,
          distance_km: rota!.distancia_km,
          estimated_min: rota!.duracao_min,
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
      const err = e as { message?: string };
      toast.error(`Erro ao solicitar corrida: ${err?.message ?? "tente novamente"}`);
      console.error("[solicitar corrida]", e);
    } finally {
      setConfirmando(false);
    }
  }, [usuario, tenantId, origem, destino, rota, motorista, afiliado, valorOferta, formaPagamento]);

  const confirmarCorrida = useCallback(async () => {
    if (!validarParaConfirmar()) return;

    if (usuario) {
      await criarCorridaAutenticado();
      return;
    }

    // Guest: dados já devem estar salvos (foram pedidos antes do seletor de veículo).
    // Caso contrário (edge), abre o popup.
    if (!dadosGuest) {
      setPrecisaDadosGuest(true);
      return;
    }

    // Reusa o fluxo guest com os dados salvos
    await confirmarCorridaGuestRef.current?.(dadosGuest);
  }, [usuario, dadosGuest, criarCorridaAutenticado, validarParaConfirmar]);


  const confirmarCorridaGuest = useCallback(
    async (dados: { nome: string; whatsapp: string }) => {
      if (!validarParaConfirmar()) return;
      setConfirmando(true);
      try {
        const resultado = await criarCorridaGuest({
          tenantId: tenantId!,
          fullName: dados.nome,
          whatsapp: dados.whatsapp,
          origem: {
            lat: origem!.coordenada.lat,
            lng: origem!.coordenada.lng,
            endereco: origem!.endereco,
          },
          destino: {
            lat: destino!.coordenada.lat,
            lng: destino!.coordenada.lng,
            endereco: destino!.endereco,
          },
          distanciaKm: rota!.distancia_km,
          duracaoMin: rota!.duracao_min,
          valorOferta,
          formaPagamento,
          origemTipo: motorista ? "driver_link" : "affiliate_link",
          origemDriverId: motorista?.id ?? null,
          origemAfiliadoId: afiliado?.id ?? null,
        });

        const armazenar: GuestRideStorage = {
          guest_passenger_id: resultado.guest_passenger_id,
          ride_request_id: resultado.ride_request_id,
          tenant_id: tenantId!,
          created_at: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY_GUEST, JSON.stringify(armazenar));

        // Salva também os dados do guest pra próxima vez
        const dadosGuestNovo: GuestDadosStorage = { nome: dados.nome, whatsapp: dados.whatsapp };
        salvarGuestDados(dadosGuestNovo);
        setDadosGuest(dadosGuestNovo);

        setGuestPassengerId(resultado.guest_passenger_id);
        setRideRequestId(resultado.ride_request_id);
        setPrecisaDadosGuest(false);
        setEtapa("buscando");
      } catch (e: unknown) {
        const err = e as { message?: string };
        toast.error(`Erro ao solicitar corrida: ${err?.message ?? "tente novamente"}`);
        console.error("[guest ride]", e);
      } finally {
        setConfirmando(false);
      }
    },
    [tenantId, origem, destino, rota, motorista, afiliado, valorOferta, formaPagamento, validarParaConfirmar]
  );

  // Ref pra evitar dependência circular entre confirmarCorrida e confirmarCorridaGuest
  const confirmarCorridaGuestRef = useRef(confirmarCorridaGuest);
  useEffect(() => {
    confirmarCorridaGuestRef.current = confirmarCorridaGuest;
  }, [confirmarCorridaGuest]);

  // Fallback: se 5s após criar a corrida ela ainda estiver "pending",
  // chama a edge function manualmente (caso o trigger no DB falhe).
  useEffect(() => {
    if (!rideRequestId || etapa !== "buscando") return;
    const timer = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from("ride_requests")
          .select("status")
          .eq("id", rideRequestId)
          .maybeSingle();
        if (error) throw error;
        if (data?.status === "pending") {
          console.warn("[fallback dispatch] corrida ainda pending após 5s, chamando edge");
          await supabase.functions.invoke("dispatch-ride", {
            body: { action: "dispatch", ride_request_id: rideRequestId },
          });
        }
      } catch (e) {
        console.error("[fallback dispatch]", e);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [rideRequestId, etapa]);

  const cancelarSolicitacao = useCallback(async () => {
    if (!rideRequestId) {
      // Nada criado ainda — só reseta o estado local
      setEtapa("endereco");
      return;
    }
    setCancelando(true);
    try {
      const { error } = await supabase
        .from("ride_requests")
        .update({ status: "cancelled" })
        .eq("id", rideRequestId);
      if (error) throw error;
      toast.success("Solicitação cancelada");
      // Limpa storage da corrida (mantém dados do guest pra próxima)
      localStorage.removeItem(STORAGE_KEY_GUEST);
      setRideRequestId(null);
      setGuestPassengerId(null);
      setEtapa("endereco");
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast.error(`Erro ao cancelar: ${err?.message ?? "tente novamente"}`);
      console.error("[cancelar corrida]", e);
    } finally {
      setCancelando(false);
    }
  }, [rideRequestId]);

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
    setGuestPassengerId(null);
    setValorOferta(0);
    localStorage.removeItem(STORAGE_KEY_GUEST);
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
    confirmarCorridaGuest,
    onSalvarDadosGuestEBuscar,
    dadosGuest,
    precisaDadosGuest,
    fecharDadosGuest: () => setPrecisaDadosGuest(false),
    voltarParaEnderecos,
    confirmando,
    cancelando,
    cancelarSolicitacao,
    tenantId,
    grupoNome,
    rideRequestId,
    guestPassengerId,
    irParaCorridaAceita,
    resetarSolicitacao,
    passengerId: usuario?.id,
  };
}
