#!/usr/bin/env python3
"""Comprueba la integridad interna del manual.

Uso:  python3 tools/check-links.py

Verifica:
  - que todo href interno (misma carpeta, index.html, #ancla) resuelve a un
    archivo existente y, si lleva fragmento, a un id presente en el destino
    (o generable por app.js a partir de un h2/h3 sin id);
  - que no hay <img> con rutas locales inexistentes;
  - que cada archivo de content/ tiene data-chapter presente en el manifest.
"""

import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"


class Collector(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = set()
        self.links = []      # (href, line)
        self.imgs = []
        self.chapter = None
        self.headings_no_id = 0
        self._h = None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            self.ids.add(a["id"])
        if tag == "body":
            self.chapter = a.get("data-chapter")
        if tag == "a" and a.get("href"):
            self.links.append((a["href"], self.getpos()[0]))
        if tag == "img" and a.get("src"):
            self.imgs.append((a["src"], self.getpos()[0]))
        if tag in ("h2", "h3") and "id" not in a:
            self.headings_no_id += 1


def manifest_ids():
    js = (ROOT / "assets/js/manifest.js").read_text(encoding="utf-8")
    return set(re.findall(r"id:\s*'([^']+)'", js))


def main():
    files = {p.name: Collector() for p in sorted(CONTENT.glob("*.html"))}
    files["index.html"] = Collector()
    for name, col in files.items():
        path = (ROOT / name) if name == "index.html" else (CONTENT / name)
        col.feed(path.read_text(encoding="utf-8"))

    valid_chapters = manifest_ids()
    problems = 0

    for name, col in files.items():
        base = ROOT if name == "index.html" else CONTENT
        if name != "index.html":
            if col.chapter not in valid_chapters:
                print(f"✗ {name}: data-chapter «{col.chapter}» no está en el manifest")
                problems += 1
            if col.headings_no_id:
                print(f"~ {name}: {col.headings_no_id} h2/h3 sin id explícito")

        for href, line in col.links:
            if re.match(r"^[a-z]+:", href):        # http:, mailto:, data:
                continue
            target, _, frag = href.partition("#")
            if not target:                          # ancla local
                if frag and frag not in col.ids:
                    print(f"✗ {name}:{line}: ancla local rota #{frag}")
                    problems += 1
                continue
            tpath = (base / target).resolve()
            tname = tpath.name
            if not tpath.exists():
                print(f"✗ {name}:{line}: destino inexistente {href}")
                problems += 1
                continue
            if frag and tname in files and frag not in files[tname].ids:
                print(f"✗ {name}:{line}: {target}#{frag} — id no encontrado en destino")
                problems += 1

        for src, line in col.imgs:
            if re.match(r"^[a-z]+:", src):
                continue
            if not (base / src).resolve().exists():
                print(f"✗ {name}:{line}: <img> roto {src}")
                problems += 1

    missing = valid_chapters - {c.chapter for c in files.values() if c.chapter}
    for m in sorted(missing):
        print(f"✗ manifest: falta el archivo del capítulo «{m}»")
        problems += 1

    print(f"\n{'✗ ' + str(problems) + ' problemas' if problems else '✓ Sin problemas'} en {len(files)} archivos")
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
