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

export function Carte({ echelon = "ville", titre, sousTitre, tag, children }) {
  return (
    <section className="carte" style={{ borderLeftColor: `var(--e-${echelon})` }}>
      <header className="carte-h">
        <div>
          <h2 style={{ color: `var(--e-${echelon})` }}>{titre}</h2>
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
      <span className="tuile-v" style={echelon ? { color: `var(--e-${echelon})` } : undefined}>{v}</span>
      {n ? <span className="tuile-n">{n}</span> : null}
    </div>
  );
}

export function Puce({ actif, echelon = "ville", onClick, children }) {
  return (
    <button type="button" className={"puce" + (actif ? " actif" : "")}
      aria-pressed={actif} onClick={onClick}>
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
  return (
    <div className="ligne">
      <div className="ligne-h">
        <span>{libelle}</span>
        <b>{valeur.toLocaleString("fr-FR")} {unite}</b>
      </div>
      {tracable ? (
        <div className="barre"><i style={{ width: pc + "%", background: `var(--e-${echelon})` }} /></div>
      ) : (
        <div className="ligne-note">Montant trop faible pour être tracé à cette échelle.</div>
      )}
    </div>
  );
}

/* INVARIANT 4 : aucun chiffre ne s'affiche sans ce composant à côté. */
/* « mise a jour du 2026-07-29 » est une date de machine. Vu sur une capture : un
   ecran qui explique des comptes publics ne peut pas ecrire ses dates en ISO. */
function dateFr(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v || ""));
  if (!m) return v;
  const mois = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet",
                "août", "septembre", "octobre", "novembre", "décembre"];
  return Number(m[3]) + (m[3] === "01" ? "er" : "") + " " + mois[Number(m[2]) - 1] + " " + m[1];
}

export function Source({ producteur, licence, maj, url, calcul }) {
  return (
    <p className="source">
      {calcul ? <b>Calculé par Repère à partir des montants ci-dessus — ce n'est pas un chiffre publié. </b> : null}
      {producteur}{licence ? " · " + licence : ""}{maj ? " · mise à jour du " + dateFr(maj) : ""}
      {url ? <> · <a href={url} target="_blank" rel="noopener">voir à la source ↗</a></> : null}
    </p>
  );
}
