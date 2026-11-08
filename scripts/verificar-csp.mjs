// Comprueba, después de `astro build`, que cada página tiene su CSP y que
// todo script o estilo inline tiene su hash en ella. Si algo falla, la
// compilación se detiene (así nunca se publica una página con partes bloqueadas).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const dir = 'dist';
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
