/* Partage natif de Repère : aucun compte, aucun suivi, aucune donnée supplémentaire. */
import { Share } from "react-native";

export async function partagerRepere(titre: string, texte: string, sourceUrl?: string | null) {
  const message = sourceUrl ? `${texte}\\n\\nSource : ${sourceUrl}` : texte;
  return Share.share({ message, title: titre });
}
