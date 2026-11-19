// Libro de Reclamaciones de Pablo (PABLO-001). La función libro-reclamaciones (pablo-finance-pal) vuelve a validar todo;
// esto solo avisa al consumidor antes de enviar. Textos: LIBRO_RECLAMACIONES_TEXTOS_FINALES_v1 (Legal, 19-nov-2026).

export const ENDPOINT_LIBRO = "https://mezpfnagkubumzbromsh.supabase.co/functions/v1/libro-reclamaciones";

export interface HojaForm {
  nombre: string; documento_tipo: string; documento_numero: string; domicilio: string; telefono: string; correo: string;
  es_menor: boolean; representante_nombre: string; representante_documento: string; representante_correo: string;
  bien_descripcion: string; monto_reclamado: string; detalle: string; pedido: string; declaracion_aceptada: boolean;
}

const esCorreo = (c: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.trim());

/** Mensajes de error por campo; objeto vacío si la hoja puede enviarse. */
export function erroresHoja(h: HojaForm): Record<string, string> {
  const e: Record<string, string> = {};
  const t = (v: string) => v.trim();
  if (t(h.nombre).length < 3) e.nombre = "Escribe tus nombres y apellidos.";
  const doc = t(h.documento_numero).toUpperCase();
  if (!(h.documento_tipo === "CE" ? /^[A-Z0-9]{6,12}$/ : /^\d{8}$/).test(doc)) e.documento_numero = "Revisa el número de documento.";
  if (t(h.domicilio).length < 5) e.domicilio = "Escribe tu domicilio.";
  if (!/^\+?\d{7,15}$/.test(t(h.telefono).replace(/[\s()-]/g, ""))) e.telefono = "Revisa tu teléfono.";
  if (!esCorreo(h.correo)) e.correo = "Revisa tu correo.";
  if (h.es_menor) {
    if (t(h.representante_nombre).length < 3) e.representante_nombre = "Escribe el nombre de tu padre, madre o representante.";
    if (t(h.representante_documento).length < 6) e.representante_documento = "Escribe su documento.";
    if (!esCorreo(h.representante_correo)) e.representante_correo = "Revisa su correo.";
  }
  if (t(h.bien_descripcion).length < 2) e.bien_descripcion = "Describe el producto o servicio.";
  if (t(h.monto_reclamado) !== "") {
    const m = Number(t(h.monto_reclamado).replace(",", "."));
    if (!Number.isFinite(m) || m < 0) e.monto_reclamado = "Revisa el monto.";
  }
  if (t(h.detalle).length < 10) e.detalle = "Cuéntanos qué pasó (mínimo 10 caracteres).";
  if (t(h.pedido).length < 5) e.pedido = "Dinos qué esperas de nosotros.";
  if (!h.declaracion_aceptada) e.declaracion_aceptada = "Marca la declaración para enviar la hoja.";
  return e;
}

/** PDF en base64 → bytes (para descargarlo sin pasar por otro servidor). */
export function base64ABytes(b64: string): Uint8Array {
  const bin = atob(b64);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

export function mensajeConfirmacion(r: { numero: string; tipo: string; fecha: string; correo: string; copia: string }): string {
  const copia = r.copia === "enviada"
    ? `Te enviamos una copia a ${r.correo}.`
    : `Estamos enviando tu copia a ${r.correo}; si no llega en unos minutos, descarga tu hoja desde aquí y guarda tu número.`;
  return `Recibimos tu ${r.tipo === "queja" ? "queja" : "reclamo"} N.° ${r.numero} del ${r.fecha}. ${copia} Te responderemos en un plazo máximo de 15 días hábiles. Si no ves el correo, revisa la carpeta de spam o escríbenos a team@usapablo.com.`;
}
