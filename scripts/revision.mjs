// Ejecuta Astro en modo «revisión» (versión privada, con pendientes y notas internas).
// Funciona igual en Windows, macOS y Linux, sin variables de entorno manuales.
//   npm run dev:revision      → servidor de desarrollo en la PC (puerto 4322)
//   npm run build:revision    → compila en dist-revision/
//   npm run preview:revision  → sirve dist-revision/ en http://localhost:4322/
//
// La vista previa de revisión usa un servidor estático propio (no `astro preview`):
// Astro 7 solo permite una vista previa por proyecto, y así la pública (4321) y la
// de revisión (4322) pueden estar abiertas a la vez.
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, statSync, createReadStream } from 'node:fs';
import { join, normalize, extname, resolve } from 'node:path';

process.env.PUBLIC_ATLAS_MODO = 'revision';
const accion = process.argv[2] ?? 'dev';
const PUERTO = 4322;
const SALIDA = resolve('dist-revision');

// npx: en Windows es un .cmd y necesita la shell; se pasa como una sola orden
// (sin lista de argumentos) para evitar el aviso DEP0190 de Node.
function npx(orden) {
  const r =
    process.platform === 'win32'
      ? spawnSync(`npx ${orden}`, { stdio: 'inherit', env: process.env, shell: true })
      : spawnSync('npx', orden.split(' '), { stdio: 'inherit', env: process.env });
  if (r.error) console.error(r.error.message);
  if (r.status !== 0) process.exit(r.status ?? 1);
}
// node: sin shell, para que rutas con espacios (C:\Program Files\nodejs\node.exe) no se corten.
function node(args) {
  const r = spawnSync(process.execPath, args, { stdio: 'inherit', env: process.env });
  if (r.error) console.error(r.error.message);
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.wasm': 'application/wasm',
};

function vistaPrevia() {
  if (!existsSync(SALIDA)) {
    console.error('No existe dist-revision/. Ejecute antes: npm run build:revision');
    process.exit(1);
  }
  const servidor = createServer((req, res) => {
    let ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let archivo = normalize(join(SALIDA, ruta));
    if (!archivo.startsWith(SALIDA)) {
      res.writeHead(403).end();
      return;
    }
    if (existsSync(archivo) && statSync(archivo).isDirectory()) {
      if (!ruta.endsWith('/')) {
        res.writeHead(301, { Location: ruta + '/' }).end();
        return;
      }
      archivo = join(archivo, 'index.html');
    }
    let estado = 200;
    if (!existsSync(archivo)) {
      estado = 404;
      archivo = join(SALIDA, '404.html');
    }
    res.writeHead(estado, {
      'Content-Type': TIPOS[extname(archivo).toLowerCase()] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    createReadStream(archivo).pipe(res);
  });
  servidor.on('error', (e) => {
    console.error(e.code === 'EADDRINUSE' ? `El puerto ${PUERTO} ya está en uso.` : e.message);
    process.exit(1);
  });
  servidor.listen(PUERTO, () => {
    console.log(`\n  Versión de REVISIÓN:  http://localhost:${PUERTO}/`);
    console.log('  (Ctrl + C para cerrar)\n');
  });
}

if (accion === 'build') {
  npx('astro build');
  npx('pagefind --site dist-revision');
  node(['scripts/verificar-csp.mjs', 'dist-revision']);
} else if (accion === 'preview') {
  vistaPrevia();
} else {
  npx(`astro dev --port ${PUERTO}`);
}
