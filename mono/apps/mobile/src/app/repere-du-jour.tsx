/* « LE REPÈRE DU JOUR » — PAGE COMPLÈTE (V52, V54, 03/11/2026).
 *
 * Ouverte par le bandeau de « Chez vous ». Trois faits pour aujourd'hui, chacun avec sa
 * source et son partage. Les faits viennent de @repere/core (via lib/repere-jour) : même
 * commune, même jour, même résultat que le bandeau. Rien n'est calculé ici.
 * Le pied dit les sources réellement affichées et la date de publication (D147). */
import { Text, View } from "react-native";
import { router, Stack } from "expo-router";
import { dateFr, datePublication } from "@repere/core";
import { Carte } from "../lib/composants";
import { useSelection } from "../lib/selection";
import { PAS, TYPO } from "../lib/theme";
import { faitsAffichables, repereDuJourPour } from "../lib/repere-jour";
import { AvecDonnees, Page, Question } from "../ui/page";
import { PastilleSource } from "../ui/source";
import { BoutonPartageTexte, ligneSource } from "../ui/partage/partager-texte";
import { Plus } from "../ui/reponse";
import { PartagerCarte } from "../ui/partage/bouton-partage";
import { RepereDuJourStory } from "../ui/partage-repere-du-jour";
import { useNiveauZoom } from "../ui/badge-zoom";

export default function RepereDuJourEcran() {
  const { choix } = useSelection();
  const niveauZoom = useNiveauZoom();
  return (
    <AvecDonnees rendu={r => {
      const nom = r.d.nomCommune;
      const { faits, sources } = repereDuJourPour(r, nom, choix ? choix.insee : "", niveauZoom);
      const affichables = faitsAffichables(faits, sources);
      const producteurs = [...new Set(affichables.map(x => x.src.producteur).filter(Boolean))];
      const publie = datePublication(r.index);
      const dateDuJour = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
      return (
        <Page>
          <Stack.Screen options={{ title: "Repère du jour" }} />
          <Question etiquette="Repère du jour" question={`Aujourd'hui à ${nom}`}
            sous="Trois faits tirés des données publiées. Ils changent chaque jour : le même jour, la même commune donnent les mêmes faits." />
          {affichables.length === 0 ? (
            <Text style={TYPO.corps}>
              Les données publiées ne permettent pas, aujourd'hui, de tirer un fait pour cette commune. Rien n'est inventé à la place.
            </Text>
          ) : (
            <View style={{ gap: PAS * 2 }}>
              {affichables.map(({ f, src }) => (
                <Carte key={f.id}>
                  <View style={{ gap: PAS }}>
                    <Text style={TYPO.corps}>{f.texte}</Text>
                    <PastilleSource court source={src} />
                    <BoutonPartageTexte titre={f.texte} chemin="repere-du-jour" source={ligneSource(src)} />
                  </View>
                </Carte>
              ))}
            </View>
          )}
          {affichables.length > 0 ? (
            <PartagerCarte etiquette="Partager ma story, Le Repère du jour" libelle="Partager ma story"
              repli={`Le Repère du jour à ${nom}, ${dateDuJour} :\n${affichables.map(({ f, src }) => `• ${f.texte} (${src.producteur})`).join("\n")}`}
              rendu={ref => <RepereDuJourStory refCarte={ref} ville={nom} date={dateDuJour} faits={affichables.map(x => x.f)} sources={sources} />} />
          ) : null}
          <Plus dernier texte="Retour à Chez vous" onPress={() => router.back()} />
          {producteurs.length > 0 ? (
            <Text style={TYPO.note} accessibilityLabel={`Sources : ${producteurs.join(", ")}${publie ? `. Publication du ${dateFr(publie)}` : ""}`}>
              {`Sources : ${producteurs.join(" · ")}${publie ? ` · Publication du ${dateFr(publie)}` : ""}`}
            </Text>
          ) : null}
        </Page>
      );
    }} />
  );
}
