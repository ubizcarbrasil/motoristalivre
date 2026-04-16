import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CabecalhoPerfilPassageiro } from "../components/cabecalho_perfil_passageiro";
import { GridEstatisticasPassageiro } from "../components/grid_estatisticas_passageiro";
import { ListaAvaliacoesEnviadas } from "../components/lista_avaliacoes_enviadas";
import { usePerfilPassageiro } from "../hooks/hook_perfil_passageiro";

interface PaginaPerfilPassageiroProps {
  userId: string;
  onVoltar: () => void;
}

export default function PaginaPerfilPassageiro({ userId, onVoltar }: PaginaPerfilPassageiroProps) {
  const { perfil, avaliacoes, carregando } = usePerfilPassageiro(userId);

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

            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-foreground">
                Minhas avaliações enviadas
              </h2>
              <ListaAvaliacoesEnviadas avaliacoes={avaliacoes} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}
