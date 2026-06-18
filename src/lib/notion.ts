// Bypass SSL inspection in corporate/restricted networks (dev only)
if (typeof process !== "undefined") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const API_KEY = import.meta.env.NOTION_API_KEY;
const DATABASE_ID = import.meta.env.NOTION_DATABASE_ID;

const HEADERS = {
  Authorization: `Bearer ${API_KEY}`,
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json",
};

function extractText(richText: any[]): string {
  return richText?.map((t: any) => t.plain_text).join("") || "";
}

function toDirectImageUrl(url: string): string {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  return url;
}

function extractFileUrl(files: any[]): string | null {
  if (!files?.length) return null;
  const file = files[0];
  return file.type === "external" ? file.external.url : file.file?.url || null;
}

export type PostMeta = {
  id: string;
  title: string;
  slug: string;
  descripcion: string;
  fecha: string | null;
  portada: string | null;
  autor: string;
};

export async function getPosts(): Promise<PostMeta[]> {
  try {
    const res = await fetch(
      `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
      {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({
          filter: { property: "Publicado", checkbox: { equals: true } },
          sorts: [{ property: "Fecha", direction: "descending" }],
        }),
      }
    );

    if (!res.ok) {
      console.error("Notion API error:", res.status, await res.text());
      return [];
    }

    const data = await res.json();

    return data.results.map((page: any) => {
      const props = page.properties;
      const title =
        extractText(props["Blog"]?.title) ||
        extractText(props["Titulo"]?.rich_text) ||
        "Sin título";
      const slug = extractText(props["Slug"]?.rich_text) || page.id;
      return {
        id: page.id,
        title,
        slug,
        descripcion: extractText(props["Descripcion"]?.rich_text),
        fecha: props["Fecha"]?.date?.start || null,
        portada: (() => {
          const raw = props["Portada"]?.url || extractFileUrl(props["Portada"]?.files);
          return raw ? toDirectImageUrl(raw) : null;
        })(),
        autor: extractText(props["Autor"]?.rich_text),
      };
    });
  } catch (err) {
    console.error("Notion getPosts error:", err);
    return [];
  }
}

export async function getPostBySlug(
  slug: string
): Promise<{ meta: PostMeta; blocks: any[] } | null> {
  try {
    const posts = await getPosts();
    const meta = posts.find((p) => p.slug === slug);
    if (!meta) return null;

    const res = await fetch(
      `https://api.notion.com/v1/blocks/${meta.id}/children`,
      { headers: HEADERS }
    );

    if (!res.ok) return null;

    const data = await res.json();
    return { meta, blocks: data.results };
  } catch (err) {
    console.error("Notion getPostBySlug error:", err);
    return null;
  }
}

function renderRichText(richText: any[]): string {
  return (richText || [])
    .map((t) => {
      let text = t.plain_text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      if (t.annotations?.bold) text = `<strong>${text}</strong>`;
      if (t.annotations?.italic) text = `<em>${text}</em>`;
      if (t.annotations?.strikethrough) text = `<s>${text}</s>`;
      if (t.annotations?.code) text = `<code>${text}</code>`;
      if (t.href)
        text = `<a href="${t.href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      return text;
    })
    .join("");
}

export function renderBlocks(blocks: any[]): string {
  const parts: string[] = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];
    const { type } = block;
    const val = block[type];

    if (type === "bulleted_list_item") {
      parts.push("<ul>");
      while (i < blocks.length && blocks[i].type === "bulleted_list_item") {
        parts.push(`<li>${renderRichText(blocks[i].bulleted_list_item.rich_text)}</li>`);
        i++;
      }
      parts.push("</ul>");
      continue;
    }

    if (type === "numbered_list_item") {
      parts.push("<ol>");
      while (i < blocks.length && blocks[i].type === "numbered_list_item") {
        parts.push(`<li>${renderRichText(blocks[i].numbered_list_item.rich_text)}</li>`);
        i++;
      }
      parts.push("</ol>");
      continue;
    }

    switch (type) {
      case "paragraph":
        parts.push(`<p>${renderRichText(val?.rich_text)}</p>`);
        break;
      case "heading_1":
        parts.push(`<h2>${renderRichText(val?.rich_text)}</h2>`);
        break;
      case "heading_2":
        parts.push(`<h3>${renderRichText(val?.rich_text)}</h3>`);
        break;
      case "heading_3":
        parts.push(`<h4>${renderRichText(val?.rich_text)}</h4>`);
        break;
      case "quote":
        parts.push(`<blockquote>${renderRichText(val?.rich_text)}</blockquote>`);
        break;
      case "code": {
        const raw = extractText(val?.rich_text).trim();
        const commaIdx = raw.indexOf(",");
        if (commaIdx !== -1) {
          const label = raw.slice(0, commaIdx).trim();
          const href = raw.slice(commaIdx + 1).trim();
          if (href.startsWith("http")) {
            parts.push(`<div class="blog-btn-wrap"><a href="${href}" target="_blank" rel="noopener noreferrer" class="blog-btn">${label} <span>→</span></a></div>`);
            break;
          }
        }
        parts.push(`<pre><code>${renderRichText(val?.rich_text)}</code></pre>`);
        break;
      }
      case "divider":
        parts.push(`<hr />`);
        break;
      case "image": {
        const url = val?.type === "external" ? val.external?.url : val?.file?.url;
        const cap = renderRichText(val?.caption || []);
        parts.push(
          `<figure><img src="${url}" alt="${cap}" loading="lazy" />${cap ? `<figcaption>${cap}</figcaption>` : ""}</figure>`
        );
        break;
      }
      case "callout":
        parts.push(
          `<div class="callout">${val?.icon?.emoji || "💡"} ${renderRichText(val?.rich_text)}</div>`
        );
        break;
      default:
        break;
    }
    i++;
  }

  return parts.join("\n");
}
