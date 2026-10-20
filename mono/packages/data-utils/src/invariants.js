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
    regle: "Rien qui gamifie le vote ou l'opinion : aucun score, aucune récompense, aucune série, aucun gain ni son de réussite lié à un vote, une position ou un partage. Les effets de mouvement sont permis pour lire, naviguer et suivre une heure ou une durée (assouplie par décision du porteur, 13/10/2026).",
    garde: "statique: vocabulaire de bonne/mauvaise réponse interdit" },
  { n: 7, nom: "palette gelée",
    regle: "Cinq couleurs d'échelon gelées ; aucune autre couleur ne dépasse une amplitude de 24 sur les canaux RGB, sauf deux teintes d'interface fixes (décision du porteur, 20/10/2026 : bleu sarcelle et bleu clair), pour les boutons, les onglets et les pastilles, jamais pour un vote, un parti, un score ni un territoire. Seule exception (décision du porteur, 16/10/2026) : le bleu, le blanc et le rouge du logo, réservés au logo et à ses déclinaisons de marque, jamais à l'interface ni à une information.",
    garde: "statique: lecture des jetons CSS, et le tricolore confiné à la marque (outils/marque_repere.py, ui/marque.tsx)" },
  { n: 8, nom: "ni patrimoine ni présence",
    regle: "Jamais le patrimoine d'un élu, jamais de donnée de présence ou d'absence.",
    garde: "statique: champs interdits dans les données produites" },
  /* Ajoute le 08/10/2026 : decide par le porteur le 30/09/2026 et ecrit dans
     CLAUDE.md, l'invariant 9 manquait a cette liste, donc a la page Sources
     (« Huit règles »). Le texte est celui de CLAUDE.md. */
  { n: 9, nom: "fraîcheur",
    regle: "Une donnée gardée sur l'appareil peut être affichée pour préserver l'accès hors ligne, mais jamais présentée comme actuelle si elle ne l'est pas : actuelle, publication précédente ou impossible à vérifier, toujours distinguables à l'écran.",
    garde: "runtime + parcours mobile: serveur injoignable, l'écran dit que la publication n'a pas pu être vérifiée" },
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

/* PALETTE D'INTERFACE — decision du porteur, 20/10/2026 (invariant 7 modifie pour
   l'interface : la maquette de l'application demande un bleu sarcelle et un bleu
   clair). Liste FERMEE de deux teintes : elles ne sont ni une couleur d'echelon,
   ni le tricolore du logo, ni une couleur de vote ou de parti. Toute autre
   couleur du produit reste soumise au plafond AMPLITUDE_MAX. */
export const PALETTE_INTERFACE = Object.freeze({
  primaire: "#0e3b4b",
  primaireClair: "#bde7f4",
});

/* LE TRICOLORE DU LOGO — seule exception a l'invariant 7 (decision du porteur,
   16/10/2026). Declare ICI, une seule fois : outils/marque_repere.py le recopie pour
   dessiner l'icone, et mono/tests/invariants.test.mjs verifie que la recopie est
   exacte, qu'aucun code d'interface ne porte ces couleurs, et que seules les
   declinaisons de marque affichent le logo. Ce ne sont pas les couleurs de la charte
   de l'Etat (DSFR) : Repere n'est pas un service de l'Etat. */
export const TRICOLORE_MARQUE = Object.freeze({
  bleu:  "#002395",
  blanc: "#ffffff",
  rouge: "#ed2939",
});
/* LA COULEUR D'UN GROUPE PARLEMENTAIRE — 16/10/2026 (decision du porteur : « utiliser
   uniquement les couleurs officielles réellement disponibles et vérifiables, sans
   modifier l'invariant 7 pour elles »). Une couleur publiee par l'Assemblee
   (organe.couleurAssociee) n'est retenue que si elle reste un neutre (amplitude <=
   AMPLITUDE_MAX) et n'imite pas une couleur d'echelon. Sinon : null, et l'ecran
   montre le sigle et le nom du groupe, sans couleur. */
export function couleurDeGroupeAdmise(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || "").trim());
  if (!m) return null;
  const h = "#" + m[1].toLowerCase();
  if (Object.values(ECHELONS).includes(h)) return null;
  return amplitude(h) <= AMPLITUDE_MAX ? h : null;
}

/* Les seuls fichiers qui peuvent porter le tricolore ou afficher les images de marque. */
export const FICHIERS_MARQUE = Object.freeze({
  generateur: "../outils/marque_repere.py",
  composant: "apps/mobile/src/ui/marque.tsx",
  images: ["icon.png", "android-icon-foreground.png", "android-icon-background.png", "android-icon-monochrome.png", "splash-icon.png", "favicon.png"],
});

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
