import type { LinkItem, TriboDev } from "../types/tipos_dev_links";

export const LINKS_GLOBAIS: LinkItem[] = [
  { rotulo: "Landing mobilidade", url: "/" },
  { rotulo: "Landing serviços", url: "/s" },
  { rotulo: "Hub de acessos", url: "/acesso" },
  { rotulo: "Entrar (padrão)", url: "/entrar" },
  { rotulo: "Cadastro (padrão)", url: "/cadastro" },
  { rotulo: "Acesso motorista", url: "/motorista/acesso" },
  { rotulo: "Cadastro motorista", url: "/motorista/cadastro" },
  { rotulo: "Acesso profissional", url: "/profissional/acesso" },
  { rotulo: "Cadastro profissional", url: "/profissional/cadastro" },
  { rotulo: "Acesso admin geral", url: "/admin/acesso" },
  { rotulo: "Instalar PWA", url: "/instalar" },
];

export function construirLinksDaTribo(tribo: TriboDev): LinkItem[] {
  const links: LinkItem[] = [];
  const temMobility = tribo.modulos.includes("mobility");
  const temServices = tribo.modulos.includes("services");

  links.push({ rotulo: "Página passageiro", url: `/${tribo.slug}` });

  if (temMobility) {
    links.push({ rotulo: "Mobilidade direto", url: `/m/${tribo.slug}` });
  }
  if (temServices) {
    links.push({ rotulo: "Vitrine serviços", url: `/s/${tribo.slug}` });
  }
  if (tribo.motoristaSlug) {
    links.push({
      rotulo: `Perfil motorista (${tribo.motoristaSlug})`,
      url: `/${tribo.slug}/${tribo.motoristaSlug}`,
    });
    if (temServices) {
      links.push({
        rotulo: `Profissional serviços (${tribo.motoristaSlug})`,
        url: `/s/${tribo.slug}/${tribo.motoristaSlug}`,
      });
    }
  }

  return links;
}
