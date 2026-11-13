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
 *   - Une ligne par texte et par jour : « HHh : titre (institution) », la fin de
 *     seance seulement quand la source la donne. Sans fin publiee, l'heure seule.
 *   - L'alerte « me prévenir une heure avant » du canevas n'est pas branchee :
 *     l'application le dit, au lieu de promettre un rappel qui ne vient pas.
 *   - La procedure : une entree vers son ecran, comme avant.
 *
 * Par journee, @repere/core (regrouperParJour) : meme regle que le site. */
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router, Stack } from "expo-router";
import {
  ageReleve, dateFr, ETAPES_LOI, heureFr, jourFr, jourParis, LIBELLES, regrouperParJour,
} from "@repere/core";
import { Carte, Vide } from "../../lib/composants";
import { Ionicons } from "@expo/vector-icons";
import { AGENDA_PAS_ARRIVE, AGENDA_VIDE } from "../../lib/absences";
import { srcAgenda } from "../../lib/sources";
import { useCommuneChoisie } from "../../lib/useCommune";
import { ACCENTS, couleurs, CIBLE, PAS, POLICE, RAYON, TYPO } from "../../lib/theme";
import { DateDonnee } from "../../ui/fraicheur";
import { Onglets } from "../../ui/stitch";
import { AvecDonnees, Page, Question } from "../../ui/page";
import { PastilleSource } from "../../ui/source";
import { Depli } from "../../ui/visuels";
import { PartagerCarte } from "../../ui/partage/bouton-partage";
import { AgendaStory } from "../../ui/partage/variantes/agenda.story";
import { messageAgenda } from "../../ui/partage/messages";
import { BoutonPartageTexte, ligneSource } from "../../ui/partage/partager-texte";
import { enfonce } from "../../ui/mouvement";

type Ev = { titre: string; debut: string; institution: string; categorie?: string; lieu?: string; description?: string; source: Record<string, string> };
type Groupe = { jour: string; institution: string; titre: string; debut: string; debuts: string[]; fins?: (string | null)[]; seances: number;
  categorie: string | null; lieu: string | null; points: string[] | null; textesLibres: string[] };

const INSTITUTIONS = ["Assemblée nationale", "Sénat"];
const de = (i: string) => (i === "Sénat" ? "du Sénat" : "de l'Assemblée nationale");
const nbsp = (t: string) => t.replace(/ ([?!:;])/g, " $1");
const LETTRES = ["L", "M", "M", "J", "V", "S", "D"];

/* Dates en texte « AAAA-MM-JJ », calculees en UTC : aucun decalage de fuseau. */
function decaler(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}
/* V35 bloc 2 (D68) : les séances d'un même jour dans un seul bloc, dans l'ordre publié. */
function parJour(gs: Groupe[]): [string, Groupe[]][] {
  const m = new Map<string, Groupe[]>();
  for (const g of gs) m.set(g.jour, [...(m.get(g.jour) || []), g]);
  return [...m.entries()];
}
/* Retour iPhone (11/11/2026) : les séances d'un jour se rangent par moment de la journée, d'après l'heure
   PUBLIÉE du premier début (avant 12 h, de 12 h à 17 h 59, 18 h et après). Sans heure publiée : un groupe à
   part, jamais rangé au hasard (doctrine du vide). */
const MOMENTS = ["Matin", "Après-midi", "Soir", "Heure non publiée"] as const;
function momentDe(g: Groupe): (typeof MOMENTS)[number] {
  const m = /T(\d{2}):/.exec(g.debuts[0] || g.debut || "");
  if (!m) return "Heure non publiée";
  const h = Number(m[1]);
  return h < 12 ? "Matin" : h < 18 ? "Après-midi" : "Soir";
}
function parMoment(gs: Groupe[]): [string, Groupe[]][] {
  return MOMENTS.map(mo => [mo, gs.filter(g => momentDe(g) === mo)] as [string, Groupe[]]).filter(([, l]) => l.length);
}
const majuscule = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

/* Rang du jour dans la semaine, lundi = 0. */
function rangLundi(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
}

function Ligne({ g }: { g: Groupe }) {
  /* espaces insecables dans chaque heure : « 21 h 30 » ne se coupe jamais (vu sur capture) */
  /* debut et fin de chaque seance, au meme rang. Fin absente : on l'ecrit, on ne la
     devine pas (doctrine du vide, invariant 5). */
  const heures = g.debuts.map((x, i) => {
    const debut = heureFr(x);
    if (!debut) return "";
    const fin = g.fins && g.fins[i] ? heureFr(g.fins[i]) : "";
    return (fin ? `${debut} à ${fin}` : debut).replace(/ /g, " ");
  }).filter(Boolean).join(", ");
  return (
    /* V35 bloc 2 (D68) : une séance se lit heure > titre > institution ; le jour est porté par le bloc. */
    /* 07/11/2026 : une frise verticale ; à gauche l'icône de l'institution sur un fil, à droite l'heure en chiffres. */
    <View testID="cal-ligne" style={{ flexDirection: "row", gap: PAS * 3 }}>
      <View style={{ alignItems: "center", width: 32 }}>
        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: couleurs.voile, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name={g.institution === "Sénat" ? "library-outline" : "business-outline"} size={16} color={couleurs.encre} accessible={false} importantForAccessibility="no" />
        </View>
        <View style={{ flex: 1, width: 2, backgroundColor: couleurs.trait, marginTop: PAS }} />
      </View>
      <View style={{ flex: 1, gap: 2, paddingBottom: PAS * 2 }}>
      {/* Retour iPhone (11/11/2026) : l'heure ne doit plus écraser le titre. Le titre (17 px, encre) se lit
          d'abord ; l'heure passe dessous, en 13 px gris. */}
      <Text style={TYPO.reponse}>{g.titre}</Text>
      <Text style={[TYPO.donnee, { color: couleurs.sourd }]}>{heures || "Heure non publiée"}</Text>
      <Text style={TYPO.note}>
        {[g.institution, g.categorie, g.lieu, g.seances > 1 ? `${g.seances} séances ce jour-là` : null].filter(Boolean).join(" · ")}
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
      accessibilityLabel={`${jourFr(iso) || numero}, ${nb} élément${nb > 1 ? "s" : ""}`}
      style={({ pressed }) => ({ flex: 1, minHeight: grand ? 58 : 42, alignItems: "center", justifyContent: "center", gap: 4, ...enfonce(pressed) })}>
      {grand ? <Text style={{ fontSize: 14, color: couleurs.sourd, fontWeight: "500" }}>{LETTRES[rangLundi(iso)]}</Text> : null}
      <View style={{ width: grand ? 40 : 34, height: grand ? 40 : 34, borderRadius: 999, alignItems: "center", justifyContent: "center",
        backgroundColor: choisi ? ACCENTS.autorite : "transparent" }}>
        <Text style={{ fontFamily: POLICE.donneeForte, fontSize: grand ? 18 : 15, color: choisi ? ACCENTS.surAutorite : couleurs.encre }}>{numero}</Text>
      </View>
      {/* Un point bien visible sous les jours de séance (porteur, 09/11/2026) : la couleur de
          l'échelon national, celui du Parlement. */}
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: nb > 0 ? couleurs.france : "transparent" }} />
    </Pressable>
  );
}

/* Bouton secondaire discret (retour iPhone, 11/11/2026) : une pilule grise, sans plein ni souligné ; la cible
   reste de 48 px de haut. */
const secondaire = {
  get bouton() { return { minHeight: CIBLE, alignSelf: "flex-start" as const, justifyContent: "center" as const, paddingHorizontal: PAS * 4, borderRadius: 999, backgroundColor: couleurs.voile }; },
  get texte() { return [TYPO.note, { color: couleurs.sourd }]; },
};

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
      /* V34 bloc 6 : rien dans les deux semaines → le dernier rendez-vous deja passe, du meme filtre. */
      const dernierBrut = (d.dernierPasse || null) as Ev | null;
      const dernierPasse = dernierBrut && (!institution || dernierBrut.institution === institution) ? dernierBrut : null;
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
      const aujourdhui = jourParis(new Date());
      const phrase = choisi
        ? (duJour.length
          ? `${duJour.length} rendez-vous ${duJour.length > 1 ? "publiés" : "publié"} ce jour-là.`
          : "Rien de publié pour ce jour et ce filtre. Repère n'affiche que ce qui est annoncé ou publié.")
        : (deuxSemaines.length
          ? `${deuxSemaines.length} rendez-vous ${deuxSemaines.length > 1 ? "publiés" : "publié"} dans les deux prochaines semaines.`
          : dernierPasse
            ? `Pas d'événement à venir. Dernier événement : ${dateFr(dernierPasse.debut.slice(0, 10))}.`
            : "Rien de publié dans les deux prochaines semaines pour ce filtre. Repère n'affiche que ce qui est annoncé ou publié.");
      const manquantes = lues.length ? INSTITUTIONS.filter(i => !lues.some(x => x.institution === i)) : [];
      /* Un seul repere de fraicheur, pour l'ecran : le plus ancien des agendas lus. */
      const ages = lues.map(x => ageReleve(x.source && x.source.releve_le)).filter((a): a is number => a !== null);
      const plusAncien = ages.length ? Math.max(...ages) : null;
      /* V13 bloc A : la date du releve le plus ancien, jamais « mis à jour ». */
      const releveAncien = plusAncien === null ? null
        : (lues.find(x => ageReleve(x.source && x.source.releve_le) === plusAncien)?.source?.releve_le ?? null);
      /* Carte de partage : le premier point affiche, avec la source de son institution. */
      const suivant = affiches[0];
      /* Ce qui est montre dans la carte : les rendez-vous a venir, sinon le dernier passe (jamais en carte de partage). */
      const montres = affiches.length ? affiches : !choisi && dernierPasse ? (regrouperParJour([dernierPasse]) as Groupe[]) : [];
      const lue = suivant ? lues.find(x => x.institution === suivant.institution) : undefined;
      const quand = suivant ? [jourFr(suivant.jour), suivant.institution].filter(Boolean).join(", ") : "";
      return (
        /* Audit 5 s (V15) : sansDate, la ligne DateDonnee de l'ecran dit deja la date et la source. */
        <Page sansDate>
          <Stack.Screen options={{ title: LIBELLES.calendrier, headerRight: () => <BoutonPartageTexte titre={LIBELLES.calendrier} chemin="a-venir"
            source={lues.map(x => ligneSource({ producteur: x.source.producteur_affiche || x.source.producteur, maj: x.source.releve_le })).filter(Boolean).join(" ")} /> }} />
          {/* En-tête compact (porteur, 09/11/2026) : le titre, une ligne qui dit que l'agenda est national,
              puis directement la frise des jours. */}
          <View style={{ gap: PAS }}>
            <Text style={TYPO.question} accessibilityRole="header">Calendrier</Text>
            <Text style={TYPO.note}>Les séances annoncées à l'Assemblée nationale et au Sénat concernent tout le pays.</Text>
          </View>

          {!r.agendaLu ? (
            <Vide {...AGENDA_PAS_ARRIVE} action="Réessayer" onAction={reessayer} />
          ) : (
            <>
              {manquantes.map(i => (
                <Text key={i} style={TYPO.note}>{nbsp(`Le calendrier ${de(i)} n'est pas arrivé jusqu'ici : il n'est pas affiché, et rien n'est inventé à sa place.`)}</Text>
              ))}

              {/* 13/11/2026 (porteur : « trop complexe ») — L'ÉCRAN S'OUVRE SUR UNE RÉPONSE : le prochain rendez-vous, et
                  dans combien de temps. La frise des jours, le mois et les compteurs des filtres ne sont plus affichés
                  d'emblée : le choix d'un jour est replié sous « Choisir un jour ». Un compte à rebours suit une durée
                  (invariant 6) : ce n'est ni un score ni une récompense. */}
              {!choisi && deuxSemaines.length ? (() => {
                const g = deuxSemaines[0];
                const ecart = Math.round((Date.UTC(+g.jour.slice(0, 4), +g.jour.slice(5, 7) - 1, +g.jour.slice(8, 10)) - Date.UTC(+aujourdhui.slice(0, 4), +aujourdhui.slice(5, 7) - 1, +aujourdhui.slice(8, 10))) / 864e5);
                const quandCourt = ecart <= 0 ? "Aujourd'hui" : ecart === 1 ? "Demain" : `Dans ${ecart} jours`;
                const heure = heureFr(g.debuts[0] || g.debut);
                return (
                  <View testID="cal-prochain" accessible accessibilityLabel={`Prochain rendez-vous : ${quandCourt}${heure ? `, ${heure}` : ""}. ${g.titre}. ${g.institution}.`}
                    style={{ gap: PAS * 2, padding: PAS * 6, borderRadius: RAYON.carte + 4, backgroundColor: couleurs.carte }}>
                    <Text style={TYPO.etiquette}>Prochain rendez-vous</Text>
                    <Text style={[TYPO.affiche, { fontSize: 34, lineHeight: 40 }]}>{quandCourt}</Text>
                    <Text style={TYPO.reponse} numberOfLines={3}>{g.titre}</Text>
                    <Text style={TYPO.note}>{[majuscule(jourFr(g.jour) || ""), heure ? heure.replace(/ /g, "\u00a0") : null, g.institution].filter(Boolean).join(" · ")}</Text>
                  </View>
                );
              })() : null}

              {/* Filtre : trois choix, sans compteur (13/11/2026). */}
              <Onglets etiquette="Afficher une institution" actif={institution ?? "tout"} choisir={c => setInstitution(c === "tout" ? null : c)}
                valeurs={[{ cle: "tout", texte: "Tout" }, { cle: "Assemblée nationale", texte: "Assemblée" }, { cle: "Sénat", texte: "Sénat" }]} />

              <Pressable onPress={() => setMois(m => !m)} accessibilityRole="button" accessibilityState={{ expanded: mois }}
                accessibilityLabel={mois ? "Masquer le calendrier du mois" : "Choisir un jour dans le mois"}
                style={({ pressed }) => [secondaire.bouton, { flexDirection: "row", alignItems: "center", gap: PAS * 2 }, pressed && enfonce(true)]}>
                <Ionicons name="calendar-outline" size={16} color={couleurs.sourd} accessible={false} importantForAccessibility="no" />
                <Text style={secondaire.texte}>{mois ? "Masquer le mois" : "Choisir un jour"}</Text>
              </Pressable>
              {mois ? (
                <View accessibilityRole="none" accessibilityLabel="Calendrier du mois" style={{ gap: 2 }}>
                  <View style={{ flexDirection: "row" }}>
                    {LETTRES.map((l, i) => <Text key={i} style={{ flex: 1, textAlign: "center", color: couleurs.sourd, fontWeight: "500", fontSize: 14 }}>{l}</Text>)}
                  </View>
                  {Array.from({ length: cases.length / 7 }, (_, ligne) => (
                    <View key={ligne} style={{ flexDirection: "row" }}>
                      {cases.slice(ligne * 7, ligne * 7 + 7).map((c, k) => c ? (
                        <Case key={c} iso={c} jour={jour} nb={compte[c] || 0} taille="mois" onPress={() => choisirJour(c)} />
                      ) : <View key={"v" + k} style={{ flex: 1, minHeight: 42 }} />)}
                    </View>
                  ))}
                </View>
              ) : null}

              <Text style={[TYPO.corps, { fontWeight: "600" }]}>{choisi && etiquetteJour ? `${etiquetteJour}. ` : ""}{phrase}</Text>
              {choisi ? (
                <Pressable onPress={() => setChoisi(false)} accessibilityRole="button" accessibilityLabel="Revenir à la liste des deux prochaines semaines"
                  style={({ pressed }) => [secondaire.bouton, pressed && enfonce(true)]}>
                  <Text style={secondaire.texte}>Voir les deux prochaines semaines</Text>
                </Pressable>
              ) : null}

              {/* V35 bloc 2 (D68) : un bloc par jour (« Mardi 3 novembre »), puis la source. */}
              {parJour(montres).map(([iso, items]) => (
                <Carte key={iso} echelon="france">
                  <Text accessibilityRole="header" style={[TYPO.corps, { fontWeight: "600" }]}>{iso === aujourdhui ? "Aujourd'hui · " : iso === decaler(aujourdhui, 1) ? "Demain · " : ""}{iso === aujourdhui || iso === decaler(aujourdhui, 1) ? jourFr(iso) : majuscule(jourFr(iso))}</Text>
                  {parMoment(items).map(([moment, liste]) => (
                    <View key={moment} style={{ gap: PAS * 2 }}>
                      <Text accessibilityRole="header" style={TYPO.etiquette}>{moment}</Text>
                      {liste.map((g, i) => <Ligne key={g.debut + i} g={g} />)}
                    </View>
                  ))}
                </Carte>
              ))}
              {montres.length ? (
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {lues.map(x => <PastilleSource key={x.institution} nom={x.institution === "Sénat" ? "Sénat" : "Assemblée"} source={srcAgenda(x.source)} />)}
                </View>
              ) : null}
              <DateDonnee quoi="Relevé de l'agenda" date={releveAncien} testID="maj-agenda" />
              {/* V34 bloc 7 (audit) : la mention passe sous la liste, pour que le premier rendez-vous ne soit pas repousse sous la barre d'onglets. */}
              <Text style={TYPO.note}>Sous réserve de modification : l'agenda peut changer, le site officiel fait foi.</Text>
              {suivant && lue && lue.source.releve_le ? (
                <PartagerCarte etiquette="Partager le premier point affiché"
                  repli={messageAgenda({ titre: suivant.titre, quand, lien: lue.source.url || null })}
                  rendu={ref => <AgendaStory refCarte={ref} titre={suivant.titre} date={quand}
                    source={`Source : ${lue.source.producteur_affiche || lue.source.producteur}, relevé le ${dateFr(lue.source.releve_le)}.`} />} />
              ) : null}

              {!aVenir.length && toutes.length ? (
                <Pressable onPress={() => setInstitution(null)} accessibilityRole="button" accessibilityLabel="Afficher toutes les institutions"
                  style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", ...enfonce(pressed) })}>
                  <Text style={{ color: couleurs.lien, fontWeight: "500" }}>Rien de publié pour ce filtre. Afficher toutes les institutions</Text>
                </Pressable>
              ) : null}
              {!toutes.length && !dernierBrut ? <Vide {...AGENDA_VIDE} /> : null}
            </>
          )}

          <Pressable
            onPress={() => router.push("/procedure")}
            accessibilityRole="button"
            accessibilityLabel="Ouvrir : comment une loi devient loi"
            style={({ pressed }) => ({ minHeight: 52, padding: 16, borderRadius: 14, backgroundColor: couleurs.carte, ...enfonce(pressed) })}
          >
            <Text style={{ fontWeight: "500", color: couleurs.encre }}>Comment une loi devient loi</Text>
            <Text style={{ marginTop: 4, color: couleurs.sourd }}>{ETAPES_LOI.length} étapes, du dépôt à la publication, avec la navette.</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/scrutins?mode=qag")}
            accessibilityRole="button"
            accessibilityLabel="Ouvrir les Questions au Gouvernement"
            style={({ pressed }) => ({ minHeight: 52, padding: 16, borderRadius: 14, backgroundColor: couleurs.carte, ...enfonce(pressed) })}
          >
            <Text style={{ fontWeight: "500", color: couleurs.encre }}>Questions au Gouvernement</Text>
            <Text style={{ marginTop: 4, color: couleurs.sourd }}>Voir les questions posées et les réponses publiées.</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/dictionnaire")}
            accessibilityRole="button"
            accessibilityLabel="Ouvrir le dictionnaire citoyen"
            style={({ pressed }) => ({ minHeight: 52, padding: 16, borderRadius: 14, backgroundColor: couleurs.carte, ...enfonce(pressed) })}
          >
            <Text style={{ fontWeight: "500", color: couleurs.encre }}>Dictionnaire citoyen</Text>
            <Text style={{ marginTop: 4, color: couleurs.sourd }}>Ce que veulent dire les mots du Parlement et des collectivités.</Text>
          </Pressable>
        </Page>
      );
    }} />
  );
}
