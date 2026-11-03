/* THÈMES D'INTÉRÊT (V31, bloc 1 ; D57, ADR 0006 amendé).
 *
 * Le lecteur choisit des thèmes ; le fil « Pour vous » les filtre. Les publications n'ont pas de thème
 * dans les données : le rangement se fait ici, PAR MOTS-CLÉS DANS LE TITRE. C'est un rangement
 * approximatif : une publication peut être mal rangée, ou ne l'être pas. L'écran le dit.
 * Les mots sont comparés sans accents, en début de mot (« école » trouve « écoles »). */
export const THEMES = ["Santé", "École", "Transport", "Environnement", "Budget", "Sécurité", "Économie"];

const MOTS = {
  "Santé": ["sante", "hopital", "medical", "medicament", "soin", "maladie", "sanitaire"],
  "École": ["ecole", "education", "enseignement", "scolaire", "eleve", "universite", "etudiant"],
  "Transport": ["transport", "ferroviaire", "train", "mobilite", "routier", "automobile", "sncf"],
  "Environnement": ["environnement", "climat", "energie", "ecologi", "dechet", "pollution", "biodiversite"],
  "Budget": ["budget", "finances", "impot", "fiscal", "depense", "taxe", "dotation"],
  "Sécurité": ["securite", "police", "delinquance", "terrorisme", "ordre public", "gendarmerie"],
  "Économie": ["economie", "emploi", "entreprise", "salaire", "commerce", "chomage", "travail"],
};

const sansAccents = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/* Les thèmes dont un mot apparaît au début d'un mot du texte, dans l'ordre de THEMES. */
export function themesDuTexte(texte) {
  const t = sansAccents(texte);
  return THEMES.filter(th => MOTS[th].some(m => new RegExp("(^|[^a-z])" + m).test(t)));
}
