import menuData from './menu.json';
import { attachCursorEvents } from './cursor.js';

export function initMenu() {
  const menuGrid = document.getElementById('dynamic-menu-grid');
  
  if (menuGrid && menuGrid.children.length === 0) {
    menuData.forEach((coffee, index) => {
      const delay = index * 0.1;
      
      const htmlTemplate = `
        <div class="menu-item interactive reveal" style="transition-delay: ${delay}s">
            <div class="menu-image">
                <img src="${coffee.image}" alt="${coffee.name}" loading="lazy" width="600" height="400">
            </div>
            <div class="menu-details">
                <div class="menu-header">
                    <span class="item-name">${coffee.name}</span>
                    <span class="item-price">${coffee.price}</span>
                </div>
                <p class="item-desc">${coffee.description}</p>
            </div>
        </div>
      `;
      menuGrid.insertAdjacentHTML('beforeend', htmlTemplate);
    });

    // Re-attach cursor to the newly injected HTML
    attachCursorEvents();
    
    // Setup scroll reveals for the new items
    const newReveals = document.querySelectorAll('.reveal');
    const revealOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };
    const revealOnScroll = new IntersectionObserver(function (entries, observer) {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      });
    }, revealOptions);
    newReveals.forEach(reveal => revealOnScroll.observe(reveal));
  }
}