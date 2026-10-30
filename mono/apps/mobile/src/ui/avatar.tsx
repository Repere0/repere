/* L'AVATAR D'UN ELU : ses initiales sur la couleur de son groupe, avec une bordure de la
 * même teinte, plus sombre, et une ombre douce (clair comme sombre).
 * Photo (D27, ADR 0004) : seulement une vignette sous licence libre de Wikimedia Commons,
 * servie par département dans les données de Repère (jamais chargée chez Wikimedia), avec
 * son crédit (CreditPhoto) affiché dessous. Jamais une photo de l'Assemblée (D1). Sans
 * photo : les initiales. Sans groupe connu (c'est le cas
 * de tous les élus aujourd'hui), la couleur est le gris « Inconnu » (ADR 0001). */
import { Image, Linking, Pressable, Text, View } from "react-native";
import type { PhotoElu } from "../lib/photos";
import { couleurs, OMBRE } from "../lib/theme";
import { bordureGroupe, couleurGroupe, groupeDe, texteSur } from "../lib/groupes";

export function initiales(nom: string): string {
  const morceaux = nom.split(/\s+/).filter(Boolean);
  if (!morceaux.length) return "?";
  const premiere = morceaux[0].charAt(0);
  const derniere = morceaux.length > 1 ? morceaux[morceaux.length - 1].charAt(0) : "";
  return (premiere + derniere).toUpperCase();
}

/* 64 px par défaut : initiales à 24 px. Le texte est blanc sur le gris « Inconnu » ; sur une
 * couleur de groupe claire, il passe en encre pour rester lisible (texteSur). */
export function Avatar({ nom, taille = 64, photo }: { nom: string; taille?: number; photo?: PhotoElu | null }) {
  const fond = couleurGroupe(groupeDe());
  if (photo) {
    return (
      <Image source={{ uri: photo.data }} accessible={false} resizeMode="cover"
        style={[{ width: taille, height: taille, borderRadius: taille / 2, borderWidth: 2, borderColor: bordureGroupe(fond) }, OMBRE]} />
    );
  }
  return (
    <View accessible={false}
      style={[{ width: taille, height: taille, borderRadius: taille / 2, backgroundColor: fond,
        borderWidth: 2, borderColor: bordureGroupe(fond), alignItems: "center", justifyContent: "center" }, OMBRE]}>
      <Text style={{ color: texteSur(fond), fontWeight: "800", fontSize: Math.round(taille * 0.375) }}>{initiales(nom)}</Text>
    </View>
  );
}

/* LE CREDIT D'UNE PHOTO (CC BY-SA exige auteur, licence, source, et l'indication d'une
   modification : le recadrage en cercle). Toute la ligne ouvre la page Commons (45 px). */
/* La mention de retrait (V18, docs/juridique/droit-image-elus.md) ne s'affiche que si une
   adresse de contact est configuree : pas d'adresse inventee, pas de bouton mort. */
const CONTACT = process.env.EXPO_PUBLIC_CONTACT_EMAIL;
export function CreditPhoto({ photo }: { photo: PhotoElu }) {
  const page = photo.page && /^https:\/\//.test(photo.page) ? photo.page : null;
  return (
    <View>
    <Pressable disabled={!page} onPress={() => { if (page) Linking.openURL(page); }} accessibilityRole={page ? "link" : "text"}
      accessibilityLabel={`Photo : ${photo.auteur}, licence ${photo.licence}, Wikimedia Commons, recadrée${page ? ". Ouvre la page de la photo, site externe" : ""}`}
      style={({ pressed }) => ({ minHeight: 45, justifyContent: "center", opacity: pressed ? 0.7 : 1 })}>
      <Text style={{ fontSize: 12, lineHeight: 16, color: couleurs.sourd, textDecorationLine: page ? "underline" : "none" }} numberOfLines={2}>
        Photo : {photo.auteur} · {photo.licence} · Wikimedia Commons (recadrée)
      </Text>
    </Pressable>
    {CONTACT ? (
      <Pressable onPress={() => Linking.openURL(`mailto:${CONTACT}?subject=${encodeURIComponent("Retrait d'une photo d'élu")}`)} accessibilityRole="link"
        accessibilityLabel={`Photo sous licence libre, but informatif. Demander le retrait par courriel à ${CONTACT}`}
        style={({ pressed }) => ({ minHeight: 45, justifyContent: "center", opacity: pressed ? 0.7 : 1 })}>
        <Text style={{ fontSize: 12, lineHeight: 16, color: couleurs.sourd }}>Photo sous licence libre, but informatif. Retrait sur demande : <Text style={{ textDecorationLine: "underline" }}>{CONTACT}</Text></Text>
      </Pressable>
    ) : null}
    </View>
  );
}
