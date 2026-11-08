import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Dos versiones del mismo sitio (ver scripts/revision.mjs y docs/VERSIONES.md):
// - Pública (por defecto): GitHub Pages, https://juanda992.github.io/atlas-eritrocitario/
// - Revisión (PUBLIC_ATLAS_MODO=revision): solo en la PC con `npm run dev:revision`
//   o `npm run preview:revision`. Usa base '/' y sale en dist-revision/.
// Si más adelante se usa un dominio propio (p. ej. atlas.uce.edu.ec): quitar `base`,
// cambiar `site` y añadir public/CNAME.
const revision = process.env.PUBLIC_ATLAS_MODO === 'revision';

export default defineConfig({
  site: process.env.ATLAS_SITE ?? 'https://juanda992.github.io',
  base: revision ? '/' : '/atlas-eritrocitario',
  outDir: revision ? './dist-revision' : './dist',
  trailingSlash: 'always',
  integrations: [sitemap()],
  // Las fichas no usan bloques de código; se desactiva Shiki (incompatible con CSP).
  markdown: { syntaxHighlight: false },
  build: { format: 'directory' },
  // Política de seguridad del navegador (CSP). Astro calcula los hashes de los
  // scripts y estilos y añade la etiqueta <meta> en cada página.
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
      scriptDirective: { resources: ["'self'", "'wasm-unsafe-eval'"] },
      styleDirective: { resources: ["'self'"] },
    },
  },
});
