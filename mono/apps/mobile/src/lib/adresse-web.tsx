/* L'ADRESSE PARTAGEABLE, VERSION WEB (12/11/2026, décision du porteur) : « /finances#melun ».
 *
 * La commune se lit et s'écrit APRÈS le « # » : le navigateur ne l'envoie jamais au serveur, donc ni
 * l'hébergeur ni ses journaux ne la voient (invariant 2). Ce composant ne rend rien : il
 *   1. à l'ouverture d'un lien « …#melun », choisit cette commune (une commune inconnue ne choisit rien) ;
 *   2. garde le « # » à jour quand la commune ou l'écran change (replaceState : aucune requête, aucune entrée
 *      d'historique en plus) ;
 *   3. écrit le titre de l'onglet : « Finances de Melun - Repère ».
 * Ouvrir un lien choisit la commune pour la session ; rien n'est gardé sur l'appareil sans que le lecteur le
 * demande (lib/memoire.ts, inchangé). Sur mobile natif : aucun effet. */
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { usePathname } from "expo-router";
import { departementDe, inseeDepuisHash, tableSlugs, titreOnglet } from "@repere/core";
import { chargerCommunesBeta } from "./donnees";
import { useSelection } from "./selection";

type Table = { parInsee: Record<string, string>; parSlug: Record<string, string> };

function Pont() {
  const { choix, choisir } = useSelection();
  const chemin = usePathname();
  const [communes, setCommunes] = useState<Record<string, string> | null>(null);
  const [table, setTable] = useState<Table | null>(null);
  /* La commune demandée par le « # » et pas encore appliquée : l'écriture attend, sinon une commune gardée sur
     l'appareil écraserait le lien avant qu'il ait été lu. */
  const attente = useRef<string | null>(null);
  /* Un « # » refusé (nom inconnu ou ambigu, saisi à la main) : on relance l'écriture pour le remplacer. */
  const [relance, setRelance] = useState(0);

  useEffect(() => {
    let vivant = true;
    chargerCommunesBeta().then(r => {
      const c = (r.donnees as { communes?: Record<string, string> } | null)?.communes;
      if (vivant && c) { setCommunes(c); setTable(tableSlugs(c) as Table); }
    });
    return () => { vivant = false; };
  }, []);

  useEffect(() => {
    if (!table || !communes) return undefined;
    const lire = () => {
      const insee = inseeDepuisHash(window.location.hash, table);
      const dep = insee ? departementDe(insee) : null;
      if (!insee || !dep) { setRelance(n => n + 1); return; }
      attente.current = insee;
      choisir({ dep, insee, nom: communes[insee] });
    };
    lire();
    window.addEventListener("hashchange", lire);
    return () => window.removeEventListener("hashchange", lire);
  }, [table, communes, choisir]);

  useEffect(() => {
    if (!table) return undefined;
    if (attente.current) {
      if (choix?.insee !== attente.current) return undefined;
      attente.current = null;
    }
    const slug = choix ? table.parInsee[choix.insee] : null;
    /* Un instant après le changement d'écran : le routeur écrit sa propre adresse (sans « # ») juste après avoir
       changé d'état ; écrire avant ferait perdre le « # » au premier clic. */
    const t = setTimeout(() => {
      const l = window.location;
      const cible = `${l.pathname}${l.search}${slug ? "#" + slug : ""}`;
      if (cible !== `${l.pathname}${l.search}${l.hash}`) window.history.replaceState(window.history.state, "", cible);
    }, 80);
    return () => clearTimeout(t);
  }, [choix, chemin, table, relance]);

  useEffect(() => { document.title = titreOnglet(chemin, choix?.nom); }, [chemin, choix]);
  return null;
}

export function AdresseCommune() {
  return Platform.OS === "web" ? <Pont /> : null;
}
