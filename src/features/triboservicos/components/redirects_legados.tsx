import { Navigate, useParams } from "react-router-dom";

/**
 * Redireciona /:slug/servicos → /s/:slug (rota TriboServiços oficial).
 */
export function RedirectVitrineTenantLegado() {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={`/s/${slug}`} replace />;
}

/**
 * Redireciona /:slug/servicos/:driver_slug → /s/:slug/:driver_slug.
 */
export function RedirectVitrineProfissionalLegado() {
  const { slug, driver_slug } = useParams<{ slug: string; driver_slug: string }>();
  return <Navigate to={`/s/${slug}/${driver_slug}`} replace />;
}
