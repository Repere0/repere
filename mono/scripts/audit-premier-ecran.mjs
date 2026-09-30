/* AUDIT DU PREMIER ECRAN — les six questions d'un nouveau venu (29/09/2026).
 *
 * « Si je decouvre Repere sans connaitre le projet, est-ce que je comprends sa
 * valeur en 20 secondes ? » On ne le suppose pas : on le mesure. Pour chaque
 * commune et chaque porte d'entree possible apres le choix de la commune
 * (l'ecran par defaut « Qui decide », et « Aujourd'hui »), ce script dit
 * lesquelles des six questions trouvent une reponse DANS LA PREMIERE HAUTEUR
 * D'ECRAN d'un telephone (390 x 844), et a quelle hauteur elles apparaissent.
 *
 *   1. Ou suis-je ?                     la ligne qui nomme la commune
 *   2. Qu'est-ce qui se passe chez moi ? un fait date : vote du depute, projet finance
 *   3. Y a-t-il du nouveau ?             une phrase qui situe dans le temps
 *                                        (« cette semaine », « depuis votre visite »)
 *   4. Qui decide ?                      le nom du maire ou du depute
 *   5. Qu'est-ce qui arrive ?            un rendez-vous a venir
 *   6. Ou sont les sources ?             une ligne de source
 *
 * Ce n'est PAS un test du banc : il ne dit pas si un ecran est juste, il dit ce
 * qu'un lecteur voit sans faire defiler. Il sert a trancher une question de
 * produit sur une mesure, pas sur une preference.
 *
 * Usage : node scripts/serveur-statique.mjs apps/web/dist 4174 &
 *         node scripts/audit-premier-ecran.mjs [url] [largeur] [hauteur]
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const base = process.argv[2] || "http://127.0.0.1:4174/";
const W = Number(process.argv[3] || 390), H = Number(process.argv[4] || 844);
const DIST = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../apps/web/dist/data");

/* Echantillon : dans chaque departement de la beta, la premiere commune avec un
   projet finance et la premiere sans — choisies dans la donnee publiee, pas a
   la main. */
const communes = [];
const avecProjet = new Set();
for (const f of fs.existsSync(path.join(DIST, "projets")) ? fs.readdirSync(path.join(DIST, "projets")) : []) {
  Object.keys(JSON.parse(fs.readFileSync(path.join(DIST, "projets", f), "utf8")).communes).forEach(c => avecProjet.add(c));
}
for (const dep of ["75", "77", "78", "91", "92", "93", "94", "95"]) {
  const p = JSON.parse(fs.readFileSync(path.join(DIST, "departments", dep + ".json"), "utf8"));
  const e = Object.entries(p.communes).sort((a, b) => a[1].nom.localeCompare(b[1].nom, "fr"));
  const a = e.find(([c]) => avecProjet.has(c)), s = e.find(([c]) => !avecProjet.has(c));
  if (a) communes.push({ dep, nom: a[1].nom, projet: true });
  if (s) communes.push({ dep, nom: s[1].nom, projet: false });
}

const QUESTIONS = ["ou", "chez moi", "nouveau", "qui", "a venir", "source"];
function mesurer() {
  const H = innerHeight;
  const hauteur = el => el ? Math.round(el.getBoundingClientRect().top) : null;
  const texte = re => {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      if (re.test(n.textContent) && n.parentElement && n.parentElement.offsetParent !== null) return n.parentElement;
    }
    return null;
  };
  const y = {
    "ou": hauteur(document.querySelector(".situe, .quest-lieu")),
    "chez moi": hauteur(texte(/a voté|L'État a engagé|n'a pas pris part/)),
    "nouveau": hauteur(texte(/cette semaine|depuis votre (dernière )?visite|Rien de nouveau/i)),
    "qui": hauteur(texte(/^\s*Maire\s*$|a voté|député élu/)),
    "a venir": hauteur(texte(/Qu'est-ce qui arrive|Ce qui arrive|\b(lundi|mardi|mercredi|jeudi|vendredi) \d/)),
    "source": hauteur(document.querySelector(".source")),
  };
  return Object.fromEntries(Object.entries(y).map(([k, v]) => [k, { y: v, visible: v !== null && v >= 0 && v < H }]));
}

const nav = await chromium.launch();
const lignes = [];
for (const c of communes) {
  for (const entree of ["qui decide (defaut)", "aujourd'hui"]) {
    const ctx = await nav.newContext({ viewport: { width: W, height: H } });
    const p = await ctx.newPage();
    await p.addInitScript(([k, v]) => localStorage.setItem(k, v), ["repere.departement", JSON.stringify({ d: c.dep, v: null })]);
    await p.goto(base, { waitUntil: "networkidle" }); await p.waitForTimeout(400);
    await p.getByLabel(/Votre commune/i).fill(c.nom); await p.waitForTimeout(300);
    await p.getByRole("button", { name: c.nom, exact: true }).first().click(); await p.waitForTimeout(1000);
    if (entree === "aujourd'hui") { await p.getByRole("button", { name: /Voir aujourd.hui/ }).click(); await p.waitForTimeout(1400); }
    await p.evaluate(() => scrollTo(0, 0));
    const m = await p.evaluate(mesurer);
    lignes.push({ ...c, entree, m, n: QUESTIONS.filter(q => m[q].visible).length });
    await ctx.close();
  }
}
await nav.close();

for (const entree of ["qui decide (defaut)", "aujourd'hui"]) {
  const l = lignes.filter(x => x.entree === entree);
  const moy = (l.reduce((s, x) => s + x.n, 0) / l.length).toFixed(1);
  const parQ = QUESTIONS.map(q => `${q} ${l.filter(x => x.m[q].visible).length}/${l.length}`).join(" · ");
  console.log(`\n== ${entree} — ${W}x${H} — ${l.length} communes — questions repondues au premier ecran : ${moy}/6 en moyenne`);
  console.log("   " + parQ);
  for (const x of l) console.log(`   ${x.dep} ${x.nom}${x.projet ? " (projet)" : ""} : ${x.n}/6  ` +
    QUESTIONS.map(q => `${q}=${x.m[q].y === null ? "-" : x.m[q].y}`).join(" "));
}
