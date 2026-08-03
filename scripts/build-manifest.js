/*
  Erzeugt images-manifest.json — ein Verzeichnis aller Fotos je Ordner.
  Läuft automatisch per GitHub Action bei jedem Upload in /images.
  Muss nicht von Hand gestartet werden.
*/
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = 'images';
const OUT = 'images-manifest.json';
const EXT = /\.(jpe?g|png|webp|avif)$/i;
// Dateien, die keine Galeriefotos sind:
const IGNORE = /^(og-image|favicon|apple-touch-icon|icon-\d+|logo)/i;

function naturalSort(a, b){
  return a.localeCompare(b, undefined, { numeric:true, sensitivity:'base' });
}

function listImages(dir){
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes:true }); }
  catch(e){ return []; }
  return entries
    .filter(e => e.isFile() && EXT.test(e.name) && !IGNORE.test(e.name))
    .map(e => e.name)
    .sort(naturalSort);
}

const manifest = {};

// Wurzelordner (Album mit slug "")
manifest[''] = listImages(IMAGES_DIR);

// Jeder Unterordner = ein Album (slug = Ordnername)
for (const e of fs.readdirSync(IMAGES_DIR, { withFileTypes:true })){
  if (e.isDirectory()){
    manifest[e.name] = listImages(path.join(IMAGES_DIR, e.name));
  }
}

fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2) + '\n');
console.log('images-manifest.json geschrieben:');
for (const k of Object.keys(manifest)){
  console.log('  ' + (k || '(Wurzel)') + ': ' + manifest[k].length + ' Bilder');
}
