/* ============================================================
   Fuji X-S20 Field Guide — runtime
   ------------------------------------------------------------
   Cada página contiene solo su <div class="content">. Este
   script construye alrededor el shell de la aplicación:
   sidebar, topbar, TOC con scrollspy, buscador ⌘K, paneles de
   notas y marcadores, pager, progreso y atajos de teclado.
   Todo el estado del lector vive en localStorage.
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Contexto de página ---------- */

  const ROOT = document.documentElement.getAttribute('data-root') || '';
  const CHAPTER_ID = document.body.getAttribute('data-chapter') || '';
  const chapter = GUIDE.byId[CHAPTER_ID] || null;
  const chIndex = chapter ? GUIDE.indexOf(CHAPTER_ID) : -1;

  const urlOf = ch => ROOT + 'content/' + ch.id + '.html';
  const HOME = ROOT + 'index.html';

  /* ---------- Almacenamiento ---------- */

  /* Feature-test de localStorage: si no está disponible (modo privado,
     storage deshabilitado), degradamos a memoria de sesión y la UI de
     notas avisa de que no hay persistencia en lugar de fingirla. */
  const memStore = {};
  let storageOK = (() => {
    try {
      localStorage.setItem('xs20:probe', '1');
      localStorage.removeItem('xs20:probe');
      return true;
    } catch { return false; }
  })();

  const store = {
    /* mutable: si un setItem tardío falla (cuota, modo privado), el backend
       pasa a memoria y las lecturas siguen viendo lo último escrito */
    get ok() { return storageOK; },
    get(key, fallback) {
      try {
        if (key in memStore) return JSON.parse(memStore[key]);
        if (!storageOK) return fallback;
        const raw = localStorage.getItem('xs20:' + key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch { return fallback; }
    },
    set(key, value) {
      const raw = JSON.stringify(value);
      if (storageOK) {
        try {
          localStorage.setItem('xs20:' + key, raw);
          delete memStore[key];
          return true;
        } catch { storageOK = false; }
      }
      memStore[key] = raw;
      return false;
    },
  };

  /* ---------- Iconos ---------- */

  const svg = (paths, vb) =>
    `<svg viewBox="${vb || '0 0 24 24'}" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

  const ICONS = {
    search: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/>'),
    menu: svg('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    theme: svg('<circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5 5l1.6 1.6M17.4 17.4 19 19M19 5l-1.6 1.6M6.6 17.4 5 19"/>'),
    note: svg('<path d="M5 4h11l3 3v13H5z"/><path d="M15 4v4h4M9 12h6M9 16h6"/>'),
    bookmark: svg('<path d="M7 3h10v18l-5-4-5 4z"/>'),
    bookmarkFill: '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M7 3h10v18l-5-4-5 4z"/></svg>',
    keyboard: svg('<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10"/>'),
    up: svg('<path d="M12 19V5M6 11l6-6 6 6"/>'),
    check: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
    close: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
    caret: svg('<path d="m9 6 6 6-6 6"/>'),
    /* Iconos de callout */
    tip: svg('<path d="M9.5 18h5M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.7 1.5 1.5 1.5 2.5h5c0-1 .7-1.8 1.5-2.5A6 6 0 0 0 12 3z"/>'),
    error: svg('<path d="M12 3 2.5 20h19L12 3z"/><path d="M12 10v4.5M12 17.5v.01"/>'),
    exercise: svg('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>'),
    challenge: svg('<path d="M6 3v18M6 4h11l-2.5 4L17 12H6"/>'),
    fact: svg('<path d="M12 3.5 13.8 9l5.7.2-4.5 3.5 1.6 5.5L12 15l-4.6 3.2L9 12.7 4.5 9.2 10.2 9z"/>'),
    summary: svg('<path d="M5 6h14M5 12h14M5 18h9"/>'),
    faq: svg('<circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 1 1 3.4 2.9c-.7.3-1 .8-1 1.6M12 17v.01"/>'),
    gear: svg('<rect x="3" y="7" width="18" height="13" rx="2.5"/><circle cx="13" cy="13.5" r="3.6"/><path d="M8 7l1.4-2.6h5.2L16 7"/><path d="M6 10.5h.01"/>'),
    checklist: svg('<rect x="4" y="4" width="16" height="16" rx="3"/><path d="m8.5 12.5 2.5 2.5 5-5.5"/>'),
  };

  const CALLOUT_META = {
    tip: ['Consejo', 'tip'],
    error: ['Error común', 'error'],
    exercise: ['Ejercicio', 'exercise'],
    challenge: ['Reto', 'challenge'],
    fact: ['Curiosidad', 'fact'],
    summary: ['Resumen', 'summary'],
    faq: ['Pregunta frecuente', 'faq'],
    gear: ['En la X-S20', 'gear'],
  };

  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const MOD = isMac ? '⌘' : 'Ctrl';

  /* ============================================================
     1. Construcción del shell
     ============================================================ */

  const content = document.querySelector('.content');
  if (!content) return;

  const app = document.createElement('div');
  app.className = 'app';

  /* --- Sidebar --- */
  const doneMap = store.get('done', {});
  const openParts = store.get('navopen', null);

  const sidebar = document.createElement('nav');
  sidebar.className = 'sidebar';
  sidebar.setAttribute('aria-label', 'Índice del manual');
  sidebar.innerHTML = `
    <a class="sidebar-brand" href="${HOME}">
      <div class="brand-name">Fuji X-S20<br>Field Guide</div>
      <div class="brand-sub">Manual de campo · foto + vídeo</div>
    </a>
    <button class="sidebar-search-btn" type="button" data-action="search">
      ${ICONS.search}<span>Buscar…</span><span class="kbd-hint">${MOD} K</span>
    </button>
    <div class="nav-parts"></div>
    <div class="sidebar-foot">
      <button class="icon-btn" type="button" data-action="theme" title="Cambiar tema">${ICONS.theme}<span>Tema</span></button>
      <button class="icon-btn" type="button" data-action="bookmarks" title="Marcadores (b)">${ICONS.bookmark}<span>Marcadores</span></button>
      <button class="icon-btn" type="button" data-action="shortcuts" title="Atajos de teclado (?)">${ICONS.keyboard}<span>Atajos</span></button>
    </div>`;

  const navParts = sidebar.querySelector('.nav-parts');
  GUIDE.parts.forEach((part, pi) => {
    const isActive = chapter && chapter.part === part;
    const open = openParts ? !!openParts[pi] || isActive : true;
    const el = document.createElement('div');
    el.className = 'nav-part' + (open ? ' open' : '');
    el.style.setProperty('--dot', part.color);
    const label = document.createElement('button');
    label.type = 'button';
    label.className = 'nav-part-label';
    label.setAttribute('aria-expanded', String(open));
    label.innerHTML = `<span class="nav-part-dot"></span><span class="nav-part-num">${part.num}</span><span>${part.title}</span><span class="nav-part-caret">${ICONS.caret}</span>`;
    label.addEventListener('click', () => {
      el.classList.toggle('open');
      label.setAttribute('aria-expanded', String(el.classList.contains('open')));
      const state = {};
      navParts.querySelectorAll('.nav-part').forEach((p, i) => { state[i] = p.classList.contains('open'); });
      store.set('navopen', state);
    });
    const list = document.createElement('div');
    list.className = 'nav-chapters';
    part.chapters.forEach(ch => {
      const a = document.createElement('a');
      a.className = 'nav-chapter' + (ch.id === CHAPTER_ID ? ' active' : '');
      a.href = urlOf(ch);
      a.innerHTML = `<span>${ch.title}</span>` + (doneMap[ch.id] ? `<span class="done-tick" title="Completado">✓</span>` : '');
      list.appendChild(a);
    });
    el.append(label, list);
    navParts.appendChild(el);
  });

  /* --- Topbar --- */
  const topbar = document.createElement('header');
  topbar.className = 'topbar';
  const crumb = chapter
    ? `<b>${chapter.part.num}</b> · ${chapter.part.title} <span class="sep">/</span> ${chapter.title}`
    : GUIDE.subtitle;
  topbar.innerHTML = `
    <button class="icon-btn menu-toggle" type="button" data-action="menu" aria-label="Abrir índice">${ICONS.menu}</button>
    <div class="topbar-crumb">${crumb}</div>
    <div class="topbar-actions">
      ${chapter ? `<button class="icon-btn" type="button" data-action="notes" title="Notas de este capítulo (n)">${ICONS.note}<span>Notas</span></button>` : ''}
      <button class="icon-btn" type="button" data-action="search" aria-label="Buscar">${ICONS.search}</button>
    </div>`;

  /* --- Ensamblado --- */
  const main = document.createElement('div');
  main.className = 'main';
  content.parentNode.insertBefore(app, content);
  main.appendChild(topbar);
  main.appendChild(content);
  app.append(sidebar, main);

  const scrim = document.createElement('div');
  scrim.className = 'sidebar-scrim';
  document.body.appendChild(scrim);

  const progressbar = document.createElement('div');
  progressbar.className = 'progressbar';
  progressbar.innerHTML = '<i></i>';
  document.body.appendChild(progressbar);
  const progressFill = progressbar.firstElementChild;

  const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scrollBehavior = () => (REDUCE_MOTION.matches ? 'auto' : 'smooth');

  const toTop = document.createElement('button');
  toTop.type = 'button';
  toTop.className = 'to-top';
  toTop.title = 'Volver arriba (t)';
  toTop.innerHTML = ICONS.up;
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: scrollBehavior() }));
  document.body.appendChild(toTop);

  /* Color de la parte activa */
  if (chapter) document.documentElement.style.setProperty('--part', chapter.part.color);

  /* ============================================================
     2. Encabezados: ids, anclas, marcadores
     ============================================================ */

  const slugify = text => text.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const headings = Array.from(content.querySelectorAll('h2, h3'));
  const usedIds = new Set();
  headings.forEach(h => {
    if (!h.id) {
      let id = slugify(h.textContent) || 'seccion';
      while (usedIds.has(id)) id += '-b';
      h.id = id;
    }
    usedIds.add(h.id);
    const a = document.createElement('a');
    a.className = 'heading-anchor';
    a.href = '#' + h.id;
    a.textContent = '#';
    a.setAttribute('aria-label', 'Enlace a esta sección');
    h.appendChild(a);
  });

  /* Marcadores sobre h2 */
  const bookmarks = () => store.get('bookmarks', []);
  const bmKey = h => CHAPTER_ID + '#' + h.id;

  if (chapter) {
    content.querySelectorAll('h2').forEach(h => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'bm-btn';
      const sync = () => {
        const on = bookmarks().some(b => b.key === bmKey(h));
        btn.classList.toggle('on', on);
        btn.innerHTML = on ? ICONS.bookmarkFill : ICONS.bookmark;
        btn.title = on ? 'Quitar marcador' : 'Guardar marcador';
      };
      btn.addEventListener('click', () => {
        let list = bookmarks();
        const key = bmKey(h);
        if (list.some(b => b.key === key)) list = list.filter(b => b.key !== key);
        else list.push({ key, chapter: CHAPTER_ID, hash: h.id, title: h.textContent.replace('#', '').trim() });
        store.set('bookmarks', list);
        sync();
      });
      sync();
      h.prepend(btn);
    });
  }

  /* ============================================================
     3. TOC + scrollspy
     ============================================================ */

  /* La TOC se construye siempre y el CSS la oculta en pantallas estrechas,
     para que aparezca al ensanchar la ventana sin recargar */
  if (chapter && headings.length > 1) {
    const toc = document.createElement('aside');
    toc.className = 'toc';
    toc.setAttribute('aria-label', 'En esta página');
    toc.innerHTML = '<div class="toc-title">En esta página</div>';
    headings.forEach(h => {
      const a = document.createElement('a');
      a.href = '#' + h.id;
      a.dataset.level = h.tagName === 'H3' ? '3' : '2';
      a.textContent = h.textContent.replace('#', '').trim();
      toc.appendChild(a);
    });
    main.appendChild(toc);

    const links = Array.from(toc.querySelectorAll('a'));
    const byId = Object.fromEntries(links.map(a => [a.getAttribute('href').slice(1), a]));
    let current = null;
    const paintSpy = () => {
      links.forEach(l => l.classList.remove('active'));
      if (current && byId[current]) byId[current].classList.add('active');
    };
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) current = e.target.id; });
      /* Por encima del primer encabezado (hero) no hay sección activa */
      if (headings[0].getBoundingClientRect().top > window.innerHeight * 0.25) current = null;
      paintSpy();
    }, { rootMargin: '-15% 0px -75% 0px' });
    headings.forEach(h => spy.observe(h));
    window.addEventListener('scroll', () => {
      if (current && headings[0].getBoundingClientRect().top > window.innerHeight * 0.25) {
        current = null;
        paintSpy();
      }
    }, { passive: true });
  }

  /* ============================================================
     4. Callouts: icono + título automáticos
     ============================================================ */

  content.querySelectorAll('.callout').forEach(co => {
    const type = Object.keys(CALLOUT_META).find(t => co.classList.contains(t));
    if (!type) return;
    const [defTitle, icon] = CALLOUT_META[type];
    if (co.tagName === 'DETAILS') {
      const summary = co.querySelector('summary');
      if (summary && !summary.querySelector('.co-icon')) {
        summary.insertAdjacentHTML('afterbegin', `<span class="co-icon">${ICONS[icon]}</span>`);
      }
      return;
    }
    if (co.querySelector('.co-icon')) return;
    const title = co.getAttribute('data-title') || defTitle;
    const body = document.createElement('div');
    body.className = 'co-body';
    while (co.firstChild) body.appendChild(co.firstChild);
    co.innerHTML = `<span class="co-icon">${ICONS[icon]}</span><span class="co-title">${title}</span>`;
    co.appendChild(body);
  });

  /* ============================================================
     5. Checklists persistentes
     ============================================================ */

  content.querySelectorAll('.checklist').forEach((cl, ci) => {
    const clKey = 'cl:' + (cl.dataset.cl || CHAPTER_ID + ':' + ci);
    const saved = store.get(clKey, {});
    const boxes = Array.from(cl.querySelectorAll('input[type="checkbox"]'));
    const count = cl.querySelector('.cl-count');
    const title = cl.querySelector('.cl-title');
    if (title && !title.querySelector('svg')) title.insertAdjacentHTML('afterbegin', ICONS.checklist);
    const refresh = () => {
      if (count) count.textContent = boxes.filter(b => b.checked).length + ' / ' + boxes.length;
    };
    boxes.forEach((box, bi) => {
      const id = box.dataset.id || String(bi);
      box.checked = !!saved[id];
      box.addEventListener('change', () => {
        const state = store.get(clKey, {});
        state[id] = box.checked;
        store.set(clKey, state);
        refresh();
      });
    });
    refresh();
  });

  /* ============================================================
     6. Pager + fin de capítulo
     ============================================================ */

  if (chapter) {
    const prev = GUIDE.flat[chIndex - 1];
    const next = GUIDE.flat[chIndex + 1];
    const end = document.createElement('div');
    end.className = 'chapter-end';
    end.innerHTML = `
      <button class="mark-done-btn" type="button">${ICONS.check}<span></span></button>
      <div class="pager">
        ${prev ? `<a class="prev" href="${urlOf(prev)}"><span class="pager-dir">← Anterior</span><span class="pager-title">${prev.title}</span></a>` : ''}
        ${next ? `<a class="next" href="${urlOf(next)}"><span class="pager-dir">Siguiente →</span><span class="pager-title">${next.title}</span></a>` : ''}
      </div>`;
    content.appendChild(end);

    const doneBtn = end.querySelector('.mark-done-btn');
    const syncDone = () => {
      const done = !!store.get('done', {})[CHAPTER_ID];
      doneBtn.classList.toggle('done', done);
      doneBtn.querySelector('span').textContent = done ? 'Capítulo completado' : 'Marcar como completado';
    };
    doneBtn.addEventListener('click', () => {
      const map = store.get('done', {});
      if (map[CHAPTER_ID]) delete map[CHAPTER_ID];
      else map[CHAPTER_ID] = Date.now();
      store.set('done', map);
      syncDone();
    });
    syncDone();

    /* Guarda el último capítulo visitado para "continuar leyendo" */
    store.set('last', CHAPTER_ID);
  }

  /* ============================================================
     7. Scroll: progreso, to-top, reveals
     ============================================================ */

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      progressFill.style.width = (max > 0 ? Math.min(100, (y / max) * 100) : 0) + '%';
      toTop.classList.toggle('show', y > 900);
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const revealables = content.querySelectorAll('.reveal');
  if (revealables.length) {
    const ro = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('rev-in'); ro.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    revealables.forEach(el => ro.observe(el));
  }

  /* ============================================================
     8. Paneles: notas, marcadores, atajos
     ============================================================ */

  let openPanel = null;
  let panelOpener = null;

  function makePanel(id, title, icon, fillBody) {
    const panel = document.createElement('aside');
    panel.className = 'panel';
    panel.id = 'panel-' + id;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', title);
    panel.inert = true; /* cerrado: fuera del orden de tabulación */
    panel.innerHTML = `
      <div class="panel-head">${icon}<span>${title}</span>
        <button class="close-btn" type="button" aria-label="Cerrar">${ICONS.close}</button>
      </div>
      <div class="panel-body"></div>`;
    panel.querySelector('.close-btn').addEventListener('click', () => togglePanel(id, false));
    document.body.appendChild(panel);
    panel._fill = fillBody;
    return panel;
  }

  function togglePanel(id, force) {
    const panel = document.getElementById('panel-' + id);
    if (!panel) return;
    const willOpen = force !== undefined ? force : !panel.classList.contains('open');
    document.querySelectorAll('.panel.open').forEach(p => { p.classList.remove('open'); p.inert = true; });
    if (willOpen) {
      panelOpener = document.activeElement;
      panel._fill(panel.querySelector('.panel-body'));
      panel.classList.remove('open'); /* fuerza reflujo de la transición si ya estaba */
      panel.inert = false;
      panel.classList.add('open');
      openPanel = id;
      const target = panel.querySelector('textarea, a, input, button:not(.close-btn)') || panel.querySelector('.close-btn');
      setTimeout(() => target && target.focus(), 60);
    } else {
      openPanel = null;
      if (panelOpener && document.body.contains(panelOpener)) panelOpener.focus();
      panelOpener = null;
    }
  }

  /* Notas del capítulo */
  if (chapter) {
    makePanel('notes', 'Notas · ' + chapter.title, ICONS.note, body => {
      if (body.dataset.ready) return;
      body.dataset.ready = '1';
      const ta = document.createElement('textarea');
      ta.className = 'notes-area';
      ta.placeholder = 'Apuntes de este capítulo: ajustes que te funcionan, dudas, ideas para probar en el próximo paseo…';
      ta.value = store.get('notes:' + CHAPTER_ID, '');
      let t;
      const flush = () => { clearTimeout(t); store.set('notes:' + CHAPTER_ID, ta.value); };
      ta.addEventListener('input', () => {
        clearTimeout(t);
        t = setTimeout(flush, 300);
      });
      /* No perder la última edición al navegar o cerrar rápido */
      ta.addEventListener('blur', flush);
      window.addEventListener('pagehide', flush);
      const hint = document.createElement('p');
      hint.className = 'panel-hint';
      hint.textContent = store.ok
        ? 'Se guarda automáticamente en este navegador (localStorage).'
        : '⚠ Este navegador no permite guardar: las notas se perderán al cerrar la página.';
      body.append(ta, hint);
    });
  }

  /* Marcadores */
  makePanel('bookmarks', 'Marcadores', ICONS.bookmark, body => {
    const list = bookmarks();
    body.innerHTML = list.length ? '' :
      '<p class="muted">Aún no has guardado marcadores. Pasa el cursor sobre cualquier título de sección y pulsa el icono del marcador.</p>';
    list.forEach(b => {
      const ch = GUIDE.byId[b.chapter];
      if (!ch) return;
      const a = document.createElement('a');
      a.className = 'bm-item';
      a.href = urlOf(ch) + '#' + b.hash;
      a.innerHTML = `<span>${b.title}</span><span class="bm-chapter">${ch.part.num} · ${ch.title}</span>`;
      body.appendChild(a);
    });
  });

  /* Atajos */
  makePanel('shortcuts', 'Atajos de teclado', ICONS.keyboard, body => {
    if (body.dataset.ready) return;
    body.dataset.ready = '1';
    const rows = [
      [`${MOD} K`, 'Buscar en el manual'],
      ['/', 'Buscar en el manual'],
      ['← →', 'Capítulo anterior / siguiente'],
      ['t', 'Volver arriba'],
      ['n', 'Notas del capítulo'],
      ['b', 'Marcadores'],
      ['?', 'Esta ayuda'],
      ['Esc', 'Cerrar paneles y búsqueda'],
    ];
    body.innerHTML = rows.map(([k, d]) =>
      `<div class="shortcut-row"><span>${d}</span><kbd>${k}</kbd></div>`).join('');
  });

  /* ============================================================
     9. Búsqueda instantánea
     ============================================================ */

  const overlay = document.createElement('div');
  overlay.className = 'search-overlay';
  overlay.innerHTML = `
    <div class="search-box" role="dialog" aria-modal="true" aria-label="Buscar en el manual">
      <div class="search-input-row">${ICONS.search}
        <input type="text" placeholder="Buscar: enfoque, F-Log2, histograma, golden hour…"
          role="combobox" aria-expanded="true" aria-controls="search-results-list"
          aria-autocomplete="list" aria-label="Buscar" autocomplete="off" spellcheck="false">
        <button class="close-btn" type="button" aria-label="Cerrar búsqueda">${ICONS.close}</button>
      </div>
      <div class="search-results" id="search-results-list" role="listbox" aria-label="Resultados"></div>
      <div class="search-foot"><span>↑↓ navegar</span><span>↵ abrir</span><span>esc cerrar</span></div>
    </div>`;
  document.body.appendChild(overlay);

  const input = overlay.querySelector('input');
  const resultsEl = overlay.querySelector('.search-results');
  overlay.querySelector('.close-btn').addEventListener('click', () => closeSearch());
  let searchOpener = null;

  /* Trampa de foco: Tab circula dentro del diálogo de búsqueda */
  overlay.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const focusables = Array.from(overlay.querySelectorAll('input, button, a[href]'))
      .filter(el => el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  let hits = [];
  let sel = 0;

  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const escapeHtml = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* Resalta en una sola pasada sobre el texto plano: evita que un término
     reescriba el markup insertado por otro (p. ej. buscar «la mar») */
  function highlight(text, terms) {
    const valid = terms.filter(t => t.length >= 2)
      .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (!valid.length) return escapeHtml(text);
    const re = new RegExp('(' + valid.join('|') + ')', 'ig');
    return text.split(re)
      .map((part, i) => (i % 2 ? '<mark>' + escapeHtml(part) + '</mark>' : escapeHtml(part)))
      .join('');
  }

  function runSearch(q) {
    const index = window.SEARCH_INDEX || [];
    const terms = norm(q).split(/\s+/).filter(Boolean);
    if (!terms.length) {
      resultsEl.setAttribute('role', 'status');
      resultsEl.innerHTML = '<div class="search-empty">Escribe para buscar en los ' + GUIDE.flat.length + ' capítulos del manual.</div>';
      hits = [];
      input.removeAttribute('aria-activedescendant');
      return;
    }
    hits = [];
    for (const entry of index) {
      const t = norm(entry.t), x = norm(entry.x || ''), k = norm(entry.k || '');
      const b = norm(entry.b || '');
      let score = 0;
      let ok = true;
      for (const term of terms) {
        if (t.includes(term)) score += t.startsWith(term) ? 14 : 9;
        else if (k.includes(term)) score += 6;
        else if (x.includes(term)) score += 3;
        else if (b.includes(term)) score += 1;
        else { ok = false; break; }
      }
      if (ok) hits.push({ entry, score });
    }
    hits.sort((a, b) => b.score - a.score);
    hits = hits.slice(0, 20);
    sel = 0;
    renderHits(terms, q);
  }

  function renderHits(terms) {
    if (!hits.length) {
      resultsEl.setAttribute('role', 'status');
      resultsEl.innerHTML = '<div class="search-empty">Sin resultados. Prueba con otro término, o consulta el <a href="' + ROOT + 'content/glosario.html">glosario</a>.</div>';
      input.removeAttribute('aria-activedescendant');
      return;
    }
    resultsEl.setAttribute('role', 'listbox');
    resultsEl.innerHTML = '';
    hits.forEach((h, i) => {
      const ch = GUIDE.byId[h.entry.c];
      if (!ch) return;
      const a = document.createElement('a');
      a.className = 'search-hit' + (i === sel ? ' sel' : '');
      a.id = 'search-hit-' + i;
      a.setAttribute('role', 'option');
      a.setAttribute('tabindex', '-1');
      a.setAttribute('aria-selected', String(i === sel));
      a.href = urlOf(ch) + (h.entry.h ? '#' + h.entry.h : '');
      a.innerHTML = `
        <span class="hit-title">${highlight(h.entry.t, terms)}</span>
        <span class="hit-crumb">${ch.part.num} · ${ch.title}</span>
        ${h.entry.x ? `<span class="hit-excerpt">${highlight(h.entry.x, terms)}</span>` : ''}`;
      a.addEventListener('mousemove', () => { sel = i; paintSel(); });
      resultsEl.appendChild(a);
    });
    paintSel();
  }

  function paintSel() {
    resultsEl.querySelectorAll('.search-hit').forEach((el, i) => {
      el.classList.toggle('sel', i === sel);
      el.setAttribute('aria-selected', String(i === sel));
      if (i === sel) el.scrollIntoView({ block: 'nearest' });
    });
    input.setAttribute('aria-activedescendant', hits.length ? 'search-hit-' + sel : '');
  }

  function openSearch() {
    searchOpener = document.activeElement;
    if (openPanel) togglePanel(openPanel, false);
    /* fondo inerte: el diálogo es realmente modal para teclado y AT */
    app.inert = true;
    toTop.inert = true;
    overlay.classList.add('open');
    input.setAttribute('aria-expanded', 'true');
    input.value = '';
    runSearch('');
    setTimeout(() => input.focus(), 30);
  }
  function closeSearch() {
    if (!overlay.classList.contains('open')) return;
    overlay.classList.remove('open');
    app.inert = false;
    toTop.inert = false;
    syncSidebarA11y(); /* restaura el inert del cajón móvil si estaba cerrado */
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    if (searchOpener && document.body.contains(searchOpener)) searchOpener.focus();
    searchOpener = null;
  }

  input.addEventListener('input', () => runSearch(input.value));
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, hits.length - 1); paintSel(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); paintSel(); }
    else if (e.key === 'Enter') {
      const el = resultsEl.querySelectorAll('.search-hit')[sel];
      if (el) window.location.href = el.href;
    }
  });
  overlay.addEventListener('click', e => { if (e.target === overlay) closeSearch(); });

  /* ============================================================
     10. Tema, menú móvil, acciones
     ============================================================ */

  const savedTheme = store.get('theme', 'dark');
  if (savedTheme === 'light') document.documentElement.setAttribute('data-theme', 'light');

  function toggleTheme() {
    const light = document.documentElement.getAttribute('data-theme') === 'light';
    if (light) document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', 'light');
    store.set('theme', light ? 'dark' : 'light');
  }

  /* En modo cajón (móvil), la sidebar cerrada queda inert para no dejar
     decenas de paradas de tabulación invisibles */
  const drawerMq = window.matchMedia('(max-width: 900px)');
  const menuToggleBtn = topbar.querySelector('.menu-toggle');

  function syncSidebarA11y() {
    const open = sidebar.classList.contains('open');
    sidebar.inert = drawerMq.matches && !open;
    /* con el cajón abierto, el contenido de detrás del scrim queda inerte */
    main.inert = drawerMq.matches && open;
    if (menuToggleBtn) {
      menuToggleBtn.setAttribute('aria-expanded', String(open));
      menuToggleBtn.setAttribute('aria-label', open ? 'Cerrar índice' : 'Abrir índice');
    }
  }

  function toggleMenu(force) {
    const willOpen = force !== undefined ? force : !sidebar.classList.contains('open');
    sidebar.classList.toggle('open', willOpen);
    scrim.classList.toggle('show', willOpen);
    syncSidebarA11y();
    if (drawerMq.matches) {
      if (willOpen) {
        const first = sidebar.querySelector('a, button');
        setTimeout(() => first && first.focus(), 60);
      } else if (menuToggleBtn && document.activeElement && sidebar.contains(document.activeElement)) {
        menuToggleBtn.focus();
      }
    }
  }
  scrim.addEventListener('click', () => toggleMenu(false));
  drawerMq.addEventListener('change', syncSidebarA11y);
  syncSidebarA11y();

  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    if (action === 'search') openSearch();
    else if (action === 'theme') toggleTheme();
    else if (action === 'menu') toggleMenu();
    else if (action === 'notes') togglePanel('notes');
    else if (action === 'bookmarks') togglePanel('bookmarks');
    else if (action === 'shortcuts') togglePanel('shortcuts');
  });

  /* ============================================================
     11. Atajos de teclado
     ============================================================ */

  document.addEventListener('keydown', e => {
    const inField = /input|textarea|select/i.test((e.target.tagName || '')) || e.target.isContentEditable;

    /* Modificador nativo de cada plataforma (⌘K en Mac, Ctrl+K en el resto)
       para no pisar atajos de edición como Ctrl-K en macOS */
    if ((isMac ? e.metaKey && !e.ctrlKey : e.ctrlKey && !e.metaKey) && !e.altKey && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      overlay.classList.contains('open') ? closeSearch() : openSearch();
      return;
    }
    if (e.key === 'Escape') {
      closeSearch();
      if (openPanel) togglePanel(openPanel, false);
      toggleMenu(false);
      return;
    }
    if (inField || e.metaKey || e.ctrlKey || e.altKey) return;

    if (e.key === '/') { e.preventDefault(); openSearch(); }
    else if (e.key === 'ArrowLeft' && chapter && GUIDE.flat[chIndex - 1]) window.location.href = urlOf(GUIDE.flat[chIndex - 1]);
    else if (e.key === 'ArrowRight' && chapter && GUIDE.flat[chIndex + 1]) window.location.href = urlOf(GUIDE.flat[chIndex + 1]);
    else if (e.key === 't') window.scrollTo({ top: 0, behavior: scrollBehavior() });
    else if (e.key === 'n' && chapter) togglePanel('notes');
    else if (e.key === 'b') togglePanel('bookmarks');
    else if (e.key === '?') togglePanel('shortcuts');
  });

  /* ============================================================
     12. Analítica anónima (PostHog EU)
     ------------------------------------------------------------
     Sin cookies ni almacenamiento (persistence: memory) y sin
     autocapture: solo páginas vistas y salida. Se carga únicamente
     cuando el sitio se sirve por HTTP(S) — nunca en file://.
     ============================================================ */

  if (location.protocol === 'https:' || location.protocol === 'http:') {
    const ph = document.createElement('script');
    ph.src = 'https://eu-assets.i.posthog.com/static/array.js';
    ph.async = true;
    ph.onload = () => {
      if (!window.posthog || !window.posthog.init) return;
      window.posthog.init('phc_tqw4oVs8HxEhexbt5vyGiZatctpcv2LbsEvGZkCXtApS', {
        api_host: 'https://eu.i.posthog.com',
        ui_host: 'https://eu.posthog.com',
        persistence: 'memory',
        autocapture: false,
        capture_pageview: true,
        capture_pageleave: true,
      });
    };
    document.head.appendChild(ph);
  }

  /* ============================================================
     13. Home: roadmap + progreso global
     ============================================================ */

  const roadmapEl = document.getElementById('roadmap');
  if (roadmapEl) {
    GUIDE.parts.forEach(part => {
      const done = part.chapters.filter(ch => doneMap[ch.id]).length;
      const el = document.createElement('div');
      el.className = 'roadmap-part';
      el.style.setProperty('--rp', part.color);
      el.innerHTML = `
        <div class="roadmap-marker"><div class="roadmap-num">${part.num}</div><div class="roadmap-line"></div></div>
        <div class="roadmap-body">
          <h3>${part.title}</h3>
          <p class="roadmap-desc">${part.chapters.length} ${part.chapters.length === 1 ? 'capítulo' : 'capítulos'}${done ? ` · ${done} completado${done > 1 ? 's' : ''}` : ''}</p>
          <div class="roadmap-chapters"></div>
        </div>`;
      const list = el.querySelector('.roadmap-chapters');
      part.chapters.forEach(ch => {
        const a = document.createElement('a');
        a.className = 'roadmap-ch';
        a.href = urlOf(ch);
        a.innerHTML = `
          <span><span class="rc-title">${ch.title}</span><span class="rc-sub">${ch.subtitle}</span></span>
          <span class="rc-meta">${doneMap[ch.id] ? '<span class="rc-done">✓</span>' : ''}<span class="rc-min">${ch.minutes} min</span></span>`;
        list.appendChild(a);
      });
      roadmapEl.appendChild(el);
    });

    /* Resumen de progreso + continuar leyendo */
    const total = GUIDE.flat.length;
    const doneCount = GUIDE.flat.filter(ch => doneMap[ch.id]).length;
    const summary = document.getElementById('progress-summary');
    if (summary) {
      summary.innerHTML = `
        <span class="ps-label">${doneCount} / ${total} capítulos</span>
        <span class="ps-bar"><i style="width:${(doneCount / total) * 100}%"></i></span>
        <span class="ps-label">${Math.round((doneCount / total) * 100)}%</span>`;
    }
    const cont = document.getElementById('continue-reading');
    if (cont) {
      const lastId = store.get('last', null);
      const last = lastId && GUIDE.byId[lastId];
      if (last) {
        cont.href = urlOf(last);
        cont.querySelector('span').textContent = last.title;
      } else {
        cont.href = urlOf(GUIDE.flat[0]);
        cont.querySelector('span').textContent = GUIDE.flat[0].title;
      }
    }
  }
})();
