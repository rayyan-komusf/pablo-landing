const SUPABASE_URL = "https://mezpfnagkubumzbromsh.supabase.co";
const ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lenBmbmFna3VidW16YnJvbXNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NDM3NDMsImV4cCI6MjA3OTAxOTc0M30.HsTSJqkzslq4HWxLlIvuFwudrFzkemHELgsi54vIJDw";
export const FLOW_SESION_KEY = "pablo_sesion_tokens";

type Sesion = { access_token: string; refresh_token: string };
export type ConfirmacionFlow = {
  ok?: boolean; error?: string; en_trial?: boolean; periodo_gratis?: boolean;
  pago_pendiente?: boolean; cobro_pendiente?: boolean; acceso_bloqueado?: boolean;
};

/** Confirma el token existente. Nunca crea otro checkout ni infiere un cobro. */
export async function confirmarRetornoFlow(token: string): Promise<ConfirmacionFlow> {
  if (!token) throw new Error("No recibimos el código de Flow. Vuelve al pago e inténtalo de nuevo.");
  let sesion: Sesion;
  try { sesion = JSON.parse(sessionStorage.getItem(FLOW_SESION_KEY) || "null"); }
  catch { throw new Error("No pudimos recuperar tu sesión. Inicia sesión en Pablo para revisar tu suscripción."); }
  if (!sesion?.access_token || !sesion?.refresh_token) {
    throw new Error("No pudimos recuperar tu sesión. Inicia sesión en Pablo para revisar tu suscripción.");
  }
  const confirmar = () => fetch(SUPABASE_URL + "/functions/v1/flow-suscripcion", {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON, Authorization: "Bearer " + sesion.access_token },
    body: JSON.stringify({ accion: "confirmar", token }),
  });
  let respuesta = await confirmar();
  if (respuesta.status === 401) {
    const refresh = await fetch(SUPABASE_URL + "/auth/v1/token?grant_type=refresh_token", {
      method: "POST", headers: { "Content-Type": "application/json", apikey: ANON },
      body: JSON.stringify({ refresh_token: sesion.refresh_token }),
    });
    const nueva = await refresh.json();
    if (!refresh.ok || !nueva.access_token || !nueva.refresh_token) {
      throw new Error("Tu sesión venció. Inicia sesión en Pablo para revisar tu suscripción.");
    }
    sesion = { access_token: nueva.access_token, refresh_token: nueva.refresh_token };
    sessionStorage.setItem(FLOW_SESION_KEY, JSON.stringify(sesion));
    respuesta = await confirmar();
  }
  const resultado = await respuesta.json() as ConfirmacionFlow;
  if (!respuesta.ok || resultado.ok !== true || resultado.error) {
    throw new Error(resultado.error || "No pudimos confirmar la vinculación. Puedes reintentar con el mismo registro.");
  }
  return resultado;
}

export function mensajeConfirmacionFlow(res: ConfirmacionFlow): { titulo: string; detalle: string } {
  if (res.acceso_bloqueado || res.pago_pendiente || res.cobro_pendiente) return {
    titulo: "Medio de pago vinculado",
    detalle: "Flow todavía está confirmando el cobro. Tu acceso se activará cuando confirme el pago; no vuelvas a suscribirte.",
  };
  if (res.periodo_gratis) return { titulo: "¡Tu período gratis está activo!", detalle: "Tu código cubre este período. No se realizó ningún cobro." };
  if (res.en_trial) return { titulo: "¡Tu prueba gratis está activa!", detalle: "Vinculaste tu medio de pago. El primer cobro será al terminar tu prueba." };
  return { titulo: "¡Tu suscripción está activa!", detalle: "Puedes continuar a Pablo. Tu plan se renovará con el medio de pago que vinculaste." };
}

/** El fragmento instala la sesión en la app sin enviarla en peticiones HTTP. */
export function urlAppTrasFlow(): string {
  let sesion: Sesion | null = null;
  try { sesion = JSON.parse(sessionStorage.getItem(FLOW_SESION_KEY) || "null"); } catch { /* login */ }
  if (!sesion?.access_token || !sesion?.refresh_token) return "https://usapablo.app/auth";
  const fragmento = new URLSearchParams({ access_token: sesion.access_token, refresh_token: sesion.refresh_token });
  return "https://usapablo.app/auth/sesion#" + fragmento.toString();
}
