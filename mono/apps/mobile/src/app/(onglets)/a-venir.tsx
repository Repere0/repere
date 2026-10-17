/* « CALENDRIER » — le canevas Calendrier, en donnees reelles (13/10/2026).
 *
 * L'agenda est NATIONAL : l'ecran le dit d'emblee. Fichiers republies chaque
 * jour par la chaine, jamais embarques : un calendrier absent ne fait jamais
 * dire « aucune seance annoncee ».
 *
 * CE QUE LE CANEVAS MONTRE, ET CE QU'ON EN FAIT.
 *   - Semaine et mois, pour choisir un jour : ici, les jours portant au moins
 *     une seance publiee ont un point. Le mois se deplie d'un geste.
 *   - Filtre segmente : Tout, Assemblée, Sénat. Les filtres « Décisions » et
 *     « Commune » du canevas ne sont pas branches : aucune donnee publiee.
 *   - Une ligne par texte et par jour, avec l'heure de debut et la fin quand la
 *     source la donne ; sinon « heure de fin non précisée ». Le detail se deplie.
 *   - L'alerte « me prévenir une heure avant » du canevas n'est pas branchee :
 *     l'application le dit, au lieu de promettre un rappel qui ne vient pas.
 *   - La procedure : une entree vers son ecran, comme avant.
 *
 * Par journee, @repere/core (regrouperParJour) : meme regle que le site. */
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router, Stack } from "expo-router";
import {
  AGE_RELEVE_NORMAL, ageReleve, dateFr, ETAPES_LOI, etatJourCalendrier, jourFr, jourParis, LIBELLES, minuteParis, regrouperParJour,
} from "@repere/core";
import { type Ev, type Groupe, deInstitution, etatCommence, horairesDuGroupe, INSTITUTIONS, parametresRendezVous, rendezVousAffiches } from "../../lib/calendrier";
import { Carte, Vide } from "../../lib/composants";
import { AGENDA_PAS_ARRIVE, agendaVide } from "../../lib/absences";
import { srcAgenda } from "../../lib/sources";
import { useCommuneChoisie } from "../../lib/useCommune";
import { couleurs, CIBLE, PAS, POLICE, TYPO } from "../../lib/theme";
import { AvecDonnees, Page, Question } from "../../ui/page";
import { PastilleSource } from "../../ui/source";
import { Depli } from "../../ui/visuels";
import { Plus } from "../../ui/reponse";

const de = deInstitution;
const nbsp = (t: string) => t.replace(/ ([?!:;])/g, " $1");
const LETTRES = ["L", "M", "M", "J", "V", "S", "D"];
const PREMIERS = 6;   /* rendez-vous montres d'emblee dans la liste de deux semaines */

/* Dates en texte « AAAA-MM-JJ », calculees en UTC : aucun decalage de fuseau. */
function decaler(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}
/* Rang du jour dans la semaine, lundi = 0. */
function rangLundi(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
}

/* UNE LIGNE PAR RENDEZ-VOUS, COMPACTE (16/10/2026). Mesure : chaque ligne prenait
   ~220 px (institution, « Séance publique », horaires avec « heure de fin non
   précisée », nombre de séances, repli de l'ordre du jour, lien « Voir le détail ») ;
   l'ecran faisait 5,9 hauteurs d'ecran. Desormais : l'heure, le sujet (trois lignes
   au plus), UNE ligne de contexte, et toute la ligne mene au detail, qui garde tout
   (lieu, horaires et fins, ordre du jour, description, source). */
function Ligne({ g }: { g: Groupe }) {
  const debuts = horairesDuGroupe(g).map(h => h.split(/,| à /)[0].trim()).filter(Boolean);
  const heure = debuts[0] || "";
  const nbPoints = (g.points || []).length;
  const contexte = [
    g.institution === "Assemblée nationale" ? "Assemblée" : g.institution,
    etatCommence(g, minuteParis(new Date())),
    g.categorie && g.categorie !== "Séance publique" ? g.categorie : null,
    heure ? null : "heure non publiée",
    g.seances > 1 ? `${g.seances} séances : ${debuts.join(", ")}` : null,
    nbPoints ? `+ ${nbPoints} point${nbPoints > 1 ? "s" : ""} à l'ordre du jour` : null,
  ].filter(Boolean).join(" · ");
  return (
    <Pressable testID="cal-ligne" accessibilityRole="button"
      accessibilityLabel={`${heure ? heure + ", " : ""}${g.titre}. ${contexte}. Voir le détail et la source`}
      onPress={() => router.push({ pathname: "/evenement", params: parametresRendezVous(g) })}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: PAS * 3, minHeight: CIBLE, paddingVertical: PAS * 3,
        borderTopWidth: 1, borderTopColor: couleurs.trait, opacity: pressed ? 0.6 : 1 })}>
      <View style={{ width: 66, alignSelf: "flex-start" }}>
        <Text style={{ fontFamily: POLICE.affiche, fontSize: 18, lineHeight: 22, color: couleurs.encre, fontVariant: ["tabular-nums"] }}>{heure}</Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        {/* Titre entier (16/10/2026) : tronque, il perdait son contenu en texte agrandi
            (sonde reflow 200 %). */}
        <Text style={[TYPO.reponse, { fontSize: 17, lineHeight: 22 }]}>{g.titre}</Text>
        <Text style={TYPO.micro}>{contexte}</Text>
      </View>
      <Text accessibilityElementsHidden importantForAccessibility="no" style={{ fontSize: 20, color: couleurs.sourd }}>›</Text>
    </Pressable>
  );
}

/* Le jour, au-dessus de ses rendez-vous : sans lui, « 15 h Questions au
   Gouvernement » ne disait pas quel jour (liste de deux semaines). */
function EnteteJour({ iso, aujourdhui }: { iso: string; aujourdhui: string }) {
  const j = jourFr(iso).replace(/ \d{4}$/, "");   /* l'annee en cours n'apprend rien ici */
  return (
    <Text accessibilityRole="header" style={{ fontSize: 15, lineHeight: 20, fontWeight: "800", color: couleurs.encre, paddingTop: PAS * 4, paddingBottom: PAS }}>
      {j.charAt(0).toUpperCase() + j.slice(1)}{iso === aujourdhui ? " · aujourd'hui" : ""}
    </Text>
  );
}

/* Une case de jour, semaine ou mois : le chiffre, et un point s'il y a une seance.
   Son libelle vient du socle (etatJourCalendrier, 17/10/2026) : un jour passe ou au-dela
   de l'agenda publie n'est jamais annonce « 0 », et le mois n'est plus ecrit en dur. */
function Case({ iso, jour, nb, onPress, taille, libelle, passe }: { iso: string; jour: string; nb: number; onPress: () => void; taille: "semaine" | "mois"; libelle: string; passe: boolean }) {
  const choisi = iso === jour;
  const numero = Number(iso.slice(8, 10));
  const grand = taille === "semaine";
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: choisi }}
      accessibilityLabel={libelle}
      style={({ pressed }) => ({ flex: 1, minHeight: grand ? 58 : 42, alignItems: "center", justifyContent: "center", gap: 4, opacity: pressed ? 0.6 : 1 })}>
      {grand ? <Text style={{ fontSize: 13, color: couleurs.sourd, fontWeight: "600" }}>{LETTRES[rangLundi(iso)]}</Text> : null}
      <View style={{ width: grand ? 40 : 34, height: grand ? 40 : 34, borderRadius: 999, alignItems: "center", justifyContent: "center",
        backgroundColor: choisi ? couleurs.encre : "transparent" }}>
        <Text style={{ fontWeight: choisi ? "800" : "600", fontSize: grand ? 20 : 16, color: choisi ? couleurs.sol : passe ? couleurs.sourd : couleurs.encre }}>{numero}</Text>
      </View>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: nb > 0 ? (choisi ? couleurs.encre : couleurs.sourd) : "transparent" }} />
    </Pressable>
  );
}

export default function AVenir() {
  const { reessayer } = useCommuneChoisie();
  /* Filtre par institution : null = les deux. */
  const [institution, setInstitution] = useState<string | null>(null);
  const [jour, setJour] = useState<string>(() => jourParis(new Date()));
  /* Par defaut la liste montre les deux prochaines semaines (une ligne par texte et par
     jour) ; un jour touche la restreint a ce jour, « Deux semaines » revient en arriere. */
  const [choisi, setChoisi] = useState(false);
  const choisirJour = (c: string) => { setJour(c); setChoisi(true); };
  const [mois, setMois] = useState(false);
  return (
    <AvecDonnees rendu={r => {
      const { d } = r;
      /* ce qui a commence aujourd'hui, puis ce qui est a venir (16/10/2026) */
      const toutes = rendezVousAffiches(d as { aVenir?: Ev[]; commenceesAujourdhui?: Ev[] });
      const aVenir = institution ? toutes.filter(e => e.institution === institution) : toutes;
      const lues = ((d.semaineParlement && d.semaineParlement.institutions) || []) as { institution: string; source: Record<string, string> }[];
      const groupes = regrouperParJour(aVenir) as Groupe[];
      const compte: Record<string, number> = {};
      for (const g of groupes) compte[g.jour] = (compte[g.jour] || 0) + 1;
      const duJour = groupes.filter(g => g.jour === jour);
      /* Deux semaines a partir d'aujourd'hui, comme le socle les compte (calendrier.js). */
      const limite = jourParis(new Date(Date.now() + 14 * 864e5));
      const deuxSemaines = groupes.filter(g => g.jour < limite);
      const affiches = choisi ? duJour : deuxSemaines;
      const debutSemaine = decaler(jour, -rangLundi(jour));
      const semaine = Array.from({ length: 7 }, (_, i) => decaler(debutSemaine, i));
      /* Le mois : des cases vides avant le 1er (semaine commencant le lundi). */
      const premier = `${jour.slice(0, 8)}01`;
      const [an, mo] = jour.split("-").map(Number);
      const nbJours = new Date(Date.UTC(an, mo, 0)).getUTCDate();
      const cases: (string | null)[] = [...Array(rangLundi(premier)).fill(null)];
      for (let i = 0; i < nbJours; i++) cases.push(decaler(premier, i));
      while (cases.length % 7) cases.push(null);
      const etiquetteJour = jourFr(jour);
      /* Le dernier jour publie par l'agenda lu (celui du filtre, ou le plus lointain des
         deux) : au-dela, un jour n'est pas « vide », il n'est pas encore publie. */
      const horizon = ((d.semaineParlement && d.semaineParlement.institutions) || [] as { institution: string; jusquau?: string }[])
        .filter((x: { institution: string }) => !institution || x.institution === institution)
        .reduce((max: string, x: { jusquau?: string }) => (x.jusquau && x.jusquau > max ? x.jusquau : max), "");
      const aujourdhui = jourParis(new Date());
      const etatDe = (iso: string) => etatJourCalendrier({ iso, aujourdhui, nb: compte[iso] || 0, horizon });
      const phrase = choisi
        ? etatDe(jour).phrase
        : (deuxSemaines.length
          ? `${deuxSemaines.length} rendez-vous publiés dans les deux prochaines semaines.`
          : "Rien de publié dans les deux prochaines semaines pour ce filtre. Repère n'affiche que ce qui est annoncé ou publié.");
      const manquantes = lues.length ? INSTITUTIONS.filter(i => !lues.some(x => x.institution === i)) : [];
      const vieillis = lues.map(x => ({ ...x, age: ageReleve(x.source && x.source.releve_le) }))
        .filter(x => x.age !== null && x.age > AGE_RELEVE_NORMAL);
      return (
        <Page>
          <Stack.Screen options={{ title: LIBELLES.calendrier }} />
          <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: PAS * 2 }}>
            <View style={{ flex: 1 }}>
              <Question etiquette="Au Parlement" question="Calendrier" />
            </View>
            {/* La bascule semaine / mois sur la ligne du titre (16/10/2026) : a 375 x 667,
               l'en-tete occupait tout le premier ecran. */}
            <Pressable onPress={() => setMois(m => !m)} accessibilityRole="button"
              accessibilityLabel={mois ? "Voir la semaine" : "Voir le mois"}
              style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", opacity: pressed ? 0.6 : 1 })}>
              <Text style={{ color: couleurs.encre, fontWeight: "700", textDecorationLine: "underline" }}>{mois ? "Voir la semaine" : "Voir le mois"}</Text>
            </Pressable>
          </View>
          <Text style={TYPO.note}>Les séances annoncées à l'Assemblée nationale et au Sénat. Elles concernent tout le pays.</Text>

          {!r.agendaLu ? (
            <Vide {...AGENDA_PAS_ARRIVE} action="Réessayer" onAction={reessayer} />
          ) : (
            <>
              {/* LES SEANCES D'ABORD (16/10/2026). Mesure : la premiere seance arrivait a
                 740 px a 390 x 844, sous quatre paragraphes ; a 375 x 667, aucune seance au
                 premier ecran. Rien n'est retire : la bascule semaine / mois rejoint la
                 frise, l'age du releve reste AVANT la liste (invariant 9 : le lecteur sait
                 tout de suite que l'agenda a pu changer), l'absence du Senat suit le compte
                 qu'elle explique, et la note sur les rappels passe sous la liste. */}
              {/* Semaine ou mois : un seul choix de jour, en haut de l'ecran. */}
              {mois ? (
                <View accessibilityRole="none" accessibilityLabel="Calendrier du mois" style={{ gap: 2 }}>
                  <View style={{ flexDirection: "row" }}>
                    {LETTRES.map((l, i) => <Text key={i} style={{ flex: 1, textAlign: "center", color: couleurs.sourd, fontWeight: "600", fontSize: 13 }}>{l}</Text>)}
                  </View>
                  {Array.from({ length: cases.length / 7 }, (_, ligne) => (
                    <View key={ligne} style={{ flexDirection: "row" }}>
                      {cases.slice(ligne * 7, ligne * 7 + 7).map((c, k) => c ? (
                        <Case key={c} iso={c} jour={jour} nb={compte[c] || 0} taille="mois" libelle={etatDe(c).libelle} passe={etatDe(c).etat === "passe"} onPress={() => choisirJour(c)} />
                      ) : <View key={"v" + k} style={{ flex: 1, minHeight: 42 }} />)}
                    </View>
                  ))}
                </View>
              ) : (
                <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
                  {semaine.map(c => <Case key={c} iso={c} jour={jour} nb={compte[c] || 0} taille="semaine" libelle={etatDe(c).libelle} passe={etatDe(c).etat === "passe"} onPress={() => choisirJour(c)} />)}
                </View>
              )}

              {/* Filtre segmente : une seule pastille, trois choix. */}
              <View accessibilityRole="tablist" style={{ flexDirection: "row", gap: 4, padding: 4, borderRadius: 999, backgroundColor: couleurs.trait }}>
                {[{ c: null, t: "Tout" }, { c: "Assemblée nationale", t: "Assemblée" }, { c: "Sénat", t: "Sénat" }].map(o => {
                  const actif = institution === o.c;
                  return (
                    <Pressable key={o.t} onPress={() => setInstitution(o.c)} accessibilityRole="tab"
                      accessibilityState={{ selected: actif }} accessibilityLabel={`Afficher : ${o.c ? o.c : "toutes les institutions"}`}
                      style={{ flex: 1, minHeight: 40, borderRadius: 999, backgroundColor: actif ? couleurs.carte : "transparent", alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ fontWeight: actif ? "800" : "600", color: couleurs.encre }}>{o.t}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {vieillis.map(x => (
                <Text key={"age-" + x.institution} testID="releve-ancien" style={TYPO.note}>
                  {nbsp(`Agenda ${de(x.institution)} relevé le ${dateFr(x.source.releve_le)}, il y a ${x.age} jours : il a pu changer depuis.`)}
                </Text>
              ))}
              {/* Quand une assemblee manque, le compte le dit tout de suite ; la phrase
                 complete suit la liste (16/10/2026 : a 375 x 667, aucune seance n'entrait
                 dans le premier ecran). */}
              <Text style={[TYPO.corps, { fontWeight: "700" }]}>{choisi && etiquetteJour ? `${etiquetteJour}. ` : ""}{manquantes.length === 1 && lues.length ? phrase.replace(/\.$/, `, ${lues[0].institution === "Sénat" ? "au Sénat" : "à l'Assemblée nationale"} seulement.`) : phrase}</Text>
              {choisi ? (
                <Pressable onPress={() => setChoisi(false)} accessibilityRole="button" accessibilityLabel="Revenir à la liste des deux prochaines semaines"
                  style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", opacity: pressed ? 0.6 : 1 })}>
                  <Text style={{ color: couleurs.lien, fontWeight: "700", textDecorationLine: "underline" }}>Voir les deux prochaines semaines</Text>
                </Pressable>
              ) : null}
              {affiches.length ? (
                <Carte echelon="france">
                  {/* Les six prochains d'abord (16/10/2026) ; les autres se deplient, avec
                     leur nombre annonce. Un jour choisi dans la frise montre tout ce jour. */}
                  {(choisi ? affiches : affiches.slice(0, PREMIERS)).map((g, i, liste) => (
                    <View key={g.debut + i}>
                      {i === 0 || liste[i - 1].jour !== g.jour ? <EnteteJour iso={g.jour} aujourdhui={jourParis(new Date())} /> : null}
                      <Ligne g={g} />
                    </View>
                  ))}
                  {!choisi && affiches.length > PREMIERS ? (
                    <Depli titre={`Voir les ${affiches.length - PREMIERS} autres rendez-vous`}>
                      {affiches.slice(PREMIERS).map((g, i, liste) => (
                        <View key={g.debut + i}>
                          {(i === 0 ? affiches[PREMIERS - 1].jour !== g.jour : liste[i - 1].jour !== g.jour) ? <EnteteJour iso={g.jour} aujourdhui={jourParis(new Date())} /> : null}
                          <Ligne g={g} />
                        </View>
                      ))}
                    </Depli>
                  ) : null}
                  <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                    {lues.map(x => <PastilleSource key={x.institution} nom={x.institution === "Sénat" ? "Sénat" : "Assemblée"} source={srcAgenda(x.source)} />)}
                  </View>
                </Carte>
              ) : null}
              {manquantes.map(i => (
                <Text key={i} style={TYPO.note}>{nbsp(`Le calendrier ${de(i)} n'est pas arrivé jusqu'ici : rien n'est inventé à sa place.`)}</Text>
              ))}
              <Text style={TYPO.note}>{"Chaque ligne donne l'heure de début, à l'heure de Paris. Le détail dit l'heure de fin, ou « heure de fin non précisée » quand la source ne la publie pas. Le site officiel de chaque assemblée fait foi. Les rappels ne sont pas encore disponibles dans l'application."}</Text>

              {!aVenir.length && toutes.length ? (
                <Text style={TYPO.note}>Rien de publié pour ce filtre. Le filtre « Tout » montre le reste.</Text>
              ) : null}
              {!toutes.length ? <Vide {...agendaVide(lues.find(x => x.institution === "Assemblée nationale")?.source?.url)} /> : null}
            </>
          )}

          {/* Trois entrees en une liste compacte (16/10/2026 ; etaient trois cartes). */}
          <View>
            <Plus premier texte={`Comment une loi devient loi · ${ETAPES_LOI.length} étapes`} etiquette="Ouvrir : comment une loi devient loi" onPress={() => router.push("/procedure")} />
            <Plus texte="Questions au Gouvernement" etiquette="Ouvrir les Questions au Gouvernement" onPress={() => router.push("/scrutins?mode=qag")} />
            <Plus dernier texte="Dictionnaire citoyen" etiquette="Ouvrir le dictionnaire citoyen" onPress={() => router.push("/dictionnaire")} />
          </View>
        </Page>
      );
    }} />
  );
}
