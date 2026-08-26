import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  /* Les JSON départementaux sont servis tels quels, en dev comme en production :
     aucun serveur applicatif n'est nécessaire pour lire Repère (invariant 1). */
  publicDir: "public",
  server: {
    fs: { allow: [path.resolve("../..")] },
    proxy: {
      "/data": { target: "http://localhost:3001", changeOrigin: true },
    },
  },
  build: {
    target: "es2020",
    rollupOptions: {
      output: {
        /* Découpage manuel : le socle React d'un côté, chaque écran de l'autre.
           Sans ça, ouvrir « Où va mon argent » téléchargerait aussi le code de
           tous les écrans que le lecteur n'ouvrira peut-être jamais. */
        manualChunks(id) {
          if (id.includes("node_modules")) return "socle";
        },
      },
    },
  },
});
