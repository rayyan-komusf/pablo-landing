export const FLOW_SESION_KEY = "pablo_sesion_tokens";

type Sesion = { access_token: string; refresh_token: string };
export type ConfirmacionFlow = {
  ok?: boolean; error?: string; en_trial?: boolean; periodo_gratis?: boolean;
  pago_pendiente?: boolean; cobro_pendiente?: boolean; acceso_bloqueado?: boolean;
};

/** Los enlaces históricos ya no confirman pagos ni contactan al proveedor retirado. */
export async function confirmarRetornoFlow(_token: string): Promise<ConfirmacionFlow> {
  throw new Error("Este enlace pertenece al sistema anterior. Revisa tu suscripción en Facturación de Pablo.");
}

export function mensajeConfirmacionFlow(_res: ConfirmacionFlow): { titulo: string; detalle: string } {
  return { titulo: "Revisa tu suscripción", detalle: "Consulta el estado verificado de tu cuenta en Facturación de Pablo." };
}

/** El fragmento instala la sesión en la app sin enviarla en peticiones HTTP. */
export function urlAppTrasFlow(): string {
  let sesion: Sesion | null = null;
  try { sesion = JSON.parse(sessionStorage.getItem(FLOW_SESION_KEY) || "null"); } catch { /* login */ }
  if (!sesion?.access_token || !sesion?.refresh_token) return "https://usapablo.app/auth";
  const fragmento = new URLSearchParams({ access_token: sesion.access_token, refresh_token: sesion.refresh_token });
  return "https://usapablo.app/auth/sesion#" + fragmento.toString();
}
