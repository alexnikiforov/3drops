/* ============================================================
   3drops — progressive enhancement only.
   Everything below is optional: the page works without it.
   ============================================================ */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Marks that JS is alive. Reveal animations only hide content once this is set,
   so a blocked or broken script can never leave sections invisible. */
document.documentElement.classList.add('js');

/* ---------- Mobile navigation ---------- */
const toggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');

if (toggle && navigation) {
  const focusables = () => [...navigation.querySelectorAll('a')];

  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    if (open) focusables()[0]?.focus();
  };

  const closeMenu = () => {
    if (toggle.getAttribute('aria-expanded') === 'true') setMenu(false);
  };

  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => { if (window.innerWidth > 980) closeMenu(); });

  document.addEventListener('keydown', (event) => {
    if (toggle.getAttribute('aria-expanded') !== 'true') return;

    if (event.key === 'Escape') {
      closeMenu();
      toggle.focus();
      return;
    }

    // keep focus inside the open menu
    if (event.key === 'Tab') {
      const items = [toggle, ...focusables()];
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
}

/* ---------- Reveal on scroll ---------- */
const revealables = document.querySelectorAll('.reveal');

if (revealables.length) {
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach((el) => el.classList.add('is-in'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    revealables.forEach((el) => revealObserver.observe(el));

    // Failsafe: if anything prevents the observer from firing, show everything.
    window.setTimeout(() => revealables.forEach((el) => el.classList.add('is-in')), 2500);
  }
}

/* ---------- Current section in nav ---------- */
const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if (sections.length && 'IntersectionObserver' in window) {
  const markCurrent = (id) => {
    navLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${id}`;
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) markCurrent(visible.target.id);
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

  sections.forEach((section) => sectionObserver.observe(section));
}

/* ---------- Sticky mobile CTA (after the hero, hidden over contact) ---------- */
const stickyCta = document.querySelector('#sticky-cta');
const contact = document.querySelector('#contact');
const hero = document.querySelector('.hero');

if (stickyCta && hero) {
  const stickyLink = stickyCta.querySelector('a');

  const setSticky = (visible) => {
    stickyCta.classList.toggle('is-visible', visible);
    stickyCta.setAttribute('aria-hidden', String(!visible));
    if (stickyLink) stickyLink.tabIndex = visible ? 0 : -1;
  };

  const update = () => {
    const pastHero = window.scrollY > hero.offsetHeight * 0.7;
    const atContact = contact
      ? contact.getBoundingClientRect().top < window.innerHeight * 0.9
      : false;
    setSticky(pastHero && !atContact);
  };

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  }, { passive: true });
  update();
}

/* ---------- Case visuals: hover swaps to dark on desktop, scroll on touch ---------- */
const swappables = document.querySelectorAll('.case-media[data-swap]');

if (swappables.length && window.matchMedia('(hover: none)').matches && 'IntersectionObserver' in window) {
  const swapObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle('is-dark', entry.isIntersecting));
  }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });

  swappables.forEach((el) => swapObserver.observe(el));
}

/* ---------- FAQ: one answer open at a time ---------- */
const questions = [...document.querySelectorAll('.faq-list .qa')];

questions.forEach((item) => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    questions.forEach((other) => { if (other !== item) other.open = false; });
  });
});

/* ---------- CTA instrumentation (no-op until analytics is added) ---------- */
document.querySelectorAll('[data-cta]').forEach((el) => {
  el.addEventListener('click', () => {
    const name = el.dataset.cta;
    if (typeof window.plausible === 'function') window.plausible('cta', { props: { id: name } });
    if (typeof window.dataLayer !== 'undefined') window.dataLayer.push({ event: 'cta_click', cta_id: name });
  });
});

/* ---------- Footer year ---------- */
const year = document.querySelector('#current-year');
if (year) year.textContent = new Date().getFullYear();
