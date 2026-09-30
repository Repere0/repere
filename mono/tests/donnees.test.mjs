/* LE DEPOT DE DONNEES, SANS NAVIGATEUR NI TELEPHONE — 30/09/2026.
 *
 * packages/data-utils/src/client.js est le seul chemin par lequel le site et
 * l'application lisent leurs donnees : memoire, magasin (IndexedDB ou disque),
 * reseau. Ces tests le mettent devant un faux reseau et un faux disque, et
 * verifient les promesses qu'il fait au lecteur :
 *
 *   - hors ligne, ce qui a ete recu est servi ;
 *   - en ligne, une donnee d'une generation precedente est redemandee
 *     (defaut corrige le 30/09 : le cache ne se rafraichissait jamais) ;
 *   - si le reseau echoue, la copie gardee est servie, marquee « perime » ;
 *   - quatre causes d'echec, quatre etats, quatre phrases ;
 *   - la garde refuse avant que le support ne recoive quoi que ce soit.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  chargerIndex, chargerDepartement, chargerProjets, ETATS, PHRASES, nouvelleSessionPourTest, etatFraicheur,
} from "../packages/data-utils/src/client.js";
import { phraseFraicheur } from "../packages/core/src/fraicheur.js";
import { magasin, configurerStockage } from "../packages/data-utils/src/store.js";

/* Un faux disque : ce qui survit a une reouverture de l'application. */
const disque = new Map();
const ecritures = [];
configurerStockage({
  async lire(c) { return disque.has(c) ? structuredClone(disque.get(c)) : undefined; },
  async ecrire(c, v) { ecritures.push(c); disque.set(c, structuredClone(v)); },
  async cles() { return [...disque.keys()]; },
  async vider() { disque.clear(); },
});

/* Un faux reseau. `reponses[url]` : un objet JSON, ou une fonction qui rend
   { status, type, texte } ou leve (reseau coupe). */
let reponses = {};
const appels = [];
globalThis.fetch = async (url, options = {}) => {
  appels.push({ url, cache: options.cache });
  const r = reponses[url];
  if (r === undefined) throw new TypeError("fetch failed");
  if (typeof r === "function") return r();
  return reponse(200, "application/json", JSON.stringify(r));
};
function reponse(status, type, texte, entetes = {}) {
  return {
    status, ok: status >= 200 && status < 300,
    headers: { get: h => (h.toLowerCase() === "content-type" ? type : (entetes[h.toLowerCase()] ?? null)) },
    json: async () => JSON.parse(texte),
  };
}
const index = gen => ({ v: 1, genere_le: gen.slice(0, 10), build: { construit_le: gen }, departements: [{ code: "77" }] });
const dep = maire => ({ d: "77", communes: { "77284": { nom: "Meaux", maire: { nom: maire } } } });
const projets = { v: 1, d: "77", communes: {} };

function ouvrirApplication() { nouvelleSessionPourTest(); appels.length = 0; }
async function toutEffacer() { await magasin.vider(); ecritures.length = 0; ouvrirApplication(); }

test("premiere visite en ligne : tout vient du reseau, tout est garde, avec sa generation", async () => {
  await toutEffacer();
  reponses = { "/data/index.json": index("2026-09-30T05:00:00Z"), "/data/departments/77.json": dep("A"), "/data/projets/77.json": projets };
  assert.equal((await chargerIndex()).depuis, "reseau");
  const d = await chargerDepartement("77");
  assert.equal(d.etat, ETATS.SERVI); assert.equal(d.depuis, "reseau");
  assert.ok(disque.has("dep:77") && disque.has("socle:IDX"));
  assert.equal(disque.get("socle:GEN").cles["dep:77"], "2026-09-30T05:00:00Z");
});

test("les projets sont gardes (cle proj:77) — ils ne l'etaient jamais avant le 30/09", async () => {
  ouvrirApplication();
  const p = await chargerProjets("77");
  assert.equal(p.etat, ETATS.SERVI);
  assert.ok(disque.has("proj:77"), "la garde refusait « proj » : les projets n'etaient jamais disponibles hors ligne");
});

test("reouverture, meme generation : le departement vient de l'appareil, sans requete", async () => {
  ouvrirApplication();
  const d = await chargerDepartement("77");
  assert.equal(d.depuis, "cache");
  assert.deepEqual(appels.map(a => a.url), ["/data/index.json"], "seul l'index est redemande");
  assert.equal(appels[0].cache, "no-cache", "l'index passe outre les caches HTTP et du service worker");
});

test("nouvelle publication : le departement d'une generation precedente est redemande", async () => {
  ouvrirApplication();
  reponses["/data/index.json"] = index("2026-10-01T05:00:00Z");
  reponses["/data/departments/77.json"] = dep("B");
  const d = await chargerDepartement("77");
  assert.equal(d.depuis, "reseau");
  assert.equal(d.donnees.communes["77284"].maire.nom, "B", "le lecteur voit le nouveau maire");
  assert.equal(appels.find(a => a.url.endsWith("77.json")).cache, "no-cache");
  assert.equal(disque.get("socle:GEN").cles["dep:77"], "2026-10-01T05:00:00Z");
});

test("nouvelle publication, mais le departement n'arrive pas : la copie gardee est servie, marquee perime", async () => {
  ouvrirApplication();
  reponses["/data/index.json"] = index("2026-10-02T05:00:00Z");
  delete reponses["/data/departments/77.json"];
  const d = await chargerDepartement("77");
  assert.equal(d.etat, ETATS.SERVI);
  assert.equal(d.depuis, "cache");
  assert.equal(d.perime, true, "l'ecran doit pouvoir dire que la donnee n'est pas la derniere publiee");
  assert.equal(d.donnees.communes["77284"].maire.nom, "B");
});

test("hors ligne, sans reseau du tout : l'index et le departement gardes sont servis", async () => {
  ouvrirApplication();
  reponses = {};
  const ix = await chargerIndex();
  assert.equal(ix.etat, ETATS.SERVI); assert.equal(ix.depuis, "cache");
  const d = await chargerDepartement("77");
  assert.equal(d.etat, ETATS.SERVI);
  assert.equal(d.donnees.communes["77284"].maire.nom, "B");
});

test("quatre causes d'echec, quatre etats, quatre phrases differentes", async () => {
  const cas = {
    reseau: [undefined, ETATS.ECHEC],
    absent: [() => reponse(404, "text/html", "<h1>404</h1>"), ETATS.INTROUVABLE],
    html: [() => reponse(200, "text/html; charset=utf-8", "<!doctype html>"), ETATS.INVALIDE],
    illisible: [() => reponse(200, "application/json", "{coupé"), ETATS.INVALIDE],
  };
  for (const [nom, [rep, attendu]] of Object.entries(cas)) {
    await toutEffacer();
    reponses = { "/data/index.json": index("2026-10-03T05:00:00Z") };
    if (rep) reponses["/data/departments/64.json"] = rep;
    const d = await chargerDepartement("64");
    assert.equal(d.etat, attendu, nom);
    assert.equal(d.donnees, null, nom + " : aucune donnee inventee");
  }
  const titres = [ETATS.ECHEC, ETATS.HORS_LIGNE, ETATS.INTROUVABLE, ETATS.INVALIDE].map(e => PHRASES[e] && PHRASES[e].titre);
  assert.ok(titres.every(Boolean), "chaque etat d'echec a sa phrase");
  assert.equal(new Set(titres).size, 4, "deux causes d'absence differentes exigent deux phrases differentes (invariant 5)");
  assert.ok(!/joindre le serveur/.test(PHRASES[ETATS.INVALIDE].titre), "le serveur a repondu : ne pas dire qu'on ne l'a pas joint");
});

test("un index garde d'un autre schema est jete, pas servi", async () => {
  await toutEffacer();
  disque.set("socle:IDX", { v: 999, departements: [{ code: "ZZ" }] });
  disque.set("dep:77", dep("PERIME"));
  reponses = {};
  const ix = await chargerIndex();
  assert.notEqual(ix.etat, ETATS.SERVI, "un index d'un autre schema ne doit jamais etre servi");
  assert.ok(!disque.has("dep:77"), "tout le magasin de cette generation de schema est jete");
});

test("la garde refuse AVANT que le support ne recoive quoi que ce soit", async () => {
  await toutEffacer();
  for (const [cle, valeur] of [
    ["commune:77284", { nom: "Meaux" }],
    ["dep:77284", { d: "77", communes: {} }],
    ["dep:77", { d: "77", communes: {}, commune_choisie: "77284" }],
  ]) {
    await assert.rejects(() => magasin.ecrire(cle, valeur), /refus d'ecriture/, cle);
  }
  assert.deepEqual(ecritures, [], "le support a recu une ecriture que la garde refuse");
});

/* ---------------------------------------------------------------------------
 * INVARIANT 9 — FRAICHEUR (decision du porteur du 30/09/2026). Trois etats,
 * distinguables : actuelle, precedente, inconnue. Jamais une donnee ancienne
 * presentee comme actuelle.
 * ------------------------------------------------------------------------- */
const copieSW = obj => () => reponse(200, "application/json", JSON.stringify(obj), { "x-repere-origine": "cache" });

test("fraicheur — index verifie, fichier recu : « actuelle », et rien a dire au lecteur", async () => {
  await toutEffacer();
  reponses = { "/data/index.json": index("2026-10-01T05:47:00Z"), "/data/departments/77.json": dep("A") };
  await chargerDepartement("77");
  const e = etatFraicheur();
  assert.equal(e.etat, "actuelle");
  assert.equal(phraseFraicheur(e), null);
});

test("fraicheur — une copie d'une publication precedente est dite, avec sa date", async () => {
  ouvrirApplication();
  reponses = { "/data/index.json": index("2026-10-02T05:47:00Z") };
  const d = await chargerDepartement("77");
  assert.equal(d.perime, true);
  const e = etatFraicheur();
  assert.equal(e.etat, "precedente");
  assert.equal(e.depuis, "2026-10-01T05:47:00Z", "la date dite est celle de la copie, pas celle de l'index");
  assert.match(phraseFraicheur(e).titre, /publication du 1er octobre 2026/);
});

test("fraicheur — serveur injoignable : « inconnue », jamais « actuelle »", async () => {
  ouvrirApplication();
  reponses = {};
  const d = await chargerDepartement("77");
  assert.equal(d.etat, ETATS.SERVI, "la donnee gardee reste lisible hors ligne");
  const e = etatFraicheur();
  assert.equal(e.etat, "inconnue");
  assert.match(phraseFraicheur(e).titre, /n'a pas pu joindre le serveur/);
  assert.match(phraseFraicheur(e).corps, /plus récente existe peut-être/);
});

test("fraicheur — un index servi par le service worker n'est pas une verification", async () => {
  ouvrirApplication();
  reponses = { "/data/index.json": copieSW(index("2026-10-09T05:47:00Z")) };
  await chargerIndex();
  assert.equal(etatFraicheur().etat, "inconnue", "une copie du cache ne prouve pas que la publication est la derniere");
  assert.notEqual(disque.get("socle:IDX").build.construit_le, "2026-10-09T05:47:00Z", "la copie ne remplace pas l'index garde");
});

test("fraicheur — un fichier servi par le service worker n'est jamais note comme courant", async () => {
  await toutEffacer();
  reponses = { "/data/index.json": index("2026-10-03T05:47:00Z"), "/data/departments/64.json": copieSW({ d: "64", communes: {} }) };
  const d = await chargerDepartement("64");
  assert.equal(d.etat, ETATS.SERVI);
  assert.equal(d.perime, true);
  assert.ok(!(disque.get("socle:GEN") && disque.get("socle:GEN").cles["dep:64"]),
    "une copie d'une generation inconnue a ete notee comme la generation courante : une donnee ancienne passerait pour actuelle");
  assert.equal(etatFraicheur().etat, "precedente");
});

test("fraicheur — les trois phrases sont differentes, et « actuelle » n'en a pas", () => {
  const g = "2026-10-01T05:47:00Z";
  const p = phraseFraicheur({ etat: "precedente", generation: g, depuis: g });
  const i = phraseFraicheur({ etat: "inconnue", generation: g, depuis: g });
  assert.equal(phraseFraicheur({ etat: "actuelle", generation: g, depuis: g }), null);
  assert.ok(p && i && p.titre !== i.titre && p.corps !== i.corps);
  assert.equal(phraseFraicheur(null), null, "avant toute donnee, rien a dire");
});

test("fraicheur — hors connexion et serveur injoignable sont deux phrases differentes", () => {
  const g = "2026-10-01T05:47:00Z";
  const hors = phraseFraicheur({ etat: "inconnue", horsLigne: true, generation: g, depuis: g });
  const serveur = phraseFraicheur({ etat: "inconnue", horsLigne: false, generation: g, depuis: g });
  assert.match(hors.titre, /^Vous êtes hors connexion/);
  assert.match(serveur.titre, /^Repère n'a pas pu joindre le serveur/);
});
