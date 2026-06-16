import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    // Installable PWA. We register the service worker manually in main.tsx
    // (CSP-safe) and only precache built static assets — API calls to Firebase
    // and Gemini always hit the network, never the cache.
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: null,
      includeAssets: ["favicon.svg", "contour.svg", "robots.txt"],
      manifest: {
        name: "Prithvi — Carbon Intelligence",
        short_name: "Prithvi",
        description: "Understand, track and reduce your personal carbon footprint. Built for India.",
        theme_color: "#15603F",
        background_color: "#F6F3EC",
        display: "standalone",
        start_url: "/",
        icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,woff2,png,ico,txt}"],
        navigateFallback: "/index.html",
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          firebase: [
            "firebase/app",
            "firebase/auth",
            "firebase/firestore",
            "firebase/functions",
            "firebase/app-check",
          ],
          charts: ["recharts"],
          motion: ["framer-motion"],
        },
      },
    },
  },
});
