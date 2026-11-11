(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const cars=window.IG_MOTORS_CARS;
  const core=window.IGCatalog;
  const form=$('#catalog-form');
  let state=core.fromSearch(location.search);
  const escape=window.IGUI.escape;
  const filteredOptions=(key, values, label)=>{const field=form.elements.namedItem(key);field.innerHTML=`<option value="all">${label}</option>`+values.map(v=>`<option value="${escape(v)}">${escape(v)}</option>`).join('');};
  function updateModels(){
    const previous=form.elements.namedItem('model').value;
    filteredOptions('model',[...new Set(cars.filter(c=>form.elements.namedItem('brand').value==='all'||c.brand===form.elements.namedItem('brand').value).map(c=>c.model))].sort(),'Wszystkie modele');
    if([...form.elements.namedItem('model').options].some(o=>o.value===previous)) form.elements.namedItem('model').value=previous;
  }
  for(const [key,label] of [['brand','Wszystkie marki'],['body','Wszystkie nadwozia'],['fuel','Każde paliwo'],['transmission','Każda skrzynia']]) filteredOptions(key,[...new Set(cars.map(c=>c[key]).filter(Boolean))].sort(),label);
  for(const [key,value] of Object.entries(state)){const el=form.elements.namedItem(key);if(el&&key!=='model')el.value=value;}
  updateModels();
  if([...form.elements.namedItem('model').options].some(o=>o.value===state.model))form.elements.namedItem('model').value=state.model;
  function read(){return Object.fromEntries(Object.keys(core.defaults).map(key=>[key,form.elements.namedItem(key)?.value??state[key]??core.defaults[key]]));}
  function render(updateURL=true){
    state=read();
    const matches=core.filterCars(cars,state);
    $('#catalog-grid').innerHTML=matches.map(window.IGUI.card).join('');
    $('#catalog-count').textContent=`${matches.length} ${matches.length===1?'samochód':matches.length>1&&matches.length<5?'samochody':'samochodów'}`;
    $('#catalog-empty').hidden=matches.length>0;
    $('#empty-catalog-title').textContent=state.condition==='new'?'Nowe auto? Porozmawiajmy.':'Nie znaleźliśmy auta z tymi filtrami.';
    $('#empty-catalog-text').textContent=state.condition==='new'?'IG Motors specjalizuje się w samochodach używanych. Zapytaj nas o swoje oczekiwania.':'Zmień wybrane parametry albo skontaktuj się z nami w sprawie auta na zamówienie.';
    $('#active-filters').innerHTML=Object.entries(state).filter(([k,v])=>!['sort','condition'].includes(k)&&v!==''&&v!=='all'&&v!==core.defaults[k]).map(([key,value])=>`<button type="button" data-remove="${key}">${escape(labels[key]||key)}: ${escape(key==='status'?(value==='listed'?'OTOMOTO':'Instagram'):value)} <span aria-hidden="true">×</span></button>`).join('');
    document.querySelectorAll('[data-brand]').forEach(button=>{const selected=button.dataset.brand===state.brand;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));});
    document.querySelectorAll('[data-scope]').forEach(button=>{const selected=state.status===button.dataset.scope;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));});
    const rangeWrong=Number(state.priceMin)>Number(state.priceMax)&&state.priceMax!==''&&state.priceMin!==''||Number(state.yearMin)>Number(state.yearMax)&&state.yearMax!==''&&state.yearMin!=='';
    $('#filter-warning').hidden=!rangeWrong;
    if(updateURL){const query=core.toSearch(state);history.replaceState(null,'',location.pathname+(query?'?'+query:''));}
  }
  const labels={q:'Szukaj',brand:'Marka',model:'Model',body:'Nadwozie',fuel:'Paliwo',transmission:'Skrzynia',status:'Źródło',priceMin:'Cena od',priceMax:'Cena do',yearMin:'Rok od',yearMax:'Rok do',mileageMax:'Przebieg do',powerMin:'Moc od'};
  form.addEventListener('submit',e=>{e.preventDefault();render();if(window.innerWidth<850)$('#catalog-results').scrollIntoView({behavior:'smooth'});});
  form.addEventListener('change',e=>{if(e.target.name==='brand'){form.elements.namedItem('model').value='all';updateModels();}render();});
  let debounce;
  form.addEventListener('input',e=>{if(e.target.matches('input')){clearTimeout(debounce);debounce=setTimeout(()=>render(),220);}});
  $('#catalog-sort').value=state.sort;
  $('#catalog-sort').addEventListener('change',e=>{form.elements.namedItem('sort').value=e.target.value;render();});
  document.querySelectorAll('[data-brand]').forEach(button=>button.addEventListener('click',()=>{form.elements.namedItem('brand').value=button.dataset.brand;form.elements.namedItem('model').value='all';updateModels();render();}));
  document.querySelectorAll('[data-scope]').forEach(button=>button.addEventListener('click',()=>{form.elements.namedItem('status').value=button.dataset.scope;render();}));
  function reset(){for(const[key,value]of Object.entries(core.defaults)){const el=form.elements.namedItem(key);if(el)el.value=value;}updateModels();$('#catalog-sort').value='recommended';render();}
  document.querySelectorAll('[data-reset]').forEach(button=>button.addEventListener('click',reset));
  $('#active-filters').addEventListener('click',e=>{const button=e.target.closest('[data-remove]');if(!button)return;form.elements.namedItem(button.dataset.remove).value=core.defaults[button.dataset.remove];if(button.dataset.remove==='brand'){form.elements.namedItem('model').value='all';updateModels();}render();});
  window.addEventListener('popstate',()=>{state=core.fromSearch(location.search);for(const[key,value]of Object.entries(state)){const el=form.elements.namedItem(key);if(el&&key!=='model')el.value=value;}updateModels();form.elements.namedItem('model').value=state.model;$('#catalog-sort').value=state.sort;render(false);});
  if(window.matchMedia('(max-width: 720px)').matches) $('.filter-panel').open=false;
  render(false);
})();
