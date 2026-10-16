/* « QUI DÉCIDE POUR … ? » — UNE QUESTION, UN ECRAN (refonte du 30/09/2026).
 *
 * Une seule metaphore visuelle : une chaine, de chez vous a l'Assemblee, dans
 * les cinq couleurs d'echelon. A chaque maillon : qui (tel que le Repertoire
 * national des elus l'ecrit), et surtout ce que ce niveau DECIDE dans la vie
 * du lecteur (COMPETENCES, @repere/core — les memes phrases que le site).
 * Un niveau sans personne nommee par la source garde sa place et le dit.
 * L'ordre est un ordre de distance, pas d'importance : c'est ecrit. */
import { Pressable, Text, View } from "react-native";
import { router, Stack } from "expo-router";
import { chaineDecision, dateFr, MAIRE_ABSENT, nomIntercommunalite, phraseAdjoints, presidentIntercommunalite, RNE_URL, LIBELLES } from "@repere/core";
import { sansConseilDepartemental } from "@repere/core";
import { LienAction, Segments } from "../../lib/composants";
import { LienDefinition } from "../../lib/termes";
import { REGION_PAS_ARRIVEE } from "../../lib/absences";
import { srcElus } from "../../lib/sources";
import { CIBLE, couleurs, PAS, TYPO } from "../../lib/theme";
import { AvecDonnees, Page, Question } from "../../ui/page";
import { PastilleSource } from "../../ui/source";
import { Chaine, type Niveau } from "../../ui/visuels";
import { prefetDeRegion } from "../../lib/prefet";

/* Ou se situe l'elu : une rangee de cinq points, un par niveau. Point plein : la source
   nomme une personne a ce niveau ; point vide : aucune personne nommee, et le dit. Les
   couleurs sont les cinq couleurs d'echelon (invariant 7), seul endroit ou elles coexistent. */
const LIBELLE_ECHELON: Record<string, string> = { ville: "Ville", agglo: "Agglo", dept: "Dépt", region: "Région", france: "France" };
function Parcours({ niveaux }: { niveaux: Niveau[] }) {
  return (
    <View accessible accessibilityRole="summary"
      accessibilityLabel={niveaux.map(n => `${LIBELLE_ECHELON[n.echelon] || n.echelon} : ${n.personne ? n.personne.nom : "pas de nom affiché"}`).join(". ")}
      style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: PAS }}>
      {niveaux.map((n, i) => (
        <View key={i} importantForAccessibility="no" style={{ flex: 1, alignItems: "center", gap: 6 }}>
          <View style={{ width: 14, height: 14, borderRadius: 7, borderWidth: 2,
            borderColor: (couleurs as Record<string, string>)[n.echelon],
            backgroundColor: n.personne ? (couleurs as Record<string, string>)[n.echelon] : "transparent" }} />
          <Text style={TYPO.micro}>{LIBELLE_ECHELON[n.echelon] || n.echelon}</Text>
        </View>
      ))}
    </View>
  );
}

/* 16/10/2026 (audit Lovable) : « aucune personne nommee » pouvait se lire « personne n'est
   elu ». La raison varie (intercommunalite dont le president vient d'une autre commune ;
   Paris, qui n'a reellement pas de conseil departemental) : la legende renvoie a la note
   du niveau, qui dit la bonne.
   Ce que dit un point vide, seulement s'il y en a un (16/10/2026) : la forme seule ne
   s'explique pas. Le lecteur d'ecran l'entend deja dans le resume du parcours. */
function LegendeParcours({ niveaux }: { niveaux: Niveau[] }) {
  if (niveaux.every(n => n.personne)) return null;
  return <Text style={[TYPO.micro, { textAlign: "center" }]} importantForAccessibility="no" accessibilityElementsHidden>{"Point vide\u00a0: pas de nom affiché à ce niveau. « En savoir plus » dit pourquoi."}</Text>;
}

export default function QuiDecide() {
  return (
    <AvecDonnees rendu={r => {
      const { d } = r;
      const f = d.fiche;
      const brut = chaineDecision({ fiche: f, paquet: r.paquet, index: r.index, deputes: r.deputes, elusRegion: r.elusRegion, dep: d.dep }) as (Niveau & { delegues?: number; autresCircos?: number })[];
      const niveaux: Niveau[] = brut.map(n => {
        if (n.echelon === "ville") {
          return { ...n, pied: n.personne
            ? <View style={{ gap: PAS }}><Text style={TYPO.note}><Segments s={phraseAdjoints(f.adjoints, f.maire.nom)} /></Text><LienDefinition cle="adjoint au maire" /></View>
            : <Text style={TYPO.note}>{MAIRE_ABSENT.titre} {MAIRE_ABSENT.corps}</Text> };
        }
        if (n.echelon === "agglo") {
          /* 07/10/2026 : les precisions propres au territoire (Ile-de-France,
             Metropole du Grand Paris) viennent de @repere/core, comme sur le site.
             16/10/2026 : le nom publie (« Ca Du Pays De Meaux ») s'ecrit « CA du Pays de Meaux ». */
          const precisions = (n as { precisions?: string[] }).precisions || [];
          /* 16/10/2026 : le president, quand le Repertoire le designe parmi les delegues de
             la commune (@repere/core presidentIntercommunalite) ; sinon on dit pourquoi
             aucun nom n'est affiche, sans laisser croire qu'il n'y a pas d'elu. */
          const president = presidentIntercommunalite(f.agglo && f.agglo.delegues);
          return { ...n, personne: president, institution: nomIntercommunalite(n.institution) || n.institution, note: [n.delegues
            ? `Le Répertoire national des élus y liste ${n.delegues} élu${n.delegues > 1 ? "s" : ""} de ${d.nomCommune}. Vous ne l'élisez pas directement : ce sont des conseillers municipaux qui y siègent.`
            : "Le Répertoire national des élus ne porte pas de délégué pour cette commune à son intercommunalité.",
            president ? null : "L'intercommunalité a un président ; Repère n'affiche pas son nom, car il ne figure pas parmi les élus de cette commune que liste le Répertoire.",
            ...precisions].filter(Boolean).join(" ") };
        }
        if (n.echelon === "region" && !n.personne) {
          return { ...n, note: r.regionLue ? "Le Répertoire national des élus ne porte pas de président pour cette région." : REGION_PAS_ARRIVEE };
        }
        if (n.echelon === "dept" && !n.personne) {
          /* 08/10/2026 : certains territoires n'ont REELLEMENT pas de conseil departemental */
          const sans = sansConseilDepartemental(d.dep);
          /* 16/10/2026 : pour ces territoires, la carte affichait en grand « Conseil
             departemental » et « Decide : les colleges… », l'explication n'etant que dans
             le repli. La phrase vraie devient le titre ; « Decide » est retire (il
             contredisait la phrase) ; l'explication et sa source restent a un geste. */
          if (sans) return { ...n, institution: sans.titre, decide: undefined, note: sans.corps, pied: <LienDefinition cle="conseil départemental" /> };
          return { ...n, note: "Le Répertoire national des élus ne porte pas de conseil départemental pour ce territoire.", pied: <LienDefinition cle="conseil départemental" /> };
        }
        if (n.echelon === "france" && d.nbCircos > 1) {
          /* 15/10/2026 : une commune partagee entre plusieurs circonscriptions n'a pas UN
             depute. La chaine ne nomme personne (le premier de la liste serait un choix
             arbitraire) : le depute depend de l'adresse, et Repere ne la demande pas. */
          return { ...n, personne: null, lieu: `${d.nbCircos} circonscriptions`, pied: undefined,
            note: `${d.nomCommune} est partagée entre ${d.nbCircos} circonscriptions. Votre député dépend de votre adresse précise, que Repère ne demande pas : aucun député n'est nommé ici.` };
        }
        if (n.echelon === "france") {
          return { ...n, note: n.autresCircos ? `${d.nomCommune} est partagée entre plusieurs circonscriptions : un seul député est nommé ici.` : undefined,
            pied: n.personne && r.votesLus ? (
              /* Le vote affiche est le plus recent depuis le 07/10/2026 (ordreDesFaits,
                 @repere/core : date, puis numero de scrutin). On dit quand meme sa
                 date : « dernier » ne dirait pas de quand il date. */
              <LienAction texte={d.dernierVote ? `Voir son vote du ${dateFr(d.dernierVote.sc.d)}` : "Voir ses votes"}
                etiquette={d.dernierVote ? `Voir son vote du ${dateFr(d.dernierVote.sc.d)}` : "Voir ses votes"}
                onPress={() => router.push("/vote")} />
            ) : undefined };
        }
        return n;
      });
      const prefet = prefetDeRegion(d.dep);
      return (
        <Page>
          <Stack.Screen options={{ title: LIBELLES.qui }} />
          {/* Sans etiquette ni emoji (16/10/2026) : « Qui décide » etait ecrit trois fois
             (barre haute, etiquette, question). L'introduction tient en une phrase et garde
             ce qu'elle protege : un ordre de distance, pas d'importance (invariant 3). */}
          <Question question={`Qui décide pour ${d.nomCommune} ?`}
            sous="Du plus proche de chez vous au plus lointain : un ordre de distance, pas d'importance." />
          <Parcours niveaux={niveaux} />
          <LegendeParcours niveaux={niveaux} />
          <Chaine niveaux={niveaux} surNom={n => router.push({ pathname: "/elu", params: {
            nom: n.personne ? n.personne.nom : "", role: n.personne ? n.personne.role : "", echelon: n.echelon,
            niveau: n.niveau, institution: n.institution, lieu: n.lieu || "" } })} />
          <PastilleSource source={srcElus(r.srcElus ? { ...r.srcElus, url: r.srcElus.url || RNE_URL } : null)} />
          {prefet ? (
            <Pressable onPress={() => router.push({ pathname: "/elu", params: { nom: prefet.nom, role: prefet.titre, echelon: "", niveau: "L'État", institution: "Préfecture de région", lieu: "Île-de-France" } })}
              accessibilityRole="link" accessibilityLabel={`Voir la fiche de ${prefet.nom}, préfet de la région`}
              style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", opacity: pressed ? 0.6 : 1, gap: PAS })}>
              <Text style={TYPO.etiquette}>L'État · préfet de la région</Text>
              <Text style={[TYPO.reponse, { color: couleurs.lien, textDecorationLine: "underline" }]}>{prefet.nom}</Text>
              <Text style={TYPO.note}>{prefet.titre}, selon la page de la préfecture. Ce n'est pas le préfet de votre département : leur liste n'est pas encore publiée ici.</Text>
            </Pressable>
          ) : null}
        </Page>
      );
    }} />
  );
}
