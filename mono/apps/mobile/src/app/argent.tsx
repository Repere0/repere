/* « OÙ VA L'ARGENT DE … ? » — spike visuel du 30/09/2026.
 *
 * Ordre de chaque bloc : phrase humaine -> chiffre cle -> visuel -> « En
 * clair » -> ⓘ Source -> repli (« Ce que ça ne veut pas dire »). Les
 * montants par habitant sont ceux que l'OFGL publie (aucun calcul) ; les parts
 * « sur 100 € » sont des calculs de Repere, annonces comme tels dans la
 * feuille de source et dans « Détails du calcul ».
 *
 * Mots courants d'abord : « dette » (et non « encours de dette »), « en 2025 »
 * (et non « exercice 2025 »). Les phrases partagees avec le site (rapports,
 * sous-titre, calcul) restent intactes au niveau 3, pour que les deux supports
 * disent la meme chose. */
import { Text, View } from "react-native";
import { Stack } from "expo-router";
import {
  chiffresComptes, comptesAbsents, comptesIncoherents, comptesInsuffisants, diffEuros, eurosArrondis,
  evolution, exercicesEcartes, financementProjet, INTRO_EVOLUTION, introRapports, montantCourt, noteRattachement,
  NOTE_EVOLUTION, NOTE_FINANCEMENT, nomDispositif, parHabitant, partReperee, perimetreChange, phraseEcartes,
  phraseProjetLocal, rapports, sousTitreRapports, euros, CALCUL_REPERE,
} from "@repere/core";
import { Carte, Vide } from "../lib/composants";
import { PROJETS_PAS_ARRIVES, projetsAucun } from "../lib/absences";
import { srcComptes, srcComptesPublies, srcProjets } from "../lib/sources";
import { useCommuneChoisie } from "../lib/useCommune";
import { couleurs, PAS, TYPO } from "../lib/theme";
import { AvecDonnees, Page, Question } from "../ui/page";
import { PastilleSource } from "../ui/source";
import { Emoji, Resume } from "../ui/resume";
import { BarrePart, Compteur, DeuxAnnees, Depli, Financement, Mois } from "../ui/visuels";

type Rapport = { l: string; v: string; d: string };
type Projet = { annee: number; dispositif: string; intitule: string; subvention: number; cout?: number; ancien_code?: string };

/* Le sujet entre dans le titre : deux replis « Ce que ça ne veut pas dire »
   cote a cote avaient le meme nom accessible (spike du 30/09/2026). */
function PasCeQueCaDit({ r, sujet }: { r?: Rapport; sujet: string }) {
  if (!r) return null;
  return <Depli titre={`Ce que ça ne veut pas dire (${sujet})`}><Text style={TYPO.corps}>{r.d}</Text></Depli>;
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
      const hab = ex ? parHabitant(ex.ex) : null;
      const rap = (re: RegExp) => rr.find(o => re.test(o.v));
      const ecartes = exercicesEcartes(d.fiche, ex);
      const phraseEc = phraseEcartes(ecartes, nom);
      const agregats = (r.index && r.index.agregats) || [];
      const evo = evolution(d.fiche, agregats);
      const listeProjets: Projet[] = r.projetsLus
        ? ((d.faits || []).filter((x: { type: string }) => x.type === "projet").map((x: { p: Projet }) => x.p) as Projet[])
        : [];
      const dep = ch && ch.depenses !== null ? montantCourt(ch.depenses) : null;
      const dette = ch && ch.dette !== null ? montantCourt(ch.dette) : null;
      return (
        <Page>
          <Stack.Screen options={{ title: "Où va l'argent" }} />
          <Question emoji="💶" etiquette="L'argent de la commune" question={`Où va l'argent de ${nom} ?`} />

          {!ex ? (
            <Vide {...(phraseEc ? comptesIncoherents(nom, phraseEc) : comptesAbsents(nom))} />
          ) : rr.length < 2 || !ch ? (
            <Vide {...comptesInsuffisants(ex.an)} />
          ) : (
            <>
              {/* COMBIEN */}
              <Carte echelon="ville" titre={`Ce que ${nom} a dépensé en ${ex.an}`}>
                <Resume phrase={dep ? `${dep.texte} au total sur l'année.` : ""}
                  chiffre={hab && hab.depenses !== null ? `${hab.depenses.toLocaleString("fr-FR")} €` : null}
                  legende="par habitant" />
                {/* Deux chiffres PUBLIES, donc une source sans « calcul ». La moyenne
                    par jour (un calcul) vit dans sa propre carte, plus bas, avec sa
                    pastille « Calculé par Repère » : la mettre ici l'aurait fait passer
                    pour publiee (invariant 4, relecture du 30/09/2026). */}
                <PastilleSource source={srcComptesPublies(d)} />
              </Carte>

              {/* OU VA CHAQUE 100 € */}
              {ch.partSalaires !== null || ch.partInvestissement !== null ? (
                <Carte echelon="ville" titre="Où va chaque 100 € dépensés">
                  <Resume phrase={ch.partSalaires !== null ? `Sur 100 € dépensés, ${ch.partSalaires} € vont aux salaires des agents.` : "Deux postes que la source permet de suivre."}
                    enClair="Le reste des dépenses n'est pas détaillé par la source.">
                    {ch.partSalaires !== null ? <BarrePart part={ch.partSalaires} libelle="Salaires des agents" valeur={rap(/salaires/)?.v || ""} /> : null}
                    {ch.partInvestissement !== null ? <BarrePart part={ch.partInvestissement} libelle="Travaux et équipements" valeur={rap(/investissement/)?.v || ""} delai={120} /> : null}
                  </Resume>
                  <PasCeQueCaDit r={rap(/salaires/)} sujet="salaires" />
                  <PasCeQueCaDit r={rap(/investissement/)} sujet="travaux et équipements" />
                  <PastilleSource source={srcComptes(d)} />
                </Carte>
              ) : null}

              {/* D'OU VIENT L'ARGENT */}
              {ch.partImpots !== null ? (
                <Carte echelon="ville" titre="D'où vient l'argent">
                  <Resume phrase={partReperee(ch.partImpots)
                      ? `${String(partReperee(ch.partImpots)).replace(/^./, (c: string) => c.toUpperCase())} de ce que ${nom} encaisse vient des impôts et taxes.`
                      : `Sur 100 € encaissés, ${ch.partImpots} € viennent des impôts et taxes.`}
                    enClair={partReperee(ch.partImpots) && rap(/impôts/)?.v ? `Sur 100 € encaissés, ${rap(/impôts/)?.v}.` : null}>
                    <BarrePart part={ch.partImpots} libelle="Impôts et taxes" valeur={rap(/impôts/)?.v || ""} />
                  </Resume>
                  <PasCeQueCaDit r={rap(/impôts/)} sujet="impôts" />
                  <PastilleSource source={srcComptes(d)} />
                </Carte>
              ) : null}

              {/* LA DETTE */}
              {ch.detteMois !== null && dette ? (
                <Carte echelon="ville" titre="Sa dette">
                  <Resume phrase={`${nom} doit encore rembourser ${dette.texte}.`}
                    /* « 7,6 mois de recettes » en corps d'affiche tenait sur deux lignes :
                       le nombre en grand, l'unite dans la legende, la phrase partagee
                       avec le site reste lisible d'un seul tenant. */
                    chiffre={(rap(/mois de recettes/)?.v || "").replace(/ de recettes$/, "") || null}
                    legende="de recettes : le temps qu'il faudrait pour rembourser si toutes ses recettes y passaient"
                    enClair={hab && hab.dette !== null ? `Soit ${hab.dette.toLocaleString("fr-FR")} € par habitant.` : null}>
                    <Mois mois={ch.detteMois} />
                    <Text style={TYPO.micro}>Une case = un mois de recettes de la commune.</Text>
                  </Resume>
                  <PasCeQueCaDit r={rap(/mois de recettes/)} sujet="dette" />
                  <PastilleSource source={srcComptes(d)} />
                </Carte>
              ) : null}

              {/* LE JOUR LE JOUR, POUR QUI VEUT LE VOIR COMPTER */}
              {ch.parJour !== null ? (
                <Carte echelon="ville" titre="Chaque jour, en moyenne">
                  <Compteur valeur={ch.parJour} suffixe="€ par jour" />
                  <PasCeQueCaDit r={rap(/par jour/)} sujet="dépense par jour" />
                  <PastilleSource source={srcComptes(d)} />
                </Carte>
              ) : null}

              {/* NIVEAU 3 : le calcul, pour qui veut aller au bout */}
              <Depli titre="Détails du calcul">
                <Text style={TYPO.note}>{sousTitreRapports(ex.an, ex.ex)}</Text>
                <Text style={TYPO.note}>{introRapports({ detailPlusBas: false })}</Text>
                <Text style={[TYPO.note, { fontWeight: "700" }]}>{CALCUL_REPERE}</Text>
                {phraseEc ? <Text style={TYPO.note}>{phraseEc}</Text> : null}
              </Depli>
            </>
          )}

          {/* CE QUI A CHANGE EN UN AN : jamais deux territoires, jamais un jugement */}
          {evo ? (
            evo.perimetreChange ? (
              <Vide {...perimetreChange(evo, nom)} />
            ) : (
              <Carte echelon="ville" titre={`Ce qui a changé entre ${evo.an1} et ${evo.an2}`}>
                <Text style={TYPO.note}>{INTRO_EVOLUTION}</Text>
                {[1, 0, 2].map(i => evo.lignes[i]).filter(l => l && l.m1 !== null && l.m2 !== null).map((l: { libelle: string; m1: number; m2: number; diff: number }) => (
                  <DeuxAnnees key={l.libelle} libelle={l.libelle} an1={evo.an1} an2={evo.an2} m1={l.m1} m2={l.m2}
                    texte1={eurosArrondis(l.m1)} texte2={eurosArrondis(l.m2)} diffTexte={diffEuros(l.diff)} />
                ))}
                <Text style={TYPO.micro}>Chaque paire de barres a sa propre échelle : on compare une ligne à elle-même, jamais deux lignes entre elles.</Text>
                <Depli titre="Ce que ça ne veut pas dire (évolution)"><Text style={TYPO.corps}>{NOTE_EVOLUTION}</Text></Depli>
                <PastilleSource source={srcComptes(d)} />
              </Carte>
            )
          ) : null}

          {/* LES PROJETS AIDES PAR L'ETAT */}
          <View style={{ gap: PAS * 3 }}>
            <View style={{ flexDirection: "row", gap: PAS * 2, alignItems: "center" }}>
              <Emoji c="🏗️" taille={24} />
              <Text style={[TYPO.question, { flex: 1 }]} accessibilityRole="header">Les projets aidés par l'État</Text>
            </View>
            {!r.projetsLus ? (
              <Vide {...PROJETS_PAS_ARRIVES} action="Réessayer" onAction={reessayer} />
            ) : !listeProjets.length ? (
              <Vide {...projetsAucun(nom)} />
            ) : (
              <>
                {listeProjets.map((p, i) => {
                  const f = financementProjet(p);
                  const cout = f && f.cout ? montantCourt(f.cout) : null;
                  return (
                    <Carte key={i} echelon="ville" titre={`${p.annee} · aide ${p.dispositif}`}>
                      <Text style={TYPO.reponse}>{p.intitule}</Text>
                      {f && f.partPct !== null && cout ? (
                        <Resume phrase={partReperee(f.partPct)
                          ? `L'État finance ${partReperee(f.partPct)} de ce projet de ${cout.texte}.`
                          : `Pour 100 € de ce projet de ${cout.texte}, ${f.partPct} € viennent de l'État.`}>
                          <Financement subvention={f.subvention} cout={f.cout as number} partPct={f.partPct}
                            subventionTexte={`${euros(f.subvention)} sur ${euros(f.cout as number)}`}
                            resteTexte={`${euros(f.reste as number)}, financement non détaillé par la source`} />
                        </Resume>
                      ) : null}
                      <Text style={TYPO.note}>{phraseProjetLocal(p, nom)}</Text>
                      {noteRattachement(p) ? <Text style={TYPO.note}>{noteRattachement(p)}</Text> : null}
                      <Depli titre={`Qu'est-ce que l'aide ${p.dispositif} ?`}>
                        <Text style={TYPO.corps}>{nomDispositif(r.projets, p.dispositif)} : l'une des aides de l'État à l'investissement des collectivités recensées par la Direction générale des collectivités locales.</Text>
                        <Text style={TYPO.note}>{NOTE_FINANCEMENT}</Text>
                      </Depli>
                    </Carte>
                  );
                })}
                <PastilleSource source={srcProjets(d, true)} />
              </>
            )}
          </View>
          <Text style={[TYPO.micro, { color: couleurs.sourd }]}>Repère ne compare jamais deux communes : chaque chiffre ne parle que de {nom}.</Text>
        </Page>
      );
    }} />
  );
}
