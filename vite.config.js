import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),

    // Genera y registra el Service Worker al compilar la aplicación.
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',

      // Usa el manifest creado en la carpeta public.
      manifest: false,

      // Guarda los archivos principales y mantiene disponibles las rutas de React.
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2,webmanifest}'],
        navigateFallback: '/index.html',

        // Configura la caché de los datos e imágenes externos.
        runtimeCaching: [
          {
            // Busca datos nuevos y recurre a la copia guardada si falla la red.
            urlPattern: /^https:\/\/pokeapi\.co\/api\/v2\//i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pokeapi-responses',
              networkTimeoutSeconds: 5,

              // Conserva hasta 250 respuestas durante siete días.
              expiration: {
                maxEntries: 250,
                maxAgeSeconds: 7 * 24 * 60 * 60,
              },

              // Acepta respuestas correctas y las respuestas opacas del navegador.
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Usa primero los sprites guardados y descarga los que todavía no están en caché.
            urlPattern:
              /^https:\/\/raw\.githubusercontent\.com\/PokeAPI\/sprites\//i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pokemon-sprites',

              // Conserva hasta 300 imágenes durante treinta días.
              expiration: {
                maxEntries: 300,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
});
