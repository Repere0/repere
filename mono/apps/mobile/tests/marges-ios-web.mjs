// Marges de sécurité de l'iPhone (12/11/2026, roadmap bêta) : rien ne passe sous la barre d'accueil.
// Chromium émule env(safe-area-inset-bottom) = 34 px (protocole DevTools, Emulation.setSafeAreaInsetsOverride).
// Ce n'est pas un iPhone : le contrôle prouve que l'application RESPECTE la marge quand le navigateur la donne.
// Usage : node apps/mobile/tests/marges-ios-web.mjs http://localhost:8812
import { createRequire } from "node:module";
const { chromium } = createRequire(process.cwd() + "/")("playwright");
const BASE = process.argv[2] || "http://localhost:8812";
const MARGE = 34;
let echecs = 0;
const ok = (c, m) => { console.log((c ? "ok    " : "ECHEC ") + m); if (!c) echecs++; };

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: "block" });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
try { await cdp.send("Emulation.setSafeAreaInsetsOverride", { insets: { top: 47, bottom: MARGE } }); }
catch (e) {
  /* Un Chromium trop ancien : on le dit, on n'invente pas un succès. */
  console.log("::warning::marges iOS : ce Chromium n'émule pas les marges de sécurité (" + String(e.message).split("\n")[0] + ") - contrôle NON joué");
  await nav.close(); process.exit(0);
}
const aller = async chemin => { await page.goto(BASE + chemin, { waitUntil: "load" }); await page.waitForTimeout(3500); };

await aller("/finances#meaux");
const lue = await page.evaluate(() => { const s = document.createElement("div"); s.style.cssText = "position:fixed;height:env(safe-area-inset-bottom)"; document.body.appendChild(s); const h = s.getBoundingClientRect().height; s.remove(); return h; });
ok(lue === MARGE, `le navigateur donne une marge basse de ${lue} px`);

const barre = await page.evaluate(() => {
  const H = window.innerHeight;
  const listes = [...document.querySelectorAll('[role="tablist"]')].map(e => ({ e, r: e.getBoundingClientRect(), n: e.querySelectorAll('[role="tab"]').length }));
  const basse = listes.filter(l => l.r.bottom > H - 140).pop();
  const segments = listes.filter(l => l !== basse).map(l => ({ hauteur: Math.round(l.r.height), pb: getComputedStyle(l.e).paddingBottom }));
  if (!basse) return { H, segments };
  let basTexte = 0;
  for (const t of basse.e.querySelectorAll("*")) { if (t.children.length || !(t.innerText || "").trim()) continue; basTexte = Math.max(basTexte, t.getBoundingClientRect().bottom); }
  const fond = basse.e.parentElement.getBoundingClientRect();
  return { H, basTexte: Math.round(basTexte), basFond: Math.round(fond.bottom), segments };
});
ok(barre.basTexte > 0 && barre.basTexte <= barre.H - MARGE, `barre basse : les libellés s'arrêtent à ${barre.basTexte} px, au-dessus de la zone protégée (${barre.H - MARGE} px)`);
ok(barre.basFond === barre.H, `barre basse : son fond descend jusqu'au bas de l'écran (${barre.basFond} / ${barre.H})`);
ok(barre.segments.length > 0 && barre.segments.every(s => parseFloat(s.pb) < MARGE && s.hauteur < 70), `contrôle segmenté : aucune marge de sécurité ajoutée (${JSON.stringify(barre.segments)})`);

/* Les écrans qui défilent sans barre basse : arrivé en bas, le dernier texte reste au-dessus de la zone protégée. */
for (const chemin of ["/elus", "/bienvenue", "/faq", "/confidentialite", "/confort-lecture", "/dictionnaire", "/quiz"]) {
  await aller(chemin);
  const m = await page.evaluate(async () => {
    const H = window.innerHeight;
    const s = [...document.querySelectorAll("*")].filter(e => /(auto|scroll)/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 4 && e.clientHeight > 300)
      .sort((a, b) => b.clientHeight - a.clientHeight)[0];
    if (!s) return { defile: false };
    s.scrollTop = s.scrollHeight; await new Promise(r => setTimeout(r, 500));
    let bas = 0;
    for (const e of s.querySelectorAll("*")) { if (e.children.length || !(e.innerText || "").trim()) continue; const b = e.getBoundingClientRect(); if (b.height && b.top < H) bas = Math.max(bas, b.bottom); }
    return { defile: true, bas: Math.round(bas), H };
  });
  ok(!m.defile || m.bas <= m.H - MARGE, m.defile ? `${chemin} : en bas de page, le dernier texte est à ${m.bas} px (zone protégée à ${m.H - MARGE} px)` : `${chemin} : tient sur un écran`);
}
await nav.close();
console.log(echecs ? `marges iOS : ${echecs} échec(s)` : "marges iOS : zéro échec");
process.exit(echecs ? 1 : 0);
