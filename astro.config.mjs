import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://cristi197.github.io/Complexitate-Algoritmi',
  base: '/Complexitate-Algoritmi',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    format: 'file',
  },
  trailingSlash: 'ignore',
});
