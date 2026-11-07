/* PICTOGRAMMES INSTITUTIONNELS (V14, 30/10/2026 ; Ionicons depuis le 05/11/2026, zero emoji).
 *
 * Une icone au plus par carte, jamais en debut de titre : elle se pose APRES l'etiquette,
 * dans la meme ligne. Masquee au lecteur d'ecran : l'etiquette dit deja la meme chose.
 * Liste fermee : Parlement, budget, vote. */
import type { ReactNode } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { couleurs } from "../lib/theme";

export const PICTO = { parlement: "business-outline", budget: "bar-chart-outline", vote: "checkbox-outline" } as const;

export function AvecPicto({ picto, children }: { picto: keyof typeof PICTO; children: ReactNode }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      {children}
      <Ionicons name={PICTO[picto]} size={16} color={couleurs.sourd} accessible={false} importantForAccessibility="no" />
    </View>
  );
}
