/* DÉFILEMENT SUR SAFARI iOS (13/11/2026, décision du porteur après le diagnostic WebKit).
 *
 * CE QUI EST SÛR, MESURÉ par tests/webkit-iphone-web.mjs sur le runner :
 *   - l'application a UN SEUL conteneur qui défile (le défaut des deux conteneurs imbriqués est corrigé) ;
 *   - `body { overflow: hidden }` est posé par l'export web d'Expo (l'application possède la fenêtre) ;
 *   - `-webkit-overflow-scrolling` n'est PAS posé, et `overscroll-behavior` vaut `auto`.
 *
 * CE QUI N'EST PAS PROUVÉ : que ces deux manques causent le blocage que le porteur voit au doigt.
 * Playwright ne sait pas simuler un balayage sur WebKit mobile (`mouse.wheel` n'y existe pas, et
 * `new Touch(...)` y est un « Illegal constructor »). Ces deux lignes sont donc du CSS DÉFENSIF, décidé
 * en connaissance de cause : inertes sur les autres moteurs, et sans effet si le défaut est ailleurs.
 *
 *   - `-webkit-overflow-scrolling: touch` : rend l'inertie au conteneur sur les anciennes versions de
 *     Safari iOS ; sans elle, un conteneur imbriqué peut s'arrêter net en fin de geste.
 *   - `overscroll-behavior: contain` : empêche le geste de « passer au travers » vers le document
 *     quand on atteint une extrémité — c'est exactement le moment où le porteur dit ne plus remonter.
 *
 * POURQUOI UNE FEUILLE DE STYLE ET PAS UN `style={}` : React Native Web ne connaît pas
 * `-webkit-overflow-scrolling`. Les conteneurs portent donc un marqueur (`dataSet`), que cette règle
 * cible. Le marqueur est aussi ce que le banc mesure : il rend la correction vérifiable. */
export const MARQUEUR = "defilement";

const REGLES = `[data-${MARQUEUR}="ios"]{-webkit-overflow-scrolling:touch;overscroll-behavior:contain;}`;

/* Posée une seule fois, au démarrage de l'application web. Sans document (natif, test unitaire) : rien. */
export function poserDefilementIos(): void {
  if (typeof document === "undefined" || document.getElementById("repere-defilement-ios")) return;
  const style = document.createElement("style");
  style.id = "repere-defilement-ios";
  style.textContent = REGLES;
  document.head.appendChild(style);
}

/* À poser sur tout conteneur qui défile. `as never` : `dataSet` existe sur React Native Web, pas dans
   les types de React Native. Le marqueur n'a aucun effet hors du web. */
export const MARQUE_DEFILEMENT: Record<string, unknown> = { dataSet: { [MARQUEUR]: "ios" } };
