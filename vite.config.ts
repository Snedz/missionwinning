import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ command }) => ({
  server: {
    headers: {
      "Cache-Control": "no-store",
    },
  },
  plugins: [
    react(),
    // PWA only for production builds — dev/preview SW was serving stale JS (6 old templates)
    ...(command === "build"
      ? [
          VitePWA({
            registerType: "autoUpdate",
            includeAssets: ["favicon.svg", "apple-touch-icon.png"],
            manifest: {
              name: "Mission Winning",
              short_name: "Mission Winning",
              description: "The all-in-one global health & workout app. Free tracker, premium education programs, nutrition logging, and elite training tools. Train anywhere. Win daily.",
              theme_color: "#0f172a",
              background_color: "#0a0f1a",
              display: "standalone",
              orientation: "portrait",
              start_url: "/log",
              icons: [
                {
                  src: "pwa-192x192.png",
                  sizes: "192x192",
                  type: "image/png",
                },
                {
                  src: "pwa-512x512.png",
                  sizes: "512x512",
                  type: "image/png",
                },
                {
                  src: "pwa-512x512.png",
                  sizes: "512x512",
                  type: "image/png",
                  purpose: "any maskable",
                },
              ],
            },
            workbox: {
              globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
              runtimeCaching: [
                {
                  urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                  handler: "CacheFirst",
                  options: {
                    cacheName: "google-fonts-cache",
                    expiration: {
                      maxEntries: 10,
                      maxAgeSeconds: 60 * 60 * 24 * 365,
                    },
                  },
                },
              ],
            },
          }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
