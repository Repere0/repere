/* LE LOGO DE REPÈRE : un repère, c'est une cible et un point d'ancrage. Un anneau, un
 * anneau intermédiaire, un point au centre. Aucune image, aucune bibliothèque : des vues.
 *
 * Pas de dégradé bleu-rouge : il rappellerait le drapeau. Pas de couleur d'accent non plus :
 * la palette n'en a pas, et les cinq couleurs d'échelon portent un sens (invariant 7).
 * L'anneau intermédiaire est donc gris (sourd), et le point suit l'encre.
 *
 * Variantes : « clair » (pour fond clair), « sombre » (pour fond sombre), « mono » (une seule
 * couleur, celle du thème courant, sans anneau intermédiaire). Une carte de partage passe
 * sa propre palette (c), pour rester identique quel que soit le thème du téléphone. */
import { View } from "react-native";
import { NEUTRES_PAR_MODE, type Mode } from "../lib/palette";
import { couleurs } from "../lib/theme";

export type Teinte = { encre: string; sourd?: string };
export type VarianteLogo = Mode | "mono";

export function Logo({ size = 48, variant = "mono", c }: { size?: number; variant?: VarianteLogo; c?: Teinte }) {
  const t: Teinte = c ?? (variant === "mono" ? { encre: couleurs.encre } : NEUTRES_PAR_MODE[variant]);
  const anneau = Math.max(2, Math.round(size * 0.075));
  const point = Math.round(size * 0.2);
  return (
    <View accessible={false} importantForAccessibility="no" style={{ width: size, height: size }}>
      <View style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: size / 2, borderWidth: anneau, borderColor: t.encre,
      }} />
      {t.sourd ? (
        <View style={{
          position: "absolute", top: size * 0.22, left: size * 0.22, right: size * 0.22, bottom: size * 0.22,
          borderRadius: size, borderWidth: Math.max(1, Math.round(size * 0.05)), borderColor: t.sourd,
        }} />
      ) : null}
      <View style={{
        position: "absolute", width: point, height: point, borderRadius: point / 2, backgroundColor: t.encre,
        left: (size - point) / 2, top: (size - point) / 2,
      }} />
    </View>
  );
}
