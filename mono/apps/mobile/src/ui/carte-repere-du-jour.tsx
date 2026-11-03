/* LE REPÈRE DU JOUR (V51, 03/11/2026) — trois faits sourcés, en tête de « Chez vous ».
 *
 * Les faits sont calculés dans @repere/core (faitsDuJour) : cette carte ne fait
 * qu'afficher. Un fait sans source affichable n'est PAS montré : aucun chiffre sans
 * sa source (invariant 4). Sans fait du tout, la carte ne s'affiche pas, plutôt
 * qu'une carte vide. Le partage porte le texte du fait, son lien et sa source. */
import { Text, View } from "react-native";
import { Carte } from "../lib/composants";
import { PAS, TYPO } from "../lib/theme";
import { PastilleSource, type InfoSource } from "./source";
import { BoutonPartageTexte, ligneSource } from "./partage/partager-texte";

/* Forme produite par faitsDuJour (@repere/core, JavaScript : les types sont élargis). */
export type FaitDuJour = {
  id: string;
  categorie: string;
  source: string;
  calcul: boolean;
  texte: string | null;
};

export function CarteReperDuJour({ faits, sources, chemin }: {
  faits: FaitDuJour[];
  sources: Record<string, InfoSource | null>;
  chemin: string;
}) {
  const affichables = faits
    .filter(f => !!f.texte)
    .map(f => ({ f: { ...f, texte: f.texte as string }, src: sources[f.source] ?? null }))
    .filter((x): x is { f: FaitDuJour & { texte: string }; src: InfoSource } => x.src !== null && !!x.src.producteur);
  if (affichables.length === 0) return null;
  return (
    <Carte echelon="ville" titre="Le Repère du jour">
      <View style={{ gap: PAS * 3 }}>
        {affichables.map(({ f, src }) => (
          <View key={f.id} style={{ gap: PAS }}>
            <Text style={TYPO.corps}>{f.texte}</Text>
            <PastilleSource court source={src} />
            <View style={{ alignItems: "flex-start" }}>
              <BoutonPartageTexte titre={f.texte} chemin={chemin} source={ligneSource(src)} />
            </View>
          </View>
        ))}
      </View>
    </Carte>
  );
}
