/* MG FOTO MEDIA: static site, no tracking and no third-party scripts. */
'use strict';
document.documentElement.classList.add('js');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const scrollBehavior = () => reducedMotion.matches ? 'auto' : 'smooth';
const albums = window.MG_ALBUMS || [];
const variants = window.MG_IMAGE_VARIANTS || {};
const grid = document.getElementById('albumGrid');
const albumView = document.getElementById('albumView');
const toolbar = document.querySelector('.gallery-toolbar');
const galleryStatus = document.getElementById('galleryStatus');
let manifest = null;
let activeAlbum = null;
let lastAlbumSlug = null;
let galleryPhotos = [];
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.getElementById('main-nav');
function closeMenu(){ navigation.classList.remove('open'); menuButton.setAttribute('aria-expanded','false'); }
menuButton.addEventListener('click',()=>{
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  navigation.classList.toggle('open',open);
  menuButton.setAttribute('aria-expanded',String(open));
});
navigation.addEventListener('click',event=>{ if(event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown',event=>{ if(event.key === 'Escape' && navigation.classList.contains('open')){ closeMenu(); menuButton.focus(); } });
window.matchMedia('(min-width: 761px)').addEventListener('change',closeMenu);
document.getElementById('year').textContent = new Date().getFullYear();

const descriptions = {
  'images/unifest-2026/01.jpg':'Fayan im violetten Bühnenlicht beim KIT Unifest in Karlsruhe',
  'images/unifest-2026/02.jpg':'Bühne mit Fayan und Crowd beim KIT Unifest in Karlsruhe',
  'images/unifest-2026/03.jpg':'Fayan auf der Bühne vor dem Publikum beim KIT Unifest',
  'images/unifest-2026/04.jpg':'Fayan auf der Bühne beim KIT Unifest in Karlsruhe',
  'images/unifest-2026/05.jpg':'Band ok.danke.tschuess auf der Unifest-Bühne in Schwarz-Weiß',
  'images/unifest-2026/06.jpg':'Soulspatzn-Stand auf dem KIT Unifest',
  'images/unifest-2026/07.jpg':'Karlmer auf der Bühne beim KIT Unifest',
  'images/unifest-2026/08.jpg':'Publikum und Hände in der Luft beim KIT Unifest',
  'images/unifest-2026/09.jpg':'Crowd vor der rot und blau beleuchteten Bühne beim KIT Unifest',
  'images/unifest-2026/DSC_3220.jpg':'Hände in der Crowd vor der warm beleuchteten Unifest-Bühne',
  'images/house-am-see-2026/DSC_5563.jpg':'DJ am Mischpult im violetten Licht bei House Am See',
  'images/house-am-see-2026/DSC_5639.jpg':'Crowd vor der grün beleuchteten Open-Air-Bühne bei House Am See',
  'images/house-am-see-2026/DSC_4902.jpg':'DJ in Bewegung mit farbigen Lichtspuren bei House Am See',
  'images/kvod-3/DSC_7288.jpeg':'Crowd im Bühnennebel bei Komm Vorbei Or Die 3',
  'images/kvod-3/DSC_6490.jpeg':'DJ mit ausgebreiteten Armen bei Komm Vorbei Or Die 3'
};
function pathFor(album,name){ return ['images',album.slug,name].filter(Boolean).join('/'); }
function photoFor(album,name,index){ const src=pathFor(album,name);return {src,alt:descriptions[src] || `${album.title}${album.ort ? ', '+album.ort : ''} – Aufnahme ${index+1}`,caption:album.title}; }
function filesFor(album){ return (Array.isArray(manifest?.[album.slug || '']) ? manifest[album.slug || ''] : []).filter(name=>typeof name==='string' && /\.(jpe?g|png|webp|avif)$/i.test(name)); }
function imageFor(photo,size='small'){
  const img=document.createElement('img');const v=variants[photo.src];
  img.src = v?.[size] || photo.src;
  img.alt=photo.alt;img.loading='lazy';img.decoding='async';
  if(v){
    const dimension=Math.max(v.width,v.height);
    const smallWidth=Math.round(v.width*Math.min(1,640/dimension));
    const largeWidth=Math.round(v.width*Math.min(1,1600/dimension));
    if(largeWidth>smallWidth) img.srcset=`${v.small} ${smallWidth}w, ${v.large} ${largeWidth}w`;
    img.sizes='(max-width: 760px) 46vw, 30vw';
    img.width=v.width;img.height=v.height;
  }
  return img;
}
function scrollToGallery(){ document.getElementById('gallery').scrollIntoView({behavior:scrollBehavior(),block:'start'}); }
function renderOverview(restoreFocus=false){
  activeAlbum=null;galleryPhotos=[];albumView.hidden=true;toolbar.hidden=false;grid.className='album-grid';grid.replaceChildren();
  const visible=albums.filter(album=>filesFor(album).length);
  for(const album of visible){
    const files=filesFor(album);const name=files.includes(album.cover) ? album.cover : files[0];
    const card=document.createElement('a');card.className='album-card';card.href='#album='+encodeURIComponent(album.slug);card.dataset.slug=album.slug;
    const cover=document.createElement('div');cover.className='album-cover';cover.append(imageFor(photoFor(album,name,files.indexOf(name))));
    const arrow=document.createElement('span');arrow.className='album-arrow';arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');cover.append(arrow);
    const info=document.createElement('div');info.className='album-info';const title=document.createElement('h3');title.textContent=album.title;const meta=document.createElement('p');meta.textContent=[album.ort,album.datum].filter(Boolean).join(' · ');const count=document.createElement('small');count.textContent=files.length+' Fotos';meta.append(count);info.append(title,meta);card.append(cover,info);grid.append(card);
  }
  galleryStatus.textContent=visible.length ? '' : 'Hier gibt es aktuell noch keine Bilder.';
  if(restoreFocus){ const card=Array.from(grid.children).find(card=>card.dataset.slug===lastAlbumSlug);card?.focus({preventScroll:true}); }
}
function enterAlbum(album,focus=false){
  activeAlbum=album;lastAlbumSlug=album.slug;toolbar.hidden=true;albumView.hidden=false;grid.className='album-grid photo-grid';grid.replaceChildren();galleryStatus.textContent='';
  document.getElementById('albumTitle').textContent=album.title;
  const files=filesFor(album);document.getElementById('albumMeta').textContent=[album.ort,album.datum,files.length+' Fotos'].filter(Boolean).join(' · ');
  galleryPhotos=files.map((name,index)=>photoFor(album,name,index));
  galleryPhotos.forEach((photo,index)=>{
    const button=document.createElement('button');button.type='button';button.className='frame';button.setAttribute('aria-label','Bild vergrößern: '+photo.alt);button.append(imageFor(photo));
    const label=document.createElement('span');label.className='frame-label';label.textContent=String(index+1).padStart(2,'0');button.append(label);
    button.addEventListener('click',()=>openLightbox(galleryPhotos,index,button));grid.append(button);
  });
  if(focus){scrollToGallery();document.getElementById('albumTitle').focus({preventScroll:true});}
}
function readRoute(focus=false){
  if(!manifest) return;
  if(location.hash.startsWith('#album=')){
    let slug;try{slug=decodeURIComponent(location.hash.slice(7));}catch{slug=null;}
    const album=albums.find(album=>album.slug===slug);
    if(album && filesFor(album).length){enterAlbum(album,focus);return;}
    renderOverview();galleryStatus.textContent='Dieses Album ist aktuell nicht verfügbar. Entdecke die anderen Arbeiten.';return;
  }
  renderOverview(focus);
}
grid.addEventListener('click',event=>{
  const link=event.target.closest('a[href^="#album="]');if(!link || !manifest) return;
  event.preventDefault();history.pushState({album:true},'',link.getAttribute('href'));readRoute(true);
});
document.getElementById('albumBack').addEventListener('click',()=>{history.pushState(null,'','#gallery');readRoute(true);});
window.addEventListener('popstate',()=>readRoute(true));
window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#album=') || activeAlbum) readRoute(location.hash.startsWith('#album='));});
async function loadGallery(){
  try{
    const response=await fetch('images-manifest.json',{cache:'no-cache'});
    if(!response.ok) throw new Error('Manifest unavailable');
    const data=await response.json();if(!data || typeof data!=='object' || Array.isArray(data)) throw new Error('Invalid manifest');
    manifest=data;readRoute(location.hash.startsWith('#album='));
  }catch{
    galleryStatus.textContent='Die vollständigen Alben konnten nicht geladen werden. Bitte lade die Seite erneut oder entdecke weitere Bilder auf Instagram.';
  }
}

const dialog=document.getElementById('lightbox');const lightboxImage=document.getElementById('lightboxImage');
let lightboxList=[],lightboxIndex=0,lightboxTrigger=null;
function showPhoto(){
  const photo=lightboxList[lightboxIndex];if(!photo) return;
  lightboxImage.src=variants[photo.src]?.large || photo.src;lightboxImage.alt=photo.alt;
  document.getElementById('lightboxCaption').textContent=photo.caption || 'Ausgewählte Arbeiten';
  document.getElementById('lightboxCount').textContent=String(lightboxIndex+1).padStart(2,'0')+' / '+String(lightboxList.length).padStart(2,'0');
  document.getElementById('lightboxPrev').hidden=lightboxList.length<2;document.getElementById('lightboxNext').hidden=lightboxList.length<2;
}
function openLightbox(list,index,trigger){
  if(!list[index]) return;
  lightboxList=list;lightboxIndex=index;lightboxTrigger=trigger;showPhoto();
  if(typeof dialog.showModal==='function'){dialog.showModal();document.body.classList.add('modal-open');document.getElementById('lightboxClose').focus();}
  else window.open(lightboxImage.src,'_blank','noopener');
}
function stepPhoto(direction){lightboxIndex=(lightboxIndex+direction+lightboxList.length)%lightboxList.length;showPhoto();}
document.getElementById('lightboxClose').addEventListener('click',()=>dialog.close());
document.getElementById('lightboxPrev').addEventListener('click',()=>stepPhoto(-1));
document.getElementById('lightboxNext').addEventListener('click',()=>stepPhoto(1));
dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');lightboxTrigger?.focus({preventScroll:true});lightboxImage.removeAttribute('src');});
dialog.addEventListener('click',event=>{if(event.target===dialog || event.target.classList.contains('lightbox-stage')) dialog.close();});
dialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();stepPhoto(-1);}if(event.key==='ArrowRight'){event.preventDefault();stepPhoto(1);}});
let touchStart=null;
dialog.addEventListener('touchstart',event=>{if(event.touches.length===1) touchStart={x:event.touches[0].clientX,y:event.touches[0].clientY};else touchStart=null;},{passive:true});
dialog.addEventListener('touchend',event=>{if(!touchStart || !event.changedTouches.length) return;const dx=event.changedTouches[0].clientX-touchStart.x;const dy=event.changedTouches[0].clientY-touchStart.y;if(Math.abs(dx)>55 && Math.abs(dx)>Math.abs(dy)*1.4) stepPhoto(dx<0 ? 1 : -1);touchStart=null;},{passive:true});
const highlightButtons=Array.from(document.querySelectorAll('#highlightsGrid [data-photo]'));
const highlights=highlightButtons.map(button=>({src:button.dataset.photo,alt:button.querySelector('img').alt,caption:button.querySelector('.frame-label').textContent.replace('↗','').trim()}));
highlightButtons.forEach((button,index)=>button.addEventListener('click',()=>openLightbox(highlights,index,button)));

const form=document.getElementById('contactForm');const formStatus=document.getElementById('formStatus');
let submitting=false;
form.addEventListener('submit',async event=>{
  event.preventDefault();if(submitting || !form.reportValidity()) return;
  const formData=new FormData(form);if(formData.get('botcheck')) return;
  submitting=true;const button=form.querySelector('button[type="submit"]');button.disabled=true;
  form.setAttribute('aria-busy','true');formStatus.className='form-status';formStatus.textContent='Deine Anfrage wird gesendet …';
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),20000);
  try{
    const response=await fetch(form.action,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(Object.fromEntries(formData)),signal:controller.signal});
    const result=await response.json();if(!response.ok || !result.success) throw new Error('Submission failed');
    formStatus.className='form-status success';formStatus.textContent='Danke! Deine Anfrage ist angekommen. Ich melde mich bei dir.';form.reset();
  }catch{
    formStatus.className='form-status error';formStatus.replaceChildren(document.createTextNode('Der Versand konnte nicht bestätigt werden. Deine Eingaben bleiben erhalten. Schreib mir alternativ an '));
    const mail=document.createElement('a');mail.href='mailto:hello@mgfoto.media';mail.textContent='hello@mgfoto.media';mail.style.textDecoration='underline';formStatus.append(mail,document.createTextNode('.'));
  }finally{clearTimeout(timeout);button.disabled=false;submitting=false;form.removeAttribute('aria-busy');}
});
loadGallery();
