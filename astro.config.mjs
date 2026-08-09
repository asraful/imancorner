// @ts-check
import alpinejs from '@astrojs/alpinejs';
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://imancorner.org',
  integrations: [alpinejs({ entrypoint: '/src/scripts/alpine' })],
});
