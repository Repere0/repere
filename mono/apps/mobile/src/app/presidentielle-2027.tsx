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
 * Jamais de couleur de parti ici (invariant 7, ADR 0008). Photo seulement si la chaîne en publie une, libre
 * (Wikimedia Commons), rapprochée avec certitude, avec son crédit ; sinon les initiales sur fond neutre. */
import { useState } from "react";
import { Linking, Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
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
import { Attente } from "../ui/attente";
import { Avatar, CreditPhoto } from "../ui/avatar";
import { usePhotosCandidats, type PhotoElu } from "../lib/photos";
import { Page } from "../ui/page";
import { Onglets } from "../ui/stitch";
import { enfonce } from "../ui/mouvement";

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
      style={({ pressed }) => ({ flexDirection: "row", gap: PAS * 3, padding: PAS * 3, borderRadius: RAYON.bloc, backgroundColor: couleurs.carte, ...enfonce(pressed) })}>
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
   officielle. Le badge orange le dit sur chaque carte ; les deux sources sont à un geste. Avatar : la photo libre
   publiée par la chaîne (ADR 0008), crédit sous la carte ; sinon les initiales. Ordre alphabétique du fichier. */
function CarteCandidat({ c, photo }: { c: PresidentialCandidate; photo?: PhotoElu | null }) {
  const [sources, setSources] = useState(false);
  const declare = c.statut === "declare";
  const nom = `${c.prenom} ${c.nom}`;
  return (
    <View style={{ padding: PAS * 3, borderRadius: RAYON.bloc, backgroundColor: couleurs.carte, gap: PAS * 2 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: PAS * 3 }}>
        <Avatar nom={nom} taille={44} photo={photo} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={TYPO.reponse}>{nom}</Text>
          {c.parti ? (
            /* 12/11/2026 : le parti en pastille, NEUTRE (voile/encre). Pas de couleur de parti : l'invariant 7 la réserve à l'identification des élus. */
            <View accessible accessibilityLabel={`Parti : ${c.parti}`} style={{ alignSelf: "flex-start", maxWidth: "100%", paddingHorizontal: PAS * 3, minHeight: 24, justifyContent: "center", borderRadius: RAYON.pastille, backgroundColor: couleurs.voile }}>
              <Text style={[TYPO.micro, { color: couleurs.encre }]} numberOfLines={2}>{c.parti}</Text>
            </View>
          ) : <Text style={TYPO.note}>Aucun parti indiqué par les sources</Text>}
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
      {photo ? <CreditPhoto photo={photo} /> : null}
    </View>
  );
}

const Section = ({ titre }: { titre: string }) => <Text style={[TYPO.section, { marginTop: PAS * 4 }]} accessibilityRole="header">{titre}</Text>;

export default function Presidentielle2027() {
  const [onglet, setOnglet] = useState<Onglet>("candidats");
  const d = usePresidentialData();
  const photos = usePhotosCandidats();
  const { width: largeurEcran } = useWindowDimensions();
  const largeurCarte = Math.min(Math.round(largeurEcran * 0.82), 360);
  const videDebats = d.charge && d.lus.debats && d.debats.length === 0;
  const videMeetings = d.charge && d.lus.meetings && d.meetings.length === 0;
  const onglets = ONGLETS.filter(o => !(o.cle === "debats" && videDebats) && !(o.cle === "meetings" && videMeetings));
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
          style={({ pressed }) => ({ minHeight: CIBLE + 4, borderRadius: RAYON.pastille, alignItems: "center", justifyContent: "center", paddingHorizontal: PAS * 5, backgroundColor: ACCENTS.autorite, ...enfonce(pressed) })}>
          <Text style={{ fontSize: 17, fontFamily: POLICE.section, color: ACCENTS.surAutorite }}>Vérifier mon inscription</Text>
        </Pressable>
        <Text style={TYPO.micro}>Le bouton ouvre le service officiel, sur service-public.gouv.fr.</Text>
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
      {/* 12/11/2026 (porteur) : un onglet qui n'a rien à montrer est masqué ; une phrase vraie le dit, sous les candidats. */}
      <Onglets etiquette={onglets.length > 1 ? "Candidats, débats, réunions publiques" : "Candidats"} valeurs={onglets} actif={onglet} choisir={setOnglet} />

      {!d.charge ? <SquelettesListe n={2} hauteur={88} /> : null}

      {d.charge && onglet === "candidats" ? (
        !d.lus.candidats ? <Vide {...PAS_ARRIVE} icone="cloud-offline-outline" action="Réessayer" onAction={d.reessayer} />
        : d.candidats.length === 0 ? (
          <>
            <Vide icone="hourglass-outline" titre="Liste officielle en attente"
              corps="Le Conseil constitutionnel n'a pas encore publié la liste officielle des candidats. Repère l'affichera dès sa publication, dans l'ordre de la liste." />
            <Attente icone="people-outline" etiquette="Bientôt" texte="Une ligne par candidat : mouvement, lien vers le programme. Aucun nom n'est affiché avant la liste officielle." />
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
            {/* Carrousel (12/11/2026, porteur) : on fait glisser de gauche à droite ; l'ordre reste alphabétique. */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} decelerationRate="fast" snapToInterval={largeurCarte + PAS * 3}
              accessibilityLabel={`${d.candidats.length} candidat${d.candidats.length > 1 ? "s" : ""}, à faire défiler`}
              contentContainerStyle={{ gap: PAS * 3 }}>
              {d.candidats.map(c => <View key={c.id} style={{ width: largeurCarte }}><CarteCandidat c={c} photo={photos[c.id]} /></View>)}
            </ScrollView>
            {/* Doctrine du vide (ADR 0008) : pourquoi certains n'ont pas de photo, en une phrase vraie. */}
            <Text style={TYPO.note}>Photos : Wikimedia Commons, sous licence libre. Sans photo libre rattachée avec certitude au candidat, ses initiales.</Text>
          </View>
        )
      ) : null}

      {d.charge && onglet === "debats" ? (
        !d.lus.debats ? <Vide {...PAS_ARRIVE} icone="cloud-offline-outline" action="Réessayer" onAction={d.reessayer} />
        : d.debats.length === 0 ? (
            <Vide icone="tv-outline" titre="Aucun débat annoncé par une source vérifiée pour le moment."
              corps="Repère n'affiche un débat ou un entretien télévisé qu'avec l'annonce officielle de la chaîne." />

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
            <Vide icone="megaphone-outline" titre="Aucune réunion publique annoncée par une source vérifiée pour le moment."
              corps="Repère n'affiche une réunion publique qu'avec l'annonce du candidat qui l'organise." />

        ) : (
          <View style={{ gap: PAS * 2 }}>
            {d.meetings.map((x: PresidentialMeeting) => (
              <Ligne key={x.id} date={x.date} titre={nomDe(x.candidatId) || "Réunion publique"} sourceUrl={x.sourceUrl} sous={`${x.ville} · ${x.lieu}`} />
            ))}
          </View>
        )
      ) : null}

      {videDebats || videMeetings ? (
        <Text style={TYPO.note}>
          {videDebats && videMeetings ? "Aucun débat ni aucune réunion publique n'est annoncé par une source vérifiée pour le moment."
            : videDebats ? "Aucun débat n'est annoncé par une source vérifiée pour le moment." : "Aucune réunion publique n'est annoncée par une source vérifiée pour le moment."}
          {" "}Repère les affichera avec l'annonce officielle.
        </Text>
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
