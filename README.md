# MG FOTO MEDIA

Portfolio von Marvin Grammel · Event-, Festival- und Clubfotografie aus Karlsruhe.

## Aufbau

- `index.html`: Inhalte, Suchmaschinen-Metadaten, Highlights und statische Albumübersicht.
- `assets/css/site.css`: responsives Layout; `legal.css`: Impressum, Datenschutz und 404.
- `assets/js/site.js`: Galerie, Albumlinks, Bildansicht, mobiles Menü und Kontaktformular.
- `albums.js`: Titel, Reihenfolge, Kategorien und Titelbilder der Alben.
- `images/`: Originalfotos. Diese werden durch die Optimierung nicht verändert.
- `images-manifest.json`: automatisch gepflegte Bilderliste; `__meta` erkennt auch ersetzte Dateien mit unverändertem Namen.
- `assets/photos/` und `assets/js/image-variants.js`: optimierte Web-Kopien und Zuordnung.
- GitHub Pages veröffentlicht den Stand von `main` unter https://mgfoto.media/.

## Neues Album

1. Bilder in `images/<ordnername>/` hochladen.
2. In `albums.js` ein Album ergänzen. `slug` muss dem Ordnernamen entsprechen.
3. Optional `cover` (exakter Dateiname) und `category` ergänzen: `events` oder `personal`.
4. Die vorhandene GitHub Action aktualisiert `images-manifest.json` und erzeugt optimierte Web-Kopien automatisch. Während der Verarbeitung werden neue Fotos als Original geladen.

```js
{
  slug: "mein-event",
  title: "Mein Event",
  ort: "Karlsruhe",
  datum: "2026",
  category: "events",
  cover: "cover.jpg"
}
```

Albumlinks sind teilbar, beispielsweise `https://mgfoto.media/#album=kvod-3`.
Das Album für Bilder direkt unter `images/` hat den Link `#album=personal`.

## Bilder für das Web optimieren

Python 3 und Pillow sind erforderlich. Im Repository-Verzeichnis:

```sh
python -m pip install Pillow
node scripts/build-manifest.js
python scripts/optimize-images.py
```

Lokal danach `images-manifest.json`, `assets/photos/` und `assets/js/image-variants.js` committen. Auf GitHub übernimmt das die bestehende Galerie-Action.
Es entstehen WebP-Kopien mit maximal 640 und 1600 Pixeln an der längsten Seite.
Die Originale bleiben erhalten; Metadaten werden nicht in Web-Kopien übernommen.
Bei geänderten Dateinamen oder entfernten Bildern dürfen nicht mehr verwendete Web-Kopien gelöscht werden.

## Highlights und Einstieg

Die vier Highlights und das Hero-Foto werden in `index.html` ausgewählt. Bei einem Wechsel Bildpfad, optimierte Varianten, Alternativtext und Beschriftung gemeinsam anpassen.
Individuelle Bildbeschreibungen für die dynamische Galerie stehen in `assets/js/site.js` unter `descriptions`.

## Kontakt

Das Formular nutzt die bestehende Web3Forms-Anbindung. Der dort öffentlich eingebundene Access Key ist ein Formularschlüssel, kein GitHub-Zugang.
Direkte Kontaktadresse: `hello@mgfoto.media`, entsprechend dem bestehenden Impressum.
Bei Versandfehlern bleiben die Eingaben erhalten und die E-Mail-Adresse wird als Alternative angeboten.
Es gibt kein Tracking, keine extern geladenen Schriften und keine Instagram-Einbettung.

## Pflege

- Rechtliche Angaben und Kontaktadresse bei Änderungen aktualisieren.
- Neue optionale Formularfelder auch in der Datenschutzerklärung beschreiben.
- Das Datum in `sitemap.xml` bei größeren Inhaltsänderungen aktualisieren.
- Die abgeschaltete EU-OS-Plattform wird nicht mehr verlinkt (Quelle: https://consumer-redress.ec.europa.eu/site-relocation_en).

## Prüfung der Überarbeitung

JavaScript-Syntax, lokale Links, Bilder, Manifest, Albumdaten und strukturierte Daten wurden geprüft.
DOM-Funktionstests simulieren Menü, Filter, Albumnavigation, Bildansicht und Formularantworten ohne echte Anfrage zu versenden.
Eine visuelle Browserprüfung war in der Ausführungsumgebung nicht verfügbar.
