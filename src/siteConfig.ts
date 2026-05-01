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
export const FREE_TRIAL = false;

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
//  APP LINKS
// ============================================================
export const APP_URL = 'https://usapablo.app/';

// ============================================================
//  STRIPE LINKS — URLs de pago de Stripe
// ============================================================
export const STRIPE_URLS = {
  monthly: 'https://buy.stripe.com/9B628s8Hr8Za7LU2251sQ0n',         // S/.20/mes
  annual_trial: 'https://buy.stripe.com/3cIaEYcXHcbmd6egWZ1sQ0r',   // S/.200/año — CON 7 días gratis
  annual_no_trial: 'https://buy.stripe.com/6oU28saPz3EQ0js4ad1sQ0t', // S/.200/año — SIN 7 días gratis
};
