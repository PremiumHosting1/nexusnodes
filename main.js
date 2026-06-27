/**
 * NEXUSNODE — Main JavaScript
 * ============================================================
 * Handles:
 *  - Navigation scroll behavior & active state
 *  - Mobile menu toggle
 *  - Animated stat counters
 *  - Live console metrics simulation
 *  - Back-to-top button
 *  - Scroll-reveal animations
 *  - Footer year auto-update
 *  - Smooth scroll for anchor links
 * ============================================================
 */

/* ─── DOMContentLoaded guard ─── */
document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     1. NAVIGATION — Scroll effect & Active Link
  ============================================================ */

  const navbar = document.getElementById('navbar');

  /**
   * Adds/removes .scrolled class on the navbar based on scroll position.
   * Also updates the active nav link based on which section is visible.
   */
  function handleNavbarScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    updateActiveNavLink();
  }

  /**
   * Highlights the nav link corresponding to the currently visible section.
   * Uses IntersectionObserver-style manual check via getBoundingClientRect.
   */
  function updateActiveNavLink() {
    const sections = ['home', 'features', 'specs', 'pricing', 'contact'];
    const navLinks  = document.querySelectorAll('.nav-link[data-section]');

    let currentSection = '';
    const scrollY = window.scrollY + 120; // offset for fixed nav height

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const top    = el.offsetTop;
      const height = el.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        currentSection = id;
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === currentSection);
    });
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll(); // run once on load

  /* ============================================================
     2. MOBILE MENU — Toggle Open/Close
  ============================================================ */

  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu    = document.getElementById('mobile-menu');
  const mobileLinks   = document.querySelectorAll('[data-mobile-link]');

  /**
   * Toggles the mobile navigation overlay.
   * Prevents body scroll when menu is open.
   */
  function toggleMobileMenu() {
    const isOpen = mobileMenu.classList.toggle('open');
    mobileMenuBtn.classList.toggle('open', isOpen);
    mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  /** Closes the mobile menu */
  function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    mobileMenuBtn.classList.remove('open');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  }

  // Close menu when any mobile link is clicked
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Close menu when pressing Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMobileMenu();
  });

  /* ============================================================
     3. SMOOTH SCROLL — Anchor Links
  ============================================================ */

  /**
   * Intercepts all anchor hash links and scrolls smoothly.
   * Accounts for the fixed navbar height.
   */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const navbarHeight = navbar ? navbar.offsetHeight : 72;
      const targetY      = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 8;

      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
  });

  /* ============================================================
     4. BACK-TO-TOP BUTTON
  ============================================================ */

  const backToTopBtn = document.getElementById('back-to-top');

  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      backToTopBtn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============================================================
     5. ANIMATED STAT COUNTERS
  ============================================================ */

  /**
   * Animates a numeric value from 0 to its target.
   * @param {HTMLElement} el      - The element containing the counter.
   * @param {number}      target  - Target value.
   * @param {number}      duration- Animation duration in ms.
   */
  function animateCounter(el, target, duration = 1600) {
    const startTime  = performance.now();
    const isDecimal  = !Number.isInteger(target);
    const decimals   = isDecimal ? 1 : 0;

    function update(timestamp) {
      const elapsed  = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = eased * target;

      el.textContent = current.toFixed(decimals);

      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target.toFixed(decimals);
    }

    requestAnimationFrame(update);
  }

  /** Triggers all .stat-num counters once they enter the viewport */
  function initCounters() {
    const counterEls = document.querySelectorAll('.stat-num[data-target]');
    if (!counterEls.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el     = entry.target;
          const target = parseFloat(el.dataset.target);
          animateCounter(el, target);
          observer.unobserve(el); // only animate once
        }
      });
    }, { threshold: 0.5 });

    counterEls.forEach(el => observer.observe(el));
  }

  initCounters();

  /* ============================================================
     6. SCROLL-REVEAL ANIMATIONS
  ============================================================ */

  /**
   * Uses IntersectionObserver to add a .visible class when
   * elements tagged with [data-aos] scroll into view.
   */
  function initScrollReveal() {
    const revealEls = document.querySelectorAll('[data-aos]');
    if (!revealEls.length) return;

    // Inject base reveal styles
    const style = document.createElement('style');
    style.textContent = `
      [data-aos] {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
      }
      [data-aos].aos-visible {
        opacity: 1;
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el    = entry.target;
          const delay = parseInt(el.dataset.aosDelay || el.getAttribute('data-aos-delay') || 0);
          setTimeout(() => el.classList.add('aos-visible'), delay);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => observer.observe(el));
  }

  initScrollReveal();

  /* ============================================================
     7. LIVE CONSOLE METRICS SIMULATION
  ============================================================ */

  /**
   * Simulates live server metrics (CPU, RAM, TPS) in the hero console card.
   * Updates every 3 seconds with realistic random fluctuations.
   */
  function initConsoleSimulation() {
    const cpuBar = document.getElementById('cpu-bar');
    const ramBar = document.getElementById('ram-bar');
    const tpsBar = document.getElementById('tps-bar');
    const cpuVal = document.getElementById('cpu-val');
    const ramVal = document.getElementById('ram-val');
    const tpsVal = document.getElementById('tps-val');

    if (!cpuBar) return; // Hero visual hidden on mobile

    // Current values (start realistic)
    let cpu = 14;
    let ram = 4.2;

    function updateMetrics() {
      // CPU fluctuates ±5%, clamped 8–35
      cpu = Math.min(35, Math.max(8, cpu + (Math.random() * 10 - 5)));
      // RAM fluctuates ±0.3 GB, clamped 2–6.5
      ram = Math.min(6.5, Math.max(2, ram + (Math.random() * 0.6 - 0.3)));

      const cpuPct = cpu.toFixed(0);
      const ramPct = ((ram / 8) * 100).toFixed(0);

      // Update bars
      cpuBar.style.width = cpuPct + '%';
      ramBar.style.width = ramPct + '%';

      // Update labels
      if (cpuVal) cpuVal.textContent = cpuPct + '%';
      if (ramVal) ramVal.textContent = ram.toFixed(1) + ' GB / 8 GB';
    }

    // Update every 3s with smooth CSS transition
    setInterval(updateMetrics, 3000);
  }

  initConsoleSimulation();

  /* ============================================================
     8. CONSOLE TERMINAL TYPEWRITER
  ============================================================ */

  /**
   * Cycles through server log-like messages in the terminal area.
   * New messages are appended and old ones fade out, simulating a live log.
   */
  function initTerminalCycle() {
    const terminal = document.getElementById('console-terminal');
    if (!terminal) return;

    const messages = [
      '&gt; Server started successfully!',
      '&gt; Player <span style="color:#67e8f9">Steve</span> joined the game',
      '&gt; Player <span style="color:#f472b6">Alex</span> joined the game',
      '&gt; Autosave complete (3.2s)',
      '&gt; Backup created: world_backup_v42',
      '&gt; TPS: <span style="color:#4ade80">20.0</span> | MSPT: <span style="color:#4ade80">3.1ms</span>',
      '&gt; DDoS mitigation: <span style="color:#4ade80">Active</span>',
      '&gt; Memory: <span style="color:#a78bfa">4.2GB / 8GB</span>',
    ];

    let msgIndex = 0;

    setInterval(() => {
      // Build a fresh terminal with last 5 messages + cursor
      const lines = [];
      for (let i = 0; i < 5; i++) {
        const idx = (msgIndex + i) % messages.length;
        lines.push(`<div>${messages[idx]}</div>`);
      }
      lines.push('<div class="cursor-line">&gt; <span class="blinking-cursor" aria-hidden="true">_</span></div>');
      terminal.innerHTML = lines.join('');
      msgIndex = (msgIndex + 1) % messages.length;
    }, 2500);
  }

  initTerminalCycle();

  /* ============================================================
     9. FOOTER — Dynamic Year
  ============================================================ */

  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============================================================
     10. PLAN CARDS — Ripple Effect on Click
  ============================================================ */

  /**
   * Adds a ripple animation when plan buttons are clicked.
   * Validates that the target href is a valid URL before opening.
   */
  function initPlanButtonRipple() {
    const planBtns = document.querySelectorAll('.plan-btn');

    planBtns.forEach(btn => {
      btn.addEventListener('click', function (e) {
        // Create ripple
        const ripple = document.createElement('span');
        const rect   = btn.getBoundingClientRect();
        const size   = Math.max(rect.width, rect.height);
        const x      = e.clientX - rect.left - size / 2;
        const y      = e.clientY - rect.top  - size / 2;

        ripple.style.cssText = `
          position:absolute;
          width:${size}px;
          height:${size}px;
          left:${x}px;
          top:${y}px;
          background:rgba(255,255,255,0.25);
          border-radius:50%;
          transform:scale(0);
          animation:ripple-anim 0.5s linear;
          pointer-events:none;
        `;
        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 500);
      });
    });

    // Inject ripple keyframe once
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
      @keyframes ripple-anim {
        to { transform: scale(2.5); opacity: 0; }
      }
    `;
    document.head.appendChild(rippleStyle);
  }

  initPlanButtonRipple();

  /* ============================================================
     11. PRICING SECTION — Plan Card Tilt on Mouse Move
  ============================================================ */

  /**
   * Adds subtle 3D tilt effect to plan cards on mouse move.
   * Resets on mouse leave.
   */
  function initCardTilt() {
    // Only on non-touch devices
    if ('ontouchstart' in window) return;

    const cards = document.querySelectorAll('.plan-card, .feature-card, .spec-card');

    cards.forEach(card => {
      card.addEventListener('mousemove', function (e) {
        const rect   = card.getBoundingClientRect();
        const centerX = rect.left + rect.width  / 2;
        const centerY = rect.top  + rect.height / 2;
        const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -4;
        const rotateY = ((e.clientX - centerX) / (rect.width  / 2)) *  4;

        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
        card.style.transition = 'transform 0.1s ease-out';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform  = '';
        card.style.transition = 'all 0.3s cubic-bezier(0.4,0,0.2,1)';
      });
    });
  }

  initCardTilt();

  /* ============================================================
     12. HERO LOGO FLOAT — Parallax on Scroll
  ============================================================ */

  /**
   * Subtle parallax drift on the site logo image.
   * Moves it slightly on scroll for a premium feel.
   */
  function initLogoParallax() {
    const logo = document.getElementById('site-logo');
    if (!logo) return;

    window.addEventListener('scroll', () => {
      const scrollY  = window.scrollY;
      const offsetY  = scrollY * 0.03;
      logo.style.transform = `translateY(${offsetY}px)`;
    }, { passive: true });
  }

  initLogoParallax();

  /* ============================================================
     13. SPEC BARS — Animate when in view
  ============================================================ */

  /**
   * Resets spec bar widths to 0, then animates them in when
   * the specs section scrolls into view.
   */
  function initSpecBars() {
    const specFills = document.querySelectorAll('.spec-bar-fill');
    const targets   = [];

    // Store original widths and reset
    specFills.forEach(fill => {
      targets.push(fill.style.width);
      fill.style.width = '0%';
    });

    const specsSection = document.getElementById('specs');
    if (!specsSection) return;

    let animated = false;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !animated) {
        animated = true;
        specFills.forEach((fill, i) => {
          setTimeout(() => {
            fill.style.transition = 'width 1.2s ease-out';
            fill.style.width      = targets[i];
          }, i * 150);
        });
      }
    }, { threshold: 0.3 });

    observer.observe(specsSection);
  }

  initSpecBars();

  /* ============================================================
     14. DISCORD LINK VALIDATION
  ============================================================ */

  /**
   * Validates all Discord links to ensure they point to the correct server.
   * Logs a warning in dev tools if an incorrect URL is detected.
   */
  const DISCORD_URL = 'https://discord.gg/taaAH9bdUT';

  document.querySelectorAll('a[href*="discord.gg"]').forEach(link => {
    if (link.href !== DISCORD_URL) {
      console.warn('[NexusNode] Discord link mismatch:', link.href, '→ Expected:', DISCORD_URL);
    }
    // Ensure security attributes
    link.setAttribute('rel', 'noopener noreferrer');
  });

  /* ============================================================
     15. HERO BACKGROUND PARTICLE EFFECT
  ============================================================ */

  /**
   * Creates floating pixel-style particles in the hero section
   * for a Minecraft-inspired ambient effect.
   */
  function initHeroParticles() {
    const hero = document.getElementById('home');
    if (!hero) return;

    // Limit particles on lower-powered devices
    const count = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 12;

    const colors = [
      'rgba(34,211,238,0.6)',
      'rgba(168,85,247,0.6)',
      'rgba(99,102,241,0.6)',
      'rgba(74,222,128,0.5)',
    ];

    for (let i = 0; i < count; i++) {
      const particle  = document.createElement('div');
      const size      = Math.random() * 4 + 2; // 2–6px
      const color     = colors[Math.floor(Math.random() * colors.length)];
      const left      = Math.random() * 100;
      const delay     = Math.random() * 6;
      const duration  = Math.random() * 8 + 6;

      particle.style.cssText = `
        position:absolute;
        left:${left}%;
        top:${Math.random() * 100}%;
        width:${size}px;
        height:${size}px;
        background:${color};
        border-radius:${Math.random() > 0.5 ? '0' : '50%'};
        animation:particle-drift ${duration}s ease-in-out ${delay}s infinite;
        pointer-events:none;
        z-index:0;
      `;

      hero.appendChild(particle);
    }
  }

  initHeroParticles();

  /* ============================================================
     16. CONSOLE CARD — 3D Mouse Tracking
  ============================================================ */

  /**
   * Adds a perspective-aware 3D tilt to the hero console card
   * based on mouse position relative to the card.
   */
  function initConsoleCardTilt() {
    const consoleCard = document.querySelector('.console-card');
    const heroVisual  = document.querySelector('.hero-visual');
    if (!consoleCard || !heroVisual) return;
    if ('ontouchstart' in window) return;

    heroVisual.addEventListener('mousemove', e => {
      const rect    = heroVisual.getBoundingClientRect();
      const centerX = rect.left + rect.width  / 2;
      const centerY = rect.top  + rect.height / 2;
      const rotX    = ((e.clientY - centerY) / (rect.height / 2)) * -6;
      const rotY    = ((e.clientX - centerX) / (rect.width  / 2)) *  6;

      consoleCard.style.transform  = `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
      consoleCard.style.transition = 'transform 0.05s ease-out';
    });

    heroVisual.addEventListener('mouseleave', () => {
      consoleCard.style.transform  = '';
      consoleCard.style.transition = 'transform 0.5s ease';
    });
  }

  initConsoleCardTilt();

  /* ============================================================
     17. PRICING SECTION — Plan Scroll into View Stagger
  ============================================================ */

  /**
   * Staggers plan card animations as they enter the viewport.
   */
  function initPlanCardReveal() {
    const planCards = document.querySelectorAll('.plan-card');

    // Add initial invisible state
    planCards.forEach(card => {
      if (!card.classList.contains('aos-visible')) {
        card.style.opacity   = '0';
        card.style.transform = 'translateY(20px)';
      }
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const card  = entry.target;
          const index = Array.from(planCards).indexOf(card);
          setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity    = '1';
            card.style.transform  = '';
          }, (index % 4) * 80); // stagger per row
          observer.unobserve(card);
        }
      });
    }, { threshold: 0.1 });

    planCards.forEach(card => observer.observe(card));
  }

  initPlanCardReveal();

  /* ============================================================
     18. PERFORMANCE — Debounced Resize Handler
  ============================================================ */

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Re-trigger active link check after resize
      updateActiveNavLink();
      // Auto-close mobile menu on resize to desktop
      if (window.innerWidth >= 768) closeMobileMenu();
    }, 150);
  });

  /* ============================================================
     READY LOG
  ============================================================ */
  console.log(
    '%c🚀 NexusNode %c| Power Your World | Hosting in India',
    'color:#22d3ee;font-weight:900;font-size:14px',
    'color:#94a3b8;font-size:12px'
  );

}); // end DOMContentLoaded
