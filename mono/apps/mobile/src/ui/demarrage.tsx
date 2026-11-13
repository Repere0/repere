/* L'ÉCRAN DE DÉMARRAGE (13/11/2026, décision du porteur) : le logo sur le fond sombre de Repère, en fondu.
 *
 * 1,2 seconde en tout (plafond demandé : 1,5 s) : le logo apparaît (350 ms, léger grossissement de 0,92 à 1), tient
 * 500 ms, puis le voile s'efface (350 ms) sur l'application DÉJÀ dessinée dessous. Le voile ne capte aucun geste
 * (pointerEvents none) : il ne retarde ni un lecteur pressé, ni un lecteur d'écran, ni un lien ouvert sur une page
 * précise. Animations réduites (réglage du lecteur ou du système) : aucun voile. Une fois par lancement. */
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet } from "react-native";
import { NEUTRES_PAR_MODE } from "../lib/palette";
import { Logo } from "./logo";
import { useMouvementReduit } from "./mouvement";

export const DUREE_DEMARRAGE = { entree: 350, tenue: 500, sortie: 350 };
let dejaJoue = false;

export function Demarrage() {
  const reduit = useMouvementReduit();
  const [fini, setFini] = useState(dejaJoue);
  const logo = useRef(new Animated.Value(0)).current;
  const voile = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (fini) return;
    dejaJoue = true;
    if (reduit) { setFini(true); return; }
    const d = DUREE_DEMARRAGE;
    Animated.sequence([
      Animated.timing(logo, { toValue: 1, duration: d.entree, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.delay(d.tenue),
      Animated.timing(voile, { toValue: 0, duration: d.sortie, easing: Easing.in(Easing.quad), useNativeDriver: false }),
    ]).start(() => setFini(true));
  }, [fini, reduit, logo, voile]);
  if (fini) return null;
  const sombre = NEUTRES_PAR_MODE.sombre;
  return (
    <Animated.View pointerEvents="none" testID="demarrage" accessible={false} importantForAccessibility="no-hide-descendants" aria-hidden
      style={[StyleSheet.absoluteFill, { zIndex: 1000, alignItems: "center", justifyContent: "center", backgroundColor: sombre.sol, opacity: voile }]}>
      <Animated.View style={{ opacity: logo, transform: [{ scale: logo.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) }] }}>
        <Logo size={96} c={{ encre: sombre.encre, sol: sombre.sol } as never} />
      </Animated.View>
    </Animated.View>
  );
}
