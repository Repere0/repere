/* « LE REPÈRE DU JOUR » — PAGE COMPLÈTE (V52, V54, 03/11/2026).
 *
 * Ouverte par le bandeau de « Chez vous ». Trois faits pour aujourd'hui, chacun avec sa
 * source et son partage. Les faits viennent de @repere/core (via lib/repere-jour) : même
 * commune, même jour, même résultat que le bandeau. Rien n'est calculé ici.
 * Le pied dit les sources réellement affichées et la date de publication (D147). */
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ModaleExhaustif } from "../ui/modale-exhaustif";
import { router, Stack } from "expo-router";
import { dateFr, datePublication } from "@repere/core";
import { Carte } from "../lib/composants";
import { useSelection } from "../lib/selection";
import { CIBLE, couleurs, PAS, TYPO } from "../lib/theme";
import { faitsAffichables, repereDuJourPour } from "../lib/repere-jour";
import { AvecDonnees, Page, Question } from "../ui/page";
import { PastilleSource } from "../ui/source";
import { BoutonPartageTexte, ligneSource } from "../ui/partage/partager-texte";
import { Plus } from "../ui/reponse";
import { PartagerCarte } from "../ui/partage/bouton-partage";
import { RepereDuJourStory } from "../ui/partage-repere-du-jour";
import { useNiveauZoom } from "../ui/badge-zoom";
import { enfonce } from "../ui/mouvement";

export default function RepereDuJourEcran() {
  const { choix } = useSelection();
  const [explication, setExplication] = useState(false);
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
          <Question etiquette="Repère du jour" question={`Aujourd'hui à ${nom}`} />
          {/* 07/11/2026 : l'explication passe dans un accordéon (règle des 2 lignes). */}
          {/* 09/11/2026 (porteur) : une modale explicative, au lieu d'un accordéon. */}
          <Pressable onPress={() => setExplication(true)} accessibilityRole="button" accessibilityLabel="Comment ces faits sont choisis"
            style={({ pressed }) => ({ minHeight: CIBLE, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: PAS * 1.5, ...enfonce(pressed) })}>
            <Ionicons name="information-circle-outline" size={18} color={couleurs.sourd} accessible={false} importantForAccessibility="no" />
            <Text style={[TYPO.note, { color: couleurs.encre }]}>Comment ces faits sont choisis</Text>
          </Pressable>
          <ModaleExhaustif titre="Comment ces faits sont choisis" visible={explication} onFermer={() => setExplication(false)} sections={[
            { titre: "D'où viennent les faits", contenu: "Ce sont trois faits tirés des données publiques que Repère publie pour votre commune : budget, projets aidés par l'État, votes de votre député, histoire de la commune. Chacun porte sa source." },
            { titre: "Comment ils changent", contenu: "Ils changent chaque jour. Le même jour, la même commune donnent les mêmes faits : l'ordre vient d'un tirage du jour, jamais d'une mesure." },
            { titre: "Ce que Repère ne fait pas", contenu: "Repère n'écrit aucun fait à la main et n'invente rien quand une donnée manque : dans ce cas, aucun fait n'est affiché." },
          ]} />
          {affichables.length === 0 ? (
            <Text style={TYPO.corps}>
              Les données publiées ne permettent pas, aujourd'hui, de tirer un fait pour cette commune. Rien n'est inventé à la place.
            </Text>
          ) : (
            <View style={{ gap: PAS * 2 }}>
              {/* 07/11/2026 : le premier fait en grand (hero), les suivants en cartes compactes.
                  L'ordre est celui du tirage du jour (@repere/core), jamais une mesure. */}
              {affichables.map(({ f, src }, i) => (
                <Carte key={f.id} echelon="ville">
                  <View style={{ gap: PAS * (i === 0 ? 3 : 1) }}>
                    <Text style={i === 0 ? [TYPO.affiche, { fontSize: 28, lineHeight: 34 }] : TYPO.corps}>{f.texte}</Text>
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
