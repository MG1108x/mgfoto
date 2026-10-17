/* Build gallery index. On GitHub Actions, also prepare and stage web copies.
   The existing workflow commits these together with images-manifest.json.
   Locally this script writes the manifest and static album cards without staging. */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');
const {execFileSync} = require('child_process');
const vm = require('vm');
const IMAGES_DIR = 'images';
const EXT = /\.(jpe?g|png|webp|avif)$/i;
const IGNORE = /^(og-image|favicon|apple-touch-icon|icon-\d+|logo)/i;
const naturalSort = (a,b) => a.localeCompare(b,'en',{numeric:true,sensitivity:'base'});
function listImages(dir){
  return fs.readdirSync(dir,{withFileTypes:true}).filter(entry=>entry.isFile() && EXT.test(entry.name) && !IGNORE.test(entry.name)).map(entry=>entry.name).sort(naturalSort);
}
const manifest = {'':listImages(IMAGES_DIR)};
for(const entry of fs.readdirSync(IMAGES_DIR,{withFileTypes:true}).sort((a,b)=>naturalSort(a.name,b.name))){
  if(entry.isDirectory() && !entry.name.startsWith('.')) manifest[entry.name]=listImages(path.join(IMAGES_DIR,entry.name));
}
// This revision makes a same-name replacement trigger the existing commit step.
const revision = crypto.createHash('sha256');
for(const [slug,files] of Object.entries(manifest)) for(const name of files){
  const filename=path.join(IMAGES_DIR,slug,name);revision.update(filename+'\0');revision.update(fs.readFileSync(filename));
}
manifest.__meta={sourceHash:revision.digest('hex'),webVersion:2};
fs.writeFileSync('images-manifest.json',JSON.stringify(manifest,null,2)+'\n');
for(const [slug,files] of Object.entries(manifest)) if(Array.isArray(files)) console.log((slug || '(root)')+': '+files.length+' photos');
if(process.env.GITHUB_ACTIONS==='true'){
  const venv=fs.mkdtempSync(path.join(os.tmpdir(),'mgfoto-images-'));
  try{
    execFileSync('python3',['-m','venv',venv],{stdio:'inherit'});
    const python=path.join(venv,'bin','python');
    execFileSync(python,['-m','pip','install','--disable-pip-version-check','Pillow==11.3.0'],{stdio:'inherit'});
    execFileSync(python,['scripts/optimize-images.py'],{stdio:'inherit'});
    execFileSync('git',['add','assets/photos','assets/js/image-variants.js'],{stdio:'inherit'});
  }finally{fs.rmSync(venv,{recursive:true,force:true});}
}

// Keep the initial HTML in sync with the album configuration, including new albums.
const context={window:{}};
vm.runInNewContext(fs.readFileSync('albums.js','utf8'),context,{timeout:1000});
const albums=context.window.MG_ALBUMS;
if(!Array.isArray(albums)) throw new Error('albums.js must define window.MG_ALBUMS');
const variantContext={window:{}};
vm.runInNewContext(fs.readFileSync('assets/js/image-variants.js','utf8'),variantContext,{timeout:1000});
const variants=variantContext.window.MG_IMAGE_VARIANTS || {};
const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const slugs=new Set();
const cards=[];
for(const album of albums){
  if(!album.slug || slugs.has(album.slug)) throw new Error('Every album needs a unique folder slug');
  slugs.add(album.slug);
  const files=manifest[album.slug];
  if(!Array.isArray(files) || !files.length) throw new Error('No images found for '+album.slug);
  if(album.cover && !files.includes(album.cover)) throw new Error('Missing cover for '+album.slug+': '+album.cover);
  const name=album.cover || files[0];
  const original=['images',album.slug,name].join('/');
  const variant=variants[original];
  const src=variant?.large && fs.existsSync(variant.large) ? variant.large : original;
  let responsive='';
  if(variant && fs.existsSync(variant.small) && fs.existsSync(variant.large)){
    const dimension=Math.max(variant.width,variant.height);
    const smallWidth=Math.round(variant.width*Math.min(1,640/dimension));
    const largeWidth=Math.round(variant.width*Math.min(1,1600/dimension));
    responsive=` width="${variant.width}" height="${variant.height}"`;
    if(largeWidth>smallWidth) responsive+=` srcset="${escapeHtml(variant.small)} ${smallWidth}w, ${escapeHtml(variant.large)} ${largeWidth}w" sizes="(max-width: 600px) 92vw, 46vw"`;
  }
  const loading=cards.length<2 ? 'eager' : 'lazy';
  cards.push(`        <a class="album-card" data-slug="${escapeHtml(album.slug)}" href="#album=${encodeURIComponent(album.slug)}"><div class="album-cover"><img src="${escapeHtml(src)}"${responsive} loading="${loading}" decoding="async" alt="${escapeHtml(album.title)}"></div><div class="album-info"><div><h3>${escapeHtml(album.title)}</h3><p>${escapeHtml([album.ort,album.datum].filter(Boolean).join(' · '))} <small>${files.length} Fotos</small></p></div><span class="album-arrow" aria-hidden="true">↗</span></div></a>`);
}
const html=fs.readFileSync('index.html','utf8');
const marker=/<!-- album-cards:start -->[\s\S]*?<!-- album-cards:end -->/;
if(!marker.test(html)) throw new Error('Missing static album markers in index.html');
let output=html.replace(marker,'<!-- album-cards:start -->\n'+cards.join('\n')+'\n        <!-- album-cards:end -->');
// Fresh HTML must not pick up styles or album data from an older browser cache.
for(const asset of ['assets/css/site.css','albums.js','assets/js/image-variants.js','assets/js/site.js']){
  const hash=crypto.createHash('sha256').update(fs.readFileSync(asset)).digest('hex').slice(0,12);
  const escaped=asset.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  output=output.replace(new RegExp('((?:href|src)=")'+escaped+'(?:\\?v=[^" ]*)?"','g'),'$1'+asset+'?v='+hash+'"');
}
fs.writeFileSync('index.html',output);
if(process.env.GITHUB_ACTIONS==='true') execFileSync('git',['add','index.html'],{stdio:'inherit'});
