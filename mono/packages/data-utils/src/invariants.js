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
    regle: "Cinq couleurs d'échelon gelées. Une palette d'interface fixe, décidée par le porteur le 20/10/2026 d'après ses maquettes (teal `#0D3B43`, émeraude `#00A896`, ambre `#F59E0B`, corail `#BE123C`, ardoise `#0F172A`, et leurs équivalents sombres — déclarée dans `mono/packages/data-utils/src/invariants.js`). Toute autre couleur reste sous une amplitude de 24 sur les canaux RGB. Trois exceptions, chacune décidée par le porteur : le tricolore du logo (16/10/2026), réservé à la marque ; la couleur d'un groupe parlementaire telle que l'Assemblée la publie (`organe.couleurAssociee`, 20/10/2026), jamais choisie par Repère ; la palette d'interface ci-dessus. Aucune couleur ne qualifie jamais une personne, un parti ou un territoire, et chaque position de vote porte son libellé en toutes lettres à côté de sa couleur. Le texte posé sur une couleur atteint 4,5:1.",
    garde: "statique: lecture des jetons CSS ; le tricolore confiné à la marque ; une couleur de groupe vient de la source et porte un texte à 4,5:1" },
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

/* LA PALETTE D'INTERFACE — decision du porteur, 20/10/2026, d'apres ses maquettes.
   Ces couleurs sont les SEULES couleurs saturees que l'interface a le droit
   d'employer hors echelons, hors marque et hors couleur de groupe. Elles portent
   un sens fixe (voir apps/mobile/src/lib/theme.ts) et jamais un jugement sur une
   personne, un parti ou un territoire. Declarees ici pour que la garde de
   l'invariant 7 les reconnaisse au lieu de les refuser une par une. */
export const PALETTE_INTERFACE = Object.freeze([
  "#0d3b43", "#00a896", "#f59e0b", "#be123c", "#0f172a", "#64748b", "#94a3b8",
  "#f7fafd", "#e8eef3", "#eef2f6", "#556576", "#ebf7f5", "#fef3e2", "#fde8ee", "#bfd9dd",
  "#5ec8bc", "#2dd4bf", "#00705f", "#fbbf24", "#fb7185", "#0a1116", "#111c23", "#e8eff4",
  "#94a8b6", "#1e2e38", "#17242c", "#0e2a2b", "#2a2113", "#2e161d", "#a8c9ce",
  "#06222a",
]);
export const estPaletteInterface = h => PALETTE_INTERFACE.includes(String(h || "").trim().toLowerCase());

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
/* LA COULEUR D'UN GROUPE PARLEMENTAIRE — 20/10/2026.
   DECISION DU PORTEUR : « rajoute-moi les couleurs politiques ; je veux que chaque
   utilisateur puisse savoir de quel bord est son depute ». Le 16/10, la regle etait
   l'inverse (« sans modifier l'invariant 7 ») : la saturation faisait refuser toutes
   les couleurs officielles, et aucun groupe n'en avait.

   CE QUI N'A PAS CHANGE, ET QUI EST L'ESSENTIEL : Repere ne CHOISIT pas la couleur
   d'un groupe. Il publie celle que l'Assemblee publie elle-meme
   (organe.couleurAssociee, donnees ouvertes). Repere n'ecrit donc jamais « extreme
   droite » ni « gauche » : qualifier un bord est un acte editorial, montrer la couleur
   que l'institution attache a un groupe ne l'est pas. Une couleur de groupe ne sert
   qu'a identifier CE groupe : jamais une position de vote (invariant : un vote n'a ni
   vert ni rouge), jamais un classement (invariant 3).

   Refusee encore : une couleur mal formee, et une couleur qui imite un echelon — sinon
   un groupe passerait pour un niveau de decision. Sans couleur : le sigle et le nom
   suffisent (doctrine du vide). */
export function couleurDeGroupeAdmise(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || "").trim());
  if (!m) return null;
  const h = "#" + m[1].toLowerCase();
  if (Object.values(ECHELONS).includes(h)) return null;
  return h;
}

/* Le texte a poser SUR une couleur de groupe : celui des deux qui lit le mieux.
   « Blanc par defaut » rendait illisibles les groupes clairs. */
export function texteSurCouleur(hex, encre = "#171614", clair = "#ffffff") {
  const c = couleurDeGroupeAdmise(hex) || encre;
  return contrasteWcag(clair, c) >= contrasteWcag(encre, c) ? clair : encre;
}

/* CERTAINES COULEURS NE PEUVENT PORTER AUCUN TEXTE. Mesure du 20/10/2026 : le rouge
   #ed2939 plafonne a 4,29:1 avec l'encre et 3,99:1 avec le blanc — sous les 4,5:1
   exiges (WCAG 1.4.3). Une couleur de groupe ne devient donc une PASTILLE DE FOND
   que si elle peut porter du texte ; sinon elle reste un point ou un trait a cote du
   nom, qui lui est en encre. C'est deja la regle des couleurs d'echelon. */
export function peutPorterDuTexte(hex, encre = "#171614", clair = "#ffffff") {
  const c = couleurDeGroupeAdmise(hex);
  if (!c) return false;
  return Math.max(contrasteWcag(clair, c), contrasteWcag(encre, c)) >= 4.5;
}

function luminanceRelative(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!m) return 0;
  const v = m[1];
  const [r, g, b] = [0, 2, 4].map(i => {
    const s = parseInt(v.slice(i, i + 2), 16) / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrasteWcag(a, b) {
  const l1 = luminanceRelative(a), l2 = luminanceRelative(b);
  const [h, l] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (h + 0.05) / (l + 0.05);
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
