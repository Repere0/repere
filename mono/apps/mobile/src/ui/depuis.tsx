/* « DEPUIS VOTRE DERNIERE VISITE » — prototype minimal du 06/10/2026.
 *
 * Seulement pour la commune que le lecteur a RETENUE sur ce telephone : le
 * cache est tenu par departement, et dire « depuis votre derniere visite »
 * d'une commune jamais ouverte serait faux. Le calcul est dans @repere/core
 * (changementsCommune) : « nouveau » = absent de la version que l'appareil
 * avait gardee. Rien n'est garde de plus pour le faire.
 *
 * Structure d'une carte : ce qui a change (phrase datee), pourquoi c'est
 * important ici (une ligne), la source, un geste pour approfondir. Trois au
 * plus : au-dela, le reste est compte, pas affiche.
 *
 * ANTI FAUX-ENGAGEMENT : rien de nouveau -> une ligne qui le dit, et rien
 * d'autre ; jamais « revenez demain ». Premiere visite, cache efface, hors
 * ligne -> rien n'est affiche du tout. */
import { Text, View } from "react-native";
import { router } from "expo-router";
import { dateFr, euros, phrasePosition, premierePhrase, texteDe, titreLisible } from "@repere/core";
import type { ReactNode } from "react";
import { srcComptesPublies, srcElus, srcProjets, srcScrutins, srcVote } from "../lib/sources";
import type { Ouvert } from "../lib/useCommune";
import { PAS, TYPO } from "../lib/theme";
import { PastilleSource } from "./source";
import { Reponse } from "./reponse";

/* La source du releve des deputes, telle que l'index la declare. */
const srcDeputes = (r: Ouvert) => {
  const s = r.index && r.index.sources ? r.index.sources.deputes : null;
  return s ? { producteur: s.producteur, licence: s.licence, url: s.url, releve: s.releve_le } : null;
};

type Carte = { phrase: string; pourquoi: string; source: ReactNode; suite?: { texte: string; onPress: () => void } };

function carteDe(c: Ouvert, r: Ouvert): Carte | null {
  const { d } = r;
  const nom = d.nomCommune;
  switch (c.type) {
    case "vote": return {
      phrase: `Le ${dateFr(c.fait.sc.d)}, ${texteDe(phrasePosition(c.fait.position, c.fait.qui))}`,
      pourquoi: `${titreLisible(c.fait.sc.t)}. C'est le député de votre circonscription.`,
      source: <PastilleSource court source={srcVote(d, c.fait.sc)} />,
      suite: { texte: "Comprendre ce vote", onPress: () => router.push("/vote") } };
    case "votes": return {
      phrase: `${c.n} nouveau${c.n > 1 ? "x" : ""} vote${c.n > 1 ? "s" : ""} solennel${c.n > 1 ? "s" : ""} à l'Assemblée nationale, le plus récent le ${dateFr(c.quand)}.`,
      pourquoi: `${nom} compte plusieurs circonscriptions : choisissez la vôtre pour voir le vote de votre député.`,
      source: <PastilleSource court source={srcScrutins(d)} />,
      suite: { texte: "Voir les votes", onPress: () => router.push("/vote") } };
    case "maire": return {
      phrase: `Le Répertoire national des élus nomme désormais ${c.apres} maire de ${nom}.`,
      pourquoi: `Il nommait jusqu'ici ${c.avant}. Le maire prépare le budget de la commune.`,
      source: <PastilleSource court nom="Élus" source={srcElus(r.srcElus)} />,
      suite: { texte: "Qui décide ici ?", onPress: () => router.push("/qui-decide") } };
    case "depute": return {
      phrase: `${c.apres} siège désormais à l'Assemblée pour votre circonscription.`,
      pourquoi: `Le relevé des députés nommait jusqu'ici ${c.avant}.`,
      source: <PastilleSource court nom="Députés" source={srcDeputes(r)} />,
      suite: { texte: "Qui décide ici ?", onPress: () => router.push("/qui-decide") } };
    case "comptes": return {
      phrase: `Les comptes ${c.an} de ${nom} sont publiés.`,
      pourquoi: "Ce sont les derniers comptes officiels de la commune : ce qu'elle a dépensé, encaissé et ce qu'elle doit.",
      source: <PastilleSource court nom="Comptes" source={srcComptesPublies(d)} />,
      suite: { texte: "Où va l'argent ?", onPress: () => router.push("/argent") } };
    case "projet": return {
      phrase: `L'État aide un nouveau projet à ${nom} : ${euros(c.p.subvention)} pour « ${c.p.intitule} » (${c.p.annee}).`,
      pourquoi: "Un projet de votre commune financé en partie par l'État.",
      source: <PastilleSource court source={srcProjets(d)} />,
      suite: { texte: "Les projets aidés", onPress: () => router.push("/argent") } };
    /* un fait relu et valide par la redaction, publie depuis la derniere
       visite ; un fait de scrutin ouvre le vote, les autres leur source */
    case "editorial": return {
      phrase: `La rédaction de Repère a publié une explication : « ${c.e.t} » (${dateFr(c.e.d)}).`,
      pourquoi: c.e.axes ? premierePhrase(c.e.axes) : "Relu et validé par la rédaction de Repère.",
      source: <PastilleSource court source={{ producteur: c.e.srcn || "Source officielle", url: c.e.src }} />,
      /* « Comprendre ce vote » montre le vote le plus recent : le lien n'est
         propose que si le fait porte sur ce vote-la */
      suite: d.dernierVote && String(c.e.src || "").replace(/\/+$/, "").endsWith("/scrutins/" + d.dernierVote.sc.n)
        ? { texte: "Comprendre ce vote", onPress: () => router.push("/vote") } : undefined };
    default: return null;
  }
}

export function DepuisVotreVisite({ r }: { r: Ouvert }) {
  if (r.visite === "inconnue") return null;
  const cartes = (r.changements as Ouvert[]).map(c => carteDe(c, r)).filter(Boolean) as Carte[];
  if (!cartes.length) {
    return (
      <Text testID="depuis-visite" style={TYPO.note}>Rien de nouveau depuis votre dernière visite.</Text>
    );
  }
  const montrees = cartes.slice(0, 3);
  const reste = cartes.length - montrees.length;
  return (
    <View testID="depuis-visite" style={{ gap: PAS * 2 }}>
      <Text style={TYPO.question} accessibilityRole="header">
        {cartes.length === 1 ? "1 chose a changé depuis votre dernière visite" : `${cartes.length} choses ont changé depuis votre dernière visite`}
      </Text>
      {montrees.map((c, i) => (
        <Reponse key={i} echelon="ville" phrase={c.phrase} note={c.pourquoi} sources={c.source} suite={c.suite} />
      ))}
      {reste > 0 ? <Text style={TYPO.note}>Et {reste} autre{reste > 1 ? "s" : ""}, dans les écrans ci-dessous.</Text> : null}
    </View>
  );
}
