import { useEffect, useMemo } from "react";
import { Navigate, useParams } from "react-router-dom";
import { CATEGORIAS_SERVICO } from "@/compartilhados/constants/constantes_categorias_servico";
import PaginaCadastroProfissional from "@/features/triboservicos/pages/pagina_cadastro_profissional";
import { salvarCategoriaPendente } from "../utils/categoria_pendente";

/**
 * Wrapper da rota /s/cadastrar/:categoria.
 * Valida o slug, persiste em localStorage e renderiza o cadastro padrão.
 */
export default function PaginaCadastroComCategoria() {
  const { categoria } = useParams<{ categoria: string }>();

  const categoriaResolvida = useMemo(
    () => CATEGORIAS_SERVICO.find((c) => c.id === categoria),
    [categoria],
  );

  useEffect(() => {
    if (categoriaResolvida) {
      salvarCategoriaPendente(categoriaResolvida.id);
    }
  }, [categoriaResolvida]);

  if (!categoriaResolvida) {
    return <Navigate to="/s/cadastrar" replace />;
  }

  return <PaginaCadastroProfissional />;
}
