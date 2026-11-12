/* L'ADRESSE PARTAGEABLE : LA COMMUNE APRÈS LE « # » (12/11/2026, décision du porteur).
 *
 * « /finances#melun » : tout ce qui suit le « # » reste dans le navigateur, il n'est jamais envoyé au
 * serveur (ni à l'hébergeur, ni dans ses journaux, ni en « Referer » dans un lien sortant). L'invariant 2
 * (aucune adresse réseau ne porte une commune) est donc respecté. Ces fonctions sont pures : la lecture et
 * l'écriture du « # » vivent dans l'application (src/lib/adresse-web.tsx).
 *
 * Le nom se réduit à des lettres et des tirets sans accent. Quatre noms de la bêta existent dans deux
 * départements (Blandy, Marolles-en-Brie, Mondreville, Saint-Martin-des-Champs) : ceux-là, et seulement
 * ceux-là, prennent le département en suffixe (« blandy-77 », « blandy-91 »). */
import { departementDe } from "./recherche.js";

export function slugNom(nom) {
  return String(nom ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/* `communes` : { insee: nom }. Rend { parInsee: { insee: slug }, parSlug: { slug: insee } }. */
export function tableSlugs(communes) {
  const groupes = new Map();
  for (const [insee, nom] of Object.entries(communes || {})) {
    const s = slugNom(nom);
    if (!s) continue;
    if (!groupes.has(s)) groupes.set(s, []);
    groupes.get(s).push(insee);
  }
  const parInsee = {}, parSlug = {};
  for (const [s, liste] of groupes) {
    for (const insee of liste) {
      const slug = liste.length > 1 ? `${s}-${(departementDe(insee) || "").toLowerCase()}` : s;
      parInsee[insee] = slug; parSlug[slug] = insee;
    }
  }
  return { parInsee, parSlug };
}

/* Le « # » de l'adresse (« #melun », « melun ») vers un code INSEE de la table, ou null. Jamais de devinette :
   un nom inconnu ne choisit rien. */
export function inseeDepuisHash(hash, table) {
  let h = String(hash ?? "").replace(/^#/, "");
  try { h = decodeURIComponent(h); } catch { return null; }
  h = slugNom(h);
  return h && table && Object.prototype.hasOwnProperty.call(table.parSlug, h) ? table.parSlug[h] : null;
}

/* Le titre de l'onglet : « Finances de Melun - Repère ». Sans commune (ou pour un écran qui n'en dépend pas),
   le titre ne la nomme pas. */
const ECRANS = {
  "/chez-vous": nom => (nom ? `Aujourd'hui à ${nom}` : "Aujourd'hui"),
  "/qui-decide": nom => (nom ? `Qui décide à ${nom}` : "Qui décide"),
  "/finances": nom => (nom ? `Finances de ${nom}` : "Finances"),
  "/a-venir": nom => (nom ? `Calendrier, ${nom}` : "Calendrier"),
  "/argent": nom => (nom ? `Où va l'argent à ${nom}` : "Où va l'argent"),
  "/vote": () => "Votre député",
  "/scrutins": () => "Les votes de l'Assemblée",
  "/elus": () => "Élus",
  "/presidentielle-2027": () => "Présidentielle 2027",
  "/dictionnaire": () => "Dictionnaire citoyen",
  "/sources": () => "Sources",
  "/a-propos": () => "À propos",
  "/faq": () => "Questions fréquentes",
  "/confidentialite": () => "Confidentialité",
};
export function titreOnglet(chemin, nomCommune) {
  const c = String(chemin || "/").replace(/\/+$/, "") || "/";
  const f = ECRANS[c];
  return f ? `${f(nomCommune || "")} - Repère` : "Repère";
}
