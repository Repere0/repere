/* « DERNIÈRES PUBLICATIONS » SUR L'ACCUEIL (V13, bloc D, 30/10/2026).
 *
 * Donner une raison de revenir sans compte ni traceur : montrer ce qui a change.
 * Source : uniquement ce qui est deja publie et date — les scrutins solennels du
 * catalogue (scrutins.json) et les faits de la redaction (evenements.json). Aucune
 * donnee nouvelle, aucun resume ecrit ici.
 *
 * REGLES :
 * - les trois entrees les plus recentes, par date decroissante, avec leur anciennete ;
 * - la carte n'apparait que si la plus recente a moins de 7 jours. Sinon elle est
 *   masquee : la brief demandait « Prochaine publication : [jour prevu] » si c'etait
 *   deductible, et aucun calendrier de publication n'existe dans les donnees ;
 * - la date affichee est celle du fait (le vote, la decision), dite comme telle, et non
 *   une date de publication par Repere, que les fichiers ne portent pas entree par entree.
 * L'accueil est toujours sombre : la carte lit la palette sombre. */
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { ageReleve, dateFr, titreLisible } from "@repere/core";
import { chargerCatalogueScrutins, chargerEvenements } from "../lib/donnees";
import { NEUTRES_PAR_MODE } from "../lib/palette";
import { PAS, RAYON } from "../lib/theme";
import { ilYa } from "./fraicheur";

const D = NEUTRES_PAR_MODE.sombre;
export const RECENT_JOURS = 7;

type Entree = { cle: string; d: string; quoi: string; texte: string };

export function dernieres(scrutins: { n: string; d: string; t: string }[], evenements: { id: string; d: string; t: string }[], n = 3): Entree[] {
  const tout: Entree[] = [
    ...scrutins.filter(x => /^\d{4}-\d{2}-\d{2}$/.test(x.d)).map(x => ({ cle: "s" + x.n, d: x.d, quoi: "Vote à l'Assemblée", texte: titreLisible(x.t) })),
    /* Les faits de la redaction qui sont aussi des scrutins ne sont pas comptes deux fois. */
    ...evenements.filter(x => /^\d{4}-\d{2}-\d{2}$/.test(x.d) && !x.id.startsWith("scrutin-")).map(x => ({ cle: "e" + x.id, d: x.d, quoi: "Fait publié", texte: x.t })),
  ];
  return tout.sort((a, b) => (a.d < b.d ? 1 : a.d > b.d ? -1 : a.cle < b.cle ? 1 : -1)).slice(0, n);
}

export function DernieresPublications() {
  const [liste, setListe] = useState<Entree[]>([]);
  useEffect(() => {
    let vivant = true;
    Promise.all([chargerCatalogueScrutins(), chargerEvenements()]).then(([c, e]) => {
      if (!vivant) return;
      const sc = c.donnees ? ((c.donnees as { scrutins?: { n: string; d: string; t: string }[] }).scrutins || []) : [];
      const ev = e.donnees ? ((e.donnees as { r?: { id: string; d: string; t: string }[] }).r || []) : [];
      setListe(dernieres(sc, ev));
    }).catch(() => {});
    return () => { vivant = false; };
  }, []);
  const age0 = liste.length ? ageReleve(liste[0].d) : null;
  if (age0 === null || age0 < 0 || age0 >= RECENT_JOURS) return null;
  return (
    <View testID="dernieres-publications" style={{ gap: PAS * 3, padding: PAS * 4, borderRadius: RAYON.carte, backgroundColor: D.carte, borderWidth: 1, borderColor: D.trait }}>
      <Text style={{ fontSize: 13, fontWeight: "700", color: D.sourd }} accessibilityRole="header">Dernières publications</Text>
      {liste.map(x => {
        const age = ageReleve(x.d);
        return (
          <View key={x.cle} style={{ gap: 2 }}>
            <Text style={{ fontSize: 13, color: D.sourd }}>{x.quoi} · {dateFr(x.d)}{age !== null && age >= 0 ? ` · ${ilYa(age)}` : ""}</Text>
            <Text style={{ fontSize: 16, lineHeight: 22, color: D.encre, fontWeight: "600" }} numberOfLines={2}>{x.texte}</Text>
          </View>
        );
      })}
    </View>
  );
}
