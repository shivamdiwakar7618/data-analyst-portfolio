'use strict';

/* ==========================================================================
   SHIVAM KUMAR — DATA ANALYST PORTFOLIO
   script.js
   Table of contents:
     1.  Utility helpers (debounce, throttle, clamp, safe query)
     2.  Loading screen
     3.  Mobile navigation menu
     4.  Sticky navbar, scroll progress bar & active nav highlighting
     5.  Smooth scrolling
     6.  Typing animation (hero subtitle)
     7.  Hero canvas particle background
     8.  Scroll reveal animations (Intersection Observer)
     9.  Animated KPI counters
     10. Animated skill progress bars
     11. Dashboard chart draw-in animations
     12. Hero floating widget live values
     13. Dark / Light theme toggle (persisted with localStorage)
     14. Back-to-top button
     15. Contact form validation & submission
     16. App bootstrap / init
   ========================================================================== */


/* ==========================================================================
   1. UTILITY HELPERS
   ========================================================================== */

/**
 * Debounce: delays invoking `fn` until `wait` ms have elapsed since the
 * last time it was invoked. Used for expensive handlers like resize.
 * @param {Function} fn
 * @param {number} wait
 * @returns {Function}
 */
function debounce(fn, wait = 150) {
  let timeoutId;
  return function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), wait);
  };
}

/**
 * Throttle: ensures `fn` runs at most once every `limit` ms.
 * Used for high-frequency handlers like scroll.
 * @param {Function} fn
 * @param {number} limit
 * @returns {Function}
 */
function throttle(fn, limit = 100) {
  let inThrottle = false;
  let lastArgs = null;
  return function throttled(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          fn.apply(this, lastArgs);
          lastArgs = null;
        }
      }, limit);
    } else {
      lastArgs = args;
    }
  };
}

/** Clamp a number between min and max. */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/** Safe querySelector that never throws and logs instead. */
function qs(selector, scope = document) {
  try {
    return scope.querySelector(selector);
  } catch (err) {
    console.error(`[portfolio] Invalid selector "${selector}":`, err);
    return null;
  }
}

/** Safe querySelectorAll returning a real array. */
function qsa(selector, scope = document) {
  try {
    return Array.from(scope.querySelectorAll(selector));
  } catch (err) {
    console.error(`[portfolio] Invalid selector "${selector}":`, err);
    return [];
  }
}

/** Whether the user has requested reduced motion at the OS level. */
const prefersReducedMotion =
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* ==========================================================================
   2. LOADING SCREEN
   ========================================================================== */

function initLoadingScreen() {
  const loader = qs('#loader');
  if (!loader) return;

  const hideLoader = () => {
    loader.classList.add('loader--hidden');
    // Remove from the accessibility tree and tab order once hidden.
    loader.setAttribute('aria-hidden', 'true');
  };

  // Hide as soon as everything (images, fonts) has finished loading.
  if (document.readyState === 'complete') {
    // Small timeout so the loader is visible at least briefly, avoiding a flash.
    setTimeout(hideLoader, 400);
  } else {
    window.addEventListener('load', () => setTimeout(hideLoader, 400));
  }

  // Safety net: never let the loader block the site for more than 5s,
  // in case an image or font fails to load.
  setTimeout(hideLoader, 5000);
}


/* ==========================================================================
   3. MOBILE NAVIGATION MENU
   ========================================================================== */

function initMobileMenu() {
  const hamburger = qs('#hamburger');
  const navLinks = qs('#navLinks');
  if (!hamburger || !navLinks) return;

  const closeMenu = () => {
    hamburger.classList.remove('is-active');
    navLinks.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open menu');
  };

  const openMenu = () => {
    hamburger.classList.add('is-active');
    navLinks.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close menu');
  };

  const toggleMenu = () => {
    const isOpen = navLinks.classList.contains('is-open');
    isOpen ? closeMenu() : openMenu();
  };

  hamburger.addEventListener('click', toggleMenu);

  // Close the menu whenever a nav link is chosen (mobile UX expectation).
  qsa('[data-nav]', navLinks).forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key for keyboard users.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
      closeMenu();
      hamburger.focus();
    }
  });

  // Close automatically if the viewport grows back to desktop size.
  window.addEventListener(
    'resize',
    debounce(() => {
      if (window.innerWidth > 860) closeMenu();
    }, 150)
  );
}


/* ==========================================================================
   4. STICKY NAVBAR, SCROLL PROGRESS BAR & ACTIVE NAV HIGHLIGHTING
   ========================================================================== */

function initScrollUI() {
  const navbar = qs('#navbar');
  const scrollProgress = qs('#scrollProgress');
  const backToTop = qs('#backToTop');
  const navLinkEls = qsa('.nav__link[data-nav]');
  const sections = qsa('section[id]');

  const handleScroll = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? clamp((scrollTop / docHeight) * 100, 0, 100) : 0;

    // Scroll progress bar
    if (scrollProgress) {
      scrollProgress.style.width = `${progress}%`;
      scrollProgress.setAttribute('aria-valuenow', String(Math.round(progress)));
    }

    // Sticky navbar background once past the hero
    if (navbar) {
      navbar.classList.toggle('navbar--scrolled', scrollTop > 24);
    }

    // Back-to-top visibility
    if (backToTop) {
      backToTop.classList.toggle('is-visible', scrollTop > 480);
    }

    // Active navigation highlighting: find the section currently in view.
    const navHeight = navbar ? navbar.offsetHeight : 0;
    let currentSectionId = '';
    for (const section of sections) {
      const sectionTop = section.offsetTop - navHeight - 40;
      if (scrollTop >= sectionTop) {
        currentSectionId = section.id;
      }
    }

    navLinkEls.forEach((link) => {
      const targetId = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active-link', targetId === currentSectionId);
    });
  };

  const throttledScroll = throttle(handleScroll, 80);
  window.addEventListener('scroll', throttledScroll, { passive: true });
  window.addEventListener('resize', debounce(handleScroll, 150));

  // Run once on load to set correct initial state.
  handleScroll();
}


/* ==========================================================================
   5. SMOOTH SCROLLING
   ========================================================================== */

function initSmoothScroll() {
  const navbar = qs('#navbar');

  qsa('[data-nav]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      const target = qs(href);
      if (!target) return;

      e.preventDefault();
      const navHeight = navbar ? navbar.offsetHeight : 0;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight + 1;

      window.scrollTo({
        top: targetPosition,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });

      // Move focus to the target section for keyboard/screen-reader users
      // once the scroll settles.
      target.setAttribute('tabindex', '-1');
      setTimeout(() => target.focus({ preventScroll: true }), prefersReducedMotion ? 0 : 500);
    });
  });
}


/* ==========================================================================
   6. TYPING ANIMATION (HERO SUBTITLE)
   ========================================================================== */

function initTypingAnimation() {
  const el = qs('#typedText');
  if (!el) return;

  const phrases = ['Data Analyst', 'Power BI Developer', 'SQL Analyst'];

  // Respect reduced-motion users: just show the first phrase statically.
  if (prefersReducedMotion) {
    el.textContent = phrases.join(' | ');
    return;
  }

  const TYPE_SPEED = 70;
  const DELETE_SPEED = 40;
  const PAUSE_AFTER_TYPE = 1600;
  const PAUSE_AFTER_DELETE = 400;

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function tick() {
    const currentPhrase = phrases[phraseIndex];

    if (!isDeleting) {
      charIndex++;
      el.textContent = currentPhrase.slice(0, charIndex);

      if (charIndex === currentPhrase.length) {
        isDeleting = true;
        setTimeout(tick, PAUSE_AFTER_TYPE);
        return;
      }
      setTimeout(tick, TYPE_SPEED);
    } else {
      charIndex--;
      el.textContent = currentPhrase.slice(0, charIndex);

      if (charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(tick, PAUSE_AFTER_DELETE);
        return;
      }
      setTimeout(tick, DELETE_SPEED);
    }
  }

  tick();
}


/* ==========================================================================
   7. HERO CANVAS PARTICLE BACKGROUND
   ========================================================================== */

function initHeroParticles() {
  const canvas = qs('#particleCanvas');
  if (!canvas || prefersReducedMotion) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let particles = [];
  let animationFrameId = null;

  const PARTICLE_COUNT = 46;
  const MAX_SPEED = 0.25;
  const LINK_DISTANCE = 130;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = canvas.width = rect.width;
    height = canvas.height = rect.height;
  }

  function createParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * MAX_SPEED,
      vy: (Math.random() - 0.5) * MAX_SPEED,
      r: Math.random() * 1.6 + 0.6,
    }));
  }

  function step() {
    ctx.clearRect(0, 0, width, height);

    // Update & draw particles
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(96, 165, 250, 0.75)';
      ctx.fill();
    });

    // Draw connecting lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < LINK_DISTANCE) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(34, 211, 238, ${0.16 * (1 - dist / LINK_DISTANCE)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    animationFrameId = requestAnimationFrame(step);
  }

  function start() {
    cancelAnimationFrame(animationFrameId);
    resize();
    createParticles();
    step();
  }

  // Pause the animation when the tab isn't visible to save CPU/battery.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationFrameId);
    } else {
      step();
    }
  });

  window.addEventListener('resize', debounce(resize, 200));

  try {
    start();
  } catch (err) {
    console.error('[portfolio] Failed to start hero particle animation:', err);
  }
}


/* ==========================================================================
   8. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
   ========================================================================== */

function initScrollReveal() {
  const revealEls = qsa('.reveal');
  if (!revealEls.length) return;

  // If IntersectionObserver isn't supported, just show everything.
  if (!('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target); // animate once, then stop observing
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach((el) => observer.observe(el));
}


/* ==========================================================================
   9. ANIMATED KPI COUNTERS
   ========================================================================== */

function initKpiCounters() {
  const counters = qsa('[data-count]');
  if (!counters.length) return;

  const DURATION = 1600; // ms

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    if (Number.isNaN(target)) return;

    if (prefersReducedMotion) {
      el.textContent = String(target);
      return;
    }

    const startTime = performance.now();

    function frame(now) {
      const elapsed = now - startTime;
      const progress = clamp(elapsed / DURATION, 0, 1);
      // Ease-out cubic for a natural deceleration.
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(eased * target);
      el.textContent = String(value);

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = String(target);
      }
    }

    requestAnimationFrame(frame);
  }

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animateCounter);
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((el) => observer.observe(el));
}


/* ==========================================================================
   10. ANIMATED SKILL PROGRESS BARS
   ========================================================================== */

function initSkillBars() {
  const skillCards = qsa('.skill-card[data-progress]');
  if (!skillCards.length) return;

  function fillBar(card) {
    const progress = clamp(parseInt(card.getAttribute('data-progress'), 10) || 0, 0, 100);
    const fill = qs('.skill-card__fill', card);
    if (fill) {
      // Delay slightly so the width transition is visible even if the
      // card was already in the viewport on load.
      requestAnimationFrame(() => {
        fill.style.width = `${progress}%`;
      });
    }
  }

  if (!('IntersectionObserver' in window)) {
    skillCards.forEach(fillBar);
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          fillBar(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  skillCards.forEach((card) => observer.observe(card));
}


/* ==========================================================================
   11. DASHBOARD CHART DRAW-IN ANIMATIONS
   ========================================================================== */

function initDashboardCharts() {
  const dashboardSection = qs('#dashboard');
  if (!dashboardSection) return;

  function drawCharts() {
    // Line chart
    const lineChartLine = qs('.line-chart__line', dashboardSection);
    if (lineChartLine) lineChartLine.classList.add('is-drawn');

    // Donut chart segments
    qsa('.donut-chart__seg', dashboardSection).forEach((seg, i) => {
      setTimeout(() => seg.classList.add('is-drawn'), i * 150);
    });

    // Horizontal bar chart
    qsa('.bar-chart__fill[data-bar]', dashboardSection).forEach((bar, i) => {
      const value = clamp(parseInt(bar.getAttribute('data-bar'), 10) || 0, 0, 100);
      setTimeout(() => {
        bar.style.width = `${value}%`;
      }, i * 120);
    });

    // Vertical column chart
    qsa('.col-chart__col', dashboardSection).forEach((col, i) => {
      setTimeout(() => col.classList.add('is-drawn'), i * 90);
    });
  }

  if (!('IntersectionObserver' in window)) {
    drawCharts();
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          drawCharts();
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  observer.observe(dashboardSection);
}


/* ==========================================================================
   12. HERO FLOATING WIDGET LIVE VALUES
   ========================================================================== */

function initHeroFloatingWidgets() {
  const heroKpi = qs('#heroKpi');
  if (!heroKpi || prefersReducedMotion) return;

  // Simulate a "live" query-runtime metric ticking gently, purely
  // decorative but reinforces the dashboard feel of the hero.
  const BASE_VALUE = 128;
  const VARIANCE = 14;

  setInterval(() => {
    const jitter = Math.round((Math.random() - 0.5) * VARIANCE * 2);
    const newValue = clamp(BASE_VALUE + jitter, 90, 180);
    heroKpi.textContent = String(newValue);
  }, 2200);
}


/* ==========================================================================
   13. DARK / LIGHT THEME TOGGLE (PERSISTED WITH LOCALSTORAGE)
   ========================================================================== */

const THEME_STORAGE_KEY = 'portfolio-theme-preference';

function getStoredTheme() {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch (err) {
    // localStorage can throw in privacy modes / disabled storage.
    console.warn('[portfolio] Unable to read theme preference from localStorage:', err);
    return null;
  }
}

function setStoredTheme(theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (err) {
    console.warn('[portfolio] Unable to save theme preference to localStorage:', err);
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const toggle = qs('#themeToggle');
  if (toggle) {
    toggle.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    toggle.setAttribute(
      'aria-label',
      theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'
    );
  }
}

function initThemeToggle() {
  const toggle = qs('#themeToggle');

  // Determine initial theme: stored preference > OS preference > dark default.
  const stored = getStoredTheme();
  const systemPrefersLight =
    window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  const initialTheme = stored || (systemPrefersLight ? 'light' : 'dark');

  applyTheme(initialTheme);

  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    applyTheme(next);
    setStoredTheme(next);
  });
}


/* ==========================================================================
   14. BACK-TO-TOP BUTTON
   ========================================================================== */

function initBackToTop() {
  const backToTop = qs('#backToTop');
  if (!backToTop) return;

  backToTop.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
    // Return focus to the top of the page for keyboard users.
    const skipTarget = qs('#home') || document.body;
    skipTarget.setAttribute('tabindex', '-1');
    skipTarget.focus({ preventScroll: true });
  });

  // Visibility is handled centrally in initScrollUI() to avoid
  // duplicate scroll listeners.
}


/* ==========================================================================
   15. CONTACT FORM VALIDATION & SUBMISSION
   ========================================================================== */

function initContactForm() {
  const form = qs('#contactForm');
  if (!form) return;

  const fields = {
    name: {
      input: qs('#name', form),
      error: qs('#nameError', form),
      validate: (value) => {
        if (!value.trim()) return 'Please enter your name.';
        if (value.trim().length < 2) return 'Name must be at least 2 characters.';
        return '';
      },
    },
    email: {
      input: qs('#email', form),
      error: qs('#emailError', form),
      validate: (value) => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) return 'Please enter your email.';
        if (!emailPattern.test(value.trim())) return 'Please enter a valid email address.';
        return '';
      },
    },
    subject: {
      input: qs('#subject', form),
      error: qs('#subjectError', form),
      validate: (value) => {
        if (!value.trim()) return 'Please add a subject.';
        return '';
      },
    },
    message: {
      input: qs('#message', form),
      error: qs('#messageError', form),
      validate: (value) => {
        if (!value.trim()) return 'Please write a message.';
        if (value.trim().length < 10) return 'Message should be at least 10 characters.';
        return '';
      },
    },
  };

  const statusEl = qs('#formStatus', form);

  function setFieldError(field, message) {
    const group = field.input ? field.input.closest('.form-group') : null;
    if (field.error) field.error.textContent = message;
    if (group) group.classList.toggle('has-error', Boolean(message));
    if (field.input) field.input.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function validateField(key) {
    const field = fields[key];
    if (!field.input) return true;
    const message = field.validate(field.input.value);
    setFieldError(field, message);
    return !message;
  }

  // Live validation on blur so users get feedback without being
  // interrupted mid-keystroke.
  Object.keys(fields).forEach((key) => {
    const field = fields[key];
    if (!field.input) return;
    field.input.addEventListener('blur', () => validateField(key));
    field.input.addEventListener('input', () => {
      // Clear the error as soon as the user starts correcting it.
      const group = field.input.closest('.form-group');
      if (group && group.classList.contains('has-error')) {
        validateField(key);
      }
    });
  });

  function showStatus(message, isError) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.toggle('is-error', isError);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showStatus('', false);

    const results = Object.keys(fields).map((key) => validateField(key));
    const isValid = results.every(Boolean);

    if (!isValid) {
      showStatus('Please fix the highlighted fields and try again.', true);
      // Move focus to the first invalid field for accessibility.
      const firstInvalidKey = Object.keys(fields).find((key) => {
        const group = fields[key].input ? fields[key].input.closest('.form-group') : null;
        return group && group.classList.contains('has-error');
      });
      if (firstInvalidKey && fields[firstInvalidKey].input) {
        fields[firstInvalidKey].input.focus();
      }
      return;
    }

    const submitBtn = qs('button[type="submit"]', form);
    const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending&hellip;';
      }

      // NOTE: There is no backend wired up in this static template.
      // Replace this simulated delay with a real fetch() call to your
      // form endpoint (e.g. Formspree, EmailJS, or your own API) when
      // deploying this project.
      await new Promise((resolve) => setTimeout(resolve, 1200));

      showStatus("Thanks! Your message has been sent — I'll reply soon.", false);
      form.reset();
      Object.keys(fields).forEach((key) => setFieldError(fields[key], ''));
    } catch (err) {
      console.error('[portfolio] Contact form submission failed:', err);
      showStatus('Something went wrong sending your message. Please try again.', true);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
      }
    }
  });
}


/* ==========================================================================
   16. APP BOOTSTRAP / INIT
   ========================================================================== */

function initFooterYear() {
  const yearEl = qs('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
}

function initPortfolio() {
  const initializers = [
    initLoadingScreen,
    initMobileMenu,
    initScrollUI,
    initSmoothScroll,
    initTypingAnimation,
    initHeroParticles,
    initScrollReveal,
    initKpiCounters,
    initSkillBars,
    initDashboardCharts,
    initHeroFloatingWidgets,
    initThemeToggle,
    initBackToTop,
    initContactForm,
    initFooterYear,
  ];

  initializers.forEach((fn) => {
    try {
      fn();
    } catch (err) {
      // Isolate failures: one broken feature should never take down
      // the rest of the page's interactivity.
      console.error(`[portfolio] Error running ${fn.name}:`, err);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
  initPortfolio();
}
