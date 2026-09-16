import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { MOTS } from "./mots.js";

/* LA LANGUE DU CITOYEN — mecanisme, pas contenu (le contenu vit dans mots.js).
 *
 * REPRIS DU MONOLITHE, PAS REINVENTE. `app_repere_v18_20.html` porte deja ce
 * motif exact : un mot souligne en pointille (`.gl`), un tap ouvre une fiche
 * courte (`openDef`/`openSheet2`). Mesure sur ce fichier avant d'ecrire une
 * ligne ici : aucune icone, aucune couleur, `text-decoration: underline
 * dotted`. On porte le meme choix en React, sans dependance nouvelle — le
 * projet a deja retire framer-motion pour deux proprietes CSS.
 *
 * POURQUOI UN SEUL DECLENCHEUR PAR OCCURRENCE, PAS HUIT. Un ecran ou
 * "scrutin" apparait huit fois (mesure a Aubervilliers, CeQuiADecide.jsx)
 * ne doit pas repeter le lien huit fois : ca traiterait le lecteur qui
 * connait deja le mot comme un debutant a chaque ligne. Le composant <Mot>
 * ne decide pas seul : c'est a l'appelant de ne poser le lien qu'une fois
 * par ecran, sur la premiere occurrence — voir son usage dans les ecrans.
 *
 * AUCUNE TRACE DE CE QUI A DEJA ETE OUVERT. L'invariant 2 (une seule cle de
 * stockage local) interdit d'apprendre "ce lecteur a deja vu ce mot" pour
 * adapter l'affichage — et c'est une garantie de neutralite, pas une
 * limite : le meme mot propose la meme porte discrete a tout le monde. */
const DefinitionCtx = createContext(null);

export function DefinitionProvider({ children }) {
  const [cle, setCle] = useState(null);
  const dernierFocus = useRef(null);
  const boutonFermer = useRef(null);

  const ouvrir = c => {
    if (!MOTS[c]) return;
    dernierFocus.current = document.activeElement;
    setCle(c);
  };
  const fermer = () => {
    setCle(null);
    if (dernierFocus.current && dernierFocus.current.focus) dernierFocus.current.focus();
  };

  useEffect(() => {
    if (!cle) return undefined;
    if (boutonFermer.current) boutonFermer.current.focus();
    /* PIEGE DE FOCUS, TROUVE MANQUANT PAR L'AUDIT WCAG DU 16/09/2026.
     * `aria-modal="true"` PROMET a l'assistance technologique qu'on ne peut
     * pas sortir de la fiche par le clavier — mesure : un seul Tab suffisait
     * a en sortir. Pas de dependance de piege de focus generique : un seul
     * element est focusable ici (le bouton Fermer), donc Tab et Maj+Tab
     * reviennent tout simplement sur lui. Si la fiche gagne un jour un
     * second element focusable (un lien "en savoir plus"), ce piege devra
     * cycler entre les deux au lieu de tout ramener au meme bouton. */
    const surClavier = e => {
      if (e.key === "Escape") { fermer(); return; }
      if (e.key === "Tab") { e.preventDefault(); if (boutonFermer.current) boutonFermer.current.focus(); }
    };
    document.addEventListener("keydown", surClavier);
    return () => document.removeEventListener("keydown", surClavier);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cle]);

  const def = cle ? MOTS[cle] : null;

  return (
    <DefinitionCtx.Provider value={ouvrir}>
      {children}
      {def ? (
        <div className="mot-fond" onClick={fermer} aria-hidden="true" />
      ) : null}
      {def ? (
        <div className="mot-fiche" role="dialog" aria-modal="true" aria-labelledby="mot-fiche-titre">
          <div className="mot-fiche-in">
            <b id="mot-fiche-titre">{def.titre}</b>
            <p>{def.corps}</p>
            <button type="button" ref={boutonFermer} className="mot-fermer" onClick={fermer}>
              Fermer
            </button>
          </div>
        </div>
      ) : null}
    </DefinitionCtx.Provider>
  );
}

/* `<Mot cle="circonscription">circonscription</Mot>` — le texte affiche n'a
 * pas besoin de reprendre exactement la cle (accord, majuscule) : la cle
 * sert a chercher la definition, l'enfant est ce que l'ecran veut ecrire. */
export function Mot({ cle, children }) {
  const ouvrir = useContext(DefinitionCtx);
  if (!ouvrir || !MOTS[cle]) return children;
  return (
    <button type="button" className="mot" onClick={() => ouvrir(cle)}>
      {children}
    </button>
  );
}
