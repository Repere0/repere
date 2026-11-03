/* BIENVENUE — quatre questions, trente secondes (V26, bloc 1 ; thèmes ajoutés en V31, D57).
 *
 * Affiché quand aucun profil n'est gardé sur ce telephone (repere.profil absent). La
 * question 1 (la commune) est répondue sur l'accueil avant d'arriver ici. « Terminer »
 * garde les réponses 2, 3 et 4 sur ce téléphone. La question 4 (les thèmes) peut rester vide. « Passer » garde les réglages par défaut
 * (D45, V27) : c'est un choix explicite. Chaque question 2 à 4 a son « Aucune préférence » (V34) :
 * il remet la question à sa valeur par défaut, sans quitter l'écran. Aucune réponse ne part. */
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router, Stack } from "expo-router";
import { LIBELLE_NIVEAU, PROFIL_DEFAUT, TAILLES_TEXTE, THEMES } from "@repere/core";
import { useSelection } from "../lib/selection";
import { useProfil } from "../lib/profil";
import { CIBLE, couleurs, PAS, TYPO } from "../lib/theme";
import { Bouton, Texte } from "../lib/composants";

const CHOIX_NIVEAU: { niveau: string; emoji: string; aide: string }[] = [
  { niveau: "rue", emoji: "🏘️", aide: "Votre commune et votre intercommunalité" },
  { niveau: "region", emoji: "🏛️", aide: "Ce qui se décide dans votre commune et votre région" },
  { niveau: "france", emoji: "🇫🇷", aide: "Ce qui se décide au niveau national" },
];

/* « Aucune préférence » : remet la question à sa valeur par défaut, sans quitter l'écran (V34, bloc 3). */
function AucunePreference({ texte, onPress, actif }: { texte: string; onPress: () => void; actif: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: actif }}
      accessibilityLabel={texte}
      style={({ pressed }) => ({
        minHeight: CIBLE, paddingHorizontal: PAS * 3, justifyContent: "center", alignSelf: "flex-start", borderRadius: 999,
        borderWidth: 1, borderStyle: "dashed", borderColor: couleurs.trait, opacity: pressed ? 0.7 : 1,
      })}>
      <Text style={[TYPO.note, { color: couleurs.sourd, fontWeight: actif ? "700" : "400" }]}>{texte}</Text>
    </Pressable>
  );
}

export default function Bienvenue() {
  const { choix } = useSelection();
  const { enregistrer, passer: garderDefauts } = useProfil();
  const [niveau, setNiveau] = useState<string>("france");
  const [taille, setTaille] = useState<number>(PROFIL_DEFAUT.tailleTexte);
  const [themes, setThemes] = useState<string[]>([]);

  const terminer = () => {
    enregistrer({ ...PROFIL_DEFAUT, niveauZoom: niveau, tailleTexte: taille, themes });
    router.replace("/chez-vous");
  };
  const passer = () => {
    garderDefauts();
    router.replace("/chez-vous");
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: couleurs.sol }} contentContainerStyle={{ padding: PAS * 4, gap: PAS * 5 }}>
      <Stack.Screen options={{ title: "Bienvenue", headerShown: true }} />

      <View style={{ gap: PAS * 2 }}>
        <Text style={TYPO.etiquette}>Question 1 sur 4</Text>
        <Text style={TYPO.question} accessibilityRole="header">Où habitez-vous ?</Text>
        <Texte>{choix ? `Votre commune : ${choix.nom}.` : "Aucune commune choisie."}</Texte>
      </View>

      <View style={{ gap: PAS * 2 }}>
        <Text style={TYPO.etiquette}>Question 2 sur 4</Text>
        <Text style={TYPO.question} accessibilityRole="header">Qu'est-ce qui vous intéresse ?</Text>
        {CHOIX_NIVEAU.map(c => {
          const actif = niveau === c.niveau;
          return (
            <Pressable key={c.niveau} onPress={() => setNiveau(c.niveau)} accessibilityRole="radio"
              accessibilityState={{ selected: actif }} accessibilityLabel={`${LIBELLE_NIVEAU[c.niveau as keyof typeof LIBELLE_NIVEAU]} : ${c.aide}`}
              style={({ pressed }) => ({
                minHeight: CIBLE, padding: PAS * 3, borderRadius: 14, gap: PAS,
                borderWidth: actif ? 2 : 1, borderColor: actif ? couleurs.encre : couleurs.trait,
                backgroundColor: couleurs.carte, opacity: pressed ? 0.7 : 1,
              })}>
              <Text style={TYPO.corps}>{c.emoji}  {LIBELLE_NIVEAU[c.niveau as keyof typeof LIBELLE_NIVEAU]}{actif ? "  (choisi)" : ""}</Text>
              <Text style={TYPO.note}>{c.aide}</Text>
            </Pressable>
          );
        })}
        <AucunePreference texte="Aucune préférence : vue France" actif={niveau === "france"} onPress={() => setNiveau("france")} />
      </View>

      <View style={{ gap: PAS * 2 }}>
        <Text style={TYPO.etiquette}>Question 3 sur 4</Text>
        <Text style={TYPO.question} accessibilityRole="header">Comment lisez-vous le mieux ?</Text>
        <View style={{ flexDirection: "row", gap: PAS * 2, flexWrap: "wrap" }}>
          {TAILLES_TEXTE.filter(t => t <= 22).map(t => {
            const actif = taille === t;
            return (
              <Pressable key={t} onPress={() => setTaille(t)} accessibilityRole="radio"
                accessibilityState={{ selected: actif }} accessibilityLabel={`Texte de ${t} points${actif ? ", choisi" : ""}`}
                style={({ pressed }) => ({
                  minHeight: CIBLE, minWidth: CIBLE, paddingHorizontal: PAS * 3, justifyContent: "center", borderRadius: 999,
                  borderWidth: actif ? 2 : 1, borderColor: actif ? couleurs.encre : couleurs.trait,
                  backgroundColor: couleurs.carte, opacity: pressed ? 0.7 : 1,
                })}>
                <Text style={{ fontSize: t, color: couleurs.encre, fontWeight: actif ? "700" : "400" }}>A {t}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={{ borderRadius: 14, padding: PAS * 3, backgroundColor: couleurs.carte, borderWidth: 1, borderColor: couleurs.trait }}>
          <Text style={{ fontSize: taille, lineHeight: Math.round(taille * 1.5), color: couleurs.encre }} accessibilityLabel={`Aperçu à ${taille} points`}>
            Repère vous dit ce qui se décide près de chez vous, avec les sources.
          </Text>
        </View>
        <AucunePreference texte={`Aucune préférence : texte de ${PROFIL_DEFAUT.tailleTexte} points`} actif={taille === PROFIL_DEFAUT.tailleTexte}
          onPress={() => setTaille(PROFIL_DEFAUT.tailleTexte)} />
      </View>

      <View style={{ gap: PAS * 2 }}>
        <Text style={TYPO.etiquette}>Question 4 sur 4 (facultative)</Text>
        <Text style={TYPO.question} accessibilityRole="header">Quels sujets vous intéressent ?</Text>
        <Text style={TYPO.note}>Le fil « Pour vous » ne montrera que ces sujets. Vous pourrez les changer à tout moment.</Text>
        <View style={{ flexDirection: "row", gap: PAS * 2, flexWrap: "wrap" }}>
          {THEMES.map(th => {
            const coche = themes.includes(th);
            return (
              <Pressable key={th} accessibilityRole="checkbox" accessibilityState={{ checked: coche }} accessibilityLabel={`${th}${coche ? ", coché" : ""}`}
                onPress={() => setThemes(t => (t.includes(th) ? t.filter(x => x !== th) : [...t, th]))}
                style={({ pressed }) => ({
                  minHeight: CIBLE, paddingHorizontal: PAS * 3, justifyContent: "center", borderRadius: 999,
                  borderWidth: coche ? 2 : 1, borderColor: coche ? couleurs.encre : couleurs.trait,
                  backgroundColor: couleurs.carte, opacity: pressed ? 0.7 : 1,
                })}>
                <Text style={[TYPO.corps, { color: couleurs.encre, fontWeight: coche ? "700" : "400" }]}>{coche ? "✓ " : ""}{th}</Text>
              </Pressable>
            );
          })}
        </View>
        <AucunePreference texte="Aucune préférence : aucun sujet" actif={themes.length === 0} onPress={() => setThemes([])} />
      </View>

      <View style={{ gap: PAS * 3 }}>
        <Bouton texte="Terminer" onPress={terminer} />
        <Bouton texte="Passer (garde les réglages par défaut)" onPress={passer} discret />
      </View>
    </ScrollView>
  );
}
