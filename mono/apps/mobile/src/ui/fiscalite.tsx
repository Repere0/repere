/* LES TAUX DE LA COMMUNE, DANS « CE QUE VOUS PAYEZ À LA COMMUNE » — 20/10/2026.
 *
 * Lit le paquet départemental publié (mono/data/fiscalite/<dep>.json) et ne montre
 * que le taux de la commune choisie. Quatre cas, chacun avec sa phrase :
 *   - taux publié : la valeur, la source et sa date ;
 *   - commune absente du paquet : « la source ne publie pas le taux de cette commune » ;
 *   - paquet absent ou illisible : « les taux ne sont pas disponibles sur cet appareil » ;
 *   - paquet gardé d'une publication précédente : le libellé le dit (invariant 9).
 * Aucune donnée n'est recalculée ici : ce composant ne fait que lire. */
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { dateFr } from "@repere/core";
import { chargerFiscalite } from "../lib/donnees";
import { Source } from "../lib/composants";
import { TYPO } from "../lib/theme";

type Taux = { tfb: number; teom: number | null; th: number | null };
type Source0 = { producteur?: string; licence?: string; mis_a_jour_le?: string; url?: string };
type Lu = { attente: true } | { attente: false; taux: Taux | null; source: Source0 | null; perime: boolean };

const pourcent = (n: number) => `${n.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} %`;

export function TauxCommune({ dep, insee }: { dep: string; insee: string }) {
  const [lu, setLu] = useState<Lu>({ attente: true });

  useEffect(() => {
    let vivant = true;
    chargerFiscalite(dep)
      .then(r => {
        if (!vivant) return;
        const paquet = r && r.donnees ? (r.donnees as { communes?: Record<string, Taux>; source?: Source0 }) : null;
        const taux = paquet && paquet.communes && paquet.communes[insee] ? paquet.communes[insee] : null;
        setLu({ attente: false, taux, source: paquet && paquet.source ? paquet.source : null, perime: !!(r && r.perime) });
      })
      .catch(() => { if (vivant) setLu({ attente: false, taux: null, source: null, perime: false }); });
    return () => { vivant = false; };
  }, [dep, insee]);

  if (lu.attente) return <Text style={TYPO.corps}>Lecture des taux de la commune…</Text>;
  if (!lu.source) {
    return <Text style={TYPO.corps}>Les taux de la commune ne sont pas disponibles sur cet appareil : la source n'a pas pu être lue.</Text>;
  }
  if (!lu.taux) {
    return (
      <View style={{ gap: 6 }}>
        <Text style={TYPO.corps}>La source ne publie pas le taux de cette commune.</Text>
        <Source producteur={lu.source.producteur} licence={lu.source.licence}
          maj={lu.source.mis_a_jour_le ? dateFr(lu.source.mis_a_jour_le) : undefined} url={lu.source.url} />
      </View>
    );
  }
  return (
    <View style={{ gap: 6 }}>
      {lu.perime ? (
        <Text style={TYPO.note}>Publication précédente : la dernière publication n'a pas pu être vérifiée.</Text>
      ) : null}
      <Text style={TYPO.reponse}>Taxe foncière sur les propriétés bâties : {pourcent(lu.taux.tfb)}.</Text>
      <Text style={TYPO.corps}>
        {lu.taux.teom !== null
          ? `Taxe d'enlèvement des ordures ménagères : ${pourcent(lu.taux.teom)}.`
          : "La source ne publie pas de taux d'ordures ménagères pour cette commune."}
      </Text>
      <Source producteur={lu.source.producteur} licence={lu.source.licence}
        maj={lu.source.mis_a_jour_le ? dateFr(lu.source.mis_a_jour_le) : undefined} url={lu.source.url} />
    </View>
  );
}
