// Refonte UX du 13/11/2026 : ce que le porteur a demandé, mesuré dans un navigateur à 390 px.
// Usage : node apps/mobile/tests/refonte-web.mjs http://localhost:8811
import { createRequire } from "node:module";
const { chromium } = createRequire(process.cwd() + "/")("playwright");
const BASE = process.argv[2] || "http://localhost:8811";
let echecs = 0;
const ok = (c, m) => { console.log((c ? "ok    " : "ECHEC ") + m); if (!c) echecs++; };
const nav = await chromium.launch();
const page = await (await nav.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: "block" })).newPage();
/* 14/11/2026 : sans prénom, la barrière couvre l'application. */
await page.addInitScript(() => localStorage.setItem("repere.profil", JSON.stringify({ prenom: "Test" })));
const erreurs = []; page.on("pageerror", e => erreurs.push(String(e)));
const aller = async chemin => { await page.goto(BASE + chemin, { waitUntil: "load" }); await page.waitForTimeout(3500); };
const haut = t => page.getByText(t, { exact: true }).first().evaluate(e => e.getBoundingClientRect().top + (document.scrollingElement?.scrollTop || 0)).catch(() => null);
const hauteur = () => page.evaluate(() => Math.max(...[...document.querySelectorAll("*")].map(e => e.scrollHeight)));

/* 1. La page de la commune : du plus proche au plus lointain. */
await aller("/chez-vous#meaux");
const hautDe = sel => page.evaluate(q => { const e = document.querySelector(q); return e ? e.getBoundingClientRect().top : null; }, sel);
const [commune, parlement, pays] = [await hautDe('[data-testid="reponse"]'), await haut("AU PARLEMENT") ?? await haut("Au Parlement"), await haut("LE PAYS") ?? await haut("Le pays")];
ok(commune !== null && parlement !== null && pays !== null && commune < parlement && parlement < pays, `commune : d'abord la commune, puis « Au Parlement », puis « Le pays » (${commune}, ${parlement}, ${pays})`);
const reponses = await page.evaluate(() => [...document.querySelectorAll('[data-testid="reponse"]')].map(e => (e.innerText || "").replace(/\s+/g, " ").slice(0, 400)));
ok(reponses.length === 3 && /par habitant/.test(reponses[0]) && /a voté|circonscriptions/.test(reponses[2]), "commune : le budget, puis ce que l'État finance, puis le vote du député");
let t = await page.locator("body").innerText();
ok(/Le maire propose le budget/.test(t) && /Le conseil municipal vote ce budget/.test(t) && !/Le conseil municipal le vote/.test(t), "commune : qui décide du budget se lit en deux étapes claires");
/* Les boutons de suite des cartes : une seule couleur de fond (avant : le premier clair, les autres sombres). */
const fonds = await page.evaluate(() => [...document.querySelectorAll('[data-testid="reponse"] [role="button"]')]
  .filter(b => (b.innerText || "").trim().length > 3 && b.getBoundingClientRect().width > 150 && b.getBoundingClientRect().height >= 44).map(b => getComputedStyle(b).backgroundColor));
ok(fonds.length >= 2 && new Set(fonds).size === 1, `commune : les boutons des cartes ont le même fond (${[...new Set(fonds)].join(" | ")}, ${fonds.length} boutons)`);
const bulle = await page.getByRole("button", { name: "Ouvrir le Repère du jour" }).first().evaluate(e => { const x = [...e.querySelectorAll("*")].filter(n => !n.children.length && (n.innerText || "").length > 20)[0]; return x ? { coupe: x.scrollWidth > x.clientWidth + 1, texte: x.innerText } : null; }).catch(() => null);
ok(!bulle || (!bulle.coupe && !/…$/.test(bulle.texte)), "commune : la bulle du Repère du jour montre le fait entier" + (bulle ? ` (« ${bulle.texte.slice(0, 50)} »)` : " (aucun fait ce jour)"));

/* 2. Paris : la ville entière, et un arrondissement au choix. */
await aller("/chez-vous#paris");
ok(await page.getByTestId("arrondissement-paris").count() === 1, "Paris : la carte « Votre arrondissement » est là");
await page.getByRole("radio", { name: "11e arrondissement", exact: true }).click(); await page.waitForTimeout(600);
t = await page.locator("body").innerText();
ok(/Paris 11e/.test(t) && /la mairie du 11e arrondissement/.test(t) && /a dépensé [\d\s  ]+€ par habitant/.test(t), "Paris : le 11e choisi, sa mairie de proximité, et toujours les chiffres de Paris entier");
await page.getByRole("radio", { name: "3e arrondissement", exact: true }).click(); await page.waitForTimeout(600);
ok(/la mairie de Paris Centre/.test(await page.locator("body").innerText()), "Paris : le 3e dépend de la mairie de Paris Centre");
await aller("/chez-vous#meaux");
ok(await page.getByTestId("arrondissement-paris").count() === 0, "hors Paris : pas de choix d'arrondissement");

/* 3. Finances : le titre ne passe plus sous le bouton de partage. */
await aller("/finances#meaux");
const entete = await page.evaluate(() => {
  const titre = [...document.querySelectorAll("*")].filter(e => !e.children.length && (e.innerText || "").trim() === "Où va l'argent" && e.getBoundingClientRect().top < 70)[0];
  const partage = [...document.querySelectorAll('[role="button"]')].filter(e => /^Partager/.test(e.getAttribute("aria-label") || "") && e.getBoundingClientRect().top < 70)[0];
  return titre && partage ? { fin: Math.round(titre.getBoundingClientRect().right), debut: Math.round(partage.getBoundingClientRect().left) } : null;
});
ok(entete && entete.fin <= entete.debut, `Finances : le titre finit avant le bouton de partage ${JSON.stringify(entete)}`);
ok(await page.evaluate(() => [...document.querySelectorAll('[role="button"]')].filter(e => e.getBoundingClientRect().top < 70 && /Copier le lien/.test(e.getAttribute("aria-label") || "")).length) === 0, "Finances : plus de « Copier le lien » dans l'en-tête");

/* 4. FAQ : des accordéons, une réponse ouverte à la fois. */
await aller("/faq");
const hFaq = await hauteur();
ok(hFaq <= 1000, `FAQ : fermée, la page tient sur un écran environ (${hFaq} px ; 3 036 px avant)`);
await page.getByRole("button", { name: "Pourquoi pas de compte ?" }).click(); await page.waitForTimeout(300);
await page.getByRole("button", { name: "D'où viennent les données ?" }).click(); await page.waitForTimeout(300);
const ouvertes = await page.evaluate(() => document.querySelectorAll('[aria-expanded="true"]').length);
ok(ouvertes === 1 && /Répertoire national des élus/.test(await page.locator("body").innerText()), `FAQ : une seule réponse ouverte à la fois (${ouvertes})`);
ok(/Aucun compte/.test(await page.locator("body").innerText()), "FAQ : les garanties de Repère sont en tête");

/* 5. Repère du jour : le fait, sa suite, le mot du jour, et des liens de partage sans module tiers. */
await aller("/repere-du-jour#meaux");
t = await page.locator("body").innerText();
ok(/LE MOT DU JOUR|Le mot du jour/.test(t), "Repère du jour : le mot du jour est là");
if (/LE FAIT DU JOUR|Le fait du jour/.test(t)) {
  ok(await page.getByRole("link", { name: /Partager sur X/ }).count() === 1 && await page.getByRole("link", { name: /Partager sur WhatsApp/ }).count() === 1, "Repère du jour : X et WhatsApp à un geste");
  const tiers = await page.evaluate(() => [...document.querySelectorAll("script[src],iframe[src]")].map(e => e.src).filter(s => !s.startsWith(location.origin)));
  ok(tiers.length === 0, "Repère du jour : aucun script ni cadre d'un réseau social n'est chargé " + JSON.stringify(tiers));
} else ok(/Rien n'est inventé à la place/.test(t), "Repère du jour : sans fait publié, la phrase d'absence");

ok(!erreurs.length, "aucune erreur JavaScript" + (erreurs.length ? " : " + erreurs[0] : ""));
await nav.close();
console.log(echecs ? `refonte : ${echecs} échec(s)` : "refonte : zéro échec");
process.exit(echecs ? 1 : 0);
