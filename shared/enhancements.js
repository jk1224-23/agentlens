/* ── agentlens ENHANCEMENTS SCRIPT ────────────────────────────────
   Handles: progress bar, dark mode toggle, scroll animations
   ──────────────────────────────────────────────────────────────── */

(function() {
  'use strict';

  // ── ANIMATED PROGRESS BAR ────────────────────────────────────────
  function initProgressBar() {
    const prog = document.getElementById('prog');
    if (!prog) return;

    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = docHeight > 0 ? scrollTop / docHeight : 0;
      prog.style.width = (scrolled * 100) + '%';
    });
  }

  // ── DARK/LIGHT MODE TOGGLE ──────────────────────────────────────
  function initThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    // Load saved theme preference
    const saved = localStorage.getItem('agentlens-theme') || 'light';
    if (saved === 'dark') {
      document.documentElement.classList.add('dark-mode');
      toggle.textContent = '☀️';
    } else {
      toggle.textContent = '🌙';
    }

    toggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark-mode');
      localStorage.setItem('agentlens-theme', isDark ? 'dark' : 'light');
      toggle.textContent = isDark ? '☀️' : '🌙';
    });
  }

  // ── SCROLL REVEAL ANIMATIONS ────────────────────────────────────
  function initScrollReveal() {
    const steps = document.querySelectorAll('.step');
    if (steps.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });

    steps.forEach((step) => {
      step.style.opacity = '0';
      step.style.transform = 'translateY(20px)';
      observer.observe(step);
    });
  }

  // ── SMART TOOLTIPS (fallback for older browsers) ────────────────
  function initTooltips() {
    const badges = document.querySelectorAll('.pattern-badge');
    badges.forEach((badge) => {
      const title = badge.getAttribute('title');
      if (title && !title.startsWith('Pattern')) {
        // Title attribute will be used by CSS ::after pseudo-element
        // This is a fallback for accessibility
      }
    });
  }

  // ── INITIALIZATION ───────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initProgressBar();
    initThemeToggle();
    initScrollReveal();
    initTooltips();
  });

  // Fallback if DOM already loaded
  if (document.readyState !== 'loading') {
    initProgressBar();
    initThemeToggle();
    initScrollReveal();
    initTooltips();
  }
})();
