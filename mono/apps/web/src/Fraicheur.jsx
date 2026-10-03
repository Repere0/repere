import { useEffect, useState } from "react";
import { etatFraicheur, surFraicheur, FRAICHEUR, PHRASES_FRAICHEUR, verifierPublication } from "@repere/data-utils";

/* INVARIANT 9 — FRAICHEUR (decision du porteur, 30/09/2026).
 *
 * Une donnee gardee sur l'appareil peut etre affichee — c'est ce qui rend
 * Repere lisible hors ligne — mais jamais presentee comme actuelle si elle ne
 * l'est pas. Ce bandeau dit l'etat que le client de donnees a etabli
 * (packages/data-utils/src/client.js) :
 *   - ACTUELLE : rien a ajouter, la publication courante est affichee ;
 *   - PRECEDENTE : une partie date d'une publication precedente ;
 *   - INCONNUE : le serveur n'a pas pu confirmer qu'il n'y a rien de plus recent ;
 *   - une publication parue pendant la lecture : proposee, jamais imposee.
 * Memes phrases que l'application mobile (PHRASES_FRAICHEUR).
 *
 * REVERIFICATION AU RETOUR DU LECTEUR : un onglet laisse ouvert plusieurs
 * jours ne redemandait jamais l'index (faille F-2 du 30/09). Au retour sur
 * l'onglet, on redemande ; jamais de sondage pendant qu'il n'est pas regarde. */
export function Fraicheur() {
  const [e, setE] = useState(etatFraicheur());
  useEffect(() => {
    const desabonner = surFraicheur(setE);
    const surRetour = () => { if (document.visibilityState === "visible") verifierPublication().catch(() => {}); };
    document.addEventListener("visibilitychange", surRetour);
    return () => { desabonner(); document.removeEventListener("visibilitychange", surRetour); };
  }, []);
  if (e.etat !== FRAICHEUR.PRECEDENTE && e.etat !== FRAICHEUR.INCONNUE) return null;
  const p = e.nouvelle ? PHRASES_FRAICHEUR.nouvelle : PHRASES_FRAICHEUR[e.etat];
  return (
    <div className="fraicheur" role="status" data-etat={e.nouvelle ? "nouvelle" : e.etat}>
      <b>{p.titre}</b> <span>{p.corps}</span>
      {p.action ? <button type="button" onClick={() => location.reload()}>{p.action}</button> : null}
    </div>
  );
}
