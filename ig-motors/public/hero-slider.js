(() => {
  'use strict';
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const slides = [...hero.querySelectorAll('.hero-slides .hero-photo')];
  if (slides.length < 2) return;
  const dots = [...hero.querySelectorAll('[data-slide-to]')];
  const pauseButton = hero.querySelector('.hero-pause');
  const caption = hero.querySelector('.hero-caption');
  const captionTitle = hero.querySelector('.hero-caption-title');
  const counter = hero.querySelector('[data-slide-number]');
  const status = hero.querySelector('#hero-slide-status');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const failed = new Set();
  let current = 0;
  let timer = null;
  let requestId = 0;
  let paused = false;
  let hovered = false;
  let focused = false;
  let visible = true;
  const interval = 6500;

  function stop() { window.clearTimeout(timer); timer = null; }
  function schedule() {
    stop();
    if (!paused && !hovered && !focused && visible && !document.hidden && !reduced.matches && failed.size < slides.length - 1) {
      timer = window.setTimeout(() => advance(1, false), interval);
    }
  }
  function updatePause() {
    pauseButton.disabled = reduced.matches;
    pauseButton.setAttribute('aria-pressed', String(paused || reduced.matches));
    pauseButton.setAttribute('aria-label', reduced.matches ? 'Automatyczna zmiana wyłączona przy ograniczeniu ruchu' : paused ? 'Wznów zmienianie zdjęć' : 'Wstrzymaj zmienianie zdjęć');
  }
  async function ready(image) {
    if (image.complete) return image.naturalWidth > 0;
    return new Promise(resolve => {
      const timeout = window.setTimeout(() => finish(false), 8000);
      function finish(ok) {
        window.clearTimeout(timeout);
        image.removeEventListener('load', loaded);
        image.removeEventListener('error', failedLoad);
        resolve(ok);
      }
      function loaded() { finish(true); }
      function failedLoad() { finish(false); }
      image.addEventListener('load', loaded, { once: true });
      image.addEventListener('error', failedLoad, { once: true });
      // Lazy images are requested as soon as the visitor selects them.
      image.loading = 'eager';
    });
  }
  async function show(index, announce) {
    stop();
    const ticket = ++requestId;
    const next = (index + slides.length) % slides.length;
    if (next === current) { schedule(); return; }
    if (!await ready(slides[next])) { if (ticket === requestId) { failed.add(next); schedule(); } return; }
    if (ticket !== requestId) return;
    current = next;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === current);
      slide.setAttribute('aria-hidden', String(i !== current));
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === current);
      dot.setAttribute('aria-pressed', String(i === current));
    });
    counter.textContent = String(current + 1).padStart(2, '0');
    captionTitle.textContent = slides[current].dataset.slideTitle;
    caption.href = slides[current].dataset.slideHref;
    if (slides[current].dataset.slideHref.startsWith('https://')) {
      caption.setAttribute('target', '_blank');
      caption.setAttribute('rel', 'noopener noreferrer');
    } else {
      caption.removeAttribute('target');
      caption.removeAttribute('rel');
    }
    if (announce) status.textContent = `Zdjęcie ${current + 1} z ${slides.length}: ${slides[current].dataset.slideTitle}`;
    schedule();
  }
  function advance(direction, announce = true) {
    let next = current;
    for (let attempt = 0; attempt < slides.length; attempt++) {
      next = (next + direction + slides.length) % slides.length;
      if (!failed.has(next)) break;
    }
    return show(next, announce);
  }
  hero.querySelector('.hero-prev').addEventListener('click', () => advance(-1));
  hero.querySelector('.hero-next').addEventListener('click', () => advance(1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => show(i, true)));
  pauseButton.addEventListener('click', () => {
    paused = !paused;
    if (!paused) focused = false;
    updatePause();
    schedule();
  });
  hero.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hovered = true; stop(); } });
  hero.addEventListener('pointerleave', event => { if (event.pointerType === 'mouse') { hovered = false; schedule(); } });
  hero.addEventListener('focusin', () => { focused = true; stop(); });
  hero.addEventListener('focusout', event => { if (!hero.contains(event.relatedTarget)) { focused = false; schedule(); } });
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', () => { updatePause(); schedule(); });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      schedule();
    }, { threshold: 0.05 });
    observer.observe(hero);
  }
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', schedule);
  hero.querySelector('.hero-controls').hidden = false;
  updatePause();
  schedule();
})();
