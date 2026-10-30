/* « VUE : [NIVEAU] · CHANGER » — V26 bloc 2. Discret, en tête de chaque écran concerné.
 * Le niveau est gardé dans repere.profil (ADR 0006). Changer ouvre les quatre niveaux ;
 * choisir un niveau l'enregistre et referme. Cibles de 48 points, texte en toutes lettres. */
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { LIBELLE_NIVEAU, NIVEAUX_ZOOM } from "@repere/core";
import { useProfil } from "../lib/profil";
import { CIBLE, couleurs, PAS, TYPO } from "../lib/theme";

export function useNiveauZoom(): string {
  const { profil } = useProfil();
  return profil?.niveauZoom ?? "tout";
}

export function BadgeZoom() {
  const { modifier } = useProfil();
  const niveau = useNiveauZoom();
  const [ouvert, setOuvert] = useState(false);
  const libelle = LIBELLE_NIVEAU[niveau as keyof typeof LIBELLE_NIVEAU] ?? LIBELLE_NIVEAU.tout;
  return (
    <View style={{ gap: PAS * 2 }}>
      <Pressable onPress={() => setOuvert(o => !o)} accessibilityRole="button" accessibilityState={{ expanded: ouvert }}
        accessibilityLabel={`Vue : ${libelle}. ${ouvert ? "Fermer le choix" : "Changer la vue"}`}
        style={({ pressed }) => ({ minHeight: CIBLE, alignSelf: "flex-start", justifyContent: "center", paddingHorizontal: PAS * 3, borderRadius: 999, borderWidth: 1, borderColor: couleurs.trait, opacity: pressed ? 0.7 : 1 })}>
        <Text style={TYPO.micro}>Vue : {libelle} · <Text style={{ color: couleurs.lien, textDecorationLine: "underline" }}>Changer</Text></Text>
      </Pressable>
      {ouvert ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: PAS * 2 }}>
          {NIVEAUX_ZOOM.map(n => {
            const actif = n === niveau;
            return (
              <Pressable key={n} accessibilityRole="radio" accessibilityState={{ selected: actif }}
                accessibilityLabel={`Vue ${LIBELLE_NIVEAU[n as keyof typeof LIBELLE_NIVEAU]}${actif ? ", choisie" : ""}`}
                onPress={() => { modifier({ niveauZoom: n }); setOuvert(false); }}
                style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", paddingHorizontal: PAS * 3, borderRadius: 999, borderWidth: actif ? 2 : 1, borderColor: actif ? couleurs.encre : couleurs.trait, opacity: pressed ? 0.7 : 1 })}>
                <Text style={TYPO.note}>{LIBELLE_NIVEAU[n as keyof typeof LIBELLE_NIVEAU]}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
