/* LE PARLEMENT : deux chambres, un contrôle segmenté (13/11/2026).
 *
 * Le conteneur ne joint pas senat.fr : le fichier des sénateurs est SERVI PAR LE TEST, et n'existe nulle
 * part ailleurs. Ce que le test prouve : l'écran s'appelle « Le Parlement », le segment ouvre le Sénat,
 * l'arc et la liste sont dessinés, l'ordre est alphabétique (jamais par taille), aucune photo du Sénat
 * n'est chargée, et sans le fichier l'écran dit une phrase vraie plutôt que de montrer une forme vide.
 * Usage : node apps/mobile/tests/senat-web.mjs http://localhost:8811 [dossier de captures] */
import { createRequire } from "node:module";
const { chromium } = createRequire(process.cwd() + "/")("playwright");
const BASE = process.argv[2] || "http://localhost:8811";
const CAP = process.argv[3] || null;
let echecs = 0;
const ok = (c, m) => { console.log((c ? "ok    " : "ECHEC ") + m); if (!c) echecs++; };

/* Des groupes dont l'ordre alphabétique DIFFÈRE de l'ordre des tailles : c'est ce qui rend le contrôle probant. */
const GROUPES = [
  { sigle: "CRCE-K", sieges: 17, libelle: "Groupe Communiste Républicain Citoyen et Écologiste - Kanaky" },
  { sigle: "GEST", sieges: 16, libelle: "Groupe Écologiste - Solidarité et Territoires" },
  { sigle: "Les Indépendants", sieges: 16, libelle: "Groupe Les Indépendants - République et Territoires" },
  { sigle: "Les Républicains", sieges: 132, libelle: "Groupe Les Républicains" },
  { sigle: "RDPI", sieges: 24, libelle: "Groupe Rassemblement des démocrates, progressistes et indépendants" },
  { sigle: "RDSE", sieges: 16, libelle: "Groupe du Rassemblement Démocratique et Social Européen" },
  { sigle: "SER", sieges: 65, libelle: "Groupe Socialiste, Écologiste et Républicain" },
  { sigle: "UCI", sieges: 57, libelle: "Groupe Union Centriste et Indépendants" },
  { sigle: "Non inscrit ou sans groupe publié", sieges: 5 },
];
const senateurs = [];
let i = 0;
for (const g of GROUPES) for (let k = 0; k < g.sieges; k++, i++) senateurs.push({
  id: "M" + i, nom: "Nom" + String(i).padStart(3, "0"), prenom: "Prénom", civilite: i % 2 ? "Mme" : "M.", siege: i + 1,
  groupe: g.sigle === "Non inscrit ou sans groupe publié" ? "" : g.sigle, groupeLibelle: g.libelle,
  commission: "Commission des lois", fiche: "https://www.senat.fr/senateur/exemple" + i + ".html",
});
const fichier = { v: 1, genere_le: "2026-11-13", source: { producteur: "Sénat (liste de laboratoire, test)", licence: "Licence Ouverte 2.0", url: "https://exemple.invalid/senateurs.json" }, groupes: GROUPES, senateurs };

const nav = await chromium.launch();
const ouvrir = async avecFichier => {
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const images = [];
  page.on("request", r => { if (r.resourceType() === "image") images.push(r.url()); });
  await page.addInitScript(() => localStorage.setItem("repere.profil", JSON.stringify({ tailleTexte: 16, onboardingVu: true, espacement: 1.5, contraste: "normal", policeDyslexie: false, animationsReduites: true, modeDaltonien: false, masquerImages: false, themes: [], mode: "clair", prenom: "" })));
  await page.route("**/senateurs.json", r => avecFichier
    ? r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(fichier) })
    : r.fulfill({ status: 404, contentType: "text/plain", body: "absent" }));
  await page.goto(BASE + "/scrutins", { waitUntil: "networkidle" });
  return { ctx, page, images };
};

/* ───── 1. Le Sénat, servi ───── */
{
  const { ctx, page, images } = await ouvrir(true);
  const segment = page.getByRole("tab", { name: "Sénat" });
  ok(await segment.count() === 1 && await page.getByRole("tab", { name: "Assemblée nationale" }).count() === 1,
    "le contrôle segmenté porte les deux chambres");
  ok(await page.getByText("Les votes de l'Assemblée").count() === 1, "l'Assemblée reste la chambre ouverte par défaut");
  await segment.click();
  await page.getByTestId("senat-ordre").waitFor({ timeout: 20000 });
  ok(await page.getByText("Les votes de l'Assemblée").count() === 0, "le Sénat remplace l'Assemblée, il ne s'ajoute pas dessous");
  const sieges = await page.getByTestId("siege-senat").count();
  ok(sieges === 348, "348 sièges dessinés, un par sénateur (" + sieges + ")");
  const legende = (await page.getByRole("button", { name: /\d+ sénateurs\./ }).allInnerTexts()).map(t => t.trim().split("\n")[0]);
  const attendu = GROUPES.map(g => g.sigle === "Non inscrit ou sans groupe publié" ? "Non inscrit ou sans groupe publié" : g.sigle);
  ok(JSON.stringify(legende) === JSON.stringify(attendu), "la légende suit l'ordre alphabétique du sigle : " + legende.join(" "));
  const parTaille = [...GROUPES].sort((a, b) => b.sieges - a.sieges).map(g => g.sigle);
  ok(JSON.stringify(legende) !== JSON.stringify(parTaille), "cet ordre n'est pas celui des tailles (invariant 3)");
  ok(/Disposition indicative/.test((await page.getByTestId("senat-ordre").innerText())), "l'écran dit que la disposition est indicative");
  const cartes = await page.getByTestId("carte-senateur").count();
  ok(cartes === 348, "chaque sénateur a sa carte (" + cartes + ")");
  ok(!images.some(u => /senat\.fr|senimg/i.test(u)), "aucune photo du Sénat n'est chargée (ADR 0004)");
  ok(await page.getByText(/absence|présence|patrimoine/i).count() === 0, "aucune donnée de présence ni de patrimoine (invariant 8)");
  if (CAP) await page.screenshot({ path: `${CAP}/senat.png` });
  /* Toucher un groupe ne montre que ses sénateurs. */
  await page.getByRole("button", { name: /^Groupe Écologiste/ }).first().click();
  await page.waitForTimeout(600);
  ok(await page.getByTestId("carte-senateur").count() === 16, "toucher un groupe ne montre que ses sénateurs");
  await ctx.close();
}

/* ───── 2. Sans le fichier : une phrase vraie, jamais une forme vide ───── */
{
  const { ctx, page } = await ouvrir(false);
  await page.getByRole("tab", { name: "Sénat" }).click();
  await page.getByText("Repère ne publie pas encore la liste des sénateurs", { exact: false }).waitFor({ timeout: 20000 });
  ok(await page.getByTestId("siege-senat").count() === 0, "aucun siège inventé quand la liste manque (invariant 5)");
  ok(await page.getByText("348 sénateurs", { exact: false }).count() === 0, "aucun chiffre affiché sans sa source");
  await ctx.close();
}

await nav.close();
console.log(echecs ? `Parlement : ${echecs} échec(s)` : "Parlement : zéro échec");
process.exit(echecs ? 1 : 0);
