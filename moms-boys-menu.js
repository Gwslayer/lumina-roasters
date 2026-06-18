import menuData from './moms-boys-menu.json';
import { attachCursorEvents } from './cursor.js';

export function initMenu() {
  const menuBoard = document.getElementById('dynamic-menu-board');
  
  if (menuBoard && menuBoard.children.length === 0) {
    
    // 1. SECURE DOM CONSTRUCTION (CATEGORY LAYER)
    menuData.forEach((categoryData, catIndex) => {
      const section = document.createElement('section');
      section.className = 'menu-category reveal';
      section.style.transitionDelay = `${catIndex * 0.1}s`;
      
      const h2 = document.createElement('h2');
      h2.textContent = categoryData.category;
      section.appendChild(h2);

      const menuGrid = document.createElement('div');
      menuGrid.className = 'menu-grid';

      categoryData.items.forEach((item, itemIndex) => {
        const delay = (itemIndex * 0.1) + 0.1;
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'menu-item interactive reveal';
        itemDiv.style.transitionDelay = `${delay}s`;

        const imgDiv = document.createElement('div');
        imgDiv.className = 'menu-image';
        const img = document.createElement('img');
        img.src = item.image; 
        img.alt = item.name;
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
        nameSpan.textContent = item.name; 

        const priceSpan = document.createElement('span');
        priceSpan.className = 'item-price';
        priceSpan.textContent = item.price;

        headerDiv.appendChild(nameSpan);
        headerDiv.appendChild(priceSpan);

        const descP = document.createElement('p');
        descP.className = 'item-desc';
        descP.textContent = item.description;

        detailsDiv.appendChild(headerDiv);
        detailsDiv.appendChild(descP);
        itemDiv.appendChild(imgDiv);
        itemDiv.appendChild(detailsDiv);

        menuGrid.appendChild(itemDiv);
      });

      section.appendChild(menuGrid);
      menuBoard.appendChild(section);
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