/**
 * RentCan marketing site — smooth anchors, scroll reveals, nav highlight
 */
(function () {
  'use strict';

  const HEADER_OFFSET = 96;

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function revealElement(el, index) {
    if (!el) return;
    el.classList.add('in-view', 'is-visible');
    el.classList.remove('opacity-0', 'translate-y-10');
    if (typeof index === 'number' && el.classList.contains('rc-reveal')) {
      el.style.transitionDelay = index * 70 + 'ms';
    }
  }

  function revealInSection(section) {
    if (!section) return;
    section.querySelectorAll('.rc-reveal, .reveal, .pricing-card').forEach((el, i) => {
      revealElement(el, i);
    });
  }

  function smoothScrollToHash(hash, behavior) {
    if (!hash || hash === '#') return;
    const id = hash.replace(/^#/, '');
    const el = document.getElementById(id);
    if (!el) return;

    const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({
      top: Math.max(0, top),
      behavior: behavior || (prefersReducedMotion() ? 'auto' : 'smooth'),
    });
    revealInSection(el);
  }

  function initRevealObserver() {
    const els = document.querySelectorAll('.rc-reveal');
    if (!els.length) return;

    if (prefersReducedMotion()) {
      els.forEach((el) => revealElement(el));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revealElement(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.06, rootMargin: '0px 0px -32px 0px' }
    );

    els.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        revealElement(el);
      } else {
        observer.observe(el);
      }
    });
  }

  function initAnchorLinks() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href*="#"]');
      if (!a) return;

      let hash = '';
      try {
        const url = new URL(a.href, window.location.origin);
        if (url.pathname !== window.location.pathname && url.pathname !== '/') return;
        hash = url.hash;
      } catch (_) {
        return;
      }

      if (!hash || hash === '#') return;
      const id = hash.slice(1);
      if (!document.getElementById(id)) return;

      e.preventDefault();
      history.pushState(null, '', hash);
      smoothScrollToHash(hash);
    });
  }

  function handleInitialHash() {
    if (!window.location.hash) return;
    setTimeout(() => smoothScrollToHash(window.location.hash, 'auto'), 120);
  }

  function initNavSpy() {
    const sectionIds = ['services', 'inspection', 'pricing', 'additional', 'contact'];
    const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return;

    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    if (!navLinks.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navLinks.forEach((link) => {
            const active = link.getAttribute('href') === '#' + id;
            link.classList.toggle('rc-nav-active', active);
            if (link.classList.contains('text-white/75') || link.classList.contains('text-white')) {
              link.classList.toggle('text-white', active);
              link.classList.toggle('text-white/75', !active);
            }
          });
        });
      },
      { threshold: 0.2, rootMargin: `-${HEADER_OFFSET}px 0px -55% 0px` }
    );

    sections.forEach((s) => observer.observe(s));
  }

  function initPricingTileHover() {
    document.querySelectorAll('.rc-pricing-tile').forEach((tile) => {
      tile.addEventListener('mouseenter', () => tile.classList.add('is-hovered'));
      tile.addEventListener('mouseleave', () => tile.classList.remove('is-hovered'));
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initRevealObserver();
    initAnchorLinks();
    initNavSpy();
    initPricingTileHover();
    handleInitialHash();
  });

  window.addEventListener('hashchange', () => smoothScrollToHash(window.location.hash));

  window.RentCanSite = { smoothScrollToHash, revealInSection };
})();
