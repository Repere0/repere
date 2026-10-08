/* LA SEMAINE AU PARLEMENT, SUR L'ACCUEIL — 07/10/2026 (PR B de la refonte).
 *
 * Meme derivation que le site (#87, @repere/core semaineParlement) : sept jours
 * a partir d'aujourd'hui, un point par seance publique annoncee, et les votes
 * solennels de l'ordre du jour, mot pour mot.
 *
 * Pourquoi ici, alors que l'agenda avait quitte l'accueil le 30/09/2026 (« le
 * mettre parmi les trois reponses aurait laisse croire qu'il concerne la
 * commune ») : il revient SOUS les trois reponses, jamais parmi elles, et la
 * carte dit d'emblee qu'elle parle de tout le pays.
 *
 * Ce que la carte ne dit jamais :
 * - « aucune seance » pour un jour au-dela de l'agenda publie (`annonce`) ;
 * - une semaine complete quand une institution n'est pas arrivee : elle nomme
 *   celle qui manque ;
 * - une heure sans dire qu'elle est celle de Paris, sur un telephone regle
 *   ailleurs (outre-mer) : l'agenda est publie a l'heure de Paris.
 *
 * `testID="semaine-parlement"` : tests/parcours-web.mjs la mesure. */
import { router } from "expo-router";
import { heureFr, jourCourt, jourFr, LIBELLES } from "@repere/core";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AGENDA_PAS_ARRIVE } from "../lib/absences";
import { srcAgenda } from "../lib/sources";
import { couleurs, CIBLE, OMBRE, PAS, RAYON, TYPO } from "../lib/theme";
import { typo } from "./reponse";
import { PastilleSource } from "./source";

type Jour = { date: string; seances: number; annonce: boolean };
type Vote = { debut: string; institution: string; texte: string };
type Semaine = {
  jours: Jour[]; total: number; votesSolennels: Vote[];
  institutions: { institution: string; source: Record<string, string> }[];
};

/* Au-dela de deux votes, la liste deviendrait l'ecran : le reste est dans le calendrier. */
const VOTES_MAX = 2;
const INSTITUTIONS = ["Assemblée nationale", "Sénat"];

const pluriel = (n: number, un: string, plusieurs: string) => `${n} ${n > 1 ? plusieurs : un}`;

function libelleJour(j: Jour) {
  if (j.seances) return `${jourFr(j.date)} : ${pluriel(j.seances, "séance publique", "séances publiques")}`;
  return `${jourFr(j.date)} : ${j.annonce ? "aucune séance publique annoncée" : "agenda pas encore publié"}`;
}

function grouper(votes: Vote[]) {
  const groupes: { cle: string; quand: string; textes: string[] }[] = [];
  for (const v of votes) {
    const cle = v.debut + "|" + v.institution;
    const g = groupes.find(x => x.cle === cle);
    if (g) g.textes.push(v.texte);
    else groupes.push({ cle, quand: `${jourFr(v.debut)}${heureFr(v.debut) ? ", " + heureFr(v.debut) : ""} · ${v.institution}`, textes: [v.texte] });
  }
  return groupes;
}

function horsParis() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone !== "Europe/Paris";
  } catch {
    return false;
  }
}

export function SemaineParlement({ sp, lu, nom }: { sp: Semaine | null | undefined; lu: boolean; nom: string }) {
  const aller = () => router.push("/a-venir");
  if (!lu || !sp || !sp.institutions.length) {
    return (
      <View testID="semaine-parlement" style={s.carte}>
        <Text style={TYPO.etiquette} accessibilityRole="header">Au Parlement cette semaine</Text>
        <Text style={s.phrase}>{typo(AGENDA_PAS_ARRIVE.titre)}</Text>
        <Text style={TYPO.note}>{typo(AGENDA_PAS_ARRIVE.corps)}</Text>
        <Suite onPress={aller} />
      </View>
    );
  }
  const lues = sp.institutions.map(x => x.institution);
  const manquantes = INSTITUTIONS.filter(i => !lues.includes(i));
  const votes = sp.votesSolennels;
  const memeLieu = votes.length && votes.every(v => v.institution === votes[0].institution)
    ? (votes[0].institution === "Sénat" ? "au Sénat" : "à l'Assemblée nationale") : "au Parlement";
  const phrase = votes.length
    ? `${pluriel(votes.length, "vote solennel annoncé", "votes solennels annoncés")} ${memeLieu} cette semaine.`
    : sp.total
      ? `${pluriel(sp.total, "séance publique annoncée", "séances publiques annoncées")} cette semaine.`
      : sp.jours.some(j => j.annonce)
        ? "Aucune séance publique n'est annoncée cette semaine."
        : "L'agenda de cette semaine n'est pas encore publié.";
  const notes = [
    `Cela concerne tout le pays, pas seulement ${nom}.`,
    votes.length ? "Lors d'un vote solennel, chaque député vote à son nom." : null,
    manquantes.length ? `Le calendrier ${manquantes[0] === "Sénat" ? "du Sénat" : "de l'Assemblée nationale"} n'est pas arrivé : seules les séances ${lues[0] === "Sénat" ? "du Sénat" : "de l'Assemblée nationale"} sont comptées.` : null,
    horsParis() ? "Jours et heures à l'heure de Paris, comme l'agenda publié." : null,
  ].filter(Boolean) as string[];

  return (
    <View testID="semaine-parlement" style={s.carte}>
      <Text style={TYPO.etiquette} accessibilityRole="header">Au Parlement cette semaine</Text>
      <Text style={s.phrase}>{typo(phrase)}</Text>

      {/* Sept colonnes egales : a 360 px, 44 px chacune. Le nombre est ecrit pour
          le lecteur d'ecran ; a l'oeil, des points (jamais plus de 4). */}
      <View style={s.bande}>
        {sp.jours.map((j, i) => (
          <View key={j.date} testID="semaine-jour" accessible accessibilityLabel={libelleJour(j)}
            style={[s.jour, i === 0 && s.jourAujourdhui]}>
            <Text style={[s.jourNom, i === 0 && s.encre]}>{i === 0 ? "Auj." : jourCourt(j.date)}</Text>
            <Text style={s.jourNum}>{Number(j.date.slice(8, 10))}</Text>
            <View style={s.points}>
              {j.seances
                ? Array.from({ length: Math.min(j.seances, 4) }, (_, k) => <View key={k} style={s.point} />)
                : <Text style={s.jourNom}>{j.annonce ? "–" : "?"}</Text>}
            </View>
          </View>
        ))}
      </View>

      {/* Deux votes a la meme seance : la date et l'institution une seule fois
          (vu sur capture : « mardi 13 octobre 2026, 15 h » ecrit deux fois). */}
      {grouper(votes.slice(0, VOTES_MAX)).map(g => (
        <View key={g.cle} style={{ gap: PAS * 2 }}>
          <Text style={[TYPO.corps, { fontWeight: "700" }]}>{typo(g.quand)}</Text>
          {g.textes.map((t, i) => <Text key={i} testID="semaine-vote" style={TYPO.corps}>{typo(t)}</Text>)}
        </View>
      ))}
      {votes.length > VOTES_MAX ? (
        <Text style={TYPO.note}>{typo(`Et ${pluriel(votes.length - VOTES_MAX, "autre vote solennel", "autres votes solennels")} dans le calendrier.`)}</Text>
      ) : null}

      {notes.map(n => <Text key={n} style={TYPO.note}>{typo(n)}</Text>)}

      <View style={s.pied}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", flexShrink: 1 }}>
          {sp.institutions.map(x => (
            <PastilleSource key={x.institution} court nom={x.institution === "Sénat" ? "Sénat" : "Assemblée"} source={srcAgenda(x.source)} />
          ))}
        </View>
        <Suite onPress={aller} />
      </View>
    </View>
  );
}

function Suite({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={LIBELLES.calendrier}
      style={({ pressed }) => [s.suite, pressed && { opacity: 0.6 }]}>
      <Text style={s.suiteTexte}>{LIBELLES.calendrier} ›</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  carte: { backgroundColor: couleurs.carte, borderRadius: RAYON.carte, paddingHorizontal: PAS * 4, paddingTop: PAS * 3, gap: PAS * 2, ...OMBRE },
  phrase: { ...TYPO.reponse, fontSize: 19, lineHeight: 25 },
  bande: { flexDirection: "row", gap: PAS },
  jour: { flex: 1, minWidth: 0, alignItems: "center", paddingVertical: PAS * 2, borderRadius: RAYON.bloc, backgroundColor: couleurs.sol, gap: 2 },
  jourAujourdhui: { borderWidth: 1.5, borderColor: couleurs.france },
  jourNom: { fontSize: 13, lineHeight: 18, color: couleurs.sourd },
  encre: { color: couleurs.encre, fontWeight: "700" },
  jourNum: { fontSize: 17, lineHeight: 22, fontWeight: "700", color: couleurs.encre },
  points: { flexDirection: "row", gap: 3, minHeight: 18, alignItems: "center" },
  point: { width: 6, height: 6, borderRadius: 3, backgroundColor: couleurs.france },
  pied: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", columnGap: PAS * 2 },
  suite: { minHeight: CIBLE, justifyContent: "center", marginLeft: "auto" },
  suiteTexte: { fontSize: 15, fontWeight: "700", color: couleurs.lien },
});
