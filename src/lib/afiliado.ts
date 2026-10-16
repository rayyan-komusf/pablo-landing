/**
 * Link de afiliado de Whop: `usapablo.com/?a=<codigo>` (el mismo `a` de los
 * links de Whop). Se guarda aquí y viaja como `?a=` en cada salto a
 * usapablo.app, que lo manda al checkout de Whop como `affiliate_code`.
 * Último link gana; vence a los 30 días.
 */
export const CLAVE_AFILIADO = "pablo_afiliado";
const VIGENCIA_MS = 30 * 24 * 60 * 60 * 1000;

export const codigoAfiliadoValido = (v: unknown): v is string =>
  typeof v === "string" && /^[A-Za-z0-9_.-]{2,40}$/.test(v);

/** Guarda el `?a=` de la página actual; un código inválido no pisa el vigente. */
export function capturarAfiliado(search = location.search): void {
  try {
    const codigo = new URLSearchParams(search).get("a");
    if (!codigoAfiliadoValido(codigo)) return;
    localStorage.setItem(CLAVE_AFILIADO, JSON.stringify({ codigo, ts: Date.now() }));
  } catch {
    // Safari privado puede negar el storage: se pierde el afiliado, no la venta
  }
}

export function afiliadoVigente(): string | null {
  try {
    const dato = JSON.parse(localStorage.getItem(CLAVE_AFILIADO) ?? "null");
    if (codigoAfiliadoValido(dato?.codigo) && Date.now() - dato.ts < VIGENCIA_MS) return dato.codigo;
    localStorage.removeItem(CLAVE_AFILIADO);
  } catch {
    // sin storage: sin afiliado
  }
  return null;
}

/** Agrega `a` a una URL de usapablo.app; cualquier otra URL sale igual. */
export function conAfiliado(url: string): string {
  try {
    const destino = new URL(url);
    const codigo = afiliadoVigente();
    if (!codigo || destino.protocol !== "https:" || destino.hostname !== "usapablo.app") return url;
    destino.searchParams.set("a", codigo);
    return destino.toString();
  } catch {
    return url;
  }
}
