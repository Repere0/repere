/* LE BOUTON RETOUR DU TELEPHONE NE DOIT PAS FERMER REPERE.
 *
 * CE QUI N'ALLAIT PAS. L'application n'a pas de routeur : tout l'etat vit en
 * memoire. Sur Android, en application installee, le geste le plus courant du
 * systeme — le retour — quittait donc Repere, quel que soit l'endroit ou l'on
 * etait : votes deplies, commune ouverte, peu importe. Dix testeurs sur dix le
 * feraient par reflexe, et sortiraient de l'application en croyant reculer d'un
 * ecran.
 *
 * CE QU'ON NE FAIT PAS, ET C'EST LA RAISON DE CE FICHIER PLUTOT QUE D'UN ROUTEUR :
 * on n'ecrit RIEN dans l'adresse. Une URL par commune mettrait le nom de la
 * commune consultee dans l'historique du navigateur — donc, sur un navigateur
 * qui synchronise l'historique, chez un tiers. C'est exactement ce que le produit
 * refuse. `pushState` est appele SANS url : l'adresse ne bouge pas, et l'etat
 * pousse ne contient qu'un compteur.
 *
 * COMMENT CA MARCHE. Chaque etape qui « entre » quelque part empile la fonction
 * qui en sort. Le retour du systeme depile et l'appelle. Un bouton « Replier »
 * dans l'interface n'appelle donc PAS cette fonction lui-meme : il appelle
 * history.back(), et laisse le meme chemin s'executer. Sans cela, replier a la
 * main laisserait une entree d'historique morte, et le retour suivant ne ferait
 * rien de visible : le lecteur appuierait deux fois pour un seul effet.
 */
const pile = [];
let branche = false;

function brancher() {
  if (branche || typeof window === "undefined") return;
  branche = true;
  window.addEventListener("popstate", () => {
    const sortir = pile.pop();
    if (sortir) sortir();
  });
}

/* `sortir` est appelee quand le lecteur revient en arriere. Elle doit etre sans
   effet si l'etat a deja change autrement : on la garde idempotente cote appelant. */
export function entrer(sortir) {
  if (typeof window === "undefined" || typeof window.history === "undefined") return;
  brancher();
  pile.push(sortir);
  window.history.pushState({ repere: pile.length }, "");
}

/* A appeler depuis un bouton de l'interface qui fait la meme chose que le retour
   du systeme. Il ne depile pas lui-meme : il declenche le retour, qui depile. */
export function revenir() {
  if (typeof window === "undefined") return;
  if (pile.length) window.history.back();
}

/* Le nombre d'etapes empilees — utile au banc, qui doit pouvoir verifier qu'une
   etape a bien ete posee sans dependre de l'apparence de l'ecran. */
export function profondeur() { return pile.length; }
