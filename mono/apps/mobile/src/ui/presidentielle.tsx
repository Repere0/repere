/* LA PRÉSIDENTIELLE 2027 SUR « MA VOIX » (porteur, 09/11/2026) : une bannière qui dit que la page
 * est temporaire, puis trois modules : les candidats, les débats et entretiens télévisés, les réunions
 * publiques.
 *
 * D'OÙ VIENNENT LES DONNÉES. Un seul fichier national, data/presidentielle-2027.json, que Repère
 * publiera quand une source vérifiée existera (la liste officielle des candidats est arrêtée par le
 * Conseil constitutionnel). Tant qu'il n'est pas publié, chaque module le dit en une phrase
 * (doctrine du vide, invariant 5) : aucun candidat, aucun débat n'est deviné.
 *
 * NEUTRALITÉ. Les candidats sont montrés dans l'ordre du fichier, celui de la liste officielle : jamais
 * triés par Repère (invariant 3). Aucune couleur de parti ici.
 *
 * FICTIF. Un fichier marqué « fictif: true » (fixture de test, mono/tests/fixtures/) s'affiche sous un
 * bandeau « Données fictives » : s'il était publié par erreur, personne ne pourrait le prendre pour vrai. */
import { useEffect, useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { dateFr, heureFr } from "@repere/core";
import { chargerPresidentielle } from "../lib/donnees";
import { ELECTIONS } from "../lib/elections";
import { CIBLE, couleurs, PAS, POLICE, RAYON, TYPO } from "../lib/theme";
import { Avatar } from "./avatar";

type Candidat = { nom: string; parti?: string | null; programme?: string | null };
type Rendezvous = { titre: string; debut: string; chaine?: string; lieu?: string; avec?: string };
type Fichier = { fictif?: boolean; source?: { producteur?: string; maj?: string; url?: string }; candidats?: Candidat[]; debats?: Rendezvous[]; meetings?: Rendezvous[] };

const jours = (iso: string) => {
  const [a, m, j] = iso.split("-").map(Number);
  const n = new Date();
  return Math.round((Date.UTC(a, m - 1, j) - Date.UTC(n.getFullYear(), n.getMonth(), n.getDate())) / 86400000);
};

function Module({ icone, titre, children }: { icone: keyof typeof Ionicons.glyphMap; titre: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: PAS * 3, padding: PAS * 4, borderRadius: RAYON.carte, backgroundColor: couleurs.carte, borderWidth: 1, borderColor: couleurs.trait }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: PAS * 2 }}>
        <Ionicons name={icone} size={18} color={couleurs.encre} accessible={false} importantForAccessibility="no" />
        <Text style={TYPO.reponse} accessibilityRole="header">{titre}</Text>
      </View>
      {children}
    </View>
  );
}

function Rdv({ x, lieu }: { x: Rendezvous; lieu: string | undefined }) {
  const jour = x.debut.slice(0, 10);
  return (
    <View style={{ flexDirection: "row", gap: PAS * 3, paddingVertical: PAS * 2, borderTopWidth: 1, borderTopColor: couleurs.trait }}>
      <View style={{ width: 92 }}>
        <Text style={[TYPO.donnee, { color: couleurs.encre }]}>{dateFr(jour)}</Text>
        <Text style={TYPO.donnee}>{heureFr(x.debut)}</Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[TYPO.corps, { fontFamily: POLICE.titre }]}>{x.titre}</Text>
        <Text style={TYPO.note}>{[lieu, x.avec].filter(Boolean).join(" · ")}</Text>
      </View>
    </View>
  );
}

export function Presidentielle() {
  const [f, setF] = useState<Fichier | null>(null);
  const [lu, setLu] = useState(false);
  useEffect(() => {
    let vivant = true;
    chargerPresidentielle().then(r => { if (vivant) { setF(r.donnees ? (r.donnees as Fichier) : null); setLu(true); } }).catch(() => { if (vivant) setLu(true); });
    return () => { vivant = false; };
  }, []);
  const tour1 = ELECTIONS.find(e => e.type === "presidentielle" && e.date);
  const dans = tour1 && tour1.date ? jours(tour1.date) : null;
  const candidats = f?.candidats ?? [];
  const debats = f?.debats ?? [];
  const meetings = f?.meetings ?? [];
  return (
    <View style={{ gap: PAS * 4 }}>
      {/* LA BANNIÈRE : ce qui rend la page exceptionnelle et temporaire. */}
      <View style={{ gap: PAS * 2, padding: PAS * 5, borderRadius: RAYON.carte, backgroundColor: couleurs.carte, borderWidth: 1.5, borderColor: couleurs.encre }}>
        <Text style={TYPO.etiquette}>Page temporaire · jusqu'au second tour</Text>
        <Text style={TYPO.affiche} accessibilityRole="header">Élection présidentielle 2027</Text>
        {tour1 && tour1.date ? <Text style={TYPO.corps}>Premier tour le {dateFr(tour1.date)} · second tour le {dateFr("2027-05-02")}.</Text> : null}
        {dans !== null && dans > 0 ? (
          <Text style={[TYPO.chiffre]} accessibilityLabel={`Dans ${dans} jours`}>J-{dans}</Text>
        ) : null}
        <Pressable onPress={() => router.push("/reglement-2027")} accessibilityRole="button"
          accessibilityLabel="Les règles de la présidentielle 2027, en quatre fiches"
          style={({ pressed }) => ({ minHeight: CIBLE, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: PAS * 1.5, opacity: pressed ? 0.7 : 1 })}>
          <Ionicons name="reader-outline" size={16} color={couleurs.encre} accessible={false} importantForAccessibility="no" />
          <Text style={[TYPO.corps, { fontFamily: POLICE.texteGras }]}>Les règles du scrutin, en quatre fiches</Text>
          <Ionicons name="chevron-forward" size={14} color={couleurs.sourd} accessible={false} importantForAccessibility="no" />
        </Pressable>
      </View>

      {f?.fictif ? (
        <View style={{ flexDirection: "row", gap: PAS * 2, padding: PAS * 3, borderRadius: RAYON.bloc, borderWidth: 1.5, borderColor: couleurs.encre }}>
          <Ionicons name="warning-outline" size={18} color={couleurs.encre} accessible={false} importantForAccessibility="no" />
          <Text style={[TYPO.corps, { flex: 1, fontFamily: POLICE.texteGras }]}>Données fictives de test : aucun nom, parti ou date ci-dessous n'est réel.</Text>
        </View>
      ) : null}

      <Module icone="people-outline" titre="Les candidats">
        {candidats.length ? candidats.map(c => (
          <View key={c.nom} style={{ flexDirection: "row", alignItems: "center", gap: PAS * 3 }}>
            <Avatar nom={c.nom} taille={40} fond={couleurs.voile} doux />
            <View style={{ flex: 1 }}>
              <Text style={[TYPO.corps, { fontFamily: POLICE.titre }]}>{c.nom}</Text>
              {c.parti ? <Text style={TYPO.note}>{c.parti}</Text> : null}
            </View>
            {c.programme ? (
              <Pressable onPress={() => Linking.openURL(c.programme as string)} accessibilityRole="link"
                accessibilityLabel={`Voir le programme de ${c.nom}, ouvre un site externe`}
                style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", paddingHorizontal: PAS * 3, borderRadius: RAYON.pastille, borderWidth: 1, borderColor: couleurs.trait, opacity: pressed ? 0.7 : 1 })}>
                <Text style={[TYPO.note, { color: couleurs.encre }]}>Programme ↗</Text>
              </Pressable>
            ) : <Text style={TYPO.micro}>Programme non publié</Text>}
          </View>
        )) : (
          <Text style={TYPO.note}>{lu ? "La liste officielle des candidats n'est pas encore publiée : le Conseil constitutionnel l'arrête après avoir reçu les présentations des élus. Repère l'affichera alors, dans l'ordre de la liste officielle." : "Chargement…"}</Text>
        )}
      </Module>

      <Module icone="tv-outline" titre="Débats et entretiens télévisés">
        {debats.length ? debats.map((x, i) => <Rdv key={i} x={x} lieu={x.chaine} />) : (
          <Text style={TYPO.note}>Aucun débat ni entretien n'est annoncé par une source que Repère relit. Repère ne relaie pas une annonce qu'il ne peut pas vérifier.</Text>
        )}
      </Module>

      <Module icone="megaphone-outline" titre="Réunions publiques">
        {meetings.length ? meetings.map((x, i) => <Rdv key={i} x={x} lieu={x.lieu} />) : (
          <Text style={TYPO.note}>Aucune réunion publique n'est annoncée par une source que Repère relit.</Text>
        )}
      </Module>

      {f?.source?.producteur ? <Text style={TYPO.micro}>Source : {f.source.producteur}{f.source.maj ? `, ${dateFr(f.source.maj)}` : ""}.</Text> : null}
    </View>
  );
}
