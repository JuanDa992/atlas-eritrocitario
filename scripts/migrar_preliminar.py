#!/usr/bin/env python3
"""Migra el barrido preliminar V2 (fichas/preeliminar) a las colecciones de Astro.

Uso:
    python scripts/migrar_preliminar.py <carpeta preeliminar> <carpeta imagenes/tabla_final> <raiz del proyecto>

- Lee las 21 fichas M (morfologías) y las 21 páginas de apoyo (19 E, S01, A01).
- Aplica la limpieza de redacción (sección 2.2 del plan): duplicados, jerga interna,
  restos del generador, minúsculas tras punto, texto cortado, secciones vacías.
- No modifica los originales. Escribe en src/content/ y copia imágenes a src/assets/.
- Deja un informe en docs/informe_migracion.md.
"""
import csv
import re
import shutil
import sys
from collections import Counter
from pathlib import Path

import yaml

SRC, IMG, OUT = (Path(a) for a in sys.argv[1:4])
LOG = Counter()
LOG_DETALLE = []

EXCLUIDAS = {"M04": "hipercromía", "M23": "anisocitosis", "M24": "", "M25": "", "E04": "", "E06": "", "E22": ""}

EN = {  # nombre en inglés y sinónimos de uso común (terminología estándar)
    "M01": ("macrocyte", []),
    "M02": ("microcyte", []),
    "M03": ("hypochromia", ["hipocromasia"]),
    "M05": ("rouleaux", ["pila de monedas"]),
    "M06": ("agglutination", ["autoaglutinación"]),
    "M07": ("acanthocyte", ["células en espuela", "spur cell"]),
    "M08": ("target cell (codocyte)", ["dianocitos", "leptocitos"]),
    "M09": ("schistocyte", ["fragmentos eritrocitarios"]),
    "M10": ("eccentrocyte", []),
    "M11": ("echinocyte (burr cell)", ["crenados", "células crenadas"]),
    "M12": ("echinoelliptocyte", []),
    "M13": ("elliptocyte", ["ovalocitos"]),
    "M14": ("dacryocyte (teardrop cell)", ["eritrocitos en pera", "lágrima"]),
    "M15": ("keratocyte (horn cell)", ["células en cuerno"]),
    "M16": ("stomatocyte", []),
    "M17": ("spherocyte", []),
    "M18": ("ghost cell", ["sombras eritrocitarias"]),
    "M19": ("Heinz body", ["cuerpos de Heinz"]),
    "M20": ("Howell-Jolly body", ["cuerpos de Howell-Jolly"]),
    "M21": ("basophilic stippling", ["punteado basófilo"]),
    "M22": ("polychromatophil (polychromasia)", ["policromasia", "reticulocito"]),
}

CATEGORIA = {
    "Alteraciones de la membrana": "membrana",
    "Inclusiones eritrocitarias": "inclusiones",
    "Alteraciones de tonalidad": "tonalidad",
    "Alteraciones de tamaño": "tamano",
    "Alteraciones de distribución": "distribucion",
}

# Frases que son notas editoriales: no se muestran en el cuerpo, van a «Notas editoriales».
MARCAS_NOTA = re.compile(
    r"(pendiente de aclarar|con la autora|\bel grafo\b|AMBIGUOUS|No se resuelve aquí|debe revisarse|"
    r"Falta contrastar|Contradicción en la tesis|Discrepancia|falta registrar|La guía del proyecto|"
    r"Se mantienen ambas descripciones|La Tabla 2 utiliza)",
    re.I,
)

# Texto del generador que quedó cortado o con palabras faltantes: se corrige a mano y se registra.
REEMPLAZOS = [
    (r"el la AHIM canina como regenerativa", "menciona la AHIM canina como regenerativa"),
    (r"Corpúsculos de (Heinz|Howell-Jolly) \(cuerpos de \1\) Cuerpos de \1", r"los cuerpos de \1"),
    (r"Relacionado con los cuerpos de Heinz como marcadores de daño oxidativo\.",
     "Comparte con los cuerpos de Heinz el ser marcador de daño oxidativo."),
    (r"Relacionado con Excentrocitos como marcadores de daño oxidativo\.",
     "Comparte con los excentrocitos el ser marcador de daño oxidativo."),
    (r"Relacionado con ([^.]*?) como marcadores de daño oxidativo\.",
     r"Comparte con \1 el ser marcador de daño oxidativo."),
    (r"Ver Artefacto de preparación o almacenamiento \(EDTA en exceso, secado lento, humedad\)\.?", ""),
    (r"para los artefactos de preparación y almacenamiento descritos en general\.", ""),
    (r"Para distinguir el artefacto de la enfermedad ver Artefacto de preparación o almacenamiento\.?",
     "Para separar el artefacto de la enfermedad, consulte la página de artefactos de preparación."),
    (r"\s*\((Equinocitos \(crenados\)|Estomatocitos)\)", ""),
    (r"\s*Ver Equinocitos, Estomatocitos y las entidades asociadas \(.*?tamaño\)\.", ""),
    (r"Pendiente, con fuente y localizador\.\s*", ""),
    (r"\s*Tabla \d+ \([^)]*\):\s*«[^»]*»", ""),
    (r"\bTabla final del atlas\b", ""),
    (r"Sin otro diferencial redactado( en la tesis)?\.?", ""),
    (r"No hay otro diferencial redactado\.?", ""),
    (r"Sin barra de escala[^.]*\.?", ""),
    (r"Sin umbral de tamaño ni barra de escala\.", "Sin umbral de tamaño."),
]
for cod, nombre in EXCLUIDAS.items():
    REEMPLAZOS.append((rf"\b{cod} {nombre.capitalize()}\b" if nombre else rf"\b{cod}\b", nombre or ""))


def log(msg, clave):
    LOG[clave] += 1
    LOG_DETALLE.append(f"- {msg}")


def norm(s):
    return re.sub(r"[ \t]+", " ", re.sub(r"\n{3,}", "\n\n", s)).strip()


def quitar_enlaces(s):
    return re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", s)


def slugs_en(s):
    return re.findall(r"\(([a-z]\d{2}-[a-z0-9-]+)_V2\.md\)", s)


def mayuscula_tras_punto(s):
    def fix(m):
        if m.group(1).lower() in {"etc", "vs", "ej", "al"}:
            return m.group(0)
        return m.group(1) + m.group(2) + m.group(3).upper()
    nuevo = re.sub(r"(\b[\wáéíóúñ]{3,}[.])(\s+)([a-záéíóúñ])", fix, s)
    return nuevo


SPLIT_ORACION = re.compile(r"(?<=[.!?»])\s+(?=[A-ZÁÉÍÓÚÑ«¿¡*])")


def limpiar_parrafo(texto, notas, contexto=""):
    """Limpia un párrafo. Las oraciones editoriales pasan a `notas`."""
    t = quitar_enlaces(texto)
    original = t
    for pat, rep in REEMPLAZOS:
        t = re.sub(pat, rep, t)
    t = norm(t)
    # La cita entre « » repetida al final de la descripción ya se muestra aparte como rasgo clave
    oraciones = [o.strip() for o in SPLIT_ORACION.split(t) if o.strip()]
    vistas, salida = set(), []
    for o in oraciones:
        plano = re.sub(r"\W+", "", o.lower())
        if plano in vistas:
            log(f"{contexto}: oración duplicada eliminada «{o[:60]}…»", "duplicados")
            continue
        vistas.add(plano)
        if MARCAS_NOTA.search(o):
            notas.append(re.sub(r"^\*\*[^*]+\*\*\s*", "", o).strip())
            log(f"{contexto}: oración editorial movida a notas «{o[:60]}…»", "notas")
            continue
        salida.append(o)
    t = " ".join(salida).strip()
    t = mayuscula_tras_punto(t)
    if t and t[-1] not in ".!?»)":
        corte = max(t.rfind(". "), t.rfind("; "))
        if corte > 40:
            log(f"{contexto}: texto cortado, se recorta tras «{t[:corte][-40:]}»", "truncados")
            t = t[: corte + 1].rstrip(";") + ("." if t[corte] == ";" else "")
        else:
            t += "."
    if t != original:
        LOG["parrafos_modificados"] += 1
    return t.strip()


def limpiar_notas(notas):
    res = []
    for n in notas:
        n = re.sub(r";?\s*el grafo marca[^.]*\.", ". Duda abierta D01.", n).strip()
        n = re.sub(r",?\s*pendiente de aclarar con la autora\.?", ". Pendiente de aclarar con la autora.", n)
        if len(n) < 30 or n.endswith("jov.") or n.endswith("continúa") or n.startswith("No se resuelve"):
            LOG["notas_fragmento_descartado"] += 1
            continue
        n = n[0].upper() + n[1:]
        if n[-1] not in ".!?»)":
            n += "."
        res.append(n)
    return list(dict.fromkeys(res))


def es_pendiente(t):
    t = t.strip()
    return (not t) or t.lower().startswith("pendiente") or t.startswith("No se ha recuperado")


def partir(cuerpo):
    cuerpo = cuerpo.strip()
    h1 = re.match(r"# (.+)", cuerpo).group(1).strip()
    secciones = {}
    for bloque in re.split(r"(?m)^## ", cuerpo)[1:]:
        titulo, _, resto = bloque.partition("\n")
        secciones[titulo.strip()] = resto.strip()
    return h1, secciones


def sintesis(seccion):
    """Devuelve (compartido, diferente) de la tabla «Síntesis»."""
    m = re.search(r"### Síntesis(.*)", seccion, re.S)
    comp = dif = ""
    if m:
        for fila in m.group(1).splitlines():
            c = [x.strip() for x in fila.strip().strip("|").split("|")]
            if len(c) == 2 and c[0] == "Compartido":
                comp = c[1]
            if len(c) == 2 and c[0] == "Diferente":
                dif = c[1]
    return comp, dif


def leer(path):
    t = path.read_text(encoding="utf-8")
    _, fm, cuerpo = t.lstrip().split("---\n", 2)
    return yaml.safe_load(fm), cuerpo


def especies_doc(fm):
    return [e for e, v in fm["alcance_especies"].items() if v.get("estado") == "documentado"]


def escribir(path, fm, cuerpo):
    path.parent.mkdir(parents=True, exist_ok=True)
    y = yaml.safe_dump(fm, allow_unicode=True, sort_keys=False, width=100, default_flow_style=False)
    path.write_text(f"---\n{y}---\n\n{cuerpo.strip()}\n", encoding="utf-8")


def sin_codigos_internos(t):
    return t


def migrar_morfologia(path, imagenes):
    fm, cuerpo = leer(path)
    h1, sec = partir(cuerpo)
    cod, slug = fm["codigo"], fm["slug"]
    ctx = cod
    notas = []

    # --- Cómo reconocerlo: la cita de la tabla final pasa a ser el rasgo clave
    rec = sec["Cómo reconocerlos"]
    rasgo = ""
    m = re.search(r"\*\*Tabla final del atlas:\*\*\s*«([^»]+)»", rec)
    if m:
        rasgo = m.group(1).strip().rstrip(".")
        rasgo = rasgo[0].upper() + rasgo[1:]
        rec = rec.replace(m.group(0), "")
        log(f"{ctx}: etiqueta interna «Tabla final del atlas» retirada", "jerga")
    # quita la cita repetida entre « » dentro de la descripción
    def _plano(x):
        return re.sub(r"\W+", "", x.lower())
    def _quita(m):
        return "" if rasgo and _plano(m.group(1)) == _plano(rasgo) else m.group(0)
    rec2 = re.sub(r"\s*«([^»]+)»\.?", _quita, rec)
    if rec2 != rec:
        log(f"{ctx}: cita repetida en «Cómo reconocerlos» eliminada", "duplicados")
    rec = rec2
    rec = re.sub(r"El aspecto es similar en caninos y felinos\.?", "", rec)
    reconocer = "\n\n".join(limpiar_parrafo(p, notas, ctx) for p in rec.split("\n\n") if p.strip())

    # --- Tamaño
    tam = "\n\n".join(limpiar_parrafo(p, notas, ctx) for p in sec["Descripción y referencia de tamaño"].split("\n\n") if p.strip())
    tam = re.sub(r"\*\*Observación:\*\*", "", tam).strip()

    # --- Fisiopatología
    fis = "\n\n".join(limpiar_parrafo(p, notas, ctx) for p in sec["Proceso fisiológico o fisiopatológico"].split("\n\n") if p.strip())

    # --- Significado clínico (patologías asociadas)
    pat_raw = sec["Patologías asociadas"]
    relacionadas = slugs_en(pat_raw)
    pat_raw = "\n".join(l for l in pat_raw.splitlines() if not l.startswith("Fichas vinculadas"))
    clinico = limpiar_parrafo(pat_raw, notas, ctx)

    # --- Comparación en tres líneas
    comp, dif = sintesis(sec["Comparación entre especies"])
    igual = limpiar_parrafo(comp, notas, ctx) if comp else ""
    gato = limpiar_parrafo(dif, notas, ctx) if dif else ""
    if es_pendiente(gato):
        gato = "Sin diferencias descritas en la tesis. Pendiente de confirmar con fuentes y fotografías felinas."
    if es_pendiente(igual):
        igual = "Pendiente de redactar con fuente."
    log(f"{ctx}: «Comparación entre especies» reescrita en 3 líneas", "comparaciones")

    # --- Cómo distinguirlo
    dis_raw = sec["Cómo distinguirlos"]
    dis = "" if es_pendiente(dis_raw) else "\n\n".join(limpiar_parrafo(p, notas, ctx) for p in dis_raw.split("\n\n") if p.strip())
    if es_pendiente(dis_raw):
        log(f"{ctx}: «Cómo distinguirlos» pendiente, oculta", "ocultas")

    # --- Calidad de la muestra
    cal_raw = sec["Calidad de la muestra"]
    cal = "" if es_pendiente(cal_raw) else limpiar_parrafo(cal_raw, notas, ctx)
    if es_pendiente(cal_raw):
        log(f"{ctx}: «Calidad de la muestra» pendiente, oculta", "ocultas")
    if not es_pendiente(cal_raw) and "Artefacto de preparación" in cal_raw and "a01-artefacto-preparacion-almacenamiento" not in relacionadas:
        relacionadas.append("a01-artefacto-preparacion-almacenamiento")

    # --- Gradación
    gr_raw = sec["Gradación e interpretación"]
    gr_raw = re.sub(r"No se ha recuperado una escala de gradación validada[^.]*\.", "", gr_raw)
    gr_raw = re.sub(r"La propuesta anterior 1\+ a 4\+[^.]*\.", "", gr_raw)
    gr = limpiar_parrafo(gr_raw, notas, ctx) if gr_raw.strip() else ""
    if not gr:
        log(f"{ctx}: «Gradación e interpretación» sin contenido, oculta", "ocultas")

    # --- Límites de la información (M19) → notas
    if "Límites de la información" in sec:
        notas.append(limpiar_parrafo(sec["Límites de la información"], [], ctx))
        log(f"{ctx}: «Límites de la información» movida a notas", "notas")

    # --- Enlaces de la sección final
    relacionadas += [s for s in slugs_en(sec.get("Hallazgos y entidades relacionados", ""))]
    relacionadas = list(dict.fromkeys(relacionadas))
    relacionadas = [s for s in relacionadas if not s.startswith("m")]
    diferenciales = [d for d in (fm.get("diferenciales") or [])]
    cod2slug = {}  # se completa después
    ingles, extra_sin = EN[cod]

    # --- Imagen
    imagen = None
    for p in imagenes:
        if f"_{cod}_" in p.name:
            imagen = p
    img_fm = None
    if imagen:
        destino = OUT / "src/assets/imagenes" / imagen.name
        destino.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(imagen, destino)
        img_fm = {
            "src": f"../../assets/imagenes/{imagen.name}",
            "alt": f"Micrografía provisional de {h1.lower()}. Especie, aumento y escala sin registrar.",
            "pie": f"Imagen provisional del banco v0 ({imagen.name.split('_')[0]}), tomada de la tesis. Especie, aumento y escala sin registrar.",
        }

    out = {
        "codigo": cod,
        "titulo": h1,
        "nombreIngles": ingles,
        "sinonimos": list(dict.fromkeys((fm.get("sinonimos") or []) + extra_sin)),
        "grupo": fm["grupo"],
        "categoria": CATEGORIA[fm["grupo"]],
        "rasgo": rasgo,
        "igual": igual,
        "gato": gato,
        "clinico": clinico,
        "diferenciales_codigos": diferenciales,
        "relacionadas": relacionadas,
        "imagen": img_fm,
        "felinoPendiente": True,
        "especies": {k: v["estado"] for k, v in fm["alcance_especies"].items()},
        "estadoRevision": fm["estado_revision"],
        "pendientes": fm.get("pendientes") or [],
        "notas": limpiar_notas(notas),
        "referencias": fm["referencias"],
        "versionContenido": str(fm["version_contenido"]),
        "fechaContenido": str(fm["fecha_actualizacion"]),
    }
    out["pendientes"] = [x for x in out["pendientes"] if "grafo" not in x.lower()]

    partes = [f"## Cómo reconocerlo\n\n{reconocer}"]
    if tam:
        partes.append(f"## Tamaño y referencia\n\n{tam}")
    if dis:
        partes.append(f"## Cómo distinguirlo\n\n{dis}")
    extra = []
    if fis:
        extra.append(f"### Fisiopatología\n\n{fis}")
    if cal:
        extra.append(f"### Calidad de la muestra y artefactos\n\n{cal}")
    if gr:
        extra.append(f"### Gradación e interpretación\n\n{gr}")
    if extra:
        partes.append("<details>\n<summary>Ver más: fisiopatología y calidad de la muestra</summary>\n\n" + "\n\n".join(extra) + "\n\n</details>")
    return slug, out, "\n\n".join(partes)


def migrar_apoyo(path):
    fm, cuerpo = leer(path)
    h1, sec = partir(cuerpo)
    cod, slug = fm["codigo"], fm["slug"]
    notas = []
    tipo = fm["tipo"]
    out = {
        "codigo": cod,
        "titulo": h1,
        "tipo": tipo,
        "especies": especies_doc(fm),
        "estadoRevision": fm["estado_revision"],
        "pendientes": fm.get("pendientes") or [],
        "referencias": fm["referencias"],
        "versionContenido": str(fm["version_contenido"]),
        "fechaContenido": str(fm["fecha_actualizacion"]),
    }
    comp, dif = sintesis(sec.get("Comparación entre especies", ""))
    out["igual"] = limpiar_parrafo(comp, notas, cod) if comp else ""
    d = limpiar_parrafo(dif, notas, cod) if dif else ""
    out["diferente"] = "" if es_pendiente(d) else d
    if es_pendiente(out["igual"]):
        out["igual"] = ""

    rels = slugs_en(sec.get("Hallazgos y entidades relacionados", ""))
    out["morfologias"] = [s for s in dict.fromkeys(rels) if s.startswith("m")]
    out["relacionadas"] = [s for s in dict.fromkeys(rels) if not s.startswith("m")]

    definicion_pendiente = False
    partes, pasajes = [], []
    orden = []
    for titulo, texto in sec.items():
        if titulo in {"Fotografías", "Comparación entre especies", "Hallazgos y entidades relacionados",
                      "Frecuencia documentada", "Notas de contexto", "Definición y reconocimiento del patrón"}:
            continue
        if titulo == "Definición y alcance":
            if texto.startswith("Ficha documental"):
                definicion_pendiente = True
                log(f"{cod}: texto genérico de «Definición y alcance» retirado (marcado como definición pendiente)", "jerga")
                continue
        if "**Asociaciones descritas:**" in texto:
            antes, _, despues = texto.partition("**Asociaciones descritas:**")
            texto = antes
            pasajes = [re.sub(r"^>\s?", "", l).strip() for l in despues.splitlines() if l.startswith(">")]
            pasajes = [limpiar_parrafo(p, [], cod) for p in pasajes]
        parrafos = [limpiar_parrafo(p, notas, cod) for p in texto.split("\n\n") if p.strip()]
        parrafos = [p for p in parrafos if p and not es_pendiente(p)]
        if not parrafos:
            continue
        partes.append((titulo, "\n\n".join(parrafos)))
    if "Definición y reconocimiento del patrón" in sec:
        log(f"{cod}: sección duplicada «Definición y reconocimiento del patrón» omitida", "duplicados")

    out["definicionPendiente"] = definicion_pendiente
    out["pasajes"] = [p for p in pasajes if p]

    # resumen: primera oración significativa de la primera sección
    resumen = ""
    for _, t in partes:
        resumen = SPLIT_ORACION.split(t)[0]
        break
    out["resumen"] = resumen[:400]

    # frecuencia
    frec = []
    for esp in ("canino", "felino"):
        for ob in ((fm.get("frecuencia") or {}).get(esp) or {}).get("observaciones") or []:
            frec.append({
                "especie": esp,
                "texto": ob.get("texto_original") or "",
                "valor": ob.get("valor_pct_original") or "",
                "medida": ob.get("medida") or "",
            })
    out["frecuencia"] = frec
    nota_ctx = limpiar_parrafo(sec.get("Notas de contexto", ""), [], cod)
    nota_ctx = re.sub(r"Los datos de frecuencia del encabezado.*", "", nota_ctx, flags=re.S).strip()
    out["notaFrecuencia"] = nota_ctx
    out["notas"] = limpiar_notas(notas)
    out["pendientes"] = [x for x in out["pendientes"] if "grafo" not in x.lower()]

    cuerpo_md = "\n\n".join(f"## {t}\n\n{x}" for t, x in partes)
    return slug, out, cuerpo_md


def main():
    imagenes = sorted(IMG.glob("IMG*.*"))
    raiz_mor = OUT / "src/content/morfologias"
    raiz_enf = OUT / "src/content/enfermedades"
    for d in (raiz_mor, raiz_enf):
        d.mkdir(parents=True, exist_ok=True)

    morf, apoyo = [], []
    for p in sorted(SRC.glob("m*_V2.md")):
        slug, fm, body = migrar_morfologia(p, imagenes)
        morf.append((slug, fm, body))
    for p in sorted(list(SRC.glob("e*_V2.md")) + list(SRC.glob("s*_V2.md")) + list(SRC.glob("a*_V2.md"))):
        slug, fm, body = migrar_apoyo(p)
        apoyo.append((slug, fm, body))

    cod2slug = {fm["codigo"]: slug for slug, fm, _ in morf}
    cod2slug.update({fm["codigo"]: slug for slug, fm, _ in apoyo})
    for slug, fm, body in morf:
        fm["diferenciales"] = [cod2slug[c] for c in fm.pop("diferenciales_codigos") if c in cod2slug]
        escribir(raiz_mor / f"{slug}.md", fm, body)
    for slug, fm, body in apoyo:
        escribir(raiz_enf / f"{slug}.md", fm, body)

    # bibliografía (copia tal cual, solo cuerpo)
    bib = (SRC / "bibliografia.md").read_text(encoding="utf-8")
    (OUT / "src/content").mkdir(parents=True, exist_ok=True)
    (OUT / "src/data").mkdir(parents=True, exist_ok=True)
    (OUT / "src/data/bibliografia.md").write_text(bib, encoding="utf-8")

    # metadatos de imágenes
    (OUT / "docs").mkdir(exist_ok=True)
    shutil.copy2(IMG / "metadatos_imagenes.csv", OUT / "docs/metadatos_imagenes_v0.csv")

    informe = ["# Informe de migración", "",
               f"Morfologías migradas: {len(morf)} · Páginas de apoyo: {len(apoyo)}", "",
               "## Resumen de limpieza", ""]
    informe += [f"- {k}: {v}" for k, v in sorted(LOG.items())]
    informe += ["", "## Detalle", ""] + LOG_DETALLE
    (OUT / "docs").mkdir(exist_ok=True)
    (OUT / "docs/informe_migracion.md").write_text("\n".join(informe) + "\n", encoding="utf-8")
    print(dict(LOG), len(morf), len(apoyo))


if __name__ == "__main__":
    main()
