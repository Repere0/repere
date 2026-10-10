/* « DEPUIS VOTRE VISITE DU … » — PROPOSITION DU 08/10/2026, A VALIDER PAR LE PORTEUR.
 *
 * N'apparait que pour la commune que le lecteur a demande de retenir sur ce
 * telephone, et seulement si une visite precedente est connue (lib/memoire.ts :
 * le JOUR de la derniere ouverture, rien d'autre). Meme regle que le site
 * (@repere/core, nouveautesDepuis) : les faits dates apres cette visite, sans
 * recompter les deux reponses deja montrees, sans compter un fait date dans le
 * futur ; et quand rien n'a ete publie, on le dit.
 *
 * Ni compteur de visites, ni serie, ni badge : une date et une liste. */
import { dateFr, nouveautesDepuis, titreLisible } from "@repere/core";
import { StyleSheet, Text, View } from "react-native";
import { couleurs, OMBRE, PAS, RAYON, TYPO } from "../lib/theme";
import { typo } from "./reponse";

type Fait = { cle: string; quand: string; type: string; p?: { intitule: string }; sc?: { t: string }; e?: { t: string } };

const titreDe = (f: Fait) => f.type === "projet" ? f.p?.intitule : f.type === "vote" ? titreLisible(f.sc?.t || "") : f.e?.t;

export function Nouveautes({ faits, derniereVisite, exclus, nom }: { faits: Fait[]; derniereVisite: string | null; exclus: (string | undefined)[]; nom: string }) {
  if (!derniereVisite) return null;
  const n = nouveautesDepuis({ faits, derniereVisite, faitPrincipalCle: exclus.filter(Boolean), maintenant: new Date(), max: 3 });
  return (
    <View testID="nouveautes" style={s.carte}>
      <Text style={TYPO.etiquette} accessibilityRole="header">Depuis votre visite du {dateFr(n.seuil)}</Text>
      {n.rienDepuisVisite || !n.total ? (
        <Text style={s.phrase}>{typo(`Rien de nouveau : aucune décision datée n'a été publiée pour ${nom} entre-temps.`)}</Text>
      ) : (
        <>
          <Text style={s.phrase}>{typo(`${n.total} ${n.total > 1 ? "nouveautés publiées" : "nouveauté publiée"} pour ${nom}.`)}</Text>
          {(n.nouveautes as Fait[]).map(f => <Text key={f.cle} testID="nouveaute" style={TYPO.corps}>• {typo(titreDe(f) || "")}</Text>)}
          {n.total > n.nouveautes.length ? <Text style={TYPO.note}>{typo(`Et ${n.total - n.nouveautes.length} autre${n.total - n.nouveautes.length > 1 ? "s" : ""} plus bas, dans les écrans de détail.`)}</Text> : null}
        </>
      )}
      <Text style={TYPO.micro}>Cette date est gardée sur ce téléphone seulement, avec votre commune ; « Oublier » l'efface.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  carte: { backgroundColor: couleurs.carte, borderRadius: RAYON.carte, paddingHorizontal: PAS * 4, paddingVertical: PAS * 3, gap: PAS * 2, ...OMBRE },
  phrase: { ...TYPO.reponse, fontSize: 19, lineHeight: 25 },
});
