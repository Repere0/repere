/* QU'EST-CE QUI EST EN PRODUCTION ? — en une commande.
 *
 *   node mono/scripts/en-prod.mjs [https://repereapp.netlify.app]
 *
 * Lit ce que le site sert REELLEMENT (data/index.json, parametre neuf pour ne
 * pas mesurer le cache du CDN), puis le rapproche de l'historique git local :
 * commit servi, date de construction, sante des sources, et ecart avec
 * origin/main — en distinguant les commits de code des commits de collecte
 * (journal quotidien), qui ne changent rien au site tant qu'ils ne sont pas
 * publies. Sortie 1 si le site ne repond pas ou ne declare pas sa provenance.
 */
import { execFileSync } from "node:child_process";

const URL_BASE = (process.argv[2] || "https://repereapp.netlify.app").replace(/\/$/, "");
const git = (...a) => { try { return execFileSync("git", a, { encoding: "utf8" }).trim(); } catch { return null; } };

const rep = await fetch(`${URL_BASE}/data/index.json?enprod=${Date.now()}`, { cache: "no-store" }).catch(e => ({ ok: false, status: e.message }));
if (!rep.ok) { console.error(`site injoignable ou erreur : ${rep.status}`); process.exit(1); }
const b = (await rep.json()).build;
if (!b || !b.commit_court) { console.error("le site ne declare aucune provenance (build.commit_court absent)"); process.exit(1); }

const ageH = b.construit_le ? Math.round((Date.now() - Date.parse(b.construit_le)) / 36e5) : null;
const sante = b.sante || {};
const manquantes = Object.entries(sante).filter(([, v]) => !v).map(([k]) => k);
console.log(`servi        : ${b.commit_court}  (${URL_BASE})`);
console.log(`construit le : ${b.construit_le || "non declare"}${ageH !== null ? `  — il y a ${ageH} h` : ""}`);
console.log(`sante        : ${manquantes.length ? "MANQUANT " + manquantes.join(", ") : "toutes les sources declarees presentes (" + Object.keys(sante).length + ")"}`);

if (git("rev-parse", "--git-dir")) {
  git("fetch", "-q", "origin", "main");
  const msg = git("log", "-1", "--format=%s (%ci)", b.commit);
  console.log(`commit       : ${msg || "inconnu de ce depot local"}`);
  const sur = git("merge-base", "--is-ancestor", b.commit, "origin/main") !== null;
  if (msg && sur) {
    const apres = (git("log", "--format=%s", `${b.commit}..origin/main`) || "").split("\n").filter(Boolean);
    const code = apres.filter(s => !/^Collecte du /.test(s));
    console.log(`origin/main  : ${apres.length ? `${apres.length} commit(s) apres le servi, dont ${code.length} hors collecte${code.length ? " :\n  - " + code.join("\n  - ") : ""}` : "le commit servi est la pointe de main"}`);
  } else if (msg) {
    console.log("origin/main  : ATTENTION — le commit servi n'est pas dans l'historique de main");
  }
}
