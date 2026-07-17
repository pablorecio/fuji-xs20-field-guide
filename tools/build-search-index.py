#!/usr/bin/env python3
"""Genera assets/js/search-index.js a partir de content/*.html.

Uso:  python3 tools/build-search-index.py

Extrae una entrada por sección (h2/h3) de cada capítulo:
  { c: chapter-id, h: heading-id, t: título, x: extracto, k: keywords }
Las keywords se toman de <code>, <strong> y .term dentro de la sección.
El sitio sigue siendo 100% estático: este script solo se ejecuta al editar contenido.
"""

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
OUT = ROOT / "assets" / "js" / "search-index.js"

EXCERPT_LEN = 150
MAX_KEYWORDS = 12


class SectionParser(HTMLParser):
    """Recorre el HTML y agrupa el texto por secciones h2/h3."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.chapter = ""
        self.title = ""
        self.sections = []          # dicts: id, title, text, keywords
        self._current = None
        self._stack = []            # etiquetas abiertas
        self._in_heading = None     # (tag, id) si estamos dentro de h2/h3
        self._heading_text = []
        self._kw_depth = 0          # dentro de code/strong/.term
        self._in_title_tag = False
        self._skip_depth = 0        # dentro de <script>/<style>/<svg>

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "body":
            self.chapter = a.get("data-chapter", "")
        if tag == "title":
            self._in_title_tag = True
        if tag in ("script", "style", "svg") or self._skip_depth:
            self._skip_depth += 1
            return
        if tag in ("h2", "h3"):
            self._in_heading = (tag, a.get("id", ""))
            self._heading_text = []
            return
        if self._current is not None:
            cls = a.get("class", "")
            if tag in ("code", "strong") or "term" in cls.split():
                self._kw_depth += 1
                self._current.setdefault("_kwbuf", []).append("")

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title_tag = False
        if self._skip_depth:
            self._skip_depth -= 1
            return
        if self._in_heading and tag == self._in_heading[0]:
            text = re.sub(r"\s+", " ", "".join(self._heading_text)).strip(" #")
            self._current = {
                "id": self._in_heading[1], "title": text, "text": [], "keywords": [],
            }
            self.sections.append(self._current)
            self._in_heading = None
            return
        if self._kw_depth and tag in ("code", "strong", "span"):
            self._kw_depth -= 1
            if self._current and self._current.get("_kwbuf"):
                kw = self._current["_kwbuf"].pop().strip()
                if 2 <= len(kw) <= 40:
                    self._current["keywords"].append(kw)

    def handle_data(self, data):
        if self._in_title_tag:
            self.title += data
            return
        if self._skip_depth:
            return
        if self._in_heading:
            self._heading_text.append(data)
            return
        if self._current is not None:
            self._current["text"].append(data)
            if self._kw_depth and self._current.get("_kwbuf"):
                self._current["_kwbuf"][-1] += data


def build_entries(path: Path):
    parser = SectionParser()
    parser.feed(path.read_text(encoding="utf-8"))
    entries = []
    page_title = parser.title.split("—")[0].strip()
    if page_title:
        entries.append({"c": parser.chapter, "h": "", "t": page_title, "x": "", "k": ""})
    for s in parser.sections:
        text = re.sub(r"\s+", " ", "".join(s["text"])).strip()
        seen, kws = set(), []
        for kw in s["keywords"]:
            key = kw.lower()
            if key not in seen:
                seen.add(key)
                kws.append(kw)
        entries.append({
            "c": parser.chapter,
            "h": s["id"],
            "t": s["title"],
            "x": text[:EXCERPT_LEN].rsplit(" ", 1)[0] + ("…" if len(text) > EXCERPT_LEN else ""),
            "k": " ".join(kws[:MAX_KEYWORDS]),
        })
    return entries


def main():
    files = sorted(CONTENT.glob("*.html"))
    if not files:
        sys.exit("No hay archivos en content/")
    index = []
    for f in files:
        entries = build_entries(f)
        if not entries or not entries[0]["c"]:
            print(f"  ! {f.name}: sin data-chapter, omitido")
            continue
        index.extend(entries)
        print(f"  ✓ {f.name}: {len(entries)} entradas")
    payload = json.dumps(index, ensure_ascii=False, separators=(",", ":"))
    OUT.write_text(
        "/* Índice de búsqueda — generado por tools/build-search-index.py\n"
        "   No editar a mano: se regenera a partir del contenido de /content. */\n"
        f"window.SEARCH_INDEX = {payload};\n",
        encoding="utf-8",
    )
    print(f"\n{len(index)} entradas → {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
