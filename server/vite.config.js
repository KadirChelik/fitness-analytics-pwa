import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'; // 👈 İMPORT ET

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Güncelleme gelince otomatik yenile
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'], // Önbelleğe alınacak ek dosyalar
      manifest: {
        name: 'KN Fitness Pro', // Uygulamanın Tam Adı
        short_name: 'KN Fitness', // Ana ekranda görünecek kısa ad
        description: 'Kişisel Antrenman ve Takip Uygulaması',
        theme_color: '#ffffff', // Üst bar rengi
        background_color: '#ffffff', // Açılış ekranı rengi
        display: 'standalone', // Tarayıcı çubuğunu gizle (App gibi görün)
        orientation: 'portrait', // Dikey modda kitle
        icons: [
          {
            src: 'pwa-192x192.png', // Birazdan bu ikonları oluşturacağız
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' // Android için yuvarlak ikon desteği
          }
        ]
      }
    })
  ],
});