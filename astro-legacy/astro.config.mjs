import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

const site = process.env.PUBLIC_SITE ?? 'https://learnbac.ro';
const base = process.env.PUBLIC_BASE ?? '/';

export default defineConfig({
  srcDir: '.',
  site,
  base,
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    format: 'file',
  },
  trailingSlash: 'ignore',
});
