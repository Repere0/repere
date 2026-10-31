/* ENTREE D'UN ECRAN : un fondu et une remontee de 12 px, 280 ms (300 ms au plus),
   une seule fois au montage. Le mouvement reduit (Reglages > Accessibilite) le
   supprime : le contenu est affiche d'emblee. */
import { useEffect, useRef, type ReactNode } from "react";
import { Animated, Easing, type StyleProp, type ViewStyle } from "react-native";
import { useMouvementReduit } from "./mouvement";

/* « delai » : décale l'apparition (cartes en cascade, 40 ms entre deux cartes). */
export function Entree({ children, style, delai = 0 }: { children: ReactNode; style?: StyleProp<ViewStyle>; delai?: number }) {
  const reduit = useMouvementReduit();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduit) { v.setValue(1); return; }
    const a = Animated.timing(v, { toValue: 1, duration: 280, delay: delai, easing: Easing.out(Easing.cubic), useNativeDriver: false });
    a.start();
    return () => a.stop();
  }, [reduit, v, delai]);
  return (
    <Animated.View style={[style, { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}>
      {children}
    </Animated.View>
  );
}
