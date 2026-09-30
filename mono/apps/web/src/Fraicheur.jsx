/* LA FRAICHEUR, DITE A L'ECRAN — INVARIANT 9 (01/10/2026).
 *
 * Mesure du 30/09 au soir, avant ce composant : serveur coupe, le site montrait
 * ses donnees gardees sans un mot ; et une copie d'une publication precedente
 * s'affichait exactement comme une donnee du jour. La donnee etait lisible hors
 * ligne — c'est voulu —, mais rien ne permettait de savoir qu'elle pouvait etre
 * ancienne.
 *
 * L'etat vient du client partage (`abonnerFraicheur`), la phrase de
 * @repere/core (`phraseFraicheur`) : le site et l'application disent la meme
 * chose. Rien n'est affiche quand la donnee est actuelle. `role="status"` :
 * un lecteur d'ecran l'annonce sans interrompre. */
import { useEffect, useState } from "react";
import { abonnerFraicheur } from "@repere/data-utils";
import { phraseFraicheur } from "@repere/core";

export function Fraicheur() {
  const [etat, setEtat] = useState(null);
  useEffect(() => abonnerFraicheur(setEtat), []);
  const p = phraseFraicheur(etat);
  if (!p) return null;
  return (
    <div className="fraicheur" role="status" data-etat={p.etat}>
      <p className="fraicheur-titre">{p.titre}</p>
      <p className="fraicheur-corps">{p.corps}</p>
    </div>
  );
}
