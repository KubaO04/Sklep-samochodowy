(() => {
  'use strict';
  const $ = (s,r=document) => r.querySelector(s);
  const menu = $('.menu-toggle');
  const nav = $('#navigation');
  function closeMenu() { nav?.classList.remove('open'); menu?.setAttribute('aria-expanded','false'); menu?.setAttribute('aria-label','Otwórz menu'); }
  menu?.addEventListener('click', () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded',String(open)); menu.setAttribute('aria-label',open?'Zamknij menu':'Otwórz menu'); });
  nav?.addEventListener('click', e => { if(e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', e => { if(e.key==='Escape') closeMenu(); });
  document.addEventListener('click', e => { if(!e.target.closest('.header')) closeMenu(); });
  const privacy = $('#privacy-dialog');
  $('#privacy-open')?.addEventListener('click', () => { privacy.showModal(); document.body.classList.add('dialog-open'); });
  $('.dialog-close',privacy)?.addEventListener('click', () => privacy.close());
  privacy?.addEventListener('close', () => { document.body.classList.remove('dialog-open'); $('#privacy-open')?.focus(); });
  privacy?.addEventListener('click', e => { const r=privacy.getBoundingClientRect(); if(e.target===privacy && (e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)) privacy.close(); });
  if($('#year')) $('#year').textContent = new Date().getFullYear();
  const form = $('#inquiry-form');
  let message = '';
  if(form) {
    const params = new URLSearchParams(location.search);
    const car = (window.IG_MOTORS_CARS||[]).find(c=>c.id===params.get('auto'));
    if(car) $('#inquiry-message').value = `Interesuje mnie ${car.brand} ${car.name}. Proszę o potwierdzenie dostępności i szczegółów oferty.`;
    if(params.get('temat')==='zamowienie') $('#inquiry-topic').selectedIndex=1;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input=$('#inquiry-message');
      if(input.value.trim().length<5) { input.setCustomValidity('Napisz co najmniej 5 znaków.'); input.reportValidity(); return; }
      message=`Dzień dobry IG Motors!\nInteresuje mnie: ${$('#inquiry-topic').value}.\n\n${input.value.trim()}`;
      $('#message-result').hidden=false; $('#copy-status').textContent=''; $('#copy-message').focus();
    });
    $('#inquiry-message').addEventListener('input',e=>{e.target.setCustomValidity('');$('#message-result').hidden=true;});
    $('#inquiry-topic').addEventListener('change',()=>{$('#message-result').hidden=true;});
    $('#copy-message').addEventListener('click',async()=>{
      try { if(!navigator.clipboard?.writeText) throw new Error(); await navigator.clipboard.writeText(message); $('#copy-status').textContent='Skopiowano. Wklej wiadomość w rozmowie na Instagramie.'; }
      catch { const input=$('#inquiry-message'); input.value=message; input.focus(); input.select(); $('#copy-status').textContent='Zaznaczono wiadomość. Skopiuj ją poleceniem Kopiuj lub Ctrl+C.'; }
    });
  }
})();
