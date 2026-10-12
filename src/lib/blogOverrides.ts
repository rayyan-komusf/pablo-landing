// Posts cuyo cuerpo se sirve desde el repo en vez de Notion.
//
// El blog se hornea desde Notion en build time (ver notion.ts). Cuando un post
// necesita HTML que Notion no puede expresar —o imágenes que no dependan de las
// URLs firmadas de Notion, que caducan— se registra acá y su cuerpo sale del
// archivo. Los slugs que no estén en este mapa siguen saliendo de Notion tal
// cual: agregar uno acá no toca a los demás.
//
// Si además trae `meta`, el post vive entero en el repo: no necesita fila en
// Notion para aparecer en /blog (la base de Notion no está compartida con el
// conector de Claude, así que los posts nuevos se publican por acá).
import type { PostMeta } from "./notion";
import detoxFinanciero from "../data/blog-overrides/plantilla-detox-financiero.html?raw";
import tarjetaClasica2026 from "../data/blog-overrides/querido-pablo-tarjeta-credito-clasica-2026.html?raw";
import tarjetaGold2026 from "../data/blog-overrides/mejor-tarjeta-credito-gold-peru-2026.html?raw";

export type BlogOverride = {
  /** HTML que reemplaza a renderBlocks() para este slug. */
  contenido: string;
  /** Cierra el post con la franja de FinalCTA, como la home. */
  ctaFinal?: boolean;
  /** Datos de la tarjeta del blog. Con esto el post no depende de Notion. */
  meta?: Omit<PostMeta, "id" | "slug">;
};

/** La cabecera del archivo es nota para nosotros; no tiene por qué viajar al HTML público. */
function sinNotas(html: string): string {
  return html.replace(/^\s*(?:<!--[\s\S]*?-->\s*)+/, "").trim();
}

export const BLOG_OVERRIDES: Record<string, BlogOverride> = {
  "plantilla-detox-financiero": {
    contenido: sinNotas(detoxFinanciero),
    ctaFinal: true,
  },
  "querido-pablo-tarjeta-credito-clasica-2026": {
    contenido: sinNotas(tarjetaClasica2026),
    ctaFinal: true,
    meta: {
      title: "querido pablo: ¿cuál es la mejor tarjeta de crédito clásica del perú? (edición 2026)",
      descripcion:
        "Comparé las 5 tarjetas clásicas de los bancos grandes con sus tarifarios y el comparador de la SBS: cuánto cuestan de verdad, qué te devuelven y cuál te conviene según cómo la usas.",
      fecha: "2026-09-30T12:00:00-05:00",
      portada: "/blog/querido-pablo-tarjetas-portada.jpg",
      autor: "Pablo",
    },
  },
  "mejor-tarjeta-credito-gold-peru-2026": {
    contenido: sinNotas(tarjetaGold2026),
    ctaFinal: true,
    meta: {
      title: "¿cuál es la mejor tarjeta de crédito gold del perú? (con tabla comparativa)",
      descripcion:
        "Comparé las 12 tarjetas gold que se venden hoy en el Perú con el comparador de la SBS y el tarifario de cada banco: cuánto cobran de verdad, qué te devuelven, sus beneficios y cuál te conviene según cómo la usas.",
      fecha: "2026-10-07T12:00:00-05:00",
      portada: "/blog/gold/pablo-gold-portada.jpg",
      autor: "Pablo",
    },
  },
};

/** Posts que viven enteros en el repo, con la misma forma que los de Notion. */
export function getRepoPosts(): PostMeta[] {
  return Object.entries(BLOG_OVERRIDES)
    .filter(([, o]) => o.meta)
    .map(([slug, o]) => ({ id: `repo:${slug}`, slug, ...o.meta! }));
}

export function getBlogOverride(slug: string | undefined): BlogOverride | null {
  if (!slug) return null;
  return BLOG_OVERRIDES[slug] ?? null;
}
