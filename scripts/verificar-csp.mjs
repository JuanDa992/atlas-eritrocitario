// Comprueba, después de `astro build`, que cada página tiene su CSP y que
// todo script o estilo inline tiene su hash en ella. Si algo falla, la
// compilación se detiene (así nunca se publica una página con partes bloqueadas).
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const dir = process.argv[2] ?? 'dist';
if (!existsSync(dir) || !statSync(dir).isDirectory()) {
  console.error(`CSP: no existe la carpeta de salida «${dir}».`);
  process.exit(1);
}
const archivos = [];
(function recorrer(d) {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) recorrer(p);
    else if (p.endsWith('.html')) archivos.push(p);
  }
})(dir);

const hash = (s) => 'sha256-' + createHash('sha256').update(s, 'utf8').digest('base64');
const errores = [];
// Una salida vacía o incompleta no puede darse por buena (evita un «éxito» falso).
if (archivos.length === 0) errores.push(`${dir}: no hay páginas HTML`);
for (const esencial of ['index.html', '404.html', join('buscar', 'index.html')])
  if (!existsSync(join(dir, esencial))) errores.push(`${dir}: falta la página esencial ${esencial}`);
for (const f of archivos) {
  const html = readFileSync(f, 'utf8');
  const m = html.match(/http-equiv="content-security-policy" content="([^"]*)"/i);
  if (!m) { errores.push(`${f}: sin etiqueta CSP`); continue; }
  const csp = m[1];
  for (const [, cuerpo] of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g))
    if (!csp.includes(hash(cuerpo))) errores.push(`${f}: script inline sin hash`);
  for (const [, cuerpo] of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g))
    if (!csp.includes(hash(cuerpo))) errores.push(`${f}: estilo inline sin hash`);
  if (/\sstyle="/.test(html)) errores.push(`${f}: atributo style="" (bloqueado por la CSP)`);
  if (/\son[a-z]+="/.test(html)) errores.push(`${f}: manejador on...="" inline (bloqueado por la CSP)`);
}
if (errores.length) {
  console.error('CSP: se encontraron problemas:\n' + errores.join('\n'));
  process.exit(1);
}
console.log(`CSP verificada en ${archivos.length} páginas.`);
