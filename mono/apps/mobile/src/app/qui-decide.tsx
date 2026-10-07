/* « QUI DÉCIDE POUR … ? » — UNE QUESTION, UN ECRAN (refonte du 30/09/2026).
 *
 * Une seule metaphore visuelle : une chaine, de chez vous a l'Assemblee, dans
 * les cinq couleurs d'echelon. A chaque maillon : qui (tel que le Repertoire
 * national des elus l'ecrit), et surtout ce que ce niveau DECIDE dans la vie
 * du lecteur (COMPETENCES, @repere/core — les memes phrases que le site).
 * Un niveau sans personne nommee par la source garde sa place et le dit.
 * L'ordre est un ordre de distance, pas d'importance : c'est ecrit. */
import { Pressable, Text } from "react-native";
import { router, Stack } from "expo-router";
import { chaineDecision, dateFr, MAIRE_ABSENT, phraseAdjoints, RNE_URL, LIBELLES } from "@repere/core";
import { Segments } from "../lib/composants";
import { REGION_PAS_ARRIVEE } from "../lib/absences";
import { srcElus } from "../lib/sources";
import { CIBLE, couleurs, TYPO } from "../lib/theme";
import { AvecDonnees, Page, Question } from "../ui/page";
import { PastilleSource } from "../ui/source";
import { Chaine, type Niveau } from "../ui/visuels";

export default function QuiDecide() {
  return (
    <AvecDonnees rendu={r => {
      const { d } = r;
      const f = d.fiche;
      const brut = chaineDecision({ fiche: f, paquet: r.paquet, index: r.index, deputes: r.deputes, elusRegion: r.elusRegion, dep: d.dep }) as (Niveau & { delegues?: number; autresCircos?: number })[];
      const niveaux: Niveau[] = brut.map(n => {
        if (n.echelon === "ville") {
          return { ...n, pied: n.personne
            ? <Text style={TYPO.note}><Segments s={phraseAdjoints(f.adjoints, f.maire.nom)} /></Text>
            : <Text style={TYPO.note}>{MAIRE_ABSENT.titre} {MAIRE_ABSENT.corps}</Text> };
        }
        if (n.echelon === "agglo") {
          return { ...n, note: n.delegues
            ? `${d.nomCommune} y envoie ${n.delegues} élu${n.delegues > 1 ? "s" : ""}. Vous ne l'élisez pas directement : ce sont des conseillers municipaux qui y siègent.`
            : "Le Répertoire national des élus ne porte pas de délégué pour cette commune à son intercommunalité." };
        }
        if (n.echelon === "region" && !n.personne) {
          return { ...n, note: r.regionLue ? "Le Répertoire national des élus ne porte pas de président pour cette région." : REGION_PAS_ARRIVEE };
        }
        if (n.echelon === "dept" && !n.personne) {
          return { ...n, note: "Le Répertoire national des élus ne porte pas de conseil départemental pour ce territoire." };
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
      return (
        <Page>
          <Stack.Screen options={{ title: LIBELLES.qui }} />
          <Question emoji="🏛️" etiquette="Qui décide" question={`Qui décide pour ${d.nomCommune} ?`}
            sous="Du plus proche de chez vous au plus lointain. Ce n'est pas un ordre d'importance : c'est un ordre de distance." />
          <Chaine niveaux={niveaux} />
          <PastilleSource source={srcElus(r.srcElus ? { ...r.srcElus, url: r.srcElus.url || RNE_URL } : null)} />
        </Page>
      );
    }} />
  );
}
