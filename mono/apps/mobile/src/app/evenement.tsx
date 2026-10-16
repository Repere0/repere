/* « UN RENDEZ-VOUS » — le détail d'une ligne du calendrier (16/10/2026).
 *
 * Ce qui est répondu d'abord : le sujet, l'institution, le jour et l'horaire.
 * Ensuite, sur le même écran et sans repli : le lieu, l'ordre du jour publié,
 * la description publiée, puis la source avec la date de son relevé.
 *
 * Le rendez-vous se retrouve par (jour, institution, catégorie, titre) dans les
 * données de la commune, relues par le MÊME regroupement que la liste : donc
 * on ouvre exactement la ligne touchée. Si elle n'existe plus (déplacée ou
 * retirée depuis le dernier relevé), on le dit, sans rien inventer. */
import { Text, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { jourFr, regrouperParJour } from "@repere/core";
import { Vide } from "../lib/composants";
import { horairesDuGroupe, type Ev, type Groupe } from "../lib/calendrier";
import { srcAgenda } from "../lib/sources";
import { PAS, TYPO } from "../lib/theme";
import { AvecDonnees, Page, Question } from "../ui/page";
import { PastilleSource } from "../ui/source";
import { Etiquette } from "../ui/resume";

export default function Evenement() {
  const p = useLocalSearchParams<{ jour?: string; institution?: string; categorie?: string; titre?: string }>();
  return (
    <AvecDonnees rendu={r => {
      const toutes = (r.d.aVenir || []) as Ev[];
      const g = (regrouperParJour(toutes) as Groupe[]).find(x =>
        x.jour === p.jour && x.institution === p.institution && (x.categorie || "") === (p.categorie || "") && x.titre === p.titre);
      if (!g) {
        return (
          <Page>
            <Stack.Screen options={{ title: "Rendez-vous" }} />
            <Vide titre="Ce rendez-vous n'est plus dans le calendrier publié."
              corps="Il a pu être déplacé ou retiré depuis le dernier relevé. Repère n'affiche que ce qui est annoncé ou publié." />
          </Page>
        );
      }
      const horaires = horairesDuGroupe(g);
      const sansFin = (g.fins || []).some(f => !f);
      const points = g.points || [];
      return (
        <Page>
          <Stack.Screen options={{ title: "Rendez-vous" }} />
          {/* La question d'abord : le sujet, puis quand, puis qui. */}
          <Question etiquette={g.institution} question={g.titre} sous={jourFr(g.jour)} />

          <View style={{ gap: PAS }}>
            <Etiquette texte="Horaires publiés" />
            {horaires.length ? horaires.map((h, k) => <Text key={k} style={TYPO.corps}>{h}</Text>)
              : <Text style={TYPO.note}>Heure non publiée.</Text>}
          </View>

          <View style={{ gap: PAS * 2 }}>
            {g.categorie ? <Text style={TYPO.corps}>{g.categorie}</Text> : null}
            {g.lieu ? <Text style={TYPO.corps}>Lieu : {g.lieu}</Text> : null}
            {sansFin ? <Text style={TYPO.note}>La source ne publie pas toutes les heures de fin : Repère ne les devine pas.</Text> : null}
            {g.seances > 1 ? <Text style={TYPO.note}>{g.seances} séances ce jour-là, aux horaires ci-dessus.</Text> : null}
          </View>

          {points.length ? (
            <View style={{ gap: PAS * 2 }}>
              <Etiquette texte={points.length > 1 ? `Ordre du jour publié · ${points.length} points` : "Ordre du jour publié"} />
              {points.map((t, k) => <Text key={k} style={TYPO.corps}>• {t}</Text>)}
            </View>
          ) : null}

          {g.textesLibres.length ? (
            <View style={{ gap: PAS * 2 }}>
              <Etiquette texte="Description publiée" />
              {g.textesLibres.map((t, k) => <Text key={k} style={TYPO.corps}>{t}</Text>)}
            </View>
          ) : null}

          <View style={{ gap: PAS * 2 }}>
            <Etiquette texte="D'où vient cette information" />
            <PastilleSource source={srcAgenda(g.source)} />
            <Text style={TYPO.note}>L'agenda peut changer après son relevé. Le site officiel de l'institution fait foi.</Text>
          </View>
        </Page>
      );
    }} />
  );
}
