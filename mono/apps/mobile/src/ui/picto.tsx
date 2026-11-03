/* PICTOGRAMMES INSTITUTIONNELS (V14, 30/10/2026, demande du CEO).
 *
 * Un emoji au plus par carte, jamais en debut de titre : il se pose APRES l'etiquette,
 * dans la meme ligne. Masque au lecteur d'ecran : l'etiquette dit deja la meme chose.
 * Liste fermee : 🏛️ Parlement, 📊 budget, 🗳️ vote. Independant d'AVEC_EMOJIS
 * (ui/resume.tsx), qui garde les emojis de categorie coupes (decision du 30/09/2026). */
import type { ReactNode } from "react";
import { Text, View } from "react-native";

export const PICTO = { parlement: "🏛️", budget: "📊", vote: "🗳️" } as const;

export function AvecPicto({ picto, children }: { picto: keyof typeof PICTO; children: ReactNode }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      {children}
      <Text accessibilityElementsHidden importantForAccessibility="no" style={{ fontSize: 14, lineHeight: 18 }}>{PICTO[picto]}</Text>
    </View>
  );
}
