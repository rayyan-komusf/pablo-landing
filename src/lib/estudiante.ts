// Reglas del formulario de /estudiante. La función solicitud-estudiante
// (pablo-finance-pal) vuelve a validar todo; esto solo avisa antes de enviar.

export const ENDPOINT_ESTUDIANTE =
  "https://mezpfnagkubumzbromsh.supabase.co/functions/v1/solicitud-estudiante";

export const MAX_CARNE_BYTES = 8 * 1024 * 1024; // 8 MB, igual que el servidor
export const TIPOS_CARNE = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

/** Correo institucional: algún tramo del dominio, después del primero, es
 *  «edu» (pucp.edu.pe, upc.edu.pe, uni.edu). */
export function esCorreoEdu(correo: string): boolean {
  const limpio = correo.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(limpio)) return false;
  const tramos = limpio.split("@")[1].split(".");
  return tramos.some((tramo, i) => i > 0 && tramo === "edu");
}

/** Error de la foto del carné, o null si sirve. */
export function errorCarne(archivo: { size: number; type: string } | null): string | null {
  if (!archivo || archivo.size === 0) return "Sube la foto de tu carné universitario.";
  if (!TIPOS_CARNE.includes(archivo.type)) return "La foto debe ser JPG, PNG, WEBP o HEIC.";
  if (archivo.size > MAX_CARNE_BYTES) return "La foto no puede pesar más de 8 MB.";
  return null;
}
