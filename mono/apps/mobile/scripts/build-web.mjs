// npm run build:web : export web (dist/) + donnees + PWA. Sans variable d'environnement
// shell, pour fonctionner aussi sous Windows.
import { spawnSync } from "node:child_process";
import { existsSync, cpSync, rmSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { appliquer } from "./pwa.mjs";
import { miroir } from "./miroir-donnees.mjs";

const app = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(app, "dist");
const donnees = join(app, "..", "..", "data");
// Les donnees ne sont pas dans le depot : on les extrait du fichier autonome le plus recent, comme la CI
// (mobile.yml : app_repere_v18_*.html, sans .bak, tri par version). Aucun `pnpm` requis.
if (!existsSync(donnees)) {
  const racine = join(app, "..", "..", "..");
  const html = readdirSync(racine).filter(f => /^app_repere_v18_\d+\.html$/.test(f))
    .sort((a, b) => parseInt(a.match(/_(\d+)\.html/)[1], 10) - parseInt(b.match(/_(\d+)\.html/)[1], 10)).pop();
  if (!html) { console.error("Aucun app_repere_v18_*.html a la racine du depot : impossible d'extraire les donnees."); process.exit(1); }
  console.log("Extraction des donnees depuis " + html);
  const x = spawnSync(process.execPath, [join(app, "..", "..", "scripts", "extract-html.js"), join(racine, html), donnees], { stdio: "inherit" });
  if (x.status !== 0 || !existsSync(donnees)) { console.error("L'extraction des donnees a echoue."); process.exit(x.status || 1); }
}
const r = spawnSync("npx", ["expo", "export", "--platform", "web", "--output-dir", "dist"], {
  cwd: app, stdio: "inherit", shell: true,
  env: { ...process.env, EXPO_PUBLIC_REPERE_DONNEES: "/data", CI: "1", EXPO_OFFLINE: "1" },
});
if (r.status !== 0) process.exit(r.status || 1);
rmSync(join(dist, "data"), { recursive: true, force: true });
cpSync(donnees, join(dist, "data"), { recursive: true });
// La presidentielle est publiee dans data/ a la racine du depot (pas produite par l'extraction).
const pres = join(app, "..", "..", "..", "data", "presidentielle-2027");
if (existsSync(pres) && !existsSync(join(dist, "data", "presidentielle-2027"))) cpSync(pres, join(dist, "data", "presidentielle-2027"), { recursive: true });
const m = await miroir(join(dist, "data"));
console.log(`Donnees publiques completees : ${m.copies.length} fichier(s) copie(s)` + (m.manquants.length ? `, ${m.manquants.length} introuvable(s) : ${m.manquants.slice(0, 8).join(", ")}` : ""));
appliquer(app, dist);
console.log("PWA prete dans apps/mobile/dist");
