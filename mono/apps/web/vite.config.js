import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  /* PREACT A LA PLACE DE REACT.
   *
   * Mesure : le socle React pesait 141,8 Ko (45,4 Ko compresses), soit 82 % du
   * premier ecran d'un site dont l'argument est justement de peser 55 Ko. Repere
   * n'utilise de React que ce que preact/compat implemente : createRoot,
   * StrictMode, lazy, Suspense, les hooks d'etat et de memo. Rien n'est reecrit —
   * seul le module resolu change, et le banc navigateur (34 controles, dont le
   * hors-ligne et le theme sombre) mesure le resultat sur l'application reelle.
   *
   * Le JSX est compile par esbuild directement vers preact/jsx-runtime : c'est
   * ce qui permet de se passer de @vitejs/plugin-react, dont le prelude de
   * rafraichissement rapide est ecrit pour React et n'a plus rien a rafraichir
   * ici. En developpement, un fichier modifie recharge son module sans conserver
   * l'etat — c'est la seule chose perdue au change.
   *
   * Pour revenir a React : retablir `plugins: [react()]`, retirer ce bloc
   * `esbuild` et le bloc `alias`, reinstaller. Aucun fichier de l'application
   * n'a a changer. */
  esbuild: { jsx: "automatic", jsxImportSource: "preact" },
  resolve: {
    /* Un TABLEAU, pas un objet : les alias objet sont des remplacements de
       prefixe, et « react » y attrapait « react/jsx-runtime » avant l'entree
       prevue pour lui — ce qui donnait un « preact/compat/jsx-runtime » qui
       n'existe pas. Des expressions ancrees, du plus precis au plus general. */
    alias: [
      { find: /^react\/jsx-dev-runtime$/, replacement: "preact/jsx-dev-runtime" },
      { find: /^react\/jsx-runtime$/, replacement: "preact/jsx-runtime" },
      { find: /^react-dom\/client$/, replacement: "preact/compat/client" },
      { find: /^react-dom$/, replacement: "preact/compat" },
      { find: /^react$/, replacement: "preact/compat" },
    ],
  },
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
        /* Découpage manuel : le socle de rendu d'un côté, chaque écran de l'autre.
           Sans ça, ouvrir « Où va mon argent » téléchargerait aussi le code de
           tous les écrans que le lecteur n'ouvrira peut-être jamais. */
        manualChunks(id) {
          /* LE MOUVEMENT N'EST PAS DU SOCLE. framer-motion n'est importe que par
             les ecrans, qui sont eux-memes charges a la demande. Sans cette
             ligne, il tombait dans « socle » — le morceau que le PREMIER ecran
             telecharge — et le plafond de 120 Ko sautait pour une animation que
             personne n'a encore vue. Mesure du 29/08 : socle 19,5 Ko sans lui,
             et le morceau du mouvement ne part qu'au premier ecran ouvert. */
          /* Le morceau « mouvement » n'existe plus : framer-motion a ete retire le
             13/09/2026 (122 Ko, 40 Ko compresses, pour une apparition de carte).
             La regle est gardee vide volontairement : si une bibliotheque
             d'animation revenait un jour, elle ne devrait pas retomber dans le
             socle sans qu'on le decide. */
          if (/node_modules[\\/](framer-motion|motion|motion-dom|motion-utils)[\\/]/.test(id)) return "mouvement";
          if (id.includes("node_modules")) return "socle";
        },
      },
    },
  },
});
