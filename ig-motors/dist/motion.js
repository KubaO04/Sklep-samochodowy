(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const selector = [
    '.hero-content > *', '.page-hero-inner > *', '.breadcrumbs',
    '.section-heading', '.brand-section-heading', '.brand-tile', '.car-card',
    '.about-visual', '.about-content', '.service', '.story',
    '.editorial-grid > *', '.process-grid article', '.import-grid > *', '.faq-grid > *',
    '.contact-grid > *', '.contact-channels a', '.wide-cta .container > *',
    '.instagram-header', '.instagram-tile', '.catalog-link-row',
    '.filter-panel', '.catalog-scopes', '.catalog-results-toolbar',
    '.detail-heading > *', '.detail-gallery', '.detail-price-panel',
    '.detail-specifications', '.detail-description', '.detail-equipment'
  ].join(',');
  const seen = new WeakSet();
  let observer;
  let mutation;
  function reveal(element) {
    element.classList.remove('reveal-pending');
    observer?.unobserve(element);
  }
  function stop() {
    observer?.disconnect();
    mutation?.disconnect();
    document.querySelectorAll('.reveal-pending').forEach(reveal);
    observer = null;
    mutation = null;
  }
  function register(element) {
    if (seen.has(element) || reduced.matches || !observer) return;
    seen.add(element);
    const siblings = [...(element.parentElement?.children || [])].filter(item => item.matches(selector));
    const delay = Math.max(0, Math.min(siblings.indexOf(element), 4)) * 65;
    element.style.setProperty('--reveal-delay', `${delay}ms`);
    element.classList.add('reveal-item', 'reveal-pending');
    observer.observe(element);
  }
  function collect(root) {
    if (root.nodeType !== 1) return;
    if (root.matches(selector)) register(root);
    root.querySelectorAll(selector).forEach(register);
  }
  function start() {
    if (reduced.matches || !('IntersectionObserver' in window)) return;
    try {
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target); });
      }, { threshold: 0.08, rootMargin: '0px 0px -25px 0px' });
      const main = document.querySelector('main');
      if (!main) return;
      collect(main);
      mutation = new MutationObserver(records => {
        records.forEach(record => record.addedNodes.forEach(collect));
      });
      mutation.observe(main, { childList: true, subtree: true });
    } catch {
      // Content remains available if animation APIs cannot be initialized.
      stop();
    }
  }
  function init() {
    start();
    reduced.addEventListener('change', () => { if (reduced.matches) stop(); else start(); });
    document.addEventListener('focusin', event => {
      let element = event.target;
      while (element && element !== document.body) {
        if (element.classList?.contains('reveal-pending')) reveal(element);
        element = element.parentElement;
      }
    });
  }
  if (document.readyState === 'complete') init();
  else document.addEventListener('DOMContentLoaded', init, { once: true });
})();
