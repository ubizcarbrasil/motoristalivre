import { useEffect } from "react";

interface SeoOpcoes {
  titulo: string;
  descricao?: string;
  canonical?: string;
}

/**
 * Atualiza title, meta description e canonical do documento enquanto montado.
 * Restaura os valores anteriores ao desmontar.
 */
export function useSeoBasico({ titulo, descricao, canonical }: SeoOpcoes) {
  useEffect(() => {
    const tituloAnterior = document.title;
    document.title = titulo.slice(0, 60);

    const metaDesc = obterOuCriarMeta("description");
    const descAnterior = metaDesc.getAttribute("content") ?? "";
    if (descricao) {
      metaDesc.setAttribute("content", descricao.slice(0, 160));
    }

    let linkCanonical: HTMLLinkElement | null = null;
    let canonicalAnterior: string | null = null;
    if (canonical) {
      linkCanonical = document.querySelector('link[rel="canonical"]');
      if (!linkCanonical) {
        linkCanonical = document.createElement("link");
        linkCanonical.setAttribute("rel", "canonical");
        document.head.appendChild(linkCanonical);
      } else {
        canonicalAnterior = linkCanonical.getAttribute("href");
      }
      linkCanonical.setAttribute("href", canonical);
    }

    return () => {
      document.title = tituloAnterior;
      if (descricao) metaDesc.setAttribute("content", descAnterior);
      if (linkCanonical) {
        if (canonicalAnterior !== null) {
          linkCanonical.setAttribute("href", canonicalAnterior);
        } else {
          linkCanonical.remove();
        }
      }
    };
  }, [titulo, descricao, canonical]);
}

function obterOuCriarMeta(name: string): HTMLMetaElement {
  let meta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", name);
    document.head.appendChild(meta);
  }
  return meta;
}
