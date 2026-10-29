/* « QUI DÉCIDE POUR … ? » — UNE QUESTION, UN ECRAN (refonte du 30/09/2026).
 *
 * Une seule metaphore visuelle : une chaine, de chez vous a l'Assemblee, dans
 * les cinq couleurs d'echelon. A chaque maillon : qui (tel que le Repertoire
 * national des elus l'ecrit), et surtout ce que ce niveau DECIDE dans la vie
 * du lecteur (COMPETENCES, @repere/core — les memes phrases que le site).
 * Un niveau sans personne nommee par la source garde sa place et le dit.
 * L'ordre est un ordre de distance, pas d'importance : c'est ecrit. */
import { Linking, Pressable, Text, View } from "react-native";
import { router, Stack } from "expo-router";
import { chaineDecision, dateFr, MAIRE_ABSENT, phraseAdjoints, RNE_URL, LIBELLES } from "@repere/core";
import { sansConseilDepartemental } from "@repere/core";
import { Definitions, Segments } from "../../lib/composants";
import { REGION_PAS_ARRIVEE } from "../../lib/absences";
import { srcElus } from "../../lib/sources";
import { CIBLE, couleurs, PAS, TYPO } from "../../lib/theme";
import { AvecDonnees, Page, Question } from "../../ui/page";
import { PastilleSource } from "../../ui/source";
import { Chaine, type Niveau } from "../../ui/visuels";
import { prefetDeRegion } from "../../lib/prefet";

export default function QuiDecide() {
  return (
    <AvecDonnees rendu={r => {
      const { d } = r;
      const f = d.fiche;
      const brut = chaineDecision({ fiche: f, paquet: r.paquet, index: r.index, deputes: r.deputes, elusRegion: r.elusRegion, dep: d.dep }) as (Niveau & { delegues?: number; autresCircos?: number })[];
      const niveaux: Niveau[] = brut.map(n => {
        if (n.echelon === "ville") {
          return { ...n, pied: n.personne
            ? <View style={{ gap: PAS }}>
                <Text style={TYPO.note}><Segments s={phraseAdjoints(f.adjoints, f.maire.nom)} /></Text>
                <Definitions s={phraseAdjoints(f.adjoints, f.maire.nom)} />
              </View>
            : <Text style={TYPO.note}>{MAIRE_ABSENT.titre} {MAIRE_ABSENT.corps}</Text> };
        }
        if (n.echelon === "agglo") {
          /* 07/10/2026 : les precisions propres au territoire (Ile-de-France,
             Metropole du Grand Paris) viennent de @repere/core, comme sur le site. */
          const precisions = (n as { precisions?: string[] }).precisions || [];
          /* D20, lot L2 : le mot « intercommunalité » se definit sous la carte (bouton, cible 44 px). */
          return { ...n, pied: <Definitions s={[{ t: "intercommunalité", mot: "intercommunalité" }]} />, note: [n.delegues === null
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
          return { ...n, note: n.autresCircos ? `${d.nomCommune} est partagée entre plusieurs circonscriptions : un seul député est nommé ici.` : undefined,
            pied: n.personne && r.votesLus ? (
              /* Le vote affiche est le plus recent depuis le 07/10/2026 (ordreDesFaits,
                 @repere/core : date, puis numero de scrutin). On dit quand meme sa
                 date : « dernier » ne dirait pas de quand il date. */
              <Pressable onPress={() => router.push("/vote")} accessibilityRole="button"
                accessibilityLabel={d.dernierVote ? `Voir son vote du ${dateFr(d.dernierVote.sc.d)}` : "Voir ses votes"}
                style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", opacity: pressed ? 0.6 : 1 })}>
                <Text style={[TYPO.corps, { color: couleurs.lien, fontWeight: "600" }]}>{d.dernierVote ? `Voir son vote du ${dateFr(d.dernierVote.sc.d)}` : "Voir ses votes"} ›</Text>
              </Pressable>
            ) : undefined };
        }
        return n;
      });
      const prefet = prefetDeRegion(d.dep);
      return (
        <Page>
          <Stack.Screen options={{ title: LIBELLES.qui }} />
          <Question emoji="🏛️" etiquette="Qui décide" question={`Qui décide pour ${d.nomCommune} ?`}
            sous="Du plus proche de chez vous au plus lointain. Ce n'est pas un ordre d'importance : c'est un ordre de distance." />
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
            </Pressable>
          ) : null}
          {prefet ? (
            <View style={{ gap: PAS }}>
              <Text style={TYPO.note}>{prefet.titre}. Ce n'est pas le préfet de votre département : leur liste n'est pas encore publiée ici.</Text>
              <Text style={TYPO.note}>Source : page de la préfecture de région, titre contrôlé le {prefet.titreControleLe}. La date de nomination n'est pas contrôlée.</Text>
              <Pressable onPress={() => Linking.openURL(prefet.url)} accessibilityRole="link"
                accessibilityLabel="Voir la page de la préfecture de région (site officiel)"
                style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", opacity: pressed ? 0.6 : 1 })}>
                <Text style={[TYPO.corps, { color: couleurs.lien, fontWeight: "600" }]}>Page de la préfecture de région ↗</Text>
              </Pressable>
            </View>
          ) : null}
        </Page>
      );
    }} />
  );
}
