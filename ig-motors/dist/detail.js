(() => {
 const main=document.getElementById('detail-main-image');
 const modal=document.getElementById('photo-lightbox');
 const trigger=document.querySelector('.detail-main-photo');
 document.querySelectorAll('[data-photo]').forEach(button=>button.addEventListener('click',()=>{main.src=button.dataset.photo;document.querySelectorAll('[data-photo]').forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));});}));
 trigger.addEventListener('click',()=>{document.getElementById('lightbox-image').src=main.src;modal.showModal();document.body.classList.add('dialog-open');});
 document.querySelector('.lightbox-close').addEventListener('click',()=>modal.close());
 modal.addEventListener('close',()=>{document.body.classList.remove('dialog-open');trigger.focus();});
 modal.addEventListener('click',e=>{if(e.target===modal)modal.close();});
})();
