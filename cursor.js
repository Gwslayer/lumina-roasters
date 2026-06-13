let dotScale = 1;
let ringScale = 1;
let isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
let dot, ring;

export function initCursor() {
  dot = document.getElementById('cursor-dot');
  ring = document.getElementById('cursor-ring');
  
  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', (e) => {
    if (isTouchDevice) return;
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    if (isTouchDevice) return;

    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;

    if (dot) dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) scale(${dotScale})`;
    if (ring) ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(${ringScale})`;

    requestAnimationFrame(animateCursor);
  }

  if (!isTouchDevice) {
    animateCursor();
  }
}

export function attachCursorEvents() {
  if (isTouchDevice) return;
  
  document.querySelectorAll('.interactive, a').forEach(el => {
    if (el.dataset.cursorAttached) return;
    el.dataset.cursorAttached = 'true';

    el.addEventListener('mouseenter', () => {
      dotScale = 0.5;
      ringScale = 1.4;
      if (ring) {
        ring.style.backgroundColor = document.documentElement.classList.contains('dark-mode') 
          ? 'rgba(243, 241, 236, 0.1)' : 'rgba(44, 38, 33, 0.05)';
        ring.style.borderColor = 'transparent';
      }
    });
    
    el.addEventListener('mouseleave', () => {
      dotScale = 1;
      ringScale = 1;
      if (ring) {
        ring.style.backgroundColor = 'transparent';
        ring.style.borderColor = document.documentElement.classList.contains('dark-mode')
          ? 'rgba(243, 241, 236, 0.4)' : 'rgba(44, 38, 33, 0.4)';
      }
    });
  });
}