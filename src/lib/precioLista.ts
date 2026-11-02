/**
 * Precio de lista vs oferta (Sandra 30-oct-2026).
 *
 * La app (usapablo.app) cobra por defecto la OFERTA: mensual con 3 días de
 * prueba y anual a S/120. Es lo que ven la pauta (html.pauta) y quien ya
 * tiene cuenta. El tráfico orgánico de la landing paga la LISTA (semanal S/7,
 * mensual S/20 sin prueba, anual S/200): todo enlace de compra hacia la app
 * lleva `precio=lista` cuando la visita NO es de pauta.
 *
 * Se decide al momento del clic (la clase .pauta la pone el <head> según
 * utm_medium=paid o la sesión), nunca en el build.
 */

export const esPauta = (): boolean =>
  typeof document !== "undefined" && document.documentElement.classList.contains("pauta");

const esApp = (u: URL) =>
  (u.protocol === "https:" && u.hostname === "usapablo.app") ||
  (u.protocol === "http:" && u.hostname === "localhost" && u.port === "8080");

/** Agrega `precio=lista` a un enlace de COMPRA hacia la app fuera de pauta. */
export function conPrecioLista(url: string, pauta: boolean = esPauta()): string {
  if (pauta) return url;
  try {
    const destino = new URL(url);
    if (!esApp(destino)) return url;
    const plan = destino.searchParams.get("plan");
    // Solo enlaces de compra: con plan pago, o a /pricing.
    if (plan === "free" || (!plan && destino.pathname !== "/pricing")) return url;
    destino.searchParams.set("precio", "lista");
    return destino.toString();
  } catch {
    return url;
  }
}
