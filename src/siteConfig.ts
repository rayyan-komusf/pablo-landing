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
//  Los planes WHOP empiezan con cobro inmediato al confirmar.
// ============================================================
export const FREE_TRIAL = false;

// ============================================================
//  OFERTA MILLONARIA (webinar 23-jul-2026) — ventana 23 al 29 de julio,
//  hora Perú. La landing la evalúa EN EL CLIENTE (scripts inline con estas
//  fechas): countdown, trials de 14 días y bonos del plan anual aparecen
//  solos el 23 y desaparecen solos el 30, sin redeploy. Mantener en sync
//  con la edge function `stripe-suscripcion` y `src/lib/promoMillonaria.ts`
//  de la app, que usan la misma ventana.
// ============================================================
export const PROMO_MILLONARIA = {
  // FLASH en el HOME (banner + bonos en Pricing) y bonus 1-a-1: SOLO la noche
  // del webinar — aparece a las 8:40 PM y desaparece a medianoche del 23. El
  // resto del tiempo el home se ve normal (la oferta sigue viva en /webinar).
  nocheInicioISO: '2026-07-23T20:40:00-05:00',
  nocheFinISO: '2026-07-24T00:00:00-05:00',
  // OFERTA activa (checkout: anual sin trial, mensual 14d; página de ventas):
  // del fin del webinar (8:40 PM del 23) al 29 de julio.
  ofertaInicioISO: '2026-07-23T20:40:00-05:00',
  ofertaFinISO: '2026-07-30T00:00:00-05:00',
} as const;

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
    label: 'Empieza gratis',
    href: '/onboarding',
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
//  CHECKOUT — WHOP en la app, con sesión y sin prueba gratuita.
// ============================================================
export const CHECKOUT_URLS = {
  weekly: 'https://usapablo.app/pricing?plan=semanal',
  monthly: 'https://usapablo.app/pricing?plan=mensual',
  annual_trial: 'https://usapablo.app/pricing?plan=anual', // Alias histórico, sin trial.
  annual_no_trial: 'https://usapablo.app/pricing?plan=anual',
};

// URL de la app en el App Store (la pasó Rodrigo el 19-ago).
export const APP_STORE_URL =
  'https://apps.apple.com/us/app/pablo-tu-compa%C3%B1ero-financiero/id6792320815';

// Android todavía no sale: el badge es una etiqueta de estado, no un botón.
export const ANDROID_DISPONIBLE = false;
