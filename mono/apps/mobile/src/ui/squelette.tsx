/* SQUELETTES : des blocs gris qui battent pendant un chargement, a la place d'un
   simple texte « Chargement ». Le lecteur d'ecran lit une seule fois « Chargement en
   cours » ; les blocs eux-memes sont masques. Mouvement reduit : blocs fixes. */
import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { couleurs, PAS, RAYON } from "../lib/theme";
import { useMouvementReduit } from "./mouvement";

export function Squelette({ hauteur = 64 }: { hauteur?: number }) {
  const reduit = useMouvementReduit();
  const v = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (reduit) { v.setValue(0.6); return; }
    const boucle = Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue: 0.45, duration: 700, useNativeDriver: false }),
      Animated.timing(v, { toValue: 1, duration: 700, useNativeDriver: false }),
    ]));
    boucle.start();
    return () => boucle.stop();
  }, [reduit, v]);
  return (
    <Animated.View accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
      style={{ height: hauteur, borderRadius: RAYON.bloc, backgroundColor: couleurs.trait, opacity: v }} />
  );
}

export function SquelettesListe({ n = 4, hauteur = 72 }: { n?: number; hauteur?: number }) {
  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel="Chargement en cours" style={{ gap: PAS * 2 }}>
      {Array.from({ length: n }, (_, i) => <Squelette key={i} hauteur={hauteur} />)}
    </View>
  );
}
