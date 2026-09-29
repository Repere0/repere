/* QUI DECIDE DANS VOTRE COMMUNE — le maire et ses adjoints, tels que le
 * Repertoire national des elus les porte, avec la source datee. */
import { Text } from "react-native";
import { Carte, Source, Texte, Vide } from "../lib/composants";
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
          {typeof fiche.adjoints === "number" ? (
            <Texte sourd>
              {fiche.adjoints === 0
                ? "Le répertoire ne compte aucun adjoint pour cette commune."
                : `${fiche.adjoints} adjoint${fiche.adjoints > 1 ? "s" : ""} au maire, selon le répertoire.`}
            </Texte>
          ) : null}
        </>
      ) : (
        <Vide titre={`Le Répertoire national des élus ne porte pas de maire pour ${nomCommune}.`}
          corps="Ce n'est pas la preuve que la commune n'en a pas : c'est la source qui ne le dit pas." />
      )}
      {srcElus ? <Source producteur={srcElus.producteur} licence={srcElus.licence} maj={srcElus.maj} url={srcElus.url} /> : null}
    </Carte>
  );
}
