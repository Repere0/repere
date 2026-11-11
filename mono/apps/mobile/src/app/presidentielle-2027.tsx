/* « PRÉSIDENTIELLE 2027 » (porteur, 09/11/2026) : une page temporaire, jusqu'au second tour.
 *
 * Trois onglets, branchés sur les fichiers publiés (lib/presidentielle.ts) : candidats, débats,
 * réunions publiques. AUCUNE donnée d'exemple : tant qu'un fichier est vide, l'onglet dit pourquoi
 * (invariant 5) ; s'il n'est pas arrivé, il le dit aussi et propose de réessayer (invariant 9).
 * Les candidats gardent l'ordre du fichier, celui de la liste officielle : jamais triés (invariant 3).
 * Ni couleur de parti ni photo ici (invariant 7, D27) : initiales sur fond neutre. */
import { useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { SquelettesListe } from "../ui/squelette";
import { dateFr, heureFr } from "@repere/core";
import type { PresidentialDebate, PresidentialMeeting } from "@repere/core";
import { Vide } from "../lib/composants";
import { ELECTIONS } from "../lib/elections";
import { usePresidentialData } from "../lib/presidentielle";
import { CIBLE, couleurs, PAS, POLICE, RAYON, TYPO } from "../lib/theme";
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
      style={({ pressed }) => ({ flexDirection: "row", gap: PAS * 3, padding: PAS * 3, borderRadius: RAYON.bloc, backgroundColor: couleurs.carte, borderWidth: 1, borderColor: couleurs.trait, opacity: pressed ? 0.7 : 1 })}>
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

export default function Presidentielle2027() {
  const [onglet, setOnglet] = useState<Onglet>("candidats");
  const d = usePresidentialData();
  const tour1 = ELECTIONS.find(e => e.type === "presidentielle" && e.date);
  const dans = tour1 && tour1.date ? joursAvant(tour1.date) : null;
  const nomDe = (id: string) => { const c = d.candidats.find(x => x.id === id); return c ? `${c.prenom} ${c.nom}` : null; };
  const lien = (texte: string, icone: keyof typeof Ionicons.glyphMap, chemin: "/reglement-2027" | "/voter") => (
    <Pressable onPress={() => router.push(chemin)} accessibilityRole="button" accessibilityLabel={texte}
      style={({ pressed }) => ({ minHeight: CIBLE, flexDirection: "row", alignItems: "center", gap: PAS * 2, opacity: pressed ? 0.7 : 1 })}>
      <Ionicons name={icone} size={16} color={couleurs.encre} accessible={false} importantForAccessibility="no" />
      <Text style={[TYPO.corps, { flex: 1, fontFamily: POLICE.texteMoyen }]}>{texte}</Text>
      <Ionicons name="chevron-forward" size={14} color={couleurs.sourd} accessible={false} importantForAccessibility="no" />
    </Pressable>
  );
  return (
    <Page>
      <Stack.Screen options={{ title: "Présidentielle 2027" }} />
      <View style={{ gap: PAS * 2, padding: PAS * 5, borderRadius: RAYON.carte, backgroundColor: couleurs.carte, borderWidth: 1, borderColor: couleurs.trait }}>
        <Text style={TYPO.etiquette}>Page temporaire · jusqu'au second tour</Text>
        <Text style={TYPO.affiche} accessibilityRole="header">Élection présidentielle 2027</Text>
        {tour1 && tour1.date ? <Text style={TYPO.corps}>Premier tour le {dateFr(tour1.date)} · second tour le {dateFr("2027-05-02")}.</Text> : null}
        {dans !== null && dans > 0 ? <Text style={TYPO.chiffre} accessibilityLabel={`Dans ${dans} jours`}>J-{dans}</Text> : null}
        {lien("Les règles du scrutin, en quatre fiches", "reader-outline", "/reglement-2027")}
        {lien("Comment voter, s'inscrire, faire une procuration", "checkbox-outline", "/voter")}
      </View>

      <Onglets etiquette="Candidats, débats, réunions publiques" valeurs={ONGLETS} actif={onglet} choisir={setOnglet} />

      {!d.charge ? <SquelettesListe n={2} hauteur={88} /> : null}

      {d.charge && onglet === "candidats" ? (
        !d.lus.candidats ? <Vide {...PAS_ARRIVE} icone="cloud-offline-outline" action="Réessayer" onAction={d.reessayer} />
        : d.candidats.length === 0 ? (
          <Vide icone="hourglass-outline" titre="Liste officielle en attente"
            corps="Le Conseil constitutionnel n'a pas encore publié la liste officielle des candidats. Repère l'affichera dès sa publication, dans l'ordre de la liste." />
        ) : (
          <View style={{ gap: PAS * 2 }}>
            {d.candidats.map(c => (
              <View key={c.id} style={{ flexDirection: "row", alignItems: "center", gap: PAS * 3, padding: PAS * 3, borderRadius: RAYON.bloc, backgroundColor: couleurs.carte, borderWidth: 1, borderColor: couleurs.trait }}>
                <Avatar nom={`${c.prenom} ${c.nom}`} taille={40} />
                <View style={{ flex: 1 }}>
                  <Text style={[TYPO.corps, { fontFamily: POLICE.titre }]}>{c.prenom} {c.nom}</Text>
                  {c.parti ? <Text style={TYPO.note}>{c.parti}</Text> : null}
                </View>
                {c.programmeUrl ? (
                  <Pressable onPress={() => Linking.openURL(c.programmeUrl as string)} accessibilityRole="link"
                    accessibilityLabel={`Voir le programme de ${c.prenom} ${c.nom}, ouvre un site externe`}
                    style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", paddingHorizontal: PAS * 3, borderRadius: RAYON.pastille, borderWidth: 1, borderColor: couleurs.trait, opacity: pressed ? 0.7 : 1 })}>
                    <Text style={[TYPO.note, { color: couleurs.encre }]}>Programme ↗</Text>
                  </Pressable>
                ) : <Text style={TYPO.micro}>Programme non publié</Text>}
              </View>
            ))}
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

      {d.meta ? (
        <Pressable onPress={() => Linking.openURL(d.meta!.source.url)} accessibilityRole="link"
          accessibilityLabel={`Source de la liste des candidats : ${d.meta.source.producteur}, vérifié le ${dateFr(d.meta.lastUpdate)}, ouvre un site externe`}
          style={({ pressed }) => ({ minHeight: CIBLE, flexDirection: "row", alignItems: "center", gap: PAS * 1.5, opacity: pressed ? 0.7 : 1 })}>
          <Ionicons name="link-outline" size={14} color={couleurs.sourd} accessible={false} importantForAccessibility="no" />
          <Text style={[TYPO.micro, { flex: 1 }]}>Liste des candidats : {d.meta.source.producteur} · vérifié le {dateFr(d.meta.lastUpdate)}</Text>
        </Pressable>
      ) : null}
    </Page>
  );
}
