(() => {
 const cars=window.IG_MOTORS_CARS;
 const sorted=window.IGCatalog.filterCars(cars,{});
 document.getElementById('car-grid').innerHTML=sorted.slice(0,3).map(window.IGUI.card).join('');
 document.getElementById('results-count').textContent='WYBRANE OFERTY / '+cars.length+' W KATALOGU';
 document.getElementById('used-count').textContent=cars.length;
 let condition='used';
 document.querySelectorAll('[data-condition]').forEach(button=>button.addEventListener('click',()=>{
  condition=button.dataset.condition;
  document.querySelectorAll('[data-condition]').forEach(tab=>{tab.classList.toggle('selected',tab===button);tab.setAttribute('aria-pressed',String(tab===button));});
 }));
 document.getElementById('search-form').addEventListener('submit',event=>{
  event.preventDefault();const params=new URLSearchParams();const brand=document.getElementById('brand-filter').value;const body=document.getElementById('body-filter').value;
  if(brand!=='all')params.set('brand',brand);if(body!=='all')params.set('body',body);if(condition!=='used')params.set('condition',condition);
  location.href='samochody.html'+(params.size?'?'+params.toString():'');
 });
 const gallery=document.getElementById('instagram-grid');
 if(gallery)gallery.innerHTML=window.IG_MOTORS_GALLERY.map(item=>`<a class="instagram-tile" href="https://www.instagram.com/igmotors__/p/${item.source}/" target="_blank" rel="noopener noreferrer" aria-label="${window.IGUI.escape(item.alt)}"><img src="${item.image}" alt="${window.IGUI.escape(item.alt)}" loading="lazy" width="400" height="400">${window.IGUI.icon('instagram')}</a>`).join('');
})();
