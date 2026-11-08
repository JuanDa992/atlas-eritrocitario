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
