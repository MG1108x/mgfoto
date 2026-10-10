/* Build gallery index. On GitHub Actions, also prepare and stage web copies.
   The existing workflow commits these together with images-manifest.json.
   Locally this script only writes the manifest; it does not stage files. */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');
const {execFileSync} = require('child_process');
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
manifest.__meta={sourceHash:revision.digest('hex'),webVersion:1};
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
