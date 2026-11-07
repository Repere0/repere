/* L'EFFET DE PRESSION (07/11/2026) : une carte touchée s'enfonce légèrement (97 %), puis
 * revient. Il dit « ceci se touche ». Mouvement réduit : seulement une légère transparence.
 * Invariant 6 : un mouvement pour naviguer, jamais une récompense. */
import { useRef, type ReactNode } from "react";
import { Animated, Pressable, type AccessibilityRole, type StyleProp, type ViewStyle } from "react-native";
import { useMouvementReduit } from "./mouvement";

export function Pression({ onPress, children, style, role = "button", etiquette }: {
  onPress: () => void; children: ReactNode; style?: StyleProp<ViewStyle>; role?: AccessibilityRole; etiquette?: string;
}) {
  const reduit = useMouvementReduit();
  const e = useRef(new Animated.Value(1)).current;
  const vers = (v: number) => Animated.spring(e, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 4 }).start();
  return (
    <Pressable onPress={onPress} accessibilityRole={role} accessibilityLabel={etiquette}
      onPressIn={() => (reduit ? e.setValue(0.97) : vers(0.97))} onPressOut={() => (reduit ? e.setValue(1) : vers(1))}>
      <Animated.View style={[style, reduit ? { opacity: e.interpolate({ inputRange: [0.97, 1], outputRange: [0.7, 1] }) } : { transform: [{ scale: e }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
