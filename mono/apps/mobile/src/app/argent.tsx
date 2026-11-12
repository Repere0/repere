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
import { useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { Stack } from "expo-router";
import {
  chiffresComptes, etatDette, comptesAbsents, comptesIncoherents, comptesInsuffisants, diffEuros, eurosArrondis,
  evolution, exercicesEcartes, financementProjet, INTRO_EVOLUTION, introRapports, montantCourt, noteRattachement,
  NOTE_EVOLUTION, NOTE_FINANCEMENT, nomDispositif, parHabitant, partReperee, perimetreChange, phraseEcartes,
  phraseProjetLocal, rapports, sousTitreRapports, euros, CALCUL_REPERE, LIBELLES, exercicePrecedent,
} from "@repere/core";
import { Carte, Definitions, Vide } from "../lib/composants";
import { PROJETS_PAS_ARRIVES, projetsAucun } from "../lib/absences";
import { srcComptes, srcComptesPublies, srcProjets } from "../lib/sources";
import { useCommuneChoisie } from "../lib/useCommune";
import { ACCENTS, CIBLE, couleurs, PAS, POLICE, TYPO } from "../lib/theme";
import { Onglets } from "../ui/stitch";
import { AvecDonnees, Page, Question } from "../ui/page";
import { DateDonnee } from "../ui/fraicheur";
import { phrasesMoyenne, useMoyenneDepenses } from "../lib/moyenne";
import { PastilleSource } from "../ui/source";
import { BoutonPartageTexte, ligneSource } from "../ui/partage/partager-texte";
import { Resume } from "../ui/resume";
import { BarreBudget, BarrePart, Compteur, DeuxAnnees, Depli, Financement, Mois, RepartitionCent, Tendance, VariationAnnuelle } from "../ui/visuels";
import { PartagerCarte } from "../ui/partage/bouton-partage";
import { ChiffreStory } from "../ui/partage/variantes/chiffre.story";
import { messageChiffre } from "../ui/partage/messages";
import { SignalerErreur } from "../ui/contact";
import { enfonce } from "../ui/mouvement";

type Rapport = { l: string; v: string; d: string };
/* Le sigle seul ne dit rien au lecteur : nom complet d'abord, sigle entre parenthèses (nom publié par la source). */
const aideNommee = (projets: unknown, code: string) => {
  const nom = nomDispositif(projets, code);
  return nom && nom !== code ? `${nom} (${code})` : code;
};

type Projet = { annee: number; dispositif: string; intitule: string; subvention: number; cout?: number; ancien_code?: string };

/* Le sujet entre dans le titre : deux replis « Ce que ça ne veut pas dire »
   cote a cote avaient le meme nom accessible (spike du 30/09/2026). */
function PasCeQueCaDit({ r, sujet }: { r?: Rapport; sujet: string }) {
  if (!r) return null;
  return <Depli titre={`Ce que ça ne veut pas dire (${sujet})`}><Text style={TYPO.corps}>{r.d}</Text></Depli>;
}

/* La comparaison regionale (crochet : les fichiers des departements de la region sont lus
   une fois par session). Rien tant qu'elle n'est pas calculable : pas de place reservee. */
function Comparaison({ nom, valeur, index, dep, an }: { nom: string; valeur: number; index: { departements?: { code: string }[] } | null; dep: string; an: string }) {
  const m = useMoyenneDepenses(index, dep, an, true);
  if (!m) return null;
  const p = phrasesMoyenne(nom, valeur, m);
  return (
    <View style={{ gap: 2 }}>
      <Text style={[TYPO.corps, { fontWeight: "600" }]}>{nom} : {valeur.toLocaleString("fr-FR")} € · {p.court}</Text>
      <Text style={TYPO.corps}>{p.position}</Text>
      {/* Audit 5 s : l'explication du calcul se deplie, elle ne s'impose pas. */}
      <Depli titre="Comment est calculée la médiane ?"><Text style={TYPO.corps}>{p.note}</Text></Depli>
    </View>
  );
}

/* Les trois vues du budget (maquette Stitch « Finances », 09/11/2026). Le contrôle segmenté
   choisit la vue ; le niveau 3 (« Détails du calcul ») garde TOUS les rapports, quelle que soit la
   vue : rien n'est retiré, et le site dit la même chose (meme-verite.mjs). */
type Vue = "cent" | "evolution" | "recettes";
const VUES: { cle: Vue; texte: string }[] = [
  { cle: "cent", texte: "100 € citoyen" },
  { cle: "evolution", texte: "Évolution" },
  { cle: "recettes", texte: "Recettes" },
];
/* Une variation en pourcentage, arrondie au dixième : un calcul de Repère, annoncé comme tel. */
const variation = (m1: number, m2: number) => {
  if (!(m1 > 0)) return null;
  const v = Math.round((m2 - m1) / m1 * 1000) / 10;
  return `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %`;
};

export default function Argent() {
  const { reessayer } = useCommuneChoisie();
  const [vue, setVue] = useState<Vue>("cent");
  return (
    <AvecDonnees rendu={r => {
      const { d } = r;
      const nom = d.nomCommune;
      const ex = d.exercice;
      const rr: Rapport[] = ex ? rapports(ex.ex) : [];
      const ch = ex ? chiffresComptes(ex.ex) : null;
      const hab = ex ? parHabitant(ex.ex) : null;
      /* V54 : tendance par habitant d'un exercice a l'autre (calcul Repere, annonce comme tel).
         Absente si l'exercice precedent n'est pas publie (exercicePrecedent renvoie null). */
      const precedent = ex && d.fiche && d.fiche.comptes ? exercicePrecedent(d.fiche.comptes, ex.an) : null;
      const tendancePct = hab && hab.depenses !== null && precedent && precedent.hab.depenses !== null && precedent.hab.depenses > 0
        ? Math.round(((hab.depenses - precedent.hab.depenses) / precedent.hab.depenses) * 1000) / 10 : null;
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
      /* Carte de partage du chiffre par habitant : seulement quand le montant et sa source sont publies. */
      const partage = ex && hab && hab.depenses !== null && d.srcComptes
        ? { euros: `${hab.depenses.toLocaleString("fr-FR")} €`, an: ex.an, producteur: d.srcComptes.producteur } : null;
      return (
        /* Audit 5 s (V15) : sansDate, la ligne DateDonnee de l'ecran dit deja la date et la source. */
        <Page sansDate>
          <Stack.Screen options={{ title: LIBELLES.argent, headerRight: () => <BoutonPartageTexte titre={`${LIBELLES.argent} de ${nom}`} chemin="argent" source={ligneSource(d.srcComptes)} /> }} />
          <Question etiquette="L'argent de la commune" question={`Où va l'argent de ${nom} ?`} />
          {/* V13 bloc A : la date des comptes et leur anciennete, avec la source. */}
          <DateDonnee quoi="Comptes OFGL" date={r.index?.sources?.comptes?.maj} url={r.index?.sources?.comptes?.url} />

          {/* Refonte « légère » (porteur, 09/11/2026) : les onglets en haut de l'écran. */}
          {ex && rr.length >= 2 && ch ? <Onglets etiquette="Vue du budget" valeurs={VUES} actif={vue} choisir={setVue} /> : null}

          {!ex ? (
            <Vide {...(phraseEc ? comptesIncoherents(nom, phraseEc) : comptesAbsents(nom))} />
          ) : rr.length < 2 || !ch ? (
            <Vide {...comptesInsuffisants(ex.an)} />
          ) : (
            <>
              {/* COMBIEN (maquette Stitch : le chiffre par habitant, et son équivalent par mois,
                  annoncé comme un calcul). Ce n'est pas ce que paie un foyer : c'est ce que la
                  commune dépense, divisé par le nombre d'habitants (la phrase le dit). */}
              <Carte echelon="ville" titre={`Ce que ${nom} a dépensé en ${ex.an}`}>
                <Resume geant phrase={dep ? `${dep.texte} au total sur l'année.` : ""}
                  chiffre={hab && hab.depenses !== null ? `${hab.depenses.toLocaleString("fr-FR")} €` : null}
                  legende="par habitant et par an" />
                {hab && hab.depenses !== null ? (
                  <Text style={TYPO.note}>
                    Soit <Text style={{ color: ACCENTS.texteAccent, fontFamily: POLICE.texteGras }}>{Math.round(hab.depenses / 12).toLocaleString("fr-FR")} € par mois</Text> et par habitant (calcul Repère : le montant annuel divisé par 12). C'est la dépense de la commune, pas ce que paie votre foyer.
                  </Text>
                ) : null}
                {precedent && ex ? <Tendance pct={tendancePct} an1={precedent.an} an2={ex.an} /> : null}
                {/* D23 (ADR 0002), A1 : la commune mediane de la region, un calcul annonce comme tel. */}
                {hab && hab.depenses !== null ? <Comparaison nom={nom} valeur={hab.depenses} index={r.index} dep={d.dep} an={ex.an} /> : null}
                {hab && hab.salaires !== null && hab.investissement !== null ? (
                  /* Audit 5 s (V19) : le detail se deplie ; le chiffre et la comparaison restent visibles. */
                  <Depli titre="Ce que finance cet argent"><Text style={TYPO.corps}>Dont {hab.salaires.toLocaleString("fr-FR")} € par habitant pour vos agents (salaires) et {hab.investissement.toLocaleString("fr-FR")} € pour vos équipements (investissement).</Text></Depli>
                ) : null}
                {/* Deux chiffres PUBLIES, donc une source sans « calcul ». La moyenne
                    par jour (un calcul) vit dans sa propre carte, plus bas, avec sa
                    pastille « Calculé par Repère » : la mettre ici l'aurait fait passer
                    pour publiee (invariant 4, relecture du 30/09/2026). */}
                <PastilleSource source={srcComptesPublies(d)} />
                {partage ? (
                  <PartagerCarte etiquette={`Partager le chiffre de ${nom}`}
                    repli={messageChiffre({ ville: nom, euros: partage.euros, an: partage.an, producteur: partage.producteur })}
                    rendu={ref => <ChiffreStory refCarte={ref} ville={nom} euros={partage.euros} an={partage.an}
                      parts={{ salaires: ch?.partSalaires ?? null, investissement: ch?.partInvestissement ?? null }}
                      source={`Source : ${partage.producteur}, comptes ${partage.an}.`} />} />
                ) : null}
              </Carte>

              {/* OU VA CHAQUE 100 € */}
              {vue === "cent" && (ch.partSalaires !== null || ch.partInvestissement !== null) ? (
                <Carte echelon="ville" titre={`Où vont 100 € dépensés, comptes ${ex.an}`}>
                  {/* 08/10/2026 (audit) : « Deux postes… » s'affichait avec une seule barre
                     (part des salaires absente) ; l'annee des comptes manquait au titre. */}
                  {/* Même vérité que le site (meme-verite.mjs) : la phrase vient de rapports() dans
                     @repere/core, jamais recomposée ici. */}
                  <Resume phrase={[rap(/salaires/)?.v, rap(/investir/)?.v].filter(Boolean).length
                      ? `Sur 100 € dépensés : ${[rap(/salaires/)?.v, rap(/investir/)?.v].filter(Boolean).join(", ")}.`
                      : ""}
                    enClair="Le reste des dépenses n'est pas détaillé par la source.">
                    {/* « Test des 3 secondes » (11/11/2026) : une seule barre épaisse, le montant dans chaque segment.
                       Si un des deux postes manque, les lignes d'avant, qui savent n'en montrer qu'un. */}
                    {ch.partSalaires !== null && ch.partInvestissement !== null && ch.partSalaires + ch.partInvestissement <= 100
                      ? <BarreBudget parts={{ sal: ch.partSalaires, inv: ch.partInvestissement, aut: 100 - ch.partSalaires - ch.partInvestissement }} />
                      : <RepartitionCent salaires={ch.partSalaires} investissement={ch.partInvestissement} />}
                  </Resume>
                  <PasCeQueCaDit r={rap(/salaires/)} sujet="salaires" />
                  <PasCeQueCaDit r={rap(/investir/)} sujet="investissements" />
                  <PastilleSource source={srcComptes(d)} />
                </Carte>
              ) : null}

              {/* 12/11/2026 (audit des doublons) : le « Zoom : un projet cofinancé » est retiré. Il répétait, chiffre pour
                  chiffre, la première carte de « Les projets aidés par l'État », plus bas sur la même page. */}

              {/* D'OU VIENT L'ARGENT */}
              {vue === "recettes" && ch.partImpots !== null ? (
                <Carte echelon="ville" titre={`D'où vient l'argent, comptes ${ex.an}`}>
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

              {/* LA DETTE. Une dette publiee a zero a sa propre branche, plus bas : elle
                  ne passe pas ici (depuis fba0bf9, detteMois vaut 0 et non plus null). */}
              {/* TROIS ETATS DE LA DETTE (29/10/2026), decides par etatDette() dans
                  @repere/core, comme sur le site : inconnue -> une phrase « non renseignee »
                  (jamais une carte absente) ; nulle -> « aucun emprunt » ; montant sans
                  ratio -> le montant seul ; mois -> la carte complete. */}
              {vue === "recettes" && ex && etatDette(ex.ex) === "inconnue" ? (
                <Carte echelon="ville" titre={`Sa dette, fin ${ex.an}`}>
                  <Resume phrase={`Non renseignée dans les comptes ${ex.an}.`} />
                  <Text style={TYPO.micro}>Le fichier ne porte pas cette ligne : ce n'est pas un montant nul.</Text>
                  <PastilleSource source={srcComptes(d)} />
                </Carte>
              ) : null}

              {vue === "recettes" && ex && etatDette(ex.ex) === "montant_sans_ratio" && dette ? (
                <Carte echelon="ville" titre={`Sa dette, fin ${ex.an}`}>
                  <Resume phrase={`${nom} doit encore rembourser ${dette}.`} />
                  <Text style={TYPO.micro}>Le ratio en mois de recettes n'est pas calculable : les recettes ne sont pas publiées pour cet exercice.</Text>
                  <PastilleSource source={srcComptes(d)} />
                </Carte>
              ) : null}

              {vue !== "recettes" ? null : ch.detteMois !== null && ch.dette !== 0 && dette ? (
                <Carte echelon="ville" titre={`Sa dette, fin ${ex.an}`}>
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
                  {/* D20 (premier lot) : « encours de dette » est une notion que le lecteur
                      ne connait pas. Terme tapable, qui ouvre sa definition du dictionnaire. */}
                  <Definitions s={[{ t: "encours de dette", mot: "encours de dette" }]} />
                  <PasCeQueCaDit r={rap(/mois de recettes/)} sujet="dette" />
                  <PastilleSource source={srcComptes(d)} />
                </Carte>
              ) : ch.dette === 0 ? (
                /* 08/10/2026 (audit) : une dette nulle PUBLIEE faisait disparaitre la
                   carte sans un mot (71 communes) ; le site, lui, le dit. */
                <Carte echelon="ville" titre={`Sa dette, fin ${ex.an}`}>
                  <Resume phrase={`L'Observatoire publie un encours de dette nul pour ${nom} en ${ex.an}, sur le budget principal : aucun emprunt n'y reste à rembourser.`} />
                  <PastilleSource source={srcComptesPublies(d)} />
                </Carte>
              ) : null}

              {/* LE JOUR LE JOUR, POUR QUI VEUT LE VOIR COMPTER */}
              {vue === "cent" && ch.parJour !== null ? (
                <Carte echelon="ville" titre={`Chaque jour, en moyenne, en ${ex.an}`}>
                  <Compteur valeur={ch.parJour} suffixe="€ par jour" />
                  <PasCeQueCaDit r={rap(/par jour/)} sujet="dépense par jour" />
                  <PastilleSource source={srcComptes(d)} />
                </Carte>
              ) : null}

              {/* NIVEAU 3 : le calcul, pour qui veut aller au bout */}
              <Depli titre="Détails du calcul">
                <Text style={TYPO.note}>{sousTitreRapports(ex.an, ex.ex)}</Text>
                <Text style={TYPO.note}>{introRapports({ detailPlusBas: false })}</Text>
                <Text style={[TYPO.note, { fontWeight: "500" }]}>{CALCUL_REPERE}</Text>
                {phraseEc ? <Text style={TYPO.note}>{phraseEc}</Text> : null}
                {/* Toutes les lignes, quelle que soit la vue choisie : le niveau 3 ne cache rien. */}
                {rr.map(o => (
                  <View key={o.l} style={{ gap: 2 }}>
                    <Text style={[TYPO.note, { color: couleurs.encre, fontWeight: "600" }]}>{o.v}</Text>
                    <Text style={TYPO.note}>{o.d}</Text>
                  </View>
                ))}
              </Depli>
            </>
          )}

          {/* CE QUI A CHANGE EN UN AN : jamais deux territoires, jamais un jugement */}
          {ex && vue === "evolution" && !evo ? (
            <Vide titre={`Pas d'évolution calculable pour ${nom}.`} corps="Il faut deux exercices publiés qui se suivent, sur le même périmètre. Les comptes publiés ne le permettent pas ici." />
          ) : null}
          {ex && vue === "evolution" && evo && !evo.perimetreChange ? (
            <View style={{ gap: PAS * 3 }}>
              {[1, 0, 2].map(i => evo.lignes[i]).filter(l => l && l.m1 !== null && l.m2 !== null && variation(l.m1, l.m2)).map((l: { libelle: string; m1: number; m2: number; diff: number }) => (
                <VariationAnnuelle key={l.libelle} libelle={l.libelle} an1={evo.an1} an2={evo.an2} pct={variation(l.m1, l.m2) as string}
                  sens={l.m2 > l.m1 ? "hausse" : l.m2 < l.m1 ? "baisse" : "stable"}
                  de={montantCourt(l.m1)?.texte ?? eurosArrondis(l.m1)} vers={montantCourt(l.m2)?.texte ?? eurosArrondis(l.m2)} diffTexte={diffEuros(l.diff)} />
              ))}
            </View>
          ) : null}
          {ex && vue === "evolution" && evo && !evo.perimetreChange ? (
            <Text style={TYPO.micro}>Variations entre {evo.an1} et {evo.an2} : calcul Repère, sur les montants publiés ci-dessous.</Text>
          ) : null}
          {(!ex || vue === "evolution") && evo ? (
            evo.perimetreChange ? (
              <Vide {...perimetreChange(evo, nom)} />
            ) : (
              <Carte echelon="ville" titre={`Ce qui a changé entre ${evo.an1} et ${evo.an2}`}>
                <Text style={TYPO.note}>{INTRO_EVOLUTION}</Text>
                {[1, 0, 2].map(i => evo.lignes[i]).filter(l => l && l.m1 !== null && l.m2 !== null).map((l: { libelle: string; m1: number; m2: number; diff: number }) => (
                  <DeuxAnnees key={l.libelle} libelle={l.libelle} an1={evo.an1} an2={evo.an2} m1={l.m1} m2={l.m2}
                    texte1={montantCourt(l.m1)?.texte ?? eurosArrondis(l.m1)} texte2={montantCourt(l.m2)?.texte ?? eurosArrondis(l.m2)} diffTexte={diffEuros(l.diff)} />
                ))}
                {/* 07/11/2026 : montants courts (« 101,1 M€ ») pour comparer d'un coup d'œil ; l'arrondi est dit. */}
                <Text style={TYPO.micro}>Montants arrondis : M€ = millions d'euros, au dixième près.</Text>
                <Text style={TYPO.micro}>Chaque paire de barres a sa propre échelle : on compare une ligne à elle-même, jamais deux lignes entre elles.</Text>
                <Depli titre="Ce que ça ne veut pas dire (évolution)"><Text style={TYPO.corps}>{NOTE_EVOLUTION}</Text></Depli>
                <PastilleSource source={srcComptes(d)} />
              </Carte>
            )
          ) : null}

          {/* LE DOCUMENT OFFICIEL (maquette Stitch) : les comptes publiés, en lien externe. */}
          {r.index?.sources?.comptes?.url ? (
            <Pressable onPress={() => Linking.openURL(r.index.sources.comptes.url)} accessibilityRole="link"
              accessibilityLabel="Les comptes publiés par l'OFGL, ouvre un site externe"
              style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", ...enfonce(pressed) })}>
              <Text style={[TYPO.corps, { color: couleurs.lien, fontFamily: POLICE.texteGras }]}>Les comptes publiés, sur le site de l'OFGL ↗</Text>
            </Pressable>
          ) : null}

          {/* LES PROJETS AIDES PAR L'ETAT */}
          <View style={{ gap: PAS * 3 }}>
            <View style={{ flexDirection: "row", gap: PAS * 2, alignItems: "center" }}>
              <Text style={[TYPO.question, { flex: 1 }]} accessibilityRole="header">Les projets aidés par l'État</Text>
            </View>
            {!r.projetsLus ? (
              <Vide {...PROJETS_PAS_ARRIVES} action="Réessayer" onAction={reessayer} />
            ) : !listeProjets.length ? (
              <>
                <Vide {...projetsAucun(nom, d.srcProjets && d.srcProjets.exercices, d.srcProjets && d.srcProjets.mis_a_jour_le)} />
                <PastilleSource source={srcProjets(d)} />
              </>
            ) : (
              <>
                {listeProjets.map((p, i) => {
                  const f = financementProjet(p);
                  const cout = f && f.cout ? montantCourt(f.cout) : null;
                  return (
                    <Carte key={i} echelon="ville" titre={`${p.annee} · aide ${aideNommee(r.projets, p.dispositif)}`}>
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
                      {/* 12/11/2026 (audit des doublons) : la phrase « L'État a engagé X € » répétait le montant de la barre ;
                          elle ne reste que si la barre n'est pas affichée (coût non publié). */}
                      {f && f.partPct !== null && cout ? null : <Text style={TYPO.note}>{phraseProjetLocal(p, nom)}</Text>}
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
          {/* 12/11/2026 : « Repère ne compare jamais deux communes » retiré : la même page montre la médiane d'Île-de-France
              (comparaison factuelle permise, D23, ADR 0002). La phrase était devenue fausse. */}
          <SignalerErreur contexte={`l'argent de ${nom}`} donnee={`Argent de la commune : ${nom}`} />
        </Page>
      );
    }} />
  );
}
