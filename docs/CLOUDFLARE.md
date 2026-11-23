# Publicación en Cloudflare Pages

## Configuración del panel

- Proyecto: `atlas-eritrocitario`
- Rama de producción: `main`
- Preset de framework: Astro
- Comando de compilación: `npm run build`
- Directorio de salida: `dist`
- Variables de entorno:
  - `ATLAS_BASE=/`
  - `ATLAS_SITE=https://atlas-eritrocitario.pages.dev`
  - `NODE_VERSION=22.23.5`
- Nunca definir `PUBLIC_ATLAS_MODO`: la versión de revisión es solo local. Si está definida y la compilación corre en Cloudflare (`CF_PAGES=1`) o en CI (`CI=true`), la compilación se detiene a propósito.

`public/_headers` aporta las cabeceras de seguridad y `public/_redirects` redirige las URL antiguas `/atlas-eritrocitario/*` a la raíz.

## Probar localmente (PowerShell)

```powershell
$env:ATLAS_BASE='/'; $env:ATLAS_SITE='https://atlas-eritrocitario.pages.dev'; npm run build; npx astro preview
```

Para volver a la configuración normal, cierre la sesión de PowerShell o ejecute `Remove-Item Env:ATLAS_BASE, Env:ATLAS_SITE`.

## GitHub Pages

Sin variables de entorno, la compilación sigue usando la base `/atlas-eritrocitario` y el sitio `https://juanda992.github.io`, por lo que GitHub Pages funciona igual que antes.
