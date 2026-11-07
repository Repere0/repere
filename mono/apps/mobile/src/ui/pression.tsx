/* L'EFFET DE PRESSION (07/11/2026) : une carte touchée s'enfonce légèrement (97 %), puis
 * revient. Il dit « ceci se touche ». Mouvement réduit : seulement une légère transparence.
 * Invariant 6 : un mouvement pour naviguer, jamais une récompense. */
import { useRef, type ReactNode } from "react";
import { Animated, Pressable, StyleSheet, type AccessibilityRole, type StyleProp, type ViewStyle } from "react-native";
import { useMouvementReduit } from "./mouvement";

const PLACEMENT = new Set(["width", "minWidth", "maxWidth", "flex", "flexGrow", "flexShrink", "flexBasis", "alignSelf",
  "margin", "marginTop", "marginBottom", "marginLeft", "marginRight", "marginHorizontal", "marginVertical", "position", "top", "left", "right", "bottom"]);

export function Pression({ onPress, children, style, role = "button", etiquette }: {
  onPress: () => void; children: ReactNode; style?: StyleProp<ViewStyle>; role?: AccessibilityRole; etiquette?: string;
}) {
  const reduit = useMouvementReduit();
  const e = useRef(new Animated.Value(1)).current;
  const vers = (v: number) => Animated.spring(e, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 4 }).start();
  /* BUG iPhone (07/11/2026) : la largeur (« 48 % », flex) posée sur la vue animée, À L'INTÉRIEUR
     du Pressable, laissait le Pressable sans largeur dans une rangée : le texte se cassait lettre à
     lettre (« Qu i dé ci de »). Les clés de placement vont au Pressable, le reste à la vue. */
  const plat = (StyleSheet.flatten(style) || {}) as ViewStyle & Record<string, unknown>;
  const placement: ViewStyle = {};
  const reste: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(plat)) (PLACEMENT.has(k) ? (placement as Record<string, unknown>) : reste)[k] = v;
  return (
    <Pressable onPress={onPress} accessibilityRole={role} accessibilityLabel={etiquette} style={placement}
      onPressIn={() => (reduit ? e.setValue(0.97) : vers(0.97))} onPressOut={() => (reduit ? e.setValue(1) : vers(1))}>
      <Animated.View style={[reste as ViewStyle, { flexGrow: 1 }, reduit ? { opacity: e.interpolate({ inputRange: [0.97, 1], outputRange: [0.7, 1] }) } : { transform: [{ scale: e }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
