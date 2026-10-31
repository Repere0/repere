// Collecte des flux RSS des mairies (D81, ADR 0007). Aucun appel réseau : un faux fetch.
// Lancement : node --test tests/collecte-rss.test.mjs   (depuis mono/)
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CANDIDATS, collecter, collecterCommune, deuxPhrases, lienDuDomaine } from "../scripts/collecte-rss-mairies.mjs";

const AUJOURDHUI = "2026-10-31";
const SITE = "https://www.mairie-test.fr/";
const reponse = (status, corps) => ({ status, text: async () => corps });
/* Table url -> [statut, corps] ; tout le reste répond 404. `appels` garde la trace des requêtes. */
const fauxFetch = (table, appels = []) => async url => {
  appels.push(url);
  const r = table[url];
  return r ? reponse(r[0], r[1]) : reponse(404, "");
};
const entree = ({ titre, lien, date, desc }) =>
  `<item><title>${titre}</title><link>${lien}</link>${date ? `<pubDate>${date}</pubDate>` : ""}<description>${desc}</description></item>`;
const flux = (...entrees) =>
  `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Mairie test</title><link>${SITE}</link>${entrees.join("")}</channel></rss>`;

test("flux valide : gardes, deux phrases, plus récent d'abord, trois au plus", async () => {
  const corps = flux(
    entree({ titre: "A", lien: "https://www.mairie-test.fr/actu/a", date: "Mon, 20 Oct 2026 09:00:00 +0100",
      desc: "&lt;p&gt;Travaux rue X. Ils commencent lundi. Une déviation est prévue. Merci.&lt;/p&gt;" }),
    entree({ titre: "B", lien: "https://mairie-test.fr/actu/b", date: "Tue, 27 Oct 2026 09:00:00 +0100", desc: "Fermeture de la piscine. Réouverture en janvier." }),
    entree({ titre: "Sans date", lien: "https://www.mairie-test.fr/actu/c", desc: "Pas de date." }),
    entree({ titre: "Autre site", lien: "https://autre-site.fr/x", date: "Mon, 26 Oct 2026 09:00:00 +0100", desc: "Hors domaine." }),
    entree({ titre: "Future", lien: "https://www.mairie-test.fr/actu/f", date: "Tue, 01 Dec 2026 09:00:00 +0100", desc: "Date future." }),
    entree({ titre: "F", lien: "https://www.mairie-test.fr/actu/g", date: "Sat, 10 Oct 2026 09:00:00 +0100", desc: "Ancien." }),
    entree({ titre: "G", lien: "https://www.mairie-test.fr/actu/h", date: "Mon, 05 Oct 2026 09:00:00 +0100", desc: "Plus ancien encore." }),
  );
  const r = await collecterCommune("77288", { nom: "Melun", site: SITE }, {
    fetchImpl: fauxFetch({ "https://www.mairie-test.fr/feed/": [200, corps] }), aujourdhui: AUJOURDHUI,
  });
  assert.equal(r.flux, "https://www.mairie-test.fr/feed/");
  assert.deepEqual(r.items.map(x => x.titre), ["B", "A", "F"], "trois entrées, la plus récente d'abord ; sans date, hors domaine et future écartées");
  const a = r.items.find(x => x.titre === "A");
  assert.equal(a.date, "2026-10-20");
  assert.equal(a.lien, "https://www.mairie-test.fr/actu/a");
  assert.equal(a.resume, "Travaux rue X. Ils commencent lundi.", "deux phrases au plus, balises retirées");
});

test("une réponse HTML à un candidat n'est jamais analysée ; seuls les candidats sont demandés", async () => {
  const appels = [];
  const html = "<!doctype html><html><body><a href='https://www.mairie-test.fr/actu'>Actus</a></body></html>";
  const r = await collecterCommune("78646", { nom: "Versailles", site: SITE }, {
    fetchImpl: fauxFetch({ "https://www.mairie-test.fr/feed/": [200, html], "https://www.mairie-test.fr/rss": [200, html] }, appels),
    aujourdhui: AUJOURDHUI,
  });
  assert.equal(r.flux, null);
  assert.deepEqual(r.items, []);
  assert.ok(r.raisons.some(x => x.includes("HTML, pas un flux")));
  assert.deepEqual(appels, CANDIDATS.map(c => new URL(c, SITE).href), "aucune autre page du site n'est demandée");
});

test("aucun candidat ne répond : sans flux, sans erreur", async () => {
  const r = await collecterCommune("77284", { nom: "Meaux", site: SITE }, { fetchImpl: fauxFetch({}), aujourdhui: AUJOURDHUI });
  assert.equal(r.flux, null);
  assert.equal(r.raisons.length, CANDIDATS.length);
});

test("le premier candidat valide gagne, même si un autre existe", async () => {
  const corps = flux(entree({ titre: "Seul", lien: "https://www.mairie-test.fr/actu/s", date: "Fri, 30 Oct 2026 09:00:00 +0100", desc: "Une chose." }));
  const r = await collecterCommune("77288", { nom: "Melun", site: SITE }, {
    fetchImpl: fauxFetch({ "https://www.mairie-test.fr/flux-rss": [200, corps], "https://www.mairie-test.fr/rss": [200, corps] }),
    aujourdhui: AUJOURDHUI,
  });
  assert.equal(r.flux, "https://www.mairie-test.fr/rss", "ordre des candidats : /rss avant /flux-rss");
  assert.equal(r.items.length, 1);
});

test("deuxPhrases : balises, entités et longueur", () => {
  assert.equal(deuxPhrases("<p>Un.&nbsp;Deux &amp; trois. Quatre.</p>"), "Un. Deux & trois.");
  const long = "x".repeat(400) + ".";
  assert.ok(deuxPhrases(long).length <= 300);
  assert.equal(deuxPhrases(""), "");
});

test("lienDuDomaine : https, même domaine, sous-domaine accepté, autre domaine refusé", () => {
  assert.equal(lienDuDomaine("https://mairie-test.fr/a", SITE), "https://mairie-test.fr/a");
  assert.equal(lienDuDomaine("https://actus.mairie-test.fr/a", SITE), "https://actus.mairie-test.fr/a");
  assert.equal(lienDuDomaine("http://www.mairie-test.fr/a", SITE), null, "http refusé");
  assert.equal(lienDuDomaine("https://mairie-test.fr.evil.com/a", SITE), null, "domaine piégé refusé");
});

test("collecter : seuls les sites en https sont testés ; une commune sans entrée n'apparaît pas", async () => {
  const appels = [];
  const sortie = await collecter({
    "77288": { nom: "Melun", site: SITE },
    "77284": { nom: "Meaux", site: "http://meaux.example/" },
  }, { fetchImpl: fauxFetch({}, appels), aujourdhui: AUJOURDHUI, generation: "2026-10-31T05:00:00Z" });
  assert.ok(appels.every(u => u.startsWith("https://www.mairie-test.fr/")), "aucune requête vers le site http");
  assert.deepEqual(sortie.communes, {});
  assert.deepEqual(sortie.bilan, { communes_testees: 1, avec_flux: 0, avec_actu: 0, sans_flux: 1 });
  assert.match(sortie.source, /ADR 0007/);
});

test("sans le fichier des mairies, le script s'arrête et n'écrit rien", () => {
  const dossier = fs.mkdtempSync(path.join(os.tmpdir(), "rss-"));
  const script = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "scripts", "collecte-rss-mairies.mjs");
  const r = spawnSync(process.execPath, [script, dossier], { encoding: "utf8" });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /absent/);
  assert.equal(fs.existsSync(path.join(dossier, "actuelles-rss.json")), false);
});

// Affichage (data-utils) : ne garder que ce qui peut être montré honnêtement.
import { actusFlux } from "../packages/data-utils/src/actus-rss.js";
test("actusFlux : https, date passée, titre présent, trois au plus", () => {
  const fichier = { communes: { "77288": { items: [
    { titre: "Ok 1", lien: "https://www.mairie-test.fr/1", date: "2026-10-30", resume: "" },
    { titre: "Future", lien: "https://www.mairie-test.fr/2", date: "2026-11-02", resume: "" },
    { titre: "", lien: "https://www.mairie-test.fr/3", date: "2026-10-29", resume: "" },
    { titre: "Http", lien: "http://www.mairie-test.fr/4", date: "2026-10-28", resume: "" },
    { titre: "Ok 2", lien: "https://www.mairie-test.fr/5", date: "2026-10-27", resume: "" },
    { titre: "Ok 3", lien: "https://www.mairie-test.fr/6", date: "2026-10-26", resume: "" },
    { titre: "Ok 4", lien: "https://www.mairie-test.fr/7", date: "2026-10-25", resume: "" },
  ] } } };
  assert.deepEqual(actusFlux(fichier, "77288", "2026-10-31").map(x => x.titre), ["Ok 1", "Ok 2", "Ok 3"]);
  assert.deepEqual(actusFlux(fichier, "00000", "2026-10-31"), []);
  assert.deepEqual(actusFlux(null, "77288", "2026-10-31"), []);
});
