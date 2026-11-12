/* LES RÈGLES DE LA PRÉSIDENTIELLE 2027, EN FICHES (maquette Stitch « Règlement & Scrutin », 09/11/2026).
 * Depuis le 11/11/2026 : une section de la page Présidentielle 2027, plus un écran à part.
 *
 * Quatre fiches, une à la fois : les parrainages, les deux tours, les plafonds de dépenses, les médias.
 * Chaque fiche porte son texte de référence. Vérifié le 09/11/2026 :
 * - parrainages : loi n° 62-1292 du 6 novembre 1962, article 3 (500 élus, au moins 30 départements ou
 *   collectivités d'outre-mer, pas plus d'un dixième du même département ; publication par le Conseil
 *   constitutionnel). La maquette citait « articles 6, 7 et 58 de la Constitution » : faux pour cette règle ;
 *   elle annonçait aussi « 42 000+ élus éligibles », chiffre non vérifié, donc non écrit ;
 * - deux tours : Constitution, article 7 ; dates : lib/elections.ts (service-public.gouv.fr, 30/10/2026) ;
 * - plafonds : page « Élection du Président de la République 2027 » de la CNCCFP, lue le 09/11/2026 ;
 * - médias : les règles de l'Arcom pour 2027 ne sont pas vérifiées ici. La fiche le dit (doctrine du vide).
 * Rien ici n'est un chiffre de l'application : ce sont des règles, citées. */
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { dateFr } from "@repere/core";
import { LienSortant } from "../lib/composants";
import { ELECTIONS } from "../lib/elections";
import { ACCENTS, CIBLE, couleurs, JAUGE, PAS, POLICE, RAYON, TYPO } from "../lib/theme";
import { EnClair, Onglets } from "./stitch";
import { LigneIcone } from "./ligne-icone";
import { Depli } from "./visuels";
import { enfonce } from "./mouvement";

export const REGLES_VERIFIEES_LE = "2026-11-09";
const LOI_1962 = "https://www.cantal.gouv.fr/contenu/telechargement/11293/95797/file/loi_62-1292_du_6_nov_1962_modifiee_relative_a_l_election_du_pt_de_la_republique-2.pdf";
const CONSTITUTION = "https://www.conseil-constitutionnel.fr/le-bloc-de-constitutionnalite/texte-integral-de-la-constitution-du-4-octobre-1958-en-vigueur";
const CNCCFP = "https://cnccfp.fr/elections/election-du-president-de-la-republique-2027/";
const ARCOM = "https://www.arcom.fr/";

type Fiche = "parrainages" | "tours" | "plafonds" | "medias";
const FICHES: { cle: Fiche; texte: string }[] = [
  { cle: "parrainages", texte: "500 élus" },
  { cle: "tours", texte: "2 tours" },
  { cle: "plafonds", texte: "Plafonds" },
  { cle: "medias", texte: "Médias" },
];

function Grand({ valeur, legende }: { valeur: string; legende: string }) {
  return (
    <View accessible accessibilityLabel={`${valeur} : ${legende}`}>
      <Text style={[TYPO.chiffre, { color: ACCENTS.autorite }]}>{valeur}</Text>
      <Text style={TYPO.etiquette}>{legende}</Text>
    </View>
  );
}

export function Regles2027() {
  const [fiche, setFiche] = useState<Fiche>("parrainages");
  const i = FICHES.findIndex(f => f.cle === fiche);
  const pres = ELECTIONS.find(e => e.type === "presidentielle" && e.date);
  /* Le second tour : quatorze jours après le premier (Constitution, article 7). */
  const second = pres && pres.date ? (() => { const [a, m, j] = pres.date.split("-").map(Number); return new Date(Date.UTC(a, m - 1, j + 14)).toISOString().slice(0, 10); })() : null;
  return (
    <View style={{ gap: PAS * 3 }}>
      <Onglets etiquette="Fiches des règles" valeurs={FICHES} actif={fiche} choisir={setFiche} />

      <View style={{ gap: PAS * 3, padding: PAS * 5, borderRadius: RAYON.carte, backgroundColor: couleurs.carte }}>
        {fiche === "parrainages" ? (
          <>
            <Grand valeur="500" legende="élus doivent présenter un candidat" />
            <LigneIcone icone="map-outline" titre="D'au moins 30 départements ou collectivités d'outre-mer" />
            <Depli titre="Le texte complet"><Text style={TYPO.corps}>Ces élus (maires, parlementaires, conseillers départementaux et régionaux, entre autres) doivent venir d'au moins 30 départements ou collectivités d'outre-mer.</Text></Depli>
            <View style={{ gap: PAS }} accessible accessibilityLabel="Au plus 50 des 500 présentations, soit un dixième, peuvent venir d'un même département.">
              <View style={{ flexDirection: "row", height: 9, borderRadius: 5, overflow: "hidden", backgroundColor: couleurs.voile }}>
                <View style={{ width: "10%", backgroundColor: JAUGE.salaires }} />
              </View>
              <Text style={TYPO.micro}>Au plus 50 sur 500 (un dixième) venant d'un même département.</Text>
            </View>
            <EnClair texte="Le Conseil constitutionnel publie le nom des élus qui présentent un candidat, au fur et à mesure, au moins deux fois par semaine." />
            <LienSortant url={LOI_1962} texte="Loi n° 62-1292 du 6 novembre 1962, article 3 (copie de la préfecture du Cantal)" />
          </>
        ) : null}
        {fiche === "tours" ? (
          <>
            <Grand valeur="2" legende="tours au plus" />
            <LigneIcone icone="checkmark-done-outline" titre="Élu dès le 1er tour : majorité absolue des suffrages exprimés" />
            <LigneIcone icone="repeat-outline" titre="Sinon : un 2e tour 14 jours plus tard, entre les deux premiers" />
            <Depli titre="Le texte complet"><Text style={TYPO.corps}>Est élu au premier tour le candidat qui obtient la majorité absolue des suffrages exprimés. Sinon, un second tour a lieu quatorze jours plus tard entre les deux candidats arrivés en tête, après d'éventuels retraits.</Text></Depli>
            {pres && pres.date ? <Text style={[TYPO.corps, { fontFamily: POLICE.texteGras }]}>Premier tour : {dateFr(pres.date)}.{second ? ` Second tour : ${dateFr(second)}.` : ""}</Text> : null}
            <LienSortant url={CONSTITUTION} texte="Constitution, article 7 (Conseil constitutionnel)" />
          </>
        ) : null}
        {fiche === "plafonds" ? (
          <>
            <Grand valeur="16,9 M€" legende="au plus par candidat au premier tour" />
            <LigneIcone icone="cash-outline" titre="22,5 M€ au plus par candidat au second tour" />
            <LigneIcone icone="calendar-outline" titre="Financement de campagne ouvert depuis le 1er avril 2026" />
            <Depli titre="Le texte complet"><Text style={TYPO.corps}>22,5 millions d'euros au plus pour chacun des deux candidats présents au second tour. La période de financement de la campagne est ouverte depuis le 1er avril 2026.</Text></Depli>
            <EnClair texte="Une commission indépendante, la CNCCFP, contrôle les comptes de campagne de chaque candidat." />
            <LienSortant url={CNCCFP} texte="CNCCFP, élection du Président de la République 2027 (lue le 9 novembre 2026)" />
          </>
        ) : null}
        {fiche === "medias" ? (
          <>
            <Text style={TYPO.reponse}>Les règles de temps de parole à la radio et à la télévision pour 2027 ne sont pas encore vérifiées par Repère.</Text>
            <Text style={TYPO.corps}>C'est l'Arcom, l'autorité de régulation de l'audiovisuel, qui les fixe et les publie.</Text>
            <LienSortant url={ARCOM} texte="Le site de l'Arcom" />
          </>
        ) : null}
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: PAS * 2 }}>
        <Pressable disabled={i === 0} onPress={() => setFiche(FICHES[i - 1].cle)} accessibilityRole="button" accessibilityLabel="Fiche précédente"
          accessibilityState={{ disabled: i === 0 }}
          style={({ pressed }) => ({ minHeight: CIBLE, paddingHorizontal: PAS * 4, justifyContent: "center", borderRadius: RAYON.pastille, backgroundColor: couleurs.voile, ...enfonce(pressed) })}>
          <Text style={[TYPO.corps, { fontFamily: POLICE.texteGras, color: i === 0 ? couleurs.sourd : couleurs.encre }]}>‹ Précédent</Text>
        </Pressable>
        <View style={{ flexDirection: "row", gap: PAS * 1.5 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {FICHES.map((f, k) => <View key={f.cle} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: k === i ? ACCENTS.autorite : couleurs.trait }} />)}
        </View>
        <Pressable disabled={i === FICHES.length - 1} onPress={() => setFiche(FICHES[i + 1].cle)} accessibilityRole="button" accessibilityLabel="Fiche suivante"
          accessibilityState={{ disabled: i === FICHES.length - 1 }}
          style={({ pressed }) => ({ minHeight: CIBLE, paddingHorizontal: PAS * 4, justifyContent: "center", borderRadius: RAYON.pastille, backgroundColor: couleurs.voile, ...enfonce(pressed) })}>
          <Text style={[TYPO.corps, { fontFamily: POLICE.texteGras, color: i === FICHES.length - 1 ? couleurs.sourd : couleurs.encre }]}>Suivant ›</Text>
        </Pressable>
      </View>
      <Text style={TYPO.micro}>Règles vérifiées le {dateFr(REGLES_VERIFIEES_LE)}.</Text>
    </View>
  );
}
