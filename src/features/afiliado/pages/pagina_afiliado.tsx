import { LayoutBase } from "@/compartilhados/components/layout_base";
import { useAfiliado } from "../hooks/hook_afiliado";
import { HeroAfiliado } from "../components/hero_afiliado";
import { CardLinkAfiliado } from "../components/card_link_afiliado";
import { ExplicacaoComissao } from "../components/explicacao_comissao";
import { CarteiraAfiliado } from "../components/carteira_afiliado";
import { ListaCorridasAfiliado } from "../components/lista_corridas_afiliado";

export default function PaginaAfiliado() {
  const { perfil, stats, corridas, saldo, carregando } = useAfiliado();

  if (carregando) {
    return (
      <LayoutBase>
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </LayoutBase>
    );
  }

  if (!perfil) {
    return (
      <LayoutBase>
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">Perfil de afiliado nao encontrado</p>
        </div>
      </LayoutBase>
    );
  }

  return (
    <LayoutBase>
      <div className="mx-auto max-w-md space-y-6">
        <HeroAfiliado perfil={perfil} />
        <CardLinkAfiliado perfil={perfil} stats={stats} />
        <ExplicacaoComissao />
        <CarteiraAfiliado userId={perfil.id} saldo={saldo} />
        <ListaCorridasAfiliado corridas={corridas} />
      </div>
    </LayoutBase>
  );
}
