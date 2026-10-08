import React from "react";

/* DOCTRINE DU VIDE (invariant 5). Il n'existe pas de composant « squelette » dans
   ce paquet, et c'est délibéré : une forme grise qui palpite est un contenant
   sans contenu. Une absence produit une PHRASE, et si possible un lien vers la
   source officielle — pour que le lecteur puisse aller voir lui-même. */
export function Vide({ titre, corps, lien, action, onAction }) {
  return (
    <div className="vide" role="status">
      <b>{titre}</b>
      {corps ? <span>{corps}</span> : null}
      {lien ? <a href={lien.url} target="_blank" rel="noopener">{lien.texte} ↗</a> : null}
      {action ? <button type="button" onClick={onAction}>{action}</button> : null}
    </div>
  );
}

/* Le chargement DIT ce qu'il charge et pourquoi c'est une seule fois. Un lecteur
   qui sait ce qu'il attend attend mieux. */
export function Chargement({ titre, corps }) {
  return (
    <div className="vide charge" role="status" aria-live="polite">
      <b>{titre}</b>
      {corps ? <span>{corps}</span> : null}
    </div>
  );
}

/* L'ECHELON EST POSE COMME VARIABLE, PAS COMME COULEUR DE TEXTE.
 *
 * Le titre portait `style={{ color: var(--e-echelon) }}` en ligne, donc la meme
 * couleur dans les deux themes. Mesure en theme sombre, sur fond de carte :
 * l'echelon « france » (#1d1d1f, un quasi-noir) donnait un rapport de contraste
 * de 1,02 — le titre « A l'Assemblee nationale » etait litteralement invisible ;
 * « region » tombait a 2,42. Un style en ligne ne peut pas repondre au theme :
 * on passe donc l'echelon en variable CSS, et la feuille decide. */
export function Carte({ echelon = "ville", titre, sousTitre, tag, children }) {
  return (
    <section className="carte" style={{ "--e": `var(--e-${echelon})` }}>
      <header className="carte-h">
        <div>
          <h2>{titre}</h2>
          {sousTitre ? <p className="carte-s">{sousTitre}</p> : null}
        </div>
        {tag ? <span className="tag">{tag}</span> : null}
      </header>
      {children}
    </section>
  );
}

export function Tuile({ k, v, n, echelon }) {
  return (
    <div className="tuile">
      <span className="tuile-k">{k}</span>
      <span className="tuile-v" style={echelon ? { "--e": `var(--e-${echelon})` } : undefined}>{v}</span>
      {n ? <span className="tuile-n">{n}</span> : null}
    </div>
  );
}

/* `onSurvol` porte sur le BOUTON, pas sur un <span> a l'interieur : un span n'est
   pas focusable, donc l'appel a onFocus qui y etait pose ne se declenchait jamais.
   Le prechargement au survol existait pour la souris et pour elle seule. */
export function Puce({ actif, echelon = "ville", onClick, onSurvol, children }) {
  return (
    <button type="button" className={"puce" + (actif ? " actif" : "")}
      aria-pressed={actif} onClick={onClick}
      onMouseEnter={onSurvol} onFocus={onSurvol}>
      <span className="pastille" style={{ background: `var(--e-${echelon})` }} aria-hidden="true" />
      {children}
    </button>
  );
}

/* INVARIANT 3 : cette barre ne compare QUE des montants d'un même territoire
   entre eux. Elle n'accepte pas de second territoire, et c'est une garde de
   conception, pas une convention : le composant ne sait pas en dessiner deux. */
export function BarreEchelon({ libelle, valeur, maximum, unite = "€", echelon = "ville" }) {
  const pc = maximum > 0 ? Math.round((valeur / maximum) * 100) : 0;
  /* Doctrine du vide : une barre de largeur nulle ferait passer une valeur pour
     une absence. En dessous d'un pour cent, on écrit le chiffre sans barre. */
  const tracable = pc >= 1;
  /* 08/10/2026 (audit de verite) : un montant NEGATIF publie (Le Mesnil-Amelot,
     impots et taxes 2025 : -1 199 568 €) et un ZERO publie recevaient la meme
     note « trop faible pour etre trace » : fausse dans les deux cas. Chacun a
     sa phrase ; Repere n'invente pas la raison d'un montant negatif. */
  const note = valeur < 0 ? "Montant négatif, tel que la source le publie : il ne se trace pas sur une barre."
    : valeur === 0 ? "Montant nul, tel que la source le publie."
    : "Montant trop faible pour être tracé à cette échelle.";
  return (
    <div className="ligne">
      <div className="ligne-h">
        <span>{libelle}</span>
        <b>{valeur.toLocaleString("fr-FR")} {unite}</b>
      </div>
      {tracable ? (
        <div className="barre"><i style={{ width: pc + "%", background: `var(--e-${echelon})` }} /></div>
      ) : (
        <div className="ligne-note">{note}</div>
      )}
    </div>
  );
}

/* INVARIANT 4 : aucun chiffre ne s'affiche sans ce composant à côté. */
/* dateFr et jourFr VIVENT DANS @repere/core DEPUIS LE 29/09/2026 (voir
   packages/core/src/format.js), pour que l'application mobile ecrive les dates
   exactement comme le web. Re-exportees ici : les ecrans n'ont rien a changer. */
export { dateFr, jourFr } from "@repere/core";
import { dateFr, ligneSource, CALCUL_REPERE } from "@repere/core";

/* `maj` est une date de publication ; `mention` est une precision de temps qui
   n'en est pas une (« decoupage de 2010 »). Les melanger produisait « mise a jour
   du decoupage de 2010 », qui ne veut rien dire. */
export function Source({ producteur, licence, maj, mention, url, calcul }) {
  return (
    <p className="source">
      {/* Texte ecrit dans @repere/core (ligneSource) : l'application mobile ecrit la meme ligne. */}
      {calcul ? <b>{CALCUL_REPERE} </b> : null}
      {ligneSource({ producteur, licence, maj, mention })}
      {url ? <> · <a href={url} target="_blank" rel="noopener">voir à la source ↗</a></> : null}
    </p>
  );
}
