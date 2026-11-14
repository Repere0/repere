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
/* D67 (V35) : auto = suit le système ; clair et sombre fixent le thème. */
export const MODES = ["auto", "clair", "sombre"];

export const PROFIL_DEFAUT = {
  niveauZoom: "france",
  tailleTexte: 16,
  espacement: 1.5,
  contraste: "normal",
  policeDyslexie: false,
  animationsReduites: false,
  modeDaltonien: false,
  masquerImages: false,
  /* Clair par défaut (« Néo-Civique » des maquettes Stitch, décision du porteur du 09/11/2026 ; remplace
     le sombre par défaut du 07/11/2026). Système, Clair, Sombre restent au choix. */
  mode: "clair",
  themes: [],
  /* 13/11/2026 (porteur, ADR 0009) : le prénom que le lecteur a bien voulu donner, pour un « Bonjour ». Facultatif,
     vide par défaut, gardé sur l'appareil seulement, jamais transmis. */
  prenom: "",
  /* 13/11/2026 (ADR 0010) : les points du quiz civique, sur l'appareil seulement. */
  points: 0,
  /* 14/11/2026 (porteur, ADR 0011) : la bienvenue a-t-elle été terminée sur cet appareil ? Faux par défaut, et faux
     pour tout profil gardé avant ce jour (la clé n'y est pas) : la bienvenue passe alors une fois, réglages gardés. */
  onboardingVu: false,
};

/* Un prénom affichable : lettres, espaces, traits d'union et apostrophes, 24 caractères au plus. Tout le reste
   (chiffres, balises, adresses) rend une chaîne vide : ce champ ne garde pas autre chose qu'un prénom. */
export const PRENOM_MAX = 24;

/* ─── LE QUIZ CIVIQUE : POINTS ET RANGS (13/11/2026, décision du porteur, invariant 6 amendé) ────────
 * +10 points par réponse juste au quiz du dictionnaire. Les points vivent dans repere.profil, sur
 * l'appareil : PAS de troisième clé de stockage (invariant 2), aucun rang comparé entre lecteurs, rien
 * qui parte sur le réseau. Ils ne portent QUE sur du vocabulaire institutionnel : jamais un vote, un
 * élu, un parti ou un territoire — c'est la limite exacte de l'amendement (ADR 0010).
 * Un total illisible ou négatif revient à 0 : on ne répare pas un compteur en silence vers le haut. */
export const POINTS_PAR_REPONSE_JUSTE = 10;
export const POINTS_MAX = 1000000;
export const RANGS = Object.freeze([
  { cle: "neo", nom: "Néo-citoyen", min: 0, max: 50 },
  { cle: "citoyen", nom: "Citoyen", min: 51, max: 200 },
  { cle: "super", nom: "Super Citoyen", min: 201, max: 500 },
  { cle: "sage", nom: "Sage", min: 501, max: null },
]);

export function nettoyerPoints(v) {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(Math.floor(n), POINTS_MAX);
}

/* Le rang d'un total de points. Toujours un rang : 0 point, c'est « Néo-citoyen ». */
export function rangPour(points) {
  const p = nettoyerPoints(points);
  return RANGS.find(r => p >= r.min && (r.max === null || p <= r.max)) || RANGS[0];
}

/* Les points qui restent avant le rang suivant, ou null au dernier rang. */
export function pointsAvantRangSuivant(points) {
  const p = nettoyerPoints(points);
  const i = RANGS.indexOf(rangPour(p));
  return i < RANGS.length - 1 ? RANGS[i + 1].min - p : null;
}
export function nettoyerPrenom(v) {
  if (typeof v !== "string") return "";
  const t = v.replace(/[\u2019\u02BC]/g, "'").replace(/\s+/g, " ").trim();
  return t.length >= 1 && t.length <= PRENOM_MAX && /^\p{L}[\p{L} '-]*$/u.test(t) ? t : "";
}

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
    mode: pris(src.mode, MODES),
    /* D57 (V31) : thèmes d'intérêt, parmi THEMES, sans doublon. */
    themes: Array.isArray(src.themes) ? [...new Set(src.themes)].filter(t => THEMES.includes(t)) : [],
    prenom: nettoyerPrenom(src.prenom),
    points: nettoyerPoints(src.points),
    onboardingVu: src.onboardingVu === true,
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
