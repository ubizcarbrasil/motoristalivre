/**
 * Mapeia o id da categoria de UI (constantes_categorias_servico) ou de uma
 * subcategoria para o slug equivalente em `service_categories` no banco.
 *
 * O banco mantém apenas 7 categorias macro: estetica, beleza, saude, tecnico,
 * automotivo, pet, outros.
 */
export type SlugCategoriaDb =
  | "estetica"
  | "beleza"
  | "saude"
  | "tecnico"
  | "automotivo"
  | "pet"
  | "outros";

const MAPA_CATEGORIA_UI_PARA_DB: Record<string, SlugCategoriaDb> = {
  // Categorias top-level UI
  "casa-manutencao": "tecnico",
  "limpeza-organizacao": "outros",
  "familia-domesticos": "outros",
  "beleza-bem-estar": "beleza",
  "pet": "pet",
  "tecnologia": "tecnico",
  "automotivo": "automotivo",
  "eventos-festas": "outros",
  "educacao": "outros",
  "negocios-juridico": "outros",
  "saude": "saude",
  "transportes-cargas": "outros",
  "outros": "outros",
};

const PREFIXOS_BELEZA = ["cabelo", "unhas", "esmaltacao", "manicure", "pedicure", "alongamento", "fibra", "banho-de-gel", "design-sobrancelhas", "depilacao", "limpeza-pele", "maquiagem", "micropigmentacao", "barbeiro", "barba"];
const PREFIXOS_ESTETICA = ["massagem", "drenagem", "estetica"];
const PREFIXOS_SAUDE = ["fisio", "psico", "nutri", "acupun", "pilates", "yoga", "personal-trainer", "veterinario"];
const PREFIXOS_PET = ["pet", "tosa", "dog-", "creche-pet", "hospedagem-pet", "adestrador", "banho-tosa"];
const PREFIXOS_AUTO = ["mecanico", "auto", "freios", "suspensao", "alinhamento", "borracharia", "guincho", "lava-rapido", "polimento", "cristalizacao", "vitrificacao", "martelinho", "insulfilm", "despachante", "troca-oleo", "bateria-auto", "revisao-preventiva"];
const PREFIXOS_TECNICO = [
  "marido", "pequenos-reparos", "instalacao", "troca-tomadas", "troca-interruptores", "troca-fechadura",
  "ajuste-portas", "vedacao", "conserto", "montador", "eletricista", "encanador", "vazamentos",
  "desentupimento", "troca-torneira", "troca-registro", "caixa-acoplada", "pintura", "pedreiro",
  "reforma", "assentamento", "revestimento", "construcao-parede", "gesseiro", "forro-gesso", "drywall",
  "divisorias", "ar-condicionado", "carga-gas", "chaveiro", "abertura-porta", "copia-chave", "fechadura-digital",
  "manutencao-notebook", "formatacao", "remocao-virus", "recuperacao-dados", "roteador", "wifi", "cabeamento",
  "cameras-ip", "suporte-tecnico", "celular", "tela", "bateria", "padrao-energia", "quadro-energia",
  "revisao-eletrica", "textura", "massa-corrida", "retoque-pintura",
];

/**
 * Resolve o slug de DB a partir de qualquer id da UI (categoria ou subcategoria).
 */
export function resolverSlugCategoriaDb(idUi: string | null | undefined): SlugCategoriaDb {
  if (!idUi) return "outros";
  const id = idUi.toLowerCase();

  if (id in MAPA_CATEGORIA_UI_PARA_DB) {
    return MAPA_CATEGORIA_UI_PARA_DB[id];
  }

  if (PREFIXOS_BELEZA.some((p) => id.includes(p))) return "beleza";
  if (PREFIXOS_ESTETICA.some((p) => id.includes(p))) return "estetica";
  if (PREFIXOS_SAUDE.some((p) => id.includes(p))) return "saude";
  if (PREFIXOS_PET.some((p) => id.includes(p))) return "pet";
  if (PREFIXOS_AUTO.some((p) => id.includes(p))) return "automotivo";
  if (PREFIXOS_TECNICO.some((p) => id.startsWith(p) || id.includes(p))) return "tecnico";

  return "outros";
}
