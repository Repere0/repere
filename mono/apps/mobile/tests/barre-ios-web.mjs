// La barre basse reste ancrée en bas, le document ne défile pas (iPhone Safari, 12/11/2026) et « Copier le lien » est visible
// en bas de chaque écran. Usage : node apps/mobile/tests/barre-ios-web.mjs http://localhost:8811
import { createRequire } from "node:module";
const { chromium } = createRequire(process.cwd() + "/")("playwright");
const BASE = process.argv[2] || "http://localhost:8811";
let echecs = 0;
const ok = (c, m) => { console.log((c ? "ok    " : "ECHEC ") + m); if (!c) echecs++; };
const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 390, height: 664 }, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
await page.addInitScript(() => localStorage.setItem("repere.profil", JSON.stringify({ tailleTexte: 16, espacement: 1.5, contraste: "normal", policeDyslexie: false, animationsReduites: true, modeDaltonien: false, masquerImages: false })));
await page.goto(BASE + "/finances#meaux", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
const mesure = () => page.evaluate(() => {
  const barre = [...document.querySelectorAll('[role="tablist"]')].pop();
  const r = barre ? barre.getBoundingClientRect() : null;
  return { bas: r ? Math.round(r.bottom) : null, haut: window.innerHeight, defile: Math.round(document.scrollingElement.scrollTop), doc: document.scrollingElement.scrollHeight };
});
ok(!!(await mesure()).bas, "la barre basse est là");
const avant = await mesure();
ok(avant.bas === avant.haut, `la barre touche le bas de l'écran visible (${avant.bas} / ${avant.haut})`);
await page.mouse.move(200, 300);
await page.mouse.wheel(0, 3000); await page.waitForTimeout(500);
await page.evaluate(() => window.scrollTo(0, 5000)); await page.waitForTimeout(300);
const apres = await mesure();
ok(apres.defile === 0 && apres.bas === apres.haut, `après défilement, le document n'a pas bougé et la barre reste en bas (${JSON.stringify(apres)})`);
await page.getByRole("button", { name: "Copier le lien de cette page" }).last().scrollIntoViewIfNeeded();
ok(await page.getByRole("button", { name: "Copier le lien de cette page" }).last().isVisible(), "« Copier le lien » est visible en bas de l'écran");
await nav.close();
console.log(echecs ? `barre iOS : ${echecs} échec(s)` : "barre iOS : zéro échec");
process.exit(echecs ? 1 : 0);
