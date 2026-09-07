import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_TITLE_SUFFIX = " · RenaSER";

function setMetaTag(name: string, content: string) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function setOgTag(property: string, content: string) {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

// Actualiza <title> y meta description/Open Graph por página, ya que este
// sitio es una SPA sin server-side rendering (index.html solo trae los
// valores por defecto de Inicio).
export function usePageMeta(title: string, description: string) {
  const { pathname } = useLocation();

  useEffect(() => {
    const fullTitle = title ? `${title}${SITE_TITLE_SUFFIX}` : "RenaSER · Terapias Holísticas";
    document.title = fullTitle;
    setMetaTag("description", description);
    setOgTag("og:title", fullTitle);
    setOgTag("og:description", description);

    const url = `${window.location.origin}${pathname}`;
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);
    setOgTag("og:url", url);
  }, [title, description, pathname]);
}
