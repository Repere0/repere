// Complete dist/data avec les fichiers publics que la chaine du matin publie sur Netlify mais que
// l'extraction du HTML ne produit pas (votes, questions au Gouvernement, agendas, groupes, photos...).
// Sans cela, la version Vercel affiche des erreurs sur ces ecrans. Copie, au moment du build, de fichiers
// publics deja publies par Repere ; au runtime, l'application ne lit toujours que sa propre origine
// (invariant 1 et 2). Un fichier absent n'arrete jamais le build : l'ecran applique la doctrine du vide.
import { existsSync, mkdirSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";

export const BASE_PUBLIQUE = "https://repereapp.netlify.app/data";
export const FICHIERS = [
  "scrutins-index.json", "scrutins-solennels.json", "scrutins-solennels-recents.json",
  "questions-gouvernement-index.json", "agenda-an.json", "calendrier-senat.json", "actuelles-rss.json",
  "actus-hebdo.json", "codes-postaux.json", "resumes-clairs.json", "deputes-groupes.json", "mairies-idf.json", "agregats-regionaux.json",
  /* 12/11/2026 : les photos des candidats (ADR 0008) sont produites par la chaine, pas versionnees : sans cette
     ligne, la version web de l'application ne les recevait jamais. */
  "presidentielle-2027/photos.json",
  /* 13/11/2026 : MEME OUBLI, DEUX FOIS DE SUITE. Le plan de l'hemicycle et les senateurs sont produits par la
     chaine du matin ; sans ces deux lignes, l'application servie depuis sa propre origine ne les recevait pas,
     et l'onglet Senat affichait « Repere ne publie pas encore la liste des senateurs » alors que la collecte
     avait reussi sur le runner (348 senateurs). Une garde du banc (tests/chaine.test.mjs) refuse desormais
     qu'une adresse de fichier entier existe sans etre ici ou produite par l'extraction. */
  "hemicycle-plan.json", "senateurs.json",
];
const LOTS = ["scrutins-details", "questions-gouvernement"];
const MAX_LOTS = 400;

async function lire(base, chemin, fetchFn) {
  try {
    const r = await fetchFn(`${base}/${chemin}`);
    if (!r.ok) return { statut: r.status };
    const t = await r.text(); JSON.parse(t); // refuse une page d'erreur HTML servie en 200
    return { statut: 200, t };
  } catch (e) { return { statut: 0, erreur: String(e.message || e) }; }
}

export async function miroir(dossier, { base = BASE_PUBLIQUE, fetchFn = fetch } = {}) {
  const bilan = { copies: [], manquants: [] };
  const poser = (chemin, t) => {
    const f = join(dossier, chemin); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, t); bilan.copies.push(chemin);
  };
  const prendre = async chemin => {
    if (existsSync(join(dossier, chemin))) return "present";
    const r = await lire(base, chemin, fetchFn);
    if (r.t !== undefined) { poser(chemin, r.t); return "copie"; }
    bilan.manquants.push(`${chemin} (${r.statut || r.erreur})`); return r.statut;
  };
  for (const f of FICHIERS) await prendre(f);
  const depts = existsSync(join(dossier, "departments")) ? readdirSync(join(dossier, "departments")).filter(f => f.endsWith(".json")) : [];
  for (const d of depts) await prendre(`photos-elus/${d}`);
  for (const rep of LOTS) {
    for (let n = 0; n < MAX_LOTS; n++) {
      const s = await prendre(`${rep}/${String(n).padStart(4, "0")}.json`);
      if (s === 404 || s === 0) { bilan.manquants.pop(); if (s === 0) bilan.manquants.push(`${rep} (reseau)`); break; }
    }
  }
  return bilan;
}
