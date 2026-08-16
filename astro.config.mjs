// @ts-check
import alpinejs from '@astrojs/alpinejs';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://imancorner.org',
  integrations: [alpinejs({ entrypoint: '/src/scripts/alpine' })],
  vite: {
    plugins: [tailwindcss()],
  },
});
