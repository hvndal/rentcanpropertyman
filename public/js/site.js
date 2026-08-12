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

  function initHeroHeaderBlend() {
    const header = document.getElementById('site-header');
    if (!header || !header.classList.contains('rc-site-header--on-hero')) return;

    const logo = document.getElementById('site-logo');
    const hero = document.getElementById('hero')
      || document.querySelector('.hero-video-container')?.closest('section');

    function sync() {
      const heroBottom = hero
        ? hero.getBoundingClientRect().bottom
        : (window.innerHeight * 0.55);
      // Leave hero mode once the hero mostly scrolls away
      const solid = heroBottom < 72;
      header.classList.toggle('rc-site-header--solid', solid);
      header.classList.toggle('rc-site-header--on-hero', !solid);
      if (logo) {
        logo.classList.toggle('rc-brand-logo--ghost', !solid);
        logo.classList.toggle('rc-brand-logo--light', solid);
      }
    }

    sync();
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync, { passive: true });
  }

  const PLAN_IDS = ['residential', 'commercial', 'airbnb'];
  const WA_PHONE = '918146298024';
  const WA_MESSAGES = {
    residential:
      "Hi RentCan — I'm interested in property management for my home. Please share details.",
    commercial:
      "Hi RentCan — I'm interested in commercial property management. Please share details.",
    airbnb:
      "Hi RentCan — I'm interested in Airbnb management. Please share details.",
    sos:
      "Hi RentCan — I need an urgent property inspection. Please share details.",
    investor:
      "Hi Herman — I came from the RentCan investors page. Would love to learn more and set up a call.",
    general:
      "Hi RentCan — I'm interested in your property management services. Please share details.",
  };

  function waUrl(plan) {
    const allowed =
      PLAN_IDS.includes(plan) || plan === 'sos' || plan === 'general' || plan === 'investor';
    const key = allowed ? plan : 'general';
    const text = WA_MESSAGES[key] || WA_MESSAGES.general;
    return 'https://wa.me/' + WA_PHONE + '?text=' + encodeURIComponent(text);
  }

  function planFromHref(href) {
    try {
      const url = new URL(href, window.location.origin);
      if (!url.pathname.includes('checkout')) return null;
      return url.searchParams.get('plan') || 'general';
    } catch (_) {
      return null;
    }
  }

  function wireWhatsAppCtas() {
    document.querySelectorAll('[data-wa-plan]').forEach((el) => {
      const plan = el.getAttribute('data-wa-plan') || 'general';
      if (el.tagName === 'A') {
        el.setAttribute('href', waUrl(plan));
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener noreferrer');
      }
    });

    document.querySelectorAll('a[href*="/checkout"], a[href*="checkout.html"]').forEach((a) => {
      if (a.hasAttribute('data-wa-skip')) return;
      const plan = a.getAttribute('data-wa-plan') || planFromHref(a.getAttribute('href')) || 'general';
      a.setAttribute('href', waUrl(plan));
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
      a.setAttribute('data-wa-plan', plan);
    });
  }

  function injectSideSocial() {}

  function setPlanFocus(plan, options) {
    const opts = options || {};
    if (!PLAN_IDS.includes(plan)) return;

    document.documentElement.setAttribute('data-plan-focus', plan);

    document.querySelectorAll('[data-plan-tab]').forEach((btn) => {
      const active = btn.getAttribute('data-plan-tab') === plan;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    document.querySelectorAll('[data-plan]').forEach((el) => {
      const match = el.getAttribute('data-plan') === plan;
      el.classList.toggle('is-plan-focus', match);
      el.classList.toggle('rc-plan-pulse', match && opts.pulse !== false);
    });

    document.querySelectorAll('[data-plan-matrix]').forEach((table) => {
      table.setAttribute('data-focus', plan);
      table.querySelectorAll('tbody tr').forEach((row) => {
        const cell = row.querySelector('[data-plan-col="' + plan + '"]');
        const included = !!(cell && cell.querySelector('.rc-feat-yes'));
        row.classList.toggle('is-plan-included', included);
        row.classList.toggle('is-plan-excluded', !included);
      });
    });

    if (opts.scroll !== false) {
      const targets = document.querySelectorAll(
        '.rc-price-rail [data-plan="' + plan + '"], .rc-plan-rail [data-plan="' + plan + '"]'
      );
      targets.forEach((el) => {
        try {
          el.scrollIntoView({
            behavior: prefersReducedMotion() ? 'auto' : 'smooth',
            inline: 'center',
            block: 'nearest',
          });
        } catch (_) {}
      });
    }

    window.clearTimeout(setPlanFocus._pulseTimer);
    setPlanFocus._pulseTimer = window.setTimeout(() => {
      document.querySelectorAll('.rc-plan-pulse').forEach((el) => el.classList.remove('rc-plan-pulse'));
    }, 2400);
  }

  function initPlanFocus() {
    if (!document.querySelector('[data-plan-tab], [data-plan], [data-plan-matrix]')) return;

    // Trigger focus seamlessly on HOVER / TOUCH without needing a click
    document.querySelectorAll('[data-plan-tab], [data-plan]').forEach((el) => {
      const plan = el.getAttribute('data-plan-tab') || el.getAttribute('data-plan');
      if (!plan) return;

      el.addEventListener('mouseenter', () => {
        setPlanFocus(plan, { scroll: false, pulse: false });
      });

      el.addEventListener('touchstart', () => {
        setPlanFocus(plan, { scroll: false, pulse: false });
      }, { passive: true });
    });

    document.addEventListener('click', (e) => {
      const tab = e.target.closest('[data-plan-tab]');
      if (tab) {
        e.preventDefault();
        setPlanFocus(tab.getAttribute('data-plan-tab'), { scroll: true, pulse: true });
        return;
      }

      const planEl = e.target.closest('[data-plan]');
      if (!planEl) return;
      setPlanFocus(planEl.getAttribute('data-plan'), { scroll: false, pulse: false });
    });

    // Default: residential
    setPlanFocus('residential', { scroll: false, pulse: false });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initRevealObserver();
    initAnchorLinks();
    initNavSpy();
    initPricingTileHover();
    initMobileMenu();
    initHeroChipAccordion();
    initHeroHeaderBlend();
    injectSideSocial();
    wireWhatsAppCtas();
    initPlanFocus();
    handleInitialHash();
  });

  window.addEventListener('hashchange', () => smoothScrollToHash(window.location.hash));

  window.RentCanSite = { smoothScrollToHash, revealInSection, setPlanFocus, waUrl };
})();


