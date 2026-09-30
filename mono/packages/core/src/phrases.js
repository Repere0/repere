/* @repere/core — LES PHRASES QUE LE SITE ET L'APPLICATION ECRIVENT A L'IDENTIQUE
 * (29/09/2026).
 *
 * POURQUOI. Le web et le mobile lisaient deja les memes fichiers et le meme
 * calcul (deriverAujourdhui) ; mais chacun ECRIVAIT ses phrases. Mesure le jour
 * meme, en relisant #45 : les deux ecrans disaient deja deux choses differentes
 * sur le nombre d'adjoints (le site distingue « inconnu » de « zero », le mobile
 * n'affichait rien quand le compte est inconnu) et sur l'absence de maire. Une
 * phrase ecrite deux fois finit par diverger ; celle-ci est ecrite une fois.
 *
 * FORME. Une phrase qui porte une emphase ou un mot du dictionnaire est rendue
 * comme une suite de segments : { t } texte simple, { t, fort: true } a mettre
 * en gras, { t, mot } un mot du dictionnaire (le site en fait un bouton).
 * `texteDe` rend la phrase nue, telle que le lecteur la lit : c'est elle que
 * le controle « meme verite » cherche dans les deux rendus.
 *
 * Aucun import d'interface : ce fichier ne rend rien. */
import { dateFr, euros } from "./format.js";
import { MOTS, ordinal, procedure, decompte } from "./votes.js";
import { ancienneCommune } from "./faits.js";

export const texteDe = segments => segments.map(s => s.t).join("");

/* --- le maire et ses adjoints ------------------------------------------ */

export const RNE_URL = "https://www.data.gouv.fr/fr/datasets/repertoire-national-des-elus-1/";
export const MAIRE_ABSENT = Object.freeze({
  titre: "Le Répertoire national des élus ne porte pas de maire pour cette commune.",
  corps: "C'est la source qui est incomplète, pas la commune qui n'en a pas.",
});

/* Trois cas, trois phrases (invariant 5) : des adjoints ; un compte INCONNU
   (null : la table n'a pas pu etre relue depuis l'election du maire) ; aucun. */
export function phraseAdjoints(adjoints, nomMaire) {
  if (adjoints > 0) {
    return [
      { t: `${adjoints} ` },
      { t: `adjoint${adjoints > 1 ? "s" : ""}`, mot: "adjoint au maire" },
      /* CORRIGE LE 29/09/2026 : la phrase du site disait « Ce sont eux qui votent
         le budget de la commune ». C'est faux : le budget est propose par le
         maire et vote par le conseil municipal tout entier (code general des
         collectivites territoriales, art. L2312-1), adjoints compris. */
      { t: ` siègent avec ${nomMaire} au conseil municipal, qui vote le budget de la commune.` },
    ];
  }
  if (adjoints === null) {
    return [{ t: "Le nombre d'adjoints n'a pas pu être relu dans le Répertoire national des élus depuis l'élection de ce maire." }];
  }
  return [{ t: "Aucun adjoint n'est enregistré pour cette commune dans le Répertoire national des élus." }];
}

/* --- le depute et son vote --------------------------------------------- */

const RESULTAT = s => (s === "adopté" ? "adopté" : s === "rejeté" ? "rejeté" : s);

/* Pourquoi CE vote concerne le lecteur : c'est le depute de SA circonscription.
   Une commune partagee ne permet pas de dire laquelle est la sienne : on le dit. */
export function phraseCirconscription({ nbCircos, nomCommune, nomDep }, circo) {
  return nbCircos > 1
    ? `${nomCommune} est partagée entre ${nbCircos} circonscriptions. Vote du député élu dans la ${ordinal(circo)} :`
    : `Vote du député élu dans votre circonscription (${ordinal(circo)} circonscription${nomDep ? " — " + nomDep : ""}), à l'Assemblée nationale :`;
}

export function phrasePosition(position, qui) {
  const mot = MOTS[position];
  const sujet = qui || "Votre député";
  if (!mot) return [{ t: `${sujet} : le relevé de l'Assemblée ne porte pas de position sur ce scrutin.` }];
  return [{ t: `${sujet} a voté ` }, { t: mot === "Abstention" ? "l'abstention" : mot.toLowerCase(), fort: true }, { t: "." }];
}

export function ligneScrutin(sc) {
  const proc = procedure(sc.t);
  return `Texte ${RESULTAT(sc.s)} le ${dateFr(sc.d)}${proc ? " · " + proc : ""}${sc.dec ? " · " + decompte(sc.dec) : ""}.`;
}

export const POSITION_NON_PORTEE = "Une position non portée n'est pas une absence : elle peut couvrir une"
  + " délégation de vote, une présidence de séance, ou un scrutin auquel le député n'a pas été appelé."
  + " Repère n'en déduit rien.";

export const lienScrutin = (base, sc) => ({ url: base + sc.n, texte: `Scrutin n° ${sc.n} sur le site de l'Assemblée` });

/* --- le projet finance par l'Etat -------------------------------------- */

export const DGCL_URL = "https://www.data.gouv.fr/datasets/projets-finances-par-les-dotations-"
  + "de-soutien-a-linvestissement-des-collectivites-territoriales";

/* Deux formes, toutes deux sur le site : sans le lieu quand le projet EST la
   reponse principale, avec le lieu (et l'ancienne commune rattachee) sinon. */
export const montantEngage = p => `L'État a engagé ${euros(p.subvention)}`;
export const phraseProjet = p => `${montantEngage(p)}, exercice ${p.annee}.`;
export function phraseProjetLocal(p, nomCommune) {
  const ancienne = ancienneCommune(p);
  return `${montantEngage(p)} à ${ancienne ? `${ancienne} (aujourd'hui rattachée à ${nomCommune})` : nomCommune}, exercice ${p.annee}.`;
}
