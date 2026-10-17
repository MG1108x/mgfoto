# MG FOTO

Fotografie von Marvin Grammel aus Karlsruhe. Schwerpunkt Events, Konzerte und Festivals; offen für Shootings, Hochzeiten und andere Projekte.

Die Seite besteht aus einer kurzen Einführung, den Alben und einem Kontaktformular. GitHub Pages veröffentlicht `main` unter https://mgfoto.media/.

## Neues Album

1. JPEGs in `images/<ordnername>/` hochladen.
2. Einen Block in `albums.js` ergänzen. `slug` entspricht dem Ordnernamen; `cover` ist der exakte Dateiname des Titelbilds. Reihenfolge der Blöcke = Reihenfolge auf der Homepage.

```js
{
  slug: "mein-event",
  title: "Mein Event",
  ort: "Karlsruhe",
  datum: "2026",
  cover: "mein-event-01.jpg"
},
```

Die Galerie-Action pflegt die Bilderliste, erzeugt WebP-Kopien und aktualisiert die Albumkacheln im HTML. Gelöschte Bilder werden auch aus den Web-Kopien entfernt. Fehlerhafte Albumdaten oder fehlende Titelbilder lassen die Action mit einer Fehlermeldung abbrechen.

Einzelne Fotos hinzufügen oder entfernen: nur den jeweiligen Bilderordner ändern. Die Fotos werden natürlich nach Dateinamen sortiert. Albumlinks sind teilbar, z. B. `https://mgfoto.media/#album=dj-conference-2026`.

## Lightroom-Export

JPEG, sRGB, Qualität etwa 85 %, lange Kante 2400 Pixel, Ausgabeschärfung Bildschirm/Standard. Am besten fortlaufende Dateinamen und keine Standortdaten. RAWs und große Druckdateien bleiben außerhalb des Repos.

Web-Kopien haben maximal 640 bzw. 1600 Pixel an der langen Kante. Die hochgeladenen JPEGs bleiben als Quelle für die Optimierung erhalten. Nicht mehr verwendete Portfoliofotos lassen sich bei Bedarf über die Git-Historie wiederherstellen.

## Dateien und Pflege

- `index.html`: Einführung, Kontakt, Metadaten und automatisch gepflegte Albumkacheln zwischen den Kommentar-Markierungen.
- `albums.js`: Titel, Orte, Reihenfolge und Titelbilder.
- `assets/js/site.js`: Albumansicht, Bildansicht und Formular. Individuelle Bildbeschreibungen stehen unter `descriptions`.
- `assets/css/site.css`: Layout; `legal.css`: Impressum, Datenschutz und 404.
- `images-manifest.json`, `assets/photos/`, `assets/js/image-variants.js`: automatisch erzeugte Galerie-Dateien.
- `scripts/build-manifest.js` und `scripts/optimize-images.py`: Bilderliste, HTML-Kacheln und Optimierung.

Lokal werden Node.js, Python 3 und Pillow 11.3.0 benötigt:

```sh
python -m pip install Pillow==11.3.0
node scripts/build-manifest.js
python scripts/optimize-images.py
node scripts/build-manifest.js
```

Danach die geänderten Galerie-Dateien einschließlich `index.html` committen. Auf GitHub übernimmt das die Action automatisch.

Das Formular nutzt Web3Forms. Der im HTML eingebundene Access Key ist ein öffentlicher Formularschlüssel. Bei Versandfehlern bleiben die Eingaben erhalten; `hello@mgfoto.media` wird als Alternative angezeigt. Formularantworten werden bei Funktionstests simuliert, damit keine Testanfragen versendet werden.

Schriften sind lokal eingebunden. Es gibt kein Tracking und keine Instagram-Einbettung. Rechtliche Angaben und Kontaktadresse bei Änderungen aktuell halten; neue Formularfelder auch in der Datenschutzerklärung berücksichtigen.
