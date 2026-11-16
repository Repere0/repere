/* LE BOUTON RETOUR, A 48 PX — partage par la coquille et les onglets.
 * La fleche native de la barre mesurait 30 px sur l'export web
 * (tests/parcours-web.mjs) : on la remplace par ce bouton, a la meme cible.
 * Le geste natif reste actif. */
import { Pressable, Text } from "react-native";
import { router, useRootNavigationState } from "expo-router";
import { LIBELLES } from "@repere/core";
import { couleurs, CIBLE } from "../lib/theme";
import { enfonce } from "./mouvement";

/* AUDIT UI, VAGUE 2 (16/11/2026) : le libellé dit l'écran où l'on revient VRAIMENT. Avant, il était
   figé écran par écran (« ‹ Le calendrier » sur le dictionnaire, d'où qu'on vienne) alors que le bouton
   fait router.back() : sur 11 écrans, il pouvait mentir. Il est lu dans l'état de la pile ; un écran
   inconnu donne « Retour », jamais un nom deviné. Ouvert par un lien direct (rien derrière) : « Accueil ». */
const NOMS: Record<string, string> = {
  index: "Accueil", "chez-vous": LIBELLES.aujourdhui, "qui-decide": LIBELLES.qui, finances: LIBELLES.finances,
  "a-venir": LIBELLES.calendrier, elus: "Élus", elu: "Fiche", "annuaire-fiche": "Fiche", groupe: "Groupe",
  vote: "Votre député", scrutins: "Le Parlement", dictionnaire: "Dictionnaire", procedure: "La procédure",
  actus: "Actualités", "presidentielle-2027": "Présidentielle", "pour-vous": "Pour vous", sources: LIBELLES.sources,
  faq: "Questions", "a-propos": "À propos", recherche: "Recherche", "repere-du-jour": "Repère du jour",
  quiz: "Quiz", partager: "Partager", soutenir: "Soutenir", confidentialite: "Confidentialité",
  "confort-lecture": "Confort de lecture",
};
type Etat = { type?: string; index?: number; routes?: { name: string; state?: Etat }[] } | undefined;
/* Le nom de l'écran visible dans une route (un groupe d'onglets donne son onglet actif). */
const visible = (r: { name: string; state?: Etat }): string => {
  const e = r.state;
  return e?.routes?.length ? visible(e.routes[e.index ?? 0]) : r.name === "(onglets)" ? "chez-vous" : r.name;
};
/* La pile qui porte l'écran affiché : la plus profonde des piles (« stack ») sur le chemin actif.
   La racine d'expo-router enveloppe la pile de l'application ; les onglets sont de type « tab ». */
function pileActive(etat: Etat): Etat {
  let pile: Etat, e = etat;
  while (e?.routes?.length) {
    if (e.type === "stack") pile = e;
    e = e.routes[e.index ?? 0]?.state;
  }
  return pile ?? etat;
}
export function libelleRetour(racine: Etat): string | null {
  const etat = pileActive(racine);
  const i = etat?.index ?? 0, routes = etat?.routes ?? [];
  if (i < 1 || !routes[i - 1]) return null;
  return NOMS[visible(routes[i - 1])] ?? "Retour";
}

export function Retour({ texte, etiquette }: { texte?: string; etiquette?: string } = {}) {
  const etat = useRootNavigationState() as Etat;
  const precedent = texte ? null : libelleRetour(etat);
  const mot = texte ?? precedent ?? "Accueil";
  const nom = etiquette ?? (precedent ? `Revenir à l'écran ${mot}` : "Revenir à l'accueil");
  return (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
      accessibilityRole="button"
      accessibilityLabel={nom}
      style={({ pressed }) => ({ minHeight: CIBLE, minWidth: CIBLE, justifyContent: "center", paddingHorizontal: 8, ...enfonce(pressed) })}
    >
      <Text style={{ fontSize: 17, color: couleurs.lien, fontWeight: "500" }}>‹ {mot}</Text>
    </Pressable>
  );
}

/* CHANGER DE COMMUNE, DEPUIS UN ONGLET. Ramene a l'accueil DEJA EMPILE (dismissTo) :
   un simple retour arriere ouvrirait l'onglet precedent (sur « Qui decide », c'etait
   « Aujourd'hui »), pas le choix de commune. Un router.replace("/") empilait un
   second accueil sous le premier : le retour arriere revenait a un ecran identique
   (parcours navigateur, 29/10/2026). */
export function ChangerCommune() {
  return (
    <Pressable
      onPress={() => router.dismissTo("/")}
      accessibilityRole="button"
      accessibilityLabel="Changer de commune : revenir à l'accueil"
      style={({ pressed }) => ({ minHeight: CIBLE, minWidth: CIBLE, justifyContent: "center", paddingHorizontal: 8, ...enfonce(pressed) })}
    >
      <Text style={{ fontSize: 17, color: couleurs.lien, fontWeight: "500" }}>‹ Communes</Text>
    </Pressable>
  );
}
