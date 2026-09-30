/* LE MOUVEMENT SERT A COMPRENDRE, ET S'EFFACE QUAND LE LECTEUR LE DEMANDE.
 *
 * Toutes les animations de Repere passent par ce fichier. Si le telephone
 * demande de reduire les animations (Reglages > Accessibilite), elles sont
 * remplacees par l'etat final, immediatement : l'information n'attend jamais
 * une animation. Seule l'API Animated de React Native est utilisee — aucune
 * bibliotheque d'animation de plus. */
import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing } from "react-native";
import { DUREE } from "../lib/theme";

export function useMouvementReduit(): boolean {
  const [reduit, setReduit] = useState(false);
  useEffect(() => {
    let vivant = true;
    AccessibilityInfo.isReduceMotionEnabled().then(r => { if (vivant) setReduit(!!r); }).catch(() => {});
    const abo = AccessibilityInfo.addEventListener("reduceMotionChanged", r => setReduit(!!r));
    return () => { vivant = false; abo.remove(); };
  }, []);
  return reduit;
}

/* Une valeur qui va de 0 a 1 une fois, a l'apparition (barres, frises).
   Les largeurs animees ne passent pas par le pilote natif : quelques barres
   par ecran, mesure faite sans a-coup sur l'export web. */
export function useApparition(delai = 0): Animated.Value {
  const reduit = useMouvementReduit();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduit) { v.setValue(1); return; }
    const a = Animated.timing(v, {
      toValue: 1, duration: DUREE.remplissage, delay: delai,
      easing: Easing.out(Easing.cubic), useNativeDriver: false,
    });
    a.start();
    return () => a.stop();
  }, [reduit, delai, v]);
  return v;
}

/* Un nombre qui se revele (0 -> valeur). Le lecteur d'ecran lit toujours la
   valeur finale : l'animation n'existe que pour l'oeil. */
export function useCompteur(cible: number): number {
  const reduit = useMouvementReduit();
  const [n, setN] = useState(reduit ? cible : 0);
  useEffect(() => {
    if (reduit || !Number.isFinite(cible)) { setN(cible); return; }
    const v = new Animated.Value(0);
    const id = v.addListener(({ value }) => setN(Math.round(value)));
    const a = Animated.timing(v, { toValue: cible, duration: DUREE.apparition, easing: Easing.out(Easing.cubic), useNativeDriver: false });
    a.start(() => setN(cible));
    return () => { a.stop(); v.removeListener(id); };
  }, [cible, reduit]);
  return n;
}
