/* DÉTAILS — accordéon inline, fermé par défaut (V28, bloc 1).
 * Principe : rien n'est supprimé. Ce qui n'est pas à l'écran au premier regard reste à un
 * geste : « Voir plus » ouvre le contenu, « Voir moins » le referme. Le chevron tourne.
 * Le fondu dure 200 ms ; si le téléphone demande moins d'animations, il est immédiat. */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { CIBLE, couleurs, PAS, TYPO } from "../lib/theme";
import { useMouvementReduit } from "./mouvement";

/* Sur un fond sombre (carte de l'accueil), la couleur du texte et du lien se passe ici :
   les valeurs par défaut sont celles du thème clair. */
export function Details({ titre, children, ouvertParDefaut = false, couleur, lien }: {
  titre: string; children: ReactNode; ouvertParDefaut?: boolean; couleur?: string; lien?: string;
}) {
  const [ouvert, setOuvert] = useState(ouvertParDefaut);
  const reduit = useMouvementReduit();
  const fondu = useRef(new Animated.Value(ouvertParDefaut ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(fondu, { toValue: ouvert ? 1 : 0, duration: reduit ? 0 : 200, useNativeDriver: true }).start();
  }, [ouvert, reduit, fondu]);
  return (
    <View style={{ gap: PAS * 2 }}>
      <Pressable onPress={() => setOuvert(o => !o)} accessibilityRole="button" accessibilityState={{ expanded: ouvert }}
        accessibilityLabel={`${titre}. ${ouvert ? "Voir moins" : "Voir plus"}`}
        style={({ pressed }) => ({ minHeight: CIBLE, flexDirection: "row", alignItems: "center", gap: PAS * 2, opacity: pressed ? 0.7 : 1 })}>
        <Text style={[TYPO.corps, { flex: 1, fontWeight: "600" }, couleur ? { color: couleur } : null]}>{titre}</Text>
        <Text style={{ color: lien ?? couleurs.lien, fontWeight: "500" }}>{ouvert ? "Voir moins" : "Voir plus"}</Text>
        <Text aria-hidden style={{ color: lien ?? couleurs.lien, fontSize: 22, transform: [{ rotate: ouvert ? "90deg" : "0deg" }] }}>›</Text>
      </Pressable>
      {ouvert ? (
        <Animated.View style={{ opacity: fondu, gap: PAS * 2 }}>{children}</Animated.View>
      ) : null}
    </View>
  );
}
