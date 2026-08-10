/* ══════════════════════════════════════════════════════════════════
   ALBEN / EVENTS DER GALERIE

   Jedes Album ist ein Block zwischen { }.  Reihenfolge = Anzeigereihenfolge
   auf der Startseite (oberstes zuerst).

   NEUES EVENT ANLEGEN (2 Schritte):
     1. Fotos in einen neuen Ordner unter images/ legen, z. B.
        images/komm-vorbei-or-die-3/
        Die Dateinamen sind egal — beliebige Namen, beliebige Anzahl.
        (Ein Helfer im Hintergrund erkennt die Bilder automatisch.)
     2. Hier einen neuen Block ergänzen:

          {
            slug:  "komm-vorbei-or-die-3",   // = exakter Ordnername unter images/
            title: "Komm Vorbei Or Die 3",   // Beschriftung auf der Kachel
            ort:   "Ubstadt-Weiher",         // optional, darf leer sein ""
            datum: "August 2026"             // optional, darf leer sein ""
          },

   FOTOS ZU EINEM EVENT HINZUFÜGEN ODER LÖSCHEN:
     Einfach im jeweiligen Ordner hochladen/entfernen. Hier nichts ändern.

   TITELBILD (optional):
     Standardmäßig ist das erste Bild das Titelbild. Willst du ein
     bestimmtes, ergänze  cover: "dateiname.jpg"  mit dem exakten Namen.

   Hinweis: slug: "" (leer) = Bilder liegen direkt in images/ (ohne Unterordner).
   ══════════════════════════════════════════════════════════════════ */

window.MG_ALBUMS = [
  {
    slug:  "kvod-3",
    title: "Komm Vorbei Or Die 3",
    ort:   "Ubstadt-Weiher",
    datum: "2026"
  },
  {
    slug:  "unifest-2026",
    title: "KIT Unifest 2026",
    ort:   "Karlsruhe",
    datum: "2026"
  },
  {
    slug:  "house-am-see-2026",
    title: "House Am See 2026",
    ort:   "Heidesee Forst",
    datum: "2026"
  },
  {
    slug:  "",
    title: "Natur & Unterwegs",
    ort:   "",
    datum: ""
  }
];
