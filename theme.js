// theme.js
export function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

  // We don't need to check localStorage here because your HTML <head> already does it!
  
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
}