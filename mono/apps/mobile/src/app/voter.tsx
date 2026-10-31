/* VOTER — l'agenda des élections nationales et le guide du vote (V30, bloc 2).
 *
 * Les dates viennent de lib/elections.ts, vérifiées sur service-public.gouv.fr le 30/10/2026.
 * Les élections déjà passées (municipales de mars 2026, sénatoriales de 2026) ne sont pas listées.
 * Le guide ne donne que des règles générales et renvoie au site officiel pour les délais et démarches. */
import { Text, View } from "react-native";
import { Stack } from "expo-router";
import { dateFr } from "@repere/core";
import { LienSortant } from "../lib/composants";
import { ELECTIONS, ELECTIONS_SOURCE, ELECTIONS_VERIFIEES_LE } from "../lib/elections";
import { couleurs, PAS, TYPO } from "../lib/theme";
import { Page, Question } from "../ui/page";

const JOUR = 86400000;

/* Jours entre aujourd'hui et la date (0 = aujourd'hui). Les deux dates sont comptées en UTC, à minuit. */
function joursAvant(iso: string): number {
  const [a, m, j] = iso.split("-").map(Number);
  const now = new Date();
  return Math.round((Date.UTC(a, m - 1, j) - Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) / JOUR);
}

const GUIDE = [
  { titre: "Comment s'inscrire ?", texte: "Vous devez être inscrit sur les listes électorales de votre commune. L'inscription se fait en mairie ou en ligne, avant la date limite fixée par la loi : vérifiez-la sur service-public.fr." },
  { titre: "Comment voter ?", texte: "Présentez-vous au bureau de vote indiqué sur votre carte électorale, avec une pièce d'identité en cours de validité." },
  { titre: "Faire une procuration", texte: "Si vous ne pouvez pas vous déplacer, vous pouvez donner procuration à une personne inscrite sur les listes électorales, qui votera à votre place. La démarche est détaillée sur service-public.fr." },
  { titre: "Trouver mon bureau de vote", texte: "Votre bureau de vote figure sur votre carte électorale. Le site service-public.fr explique aussi comment le retrouver." },
];

export default function Voter() {
  /* La prochaine élection : la plus proche date future. Une élection sans date n'est jamais placée en tête. */
  const datees = ELECTIONS.filter(e => e.date).sort((a, b) => (a.date as string).localeCompare(b.date as string));
  const prochaine = datees.find(e => joursAvant(e.date as string) >= 0) ?? null;
  const dans = prochaine ? joursAvant(prochaine.date as string) : null;

  return (
    <Page>
      <Stack.Screen options={{ title: "Voter" }} />
      <Question etiquette="Élections" question="Voter" sous="Les prochaines élections nationales, et comment voter." />

      <View style={{ gap: PAS * 4 }}>
        <View style={{ gap: PAS * 2 }}>
          <Text style={[TYPO.corps, { fontWeight: "700", color: couleurs.encre }]} accessibilityRole="header">Prochaine élection</Text>
          {prochaine ? (
            <View style={{ gap: PAS }}>
              <Text style={[TYPO.corps, { fontWeight: "700", color: couleurs.encre }]}>{prochaine.titre}</Text>
              <Text style={[TYPO.corps, { color: couleurs.encre }]}>
                {dateFr(prochaine.date as string)}{dans === 0 ? " : c'est aujourd'hui." : dans !== null ? ` : dans ${dans} jour${dans > 1 ? "s" : ""}.` : "."}
              </Text>
              <Text style={[TYPO.note, { color: couleurs.sourd }]}>{prochaine.description}</Text>
            </View>
          ) : (
            <Text style={[TYPO.note, { color: couleurs.sourd }]}>Aucune élection datée n'est à venir dans l'application.</Text>
          )}
        </View>

        <View style={{ gap: PAS * 3 }}>
          <Text style={[TYPO.corps, { fontWeight: "700", color: couleurs.encre }]} accessibilityRole="header">Les élections à venir</Text>
          {ELECTIONS.map(e => (
            <View key={e.type} style={{ gap: PAS }}>
              <Text style={[TYPO.corps, { fontWeight: "700", color: couleurs.encre }]}>{e.titre}</Text>
              <Text style={[TYPO.note, { color: couleurs.sourd }]}>{e.date ? dateFr(e.date) : "Date non fixée"}</Text>
              <Text style={[TYPO.note, { color: couleurs.sourd }]}>{e.description}</Text>
            </View>
          ))}
        </View>

        <View style={{ gap: PAS * 3 }}>
          <Text style={[TYPO.corps, { fontWeight: "700", color: couleurs.encre }]} accessibilityRole="header">Comment voter</Text>
          {GUIDE.map(g => (
            <View key={g.titre} style={{ gap: PAS }}>
              <Text style={[TYPO.corps, { fontWeight: "700", color: couleurs.encre }]}>{g.titre}</Text>
              <Text style={[TYPO.corps, { color: couleurs.encre }]}>{g.texte}</Text>
            </View>
          ))}
        </View>

        <View style={{ gap: PAS }}>
          <LienSortant url={ELECTIONS_SOURCE.url} texte="Le détail des démarches, sur service-public.fr" />
          <Text style={[TYPO.note, { color: couleurs.sourd }]}>
            Source des dates : {ELECTIONS_SOURCE.producteur}, vérifié le {dateFr(ELECTIONS_VERIFIEES_LE)}. Les dates peuvent changer par décret : vérifiez avant de vous déplacer.
          </Text>
        </View>
      </View>
    </Page>
  );
}
