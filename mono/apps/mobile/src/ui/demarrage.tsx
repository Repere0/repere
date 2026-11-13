/* L'ÉCRAN DE DÉMARRAGE (13/11/2026, décision du porteur) : le logo sur le fond sombre de Repère, en fondu.
 *
 * 13/11/2026 (test sur iPhone) : « on voit le rond du logo, mais c'est buggé, et la page du prénom ne
 * s'affiche jamais ». La cause : le voile ne partait QUE sur la fin de l'animation. Sur iOS, pendant le
 * lancement d'une application installée, les images par seconde peuvent être bridées et la séquence ne
 * rend jamais la main : le voile restait, et avec lui le logo à mi-fondu, sur un écran noir définitif.
 * Un FILET DE SÉCURITÉ retire maintenant le voile au bout de la durée totale, quoi qu'il arrive, et un
 * second filet le retire si rien ne s'est passé en deux secondes. Le voile n'est plus jamais ce qui
 * décide : il se contente de couvrir une application déjà dessinée et déjà navigable.
 *
 * 1,2 seconde en tout (plafond demandé : 1,5 s) : le logo apparaît (350 ms, léger grossissement de 0,92 à 1), tient
 * 500 ms, puis le voile s'efface (350 ms) sur l'application DÉJÀ dessinée dessous. Le voile ne capte aucun geste
 * (pointerEvents none) : il ne retarde ni un lecteur pressé, ni un lecteur d'écran, ni un lien ouvert sur une page
 * précise. Animations réduites (réglage du lecteur ou du système) : aucun voile. Une fois par lancement. */
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet } from "react-native";
import { NEUTRES_PAR_MODE } from "../lib/palette";
import { Logo } from "./logo";
import { useMouvementReduit } from "./mouvement";
import { useProfil } from "../lib/profil";

export const DUREE_DEMARRAGE = { entree: 350, tenue: 500, sortie: 350 };
/* Le retard qu'on tolere avant de couper court : au-dela, le voile part sans attendre l'animation. */
export const MARGE_FILET = 250;
export const PLAFOND_DEMARRAGE = DUREE_DEMARRAGE.entree + DUREE_DEMARRAGE.tenue + DUREE_DEMARRAGE.sortie + MARGE_FILET;
let dejaJoue = false;

export function Demarrage() {
  const reduit = useMouvementReduit();
  /* 13/11/2026 (porteur) : AU PREMIER LANCEMENT, PAS DE VOILE. L'écran 1 de la bienvenue montre déjà le
     logo, avec un bouton : deux logos à la suite, dont un qui part tout seul, se lisaient comme un
     blocage. Le voile ne sert qu'aux lancements suivants, quand il n'y a plus d'onboarding à afficher. */
  const { absent } = useProfil();
  const [fini, setFini] = useState(dejaJoue);
  const logo = useRef(new Animated.Value(0)).current;
  const voile = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (fini) return;
    dejaJoue = true;
    if (reduit) { setFini(true); return; }
    const d = DUREE_DEMARRAGE;
    const sequence = Animated.sequence([
      Animated.timing(logo, { toValue: 1, duration: d.entree, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.delay(d.tenue),
      Animated.timing(voile, { toValue: 0, duration: d.sortie, easing: Easing.in(Easing.quad), useNativeDriver: false }),
    ]);
    sequence.start(() => setFini(true));
    /* LE FILET. Un `setTimeout` ne depend pas des images par seconde : meme si l'animation cale, le voile
       part a l'heure. MARGE_FILET couvre le retard normal d'un demarrage charge. */
    const filet = setTimeout(() => { sequence.stop(); setFini(true); }, d.entree + d.tenue + d.sortie + MARGE_FILET);
    return () => clearTimeout(filet);
  }, [fini, reduit, logo, voile]);
  if (fini || absent) return null;
  const sombre = NEUTRES_PAR_MODE.sombre;
  return (
    <Animated.View pointerEvents="none" testID="demarrage" accessible={false} importantForAccessibility="no-hide-descendants" aria-hidden
      style={[StyleSheet.absoluteFill, { zIndex: 1000, alignItems: "center", justifyContent: "center", backgroundColor: sombre.sol, opacity: voile }]}>
      <Animated.View style={{ opacity: logo, transform: [{ scale: logo.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) }] }}>
        {/* 13/11/2026 : « variant », PAS « c ». En passant une teinte sans `sourd`, le logo perdait son
            anneau gris intermédiaire et se réduisait à un cercle et un point — ce n'était plus le logo.
            La variante sombre porte les trois valeurs : ivoire, gris, ivoire. */}
        <Logo size={96} variant="sombre" />
      </Animated.View>
    </Animated.View>
  );
}
