import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Esquema de las fichas. Si falta un campo obligatorio, el sitio NO compila
 * (control de calidad automático).
 *
 * Nota de beta: el felino puede figurar como «pendiente» (felinoPendiente: true);
 * el campo `gato` nunca queda vacío, aunque solo diga que falta información.
 */
const estadoRevision = z.enum(['borrador', 'en_revision', 'revisado']);
const especie = z.enum(['canino', 'felino']);

const morfologias = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/morfologias' }),
  schema: ({ image }) =>
    z.object({
      codigo: z.string().regex(/^M\d{2}$/),
      titulo: z.string().min(2),
      nombreIngles: z.string(),
      sinonimos: z.array(z.string()).default([]),
      grupo: z.string(),
      categoria: z.enum(['membrana', 'inclusiones', 'tonalidad', 'tamano', 'distribucion']),
      rasgo: z.string().min(3),
      igual: z.string().min(3),
      gato: z.string().min(3),
      clinico: z.string().min(3),
      diferenciales: z.array(reference('morfologias')).default([]),
      relacionadas: z.array(reference('enfermedades')).default([]),
      imagen: z
        .object({ src: image(), alt: z.string().min(5), pie: z.string() })
        .nullable()
        .default(null),
      felinoPendiente: z.boolean().default(true),
      especies: z.record(z.string(), z.string()).default({}),
      estadoRevision,
      pendientes: z.array(z.string()).default([]),
      notas: z.array(z.string()).default([]),
      referencias: z.array(z.string()).min(1),
      versionContenido: z.string(),
      fechaContenido: z.string(),
    }),
});

const enfermedades = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/enfermedades' }),
  schema: z.object({
    codigo: z.string().regex(/^[EAS]\d{2}$/),
    titulo: z.string().min(2),
    tipo: z.enum(['enfermedad', 'sindrome', 'artefacto']),
    especies: z.array(especie).default([]),
    igual: z.string().default(''),
    diferente: z.string().default(''),
    resumen: z.string().default(''),
    morfologias: z.array(reference('morfologias')).default([]),
    relacionadas: z.array(reference('enfermedades')).default([]),
    definicionPendiente: z.boolean().default(false),
    pasajes: z.array(z.string()).default([]),
    frecuencia: z
      .array(z.object({ especie, texto: z.string(), valor: z.string(), medida: z.string() }))
      .default([]),
    notaFrecuencia: z.string().default(''),
    estadoRevision,
    pendientes: z.array(z.string()).default([]),
    notas: z.array(z.string()).default([]),
    referencias: z.array(z.string()).min(1),
    versionContenido: z.string(),
    fechaContenido: z.string(),
  }),
});

export const collections = { morfologias, enfermedades };
