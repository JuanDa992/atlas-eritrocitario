import { getCollection, type CollectionEntry } from 'astro:content';

/** Construye una URL interna respetando `base` (GitHub Pages) y la barra final. */
export function url(ruta = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const limpia = ruta.replace(/^\//, '');
  if (!limpia) return base + '/';
  const tieneArchivo = /\.[a-z0-9]+$/i.test(limpia) || limpia.includes('#');
  return `${base}/${limpia}${tieneArchivo || limpia.endsWith('/') ? '' : '/'}`;
}

export const VERSION = '0.9';

/**
 * Modo de compilación. «publica» es lo que ve cualquiera en GitHub Pages;
 * «revision» muestra además códigos internos, pendientes, notas editoriales
 * y datos técnicos de las imágenes. Se fija con PUBLIC_ATLAS_MODO=revision.
 */
export const REVISION = import.meta.env.PUBLIC_ATLAS_MODO === 'revision';

/** Un texto está pendiente si empieza por «Pendiente» (p. ej. «Pendiente de redactar con fuente.»). */
export function esPendiente(texto?: string | null): boolean {
  return !texto || /^\s*pendiente\b/i.test(texto);
}

export const ESTADO = {
  borrador: { texto: 'En revisión', icono: '◆', clase: 'revision' },
  en_revision: { texto: 'En revisión', icono: '◆', clase: 'revision' },
  revisado: { texto: 'Revisado', icono: '✓', clase: 'ok' },
} as const;

export const TIPO = {
  enfermedad: 'Enfermedad o agrupación',
  sindrome: 'Síndrome',
  artefacto: 'Artefacto',
} as const;

export const CATEGORIAS: Record<string, string> = {
  tamano: 'Tamaño',
  tonalidad: 'Tonalidad',
  membrana: 'Forma y membrana',
  distribucion: 'Distribución',
  inclusiones: 'Inclusiones',
};
export const ORDEN_CATEGORIAS = ['tamano', 'tonalidad', 'membrana', 'distribucion', 'inclusiones'];

export const REFERENCIAS: Record<string, { corta: string; completa: string }> = {
  'luna-coello-2026-tesis': {
    corta: 'Luna Coello (2026)',
    completa:
      'Luna Coello, M. H. (2026). Diseño de un atlas digital de hematología veterinaria: identificación, análisis morfológico de eritrocitos y asociación clínica en especies menores. Trabajo de titulación, Universidad Central del Ecuador.',
  },
};

export async function morfologias() {
  const lista = await getCollection('morfologias');
  return lista.sort((a, b) => a.data.codigo.localeCompare(b.data.codigo));
}

export async function enfermedades() {
  const lista = await getCollection('enfermedades');
  return lista.sort((a, b) => a.data.codigo.localeCompare(b.data.codigo));
}

export type Morfologia = CollectionEntry<'morfologias'>;
export type Enfermedad = CollectionEntry<'enfermedades'>;
