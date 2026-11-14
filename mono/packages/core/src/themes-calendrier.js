/* LES THÈMES DU CALENDRIER (14/11/2026, porteur : « Suite PLFSS Financement de la sécurité sociale… » ne dit rien à un citoyen).
 *
 * D'OÙ VIENT LE THÈME. Mesuré dans les collecteurs (scripts/agenda-an.mjs, scripts/calendrier-senat.mjs) : ni l'Assemblée
 * ni le Sénat ne publient de THÈME officiel pour un rendez-vous. Le champ `categorie` n'est qu'un type de réunion
 * (« Séance publique » pour toute l'Assemblée ; la catégorie de l'agenda pour le Sénat), jamais un sujet. Il n'y a donc rien
 * d'officiel à reprendre : Repère range chaque rendez-vous PAR MOTS-CLÉS dans son titre et sa description.
 *
 * C'EST UN CALCUL REPÈRE, approximatif, et l'écran le dit (invariant 4) :
 *   - un rendez-vous peut n'avoir AUCUN thème (il n'apparaît alors que sous « Tout ») ou en avoir plusieurs ;
 *   - les mots sont comparés sans accents, au DÉBUT d'un mot (« école » trouve « écoles ») ;
 *   - « sécurité sociale » range en Santé et JAMAIS en Sécurité : on retire cette expression avant de chercher « sécurité » ;
 *   - rien n'est deviné au-delà des mots : pas de thème « par défaut », pas de modèle de langue.
 * Pour corriger un rangement, on ajoute ou on retire un mot ci-dessous ; la garde est dans tests/core.test.mjs. */
export const THEMES_CALENDRIER = ["Santé", "Éducation", "Budget", "Social", "Écologie", "Sécurité", "Institutions"];

const MOTS = {
  "Santé": ["sante", "hopital", "medical", "medicament", "soin", "maladie", "sanitaire", "securite sociale", "assurance maladie", "plfss", "vaccin", "bioethique", "fin de vie"],
  "Éducation": ["ecole", "education", "enseignement", "scolaire", "eleve", "universit", "etudiant", "apprentissage"],
  "Budget": ["loi de finances", "finances publiques", "budget", "plf\\b", "impot", "fiscal", "taxe", "dotation", "loi de reglement", "approbation des comptes"],
  "Social": ["logement", "emploi", "travail", "retraite", "pension", "chomage", "famille", "handicap", "pauvrete", "solidarite", "allocation", "salaire", "pouvoir d'achat", "insertion"],
  "Écologie": ["environnement", "climat", "ecologi", "energie", "dechet", "pollution", "biodiversite", "nucleaire", "transition energetique"],
  "Sécurité": ["securite", "police", "delinquance", "terroris", "gendarmerie", "ordre public", "narcotrafic", "criminalite", "penitentiaire"],
  "Institutions": ["constitution", "referendum", "election", "motion de censure", "commission d'enquete", "collectivites territoriales", "decentralisation", "loi organique"],
};

const sansAccents = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\u2019/g, "'");

/* Les thèmes d'un rendez-vous (ou d'un texte), dans l'ordre de THEMES_CALENDRIER. Vide si aucun mot ne correspond. */
export function themesDuRendezVous(ev) {
  const brut = typeof ev === "string" ? ev : [ev && ev.titre, ev && ev.description].filter(Boolean).join(" ");
  const t = sansAccents(brut);
  const sansSecu = t.replace(/securite sociale/g, " ");
  return THEMES_CALENDRIER.filter(th => MOTS[th].some(m => new RegExp("(^|[^a-z])" + m).test(th === "Sécurité" ? sansSecu : t)));
}
