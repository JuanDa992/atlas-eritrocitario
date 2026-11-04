# Plan para llevar el atlas al siguiente nivel

Fecha: 2026-11-03 (corregido el mismo día) · Base revisada: barrido preliminar V2 (`fichas/preeliminar`), `paleta.md`, `diseno_atlas.md`, `arquitectura-claude.md`, `revision_criterios_atlas.md`, 21 imágenes de `imagenes/tabla_final`, `dudas.md`.

**Decisiones del usuario (2026-11-03):**

- Público: estudiantes y clínicos por igual → dos entradas: **Aprender** y **Consultar**.
- Lanzamiento: **beta pública ya** (v0.9), marcando «felino pendiente» y «en revisión».
- Alojamiento: **GitHub personal** (se puede transferir a una organización o apuntar a un dominio UCE después).
- Equipo para fotos: **micrómetro objetivo, frotis felinos y cámara de microscopio**.

---

## Alcance real del contenido (corrección)

`fichas/preeliminar` es un **barrido preliminar**, no un lote de 42 fichas terminadas. Aunque el README y `comprobacion.json` cuentan «42», el material se divide así:

| Tipo | Cantidad | Qué es | Estado |
|---|---|---|---|
| **Fichas del atlas (morfologías)** | **21** | M01–M03, M05–M22 (sin M04), alineadas con la tabla final de `enfermedades_final.docx` y con las 21 imágenes de `imagenes/tabla_final` | Borrador; son el núcleo del atlas |
| Páginas de apoyo: enfermedades o agrupaciones | 19 | E01–E03, E05, E07–E21 | Generadas en el barrido; no son fichas del atlas, sirven para enlazar «enfermedad → morfologías» |
| Página de apoyo: síndrome | 1 | S01 Anemia regenerativa | Igual que las anteriores |
| Página de apoyo: artefacto | 1 | A01 Artefacto de preparación o almacenamiento | Igual que las anteriores |
| Excluidas (en `_excluidas/`) | 7 | M04, M23, M24, M25, E04, E06, E22 | Fuera de la tabla final; no se migran |

En adelante, el plan habla de **21 fichas** de morfología y de **21 páginas de apoyo**, que se migran con otro esquema más corto (nombre, especies, morfologías asociadas, resumen, referencias). Las páginas de apoyo pasan de borrador a publicables solo después de la limpieza de la fase B.

---

## Diagnóstico en una frase

El contenido científico está muy avanzado (21 fichas de morfología, más páginas de apoyo de enfermedades, relaciones depuradas, esquema V5 riguroso), pero **lo que hoy existe es un conjunto de páginas de texto, no un atlas**: el índice es una lista de enlaces, las fichas no muestran ninguna imagen y no hay búsqueda, comparador ni publicación. El siguiente paso lógico es **construir el sitio Astro y publicar la beta**, y en paralelo **rehacer el banco de imágenes con protocolo**.

---

## 1. Qué haría para subirlo al siguiente nivel

### 1.1 Pasar de «fichas HTML» a sitio Astro publicado (prioridad máxima)

- Crear el repo `atlas-eritrocitario` en GitHub personal con Astro + Content Collections, tal como define `arquitectura-claude.md`.
- Migrar las 21 fichas de morfología (`.md` con frontmatter V5) a `src/content/morfologias/` y las 21 páginas de apoyo a `src/content/enfermedades/` (19 E, S01 y A01, con un campo `tipo`); el esquema zod debe aceptar `estado: pendiente` en felino para no bloquear la beta.
- El proyecto vive en `C:\Users\Juan David\Documents\Proyectos\atlas-eritrocitario`, **fuera de OneDrive**: `node_modules` tiene decenas de miles de archivos que OneDrive intentaría sincronizar, y eso bloquea y vuelve lenta la compilación. El respaldo del código es el propio repositorio en GitHub. Los originales de las fotos siguen en OneDrive.
- GitHub gratuito: el repositorio debe ser **público**, porque Pages con repositorio privado exige un plan de pago. No hace falta conector de GitHub; basta con Git (o GitHub Desktop) en Windows.
- Publicar con GitHub Actions en `https://juanda992.github.io/atlas-eritrocitario/` con un aviso visible: «Versión beta — contenido en revisión por especialistas».
- Pagefind (búsqueda con sinónimos), PhotoSwipe (zoom táctil), modo oscuro.

### 1.2 Convertirlo en herramienta diagnóstica, no solo descriptiva

- **Clave de identificación** («¿Qué estoy viendo?»): preguntas sí/no que llevan a la morfología (¿la alteración está en el tamaño, el color, la forma, la distribución o hay inclusiones? → ¿proyecciones regulares o irregulares? …). Es lo que más valor da al clínico y lo que distingue un atlas de un glosario.
- **Ruta inversa enfermedad → morfologías**: en la ficha de cada enfermedad, rejilla de miniaturas de los hallazgos que se esperan.
- **Comparador lado a lado** de pares que se confunden: esferocito/microcito, equinocito/acantocito, queratocito/esquistocito, Heinz/Howell-Jolly, rouleaux/aglutinación (con la prueba de dilución salina).
- **Imágenes anotadas**: capa activable con flechas/círculos y etiqueta sobre la célula de interés (en lugar de flechas negras quemadas en la foto).

### 1.3 Ruta «Aprender»

- Quiz de identificación con imágenes (aleatorio por grupo, con retroalimentación que enlaza a la ficha).
- «Lectura sistemática del frotis»: guía paso a paso (zona de monocapa, objetivo 100X, qué evaluar primero).
- Glosario con pronunciación/etimología breve (acanto = espina, dacrio = lágrima…), útil para Nivelación.

### 1.4 Credibilidad académica

- Página **Método y fuentes**: PRISMA, protocolo de captura, criterios de calidad (ICSH), cómo se validó.
- **Ficha de revisión** por especialista con nombre, fecha y estado visible en cada ficha («Revisado por… el…»).
- DOI en **Zenodo** al lanzar la v1.0, `CITATION.cff`, licencia CC BY-NC 4.0 para contenido y MIT para código. Acordar autoría con la autora de la tesis y la tutoría antes del lanzamiento público.
- Estudio de **concordancia entre lectores** (2–3 lectores, kappa de Cohen/Fleiss) sobre el banco de imágenes: convierte el atlas en un producto publicable (artículo).

---

## 2. Qué mejoraría del proyecto actual

### 2.1 Imágenes (el punto más débil)

Revisé `IMG0010_M10_excentrocitos.jpg` como muestra representativa:

| Problema observado | Corrección |
|---|---|
| Se fotografía el campo circular completo del ocular con viñeteado negro | Recortar a rectángulo dentro del campo o usar la cámara C-mount |
| Balance de blancos cálido (fondo amarillento, células rosa-lila) | Fijar balance de blancos con un campo vacío; guardar el perfil (sRGB) |
| Densidad celular alta y superposición en la parte superior | Fotografiar la **zona de monocapa** |
| Las flechas negras finas están quemadas en la imagen | Guardar la foto **limpia** y anotar por capa en el sitio |
| Las células de interés son pequeñas en el encuadre | Una foto de campo + uno o dos **recortes en detalle** de la célula |
| Sin barra de escala | Calibrar con el micrómetro objetivo (µm/píxel por objetivo y cámara) |

Además (de la revisión de criterios): reemplazar rouleaux y aglutinación (marca de Gemini) y la foto duplicada de acantocitos/codocitos; añadir **eritrocito normal** canino y felino como patrón.

**Protocolo de captura propuesto (una hoja):** Diff-Quik · 100X con aceite · cámara C-mount con exposición y balance de blancos fijos · monocapa · 3 tomas por hallazgo (campo, detalle, otra muestra) · original sin editar + copia procesada · nombre `IMG####_M##_especie_muestra.ext` · fila en `metadatos_imagenes.csv` al momento de capturar · barra de escala de 10 µm.

### 2.2 Redacción de las fichas V2

- **Texto repetido**: en Excentrocitos la frase de la tabla final aparece dos veces en «Cómo reconocerlos». Pasa en las 21 morfologías.
- La etiqueta «**Tabla final del atlas:**» es jerga interna; no debe verse en el sitio.
- **Restos del generador**: «Sin barra de escala en la imag.», frases que empiezan en minúscula tras punto («en perros destaca…»), oraciones cortadas.
- «Comparación entre especies» mezcla patologías con morfología y repite párrafos; reescribir en 3 líneas: igual en ambas / qué cambia en el gato / significado clínico.
- «Gradación e interpretación» y «Calidad de la muestra» dicen «pendiente» en casi todas: ocultarlas en la beta hasta tener contenido, o unificar una escala semicuantitativa con cita (p. ej. Harvey; Weiss & Wardrop).
- Llenar la columna de **citas** (hoy vacía en las 21 filas). Sin eso, ninguna asociación clínica es trazable.

### 2.3 Estructura y flujo

- Unificar la fuente de verdad: hay `fichas/`, `fichas_C`, `fichas_C_2`, `fichas_CH`, `fichas_CH_2`, `preeliminar` y varios `.bak`. Definir **una** (los `.md` del repo Astro) y archivar el resto en `_archivo/`.
- Cerrar o archivar `dudas.md` D01, D02 y D04 antes del lanzamiento (D04: Torocito puede ir en el glosario como artefacto, sin ficha).
- Índice actual = lista de enlaces → reemplazar por **catálogo de tarjetas con miniatura** y filtros.

---

## 3. Opinión sobre la gama de colores (lila pastel)

**Lo bueno:** coherente con la tinción Romanowsky, transmite calma y diferencia el atlas de un manual gris. Los contrastes de texto cumplen WCAG AA (medidos):

| Texto / fondo | Contraste | Nivel |
|---|---|---|
| Ciruela `#302339` / `#FAF7FD` | 13,9:1 | AAA |
| Morado `#70419A` / `#FAF7FD` | 6,8:1 | AA |
| Malva `#68576F` / `#F0E8F8` | 5,5:1 | AA |
| Morado profundo `#563075` / rosa `#F4DCE9` | 7,8:1 | AAA |
| Borde `#DED3E7` / blanco | 1,4:1 | Insuficiente para controles |

**El problema real:** las fotos reales son rosa-lila sobre fondo crema; **la interfaz lila compite con la muestra y altera la percepción del color** (el ojo compara la tonalidad de la célula con lo que la rodea, y eso importa justo en policromasia e hipocromasia).

**Recomendación (conservando la identidad lila):**

1. Alrededor de las imágenes, usar **gris neutro**, no blanco puro ni lila: `#F4F4F5` en claro y `#1C1B1F` en oscuro (los visores de patología digital usan fondo oscuro neutro).
2. Lila solo en **navegación, botones, etiquetas y encabezados**, nunca pegado a la micrografía.
3. **Visor de imagen en modo oscuro siempre**, aunque la página esté en modo claro.
4. Bordes de campos y botones a ≥ 3:1 (p. ej. `#9C86AE`).
5. Añadir colores de estado neutros a la marca: revisado (verde `#2E7D5B`), en revisión (ámbar `#8A5A00`), pendiente (gris `#5F5A66`), siempre con icono + texto.
6. Tipografía: Verdana 18 px es legible pero anticuada y ancha; proponer **Atkinson Hyperlegible** (diseñada para legibilidad) o **Source Sans 3**, manteniendo 18 px e interlineado 1,6–1,75.

---

## 4. Opinión sobre el formato del atlas

**Acertado:** sitio estático Astro + Markdown con esquema obligatorio (control de calidad automático), una ficha por morfología, separación contenido/diseño, PWA para uso sin internet en el laboratorio, GitHub Pages gratuito.

**Lo que cambiaría:**

- **La ficha empieza por la imagen, no por el texto.** Orden propuesto: nombre + sinónimos → imagen grande (canino/felino en pestañas) con zoom y barra de escala → «Cómo reconocerlo» en 3–5 viñetas → «No confundir con» (miniaturas clicables) → significado clínico → diferencias en el gato → fisiopatología → referencias. Lo que hoy se lee de corrido debe escanearse en 10 segundos.
- **Plantilla de lectura en dos niveles**: resumen visible + «Ver más» desplegable (fisiopatología, gradación) para que el clínico no tenga que leer todo y el estudiante pueda profundizar.
- El **grafo** completo (1.647 nodos) no debe ir en la versión pública: es una herramienta editorial. En el sitio, solo el mini-grafo de cada ficha (morfología ↔ enfermedades).
- Ofrecer **descarga en PDF** por ficha y el cuadro resumen (los docentes imprimen).

---

## 5. Qué añadiría para que sea más completo

| Prioridad | Contenido nuevo | Motivo |
|---|---|---|
| Alta | Eritrocito normal canino y felino | Patrón de comparación; exigido por el criterio 3.10 |
| Alta | Fotos felinas de al menos 8 hallazgos (Heinz, rouleaux fisiológico, eliptocitos, queratocitos, esferocitos, macrocitos, policromatófilos, Howell-Jolly) | Brecha principal; el título dice «caninos y felinos» |
| Alta | Hemoparásitos: *Mycoplasma haemofelis*, *Babesia* spp. (y diferenciarlos de artefactos y Howell-Jolly) | Sin ellos el atlas no sirve para la consulta clínica real |
| Alta | Galería de **artefactos** (crenación por secado, gotas de agua/refringencia, precipitado de colorante, plaquetas sobre eritrocitos) | Son la principal causa de error de lectura en estudiantes |
| Media | Eritrocitos nucleados (metarrubricitos), reticulocitos con azul de metileno nuevo, cuerpos de Pappenheimer | Completan la respuesta regenerativa |
| Media | Particularidades de especie: eritrocitos pequeños de Akita/Shiba, macrocitosis del Caniche, rouleaux normal del gato | Evitan falsos positivos |
| Media | Correlación con el hemograma: VCM, CHCM, IDE y reticulocitos esperados por hallazgo | Une microscopio y analizador |
| Media | Casos clínicos breves (historia → frotis → hallazgos → diagnóstico) | Ruta «Aprender» |
| Baja | Versión en inglés | Alcance internacional y citas |
| Baja | Formulario de sugerencias / reporte de error por ficha | Mejora continua con usuarios |

---

## 6. Fases de ejecución (por fases, sin calendario fijo)

| Fase | Entregable | Tareas concretas | Quién |
|---|---|---|---|
| **A. Esqueleto publicado** | Sitio vacío en línea | Repo en GitHub personal, Astro, esquema zod V5 (felino pendiente permitido), workflow, primera publicación | IA + Juanito (crear cuenta/repo, `git push`) |
| **B. Limpieza de contenido** | 21 fichas de morfología limpias + 21 páginas de apoyo revisadas | Quitar duplicados y jerga, corregir restos del generador, reescribir «Comparación entre especies», ocultar secciones vacías | IA; revisión de Juanito |
| **C. Migración + catálogo** | Beta v0.9 pública | Fichas en Content Collections, catálogo con tarjetas y filtros, ficha con imagen primero, búsqueda, nueva paleta neutra alrededor de imágenes, aviso de beta | IA |
| **D. Interactividad** | v0.95 | Comparador de pares, clave de identificación, enlaces enfermedad → morfologías, imágenes anotadas por capa, PDF por ficha | IA |
| **E. Banco de imágenes** (en paralelo desde A) | Imágenes v1 | Protocolo de captura, calibración con micrómetro, cámara C-mount, felinos, normales, reemplazo de rouleaux/aglutinación/codocitos, metadatos por imagen | Juanito (laboratorio) |
| **F. Citas y validación** | Contenido validado | Llenar citas, revisor especialista, estudio de concordancia | Juanito + tutoría |
| **G. Aprender** | v1.0 | Quiz, glosario, guía de lectura del frotis, casos clínicos, PWA offline | IA |
| **H. Lanzamiento** | v1.0 con DOI | Zenodo, CITATION.cff, página Método y fuentes, licencia, encuesta de usabilidad | IA + Juanito |

---

## 7. Instrucción para ejecutar con Sonnet

Cambiar el modelo a Sonnet en el selector de la app y pegar:

> Lee `claude/plan_siguiente_nivel.md` y `claude/arquitectura-claude.md` del proyecto, y `dudas.md` en la carpeta Atlas. Ejecuta las fases A, B y C: crea el proyecto Astro en `C:\Users\Juan David\Documents\Proyectos\atlas-eritrocitario` (fuera de OneDrive; pide acceso a esa carpeta si no está conectada). Escribe ahí solo el código fuente, sin `node_modules` ni `dist`, e incluye un `.gitignore` que los excluya; para comprobar que compila (`npm install && npm run build`), hazlo en una copia en tu espacio de trabajo en la nube, no en mi carpeta. Configura `astro.config.mjs` con `site` y `base` para GitHub Pages con `site: 'https://juanda992.github.io'` y `base: '/atlas-eritrocitario'` (usuario de GitHub: JuanDa992; Git ya está configurado e iniciado en Windows). Migra desde el barrido preliminar `fichas/preeliminar` las 21 fichas de morfología (M01–M03, M05–M22) y, como páginas de apoyo, las 19 enfermedades, S01 y A01 (no migres `_excluidas/`), limpiando la redacción según la sección 2.2, aplica la paleta ajustada de la sección 3 y deja el sitio listo para `git push` a mi GitHub personal. No borres archivos; respalda antes de editar. Registra dudas nuevas en `dudas.md`. Al terminar, dime los comandos exactos para publicar.
