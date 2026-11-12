/* « EN CLAIR » — le résumé d'un texte voté (note de conception du 12/11/2026). Prêt, pas encore branché :
 * aucun résumé validé n'existe. Tant que `resume` n'est pas validé (core `resumeAffichable`), l'écran dit
 * « Pas encore de résumé » et renvoie vers le texte officiel (invariant 5). La mention IA est toujours écrite. */
import { Linking, Pressable, Text, View } from "react-native";
import { dateFr, mentionResume, PAS_DE_RESUME, resumeAffichable } from "@repere/core";
import { couleurs, CIBLE, PAS, POLICE, RAYON, TYPO } from "../lib/theme";
import { Vide } from "../lib/composants";
import { enfonce } from "./mouvement";

type Resume = { valide?: boolean; resume?: string; source?: { producteur?: string; url?: string; releve_le?: string } } | null | undefined;

export function ResumeClair({ resume, lienOfficiel }: { resume: Resume; lienOfficiel?: string }) {
  const r = resumeAffichable(resume) as { texte: string; producteur: string; url: string; releveLe: string } | null;
  if (!r) {
    return <Vide titre={PAS_DE_RESUME} lien={lienOfficiel ? { texte: "Lire le texte officiel", url: lienOfficiel } : undefined} />;
  }
  return (
    <View style={{ gap: PAS * 2, padding: PAS * 4, borderRadius: RAYON.carte, backgroundColor: couleurs.carte }}>
      <Text style={TYPO.etiquette} accessibilityRole="header">En clair</Text>
      <Text style={TYPO.corps}>{r.texte}</Text>
      <Text style={TYPO.micro}>{mentionResume(r.producteur)}</Text>
      <Pressable onPress={() => Linking.openURL(r.url)} accessibilityRole="link"
        accessibilityLabel={`Lire le texte officiel${r.producteur ? ` (${r.producteur})` : ""}, ouvre un site externe`}
        style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", alignSelf: "flex-start", ...enfonce(pressed) })}>
        <Text style={[TYPO.corps, { fontFamily: POLICE.texteMoyen, color: couleurs.lien }]}>Lire le texte officiel ↗</Text>
      </Pressable>
      <Text style={TYPO.micro}>{r.producteur ? `${r.producteur} · ` : ""}relevé le {dateFr(r.releveLe)}</Text>
    </View>
  );
}
