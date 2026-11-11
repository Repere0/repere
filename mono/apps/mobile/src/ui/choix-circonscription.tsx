/* CHOISIR UNE CIRCONSCRIPTION (retour iPhone du porteur, 11/11/2026).
 *
 * Une commune partagée entre plusieurs circonscriptions (Paris en compte 18) n'a pas « un » député :
 * Repère ne peut pas dire lequel est le vôtre sans votre adresse, qu'il ne demande pas (invariant 3 :
 * aucun député n'est désigné). Avant : les 18 noms en un mur de texte. Maintenant : un accordéon
 * « Choisir une circonscription », des puces numérotées, et UN député à la fois, celui que le lecteur
 * a lui-même choisi. Le choix reste dans l'écran : rien n'est gardé sur l'appareil (invariant 2).
 *
 * Composant : accordéon + puces, écrit ici. Un Picker natif demanderait un paquet de plus (une dépense à
 * justifier) et se comporte autrement sur le web, l'iPhone et Android ; 18 puces tiennent en 4 lignes. */
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ordinal } from "@repere/core";
import { CIBLE, couleurs, PAS, POLICE, RAYON, TYPO } from "../lib/theme";

export type DeputeCirco = { nom: string; circo: number; role?: string };

export function ChoixCirconscription({ personnes, ouvrirFiche }: { personnes: DeputeCirco[]; ouvrirFiche: (p: DeputeCirco) => void }) {
  const [ouvert, setOuvert] = useState(false);
  const [choisie, setChoisie] = useState<number | null>(null);
  const liste = [...personnes].sort((a, b) => a.circo - b.circo);
  const elu = liste.find(p => p.circo === choisie) || null;
  return (
    <View style={{ gap: PAS * 3 }}>
      <Pressable onPress={() => setOuvert(o => !o)} accessibilityRole="button" accessibilityState={{ expanded: ouvert }}
        accessibilityLabel={`Choisir une circonscription, parmi ${liste.length}`}
        style={({ pressed }) => ({ minHeight: CIBLE, flexDirection: "row", alignItems: "center", gap: PAS * 2, paddingHorizontal: PAS * 4,
          borderRadius: RAYON.pastille, backgroundColor: couleurs.voile, opacity: pressed ? 0.7 : 1 })}>
        <Ionicons name="location-outline" size={18} color={couleurs.encre} accessible={false} importantForAccessibility="no" />
        <Text style={[TYPO.corps, { flex: 1, fontFamily: POLICE.texteGras }]}>{elu ? `${ordinal(elu.circo)} circonscription` : "Choisir une circonscription"}</Text>
        <Ionicons name={ouvert ? "chevron-up" : "chevron-down"} size={18} color={couleurs.sourd} accessible={false} importantForAccessibility="no" />
      </Pressable>
      {ouvert ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: PAS * 2 }}>
          {liste.map(p => {
            const on = p.circo === choisie;
            return (
              <Pressable key={p.circo} onPress={() => { setChoisie(on ? null : p.circo); setOuvert(false); }} accessibilityRole="button"
                accessibilityState={{ selected: on }} accessibilityLabel={`${ordinal(p.circo)} circonscription${on ? ", choisie" : ""}`}
                style={({ pressed }) => ({ minHeight: CIBLE, minWidth: CIBLE, alignItems: "center", justifyContent: "center", paddingHorizontal: PAS * 3,
                  borderRadius: RAYON.pastille, borderWidth: 2, borderColor: on ? couleurs.encre : "transparent",
                  backgroundColor: on ? couleurs.voile : couleurs.carte, opacity: pressed ? 0.7 : 1 })}>
                <Text style={[TYPO.corps, { fontFamily: on ? POLICE.texteGras : POLICE.texte }]}>{ordinal(p.circo)}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
      {elu ? (
        <Pressable onPress={() => ouvrirFiche(elu)} accessibilityRole="link" accessibilityLabel={`Voir la fiche de ${elu.nom}, député de la ${ordinal(elu.circo)} circonscription`}
          style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", gap: 2, opacity: pressed ? 0.6 : 1 })}>
          <Text style={TYPO.reponse}>{elu.nom}</Text>
          <Text style={TYPO.note}>Député, {ordinal(elu.circo)} circonscription ›</Text>
        </Pressable>
      ) : (
        <Text style={TYPO.note}>Choisissez la circonscription que vous connaissez : Repère n'en désigne aucune.</Text>
      )}
    </View>
  );
}
