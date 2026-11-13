/* « CHEZ VOUS » — RÉPONSES D'ABORD (30/09/2026).
 *
 * La question de l'ecran : « Qu'est-ce que le citoyen apprend en ouvrant
 * Repere ? ». Trois reponses, pas cinq rubriques, qui suivent la progression
 * d'un lecteur qui ne connait rien a la politique locale :
 *   1. ce que l'Etat finance ici        (-> pourquoi, combien : « Où va l'argent »)
 *   (13/11/2026 : l'ordre suit les niveaux de decision : la commune, qui decide, le Parlement, le pays.)
 *   2. qui decide, et avec quel argent  (-> « Où va cet argent ? »)
 *   3. ce qu'a vote le depute           (-> « Comprendre ce vote »)
 * puis, SOUS les trois reponses, la semaine au Parlement (nationale, dite comme
 * telle — ui/semaine.tsx, 07/10/2026), puis « Aller plus loin » : qui decide de
 * quoi, le calendrier, d'ou viennent ces informations.
 *
 * Chaque phrase a ete verifiee contre les donnees (spike du 30/09/2026) :
 * - « a engage » et non « un projet de 726 800 € » : 726 800 € est l'aide,
 *   le projet coute 1 533 500 € ;
 * - une position de vote (pour, contre, abstention), jamais « a participe » :
 *   une donnee de presence est interdite (invariant 8) ;
 * - jamais « dernier vote » : le vote affiche n'est pas forcement le plus
 *   recent d'une meme journee ; on dit sa date ;
 * - une commune partagee entre plusieurs circonscriptions ne se voit jamais
 *   attribuer UN depute : « votre depute depend de votre adresse ».
 *
 * Trois dates, jamais confondues : celle du fait dans la phrase (« en 2025 »,
 * « le 21 juillet 2026 ») ; celle de la source dans la feuille « D'où vient
 * cette information ? » ; celle du traitement par Repere en en-tete.
 *
 * RIEN N'EST CALCULE ICI : @repere/core derive, lib/absences.ts dit les absences. */
import { Ionicons } from "@expo/vector-icons";
import { Pression } from "../../ui/pression";
import { useEffect, useState } from "react";
import { Linking, Text, View } from "react-native";
import { actusFlux, chargerActuellesRss, chargerMairies } from "../../lib/donnees";
import { router, Stack } from "expo-router";
import {
  dateFr, datePublication, decompte, euros, financementProjet, montantCourt, ordinal, parHabitant, phrasePosition,
  repartitionVote, texteDe,
  titreLisible, LIBELLES, copieVoteVide, ETAT_VOTE, estParis,
} from "@repere/core";
import { Vide } from "../../lib/composants";
import { CarteMemoire } from "../../cartes/CarteMemoire";
import { useSelection } from "../../lib/selection";
import { useCommuneChoisie } from "../../lib/useCommune";
import {
  PROJETS_PAS_ARRIVES, projetsAucun,
} from "../../lib/absences";
import { srcComptesPublies, srcElus, srcProjets, srcScrutins, srcVote } from "../../lib/sources";
import { couleurs, CIBLE, PAS, POLICE, RAYON, TYPO } from "../../lib/theme";
import { ArrondissementParis } from "../../ui/arrondissement-paris";
import { AvecDonnees, Page } from "../../ui/page";
import { PastilleSource } from "../../ui/source";
import { BandeauRepere } from "../../ui/bandeau-repere";
import { repereDuJourPour } from "../../lib/repere-jour";
import { Etiquette } from "../../ui/resume";
import { Plus, Reponse, typo } from "../../ui/reponse";
import { BarrePart, Repartition } from "../../ui/visuels";
import { SemaineParlement } from "../../ui/semaine";
import { DateDonnee } from "../../ui/fraicheur";
import { CetteSemaineCommune, aujourdhui } from "../../ui/cette-semaine-commune";
import { SignalerErreur } from "../../ui/contact";

/* VOS DÉCIDEURS (maquette Stitch, 09/11/2026) : composant partagé avec l'accueil (ui/decideurs). */
import { Decideurs } from "../../ui/decideurs";
import { RappelElection } from "../../ui/rappel-election";
import { BarreBudget, ChiffreQuiCompte } from "../../ui/visuels";
import { deputeParNom, groupeDe, useGroupes } from "../../lib/groupes";
import { DataBadge } from "../../ui/donnees";
import { useCouleurVote } from "../../lib/couleur-vote";
const MOTS_VOTE: Record<string, string> = { p: "Pour", c: "Contre", a: "Abstention" };

/* LE SITE OFFICIEL DE LA MAIRIE (D28, ADR 0005) : un lien externe, lu dans l'annuaire DILA
   (data/mairies-idf.json). Sans adresse declaree, pas de ligne : rien n'est devine.
   D84 : pas de ligne quand la commune a des actualites de flux publiees (la carte les
   montre, avec son propre lien vers le site). Le libelle reste celui de l'ADR 0005 : ce
   n'est pas une page d'actualites, rien ne dit qu'elle en a. */
function SiteMairie({ insee }: { insee: string }) {
  const [site, setSite] = useState<string | null>(null);
  const [avecFlux, setAvecFlux] = useState(false);
  useEffect(() => {
    let vivant = true;
    chargerMairies().then(r => {
      const c = r.donnees ? (r.donnees as { communes?: Record<string, { site?: string }> }).communes?.[insee] : undefined;
      if (vivant) setSite(c && typeof c.site === "string" && /^https?:\/\//.test(c.site) ? c.site : null);
    }).catch(() => {});
    chargerActuellesRss().then(r => {
      if (vivant) setAvecFlux(actusFlux(r.donnees, insee, aujourdhui()).length > 0);
    }).catch(() => {});
    return () => { vivant = false; };
  }, [insee]);
  if (!site || avecFlux) return null;
  return <Plus texte="Site officiel de la mairie" onPress={() => Linking.openURL(site)} />;
}

/* « DUPONT-MARTIN » du répertoire des élus -> « Dupont-Martin » : le nom n'est pas crié. Prénom laissé tel quel. */
const nomPropre = (n: string) => n.replace(/\p{Lu}{2,}/gu, m => m.charAt(0) + m.slice(1).toLowerCase());

/* Une étape de la décision du budget : son numéro, ce qui se passe, et qui (ou comment). */
function EtapeBudget({ n, titre, detail }: { n: number; titre: string; detail?: string | null }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: PAS * 3 }} accessible accessibilityLabel={`Étape ${n} : ${titre}${detail ? `. ${detail}` : ""}`}>
      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: couleurs.voile, alignItems: "center", justifyContent: "center" }}>
        <Text style={[TYPO.note, { fontFamily: POLICE.section, color: couleurs.encre }]}>{n}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[TYPO.corps, { fontFamily: POLICE.titre }]}>{titre}</Text>
        {detail ? <Text style={TYPO.note}>{detail}</Text> : null}
      </View>
    </View>
  );
}

export default function ChezVous() {
  const { choix } = useSelection();
  const { reessayer } = useCommuneChoisie();
  const COULEUR = useCouleurVote();
  const groupes = useGroupes();
  return (
    <AvecDonnees rendu={r => {
      const { d } = r;
      const nom = d.nomCommune;
      const publie = datePublication(r.index);
      const depIndex = r.index.departements.find((x: { code: string }) => x.code === d.dep);
      const projet = d.dernierProjet;
      const f = projet ? financementProjet(projet.p) : null;
      const cout = f && f.cout ? montantCourt(f.cout) : null;
      const nbProjets = r.projetsLus ? (d.faits || []).filter((x: { type: string }) => x.type === "projet").length : 0;
      const vote = d.dernierVote;
      const rep = vote ? repartitionVote(vote.sc) : null;
      const hab = d.exercice ? parHabitant(d.exercice.ex) : null;
      /* LE REPÈRE DU JOUR (V51, V52) : le bandeau et sa page lisent les mêmes faits (lib/repere-jour). */
      const { faits: repereDuJour, sources: sourcesRepere } = repereDuJourPour(r, nom, choix ? choix.insee : "", "france");
      const maire = d.fiche && d.fiche.maire && d.fiche.maire.nom ? d.fiche.maire.nom : null;
      /* Refonte (porteur, 09/11/2026) : le texte voté, en clair, sous la phrase ; la position dans une
         pastille aux couleurs du vote (le mot reste écrit). Commune partagée : pas de député désigné. */
      const contexteVote = vote && d.nbCircos <= 1 ? (
        <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: PAS * 2 }}>
          {MOTS_VOTE[vote.position] ? <DataBadge texte={MOTS_VOTE[vote.position]} couleur={COULEUR[vote.position as keyof typeof COULEUR]} /> : null}
          <Text style={[TYPO.corps, { fontFamily: POLICE.titre, flex: 1 }]} numberOfLines={2}>{titreLisible(vote.sc.t)}</Text>
        </View>
      ) : null;
      /* La répartition de 100 € : seulement si salaires et investissements sont publiés et tiennent dans les dépenses. */
      const parts = hab && hab.depenses && hab.salaires !== null && hab.investissement !== null && hab.salaires + hab.investissement <= hab.depenses
        ? (() => { const sal = Math.round(hab.salaires / hab.depenses * 100), inv = Math.round(hab.investissement / hab.depenses * 100); return { sal, inv, aut: 100 - sal - inv }; })() : null;
      return (
        <Page sansDate>
          {/* VARIANTE A (porteur, 11/11/2026) : le nom de la commune en grand titre, le territoire au-dessus,
             la date de publication dessous. La barre haute ne répète plus le nom. */}
          <Stack.Screen options={{ title: "" }} />
          <View>
            <Text style={TYPO.etiquette}>{[depIndex && depIndex.nom, depIndex && depIndex.region].filter(Boolean).join(" · ")}</Text>
            <Text style={TYPO.affiche} accessibilityRole="header">{nom}</Text>
            {/* « Publication » et non « mis a jour » : vraie dans les trois etats de l'invariant 9. */}
            <DateDonnee quoi="Publication Repère" date={publie} testID="date-donnee" />
          </View>

          <View style={{ gap: PAS * 3 }}>
          {/* LE REPÈRE DU JOUR (V52, D139, V54 / D147) — UNE LIGNE, AU-DESSUS des trois réponses.
             Le bandeau ne montre que le premier fait, tronqué ; un geste ouvre la page complète.
             V54 : zone tactile 44 px ; marges réduites (bandeau -> R1 : 4 px ; entre réponses : 2 px)
             pour que la troisième réponse reste à 843 px à 390 x 844 (BLOCAGES §58). */}
          <View style={{ paddingBottom: PAS / 2 }}>
            <BandeauRepere faits={repereDuJour} sources={sourcesRepere} onOuvrir={() => router.push("/repere-du-jour")} />
          </View>
          {/* PARIS (13/11/2026) : la Ville entière, et le choix d'un arrondissement, avant les chiffres. */}
          {choix && estParis(choix.insee) ? <ArrondissementParis /> : null}
          <Etiquette texte="Votre commune" />
          {/* 1. QUI DECIDE, ET AVEC QUEL ARGENT — montant par habitant PUBLIE par
             l'OFGL ; le nom du maire vient du RNE : deux sources, deux pastilles.
             « prépare / vote » est la regle du code general des collectivites. */}
          {d.exercice && hab && hab.depenses !== null ? (
            <Reponse echelon="ville" heros sur={`Dépenses ${d.exercice.an} · par habitant`}
              preuve={<View style={{ gap: PAS * 4 }}>
                <ChiffreQuiCompte valeur={hab.depenses} etiquette={`${hab.depenses.toLocaleString("fr-FR")} euros`} style={[TYPO.chiffre, { fontSize: TYPO.chiffre.fontSize * 1.75, lineHeight: TYPO.chiffre.lineHeight * 1.6, letterSpacing: -2 }]}
                  suffixe={<Text style={{ fontSize: TYPO.chiffre.fontSize, color: couleurs.sourd }}>{"\u00a0"}€</Text>} />
                {parts ? <BarreBudget parts={parts} /> : null}
              </View>}
              phrase={`En ${d.exercice.an}, ${nom} a dépensé ${hab.depenses.toLocaleString("fr-FR")} € par habitant.`}
              note={<View style={{ gap: PAS * 3 }}>
                {/* 13/11/2026 (porteur) : « Le maire, X, prépare le budget » / « Le conseil municipal le vote » étaient lus
                    comme une phrase bancale et un pronom sans objet. Deux étapes numérotées, dans les mots de la loi
                    (code général des collectivités territoriales, art. L. 2312-1 : proposé par le maire, voté par le conseil). */}
                <Text style={TYPO.etiquette}>Qui décide de ce budget</Text>
                <EtapeBudget n={1} titre="Le maire propose le budget" detail={maire ? nomPropre(maire) : null} />
                <EtapeBudget n={2} titre="Le conseil municipal vote ce budget" detail="Les élus de la commune l'adoptent ou le rejettent." />
              </View>}
              sources={<>
                <PastilleSource court nom="Budget" source={srcComptesPublies(d)} />
                {maire ? <PastilleSource court nom="Élus" source={srcElus(r.srcElus)} /> : null}
              </>}
              partage={{
                titre: `Les dépenses de ${nom}`,
                texte: `À ${nom}, ${d.exercice.an}, la commune a dépensé ${hab.depenses.toLocaleString("fr-FR")} € par habitant. Le maire propose ce budget ; le conseil municipal le vote.`,
                sourceUrl: srcComptesPublies(d)?.url,
              }}
              suite={{ texte: "Où va cet argent ?", onPress: () => router.push("/argent") }} />
          ) : (
            <Reponse echelon="ville"
              phrase={`Les comptes de ${nom} ne permettent pas de dire combien la commune dépense par habitant.`}
              suite={{ texte: "Pourquoi ?", onPress: () => router.push("/argent") }} />
          )}

          {/* 13/11/2026 (porteur) : l'ordre suit les niveaux de décision, du plus proche au plus lointain. D'abord la
             commune (le budget, ce que l'État y finance, l'actualité locale), puis qui décide à chaque niveau, puis
             le Parlement (le vote du député et la semaine, ensemble), enfin le pays (la présidentielle). Avant :
             budget, vote, projet, décideurs, présidentielle, Parlement. */}
          {/* 2. CE QUE L'ETAT FINANCE ICI — la part se dit en mots pres d'un repere
             vrai, sinon en euros ; le cout est arrondi dans la phrase et exact
             dans la note. */}
          {!r.projetsLus ? (
            <Vide {...PROJETS_PAS_ARRIVES} action="Réessayer" onAction={reessayer} />
          ) : projet && f ? (
            /* Refonte (porteur, 09/11/2026) : la carte la plus visuelle possible. Le montant de l'aide en grand
               (IBM Plex Mono), la barre de la part de l'État, une ligne de description. Le montant est celui
               de l'AIDE de l'État, jamais présenté comme le coût du projet. */
            <Reponse echelon="ville"
              phrase={f.partPct !== null && cout
                ? `L'État finance ${f.partPct} % du coût annoncé d'un projet à ${nom}.`
                : `L'État apporte une aide à un projet à ${nom}.`}
              preuve={
                <View style={{ gap: PAS }}>
                  <View style={{ flexDirection: "row", alignItems: "baseline", flexWrap: "wrap", columnGap: PAS * 2 }}>
                    {/* 26 / 30 px : la 3e réponse de Meaux reste dans le premier écran de 844 px (mesuré). */}
                    <Text style={TYPO.stat}>{euros(f.subvention)}</Text>
                    <Text style={TYPO.note}>{cout ? `d'aide, sur ${cout.texte} annoncés` : "d'aide de l'État"}</Text>
                  </View>
                  {f.partPct !== null ? <BarrePart sansLibelle part={f.partPct} libelle="Part de l'État dans le coût annoncé" valeur={`${f.partPct} € sur 100 €`} /> : null}
                </View>}
              note={<Text style={TYPO.note} numberOfLines={1}>{typo(`« ${projet.p.intitule} » : ${euros(f.subvention)} engagés par l'État en ${projet.p.annee}${f.cout ? ` sur ${euros(f.cout)} annoncés` : ""}.`)}</Text>}
              sources={<PastilleSource court source={srcProjets(d, f.partPct !== null)} />}
              partage={{
                titre: `Une information sur ${nom}`,
                texte: f.partPct !== null && cout
                  ? `À ${nom} : l'État finance ${euros(f.subvention)} d'un projet de ${cout.texte}. Cela représente ${f.partPct} % du coût annoncé.`
                  : `À ${nom} : l'État apporte ${euros(f.subvention)} à un projet.`,
                sourceUrl: srcProjets(d, f.partPct !== null)?.url,
              }}
              suite={{ texte: nbProjets > 1 ? `${nbProjets} projets aidés` : "Le projet", onPress: () => router.push("/argent") }} />
          ) : (
            <Reponse echelon="ville" phrase={projetsAucun(nom, d.srcProjets && d.srcProjets.exercices, d.srcProjets && d.srcProjets.mis_a_jour_le).titre} note={projetsAucun(nom, d.srcProjets && d.srcProjets.exercices, d.srcProjets && d.srcProjets.mis_a_jour_le).corps}
              sources={<PastilleSource court source={srcProjets(d)} />} />
          )}

          {/* D31 : l'actu locale de la semaine (communes pilotes), avec la commune. */}
          {choix ? <CetteSemaineCommune insee={choix.insee} nom={nom} /> : null}

          {/* QUI DÉCIDE, À CHAQUE NIVEAU : les deux élus les plus proches, puis toute la chaîne à un geste. */}
          <Decideurs maire={maire} depute={vote && d.nbCircos <= 1 ? vote.qui : null} circo={vote && d.nbCircos <= 1 ? vote.circo : null}
            groupeDepute={vote ? groupeDe(vote.ref, groupes) : null}
            photos={{ maire: maire && choix ? { dep: d.dep, cle: "M" + choix.insee } : null,
              depute: vote && vote.ref ? { dep: deputeParNom(r.deputes, vote.qui)?.dep ?? d.dep, cle: vote.ref } : null }} />
          <Pression onPress={() => router.push("/qui-decide")} etiquette="Tous les niveaux qui décident pour vous : commune, intercommunalité, département, région, État"
            style={{ minHeight: CIBLE + 4, flexDirection: "row", alignItems: "center", gap: PAS * 3, paddingHorizontal: PAS * 4, paddingVertical: PAS * 3, borderRadius: RAYON.bloc, backgroundColor: couleurs.carte }}>
            <Ionicons name="layers-outline" size={22} color={couleurs.encre} accessible={false} importantForAccessibility="no" />
            <View style={{ flex: 1 }}>
              <Text style={[TYPO.corps, { fontFamily: POLICE.titre }]}>Tous les niveaux qui décident</Text>
              <Text style={TYPO.note}>Commune, intercommunalité, département, région, État</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={couleurs.sourd} accessible={false} importantForAccessibility="no" />
          </Pression>

          <Etiquette texte="Au Parlement" />
          {/* 3. A L'ASSEMBLEE NATIONALE — une position, jamais une presence ; une
             date, jamais « dernier » ; plusieurs circonscriptions, jamais UN depute. */}
          {!r.votesLus ? (
            <Vide {...copieVoteVide(ETAT_VOTE.RELEVE_NON_LU)} action="Réessayer" onAction={reessayer} />
          ) : !r.votesFiables ? (
            <Vide {...copieVoteVide(ETAT_VOTE.RELEVE_INCOHERENT)} />
          ) : vote ? (
            <Reponse echelon="france"
              phrase={d.nbCircos > 1
                ? `${nom} est partagée entre ${d.nbCircos} circonscriptions. Votre député dépend de votre adresse.`
                : `Le ${dateFr(vote.sc.d)}, ${texteDe(phrasePosition(vote.position, vote.qui))}`}
              preuve={rep ? <View style={{ gap: PAS }}>{contexteVote}<Repartition compact segments={rep.segments} total={rep.total} position={vote.position} qui={vote.qui} /></View> : contexteVote}
              note={d.nbCircos > 1
                ? `Une circonscription est une partie du territoire dont les électeurs élisent un député. Par exemple, dans la ${ordinal(vote.circo)}, le ${dateFr(vote.sc.d)}, ${texteDe(phrasePosition(vote.position, vote.qui)).replace(/\.$/, "")} (texte ${vote.sc.s}).`
                /* DEUX LIGNES AU PLUS SUR L'ACCUEIL — 07/10/2026. Le vote affiche est
                   desormais le plus recent ; pour Meaux, son intitule officiel est plus
                   long et repoussait la troisieme reponse sous le pli (mesure CI : 861 px
                   pour 844). Le resultat et le decompte viennent EN TETE, jamais coupes ;
                   l'intitule suit, non reecrit, et peut etre coupe : le texte entier est
                   sur « Comprendre ce vote », a un geste. */
                : <Text style={TYPO.note} numberOfLines={2}>{typo(`${ordinal(vote.circo)} circonscription · ${vote.sc.s.charAt(0).toUpperCase()}${vote.sc.s.slice(1)}, ${decompte(vote.sc.dec)}`)}</Text>}
              sources={<PastilleSource court source={srcVote(d, vote.sc)} />}
              partage={{
                titre: `Un vote concernant ${nom}`,
                texte: d.nbCircos > 1
                  ? `${nom} est partagée entre ${d.nbCircos} circonscriptions. Votre député dépend de votre adresse. Exemple : dans la ${ordinal(vote.circo)}, le ${dateFr(vote.sc.d)}, ${texteDe(phrasePosition(vote.position, vote.qui)).replace(/\.$/, "")}.`
                  : `${nom} est dans la ${ordinal(vote.circo)} circonscription. Le ${dateFr(vote.sc.d)}, ${texteDe(phrasePosition(vote.position, vote.qui))}`,
                sourceUrl: srcVote(d, vote.sc)?.url,
              }}
              suite={{ texte: "Comprendre ce vote", onPress: () => router.push("/vote") }} />
          ) : (
            <Vide {...copieVoteVide(d.etatVote, { nom, releve: srcScrutins(d)?.releve, portee: d.srcScrutins && d.srcScrutins.portee })} />
          )}
          {/* LA SEMAINE AU PARLEMENT : juste sous le vote du député, dans la même rubrique (13/11/2026). Elle reste
             sous les trois réponses (tests/parcours-web.mjs) et dit qu'elle est nationale (ui/semaine.tsx). */}
          <SemaineParlement sp={d.semaineParlement} lu={r.agendaLu} nom={nom} />

          <Etiquette texte="Le pays" />
          <RappelElection />
          </View>

          {/* ALLER PLUS LOIN — liens simples. « Actualités » reste : c'est le seul acces a son
             ecran (tests/parcours.test.mjs, aucune impasse), meme vide. Le retirer est une
             decision produit (BLOCAGES.md, section 15). */}
          <View style={{ gap: PAS * 3, marginTop: PAS * 4, marginBottom: PAS * 4 }}>
            <Etiquette texte="Aller plus loin" />
            {/* 07/11/2026 : des tuiles à icône, deux par ligne, au lieu d'une liste de liens. */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: PAS * 3 }}>
              {([
                { t: "Présidentielle 2027", i: "flag-outline", o: () => router.push("/presidentielle-2027") },
                { t: "L'Assemblée", i: "business-outline", o: () => router.push("/scrutins") },
                { t: "Pour vous", i: "bookmark-outline", o: () => router.push("/pour-vous") },
                { t: "Élus", i: "people-outline", o: () => router.push("/elus") },
                { t: "Voir les actualités", i: "newspaper-outline", o: () => router.push("/actus") },
                { t: "Dictionnaire citoyen", i: "book-outline", o: () => router.push("/dictionnaire") },
                { t: LIBELLES.sources, i: "link-outline", o: () => router.push("/sources") },
              ] as { t: string; i: keyof typeof Ionicons.glyphMap; o: () => void }[]).map(x => (
                <Pression key={x.t} onPress={x.o} etiquette={x.t}
                  style={{ width: "47%", minWidth: 140, flexGrow: 1, minHeight: 92, gap: PAS * 2, padding: PAS * 4, borderRadius: RAYON.bloc, backgroundColor: couleurs.carte, justifyContent: "space-between" }}>
                  <Ionicons name={x.i} size={22} color={couleurs.encre} accessible={false} importantForAccessibility="no" />
                  <Text style={[TYPO.corps, { fontFamily: POLICE.titre }]}>{x.t}</Text>
                </Pression>
              ))}
            </View>
            {choix ? <SiteMairie insee={choix.insee} /> : null}
          </View>

          {choix ? <CarteMemoire choix={choix} /> : null}
          <Text style={TYPO.note}>Repère ne classe ni ne note personne, et ne compare jamais deux communes.</Text>
          <SignalerErreur contexte={`la fiche de ${nom}`} donnee={`Fiche commune : ${nom}`} />
        </Page>
      );
    }} />
  );
}
