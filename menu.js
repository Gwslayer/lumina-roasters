import menuData from './menu.json';
import { attachCursorEvents } from './cursor.js';

export function initMenu() {
  const menuGrid = document.getElementById('dynamic-menu-grid');
  
  if (menuGrid && menuGrid.children.length === 0) {
    
    // 1. SECURE DOM CONSTRUCTION
    menuData.forEach((coffee, index) => {
      const delay = index * 0.1;
      
      const itemDiv = document.createElement('div');
      itemDiv.className = 'menu-item interactive reveal';
      itemDiv.style.transitionDelay = `${delay}s`;

      const imgDiv = document.createElement('div');
      imgDiv.className = 'menu-image';
      const img = document.createElement('img');
      img.src = coffee.image; 
      img.alt = coffee.name;
      img.loading = 'lazy';
      img.width = 600;
      img.height = 400;
      imgDiv.appendChild(img);

      const detailsDiv = document.createElement('div');
      detailsDiv.className = 'menu-details';

      const headerDiv = document.createElement('div');
      headerDiv.className = 'menu-header';
      
      const nameSpan = document.createElement('span');
      nameSpan.className = 'item-name';
      nameSpan.textContent = coffee.name; 

      const priceSpan = document.createElement('span');
      priceSpan.className = 'item-price';
      priceSpan.textContent = coffee.price;

      headerDiv.appendChild(nameSpan);
      headerDiv.appendChild(priceSpan);

      const descP = document.createElement('p');
      descP.className = 'item-desc';
      descP.textContent = coffee.description;

      detailsDiv.appendChild(headerDiv);
      detailsDiv.appendChild(descP);
      itemDiv.appendChild(imgDiv);
      itemDiv.appendChild(detailsDiv);

      menuGrid.appendChild(itemDiv);
    });

    // 2. ANIMATION & CURSOR LOGIC
    attachCursorEvents();
    
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