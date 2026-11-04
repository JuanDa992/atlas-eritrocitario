import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// GitHub Pages: https://juanda992.github.io/atlas-eritrocitario/
// Si más adelante se usa un dominio propio (p. ej. atlas.uce.edu.ec): quitar `base`,
// cambiar `site` y añadir public/CNAME.
export default defineConfig({
  site: 'https://juanda992.github.io',
  base: '/atlas-eritrocitario',
  trailingSlash: 'always',
  integrations: [sitemap()],
  build: { format: 'directory' },
});
