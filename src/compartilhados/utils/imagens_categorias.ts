/**
 * Banco de imagens provisórias (Unsplash) usadas como fallback visual
 * em capas, cards de especialidade e thumbnails de portfólio enquanto
 * o profissional ainda não subiu suas próprias fotos.
 *
 * Todas as URLs usam parâmetros do Unsplash CDN para reduzir tamanho:
 *   ?auto=format&fit=crop&w=800&q=70
 */

const UNSPLASH = (id: string, w = 800, q = 70) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=${q}`;

// Mapeia slug de categoria-mãe para uma imagem de capa.
const CAPA_POR_CATEGORIA_MAE: Record<string, string> = {
  "casa-manutencao": UNSPLASH("photo-1581578731548-c64695cc6952", 1200), // ferramentas
  "limpeza-organizacao": UNSPLASH("photo-1581578017093-cd30fce4eeb7", 1200),
  "familia-domesticos": UNSPLASH("photo-1600880292203-757bb62b4baf", 1200),
  "beleza-bem-estar": UNSPLASH("photo-1560066984-138dadb4c035", 1200), // salão
  pet: UNSPLASH("photo-1583337130417-3346a1be7dee", 1200),
  tecnologia: UNSPLASH("photo-1518770660439-4636190af475", 1200),
  automotivo: UNSPLASH("photo-1486754735734-325b5831c3ad", 1200),
  eventos: UNSPLASH("photo-1530103862676-de8c9debad1d", 1200),
  educacao: UNSPLASH("photo-1503676260728-1c00da094a0b", 1200),
  saude: UNSPLASH("photo-1576091160550-2173dba999ef", 1200),
  juridico: UNSPLASH("photo-1505664194779-8beaceb93744", 1200),
};

// Mapeia palavras-chave (presentes no slug ou nome) para imagens específicas.
const PALAVRAS_CHAVE: Array<{ chaves: string[]; url: string }> = [
  { chaves: ["eletricista", "eletric"], url: UNSPLASH("photo-1621905251918-48416bd8575a") },
  { chaves: ["encanador", "hidraulic", "vazamento", "torneira"], url: UNSPLASH("photo-1585704032915-c3400ca199e7") },
  { chaves: ["pintura", "pintor"], url: UNSPLASH("photo-1562259949-e8e7689d7828") },
  { chaves: ["pedreiro", "alvenaria", "reforma"], url: UNSPLASH("photo-1503387762-592deb58ef4e") },
  { chaves: ["ar-condicionado", "ar condicion"], url: UNSPLASH("photo-1581275288578-bf947f574a04") },
  { chaves: ["chaveiro", "fechadura"], url: UNSPLASH("photo-1558002038-1055907df827") },
  { chaves: ["limpeza", "faxina", "diarista"], url: UNSPLASH("photo-1581578017093-cd30fce4eeb7") },
  { chaves: ["sofa", "estofado"], url: UNSPLASH("photo-1555041469-a586c61ea9bc") },
  { chaves: ["organiza", "personal-organizer"], url: UNSPLASH("photo-1558997519-83ea9252edf8") },
  { chaves: ["jardin", "jardim", "paisag"], url: UNSPLASH("photo-1416879595882-3373a0480b5b") },
  { chaves: ["baba", "babá", "crianca", "criança"], url: UNSPLASH("photo-1503454537195-1dcabb73ffb9") },
  { chaves: ["idoso", "cuidador"], url: UNSPLASH("photo-1581579188871-45ea61f2a0c8") },
  { chaves: ["cozinheir", "personal-chef", "marmita"], url: UNSPLASH("photo-1556909114-f6e7ad7d3136") },
  { chaves: ["churrasqueir"], url: UNSPLASH("photo-1555939594-58d7cb561ad1") },
  { chaves: ["cabel", "corte", "escova", "salao", "salão"], url: UNSPLASH("photo-1560066984-138dadb4c035") },
  { chaves: ["manicure", "pedicure", "unha"], url: UNSPLASH("photo-1604654894610-df63bc536371") },
  { chaves: ["sobrancelh", "maquiag"], url: UNSPLASH("photo-1487412947147-5cebf100ffc2") },
  { chaves: ["massag", "drenag"], url: UNSPLASH("photo-1544161515-4ab6ce6db874") },
  { chaves: ["pet", "cachorr", "dog"], url: UNSPLASH("photo-1583337130417-3346a1be7dee") },
  { chaves: ["banho-tosa", "tosa"], url: UNSPLASH("photo-1591946614720-90a587da4a36") },
  { chaves: ["veterinari"], url: UNSPLASH("photo-1612531386530-97286d97c2d2") },
  { chaves: ["celular", "smartphone"], url: UNSPLASH("photo-1512054502232-10a0a035d672") },
  { chaves: ["notebook", "computador", "informatica"], url: UNSPLASH("photo-1518770660439-4636190af475") },
  { chaves: ["wifi", "rede", "rotead"], url: UNSPLASH("photo-1562408590-e32931084e23") },
  { chaves: ["mecanic", "automotiv", "carro"], url: UNSPLASH("photo-1486754735734-325b5831c3ad") },
  { chaves: ["lava-rapido", "lavagem", "polimento"], url: UNSPLASH("photo-1605164599901-db7f68c4b1a6") },
  { chaves: ["mudanc", "mudança", "frete"], url: UNSPLASH("photo-1600585154340-be6161a56a0c") },
];

const PADRAO = UNSPLASH("photo-1581578731548-c64695cc6952"); // ferramentas

/** Retorna uma imagem provisória para uma categoria/slug específico. */
export function imagemParaCategoria(slug: string | undefined | null): string {
  if (!slug) return PADRAO;
  const lower = slug.toLowerCase();
  for (const item of PALAVRAS_CHAVE) {
    if (item.chaves.some((k) => lower.includes(k))) return item.url;
  }
  if (CAPA_POR_CATEGORIA_MAE[lower]) return CAPA_POR_CATEGORIA_MAE[lower];
  return PADRAO;
}

/** Imagem de capa (hero) para o perfil do profissional. */
export function imagemDeCapa(categorias: string[] | undefined): string {
  if (!categorias || categorias.length === 0) return PADRAO;
  return imagemParaCategoria(categorias[0]);
}

/** Gera N thumbnails distintas a partir de uma lista de categorias. */
export function thumbnailsParaCategorias(
  categorias: string[],
  quantidade = 6,
): string[] {
  const usadas = new Set<string>();
  const resultado: string[] = [];
  for (const c of categorias) {
    const url = imagemParaCategoria(c);
    if (!usadas.has(url)) {
      usadas.add(url);
      resultado.push(url);
    }
    if (resultado.length >= quantidade) break;
  }
  // Completa com imagens variadas se faltar.
  if (resultado.length < quantidade) {
    const extras = Object.values(CAPA_POR_CATEGORIA_MAE);
    for (const url of extras) {
      if (!usadas.has(url)) {
        usadas.add(url);
        resultado.push(url);
      }
      if (resultado.length >= quantidade) break;
    }
  }
  return resultado;
}
