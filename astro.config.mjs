// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.usapablo.com',
  redirects: {
    // El webinar es el único evento activo: /eventos va directo a la landing
    '/eventos': '/webinar',
  },
  integrations: [
    sitemap({
      // Landings escondidas de campaña: fuera del sitemap
      filter: (page) => !page.includes('/fiestas-patrias'),
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
