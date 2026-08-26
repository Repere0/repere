/* Les HUIT INVARIANTS de Repère, sous forme de données.
 *
 * Ils ne sont pas ici pour la documentation : les tests les importent, et
 * chaque invariant porte le nom du contrôle qui le garde. Un invariant sans
 * contrôle est une intention, pas une règle — la liste le dit explicitement.
 */
export const INVARIANTS = [
  { n: 1, nom: "autonomie",
    regle: "L'application fonctionne hors ligne, sans serveur applicatif.",
    garde: "runtime: service worker installé, réseau coupé, parcours complet" },
  { n: 2, nom: "une seule clé, aucun traceur",
    regle: "Une seule clé de stockage local nommée, aucun compte, aucun email, aucun cookie, aucun traceur.",
    garde: "statique + runtime: inventaire des clés écrites sur l'appareil" },
  { n: 3, nom: "aucun classement",
    regle: "Aucun classement, score ou tri numérique de personnes, de partis ou de territoires.",
    garde: "statique: vocabulaire interdit + aucune comparaison inter-territoires" },
  { n: 4, nom: "source et date",
    regle: "Chaque chiffre porte sa source officielle et sa date. Un calcul dérivé est annoncé comme un calcul.",
    garde: "runtime: toute carte chiffrée porte une source" },
  { n: 5, nom: "doctrine du vide",
    regle: "Une absence produit une phrase et un lien, jamais une forme vide, jamais un zéro.",
    garde: "runtime: aucun squelette persistant, aucune barre de largeur nulle" },
  { n: 6, nom: "aucune gamification du vote",
    regle: "Rien qui gamifie le vote ou l'opinion.",
    garde: "statique: vocabulaire de bonne/mauvaise réponse interdit" },
  { n: 7, nom: "palette gelée",
    regle: "Cinq couleurs d'échelon gelées ; aucune autre couleur ne dépasse une amplitude de 24 sur les canaux RGB.",
    garde: "statique: lecture des jetons CSS" },
  { n: 8, nom: "ni patrimoine ni présence",
    regle: "Jamais le patrimoine d'un élu, jamais de donnée de présence ou d'absence.",
    garde: "statique: champs interdits dans les données produites" },
];

/* Les cinq couleurs d'échelon, gelées. Toute autre couleur du produit doit avoir
   une amplitude RGB (max - min des canaux) inférieure ou égale à AMPLITUDE_MAX :
   c'est ce qui garantit qu'aucun gris ne devient une couleur politique. */
export const ECHELONS = Object.freeze({
  ville:  "#0e7490",
  agglo:  "#0891b2",
  dept:   "#b45309",
  region: "#6d28d9",
  france: "#1d1d1f",
});
export const AMPLITUDE_MAX = 24;

export function amplitude(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!m) return null;
  const v = m[1];
  const c = [0, 2, 4].map(i => parseInt(v.slice(i, i + 2), 16));
  return Math.max(...c) - Math.min(...c);
}

/* Une adresse réseau ne doit JAMAIS porter un code de commune : cela révélerait
   au serveur la commune de son lecteur. La maille est le département. */
const CODE_COMMUNE = /[/=](\d{5}|2[AB]\d{3})(\.json|\/|$|&)/;
const PARAM_COMMUNE = /[?&](insee|commune)=/i;
export function adresseFautive(url) {
  const u = String(url);
  return CODE_COMMUNE.test(u) || PARAM_COMMUNE.test(u);
}

/* Les PROMESSES, écrites une seule fois et rendues telles quelles.
 *
 * Pourquoi elles vivent ici et pas dans l'écran qui les affiche : elles citent
 * les mots que les contrôles d'invariants interdisent (« classement »,
 * « présence », « patrimoine »). Un contrôle qui confond la promesse et la
 * violation ne sert à rien — le projet s'est déjà fait piéger trois fois par une
 * garde qui trébuchait sur son propre commentaire. Ce fichier est le seul endroit
 * exempté, parce qu'il EST la liste des règles. */
export const PROMESSES = [
  "Aucune donnée de présence ou d'absence, aucun patrimoine, aucun classement.",
  "Ces règles ne sont pas des intentions : chacune a un contrôle qui échoue si elle est enfreinte.",
];

/* Champs interdits dans toute donnée produite (invariant 8). */
export const CHAMPS_INTERDITS = [
  "patrimoine", "declaration_patrimoine", "hatvp_patrimoine",
  "presence", "absence", "assiduite", "taux_presence", "participation_seance",
];

/* Vocabulaire qui trahirait un classement (invariant 3) ou une gamification du
   vote (invariant 6), cherché dans le TEXTE AFFICHÉ, jamais dans le code. */
export const MOTS_CLASSEMENT = [
  "classement", "palmarès", "palmares", "top 10", "top 5", "meilleur",
  "pire", "mieux que", "moins bien que", "note globale", "moyenne nationale",
];
export const MOTS_GAMIFICATION = [
  "bonne réponse", "mauvaise réponse", "bonne reponse", "score de vote",
  "tu as gagné", "tu as perdu",
];

/* Mots français qui ne doivent jamais s'afficher sans leurs accents. Les
   commentaires du code sont volontairement sans accents ; le texte affiché,
   jamais. Faute commise deux fois le 25 août 2026, d'où ce contrôle. */
export const MOTS_A_ACCENTS = [
  "Repere", "depute", "deputes", "elu", "elus", "decoupage", "legislative",
  "depense", "depenses", "annee", "annees", "impots", "donnees", "verifie",
  "ministere", "Repertoire", "resultat", "resultats", "reel", "meme", "memes",
  "eleve", "elevee", "facon", "regulier", "irregulieres", "exterieur",
];
