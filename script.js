const dot = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');

let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
});

function animateRing() {
    ringX += (mouseX - ringX) * 0.2;
    ringY += (mouseY - ringY) * 0.2;

    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';

    requestAnimationFrame(animateRing);
}
animateRing();

const interactives = document.querySelectorAll('.interactive, a');
interactives.forEach(el => {
    el.addEventListener('mouseenter', () => {
        ring.classList.add('active');
        dot.style.transform = 'translate(-50%, -50%) scale(0.5)';
    });
    el.addEventListener('mouseleave', () => {
        ring.classList.remove('active');
        dot.style.transform = 'translate(-50%, -50%) scale(1)';
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
    
    if (html.classList.contains('dark-mode')) {
      localStorage.setItem('lumina-theme', 'dark');
    } else {
      localStorage.setItem('lumina-theme', 'light');
    }
  });
}