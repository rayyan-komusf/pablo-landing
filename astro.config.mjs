// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.usapablo.com',
  redirects: {
    // El webinar es el único evento activo: /eventos va directo a la landing
    '/eventos': '/webinar',
    // La Pablo Promo de Fiestas Patrias cerró el 29-jul-2026 y su página salió
    // de la web (sigue en el repo como _fiestas-patrias.astro). El link quedó
    // circulando en correos, anuncios y el bot, así que en vez de un 404
    // manda al home.
    '/fiestas-patrias': '/',
  },
  integrations: [
    sitemap({
      // Landings escondidas de campaña / previews: fuera del sitemap
      filter: (page) => !page.includes('/fiestas-patrias') && !page.includes('/webinar-prueba'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date('2026-03-25'),
      customPages: [
        'https://www.usapablo.com/',
        'https://www.usapablo.com/terminos',
        'https://www.usapablo.com/privacidad',
      ],
    }),
  ],
});
