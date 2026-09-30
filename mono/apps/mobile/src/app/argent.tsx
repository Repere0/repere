/* « OÙ VA L'ARGENT DE … ? » — UNE QUESTION, UN ECRAN (refonte du 30/09/2026).
 *
 * Niveau 2 : chaque rapport est un visuel (part de 100 €, mois de recettes,
 * deux exercices cote a cote) avec sa valeur ecrite. Niveau 3 : « Ce que ça ne
 * veut pas dire », la phrase du site, ouverte d'un geste. Niveau 4 : la source
 * complete en bas, et la methode de calcul dans la feuille de source.
 *
 * Les nombres viennent de chiffresComptes / rapports / evolution (@repere/core),
 * les phrases de phrases-comptes.js : le site ecrit les memes. Chaque paire de
 * barres « d'un exercice a l'autre » a sa propre echelle, et c'est ecrit. */
import { Text, View } from "react-native";
import { Stack } from "expo-router";
import {
  chiffresComptes, comptesAbsents, comptesIncoherents, comptesInsuffisants, diffEuros, eurosArrondis,
  evolution, exercicesEcartes, financementProjet, INTRO_EVOLUTION, introRapports, noteRattachement,
  NOTE_EVOLUTION, NOTE_FINANCEMENT, nomDispositif, perimetreChange, phraseEcartes, phraseProjetLocal,
  rapports, sousTitreRapports, euros,
} from "@repere/core";
import { Carte, Source, Vide } from "../lib/composants";
import { PROJETS_PAS_ARRIVES, projetsAucun } from "../lib/absences";
import { srcComptes, srcProjets } from "../lib/sources";
import { useCommuneChoisie } from "../lib/useCommune";
import { PAS, TYPO } from "../lib/theme";
import { AvecDonnees, Page, Question } from "../ui/page";
import { PastilleSource } from "../ui/source";
import { BarrePart, Compteur, DeuxAnnees, Depli, Financement, Mois } from "../ui/visuels";

type Rapport = { l: string; v: string; d: string };
type Projet = { annee: number; dispositif: string; intitule: string; subvention: number; cout?: number; ancien_code?: string };

function PasCeQueCaDit({ r }: { r?: Rapport }) {
  if (!r) return null;
  return <Depli titre="Ce que ça ne veut pas dire"><Text style={TYPO.corps}>{r.d}</Text></Depli>;
}

export default function Argent() {
  const { reessayer } = useCommuneChoisie();
  return (
    <AvecDonnees rendu={r => {
      const { d } = r;
      const nom = d.nomCommune;
      const ex = d.exercice;
      const rr: Rapport[] = ex ? rapports(ex.ex) : [];
      const ch = ex ? chiffresComptes(ex.ex) : null;
      const rap = (re: RegExp) => rr.find(o => re.test(o.v));
      const ecartes = exercicesEcartes(d.fiche, ex);
      const phraseEc = phraseEcartes(ecartes, nom);
      const agregats = (r.index && r.index.agregats) || [];
      const evo = evolution(d.fiche, agregats);
      const listeProjets: Projet[] = r.projetsLus
        ? ((d.faits || []).filter((x: { type: string }) => x.type === "projet").map((x: { p: Projet }) => x.p) as Projet[])
        : [];
      return (
        <Page>
          <Stack.Screen options={{ title: "Où va l'argent" }} />
          <Question etiquette="Où va l'argent" question={`Où va l'argent de ${nom} ?`}
            sous={ex ? sousTitreRapports(ex.an, ex.ex) : undefined} />

          {!ex ? (
            <Vide {...(phraseEc ? comptesIncoherents(nom, phraseEc) : comptesAbsents(nom))} />
          ) : rr.length < 2 || !ch ? (
            <Vide {...comptesInsuffisants(ex.an)} />
          ) : (
            <>
              <Text style={TYPO.note}>{introRapports({ detailPlusBas: false })}</Text>

              {ch.parJour !== null ? (
                <Carte echelon="ville" titre="Chaque jour, en moyenne">
                  <Compteur valeur={ch.parJour} suffixe="€ par jour" />
                  <PasCeQueCaDit r={rap(/par jour/)} />
                </Carte>
              ) : null}

              {ch.partSalaires !== null || ch.partInvestissement !== null ? (
                <Carte echelon="ville" titre="Sur 100 € dépensés">
                  {ch.partSalaires !== null ? <BarrePart part={ch.partSalaires} libelle="Salaires des agents" valeur={rap(/salaires/)?.v || ""} /> : null}
                  <PasCeQueCaDit r={rap(/salaires/)} />
                  {ch.partInvestissement !== null ? <BarrePart part={ch.partInvestissement} libelle="Travaux et équipements" valeur={rap(/investissement/)?.v || ""} delai={120} /> : null}
                  <PasCeQueCaDit r={rap(/investissement/)} />
                  <Text style={TYPO.micro}>Deux parts du même total, chacune sur 100 € : elles ne s'additionnent pas forcément à 100.</Text>
                </Carte>
              ) : null}

              {ch.partImpots !== null ? (
                <Carte echelon="ville" titre="Sur 100 € encaissés">
                  <BarrePart part={ch.partImpots} libelle="Impôts et taxes" valeur={rap(/impôts/)?.v || ""} />
                  <PasCeQueCaDit r={rap(/impôts/)} />
                </Carte>
              ) : null}

              {ch.detteMois !== null ? (
                <Carte echelon="ville" titre="Son encours de dette">
                  <Text style={TYPO.reponse}>{rap(/mois de recettes/)?.v}</Text>
                  <Mois mois={ch.detteMois} />
                  <Text style={TYPO.micro}>Une case = un mois de recettes de la commune.</Text>
                  <PasCeQueCaDit r={rap(/mois de recettes/)} />
                </Carte>
              ) : null}

              {phraseEc ? <Text style={TYPO.note}>{phraseEc}</Text> : null}
              <Source calcul producteur={d.srcComptes?.producteur} licence={d.srcComptes?.licence} maj={d.srcComptes?.maj} url={d.srcComptes?.url} />
              <PastilleSource source={srcComptes(d)} />
            </>
          )}

          {/* D'UN EXERCICE A L'AUTRE : jamais deux territoires, jamais un jugement */}
          {evo ? (
            evo.perimetreChange ? (
              <Vide {...perimetreChange(evo, nom)} />
            ) : (
              <Carte echelon="ville" titre={`D'un exercice à l'autre · ${evo.an1} → ${evo.an2}`}>
                <Text style={TYPO.note}>{INTRO_EVOLUTION}</Text>
                {[1, 0, 2].map(i => evo.lignes[i]).filter(l => l && l.m1 !== null && l.m2 !== null).map((l: { libelle: string; m1: number; m2: number; diff: number }) => (
                  <DeuxAnnees key={l.libelle} libelle={l.libelle} an1={evo.an1} an2={evo.an2} m1={l.m1} m2={l.m2}
                    texte1={eurosArrondis(l.m1)} texte2={eurosArrondis(l.m2)} diffTexte={diffEuros(l.diff)} />
                ))}
                <Text style={TYPO.micro}>Chaque paire de barres a sa propre échelle : on compare une ligne à elle-même, jamais deux lignes entre elles.</Text>
                <Text style={TYPO.note}>{NOTE_EVOLUTION}</Text>
              </Carte>
            )
          ) : null}

          {/* LES PROJETS FINANCES PAR L'ETAT, dans l'ordre du temps */}
          <View style={{ gap: PAS * 3 }}>
            <Text style={TYPO.question} accessibilityRole="header">Les projets aidés par l'État</Text>
            {!r.projetsLus ? (
              <Vide {...PROJETS_PAS_ARRIVES} action="Réessayer" onAction={reessayer} />
            ) : !listeProjets.length ? (
              <Vide {...projetsAucun(nom)} />
            ) : (
              <>
                {listeProjets.map((p, i) => {
                  const f = financementProjet(p);
                  return (
                    <Carte key={i} echelon="ville" titre={`Exercice ${p.annee} · ${p.dispositif}`}>
                      <Text style={TYPO.reponse}>{p.intitule}</Text>
                      <Text style={TYPO.corps}>{phraseProjetLocal(p, nom)}</Text>
                      {noteRattachement(p) ? <Text style={TYPO.note}>{noteRattachement(p)}</Text> : null}
                      {f && f.cout && f.partPct !== null ? (
                        <Financement subvention={f.subvention} cout={f.cout} partPct={f.partPct}
                          subventionTexte={`${euros(f.subvention)} sur ${euros(f.cout)}`}
                          resteTexte={`${euros(f.reste as number)} non détaillés par la source`} />
                      ) : null}
                      <Depli titre={`Qu'est-ce que la ${p.dispositif} ?`}>
                        <Text style={TYPO.corps}>{nomDispositif(r.projets, p.dispositif)} : l'une des dotations de soutien à l'investissement des collectivités recensées par la Direction générale des collectivités locales.</Text>
                        <Text style={TYPO.note}>{NOTE_FINANCEMENT}</Text>
                      </Depli>
                    </Carte>
                  );
                })}
                <Source producteur={d.srcProjets?.producteur} licence={d.srcProjets?.licence} maj={d.srcProjets?.mis_a_jour_le} url={d.srcProjets?.url} />
                <PastilleSource source={srcProjets(d, true)} />
              </>
            )}
          </View>
        </Page>
      );
    }} />
  );
}
