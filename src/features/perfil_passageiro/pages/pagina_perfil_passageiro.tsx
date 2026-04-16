import { useMemo, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CabecalhoPerfilPassageiro } from "../components/cabecalho_perfil_passageiro";
import { GridEstatisticasPassageiro } from "../components/grid_estatisticas_passageiro";
import { ListaAvaliacoesEnviadas } from "../components/lista_avaliacoes_enviadas";
import { ListaHistoricoCorridas } from "../components/lista_historico_corridas";
import { TelaDetalhesCorrida } from "../components/tela_detalhes_corrida";
import {
  FiltrosHistoricoCorridas,
  type FiltroPeriodo,
  type FiltroStatus,
} from "../components/filtros_historico_corridas";
import { ListaFavoritosPerfil } from "@/features/favoritos_passageiro/components/lista_favoritos_perfil";
import { ResumoHistoricoCorridas } from "../components/resumo_historico_corridas";
import { MenuExportarHistorico } from "../components/menu_exportar_historico";
import { usePerfilPassageiro } from "../hooks/hook_perfil_passageiro";
import { calcularResumoCorridas, filtrarCorridas } from "../utils/utilitarios_perfil_passageiro";
import type { CorridaHistorico, EnderecoCorrida } from "../types/tipos_perfil_passageiro";

interface PaginaPerfilPassageiroProps {
  userId: string;
  onVoltar: () => void;
  onPedirNovamente?: (origem: EnderecoCorrida, destino: EnderecoCorrida) => void;
}

export default function PaginaPerfilPassageiro({ userId, onVoltar, onPedirNovamente }: PaginaPerfilPassageiroProps) {
  const { perfil, avaliacoes, corridas, carregando } = usePerfilPassageiro(userId);
  const [corridaSelecionada, setCorridaSelecionada] = useState<CorridaHistorico | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>("todas");
  const [filtroPeriodo, setFiltroPeriodo] = useState<FiltroPeriodo>("todos");
  const [filtroBusca, setFiltroBusca] = useState("");

  const corridasFiltradas = useMemo(
    () => filtrarCorridas(corridas, filtroStatus, filtroPeriodo, filtroBusca),
    [corridas, filtroStatus, filtroPeriodo, filtroBusca]
  );

  const resumoFiltrado = useMemo(
    () => calcularResumoCorridas(corridasFiltradas),
    [corridasFiltradas]
  );

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <header className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={onVoltar}
          className="h-9 w-9 shrink-0"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-base font-semibold text-foreground">Meu perfil</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
        {carregando ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : !perfil ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            Perfil não encontrado
          </p>
        ) : (
          <>
            <CabecalhoPerfilPassageiro perfil={perfil} />
            <GridEstatisticasPassageiro perfil={perfil} />

            <Tabs defaultValue="corridas" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-9">
                <TabsTrigger value="corridas" className="text-xs">
                  Corridas
                </TabsTrigger>
                <TabsTrigger value="favoritos" className="text-xs">
                  Favoritos
                </TabsTrigger>
                <TabsTrigger value="avaliacoes" className="text-xs">
                  Avaliações
                </TabsTrigger>
              </TabsList>

              <TabsContent value="corridas" className="mt-4 space-y-3">
                <FiltrosHistoricoCorridas
                  status={filtroStatus}
                  periodo={filtroPeriodo}
                  busca={filtroBusca}
                  onMudarStatus={setFiltroStatus}
                  onMudarPeriodo={setFiltroPeriodo}
                  onMudarBusca={setFiltroBusca}
                  totalFiltrado={corridasFiltradas.length}
                  totalGeral={corridas.length}
                />
                <ResumoHistoricoCorridas resumo={resumoFiltrado} />
                <div className="flex justify-end">
                  <MenuExportarHistorico
                    corridas={corridasFiltradas}
                    resumo={resumoFiltrado}
                    nomePassageiro={perfil.full_name ?? perfil.email ?? "Passageiro"}
                  />
                </div>
                <ListaHistoricoCorridas
                  corridas={corridasFiltradas}
                  onSelecionar={setCorridaSelecionada}
                />
              </TabsContent>

              <TabsContent value="favoritos" className="mt-4">
                <ListaFavoritosPerfil
                  passengerId={perfil.id}
                  tenantId={perfil.tenant_id}
                />
              </TabsContent>

              <TabsContent value="avaliacoes" className="mt-4">
                <ListaAvaliacoesEnviadas avaliacoes={avaliacoes} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>

      {corridaSelecionada && (
        <TelaDetalhesCorrida
          rideId={corridaSelecionada.id}
          isRideRequest={corridaSelecionada.motorista_id === null}
          onVoltar={() => setCorridaSelecionada(null)}
          onPedirNovamente={
            onPedirNovamente
              ? (origem, destino) => {
                  onPedirNovamente(origem, destino);
                  setCorridaSelecionada(null);
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
