/* CONFORT DE LECTURE — V26, bloc 3. Les réglages qui ont un effet réel sont appliqués
 * en direct et gardés dans repere.profil (ADR 0006). Ceux qui n'en ont pas encore sont
 * listés, avec la raison, plutôt que faits à moitié. Aucune requête ne part. */
import { Pressable, ScrollView, Text, View } from "react-native";
import { Stack } from "expo-router";
import { CONTRASTES, ESPACEMENTS, TAILLES_TEXTE } from "@repere/core";
import { useProfil } from "../lib/profil";
import { CIBLE, couleurs, PAS, TYPO } from "../lib/theme";
import { Carte } from "../lib/composants";

const ETIQUETTE_CONTRASTE: Record<string, string> = { normal: "Normal", eleve: "Élevé", "tres-eleve": "Très élevé" };

function Choix({ texte, actif, onPress, etiquette }: { texte: string; actif: boolean; onPress: () => void; etiquette: string }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected: actif }} accessibilityLabel={`${etiquette}${actif ? ", choisi" : ""}`}
      style={({ pressed }) => ({ minHeight: CIBLE, minWidth: CIBLE, paddingHorizontal: PAS * 3, justifyContent: "center", borderRadius: 999,
        borderWidth: actif ? 2 : 1, borderColor: actif ? couleurs.encre : couleurs.trait, backgroundColor: couleurs.carte, opacity: pressed ? 0.7 : 1 })}>
      <Text style={[TYPO.note, { color: couleurs.encre, fontWeight: actif ? "700" : "400" }]}>{texte}</Text>
    </Pressable>
  );
}

function Interrupteur({ texte, actif, onPress }: { texte: string; actif: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="switch" accessibilityState={{ checked: actif }} accessibilityLabel={`${texte} : ${actif ? "activé" : "désactivé"}`}
      style={({ pressed }) => ({ minHeight: CIBLE, flexDirection: "row", alignItems: "center", justifyContent: "space-between", opacity: pressed ? 0.7 : 1 })}>
      <Text style={[TYPO.corps, { flex: 1, paddingRight: PAS * 3 }]}>{texte}</Text>
      <Text style={[TYPO.note, { fontWeight: "700", color: couleurs.encre }]}>{actif ? "Activé" : "Désactivé"}</Text>
    </Pressable>
  );
}

export default function ConfortLecture() {
  const { profil, modifier } = useProfil();
  const p = profil ?? { tailleTexte: 16, espacement: 1.5, contraste: "normal", animationsReduites: false, masquerImages: false, niveauZoom: "france", policeDyslexie: false, modeDaltonien: false };
  return (
    <ScrollView style={{ flex: 1, backgroundColor: couleurs.sol }} contentContainerStyle={{ padding: PAS * 4, gap: PAS * 4 }}>
      <Stack.Screen options={{ title: "Confort de lecture" }} />
      <Carte titre="Taille du texte">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: PAS * 2 }}>
          {TAILLES_TEXTE.map(t => <Choix key={t} texte={`A ${t}`} etiquette={`Texte de ${t} points`} actif={p.tailleTexte === t} onPress={() => modifier({ tailleTexte: t })} />)}
        </View>
        <View style={{ borderRadius: 14, padding: PAS * 3, backgroundColor: couleurs.carte, borderWidth: 1, borderColor: couleurs.trait }}>
          <Text style={{ fontSize: p.tailleTexte, lineHeight: Math.round(p.tailleTexte * p.espacement), color: couleurs.encre }}>
            Repère vous dit ce qui se décide près de chez vous, avec les sources.
          </Text>
        </View>
      </Carte>
      <Carte titre="Espacement des lignes">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: PAS * 2 }}>
          {ESPACEMENTS.map(e => <Choix key={e} texte={String(e).replace(".", ",")} etiquette={`Interligne ${String(e).replace(".", ",")}`} actif={p.espacement === e} onPress={() => modifier({ espacement: e })} />)}
        </View>
      </Carte>
      <Carte titre="Contraste">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: PAS * 2 }}>
          {CONTRASTES.map(c => <Choix key={c} texte={ETIQUETTE_CONTRASTE[c]} etiquette={`Contraste ${ETIQUETTE_CONTRASTE[c]}`} actif={p.contraste === c} onPress={() => modifier({ contraste: c })} />)}
        </View>
        <Text style={TYPO.note}>Le contraste « Très élevé » n'atteint pas encore le ratio de 10:1 : il ne fait pas davantage que « Élevé ». Voir BLOCAGES 25.</Text>
      </Carte>
      <Carte titre="Mouvement et images">
        <Interrupteur texte="Animations réduites" actif={p.animationsReduites} onPress={() => modifier({ animationsReduites: !p.animationsReduites })} />
        <Interrupteur texte="Masquer les images" actif={p.masquerImages} onPress={() => modifier({ masquerImages: !p.masquerImages })} />
      </Carte>
      <Carte titre="Pas encore disponible">
        <Text style={TYPO.note}>Ces réglages ne sont pas encore faits. Ils ne sont pas simulés.</Text>
        <Text style={TYPO.note}>• Police pour la dyslexie : aucune police de ce type n'est dans l'application. Il faut en choisir une et vérifier sa licence.</Text>
        <Text style={TYPO.note}>• Mode daltonien pour les votes : demande une palette, donc une décision sur les couleurs de vote (D24).</Text>
        <Text style={TYPO.note}>• Guide de lecture qui suit le doigt, et mode focus : pas encore conçus pour les écrans.</Text>
      </Carte>
    </ScrollView>
  );
}
