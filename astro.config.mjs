// @ts-check
import alpinejs from '@astrojs/alpinejs';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://imancorner.org',
  integrations: [
    alpinejs({ entrypoint: '/src/scripts/alpine' }),
    sitemap({
      // The root page only redirects to /en/.
      filter: (page) => page !== 'https://imancorner.org/',
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', ar: 'ar', fi: 'fi' },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
