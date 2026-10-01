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

/* LE REGLAGE EST LU UNE FOIS, POUR TOUTE L'APPLICATION (01/10/2026).
 * Avant : chaque composant le demandait au systeme, de facon asynchrone, en
 * partant de « animations permises » — une barre pouvait donc commencer a
 * s'etirer avant que le reglage « reduire les animations » ne soit connu, et
 * chaque composant ouvrait son propre abonnement. Maintenant : une seule
 * lecture au demarrage, un seul abonnement, et tant que la reponse n'est pas
 * arrivee (null), aucune animation ne demarre. */
let reduitConnu: boolean | null = null;
const abonnes = new Set<(r: boolean) => void>();
const poser = (r: boolean) => { reduitConnu = r; abonnes.forEach(f => f(r)); };
AccessibilityInfo.isReduceMotionEnabled().then(r => poser(!!r)).catch(() => poser(false));
AccessibilityInfo.addEventListener("reduceMotionChanged", r => poser(!!r));

/* null tant que le systeme n'a pas repondu : l'appelant n'anime rien. */
export function useMouvementReduit(): boolean | null {
  const [reduit, setReduit] = useState<boolean | null>(reduitConnu);
  useEffect(() => {
    abonnes.add(setReduit);
    if (reduitConnu !== null) setReduit(reduitConnu);
    return () => { abonnes.delete(setReduit); };
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
    if (reduit === null) return;             /* reglage pas encore connu : on attend */
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
