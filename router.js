export function initRouter(onPageChange) {
  document.addEventListener('click', async (e) => {
    const link = e.target.closest('a');
    
    // Only intercept internal standard links
    if (!link || link.target === '_blank') return;

    const linkUrl = new URL(link.href);
    const currentUrl = new URL(window.location.href);

    if (linkUrl.origin !== currentUrl.origin) return;
    if (linkUrl.pathname === currentUrl.pathname && linkUrl.hash) return;

    e.preventDefault(); 
    const targetPath = linkUrl.pathname + linkUrl.search + linkUrl.hash;

    if (!document.startViewTransition) {
      await updateDOM(targetPath, onPageChange);
    } else {
      document.startViewTransition(async () => {
        await updateDOM(targetPath, onPageChange);
      });
    }
  });

  window.addEventListener('popstate', () => {
    const path = window.location.pathname + window.location.search + window.location.hash;
    if (document.startViewTransition) {
      document.startViewTransition(() => updateDOM(path, onPageChange));
    } else {
      updateDOM(path, onPageChange);
    }
  });
}

async function updateDOM(targetPath, onPageChange) {
  try {
    const targetUrl = new URL(targetPath, window.location.origin);

    const response = await fetch(targetUrl.pathname + targetUrl.search);
    const html = await response.text();
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const newMain = doc.querySelector('main');
    const currentMain = document.querySelector('main');
    
    if (newMain && currentMain) {
      currentMain.innerHTML = newMain.innerHTML;
      currentMain.className = newMain.className;
    }

    document.title = doc.title;
    document.querySelectorAll('.nav-links a').forEach(navLink => {
      navLink.classList.remove('active-page');
      if (navLink.pathname === targetUrl.pathname) {
        navLink.classList.add('active-page');
      }
    });

    history.pushState(null, '', targetPath);

    if (targetUrl.hash) {
      const targetSection = document.querySelector(targetUrl.hash);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo(0, 0);
      }
    } else {
      window.scrollTo(0, 0);
    }

    if (onPageChange) onPageChange();

  } catch (error) {
    console.error('Router failed. Falling back to hard navigation.', error);
    window.location.href = targetPath;
  }
}