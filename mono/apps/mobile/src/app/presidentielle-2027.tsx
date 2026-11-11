/* « PRÉSIDENTIELLE 2027 » (porteur, 09/11/2026) : une page temporaire, jusqu'au second tour.
 *
 * 11/11/2026 (Variante A, fusion) : UNE page pour toute l'élection. Elle absorbe « Ma voix » (ui/guide-vote)
 * et « Les règles » (ui/regles-2027). Cinq sections : le compte à rebours, les étapes, qui se présente,
 * les règles, voter. Le porteur a autorisé des « profils types » de candidats ; ils ne sont PAS affichés :
 * une élection réelle, zéro invention. À la place, un aperçu de la future fiche, en formes grises, étiqueté
 * « aperçu », sans nom, sans parti, sans date.
 *
 * Trois onglets, branchés sur les fichiers publiés (lib/presidentielle.ts) : candidats, débats,
 * réunions publiques. AUCUNE donnée d'exemple : tant qu'un fichier est vide, l'onglet dit pourquoi
 * (invariant 5) ; s'il n'est pas arrivé, il le dit aussi et propose de réessayer (invariant 9).
 * Les candidats gardent l'ordre du fichier, celui de la liste officielle : jamais triés (invariant 3).
 * Ni couleur de parti ni photo ici (invariant 7, D27) : initiales sur fond neutre. */
import { useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { SquelettesListe } from "../ui/squelette";
import { dateFr, heureFr } from "@repere/core";
import type { PresidentialCandidate, PresidentialDebate, PresidentialMeeting } from "@repere/core";
import { Vide } from "../lib/composants";
import { DEMARCHES } from "../lib/elections";
import { GuideVote } from "../ui/guide-vote";
import { Regles2027 } from "../ui/regles-2027";
import { ELECTIONS } from "../lib/elections";
import { usePresidentialData } from "../lib/presidentielle";
import { ACCENTS, BADGE_DECLARATION, CIBLE, couleurs, PAS, POLICE, RAYON, TYPO } from "../lib/theme";
import { Avatar } from "../ui/avatar";
import { Page } from "../ui/page";
import { Onglets } from "../ui/stitch";

type Onglet = "candidats" | "debats" | "meetings";
const ONGLETS: { cle: Onglet; texte: string }[] = [
  { cle: "candidats", texte: "Candidats" }, { cle: "debats", texte: "Débats" }, { cle: "meetings", texte: "Réunions" },
];
const PAS_ARRIVE = { titre: "Ces données ne sont pas arrivées jusqu'à cet appareil.", corps: "Repère n'a pas pu les charger cette fois-ci. Rien n'est affiché à leur place." };

const joursAvant = (iso: string) => {
  const [a, m, j] = iso.split("-").map(Number);
  const n = new Date();
  return Math.round((Date.UTC(a, m - 1, j) - Date.UTC(n.getFullYear(), n.getMonth(), n.getDate())) / 86400000);
};

function Ligne({ date, titre, sous, sourceUrl }: { date: string; titre: string; sous: string; sourceUrl: string }) {
  return (
    <Pressable onPress={() => Linking.openURL(sourceUrl)} accessibilityRole="link"
      accessibilityLabel={`${titre}, ${dateFr(date.slice(0, 10))}, ${sous}. Ouvrir la source, site externe`}
      style={({ pressed }) => ({ flexDirection: "row", gap: PAS * 3, padding: PAS * 3, borderRadius: RAYON.bloc, backgroundColor: couleurs.carte, opacity: pressed ? 0.7 : 1 })}>
      <View style={{ width: 96 }}>
        <Text style={[TYPO.donnee, { color: couleurs.encre }]}>{dateFr(date.slice(0, 10))}</Text>
        <Text style={TYPO.donnee}>{heureFr(date)}</Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[TYPO.corps, { fontFamily: POLICE.titre }]}>{titre}</Text>
        <Text style={TYPO.note}>{sous}</Text>
      </View>
      <Ionicons name="link-outline" size={16} color={couleurs.sourd} accessible={false} importantForAccessibility="no" />
    </Pressable>
  );
}

/* L'APERÇU D'UNE FICHE À VENIR : des formes grises, jamais un nom, un parti ou une date. Décoratif :
   le lecteur d'écran lit seulement la phrase qui le suit. */
function Apercu({ lignes, rond, texte }: { lignes: number; rond?: boolean; texte: string }) {
  return (
    <View style={{ gap: PAS * 3, padding: PAS * 5, borderRadius: RAYON.carte, backgroundColor: couleurs.carte }}>
      <Text style={TYPO.etiquette}>Aperçu de la présentation</Text>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ gap: PAS * 3, opacity: 0.7 }}>
        {Array.from({ length: lignes }, (_, i) => (
          <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: PAS * 3 }}>
            <View style={{ width: 44, height: 44, borderRadius: rond ? 22 : 12, backgroundColor: couleurs.voile }} />
            <View style={{ flex: 1, gap: PAS * 2 }}>
              <View style={{ height: 12, borderRadius: 6, width: `${62 - i * 9}%`, backgroundColor: couleurs.voile }} />
              <View style={{ height: 10, borderRadius: 5, width: `${40 + i * 7}%`, backgroundColor: couleurs.voile }} />
            </View>
            <View style={{ width: 64, height: 28, borderRadius: 14, backgroundColor: couleurs.voile }} />
          </View>
        ))}
      </View>
      <Text style={TYPO.note}>{texte}</Text>
    </View>
  );
}

/* UNE ÉTAPE DE L'ÉLECTION : un point sur un fil, un titre, une phrase, et sa date quand elle est fixée. */
function Etape({ titre, texte, date, dernier }: { titre: string; texte: string; date?: string; dernier?: boolean }) {
  return (
    <View style={{ flexDirection: "row", gap: PAS * 4 }}>
      <View style={{ alignItems: "center", width: 12 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <View style={{ width: 12, height: 12, borderRadius: 6, marginTop: 6, backgroundColor: date ? ACCENTS.autorite : couleurs.voile }} />
        {dernier ? null : <View style={{ flex: 1, width: 2, backgroundColor: couleurs.voile }} />}
      </View>
      <View style={{ flex: 1, gap: 2, paddingBottom: dernier ? 0 : PAS * 5 }}>
        {date ? <Text style={[TYPO.note, { fontFamily: POLICE.section, color: couleurs.encre }]}>{date}</Text> : null}
        <Text style={TYPO.reponse}>{titre}</Text>
        <Text style={TYPO.note}>{texte}</Text>
      </View>
    </View>
  );
}

/* UNE CANDIDATURE DÉCLARÉE (12/11/2026, décision du porteur) : annoncée dans la presse, pas encore sur la liste
   officielle. Le badge orange le dit sur chaque carte ; les deux sources sont à un geste. Avatar = initiales
   (aucune photo : aucune n'est sous licence libre vérifiée). Ordre alphabétique du fichier : pas un ordre de préférence. */
function CarteCandidat({ c }: { c: PresidentialCandidate }) {
  const [sources, setSources] = useState(false);
  const declare = c.statut === "declare";
  const nom = `${c.prenom} ${c.nom}`;
  return (
    <View style={{ padding: PAS * 3, borderRadius: RAYON.bloc, backgroundColor: couleurs.carte, gap: PAS * 2 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: PAS * 3 }}>
        <Avatar nom={nom} taille={44} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={TYPO.reponse}>{nom}</Text>
          <Text style={TYPO.note}>{c.parti ?? "Aucun parti indiqué par les sources"}</Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: PAS * 2 }}>
        {declare ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: PAS * 1.5, paddingHorizontal: PAS * 3, minHeight: 28, borderRadius: RAYON.pastille,
            backgroundColor: BADGE_DECLARATION.fond, borderWidth: 1, borderColor: BADGE_DECLARATION.filet }}>
            <Ionicons name="megaphone-outline" size={14} color={BADGE_DECLARATION.texte} accessible={false} importantForAccessibility="no" />
            <Text style={{ fontSize: 13, lineHeight: 18, fontFamily: POLICE.section, color: BADGE_DECLARATION.texte }}>Déclaration de candidature</Text>
          </View>
        ) : null}
        {c.sources && c.sources.length ? (
          <Pressable onPress={() => setSources(o => !o)} accessibilityRole="button" accessibilityState={{ expanded: sources }}
            accessibilityLabel={`Sources de la candidature de ${nom} : ${sources ? "replier" : "déplier"}`}
            style={({ pressed }) => ({ minHeight: CIBLE, flexDirection: "row", alignItems: "center", gap: PAS, paddingHorizontal: PAS * 2, opacity: pressed ? 0.7 : 1 })}>
            <Ionicons name="link-outline" size={14} color={couleurs.sourd} accessible={false} importantForAccessibility="no" />
            <Text style={TYPO.note}>{c.sources.length} sources</Text>
            <Ionicons name={sources ? "chevron-up" : "chevron-down"} size={14} color={couleurs.sourd} accessible={false} importantForAccessibility="no" />
          </Pressable>
        ) : null}
        {c.programmeUrl ? (
          <Pressable onPress={() => Linking.openURL(c.programmeUrl as string)} accessibilityRole="link"
            accessibilityLabel={`Voir le programme de ${nom}, ouvre un site externe`}
            style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", paddingHorizontal: PAS * 3, borderRadius: RAYON.pastille, borderWidth: 1, borderColor: couleurs.trait, opacity: pressed ? 0.7 : 1 })}>
            <Text style={[TYPO.note, { color: couleurs.encre }]}>Programme ↗</Text>
          </Pressable>
        ) : null}
      </View>
      {sources && c.sources ? c.sources.map(x => (
        <Pressable key={x.url} onPress={() => Linking.openURL(x.url)} accessibilityRole="link"
          accessibilityLabel={`Source : ${x.producteur}, ${dateFr(x.date)}, ouvre un site externe`}
          style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", opacity: pressed ? 0.7 : 1 })}>
          <Text style={[TYPO.note, { color: couleurs.lien }]}>{x.producteur} · {dateFr(x.date)} ↗</Text>
        </Pressable>
      )) : null}
    </View>
  );
}

const Section = ({ titre }: { titre: string }) => <Text style={[TYPO.section, { marginTop: PAS * 4 }]} accessibilityRole="header">{titre}</Text>;

export default function Presidentielle2027() {
  const [onglet, setOnglet] = useState<Onglet>("candidats");
  const d = usePresidentialData();
  const tour1 = ELECTIONS.find(e => e.type === "presidentielle" && e.date);
  const dans = tour1 && tour1.date ? joursAvant(tour1.date) : null;
  const nomDe = (id: string) => { const c = d.candidats.find(x => x.id === id); return c ? `${c.prenom} ${c.nom}` : null; };
  const second = "2027-05-02";
  return (
    <Page>
      <Stack.Screen options={{ title: "" }} />
      {/* 1. LE COMPTE À REBOURS — la réponse héros de la page, et son seul bouton plein. */}
      <View style={{ gap: PAS * 4, padding: PAS * 6, borderRadius: RAYON.carte + 4, backgroundColor: couleurs.carte }}>
        <Text style={TYPO.etiquette}>Élection présidentielle 2027</Text>
        {dans !== null && dans > 0 ? (
          <Text accessibilityRole="header" accessibilityLabel={`Premier tour dans ${dans} jours`}
            style={[TYPO.chiffre, { fontSize: TYPO.chiffre.fontSize * 1.75, lineHeight: TYPO.chiffre.lineHeight * 1.6, letterSpacing: -2 }]}>
            {dans}<Text style={{ fontSize: TYPO.chiffre.fontSize, color: couleurs.sourd }}> jours</Text>
          </Text>
        ) : <Text style={TYPO.affiche} accessibilityRole="header">Élection présidentielle 2027</Text>}
        <Text style={TYPO.corps}>{dans !== null && dans > 0 ? "avant le premier tour." : dans === 0 ? "Le premier tour, c'est aujourd'hui." : "Le premier tour a eu lieu."}</Text>
        {tour1 && tour1.date ? (
          <View style={{ flexDirection: "row", gap: PAS * 3 }}>
            {([["Premier tour", tour1.date], ["Second tour", second]] as [string, string][]).map(([l, iso]) => (
              <View key={l} style={{ flex: 1, gap: 2, padding: PAS * 4, borderRadius: RAYON.bloc, backgroundColor: couleurs.voile }}>
                <Text style={TYPO.note}>{l}</Text>
                <Text style={[TYPO.reponse, { fontFamily: POLICE.section }]}>{dateFr(iso)}</Text>
              </View>
            ))}
          </View>
        ) : null}
        <Pressable onPress={() => Linking.openURL(DEMARCHES[0].url)} accessibilityRole="link"
          accessibilityLabel={`${DEMARCHES[0].texte}, ouvre le site officiel service-public`}
          style={({ pressed }) => ({ minHeight: CIBLE + 4, borderRadius: RAYON.pastille, alignItems: "center", justifyContent: "center", paddingHorizontal: PAS * 5, backgroundColor: ACCENTS.autorite, opacity: pressed ? 0.8 : 1 })}>
          <Text style={{ fontSize: 17, fontFamily: POLICE.section, color: ACCENTS.surAutorite }}>Vérifier mon inscription</Text>
        </Pressable>
        <Text style={TYPO.micro}>Page temporaire, jusqu'au second tour. Le bouton ouvre le service officiel, sur service-public.gouv.fr.</Text>
      </View>

      {/* 2. LES ÉTAPES — ce que dit la loi, et les deux dates fixées. Rien d'autre n'est daté. */}
      <Section titre="Les étapes" />
      <View style={{ padding: PAS * 6, borderRadius: RAYON.carte, backgroundColor: couleurs.carte }}>
        <Etape titre="Les parrainages" texte="Chaque candidat doit être présenté par 500 élus, venus d'au moins 30 départements ou collectivités d'outre-mer." />
        <Etape titre="La liste officielle" texte={d.charge && d.candidats.length && d.candidats.every(c => c.statut !== "declare") ? `Le Conseil constitutionnel a publié la liste : ${d.candidats.length} candidats.` : "Le Conseil constitutionnel publie la liste officielle des candidats. Elle n'est pas encore publiée."} />
        {tour1 && tour1.date ? <Etape date={dateFr(tour1.date)} titre="Premier tour" texte="Est élu le candidat qui obtient la majorité absolue des suffrages exprimés." /> : null}
        <Etape dernier date={dateFr(second)} titre="Second tour" texte="Si personne n'est élu au premier tour, entre les deux candidats arrivés en tête." />
      </View>

      {/* 3. LES RÈGLES (12/11/2026 : avant les candidats) — quatre fiches, chacune avec son texte de référence. */}
      <Section titre="Les règles du scrutin" />
      <Regles2027 />

      {/* 4. QUI SE PRÉSENTE — les fichiers publiés ; vides, ils le disent, et montrent la forme à venir. */}
      <Section titre="Candidats, débats, réunions" />
      <Onglets etiquette="Candidats, débats, réunions publiques" valeurs={ONGLETS} actif={onglet} choisir={setOnglet} />

      {!d.charge ? <SquelettesListe n={2} hauteur={88} /> : null}

      {d.charge && onglet === "candidats" ? (
        !d.lus.candidats ? <Vide {...PAS_ARRIVE} icone="cloud-offline-outline" action="Réessayer" onAction={d.reessayer} />
        : d.candidats.length === 0 ? (
          <>
            <Vide icone="hourglass-outline" titre="Liste officielle en attente"
              corps="Le Conseil constitutionnel n'a pas encore publié la liste officielle des candidats. Repère l'affichera dès sa publication, dans l'ordre de la liste." />
            <Apercu rond lignes={3} texte="Chaque candidat aura sa ligne : son nom, le mouvement qui le présente, un lien vers son programme. Aucun nom n'est affiché avant la liste officielle." />
          </>
        ) : (
          <View style={{ gap: PAS * 2 }}>
            {d.candidats.some(c => c.statut === "declare") ? (
              <View style={{ flexDirection: "row", gap: PAS * 3, padding: PAS * 4, borderRadius: RAYON.bloc, backgroundColor: BADGE_DECLARATION.fond, borderWidth: 1, borderColor: BADGE_DECLARATION.filet }}
                accessibilityRole="summary">
                <Ionicons name="information-circle-outline" size={20} color={BADGE_DECLARATION.texte} accessible={false} importantForAccessibility="no" />
                <Text style={[TYPO.corps, { flex: 1, color: BADGE_DECLARATION.texte }]}>
                  Liste des candidatures déclarées. La liste officielle sera arrêtée par le Conseil constitutionnel en 2027.
                  {" "}Elle n'est pas exhaustive : un nom n'y figure que si deux sources de presse le donnent pour déclaré. Ordre alphabétique : ce n'est pas un ordre de préférence.
                </Text>
              </View>
            ) : null}
            {d.candidats.map(c => <CarteCandidat key={c.id} c={c} />)}
          </View>
        )
      ) : null}

      {d.charge && onglet === "debats" ? (
        !d.lus.debats ? <Vide {...PAS_ARRIVE} icone="cloud-offline-outline" action="Réessayer" onAction={d.reessayer} />
        : d.debats.length === 0 ? (
          <>
            <Vide icone="tv-outline" titre="Aucun débat annoncé par une source vérifiée pour le moment."
              corps="Repère n'affiche un débat ou un entretien télévisé qu'avec l'annonce officielle de la chaîne." />
            <Apercu lignes={2} texte="Chaque débat aura sa ligne : la date et l'heure, la chaîne, les participants, et l'annonce officielle à un geste." />
          </>
        ) : (
          <View style={{ gap: PAS * 2 }}>
            {d.debats.map((x: PresidentialDebate) => (
              <Ligne key={x.id} date={x.date} titre={x.titre} sourceUrl={x.sourceUrl}
                sous={[x.chaine, x.participants.map(nomDe).filter(Boolean).join(", ")].filter(Boolean).join(" · ")} />
            ))}
          </View>
        )
      ) : null}

      {d.charge && onglet === "meetings" ? (
        !d.lus.meetings ? <Vide {...PAS_ARRIVE} icone="cloud-offline-outline" action="Réessayer" onAction={d.reessayer} />
        : d.meetings.length === 0 ? (
          <>
            <Vide icone="megaphone-outline" titre="Aucune réunion publique annoncée par une source vérifiée pour le moment."
              corps="Repère n'affiche une réunion publique qu'avec l'annonce du candidat qui l'organise." />
            <Apercu lignes={2} texte="Chaque réunion aura sa ligne : la date, la ville, la salle, le candidat, et son annonce à un geste." />
          </>
        ) : (
          <View style={{ gap: PAS * 2 }}>
            {d.meetings.map((x: PresidentialMeeting) => (
              <Ligne key={x.id} date={x.date} titre={nomDe(x.candidatId) || "Réunion publique"} sourceUrl={x.sourceUrl} sous={`${x.ville} · ${x.lieu}`} />
            ))}
          </View>
        )
      ) : null}

      {d.meta ? (
        <Pressable onPress={() => Linking.openURL(d.meta!.source.url)} accessibilityRole="link"
          accessibilityLabel={`Source de la liste des candidats : ${d.meta.source.producteur}, relevé le ${dateFr(d.meta.lastUpdate)}, ouvre un site externe`}
          style={({ pressed }) => ({ minHeight: CIBLE, flexDirection: "row", alignItems: "center", gap: PAS * 1.5, opacity: pressed ? 0.7 : 1 })}>
          <Ionicons name="link-outline" size={14} color={couleurs.sourd} accessible={false} importantForAccessibility="no" />
          <Text style={[TYPO.micro, { flex: 1 }]}>Liste des candidats : {d.meta.source.producteur} · relevé le {dateFr(d.meta.lastUpdate)}</Text>
        </Pressable>
      ) : null}

      {/* 5. VOTER — l'ancien écran « Ma voix ». */}
      <Section titre="Voter" />
      <GuideVote />
    </Page>
  );
}
