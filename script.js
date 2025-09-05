/* ===== Utility ===== */
const $ = (q, ctx = document) => ctx.querySelector(q);
const $$ = (q, ctx = document) => Array.from(ctx.querySelectorAll(q));

/* ===== Mobile Nav ===== */
const navToggle = $('.nav-toggle');
const nav = $('#site-nav');

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // Close on link click (mobile)
  nav.addEventListener('click', e => {
    if (e.target.tagName === 'A' && nav.classList.contains('is-open')) {
      nav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ===== Sticky header elevation ===== */
const header = document.querySelector('[data-elevate]');
let lastY = 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY || document.documentElement.scrollTop;
  if (!header) return;
  if (y > 8 && y > lastY) header.classList.add('scrolled');
  if (y < 8) header.classList.remove('scrolled');
  lastY = y;
});

/* ===== Hero Slider (accessible, auto-advance, pause on hover/focus) ===== */
const slider = $('.slider');
const slidesWrap = $('.slides');
const slides = $$('.slide', slidesWrap);
const dots = $$('.dot');
const prevBtn = $('[data-prev]');
const nextBtn = $('[data-next]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let index = 0;
let timer = null;
const DURATION = 5500;

function goTo(i) {
  index = (i + slides.length) % slides.length;
  slides.forEach((s, n) => s.classList.toggle('is-active', n === index));
  dots.forEach((d, n) => {
    d.classList.toggle('is-active', n === index);
    d.setAttribute('aria-selected', n === index ? 'true' : 'false');
  });
}

function next() { goTo(index + 1); }
function prev() { goTo(index - 1); }

function start() {
  if (prefersReducedMotion) return; // respect user setting
  stop();
  timer = setInterval(next, DURATION);
}
function stop() { if (timer) clearInterval(timer); }

if (slider && slides.length) {
  // Controls
  nextBtn?.addEventListener('click', () => { next(); start(); });
  prevBtn?.addEventListener('click', () => { prev(); start(); });

  dots.forEach(d => {
    d.addEventListener('click', () => { goTo(parseInt(d.dataset.goto, 10)); start(); });
    d.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); d.click(); }
    });
  });

  // Pause on hover/focus within
  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);
  slider.addEventListener('focusin', stop);
  slider.addEventListener('focusout', start);

  // Keyboard arrows
  window.addEventListener('keydown', (e) => {
    if (document.activeElement.closest('.slider')) {
      if (e.key === 'ArrowRight') { next(); start(); }
      if (e.key === 'ArrowLeft') { prev(); start(); }
    }
  });

  // Touch swipe
  let x0 = null;
  slidesWrap.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  slidesWrap.addEventListener('touchmove', (e) => {
    if (x0 === null) return;
    const dx = e.touches[0].clientX - x0;
    if (Math.abs(dx) > 40) {
      dx < 0 ? next() : prev();
      x0 = null;
      start();
    }
  }, { passive: true });

  // Kickoff
  start();
}

/* ===== Fade-in on scroll ===== */
const io = ('IntersectionObserver' in window) ? new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('reveal');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 }) : null;

$$('.section .card, .section .section-title, .section p, .section li').forEach(el => {
  el.classList.add('will-reveal');
  io?.observe(el);
});

const style = document.createElement('style');
style.textContent = `
  .will-reveal { opacity: 0; transform: translateY(10px); transition: .6s ease; }
  .reveal { opacity: 1; transform: none; }
`;
document.head.appendChild(style);

/* ===== Footer year ===== */
$('#year').textContent = new Date().getFullYear();

/* ===== Simple contact form handler (no backend) ===== */
const form = $('.contact-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    alert(`Thanks, ${data.name}! We'll reach out to ${data.email} soon.`);
    form.reset();
  });
}
