const { chromium } = require("playwright");
const E = require("fs").readFileSync(__dirname + "/sonde.cjs", "utf8").match(/const ECRANS = (\[[\s\S]*?\]);/)[1];
const ECRANS = eval(E).filter(([, r]) => !r.startsWith("@"));
(async () => { const nav = await chromium.launch(); const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.addInitScript(() => { localStorage.setItem("repere.profil", JSON.stringify({ tailleTexte: 16, espacement: 1.5, prenom: "Test", onboardingVu: true, mode: "clair" })); localStorage.setItem("repere.departement", JSON.stringify({ d: "77", c: "77288" })); });
  const p = await ctx.newPage();
  for (const [n, u] of ECRANS) { await p.goto("http://localhost:8811" + u); await p.waitForTimeout(2500);
    const r = await p.evaluate(() => { const vis = e => { const b = e.getBoundingClientRect(); return b.width && b.height && b.top < 70 && b.top >= 0; };
      const els = [...document.querySelectorAll("[role=button],[role=link],a,button")].filter(vis).filter(e => !e.closest("[aria-hidden=true]"));
      const hd = [...document.querySelectorAll("[role=heading],h1,h2")].filter(e => e.innerText.trim()).map(e => (e.getAttribute("aria-level") || e.tagName) + ":" + e.innerText.trim().slice(0, 30)).slice(0, 2);
      const tab = [...document.querySelectorAll("[role=tab],[role=tablist] *")].some(e => /Qui décide/.test(e.innerText||"") && e.getBoundingClientRect().top > 700);
      return { haut: els.map(e => (e.getAttribute("aria-label") || e.innerText).replace(/\s+/g, " ").slice(0, 45) + "@" + Math.round(e.getBoundingClientRect().left)), titres: hd, barreOnglets: tab }; });
    console.log(n.padEnd(20), JSON.stringify(r)); }
  await nav.close(); })();
