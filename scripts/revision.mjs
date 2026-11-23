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
import { join, normalize, extname, resolve, relative, isAbsolute } from 'node:path';

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
    try {
      atender(req, res);
    } catch (e) {
      // Cualquier fallo inesperado responde 500 en lugar de detener el servidor.
      if (!res.headersSent) res.writeHead(500);
      res.end();
    }
  });
  function atender(req, res) {
    let ruta;
    try {
      ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    } catch {
      // URL mal codificada (p. ej. /%ZZ): petición incorrecta, el servidor sigue en marcha.
      res.writeHead(400).end();
      return;
    }
    if (ruta.includes('\0')) {
      res.writeHead(400).end();
      return;
    }
    let archivo = normalize(join(SALIDA, ruta));
    // Solo se sirven archivos DENTRO de dist-revision/ (evita ../ y carpetas vecinas
    // con el mismo prefijo, como dist-revision-copia/).
    const rel = relative(SALIDA, archivo);
    if (rel.startsWith('..') || isAbsolute(rel)) {
      res.writeHead(403).end();
      return;
    }
    if (existsSync(archivo) && statSync(archivo).isDirectory()) {
      if (!ruta.endsWith('/')) {
        res.writeHead(301, { Location: new URL(req.url, 'http://x').pathname + '/' }).end();
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
    createReadStream(archivo)
      .on('error', () => res.destroy())
      .pipe(res);
  }
  servidor.on('error', (e) => {
    console.error(e.code === 'EADDRINUSE' ? `El puerto ${PUERTO} ya está en uso.` : e.message);
    process.exit(1);
  });
  // Solo escucha en la propia PC (127.0.0.1): la versión de revisión no es accesible desde la red.
  servidor.listen(PUERTO, '127.0.0.1', () => {
    console.log(`\n  Versión de REVISIÓN:  http://127.0.0.1:${PUERTO}/`);
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
  npx(`astro dev --host 127.0.0.1 --port ${PUERTO}`);
}
