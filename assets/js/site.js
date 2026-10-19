/* MG FOTO: one page, static photographs, no tracking. */
'use strict';
document.getElementById('year').textContent=new Date().getFullYear();
const dialog=document.getElementById('lightbox');const lightboxImage=document.getElementById('lightboxImage');
let lightboxList=[],lightboxIndex=0,lightboxTrigger=null;
function showPhoto(){
  const photo=lightboxList[lightboxIndex];if(!photo) return;
  lightboxImage.src=photo.src;lightboxImage.alt=photo.alt;
  document.getElementById('lightboxCaption').textContent='MG FOTO';
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

const photoLinks=Array.from(document.querySelectorAll('#photoGrid .photo'));
const photos=photoLinks.map(link=>({src:link.getAttribute('href'),alt:link.querySelector('img').alt}));
photoLinks.forEach((link,index)=>link.addEventListener('click',event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();openLightbox(photos,index,link);}));
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
document.querySelectorAll('a[href="#contact"]').forEach(link=>link.addEventListener('click',()=>{document.getElementById('contactDetails').open=true;}));
if(location.hash==='#contact') document.getElementById('contactDetails').open=true;
