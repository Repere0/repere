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
  chiffresComptes, etatDette, comptesAbsents, comptesIncoherents, comptesInsuffisants, diffEuros, eurosArrondis,
  evolution, exercicesEcartes, financementProjet, INTRO_EVOLUTION, introRapports, montantCourt, noteRattachement,
  NOTE_EVOLUTION, NOTE_FINANCEMENT, nomDispositif, parHabitant, partReperee, perimetreChange, phraseEcartes,
  phraseProjetLocal, rapports, sousTitreRapports, euros, CALCUL_REPERE, LIBELLES,
} from "@repere/core";
import { Carte, Definitions, Vide } from "../lib/composants";
import { PROJETS_PAS_ARRIVES, projetsAucun } from "../lib/absences";
import { srcComptes, srcComptesPublies, srcProjets } from "../lib/sources";
import { useCommuneChoisie } from "../lib/useCommune";
import { couleurs, PAS, TYPO } from "../lib/theme";
import { AvecDonnees, Page, Question } from "../ui/page";
import { DateDonnee } from "../ui/fraicheur";
import { phrasesMoyenne, useMoyenneDepenses } from "../lib/moyenne";
import { PastilleSource } from "../ui/source";
import { Emoji, Resume } from "../ui/resume";
import { BarrePart, Compteur, DeuxAnnees, Depli, Financement, Mois } from "../ui/visuels";
import { PartagerCarte } from "../ui/partage/bouton-partage";
import { ChiffreStory } from "../ui/partage/variantes/chiffre.story";
import { messageChiffre } from "../ui/partage/messages";

type Rapport = { l: string; v: string; d: string };
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
      <Text style={[TYPO.corps, { fontWeight: "700" }]}>{nom} : {valeur.toLocaleString("fr-FR")} € · {p.court}</Text>
      <Text style={TYPO.corps}>{p.position}</Text>
      {/* Audit 5 s : l'explication du calcul se deplie, elle ne s'impose pas. */}
      <Depli titre="Comment est calculée la médiane ?"><Text style={TYPO.corps}>{p.note}</Text></Depli>
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
      const dette = ch && ch.dette !== null ? montantCourt(ch.dette) : null;
      /* Carte de partage du chiffre par habitant : seulement quand le montant et sa source sont publies. */
      const partage = ex && hab && hab.depenses !== null && d.srcComptes
        ? { euros: `${hab.depenses.toLocaleString("fr-FR")} €`, an: ex.an, producteur: d.srcComptes.producteur } : null;
      return (
        /* Audit 5 s (V15) : sansDate, la ligne DateDonnee de l'ecran dit deja la date et la source. */
        <Page sansDate>
          <Stack.Screen options={{ title: LIBELLES.argent }} />
          <Question emoji="💶" etiquette="L'argent de la commune" question={`Où va l'argent de ${nom} ?`} />
          {/* V13 bloc A : la date des comptes et leur anciennete, avec la source. */}
          <DateDonnee quoi="Comptes OFGL" date={r.index?.sources?.comptes?.maj} url={r.index?.sources?.comptes?.url} />

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
              {ch.partSalaires !== null || ch.partInvestissement !== null ? (
                <Carte echelon="ville" titre={`Où vont 100 € dépensés, comptes ${ex.an}`}>
                  {/* 08/10/2026 (audit) : « Deux postes… » s'affichait avec une seule barre
                     (part des salaires absente) ; l'annee des comptes manquait au titre. */}
                  <Resume phrase={ch.partSalaires !== null ? `Sur 100 € dépensés, ${ch.partSalaires} € vont aux salaires des agents.` : `Sur 100 € dépensés, ${ch.partInvestissement} € vont aux investissements.`}
                    enClair="Le reste des dépenses n'est pas détaillé par la source.">
                    {ch.partSalaires !== null ? <BarrePart part={ch.partSalaires} libelle="Salaires des agents" valeur={rap(/salaires/)?.v || ""} /> : null}
                    {ch.partInvestissement !== null ? <BarrePart part={ch.partInvestissement} libelle="Investissements : travaux, équipements…" valeur={rap(/investir/)?.v || ""} delai={120} /> : null}
                  </Resume>
                  <PasCeQueCaDit r={rap(/salaires/)} sujet="salaires" />
                  <PasCeQueCaDit r={rap(/investir/)} sujet="investissements" />
                  <PastilleSource source={srcComptes(d)} />
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
              {ex && etatDette(ex.ex) === "inconnue" ? (
                <Carte echelon="ville" titre={`Sa dette, fin ${ex.an}`}>
                  <Resume phrase={`Non renseignée dans les comptes ${ex.an}.`} />
                  <Text style={TYPO.micro}>Le fichier ne porte pas cette ligne : ce n'est pas un montant nul.</Text>
                  <PastilleSource source={srcComptes(d)} />
                </Carte>
              ) : null}

              {ex && etatDette(ex.ex) === "montant_sans_ratio" && dette ? (
                <Carte echelon="ville" titre={`Sa dette, fin ${ex.an}`}>
                  <Resume phrase={`${nom} doit encore rembourser ${dette}.`} />
                  <Text style={TYPO.micro}>Le ratio en mois de recettes n'est pas calculable : les recettes ne sont pas publiées pour cet exercice.</Text>
                  <PastilleSource source={srcComptes(d)} />
                </Carte>
              ) : null}

              {ch.detteMois !== null && ch.dette !== 0 && dette ? (
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
              {ch.parJour !== null ? (
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
