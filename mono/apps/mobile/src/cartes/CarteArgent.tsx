/* OU VA L'ARGENT DE LA COMMUNE — 30/09/2026 (lot M1).
 *
 * L'accueil promet « où va votre argent » ; cette carte le tient, au niveau de
 * la commune, avec les comptes publies par l'Observatoire des finances locales.
 * RIEN N'EST CALCULE ICI : l'exercice retenu et les rapports viennent de
 * deriverAujourdhui (@repere/core), les phrases de phrases.js — le site
 * (OuVaArgent.jsx) affiche les memes, mot pour mot. Chaque rapport porte ce
 * qu'il ne veut PAS dire, et la carte s'annonce comme un calcul (invariant 4).
 *
 * Trois absences, trois phrases (invariant 5) : aucun compte dans le fichier ;
 * comptes publies mais incoherents ; trop peu de montants pour traduire. */
import { View } from "react-native";
import {
  introRapports, sousTitreRapports, comptesAbsents, comptesInsuffisants,
  exercicesEcartes, phraseEcartes, comptesIncoherents,
} from "@repere/core";
import { Carte, Source, Texte, Vide } from "../lib/composants";
import { PAS } from "../lib/theme";
import type { Ouvert } from "../lib/useCommune";

type Rapport = { l: string; v: string; d: string };

export function CarteArgent({ d }: { d: Ouvert }) {
  const { fiche, nomCommune, exercice, srcComptes: src } = d;
  const rr: Rapport[] = d.rapportsComptes || [];
  const ecartes = exercicesEcartes(fiche, exercice);
  const ecartesPhrase = phraseEcartes(ecartes, nomCommune);
  return (
    <Carte echelon="ville" titre="Où va l'argent de la commune">
      {!exercice ? (
        ecartesPhrase
          ? <Vide {...comptesIncoherents(nomCommune, ecartesPhrase)} />
          : <Vide {...comptesAbsents(nomCommune)} />
      ) : rr.length < 2 ? (
        <Vide {...comptesInsuffisants(exercice.an)} />
      ) : (
        <>
          <Texte sourd>{sousTitreRapports(exercice.an, exercice.ex)}</Texte>
          <Texte sourd>{introRapports({ detailPlusBas: false })}</Texte>
          {rr.map((o, i) => (
            <View key={i} style={{ gap: PAS, paddingTop: PAS * 2 }}>
              <Texte sourd>{o.l}</Texte>
              <Texte fort>{o.v}</Texte>
              <Texte sourd>{o.d}</Texte>
            </View>
          ))}
          {ecartesPhrase ? <Texte sourd>{ecartesPhrase}</Texte> : null}
          <Source calcul producteur={src ? src.producteur : ""} licence={src ? src.licence : ""}
            maj={src ? src.maj : ""} url={src ? src.url : undefined} />
        </>
      )}
    </Carte>
  );
}
