/* Wspólna logika katalogu; działa również bez DOM w kontroli Node.js. */
(function (root) {
  'use strict';
  const defaults = { q: '', brand: 'all', model: 'all', body: 'all', fuel: 'all', transmission: 'all', condition: 'used', status: 'all', priceMin: '', priceMax: '', yearMin: '', yearMax: '', mileageMax: '', powerMin: '', sort: 'recommended' };
  const normalize = text => String(text ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l').replace(/[×✕]/g, 'x');
  const value = input => input !== '' && input != null && Number.isFinite(Number(input)) ? Number(input) : null;
  function filterCars(cars, input = {}) {
    const state = { ...defaults, ...input };
    const terms = normalize(state.q).trim().split(/\s+/).filter(Boolean);
    const matches = cars.filter(car => {
      if (state.condition !== 'all' && car.condition !== state.condition) return false;
      if (state.status !== 'all' && car.status !== state.status) return false;
      if (['brand', 'model', 'body', 'fuel', 'transmission'].some(key => state[key] !== 'all' && car[key] !== state[key])) return false;
      const searchable = normalize([car.brand, car.name, car.model, car.subtitle, car.fuel, car.body, car.transmission, ...car.features].join(' '));
      if (!terms.every(term => searchable.includes(term))) return false;
      for (const [key, field, direction] of [['priceMin','price','min'],['priceMax','price','max'],['yearMin','year','min'],['yearMax','year','max'],['mileageMax','mileage','max'],['powerMin','power','min']]) {
        const limit = value(state[key]);
        if (limit != null && (car[field] == null || (direction === 'min' ? car[field] < limit : car[field] > limit))) return false;
      }
      return true;
    });
    const comparators = {
      recommended: (a,b) => (a.status === 'listed' ? 0 : 1) - (b.status === 'listed' ? 0 : 1) || b.year - a.year,
      'price-asc': (a,b) => (a.price ?? Infinity) - (b.price ?? Infinity),
      'price-desc': (a,b) => (b.price ?? -Infinity) - (a.price ?? -Infinity),
      'year-desc': (a,b) => b.year - a.year,
      'mileage-asc': (a,b) => (a.mileage ?? Infinity) - (b.mileage ?? Infinity)
    };
    return matches.sort(comparators[state.sort] ?? comparators.recommended);
  }
  function fromSearch(search) {
    const params = new URLSearchParams(search);
    return Object.fromEntries(Object.entries(defaults).map(([key, fallback]) => [key, params.get(key) ?? fallback]));
  }
  function toSearch(state) {
    const params = new URLSearchParams();
    for (const [key, fallback] of Object.entries(defaults)) if (state[key] != null && state[key] !== '' && String(state[key]) !== fallback) params.set(key, state[key]);
    return params.toString();
  }
  root.IGCatalog = { defaults, filterCars, fromSearch, toSearch, normalize };
})(typeof window === 'undefined' ? globalThis : window);
