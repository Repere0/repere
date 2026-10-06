/* UNE SOURCE EN PANNE NE BLOQUE PAS, NE MENT PAS (06/10/2026).
 *
 * Mesure a l'origine : la collecte du 06/10/2026 s'est arretee parce que le
 * Senat n'avait pas repondu ; rien n'a ete publie. Ces controles jouent les
 * scripts COMME LA CHAINE les joue (sous-processus), contre un serveur local
 * qui imite le Senat et le site publie :
 *   CAS 1  Senat en forme -> nouveau releve, date du jour, aucune marque
 *   CAS 2  Senat en panne -> releve publie precedent repris, marque « reutilise »
 *   CAS 3  plusieurs jours de panne -> la date reelle est gardee, l'ecran la dira
 *   CAS 4  le Senat revient -> le nouveau releve remplace, la marque disparait
 *   CAS 5  la panne du Senat n'arrete rien d'autre (pipeline.sh)
 *   CAS 6  panne + aucun releve precedent -> rien n'est ecrit, rien n'est invente
 *   CAS 7  un releve ancien n'est jamais presente comme releve du jour
 * + reponse 200 qui n'est pas un calendrier, serveur muet : echec, rien d'ecrit.
 *
 * Usage : node --test tests/collecte.test.mjs */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ICI = import.meta.dirname;
const ICS = ["BEGIN:VCALENDAR", "BEGIN:VEVENT", "UID:1", "SUMMARY:Séance publique de test", "DTSTART;TZID=Europe/Paris:20991015T143000", "CATEGORIES:Séance publique", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
const precedent = releve => JSON.stringify({ v: 1, source: { producteur: "Sénat", licence: "non précisée par le Sénat", releve_le: releve },
  evenements: [{ titre: "Séance publique de test", debut: "2099-10-15T14:30:00", categorie: "Séance publique" }] });

/* le serveur : /ics -> le comportement du Senat ; /data/<fichier> -> le site publie */
let senat = "ok", publie = precedent("2026-10-05");
const serveur = http.createServer((req, rep) => {
  if (req.url.startsWith("/ics")) {
    if (senat === "muet") return;                                    /* ne repond jamais */
    if (senat === "500") { rep.writeHead(500); return rep.end("erreur"); }
    if (senat === "html") { rep.writeHead(200, { "content-type": "text/html" }); return rep.end("<html>Vérification anti-robot</html>"); }
    rep.writeHead(200, { "content-type": "text/calendar" }); return rep.end(ICS);
  }
  if (req.url.startsWith("/data/calendrier-senat.json")) {
    if (publie === null) { rep.writeHead(404); return rep.end("introuvable"); }
    rep.writeHead(200, { "content-type": "application/json" }); return rep.end(publie);
  }
  rep.writeHead(404); rep.end();
});
await new Promise(r => serveur.listen(0, "127.0.0.1", r));
const BASE = "http://127.0.0.1:" + serveur.address().port;
test.after(() => serveur.close());

const dossier = () => fs.mkdtempSync(path.join(os.tmpdir(), "repere-collecte-"));
/* spawnSync bloquerait la boucle d'evenements du serveur : on lance en asynchrone */
const lancer = (script, args, env = {}) => new Promise(resolve => {
  import("node:child_process").then(({ spawn }) => {
    const p = spawn(process.execPath, [path.join(ICI, "..", "scripts", script), ...args], { env: { ...process.env, ...env } });
    let out = ""; p.stdout.on("data", d => out += d); p.stderr.on("data", d => out += d);
    p.on("close", code => resolve({ code, out }));
  });
});
const senatScript = (d, env = {}) => lancer("calendrier-senat.mjs", [d], { REPERE_SENAT_ICS: BASE + "/ics", REPERE_SENAT_DELAI_MS: "800", ...env });
const reprise = (d, aujourdhui) => lancer("releve-precedent.mjs", [d, "calendrier-senat.json", BASE + "/data"], { REPERE_AUJOURDHUI: aujourdhui });
const lire = d => JSON.parse(fs.readFileSync(path.join(d, "calendrier-senat.json"), "utf8"));
const existe = d => fs.existsSync(path.join(d, "calendrier-senat.json"));
const aujourdhui = new Date().toISOString().slice(0, 10);

test("CAS 1 — Sénat en forme : nouveau relevé daté du jour, sans marque de réutilisation", async () => {
  senat = "ok"; const d = dossier();
  const r = await senatScript(d);
  assert.equal(r.code, 0, r.out);
  const j = lire(d);
  assert.equal(j.source.releve_le, aujourdhui);
  assert.equal(j.source.reutilise, undefined);
  assert.equal(j.evenements.length, 1);
});

test("panne — 500, réponse qui n'est pas un calendrier, serveur muet : échec, RIEN n'est écrit", async () => {
  for (const mode of ["500", "html", "muet"]) {
    senat = mode; const d = dossier();
    const r = await senatScript(d);
    assert.notEqual(r.code, 0, mode + " : le script ne doit pas reussir");
    assert.equal(existe(d), false, mode + " : un fichier a ete ecrit malgre la panne");
  }
});

test("CAS 2 + 7 — Sénat en panne : le relevé publié est repris, marqué, avec SA date (jamais celle du jour)", async () => {
  senat = "500"; publie = precedent("2026-10-05"); const d = dossier();
  assert.notEqual((await senatScript(d)).code, 0);
  const r = await reprise(d, "2026-10-06");
  assert.equal(r.code, 0, r.out);
  const j = lire(d);
  assert.equal(j.source.releve_le, "2026-10-05", "la date reelle du releve doit etre gardee");
  assert.equal(j.source.reutilise, true);
  assert.equal(j.source.reutilise_le, "2026-10-06");
  assert.notEqual(j.source.releve_le, j.source.reutilise_le, "un releve repris n'est jamais date du jour");
  assert.equal(j.evenements.length, 1, "aucun evenement ajoute ni retire");
});

test("CAS 3 — panne de plusieurs jours : la date reste celle du dernier relevé, l'écran la dit", async () => {
  publie = precedent("2026-09-26"); const d = dossier();
  assert.equal((await reprise(d, "2026-10-06")).code, 0);
  const j = lire(d);
  assert.equal(j.source.releve_le, "2026-09-26");
  /* l'affichage de cette date a l'ecran (« Calendrier relevé le … » au-dela
     de deux jours) est eprouve par le parcours mobile (lot 9, releveAncien) */
  /* un releve deja repris hier et republie : la date reelle ne bouge toujours pas */
  publie = JSON.stringify(j);
  const d2 = dossier();
  assert.equal((await reprise(d2, "2026-10-07")).code, 0);
  assert.equal(lire(d2).source.releve_le, "2026-09-26");
});

test("CAS 4 — le Sénat revient : le nouveau relevé remplace l'ancien, la marque disparaît", async () => {
  senat = "500"; publie = precedent("2026-10-05"); const d = dossier();
  await senatScript(d); await reprise(d, "2026-10-06");
  assert.equal(lire(d).source.reutilise, true);
  senat = "ok";
  assert.equal((await senatScript(d)).code, 0);
  const j = lire(d);
  assert.equal(j.source.releve_le, aujourdhui);
  assert.equal(j.source.reutilise, undefined);
});

test("CAS 6 — panne et aucun relevé précédent lisible : rien n'est écrit, rien n'est inventé", async () => {
  for (const p of [null, "pas du json", JSON.stringify({ v: 1, evenements: "x" }), JSON.stringify({ v: 1, source: {}, evenements: [] })]) {
    publie = p; const d = dossier();
    const r = await reprise(d, "2026-10-06");
    assert.equal(r.code, 2, "code attendu 2 : " + r.out);
    assert.equal(existe(d), false, "un fichier a ete ecrit sans releve precedent valide");
  }
});

test("CAS 5 — dans la chaîne, la panne du Sénat n'arrête rien d'autre", () => {
  /* fins de ligne ramenees a \n : le fichier peut etre en CRLF sur un poste Windows */
  const p = fs.readFileSync(path.join(ICI, "../../outils/pipeline.sh"), "utf8").replace(/\r\n/g, "\n");
  /* chaque source externe est appelee sous un « if ! … then » suivi d'une
     reprise ; la reprise elle-meme ne peut pas arreter la chaine */
  for (const [script, fichiers] of [["calendrier-senat", ["calendrier-senat.json"]], ["agenda-an", ["agenda-an.json"]],
    ["scrutins-solennels", ["scrutins-solennels.json", "scrutins-solennels-recents.json"]]]) {
    const bloc = p.match(new RegExp("if ! node scripts/" + script + "\\.mjs \\./data; then\\n([\\s\\S]*?)\\n\\s*fi"));
    assert.ok(bloc, script + " : n'est pas appele sous un « if ! … then »");
    for (const f of fichiers) assert.ok(bloc[1].includes("reprendre " + f), script + " : pas de reprise pour " + f);
  }
  const fonction = p.match(/reprendre\(\) \{\n([\s\S]*?)\n\s*\}/);
  assert.ok(fonction && /if ! node scripts\/releve-precedent\.mjs/.test(fonction[1]) && /indisponibles\.json/.test(fonction[1]),
    "reprendre() doit tenter le releve precedent, puis declarer l'indisponibilite");
});

test("scrutins solennels — archive absente : échec (pour déclencher la reprise), rien n'est écrit", async () => {
  const d = dossier();
  /* chemin explicitement inexistant : sur le runner, ../data/brut_Scrutins
     existe, et le test reussirait a tort */
  const r = await lancer("scrutins-solennels.mjs", [d, path.join(d, "archive-absente")], { });
  assert.notEqual(r.code, 0, "une archive absente ne doit pas etre un succes : " + r.out);
  assert.equal(fs.existsSync(path.join(d, "scrutins-solennels.json")), false);
});
