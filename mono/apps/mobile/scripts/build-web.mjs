// npm run build:web : export web (dist/) + donnees + PWA. Sans variable d'environnement
// shell, pour fonctionner aussi sous Windows.
import { spawnSync } from "node:child_process";
import { existsSync, cpSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { appliquer } from "./pwa.mjs";

const app = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(app, "dist");
const donnees = join(app, "..", "..", "data");
if (!existsSync(donnees)) {
  console.error("mono/data est absent : lancez d'abord `pnpm extract` dans mono/ (les donnees ne sont pas dans le depot).");
  process.exit(1);
}
const r = spawnSync("npx", ["expo", "export", "--platform", "web", "--output-dir", "dist"], {
  cwd: app, stdio: "inherit", shell: true,
  env: { ...process.env, EXPO_PUBLIC_REPERE_DONNEES: "/data", CI: "1", EXPO_OFFLINE: "1" },
});
if (r.status !== 0) process.exit(r.status || 1);
rmSync(join(dist, "data"), { recursive: true, force: true });
cpSync(donnees, join(dist, "data"), { recursive: true });
appliquer(app, dist);
console.log("PWA prete dans apps/mobile/dist");
