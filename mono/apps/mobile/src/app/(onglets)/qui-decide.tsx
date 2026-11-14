/* « QUI DÉCIDE POUR … ? » — UNE QUESTION, UN ECRAN (refonte du 30/09/2026).
 *
 * Une seule metaphore visuelle : une chaine, de chez vous a l'Assemblee, dans
 * les cinq couleurs d'echelon. A chaque maillon : qui (tel que le Repertoire
 * national des elus l'ecrit), et surtout ce que ce niveau DECIDE dans la vie
 * du lecteur (COMPETENCES, @repere/core — les memes phrases que le site).
 * Un niveau sans personne nommee par la source garde sa place et le dit.
 * L'ordre est un ordre de distance, pas d'importance : c'est ecrit. */
import { useState } from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { chaineDecision, dateFr, listeFr, MAIRE_ABSENT, ordinal, phraseAdjoints, RNE_URL, LIBELLES } from "@repere/core";
import { sansConseilDepartemental } from "@repere/core";
import { Definitions, LienSortant, Segments } from "../../lib/composants";
import { REGION_PAS_ARRIVEE } from "../../lib/absences";
import { srcElus } from "../../lib/sources";
import { ACCENTS, CIBLE, couleurs, PAS, POLICE, RAYON, TYPO, type Echelon } from "../../lib/theme";
import { SOURCE_EPT, SOURCE_TRANSPORTS_IDF, estMetropoleGrandParis } from "@repere/core";
import { EnClair } from "../../ui/stitch";
import { deputeParNom, groupeDe, useGroupes } from "../../lib/groupes";
import { AvecDonnees, Page, Question } from "../../ui/page";
import { PastilleSource } from "../../ui/source";
import { CarteElu, Chaine, type Niveau } from "../../ui/visuels";
import { Details } from "../../ui/details";
import { prefetDeRegion } from "../../lib/prefet";
import { useSelection } from "../../lib/selection";
import { mandatsTerminesListes } from "../../lib/mandats-termines";
import { useDecoupage } from "../../lib/decoupage";
import { SignalerErreur } from "../../ui/contact";
import { ChoixCirconscription } from "../../ui/choix-circonscription";
import { enfonce } from "../../ui/mouvement";

/* L'AIGUILLEUR EN UN GESTE (maquette Stitch, 09/11/2026) : un sujet de la vie courante ouvre le
   niveau qui en décide. Les phrases reprennent celles de la chaîne (COMPETENCES, @repere/core) et
   les précisions franciliennes déjà sourcées (SOURCE_TRANSPORTS_IDF, SOURCE_EPT) : rien de neuf
   n'est affirmé ici. La bêta couvre l'Île-de-France. */
type Sujet = { cle: string; texte: string; icone: keyof typeof Ionicons.glyphMap; echelon: Echelon; reponse: (mgp: boolean, dep: string) => string; source?: (mgp: boolean, dep: string) => { producteur: string; url: string } | null };
const SUJETS: Sujet[] = [
  { cle: "ecoles", texte: "Écoles", icone: "school-outline", echelon: "ville",
    reponse: () => "L'école primaire et la cantine : la commune. Le collège : le département. Le lycée : la région." },
  { cle: "dechets", texte: "Déchets", icone: "trash-outline", echelon: "agglo",
    reponse: (mgp, dep) => mgp && dep !== "75"
      ? "Les déchets ménagers : l'établissement public territorial dont fait partie votre commune (Repère n'a pas encore son nom)."
      : "Les déchets : l'intercommunalité.",
    source: (mgp, dep) => (mgp && dep !== "75" ? SOURCE_EPT : null) },
  { cle: "transports", texte: "Transports", icone: "bus-outline", echelon: "region",
    reponse: () => "En Île-de-France, les transports en commun sont organisés par Île-de-France Mobilités. Les lycées et les trains du quotidien relèvent de la région.",
    source: () => SOURCE_TRANSPORTS_IDF },
  { cle: "lois", texte: "Lois", icone: "document-text-outline", echelon: "france",
    reponse: () => "Les lois et le budget de l'État : le Parlement, l'Assemblée nationale avec le Sénat. Votre député en est membre." },
];

export default function QuiDecide() {
  const { choix } = useSelection();
  const groupes = useGroupes();
  /* Accordéon : seul l'échelon le plus proche est ouvert au départ (maquette Stitch). */
  const [ouverts, setOuverts] = useState<Set<Echelon>>(() => new Set<Echelon>(["ville"]));
  const [sujet, setSujet] = useState<string | null>(null);
  const basculer = (e: Echelon) => setOuverts(o => { const n = new Set(o); if (n.has(e)) n.delete(e); else n.add(e); return n; });
  /* V59 (bloc 1.1) : le nom de l'intercommunalité vient du découpage officiel quand la fiche ne le porte pas. */
  const decoupage = useDecoupage(choix ? choix.insee : null);
  return (
    <AvecDonnees rendu={r => {
      const { d } = r;
      const f = d.fiche;
      const brut = chaineDecision({ fiche: f, paquet: r.paquet, index: r.index, deputes: r.deputes, elusRegion: r.elusRegion, dep: d.dep }) as (Niveau & { delegues?: number; autresCircos?: number; personnes?: { nom: string; circo: number }[] })[];
      const niveaux: Niveau[] = brut.map(n => {
        if (n.echelon === "ville") {
          return { ...n, photo: n.personne && choix ? { dep: d.dep, cle: "M" + choix.insee } : null, pied: n.personne
            ? <View style={{ gap: PAS }}>
                <Text style={TYPO.note}><Segments s={phraseAdjoints(f.adjoints, f.maire.nom)} /></Text>
                <Definitions s={phraseAdjoints(f.adjoints, f.maire.nom)} />
              </View>
            : <Text style={TYPO.note}>{MAIRE_ABSENT.titre} {MAIRE_ABSENT.corps}</Text> };
        }
        if (n.echelon === "agglo" && !(f.agglo && f.agglo.nom) && decoupage && decoupage.epci) {
          /* V59 : la fiche ne porte pas de nom d'intercommunalité. Le nom vient du découpage officiel, avec sa
             source et sa date. Le RNE n'a pas listé de délégué : la note existante le dit déjà. */
          return { ...n, institution: decoupage.epci.nom, pied: (
            <View style={{ gap: PAS }}>
              <Text style={TYPO.note}>Nom : découpage administratif officiel (Etalab, paquet 6.0.0, publié le 09/03/2026).</Text>
              <LienSortant url="https://github.com/etalab/decoupage-administratif" texte="Source : Etalab, découpage administratif" />
              <Definitions s={[{ t: "intercommunalité", mot: "intercommunalité" }]} />
            </View>
          ), note: "La source ne liste pas l'intercommunalité de cette commune. C'est la source qui est incomplète, pas la commune qui n'en a pas." };
        }
        if (n.echelon === "agglo") {
          /* 07/10/2026 : les precisions propres au territoire (Ile-de-France,
             Metropole du Grand Paris) viennent de @repere/core, comme sur le site. */
          const precisions = (n as { precisions?: string[] }).precisions || [];
          /* D20, lot L2 : le mot « intercommunalité » se definit sous la carte (bouton, cible 44 px). */
          /* D32 : un mandat termine que le RNE porte encore est dit, date et source a l'appui. */
          const termines = choix ? mandatsTerminesListes(choix.insee, (f as { agglo?: { delegues?: { nom?: string }[] } }).agglo?.delegues) : [];
          return { ...n, pied: (
            <View style={{ gap: PAS }}>
              {termines.map(m => (
                <View key={m.nom} style={{ gap: PAS }}>
                  <Text style={TYPO.note}>Mandat terminé le {dateFr(m.fin)}{m.motif ? ` (${m.motif})` : ""} : {m.nomAffiche}, {m.fonction.toLowerCase()}. Le Répertoire national des élus le compte encore dans ce nombre.</Text>
                  <LienSortant url={m.source} texte={`Source : ${m.sourceNom}`} />
                </View>
              ))}
              <Definitions s={[{ t: "intercommunalité", mot: "intercommunalité" }]} />
            </View>
          ), note: [n.delegues === null
            ? "La source ne liste pas l'intercommunalité de cette commune. C'est la source qui est incomplète, pas la commune qui n'en a pas."
            : n.delegues
            ? `Le Répertoire national des élus y liste ${n.delegues} élu${n.delegues > 1 ? "s" : ""} de ${d.nomCommune}. Vous ne l'élisez pas directement : ce sont des conseillers municipaux qui y siègent.`
            : "Le Répertoire national des élus ne porte pas de délégué pour cette commune à son intercommunalité.", ...precisions].join(" ") };
        }
        if (n.echelon === "region" && !n.personne) {
          return { ...n, note: r.regionLue ? "Le Répertoire national des élus ne porte pas de président pour cette région." : REGION_PAS_ARRIVEE };
        }
        if (n.echelon === "dept" && !n.personne) {
          /* 08/10/2026 : certains territoires n'ont REELLEMENT pas de conseil departemental */
          const sans = sansConseilDepartemental(d.dep);
          /* D20, lot L2 : « conseil départemental » se definit sous la carte. */
          return { ...n, pied: <Definitions s={[{ t: "conseil départemental", mot: "conseil départemental" }]} />, note: sans ? `${sans.titre} ${sans.corps}` : "Le Répertoire national des élus ne porte pas de conseil départemental pour ce territoire." };
        }
        if (n.echelon === "france") {
          /* Commune partagée : aucun député n'est désigné (invariant 3). On liste ceux
             que le fichier des députés porte, sans en choisir un. */
          const liste = n.personnes || [];
          /* Le groupe du député, pour que son avatar soit celui de sa fiche (ui/avatar). */
          const dp = n.personne ? deputeParNom(r.deputes, n.personne.nom) : null;
          const partagee = !!n.autresCircos;
          return { ...n, groupe: dp ? groupeDe(dp.ref, groupes) : null, photo: dp && dp.ref ? { dep: dp.dep, cle: dp.ref } : null,
            /* Retour iPhone (11/11/2026) : plusieurs circonscriptions → plus de mur de 18 noms. Le nombre dans
               l'étiquette, un sélecteur dessous ; la liste complète reste dans les données. */
            lieu: partagee ? `${liste.length} circonscriptions` : n.lieu,
            note: partagee ? `${d.nomCommune} est partagée entre plusieurs circonscriptions. Repère ne peut pas dire lequel de ces députés est le vôtre sans votre adresse, que Repère ne demande pas.` : undefined,
            pied: partagee ? <ChoixCirconscription personnes={liste}
                ouvrirFiche={p => router.push({ pathname: "/elu", params: { nom: p.nom, role: p.role || "Député", echelon: "france", niveau: n.niveau, institution: n.institution, lieu: `${ordinal(p.circo)} circonscription` } })} />
              : n.personne && r.votesLus ? (
              /* Le vote affiche est le plus recent depuis le 07/10/2026 (ordreDesFaits,
                 @repere/core : date, puis numero de scrutin). On dit quand meme sa
                 date : « dernier » ne dirait pas de quand il date. */
              <Pressable onPress={() => router.push("/vote")} accessibilityRole="button"
                accessibilityLabel={d.dernierVote ? `Voir son vote du ${dateFr(d.dernierVote.sc.d)}` : "Voir ses votes"}
                style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", ...enfonce(pressed) })}>
                <Text style={[TYPO.corps, { color: couleurs.lien, fontWeight: "600" }]}>{d.dernierVote ? `Voir son vote du ${dateFr(d.dernierVote.sc.d)}` : "Voir ses votes"} ›</Text>
              </Pressable>
            ) : undefined };
        }
        return n;
      });
      const visibles = niveaux;
      const prefet = prefetDeRegion(d.dep);
      return (
        <Page>
          <Stack.Screen options={{ title: LIBELLES.qui }} />
          {/* 12/11/2026 (audit des doublons) : plus d'étiquette « Qui décide », déjà le titre de l'écran et la question. */}
          <Question question={`Qui décide pour ${d.nomCommune} ?`}
            sous="Du plus proche de chez vous au plus lointain. Ce n'est pas un ordre d'importance : c'est un ordre de distance." />
          {/* L'aiguilleur : quatre sujets, un geste chacun. */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: PAS * 2 }}
            accessibilityLabel="Qui s'occupe de quoi : choisissez un sujet">
            {SUJETS.map(x => {
              const on = sujet === x.cle;
              return (
                <Pressable key={x.cle} onPress={() => { setSujet(on ? null : x.cle); if (!on) setOuverts(o => new Set(o).add(x.echelon)); }}
                  accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`${x.texte} : qui s'en occupe ?`}
                  style={({ pressed }) => ({ minHeight: CIBLE, flexDirection: "row", alignItems: "center", gap: PAS * 2, paddingHorizontal: PAS * 4,
                    borderRadius: RAYON.pastille, borderWidth: 1, borderColor: on ? ACCENTS.autorite : couleurs.trait,
                    backgroundColor: on ? ACCENTS.autorite : couleurs.carte, ...enfonce(pressed) })}>
                  <Ionicons name={x.icone} size={18} color={on ? ACCENTS.surAutorite : ACCENTS.autorite} accessible={false} importantForAccessibility="no" />
                  <Text style={[TYPO.corps, { fontFamily: POLICE.texteGras, color: on ? ACCENTS.surAutorite : couleurs.encre }]}>{x.texte}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          {(() => {
            const x = SUJETS.find(y => y.cle === sujet);
            if (!x) return null;
            const mgp = estMetropoleGrandParis(f && f.agglo);
            const src = x.source ? x.source(mgp, d.dep) : null;
            return (
              <View style={{ gap: PAS }}>
                <EnClair texte={x.reponse(mgp, d.dep)} />
                {src ? <LienSortant url={src.url} texte={`Source : ${src.producteur}`} /> : null}
              </View>
            );
          })()}
          {/* Refonte (porteur, 09/11/2026) : un sujet choisi filtre la frise sur son niveau ; le toucher
              à nouveau montre de nouveau tous les niveaux. */}
          {sujet ? (
            <Pressable onPress={() => setSujet(null)} accessibilityRole="button" accessibilityLabel="Montrer tous les niveaux"
              style={({ pressed }) => ({ minHeight: CIBLE, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: PAS * 1.5, ...enfonce(pressed) })}>
              <Ionicons name="close-circle-outline" size={16} color={couleurs.sourd} accessible={false} importantForAccessibility="no" />
              <Text style={[TYPO.note, { color: couleurs.encre }]}>Montrer tous les niveaux</Text>
            </Pressable>
          ) : null}
          <Chaine niveaux={sujet ? visibles.filter(n => n.echelon === (SUJETS.find(y => y.cle === sujet) as Sujet).echelon) : visibles} ouverts={ouverts} basculer={basculer} surNom={n => router.push({ pathname: "/elu", params: {
            nom: n.personne ? n.personne.nom : "", role: n.personne ? n.personne.role : "", echelon: n.echelon,
            niveau: n.niveau, institution: n.institution, lieu: n.lieu || "" } })} />
          <PastilleSource source={srcElus(r.srcElus ? { ...r.srcElus, url: r.srcElus.url || RNE_URL } : null)} />
          {/* 12/11/2026 (porteur) : le préfet est une carte comme les autres élus ; la source et le contrôle
              sont repliés derrière une icône, plus de pavé de texte. La précision « pas le préfet de votre
              département » reste visible : elle empêche une lecture fausse. */}
          {prefet ? (
            <View style={{ gap: PAS * 2 }}>
              <Text style={TYPO.etiquette}>L'État · Préfet de région</Text>
              <CarteElu nom={prefet.nom} role="Préfet de région" echelon="france"
                libelle={`Voir la fiche de ${prefet.nom}, préfet de la région`}
                surPress={() => router.push({ pathname: "/elu", params: { nom: prefet.nom, role: prefet.titre, echelon: "", niveau: "L'État", institution: "Préfecture de région", lieu: "Île-de-France" } })} />
              {/* 14/11/2026 (porteur) : la précision reste écrite (elle évite une lecture fausse) mais discrète : petite, grise. */}
              <Text style={[TYPO.micro, { color: couleurs.sourd }]}>Ce n'est pas le préfet de votre département : leur liste n'est pas encore publiée ici.</Text>
              <Details titre="Source et contrôle">
                <View style={{ gap: PAS }}>
                  <Text style={TYPO.note}>{prefet.titre}. Source : page de la préfecture de région. Dernier contrôle réussi du titre de la page : {prefet.titreControleLe}. La date de nomination n'est pas contrôlée.</Text>
                  <Pressable onPress={() => Linking.openURL(prefet.url)} accessibilityRole="link"
                    accessibilityLabel="Voir la page de la préfecture de région (site officiel)"
                    style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", opacity: pressed ? 0.6 : 1 })}>
                    <Text style={[TYPO.corps, { color: couleurs.lien, fontWeight: "600" }]}>Page de la préfecture de région ↗</Text>
                  </Pressable>
                </View>
              </Details>
            </View>
          ) : null}
          <SignalerErreur contexte={`qui décide pour ${d.nomCommune}`} donnee={`Qui décide : ${d.nomCommune}`} />
        </Page>
      );
    }} />
  );
}
