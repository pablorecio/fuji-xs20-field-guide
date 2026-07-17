/* ============================================================
   Fuji X-S20 Field Guide — manifest de navegación
   Única fuente de verdad de la estructura del manual.
   La sidebar, el roadmap, el prev/next y el progreso global
   se generan automáticamente desde este objeto.
   ============================================================ */

const GUIDE = {
  title: 'Fuji X-S20 Field Guide',
  subtitle: 'Fotografía y vídeo de viaje, desde cero, con la Fujifilm X-S20',

  /* Cada parte tiene un color propio que recorre toda la UI
     (sidebar, chips, heros de capítulo, roadmap). */
  parts: [
    {
      num: 'I', slug: 'camara', title: 'Conociendo la X-S20', color: '#94A3B8',
      chapters: [
        { id: '01-conociendo-la-xs20', title: 'Anatomía de la X-S20', subtitle: 'Todos los botones, diales y puertos, uno a uno', minutes: 35 },
        { id: '02-ergonomia', title: 'Ergonomía', subtitle: 'Cómo sujetar la cámara, postura, respiración, visor y pantalla', minutes: 18 },
        { id: '03-configuracion-inicial', title: 'Configuración inicial', subtitle: 'RAW, ISO Auto, simulaciones, menús Q y My Menu, modos custom', minutes: 40 },
      ],
    },
    {
      num: 'II', slug: 'enfoque', title: 'El enfoque', color: '#34D399',
      chapters: [
        { id: '04-enfoque', title: 'El sistema de autofoco', subtitle: 'PDAF, CDAF, modos AF, áreas, detección de sujetos y back button focus', minutes: 45 },
      ],
    },
    {
      num: 'III', slug: 'exposicion', title: 'Exposición', color: '#FBBF24',
      chapters: [
        { id: '05-exposicion', title: 'La exposición', subtitle: 'El sensor, el triángulo de exposición, histograma, ETTR y rango dinámico', minutes: 50 },
      ],
    },
    {
      num: 'IV', slug: 'objetivos', title: 'Objetivos', color: '#60A5FA',
      chapters: [
        { id: '06-objetivos', title: 'El zoom kit y los dos fijos', subtitle: 'El 15-45, el 23 y el 35: perspectiva, compresión, profundidad de campo y cuándo cambiar de lente', minutes: 40 },
      ],
    },
    {
      num: 'V', slug: 'composicion', title: 'Composición', color: '#E879F9',
      chapters: [
        { id: '07-composicion', title: 'Aprender a mirar', subtitle: 'Líneas, espacio negativo, capas, peso visual, escala y profundidad', minutes: 45 },
      ],
    },
    {
      num: 'VI', slug: 'luz', title: 'La luz', color: '#FB923C',
      chapters: [
        { id: '08-luz', title: 'Leer la luz', subtitle: 'Golden hour, blue hour, luz dura y suave, contraluz y sombras', minutes: 35 },
      ],
    },
    {
      num: 'VII', slug: 'video', title: 'Vídeo', color: '#F87171',
      chapters: [
        { id: '09-video', title: 'Vídeo desde cero', subtitle: 'Frames, FPS, regla de 180°, códecs, bitrate, F-Log2 y LUTs', minutes: 55 },
        { id: '10-movimientos-de-camara', title: 'Movimientos de cámara', subtitle: 'Push, pull, pan, tilt, reveal, orbit y tracking', minutes: 25 },
        { id: '11-tipos-de-plano', title: 'Tipos de plano', subtitle: 'Del gran plano general al detalle: el vocabulario visual del vídeo', minutes: 25 },
      ],
    },
    {
      num: 'VIII', slug: 'storytelling', title: 'Storytelling', color: '#F472B6',
      chapters: [
        { id: '12-storytelling', title: 'Contar un viaje', subtitle: 'Secuencias, B-roll, shot lists y cómo grabar ciudades, camping y naturaleza', minutes: 40 },
      ],
    },
    {
      num: 'IX', slug: 'lightroom', title: 'Lightroom', color: '#38BDF8',
      chapters: [
        { id: '13-lightroom', title: 'Revelado en Lightroom', subtitle: 'Catálogo, selección, revelado, máscaras, color y exportación', minutes: 40 },
      ],
    },
    {
      num: 'X', slug: 'premiere', title: 'Premiere', color: '#A78BFA',
      chapters: [
        { id: '14-premiere', title: 'Montaje en Premiere', subtitle: 'Proyecto, timeline, audio, color y exportar para Instagram y YouTube', minutes: 40 },
      ],
    },
    {
      num: 'XI', slug: 'portugal', title: 'Portugal', color: '#2DD4BF',
      chapters: [
        { id: '15-portugal', title: 'Guía de campo: Portugal', subtitle: 'Shot list, checklists y cómo disfrutar el viaje sin vivir tras la cámara', minutes: 30 },
      ],
    },
    {
      num: '—', slug: 'referencia', title: 'Referencia', color: '#8B93A1',
      chapters: [
        { id: 'glosario', title: 'Glosario', subtitle: 'Todos los términos del manual, explicados en una frase', minutes: 15 },
      ],
    },
  ],
};

/* -------- Helpers derivados (usados por app.js) -------- */

GUIDE.flat = GUIDE.parts.flatMap(part =>
  part.chapters.map(ch => Object.assign({ part }, ch))
);

GUIDE.byId = Object.fromEntries(GUIDE.flat.map(ch => [ch.id, ch]));

GUIDE.indexOf = function (id) {
  return GUIDE.flat.findIndex(ch => ch.id === id);
};
