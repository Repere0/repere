// Sonde d'audit UI (hors dépôt). node sonde.cjs <base> <sortie>
const fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const [BASE, OUT] = process.argv.slice(2);
const ECRANS = [
  ["accueil", "/"], ["qui-decide", "/qui-decide"], ["chez-vous", "/chez-vous"], ["finances", "/finances"], ["argent", "/argent"],
  ["a-venir", "/a-venir"], ["elus", "/elus"], ["elu", "/elu?nom=Arnaud%20Saint-Martin&role=D%C3%A9put%C3%A9&echelon=france&niveau=Assembl%C3%A9e%20nationale&institution=Assembl%C3%A9e%20nationale&lieu="], ["annuaire-fiche", "/annuaire-fiche?nom=Adrien%20Delacroix&fonction=Conseiller%20r%C3%A9gional&lieu=R%C3%A9gion%20%C3%8Ele-de-France"], ["groupe", "/groupe"],
  ["scrutins", "/scrutins"], ["qag", "/scrutins?mode=qag"], ["vote", "/vote"], ["presidentielle-2027", "/presidentielle-2027"],
  ["pour-vous", "/pour-vous"], ["sources", "/sources"], ["confort-lecture", "/confort-lecture"], ["actus", "/actus"],
  ["repere-du-jour", "/repere-du-jour"], ["dictionnaire", "/dictionnaire"], ["quiz", "/quiz"], ["recherche", "/recherche"],
  ["procedure", "/procedure"], ["partager", "/partager"], ["faq", "/faq"], ["a-propos", "/a-propos"],
  ["confidentialite", "/confidentialite"], ["soutenir", "/soutenir"], ["bienvenue", "@bienvenue"],
];

function mesurer() {
  const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const rgba = s => { const m = s.match(/[\d.]+/g); return m ? m.map(Number) : [0, 0, 0, 0]; };
  const fond = el => { let c = [255, 255, 255], pile = []; for (let e = el; e; e = e.parentElement) { const s = getComputedStyle(e); if (s.backgroundImage !== "none") return null; const b = rgba(s.backgroundColor); if (b.length < 4 || b[3] > 0) pile.push(b.length < 4 ? [...b, 1] : b); if (pile.length && pile.at(-1)[3] >= 1) break; } for (const b of pile.reverse()) c = c.map((v, i) => v * (1 - b[3]) + b[i] * b[3]); return c; };
  const ratio = (a, b) => { const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x); return (l1 + 0.05) / (l2 + 0.05); };
  const visible = el => { const r = el.getBoundingClientRect(), s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && Number(s.opacity) > 0; };
  const court = t => t.replace(/\s+/g, " ").trim().slice(0, 50);
  const H = innerHeight;
  const r = { petit: [], contraste: [], cible: [], sansNom: [], tailles: {}, lhFaible: [], pave: [], horsGrille: 0, espacesTotal: 0, valeursHors: {}, proches: [], imgSansAlt: [], bordureFaible: [], liensNonDistincts: [], premierEcran: {}, debordement: document.documentElement.scrollWidth > innerWidth ? document.documentElement.scrollWidth : 0, retour: null };
  const vus = new Set(); let mots1 = 0, plusGrand = { px: 0, t: "" };
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = w.nextNode());) {
    const t = n.textContent.trim(), el = n.parentElement;
    if (!t || !el || vus.has(el) || !visible(el) || el.closest("[aria-hidden=true]")) continue;
    vus.add(el);
    const s = getComputedStyle(el), px = parseFloat(s.fontSize), b = el.getBoundingClientRect();
    r.tailles[Math.round(px)] = (r.tailles[Math.round(px)] || 0) + 1;
    if (b.top < H) { mots1 += t.split(/\s+/).length; if (px > plusGrand.px) plusGrand = { px, t: court(t) }; }
    if (px < 12) r.petit.push(`${px}px « ${court(t)} »`);
    const lh = s.lineHeight === "normal" ? px * 1.2 : parseFloat(s.lineHeight);
    const lignes = Math.round(b.height / lh);
    if (px <= 18 && lignes >= 2 && lh / px < 1.35) r.lhFaible.push(`${(lh / px).toFixed(2)} (${px}px) « ${court(t)} »`);
    if (lignes > 4 && t.length > 220) r.pave.push(`${lignes} lignes « ${court(t)} »`);
    const f = fond(el);
    if (f) { const c = rgba(s.color), a = c.length < 4 ? 1 : c[3], m = c.slice(0, 3).map((v, i) => v * a + f[i] * (1 - a)); const q = ratio(m, f); const grand = px >= 24 || (px >= 18.66 && Number(s.fontWeight) >= 700); if (q < (grand ? 3 : 4.5) - 0.01) r.contraste.push(`${q.toFixed(2)}:1 (${Math.round(px)}px) « ${court(t)} »`); }
  }
  r.premierEcran = { mots: mots1, plusGrand };
  const inter = [...document.querySelectorAll("a[href],button,[role=button],[role=link],[role=tab],[role=switch],[role=checkbox],[role=radio],input,textarea,[tabindex='0']")].filter(el => visible(el) && !el.closest("[aria-hidden=true]"));
  r.nInteractifs = inter.length; r.nInteractifs1 = inter.filter(e => e.getBoundingClientRect().top < H).length;
  const boites = [];
  for (const el of inter) {
    const b = el.getBoundingClientRect(), nom = (el.getAttribute("aria-label") || el.innerText || el.getAttribute("placeholder") || "").trim();
    if (b.width < 43.5 || b.height < 43.5) r.cible.push(`${Math.round(b.width)}x${Math.round(b.height)} « ${court(nom)} »`);
    if (!nom) r.sansNom.push(`${el.tagName.toLowerCase()} ${Math.round(b.width)}x${Math.round(b.height)}`);
    if (/retour/i.test(nom) && !r.retour) r.retour = { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) };
    boites.push([el, b, nom]);
  }
  for (let i = 0; i < boites.length; i++) for (let j = i + 1; j < boites.length; j++) {
    const [e1, a] = boites[i], [e2, c] = boites[j];
    if (e1.contains(e2) || e2.contains(e1)) continue;
    const dx = Math.max(0, Math.max(a.left, c.left) - Math.min(a.right, c.right)), dy = Math.max(0, Math.max(a.top, c.top) - Math.min(a.bottom, c.bottom));
    const chevauche = dx === 0 && dy === 0;
    const d = Math.max(dx, dy);
    if (!chevauche && d < 8 && (dx === 0 || dy === 0)) r.proches.push(`${d.toFixed(0)}px « ${court(boites[i][2])} » / « ${court(boites[j][2])} »`);
  }
  // espacements
  for (const el of document.querySelectorAll("body *")) {
    if (!visible(el)) continue; const s = getComputedStyle(el);
    for (const p of ["paddingTop", "paddingBottom", "paddingLeft", "paddingRight", "marginTop", "marginBottom", "rowGap", "columnGap"]) {
      const v = parseFloat(s[p]); if (!v || isNaN(v) || v < 0) continue; r.espacesTotal++;
      if (Math.abs(v - Math.round(v / 4) * 4) > 0.5) { r.horsGrille++; r.valeursHors[v] = (r.valeursHors[v] || 0) + 1; }
    }
  }
  for (const im of document.querySelectorAll("img")) if (visible(im) && !im.closest("[aria-hidden=true]") && !im.hasAttribute("alt")) r.imgSansAlt.push(im.src.slice(-40));
  for (const im of document.querySelectorAll("[role=img]")) if (visible(im) && !im.closest("[aria-hidden=true]") && !im.getAttribute("aria-label")) r.imgSansAlt.push("role=img sans nom");
  // liens dans du texte : couleur = texte voisin et pas souligné
  for (const a of document.querySelectorAll("[role=link],a[href]")) {
    if (!visible(a)) continue; const p = a.parentElement; if (!p) continue;
    const sa = getComputedStyle(a), sp = getComputedStyle(p);
    if (sp.display.includes("inline") || sa.display.includes("inline")) { if (sa.color === sp.color && !sa.textDecorationLine.includes("underline") && sa.fontWeight === sp.fontWeight) r.liensNonDistincts.push(court(a.innerText)); }
  }
  for (const k of ["petit", "contraste", "cible", "sansNom", "lhFaible", "pave", "proches", "imgSansAlt", "liensNonDistincts"]) r[k] = [...new Set(r[k])];
  return r;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const nav = await chromium.launch();
  const bilan = {};
  for (const mode of ["clair", "sombre"]) {
    const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1" });
    await ctx.addInitScript(m => {
      if (!location.search.includes("vierge")) {
        localStorage.setItem("repere.profil", JSON.stringify({ niveauZoom: "tout", tailleTexte: 16, espacement: 1.5, contraste: "normal", policeDyslexie: false, animationsReduites: false, modeDaltonien: false, masquerImages: false, prenom: "Test", onboardingVu: true, mode: m }));
        localStorage.setItem("repere.departement", JSON.stringify({ d: "77", c: "77288" }));
      }
      window.__cls = 0; try { new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true }); } catch {}
    }, mode);
    const p = await ctx.newPage();
    const erreurs = []; p.on("pageerror", e => erreurs.push(e.message));
    const aller = async route => { await p.goto(BASE + route, { waitUntil: "domcontentloaded" }); };
    const clic = async (depuis, re) => { await aller(depuis); await p.waitForTimeout(2500); const c = p.getByRole("link", { name: re }).or(p.getByRole("button", { name: re })).first(); if (!(await c.count())) return false; await c.click(); await p.waitForTimeout(2000); return true; };
    for (const [nom, route] of ECRANS) {
      erreurs.length = 0; let atteint = true, chargement = null;
      if (route === "@elu") atteint = await clic("/qui-decide", /député/i);
      else if (route === "@annuaire") atteint = await clic("/elus", /^(?!.*retour).*(député|groupe).*/i) && (await clic(p.url().replace(BASE, ""), /[A-Z][a-zé]+ [A-Z]/));
      else if (route === "@groupe") atteint = await clic("/elus", /groupe|rassemblement|ensemble|socialiste/i);
      else if (route === "@bienvenue") { await aller("/?vierge=1"); await p.evaluate(() => localStorage.clear()); await aller("/?vierge=1"); await p.waitForTimeout(2500); }
      else {
        await aller(route);
        await p.waitForTimeout(250);
        chargement = await p.evaluate(() => ({ texte: document.body.innerText.slice(0, 200), squelette: !!document.querySelector("[data-testid*=squelette],[aria-busy=true]") || /chargement/i.test(document.body.innerText) }));
        await p.waitForTimeout(2500);
      }
      const m = atteint ? await p.evaluate(mesurer) : { nonAtteint: true };
      if (atteint) {
        m.cls = await p.evaluate(() => window.__cls);
        if (mode === "clair") { await p.addScriptTag({ content: AXE }); m.axe = await p.evaluate(async () => { const r = await axe.run(document, { resultTypes: ["violations"] }); return r.violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length, ex: v.nodes[0]?.target?.join(" ") })); }); }
        m.focusVisible = await p.evaluate(async () => { const el = document.querySelector("input,textarea"); if (!el) return null; el.focus(); await new Promise(r => setTimeout(r, 50)); const s = getComputedStyle(el); return { outline: s.outlineStyle + " " + s.outlineWidth, border: s.borderColor, ombre: s.boxShadow }; });
      }
      m.chargement = chargement; m.url = p.url().replace(BASE, ""); m.erreursJs = [...erreurs];
      await p.screenshot({ path: path.join(OUT, `${nom}-${mode}.jpg`), type: "jpeg", quality: 70 });
      (bilan[nom] ||= {})[mode] = m;
      process.stdout.write(`${mode} ${nom} ${atteint ? "ok" : "NON ATTEINT"}\n`);
    }
    await ctx.close();
  }
  await nav.close();
  fs.writeFileSync(path.join(OUT, "mesures.json"), JSON.stringify(bilan, null, 1));
})();
