/* « EN CLAIR » — le résumé d'un texte voté (note de conception du 12/11/2026). Branché le 12/11/2026 sur
 * resumes-clairs.json (seulement des résumés validés par le porteur, scripts/resumes-clairs.mjs). Tant que `resume` n'est pas validé (core `resumeAffichable`), l'écran dit
 * « Pas encore de résumé » et renvoie vers le texte officiel (invariant 5). La mention IA est toujours écrite. */
import { useEffect, useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { dateFr, mentionResume, PAS_DE_RESUME, resumeAffichable, resumePour } from "@repere/core";
import { chargerResumesClairs } from "../lib/donnees";
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

/* Le résumé d'un vote, lu dans le fichier publié : par dossier législatif, sinon par numéro de scrutin. Fichier
   absent, pas arrivé ou sans ce texte : « Pas encore de résumé pour ce texte » et le lien officiel (invariant 5). */
export function ResumeClairDuVote({ dossier, scrutin, lienOfficiel }: { dossier?: string | null; scrutin?: string | number | null; lienOfficiel?: string }) {
  const [index, setIndex] = useState<unknown>(null);
  useEffect(() => {
    let vivant = true;
    chargerResumesClairs().then((r: { donnees: unknown }) => { if (vivant) setIndex(r.donnees ?? null); }).catch(() => {});
    return () => { vivant = false; };
  }, []);
  return <ResumeClair resume={resumePour(index, { dossier, scrutin }) as Resume} lienOfficiel={lienOfficiel} />;
}
