import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { visualizer } from 'rollup-plugin-visualizer';

const site = process.env.PUBLIC_SITE ?? 'https://learnbac.ro';
const base = process.env.PUBLIC_BASE ?? '/';
const analyze = process.env.ANALYZE === '1';

export default defineConfig({
  srcDir: '.',
  site,
  base,
  integrations: [sitemap({ filter: page => !/\/test-exercitii(\.html)?\/?$/.test(page) })],
  vite: {
    plugins: [
      tailwindcss(),
      analyze && visualizer({
        filename: process.env.ANALYZE_OUT ?? 'reports/perf/current/bundle-treemap.html',
        template: 'treemap',
        gzipSize: true,
        brotliSize: true,
      }),
    ].filter(Boolean),
  },
  build: {
    format: 'file',
  },
  trailingSlash: 'ignore',
});
