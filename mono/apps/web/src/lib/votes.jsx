import React from "react";
import { dateFr } from "@repere/ui";

/* LA LECTURE D'UN SCRUTIN, ECRITE UNE SEULE FOIS.
 *
 * POURQUOI CE FICHIER EXISTE. Deux ecrans lisent maintenant les memes scrutins :
 * « Qui decide » les montre tous, « Ce qui a ete decide » n'en prend que les
 * lois pour son fil date. La recherche de commune avait deja ete derivee deux
 * fois dans ce produit, les deux copies avaient divergé, et « Évry » ne donnait
 * plus aucun resultat pendant des semaines (decision D-15). On ne refait pas
 * cette faute : la regle vit ici, les ecrans l'importent.
 *
 * Le banc echoue si `estSolennel` ou `titreLisible` reapparait ailleurs. */

export const MOTS = { p: "Pour", c: "Contre", a: "Abstention" };

/* CE QUE VOIT UN CITOYEN, ET CE QU'IL VOULAIT VOIR. Mesure du 13/09/2026 sur les
 * 80 scrutins publies : 89 % sont des votes de PROCEDURE — amendements,
 * sous-amendements, motions — et 66 sur 80 portent sur un seul et meme texte.
 * L'ecran affichait donc, en tete, « le sous-amendement n° 1233 de Mme X a
 * l'amendement n° 1050 de Mme Y a l'article 5 du projet de loi... ». Personne ne
 * cherche ca. On cherche comment son depute a vote LA LOI.
 *
 * LA SOURCE PORTE DEJA LA DISTINCTION, il n'y avait qu'a la lire : `typeVote`
 * vaut « scrutin public solennel » pour 8 scrutins sur 80, et ces huit-la sont
 * exactement les votes sur l'ensemble d'un texte. Huit lois, huit positions.
 *
 * RIEN N'EST RETIRE : les 72 autres sont derriere un depliant, avec leur intitule
 * officiel intact. Ce n'est pas un tri de valeur — c'est la distinction que
 * l'Assemblee elle-meme etablit entre un vote solennel et un vote ordinaire. */
export const estSolennel = sc => /solennel/i.test(sc.tv || "");

/* L'INTITULE OFFICIEL, ALLEGE DE SA PROCEDURE — ET DE RIEN D'AUTRE.
 * On retire deux choses, toutes deux redondantes une fois la ligne mise en forme :
 * l'amorce « l'ensemble de la / du », et la parenthese de lecture, qui est
 * REAFFICHEE a cote de la date plutot que supprimee. Aucune reformulation, aucun
 * mot ajoute : le lien vers le scrutin officiel donne le texte integral. */
export function titreLisible(t) {
  let x = String(t || "").trim();
  x = x.replace(/^l'ensemble (?:de la|du|des|de l')\s*/i, "");
  x = x.replace(/\s*\((?:texte de la commission mixte paritaire|première lecture|nouvelle lecture|seconde délibération|lecture définitive)[^)]*\)\s*\.?\s*$/i, "");
  x = x.replace(/\.\s*$/, "");
  return x.charAt(0).toUpperCase() + x.slice(1);
}
export function procedure(t) {
  const m = /\((texte de la commission mixte paritaire|première lecture|nouvelle lecture|seconde délibération|lecture définitive)[^)]*\)\s*\.?\s*$/i.exec(String(t || ""));
  return m ? m[1].toLowerCase() : "";
}
export function decompte(d) {
  if (!d) return "";
  const n = Number(d.abstentions);
  return `${d.pour} pour, ${d.contre} contre, ${d.abstentions} abstention${n > 1 ? "s" : ""}`;
}

/* UNE LIGNE DE VOTE. `loi` change la mise en forme, jamais le fond : pour un
 * texte, le titre allege passe en tete et l'intitule officiel n'est plus repete ;
 * pour un vote de detail, l'intitule officiel EST la ligne. Dans les deux cas :
 * le resultat du scrutin AVANT la position du depute — on lisait « Contre » puis,
 * huit lignes plus bas, que le texte avait ete adopte. */
export function LigneVote({ sc, position, base, loi }) {
  const proc = procedure(sc.t);
  return (
    <div className="ligne vote">
      {loi ? <b className="vote-titre">{titreLisible(sc.t)}</b> : null}
      <div className="ligne-h">
        <span>
          Texte {sc.s === "adopté" ? "adopté" : sc.s === "rejeté" ? "rejeté" : sc.s} le {dateFr(sc.d)}
          {proc ? " · " + proc : ""}
        </span>
        <b>{MOTS[position] || "Position non portée"}</b>
      </div>
      <div className="ligne-note">
        {loi ? null : <>{sc.t} </>}
        {decompte(sc.dec)}.{" "}
        <a className="lien-scrutin" href={base + sc.n} target="_blank" rel="noopener noreferrer">
          Scrutin n° {sc.n} sur le site de l'Assemblée
        </a>
      </div>
    </div>
  );
}
