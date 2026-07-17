# Fuji X-S20 Field Guide

**Manual interactivo de fotografía y vídeo de viaje con la Fujifilm X-S20** — un curso
completo en español, equivalente a un libro de ~250 páginas, que se lee en el navegador.

**Léelo aquí → https://pablorecio.github.io/fuji-xs20-field-guide/**

## Qué es

No es una hoja de especificaciones ni una colección de "ajustes mágicos": es un curso que
va de los fotones al vídeo publicado, escrito alrededor de una cámara concreta y pensado
para documentar viajes. La idea que lo recorre todo: **entender antes que memorizar**.

- **Parte I–III** · La cámara: anatomía botón a botón, ergonomía, configuración razonada,
  el sistema de autofoco (PDAF/CDAF, áreas, detección de sujetos) y la exposición a fondo
  (sensor, triángulo, histograma, ETTR, rango dinámico).
- **Parte IV–VI** · La imagen: objetivos (el zoom kit 15-45 y los fijos 23/35), composición
  ("aprender a mirar", no reglas) y lectura de la luz.
- **Parte VII–X** · El vídeo, desde cero: frames, FPS, regla de los 180°, códecs, 10 bits,
  F-Log2 y LUTs; movimientos de cámara y tipos de plano con diagramas animados;
  storytelling; y los flujos completos de Lightroom y Premiere.
- **Parte XI** · Una guía de campo aplicada: Portugal, con shot lists y checklists.

Incluye ~70 diagramas SVG (muchos animados), 4 demos interactivas, ejercicios de campo en
cada capítulo, checklists persistentes, glosario de 136 términos enlazados, búsqueda
instantánea (⌘K), notas personales, marcadores y progreso de lectura (todo en
localStorage, nada sale de tu navegador).

## Ejecutar en local

No hay build, dependencias ni servidor: **abre `index.html`** en cualquier navegador.

## Arquitectura

- HTML + CSS + JavaScript vanilla; funciona bajo `file://` y en cualquier hosting estático.
- Cada capítulo es un HTML autónomo en `content/`; la navegación (sidebar, pager, roadmap)
  se genera desde `assets/js/manifest.js`.
- `AUTHORING.md` documenta el sistema de componentes y las reglas de estilo/rigor.
- Herramientas de mantenimiento (solo para editar contenido):
  `python3 tools/build-search-index.py` regenera el índice de búsqueda y
  `python3 tools/check-links.py` verifica todos los enlaces internos.

## Aviso

Manual no oficial, sin afiliación alguna con Fujifilm. Los datos de la cámara se han
contrastado con el [manual oficial de la X-S20](https://fujifilm-dsc.com/en/manual/x-s20/);
verifica siempre en tu propio cuerpo/firmware.
