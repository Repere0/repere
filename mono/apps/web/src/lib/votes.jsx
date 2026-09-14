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
const RESULTAT = s => (s === "adopté" ? "adopté" : s === "rejeté" ? "rejeté" : s);

export function LigneVote({ sc, position, base, loi, qui }) {
  const proc = procedure(sc.t);
  const mot = MOTS[position];
  const sujet = qui || "Votre député";
  return (
    <div className="ligne vote">
      {loi ? <b className="vote-titre">{titreLisible(sc.t)}</b> : null}
      <p className="vote-position">
        {mot
          ? <>{sujet} a voté <b>{mot === "Abstention" ? "l'abstention" : mot.toLowerCase()}</b>.</>
          : <>{sujet} : le relevé de l'Assemblée ne porte pas de position sur ce scrutin.</>}
      </p>
      <div className="ligne-note">
        Texte {RESULTAT(sc.s)} le {dateFr(sc.d)}{proc ? " · " + proc : ""}
        {sc.dec ? <> · {decompte(sc.dec)}</> : null}.
      </div>
      <div className="ligne-note">
        {loi ? null : <>{sc.t} </>}
        {!mot ? (
          <>Une position non portée n'est pas une absence : elle peut couvrir une
          délégation de vote, une présidence de séance, ou un scrutin auquel le
          député n'a pas été appelé. Repère n'en déduit rien.{" "}</>
        ) : null}
        <a className="lien-scrutin" href={base + sc.n} target="_blank" rel="noopener noreferrer">
          Scrutin n° {sc.n} sur le site de l'Assemblée
        </a>
      </div>
    </div>
  );
}

/* LES POSITIONS SONT APPARIEES, ET L'APPARIEMENT EST VERIFIE.
 *
 * LE DEFAUT, TROUVE PAR LA RED TEAM LE 14/09/2026, ETAIT ARME ET NON DECLENCHE.
 * Les positions sont stockees comme une CHAINE de caracteres dont le rang i
 * correspond au rang i du catalogue. Or la decision D-12 prevoit explicitement
 * qu'un releve absent soit remplace par celui de la veille : « la chaine continue
 * avec le releve de la veille ». Le jour ou le catalogue gagne un scrutin et ou le
 * fichier des positions echoue, les deux fichiers n'ont plus la meme longueur, et
 * TOUTES les positions affichees glissent d'un rang — « Pour » sur un texte
 * rejete, sur un elu nomme, sans aucun signal. Le defaut ne se declenchait pas
 * parce que les deux relevés portaient la meme date ; il se declencherait le jour
 * meme ou D-12 s'appliquerait comme prevu.
 *
 * LA GARDE : on refuse d'afficher une position des que les deux fichiers ne se
 * correspondent plus. Refuser est sans danger — la doctrine du vide a une phrase
 * pour ca ; afficher une position fausse ne l'est pas.
 *
 * Elle vit ici, et pas dans un ecran, parce que DEUX ecrans lisent ces positions.
 * Le banc echoue si une seconde definition apparait. */
export function positionsFiables(cat, pos) {
  if (!cat || !pos || !Array.isArray(cat.scrutins) || !pos.positions) return false;
  const largeur = cat.scrutins.length;
  /* Une seule longueur fausse suffit a invalider le fichier : c'est le meme
     relevé pour tous ses deputes. */
  for (const suite of Object.values(pos.positions)) {
    if (typeof suite !== "string" || suite.length !== largeur) return false;
  }
  /* Deux dates de relevé differentes veulent dire deux collectes differentes,
     donc un alignement qui n'est plus garanti — meme si les longueurs coincident
     par hasard. */
  const dCat = (cat.source && cat.source.releve_le) || "";
  const dPos = pos.releve_le || "";
  if (dCat && dPos && dCat !== dPos) return false;
  return true;
}

/* La phrase a afficher quand la garde refuse. Elle dit ce qui se passe, elle
   n'invente pas une panne, et elle renvoie a la source officielle. */
export const REFUS_APPARIEMENT = {
  titre: "Les votes ne sont pas affiches : les deux relevés de l'Assemblee ne se correspondent pas.",
  corps: "Le catalogue des scrutins et les positions des deputes ont ete releves a des"
    + " dates differentes. Plutot que d'afficher une position qui pourrait etre celle"
    + " d'un autre scrutin, Repere n'affiche rien. Le reste de l'ecran est complet.",
};
