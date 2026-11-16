const { chromium } = require("playwright"); const fs = require("fs");
const [BASE, OUT] = process.argv.slice(2); fs.mkdirSync(OUT, { recursive: true });
const E = [["accueil","/"],["qui-decide","/qui-decide"],["finances","/finances"],["elus","/elus"],["vote","/vote"],["scrutins","/scrutins"],["a-venir","/a-venir"],["presidentielle-2027","/presidentielle-2027"],["recherche","/recherche"],["dictionnaire","/dictionnaire"]];
(async () => {
  const nav = await chromium.launch(); const res = {};
  for (const cas of ["lent", "panne"]) {
    const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await ctx.addInitScript(() => { localStorage.setItem("repere.profil", JSON.stringify({ tailleTexte: 16, espacement: 1.5, prenom: "Test", onboardingVu: true, mode: "clair" })); localStorage.setItem("repere.departement", JSON.stringify({ d: "77", c: "77288" }));
      window.__cls = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls.push([Math.round(e.startTime), +e.value.toFixed(3), e.sources?.map(s => (s.node?.innerText || s.node?.nodeName || "").slice(0, 40)).join(" | ")]); }).observe({ type: "layout-shift", buffered: true }); } catch {} });
    await ctx.route(/\/data\//, async r => { if (cas === "panne") return r.abort(); await new Promise(x => setTimeout(x, 4000)); return r.continue(); });
    const p = await ctx.newPage();
    for (const [n, u] of E) {
      await p.goto(BASE + u, { waitUntil: "domcontentloaded" });
      await p.waitForTimeout(1500);
      const t1 = await p.evaluate(() => document.body.innerText.replace(/\s+/g, " ").slice(0, 260));
      await p.screenshot({ path: `${OUT}/${n}-${cas}.jpg`, type: "jpeg", quality: 65 });
      await p.waitForTimeout(cas === "lent" ? 5000 : 2500);
      const cls = await p.evaluate(() => window.__cls);
      const t2 = await p.evaluate(() => document.body.innerText.replace(/\s+/g, " ").slice(0, 260));
      (res[n] ||= {})[cas] = { t1, t2, cls };
      if (cas === "panne") await p.screenshot({ path: `${OUT}/${n}-${cas}-fin.jpg`, type: "jpeg", quality: 65 });
      console.log(cas, n);
    }
    await ctx.close();
  }
  await nav.close(); fs.writeFileSync(`${OUT}/etats.json`, JSON.stringify(res, null, 1));
})();
