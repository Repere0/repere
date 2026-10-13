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
 *     source la donne (« fin non publiée » sinon). Le detail se deplie.
 *   - L'alerte « me prévenir une heure avant » du canevas n'est pas branchee :
 *     l'application le dit, au lieu de promettre un rappel qui ne vient pas.
 *   - La procedure : une entree vers son ecran, comme avant.
 *
 * Par journee, @repere/core (regrouperParJour) : meme regle que le site. */
import { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { router, Stack } from "expo-router";
/* L'API « legacy » : c'est la seule qui marche dans Expo Go aujourd'hui (la nouvelle
   API lève une erreur dans Expo Go). À migrer quand Repère passera à un build de développement. */
import * as Calendrier from "expo-calendar/legacy";
import {
  AGE_RELEVE_NORMAL, ageReleve, dateFr, ETAPES_LOI, heureFr, jourFr, jourParis, LIBELLES, regrouperParJour, seancesAgenda,
} from "@repere/core";
import { Carte, Vide } from "../../lib/composants";
import { AGENDA_PAS_ARRIVE, AGENDA_VIDE } from "../../lib/absences";
import { srcAgenda } from "../../lib/sources";
import { useCommuneChoisie } from "../../lib/useCommune";
import { couleurs, CIBLE, PAS, TYPO } from "../../lib/theme";
import { AvecDonnees, Page, Question } from "../../ui/page";
import { PastilleSource } from "../../ui/source";
import { Depli } from "../../ui/visuels";

type Ev = { titre: string; debut: string; institution: string; categorie?: string; lieu?: string; description?: string; source: Record<string, string> };
type Groupe = { jour: string; institution: string; titre: string; debut: string; debuts: string[]; fins?: (string | null)[]; seances: number;
  categorie: string | null; lieu: string | null; points: string[] | null; textesLibres: string[];
  source?: { producteur?: string; url?: string; releve_le?: string } };

const INSTITUTIONS = ["Assemblée nationale", "Sénat"];
const de = (i: string) => (i === "Sénat" ? "du Sénat" : "de l'Assemblée nationale");
const nbsp = (t: string) => t.replace(/ ([?!:;])/g, " $1");
const LETTRES = ["L", "M", "M", "J", "V", "S", "D"];

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
/* Date courte pour la colonne de la frise : « mar. 13 oct. » (13/10/2026). */
const JOURS_COURTS = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
const MOIS_COURTS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
function courtJour(iso: string): { nom: string; num: number; mois: string } {
  const [y, m, d] = iso.split("-").map(Number);
  return { nom: JOURS_COURTS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()], num: d, mois: MOIS_COURTS[m - 1] };
}

function Ligne({ g }: { g: Groupe }) {
  /* espaces insecables dans chaque heure : « 21 h 30 » ne se coupe jamais (vu sur capture) */
  /* debut et fin de chaque seance, au meme rang. Fin absente : on l'ecrit, on ne la
     devine pas (doctrine du vide, invariant 5). */
  const heures = g.debuts.map((x, i) => {
    const debut = heureFr(x);
    if (!debut) return "";
    const fin = g.fins && g.fins[i] ? heureFr(g.fins[i]) : "";
    return (fin ? `${debut} à ${fin}` : `${debut} (fin non publiée)`).replace(/ /g, " ");
  }).filter(Boolean).join(", ");
  return (
    <View testID="cal-ligne" style={{ gap: PAS, paddingTop: PAS * 3, borderTopWidth: 1, borderTopColor: couleurs.trait }}>
      <Text style={[TYPO.corps, { fontWeight: "700" }]}>{heures || "Heure non publiée"}</Text>
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
      {Platform.OS !== "web" && seancesAgenda(g).length ? <AjouterCalendrier g={g} /> : null}
    </View>
  );
}

/* AJOUTER A MON CALENDRIER (beta, 13/10/2026). Un geste du lecteur ; le telephone
   demande son autorisation ; la seance est ecrite dans son calendrier par defaut.
   Repere ne garde rien, ne lit aucun autre evenement. Sans autorisation, rien n'est
   ecrit, et l'ecran le dit. Sur le web, le bouton n'existe pas. */
function AjouterCalendrier({ g }: { g: Groupe }) {
  const [etat, setEtat] = useState<"repos" | "fait" | "refuse" | "echec">("repos");
  const [nombre, setNombre] = useState(0);
  const ajouter = async () => {
    try {
      const autorisation = await Calendrier.requestCalendarPermissionsAsync();
      if (autorisation.status !== "granted") { setEtat("refuse"); return; }
      const agenda = await Calendrier.getDefaultCalendarAsync();
      const seances = seancesAgenda(g);
      for (const s of seances) {
        /* Fin non publiee : la seance dure zero minute, et les notes le disent. */
        await Calendrier.createEventAsync(agenda.id, {
          title: s.titre, startDate: s.debut, endDate: s.fin ?? s.debut, timeZone: "Europe/Paris",
          location: s.lieu ?? undefined, notes: s.notes, url: s.url ?? undefined,
        });
      }
      setNombre(seances.length);
      setEtat("fait");
    } catch {
      setEtat("echec");
    }
  };
  return (
    <View style={{ gap: PAS }}>
      <Pressable onPress={ajouter} accessibilityRole="button" accessibilityLabel="Ajouter cette séance à mon calendrier"
        style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", alignSelf: "flex-start", opacity: pressed ? 0.6 : 1 })}>
        <Text style={{ color: couleurs.lien, fontWeight: "700" }}>Ajouter à mon calendrier ›</Text>
      </Pressable>
      {etat === "fait" ? <Text style={TYPO.note}>{nombre > 1 ? `${nombre} séances ajoutées à votre calendrier.` : "La séance est ajoutée à votre calendrier."}</Text> : null}
      {etat === "refuse" ? <Text style={TYPO.note}>Repère n'a pas l'autorisation d'écrire dans votre calendrier. Vous pouvez l'accorder dans les réglages du téléphone, puis réessayer.</Text> : null}
      {etat === "echec" ? <Text style={TYPO.note}>La séance n'a pas pu être ajoutée. Réessayez.</Text> : null}
    </View>
  );
}

/* Une case de jour, semaine ou mois : le chiffre, et un point s'il y a une seance. */
function Case({ iso, jour, nb, onPress, taille }: { iso: string; jour: string; nb: number; onPress: () => void; taille: "semaine" | "mois" }) {
  const choisi = iso === jour;
  const numero = Number(iso.slice(8, 10));
  const grand = taille === "semaine";
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: choisi }}
      accessibilityLabel={`${numero} octobre, ${nb} élément${nb > 1 ? "s" : ""}`}
      style={({ pressed }) => ({ flex: 1, minHeight: grand ? 58 : 42, alignItems: "center", justifyContent: "center", gap: 4, opacity: pressed ? 0.6 : 1 })}>
      {grand ? <Text style={{ fontSize: 13, color: couleurs.sourd, fontWeight: "600" }}>{LETTRES[rangLundi(iso)]}</Text> : null}
      <View style={{ width: grand ? 40 : 34, height: grand ? 40 : 34, borderRadius: 999, alignItems: "center", justifyContent: "center",
        backgroundColor: choisi ? couleurs.encre : "transparent" }}>
        <Text style={{ fontWeight: choisi ? "800" : "600", fontSize: grand ? 20 : 16, color: choisi ? couleurs.sol : couleurs.encre }}>{numero}</Text>
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
      const toutes = (d.aVenir || []) as Ev[];
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
      const phrase = choisi
        ? (duJour.length
          ? `${duJour.length} rendez-vous ${duJour.length > 1 ? "publiés" : "publié"} ce jour-là.`
          : "Rien de publié pour ce jour et ce filtre. Repère n'affiche que ce qui est annoncé ou publié.")
        : (deuxSemaines.length
          ? `${deuxSemaines.length} rendez-vous publiés dans les deux prochaines semaines.`
          : "Rien de publié dans les deux prochaines semaines pour ce filtre. Repère n'affiche que ce qui est annoncé ou publié.");
      const manquantes = lues.length ? INSTITUTIONS.filter(i => !lues.some(x => x.institution === i)) : [];
      const vieillis = lues.map(x => ({ ...x, age: ageReleve(x.source && x.source.releve_le) }))
        .filter(x => x.age !== null && x.age > AGE_RELEVE_NORMAL);
      /* La frise : un jour par colonne de date, dans l'ordre (les jours sans séance n'ont pas de ligne). */
      const jours = [...new Set(affiches.map(g => g.jour))];
      /* « Comment une loi devient loi » : en haut de l'écran, là où le lecteur la cherche
         quand il ne comprend pas une séance. Elle renvoie à la procédure, sourcée. */
      const carteLoi = (
        <Pressable
          onPress={() => router.push("/procedure")}
          accessibilityRole="button"
          accessibilityLabel="Ouvrir : comment une loi devient loi"
          style={({ pressed }) => ({ minHeight: 52, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: couleurs.trait, backgroundColor: couleurs.carte, opacity: pressed ? 0.6 : 1 })}
        >
          <Text style={{ fontWeight: "700", color: couleurs.encre }}>Comment une loi devient loi</Text>
          <Text style={{ marginTop: 4, color: couleurs.sourd }}>{ETAPES_LOI.length} étapes, du dépôt à la publication, avec la navette.</Text>
        </Pressable>
      );
      return (
        <Page>
          <Stack.Screen options={{ title: LIBELLES.calendrier }} />
          <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: PAS * 2 }}>
            <View style={{ flex: 1 }}>
              <Question etiquette="Au Parlement" question="Calendrier"
                sous="Les séances annoncées à l'Assemblée nationale et au Sénat. Elles concernent tout le pays, pas seulement votre commune." />
            </View>
          </View>
          <Pressable onPress={() => setMois(m => !m)} accessibilityRole="button"
            accessibilityLabel={mois ? "Voir la semaine" : "Voir le mois"}
            style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", alignSelf: "flex-start", opacity: pressed ? 0.6 : 1 })}>
            <Text style={{ color: couleurs.encre, fontWeight: "700", textDecorationLine: "underline" }}>{mois ? "Voir la semaine" : "Voir le mois"}</Text>
          </Pressable>

          {!r.agendaLu ? (
            <Vide {...AGENDA_PAS_ARRIVE} action="Réessayer" onAction={reessayer} />
          ) : (
            <>
              {manquantes.map(i => (
                <Text key={i} style={TYPO.note}>{nbsp(`Le calendrier ${de(i)} n'est pas arrivé jusqu'ici : il n'est pas affiché, et rien n'est inventé à sa place.`)}</Text>
              ))}
              {vieillis.map(x => (
                <Text key={"age-" + x.institution} testID="releve-ancien" style={TYPO.note}>
                  {nbsp(`Agenda ${de(x.institution)} relevé le ${dateFr(x.source.releve_le)}, il y a ${x.age} jours : il a pu changer depuis. Le site officiel fait foi.`)}
                </Text>
              ))}

              {/* Semaine ou mois : un seul choix de jour, en haut de l'ecran. */}
              {mois ? (
                <View accessibilityRole="none" accessibilityLabel="Calendrier du mois" style={{ gap: 2 }}>
                  <View style={{ flexDirection: "row" }}>
                    {LETTRES.map((l, i) => <Text key={i} style={{ flex: 1, textAlign: "center", color: couleurs.sourd, fontWeight: "600", fontSize: 13 }}>{l}</Text>)}
                  </View>
                  {Array.from({ length: cases.length / 7 }, (_, ligne) => (
                    <View key={ligne} style={{ flexDirection: "row" }}>
                      {cases.slice(ligne * 7, ligne * 7 + 7).map((c, k) => c ? (
                        <Case key={c} iso={c} jour={jour} nb={compte[c] || 0} taille="mois" onPress={() => choisirJour(c)} />
                      ) : <View key={"v" + k} style={{ flex: 1, minHeight: 42 }} />)}
                    </View>
                  ))}
                </View>
              ) : (
                <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
                  {semaine.map(c => <Case key={c} iso={c} jour={jour} nb={compte[c] || 0} taille="semaine" onPress={() => choisirJour(c)} />)}
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

              <Text style={[TYPO.corps, { fontWeight: "700" }]}>{choisi && etiquetteJour ? `${etiquetteJour}. ` : ""}{phrase}</Text>
              {choisi ? (
                <Pressable onPress={() => setChoisi(false)} accessibilityRole="button" accessibilityLabel="Revenir à la liste des deux prochaines semaines"
                  style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", opacity: pressed ? 0.6 : 1 })}>
                  <Text style={{ color: couleurs.lien, fontWeight: "700", textDecorationLine: "underline" }}>Voir les deux prochaines semaines</Text>
                </Pressable>
              ) : null}
              <Text style={TYPO.note}>Les alertes « me prévenir une heure avant » ne sont pas encore disponibles dans l'application.</Text>

              {carteLoi}

              {affiches.length ? (
                <Carte echelon="france">
                  {jours.map((j, k) => {
                    const c = courtJour(j);
                    return (
                      <View key={j} testID="cal-jour" style={{ flexDirection: "row", gap: PAS * 3 }}>
                        <View style={{ width: 52, alignItems: "center" }}>
                          <Text style={{ fontSize: 13, color: couleurs.sourd, fontWeight: "600" }}>{c.nom}</Text>
                          <Text style={{ fontSize: 22, color: couleurs.encre, fontWeight: "800" }}>{c.num}</Text>
                          <Text style={{ fontSize: 13, color: couleurs.sourd }}>{c.mois}</Text>
                          {k < jours.length - 1 ? <View style={{ flex: 1, width: 2, minHeight: 16, marginTop: PAS, backgroundColor: couleurs.trait }} /> : null}
                        </View>
                        <View style={{ flex: 1 }}>
                          {affiches.filter(g => g.jour === j).map((g, i) => <Ligne key={g.debut + i} g={g} />)}
                        </View>
                      </View>
                    );
                  })}
                  <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                    {lues.map(x => <PastilleSource key={x.institution} nom={x.institution === "Sénat" ? "Sénat" : "Assemblée"} source={srcAgenda(x.source)} />)}
                  </View>
                </Carte>
              ) : null}

              {!aVenir.length && toutes.length ? (
                <Text style={TYPO.note}>Rien de publié pour ce filtre. Le filtre « Tout » montre le reste.</Text>
              ) : null}
              {!toutes.length ? <Vide {...AGENDA_VIDE} /> : null}
            </>
          )}

          <Pressable
            onPress={() => router.push("/scrutins?mode=qag")}
            accessibilityRole="button"
            accessibilityLabel="Ouvrir les Questions au Gouvernement"
            style={({ pressed }) => ({ minHeight: 52, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: couleurs.trait, backgroundColor: couleurs.carte, opacity: pressed ? 0.6 : 1 })}
          >
            <Text style={{ fontWeight: "700", color: couleurs.encre }}>Questions au Gouvernement</Text>
            <Text style={{ marginTop: 4, color: couleurs.sourd }}>Voir les questions posées et les réponses publiées.</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/dictionnaire")}
            accessibilityRole="button"
            accessibilityLabel="Ouvrir le dictionnaire citoyen"
            style={({ pressed }) => ({ minHeight: 52, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: couleurs.trait, backgroundColor: couleurs.carte, opacity: pressed ? 0.6 : 1 })}
          >
            <Text style={{ fontWeight: "700", color: couleurs.encre }}>Dictionnaire citoyen</Text>
            <Text style={{ marginTop: 4, color: couleurs.sourd }}>Ce que veulent dire les mots du Parlement et des collectivités.</Text>
          </Pressable>
        </Page>
      );
    }} />
  );
}
