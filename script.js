import menuData from './menu.json';

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
let dotScale = 1;
let ringScale = 1;
let isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

document.addEventListener('mousemove', (e) => {
  if (isTouchDevice) return;
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateCursor() {
  if (isTouchDevice) return;

  ringX += (mouseX - ringX) * 0.18;
  ringY += (mouseY - ringY) * 0.18;

  // USE TRANSLATE3D: Offloads calculation to GPU
  if (dot) {
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) scale(${dotScale})`;
  }
  if (ring) {
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(${ringScale})`;
  }

  requestAnimationFrame(animateCursor);
}

if (!isTouchDevice) {
  animateCursor();
}

/*
   MASTER INITIALIZATION FUNCTION
   Groups dynamic events so they can be re-triggered after page routing
*/
function initDynamicInteractions() {
  
  /* 
     DYNAMIC API: MENU DATA INJECTION
     */
  const menuGrid = document.getElementById('dynamic-menu-grid');
  
  // Only fetch if we are on the menu page and the grid is empty
  if (menuGrid && menuGrid.children.length === 0) {
    // Loop through the imported JSON data and build HTML for each coffee
    menuData.forEach((coffee, index) => {
      const delay = index * 0.1; // Staggers the fade-in animation
      
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
      // Inject the newly built HTML into the page
      menuGrid.insertAdjacentHTML('beforeend', htmlTemplate);
    });

    // CRITICAL: Now that new HTML exists, re-attach the custom cursor to it!
    attachCursorEvents();
    
    // Re-attach scroll reveals to the new items
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

  // --- Helper Function to re-attach Cursor Hover States ---
  function attachCursorEvents() {
    document.querySelectorAll('.interactive, a').forEach(el => {
      if (el.dataset.cursorAttached) return;
      el.dataset.cursorAttached = 'true';

      el.addEventListener('mouseenter', () => {
        if (isTouchDevice) return;
        dotScale = 0.5;
        ringScale = 1.4;
        if (ring) {
          ring.style.backgroundColor = document.documentElement.classList.contains('dark-mode') 
            ? 'rgba(243, 241, 236, 0.1)' 
            : 'rgba(44, 38, 33, 0.05)';
          ring.style.borderColor = 'transparent';
        }
      });
      el.addEventListener('mouseleave', () => {
        if (isTouchDevice) return;
        dotScale = 1;
        ringScale = 1;
        if (ring) {
          ring.style.backgroundColor = 'transparent';
          ring.style.borderColor = document.documentElement.classList.contains('dark-mode')
            ? 'rgba(243, 241, 236, 0.4)'
            : 'rgba(44, 38, 33, 0.4)';
        }
      });
    });
  }

  // Ensure cursor works for elements already on the page
  attachCursorEvents();

  /*
     (The rest of your existing initDynamicInteractions code goes here...
      like the scroll reveals and Web3Forms pipeline)
  */
  

  // 2. RE-ATTACH SCROLL REVEALS
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

  // 3. RE-ATTACH WEB3FORMS PIPELINE (Only runs if the form exists on the current page)
  const reservationForm = document.querySelector('.reservation-form');
  const popupOverlay = document.getElementById('reservation-popup');
  const closePopupBtn = document.getElementById('close-popup');

  if (reservationForm && popupOverlay) {
    reservationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = reservationForm.querySelector('.submit-btn');
      const originalText = submitBtn.innerHTML;

      submitBtn.innerHTML = 'Securing Table...';
      submitBtn.disabled = true;

      const formData = new FormData(reservationForm);
      const formObject = Object.fromEntries(formData);

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(formObject)
      })
        .then(async (res) => {
          if (res.status === 200) {
            popupOverlay.classList.add('active');
            popupOverlay.setAttribute('aria-hidden', 'false');
            reservationForm.reset();
          } else {
            alert("Something went wrong. Please check fields and resubmit.");
          }
        })
        .catch((err) => {
          console.error("Pipeline error:", err);
          alert("A system network error occurred. Please test your internet link.");
        })
        .finally(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        });
    });

    if (closePopupBtn) {
      closePopupBtn.addEventListener('click', () => {
        popupOverlay.classList.remove('active');
        popupOverlay.setAttribute('aria-hidden', 'true');
      });
    }

    popupOverlay.addEventListener('click', (e) => {
      if (e.target === popupOverlay) {
        popupOverlay.classList.remove('active');
        popupOverlay.setAttribute('aria-hidden', 'true');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && popupOverlay.classList.contains('active')) {
        popupOverlay.classList.remove('active');
        popupOverlay.setAttribute('aria-hidden', 'true');
      }
    }, { once: true });
  }
}

// Boot up interactions on initial load
initDynamicInteractions();

/* 
   SEAMLESS PAGE ROUTER (View Transitions API)
   */
document.addEventListener('click', async (e) => {
  const link = e.target.closest('a');
  
  // Only intercept internal standard links
  if (!link || link.target === '_blank') return;

  const linkUrl = new URL(link.href);
  const currentUrl = new URL(window.location.href);

  // 1. Ignore external links
  if (linkUrl.origin !== currentUrl.origin) return;

  // 2. If it's an anchor link to a section on the EXACT SAME page, let the browser scroll naturally
  if (linkUrl.pathname === currentUrl.pathname && linkUrl.hash) {
    return; 
  }

  // 3. For all other internal routing, intercept the click and prevent white flashes
  e.preventDefault(); 
  const targetPath = linkUrl.pathname + linkUrl.search + linkUrl.hash;

  if (!document.startViewTransition) {
    await updateDOM(targetPath);
  } else {
    document.startViewTransition(async () => {
      await updateDOM(targetPath);
    });
  }
});

async function updateDOM(targetPath) {
  try {
    const targetUrl = new URL(targetPath, window.location.origin);

    // Fetch the new HTML file (we ignore the hash for the network fetch)
    const response = await fetch(targetUrl.pathname + targetUrl.search);
    const html = await response.text();
    
    // Parse virtual DOM
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract and swap the <main> block
    const newMain = doc.querySelector('main');
    const currentMain = document.querySelector('main');
    
    if (newMain && currentMain) {
      currentMain.innerHTML = newMain.innerHTML;
      currentMain.className = newMain.className;
    }

    // Update document title and active nav underlines
    document.title = doc.title;
    document.querySelectorAll('.nav-links a').forEach(navLink => {
      navLink.classList.remove('active-page');
      if (navLink.pathname === targetUrl.pathname) {
        navLink.classList.add('active-page');
      }
    });

    // Push URL to browser history
    history.pushState(null, '', targetPath);

    // SCROLL INTELLIGENCE: Check if the link had a #hash attached
    if (targetUrl.hash) {
      // Find the specific section and glide to it
      const targetSection = document.querySelector(targetUrl.hash);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo(0, 0);
      }
    } else {
      // Standard page load: scroll to the very top
      window.scrollTo(0, 0);
    }

    // CRITICAL: Re-run our master function to attach cursor to the new HTML!
    initDynamicInteractions();

  } catch (error) {
    console.error('Router failed. Falling back to hard navigation.', error);
    window.location.href = targetPath;
  }
}

// Handle the browser's Native Back/Forward buttons
window.addEventListener('popstate', () => {
  const path = window.location.pathname + window.location.search + window.location.hash;
  if (document.startViewTransition) {
    document.startViewTransition(() => updateDOM(path));
  } else {
    updateDOM(path);
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
    navLinks.classList.toggle('active');
    mobileToggle.innerHTML = navLinks.classList.contains('active') ? ICONS.close : ICONS.menu;
  });

  const links = navLinks.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      mobileToggle.innerHTML = ICONS.menu;
    });
  });
}

// THEME TOGGLE LOGIC
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

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
      console.warn("Could not save theme.", e);
    }
  });
}