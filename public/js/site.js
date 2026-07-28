/**
 * RentCan marketing site — smooth anchors, scroll reveals, nav highlight
 */
(function () {
  'use strict';

  const HEADER_OFFSET = 80;

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

  function pagePath() {
    const p = window.location.pathname || '/';
    if (p === '/' || p.endsWith('/index.html')) return '/';
    return p.replace(/\.html$/, '') || '/';
  }

  function initAnchorLinks() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href*="#"]');
      if (!a) return;

      let hash = '';
      let linkPath = '/';
      try {
        const url = new URL(a.href, window.location.origin);
        linkPath = url.pathname || '/';
        if (linkPath.endsWith('/index.html')) linkPath = '/';
        hash = url.hash;
      } catch (_) {
        return;
      }

      if (!hash || hash === '#') return;
      const id = hash.slice(1);
      // Only intercept same-page anchors — never block cross-page navigation
      if (linkPath !== pagePath()) return;
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

    const navLinks = document.querySelectorAll(
      'nav a[href^="#"], .rc-site-nav-link[href^="#"], .rc-hero-nav-link[href^="#"]'
    );
    if (!navLinks.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navLinks.forEach((link) => {
            const active = link.getAttribute('href') === '#' + id;
            link.classList.toggle('rc-nav-active', active);
            if (link.classList.contains('rc-hero-nav-link')) {
              link.classList.toggle('text-white', active);
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

  function closeMobileMenu() {
    const drawer = document.getElementById('site-mobile-menu') || document.getElementById('hero-mobile-menu');
    const btn = document.getElementById('site-menu-btn') || document.getElementById('hero-menu-btn');
    if (!drawer) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function openMobileMenu() {
    const drawer = document.getElementById('site-mobile-menu') || document.getElementById('hero-mobile-menu');
    const btn = document.getElementById('site-menu-btn') || document.getElementById('hero-menu-btn');
    if (!drawer) return;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    if (btn) btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function initMobileMenu() {
    const btn = document.getElementById('site-menu-btn') || document.getElementById('hero-menu-btn');
    const drawer = document.getElementById('site-mobile-menu') || document.getElementById('hero-mobile-menu');
    if (!btn || !drawer) return;

    btn.addEventListener('click', () => {
      if (drawer.classList.contains('is-open')) closeMobileMenu();
      else openMobileMenu();
    });

    drawer.querySelectorAll('[data-close-menu]').forEach((el) => {
      el.addEventListener('click', closeMobileMenu);
    });

    drawer.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileMenu();
    });
  }

  function initHeroChipAccordion() {
    const chips = document.querySelectorAll('.hero-chip-acc');
    if (!chips.length) return;

    chips.forEach((chip) => {
      chip.addEventListener('toggle', () => {
        if (!chip.open) return;
        chips.forEach((other) => {
          if (other !== chip) other.open = false;
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initRevealObserver();
    initAnchorLinks();
    initNavSpy();
    initPricingTileHover();
    initMobileMenu();
    initHeroChipAccordion();
    handleInitialHash();
  });

  window.addEventListener('hashchange', () => smoothScrollToHash(window.location.hash));

  window.RentCanSite = { smoothScrollToHash, revealInSection };
})();
