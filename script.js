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

// Initialize Global Features (Only runs once)
initCursor();
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

// Boot up interactions on initial load
initDynamicInteractions();

// Boot up the router, passing our initializer to re-run on page transitions
initRouter(initDynamicInteractions);
