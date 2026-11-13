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
    // Direcciones cortas para atribuir las cuentas de TikTok UGC (nov-2026):
    // llevan los utm que Atribucion.astro guarda en el primer toque.
    '/mariella': '/?utm_source=tiktok&utm_medium=social&utm_campaign=ugc-2611&utm_content=m4',
    '/nico': '/?utm_source=tiktok&utm_medium=social&utm_campaign=ugc-2611&utm_content=h4',
  },
  integrations: [
    sitemap({
      // Landings escondidas de campaña / previews: fuera del sitemap
      filter: (page) => !page.includes('/flow/retorno') && !page.includes('/fiestas-patrias') && !page.includes('/webinar-prueba'),
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
