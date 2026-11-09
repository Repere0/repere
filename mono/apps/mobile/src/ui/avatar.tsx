/* L'AVATAR D'UN ELU : ses initiales sur la couleur de son groupe, avec une bordure de la
 * même teinte, plus sombre, et une ombre douce (clair comme sombre).
 * Photo (D27, ADR 0004) : seulement une vignette sous licence libre de Wikimedia Commons,
 * servie par département dans les données de Repère (jamais chargée chez Wikimedia), avec
 * son crédit (CreditPhoto) affiché dessous. Jamais une photo de l'Assemblée (D1). Sans
 * photo : les initiales, selon la règle unique écrite plus bas (teinteAvatar). */
import { useProfil } from "../lib/profil";
import { Image, Linking, Pressable, Text, View } from "react-native";
import { usePhotoElu, type PhotoElu } from "../lib/photos";
import { couleurs, OMBRE, POLICE, type Echelon } from "../lib/theme";
import { bordureGroupe, couleurGroupe, GROUPE_INCONNU, texteSur } from "../lib/groupes";
import { REFLET_AVATAR } from "../lib/palette";

export function initiales(nom: string): string {
  const morceaux = nom.split(/\s+/).filter(Boolean);
  if (!morceaux.length) return "?";
  const premiere = morceaux[0].charAt(0);
  const derniere = morceaux.length > 1 ? morceaux[morceaux.length - 1].charAt(0) : "";
  return (premiere + derniere).toUpperCase();
}

/* UN SEUL AVATAR, UNE SEULE RÈGLE (porteur, 09/11/2026) : le même élu a le même avatar sur tous les
 * écrans (liste, fiche, « Qui décide », décideurs, vote). Dans l'ordre :
 *   1. sa photo, si Repère en publie une (Wikimedia Commons, licence libre, D27) et si l'écran affiche
 *      son crédit ou y renvoie ; jamais une adresse externe, jamais une photo de l'Assemblée ;
 *   2. la couleur de son groupe politique, s'il est député et que le groupe est publié (invariant 7) ;
 *   3. la couleur de son échelon (commune, département, région, France) ;
 *   4. sinon un dégradé neutre de la palette (un candidat, un préfet).
 * Jamais un rond uni : toujours le dégradé (reflet en haut à gauche, ombre en bas à droite) et un
 * filet plus sombre de la même teinte. Aucune couleur tirée du nom : une teinte arbitraire à côté
 * d'un nom se lirait comme une couleur de parti. */
/* OMBRE est un Proxy de thème : on en copie les champs (…OMBRE), on ne le passe jamais en prop.
 * Une prop de vue native est figée en développement, et le Proxy ne le supporte pas (crash de l'onglet Élus). */
export function teinteAvatar(groupe: string | null | undefined, echelon: Echelon | null | undefined): string {
  if (groupe && groupe !== GROUPE_INCONNU && couleurGroupe(groupe) !== couleurGroupe(GROUPE_INCONNU)) return couleurGroupe(groupe);
  if (echelon && couleurs[echelon]) return couleurs[echelon];
  return couleurs.sourd;
}

export function Avatar({ nom, taille = 64, photo, groupe, echelon }: {
  nom: string; taille?: number; photo?: PhotoElu | null; groupe?: string | null; echelon?: Echelon | null;
}) {
  const fond = teinteAvatar(groupe, echelon);
  const { profil } = useProfil();
  /* V26 bloc 3 : « Masquer les images » du confort de lecture garde les initiales. */
  if (photo && !profil?.masquerImages) {
    return (
      <Image source={{ uri: photo.data }} accessible={false} resizeMode="cover"
        style={{ width: taille, height: taille, borderRadius: taille / 2, borderWidth: 2, borderColor: bordureGroupe(fond), ...OMBRE }} />
    );
  }
  return (
    <View accessible={false} style={{ width: taille, height: taille, borderRadius: taille / 2, ...OMBRE }}>
      <View style={{ flex: 1, borderRadius: taille / 2, backgroundColor: fond, overflow: "hidden",
        borderWidth: 2, borderColor: bordureGroupe(fond), alignItems: "center", justifyContent: "center" }}>
        <View style={{ position: "absolute", width: taille * 1.3, height: taille * 1.3, borderRadius: taille, backgroundColor: REFLET_AVATAR.clair, top: -taille * 0.75, left: -taille * 0.55 }} />
        <View style={{ position: "absolute", width: taille * 1.3, height: taille * 1.3, borderRadius: taille, backgroundColor: REFLET_AVATAR.ombre, bottom: -taille * 0.8, right: -taille * 0.6 }} />
        <Text style={{ color: texteSur(fond), fontFamily: POLICE.titre, fontSize: Math.round(taille * 0.375) }}>{initiales(nom)}</Text>
      </View>
    </View>
  );
}

/* L'AVATAR D'UN ÉLU, PHOTO COMPRISE : il lit lui-même la photo publiée (par département). À employer
   là où le crédit de la photo est affiché ou annoncé (la liste « Élus » et les fiches). */
export function AvatarElu({ nom, taille, groupe, echelon, dep, cle }: {
  nom: string; taille?: number; groupe?: string | null; echelon?: Echelon | null; dep?: string | null; cle?: string | null;
}) {
  const photo = usePhotoElu(dep, cle);
  return <Avatar nom={nom} taille={taille} photo={photo} groupe={groupe} echelon={echelon} />;
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
      <Text style={{ fontSize: 12, lineHeight: 16, color: couleurs.sourd }} numberOfLines={2}>
        Photo : {photo.auteur} · {photo.licence} · Wikimedia Commons (recadrée)
      </Text>
    </Pressable>
    {CONTACT ? (
      <Pressable onPress={() => Linking.openURL(`mailto:${CONTACT}?subject=${encodeURIComponent("Retrait d'une photo d'élu")}`)} accessibilityRole="link"
        accessibilityLabel={`Photo sous licence libre, but informatif. Demander le retrait par courriel à ${CONTACT}`}
        style={({ pressed }) => ({ minHeight: 45, justifyContent: "center", opacity: pressed ? 0.7 : 1 })}>
        <Text style={{ fontSize: 12, lineHeight: 16, color: couleurs.sourd }}>Photo sous licence libre, but informatif. Retrait sur demande : <Text>{CONTACT}</Text></Text>
      </Pressable>
    ) : null}
    </View>
  );
}
