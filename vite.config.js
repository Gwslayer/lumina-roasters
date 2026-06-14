import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        menu: 'menu.html',
        visit: 'visit.html'
      }
    }
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate', 
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,json}'] 
      },
      manifest: {
        name: 'Lumina Roasters',
        short_name: 'Lumina',
        description: 'Premium coffee roastery in Ahmedabad',
        theme_color: '#0b1120', 
        background_color: '#F9F8F6', 
        display: 'standalone', 
        icons: [
          {
            src: 'https://www.svgrepo.com/show/301594/coffee.svg', 
            sizes: '192x192',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ]
});