// ============================================================
//  SITE MODE — cambia aquí para alternar entre modos
//  'waitlist' → botones abren el modal de lista de espera
//  'live'     → botones llevan a la sección #planes
// ============================================================
export const SITE_MODE: 'waitlist' | 'live' = 'live';

// ============================================================
//  OFFER MODE — controla si la oferta de los planes está activa
//  true  → botones de los planes funcionan con normalidad
//  false → botones se reemplazan por "Oferta no disponible"
// ============================================================
export const OFFER_AVAILABLE = true;

// ============================================================
//  FREE TRIAL MODE — controla el plan anual de S/.200
//  true  → usa el link con 7 días gratis y muestra ese beneficio
//  false → usa el link sin prueba y oculta el ítem "7 días gratis"
// ============================================================
export const FREE_TRIAL = true;

// ============================================================
//  KOMU PROMO MODE — activa el modo evento "Los 4 Pecados de Pablo"
//  true  → muestra el diseño especial de La Komu en la sección de planes
//  false → muestra el diseño normal de precios
// ============================================================
export const KOMU_PROMO = false;

// Configuración de cada modo
export const CTA_CONFIG = {
  waitlist: {
    label: 'Únete a la lista de espera',
    href: null, // null = abre el modal
  },
  live: {
    label: 'Desbloquea a Pablo',
    href: '#planes',
  },
} as const;

// Acceso directo al modo activo
export const CTA = CTA_CONFIG[SITE_MODE];
export const IS_LIVE = SITE_MODE === 'live';

// ============================================================
//  WEBINAR "LOS 4 MANDAMIENTOS FINANCIEROS"
//  Landing en /eventos/cuatro-mandamientos
// ============================================================
export const WEBINAR_MANDAMIENTOS = {
  nombre: 'Los 4 Mandamientos Financieros',
  fechaTexto: 'Jueves 23 de julio',
  horaTexto: '8:00 PM (hora peruana)',
  horaConfirmada: true, // false → la landing muestra "Hora por confirmar"
  fechaISO: '2026-07-23T20:00:00-05:00', // usada por el contador regresivo
  plataforma: 'YouTube',
  // Grupo de WhatsApp del webinar
  whatsappUrl: 'https://chat.whatsapp.com/BXhFKSLO1QWApbvAnqJPTo?s=cl&p=i&ilr=0',
  // Edge function que guarda el contacto en Brevo y envía la bienvenida
  formEndpoint:
    'https://mezpfnagkubumzbromsh.supabase.co/functions/v1/registro-webinar',
  leadKey: 'pablo_webinar_4mandamientos_lead',
} as const;

// ============================================================
//  APP LINKS
// ============================================================
export const APP_URL = 'https://usapablo.app/';

// ============================================================
//  CHECKOUT — account-first: el pago ocurre DENTRO de la app.
//  Estos links llevan a usapablo.app/pricing con el plan preseleccionado;
//  la app pide registro/login y retoma el checkout (hoy Stripe por API;
//  cuando Flow vuelva, el mismo /pricing lo usa vía su switch de pasarela).
//  Los trials (mensual 3 días, anual 7) los define la pasarela.
// ============================================================
export const CHECKOUT_URLS = {
  weekly: 'https://usapablo.app/pricing?plan=semanal',   // S/.7/semana — sin trial
  monthly: 'https://usapablo.app/pricing?plan=mensual',  // S/.20/mes — 3 días gratis
  annual_trial: 'https://usapablo.app/pricing?plan=anual',    // S/.200/año — 7 días gratis
  annual_no_trial: 'https://usapablo.app/pricing?plan=anual', // mismo plan; el trial lo define la pasarela
};
