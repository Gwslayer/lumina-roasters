// Add a class to indicate that JavaScript is active
document.documentElement.classList.add('js-enabled');

// Initialize theme from localStorage on page load
try {
  if (localStorage.getItem('lumina-theme') === 'dark') {
    document.documentElement.classList.add('dark-mode');
  }
} catch (e) {
  console.warn("Could not read theme preference from localStorage.", e);
}

const dot = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');

let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateCursor() {
  ringX += (mouseX - ringX) * 0.2;
  ringY += (mouseY - ringY) * 0.2;

  if (dot) {
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  }
  if (ring) {
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
  }

  requestAnimationFrame(animateCursor);
}
animateCursor();

const interactives = document.querySelectorAll('.interactive, a');
interactives.forEach(el => {
  el.addEventListener('mouseenter', () => {
    if (ring) ring.classList.add('active');
    if (dot) dot.style.transform = 'translate(-50%, -50%) scale(0.5)';
  });
  el.addEventListener('mouseleave', () => {
    if (ring) ring.classList.remove('active');
    if (dot) dot.style.transform = 'translate(-50%, -50%) scale(1)';
  });
});
const reveals = document.querySelectorAll('.reveal');
const revealOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };

const revealOnScroll = new IntersectionObserver(function (entries, observer) {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('active');
    observer.unobserve(entry.target);
  });
}, revealOptions);

reveals.forEach(reveal => revealOnScroll.observe(reveal));

/* 
   UPDATED DARK MODE TOGGLE (Switch Optimized)
*/
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

// Listen for clicks
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    html.classList.toggle('dark-mode');

    try {
      if (html.classList.contains('dark-mode')) {
        localStorage.setItem('lumina-theme', 'dark');
      } else {
        localStorage.setItem('lumina-theme', 'light');
      }
    } catch (e) {
      console.warn("Could not save theme preference to localStorage.", e);
    }
  });
}

// Dynamic Copyright Year
const yearElement = document.getElementById('current-year');
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

// Highlight Active Navigation Link
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage) {
    link.classList.add('active-page');
  }
});

/* 
   MOBILE HAMBURGER MENU LOGIC
  */
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

if (mobileToggle && navLinks) {
  mobileToggle.addEventListener('click', () => {
    const isActive = navLinks.classList.toggle('active');
    mobileToggle.innerHTML = isActive ? ICONS.close : ICONS.menu;
    mobileToggle.setAttribute('aria-expanded', isActive);
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