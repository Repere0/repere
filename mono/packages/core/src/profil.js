/* PROFIL DE LECTURE ET NIVEAU DE ZOOM — 30/10/2026 (V26, ADR 0006).
 *
 * Le profil est la seconde (et derniere) cle locale de l'application : repere.profil.
 * Il ne porte que des reglages de lecture. Ce fichier est PUR : aucune lecture de
 * stockage ici (c'est lib/profil.tsx, dans l'application, qui lit et ecrit). Il dit
 * seulement ce qui est valide, et ce que chaque niveau de zoom garde. */

import { THEMES } from "./themes.js";

export const NIVEAUX_ZOOM = ["rue", "region", "france"];
export const TAILLES_TEXTE = [16, 18, 22, 26];
export const ESPACEMENTS = [1.5, 1.8, 2.1];
export const CONTRASTES = ["normal", "eleve", "tres-eleve"];

export const PROFIL_DEFAUT = {
  niveauZoom: "france",
  tailleTexte: 16,
  espacement: 1.5,
  contraste: "normal",
  policeDyslexie: false,
  animationsReduites: false,
  modeDaltonien: false,
  masquerImages: false,
  themes: [],
};

/* Valeur par champ : une valeur absente ou mal formee revient au defaut de ce champ,
   sans effacer les autres. Rend toujours un profil complet. */
export function valideProfil(v) {
  const src = v && typeof v === "object" && !Array.isArray(v) ? v : {};
  const pris = (x, liste) => (liste.includes(x) ? x : undefined);
  const bool = x => (typeof x === "boolean" ? x : undefined);
  /* D47 (V27) : « tout » n'existe plus. Un profil gardé avant garde le même comportement en « France ». */
  const niveau = src.niveauZoom === "tout" ? "france" : src.niveauZoom;
  const out = {
    niveauZoom: pris(niveau, NIVEAUX_ZOOM),
    tailleTexte: pris(src.tailleTexte, TAILLES_TEXTE),
    espacement: pris(src.espacement, ESPACEMENTS),
    contraste: pris(src.contraste, CONTRASTES),
    policeDyslexie: bool(src.policeDyslexie),
    animationsReduites: bool(src.animationsReduites),
    modeDaltonien: bool(src.modeDaltonien),
    masquerImages: bool(src.masquerImages),
    /* D57 (V31) : thèmes d'intérêt, parmi THEMES, sans doublon. */
    themes: Array.isArray(src.themes) ? [...new Set(src.themes)].filter(t => THEMES.includes(t)) : [],
  };
  for (const k of Object.keys(out)) if (out[k] === undefined) out[k] = PROFIL_DEFAUT[k];
  return out;
}

/* Le filtre de zoom (V26 bloc 2, D47 V27), sur l'echelon d'un element : ville, agglo,
   dept, region, france. « rue » garde le local ; « region » cache le national ;
   « france » ne cache rien (c'est l'affichage complet d'avant). */
const LOCAL = ["ville", "agglo", "dept"];
export function visibleAuNiveau(niveau, echelon) {
  if (niveau === "rue") return LOCAL.includes(echelon);
  if (niveau === "region") return echelon !== "france";
  return true;
}

export const LIBELLE_NIVEAU = {
  rue: "Ma rue",
  region: "Ma région",
  france: "La France",
};
