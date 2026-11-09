/* LES DÉCIDEURS DU QUOTIDIEN (refonte « légère », 09/11/2026) : le maire (Répertoire national des
 * élus) et le député (fichier des députés), en une rangée compacte d'avatars ronds. Initiales sur la
 * couleur de l'ÉCHELON, jamais d'un parti (invariant 7). Un nom absent n'est pas inventé : la ligne
 * disparaît. Chaque nom ouvre sa fiche. Partagé par l'accueil et « Aujourd'hui ». */
import { Text, View } from "react-native";
import { router } from "expo-router";
import { ordinal } from "@repere/core";
import { couleurs, PAS, POLICE, TYPO } from "../lib/theme";
import { Avatar } from "./avatar";
import { Pression } from "./pression";

/* « J.-F. Copé » : l'initiale du prénom (composé ou non), puis le nom. Le nom entier reste dans le nom accessible. */
export function nomCourt(nom: string): string {
  const mots = nom.trim().split(/\s+/);
  if (mots.length < 2) return nom;
  const prenom = mots[0].split("-").map(p => p.charAt(0).toUpperCase() + ".").join("-");
  return `${prenom} ${mots.slice(1).join(" ")}`;
}

/* `groupeDepute` : le groupe du député, quand l'écran le connaît ; l'avatar est alors le même que sur sa fiche. */
export function Decideurs({ maire, depute, circo, titre = "Vos décideurs", groupeDepute = null }: {
  maire: string | null; depute: string | null; circo: number | null; titre?: string; groupeDepute?: string | null;
}) {
  const gens = [
    maire ? { nom: maire, role: "Maire", echelon: "ville" as const, niveau: "Votre commune", institution: "Conseil municipal" } : null,
    depute && circo ? { nom: depute, role: `Député, ${ordinal(circo)} circ.`, echelon: "france" as const, niveau: "L'Assemblée nationale", institution: "Assemblée nationale" } : null,
  ].filter(Boolean) as { nom: string; role: string; echelon: "ville" | "france"; niveau: string; institution: string }[];
  if (!gens.length) return null;
  return (
    <View style={{ gap: PAS * 2 }}>
      <Text style={TYPO.etiquette} accessibilityRole="header">{titre}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: PAS * 5, rowGap: PAS * 2 }}>
        {gens.map(g => (
          <Pression key={g.nom} etiquette={`${g.nom}, ${g.role} : ouvrir sa fiche`}
            onPress={() => router.push({ pathname: "/elu", params: { nom: g.nom, role: g.role, echelon: g.echelon, niveau: g.niveau, institution: g.institution, lieu: "" } })}
            style={{ flexDirection: "row", alignItems: "center", gap: PAS * 2, minHeight: 48 }}>
            <Avatar nom={g.nom} taille={36} echelon={g.echelon} groupe={g.echelon === "france" ? groupeDepute : null} />
            <View>
              <Text style={[TYPO.corps, { fontFamily: POLICE.titre }]}>{nomCourt(g.nom)}</Text>
              <Text style={[TYPO.micro, { color: couleurs.sourd }]}>{g.role}</Text>
            </View>
          </Pression>
        ))}
      </View>
    </View>
  );
}
