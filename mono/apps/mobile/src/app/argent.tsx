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
  phraseProjetLocal, rapports, sousTitreRapports, euros, CALCUL_REPERE, LIBELLES,
  OFGL_URL, phraseCalculPart, valeur,
} from "@repere/core";
import { Carte, Source, Vide } from "../lib/composants";
import { PROJETS_PAS_ARRIVES, projetsAucun } from "../lib/absences";
import { srcComptes, srcComptesPublies, srcProjets } from "../lib/sources";
import { useCommuneChoisie } from "../lib/useCommune";
import { couleurs, PAS, RAYON, TYPO } from "../lib/theme";
import { AvecDonnees, Page, Question } from "../ui/page";
import { PastilleSource } from "../ui/source";
import { LienDefinition } from "../lib/termes";
import { Emoji, Resume } from "../ui/resume";
import { BarrePart, Compteur, DeuxAnnees, Depli, Financement, Mois } from "../ui/visuels";
import { TauxCommune } from "../ui/fiscalite";

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
          ? `L'État finance ${partReperee(f.partPct)} de ce projet de ${cout.texte} hors taxes.`
          : `Pour 100 € de ce projet de ${cout.texte} hors taxes, ${f.partPct} € viennent de l'État.`}>
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

/* Une variation en pourcentage (calcul Repere, annonce comme tel sous les tuiles). */
function variationTexte(m1: number, m2: number): string {
  const v = ((m2 - m1) / m1) * 100;
  const s = Math.abs(v).toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return `${v > 0 ? "+" : v < 0 ? "-" : ""}${s} %`;
}

/* OU VONT LES DEPENSES (maquette « Où va cet argent ? ») : chaque poste a son montant
   PUBLIE par habitant et sa part, CALCULEE par Repere sur les depenses totales. Le
   reste (depenses moins personnel et investissement) est un calcul, dit comme tel. */
function LignesDepenses({ ex, ch, valeurs }: { ex: Parameters<typeof parHabitant>[0]; ch: { partSalaires: number | null; partInvestissement: number | null }; valeurs: { salaires?: string; investissement?: string } }) {
  const hab = parHabitant(ex);
  const montant = (v: number) => `${Math.round(v).toLocaleString("fr-FR")} €`;
  const reste = hab.depenses !== null && hab.salaires !== null && hab.investissement !== null ? hab.depenses - hab.salaires - hab.investissement : null;
  const partReste = ch.partSalaires !== null && ch.partInvestissement !== null ? Math.max(0, Math.round(100 - ch.partSalaires - ch.partInvestissement)) : null;
  const lignes = [
    { libelle: "Frais de personnel", part: ch.partSalaires, par: hab.salaires, calcul: false, valeur: valeurs.salaires },
    { libelle: "Investissements", part: ch.partInvestissement, par: hab.investissement, calcul: false, valeur: valeurs.investissement },
    { libelle: "Autres dépenses", part: partReste, par: reste, calcul: true, valeur: undefined },
  ].filter(l => l.part !== null && l.par !== null) as { libelle: string; part: number; par: number; calcul: boolean; valeur?: string }[];
  return (
    <View style={{ gap: PAS * 4 }}>
      {lignes.map((l, i) => (
        <View key={l.libelle} accessible accessibilityLabel={`${l.libelle} : ${l.part} % des dépenses, ${montant(l.par)} par habitant${l.calcul ? ", calcul Repère" : ""}`} style={{ gap: PAS * 2 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: PAS * 3 }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: couleurs.primaireClair, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontWeight: "800", color: couleurs.primaire }}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={TYPO.corps}>{l.libelle}</Text>
              {/* Le texte publie du rapport d'abord (« 47 € de salaires »), puis la part calculee. */}
              {l.valeur ? <Text style={TYPO.micro}>{l.valeur}</Text> : null}
              <Text style={TYPO.micro}>{`${l.part} % des dépenses${l.calcul ? " · calcul Repère" : ""}`}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontWeight: "800", fontSize: 18, color: couleurs.encre }}>{montant(l.par)}</Text>
              <Text style={TYPO.micro}>par habitant</Text>
            </View>
          </View>
          <View style={{ height: 8, borderRadius: 4, backgroundColor: couleurs.voile, overflow: "hidden" }}>
            <View style={{ height: 8, width: `${l.part}%`, borderRadius: 4, backgroundColor: couleurs.primaire }} />
          </View>
        </View>
      ))}
    </View>
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
      const dep = ch && ch.depenses !== null ? montantCourt(ch.depenses) : null;
      /* montants publies de l'exercice affiche : 0 recettes, 1 depenses, 3 investissement, 4 personnel, 5 impots */
      const calcul = (i: number, j: number, a: string, b: string) => (ex ? phraseCalculPart(valeur(ex.ex, i)?.m, valeur(ex.ex, j)?.m, a, b) : null);
      const dette = ch && ch.dette !== null ? montantCourt(ch.dette) : null;
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
                <Carte echelon="ville" titre={`Où vont 100 € dépensés, comptes ${ex.an}`}>
                  {/* 08/10/2026 (audit) : « Deux postes… » s'affichait avec une seule barre
                     (part des salaires absente) ; l'annee des comptes manquait au titre. */}
                  <Resume phrase={ch.partSalaires !== null ? `Sur 100 € dépensés, ${ch.partSalaires} € vont aux salaires des agents.` : `Sur 100 € dépensés, ${ch.partInvestissement} € vont aux investissements.`}>
                    <LignesDepenses ex={ex.ex} ch={ch} valeurs={{ salaires: rap(/salaires/)?.v, investissement: rap(/investir/)?.v }} />
                  </Resume>
                  <PastilleSource source={srcComptes(d)} />
                  <Detail sujet="dépenses">
                    {/* Le calcul, avec les deux montants publies (16/10/2026) : la part se verifie. */}
                    {[calcul(4, 1, "frais de personnel", "dépenses totales"), calcul(3, 1, "dépenses d'investissement", "dépenses totales")]
                      .filter(Boolean).map(t => <Text key={t as string} style={TYPO.note}>{t}</Text>)}
                    {ch.partSalaires !== null && ch.partInvestissement !== null ? <BarrePart part={ch.partInvestissement} libelle="Investissements : travaux, équipements…" valeur={rap(/investir/)?.v || ""} delai={120} /> : null}
                    <Text style={TYPO.corps}>En clair : le reste des dépenses n'est pas détaillé par la source.</Text>
                    <PasCeQueCaDit r={rap(/salaires/)} sujet="salaires" />
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
                  <Resume phrase={`${nom} doit encore rembourser ${dette.texte}.`}
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

          {/* DENSITE (16/10/2026) : la moyenne par jour (un calcul) et l'evolution sur un
             an, chacune dans sa carte et avec sa source, sous un meme repli. */}
          {ex && ch && ch.parJour !== null ? (
            <Detail sujet="par jour">
              {/* LE JOUR LE JOUR, POUR QUI VEUT LE VOIR COMPTER */}
                {ch.parJour !== null ? (
                  <Carte echelon="ville" titre={`Chaque jour, en moyenne, en ${ex.an}`}>
                    <Compteur valeur={ch.parJour} suffixe="€ par jour" />
                    <PastilleSource source={srcComptes(d)} />
                    <Detail sujet="dépense par jour">
                      <PasCeQueCaDit r={rap(/par jour/)} sujet="dépense par jour" />
                    </Detail>
                  </Carte>
                ) : null}

            </Detail>
          ) : null}

          {/* CE QUI A CHANGE EN UN AN, visible sans repli (maquette « Ce qui change par rapport
              à … ») : jamais deux territoires, jamais un jugement */}
          {ex && ch && evo ? (
            <>
              {evo ? (
                evo.perimetreChange ? (
                  <Vide {...perimetreChange(evo, nom)} lien={VERIFIER_COMPTES} />
                ) : (
                  <Carte echelon="ville" titre={`Ce qui a changé entre ${evo.an1} et ${evo.an2}`}>
                    {/* Trois tuiles, une variation en pourcentage chacune (calcul Repere, dit sous
                        elles) ; les barres en euros et la note restent dans le detail. */}
                    <View style={{ flexDirection: "row", gap: PAS * 2 }}>
                      {[1, 0, 2].map(i => evo.lignes[i]).filter(l => l && l.m1 !== null && l.m2 !== null && l.m1 !== 0).slice(0, 3).map((l: { libelle: string; m1: number; m2: number; diff: number }) => (
                        <View key={l.libelle} accessible accessibilityLabel={`${l.libelle} : ${variationTexte(l.m1, l.m2)} entre ${evo.an1} et ${evo.an2}, calcul Repère`}
                          style={{ flex: 1, backgroundColor: couleurs.voile, borderRadius: RAYON.bloc, padding: PAS * 3, gap: PAS * 2 }}>
                          <Text style={TYPO.micro}>{l.libelle}</Text>
                          <View style={{ alignSelf: "flex-start", backgroundColor: couleurs.primaireClair, borderRadius: RAYON.pastille, paddingHorizontal: PAS * 2, paddingVertical: 2 }}>
                            <Text style={{ fontWeight: "800", color: couleurs.encre }}>{variationTexte(l.m1, l.m2)}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                    <Text style={TYPO.micro}>{`Variation calculée par Repère entre ${evo.an1} et ${evo.an2}, à partir des montants publiés.`}</Text>
                    <PastilleSource source={srcComptes(d)} />
                    <Detail sujet="évolution">
                      <Text style={TYPO.note}>{INTRO_EVOLUTION}</Text>
                      {[1, 0, 2].map(i => evo.lignes[i]).filter(l => l && l.m1 !== null && l.m2 !== null).map((l: { libelle: string; m1: number; m2: number; diff: number }) => (
                        <DeuxAnnees key={l.libelle} libelle={l.libelle} an1={evo.an1} an2={evo.an2} m1={l.m1} m2={l.m2}
                          texte1={eurosArrondis(l.m1)} texte2={eurosArrondis(l.m2)} diffTexte={diffEuros(l.diff)} />
                      ))}
                      <Text style={TYPO.micro}>Chaque paire de barres a sa propre échelle : on compare une ligne à elle-même, jamais deux lignes entre elles.</Text>
                      <Depli titre="Ce que ça ne veut pas dire (évolution)"><Text style={TYPO.corps}>{NOTE_EVOLUTION}</Text></Depli>
                    </Detail>
                  </Carte>
                )
              ) : null}
            </>
          ) : null}

          {/* CE QUE VOUS PAYEZ A LA COMMUNE (20/10/2026). Faits de droit par profil, sans
              montant personnel en euros et sans donnee publiee : la doctrine du vide
              s'applique tant que les taux ne sont pas branches. */}
          <View style={{ gap: PAS * 3 }}>
            <View style={{ flexDirection: "row", gap: PAS * 2, alignItems: "center" }}>
              <Emoji c="💶" taille={24} />
              <Text style={[TYPO.question, { flex: 1, fontSize: 24, lineHeight: 28 }]} accessibilityRole="header">Ce que vous payez à la commune</Text>
            </View>
            <Carte echelon="ville" titre="Si vous êtes propriétaire">
              <Text style={TYPO.corps}>Vous payez la taxe foncière sur les propriétés bâties, et, si votre commune la lève, la taxe d'enlèvement des ordures ménagères, établie au nom du propriétaire.</Text>
              <TauxCommune dep={d.dep} insee={d.commune} />
            </Carte>
            <Carte echelon="ville" titre="Si vous êtes locataire">
              <Text style={TYPO.reponse}>Le propriétaire peut récupérer auprès de vous la taxe d'enlèvement des ordures ménagères, de plein droit et sans frais de gestion.</Text>
              <Text style={TYPO.corps}>Il doit vous remettre le détail des taxes locatives.</Text>
              <Source producteur="Direction générale des Finances publiques (DGFiP)" maj="20/07/2026" calcul={false}
                url="https://www.impots.gouv.fr/portail/particulier/questions/je-suis-locataire-mon-proprietaire-me-demande-de-payer-la-taxe-denlevement-des" />
            </Carte>
            <Carte echelon="ville" titre="Famille et étudiant">
              <Text style={TYPO.reponse}>Repère ne donne pas de règle générale pour votre foyer.</Text>
              <Text style={TYPO.corps}>Pour votre situation précise, vérifiez auprès de la DGFiP ou de votre commune. Repère n'affiche aucun montant en euros pour votre logement : la valeur locative est une donnée personnelle.</Text>
            </Carte>
          </View>

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
