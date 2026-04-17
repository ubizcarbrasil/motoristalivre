import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useSimulador } from "../hooks/hook_simulador";
import { FormularioSimulacao } from "../components/formulario_simulacao";
import { LogSimulacao } from "../components/log_simulacao";

export default function PaginaSimuladorDispatch() {
  const sim = useSimulador();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link to="/root" className="p-2 -ml-2 rounded-full hover:bg-muted">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base font-semibold">Simulador de Dispatch</h1>
            <p className="text-xs text-muted-foreground">Teste chamadas para um motorista sem precisar de 2 contas</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        <FormularioSimulacao
          tenants={sim.tenants}
          motoristas={sim.motoristas}
          tenantId={sim.tenantId}
          setTenantId={sim.setTenantId}
          motoristaId={sim.motoristaId}
          setMotoristaId={sim.setMotoristaId}
          origem={sim.origem}
          setOrigem={sim.setOrigem}
          destino={sim.destino}
          setDestino={sim.setDestino}
          valor={sim.valor}
          setValor={sim.setValor}
          distanciaKm={sim.distanciaKm}
          setDistanciaKm={sim.setDistanciaKm}
          duracaoMin={sim.duracaoMin}
          setDuracaoMin={sim.setDuracaoMin}
          enviando={sim.enviando}
          carregandoTenants={sim.carregandoTenants}
          onDisparar={sim.dispararSimulacao}
        />

        <LogSimulacao logs={sim.logs} onLimpar={sim.limparLogs} />
      </main>
    </div>
  );
}
