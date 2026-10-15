import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  // Vercel sets VERCEL_ENV to preview/production. Expose only this non-secret
  // environment label so the local demo cannot be enabled on Production by mistake.
  define: {
    "import.meta.env.VITE_VERCEL_ENV": JSON.stringify(process.env.VERCEL_ENV ?? "")
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: "/index.html"
      },
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "DayFlow — PALMI-D3V",
        short_name: "DayFlow",
        id: "/dayflow",
        start_url: "/",
        scope: "/",
        description: "Plan, do, track, remember.",
        theme_color: "#0A0C10",
        background_color: "#0A0C10",
        display: "standalone",
        orientation: "portrait-primary",
        icons: [
          { src: "/pwa-192.svg", sizes: "192x192", type: "image/svg+xml", purpose: "any maskable" },
          { src: "/pwa-512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any maskable" }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        // Keep Firebase's SDK surface in cacheable vendor chunks rather than
        // merging it into the DayFlow application entry.
        manualChunks(id) {
          if (id.includes("/node_modules/@firebase/firestore/")) return "firebase-firestore";
          if (id.includes("/node_modules/@firebase/auth/")) return "firebase-auth";
          if (id.includes("/node_modules/@firebase/")) return "firebase-shared";
        }
      }
    }
  }
});
