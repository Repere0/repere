import React from "react";
import { dateFr } from "@repere/ui";

/* LA LECTURE D'UN SCRUTIN, ECRITE UNE SEULE FOIS.
 *
 * POURQUOI CE FICHIER EXISTE. Deux ecrans lisent les memes scrutins : « Qui
 * decide » les montre tous, « Ce qui a ete decide » les prend pour son fil
 * date. La recherche de commune avait deja ete derivee deux fois dans ce
 * produit, les deux copies avaient divergé, et « Évry » ne donnait plus aucun
 * resultat pendant des semaines (decision D-15). On ne refait pas cette
 * faute : la regle vit ici, les ecrans l'importent.
 *
 * Le banc echoue si `titreLisible` reapparait ailleurs.
 *
 * LE TRI SOLENNEL/DETAIL NE VIT PLUS ICI. Jusqu'au 17/09/2026, `estSolennel`
 * etait definie dans ce fichier et appelee par les deux ecrans pour ne garder
 * que les votes sur l'ensemble d'un texte (huit sur quatre-vingts). Le
 * BLOCKER M-2 a deplace ce filtre a l'ECRITURE (mono/scripts/extract-html.js) :
 * seuls les scrutins solennels sont desormais publies, donc plus aucun ecran
 * n'a besoin de refaire le tri — `cat.scrutins` est deja le bon sous-ensemble.
 * Le predicat `/solennel/i.test(sc.tv)` existe maintenant a un seul endroit,
 * dans extract-html.js — pas ici, parce que ce fichier de build ne peut pas
 * importer du JSX (React) sans transpilateur. */

export const MOTS = { p: "Pour", c: "Contre", a: "Abstention" };

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
 * Les positions etaient stockees comme une CHAINE de caracteres dont le rang i
 * correspondait au rang i du catalogue. Or la decision D-12 prevoit explicitement
 * qu'un releve absent soit remplace par celui de la veille : « la chaine continue
 * avec le releve de la veille ». Le jour ou le catalogue gagne un scrutin et ou le
 * fichier des positions echoue, les deux fichiers n'auraient plus eu la meme
 * longueur, et TOUTES les positions affichees auraient glisse d'un rang —
 * « Pour » sur un texte rejete, sur un elu nomme, sans aucun signal.
 *
 * LE CORRECTIF DU 17/09/2026 (BLOCKER M-2) ELIMINE CETTE CLASSE DE DEFAUT A LA
 * RACINE : les positions sont desormais indexees par NUMERO DE SCRUTIN, jamais
 * par un rang de tableau — une position s'identifie par le scrutin qu'elle
 * concerne, elle ne peut plus glisser. La garde qui suit verifie qu'aucun
 * fichier de positions ne reference un scrutin absent du catalogue (un
 * decalage de collecte, pas un decalage de rang) et que les deux relevés
 * portent la meme date.
 *
 * Elle vit ici, et pas dans un ecran, parce que DEUX ecrans lisent ces positions.
 * Le banc echoue si une seconde definition apparait. */
export function positionsFiables(cat, pos) {
  if (!cat || !pos || !Array.isArray(cat.scrutins) || !pos.positions) return false;
  const numeros = new Set(cat.scrutins.map(sc => sc.n));
  for (const n of Object.keys(pos.positions)) {
    if (!numeros.has(n)) return false;
  }
  /* Deux dates de relevé differentes veulent dire deux collectes differentes,
     donc un alignement qui n'est plus garanti. */
  const dCat = (cat.source && cat.source.releve_le) || "";
  const dPos = pos.releve_le || "";
  if (dCat && dPos && dCat !== dPos) return false;
  return true;
}

/* La position d'un depute sur un scrutin donne — jamais un rang de tableau.
   `pos.positions` vaut { "8434": { "PA721908": "p" }, ... } : seuls les
   scrutins SOLENNELS y figurent (BLOCKER M-2). Un depute absent de la table
   d'un scrutin n'a simplement pas vote, et ce n'est jamais represente par un
   caractere de remplissage — l'absence de cle EST l'absence de position. */
export function positionSur(pos, acteurRef, scrutinN) {
  const table = pos && pos.positions && pos.positions[scrutinN];
  return table ? table[acteurRef] : undefined;
}

/* La phrase a afficher quand la garde refuse. Elle dit ce qui se passe, elle
   n'invente pas une panne, et elle renvoie a la source officielle. */
export const REFUS_APPARIEMENT = {
  titre: "Les votes ne sont pas affiches : les deux relevés de l'Assemblee ne se correspondent pas.",
  corps: "Le catalogue des scrutins et les positions des deputes ont ete releves a des"
    + " dates differentes. Plutot que d'afficher une position qui pourrait etre celle"
    + " d'un autre scrutin, Repere n'affiche rien. Le reste de l'ecran est complet.",
};
