/* ═══════════════════════════════════════════════
   ELYSA CONSULTANTS — MAIN JS
   Navbar, animations, shared utilities
   ═══════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── NAVBAR SCROLL ─────────────────────────────
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // ── HAMBURGER MENU ────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target)) {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  // ── SCROLL LINKS (smooth scroll to anchor) ────
  document.querySelectorAll('.scroll-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const navH = navbar ? navbar.offsetHeight : 72;
          const top  = target.getBoundingClientRect().top + window.scrollY - navH;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  });

  // ── INTERSECTION OBSERVER (scroll animations) ─
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-animate]').forEach(el => {
    observer.observe(el);
  });


  // ── COUNTER ANIMATION ─────────────────────────
  function animateCount(el, target, duration) {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      el.textContent = (el.dataset.suffix || '') === '%'
        ? Math.round(start) + '%'
        : Math.round(start) + (el.dataset.suffix || '');
      if (start >= target) clearInterval(timer);
    }, 16);
  }

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const raw = el.textContent.trim();
        const num = parseInt(raw.replace(/\D/g, ''), 10);
        if (!isNaN(num) && num > 0) {
          el.dataset.suffix = raw.replace(/\d/g, '');
          animateCount(el, num, 1200);
        }
        statsObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-number, .why-number').forEach(el => {
    statsObserver.observe(el);
  });

  // ── THEME SWITCHER ────────────────────────────
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (themeToggleBtn) {
    const icon = themeToggleBtn.querySelector('i');
    
    // Initialize toggle icon based on the current theme loaded in <head>
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    if (currentTheme === 'light') {
      if (icon) {
        icon.className = 'fas fa-moon';
      }
    } else {
      if (icon) {
        icon.className = 'fas fa-sun';
      }
    }
    
    themeToggleBtn.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      
      // Update HTML attribute
      document.documentElement.setAttribute('data-theme', newTheme);
      
      // Save preference
      localStorage.setItem('theme', newTheme);
      
      // Update button icon with transition
      if (icon) {
        icon.style.transform = 'rotate(180deg) scale(0)';
        setTimeout(() => {
          if (newTheme === 'light') {
            icon.className = 'fas fa-moon';
          } else {
            icon.className = 'fas fa-sun';
          }
          icon.style.transform = 'rotate(360deg) scale(1)';
          // Reset transform so subsequent hover rotations work
          setTimeout(() => {
            icon.style.transform = '';
          }, 400);
        }, 200);
      }
    });
  }

})();
