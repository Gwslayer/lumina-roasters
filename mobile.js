export function initMobileMenu() {
  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  const ICONS = {
    menu: `
      <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>`,
    close: `
      <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>`
  };

  if (!mobileToggle || !navLinks) return;

  mobileToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const isActive = navLinks.classList.contains('active');
    mobileToggle.innerHTML = isActive ? ICONS.close : ICONS.menu;
    mobileToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
  });

  const links = navLinks.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      mobileToggle.innerHTML = ICONS.menu;
      mobileToggle.setAttribute('aria-expanded', 'false');
    });
  });
}