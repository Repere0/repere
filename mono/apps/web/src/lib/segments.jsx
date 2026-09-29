import React from "react";
import { Mot } from "@repere/ui";

/* Rend une phrase de @repere/core (phrases.js) : le texte est ecrit la-bas, une
   seule fois pour le site et l'application ; ici, seulement l'habillage web
   (gras, mot du dictionnaire en bouton). */
export function Segments({ s }) {
  return <>{s.map((x, i) => (x.mot ? <Mot key={i} cle={x.mot}>{x.t}</Mot> : x.fort ? <b key={i}>{x.t}</b> : <React.Fragment key={i}>{x.t}</React.Fragment>))}</>;
}
