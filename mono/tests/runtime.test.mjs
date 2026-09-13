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
if (!fs.existsSync(path.join(DIST, "index.html"))) {
  console.error("build absent : " + DIST + " — lance `pnpm build` puis copie data/ dedans");
  process.exit(2);
}

const resultats = [];
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
  erreurs.push("console: " + t);
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
await page.getByLabel(/Votre département/).focus();
for (let i = 0; i < 16; i++) { await page.keyboard.press("Tab"); await page.waitForTimeout(40); }
/* On RESSORT de la liste avant de mesurer : se poser sur une pastille EST une
   intention, et precharger ce territoire-la est le comportement voulu. Ce que le
   controle mesure, c'est la traversee — le doigt ou le focus qui passe. */
await page.getByLabel(/Votre département/).focus();
await page.waitForTimeout(1400);
const paquetsFiles = servies.filter(u => u.startsWith("/data/departments/"));
verif("prechargement — traverser la liste au clavier ne telecharge aucun departement",
  paquetsFiles.length === 0,
  paquetsFiles.length + " paquet(s) demande(s) : " + [...new Set(paquetsFiles)].slice(0, 5).join(", "));

/* Recherche par nom, sans accents : personne ne tape « Pyrénées » au clavier. */
await page.getByLabel(/Votre département/).fill("pyrenees at");
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
verif("invariant 2 — une seule cle, nommee, et elle ne porte qu'un departement",
  apres.local.length === 1 && apres.local[0] === "repere.departement"
  && /^(\d{2,3}|2[AB])$/.test(apres.valeur || ""),
  JSON.stringify(apres));
verif("invariant 2 — sessionStorage reste vide", apres.session.length === 0, apres.session.join(","));

await page.getByLabel(/Votre commune/).fill("Ustaritz");
await page.waitForTimeout(400);
await page.getByRole("button", { name: "Ustaritz", exact: true }).click();
await page.waitForTimeout(700);

const qui = await page.evaluate(() => document.body.innerText);
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

/* LE PREMIER ECRAN NE PAIE PAS CE FICHIER. Il ne part QUE depuis « Qui decide » :
   la mesure porte sur les adresses reellement demandees depuis l'ouverture. */
verif("architecture — le fichier des deputes n'est demande qu'une fois, et pas au premier ecran",
  adresses.filter(u => /\/data\/deputes\.json$/.test(u)).length === 1
  && adresses.indexOf(adresses.find(u => /deputes\.json$/.test(u)))
     > adresses.indexOf(adresses.find(u => /index\.json$/.test(u))),
  adresses.join(" ") || "(aucune adresse relevee)");

console.log("\n--- les votes du depute --------------------------------------");
/* LA CHAINE COMPLETE, MESUREE DANS UN VRAI NAVIGATEUR :
   commune -> circonscription -> depute -> scrutins -> position -> source.
   Le banc statique verifie les fichiers ; ici on verifie que le lecteur les
   atteint, et surtout QUAND ils partent au reseau. */
const avantDepliage = adresses.slice();
verif("architecture — rien de la chaine des votes ne part avant que le lecteur ne demande",
  !avantDepliage.some(u => /\/data\/scrutins/.test(u)),
  avantDepliage.filter(u => /scrutins/.test(u)).join(" ") || "(aucune, c'est ce qu'on veut)");

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
    /\d{1,2} \w+ 202\d/.test(votes) && /(Pour|Contre|Abstention|Position non portée)/.test(votes),
    votes.slice(0, 300).replace(/\n+/g, " / "));

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
  && (magasins.cles || []).every(c => /^(dep|vote|socle):[0-9A-Z]{1,3}$/.test(c)),
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

/* La langue : le francais affiche porte ses accents. Faute commise deux fois.
   La mesure ne portait que sur l'ecran des comptes ; l'ecran « Sources », lui,
   affichait « Ministere de l'Interieur ... circonscription legislative » recopie
   tel quel depuis le fichier engendre. On lit donc les TROIS ecrans. */
await page.getByRole("button", { name: "Sources" }).click();
await page.waitForTimeout(700);
const texteSources = await page.evaluate(() => document.body.innerText);
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

const vuPartout = argent.t + "\n" + texteSources + "\n" + qui;
const sansAccent = MOTS_A_ACCENTS.filter(m =>
  new RegExp("(?:^|[^A-Za-zÀ-ÿ./-])" + m + "(?![A-Za-zÀ-ÿ./-])").test(vuPartout));
verif("langue — le francais affiche porte ses accents, sur les trois ecrans",
  sansAccent.length === 0, sansAccent.join(", "));

await page.getByRole("button", { name: "Où va l'argent" }).click();
await page.waitForTimeout(500);

console.log("\n--- cibles tactiles et accessibilite -------------------------");
const petites = await page.evaluate(() =>
  [...document.querySelectorAll("button, a[href], input")]
    .map(e => ({ h: Math.round(e.getBoundingClientRect().height), t: (e.innerText || e.type || "").slice(0, 20) }))
    .filter(e => e.h > 0 && e.h < 44));
verif("accessibilite — toute cible tactile mesure au moins 44 px",
  petites.length === 0, petites.slice(0, 4).map(p => p.t + " (" + p.h + "px)").join(" | "));

console.log("\n--- recherche et accents -------------------------------------");
/* LA RECHERCHE NE DOIT PAS DEPENDRE DES ACCENTS, DANS LES DEUX SENS. Depuis que
   les libelles portent leur orthographe officielle, une comparaison brute
   ferait disparaitre Évry-Courcouronnes pour qui tape « evry » — et l'inverse
   etait deja vrai avant. On mesure les deux graphies sur la meme commune. */
const pageAcc = await (await nav.newContext()).newPage();
await pageAcc.goto(base, { waitUntil: "networkidle" });
await pageAcc.getByLabel(/Votre département/).fill("essonne");
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

console.log("\n--- mouvement reduit -----------------------------------------");
/* LA COUPURE DU MOUVEMENT, MESUREE ET PAS DEDUITE. Le controle statique lit le
   CSS ; celui-ci ouvre une page en declarant le reglage systeme « moins
   d'animations » et demande au navigateur ce qu'il applique reellement. */
const ctxCalme = await nav.newContext({ reducedMotion: "reduce" });
const pageCalme = await ctxCalme.newPage();
await pageCalme.goto(base, { waitUntil: "networkidle" });
await pageCalme.getByRole("button", { name: /^64\b/ }).click();
await pageCalme.getByLabel(/Votre commune/).fill("Ustaritz");
await pageCalme.getByRole("button", { name: "Ustaritz", exact: true }).click();
await pageCalme.waitForTimeout(700);
const calme = await pageCalme.evaluate(() => {
  const e = document.querySelector(".amicro-fadeup");
  if (!e) return { absent: true };
  const s = getComputedStyle(e);
  return { nom: s.animationName, opacite: s.opacity, visible: e.getBoundingClientRect().height > 0 };
});
verif("accessibilite — mouvement reduit demande : aucune animation ne se joue",
  !calme.absent && calme.nom === "none", JSON.stringify(calme));
/* ET LE CONTENU RESTE VISIBLE. Couper une animation en laissant l'opacite a zero
   serait pire que l'animation : la page resterait blanche. */
verif("accessibilite — mouvement reduit : le contenu est visible d'emblee",
  !calme.absent && calme.opacite === "1" && calme.visible, JSON.stringify(calme));
await ctxCalme.close();

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
await pageSombre.getByRole("button", { name: /^64\b/ }).click();
await pageSombre.waitForTimeout(1600);
await pageSombre.getByLabel(/Votre commune/).fill("Ustaritz");
await pageSombre.waitForTimeout(300);
await pageSombre.getByRole("button", { name: "Ustaritz", exact: true }).click();
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
await ctxSombre.close();

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
