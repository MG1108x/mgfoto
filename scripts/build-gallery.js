/* Generate the one-page gallery. No gallery data or album router is loaded by visitors. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const imageExtension = /\.(jpe?g|png|webp|avif)$/i;
const excluded = /^(og-image|favicon|apple-touch-icon|icon-\d+|logo)/i;
const naturalSort = (a,b) => a.localeCompare(b,'en',{numeric:true,sensitivity:'base'});
function scan(directory){
  return fs.readdirSync(directory,{withFileTypes:true}).filter(e=>!e.name.startsWith('.')).flatMap(entry=>{
    const source=path.posix.join(directory,entry.name);
    if(entry.isDirectory()) return scan(source);
    return entry.isFile() && imageExtension.test(entry.name) && !excluded.test(entry.name) ? [source] : [];
  }).sort(naturalSort);
}
const sources=scan('images');
const available=new Set(sources);
const selection=JSON.parse(fs.readFileSync('gallery.json','utf8'));
if(!Array.isArray(selection)) throw new Error('gallery.json must contain a list of photographs');
const metadata=JSON.parse(fs.readFileSync('photo-metadata.json','utf8'));
const seen=new Set();
const ordered=[];
for(const photo of selection){
  if(typeof photo.src!=='string' || typeof photo.alt!=='string' || !photo.alt.trim()) throw new Error('Every selected photo needs src and alt');
  if(seen.has(photo.src)) throw new Error('Duplicate photograph: '+photo.src);
  seen.add(photo.src);
  if(available.has(photo.src)) ordered.push(photo);
}
// Uploads appear automatically; gallery.json sets the order and descriptions of existing images.
for(const src of sources) if(!seen.has(src)) ordered.push({src,alt:'Fotografie von Marvin Grammel'});
const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const photos=ordered.map((photo,index)=>{
  const v=metadata[photo.src];
  if(!v || !fs.existsSync(v.small) || !fs.existsSync(v.large) || !(v.width>0 && v.height>0)) throw new Error('Web copies missing: '+photo.src+'. Run scripts/optimize-images.py first.');
  const dimension=Math.max(v.width,v.height);
  const smallWidth=Math.round(v.width*Math.min(1,640/dimension));
  const largeWidth=Math.round(v.width*Math.min(1,1600/dimension));
  const srcset=largeWidth>smallWidth ? ` srcset="${escapeHtml(v.small)} ${smallWidth}w, ${escapeHtml(v.large)} ${largeWidth}w"` : '';
  return `        <a class="photo" href="${escapeHtml(v.large)}" aria-label="Bild vergrößern: ${escapeHtml(photo.alt)}"><img src="${escapeHtml(v.large)}" alt="${escapeHtml(photo.alt)}" width="${v.width}" height="${v.height}"${srcset} sizes="(max-width: 600px) 90vw, (max-width: 1000px) 44vw, 22vw" loading="${index<4?'eager':'lazy'}" decoding="async"></a>`;
});
let html=fs.readFileSync('index.html','utf8');
const marker=/<!-- photos:start -->[\s\S]*?<!-- photos:end -->/;
if(!marker.test(html)) throw new Error('Missing gallery markers in index.html');
html=html.replace(marker,'<!-- photos:start -->\n'+photos.join('\n')+'\n      <!-- photos:end -->');
for(const resource of ['assets/css/site.css','assets/js/site.js']){
  const hash=crypto.createHash('sha256').update(fs.readFileSync(resource)).digest('hex').slice(0,12);
  const escaped=resource.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  html=html.replace(new RegExp('((?:href|src)=")'+escaped+'(?:\\?v=[^" ]*)?"','g'),'$1'+resource+'?v='+hash+'"');
}
fs.writeFileSync('index.html',html);
console.log(`${photos.length} photographs in the one-page gallery.`);
