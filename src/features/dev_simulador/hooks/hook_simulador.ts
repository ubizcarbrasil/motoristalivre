import { useCallback, useEffect, useState } from "react";
import type { TenantOpcao, MotoristaOpcao, DadosSimulacao, EntradaLog, NivelLog } from "../types/tipos_simulador";
import { listarTenants, listarMotoristasDoTenant, criarRequestSimulada } from "../services/servico_simulador";
import { VALORES_PADRAO_SIMULACAO } from "../constants/constantes_simulador";

export function useSimulador() {
  const [tenants, setTenants] = useState<TenantOpcao[]>([]);
  const [motoristas, setMotoristas] = useState<MotoristaOpcao[]>([]);
  const [tenantId, setTenantId] = useState<string>("");
  const [motoristaId, setMotoristaId] = useState<string>("");
  const [origem, setOrigem] = useState(VALORES_PADRAO_SIMULACAO.origem);
  const [destino, setDestino] = useState(VALORES_PADRAO_SIMULACAO.destino);
  const [valor, setValor] = useState<number>(VALORES_PADRAO_SIMULACAO.valor);
  const [distanciaKm, setDistanciaKm] = useState<number>(VALORES_PADRAO_SIMULACAO.distanciaKm);
  const [duracaoMin, setDuracaoMin] = useState<number>(VALORES_PADRAO_SIMULACAO.duracaoMin);
  const [logs, setLogs] = useState<EntradaLog[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [carregandoTenants, setCarregandoTenants] = useState(true);

  const adicionarLog = useCallback((nivel: NivelLog, mensagem: string) => {
    setLogs((prev) => [
      {
        id: crypto.randomUUID(),
        momento: new Date().toLocaleTimeString("pt-BR"),
        nivel,
        mensagem,
      },
      ...prev,
    ]);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const lista = await listarTenants();
        setTenants(lista);
        if (lista.length > 0) setTenantId(lista[0].id);
      } catch (erro) {
        adicionarLog("erro", `Falha ao carregar grupos: ${(erro as Error).message}`);
      } finally {
        setCarregandoTenants(false);
      }
    })();
  }, [adicionarLog]);

  useEffect(() => {
    if (!tenantId) {
      setMotoristas([]);
      return;
    }
    (async () => {
      try {
        const lista = await listarMotoristasDoTenant(tenantId);
        setMotoristas(lista);
        const onlinePrimeiro = lista.find((m) => m.is_online) ?? lista[0];
        if (onlinePrimeiro) setMotoristaId(onlinePrimeiro.id);
        else setMotoristaId("");
      } catch (erro) {
        adicionarLog("erro", `Falha ao carregar motoristas: ${(erro as Error).message}`);
      }
    })();
  }, [tenantId, adicionarLog]);

  const dispararSimulacao = useCallback(async () => {
    if (!tenantId || !motoristaId) {
      adicionarLog("erro", "Selecione um grupo e um motorista");
      return;
    }
    setEnviando(true);
    adicionarLog("info", "Criando solicitação de corrida fake...");
    try {
      const dados: DadosSimulacao = { tenantId, motoristaId, origem, destino, valor, distanciaKm, duracaoMin };
      const resultado = await criarRequestSimulada(dados);
      adicionarLog("sucesso", `Ride request criado: ${resultado.rideRequestId.slice(0, 8)}`);
      if (resultado.dispatchId) {
        adicionarLog("sucesso", `Dispatch enviado ao motorista: ${resultado.dispatchId.slice(0, 8)}`);
        adicionarLog("info", "Abra o painel do motorista alvo para ver o card chegando.");
      } else {
        adicionarLog("erro", "Não foi possível criar o dispatch.");
      }
    } catch (erro) {
      adicionarLog("erro", `Erro: ${(erro as Error).message}`);
    } finally {
      setEnviando(false);
    }
  }, [tenantId, motoristaId, origem, destino, valor, distanciaKm, duracaoMin, adicionarLog]);

  const limparLogs = useCallback(() => setLogs([]), []);

  return {
    tenants,
    motoristas,
    tenantId,
    setTenantId,
    motoristaId,
    setMotoristaId,
    origem,
    setOrigem,
    destino,
    setDestino,
    valor,
    setValor,
    distanciaKm,
    setDistanciaKm,
    duracaoMin,
    setDuracaoMin,
    logs,
    enviando,
    carregandoTenants,
    dispararSimulacao,
    limparLogs,
  };
}
