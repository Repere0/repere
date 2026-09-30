/* WEB + MOBILE = MEME VERITE — 29/09/2026.
 *
 * Le site et l'application lisent les memes fichiers, derivent par la meme
 * fonction (@repere/core, deriverAujourdhui) et ecrivent les memes phrases
 * (@repere/core, phrases.js). Ce controle verifie la propriete de bout en
 * bout, sur le RENDU, pas sur le code : pour des communes representatives, ce
 * que le lecteur lit sur le site et ce qu'il lit dans l'application doivent
 * porter le meme maire, le meme compte d'adjoints, la meme circonscription,
 * le meme depute, le meme vote, la meme explication, les memes sources et les
 * memes dates.
 *
 * L'ATTENDU EST CALCULE ICI, EN NODE, A PARTIR DES DONNEES — jamais recopie
 * d'un des deux rendus. Si le site ET l'application derivaient ensemble vers
 * une phrase fausse, ce controle ne le verrait pas : c'est le role des autres
 * bancs. Il voit ce qu'il doit voir : une divergence entre les deux.
 *
 * Usage (depuis mono/) :
 *   node tests/meme-verite.mjs <url du site> <url de l'app web> [dossier data]
 * Les deux doivent servir /data. */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import {
  deriverAujourdhui, titreLisible, texteDe, phraseAdjoints, phraseCirconscription, phrasePosition,
  ligneScrutin, lienScrutin, ligneSource, phraseProjetLocal, euros, dateFr, rapports, sousTitreRapports, CALCUL_REPERE,
} from "../packages/core/src/index.js";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const [SITE, APP, DONNEES = path.resolve(import.meta.dirname, "../data")] = process.argv.slice(2);
if (!SITE || !APP) { console.error("usage : node tests/meme-verite.mjs <site> <app> [data]"); process.exit(2); }

/* Communes representatives, choisies sur les donnees du 29/09/2026 :
 * Paris et Boulogne-Billancourt (plusieurs circonscriptions), Meaux (cas
 * courant : maire, projet, vote), Amponville (aucun projet publie),
 * Sartrouville (aucun vote solennel affiche). Si une commune perd sa
 * particularite, le controle le signale au lieu de tester moins en silence. */
const COMMUNES = [
  { dep: "75", insee: "75056", nom: "Paris", attendu: "plusieurs circonscriptions" },
  { dep: "92", insee: "92012", nom: "Boulogne-Billancourt", attendu: "plusieurs circonscriptions" },
  { dep: "77", insee: "77284", nom: "Meaux", attendu: "maire, projet et vote" },
  { dep: "77", insee: "77003", nom: "Amponville", attendu: "aucun projet" },
  { dep: "78", insee: "78586", nom: "Sartrouville", attendu: "aucun vote" },
];

const lire = f => JSON.parse(fs.readFileSync(path.join(DONNEES, f), "utf8"));
const net = t => String(t).replace(/\s+/g, " ").trim();
let echecs = 0;
const verifier = (ok, texte) => { console.log((ok ? "ok   " : "ECHEC") + " " + texte); if (!ok) echecs++; };

/* ---- l'attendu, calcule depuis les donnees -------------------------------- */
function attendus({ dep, insee, attendu }) {
  const index = lire("index.json"), paquet = lire(`departments/${dep}.json`);
  const fiche = paquet.communes[insee];
  const d = deriverAujourdhui({
    fiche, commune: insee, dep, index, projets: lire(`projets/${dep}.json`), cat: lire("scrutins.json"),
    pos: lire(`scrutins/${dep}.json`), deputes: lire("deputes.json"), cal: null, agendaAN: null, evenements: null,
    maintenant: new Date(),
  });
  const faits = [];
  /* texteApp : quand l'application traduit un mot de la source en francais
     courant (spike du 30/09/2026 : « exercice 2024 » -> « 2024 »), le FAIT
     compare reste le meme, sa forme ecrite differe. On le dit ici, fait par
     fait, au lieu d'assouplir la comparaison pour tous. */
  const f = (nom, texte, texteApp) => faits.push({ nom, texte: net(texte), texteApp: texteApp ? net(texteApp) : null });
  f("maire", fiche.maire.nom);
  f("adjoints", texteDe(phraseAdjoints(fiche.adjoints, fiche.maire.nom)));
  f("source des élus (producteur, licence, date)", ligneSource(index.sources.elus));
  if (d.dernierVote) {
    const v = d.dernierVote;
    f("circonscription", phraseCirconscription(d, v.circo));
    f("député", v.qui);
    f("vote (titre)", titreLisible(v.sc.t));
    f("vote (position)", texteDe(phrasePosition(v.position, v.qui)));
    f("vote (résultat, date, décompte)", ligneScrutin(v.sc));
    f("vote (lien officiel)", lienScrutin(d.base, v.sc).texte);
    f("source des scrutins (date de relevé)", ligneSource({ ...d.srcScrutins, maj: undefined, mention: "relevé le " + dateFr(d.srcScrutins.releve_le) }));
  }
  if (d.dernierProjet) {
    const p = d.dernierProjet.p;
    f("projet (intitulé)", p.intitule);
    f("projet (montant)", euros(p.subvention));
    f("projet (montant, lieu et année : la même phrase)", phraseProjetLocal(p, d.nomCommune));
    f("source des projets (date)", ligneSource({ producteur: d.srcProjets.producteur, licence: d.srcProjets.licence, maj: d.srcProjets.mis_a_jour_le }));
    if (d.dernierVote) f("projet (phrase)", phraseProjetLocal(p, d.nomCommune));
  }
  /* OU VA L'ARGENT (30/09/2026, lot M1) : l'exercice, la population et chaque
     rapport — sa valeur ET ce qu'il ne veut pas dire — sur les deux supports. */
  if (d.exercice) {
    f("comptes (exercice, habitants)", sousTitreRapports(d.exercice.an, d.exercice.ex));
    for (const o of rapports(d.exercice.ex)) {
      f(`comptes (${o.l} : valeur)`, o.v);
      f(`comptes (${o.l} : ce que ça ne veut pas dire)`, o.d);
    }
    f("comptes (calcul annoncé comme tel)", CALCUL_REPERE);
    f("source des comptes (date)", ligneSource({ producteur: d.srcComptes.producteur, licence: d.srcComptes.licence, maj: d.srcComptes.maj }));
  }
  /* La commune a-t-elle toujours la particularite pour laquelle elle a ete choisie ? */
  const garde = {
    "plusieurs circonscriptions": d.nbCircos > 1 && !!d.dernierVote,
    "maire, projet et vote": !!(fiche.maire && d.dernierProjet && d.dernierVote),
    "aucun projet": !d.dernierProjet,
    "aucun vote": !d.dernierVote,
  }[attendu];
  return { faits, garde };
}

/* ---- les deux rendus ----------------------------------------------------- */
async function texteSite(nav, { dep, nom }) {
  const c = await nav.newContext({ viewport: { width: 390, height: 844 } });
  const p = await c.newPage();
  await p.addInitScript(([k, v]) => localStorage.setItem(k, v), ["repere.departement", JSON.stringify({ d: dep, v: null })]);
  await p.goto(SITE, { waitUntil: "networkidle" });
  await p.getByLabel(/Votre commune/i).fill(nom);
  await p.getByRole("button", { name: nom, exact: true }).first().click();
  await p.waitForTimeout(1200);
  const qui = await p.evaluate(() => document.body.innerText);           /* « Qui décide », ecran par defaut */
  /* « Où va l'argent » AVANT « Aujourd'hui » : la barre d'onglets est masquee
     sur l'ecran Aujourd'hui (App.jsx). */
  await p.getByRole("button", { name: "Où va l'argent", exact: true }).first().click();
  await p.waitForTimeout(1500);
  const argent = await p.evaluate(() => document.body.innerText);
  await p.getByRole("button", { name: /Voir aujourd.hui à/ }).click();
  await p.waitForTimeout(1500);
  const auj = await p.evaluate(() => document.body.innerText);
  await c.close();
  return net(qui + "\n" + auj + "\n" + argent);
}

/* Tout ce qu'un ecran de l'application dit, replis ouverts ET feuilles de
   source ouvertes une a une (spike du 30/09/2026 : la ligne de source complete
   et le calcul vivent desormais dans la feuille « D'où vient cette
   information ? » et dans « Détails du calcul »). */
async function toutLire(p) {
  for (const depli of await p.getByRole("button", { name: /Ce que ça ne veut pas dire|Détails du calcul/ }).filter({ visible: true }).all()) await depli.click();
  let t = await p.evaluate(() => document.body.innerText);
  const pastilles = p.getByRole("button", { name: /D'où vient cette information/ }).filter({ visible: true });
  const n = await pastilles.count();
  for (let i = 0; i < n; i++) {
    await pastilles.nth(i).click();
    const feuille = p.getByText("Comment Repère l'utilise").first();
    await feuille.waitFor({ timeout: 5000 });
    t += "\n" + await p.evaluate(() => document.body.innerText);
    await p.getByRole("button", { name: "Fermer" }).first().click();
    await feuille.waitFor({ state: "hidden", timeout: 5000 });
  }
  return { t, n };
}

async function texteApp(nav, { nom }) {
  /* Refonte du 30/09/2026 : l'application montre l'essentiel sur « Chez vous »
     et le detail dans trois ecrans (argent, vote, qui decide), avec des
     explications repliees. On lit les quatre ecrans, replis et sources ouverts. */
  const c = await nav.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const p = await c.newPage();
  await p.goto(APP, { waitUntil: "networkidle" });
  await p.getByLabel(/Où habitez-vous/).fill(nom);
  await p.getByRole("button", { name: new RegExp("^" + nom.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ",") }).first().click();
  await p.getByText("Un projet chez vous").first().waitFor({ timeout: 15000 });
  await p.waitForLoadState("networkidle");
  let { t, n: feuilles } = await toutLire(p);
  for (const action of ["Où va l'argent, en détail", "Comprendre ce vote", "Qui décide de quoi"]) {
    const b = p.getByRole("button", { name: action });
    if (!(await b.count())) continue;              /* absence dite par une phrase sur l'accueil */
    await b.first().click();
    await p.waitForTimeout(900);
    const lu = await toutLire(p);
    t += "\n" + lu.t;
    feuilles += lu.n;
    await p.getByRole("button", { name: "Revenir à l'écran Chez vous" }).last().click();
    await p.waitForTimeout(500);
  }
  await c.close();
  verifier(feuilles >= 3, `${nom} : ${feuilles} feuilles de source ouvertes et lues dans l'application`);
  return net(t);
}

const nav = await chromium.launch();
let compares = 0;
for (const commune of COMMUNES) {
  const { faits, garde } = attendus(commune);
  verifier(garde, `${commune.nom} : a toujours la particularité « ${commune.attendu} »`);
  const [site, app] = await Promise.all([texteSite(nav, commune), texteApp(nav, commune)]);
  for (const { nom, texte, texteApp } of faits) {
    const s = site.includes(texte), a = app.includes(texteApp || texte);
    compares++;
    verifier(s && a, `${commune.nom} · ${nom} : ${s ? "site ✓" : "site ✗"} ${a ? "app ✓" : "app ✗"}${s && a ? "" : " — attendu « " + texte + " »" + (texteApp ? " / « " + texteApp + " »" : "")}`);
  }
}
await nav.close();
verifier(compares >= 100, `${compares} faits comparés (au moins 100 attendus : sinon ce contrôle ne mesure presque rien)`);
console.log(echecs ? `${echecs} échec(s)` : "même vérité sur le site et dans l'application, zéro échec");
process.exit(echecs ? 1 : 0);
