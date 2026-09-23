import { useEffect, useState } from "react";
import { Vide } from "@repere/ui";
import { adresseIndex } from "@repere/data-utils";

/* DETECTE UN DEPLOIEMENT SURVENU PENDANT QUE L'ONGLET ETAIT DEJA OUVERT.
 *
 * LE DEFAUT MESURE EN REEL LE 23/09/2026, PAS SUPPOSE : un onglet ouvert avant
 * un nouveau déploiement garde en mémoire le nom des fichiers JS (empreintés
 * par le build) de l'ANCIENNE version. Netlify remplace la publication en
 * entier a chaque déploiement — ces anciens fichiers n'existent plus nulle
 * part, meme en contournant tous les caches (mesuré : un fetch direct,
 * cache: "no-store", renvoie 404). Cliquer sur un écran pas encore ouvert
 * dans cet onglet échoue alors reellement, jusqu'a un rechargement complet.
 *
 * LE MECANISME LE PLUS SIMPLE COMPATIBLE AVEC UNE ARCHITECTURE STATIQUE :
 * comparer le commit qui a produit le JS EN COURS D'EXECUTION (figé au build,
 * voir vite.config.js) a celui que le serveur sert MAINTENANT dans
 * data/index.json — un champ QUI EXISTE DEJA (extract-html.js), écrit pour une
 * autre raison (la provenance). Aucun nouveau fichier, aucun nouveau format.
 *
 * QUAND VERIFIER, ET POURQUOI PAS UNE BOUCLE SERREE : au retour de l'onglet
 * (visibilitychange) — c'est le moment ou un lecteur qui a laisse Repère
 * ouvert plusieurs heures a le plus de chances de revenir juste apres un
 * déploiement. L'intervalle de secours (30 min) ne couvre que l'onglet qui
 * reste au premier plan sans jamais en sortir, un cas rare. Aucun sondage
 * pendant que la page n'est meme pas regardee.
 *
 * PAS DE RECHARGEMENT AUTOMATIQUE, JAMAIS : perdre un écran en cours de
 * lecture sans prévenir créerait un nouveau défaut, distinct de celui qu'on
 * corrige. Le lecteur décide, d'un geste explicite. */
const INTERVALLE_MS = 30 * 60 * 1000;

export function NouvelleVersion() {
  const [disponible, setDisponible] = useState(false);

  useEffect(() => {
    const buildActuel = typeof __REPERE_BUILD__ !== "undefined" ? __REPERE_BUILD__ : null;
    if (!buildActuel) return; /* build local sans provenance : rien a comparer, honnete */

    let vivant = true;
    async function verifier() {
      try {
        const r = await fetch(adresseIndex() + "?verifVersion=" + Date.now(), { cache: "no-store" });
        if (!r.ok) return;
        const j = await r.json();
        const buildServi = j && j.build && j.build.commit_court;
        if (vivant && buildServi && buildServi !== buildActuel) setDisponible(true);
      } catch { /* hors ligne ou reseau instable : pas d'alerte sur une supposition */ }
    }

    const surRetour = () => { if (document.visibilityState === "visible") verifier(); };
    document.addEventListener("visibilitychange", surRetour);
    const id = setInterval(verifier, INTERVALLE_MS);
    return () => { vivant = false; document.removeEventListener("visibilitychange", surRetour); clearInterval(id); };
  }, []);

  if (!disponible) return null;
  return (
    <Vide titre="Une nouvelle version de Repère est disponible."
      corps="Vos données restent les mêmes ; seule l'application se rafraîchit."
      action="Actualiser" onAction={() => location.reload()} />
  );
}
