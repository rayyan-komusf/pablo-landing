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

// Misma anon key pública que usan el onboarding y la app en el navegador.
const SUPABASE_URL = "https://mezpfnagkubumzbromsh.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lenBmbmFna3VidW16YnJvbXNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NDM3NDMsImV4cCI6MjA3OTAxOTc0M30.HsTSJqkzslq4HWxLlIvuFwudrFzkemHELgsi54vIJDw";

/**
 * Nombre del afiliado para el aviso «Te recomendó …» (RPC afiliado_publico).
 * null si no está autorizado o no hay red: entonces no se muestra nada. Se
 * guarda por pestaña para no consultar en cada página.
 */
export async function nombreAfiliado(codigo: string, fetcher: typeof fetch = fetch): Promise<string | null> {
  const clave = `pablo_afiliado_nombre_${codigo.toLowerCase()}`;
  try {
    const previo = sessionStorage.getItem(clave);
    if (previo !== null) return previo || null;
  } catch {
    // sin sessionStorage: se consulta igual
  }
  try {
    const res = await fetcher(`${SUPABASE_URL}/rest/v1/rpc/afiliado_publico`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      body: JSON.stringify({ p_codigo: codigo }),
    });
    if (!res.ok) return null;
    const nombre = await res.json();
    const valido = typeof nombre === "string" && nombre.trim() ? nombre.trim().slice(0, 60) : null;
    try {
      sessionStorage.setItem(clave, valido ?? "");
    } catch {
      // noop
    }
    return valido;
  } catch {
    return null;
  }
}
