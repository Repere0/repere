/* « LE CALENDRIER » — deplace de l'accueil le 30/09/2026, lu par journee le 07/10/2026.
 *
 * L'agenda est NATIONAL : l'ecran le dit d'emblee. Fichiers republies chaque
 * jour par la chaine, jamais embarques : un calendrier absent ne fait jamais
 * dire « aucune seance annoncee ».
 *
 * PAR JOURNEE (PR D, meme regle que le site, @repere/core regrouperParJour) :
 * l'ecran ne montrait que 3 rendez-vous. Il montre maintenant les deux
 * prochaines semaines, une ligne par texte et par jour (« 9 h, 15 h, 21 h 30 »),
 * l'intitule de la premiere seance mot pour mot, les autres points de l'ordre
 * du jour comptes puis listes mot pour mot ; le reste est replie, et le repli
 * dit combien il contient. Une institution absente est nommee ; un releve de
 * plus d'un jour le dit, avec sa date (invariant 9). */
import { router, Stack } from "expo-router";
import {
  AGE_RELEVE_NORMAL, ageReleve, dateFr, heureFr, jourFr, jourParis, LIBELLES, regrouperParJour,
} from "@repere/core";
import { Pressable, Text, View } from "react-native";
import { Carte, Vide } from "../lib/composants";
import { AGENDA_PAS_ARRIVE, AGENDA_VIDE } from "../lib/absences";
import { srcAgenda } from "../lib/sources";
import { useCommuneChoisie } from "../lib/useCommune";
import { couleurs, PAS, TYPO } from "../lib/theme";
import { AvecDonnees, Page, Question } from "../ui/page";
import { PastilleSource } from "../ui/source";
import { Depli } from "../ui/visuels";

type Ev = { titre: string; debut: string; institution: string; categorie?: string; lieu?: string; description?: string; source: Record<string, string> };
type Groupe = { jour: string; institution: string; titre: string; debut: string; debuts: string[]; seances: number;
  categorie: string | null; lieu: string | null; points: string[] | null; textesLibres: string[] };

const INSTITUTIONS = ["Assemblée nationale", "Sénat"];
const de = (i: string) => (i === "Sénat" ? "du Sénat" : "de l'Assemblée nationale");
const nbsp = (t: string) => t.replace(/ ([?!:;])/g, " $1");

function Ligne({ g }: { g: Groupe }) {
  /* espaces insecables dans chaque heure : « 21 h 30 » ne se coupe jamais (vu sur capture) */
  const heures = g.debuts.map(x => heureFr(x).replace(/ /g, "\u00a0")).filter(Boolean).join(", ");
  return (
    <View testID="cal-ligne" style={{ gap: PAS, paddingTop: PAS * 3, borderTopWidth: 1, borderTopColor: couleurs.trait }}>
      <Text style={[TYPO.corps, { fontWeight: "700" }]}>{jourFr(g.debut)}{heures ? ` · ${heures}` : ""}</Text>
      <Text style={TYPO.etiquette}>{g.institution}</Text>
      <Text style={[TYPO.corps, { fontWeight: "600" }]}>{g.titre}</Text>
      <Text style={TYPO.note}>
        {[g.categorie, g.lieu, g.seances > 1 ? `${g.seances} séances ce jour-là` : null].filter(Boolean).join(" · ")}
      </Text>
      {g.points && g.points.length ? (
        <Depli titre={`+ ${g.points.length} ${g.points.length > 1 ? "autres points" : "autre point"} à l'ordre du jour`}>
          {g.points.map((p, k) => <Text key={k} style={TYPO.note}>• {p}</Text>)}
        </Depli>
      ) : null}
      {g.textesLibres.length ? (
        <Depli titre="En savoir plus">
          {g.textesLibres.map((t, k) => <Text key={k} style={TYPO.note}>{t}</Text>)}
        </Depli>
      ) : null}
    </View>
  );
}

export default function AVenir() {
  const { reessayer } = useCommuneChoisie();
  return (
    <AvecDonnees rendu={r => {
      const { d } = r;
      const aVenir = (d.aVenir || []) as Ev[];
      const lues = ((d.semaineParlement && d.semaineParlement.institutions) || []) as { institution: string; source: Record<string, string> }[];
      /* deux semaines depliees, le reste replie ; deux semaines vides : les 5 suivants */
      const limite = jourParis(new Date(Date.now() + 14 * 864e5));
      let proches = aVenir.filter(e => e.debut.slice(0, 10) < limite);
      let plusTard = aVenir.filter(e => e.debut.slice(0, 10) >= limite);
      if (!proches.length) { proches = plusTard.slice(0, 5); plusTard = plusTard.slice(5); }
      const gProches = regrouperParJour(proches) as Groupe[];
      const gTard = regrouperParJour(plusTard) as Groupe[];
      const manquantes = lues.length ? INSTITUTIONS.filter(i => !lues.some(x => x.institution === i)) : [];
      const vieillis = lues.map(x => ({ ...x, age: ageReleve(x.source && x.source.releve_le) }))
        .filter(x => x.age !== null && x.age > AGE_RELEVE_NORMAL);
      return (
        <Page>
          <Stack.Screen options={{ title: LIBELLES.calendrier }} />
          <Question etiquette="Au Parlement" question="Qu'est-ce qui arrive ?"
            sous="Les séances annoncées à l'Assemblée nationale et au Sénat. Elles concernent tout le pays, pas seulement votre commune." />
          <Pressable
            onPress={() => router.push("/scrutins?mode=qag")}
            accessibilityRole="button"
            accessibilityLabel="Ouvrir les Questions au Gouvernement"
            style={{ minHeight: 52, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: couleurs.trait, backgroundColor: couleurs.carte }}
          >
            <Text style={{ fontWeight: "700", color: couleurs.encre }}>Questions au Gouvernement</Text>
            <Text style={{ marginTop: 4, color: couleurs.sourd }}>Voir les questions posées et les réponses publiées.</Text>
          </Pressable>
          {!r.agendaLu ? (
            <Vide {...AGENDA_PAS_ARRIVE} action="Réessayer" onAction={reessayer} />
          ) : aVenir.length ? (
            <Carte echelon="france" titre="Les deux prochaines semaines">
              {manquantes.map(i => (
                <Text key={i} style={TYPO.note}>{nbsp(`Le calendrier ${de(i)} n'est pas arrivé jusqu'ici : il n'est pas affiché, et rien n'est inventé à sa place.`)}</Text>
              ))}
              {vieillis.map(x => (
                <Text key={"age-" + x.institution} testID="releve-ancien" style={TYPO.note}>
                  {nbsp(`Agenda ${de(x.institution)} relevé le ${dateFr(x.source.releve_le)}, il y a ${x.age} jours : il a pu changer depuis. Le site officiel fait foi.`)}
                </Text>
              ))}
              {gProches.map((g, i) => <Ligne key={g.debut + i} g={g} />)}
              {plusTard.length ? (
                <Depli titre={`Plus tard : ${plusTard.length} rendez-vous jusqu'au ${dateFr(plusTard[plusTard.length - 1].debut.slice(0, 10))}`}>
                  {gTard.map((g, i) => <Ligne key={"t" + g.debut + i} g={g} />)}
                </Depli>
              ) : null}
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {lues.map(x => <PastilleSource key={x.institution} nom={x.institution === "Sénat" ? "Sénat" : "Assemblée"} source={srcAgenda(x.source)} />)}
              </View>
            </Carte>
          ) : (
            <Vide {...AGENDA_VIDE} />
          )}
        </Page>
      );
    }} />
  );
}
