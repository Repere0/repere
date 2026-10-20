/* ICONES DESSINEES EN VUES — 16/10/2026.
 *
 * Les onglets portaient des caracteres (« ◷ », « ⌂ », « ▦ ») : leur dessin depend
 * de la police du telephone, leur taille et leur epaisseur varient d'un appareil a
 * l'autre, et « ▦ » ne se lit pas comme un calendrier. Ces quatre icones sont faites
 * de simples vues (bordures de 2 pt) : aucune bibliotheque native ajoutee, le meme
 * trait sur iOS, Android et le web, et la couleur de l'onglet (encre ou gris).
 *
 * Elles sont decoratives : le nom de l'onglet ou du bouton est porte par le libelle
 * accessible de l'element qui les contient. */
import { View } from "react-native";

const T = 2;          // epaisseur du trait
const C = 24;         // cote de la boite

type P = { couleur: string };

/* Une boite fixe de 24 pt : la taille des icones de barre d'onglets sur iOS et Android. */
function Boite({ children }: { children: React.ReactNode }) {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no" pointerEvents="none" style={{ width: C, height: C }}>
      {children}
    </View>
  );
}

/* Aujourd'hui : une horloge. */
export function IconeHorloge({ couleur }: P) {
  return (
    <Boite>
      <View style={{ position: "absolute", left: 2, top: 2, width: 20, height: 20, borderRadius: 10, borderWidth: T, borderColor: couleur }} />
      <View style={{ position: "absolute", left: 11, top: 6, width: T, height: 7, borderRadius: 1, backgroundColor: couleur }} />
      <View style={{ position: "absolute", left: 11, top: 11, width: 5, height: T, borderRadius: 1, backgroundColor: couleur }} />
    </Boite>
  );
}

/* Chez vous : une maison (un toit, un corps). */
export function IconeMaison({ couleur }: P) {
  return (
    <Boite>
      <View style={{ position: "absolute", left: 5.5, top: 4.5, width: 13, height: 13, borderTopWidth: T, borderLeftWidth: T, borderColor: couleur, transform: [{ rotate: "45deg" }] }} />
      <View style={{ position: "absolute", left: 5, top: 11, width: 14, height: 10, borderWidth: T, borderTopWidth: 0, borderColor: couleur }} />
    </Boite>
  );
}

/* Qui decide : une boussole (un cercle, une aiguille). Decision du 20/10/2026. */
export function IconeBoussole({ couleur }: P) {
  return (
    <Boite>
      <View style={{ position: "absolute", left: 2, top: 2, width: 20, height: 20, borderRadius: 10, borderWidth: T, borderColor: couleur }} />
      <View style={{ position: "absolute", left: 9, top: 6, width: 6, height: 12, borderRadius: 2, backgroundColor: couleur, transform: [{ rotate: "45deg" }] }} />
    </Boite>
  );
}

/* Calendrier : une page, sa bande du haut, deux anneaux. */
export function IconeCalendrier({ couleur }: P) {
  return (
    <Boite>
      <View style={{ position: "absolute", left: 3, top: 5, width: 18, height: 16, borderRadius: 3, borderWidth: T, borderColor: couleur }} />
      <View style={{ position: "absolute", left: 3, top: 9, width: 18, height: T, backgroundColor: couleur }} />
      <View style={{ position: "absolute", left: 7, top: 3, width: T, height: 4, borderRadius: 1, backgroundColor: couleur }} />
      <View style={{ position: "absolute", left: 15, top: 3, width: T, height: 4, borderRadius: 1, backgroundColor: couleur }} />
      <View style={{ position: "absolute", left: 7, top: 13, width: 3, height: 3, backgroundColor: couleur }} />
      <View style={{ position: "absolute", left: 12, top: 13, width: 3, height: 3, backgroundColor: couleur }} />
    </Boite>
  );
}

/* Partager : la boite ouverte et la fleche qui en sort (le geste commun des telephones). */
export function IconePartage({ couleur }: P) {
  return (
    <Boite>
      <View style={{ position: "absolute", left: 5, top: 10, width: 14, height: 11, borderWidth: T, borderTopWidth: 0, borderBottomLeftRadius: 2, borderBottomRightRadius: 2, borderColor: couleur }} />
      <View style={{ position: "absolute", left: 5, top: 10, width: 4, height: T, backgroundColor: couleur }} />
      <View style={{ position: "absolute", left: 15, top: 10, width: 4, height: T, backgroundColor: couleur }} />
      <View style={{ position: "absolute", left: 11, top: 3, width: T, height: 12, backgroundColor: couleur }} />
      <View style={{ position: "absolute", left: 8.5, top: 3.5, width: 7, height: 7, borderTopWidth: T, borderLeftWidth: T, borderColor: couleur, transform: [{ rotate: "45deg" }] }} />
    </Boite>
  );
}
