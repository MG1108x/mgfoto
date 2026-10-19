# MG FOTO

Fotografie von Marvin Grammel aus Karlsruhe. https://mgfoto.media/

Eine Seite: kurze Vorstellung, alle Bilder und Kontakt. Keine Alben, kein Tracking, keine externen Schriften. GitHub Pages veröffentlicht `main`.

## Fotos hinzufügen oder entfernen

JPEGs unter `images/` hochladen, gerne weiterhin in Unterordnern pro Veranstaltung. Diese Ordner dienen nur der Ablage und erscheinen nicht als Alben auf der Homepage.

Die Action **Bildergalerie aktualisieren** erzeugt automatisch kleine WebP-Dateien und aktualisiert die Galerie im HTML. Neue Bilder erscheinen am Ende. Gelöschte Fotos verschwinden auch aus der Galerie und den Web-Kopien. Im Actions-Tab kann die Aktualisierung bei Bedarf manuell gestartet werden.

`gallery.json` enthält die gewünschte Bildreihenfolge und individuelle Bildbeschreibungen:

```json
{"src": "images/mein-event/foto.jpg", "alt": "Menschen vor der beleuchteten Bühne"}
```

Die Liste enthält zunächst die 49 ausgewählten Fotos in der freigegebenen Reihenfolge. Zum Umsortieren die Einträge verschieben. Neue Fotos ohne Listeneintrag werden automatisch ergänzt; für eine passende Bildbeschreibung einen Eintrag hinzufügen. Zum vollständigen Entfernen die Quelldatei unter `images/` löschen; der zugehörige Listeneintrag kann ebenfalls gelöscht werden.

Lightroom-Export: JPEG, sRGB, Qualität etwa 85 %, lange Kante 2400 Pixel, Ausgabeschärfung Bildschirm/Standard. Möglichst keine Standortdaten. RAWs und Druckdateien außerhalb des Repos aufbewahren.

## Dateien

- `index.html`: kurze Vorstellung, statische Bildergalerie und Kontaktformular.
- `gallery.json`: Reihenfolge und Bildbeschreibungen.
- `assets/js/site.js`: Großansicht mit Tastatur/Touch und Kontaktformular.
- `assets/css/site.css`: Homepage; `legal.css`: rechtliche Seiten und 404.
- `assets/brand/mg-foto-logo.png`: Logo, im HTML fest begrenzt.
- `images/`: Quelldateien; `assets/photos/`: generierte WebP-Kopien in zwei Größen.
- `photo-metadata.json`: generierte Bildgrößen und Dateipfade, nur für die Erstellung der Seite.
- `scripts/optimize-images.py` und `scripts/build-gallery.js`: Optimierung und statisches HTML.

Die Galerie funktioniert ohne JavaScript. JavaScript ergänzt die Großansicht und den Formularversand ohne Seitenwechsel. Bilder behalten ihre ursprünglichen Seitenverhältnisse; weitere Bilder werden beim Scrollen geladen. Dateiversionen an CSS und JavaScript verhindern veraltete Browser-Caches nach Änderungen.

## Lokal aktualisieren

Node.js, Python 3 und Pillow 11.3.0 werden benötigt:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install Pillow==11.3.0
.venv/bin/python scripts/optimize-images.py
node scripts/build-gallery.js
```

Die geänderten Dateien einschließlich `index.html`, `photo-metadata.json` und `assets/photos/` committen. Auf GitHub übernimmt die Action diese Schritte automatisch.

Das Kontaktformular nutzt Web3Forms. Der Access Key im HTML ist ein öffentlicher Formularschlüssel. Bei Versandfehlern bleiben Eingaben erhalten und die E-Mail-Adresse erscheint als Alternative. Tests des Versands sollten simuliert werden, damit keine Testanfragen versendet werden. Impressum, Datenschutz und Kontaktangaben bei Änderungen aktuell halten.
