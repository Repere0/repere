/* « LE REPÈRE DU JOUR » — PAGE COMPLÈTE (V52, V54, 03/11/2026).
 *
 * Ouverte par le bandeau de « Chez vous ». Trois faits pour aujourd'hui, chacun avec sa
 * source et son partage. Les faits viennent de @repere/core (via lib/repere-jour) : même
 * commune, même jour, même résultat que le bandeau. Rien n'est calculé ici.
 * Le pied dit les sources réellement affichées et la date de publication (D147). */
import { useState, type ReactNode } from "react";
import { Linking, Platform, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ModaleExhaustif } from "../ui/modale-exhaustif";
import { router, Stack } from "expo-router";
import { dateFr, datePublication, liensDePartage, motDuJour, suiteDuFait } from "@repere/core";
import { Bouton } from "../lib/composants";
import { useSelection } from "../lib/selection";
import { CIBLE, couleurs, PAS, POLICE, RAYON, TYPO } from "../lib/theme";
import { faitsAffichables, repereDuJourPour } from "../lib/repere-jour";
import { ELECTIONS, joursAvant } from "../lib/elections";
import { lienDeLaPage } from "../lib/adresse-web";
import { AvecDonnees, Page, Question } from "../ui/page";
import { PastilleSource } from "../ui/source";
import { PartagerCarte } from "../ui/partage/bouton-partage";
import { RepereDuJourStory } from "../ui/partage-repere-du-jour";
import { enfonce } from "../ui/mouvement";

/* REFONTE DU 13/11/2026 (porteur : « le contenu ne sert à rien, le partage n'a aucun intérêt ») — « LA MINUTE CITOYENNE ».
 *
 * Trois choses, lisibles en une minute, qui changent chaque jour :
 *   1. LE FAIT DU JOUR sur la commune, en grand, avec ce à quoi il se rattache et un bouton vers l'écran qui l'explique
 *      (avant : trois phrases sans suite) ;
 *   2. LE MOT DU JOUR, tiré du dictionnaire citoyen ;
 *   3. LE PROCHAIN RENDEZ-VOUS : la prochaine élection datée, en jours.
 * Le partage est UN bloc : l'image pour une story (feuille de partage du téléphone, où se trouvent Instagram et
 * Snapchat), X et WhatsApp par une simple adresse, et le lien de la page. Aucun module de réseau social n'est chargé.
 * Invariant 6 : ni score, ni série, ni récompense. On lit, on comprend, on partage si on veut. */
function Bloc({ etiquette, children }: { etiquette: string; children: ReactNode }) {
  return (
    <View style={{ gap: PAS * 3, padding: PAS * 5, borderRadius: RAYON.carte, backgroundColor: couleurs.carte }}>
      <Text style={TYPO.etiquette} accessibilityRole="header">{etiquette}</Text>
      {children}
    </View>
  );
}

export default function RepereDuJourEcran() {
  const { choix } = useSelection();
  const [explication, setExplication] = useState(false);
  return (
    <AvecDonnees rendu={r => {
      const nom = r.d.nomCommune;
      const { faits, sources } = repereDuJourPour(r, nom, choix ? choix.insee : "", "france");
      const affichables = faitsAffichables(faits, sources);
      const producteurs = [...new Set(affichables.map(x => x.src.producteur).filter(Boolean))];
      const publie = datePublication(r.index);
      const maintenant = new Date();
      const dateDuJour = maintenant.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
      const jourLong = maintenant.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
      const premier = affichables[0] || null;
      const suite = premier ? suiteDuFait(premier.f) as { contexte: string; action: string; chemin: "/argent" | "/vote" | "/qui-decide" } | null : null;
      const mot = motDuJour(maintenant) as { cle: string; titre: string; corps: string } | null;
      const prochaine = ELECTIONS.find(e => e.date && joursAvant(e.date) >= 0) || null;
      const jours = prochaine && prochaine.date ? joursAvant(prochaine.date) : null;
      const textePartage = premier ? `${premier.f.texte} (${premier.src.producteur})` : "";
      const lien = Platform.OS === "web" ? lienDeLaPage(choix ? choix.insee : null) : "";
      return (
        <Page>
          <Stack.Screen options={{ title: "Repère du jour" }} />
          <Question etiquette={`Repère du jour · ${jourLong}`} question={`Aujourd'hui à ${nom}`} />

          {!premier ? (
            <Text style={TYPO.corps}>
              Les données publiées ne permettent pas, aujourd'hui, de tirer un fait pour cette commune. Rien n'est inventé à la place.
            </Text>
          ) : (
            <Bloc etiquette="Le fait du jour">
              <Text style={[TYPO.affiche, { fontSize: 26, lineHeight: 32 }]}>{premier.f.texte}</Text>
              {suite ? <Text style={TYPO.corps}>{suite.contexte}</Text> : null}
              <PastilleSource court source={premier.src} />
              {suite ? <Bouton texte={suite.action} onPress={() => router.push(suite.chemin)} /> : null}
            </Bloc>
          )}

          {affichables.length > 1 ? (
            <Bloc etiquette="Aussi aujourd'hui">
              {affichables.slice(1).map(({ f, src }) => (
                <View key={f.id} style={{ gap: PAS }}>
                  <Text style={TYPO.corps}>{f.texte}</Text>
                  <PastilleSource court source={src} />
                </View>
              ))}
            </Bloc>
          ) : null}

          {mot ? (
            <Bloc etiquette="Le mot du jour">
              <Text style={TYPO.reponse}>{mot.titre}</Text>
              <Text style={TYPO.corps}>{mot.corps}</Text>
              <Bouton discret texte="Ouvrir le dictionnaire" onPress={() => router.push("/dictionnaire")} />
            </Bloc>
          ) : null}

          {prochaine && jours !== null ? (
            <Bloc etiquette="Le prochain rendez-vous">
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: PAS * 2 }} accessible
                accessibilityLabel={jours === 0 ? `Aujourd'hui : ${prochaine.titre}` : `Dans ${jours} jour${jours > 1 ? "s" : ""} : ${prochaine.titre}, le ${dateFr(prochaine.date as string)}`}>
                <Text style={[TYPO.chiffre, { fontSize: 44, lineHeight: 48 }]}>{jours === 0 ? "Aujourd'hui" : jours}</Text>
                {jours === 0 ? null : <Text style={TYPO.note}>jour{jours > 1 ? "s" : ""}</Text>}
              </View>
              <Text style={TYPO.corps}>{prochaine.titre}, le {dateFr(prochaine.date as string)}.</Text>
              <Bouton discret texte="Tout sur la présidentielle" onPress={() => router.push("/presidentielle-2027")} />
            </Bloc>
          ) : null}

          {premier ? (
            <Bloc etiquette="Partager le fait du jour">
              <PartagerCarte etiquette="Partager en image, pour une story" libelle="En image, pour une story"
                repli={`Le Repère du jour à ${nom}, ${dateDuJour} :\n${affichables.map(({ f, src }) => `• ${f.texte} (${src.producteur})`).join("\n")}`}
                rendu={ref => <RepereDuJourStory refCarte={ref} ville={nom} date={dateDuJour} faits={affichables.map(x => x.f)} sources={sources} />} />
              <View style={{ flexDirection: "row", gap: PAS * 3 }}>
                {(liensDePartage(textePartage, lien) as { reseau: string; url: string }[]).map(x => (
                  <Pressable key={x.reseau} onPress={() => Linking.openURL(x.url)} accessibilityRole="link" accessibilityLabel={`Partager sur ${x.reseau}, ouvre ${x.reseau}`}
                    style={({ pressed }) => ({ flex: 1, minHeight: CIBLE, borderRadius: 14, backgroundColor: couleurs.voile, alignItems: "center", justifyContent: "center", ...enfonce(pressed) })}>
                    <Text style={{ color: couleurs.encre, fontFamily: POLICE.section }}>{x.reseau}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={TYPO.note}>Instagram et Snapchat : choisissez « En image », puis l'application dans la feuille de partage de votre téléphone.</Text>
            </Bloc>
          ) : null}

          {/* 09/11/2026 (porteur) : une modale explicative, au lieu d'un accordéon. */}
          <Pressable onPress={() => setExplication(true)} accessibilityRole="button" accessibilityLabel="Comment ces faits sont choisis"
            style={({ pressed }) => ({ minHeight: CIBLE, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: PAS * 1.5, ...enfonce(pressed) })}>
            <Ionicons name="information-circle-outline" size={18} color={couleurs.sourd} accessible={false} importantForAccessibility="no" />
            <Text style={[TYPO.note, { color: couleurs.encre }]}>Comment ces faits sont choisis</Text>
          </Pressable>
          <ModaleExhaustif titre="Comment ces faits sont choisis" visible={explication} onFermer={() => setExplication(false)} sections={[
            { titre: "D'où viennent les faits", contenu: "Ce sont trois faits tirés des données publiques que Repère publie pour votre commune : budget, projets aidés par l'État, votes de votre député, histoire de la commune. Chacun porte sa source." },
            { titre: "Comment ils changent", contenu: "Ils changent chaque jour, comme le mot du jour. Le même jour, la même commune donnent les mêmes faits : l'ordre vient d'un tirage du jour, jamais d'une mesure." },
            { titre: "Ce que Repère ne fait pas", contenu: "Repère n'écrit aucun fait à la main et n'invente rien quand une donnée manque : dans ce cas, aucun fait n'est affiché." },
          ]} />
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
