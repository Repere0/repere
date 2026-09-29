/* QUI DECIDE DANS VOTRE COMMUNE — le maire et ses adjoints, tels que le
 * Repertoire national des elus les porte, avec la source datee. */
import { Text } from "react-native";
import { phraseAdjoints, MAIRE_ABSENT, RNE_URL } from "@repere/core";
import { Carte, Segments, Source, Texte, Vide } from "../lib/composants";
import type { Ouvert } from "../lib/useCommune";

export function CarteMaire({ fiche, nomCommune, srcElus }: { fiche: Ouvert; nomCommune: string; srcElus: Ouvert }) {
  const maire = fiche.maire;
  return (
    <Carte echelon="ville" titre="Qui décide dans votre commune">
      {maire && maire.nom ? (
        <>
          <Texte>
            <Text style={{ fontWeight: "700" }}>{maire.nom}</Text> est {maire.fonction === "Maire" || !maire.fonction ? "maire" : String(maire.fonction).toLowerCase()} de {nomCommune}.
          </Texte>
          {/* Les trois cas (adjoints / compte inconnu / aucun) : phrases du site. */}
          <Texte sourd><Segments s={phraseAdjoints(fiche.adjoints, maire.nom)} /></Texte>
        </>
      ) : (
        <Vide titre={MAIRE_ABSENT.titre} corps={MAIRE_ABSENT.corps}
          lien={{ texte: "Répertoire national des élus", url: RNE_URL }} />
      )}
      {srcElus ? <Source producteur={srcElus.producteur} licence={srcElus.licence} maj={srcElus.maj} url={srcElus.url} /> : null}
    </Carte>
  );
}
