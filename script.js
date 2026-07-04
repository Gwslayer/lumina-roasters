import { initSteam } from './steam.js';
import { initTheme } from './theme.js';
import { initCursor, attachCursorEvents } from './cursor.js';
import { initMenu } from './menu.js';
import { initRouter } from './router.js';
import { initForm } from './form.js';
import { initReveals } from './reveals.js';
import { initMobileMenu } from './mobile.js';
import { registerSW } from 'virtual:pwa-register';

// Add a class to indicate that JavaScript is active
document.documentElement.classList.add('js-enabled');

// Register the Service Worker for PWA offline capabilities
registerSW({ immediate: true });

// Initialize Critical Global Features immediately
initTheme();
initMobileMenu();

// Global Escape key handler for popups
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const popup = document.getElementById('reservation-popup');
    if (popup && popup.classList.contains('active')) {
      popup.classList.remove('active');
      popup.setAttribute('aria-hidden', 'true');
    }
  }
});

/*
   MASTER INITIALIZATION FUNCTION
   Groups dynamic events so they can be re-triggered after page routing
*/
function initDynamicInteractions() {
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
  
  initMenu();
  initSteam();
  attachCursorEvents();
  initReveals();
  initForm();
}

function initHeroParallax() {
  const heroText = document.querySelector('.hero-text');
  if (!heroText) return;

  // Run on load
  const initialScroll = window.scrollY;
  if (initialScroll < window.innerHeight) {
    heroText.style.transform = `translateY(-${initialScroll * 0.2}px)`;
  }

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight) {
      // Move text up at 20% of the scroll speed for a subtle effect
      heroText.style.transform = `translateY(-${scrollY * 0.2}px)`;
    }
  }, { passive: true }); // Performance optimization
}

function initCardTilt() {
  const tiltElements = document.querySelectorAll('.testimonial-card, .menu-item');

  tiltElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const { width, height } = rect;
      const rotateX = (y / height - 0.5) * -12; // Max 6 deg tilt
      const rotateY = (x / width - 0.5) * 12;  // Max 6 deg tilt

      el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
      el.style.transition = 'transform 0.1s ease-out';
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
      el.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
    });
  });
}


// PERFORMANCE OPTIMIZATION ROUTER & TIMING CONTROL


// Boot up the router immediately so clicks are intercepted from the first millisecond
initRouter(initDynamicInteractions);

// Defer non-critical, heavy rendering loops until the main thread has completed painting the initial page
const deferHeavyVisuals = () => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      initCursor(); // Fires the 60fps cursor animation loop
      initDynamicInteractions(); // Draws steam canvas, attaches animations
      initCardTilt();
      initHeroParallax();
    });
  } else {
    // Fallback alignment for engines missing requestIdleCallback support
    setTimeout(() => {
      initCursor();
      initDynamicInteractions();
      initCardTilt();
      initHeroParallax();
    }, 200);
  }
};

// Fire structural optimization routines depending on the current browser state
if (document.readyState === 'complete') {
  deferHeavyVisuals();
} else {
  window.addEventListener('load', deferHeavyVisuals);
}