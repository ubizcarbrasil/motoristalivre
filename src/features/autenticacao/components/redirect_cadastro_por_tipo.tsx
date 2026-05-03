import { Navigate, useSearchParams } from "react-router-dom";
import PaginaCadastro from "../pages/pagina_cadastro";

/**
 * Wrapper da rota /cadastro que redireciona automaticamente para o fluxo
 * dedicado de profissional autônomo quando ?tipo=profissional.
 * Demais valores caem na PaginaCadastro padrão.
 */
export function RedirectCadastroPorTipo() {
  const [searchParams] = useSearchParams();
  const tipo = searchParams.get("tipo");

  if (tipo === "profissional") {
    return <Navigate to="/s/cadastro/profissional" replace />;
  }

  return <PaginaCadastro />;
}
