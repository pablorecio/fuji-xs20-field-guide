# Guía de autoría — Fuji X-S20 Field Guide

Este documento define cómo se escribe cada capítulo del manual. Todo capítulo debe
cumplirla al 100%: es lo que hace que 16 archivos escritos por separado se lean como
un solo libro.

---

## 1. Voz y nivel

- **Idioma**: español de España, tratamiento de «tú». Términos técnicos consolidados en
  inglés se mantienen en inglés la primera vez con explicación entre paréntesis o en el
  glosario: *focus peaking*, *bitrate*, *B-roll*, *golden hour*.
- **Tono**: un profesor excelente que disfruta explicando. Cero marketing, cero relleno,
  cero listas de specs sin digerir. Frases completas. Analogías concretas y cotidianas.
- **Lector**: tuvo base de fotografía hace años (sabe qué es la apertura, aunque oxidado),
  **nunca** aprendió vídeo. No asumas NADA de vídeo; refresca sin condescendencia lo de foto.
- **Profundidad**: cada concepto importante responde: qué es → cómo funciona → cuándo
  usarlo → cuándo NO usarlo → errores típicos → ejemplo real de viaje → ejercicio.
  No siempre con esos epígrafes literales, pero sí con esa sustancia.
- **Contexto de uso**: fotografía y vídeo **de viaje** (ciudades, naturaleza, camping,
  Portugal como destino de referencia). Los ejemplos viven ahí, no en un estudio.
- **Extensión**: un capítulo equivale a 10–15 páginas de libro: **3.500–6.000 palabras**
  (los capítulos de 15–25 min pueden quedarse en 2.500–3.500), más diagramas y componentes.
- **No repetir contenido de otros capítulos**: enlaza. P. ej.
  `<a href="05-exposicion.html#el-histograma">el histograma</a>`. La lista de capítulos e ids
  clave está al final de esta guía.

## 2. Rigor técnico (obligatorio)

- **No inventes datos de la X-S20.** Ante cualquier duda sobre un botón, menú, límite o
  formato, consulta el manual oficial: `https://fujifilm-dsc.com/en/manual/x-s20/`
  (usa WebFetch sobre la sección concreta). Si algo no se puede verificar, formúlalo de
  forma genérica («las Fuji de esta generación…») en lugar de afirmar un dato concreto.
- Datos verificados que puedes usar sin re-comprobar:
  - Sensor X-Trans CMOS 4 BSI de 26,1 MP (APS-C), procesador X-Processor 5.
  - ISO nativo 160–12800 (extendido 80–51200). Base ISO 160.
  - IBIS de 5 ejes, hasta 7 pasos (CIPA).
  - Obturador mecánico hasta 1/4000 s; electrónico hasta 1/32000 s.
  - Vídeo: 6.2K/30p *open gate* (3:2), DCI/UHD 4K hasta 60p, 1080 hasta 240p (alta velocidad);
    4:2:2 10 bits interno; H.265 y H.264; hasta 360 Mbps; F-Log y F-Log2 (F-Log2 ≈ 13+ pasos).
  - AF híbrido con 425 puntos de detección de fase; detección de sujetos por IA
    (animales, pájaros, coches, motos/bicis, aviones, trenes) además de caras/ojos.
  - 19 simulaciones de película (incluye Nostalgic Neg. y Eterna/Cinema).
  - Pantalla táctil abatible de 3,0" y 1,84 M puntos; EVF OLED de 2,36 M puntos, 0,62x.
  - Batería NP-W235 (≈750 disparos CIPA); una ranura SD UHS-II.
  - Jack de micrófono de 3,5 mm y jack de auriculares de 3,5 mm; micro HDMI (tipo D); USB-C.
  - Objetivos de referencia del lector: **XC 15-45mm f/3.5-5.6 OIS PZ** (zoom kit,
    equivalente ≈23-69 mm en FF, con OIS y zoom motorizado), **XF 23mm f/2 WR** y
    **XF 35mm f/1.4 R** (equivalentes ≈35 mm y ≈53 mm en FF).
- Lightroom Classic y Premiere Pro actuales (2024+). Nada de UI inventada al detalle:
  describe paneles y flujos reales.

## 3. Esqueleto de página (copiar exactamente)

Archivo: `content/<id>.html`. El shell (sidebar, topbar, TOC, pager, búsqueda) lo inyecta
`app.js` — el archivo SOLO contiene `<div class="content">`.

```html
<!DOCTYPE html>
<html lang="es" data-root="../">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="…una frase específica del capítulo…">
<title>…Título del capítulo… — Fuji X-S20 Field Guide</title>
<link rel="stylesheet" href="../assets/css/main.css">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect x='8' y='8' width='84' height='84' rx='14' fill='%230c0e11'/><path d='M24 24h16M24 24v16M76 24H60M76 24v16M24 76h16M24 76V60M76 76H60M76 76V60' stroke='%234ade80' stroke-width='7' stroke-linecap='round' fill='none'/></svg>">
</head>
<body data-chapter="<id>">

<div class="content">

  <div class="chapter-hero">
    <span class="fc"></span>
    <div class="hero-readout">
      <span class="r-part">Parte II · El enfoque</span>
      <span>Capítulo 4</span>
      <span>≈45 min</span>
    </div>
    <h1>El sistema de autofoco</h1>
    <p class="hero-lede">Dos o tres frases que enmarcan el capítulo: qué vas a entender
    al terminar y por qué importa en un viaje.</p>
    <div class="hero-meta">
      <span class="pill pill-part">PDAF y CDAF</span>
      <span class="pill">AF-S / AF-C / MF</span>
      <span class="pill">Back button focus</span>
    </div>
  </div>

  <h2 id="mi-seccion">…</h2>
  …contenido…

</div>

<script src="../assets/js/manifest.js"></script>
<script src="../assets/js/search-index.js" defer></script>
<script src="../assets/js/app.js" defer></script>
</body>
</html>
```

Reglas:
- `data-chapter` = id exacto del manifest (`assets/js/manifest.js`).
- **Todos los `h2` y `h3` llevan `id` explícito** en kebab-case español (`id="el-histograma"`).
  Son la API de enlaces del manual: estables y descriptivos.
- Estructura: 6–10 `h2` por capítulo, con `h3` dentro. Nada de `h4` salvo necesidad real.
- El pager (anterior/siguiente) y el botón «completado» los añade app.js: NO escribirlos.

## 4. Catálogo de componentes

El icono y el título de los callouts los inyecta app.js — escribe solo el contenido.
`data-title` personaliza el título (úsalo a menudo: «Consejo» genérico < «Guarda esto en C1»).

```html
<!-- Consejo -->
<div class="callout tip" data-title="Título opcional">Texto. Puede contener <p>, <ul>, <code>.</div>

<!-- Error común -->
<div class="callout error" data-title="Error común: disparar en Wide/Tracking todo el día">…</div>

<!-- Ejercicio (práctica acotada, 10-30 min) -->
<div class="callout exercise" data-title="Ejercicio 4.2 — Un punto, cien encuadres">
  <p>Instrucciones concretas: dónde, con qué ajustes, qué observar, criterio de éxito.</p>
</div>

<!-- Reto (sesión larga, fin de capítulo) -->
<div class="callout challenge" data-title="Reto del capítulo">…</div>

<!-- Curiosidad (historia, porqué técnico) -->
<div class="callout fact">…</div>

<!-- Resumen (fin de sección o capítulo; siempre <ul>) -->
<div class="callout summary" data-title="Lo esencial del capítulo"><ul><li>…</li></ul></div>

<!-- En la X-S20 (aterrizar un concepto en ESTA cámara) -->
<div class="callout gear" data-title="En la X-S20">…</div>

<!-- Pregunta frecuente (plegable; el título ES la pregunta) -->
<details class="callout faq">
  <summary>¿Puedo usar AF-C para todo y olvidarme?</summary>
  <div class="co-body"><p>…respuesta honesta con matices…</p></div>
</details>
```

Otros componentes:

```html
<!-- Ruta de menú de la cámara -->
<p class="menu-path"><b>MENU</b> <span class="sep">→</span> AF/MF <span class="sep">→</span> AF MODE <span class="sep">→</span> <b>ZONE</b></p>

<!-- Ficha de ajuste recomendado -->
<div class="setting-card">
  <span class="s-name">Auto ISO 1</span>
  <span class="s-value">160–3200 · mín 1/125</span>
  <span class="s-why">Por qué: caminando por ciudad, 1/125 congela tu propio balanceo…</span>
</div>

<!-- Comparativa en tabla (siempre dentro de .table-wrap) -->
<div class="table-wrap"><table>
  <thead><tr><th>Modo</th><th>Cómo decide</th><th>Úsalo para</th><th>Evítalo para</th></tr></thead>
  <tbody><tr><td><strong>AF-S</strong></td><td>…</td><td>…</td><td>…</td></tr></tbody>
</table></div>

<!-- Grid de tarjetas -->
<div class="card-grid">
  <div class="card"><div class="card-eyebrow">24 fps</div><h4>Cine</h4><p>…</p></div>
</div>

<!-- Checklist persistente (data-cl = id global único; data-id por ítem) -->
<div class="checklist" data-cl="portugal-mochila">
  <div class="cl-title"><span>La mochila</span><span class="cl-count"></span></div>
  <label><input type="checkbox" data-id="bateria"><span>Dos baterías NP-W235 cargadas</span></label>
  <label><input type="checkbox" data-id="sd"><span>SD UHS-II formateada EN la cámara</span></label>
</div>

<!-- Comparación bien/mal, lado a lado -->
<div class="compare">
  <div class="bad"><div class="cmp-label">✕ Sin apoyo</div>…figura o texto…</div>
  <div class="good"><div class="cmp-label">✓ Codos al cuerpo</div>…</div>
</div>

<!-- Términos del glosario -->
<span class="term" title="Definición en una frase">rolling shutter</span>

<!-- kbd para diales/botones físicos -->
Mantén <kbd>AEL</kbd> y gira el <kbd>dial trasero</kbd>.
```

## 5. Diagramas SVG

Los conceptos visuales van en SVG inline, dentro de `figure.diagram`:

```html
<figure class="diagram">
  <svg viewBox="0 0 640 300" role="img" aria-labelledby="d1-t" font-family="ui-monospace, Menlo, monospace" font-size="12">
    <title id="d1-t">Descripción accesible del diagrama</title>
    …
  </svg>
  <figcaption><b>Figura 4.1.</b> Una explicación que aporte, no que repita el título.</figcaption>
</figure>
```

Reglas de los SVG:
- Paleta **solo** con las variables del contenedor: trazos `var(--dg-line)` y
  `var(--dg-line-soft)`, texto `fill="var(--dg-text)"`, acento del capítulo `var(--dg-accent)`,
  y semánticos `var(--dg-green)` (correcto/foco), `var(--dg-red)` (error/REC),
  `var(--dg-amber)` (exposición), `var(--dg-blue)` (frío/info). Así funcionan en tema claro y oscuro.
- Sin fondos opacos: el fondo lo pone `figure.diagram`.
- `viewBox` proporcionado, sin width/height fijos (el CSS los hace responsive).
- Texto pequeño y en mono (hereda del atributo del svg). Etiquetas cortas.
- **Animación**: CSS embebido en un `<style>` DENTRO del svg, con clases prefijadas por
  figura (`.d41-dot { animation: … }`) para no colisionar. Anima transform/opacity.
  Añade siempre `@media (prefers-reduced-motion: reduce) { * { animation: none !important } }`
  dentro de ese style.
- Para «fotos de ejemplo» (composición, luz, tipos de plano): escenas SVG estilizadas
  (siluetas, horizontes, figuras) dentro de `.photo-ph` o `figure.diagram`. NUNCA `<img>`
  con rutas inexistentes ni fotos falsas.

## 6. Interactivos

Demos pequeñas (sliders de exposición, simulador de histograma…) van al final del capítulo
que las usa, como `<script>` inline justo antes de `</div>` de cierre… **no**: colócalo
después del contenido pero **dentro** de `.content`, en un IIFE, con ids prefijados por
capítulo (`x5-iso-slider`). Usa solo APIs estándar. Los controles con `<input type="range">`,
`<button>`, etc. estilizados de forma sobria (hereda del CSS global; puedes añadir un
`<style>` scoped con ids). Todo debe funcionar con `file://` y sin red.

## 7. Capítulos e ids clave (para cross-links)

| Archivo | Tema | Anclas que otros capítulos pueden asumir |
|---|---|---|
| 01-conociendo-la-xs20.html | Anatomía | `#dial-de-modos`, `#los-dos-diales`, `#af-on-y-ael`, `#el-joystick`, `#boton-q`, `#puertos` |
| 02-ergonomia.html | Ergonomía | `#como-sujetar-la-camara`, `#visor-o-pantalla` |
| 03-configuracion-inicial.html | Configuración | `#raw-o-jpeg`, `#auto-iso`, `#simulaciones-de-pelicula`, `#rango-dinamico-dr`, `#balance-de-blancos`, `#medicion`, `#el-menu-q`, `#my-menu`, `#modos-custom` |
| 04-enfoque.html | Autofoco | `#pdaf-y-cdaf`, `#af-s`, `#af-c`, `#enfoque-manual`, `#back-button-focus`, `#deteccion-de-sujetos`, `#areas-de-enfoque` |
| 05-exposicion.html | Exposición | `#el-sensor`, `#el-triangulo-de-exposicion`, `#iso-y-ruido`, `#la-apertura`, `#la-velocidad`, `#el-histograma`, `#compensacion-de-exposicion`, `#ettr`, `#rango-dinamico` |
| 06-objetivos.html | Objetivos | `#perspectiva-y-compresion`, `#profundidad-de-campo`, `#23mm`, `#35mm` |
| 07-composicion.html | Composición | `#leading-lines`, `#espacio-negativo`, `#capas`, `#peso-visual`, `#encuadre-dentro-del-encuadre` |
| 08-luz.html | Luz | `#golden-hour`, `#blue-hour`, `#luz-dura-y-suave`, `#contraluz` |
| 09-video.html | Vídeo | `#que-es-un-frame`, `#fps`, `#la-regla-de-los-180-grados`, `#codecs`, `#bitrate`, `#8-bits-vs-10-bits`, `#f-log2`, `#luts`, `#ibis-en-video`, `#rolling-shutter` |
| 10-movimientos-de-camara.html | Movimientos | `#pan`, `#tilt`, `#push-y-pull`, `#orbit`, `#tracking`, `#handheld` |
| 11-tipos-de-plano.html | Planos | `#plano-general`, `#plano-medio`, `#primer-plano`, `#plano-detalle` |
| 12-storytelling.html | Storytelling | `#la-secuencia`, `#b-roll`, `#shot-list` |
| 13-lightroom.html | Lightroom | `#el-catalogo`, `#seleccion-y-rating`, `#revelado`, `#mascaras`, `#exportacion` |
| 14-premiere.html | Premiere | `#el-proyecto`, `#el-timeline`, `#audio`, `#color`, `#exportar` |
| 15-portugal.html | Portugal | `#shot-list-portugal`, `#checklists` |
| glosario.html | Glosario | por término: `#termino` |

## 8. Checklist de calidad antes de dar por bueno un capítulo

- [ ] Hero completo (readout con parte/capítulo/minutos correctos según manifest).
- [ ] Todos los h2/h3 con id explícito; los de la tabla anterior, exactos.
- [ ] ≥1 diagrama SVG significativo (los capítulos visuales: varios).
- [ ] ≥2 ejercicios + 1 reto; ≥2 errores comunes; ≥1 resumen final; ≥1 FAQ.
- [ ] ≥1 callout gear («En la X-S20») aterrizando la teoría en la cámara.
- [ ] Cross-links reales a otros capítulos (relativos, mismo directorio).
- [ ] Cero datos técnicos sin verificar; cero contenido duplicado de otro capítulo.
- [ ] Español impecable; términos del glosario marcados con `.term` la primera vez.
- [ ] HTML válido (etiquetas cerradas, entidades escapadas) y sin `<img>` rotos.
