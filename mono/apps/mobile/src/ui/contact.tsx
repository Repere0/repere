/* CONTACT (V30, blocs 3 et 4).
 *
 * L'adresse vient de EXPO_PUBLIC_CONTACT_EMAIL, comme ailleurs dans l'application : sans elle, rien
 * ne s'affiche (pas d'adresse inventée, pas de bouton mort). Le site web publie une adresse de contact
 * (Sources.jsx) ; l'application la lira quand la variable sera définie au moment de la publication.
 *
 * - ContacterElu : un courriel publié par la source ouvre la messagerie. Sinon, le lien va à la source
 *   officielle ; sans source, le texte dit « Contact non publié ». Les données de Repère ne portent
 *   aucun courriel d'élu à ce jour.
 * - SignalerErreur : une ligne « ⚠ Signaler une erreur » qui ouvre la messagerie, avec le sujet et le
 *   texte de la donnée déjà remplis. */
import { Linking, Pressable, Text, View } from "react-native";
import { CIBLE, couleurs, PAS, TYPO } from "../lib/theme";
import { LienSortant } from "../lib/composants";

const CONTACT = process.env.EXPO_PUBLIC_CONTACT_EMAIL || null;
const COURRIEL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContacterElu({ nom, courriel, lienSource, sourceNom }: {
  nom: string; courriel?: string | null; lienSource?: string | null; sourceNom?: string;
}) {
  if (courriel && COURRIEL.test(courriel)) {
    return (
      <Pressable onPress={() => Linking.openURL(`mailto:${courriel}`)} accessibilityRole="link"
        accessibilityLabel={`Contacter ${nom} par courriel. Ouvre la messagerie.`}
        style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", opacity: pressed ? 0.7 : 1 })}>
        <Text style={[TYPO.corps, { color: couleurs.lien, fontWeight: "700" }]}>Contacter {nom} ›</Text>
      </Pressable>
    );
  }
  if (lienSource && /^https:\/\//.test(lienSource)) {
    return <LienSortant url={lienSource} texte={`Contacter : voir la source officielle${sourceNom ? ` (${sourceNom})` : ""}`} />;
  }
  return <Text style={[TYPO.note, { color: couleurs.sourd }]}>Contact non publié.</Text>;
}

export function SignalerErreur({ contexte, donnee }: { contexte: string; donnee: string }) {
  if (!CONTACT) return null;
  const sujet = encodeURIComponent(`Erreur sur ${contexte}`);
  const corps = encodeURIComponent(`Ce que j'ai vu dans Repère :\n${donnee}\n\nCe qui est exact, et la source :\n`);
  return (
    <View>
      <Pressable onPress={() => Linking.openURL(`mailto:${CONTACT}?subject=${sujet}&body=${corps}`)} accessibilityRole="link"
        accessibilityLabel={`Signaler une erreur sur ${contexte}. Ouvre la messagerie.`}
        style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", alignSelf: "flex-start", opacity: pressed ? 0.7 : 1 })}>
        <Text style={[TYPO.note, { color: couleurs.lien, textDecorationLine: "underline", fontWeight: "600" }]}>⚠ Signaler une erreur</Text>
      </Pressable>
      <View style={{ height: PAS }} />
    </View>
  );
}
