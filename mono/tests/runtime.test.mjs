/* Les invariants qui ne se mesurent QUE dans un navigateur.
 *
 * RÈGLE DE CONCEPTION, héritée du banc de la version mono-fichier : un banc vert
 * sur une page cassée reste un banc vert. Les contrôles ci-dessous n'ouvrent pas
 * le code : ils ouvrent l'application, coupent le réseau, et regardent ce qui
 * s'affiche.
 *
 * Usage : node tests/runtime.test.mjs [dossier/dist]
 */
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { adresseFautive, MOTS_A_ACCENTS } from "../packages/data-utils/src/invariants.js";
import { dernierExercice } from "../packages/core/src/comptes.js";

/* COPIE VOLONTAIRE DE dateFr (packages/ui/src/composants.jsx) — ce fichier de
   controle tourne en Node pur, sans transformation JSX, et composants.jsx en
   contient. Meme algorithme, jamais une approximation : ce controle doit
   pouvoir se tromper si l'un des deux change sans l'autre. */
function dateFr(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v || ""));
  if (!m) return v;
  const mois = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet",
                "août", "septembre", "octobre", "novembre", "décembre"];
  return Number(m[3]) + (m[3] === "01" ? "er" : "") + " " + mois[Number(m[2]) - 1] + " " + m[1];
}

/* Playwright est une devDependency de la racine : il se resout normalement.
   Le repli precedent pointait un chemin absolu propre a une machine — il ne
   pouvait fonctionner nulle part ailleurs, et masquait la vraie cause quand
   l'installation manquait. */
let chromium;
try { ({ chromium } = await import("playwright")); }
catch (e) {
  console.error("playwright introuvable — lance `pnpm install` a la racine.\n" + e.message);
  process.exit(2);
}

const DIST = path.resolve(process.argv[2] || "apps/web/dist");
/* Remet un fichier du build dans son etat d'avant une mesure : son contenu, ou
   son ABSENCE. Une fixture ne doit jamais survivre dans le site construit. */
const restaurer = (f, orig) => { if (orig === null) fs.rmSync(f, { force: true }); else fs.writeFileSync(f, orig); };
if (!fs.existsSync(path.join(DIST, "index.html"))) {
  console.error("build absent : " + DIST + " — lance `pnpm build` puis copie data/ dedans");
  process.exit(2);
}

/* LA FIXTURE DES PROJETS EST POSEE ICI, ET NULLE PART AILLEURS.
 *
 * La collecte des projets finances par l'Etat ne joint pas data.gouv.fr depuis un
 * poste de developpement : le conteneur n'a pas d'acces sortant vers ce domaine,
 * et la collecte reelle tourne dans GitHub Actions. Sans donnee, l'ecran « Ce qui
 * a ete decide » ne pourrait etre eprouve que sur son ecran vide.
 *
 * ELLE EST POSEE DANS LE BUILD DEJA FAIT, JAMAIS DANS scripts/. Une copie dans
 * scripts/projets.json a fait ecrire « FIXTURE DE BANC » dans la source publiee
 * par index.json, donc sur l'ecran « Sources » : le controle statique l'a
 * attrapee. Ici, la fixture ne touche que le repertoire servi au navigateur
 * pendant la mesure — et elle en repart. */
const FIXTURE = path.resolve(import.meta.dirname, "fixtures", "projets-beta.json");
let fixturePosee = false;
if (fs.existsSync(FIXTURE) && !fs.existsSync(path.join(DIST, "data", "projets"))) {
  const paquet = JSON.parse(fs.readFileSync(FIXTURE, "utf8"));
  const parDep = {};
  for (const [insee, liste] of Object.entries(paquet.communes)) {
    const dep = insee.startsWith("97") ? insee.slice(0, 3) : insee.slice(0, 2);
    (parDep[dep] = parDep[dep] || {})[insee] = liste;
  }
  fs.mkdirSync(path.join(DIST, "data", "projets"), { recursive: true });
  for (const [dep, communes] of Object.entries(parDep)) {
    fs.writeFileSync(path.join(DIST, "data", "projets", dep + ".json"), JSON.stringify({
      v: 1, d: dep, mis_a_jour_le: paquet.source.mis_a_jour_le,
      releve_le: paquet.source.releve_le, exercices: paquet.source.exercices,
      dispositifs: paquet.dispositifs, communes,
    }));
  }
  const fIndex = path.join(DIST, "data", "index.json");
  fs.copyFileSync(fIndex, fIndex + ".avant-fixture");
  const index = JSON.parse(fs.readFileSync(fIndex, "utf8"));
  index.sources = index.sources || {};
  index.sources.projets = {
    producteur: paquet.source.producteur_affiche, licence: paquet.source.licence,
    url: paquet.source.url, exercices: paquet.source.exercices,
    mis_a_jour_le: paquet.source.mis_a_jour_le, releve_le: paquet.source.releve_le,
  };
  fs.writeFileSync(fIndex, JSON.stringify(index));
  fixturePosee = true;
  console.log("  (fixture des projets posee dans le build de mesure : "
    + Object.keys(parDep).length + " departements)");
}

/* ELLE EST RETIREE A LA FIN, QUOI QU'IL ARRIVE. Sinon le repertoire publie
   garderait des projets de banc apres la mesure, et un deploiement lance dans la
   foulee les servirait a de vrais habitants. Le nettoyage est branche sur la
   sortie du processus, pas sur la fin du script : un controle qui echoue ne doit
   pas laisser la fixture derriere lui. */
function retirerFixture() {
  if (!fixturePosee) return;
  fs.rmSync(path.join(DIST, "data", "projets"), { recursive: true, force: true });
  const fIndex = path.join(DIST, "data", "index.json");
  if (fs.existsSync(fIndex + ".avant-fixture")) fs.renameSync(fIndex + ".avant-fixture", fIndex);
  fixturePosee = false;
}
process.on("exit", retirerFixture);
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => { retirerFixture(); process.exit(1); });

const resultats = [];
/* LE TEXTE AFFICHE, SANS LES CAPITALES DE STYLE — 29/09/2026. innerText rend
   « REPÈRE » sous `text-transform: uppercase` ; textContent colle les blocs
   voisins (« RepereQui decide »), et la recherche de mot entier echoue aussi.
   Les deux ont ete essayes et prouves aveugles sur « Repere » ecrit expres dans
   l'en-tete. On neutralise donc le style le temps de lire innerText. */
async function texteSansCapitales(p) {
  return p.evaluate(() => {
    const st = document.createElement("style");
    st.textContent = "*{text-transform:none!important}";
    document.head.appendChild(st);
    const t = document.body.innerText;
    st.remove();
    return t;
  });
}
function verif(nom, condition, detail) {
  resultats.push({ nom, ok: !!condition, detail: condition ? "" : (detail || "") });
  console.log((condition ? "  ok  " : " ECHEC") + " | " + nom + (condition ? "" : "  -> " + (detail || "")));
}

/* Un serveur qui DÉCLARE content-length : sans lui, tout part en chunked et une
   mesure de poids vaudrait zéro quel que soit le fichier servi. */
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript",
  ".css": "text/css", ".json": "application/json", ".webmanifest": "application/manifest+json" };
let servies = [];
const serveur = http.createServer((req, rep) => {
  const p0 = decodeURIComponent(req.url.split("?")[0]);
  servies.push(req.url);
  const f = path.join(DIST, p0 === "/" ? "index.html" : p0);
  if (!f.startsWith(DIST) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    rep.writeHead(404, { "content-type": "application/json" });
    return rep.end('{"erreur":"introuvable"}');
  }
  const corps = fs.readFileSync(f);
  rep.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream",
                       "content-length": corps.length });
  rep.end(corps);
});
await new Promise(r => serveur.listen(0, "127.0.0.1", r));
const base = "http://127.0.0.1:" + serveur.address().port + "/";

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 420, height: 900 } });
const page = await ctx.newPage();
const erreurs = [];
page.on("pageerror", e => erreurs.push("pageerror: " + e.message));
/* Hors ligne, le navigateur JOURNALISE chaque requete refusee. Ce n'est pas un
   defaut de l'application : c'est la mesure elle-meme. On separe donc les deux —
   une erreur applicative reste une erreur, une requete refusee pendant la phase
   hors ligne est attendue et comptee a part. */
let horsLignePhase = false;
const reseauCoupe = [];
/* Le 503 fait partie de la liste : c'est la reponse que NOTRE service worker
   fabrique lui-meme quand une donnee n'est ni en cache ni joignable. Le client en
   fait une phrase pour le lecteur ; le navigateur, lui, la journalise comme une
   erreur. Elle n'est attendue QUE pendant la phase hors ligne — en marche normale
   un 503 resterait un echec. */
const estReseau = t => /ERR_INTERNET_DISCONNECTED|ERR_TUNNEL_CONNECTION_FAILED|ERR_NETWORK_CHANGED|Failed to fetch|net::ERR|status of 503/.test(t);
page.on("console", m => {
  if (m.type() !== "error") return;
  const t = m.text().slice(0, 140);
  if (horsLignePhase && estReseau(t)) { reseauCoupe.push(t); return; }
  /* LA RESSOURCE EST NOMMEE — 29/09/2026. « Failed to load resource : 404 »
     ne disait pas QUEL fichier manquait ; un echec doit dire qui il refuse. */
  const ou = (m.location() && m.location().url) || "";
  /* UN 404 ATTENDU N'EST PAS UNE ERREUR APPLICATIVE — 06/10/2026, PR #79.
     Les projets ne sont publies que pour certains departements (la beta
     Ile-de-France). Depuis qu'« Aujourd'hui » s'ouvre par defaut, il demande le
     paquet de projets du departement choisi ; hors de cette liste, le serveur
     repond 404 et l'ecran le dit (doctrine du vide, ETATS.INTROUVABLE). Seul ce
     cas exact est tolere : un departement dont le build n'a PAS publie le
     fichier. Tout autre 404 — y compris sur un departement publie — reste un
     echec. */
  /* 07/10/2026 : meme regle pour les deux calendriers, publies seulement si leur
     releve du jour a reussi ; l'ecran dit alors l'absence (controle « independance »). */
  const p404 = /status of 404/.test(t)
    && /\/data\/(projets\/[0-9AB]{2,3}|calendrier-senat|agenda-an)\.json$/.exec(ou);
  if (p404 && !fs.existsSync(path.join(DIST, "data", p404[1] + ".json"))) return;
  erreurs.push("console: " + t + (ou ? " [" + ou.replace(/^https?:\/\/[^/]+/, "") + "]" : ""));
});

const adresses = [];
/* `r.url` EST UNE FONCTION dans Playwright, pas une chaine. `new URL(r.url)`
   levait donc a chaque requete, le catch avalait l'erreur, et la liste restait
   VIDE : le controle « aucune adresse ne porte un code de commune » passait au
   vert sans avoir rien regarde depuis qu'il existe. Defaut trouve le 28/08/2026
   en ajoutant un controle qui, lui, exigeait une adresse presente. */
page.on("request", r => { try { const u = new URL(r.url()); adresses.push(u.pathname + u.search); } catch {} });

console.log("\n--- premiere visite ------------------------------------------");
let poids = 0;
const compteur = async rep => { try { const b = await rep.body(); poids += b.length; } catch {} };
page.on("response", compteur);
await page.goto(base, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
page.off("response", compteur);

/* LE PLAFOND A ETE ABAISSE DE 400 A 120 Ko. Il etait fixe quand le socle React
   pesait a lui seul 142 Ko ; il ne mesurait donc plus rien. Mesure du jour, socle
   preact et noms des territoires compris : 57 Ko. Le plafond laisse de la marge
   sans laisser passer un retour en arriere. */
verif("poids — le premier ecran reste sous 120 Ko", poids <= 120 * 1024,
  Math.round(poids / 1024) + " Ko transferes avant le choix d'un departement");
console.log("        (mesure : " + Math.round(poids / 1024) + " Ko)");
/* LA LISTE DES COMMUNES N'EST PAS DU PREMIER ECRAN — 07/10/2026. Elle part au
   premier contact avec le champ, une seule fois, et la recherche directe marche
   des qu'elle est arrivee. Contexte neuf : rien en cache. */
{
  const ctxL = await nav.newContext({ viewport: { width: 390, height: 844 } });
  const pL = await ctxL.newPage();
  const vues = [];
  pL.on("request", r => { if (/\/data\/communes-beta\.json/.test(r.url())) vues.push(r.url()); });
  await pL.goto(base, { waitUntil: "networkidle" });
  await pL.waitForTimeout(1200);
  verif("poids — la liste des communes ne part pas tant que le champ n'est pas touche", vues.length === 0, vues.length + " demande(s) avant tout contact");
  await pL.getByLabel(/Où habitez-vous/).focus();
  await pL.getByLabel(/Où habitez-vous/).fill("Bagno");
  await pL.waitForTimeout(400);
  await pL.getByLabel(/Où habitez-vous/).fill("Bagnolet");
  await pL.waitForTimeout(800);
  const proposee = await pL.getByRole("button", { name: /^Bagnolet\b/ }).count();
  verif("poids — au premier contact, une seule demande, et la recherche directe repond", vues.length === 1 && proposee > 0,
    vues.length + " demande(s), " + proposee + " proposition(s)");
  await ctxL.close();
}

/* INVARIANT 2 : aucune adresse ne porte un code de commune. Mesure sur ce qui a
   REELLEMENT ete demande, pas sur ce que le code compose. */
/* Une liste vide ne prouve rien : on exige d'abord d'avoir vu passer des
   adresses, sinon ce controle se contente de son propre silence. */
verif("mesure — le mouchard de requetes voit passer les adresses", adresses.length > 0, String(adresses.length));
const fautives = adresses.filter(adresseFautive);
verif("invariant 2 — aucune adresse demandee ne porte un code de commune",
  fautives.length === 0, [...new Set(fautives)].slice(0, 4).join(" | "));

const stockage = await page.evaluate(() => ({
  local: Object.keys(localStorage), session: Object.keys(sessionStorage),
  cookie: document.cookie,
}));
verif("invariant 2 — rien n'est ecrit sur l'appareil avant un geste du lecteur",
  stockage.local.length === 0 && stockage.session.length === 0 && stockage.cookie === "",
  JSON.stringify(stockage));

console.log("\n--- parcours -------------------------------------------------");
/* Le choix du departement se fait par NOM ou par numero : la pastille porte les
   deux. On la designe par le numero en tete, et on verifie au passage que le nom
   officiel est bien affiche — sans lui, il fallait savoir que sa commune est
   « dans le 64 » pour entrer dans le produit. */
/* LE MUR DES 104 PASTILLES NE S'OUVRE PLUS TOUT SEUL (13/09/2026).
   Le premier ecran pose une seule question — « Ou habitez-vous ? » — et la liste
   complete est repliee sous une ligne. Elle reste le seul chemin pour les 96
   departements hors Ile-de-France, dont aucune commune n'est dans l'index de la
   beta : ce parcours-la doit donc rester eprouve de bout en bout. */
await page.locator("details.choix > summary").click();
await page.waitForTimeout(200);
const listeDept = await page.evaluate(() => document.querySelector(".liste-dept").innerText);
verif("rendu — les departements portent leur nom, pas seulement leur numero",
  /Pyrénées-Atlantiques/.test(listeDept) && /Ain/.test(listeDept),
  listeDept.slice(0, 120).replace(/\n+/g, " / "));
/* TRAVERSER LA LISTE AU CLAVIER NE DOIT RIEN TELECHARGER.
 *
 * Le prechargement se declenche au survol et au focus. Sans delai ni plafond,
 * une tabulation a travers les cent quatre territoires mettait en file cent
 * quatre paquets departementaux — une douzaine de mega-octets pour quelqu'un qui
 * cherchait simplement le sien. On traverse donc douze pastilles sans s'arreter,
 * et on exige qu'AUCUN paquet ne soit parti. */
servies = [];
await page.getByLabel(/Où habitez-vous/).focus();
for (let i = 0; i < 16; i++) { await page.keyboard.press("Tab"); await page.waitForTimeout(40); }
/* On RESSORT de la liste avant de mesurer : se poser sur une pastille EST une
   intention, et precharger ce territoire-la est le comportement voulu. Ce que le
   controle mesure, c'est la traversee — le doigt ou le focus qui passe. */
await page.getByLabel(/Où habitez-vous/).focus();
await page.waitForTimeout(1400);
const paquetsFiles = servies.filter(u => u.startsWith("/data/departments/"));
verif("prechargement — traverser la liste au clavier ne telecharge aucun departement",
  paquetsFiles.length === 0,
  paquetsFiles.length + " paquet(s) demande(s) : " + [...new Set(paquetsFiles)].slice(0, 5).join(", "));

/* Recherche par nom, sans accents : personne ne tape « Pyrénées » au clavier. */
await page.getByLabel(/Où habitez-vous/).fill("pyrenees at");
await page.waitForTimeout(300);
const filtre = await page.evaluate(() => document.querySelector(".liste-dept").innerText);
verif("recherche — un departement se trouve par son nom, sans accents",
  /Pyrénées-Atlantiques/.test(filtre) && !/Ain\b/.test(filtre),
  filtre.slice(0, 120).replace(/\n+/g, " / "));

await page.getByRole("button", { name: /^64\b/ }).click();
await page.waitForTimeout(1800);

const apres = await page.evaluate(() => ({
  local: Object.keys(localStorage),
  valeur: localStorage.getItem("repere.departement"),
  session: Object.keys(sessionStorage),
}));
/* LA VALEUR EST DEVENUE UN OBJET JSON {d, v} LE 23/09/2026 (retention "depuis
   votre derniere visite", voir Aujourdhui.jsx) — UNE SEULE CLE TOUJOURS, mais
   son contenu a change, et ce controle doit lire la forme REELLE plutot que
   deviner. `v` est un horodatage de VISITE, jamais de lieu : ce controle
   verifie qu'aucune de ses deux valeurs ne ressemble a une commune. */
let valeurParsee = null;
try { valeurParsee = JSON.parse(apres.valeur || "null"); } catch { /* laisse null, le controle echouera a raison */ }
verif("invariant 2 — une seule cle, nommee, et elle ne porte qu'un departement et un instant de visite",
  apres.local.length === 1 && apres.local[0] === "repere.departement"
  && valeurParsee && Object.keys(valeurParsee).sort().join(",") === "d,v"
  && /^(\d{2,3}|2[AB])$/.test(valeurParsee.d || "")
  && (valeurParsee.v === null || /^\d{4}-\d{2}-\d{2}T/.test(valeurParsee.v)),
  JSON.stringify(apres));
verif("invariant 2 — sessionStorage reste vide", apres.session.length === 0, apres.session.join(","));

await page.getByLabel(/Votre commune/).fill("Ustaritz");
await page.waitForTimeout(400);
await page.getByRole("button", { name: "Ustaritz", exact: true }).click();
await page.waitForTimeout(700);

/* « Aujourd'hui » est désormais le premier écran. Les assertions sur les élus
   ouvrent explicitement « Qui décide » : elles testent le contenu, pas l'ordre
   des onglets. */
await page.getByRole("button", { name: "Qui décide", exact: true }).click();
await page.waitForTimeout(900);
const qui = await page.evaluate(() => document.body.innerText);
const quiBrut = await texteSansCapitales(page);
verif("rendu — le maire de la commune choisie s'affiche",
  /Piero ROUGET/.test(qui), qui.slice(0, 120).replace(/\n+/g, " / "));
verif("rendu — la circonscription de la commune s'affiche",
  /6e circonscription législative/.test(qui),
  qui.slice(0, 160).replace(/\n+/g, " / "));

/* LE PARCOURS VA JUSQU'A L'ELU NATIONAL, ET PAS SEULEMENT JUSQU'AU NUMERO.
   « 6e circonscription legislative » ne dit a personne qui le represente. Le
   nom vient du fichier des mandats de l'Assemblee, telecharge par CET ecran
   seulement — d'ou l'attente : il part apres le premier rendu. */
await page.waitForTimeout(900);
const avecDepute = await page.evaluate(() => document.body.innerText);
verif("rendu — le depute elu dans cette circonscription est nomme",
  /Peio Dufau/.test(avecDepute),
  avecDepute.slice(0, 400).replace(/\n+/g, " / "));
verif("invariant 4 — le nom du depute porte sa source, sa licence et sa date",
  /Assemblée nationale/.test(avecDepute) && /Licence Ouverte/.test(avecDepute)
  && /relevé le \d/.test(avecDepute),
  avecDepute.slice(0, 400).replace(/\n+/g, " / "));
/* Ni etiquette politique, ni groupe, ni rien qui ressemble a un classement :
   le fichier des mandats n'en porte pas, et l'ecran n'en fabrique pas. */
verif("invariant 3 — le depute est nomme sans etiquette ni comparaison",
  !/groupe politique|majorité|opposition|classement/i.test(avecDepute),
  avecDepute.slice(0, 400).replace(/\n+/g, " / "));

/* AGGLO, DEPARTEMENT, REGION — PORTES LE 22/09/2026 (decision produit,
 * option A, mission phase 3.1 suite). Le 3 aout ce meme controle affirmait
 * l'inverse (« ne nomme pas encore ») ; le shadow build sur Bagnolet a
 * prouve que l'ancien site les nomme bien a partir de la meme RNE deja
 * dans le pipeline mono/ (voir MONO_SHADOW_COMPARISON_2026-09.md). Verifie
 * ici sur Ustaritz, dont les trois noms reels ont ete relus directement
 * dans data/departments/64.json et data/elus-regions/75.json avant
 * d'ecrire ce controle — jamais devines. */
await page.waitForTimeout(900);   // chargerElusRegion() est asynchrone
const avecElus = await page.evaluate(() => document.body.innerText);
verif("elus locaux — l'intercommunalite d'Ustaritz est nommee (delegue de la commune)",
  /Ca Du Pays Basque/.test(avecElus) && /Jérémy Lucien MANGUIN|Bruno CENDRES|Hélène MARTY-CHALEON/.test(avecElus),
  avecElus.slice(avecElus.indexOf("intercommunalité"), avecElus.indexOf("intercommunalité") + 300).replace(/\n+/g, " / "));
verif("elus locaux — le conseiller departemental DU CANTON d'Ustaritz est nomme, pas un autre canton",
  /Philippe ECHEVERRIA|Bénédicte LUBERRIAGA/.test(avecElus),
  avecElus.slice(avecElus.indexOf("département"), avecElus.indexOf("département") + 300).replace(/\n+/g, " / "));
verif("elus locaux — le conseil regional est nomme (Alain Rousset, president, en tete par son rang)",
  /Alain ROUSSET/.test(avecElus) && /Président du conseil régional/i.test(avecElus),
  avecElus.slice(avecElus.indexOf("région"), avecElus.indexOf("région") + 300).replace(/\n+/g, " / "));
/* 08/10/2026 : aucun delegue n'est mis en avant par le seul ordre du fichier.
   Ustaritz en envoie trois, tous conseillers : les trois sont VISIBLES, au meme
   rang (noms lus dans les donnees servies, jamais recopies ici). */
{
  const ust = JSON.parse(fs.readFileSync(path.join(DIST, "data/departments/64.json"), "utf8")).communes["64547"];
  const noms = ((ust.agglo || {}).delegues || []).map(e => e.nom);
  const visibles = await page.evaluate(ns => ns.filter(n => [...document.querySelectorAll(".ligne")]
    .some(l => l.checkVisibility() && l.innerText.includes(n))), noms);
  verif("elus locaux — tous les delegues d'Ustaritz a l'intercommunalite sont visibles, au meme rang",
    noms.length >= 2 && visibles.length === noms.length, JSON.stringify({ noms, visibles }));
}
verif("invariant 3 — les elus locaux sont nommes sans etiquette ni comparaison",
  !/groupe politique|majorité|opposition|classement|mieux que/i.test(avecElus.slice(avecElus.indexOf("intercommunalité"))),
  "");

/* DOCTRINE DU VIDE — L'INTERCOMMUNALITE MANQUE POUR ENVIRON UN TIERS DES
 * COMMUNES DE LA BETA (mesure le 22/09/2026, extract-html.js). Amillis
 * (77002) est un cas reel, pas fabrique : `data/departments/77.json` ne
 * porte aucun delegue pour elle. Si l'ecran restait muet plutot que de le
 * dire, ce serait la meme faute que Ville-d'Avray, ailleurs dans ce fichier. */
const pageAgglo = await (await nav.newContext()).newPage();
await pageAgglo.goto(base, { waitUntil: "networkidle" });
await pageAgglo.getByLabel(/Où habitez-vous/).fill("Amillis");
await pageAgglo.waitForTimeout(300);
await pageAgglo.getByRole("button", { name: /^Amillis\b/ }).click();
await pageAgglo.waitForTimeout(1200);
await pageAgglo.getByRole("button", { name: "Qui décide" }).click();
await pageAgglo.waitForTimeout(700);
const texteAmillis = await pageAgglo.evaluate(() => document.body.innerText);
verif("invariant 5 — l'absence de delegue d'agglo est dite, pas juste omise",
  /ne porte pas de délégué pour cette commune/i.test(texteAmillis),
  texteAmillis.slice(texteAmillis.indexOf("intercommunalité"), texteAmillis.indexOf("intercommunalité") + 300).replace(/\n+/g, " / "));
await pageAgglo.context().close();

/* LE BINOME DU CANTON, VISIBLE — 07/10/2026. Les noms attendus sont lus dans le
   paquet publie (jamais recopies) : tous les elus du canton de Bagnolet doivent
   etre LISIBLES sans rien deplier (innerText ignore un <details> ferme). */
{
  const p93 = JSON.parse(fs.readFileSync(path.join(DIST, "data", "departments", "93.json"), "utf8"));
  const [codeB, ficheB] = Object.entries(p93.communes).find(([, f]) => f.nom === "Bagnolet");
  const attendus = (p93.conseil_departemental || []).filter(e => (ficheB.canton || []).includes(e.canton)).map(e => e.nom);
  const pageCanton = await (await nav.newContext()).newPage();
  await pageCanton.goto(base, { waitUntil: "networkidle" });
  await pageCanton.getByLabel(/Où habitez-vous/).fill("Bagnolet");
  await pageCanton.waitForTimeout(300);
  await pageCanton.getByRole("button", { name: /^Bagnolet\b/ }).click();
  await pageCanton.waitForTimeout(1200);
  await pageCanton.getByRole("button", { name: "Qui décide", exact: true }).click();
  await pageCanton.waitForTimeout(900);
  const visible = await pageCanton.evaluate(() => document.body.innerText);
  verif("qui decide — tous les elus du canton sont visibles sans rien deplier (" + codeB + ")",
    attendus.length >= 2 && attendus.every(n => visible.includes(n)),
    "attendus " + JSON.stringify(attendus) + " ; manquants " + JSON.stringify(attendus.filter(n => !visible.includes(n))));
  await pageCanton.context().close();
}

/* DETTE DE FRAICHEUR FERMEE — PREUVE PAR CASSURE DU GARDE-FOU, mission
 * phase 3.2 §7. Le defaut REEL trouve en testant le portage des elus le
 * 22/09/2026 : un onglet avec un `index.json` deja en cache, mis en cache
 * AVANT que `region_code` existe, continuait a l'utiliser silencieusement.
 * On reproduit ce defaut a la main — un cache dont le schema (`v`) ne
 * correspond plus a SCHEMA_ATTENDU, contenant une donnee absurde et
 * detectable (un faux departement "ZZ") — et on verifie que l'application
 * ne le montre JAMAIS : ni le faux departement, ni un plantage muet. */
const pageFraicheur = await (await nav.newContext()).newPage();
await pageFraicheur.goto(base, { waitUntil: "networkidle" });
await pageFraicheur.evaluate(async () => {
  const db = await new Promise((res, rej) => {
    const q = indexedDB.open("repere-donnees");
    q.onupgradeneeded = () => { if (!q.result.objectStoreNames.contains("departements")) q.result.createObjectStore("departements"); };
    q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error);
  });
  await new Promise((res, rej) => {
    const tx = db.transaction("departements", "readwrite");
    tx.objectStore("departements").put(
      { v: 999, genere_le: "2000-01-01", departements: [{ code: "ZZ", nom: "FAUX-TEST-PERIME", communes: 1, octets: 1 }], sources: {}, agregats: [] },
      "socle:IDX");
    tx.oncomplete = res; tx.onerror = () => rej(tx.error);
  });
  db.close();
});
await pageFraicheur.reload({ waitUntil: "networkidle" });
await pageFraicheur.waitForTimeout(700);
const texteFraicheur = await pageFraicheur.evaluate(() => document.body.innerText);
verif("fraîcheur — un cache dont le schema ne correspond plus a SCHEMA_ATTENDU n'est jamais affiche",
  !/FAUX-TEST-PERIME/.test(texteFraicheur),
  "le departement fictif du cache perime est apparu a l'ecran : la garde de fraicheur ne fonctionne pas");
verif("fraîcheur — apres detection d'un cache perime, l'application affiche les vrais departements",
  /Ain|Seine-Saint-Denis|Yvelines/.test(texteFraicheur) || /Où habitez-vous/.test(texteFraicheur),
  texteFraicheur.slice(0, 200).replace(/\n+/g, " / "));
/* Le cache doit avoir ete REMPLACE, pas seulement ignore cette fois : une
   seconde visite ne doit pas retomber sur le meme faux departement. */
const capresPurge = await pageFraicheur.evaluate(async () => {
  const db = await new Promise(r => { const q = indexedDB.open("repere-donnees"); q.onsuccess = () => r(q.result); q.onerror = () => r(null); });
  if (!db) return null;
  const v = await new Promise(r => {
    const tx = db.transaction("departements", "readonly");
    const d = tx.objectStore("departements").get("socle:IDX");
    d.onsuccess = () => r(d.result); d.onerror = () => r(null);
  });
  db.close();
  return v ? v.v : null;
});
verif("fraîcheur — le cache perime est remplace par un cache a jour (v = SCHEMA_ATTENDU), pas laisse en place",
  capresPurge === 1, "v en cache apres coup : " + JSON.stringify(capresPurge));
await pageFraicheur.context().close();

/* FRAICHEUR — UNE NOUVELLE PUBLICATION ATTEINT UN LECTEUR DEJA VENU (30/09/2026).
 * Le defaut corrige ce jour-la : le client lisait son magasin d'abord et ne
 * redemandait JAMAIS le reseau ; le service worker, lui aussi « cache d'abord »,
 * avait une visite de retard. Un lecteur venu une fois gardait pour toujours
 * les elus de sa premiere visite. On le mesure de bout en bout, service worker
 * compris : premiere visite, publication d'un nouveau maire (fichiers du build
 * reecrits, puis restaures), visite suivante. */
{
  const fIx = path.join(DIST, "data", "index.json");
  const f77 = path.join(DIST, "data", "departments", "77.json");
  const ixAvant = fs.readFileSync(fIx, "utf8");
  const d77Avant = fs.readFileSync(f77, "utf8");
  const ctxPub = await nav.newContext({ viewport: { width: 390, height: 844 } });
  const pagePub = await ctxPub.newPage();
  const ouvrirAmillis = async () => {
    /* A la visite suivante, la commune est deja retenue : pas de recherche. */
    await pagePub.waitForTimeout(600);
    const champ = pagePub.getByLabel(/Où habitez-vous/);
    if (await champ.isVisible().catch(() => false)) {
      await champ.fill("Amillis");
      await pagePub.waitForTimeout(300);
    }
    /* Premiere visite : le resultat de la recherche. Visites suivantes : le
       departement est retenu, la commune se choisit dans sa liste. */
    await pagePub.getByRole("button", { name: /^Amillis\b/ }).first().click();
    await pagePub.waitForTimeout(1200);
    await pagePub.getByRole("button", { name: "Qui décide" }).click();
    await pagePub.waitForTimeout(800);
    return pagePub.evaluate(() => document.body.innerText);
  };
  let avant = "", apres = "", precedente = "";
  try {
    await pagePub.goto(base, { waitUntil: "networkidle" });
    avant = await ouvrirAmillis();
    /* Une seconde visite a l'identique : le service worker controle la page
       et porte les donnees dans son propre cache. */
    await pagePub.goto(base, { waitUntil: "networkidle" });
    await ouvrirAmillis();
    const ix = JSON.parse(ixAvant);
    ix.build = { ...(ix.build || {}), construit_le: "2099-01-01T00:00:00.000Z" };
    const d77 = JSON.parse(d77Avant);
    d77.communes["77002"].maire.nom = "PUBLICATION-NEUVE-TEST";
    fs.writeFileSync(fIx, JSON.stringify(ix));
    fs.writeFileSync(f77, JSON.stringify(d77));
    await pagePub.goto(base, { waitUntil: "networkidle" });
    apres = await ouvrirAmillis();
    /* Une publication encore plus recente, mais le fichier du departement
       n'arrive pas : la copie gardee reste lisible, ET l'ecran dit qu'elle
       date d'une publication precedente (invariant 9). */
    ix.build = { ...ix.build, construit_le: "2099-02-01T00:00:00.000Z" };
    fs.writeFileSync(fIx, JSON.stringify(ix));
    fs.rmSync(f77);
    await pagePub.goto(base, { waitUntil: "networkidle" });
    precedente = await ouvrirAmillis();
  } finally {
    fs.writeFileSync(fIx, ixAvant);
    fs.writeFileSync(f77, d77Avant);
    await ctxPub.close();
  }
  verif("fraîcheur — avant la publication, le lecteur voit le maire publie",
    /TASD'HOMME/.test(avant), avant.slice(0, 200).replace(/\n+/g, " / "));
  verif("fraîcheur — une nouvelle publication atteint le lecteur deja venu, des la visite suivante",
    /PUBLICATION-NEUVE-TEST/.test(apres),
    "le nouveau maire n'est pas a l'ecran : " + apres.slice(0, 400).replace(/\n+/g, " / "));
  verif("invariant 9 — un fichier non recu apres une nouvelle publication reste lisible, et l'ecran dit qu'il date d'une publication precedente",
    /PUBLICATION-NEUVE-TEST/.test(precedente) && /date d'une publication précédente/.test(precedente),
    precedente.slice(0, 400).replace(/\n+/g, " / "));
}

/* LE PREMIER ECRAN A BESOIN DU RESUME DU VOTE : « Aujourd'hui » affiche
   déjà la position du député. En revanche, le fichier des mandats reste différé
   jusqu'à « Qui décide ». */
verif("architecture — le fichier des deputes est demande une fois, apres le premier ecran",
  adresses.filter(u => /\/data\/deputes\.json$/.test(u)).length === 1
  && adresses.indexOf(adresses.find(u => /deputes\.json$/.test(u)))
     > adresses.indexOf(adresses.find(u => /index\.json$/.test(u))),
  adresses.join(" ") || "(aucune adresse relevee)");

console.log("\n--- les votes du depute --------------------------------------");
/* La chaîne départementale du vote peut être chargée par « Aujourd'hui » :
   c'est précisément l'information affichée au premier écran. Elle reste
   strictement départementale, jamais communale. */
const avantDepliage = adresses.slice();
verif("architecture — les votes restent demandes par departement, jamais par commune",
  avantDepliage.filter(u => /\/data\/scrutins\//.test(u)).every(u => /\/data\/scrutins\/64\.json$/.test(u))
  && !avantDepliage.some(u => /\/data\/scrutins-details\//.test(u)),
  avantDepliage.filter(u => /scrutins/.test(u)).join(" ") || "(aucune adresse de vote)");

const deplie = page.getByRole("button", { name: /Comment .+ a voté à l'Assemblée/ });
const aUnDepliant = await deplie.count();
verif("parcours — la fiche du depute propose de voir ses votes", aUnDepliant === 1, String(aUnDepliant));
if (aUnDepliant === 1) {
  await deplie.click();
  await page.waitForTimeout(1200);
  const votes = await page.evaluate(() => {
    const b = document.querySelector(".votes");
    return b ? b.innerText : "";
  });

  verif("produit — les votes s'affichent, dates et positions",
    /\d{1,2} \w+ 202\d/.test(votes)
    && /a voté (pour|contre|l'abstention)|ne porte pas de position sur ce scrutin/.test(votes),
    votes.slice(0, 300).replace(/\n+/g, " / "));

  /* LA POSITION EST UNE PHRASE, ET LE DEPUTE Y EST NOMME. Mesure du 14/09 : dans
     une case de verdict alignee a droite, « Abstention » se lisait comme le
     RESULTAT du scrutin, et huit verdicts alignes faisaient une affiche. Ce
     controle refuse le retour de la case : la position doit apparaitre dans une
     phrase qui porte un sujet. */
  verif("produit — la position du depute est une phrase, jamais une case de verdict",
    /\S+ a voté (pour|contre|l'abstention)\./.test(votes)
    || /ne porte pas de position sur ce scrutin/.test(votes),
    votes.slice(0, 200).replace(/\n+/g, " / "));
  verif("produit — « position non portée » n'est plus affiche comme un verdict",
    !/^\s*Position non portée\s*$/m.test(votes), "");

  /* Chaque LIGNE doit pouvoir etre verifiee par le lecteur lui-meme. On ne
     ramasse que les liens des lignes de scrutin : le bloc porte aussi le lien
     de sa source, qui vise le jeu de donnees et pas un scrutin. */
  const liens = await page.evaluate(() =>
    [...document.querySelectorAll(".votes .ligne a")].map(a => a.href));
  verif("invariant 4 — chaque scrutin affiche renvoie au scrutin officiel",
    liens.length > 0 && liens.every(h => /^https:\/\/www\.assemblee-nationale\.fr\/dyn\/17\/scrutins\/\d+$/.test(h)),
    liens.slice(0, 2).join(" ") || "(aucun lien)");

  verif("invariant 4 — les votes portent leur producteur, leur licence et leur date",
    /Assemblée nationale/.test(votes) && /Licence Ouverte/.test(votes) && /relevé le \d/.test(votes),
    votes.slice(-300).replace(/\n+/g, " / "));

  /* INVARIANT 3, ET C'EST LA QU'IL SE JOUE. Un ecran de votes est l'endroit ou
     un compteur s'invite tout seul : « a vote 12 fois pour », « present a 80 % ».
     Rien de tel ne doit apparaitre, meme en toutes lettres. */
  /* LA MESURE PORTE SUR LES LIGNES DE SCRUTIN, PAS SUR LA NOTE EN BAS.
     Ecrite sur tout le bloc, elle echouait sur la phrase qui explique justement
     qu'une position non portee n'est pas une absence — le controle refusait le
     mot qui sert a ne pas compter les absences. Il porte donc la ou un compteur
     s'inviterait vraiment : les lignes. */
  const lignesVotes = await page.evaluate(() =>
    [...document.querySelectorAll(".votes .ligne")].map(e => e.innerText).join("\n"));
  verif("invariant 3 — aucun compte, aucun taux, aucun rang sur les lignes de vote",
    !/\d+\s*%/.test(lignesVotes)
    && !/\b(fois (pour|contre)|taux|assiduité|absentéisme|classement|score|moyenne|rang)\b/i.test(lignesVotes),
    lignesVotes.replace(/\n+/g, " / ").slice(0, 400));

  /* Deux fichiers, pas plus, et jamais un par depute ni un par commune. */
  const demandes = adresses.filter(u => /\/data\/scrutins/.test(u));
  verif("invariant 2 — les votes se demandent par departement, jamais par commune ni par depute",
    demandes.length === 2
    && demandes.some(u => /\/data\/scrutins\.json$/.test(u))
    && demandes.some(u => /\/data\/scrutins\/\d{2,3}\.json$/.test(u))
    && !demandes.some(u => /\d{5}|PA\d+/.test(u)),
    demandes.join(" ") || "(aucune)");

  /* Replier puis redeplier ne doit rien redemander : le fichier est en magasin. */
  await page.getByRole("button", { name: "Replier" }).click();
  await page.waitForTimeout(200);
  await page.getByRole("button", { name: /Comment .+ a voté à l'Assemblée/ }).click();
  await page.waitForTimeout(800);
  verif("architecture — rouvrir les votes ne redemande rien au reseau",
    adresses.filter(u => /\/data\/scrutins/.test(u)).length === 2,
    adresses.filter(u => /scrutins/.test(u)).join(" "));
}

/* Le titre de l'onglet suit le lecteur : deux onglets ouverts sur deux communes
   etaient indiscernables dans la barre du navigateur, et un signet ne disait
   rien. Il ne porte que ce qui est deja a l'ecran. */
const titre = await page.title();
verif("orientation — le titre de l'onglet nomme la commune ouverte",
  /^Ustaritz — Repère$/.test(titre), titre);

/* INVARIANT 2 encore : le magasin IndexedDB ne doit contenir QUE des paquets
   departementaux. C'est la condition qui rend son usage acceptable. */
const magasins = await page.evaluate(async () => {
  if (!indexedDB.databases) return { inconnu: true };
  const bases = await indexedDB.databases();
  const sortie = { bases: bases.map(b => b.name), cles: [] };
  const db = await new Promise(r => { const q = indexedDB.open("repere-donnees"); q.onsuccess = () => r(q.result); q.onerror = () => r(null); });
  if (db) {
    sortie.magasins = [...db.objectStoreNames];
    if (db.objectStoreNames.contains("departements")) {
      sortie.cles = await new Promise(r => {
        const d = db.transaction("departements").objectStore("departements").getAllKeys();
        d.onsuccess = () => r(d.result); d.onerror = () => r([]);
      });
    }
    db.close();
  }
  return sortie;
});
verif("invariant 2 — un seul magasin, et il ne porte que des paquets departementaux",
  !magasins.inconnu
  && (magasins.magasins || []).every(m => m === "departements")
  /* "reg" rejoint dep/vote/socle le 22/09/2026 : le conseil regional, range
     par region (deux chiffres), meme garde que store.js. */
  && (magasins.cles || []).every(c => /^(dep|vote|reg|proj|socle):[0-9A-Z]{1,3}$/.test(c)),
  JSON.stringify(magasins));

console.log("\n--- l'argent -------------------------------------------------");
/* LA COMMUNE EST CHOISIE UNE FOIS. Avant, chaque onglet portait sa propre
   recherche et sa propre selection : passer de « Qui decide » a « Ou va
   l'argent » ramenait un ecran vide, et il fallait rechoisir. On change donc
   d'onglet SANS rien reselectionner, et on exige que les comptes de la meme
   commune soient la. */
await page.getByRole("button", { name: "Où va l'argent" }).click();
await page.waitForTimeout(900);
const memeCommune = await page.evaluate(() => document.body.innerText);
verif("parcours — la commune choisie survit au changement d'onglet",
  /Ustaritz/.test(memeCommune) && /Ce qu'elle encaisse/.test(memeCommune),
  memeCommune.slice(0, 160).replace(/\n+/g, " / "));

const argent = await page.evaluate(() => {
  const t = document.body.innerText;
  const barres = [...document.querySelectorAll(".barre i")].map(i => Math.round(i.getBoundingClientRect().width));
  return { t, barres, nulles: barres.filter(w => w === 0).length };
});
verif("rendu — les comptes sont traduits, pas seulement affiches",
  /mois de recettes/.test(argent.t) && /€ de salaires/.test(argent.t), "aucun rapport interne affiche");
verif("invariant 4 — un calcul est annonce comme un calcul",
  /ce n'est pas un chiffre publié/i.test(argent.t), "la mention manque : un calcul passerait pour une donnee officielle");
/* Le lecteur doit pouvoir separer d'un coup d'oeil ce qui est publie de ce que
   Repere deduit : les deux cartes portent une etiquette, et elles different. */
verif("invariant 4 — donnee officielle et calcul Repere sont etiquetes differemment",
  /DONNÉE OFFICIELLE/i.test(argent.t) && /CALCUL REPÈRE/i.test(argent.t),
  argent.t.slice(0, 200).replace(/\n+/g, " / "));
verif("invariant 5 — aucune barre de largeur nulle",
  argent.barres.length > 0 && argent.nulles === 0,
  argent.barres.length + " barre(s), " + argent.nulles + " a zero pixel");

/* INVARIANT 3 : aucune comparaison entre territoires nulle part dans le rendu. */
const classement = argent.t.match(/classement|palmar|moyenne nationale|mieux que|top \d/i);
verif("invariant 3 — aucun classement ni comparaison entre territoires",
  classement === null, classement ? classement[0] : "");

/* COMPTES DEPARTEMENTAUX ET REGIONAUX — BLOCKER #2 DE LA MISSION DU
 * 22/09/2026. Ustaritz est dans le departement 64 (Pyrenees-Atlantiques),
 * region Nouvelle-Aquitaine — verifie par recoupement de population dans
 * extract-html.js, jamais copie sans preuve. Ce controle echoue si
 * l'extraction casse (comptes_departement dans le paquet, comptes-regions.json
 * a part) ou si l'ecran perd un echelon qu'il vient de gagner. */
await page.waitForTimeout(600);   // chargerComptesRegions() est asynchrone
const argentTerritoires = await page.evaluate(() => document.body.innerText);
const argentTerritoiresBrut = await texteSansCapitales(page);
verif("comptes — le departement de la commune choisie est nomme et traduit",
  /Pyrénées-Atlantiques/.test(argentTerritoires),
  argentTerritoires.slice(0, 400).replace(/\n+/g, " / "));
verif("comptes — la region de ce departement est nomee et traduite",
  /Nouvelle-Aquitaine/.test(argentTerritoires),
  argentTerritoires.slice(0, 400).replace(/\n+/g, " / "));
const nbCalculRepere = (argentTerritoires.match(/CALCUL REPÈRE/gi) || []).length;
verif("comptes — trois echelons calcules (commune, departement, region), pas un seul",
  nbCalculRepere >= 3, "seulement " + nbCalculRepere + " etiquette(s) « Calcul Repere » trouvee(s)");
verif("invariant 3 — les comptes du departement et de la region ne comparent aucun territoire entre eux",
  !/classement|palmar|moyenne nationale|mieux que|top \d/i.test(argentTerritoires),
  "un mot de comparaison est apparu avec les nouveaux echelons");

console.log("\n--- calendrier citoyen (Senat + Assemblee nationale) ----------");
/* PILOTE DU 17/09/2026 (Senat), ETENDU LE 23/09/2026 (Assemblee nationale) :
 * deux echelons publies, aucune commune requise pour l'ouvrir — comme
 * « Sources ». Les deux donnees sont des instantanes deja ecrits dans
 * mono/data/ au moment de l'extraction (calendrier-senat.mjs,
 * agenda-an.mjs) : ce controle ne touche jamais le reseau des vraies
 * institutions, il lit ce que le build a deja capture. */
await page.getByRole("button", { name: "Le calendrier", exact: true }).click();
await page.waitForTimeout(900);
const cal = await page.evaluate(() => document.body.innerText);
const calBrut = await texteSansCapitales(page);
verif("calendrier — l'ecran s'ouvre sans commune choisie",
  /Ce qui se passe prochainement/.test(cal), cal.slice(0, 160).replace(/\n+/g, " / "));
verif("calendrier — au moins un evenement reel est affiche",
  /Sénat/.test(cal) && /\d{4}/.test(cal), "aucune date ni producteur trouve");
verif("invariant 4 — le calendrier porte son producteur et sa date de releve",
  /Sénat/.test(cal) && /relevé le/i.test(cal), cal.slice(-500).replace(/\n+/g, " / "));
/* LA LICENCE N'EST PAS ACQUISE, ET L'ECRAN DOIT LE DIRE PLUTOT QUE L'OMETTRE
 * OU L'INVENTER — voir le commentaire de calendrier-senat.mjs. Un ecran qui
 * n'afficherait aucune mention de licence serait un manquement a
 * l'invariant 4 tout autant qu'une licence devinee. */
/* 07/10/2026 : CE CONTROLE DEPEND DE CE QUE LE BUILD CONTIENT, ET IL LE DIT.
   Si le releve du Senat manque (panne du site le jour de la collecte) ou ne porte
   aucune seance a venir, l'ecran ne cite pas sa licence — il doit alors DIRE
   l'absence. Le controle verifie le comportement attendu dans chaque cas au lieu
   d'echouer sur un etat du fournisseur ; l'etat est annonce dans le journal. */
const fSenReel = path.join(DIST, "data", "calendrier-senat.json");
const senatAVenir = (() => {
  if (!fs.existsSync(fSenReel)) return null;
  const j = JSON.parse(fs.readFileSync(fSenReel, "utf8"));
  const m = new Date().toISOString().slice(0, 16);
  return (j.evenements || []).filter(e => e.debut >= m).length;
})();
if (senatAVenir === null) console.log("::warning::calendrier du Senat absent du build : l'ecran doit dire son absence (controle ci-dessous)");
if (senatAVenir) {
  verif("invariant 4 — la licence non confirmee est dite, pas devinee ni omise",
    /non précisée/i.test(cal), "la mention de licence non confirmee est absente de l'ecran");
} else {
  verif("calendrier — sans seance du Senat a afficher, l'ecran le dit au lieu de l'omettre",
    senatAVenir === null ? /calendrier du Sénat n'est pas disponible/.test(cal) : /calendrier du Sénat ne contient aucune séance à venir/.test(cal),
    cal.slice(-500).replace(/\n+/g, " / "));
}

/* LES DEUX INSTITUTIONS, DANS LE MEME ECRAN. Le controle porte sur des
 * proprietes structurelles (l'institution est nommee, la categorie « Séance
 * publique » apparait, une seconde licence distincte est citee) plutot que
 * sur l'intitule exact d'une seance — celui-ci change chaque jour avec le
 * vrai agenda, un texte fige dans le test deviendrait faux sans que rien ne
 * le signale. */
verif("calendrier — l'Assemblee nationale apparait aux cotes du Senat",
  /Assemblée nationale/.test(cal), cal.slice(0, 400).replace(/\n+/g, " / "));
verif("calendrier — au moins une seance publique de l'Assemblee est nommee",
  /Séance publique/.test(cal), "aucune categorie « Séance publique » trouvee");
verif("invariant 4 — la source Assemblee nationale porte sa propre licence",
  /Licence ouverte/.test(cal), "la licence de l'Assemblee n'apparait pas separement de celle du Senat");

console.log("\n--- scrutins solennels : couche d'exploration -----------------");
/* HYBRIDE, PAS UN ECRAN A PART (decision produit, 23/09/2026). Le teaser
 * doit etre visible SANS action (couche 1), le detail complet SEULEMENT
 * apres le clic (couche 2) - ce test verifie les deux etats, pas
 * seulement le premier, et verifie explicitement qu'AVANT le clic les
 * chiffres pour/contre/abstentions ne sont PAS deja charges (sinon
 * l'architecture hybride mesuree n'est qu'une illusion visuelle). */
const avantClic = await page.evaluate(() => document.body.innerText);
verif("scrutins — le teaser des scrutins recents est visible sans action",
  /Les derniers scrutins importants/.test(avantClic) && /Scrutin solennel|Motion de censure/.test(avantClic),
  avantClic.slice(-500).replace(/\n+/g, " / "));
verif("scrutins — chaque ligne du teaser porte deja un lien source direct",
  /source officielle/.test(avantClic), "aucun lien source direct trouve dans le teaser");
verif("invariant hybride — le detail complet (pour/contre) n'est PAS charge avant le clic",
  !/Pour : \d+ · Contre/.test(avantClic),
  "les chiffres detailles apparaissent AVANT le clic : la couche 2 n'est plus separee de la couche 1");

/* Le NOM du bouton change avec son etat (« Voir » -> « Masquer ») : un
   locator resolu sur le nom exact avant le clic ne retrouverait plus rien
   apres, puisque son texte a change - piege reel, rencontre en ecrivant
   ce test. Le regex couvre les deux etats du meme bouton. */
const boutonDetails = page.getByRole("button", { name: /Voir les détails complets|Masquer les détails complets/ });
/* UN ELEMENT ABSENT EST UN ECHEC NOMME, PAS UN ARRET DU BANC — 29/09/2026.
   Mesure en local, donnees sans scrutins solennels : `getAttribute` attendait
   30 s un bouton qui n'existait pas, puis levait une exception qui arretait le
   banc au 52e controle. Les controles suivants — accents, sources, invariant 1
   hors ligne — ne tournaient plus du tout, sans qu'aucune ligne ne le dise.
   Les quatre controles du bouton echouent desormais par leur nom, et le banc
   continue. Rien n'est assoupli : un bouton absent reste un echec. */
const boutonPresent = (await boutonDetails.count()) > 0;
verif("scrutins — le bouton de details existe", boutonPresent, "aucun bouton « Voir les détails complets »");
if (boutonPresent) {
  verif("scrutins — le bouton de details annonce son etat ferme (aria-expanded=false)",
    await boutonDetails.getAttribute("aria-expanded") === "false", "aria-expanded n'est pas 'false' avant le clic");
  await boutonDetails.click();
  await page.waitForTimeout(600);
  verif("scrutins — le bouton annonce son etat ouvert apres le clic (aria-expanded=true)",
    await boutonDetails.getAttribute("aria-expanded") === "true", "aria-expanded n'est pas passe a 'true'");
  const apresClic = await page.evaluate(() => document.body.innerText);
  verif("scrutins — le detail complet (pour/contre/abstentions) apparait apres le clic",
    /Pour : \d+ · Contre : \d+ · Abstentions : \d+/.test(apresClic),
    apresClic.slice(-600).replace(/\n+/g, " / "));
  /* Le clavier doit pouvoir tout faire : la cible du focus ne doit pas se
     perdre quand le contenu change sous elle. */
  const focusApres = await page.evaluate(() => document.activeElement.textContent);
  verif("accessibilite — le focus reste sur le bouton apres le chargement du detail",
    /Masquer les détails complets/.test(focusApres || ""), "le focus a quitte le bouton : " + focusApres);
}

/* La langue : le francais affiche porte ses accents. Faute commise deux fois.
   La mesure ne portait que sur l'ecran des comptes ; l'ecran « Sources », lui,
   affichait « Ministere de l'Interieur ... circonscription legislative » recopie
   tel quel depuis le fichier engendre. On lit donc les TROIS ecrans. */
await page.getByRole("button", { name: "Sources" }).click();
await page.waitForTimeout(700);
const texteSources = await page.evaluate(() => document.body.innerText);
const texteSourcesBrut = await texteSansCapitales(page);
verif("rendu — l'ecran Sources nomme chacun de ses producteurs",
  /Élus —/.test(texteSources) && /Comptes —/.test(texteSources)
  && /Circonscriptions —/.test(texteSources) && /Députés —/.test(texteSources),
  texteSources.slice(0, 260).replace(/\n+/g, " / "));
/* Le decoupage et les mandats ont deux producteurs DIFFERENTS. Une ligne unique
   laisserait croire que le ministere publie le nom des deputes. */
verif("rendu — le decoupage et les mandats ne sont pas donnes comme une seule source",
  /Circonscriptions — Ministère de l'Intérieur/.test(texteSources)
  && /Députés — Assemblée nationale/.test(texteSources),
  texteSources.slice(0, 260).replace(/\n+/g, " / "));
verif("rendu — aucune date de decoupage annoncee comme une mise a jour",
  !/mise à jour du découpage/i.test(texteSources), "« mise a jour du decoupage de 2010 » ne veut rien dire");

/* MENTIONS LEGALES — POSEES LE 22/09/2026 (BLOCKER #1, MISSION PHASE 3).
 *
 * "Une simple occurrence textuelle ne suffit pas — le contenu doit etre
 * reellement accessible depuis l'app." Le premier controle mesure donc le
 * TITRE, visible sans rien deplier (une carte de l'ecran Sources, pas un
 * repli dans un repli comme sur le site de reference). Le second clique
 * reellement sur le <details> et relit le DOM APRES l'ouverture : du texte
 * present dans le JSX mais jamais rendu visible ne passerait pas ce controle,
 * parce qu'un <details> ferme n'entre pas dans document.body.innerText. */
verif("mentions legales — le titre est visible sur l'ecran Sources sans rien deplier",
  /Mentions légales, CGU et confidentialité/.test(texteSources),
  texteSources.slice(0, 300).replace(/\n+/g, " / "));

await page.locator("#mentions-legales > summary").click();
await page.waitForTimeout(300);
const texteLegal = await page.evaluate(() => document.body.innerText);
verif("mentions legales — le contenu s'ouvre reellement au clic, pas seulement present dans le code source",
  /Éditeur\./.test(texteLegal) && /repere\.departement/.test(texteLegal) && /repere-donnees/.test(texteLegal),
  "editeur/repere.departement/repere-donnees absents du texte une fois le repli ouvert");
verif("mentions legales — le contact correspond a celui affiche ailleurs sur Sources",
  /repere0@protonmail\.com/.test(texteLegal), "adresse de contact absente du bloc legal");
/* GARDE CONTRE UNE PROMESSE NON TENUE (meme defaut que celui corrige sur le
   site de reference le 22/09/2026, ligne 3203 de app_repere_v18_20.html) :
   mono/ n'est deploye nulle part publiquement et ne tient pas de journal des
   corrections aujourd'hui — nommer un hebergeur reel ou promettre ce journal
   serait une fausse declaration, pas une erreur mineure. */
verif("mentions legales — aucun hebergeur non deploye n'est affirme comme reel",
  !/Netlify/i.test(texteLegal), "mono ne doit pas nommer un hebergeur qu'il n'utilise pas encore");

/* LE TEXTE EST AUSSI LU SANS LES CAPITALES DE STYLE — 29/09/2026 : sous
   `text-transform: uppercase`, « DEPUTE » echappait a la recherche de
   « depute ». Le site a quatre classes en capitales (.eyebrow, .tag, .tuile-k,
   .quest-lieu). Voir texteSansCapitales. */
const vuPartout = argentTerritoires + "\n" + texteSources + "\n" + texteLegal + "\n" + qui + "\n" + cal
  + "\n" + argentTerritoiresBrut + "\n" + texteSourcesBrut + "\n" + quiBrut + "\n" + calBrut;
const sansAccent = MOTS_A_ACCENTS.filter(m =>
  new RegExp("(?:^|[^A-Za-zÀ-ÿ./-])" + m + "(?![A-Za-zÀ-ÿ./-])").test(vuPartout));
verif("langue — le francais affiche porte ses accents, sur les trois ecrans",
  sansAccent.length === 0, sansAccent.join(", "));

await page.getByRole("button", { name: "Où va l'argent" }).click();
await page.waitForTimeout(500);

console.log("\n--- cibles tactiles et accessibilite -------------------------");
/* `.mot` EXCLU, ET C'EST L'EXCEPTION DE LA NORME ELLE-MEME, PAS UN CONTOURNEMENT.
 * WCAG 2.5.8 (cible minimale) ecrit explicitement : « la taille de la cible
 * n'est pas contrainte quand la cible est dans une phrase ou un bloc de
 * texte. » Un mot souligne au milieu d'une phrase ne peut pas mesurer 44 px
 * de haut sans casser l'interligne de tout le paragraphe autour de lui — la
 * meme exception couvre deja les liens de definition du monolithe (`.gl`). */
const petites = await page.evaluate(() =>
  [...document.querySelectorAll("button:not(.mot), a[href]:not(.mot), input")]
    .map(e => ({ h: Math.round(e.getBoundingClientRect().height), t: (e.innerText || e.type || "").slice(0, 20) }))
    .filter(e => e.h > 0 && e.h < 44));
verif("accessibilite — toute cible tactile mesure au moins 44 px",
  petites.length === 0, petites.slice(0, 4).map(p => p.t + " (" + p.h + "px)").join(" | "));

console.log("\n--- entree directe par commune -------------------------------");
/* LE PARCOURS DE LA BETA : « j'habite a Bagnolet », et rien d'autre.
 *
 * Trois etapes du parcours sur dix n'existaient que parce que les fichiers sont
 * decoupes par departement. Ce controle mesure qu'elles ont disparu — et surtout
 * que leur disparition n'a rien coute a l'invariant : le reseau ne doit voir
 * partir qu'un fichier DEPARTEMENTAL, jamais une adresse portant le code de la
 * commune cherchee. */
const ctxDirect = await nav.newContext({ viewport: { width: 390, height: 844 } });
const pageDirect = await ctxDirect.newPage();
const vues = [];
pageDirect.on("request", r => { const u = new URL(r.url()); if (u.pathname.startsWith("/data")) vues.push(u.pathname); });
await pageDirect.goto(base, { waitUntil: "networkidle" });

/* Le premier ecran ne doit plus poser cent six choix : un champ, et une ligne
   repliee pour qui veut parcourir. `checkVisibility` et pas le rectangle : les
   enfants d'un <details> ferme ont une boite, ils ne sont pas visibles pour
   autant — et c'est cette confusion qui avait fausse la premiere mesure. */
const cibles = await pageDirect.evaluate(() =>
  [...document.querySelectorAll("a,button,input,summary")]
    .filter(e => e.checkVisibility({ checkVisibilityCSS: true, contentVisibilityAuto: true })).length);
verif("parcours — le premier ecran ne pose plus qu'une question", cibles <= 4,
  cibles + " cibles visibles a l'ouverture (etaient 106)");

await pageDirect.getByLabel(/Où habitez-vous/).fill("bagnolet");
await pageDirect.waitForTimeout(300);
const propositions = await pageDirect.evaluate(() =>
  [...document.querySelectorAll(".entree .liste .puce")].map(e => e.innerText.replace(/\n+/g, " ")));
verif("parcours — une commune se trouve sans connaitre son departement",
  propositions.length === 1 && /Bagnolet/.test(propositions[0]) && /Seine-Saint-Denis/.test(propositions[0]),
  JSON.stringify(propositions));

/* L'ORDRE DES RESULTATS. Defaut trouve a l'oeil : « paris » proposait
   Cormeilles-en-Parisis, Fontenay-en-Parisis, puis Paris — la commune la plus
   peuplee de France arrivait troisieme sur son propre nom, parce que « paris »
   est le debut du mot « Parisis » et que l'ordre etait alphabetique. */
await pageDirect.getByLabel(/Où habitez-vous/).fill("paris");
await pageDirect.waitForTimeout(300);
const ordreParis = await pageDirect.evaluate(() =>
  [...document.querySelectorAll(".entree .liste .puce")].map(e => e.innerText.split("\n")[0].trim()));
verif("recherche — le nom exact passe devant les noms qui le contiennent",
  ordreParis[0] === "Paris", JSON.stringify(ordreParis.slice(0, 3)));

await pageDirect.getByLabel(/Où habitez-vous/).fill("bagnolet");
await pageDirect.waitForTimeout(300);
await pageDirect.getByRole("button", { name: /Bagnolet/ }).click();
await pageDirect.waitForTimeout(900);
/* « Aujourd'hui » est le point d'entrée : les élus restent une exploration
   explicite, comme dans le parcours de décembre. */
await pageDirect.getByRole("button", { name: "Qui décide", exact: true }).click();
await pageDirect.waitForTimeout(900);
const arrive = await pageDirect.evaluate(() => document.body.innerText);
verif("parcours — un geste ouvre la commune, puis « Qui décide » expose ses élus",
  /Bagnolet/.test(arrive) && /Maire/.test(arrive) && /Assemblée nationale/.test(arrive),
  arrive.slice(0, 160).replace(/\n+/g, " / "));

/* L'INVARIANT N'A PAS ETE PAYE POUR CETTE COMMODITE. */
const fautivesDirect = vues.filter(adresseFautive);
verif("invariant 2 — l'entree par commune ne fait fuiter aucun code de commune",
  fautivesDirect.length === 0 && vues.some(u => /\/data\/departments\/93\.json$/.test(u)),
  vues.join(" "));
await ctxDirect.close();

console.log("\n--- aujourd'hui : fraicheur de la semaine ----------------------");
/* PROUVE LE BLOC "Quoi d'autre cette semaine ?" (Aujourdhui.jsx) EN LE
   FORCANT A APPARAITRE. Avec les donnees reelles/fixtures d'aujourd'hui,
   ce bloc est INERT la plupart du temps : le dernier vote solennel date du
   21/07/2026, le dernier fait editorial du 14/08/2026, et les projets sont
   dates de fin d'exercice 2024/2025 — tous hors d'une fenetre de sept jours
   depuis longtemps. C'est un choix delibere (ne pas paraitre plus actif que
   la donnee reelle ne l'est), mais ca veut dire qu'un banc qui ne visite
   jamais ce cas ne prouverait rien : on injecte donc UN fait editorial
   national date d'aujourd'hui, on verifie qu'il apparait avec sa source, et
   on restaure le fichier avant la fin du bloc. */
const fEvenements = path.join(DIST, "data", "evenements.json");
const evenementsOriginal = fs.readFileSync(fEvenements, "utf8");
const ctxAuj = await nav.newContext({ viewport: { width: 390, height: 844 } });
const pageAuj = await ctxAuj.newPage();
try {
  const evMute = JSON.parse(evenementsOriginal);
  evMute.r = [...evMute.r, {
    id: "banc-fraicheur-semaine", t: "Fait de banc pour prouver la fraicheur de la semaine",
    d: new Date().toISOString().slice(0, 10), e: "france",
    src: "https://exemple.test/banc", srcn: "Source de banc", conf: "verifie", insee: "",
  }];
  fs.writeFileSync(fEvenements, JSON.stringify(evMute));

  await pageAuj.goto(base, { waitUntil: "networkidle" });
  await pageAuj.getByLabel(/Où habitez-vous/i).fill("64");
  await pageAuj.waitForTimeout(300);
  await pageAuj.getByRole("button", { name: /^64\b/ }).click();
  await pageAuj.waitForTimeout(800);
  await pageAuj.getByLabel(/Votre commune/i).fill("Ustaritz");
  await pageAuj.waitForTimeout(300);
  await pageAuj.getByRole("button", { name: "Ustaritz", exact: true }).click();
  await pageAuj.waitForTimeout(700);
  /* « Aujourd'hui » est désormais l'écran ouvert après le choix de la commune. */
  await pageAuj.waitForTimeout(900);
  const texteAuj = await pageAuj.evaluate(() => document.body.innerText);
  verif("aujourd'hui — le bloc de fraicheur hebdomadaire apparait quand un fait recent existe",
    /Quoi d.autre cette semaine/.test(texteAuj)
    && /Fait de banc pour prouver la fraicheur de la semaine/.test(texteAuj),
    texteAuj.slice(0, 300).replace(/\n+/g, " / "));
  verif("invariant 4 — le fait de la semaine porte sa propre source",
    /Source de banc/.test(texteAuj) && /voir à la source/.test(texteAuj),
    texteAuj.slice(0, 300).replace(/\n+/g, " / "));
} finally {
  fs.writeFileSync(fEvenements, evenementsOriginal);
  await ctxAuj.close();
}

console.log("\n--- retention : depuis votre derniere visite -------------------");
/* PROUVE TROIS CHOSES DISTINCTES, PAS UNE SEULE : (1) un ancien lecteur dont
   le stockage porte encore l'ancien format (une chaine nue de departement,
   pose avant le 23/09/2026) continue de fonctionner — aucune migration
   silencieuse ne doit le faire echouer ; (2) une fois un instant de visite
   REEL enregistre, le calcul compare bien A CET INSTANT, pas a une fenetre
   fixe — un fait plus vieux que la visite reste EXCLU, un fait plus recent
   apparait ; (3) la cle reste unique et ne porte toujours qu'un departement
   et un instant, jamais une commune (verifie plus haut, invariant 2). */
console.log("  (1) compatibilite avec l'ancien format — une chaine nue)");
const ctxAncien = await nav.newContext({ viewport: { width: 390, height: 844 } });
const pageAncien = await ctxAncien.newPage();
await pageAncien.addInitScript(() => localStorage.setItem("repere.departement", "64"));
await pageAncien.goto(base, { waitUntil: "networkidle" });
await pageAncien.waitForTimeout(1200);
const texteAncien = await pageAncien.evaluate(() => document.body.innerText);
verif("retention — l'ancien format (chaine nue) continue d'ouvrir le bon departement",
  /Pyrénées-Atlantiques/.test(texteAncien),
  texteAncien.slice(0, 200).replace(/\n+/g, " / "));
const stockeApresAncien = await pageAncien.evaluate(() => localStorage.getItem("repere.departement"));
let migre = null;
try { migre = JSON.parse(stockeApresAncien); } catch { /* migre restera null, le controle echouera a raison */ }
verif("retention — l'ancien format est remplace par {d, v} des cette visite, sans perdre le departement",
  migre && migre.d === "64" && typeof migre.v === "string",
  String(stockeApresAncien));
await ctxAncien.close();

console.log("  (2) la comparaison se fait a l'instant de visite REEL, pas a une fenetre fixe");
const hier = new Date(Date.now() - 24 * 60 * 60 * 1000);
const avantHier = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
const fEvenementsRetention = path.join(DIST, "data", "evenements.json");
const evenementsAvantRetention = fs.readFileSync(fEvenementsRetention, "utf8");
const ctxRetention = await nav.newContext({ viewport: { width: 390, height: 844 } });
const pageRetention = await ctxRetention.newPage();
try {
  const evMuteRetention = JSON.parse(evenementsAvantRetention);
  evMuteRetention.r = [...evMuteRetention.r,
    { id: "banc-retention-apres", t: "Fait de banc survenu APRES la derniere visite",
      d: new Date().toISOString().slice(0, 10), e: "france",
      src: "https://exemple.test/banc-apres", srcn: "Source de banc", conf: "verifie", insee: "" },
    { id: "banc-retention-avant", t: "Fait de banc survenu AVANT la derniere visite",
      d: avantHier.toISOString().slice(0, 10), e: "france",
      src: "https://exemple.test/banc-avant", srcn: "Source de banc", conf: "verifie", insee: "" },
  ];
  fs.writeFileSync(fEvenementsRetention, JSON.stringify(evMuteRetention));

  /* L'INSTANT DE VISITE EST INJECTE DIRECTEMENT, PAS REJOUE PAR UN VRAI ALLER-
     RETOUR : ce controle isole le calcul d'affichage (le sujet de ce test),
     pas le mecanisme d'ecriture (deja prouve par le controle (1) ci-dessus et
     par invariant 2 plus haut dans ce fichier). */
  await pageRetention.addInitScript(([cle, valeur]) => localStorage.setItem(cle, valeur),
    ["repere.departement", JSON.stringify({ d: "64", v: hier.toISOString() })]);
  await pageRetention.goto(base, { waitUntil: "networkidle" });
  await pageRetention.waitForTimeout(300);
  await pageRetention.getByLabel(/Votre commune/i).fill("Ustaritz");
  await pageRetention.waitForTimeout(300);
  await pageRetention.getByRole("button", { name: "Ustaritz", exact: true }).click();
  await pageRetention.waitForTimeout(900);
  /* « Aujourd'hui » est déjà l'écran ouvert après le choix de la commune. */

  const texteRetention = await pageRetention.evaluate(() => document.body.innerText);
  verif("retention — le titre annonce la vraie date de la derniere visite, pas une fenetre fixe",
    new RegExp("Depuis votre visite du " + dateFr(hier.toISOString().slice(0, 10))).test(texteRetention),
    texteRetention.slice(0, 200).replace(/\n+/g, " / "));
  verif("retention — un fait survenu apres la derniere visite apparait",
    /Fait de banc survenu APRES la derniere visite/.test(texteRetention),
    texteRetention.slice(0, 300).replace(/\n+/g, " / "));
  verif("retention — un fait survenu avant la derniere visite reste exclu (ni relegue, ni ignore : absent)",
    !/Fait de banc survenu AVANT la derniere visite/.test(texteRetention),
    texteRetention.slice(0, 300).replace(/\n+/g, " / "));
} finally {
  fs.writeFileSync(fEvenementsRetention, evenementsAvantRetention);
  await ctxRetention.close();
}

console.log("\n--- faits editoriaux : grands axes et 2e source ----------------");
/* DONNEES REELLES DU DEPOT (data/evenements/*.md), PAS UNE FIXTURE : ce bloc
   verifie ce qui est reellement servi. Sept faits valides, un huitieme
   (8430, protection des enfants, premiere lecture) VOLONTAIREMENT retenu en
   `valide: false` faute de source citable pour tout le resume. */
const ctxAxes = await nav.newContext({ viewport: { width: 390, height: 844 } });
const pageAxes = await ctxAxes.newPage();
await pageAxes.addInitScript(() => localStorage.setItem("repere.departement", "64"));
await pageAxes.goto(base, { waitUntil: "networkidle" });
await pageAxes.waitForTimeout(400);
await pageAxes.getByLabel(/Votre commune/i).fill("Ustaritz");
await pageAxes.waitForTimeout(300);
await pageAxes.getByRole("button", { name: "Ustaritz", exact: true }).click();
await pageAxes.waitForTimeout(700);
await pageAxes.getByRole("button", { name: "Ce qui a été décidé", exact: true }).click();
await pageAxes.waitForTimeout(1200);
const axes = await pageAxes.evaluate(() => {
  const cartes = [...document.querySelectorAll(".fait")];
  const c = cartes.find(e => e.querySelector(".fait-axes") && /patrimoine immobilier de l.État/.test(e.innerText));
  return {
    texte: document.body.innerText,
    carte: c ? c.innerText : "",
    liens: c ? [...c.querySelectorAll("a")].map(a => a.href) : [],
    nbAxes: document.querySelectorAll(".fait-axes").length,
  };
});
verif("grands axes — le resume pedagogique est affiche (il ne l'etait nulle part avant)",
  /foncière de l.État/.test(axes.carte), axes.carte.slice(0, 200));
verif("grands axes — le fait officiel (scrutin) et l'explication ont deux sources DISTINCTES",
  axes.liens.some(h => /assemblee-nationale\.fr\/dyn\/17\/scrutins\/8434/.test(h))
  && axes.liens.some(h => /senat\.fr\/travaux-parlementaires/.test(h)), axes.liens.join(" | "));
verif("grands axes — la source des axes est nommee a l'ecran",
  /Sénat — La loi en clair/.test(axes.carte), axes.carte.slice(0, 300));
verif("grands axes — le fait sans 2e source (aide a mourir) n'affiche qu'une seule ligne de source, sans bloc vide",
  (() => { const m = axes.texte.split("aide à mourir")[1] || ""; return !/La loi en clair/.test(m.slice(0, 500)); })(),
  "");
verif("grands axes — six faits portent leurs axes, aucun bloc vide",
  axes.nbAxes >= 7 && !/undefined|null/.test(axes.texte), String(axes.nbAxes));
verif("censure — 8431 distingue ce qui a ete vote de ce que le Conseil constitutionnel a censure",
  /a censuré cette disposition le 14 août 2026 \(décision n° 2026-911 DC\)/.test(axes.texte),
  axes.texte.slice(0, 200));
verif("neutralite — 8433 decrit des mesures sans qualificatif d'opinion",
  /délit d.inhalation de protoxyde d.azote/.test(axes.texte)
  && !/(dangereu|liberticide|nécessaire|indispensable|scandaleu|efficace)/i.test(axes.carte + axes.texte.split("protoxyde")[1]?.slice(0, 600)),
  "");
verif("premiere lecture — 8430 n'est PAS publie tant que son resume n'est pas valide",
  !/transmis au Sénat le 22 juillet 2026/.test(axes.texte), "");
await ctxAxes.close();

console.log("\n--- retention avec les faits reels : 0, quelques-unes, plusieurs -");
async function auj(marqueur) {
  const c = await nav.newContext({ viewport: { width: 390, height: 844 } });
  const p = await c.newPage();
  await p.addInitScript(([k, v]) => localStorage.setItem(k, v),
    ["repere.departement", JSON.stringify({ d: "64", v: marqueur })]);
  await p.goto(base, { waitUntil: "networkidle" });
  await p.waitForTimeout(400);
  await p.getByLabel(/Votre commune/i).fill("Ustaritz");
  await p.waitForTimeout(300);
  await p.getByRole("button", { name: "Ustaritz", exact: true }).click();
  await p.waitForTimeout(1000);
  const t = await p.evaluate(() => document.body.innerText);
  await c.close();
  return t;
}
const zero = await auj("2026-09-01T10:00:00.000Z");
verif("retention (0 nouveaute) — rien de nouveau depuis la visite : aucun bloc, aucun « 0 », aucune fausse nouveaute",
  !/Depuis votre visite/.test(zero) && !/\b0 nouveaut/.test(zero), zero.slice(0, 300).replace(/\n+/g, " / "));
/* 28/09/2026 : une absence produit une phrase. Avant, le lecteur revenu voyait
   la meme page qu'au premier passage, sans rien qui lui dise qu'aucun fait
   n'avait ete publie depuis. */
verif("retention (0 nouveaute) — le dit en une phrase datee, sans alarme",
  /Rien de nouveau depuis votre visite du 1er septembre 2026 : aucune décision datée n.a été publiée pour Ustaritz entre-temps\. Voici la plus récente\./.test(zero),
  zero.slice(0, 300).replace(/\n+/g, " / "));
const quelques = await auj("2026-07-20T10:00:00.000Z");
verif("retention (quelques) — depuis le 20/07 : les faits du 21/07 apparaissent, ceux du 20/07 non",
  /Depuis votre visite du 20 juillet 2026/.test(quelques)
  && /phénomènes troublant l.ordre public/.test(quelques)
  && !/montagne vivante et souveraine/.test(quelques.split("Depuis votre visite")[1] || ""),
  quelques.slice(0, 300).replace(/\n+/g, " / "));
const plusieurs = await auj("2026-07-01T10:00:00.000Z");
const bloc = (plusieurs.split("Depuis votre visite du")[1] || "");
verif("retention (plusieurs) — le bloc reste borne (au plus 4 lignes), calme, sans decompte alarmiste",
  /Depuis votre visite du 1er juillet 2026/.test(plusieurs) && !/\d+ (nouveaut|choses)/i.test(plusieurs)
  && !/[!]/.test(bloc.slice(0, 400)), plusieurs.slice(0, 300).replace(/\n+/g, " / "));
verif("retention — « rien de nouveau » n'apparait JAMAIS quand il y a du nouveau",
  !/Rien de nouveau/.test(quelques) && !/Rien de nouveau/.test(plusieurs), "");

console.log("\n--- aujourd'hui : ce qui arrive, Senat ET Assemblee ------------");
/* 28/09/2026 : « Qu'est-ce qui arrive ? » ne lisait que le Senat. Fixture posee
   dans le build de mesure, puis restauree quoi qu'il arrive. */
{
  const fAN = path.join(DIST, "data", "agenda-an.json");
  const fSen = path.join(DIST, "data", "calendrier-senat.json");
  /* UN FICHIER ABSENT EST UN ECHEC NOMME, PAS UN ARRET DU BANC — 29/09/2026.
     Mesure en local, donnees extraites sans reseau : calendrier-senat.json
     n'existe pas (la chaine le produit en ligne), readFileSync levait ENOENT
     et le banc s'arretait ici, sans que les controles suivants — comptes,
     projets, hors ligne — ne tournent ni ne soient comptes. */
  /* 07/10/2026 : UN RELEVE ABSENT N'ARRETE PLUS CETTE MESURE. Elle porte sur la
     fusion des deux agendas a l'ecran, avec des evenements de banc ; elle n'a
     pas besoin du vrai Senat. Un fichier absent est cree pour la duree de la
     mesure, puis SUPPRIME dans le finally : jamais un agenda de banc laisse
     dans le site construit. L'absence reelle est annoncee, pas tue. */
  const manquants = [fAN, fSen].filter(f => !fs.existsSync(f)).map(f => path.basename(f));
  if (manquants.length) console.log("::warning::absent(s) du build : " + manquants.join(", ") + " — la mesure ci-dessous utilise un squelette temporaire, supprime ensuite");
  const squelette = (producteur) => JSON.stringify({ v: 1, source: { producteur, producteur_affiche: producteur + " — agenda", licence: "fixture de banc", url: "https://example.invalid/", releve_le: "2000-01-01" }, evenements: [] });
  {
  const origAN = fs.existsSync(fAN) ? fs.readFileSync(fAN, "utf8") : null;
  const origSen = fs.existsSync(fSen) ? fs.readFileSync(fSen, "utf8") : null;
  const dans = (j, h) => { const d = new Date(Date.now() + j * 864e5); d.setUTCHours(h, 0, 0, 0); return d.toISOString().slice(0, 16); };
  const avec = (orig, evs) => { const j = JSON.parse(orig || squelette(orig === origAN ? "Assemblée nationale" : "Sénat")); j.evenements = evs; return JSON.stringify(j); };
  const ev = (titre, debut) => ({ titre, debut, fin: null, categorie: "Séance publique", lieu: null, description: null });
  try {
    fs.writeFileSync(fAN, avec(origAN, [ev("Séance de banc AN demain", dans(1, 13))]));
    fs.writeFileSync(fSen, avec(origSen, [ev("Séance de banc Sénat dans deux jours", dans(2, 12)), ev("Séance de banc Sénat dans vingt jours", dans(20, 12))]));
    const t1 = await auj(null);
    const bloc1 = t1.split("Qu'est-ce qui arrive")[1] || "";
    verif("a venir — les deux institutions, dans l'ordre du calendrier",
      /cette semaine \?/.test(bloc1) && bloc1.indexOf("Séance de banc AN demain") >= 0
      && bloc1.indexOf("Séance de banc AN demain") < bloc1.indexOf("Séance de banc Sénat dans deux jours"),
      bloc1.slice(0, 300).replace(/\n+/g, " / "));
    verif("a venir — chaque evenement nomme son institution",
      /Assemblée nationale : Séance de banc AN demain/.test(bloc1) && /Sénat : Séance de banc Sénat dans deux jours/.test(bloc1), "");
    verif("a venir — les dates s'ecrivent comme dans « Ce qui se passe » (jour, quantieme, mois, annee ; jamais « 1 octobre »)",
      /(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche) (1er|\d{1,2}) [a-zéû]+ \d{4} — Assemblée nationale/.test(bloc1)
      && !/\b1 (janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\b/.test(bloc1),
      bloc1.slice(0, 200).replace(/\n+/g, " / "));
    verif("a venir — au-dela de sept jours, rien n'est montre quand la semaine a deja du contenu",
      !/dans vingt jours/.test(bloc1), "");
    verif("invariant 4 — une source par institution affichee, jamais une seule pour deux",
      /Assemblée nationale — agenda/.test(bloc1) && /Sénat — agenda/.test(bloc1), bloc1.slice(0, 400).replace(/\n+/g, " / "));
    fs.writeFileSync(fAN, avec(origAN, []));
    fs.writeFileSync(fSen, avec(origSen, [ev("Séance de banc Sénat dans vingt jours", dans(20, 12))]));
    const t2 = await auj(null);
    verif("a venir — semaine vide : on montre le prochain rendez-vous, sans pretendre qu'il est cette semaine",
      /Qu'est-ce qui arrive \?/.test(t2) && !/arrive cette semaine/.test(t2) && /dans vingt jours/.test(t2),
      (t2.split("Qu'est-ce qui arrive")[1] || "").slice(0, 200).replace(/\n+/g, " / "));
    /* 28/09/2026 : trois auditions de commission remplissaient les trois places,
       l'ouverture de la session de l'Assemblee etait coupee. */
    const aud = (t, j) => ({ ...ev(t, dans(j, 9)), categorie: "Commission des lois" });
    fs.writeFileSync(fSen, avec(origSen, [aud("Audition de banc un", 1), aud("Audition de banc deux", 1), aud("Audition de banc trois", 2)]));
    fs.writeFileSync(fAN, avec(origAN, [ev("Seance publique de banc vendredi", dans(4, 13))]));
    const t3 = await auj(null);
    const bloc3 = t3.split("Qu'est-ce qui arrive")[1] || "";
    verif("a venir — une seance publique n'est jamais coupee par des auditions de commission",
      /Seance publique de banc vendredi/.test(bloc3) && (bloc3.match(/Audition de banc/g) || []).length === 2,
      bloc3.slice(0, 300).replace(/\n+/g, " / "));
    verif("a venir — la regle de choix est ecrite a l'ecran (principe P4), avec le nombre total",
      /3 rendez-vous sur 4 cette semaine\. Les séances publiques passent en premier/.test(bloc3), "");
    verif("a venir — les trois retenus restent dans l'ordre du calendrier",
      bloc3.indexOf("Audition de banc un") < bloc3.indexOf("Seance publique de banc vendredi"), "");
  } finally {
    restaurer(fAN, origAN); restaurer(fSen, origSen);
  }
}

/* LA SEMAINE AU PARLEMENT SUR AUJOURD'HUI — 07/10/2026. L'attendu est calcule
   par @repere/core sur les fichiers du build (jamais ecrit ici) : sept jours, le
   nombre de seances de chacun dit au lecteur d'ecran, et chaque vote solennel
   annonce affiche mot pour mot. Mesure a 360, 390 et 430 px. */
{
  const { semaineParlement } = await import("../packages/core/src/aujourdhui.js");
  const lire = f => fs.existsSync(path.join(DIST, "data", f)) ? JSON.parse(fs.readFileSync(path.join(DIST, "data", f), "utf8")) : null;
  const attendu = semaineParlement({ agendaAN: lire("agenda-an.json"), cal: lire("calendrier-senat.json"), maintenant: new Date() });
  for (const largeur of [360, 390, 430]) {
    const ctx = await nav.newContext({ viewport: { width: largeur, height: 844 } });
    const p = await ctx.newPage();
    await p.goto(base, { waitUntil: "networkidle" });
    await p.getByLabel(/Où habitez-vous/).fill("Bagnolet");
    await p.waitForTimeout(300);
    await p.getByRole("button", { name: /^Bagnolet\b/ }).click();
    await p.waitForTimeout(1500);
    const m = await p.evaluate(() => ({
      labels: [...document.querySelectorAll(".auj-semaine .auj-jour")].map(e => e.getAttribute("aria-label")),
      texte: (document.querySelector(".auj-a-venir") || document.body).innerText,
      deborde: document.documentElement.scrollWidth > window.innerWidth,
    }));
    const nb = l => { const x = /: (\d+) séance/.exec(l || ""); return x ? Number(x[1]) : 0; };
    verif(`semaine (${largeur} px) — sept jours, chacun avec son nombre de seances publiques dit au lecteur d'ecran`,
      attendu.institutions.length === 0 ? m.labels.length === 0 : (m.labels.length === 7 && m.labels.every((l, i) => nb(l) === attendu.jours[i].seances)),
      JSON.stringify({ attendu: attendu.jours.map(j => j.seances), lu: m.labels.map(nb) }));
    verif(`semaine (${largeur} px) — chaque vote solennel annonce est affiche mot pour mot`,
      attendu.votesSolennels.every(v => m.texte.includes(v.texte)), attendu.votesSolennels.map(v => v.texte).join(" | ").slice(0, 200));
    verif(`semaine (${largeur} px) — aucun debordement horizontal`, !m.deborde, "");
    await ctx.close();
  }
}

console.log("\n--- calendrier : chaque institution independante ------------");
/* 07/10/2026 : Senat sans Assemblee, Assemblee sans Senat, aucun des deux, et
   un releve recu mais sans seance a venir. Chaque cas dans un contexte neuf
   (magasin IndexedDB vide), fichiers poses puis restaures quoi qu'il arrive. */
{
  const avant = { an: fs.existsSync(fAN) ? fs.readFileSync(fAN, "utf8") : null, sen: fs.existsSync(fSen) ? fs.readFileSync(fSen, "utf8") : null };
  const dans = j => { const d = new Date(Date.now() + j * 864e5); d.setUTCHours(13, 0, 0, 0); return d.toISOString().slice(0, 16); };
  const paquet = (producteur, licence, titres, jours = 2) => JSON.stringify({ v: 1, source: { producteur, producteur_affiche: producteur + " — agenda de banc", licence, url: "https://example.invalid/", releve_le: "2026-10-07" },
    evenements: titres.map(t => ({ titre: t, debut: dans(jours), fin: null, categorie: "Séance publique", lieu: null, description: null })) });
  const ecran = async () => {
    const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
    const p = await ctx.newPage();
    await p.addInitScript(([k, v]) => localStorage.setItem(k, v), ["repere.departement", JSON.stringify({ d: "93", v: null })]);
    await p.goto(base, { waitUntil: "networkidle" });
    await p.waitForTimeout(500);
    await p.getByLabel(/Votre commune/i).fill("Bagnolet");
    await p.waitForTimeout(300);
    await p.getByRole("button", { name: "Bagnolet", exact: true }).first().click();
    await p.waitForTimeout(900);
    await p.locator("nav.auj-suite").getByRole("button", { name: "Le calendrier" }).click();
    await p.waitForTimeout(1500);
    const t = await p.evaluate(() => (document.querySelector("main") || document.body).innerText);
    await ctx.close();
    return t;
  };
  try {
    /* PAR JOURNEE (PR D, 07/10/2026) : trois seances du meme texte le meme jour =
       une ligne, ses trois heures, ses autres points comptes et listes mot pour mot ;
       un releve de cinq jours le dit, avec sa date. */
    {
      const { jourParis } = await import("../packages/core/src/aujourdhui.js");
      const jour = dans(2).slice(0, 10);
      const odj = "Également à l'ordre du jour : Discussion de la proposition de loi de banc Y ; Suite de la discussion de la proposition de loi de banc X ; Débat de banc Z";
      fs.writeFileSync(fAN, JSON.stringify({ v: 1, source: { producteur: "Assemblée nationale", licence: "Licence ouverte", url: "https://example.invalid/", releve_le: jourParis(new Date(Date.now() - 5 * 864e5)) },
        evenements: ["09:00", "15:00", "21:30"].map((h, i) => ({ titre: (i ? "Suite de la discussion" : "Discussion") + " de la proposition de loi de banc X",
          debut: jour + "T" + h, fin: null, categorie: "Séance publique", lieu: null, description: odj })) }));
      fs.rmSync(fSen, { force: true });
      const t0 = await ecran();
      verif("calendrier — trois séances du même texte le même jour : une seule ligne, ses trois heures",
        (t0.match(/proposition de loi de banc X/g) || []).length === 1 && /9\sh, 15\sh, 21\sh\s30/.test(t0) && /3 séances ce jour-là/.test(t0),
        t0.slice(0, 500).replace(/\n+/g, " / "));
      verif("calendrier — les autres points de l'ordre du jour sont comptés (sans le texte de la ligne, sans doublon)",
        /\+ 2 autres points à l'ordre du jour/.test(t0), t0.slice(0, 500).replace(/\n+/g, " / "));
      verif("calendrier — un relevé de cinq jours le dit, avec sa date, et renvoie au site officiel",
        /Agenda de l'Assemblée nationale relevé le .+, il y a 5 jours\s*:\s*il a pu changer depuis/.test(t0), t0.slice(0, 500).replace(/\n+/g, " / "));
    }
    fs.writeFileSync(fAN, paquet("Assemblée nationale", "Licence ouverte", ["Séance de banc AN seule"]));
    fs.rmSync(fSen, { force: true });
    const t1 = await ecran();
    verif("independance — Senat absent : l'Assemblee s'affiche, et l'absence du Senat est dite",
      /Séance de banc AN seule/.test(t1) && /calendrier du Sénat n'est pas disponible/.test(t1) && !/non précisée/.test(t1),
      t1.slice(0, 400).replace(/\n+/g, " / "));
    fs.writeFileSync(fSen, paquet("Sénat", "non précisée par le Sénat", ["Séance de banc Sénat seul"]));
    fs.rmSync(fAN, { force: true });
    const t2 = await ecran();
    verif("independance — Assemblee absente : le Senat s'affiche, et l'absence de l'Assemblee est dite",
      /Séance de banc Sénat seul/.test(t2) && /calendrier de l'Assemblée nationale n'est pas disponible/.test(t2) && !/Licence ouverte/.test(t2),
      t2.slice(0, 400).replace(/\n+/g, " / "));
    fs.rmSync(fSen, { force: true });
    const t3 = await ecran();
    verif("independance — aucun des deux : un etat explicite, aucun faux calendrier",
      /n'est arrivé jusqu'à cet appareil pour aucune institution/.test(t3) && !/Séance de banc/.test(t3),
      t3.slice(0, 300).replace(/\n+/g, " / "));
    fs.writeFileSync(fAN, paquet("Assemblée nationale", "Licence ouverte", ["Séance de banc AN avec Sénat vide"]));
    fs.writeFileSync(fSen, paquet("Sénat", "non précisée par le Sénat", ["Séance de banc Sénat passée"], -3));
    const t4 = await ecran();
    verif("independance — Senat recu sans seance a venir : dit comme un fait de la source, date, pas comme une panne",
      /calendrier du Sénat ne contient aucune séance à venir au relevé du/.test(t4) && !/Séance de banc Sénat passée/.test(t4)
      && !/calendrier du Sénat n'est pas disponible/.test(t4),
      t4.slice(0, 400).replace(/\n+/g, " / "));
    /* L'HEURE DE PARIS (07/10/2026) : l'agenda est publie a l'heure de Paris, et
       « a venir » se jugeait a l'heure UTC. Une seance commencee il y a une heure
       restait annoncee (une a deux heures de retard selon la saison). */
    const { minuteParis } = await import("../packages/core/src/aujourdhui.js");
    const aParis = h => minuteParis(new Date(Date.now() + h * 36e5));
    fs.writeFileSync(fAN, JSON.stringify({ v: 1, source: { producteur: "Assemblée nationale", licence: "Licence ouverte", url: "https://example.invalid/", releve_le: "2026-10-07" },
      evenements: [
        { titre: "Séance de banc commencée il y a une heure", debut: aParis(-1), fin: null, categorie: "Séance publique", lieu: null, description: null },
        { titre: "Séance de banc dans trois heures", debut: aParis(3), fin: null, categorie: "Séance publique", lieu: null, description: null },
      ] }));
    fs.rmSync(fSen, { force: true });
    const t5 = await ecran();
    verif("calendrier — « à venir » se juge à l'heure de Paris : la séance commencée il y a une heure n'est plus annoncée",
      /Séance de banc dans trois heures/.test(t5) && !/Séance de banc commencée il y a une heure/.test(t5),
      t5.slice(0, 400).replace(/\n+/g, " / "));
  } finally {
    restaurer(fAN, avant.an); restaurer(fSen, avant.sen);
  }
}
}

console.log("\n--- aujourd'hui : un chiffre des comptes dit son exercice -------");
/* 07/10/2026 : « Son encours de dette : 16,0 mois de recettes » s'affichait sans
   l'annee. L'annee ATTENDUE est calculee par @repere/core sur la donnee publiee,
   pas ecrite dans le test : si la publication passe a un nouvel exercice, le
   controle suit. On lit le bloc par sa structure (data-exercice), pas par sa
   phrase exacte, puis on exige que l'annee soit LISIBLE dans ce bloc. */
{
  const idx = JSON.parse(fs.readFileSync(path.join(DIST, "data", "index.json"), "utf8"));
  const ouvrir = async (largeur, dep, nom) => {
    const ctx = await nav.newContext({ viewport: { width: largeur, height: 844 } });
    const p = await ctx.newPage();
    await p.addInitScript(([k, v]) => localStorage.setItem(k, v), ["repere.departement", JSON.stringify({ d: dep, v: null })]);
    await p.goto(base, { waitUntil: "networkidle" });
    await p.waitForTimeout(500);
    await p.getByLabel(/Votre commune/i).fill(nom);
    await p.waitForTimeout(300);
    await p.getByRole("button", { name: nom, exact: true }).first().click();
    await p.waitForTimeout(1500);
    return { ctx, p };
  };
  const p93 = JSON.parse(fs.readFileSync(path.join(DIST, "data", "departments", "93.json"), "utf8"));
  const bagnolet = Object.values(p93.communes).find(c => c.nom === "Bagnolet");
  const attendu = dernierExercice(bagnolet, idx.agregats || []);
  for (const largeur of [360, 390, 430]) {
    const { ctx, p } = await ouvrir(largeur, "93", "Bagnolet");
    const m = await p.evaluate(() => {
      const b = document.querySelector("[data-exercice]");
      const blocs = [...document.querySelectorAll(".quest-suivante")];
      const chiffresComptes = blocs.filter(x => /mois de recettes|€ de salaires|€ pour investir|€ d'impôts|€ par jour/.test(x.innerText));
      return {
        bloc: b ? b.innerText : null, attr: b ? b.getAttribute("data-exercice") : null,
        sansAnnee: chiffresComptes.filter(x => !/comptes \d{4}/.test(x.innerText)).length,
        deborde: document.documentElement.scrollWidth > window.innerWidth,
      };
    });
    verif(`exercice (${largeur} px) — le chiffre des comptes d'Aujourd'hui dit son exercice, dans le meme bloc`,
      !!attendu && m.attr === attendu.an && new RegExp("comptes " + attendu.an).test(m.bloc || "") && m.sansAnnee === 0,
      JSON.stringify({ attendu: attendu && attendu.an, attr: m.attr, sansAnnee: m.sansAnnee, bloc: (m.bloc || "").slice(0, 120) }));
    verif(`exercice (${largeur} px) — aucun debordement horizontal`, !m.deborde, "la page deborde de l'ecran");
    await ctx.close();
  }
  /* Exercice absent : Saint-Pierre (975) n'a aucun compte publie. Aucun bloc, et
     surtout aucune annee de comptes inventee ailleurs sur l'ecran. */
  {
    const p975 = JSON.parse(fs.readFileSync(path.join(DIST, "data", "departments", "975.json"), "utf8"));
    const sp = Object.values(p975.communes).find(c => c.nom === "Saint-Pierre");
    if (!sp || dernierExercice(sp, idx.agregats || [])) {
      verif("exercice absent — une commune sans comptes publies existe pour la mesure", false, "Saint-Pierre a des comptes : choisir une autre commune");
    } else {
      const { ctx, p } = await ouvrir(390, "975", "Saint-Pierre");
      const t = await p.evaluate(() => ({ bloc: !!document.querySelector("[data-exercice]"), texte: (document.querySelector("main") || document.body).innerText }));
      verif("exercice absent — aucun chiffre des comptes, et aucune annee de comptes inventee",
        !t.bloc && !/comptes \d{4}/.test(t.texte) && !/mois de recettes/.test(t.texte), t.texte.slice(0, 300).replace(/\n+/g, " / "));
      await ctx.close();
    }
  }
}

console.log("\n--- comptes : d'un exercice a l'autre -------------------------");
/* 29/09/2026 : deux montants dates, la difference en euros, aucun pourcentage.
   La commune est cherchee dans la donnee publiee (deux exercices consecutifs,
   population stable, tous postes presents) plutot qu'ecrite en dur. */
{
  const p93 = JSON.parse(fs.readFileSync(path.join(DIST, "data", "departments", "93.json"), "utf8"));
  const cas = Object.entries(p93.communes).find(([, c]) => c.comptes && Array.isArray(c.comptes["2024"]) && Array.isArray(c.comptes["2025"])
    && c.comptes["2024"].every(v => typeof v === "number") && c.comptes["2025"].every(v => typeof v === "number")
    && Math.abs(c.comptes["2025"][0] - c.comptes["2024"][0]) / c.comptes["2024"][0] < 0.05);
  if (!cas) {
    verif("evolution — une commune du 93 a deux exercices consecutifs complets", false, "aucune");
  } else {
    const [, c] = cas;
    const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
    const p = await ctx.newPage();
    await p.addInitScript(([k, v]) => localStorage.setItem(k, v), ["repere.departement", JSON.stringify({ d: "93", v: null })]);
    await p.goto(base, { waitUntil: "networkidle" });
    await p.waitForTimeout(500);
    await p.getByLabel(/Votre commune/i).fill(c.nom);
    await p.waitForTimeout(400);
    await p.getByRole("button", { name: c.nom, exact: true }).first().click();
    await p.waitForTimeout(800);
    await p.getByRole("button", { name: "Où va l'argent" }).click();
    await p.waitForTimeout(1200);
    const carte = await p.evaluate(() => {
      const t = [...document.querySelectorAll(".carte, section, article, div")].map(e => e.innerText)
        .filter(x => /^D.une année à l.autre/m.test(x) && /soustraction/.test(x) && / : \d/.test(x)).sort((a, b) => a.length - b.length)[0];
      return t || "";
    });
    await ctx.close();
    const recettes = Math.round(c.comptes["2025"][1]) - Math.round(c.comptes["2024"][1]);
    const attendu = (recettes > 0 ? "+ " : recettes < 0 ? "− " : "") + Math.abs(recettes).toLocaleString("fr-FR") + " €";
    verif(`evolution — ${c.nom} : la carte montre 2024, 2025 et la difference des recettes en euros`,
      /2024 : /.test(carte) && /2025 : /.test(carte) && (recettes === 0 ? /inchangé/.test(carte) : carte.includes(attendu)),
      carte.slice(0, 300).replace(/\n+/g, " / "));
    verif("evolution — aucun pourcentage dans la carte", carte.length > 0 && !/%/.test(carte), carte.slice(0, 200));
    verif("invariant 4 — la difference est annoncee comme un calcul", /Calcul Repère/i.test(carte) && /soustraction/.test(carte), "");
  }
}

console.log("\n--- heure de Paris : dite hors de Paris, jamais a Paris ---------");
/* 08/10/2026. L'agenda est publie a l'heure de Paris. Un navigateur regle en
   Guadeloupe doit lire que jours et heures sont ceux de Paris, sur Aujourd'hui et
   dans le calendrier ; a Paris, la precision n'encombre pas l'ecran. */
{
  const lire = async fuseau => {
    const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, timezoneId: fuseau });
    const p = await ctx.newPage();
    await p.addInitScript(([k, v]) => localStorage.setItem(k, v), ["repere.departement", JSON.stringify({ d: "93", v: null })]);
    await p.goto(base, { waitUntil: "networkidle" });
    await p.waitForTimeout(500);
    await p.getByLabel(/Votre commune/i).fill("Bagnolet");
    await p.waitForTimeout(300);
    await p.getByRole("button", { name: "Bagnolet", exact: true }).first().click();
    await p.waitForTimeout(1200);
    const auj = await p.evaluate(() => document.body.innerText);
    const aVenir = await p.locator(".auj-a-venir").count();
    await p.locator("nav.auj-suite").getByRole("button", { name: "Le calendrier" }).click();
    await p.waitForTimeout(1500);
    const cal = await p.evaluate(() => document.body.innerText);
    const calendrier = await p.locator(".ligne.fait[data-debut]").count();
    await ctx.close();
    return { auj, cal, aVenir, calendrier };
  };
  const phrase = /Jours et heures à l'heure de Paris, comme l'agenda publié/;
  const ailleurs = await lire("America/Guadeloupe");
  const paris = await lire("Europe/Paris");
  verif("heure de Paris — en Guadeloupe, Aujourd'hui dit que l'agenda est a l'heure de Paris",
    ailleurs.aVenir === 0 || phrase.test(ailleurs.auj), "bloc a venir : " + ailleurs.aVenir);
  verif("heure de Paris — en Guadeloupe, le calendrier le dit aussi",
    ailleurs.calendrier === 0 || phrase.test(ailleurs.cal), "lignes : " + ailleurs.calendrier);
  verif("heure de Paris — au moins un des deux ecrans avait un agenda a montrer (sinon ce controle ne prouve rien)",
    ailleurs.aVenir > 0 || ailleurs.calendrier > 0, JSON.stringify({ aVenir: ailleurs.aVenir, calendrier: ailleurs.calendrier }));
  verif("heure de Paris — a Paris, la precision n'apparait pas",
    !phrase.test(paris.auj) && !phrase.test(paris.cal), "");
}

console.log("\n--- aujourd'hui : qui, et ce qui est vraiment local -----------");
/* 28/09/2026 : pour 1 257 communes sur 1 262, la reponse a « Que s'est-il decide
   pres de chez vous ? » est un vote national du depute, sans que l'ecran dise
   que c'est LE depute du lecteur ; le projet finance par l'Etat dans la commune
   n'etait montre que pour 2 des 778 communes qui en ont un. */
async function aujCommune(dep, nom) {
  const c = await nav.newContext({ viewport: { width: 390, height: 844 } });
  const p = await c.newPage();
  await p.addInitScript(([k, v]) => localStorage.setItem(k, v), ["repere.departement", JSON.stringify({ d: dep, v: null })]);
  await p.goto(base, { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  await p.getByLabel(/Votre commune/i).fill(nom);
  await p.waitForTimeout(400);
  await p.getByRole("button", { name: nom, exact: true }).first().click();
  await p.waitForTimeout(1200);
  const t = await p.evaluate(() => (document.querySelector(".quest") || document.body).innerText);
  await c.close();
  return t;
}
{
  const u = await aujCommune("64", "Ustaritz");
  verif("qui — une commune a une circonscription : le vote est celui du depute de SA circonscription, dit comme tel",
    /Vote du député élu dans votre circonscription \(6e circonscription — Pyrénées-Atlantiques\), à l.Assemblée nationale :/.test(u),
    u.slice(0, 300).replace(/\n+/g, " / "));
  verif("local — sans projet finance dans la commune, aucun bloc « Et dans votre commune ? »",
    !/Et dans votre commune/.test(u), "");
  const paris = await aujCommune("75", "Paris");
  verif("qui — commune partagee (Paris, 18 circonscriptions) : jamais « votre circonscription » au hasard",
    /Paris est partagée entre 18 circonscriptions\. Vote du député élu dans la \d+(re|e) :/.test(paris) && !/votre circonscription/.test(paris),
    paris.slice(0, 300).replace(/\n+/g, " / "));
  const pr93 = JSON.parse(fs.readFileSync(path.join(DIST, "data", "projets", "93.json"), "utf8"));
  const p93 = JSON.parse(fs.readFileSync(path.join(DIST, "data", "departments", "93.json"), "utf8"));
  const [insee, liste] = Object.entries(pr93.communes).find(([i, l]) => l.length && p93.communes[i]) || [];
  if (insee) {
    const nom = p93.communes[insee].nom;
    const plusRecent = [...liste].sort((a, b) => b.annee - a.annee)[0];
    const t = await aujCommune("93", nom);
    verif(`local — ${nom} : son projet finance par l'Etat apparait sur Aujourd'hui, intitule recopie tel quel`,
      /Et dans votre commune \?/.test(t) && t.includes(plusRecent.intitule.trim()) && new RegExp("en " + plusRecent.annee).test(t),
      t.slice(0, 400).replace(/\n+/g, " / "));
    verif("invariant 4 — le projet local porte sa source", /Et dans votre commune[\s\S]*Direction générale des collectivités locales|Et dans votre commune[\s\S]*DGCL/.test(t),
      (t.split("Et dans votre commune")[1] || "").slice(0, 300).replace(/\n+/g, " / "));
  } else {
    verif("local — donnees de projets 93 presentes pour eprouver le bloc", false, "aucune commune du 93 avec projet");
  }
}

console.log("\n--- projets d'une commune fusionnee : rattaches, et dits comme tels ---");
/* 29/09/2026 : le projet 2024 de Pierrefitte-sur-Seine (93059), commune deleguee
   de Saint-Denis depuis le 1er janvier 2025, etait ignore par le build. Il est
   desormais rattache a la commune d'aujourd'hui par la table du Code officiel
   geographique. Ce qu'on garde : la ligne est servie sous une commune REELLE du
   paquet, et l'ecran dit pour quelle commune l'Etat l'avait engagee — jamais
   attribuee en silence a la commune actuelle. Le cas est cherche dans la donnee
   publiee, pas ecrit en dur. */
{
  const dossier = path.join(DIST, "data", "projets");
  let cas = null;
  const orphelines = [];
  for (const f of fs.readdirSync(dossier)) {
    const pr = JSON.parse(fs.readFileSync(path.join(dossier, f), "utf8"));
    const pq = JSON.parse(fs.readFileSync(path.join(DIST, "data", "departments", f), "utf8"));
    for (const [insee, liste] of Object.entries(pr.communes)) {
      for (const l of liste) {
        if (!l.ancien_code) continue;
        if (!pq.communes[insee]) orphelines.push(insee + " <- " + l.ancien_code);
        else if (!cas && l.ancienne_commune) cas = { dep: pr.d, nom: pq.communes[insee].nom, l };
      }
    }
  }
  verif("fusion — toute ligne rattachee est servie sous une commune reelle du paquet",
    orphelines.length === 0, orphelines.join(", "));
  if (cas) {
    const c = await nav.newContext({ viewport: { width: 390, height: 844 } });
    const p = await c.newPage();
    await p.addInitScript(([k, v]) => localStorage.setItem(k, v), ["repere.departement", JSON.stringify({ d: cas.dep, v: null })]);
    await p.goto(base, { waitUntil: "networkidle" });
    await p.waitForTimeout(500);
    await p.getByLabel(/Votre commune/i).fill(cas.nom);
    await p.waitForTimeout(400);
    await p.getByRole("button", { name: cas.nom, exact: true }).first().click();
    await p.waitForTimeout(800);
    await p.getByRole("button", { name: "Ce qui a été décidé", exact: true }).click();
    await p.waitForTimeout(1600);
    const t = await p.evaluate(() => document.body.innerText);
    await c.close();
    const apres = t.split(cas.l.intitule.trim())[1] || "";
    verif(`fusion — ${cas.nom} : le projet de ${cas.l.ancienne_commune} est affiche, et dit engage pour elle`,
      t.includes(cas.l.intitule.trim()) && apres.slice(0, 400).includes("Engagé pour " + cas.l.ancienne_commune),
      apres.slice(0, 300).replace(/\n+/g, " / "));
  } else {
    console.log("   (aucune ligne rattachee dans le releve publie : rien a montrer, rien a verifier a l'ecran)");
  }
}

console.log("\n--- hierarchie mobile : le contenu avant le decor ---------------");
/* 28/09/2026, mesure a 390 px : l'en-tete (titre, chapeau, selecteurs) prenait
   environ 460 px sur 800 sur chaque ecran, et « Ce qui se passe » faisait 19
   hauteurs d'ecran. */
{
  const c = await nav.newContext({ viewport: { width: 390, height: 800 } });
  const p = await c.newPage();
  await p.goto(base, { waitUntil: "networkidle" });
  const premier = await p.evaluate(() => ({ chapeau: !!document.querySelector(".chapeau"), texte: document.body.innerText }));
  verif("hierarchie — au premier ecran, la promesse est lue (rien ne quitte votre appareil)",
    premier.chapeau && /rien ne quitte votre appareil/.test(premier.texte), "");
  await p.evaluate(() => localStorage.setItem("repere.departement", JSON.stringify({ d: "64", v: null })));
  await p.goto(base, { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  await p.getByLabel(/Votre commune/i).fill("Ustaritz"); await p.waitForTimeout(300);
  await p.getByRole("button", { name: "Ustaritz", exact: true }).click(); await p.waitForTimeout(900);
  const apres = await p.evaluate(() => ({
    chapeau: !!document.querySelector(".chapeau"),
    h1: document.querySelectorAll("h1").length,
    entete: Math.round(document.querySelector(".entete")?.getBoundingClientRect().height || 0),
    onglets: Math.round(document.querySelector(".onglets")?.getBoundingClientRect().top || 0),
  }));
  verif("hierarchie — commune choisie : l'en-tete se reduit (chapeau retire, un seul titre de niveau 1 conserve)",
    !apres.chapeau && apres.h1 === 2 && apres.entete < 110, JSON.stringify(apres));
  verif("hierarchie — commune choisie : la barre des ecrans est dans la premiere moitie du telephone",
    apres.onglets < 800 / 2, JSON.stringify(apres));
  /* 29/09/2026 : trois lignes disaient ou l'on est (departement, commune,
     « situe »). Une seule doit le dire, avec le moyen d'en changer ; et
     « changer » doit rouvrir le choix de la commune ET celui du departement. */
  const lieu = await p.evaluate(() => ({
    lignes: document.querySelectorAll(".situe").length,
    dept: !!document.querySelector("details.choix"),
    champ: !!document.querySelector(".choix-commune input"),
    changer: [...document.querySelectorAll(".situe button")].map(b => b.innerText.trim()),
  }));
  verif("hierarchie — commune choisie : une seule ligne dit ou l'on est, avec « changer »",
    lieu.lignes === 1 && !lieu.dept && !lieu.champ && lieu.changer.includes("changer"), JSON.stringify(lieu));
  await p.getByRole("button", { name: "changer", exact: true }).click(); await p.waitForTimeout(300);
  const rouvert = await p.evaluate(() => ({ dept: !!document.querySelector("details.choix"), champ: !!document.querySelector(".choix-commune input") }));
  verif("hierarchie — « changer » rouvre le choix de la commune et celui du departement",
    rouvert.dept && rouvert.champ, JSON.stringify(rouvert));
  await p.getByLabel(/Votre commune/i).fill("Ustaritz"); await p.waitForTimeout(300);
  await p.getByRole("button", { name: "Ustaritz", exact: true }).click(); await p.waitForTimeout(700);
  await p.getByRole("button", { name: "Le calendrier", exact: true }).click(); await p.waitForTimeout(1500);
  const cal = await p.evaluate(() => {
    const d = document.querySelector("details.plus-tard");
    return {
      hauteur: document.documentElement.scrollHeight,
      resume: d ? d.querySelector("summary").innerText : null,
      ouvert: d ? d.open : null,
      lignesVisibles: [...document.querySelectorAll(".ligne.fait")].filter(e => e.checkVisibility()).length,
      lignesTotal: document.querySelectorAll(".ligne.fait").length,
      /* dates des rendez-vous du calendrier reellement visibles (data-debut),
         hors teaser des scrutins qui partage la meme classe */
      debutsVisibles: [...document.querySelectorAll(".ligne.fait[data-debut]")].filter(e => e.checkVisibility()).map(e => e.dataset.debut),
    };
  });
  verif("ce qui se passe — au-dela de deux semaines, les rendez-vous sont replies, pas retires",
    cal.resume === null || (cal.ouvert === false && cal.lignesTotal > cal.lignesVisibles), JSON.stringify(cal));
  verif("ce qui se passe — le repli dit combien de rendez-vous il contient, par institution, et jusqu'a quand",
    cal.resume === null || /^Plus tard : \d+ rendez-vous jusqu'au \d+(er)? [a-zéû]+ \d{4} \((\d+ à l'Assemblée nationale|\d+ au Sénat)(, (\d+ à l'Assemblée nationale|\d+ au Sénat))?\)$/.test(cal.resume.trim()),
    String(cal.resume));
  /* CE CONTROLE REMPLACE « l'ecran tient en moins de 12 hauteurs », du meme
     jour. Cette version-la mesurait le VOLUME de donnees, pas le comportement :
     calibree sur les donnees locales (11,6 hauteurs), elle a echoue sur le
     runner des que la reprise des seances a ajoute des rendez-vous dans les deux
     semaines (9 836 px), et a bloque la publication du 28/09 au soir. La
     garantie reelle, independante du volume : rien au-dela de deux semaines
     n'est deplie — sauf le repli de secours (au plus 5) quand les deux semaines
     sont vides. Cassee pour de vrai : sans le repli, elle tombe. */
  /* la limite a l'heure de Paris, comme l'ecran et l'agenda (minuteParis, 07/10/2026) */
  cal.limite = (await import("../packages/core/src/aujourdhui.js")).minuteParis(new Date(Date.now() + 14 * 864e5));
  const auDela = cal.debutsVisibles.filter(x => x >= cal.limite);
  const secours = !cal.debutsVisibles.some(x => x < cal.limite);
  verif("ce qui se passe — aucun rendez-vous au-dela de deux semaines n'est deplie (sauf 5 au plus quand les deux semaines sont vides)",
    cal.debutsVisibles.length > 0 && (secours ? auDela.length <= 5 : auDela.length === 0),
    JSON.stringify({ visibles: cal.debutsVisibles.length, auDela: auDela.length, secours }));
  await c.close();
}

console.log("\n--- chaque source mene a la source ---------------------------");
/* 29/09/2026 : sur « Aujourd'hui », ecran d'entree de la demonstration, 1 ligne
   de source sur 4 permettait d'aller verifier ; sur « Ou va l'argent », 1 sur 4.
   Nommer une source sans y mener, c'est demander d'etre cru. Mesure sur une
   commune du 93 qui a un projet finance (cherchee dans la donnee publiee). */
{
  const pr = JSON.parse(fs.readFileSync(path.join(DIST, "data", "projets", "93.json"), "utf8")).communes;
  const pq = JSON.parse(fs.readFileSync(path.join(DIST, "data", "departments", "93.json"), "utf8")).communes;
  const [, f] = Object.entries(pq).find(([c]) => pr[c]) || [];
  if (!f) {
    verif("sources — une commune du 93 avec projet pour eprouver les liens", false, "aucune");
  } else {
    const c = await nav.newContext({ viewport: { width: 390, height: 844 } });
    const p = await c.newPage();
    await p.addInitScript(([k, v]) => localStorage.setItem(k, v), ["repere.departement", JSON.stringify({ d: "93", v: null })]);
    await p.goto(base, { waitUntil: "networkidle" }); await p.waitForTimeout(500);
    await p.getByLabel(/Votre commune/i).fill(f.nom); await p.waitForTimeout(300);
    await p.getByRole("button", { name: f.nom, exact: true }).first().click(); await p.waitForTimeout(900);
    const sansLien = () => p.evaluate(() => [...document.querySelectorAll(".source")]
      .filter(s => !s.querySelector("a[href^='http']")).map(s => s.innerText.slice(0, 60)));
    await p.getByRole("button", { name: "Où va l'argent", exact: true }).click(); await p.waitForTimeout(1300);
    const argent = await sansLien();
    await p.getByRole("button", { name: /Voir aujourd.hui/ }).click(); await p.waitForTimeout(1500);
    const auj = await sansLien();
    await c.close();
    verif(`invariant 4 — Aujourd'hui (${f.nom}) : chaque ligne de source mene a la source`, auj.length === 0, auj.join(" | "));
    verif(`invariant 4 — Ou va l'argent (${f.nom}) : chaque ligne de source mene a la source`, argent.length === 0, argent.join(" | "));
  }
}

console.log("\n--- recherche et accents -------------------------------------");
/* LA RECHERCHE NE DOIT PAS DEPENDRE DES ACCENTS, DANS LES DEUX SENS. Depuis que
   les libelles portent leur orthographe officielle, une comparaison brute
   ferait disparaitre Évry-Courcouronnes pour qui tape « evry » — et l'inverse
   etait deja vrai avant. On mesure les deux graphies sur la meme commune. */
const pageAcc = await (await nav.newContext()).newPage();
await pageAcc.goto(base, { waitUntil: "networkidle" });
await pageAcc.getByLabel(/Où habitez-vous/).fill("essonne");
await pageAcc.getByRole("button", { name: /^91 / }).click();
const graphies = {};
for (const q of ["evry", "Évry", "EVRY"]) {
  await pageAcc.getByLabel(/Votre commune/).fill(q);
  await pageAcc.waitForTimeout(200);
  const l = pageAcc.locator(".choix-commune .puce");
  graphies[q] = (await l.count()) ? (await l.first().innerText()).trim() : "(rien)";
}
verif("recherche — les trois graphies d'un meme nom trouvent la meme commune",
  new Set(Object.values(graphies)).size === 1 && graphies["evry"] === "Évry-Courcouronnes",
  JSON.stringify(graphies));
verif("langue — le nom affiche porte son orthographe officielle",
  graphies["evry"] === "Évry-Courcouronnes", JSON.stringify(graphies));
await pageAcc.context().close();

console.log("\n--- absence chez nous vs absence dans le monde ----------------");
/* DOCTRINE DU 16/09/2026, PROUVEE ICI. Avant le correctif, chercher une commune
 * qui existe reellement mais qui manque a nos donnees (Ville-d'Avray, 92077,
 * absente du Repertoire national des elus comme 320 autres communes en France)
 * rendait EXACTEMENT la meme phrase qu'une faute de frappe : « Aucune commune du
 * departement 92 ne porte ce nom. » — une affirmation fausse, puisque la commune
 * porte bien ce nom. Les deux causes d'absence sont maintenant distinguees via
 * `paquet.manquantes`, pose par extract-html.js depuis le Code officiel
 * geographique. Le controle prouve les DEUX branches, pas seulement la corrigee :
 * une vraie faute de frappe ne doit pas se mettre a afficher la phrase inverse. */
const pageAbs = await (await nav.newContext()).newPage();
await pageAbs.goto(base, { waitUntil: "networkidle" });
await pageAbs.getByLabel(/Où habitez-vous/).fill("hauts-de-seine");
await pageAbs.waitForTimeout(200);
await pageAbs.getByRole("button", { name: /^92\b/ }).click();
await pageAbs.getByLabel(/Votre commune/).fill("Ville-d'Avray");
await pageAbs.waitForTimeout(300);
const texteManquante = await pageAbs.evaluate(() => document.querySelector(".choix-commune")?.innerText || "");
verif("invariant 5 — une commune officielle absente de nos donnees n'est jamais dite inexistante",
  /existe bien dans ce département/.test(texteManquante) && !/ne porte ce nom/.test(texteManquante),
  texteManquante.slice(0, 200).replace(/\n+/g, " / "));

await pageAbs.getByLabel(/Votre commune/).fill("Zzznexistepas");
await pageAbs.waitForTimeout(300);
const texteFaux = await pageAbs.evaluate(() => document.querySelector(".choix-commune")?.innerText || "");
verif("invariant 5 — une vraie faute de frappe garde sa phrase d'origine",
  /ne porte ce nom/.test(texteFaux) && !/existe bien dans ce département/.test(texteFaux),
  texteFaux.slice(0, 200).replace(/\n+/g, " / "));
await pageAbs.context().close();

/* MEME DOCTRINE, POSEE UN ECRAN PLUS TOT LE 22/09/2026. Mesure en direct :
 * taper "Ville-d'Avray" sur le TOUT PREMIER ecran (avant meme de choisir un
 * departement) rendait "Rien ne correspond... Hors d'Ile-de-France, cherchez
 * d'abord votre departement" — une phrase fausse pour une commune francilienne
 * reelle. Le correctif ci-dessus (paquet.manquantes) protegeait deja la
 * recherche APRES le choix d'un departement ; il ne protegeait pas encore
 * celle-ci, la plus emprunte des deux. */
const pageAbs1 = await (await nav.newContext()).newPage();
await pageAbs1.goto(base, { waitUntil: "networkidle" });
await pageAbs1.getByLabel(/Où habitez-vous/).fill("Ville-d'Avray");
await pageAbs1.waitForTimeout(300);
const texteEntree = await pageAbs1.evaluate(() => document.querySelector(".entree")?.innerText || "");
verif("invariant 5 — le premier ecran distingue aussi une absence chez nous d'une commune inexistante",
  /existe bien en Île-de-France/.test(texteEntree) && !/Rien ne correspond/.test(texteEntree),
  texteEntree.slice(0, 200).replace(/\n+/g, " / "));

await pageAbs1.getByLabel(/Où habitez-vous/).fill("Zzznexistepas");
await pageAbs1.waitForTimeout(300);
const texteEntreeFaux = await pageAbs1.evaluate(() => document.querySelector(".entree")?.innerText || "");
verif("invariant 5 — et garde la vraie phrase d'absence pour une vraie faute de frappe",
  /Rien ne correspond/.test(texteEntreeFaux) && !/existe bien en Île-de-France/.test(texteEntreeFaux),
  texteEntreeFaux.slice(0, 200).replace(/\n+/g, " / "));
await pageAbs1.context().close();

console.log("\n--- la langue du citoyen ---------------------------------------");
/* PREMIER CONTROLE DU VOCABULAIRE CONTEXTUEL, POSE LE 16/09/2026. Le mot
 * "circonscription" du sous-titre de la carte Assemblee doit ouvrir une
 * fiche courte, au clavier comme a la souris, et rendre le focus au mot au
 * lieu de le perdre dans la page — sinon un lecteur au clavier qui ouvre une
 * definition serait ejecte de son parcours. */
const ctxMot = await nav.newContext({ viewport: { width: 390, height: 844 } });
const pageMot = await ctxMot.newPage();
await pageMot.goto(base, { waitUntil: "networkidle" });
await pageMot.getByLabel(/Où habitez-vous/).fill("bagnolet");
await pageMot.waitForTimeout(300);
await pageMot.getByRole("button", { name: /Bagnolet/ }).click();
await pageMot.waitForTimeout(1200);
await pageMot.getByRole("button", { name: "Qui décide", exact: true }).click();
await pageMot.waitForTimeout(900);
const motCirco = pageMot.getByRole("button", { name: "circonscription", exact: true });
verif("langue du citoyen — le mot « circonscription » est bien un declencheur",
  await motCirco.count() > 0, "aucun bouton .mot trouve avec ce texte");
await motCirco.click();
await pageMot.waitForTimeout(200);
const ficheTexte = await pageMot.evaluate(() => document.querySelector(".mot-fiche-in")?.innerText || "");
verif("langue du citoyen — la fiche affiche la definition exacte",
  /Territoire dans lequel les électeurs élisent un député/.test(ficheTexte),
  ficheTexte.slice(0, 160));
await pageMot.keyboard.press("Escape");
await pageMot.waitForTimeout(200);
const ficheFermee = await pageMot.evaluate(() => document.querySelector(".mot-fiche-in") === null);
verif("langue du citoyen — Echap referme la fiche", ficheFermee, "la fiche est restee ouverte");
const focusApresFermeture = await pageMot.evaluate(() => document.activeElement?.innerText || "");
verif("langue du citoyen — le focus revient au mot apres fermeture, pas perdu dans la page",
  focusApresFermeture === "circonscription", "focus sur : " + JSON.stringify(focusApresFermeture));

/* TROIS CORRECTIFS DE L'AUDIT WCAG DU 16/09/2026, PROUVES ICI.
 * `pageMot` est deja sur Bagnolet, ecran "Qui decide" (mesure du vocabulaire
 * ci-dessus) : pas besoin de re-choisir la commune, le champ de recherche a
 * deja disparu au profit du bandeau "commune choisie". */
const boutonVotesA = pageMot.getByRole("button", { name: /Comment .+ a voté à l'Assemblée/ });
verif("accessibilite — le bouton des votes annonce son etat ferme (aria-expanded)",
  await boutonVotesA.getAttribute("aria-expanded") === "false",
  "aria-expanded=" + JSON.stringify(await boutonVotesA.getAttribute("aria-expanded")));
await boutonVotesA.click();
await pageMot.waitForTimeout(600);
const focusApresOuverture = await pageMot.evaluate(() =>
  document.activeElement?.closest(".votes-h") !== null);
verif("accessibilite — ouvrir les votes deplace le focus dans le bloc qui vient d'apparaitre",
  focusApresOuverture, "le focus n'est pas entre dans .votes-h");
const boutonReplier = pageMot.getByRole("button", { name: "Replier" });
verif("accessibilite — le bouton Replier annonce son etat ouvert (aria-expanded)",
  await boutonReplier.getAttribute("aria-expanded") === "true",
  "aria-expanded=" + JSON.stringify(await boutonReplier.getAttribute("aria-expanded")));

/* LA FICHE DE VOCABULAIRE PROMET aria-modal="true" : UN TAB NE DOIT PAS EN
 * SORTIR. Avant le correctif, un seul Tab suffisait a atteindre un element
 * hors de la fiche (mesure par l'audit). Reouvre "circonscription", deja
 * prouve declencheur plus haut sur ce meme ecran. */
await pageMot.getByRole("button", { name: "circonscription", exact: true }).click();
await pageMot.waitForTimeout(200);
await pageMot.keyboard.press("Tab");
const resteDansLaFiche = await pageMot.evaluate(() =>
  document.activeElement?.closest(".mot-fiche") !== null);
verif("accessibilite — Tab ne fait pas sortir du dialogue de vocabulaire (piege de focus)",
  resteDansLaFiche, "le focus est sorti de .mot-fiche apres une tabulation");
await pageMot.keyboard.press("Escape");
await ctxMot.close();

console.log("\n--- mouvement reduit -----------------------------------------");
/* LA COUPURE DU MOUVEMENT, MESUREE ET PAS DEDUITE. Le controle statique lit le
   CSS ; celui-ci ouvre une page en declarant le reglage systeme « moins
   d'animations » et demande au navigateur ce qu'il applique reellement. */
const ctxCalme = await nav.newContext({ reducedMotion: "reduce" });
const pageCalme = await ctxCalme.newPage();
await pageCalme.goto(base, { waitUntil: "networkidle" });
await pageCalme.getByLabel(/Où habitez-vous/).fill("64");
await pageCalme.waitForTimeout(200);
await pageCalme.getByRole("button", { name: /^64\b/ }).click();
await pageCalme.getByLabel(/Votre commune/).fill("Ustaritz");
await pageCalme.getByRole("button", { name: "Ustaritz", exact: true }).click();
await pageCalme.waitForTimeout(700);
const calme = await pageCalme.evaluate(() => {
  const animations = [...document.querySelectorAll("*")].filter((e) => {
    const s = getComputedStyle(e);
    return s.animationName !== "none" && s.animationDuration !== "0s";
  });
  return {
    reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    animations: animations.length,
    text: document.body.innerText,
  };
});
verif("accessibilite — mouvement reduit : le reglage systeme est actif",
  calme.reduced, JSON.stringify(calme));
verif("accessibilite — mouvement reduit : aucune animation ne se joue",
  calme.animations === 0, JSON.stringify(calme));
verif("accessibilite — mouvement reduit : le contenu reste visible",
  /REPÈRE/.test(calme.text) && /Ustaritz/.test(calme.text) && calme.text.trim().length > 100, JSON.stringify(calme).slice(0, 300));
await ctxCalme.close();

console.log("\n--- zoom texte 200% -------------------------------------------");
/* TROUVE PAR L'AUDIT WCAG DU 16/09/2026 (1.4.4/1.4.10) : a 200% de zoom
 * texte, l'ecran "Qui decide" defilait horizontalement (726 px de contenu
 * pour 390 px de viewport) — cause tracee a `.ligne-h b { white-space:
 * nowrap }`. Le correctif qui tient : `flex-wrap: wrap` sur `.ligne-h`
 * (voir l'historique complet dans app.css).
 *
 * REGRESSION TROUVEE LE 22/09/2026 PAR LE RUNNER GITHUB REEL, INVISIBLE SUR
 * CE POSTE (0px local, 55px sur ubuntu-latest, meme Chromium) : deux causes
 * distinctes dans app.css, aucune liee a une police —
 *   1. `.tag { white-space: nowrap }` : "DONNEE OFFICIELLE" depassait la
 *      carte de 26px a 200%.
 *   2. `<Mot>` est un <button> : `appearance: auto` de la feuille UA
 *      empechait "intercommunalite" de casser au milieu du mot, 46px de trop.
 * Ce test est ce qui a mesure les deux — c'est lui qui doit continuer a
 * detecter tout retour de l'un ou l'autre, ou d'un troisieme cas similaire. */
const ctxZoom = await nav.newContext({ viewport: { width: 390, height: 844 } });
const pageZoom = await ctxZoom.newPage();
await pageZoom.goto(base, { waitUntil: "networkidle" });
await pageZoom.getByLabel(/Où habitez-vous/).fill("bagnolet");
await pageZoom.waitForTimeout(300);
await pageZoom.getByRole("button", { name: /Bagnolet/ }).click();
await pageZoom.waitForTimeout(1200);
await pageZoom.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
await pageZoom.waitForTimeout(200);
const debordement = await pageZoom.evaluate(() =>
  document.documentElement.scrollWidth - document.documentElement.clientWidth);
verif("accessibilite — a 200% de zoom texte, l'ecran Qui decide ne defile pas horizontalement",
  debordement <= 1, "debordement de " + debordement + " px");
await ctxZoom.close();

console.log("\n--- tout le parcours, ecran par ecran ------------------------");
/* LE CONTROLE DES CIBLES TACTILES NE MESURAIT QU'UN SEUL ECRAN — celui affiche a
 * la fin du parcours. Mesure du 13/09/2026 : les dix liens « Scrutin n° … » et le
 * lien de contact faisaient moins de 44 px, et il ne les avait jamais vus. Un
 * controle qui ne regarde qu'un sixieme du produit ne garde rien.
 *
 * Il mesure donc maintenant LES SIX ECRANS, et deux regles a la fois : la zone
 * d'appui de 44 px, et le plancher typographique de 13 px — 46 a 63 % du texte
 * etait sous 14 px avant cette version.
 *
 * `checkVisibility` et non le rectangle : les enfants d'un <details> ferme ont une
 * boite sans etre visibles, et c'est ce qui avait fausse la premiere mesure du
 * nombre de cibles a l'accueil (106 comptees, 2 reellement affichees). */
const ctxTout = await nav.newContext({ viewport: { width: 390, height: 844 } });
const pageTout = await ctxTout.newPage();
const fautesCibles = [], fautesTexte = [];
const auditerEcran = async (nom, page = pageTout) => {
  const d = await page.evaluate(() => {
    const vu = e => e.checkVisibility({ checkVisibilityCSS: true, contentVisibilityAuto: true });
    /* `.mot` exclu ici aussi — meme exception WCAG 2.5.8, voir plus haut. */
    const cibles = [...document.querySelectorAll("a[href]:not(.mot), button:not(.mot), input, summary")]
      .filter(vu)
      .map(e => ({ t: (e.innerText || e.getAttribute("aria-label") || e.type || "").trim().slice(0, 24),
                   h: Math.round(e.getBoundingClientRect().height) }))
      .filter(e => e.h > 0 && e.h < 44);
    const textes = [...document.querySelectorAll("body *")]
      .filter(e => vu(e) && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 2))
      .map(e => ({ px: parseFloat(getComputedStyle(e).fontSize), t: e.textContent.trim().slice(0, 24) }))
      .filter(x => x.px < 13);
    return { cibles, textes };
  });
  for (const c of d.cibles) fautesCibles.push(nom + " : « " + c.t + " » " + c.h + "px");
  for (const t of d.textes) fautesTexte.push(nom + " : " + t.px + "px « " + t.t + " »");
};
await pageTout.goto(base, { waitUntil: "networkidle" });
await auditerEcran("accueil");
await pageTout.getByLabel(/Où habitez-vous/).fill("bagnolet");
await pageTout.waitForTimeout(300);
await auditerEcran("recherche");
await pageTout.getByRole("button", { name: /Bagnolet/ }).click();
await pageTout.waitForTimeout(1500);
await pageTout.getByRole("button", { name: "Qui décide" }).click();
await pageTout.waitForTimeout(800);
await auditerEcran("qui decide");
await pageTout.getByRole("button", { name: /Comment .+ a voté/ }).click();
await pageTout.waitForTimeout(1300);
await auditerEcran("votes");

/* LE RETOUR DU TELEPHONE, MESURE POUR DE VRAI. Sans lui, le geste le plus courant
   d'Android ferme l'application installee. On verifie aussi que l'adresse n'a pas
   bouge : une URL par commune mettrait la commune consultee dans l'historique. */
const urlAvant = pageTout.url();
await pageTout.goBack();
await pageTout.waitForTimeout(600);
const apresRetour = await pageTout.evaluate(() => ({
  votes: !!document.querySelector(".votes"),
  texte: document.body.innerText.slice(0, 400),
}));
verif("navigation — le retour du telephone replie les votes au lieu de quitter",
  !apresRetour.votes && /Bagnolet/.test(apresRetour.texte),
  JSON.stringify(apresRetour).slice(0, 160));
verif("navigation — le retour conserve la commune et l'application reste ouverte",
  /Bagnolet/.test(apresRetour.texte) && !pageTout.isClosed(),
  apresRetour.texte.slice(0, 160).replace(/\n+/g, " / "));
verif("invariant 2 — le retour ne fait jamais apparaitre la commune dans l'adresse",
  pageTout.url() === urlAvant && !/bagnolet|9300/i.test(pageTout.url()), pageTout.url());

/* La commune est toujours Bagnolet après le retour : on poursuit directement
   le banc sur les autres écrans, sans refaire l'onboarding. */
await pageTout.getByRole("button", { name: "Où va l'argent" }).click();
await pageTout.waitForTimeout(900);
await auditerEcran("ou va l'argent");
await pageTout.getByRole("button", { name: "Sources" }).click();
await pageTout.waitForTimeout(800);
await auditerEcran("sources");

/* --- CE QUI A ETE DECIDE : le septieme ecran ------------------------------- *
 * Il est mesure comme les six autres — plancher typographique et zones d'appui —
 * PUIS sur ce qui lui est propre : un fil date ne vaut que si le lecteur sait
 * dans quel ordre il lit, et d'ou vient chaque fait. */
/* « Ce qui a été décidé » est un approfondissement de l'écran Aujourd'hui.
   Après Sources, on revient explicitement à Aujourd'hui plutôt que de supposer
   que son bouton existe sur un écran national. */
await pageTout.getByRole("button", { name: /Voir aujourd.hui à Bagnolet/ }).click();
await pageTout.waitForTimeout(900);
/* UN ECRAN, UN NOM — 07/10/2026. Les boutons d'« Aujourd'hui » portaient d'autres
   noms que les onglets qu'ils ouvrent (« Toutes les décisions » -> « Ce qui a été
   décidé »). Chaque bouton doit porter le nom exact de l'onglet ouvert, sans
   exception : le calendrier s'appelle « Le calendrier » (porteur, 07/10/2026). */
{
  const boutons = await pageTout.locator("nav.auj-suite button").allInnerTexts();
  const ouvert = [];
  for (const nom of boutons) {
    await pageTout.locator("nav.auj-suite").getByRole("button", { name: nom, exact: true }).click();
    await pageTout.waitForTimeout(700);
    const actif = await pageTout.locator("nav.onglets [aria-current=page]").innerText().catch(() => "(aucun onglet actif)");
    ouvert.push([nom.trim(), actif.trim()]);
    await pageTout.getByRole("button", { name: /Voir aujourd.hui à Bagnolet/ }).click();
    await pageTout.waitForTimeout(700);
  }
  const ecarts = ouvert.filter(([b, o]) => b !== o);
  verif("libelles — chaque bouton d'Aujourd'hui porte le nom exact de l'onglet qu'il ouvre",
    ouvert.length >= 4 && ecarts.length === 0, JSON.stringify(ecarts.length ? ecarts : ouvert));
}
await pageTout.getByRole("button", { name: "Ce qui a été décidé" }).click();
await pageTout.waitForTimeout(1600);
await auditerEcran("ce qui a ete decide");

const fil = await pageTout.evaluate(() => {
  const t = document.body.innerText;
  const faits = [...document.querySelectorAll(".ligne.fait")];
  return {
    texte: t,
    faits: faits.length,
    titres: faits.map(f => (f.querySelector(".fait-titre, .vote-titre") || {}).innerText || ""),
    entetes: [...document.querySelectorAll(".ligne.fait .groupe")].map(e => e.innerText),
    /* lot lexique (30/09/2026) : l'annee est lue sur son element, plus sur le mot « exercice » */
    annees: [...document.querySelectorAll(".fait-annee")].map(e => Number(e.innerText)),
    sources: [...document.querySelectorAll(".source")].map(e => e.innerText),
    sourcesHref: [...document.querySelectorAll(".source a[href]")].map(a => a.href),
    squelettes: document.querySelectorAll("[class*='skeleton'], [class*='squelette'], .shimmer").length,
  };
});

verif("surface datee — le fil porte au moins un fait date",
  fil.faits > 0, JSON.stringify({ faits: fil.faits }));
verif("surface datee — la regle d'ordre est ecrite a l'ecran (principe P4)",
  /ordre de date/i.test(fil.texte) && /plus récent au plus ancien/i.test(fil.texte),
  fil.texte.slice(0, 200).replace(/\n+/g, " / "));
verif("surface datee — les exercices se lisent du plus recent au plus ancien",
  /* au moins une annee lue : sans elle, « every » sur une liste vide passerait en silence */
  fil.annees.length > 0 && fil.annees.every((a, i) => i === 0 || fil.annees[i - 1] >= a), JSON.stringify(fil.annees));
/* TROUVE A L'OEIL SUR CAPTURE, PAS PAR UNE ASSERTION : « A l'Assemblee nationale,
   X a vote » etait repete devant CHACUN des huit votes, soit huit fois de suite,
   et repoussait les titres de plusieurs hauteurs d'ecran. L'en-tete ne doit
   apparaitre qu'en tete d'une suite. */
verif("surface datee — l'en-tete d'une famille de faits ne se repete pas",
  fil.entetes.length <= 3 && new Set(fil.entetes).size === fil.entetes.length,
  JSON.stringify(fil.entetes));
verif("invariant 4 — chaque famille de faits porte sa provenance",
  fil.sources.length >= 1 && fil.sources.every(x => /·/.test(x) && /à la source/.test(x)),
  JSON.stringify(fil.sources).slice(0, 200));
verif("invariant 5 — le fil n'affiche aucune forme d'attente",
  fil.squelettes === 0, String(fil.squelettes));
verif("invariant 2 — le fil date ne demande aucune adresse portant un code de commune",
  !servies.some(u => /\/(?:projets|scrutins)\/\d{5}/.test(u) || /9300[0-9]|75056/.test(u)),
  servies.filter(u => /projets/.test(u)).join(" "));

/* LE FIL EDITORIAL — BLOCKER #3 DE LA MISSION DU 22/09/2026. Ces deux faits
 * sont a l'echelon "france" : ils doivent apparaitre pour N'IMPORTE QUELLE
 * commune, Bagnolet comme une autre — c'est ce que verifie ce controle, pas
 * seulement que le mecanisme existe en theorie. */
verif("fil editorial — un fait relu et valide par la redaction est visible",
  /Le Conseil constitutionnel a déclaré la loi sur l'aide à mourir conforme/.test(fil.texte),
  fil.texte.slice(0, 400).replace(/\n+/g, " / "));
verif("fil editorial — la mention distingue explicitement une validation humaine, jamais automatique",
  /relu et validé par la rédaction/.test(fil.texte),
  "aucune mention de validation humaine trouvee — un fait redactionnel pourrait passer pour automatique");
verif("fil editorial — chaque fait pointe vers SA propre source officielle, pas une source partagee",
  fil.sourcesHref.some(h => /conseil-constitutionnel\.fr/.test(h)),
  JSON.stringify(fil.sourcesHref.filter(h => /conseil|assemblee/.test(h))));
verif("invariant 3 — le fil editorial ne classe ni ne compare aucun territoire",
  !/classement|palmar|moyenne nationale|mieux que|top \d/i.test(fil.texte),
  "un mot de comparaison est apparu avec le fil editorial");

/* UNE COMMUNE QUI PORTE LES DEUX FAMILLES DE FAITS. Bagnolet, la commune du
 * parcours, n'a aucun projet dans le releve de mesure : le fil n'y montre que des
 * votes, et toute la mise en forme d'un projet — le montant, le dispositif
 * developpe, le cout total, la source de la DGCL — serait restee sans controle.
 * Aubervilliers en porte quatre. Mesurer sur une commune ou la moitie du code ne
 * s'execute pas, c'est ne rien mesurer.
 * UN CONTEXTE NEUF, ET C'EST NECESSAIRE : l'application se souvient du dernier
 * departement ouvert, donc une page neuve dans le meme contexte rouvre la commune
 * precedente et le champ « Ou habitez-vous » n'est plus a l'ecran. */
const ctxA = await nav.newContext({ viewport: { width: 390, height: 844 } });
const pageA = await ctxA.newPage();
await pageA.goto(base, { waitUntil: "networkidle" });
await pageA.getByLabel(/Où habitez-vous/).fill("aubervilliers");
await pageA.waitForTimeout(400);
await pageA.getByRole("button", { name: /Aubervilliers/ }).click();
await pageA.waitForTimeout(1500);
/* 06/10/2026 : apres le choix, l'ecran ouvert est « Aujourd'hui » ; « Toutes
   les decisions » y mene vers « Ce qui a ete decide ». Ne PAS cliquer ensuite
   « Voir aujourd'hui » : ce lien ramene a Aujourd'hui, et le banc mesurait
   alors le mauvais ecran (Epreuve #143 : six echecs en cascade). Le controle
   ci-dessous nomme l'erreur de navigation au lieu de la laisser se propager. */
await pageA.getByRole("button", { name: "Ce qui a été décidé" }).click();
await pageA.waitForTimeout(1600);
const surDecisionsA = await pageA.getByText(/Ce qui a été décidé pour Aubervilliers/).count();
verif("parcours — « Ce qui a été décidé » ouvre bien l'écran des décisions",
  surDecisionsA > 0, "l'ecran ouvert n'est pas « Ce qui a ete decide pour Aubervilliers »");
await auditerEcran("ce qui a ete decide — avec projets", pageA);

const avecProjets = await pageA.evaluate(() => {
  const t = document.body.innerText;
  return {
    texte: t,
    projets: document.querySelectorAll(".fait-titre").length,
    votes: document.querySelectorAll(".vote-titre").length,
    montants: [...t.matchAll(/L'État a engagé ([\d   ]+) €/g)].map(m => m[1]),
    sources: [...document.querySelectorAll(".source")].map(e => e.innerText),
    /* Principe P12 : deux objets de meme nature ne se hierarchisent pas. */
    tailleProjet: (() => { const e = document.querySelector(".fait-titre");
      return e ? getComputedStyle(e).fontSize : null; })(),
    tailleVote: (() => { const e = document.querySelector(".vote-titre");
      return e ? getComputedStyle(e).fontSize : null; })(),
  };
});

verif("surface datee — une commune financee montre ses projets ET les votes de son depute",
  avecProjets.projets >= 3 && avecProjets.votes >= 1,
  JSON.stringify({ projets: avecProjets.projets, votes: avecProjets.votes }));
verif("surface datee — un montant s'affiche en euros, groupe a la francaise",
  avecProjets.montants.length >= 3 && avecProjets.montants.every(m => /\s/.test(m.trim())),
  JSON.stringify(avecProjets.montants.slice(0, 3)));
verif("surface datee — le sigle du dispositif est developpe en toutes lettres",
  /Dotation politique de la ville/.test(avecProjets.texte), "");
verif("surface datee — le cout total est annonce hors taxes, comme la source le publie",
  /coût total du projet annoncé : .* hors taxes/.test(avecProjets.texte), "");
/* PRINCIPE P15, DIT AU LECTEUR PLUTOT QUE CORRIGE EN SILENCE : la DGCL publie
   « Renovation » sans accent. Si quelqu'un « corrige » un jour les accents, il
   reecrira un intitule officiel — et l'ecran cesserait de le dire. */
verif("principe P15 — l'intitule officiel n'est pas reecrit, et l'ecran le dit",
  /Renovation de la halle/.test(avecProjets.texte)
  && /recopiés tels que l'État les publie/.test(avecProjets.texte), "");
verif("principe P12 — un projet et une loi portent le meme poids typographique",
  avecProjets.tailleProjet && avecProjets.tailleProjet === avecProjets.tailleVote,
  avecProjets.tailleProjet + " vs " + avecProjets.tailleVote);
verif("invariant 4 — les deux provenances sont distinctes et nommees",
  avecProjets.sources.length >= 2
  && avecProjets.sources.some(x => /Projets|collectivités locales|FIXTURE/i.test(x))
  && avecProjets.sources.some(x => /Assemblée|scrutin/i.test(x)),
  JSON.stringify(avecProjets.sources).slice(0, 220));
/* INVARIANT 3, SUR L'ECRAN QUI PORTE DES MONTANTS : aucun total, aucun montant
   par habitant, aucun mot qui compare cette commune a une autre. */
verif("invariant 3 — le fil ne totalise rien et ne compare a aucune autre commune",
  !/par habitant|au total|total des subventions|moyenne des communes|davantage que/i.test(avecProjets.texte),
  avecProjets.texte.slice(0, 160).replace(/\n+/g, " / "));
await ctxA.close();

verif("accessibilite — sur les sept ecrans, toute cible tactile mesure au moins 44 px",
  fautesCibles.length === 0, fautesCibles.slice(0, 4).join(" | "));
verif("lisibilite — sur les sept ecrans, aucun texte porteur de sens sous 13 px",
  fautesTexte.length === 0, fautesTexte.slice(0, 4).join(" | "));
await ctxTout.close();

/* L'INTERCOMMUNALITE EN ILE-DE-FRANCE, A L'ECRAN — 07/10/2026. */
{
  const pageEpt = await (await nav.newContext()).newPage();
  await pageEpt.goto(base, { waitUntil: "networkidle" });
  await pageEpt.getByLabel(/Où habitez-vous/).fill("Bagnolet");
  await pageEpt.waitForTimeout(300);
  await pageEpt.getByRole("button", { name: /^Bagnolet\b/ }).click();
  await pageEpt.waitForTimeout(1200);
  await pageEpt.getByRole("button", { name: "Qui décide", exact: true }).click();
  await pageEpt.waitForTimeout(900);
  const tEpt = await pageEpt.evaluate(() => document.body.innerText);
  verif("intercommunalite IDF — la Metropole ne « decide » ni des transports ni des dechets",
    !/Les transports, les déchets/.test(tEpt) && /Île-de-France Mobilités/.test(tEpt) && /établissement public territorial/.test(tEpt),
    tEpt.slice(tEpt.indexOf("intercommunalité"), tEpt.indexOf("intercommunalité") + 400).replace(/\n+/g, " / "));
  await pageEpt.context().close();
}

console.log("\n--- theme sombre ---------------------------------------------");
/* LE THEME SOMBRE EST UN VRAI RENDU, PAS UNE VARIANTE. Mesure : le titre « A
   l'Assemblee nationale » y avait un rapport de contraste de 1,02 sur le fond de
   sa carte — invisible. Aucun controle ne regardait le theme sombre. */
const ctxSombre = await nav.newContext({ viewport: { width: 390, height: 844 }, colorScheme: "dark" });
const pageSombre = await ctxSombre.newPage();
const erreursSombre = [];
pageSombre.on("pageerror", e => erreursSombre.push(e.message));
await pageSombre.goto(base, { waitUntil: "networkidle" });
await pageSombre.waitForTimeout(1000);
await pageSombre.getByLabel(/Où habitez-vous/).fill("64");
await pageSombre.waitForTimeout(200);
await pageSombre.getByRole("button", { name: /^64\b/ }).click();
await pageSombre.waitForTimeout(1600);
await pageSombre.getByLabel(/Votre commune/).fill("Ustaritz");
await pageSombre.waitForTimeout(300);
await pageSombre.getByRole("button", { name: "Ustaritz", exact: true }).click();
await pageSombre.waitForTimeout(600);
/* 06/10/2026 : apres le choix, l'ecran ouvert est « Aujourd'hui », sans barre
   d'onglets. On passe par « Qui decide » (ses boutons d'approfondissement) pour
   retrouver la barre, puis « Sources ». Sans cela, le banc s'arretait ici sur
   un delai depasse et AUCUN controle suivant ne tournait (Epreuve #143, #144). */
await pageSombre.locator("nav.auj-suite").getByRole("button", { name: "Qui décide" }).click();
await pageSombre.waitForTimeout(600);
await pageSombre.getByRole("button", { name: "Sources" }).click();
await pageSombre.waitForTimeout(800);

const contrastes = await pageSombre.evaluate(() => {
  const rgb = t => (t.match(/\d+(\.\d+)?/g) || []).slice(0, 3).map(Number);
  const lum = c => {
    const v = c.map(x => x / 255).map(x => x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4));
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  };
  const fond = e => {
    for (let n = e; n; n = n.parentElement) {
      const c = getComputedStyle(n).backgroundColor;
      const p = rgb(c);
      if (p.length === 3 && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return p;
    }
    return [255, 255, 255];
  };
  const rapport = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };
  return [...document.querySelectorAll(".carte h2, .tuile-v, .carte-s, .ligne-h b, .tag")].map(e => ({
    quoi: e.className || e.tagName, texte: (e.innerText || "").slice(0, 28),
    r: Math.round(rapport(rgb(getComputedStyle(e).color), fond(e)) * 100) / 100,
  }));
});
const troppeu = contrastes.filter(c => c.r < 3);
verif("accessibilite — en theme sombre, aucun texte sous 3:1 de contraste",
  troppeu.length === 0,
  troppeu.map(c => `${c.texte} = ${c.r}:1`).join(" | "));
verif("accessibilite — la mesure de contraste porte bien sur quelque chose",
  contrastes.length >= 5, contrastes.length + " element(s) mesure(s)");
verif("theme sombre — aucune erreur JavaScript", erreursSombre.length === 0, erreursSombre.join(" | "));

/* BLOCKER 11 DE LA RC DU 15/09, PROUVE ICI. `--e-national` n'existe pas : le
 * contour de focus des deux commandes qui ouvrent les votes retombait sur son
 * repli #1d1d1f, presque noir sur un fond presque noir en theme sombre — ratio
 * mesure 1,02 contre 3,00 exige (WCAG 2.4.11). Le controle de contraste ci-dessus
 * ne l'aurait jamais vu : il ne mesure QUE la couleur du texte, jamais un
 * contour. On mesure donc le contour lui-meme, au clavier, pas a la souris —
 * c'est ce qui distingue :focus-visible de :hover. */
await pageSombre.getByRole("button", { name: "Qui décide" }).click();
await pageSombre.waitForTimeout(400);
const boutonVotes = pageSombre.getByRole("button", { name: /Comment .+ a voté à l'Assemblée/ });
/* `.focus()` SEUL NE SUFFIT PAS. Mesure : juste apres un clic souris, Chromium
 * n'active PAS `:focus-visible` sur un focus programmatique — le premier essai
 * de cette mesure passait donc a tort, quel que soit le CSS. Une touche Tab
 * fait basculer la modalite d'entree sur clavier pour toute la page ; le focus
 * programmatique qui suit hérite alors du vrai `:focus-visible`. Verifie avec
 * `e.matches(':focus-visible')` plus bas, pas suppose. */
await pageSombre.keyboard.press("Tab");
await boutonVotes.focus();
const contourVotes = await pageSombre.evaluate(() => {
  const rgb = t => (t.match(/\d+(\.\d+)?/g) || []).slice(0, 3).map(Number);
  const lum = c => {
    const v = c.map(x => x / 255).map(x => x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4));
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  };
  const fond = e => {
    for (let n = e; n; n = n.parentElement) {
      const c = getComputedStyle(n).backgroundColor;
      const p = rgb(c);
      if (p.length === 3 && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return p;
    }
    return [255, 255, 255];
  };
  const rapport = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };
  const e = document.activeElement;
  const s = getComputedStyle(e);
  /* `fond(e.parentElement)`, PAS `fond(e)`. Un `outline-offset` positif dessine
   * l'anneau HORS de la boite du bouton : ce qu'un lecteur voit derriere
   * l'anneau est le fond du PARENT, jamais le remplissage propre du bouton.
   * Mesure qui a fait echouer une premiere version de ce controle : `.depliant`
   * porte `background: var(--fond-2, #f5f5f7)`, et `--fond-2` n'existe nulle
   * part (aucune definition, dans aucun theme) — le repli clair s'applique
   * donc TOUJOURS, meme en theme sombre. `fond(e)` trouvait ce gris clair et
   * calculait un contraste de 15:1, masquant le vrai bug (1,02:1) derriere un
   * defaut qui n'a jamais ete pose. Distinct de ce correctif, non traite ici :
   * `--fond-2` et `--fond-3` restent a definir pour le theme sombre. */
  const fondReel = fond(e.parentElement);
  return { balise: e.className, couleur: s.outlineColor, largeur: s.outlineWidth,
    visible: e.matches(":focus-visible"),
    r: Math.round(rapport(rgb(s.outlineColor), fondReel) * 100) / 100 };
});
verif("accessibilite — la mesure du contour porte bien sur un vrai :focus-visible",
  contourVotes.balise === "depliant" && contourVotes.visible === true && contourVotes.largeur !== "0px",
  JSON.stringify(contourVotes));
verif("accessibilite — le contour de focus des commandes qui ouvrent les votes atteint 3:1 en theme sombre",
  contourVotes.r >= 3, JSON.stringify(contourVotes));
await ctxSombre.close();

console.log("\n--- bandeau de nouvelle version --------------------------------");
/* PROUVE LE MECANISME DE NouvelleVersion.jsx EN LE CASSANT REELLEMENT : on
   modifie sur disque le commit_court que le serveur de mesure sert dans
   data/index.json, SANS toucher au JS deja construit (qui garde le commit
   figé au build) — exactement la situation reelle d'un onglet ouvert avant
   un nouveau deploiement. Le fichier est restaure avant la fin du bloc, quoi
   qu'il arrive : ce n'est pas une fixture qui doit survivre au-dela de ce
   controle, contrairement a celle des projets plus haut dans ce fichier. */
const fIndexVersion = path.join(DIST, "data", "index.json");
const indexOriginal = fs.readFileSync(fIndexVersion, "utf8");
const ctxVersion = await nav.newContext({ viewport: { width: 390, height: 844 } });
const pageVersion = await ctxVersion.newPage();
try {
  await pageVersion.goto(base, { waitUntil: "networkidle" });
  await pageVersion.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
  await pageVersion.waitForTimeout(400);
  const avant = await pageVersion.evaluate(() => document.body.innerText);
  verif("bandeau de version — absent quand le commit servi correspond au build",
    !/nouvelle version de Repère/i.test(avant), avant.slice(0, 80).replace(/\n+/g, " / "));

  const indexMute = JSON.parse(indexOriginal);
  indexMute.build = indexMute.build || {};
  indexMute.build.commit_court = "0000000";
  fs.writeFileSync(fIndexVersion, JSON.stringify(indexMute));

  await pageVersion.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
  await pageVersion.waitForTimeout(600);
  const apresDecalage = await pageVersion.evaluate(() => document.body.innerText);
  verif("bandeau de version — un decalage de commit fait apparaitre le bandeau",
    /nouvelle version de Repère/i.test(apresDecalage),
    apresDecalage.slice(0, 200).replace(/\n+/g, " / "));

  const roleStatut = await pageVersion.evaluate(() => {
    const b = [...document.querySelectorAll('[role="status"]')]
      .find(e => /nouvelle version de Repère/i.test(e.textContent || ""));
    return !!b;
  });
  verif("bandeau de version — porte role=status, annonce sans etre agressif", roleStatut);

  const boutonActualiser = pageVersion.getByRole("button", { name: "Actualiser" });
  verif("bandeau de version — un vrai bouton clavier, pas une bannière muette",
    (await boutonActualiser.count()) > 0);

  fs.writeFileSync(fIndexVersion, indexOriginal); /* le commit redevient coherent AVANT le clic */
  await boutonActualiser.click();
  await pageVersion.waitForLoadState("networkidle");
  await pageVersion.waitForTimeout(400);
  const apresActualisation = await pageVersion.evaluate(() => document.body.innerText);
  verif("bandeau de version — Actualiser recharge, et le bandeau disparait une fois le commit coherent",
    !/nouvelle version de Repère/i.test(apresActualisation),
    apresActualisation.slice(0, 80).replace(/\n+/g, " / "));
} finally {
  fs.writeFileSync(fIndexVersion, indexOriginal);
  await ctxVersion.close();
}

console.log("\n--- hors ligne -----------------------------------------------");
const sw = await page.evaluate(async () => {
  const r = await navigator.serviceWorker.getRegistration();
  if (!r || !r.active) return { actif: false };
  const noms = await caches.keys();
  return { actif: true, caches: noms };
});
verif("invariant 1 — le service worker s'installe", sw.actif === true, JSON.stringify(sw));
verif("invariant 1 — la coquille et les donnees sont dans DEUX caches",
  (sw.caches || []).some(n => n.startsWith("repere-coquille-"))
  && (sw.caches || []).includes("repere-donnees-v1"),
  (sw.caches || []).join(", "));

/* LA COUPURE EST REELLE : ON ETEINT LE SERVEUR.
   `setOffline` coupe le reseau de la PAGE, mais les requetes emises par le
   service worker lui echappent — mesure du 25/08/2026 : six requetes ont
   atteint le serveur pendant une phase declaree hors ligne. Un controle qui
   repose dessus mesurerait donc autre chose que ce qu'il annonce. On coupe la
   seule chose qu'on maitrise vraiment : le serveur cesse d'exister. Ce qui
   s'affiche ensuite ne peut venir que du cache. */
horsLignePhase = true;
await ctx.setOffline(true);
await new Promise(r => { serveur.closeAllConnections(); serveur.close(r); });
servies = [];
await page.reload({ waitUntil: "load" }).catch(() => {});
await page.waitForTimeout(3000);

const horsLigne = await page.evaluate(() => ({
  coupe: navigator.onLine === false,
  texte: document.body.innerText,
}));
verif("invariant 1 — le reseau est bien coupe pendant la mesure",
  horsLigne.coupe === true, "navigator.onLine vaut encore true : la mesure ne prouverait rien");
verif("invariant 1 — hors ligne, l'application s'ouvre",
  /Qui décide chez vous/.test(horsLigne.texte), horsLigne.texte.slice(0, 120));
/* CE QUE CE CONTROLE MESURE MAINTENANT. Il cherchait une phrase de l'interface,
   donc il tombait au premier changement de formulation tout en laissant passer
   une vraie panne. Il mesure desormais l'etat : le paquet departemental est
   revenu (des communes de ce departement sont listees) ET la liste des
   departements aussi (on peut encore en changer hors ligne). */
const etatHorsLigne = await page.evaluate(() => ({
  communes: document.querySelectorAll(".choix-commune .puce").length,
  choixDept: !!document.querySelector(".choix"),
  dept: (document.querySelector(".choix > summary") || {}).innerText || "",
}));
verif("invariant 1 — hors ligne, le departement deja consulte revient tout seul",
  etatHorsLigne.communes > 0 && /64/.test(etatHorsLigne.dept),
  JSON.stringify(etatHorsLigne));
verif("invariant 1 — hors ligne, on peut encore changer de departement",
  etatHorsLigne.choixDept === true,
  "la liste des departements n'a pas survecu a la coupure : elle n'etait gardee qu'en memoire");
/* Le message doit dire la verite sur l'etat reel. Un « Repere n'a pas reussi a
   joindre le serveur » affiche AU-DESSUS de donnees presentes est un mensonge,
   et le bouton Reessayer un cul-de-sac dans un tunnel. */
verif("invariant 5 — hors ligne, aucun message d'echec au-dessus de donnees presentes",
  !/n'a pas réussi à joindre le serveur/.test(horsLigne.texte),
  horsLigne.texte.slice(0, 200).replace(/\n+/g, " / "));
/* INVARIANT 9 : hors ligne, les donnees gardees s'affichent, mais l'ecran ne
   pretend pas qu'elles sont a jour. */
verif("invariant 9 — hors ligne, l'ecran dit que Repere n'a pas pu verifier s'il existe une publication plus recente",
  /n'a pas pu vérifier s'il existe une publication plus récente/.test(horsLigne.texte),
  horsLigne.texte.slice(0, 300).replace(/\n+/g, " / "));

/* SCENARIO 6 : hors ligne, un departement JAMAIS telecharge. Le produit doit
   dire « vous etes hors ligne », pas « le serveur n'a pas repondu » — et surtout
   ne pas proposer « Reessayer » a quelqu'un qui n'a pas de reseau. */
await page.locator(".choix > summary").click();
await page.waitForTimeout(300);
await page.getByRole("button", { name: /^12\b/ }).click();
await page.waitForTimeout(1200);
const jamaisVu = await page.evaluate(() => ({
  texte: document.body.innerText,
  reessayer: [...document.querySelectorAll(".vide button")].map(b => b.innerText),
}));
verif("invariant 5 — hors ligne, un departement jamais telecharge le dit dans ces mots",
  /Vous êtes hors ligne/.test(jamaisVu.texte)
  && /jamais été téléchargé sur cet appareil/.test(jamaisVu.texte),
  jamaisVu.texte.slice(0, 220).replace(/\n+/g, " / "));
verif("invariant 5 — aucun bouton « Reessayer » n'est propose hors ligne",
  jamaisVu.reessayer.every(t => !/Réessayer/i.test(t)),
  jamaisVu.reessayer.join(" | ") + " — un bouton Reessayer dans un tunnel est un cul-de-sac");

verif("rendu — aucune erreur JavaScript applicative sur tout le parcours",
  erreurs.length === 0, erreurs.slice(0, 3).join(" | "));
/* CE CONTROLE A ETE REECRIT LE 25/08/2026. La premiere version exigeait que le
   navigateur ait REFUSE des requetes pendant la phase hors ligne, en supposant
   qu'une application hors ligne en tente forcement. Mesure : elle n'en tente
   aucune — tout vient du cache, et c'est l'ideal. Le controle punissait donc le
   bon comportement. Ce qu'il faut mesurer est l'inverse : AUCUNE requete ne doit
   atteindre le serveur, puisque tout doit venir du cache. */
verif("invariant 1 — le serveur est bien eteint pendant la mesure",
  serveur.listening === false && servies.length === 0,
  "le serveur ecoute encore, ou a recu " + servies.length + " requete(s)");

await nav.close();
if (serveur.listening) serveur.close();

const echecs = resultats.filter(r => !r.ok);
console.log("\n--------------------------------------------------------------");
console.log(resultats.length + " controles, " + echecs.length + " echec(s).");
if (echecs.length) {
  console.log("\nA CORRIGER :");
  echecs.forEach(e => console.log("  - " + e.nom + (e.detail ? "  -> " + e.detail : "")));
  process.exit(1);
}
console.log("\nVERDICT : tout passe");
