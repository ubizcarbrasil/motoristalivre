import type { Tenant } from "../types/tipos_tenant";

// TODO: Substituir por consulta real ao Supabase quando as tabelas estiverem criadas
export async function buscarTenantPorSlug(slug: string): Promise<Tenant | null> {
  // Mock temporário para desenvolvimento
  const tenantMock: Tenant = {
    id: "mock-tenant-id",
    slug,
    nome: slug.charAt(0).toUpperCase() + slug.slice(1),
    cores: {
      primaria: "#1db865",
      fundo: "#000000",
      texto: "#ffffff",
    },
    logo_url: null,
  };

  return new Promise((resolve) => {
    setTimeout(() => resolve(tenantMock), 200);
  });
}
