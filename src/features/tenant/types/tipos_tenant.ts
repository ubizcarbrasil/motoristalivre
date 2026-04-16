export interface CoresTenant {
  primaria: string;
  fundo: string;
  texto: string;
}

export interface Tenant {
  id: string;
  slug: string;
  nome: string;
  cores: CoresTenant;
  logo_url: string | null;
}

export interface ContextoTenantTipo {
  tenant: Tenant | null;
  carregando: boolean;
}
