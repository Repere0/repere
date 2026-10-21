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
import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { Stack } from "expo-router";
import {
  chiffresComptes, comptesAbsents, comptesIncoherents, comptesInsuffisants, diffEuros, eurosArrondis,
  evolution, exercicesEcartes, financementProjet, INTRO_EVOLUTION, introRapports, montantCourt, noteRattachement,
  NOTE_EVOLUTION, NOTE_FINANCEMENT, nomDispositif, parHabitant, partReperee, perimetreChange, phraseEcartes,
  phraseProjetLocal, rapports, sousTitreRapports, euros, montantEnMots, CALCUL_REPERE, LIBELLES,
  OFGL_URL, phraseCalculPart, valeur,
} from "@repere/core";
import { Carte, Vide } from "../lib/composants";
import { PROJETS_PAS_ARRIVES, projetsAucun } from "../lib/absences";
import { srcComptes, srcComptesPublies, srcProjets } from "../lib/sources";
import { useCommuneChoisie } from "../lib/useCommune";
import { couleurs, PAS, TYPO, POLICE } from "../lib/theme";
import { AvecDonnees, Page, Question } from "../ui/page";
import { EnClair } from "../ui/signatures";
import { PastilleSource } from "../ui/source";
import { LienDefinition } from "../lib/termes";
import { Emoji, Resume } from "../ui/resume";
import { BarrePart, Compteur, DeuxAnnees, Depli, Financement, Mois } from "../ui/visuels";

/* DENSITE (16/10/2026). Mesure : l'ecran faisait 4,1 hauteurs d'ecran (3 469 px a
   390 x 844), chaque carte empilant phrase, visuels, « En clair », deux replis et la
   source. Desormais chaque carte montre : son titre date, sa phrase-reponse, UN
   visuel, sa source ; le reste est sous « Le détail (…) », un geste plus loin, sans
   rien retirer. */
/* Doctrine du vide (16/10/2026) : deux phrases des comptes n'avaient pas de lien ; le
   socle ne le porte pas pour elles (le site les montre ailleurs), l'ecran l'ajoute. */
const VERIFIER_COMPTES = { texte: "Vérifier dans les comptes publics", url: OFGL_URL };

function Detail({ sujet, children }: { sujet: string; children: ReactNode }) {
  return <Depli titre={sujet.startsWith("par jour") ? `Le détail : ${sujet}` : `Le détail (${sujet})`}>{children}</Depli>;
}

type Rapport = { l: string; v: string; d: string };
type Projet = { annee: number; dispositif: string; intitule: string; subvention: number; cout?: number; ancien_code?: string };

/* Le sujet entre dans le titre : deux replis « Ce que ça ne veut pas dire »
   cote a cote avaient le meme nom accessible (spike du 30/09/2026). */
function PasCeQueCaDit({ r, sujet }: { r?: Rapport; sujet: string }) {
  if (!r) return null;
  return <Depli titre={`Ce que ça ne veut pas dire (${sujet})`}><Text style={TYPO.corps}>{r.d}</Text></Depli>;
}

/* Un projet aidé par l'État : son année, sa part de financement, sa phrase
   locale et l'explication du dispositif, pliée. Un seul composant pour le
   premier projet et pour les suivants (16/10/2026). */
function CarteProjet({ p, nom, projets }: { p: Projet; nom: string; projets: Parameters<typeof nomDispositif>[0] }) {
  const f = financementProjet(p);
  const cout = f && f.cout ? montantCourt(f.cout) : null;
  return (
    <Carte echelon="ville" titre={`${p.annee} · aide ${p.dispositif}`}>
      <Text style={TYPO.reponse}>{p.intitule}</Text>
      {f && f.partPct !== null && cout ? (
        <Resume phrase={partReperee(f.partPct)
          ? `L'État finance ${partReperee(f.partPct)} de ce projet de ${montantEnMots(f.cout)} hors taxes.`
          : `Pour 100 € de ce projet de ${montantEnMots(f.cout)} hors taxes, ${f.partPct} € viennent de l'État.`}>
          <Financement subvention={f.subvention} cout={f.cout as number} partPct={f.partPct}
            subventionTexte={`${euros(f.subvention)} sur ${euros(f.cout as number)} hors taxes`}
            resteTexte={`${euros(f.reste as number)}, financement non détaillé par la source`} />
        </Resume>
      ) : null}
      <Depli titre={`Le détail du projet et de l'aide ${p.dispositif}`}>
        <Text style={TYPO.note}>{phraseProjetLocal(p, nom)}</Text>
        {noteRattachement(p) ? <Text style={TYPO.note}>{noteRattachement(p)}</Text> : null}
        <Text style={TYPO.corps}>{nomDispositif(projets, p.dispositif)} : l'une des aides de l'État à l'investissement des collectivités recensées par la Direction générale des collectivités locales.</Text>
        <Text style={TYPO.note}>{NOTE_FINANCEMENT}</Text>
      </Depli>
    </Carte>
  );
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
      const depTotal = ch && ch.depenses !== null ? montantEnMots(ch.depenses) : null;
      /* montants publies de l'exercice affiche : 0 recettes, 1 depenses, 3 investissement, 4 personnel, 5 impots */
      const calcul = (i: number, j: number, a: string, b: string) => (ex ? phraseCalculPart(valeur(ex.ex, i)?.m, valeur(ex.ex, j)?.m, a, b) : null);
      /* En toutes lettres, comme les depenses (20/10/2026) : « 48,2 M€ » ne se lit
         pas a voix haute. `detteCourte` sert encore a savoir s'il y a une dette. */
      const dette = ch && ch.dette !== null ? montantEnMots(ch.dette) : null;
      return (
        <Page>
          <Stack.Screen options={{ title: LIBELLES.argent }} />
          {/* Sans etiquette ni emoji (16/10/2026) : la barre haute dit deja « Où va l'argent ». */}
          <Question question={`Où va l'argent de ${nom} ?`} />

          {!ex ? (
            <Vide {...(phraseEc ? comptesIncoherents(nom, phraseEc) : comptesAbsents(nom))} />
          ) : rr.length < 2 || !ch ? (
            <Vide {...comptesInsuffisants(ex.an)} lien={VERIFIER_COMPTES} />
          ) : (
            <>
              {/* COMBIEN */}
              <Carte echelon="ville" titre={`Ce que ${nom} a dépensé en ${ex.an}`}>
                {/* `montantEnMots` et non `dep.texte` (20/10/2026) : le second ecrit
                    « 121,3 M€ », une abreviation que personne ne lit a voix haute. */}
                <Resume phrase={depTotal ? `${depTotal} au total sur l'année.` : ""}
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
                <Carte echelon="ville" titre={`Où vont 100 € dépensés, comptes ${ex.an}`}>
                  {/* 08/10/2026 (audit) : « Deux postes… » s'affichait avec une seule barre
                     (part des salaires absente) ; l'annee des comptes manquait au titre. */}
                  {/* LES TROIS POSTES, VISIBLES D'UN COUP (20/10/2026, maquettes du
                      porteur). Une seule barre etait montree, la seconde repliee, et le
                      reste n'etait dit nulle part. Les trois lignes sont desormais
                      cote a cote, chacune avec sa part et son montant par habitant.
                      LE TROISIEME POSTE N'EST PAS UNE INVENTION : c'est 100 moins les
                      deux parts publiees, et il s'appelle « Autres dépenses » — Repere
                      ne sait pas ce qu'il contient et ne le devine pas. Le calcul
                      s'annonce comme un calcul (invariant 4, pastille plus bas). */}
                  {/* LA PHRASE D'ABORD, LES TROIS POSTES ENSUITE (20/10/2026). Le
                      tableau seul avait fait disparaitre la reponse en toutes lettres :
                      la garde du parcours l'a vu (« l'écran répond à sa question »). */}
                  <Text style={[TYPO.reponse, { fontSize: 19, lineHeight: 25 }]}>
                    {ch.partSalaires !== null
                      ? `Sur 100 € dépensés, ${ch.partSalaires} € servent à payer les personnes employées par la commune.`
                      : `Sur 100 € dépensés, ${ch.partInvestissement} € vont aux investissements.`}
                  </Text>
                  {(() => {
                    const sal = ch.partSalaires, inv = ch.partInvestissement;
                    const autres = sal !== null && inv !== null ? Math.max(0, 100 - sal - inv) : null;
                    const postes: [string, number | null, string][] = [
                      /* La maquette emploie un mot technique pour ce poste ; la garde de
                         refonte-ux le refuse, et elle a raison : la carte parle des
                         personnes, comme partout ailleurs dans Repere. */
                      ["Personnes employées par la commune", sal, rap(/personnes employées/)?.v || ""],
                      ["Chantiers et investissements", inv, rap(/investir/)?.v || ""],
                      ["Autres dépenses", autres, ""],
                    ];
                    return (
                      <View style={{ gap: PAS * 3 }}>
                        {postes.filter(([, p]) => p !== null).map(([nom, part, valeur], i) => (
                          <View key={nom} style={{ gap: PAS }}>
                            <View style={{ flexDirection: "row", alignItems: "baseline", gap: PAS * 2 }}>
                              <Text style={[TYPO.corps, { flex: 1, fontWeight: "600" }]}>{nom}</Text>
                              <Text style={{ fontFamily: POLICE.affiche, fontSize: 24, lineHeight: 28, color: couleurs.encre }}>{part} €</Text>
                            </View>
                            <BarrePart sansLibelle part={part as number}
                              libelle={nom}
                              valeur={valeur || `${part} € sur 100 € dépensés`}
                              echelon="ville" delai={i * 90} />
                          </View>
                        ))}
                      </View>
                    );
                  })()}
                  {/* LE CARTOUCHE, AVEC LE TEXTE DU SOCLE (20/10/2026). L'explication
                      de l'investissement est ecrite une seule fois, dans
                      packages/core/src/comptes.js (champ `d`), et partagee avec le
                      site : l'ecran ne la reformule pas. */}
                  {rap(/investir/)?.d ? <EnClair texte={rap(/investir/)!.d as string} /> : null}
                  <PastilleSource source={srcComptes(d)} />
                  <Detail sujet="dépenses">
                    {/* Le calcul, avec les deux montants publies (16/10/2026) : la part se verifie. */}
                    {[calcul(4, 1, "frais de personnel", "dépenses totales"), calcul(3, 1, "dépenses d'investissement", "dépenses totales")]
                      .filter(Boolean).map(t => <Text key={t as string} style={TYPO.note}>{t}</Text>)}
                    {ch.partSalaires !== null && ch.partInvestissement !== null ? <BarrePart part={ch.partInvestissement} libelle="Investissements : travaux, équipements…" valeur={rap(/investir/)?.v || ""} delai={120} /> : null}
                    <Text style={TYPO.corps}>En clair : le reste des dépenses n'est pas détaillé par la source.</Text>
                    <PasCeQueCaDit r={rap(/personnes employées/)} sujet="personnes employées" />
                    <PasCeQueCaDit r={rap(/investir/)} sujet="investissements" />
                  </Detail>
                </Carte>
              ) : null}

              {/* D'OU VIENT L'ARGENT */}
              {ch.partImpots !== null ? (
                <Carte echelon="ville" titre={`D'où vient l'argent, comptes ${ex.an}`}>
                  <Resume phrase={partReperee(ch.partImpots)
                      ? `${String(partReperee(ch.partImpots)).replace(/^./, (c: string) => c.toUpperCase())} de ce que ${nom} encaisse vient des impôts et taxes.`
                      : `Sur 100 € encaissés, ${ch.partImpots} € viennent des impôts et taxes.`}
                    enClair={partReperee(ch.partImpots) && rap(/impôts/)?.v ? `Sur 100 € encaissés, ${rap(/impôts/)?.v}.` : null}>
                    <BarrePart part={ch.partImpots} libelle="Impôts et taxes" valeur={rap(/impôts/)?.v || ""} />
                  </Resume>
                  <PastilleSource source={srcComptes(d)} />
                  <Detail sujet="recettes">
                    {calcul(5, 0, "impôts et taxes", "recettes totales") ? <Text style={TYPO.note}>{calcul(5, 0, "impôts et taxes", "recettes totales")}</Text> : null}
                    <PasCeQueCaDit r={rap(/impôts/)} sujet="impôts" />
                  </Detail>
                </Carte>
              ) : null}

              {/* LA DETTE */}
              {ch.detteMois !== null && dette ? (
                <Carte echelon="ville" titre={`Sa dette, fin ${ex.an}`}>
                  <Resume phrase={`${nom} doit encore rembourser ${dette}.`}
                    /* « 7,6 mois de recettes » en corps d'affiche tenait sur deux lignes :
                       le nombre en grand, l'unite dans la legende, la phrase partagee
                       avec le site reste lisible d'un seul tenant. */
                    chiffre={(rap(/mois de recettes/)?.v || "").replace(/ de recettes$/, "") || null}
                    legende="de recettes : le temps qu'il faudrait pour rembourser si toutes ses recettes y passaient"
                    enClair={hab && hab.dette !== null ? `Soit ${hab.dette.toLocaleString("fr-FR")} € par habitant.` : null} />
                  <PastilleSource source={srcComptes(d)} />
                  <Detail sujet="dette">
                    <Mois mois={ch.detteMois} />
                    <Text style={TYPO.micro}>Une case = un mois de recettes de la commune.</Text>
                    <LienDefinition cle="encours de dette" />
                    <PasCeQueCaDit r={rap(/mois de recettes/)} sujet="dette" />
                  </Detail>
                </Carte>
              ) : ch.dette === 0 ? (
                /* 08/10/2026 (audit) : une dette nulle PUBLIEE faisait disparaitre la
                   carte sans un mot (71 communes) ; le site, lui, le dit. */
                <Carte echelon="ville" titre={`Sa dette, fin ${ex.an}`}>
                  <Resume phrase={`L'Observatoire publie un encours de dette nul pour ${nom} en ${ex.an}, sur le budget principal : aucun emprunt n'y reste à rembourser.`} />
                  <PastilleSource source={srcComptesPublies(d)} />
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
          {/* CE QUI A CHANGE EN UN AN : jamais deux territoires, jamais un jugement.
             SORTIE DU REPLI LE 20/10/2026. « Ce qui a changé » est la réponse que le
             lecteur vient chercher ; elle demandait deux gestes (ouvrir « par jour et
             sur un an », puis « évolution ») pour voir deux de ses trois lignes. La
             maquette du porteur la montre en pleine carte, et la revue des maquettes
             (docs/REVUE_MAQUETTES_FONTAINEBLEAU_2026-10-20.md, § 5) retient les trois
             tuiles de variation. Ce qui NE change pas : des euros datés, jamais un
             pourcentage ; aucune couleur de hausse ou de baisse ; aucune cause, aucun
             jugement. */}
          {evo ? (
            evo.perimetreChange ? (
              <Vide {...perimetreChange(evo, nom)} lien={VERIFIER_COMPTES} />
            ) : (
              <Carte echelon="ville" titre={`Ce qui a changé entre ${evo.an1} et ${evo.an2}`}>
                {[1, 0, 2].map(i => evo.lignes[i]).filter(l => l && l.m1 !== null && l.m2 !== null).map((l: { libelle: string; m1: number; m2: number; diff: number }) => (
                  <DeuxAnnees key={l.libelle} libelle={l.libelle} an1={evo.an1} an2={evo.an2} m1={l.m1} m2={l.m2}
                    texte1={eurosArrondis(l.m1)} texte2={eurosArrondis(l.m2)} diffTexte={diffEuros(l.diff)} />
                ))}
                <Text style={TYPO.micro}>Chaque paire de barres a sa propre échelle : on compare une ligne à elle-même, jamais deux lignes entre elles.</Text>
                <PastilleSource source={srcComptes(d)} />
                <Detail sujet="évolution">
                  <Text style={TYPO.note}>{INTRO_EVOLUTION}</Text>
                  <Depli titre="Ce que ça ne veut pas dire (évolution)"><Text style={TYPO.corps}>{NOTE_EVOLUTION}</Text></Depli>
                </Detail>
              </Carte>
            )
          ) : null}

          {/* DENSITE (16/10/2026) : la moyenne par jour, un calcul, sous son repli. */}
          {ex && ch && ch.parJour !== null ? (
            <Detail sujet="par jour">
              <Carte echelon="ville" titre={`Chaque jour, en moyenne, en ${ex.an}`}>
                <Compteur valeur={ch.parJour} suffixe="€ par jour" />
                <PastilleSource source={srcComptes(d)} />
                <Detail sujet="dépense par jour">
                  <PasCeQueCaDit r={rap(/par jour/)} sujet="dépense par jour" />
                </Detail>
              </Carte>
            </Detail>
          ) : null}

          {/* LES PROJETS AIDES PAR L'ETAT */}
          <View style={{ gap: PAS * 3 }}>
            <View style={{ flexDirection: "row", gap: PAS * 2, alignItems: "center" }}>
              <Emoji c="🏗️" taille={24} />
              <Text style={[TYPO.question, { flex: 1, fontSize: 24, lineHeight: 28 }]} accessibilityRole="header">Les projets aidés par l'État</Text>
            </View>
            {!r.projetsLus ? (
              <Vide {...PROJETS_PAS_ARRIVES} action="Réessayer" onAction={reessayer} />
            ) : !listeProjets.length ? (
              <Vide {...projetsAucun(nom)} />
            ) : (
              <>
                {/* 16/10/2026 : le premier projet reste lisible ; les suivants se
                   dépilent, avec le nombre annoncé dans le libellé du repli. */}
                <CarteProjet p={listeProjets[0]} nom={nom} projets={r.projets} />
                {listeProjets.length > 1 ? (
                  <Depli titre={`Voir les ${listeProjets.length - 1} autres projets aidés`}>
                    <View style={{ gap: PAS * 3 }}>
                      {listeProjets.slice(1).map((p, i) => (
                        <CarteProjet key={i} p={p} nom={nom} projets={r.projets} />
                      ))}
                    </View>
                  </Depli>
                ) : null}
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

