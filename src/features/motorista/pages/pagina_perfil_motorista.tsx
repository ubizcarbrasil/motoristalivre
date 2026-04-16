import { useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePerfilMotorista } from "../hooks/hook_perfil_motorista";
import { HeaderPerfil } from "../components/header_perfil";
import { GridMetricas } from "../components/grid_metricas";
import { InfoVeiculo } from "../components/info_veiculo";
import { SecaoBio } from "../components/secao_bio";
import { DistribuicaoNotas } from "../components/distribuicao_notas";
import { ListaAvaliacoes } from "../components/lista_avaliacoes";

export default function PaginaPerfilMotorista() {
  const navigate = useNavigate();
  const { perfil, metricas, distribuicao, avaliacoes, carregando, erro } = usePerfilMotorista();

  if (carregando) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (erro || !perfil) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center px-6">
        <div className="text-center space-y-2">
          <p className="text-base font-medium text-foreground">Motorista nao encontrado</p>
          <p className="text-sm text-muted-foreground">Verifique se o endereco esta correto.</p>
        </div>
      </div>
    );
  }

  const urlCorrida = `/${perfil.tenant_slug}/${perfil.slug}`;

  return (
    <div className="fixed inset-0 bg-background overflow-y-auto">
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-background/80 backdrop-blur-sm border-b border-border">
        <button
          onClick={() => navigate(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium text-foreground">Perfil</span>
      </div>

      <div className="space-y-5 pb-28">
        <HeaderPerfil perfil={perfil} />
        <GridMetricas metricas={metricas} />
        <InfoVeiculo perfil={perfil} />
        <SecaoBio bio={perfil.bio} />
        <DistribuicaoNotas
          distribuicao={distribuicao}
          notaMedia={metricas.nota_media}
          totalAvaliacoes={metricas.total_avaliacoes}
        />
        <ListaAvaliacoes avaliacoes={avaliacoes} />

        {/* Grupo */}
        <div className="px-6">
          <h2 className="text-sm font-semibold text-foreground mb-2">Grupo</h2>
          <div className="flex items-center gap-2 rounded-xl bg-card border border-border p-3">
            <Badge variant="outline" className="border-primary text-primary">
              {perfil.tenant_nome}
            </Badge>
            <span className="text-xs text-muted-foreground">/{perfil.tenant_slug}</span>
          </div>
        </div>
      </div>

      {/* CTA fixo */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-sm border-t border-border">
        <Button
          className="w-full h-12 text-base font-semibold"
          onClick={() => navigate(urlCorrida)}
        >
          Solicitar corrida
        </Button>
      </div>
    </div>
  );
}
