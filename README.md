# Atlas de morfología eritrocitaria en caninos y felinos

Sitio estático (Astro + Content Collections + Pagefind) publicado en GitHub Pages.
Estado: **beta 0.9** — contenido en revisión por especialistas, fotografías felinas pendientes, imágenes provisionales.

- Sitio: <https://juanda992.github.io/atlas-eritrocitario/>
- Base científica: tesis de María Himaraya Luna Coello (UCE, 2026).
- Diseño, ejecución y programación: Juan David Báez Sotomayor.

## Trabajar en local

Requisitos: Node.js 20 o superior y Git.

```bash
npm install
npm run dev        # vista previa en http://localhost:4321/atlas-eritrocitario/
npm run build      # compila el sitio y genera el índice de búsqueda (Pagefind)
npm run preview    # sirve la carpeta dist/
```

Importante: esta carpeta debe estar **fuera de OneDrive** (node_modules tiene decenas de miles de archivos).

## Estructura

```
src/content/morfologias/     21 fichas (M01–M03, M05–M22), una por archivo .md
src/content/enfermedades/    19 enfermedades (E), S01 síndrome, A01 artefacto (campo `tipo`)
src/assets/imagenes/         imágenes provisionales del banco v0
src/content.config.ts        esquema: si falta un campo obligatorio, no compila
src/pages, layouts, components, styles   diseño del sitio
scripts/migrar_preliminar.py     migración y limpieza desde el barrido preliminar V2
docs/informe_migracion.md        qué se limpió y por qué
docs/plan_siguiente_nivel.md     plan de trabajo (fases A–H)
```

Quien redacta solo edita los `.md` de `src/content/` y las imágenes; no hace falta tocar el código.

## Publicar

Cada `git push` a `main` publica solo (GitHub Actions). En GitHub: **Settings → Pages → Source: GitHub Actions**.
El repositorio debe ser **público** (Pages con repositorio privado exige un plan de pago).

## Licencias

- Código: MIT (`LICENSE`).
- Contenido (textos e imágenes): **pendiente de acordar con la autora de la tesis**. Propuesta: CC BY-NC 4.0.
  Hasta entonces no se concede permiso de reutilización del contenido.
