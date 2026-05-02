export interface CategoriaServico {
  id: string;
  slug: string;
  nome: string;
  icone: string | null;
  ativo: boolean;
}

export interface RegraComissao {
  id: string;
  tenant_id: string;
  category_id: string;
  comissao_cobertura_pct: number;
  comissao_indicacao_pct: number;
  comissao_fixa_brl: number;
  ativo: boolean;
}

export interface RegraComissaoComCategoria extends RegraComissao {
  categoria: CategoriaServico | null;
}

export interface PayloadRegraComissao {
  category_id: string;
  comissao_cobertura_pct: number;
  comissao_indicacao_pct: number;
  comissao_fixa_brl: number;
  ativo: boolean;
}
