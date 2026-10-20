/* « UN RENDEZ-VOUS » — le détail d'une ligne du calendrier (16/10/2026).
 *
 * Ce qui est répondu d'abord : le sujet, l'institution, le jour et l'horaire.
 * Ensuite, sur le même écran et sans repli : le lieu, l'ordre du jour publié,
 * la description publiée, puis la date du relevé, écrite, et la source.
 *
 * Le rendez-vous se retrouve par (jour, institution, catégorie, titre) dans les
 * données de la commune, relues par le MÊME regroupement que la liste : donc
 * on ouvre exactement la ligne touchée. Si elle n'existe plus (déplacée ou
 * retirée depuis le dernier relevé), on le dit, sans rien inventer. */
import { Text, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { ageReleve, dateFr, heureFr, jourFr, minuteParis, regrouperParJour } from "@repere/core";
import { Carte, Vide } from "../lib/composants";
import { deInstitution, horairesDuGroupe, rendezVousAffiches, type Ev, type Groupe } from "../lib/calendrier";
import { srcAgenda } from "../lib/sources";
import { couleurs, PAS, POLICE, TYPO } from "../lib/theme";
import { AvecDonnees, Page, Question } from "../ui/page";
import { PastilleSource } from "../ui/source";
import { Etiquette } from "../ui/resume";

export default function Evenement() {
  const p = useLocalSearchParams<{ jour?: string; institution?: string; categorie?: string; titre?: string }>();
  return (
    <AvecDonnees rendu={r => {
      const toutes = rendezVousAffiches(r.d as { aVenir?: Ev[]; commenceesAujourdhui?: Ev[] });
      const g = (regrouperParJour(toutes) as Groupe[]).find(x =>
        x.jour === p.jour && x.institution === p.institution && (x.categorie || "") === (p.categorie || "") && x.titre === p.titre);
      const lues = ((r.d.semaineParlement && r.d.semaineParlement.institutions) || []) as { institution: string; source?: { url?: string } }[];
      const urlAgenda = lues.find(x => x.institution === p.institution)?.source?.url;
      if (!g) {
        return (
          <Page>
            <Stack.Screen options={{ title: "Rendez-vous" }} />
            {/* Doctrine du vide (16/10/2026) : le lien vers l'agenda officiel de l'institution,
                tel que la donnee le publie ; sans adresse connue, pas de lien. */}
            <Vide titre="Ce rendez-vous n'est plus dans le calendrier publié."
              corps="Il a pu être déplacé ou retiré depuis le dernier relevé. Repère n'affiche que ce qui est annoncé ou publié."
              lien={urlAgenda ? { texte: `L'agenda officiel ${deInstitution(p.institution || "")}`, url: urlAgenda } : undefined} />
          </Page>
        );
      }
      const horaires = horairesDuGroupe(g);
      const sansAucuneFin = !(g.fins || []).some(f => f);
      const points = g.points || [];
      /* DENSITE ET FRAICHEUR (16/10/2026). Mesure : « heure de fin non precisee » ecrit
         trois fois, redit en phrase, puis « 3 seances ce jour-la, aux horaires
         ci-dessus » ; et « l'agenda peut changer apres son releve » SANS la date du
         releve (invariant 9 : le lecteur doit voir tout de suite de quand date ce qu'il
         lit). Desormais : les heures sur une ligne quand aucune fin n'est publiee,
         l'absence dite une fois, ce qui a deja commence, et la date du releve. */
      const maintenant = minuteParis(new Date());
      const commencees = g.debuts.filter(x => x < maintenant).map(heureFr).filter(Boolean);
      const releve = g.source && g.source.releve_le;
      const age = ageReleve(releve);
      return (
        <Page>
          <Stack.Screen options={{ title: "Rendez-vous" }} />
          {/* La question d'abord : le sujet, puis quand, puis qui. */}
          <Question etiquette={g.institution} question={g.titre}
            sous={[jourFr(g.jour), g.categorie].filter(Boolean).join(" · ")} />

          <Carte echelon="france">
            <Etiquette texte={g.seances > 1 ? `Horaires publiés · ${g.seances} séances` : "Horaire publié"} />
            {!horaires.length ? <Text style={TYPO.note}>Heure non publiée.</Text>
              : sansAucuneFin ? (
                <>
                  <Text style={{ fontFamily: POLICE.affiche, fontSize: 22, lineHeight: 28, color: couleurs.encre, fontVariant: ["tabular-nums"] }}>
                    {g.debuts.map(heureFr).filter(Boolean).join(" · ")}
                  </Text>
                  <Text style={TYPO.note}>{"Heure de fin non précisée par la source\u00a0: Repère ne la devine pas."}</Text>
                </>
              ) : horaires.map((h, k) => <Text key={k} style={TYPO.corps}>{h}</Text>)}
            {commencees.length ? (
              <Text style={[TYPO.corps, { fontWeight: "700" }]}>
                {/* « seance » pour une seance publique ; sinon « rendez-vous » (commission, audition) */}
                {g.categorie === "Séance publique"
                  ? (commencees.length > 1 ? `Les séances de ${commencees.join(" et ")} ont déjà commencé.` : `La séance de ${commencees[0]} a déjà commencé.`)
                  : (commencees.length > 1 ? `Les rendez-vous de ${commencees.join(" et ")} ont déjà commencé.` : `Le rendez-vous de ${commencees[0]} a déjà commencé.`)}
              </Text>
            ) : null}
            {g.lieu ? <Text style={TYPO.corps}>Lieu : {g.lieu}</Text> : null}
          </Carte>

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

          <View style={{ gap: PAS }}>
            <Text style={TYPO.note}>
              {releve
                ? `Agenda ${deInstitution(g.institution)} relevé le ${dateFr(releve)}${age !== null && age > 0 ? `, il y a ${age} jour${age > 1 ? "s" : ""}` : ""}. Il a pu changer depuis\u00a0: le site officiel fait foi.`
                : "Date du relevé inconnue\u00a0: cet agenda a pu changer. Le site officiel fait foi."}
            </Text>
            <PastilleSource source={srcAgenda(g.source)} />
          </View>
        </Page>
      );
    }} />
  );
}
