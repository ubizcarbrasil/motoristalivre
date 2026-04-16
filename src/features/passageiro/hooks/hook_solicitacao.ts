import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import type {
  DadosMotorista,
  DadosAfiliado,
  ConfigPreco,
  TipoOrigem,
  EnderecoCompleto,
  DadosRota,
  EtapaSolicitacao,
  PrecoCalculado,
} from "../types/tipos_passageiro";
import {
  buscarMotorista,
  buscarAfiliado,
  buscarConfigPreco,
  buscarRota,
  calcularPreco,
} from "../services/servico_passageiro";
import { OPCOES_VEICULOS } from "../constants/constantes_passageiro";

export function useSolicitacao() {
  const params = useParams<{ slug: string; driver_slug?: string; affiliate_slug?: string }>();

  const tipoOrigem: TipoOrigem = params.affiliate_slug ? "afiliado" : "motorista";
  const slugPerfil = params.affiliate_slug || params.driver_slug || "";

  const [motorista, setMotorista] = useState<DadosMotorista | null>(null);
  const [afiliado, setAfiliado] = useState<DadosAfiliado | null>(null);
  const [configPreco, setConfigPreco] = useState<ConfigPreco | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  const [origem, setOrigem] = useState<EnderecoCompleto | null>(null);
  const [destino, setDestino] = useState<EnderecoCompleto | null>(null);
  const [rota, setRota] = useState<DadosRota | null>(null);
  const [carregandoRota, setCarregandoRota] = useState(false);

  const [etapa, setEtapa] = useState<EtapaSolicitacao>("endereco");
  const [veiculoSelecionado, setVeiculoSelecionado] = useState("compacto");
  const [valorOferta, setValorOferta] = useState<number>(0);
  const [precos, setPrecos] = useState<PrecoCalculado[]>([]);

  // Carregar dados iniciais
  useEffect(() => {
    async function carregar() {
      try {
        setCarregando(true);
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
  }, [params.slug, slugPerfil, tipoOrigem]);

  // Buscar rota quando origem e destino estão preenchidos
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

  const confirmarCorrida = useCallback(() => {
    setEtapa("buscando");
  }, []);

  const voltarParaEnderecos = useCallback(() => {
    setEtapa("endereco");
    setRota(null);
    setPrecos([]);
  }, []);

  const tenantId = motorista?.tenant_id ?? afiliado?.tenant_id ?? null;
  const grupoNome = motorista?.grupo_nome ?? afiliado?.grupo_nome ?? "";

  return {
    tipoOrigem,
    motorista,
    afiliado,
    configPreco,
    carregando,
    erro,
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
    confirmarCorrida,
    voltarParaEnderecos,
    tenantId,
    grupoNome,
  };
}
