// Ejecuta Astro en modo «revisión» (versión privada, con pendientes y notas internas).
// Funciona igual en Windows, macOS y Linux, sin variables de entorno manuales.
//   npm run dev:revision      → servidor de desarrollo en la PC
//   npm run build:revision    → compila en dist-revision/
//   npm run preview:revision  → sirve dist-revision/ en la PC
import { spawnSync } from 'node:child_process';

process.env.PUBLIC_ATLAS_MODO = 'revision';
const accion = process.argv[2] ?? 'dev';
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';

function correr(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', env: process.env, shell: process.platform === 'win32' });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

if (accion === 'build') {
  correr(npx, ['astro', 'build']);
  correr(npx, ['pagefind', '--site', 'dist-revision']);
  correr(process.execPath, ['scripts/verificar-csp.mjs', 'dist-revision']);
} else if (accion === 'preview') {
  correr(npx, ['astro', 'preview', '--port', '4322']);
} else {
  correr(npx, ['astro', 'dev', '--port', '4322']);
}
