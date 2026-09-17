// Posts cuyo cuerpo se sirve desde el repo en vez de Notion.
//
// El blog se hornea desde Notion en build time (ver notion.ts). Cuando un post
// necesita HTML que Notion no puede expresar —o imágenes que no dependan de las
// URLs firmadas de Notion, que caducan— se registra acá y su cuerpo sale del
// archivo. Los slugs que no estén en este mapa siguen saliendo de Notion tal
// cual: agregar uno acá no toca a los demás.
import detoxFinanciero from "../data/blog-overrides/plantilla-detox-financiero.html?raw";

export type BlogOverride = {
  /** HTML que reemplaza a renderBlocks() para este slug. */
  contenido: string;
  /** Subtítulo que reemplaza al de Notion (la base del blog no es editable desde acá). */
  descripcion?: string;
  /** Portada servida desde public/ en vez de la URL de Notion. */
  portada?: string;
  /** Cierra el post con la franja de FinalCTA, como la home. */
  ctaFinal?: boolean;
};

/** La cabecera del archivo es nota para nosotros; no tiene por qué viajar al HTML público. */
function sinNotas(html: string): string {
  return html.replace(/^\s*(?:<!--[\s\S]*?-->\s*)+/, "").trim();
}

export const BLOG_OVERRIDES: Record<string, BlogOverride> = {
  "plantilla-detox-financiero": {
    contenido: sinNotas(detoxFinanciero),
    descripcion:
      "No necesitas ganar más. Solo darle un lugar a cada sol. Te enseño un método fácil para empezar, y lo puedes hacer gratis, para siempre.",
    ctaFinal: true,
  },
};

export function getBlogOverride(slug: string | undefined): BlogOverride | null {
  if (!slug) return null;
  return BLOG_OVERRIDES[slug] ?? null;
}
