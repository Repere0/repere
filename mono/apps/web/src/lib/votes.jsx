import React from "react";
import { MOTS, titreLisible, phrasePosition, ligneScrutin, POSITION_NON_PORTEE, lienScrutin } from "@repere/core";
import { Segments } from "./segments.jsx";

/* LA LECTURE D'UN SCRUTIN VIT DANS @repere/core DEPUIS LE 29/09/2026 (voir
 * packages/core/src/votes.js), pour que l'application mobile lise exactement
 * les memes regles. Ce fichier ne garde que ce qui REND : LigneVote. Les noms
 * deplaces sont re-exportes ici pour que les ecrans web n'aient pas a changer
 * leurs imports. */
export {
  MOTS, ordinal, titreLisible, procedure, decompte, positionsFiables, positionSur, REFUS_APPARIEMENT,
} from "@repere/core";

/* UNE LIGNE DE VOTE. `loi` change la mise en forme, jamais le fond : pour un
 * texte, le titre allege passe en tete et l'intitule officiel n'est plus repete ;
 * pour un vote de detail, l'intitule officiel EST la ligne. Dans les deux cas :
 * le resultat du scrutin AVANT la position du depute — on lisait « Contre » puis,
 * huit lignes plus bas, que le texte avait ete adopte. */
/* LA POSITION SORT DE LA COLONNE DE DROITE, ET C'EST UNE CORRECTION DE FOND.
 *
 * CE QUI ETAIT MESURE. La position etait poussee a droite, en gras,
 * `white-space: nowrap`, ce qui cassait la phrase de gauche en deux. On lisait
 * « Texte adopte le 21 juillet 2026 · » puis, isole, « Abstention », puis
 * « 378 pour, 7 contre, 173 abstentions » juste en dessous. Un lecteur qui ne suit
 * pas la politique lit « Abstention » comme LE RESULTAT DU SCRUTIN, et repart avec
 * une idee fausse de ce que son depute a fait. C'etait le seul chiffre qui compte
 * de l'ecran, et le plus mal place.
 *
 * ET HUIT VERDICTS ALIGNES DANS UNE COLONNE SCANNABLE forment une capture d'ecran
 * prete a l'emploi : un militant recadre la colonne, et Repere a compose l'affiche.
 * Le produit s'interdit tout jugement ; une colonne de verdicts en produit un par
 * sa seule forme.
 *
 * LA POSITION EST DONC UNE PHRASE PLEINE, sur sa propre ligne, avec le sujet
 * nomme. Une phrase se lit, elle ne se scanne pas.
 *
 * « POSITION NON PORTEE » N'EST PLUS UN VERDICT. Mesure : 17,0 % des positions
 * solennelles (781 sur 4 592) et 68,3 % des deputes sont concernes — c'est la
 * ligne la plus frequente du produit apres les titres de loi. Dans une case de
 * verdict, elle se lit « absent ». Elle devient une note qui dit ce qu'elle ne
 * dit pas. */

export function LigneVote({ sc, position, base, loi, qui }) {
  /* Les phrases viennent de @repere/core (phrases.js) : l'application mobile
     ecrit les memes, mot pour mot. Seul l'habillage est ici. */
  const mot = MOTS[position];
  const lien = lienScrutin(base, sc);
  return (
    <div className="ligne vote">
      {loi ? <b className="vote-titre">{titreLisible(sc.t)}</b> : null}
      <p className="vote-position"><Segments s={phrasePosition(position, qui)} /></p>
      <div className="ligne-note">{ligneScrutin(sc)}</div>
      <div className="ligne-note">
        {loi ? null : <>{sc.t} </>}
        {!mot ? <>{POSITION_NON_PORTEE}{" "}</> : null}
        <a className="lien-scrutin" href={lien.url} target="_blank" rel="noopener noreferrer">{lien.texte}</a>
      </div>
    </div>
  );
}

