import React, { useEffect, useState } from "react";
import { Carte, Vide, Source, Chargement, dateFr } from "@repere/ui";
import {
  chargerProjets, chargerDeputes, chargerCatalogueScrutins, chargerVotes, ETATS,
} from "@repere/data-utils";
import { LigneVote, estSolennel } from "../lib/votes.jsx";

const DGCL_URL = "https://www.data.gouv.fr/datasets/projets-finances-par-les-dotations-"
  + "de-soutien-a-linvestissement-des-collectivites-territoriales";
const AN_VOTES_URL = "https://data.assemblee-nationale.fr/travaux-parlementaires/votes";

/* CE QUI A ETE DECIDE — le premier ecran DATE du produit.
 *
 * LE PROBLEME QU'IL RESOUT, ET IL EST LE SEUL. Repere ne montrait que des etats :
 * qui est maire, combien depense la commune, comment se decoupe une
 * circonscription. Tout cela est vrai le lundi et encore vrai le mois suivant.
 * Un produit ou rien ne change entre deux visites ne donne aucune raison d'etre
 * rouvert, et une application civique que l'on n'ouvre qu'une fois n'informe
 * personne. Il fallait un ecran ou des FAITS arrivent.
 *
 * DEUX TYPES DE FAITS, ET PAS UN DE PLUS TANT QU'ILS NE SONT PAS EPROUVES :
 *   - un equipement finance par l'Etat dans la commune (DGCL, licence ouverte) ;
 *   - un vote solennel du depute de la circonscription (Assemblee nationale).
 * Les 72 votes de detail restent derriere le depliant de « Qui decide » : un fil
 * citoyen qui s'ouvre sur un sous-amendement n'est pas un fil citoyen.
 *
 * L'ORDRE EST ECRIT A L'ECRAN, PARCE QU'IL LE FAUT (principe P4). Sans la
 * phrase, le premier de la liste devient le plus important dans la tete du
 * lecteur. Ici l'ordre est celui du temps, et il a une subtilite qu'on ne cache
 * pas : la source des projets ne publie QUE l'annee, pas le jour. Un projet est
 * donc pose a la fin de son annee, apres les votes de cette annee-la, et la
 * phrase le dit. Trier par montant mettrait le plus gros projet en tete ; ce
 * serait un jugement porte par l'ordre, et l'invariant 3 l'interdit.
 * (Ce commentaire evite le mot que l'invariant 3 cherche dans le code ecrit :
 *  la garde ne distingue pas une violation de sa description.)
 *
 * CE QUI N'EST PAS AFFICHE : aucun total par commune, aucun montant par habitant,
 * aucune comparaison avec une autre commune. Un montant par habitant se lit
 * toujours contre celui d'a cote, et l'invariant 3 l'interdit (decision D-13).
 *
 * LES INTITULES SONT RECOPIES MOT POUR MOT, accents manquants compris. La DGCL
 * ecrit « Renovation de la halle du Montfort » : remettre les accents serait
 * reecrire un intitule officiel, et personne ne sait si « Realisation » en
 * portait un ou deux. Le lien donne le texte publie (principe P15). */

const ORDRE = "Du plus récent au plus ancien. Ce n'est pas un ordre d'importance : "
  + "c'est un ordre de date.";

/* L'Etat ne publie pas le jour d'un projet, seulement l'exercice budgetaire. On
   le range donc au 31 decembre de son annee — apres les votes de cette annee —
   et l'ecran ecrit « exercice 2025 », jamais une date inventee. */
const finDAnnee = a => `${a}-12-31`;

function euros(n) {
  return new Intl.NumberFormat("fr-FR").format(n) + " €";
}

/* UN PROJET FINANCE. Le montant de l'Etat d'abord — c'est la decision — puis le
   cout total quand la source le porte. Aucun taux calcule par Repere : la source
   publie le sien, et un ratio de plus n'apprend rien de plus qu'une soustraction
   que le lecteur peut faire. */
function LigneProjet({ p, dispositifs }) {
  const nom = dispositifs[p.dispositif] || p.dispositif;
  return (
    <div className="ligne fait">
      <b className="fait-titre">{p.intitule}</b>
      <div className="ligne-h">
        <span>L'État a engagé {euros(p.subvention)}</span>
        <b>exercice {p.annee}</b>
      </div>
      <div className="ligne-note">
        {nom}{p.dispositif && nom !== p.dispositif ? " (" + p.dispositif + ")" : ""}
        {p.cout ? ` · coût total du projet annoncé : ${euros(p.cout)} hors taxes` : ""}
      </div>
    </div>
  );
}

export default function CeQuiADecide({ paquet, index, commune }) {
  const [etat, setEtat] = useState(ETATS.EN_COURS);
  const [projets, setProjets] = useState(null);
  const [cat, setCat] = useState(null);
  const [pos, setPos] = useState(null);
  const [deputes, setDeputes] = useState(null);

  const dep = paquet && paquet.d;
  const fiche = commune && paquet && paquet.communes ? paquet.communes[commune] : null;

  useEffect(() => {
    if (!dep || !commune) return undefined;
    let vivant = true;
    setEtat(ETATS.EN_COURS);
    /* QUATRE FICHIERS, UNE SEULE ATTENTE. Tous les quatre sont deja en cache des
       la deuxieme visite ; le fil ne repart donc pas au reseau pour se
       rafraichir, et c'est voulu : la fraicheur vient de la collecte, pas d'un
       aller-retour a chaque ouverture. */
    Promise.all([
      chargerProjets(dep), chargerDeputes(),
      chargerCatalogueScrutins(), chargerVotes(dep),
    ]).then(([pr, de, c, v]) => {
      if (!vivant) return;
      setProjets(pr.donnees);
      setDeputes(de.donnees);
      setCat(c.donnees);
      setPos(v.donnees);
      /* Le fil vit avec ce qui arrive : un seul des deux types de faits suffit a
         faire un ecran. Il n'echoue que si les DEUX manquent. */
      const rienDuTout = !pr.donnees && !c.donnees;
      setEtat(rienDuTout ? (pr.etat === ETATS.HORS_LIGNE ? ETATS.HORS_LIGNE : ETATS.ECHEC)
                         : ETATS.SERVI);
    });
    return () => { vivant = false; };
  }, [dep, commune]);

  if (!fiche) return null;

  if (etat === ETATS.EN_COURS) {
    return <Chargement titre="Ouverture de ce qui a été décidé chez vous."
      corps="Les projets financés et les votes, une seule fois, puis ils restent sur cet appareil." />;
  }

  /* DOCTRINE DU VIDE : une phrase et un lien, jamais une forme grise. Et les
     phrases disent des choses DIFFERENTES — « pas encore telecharge » n'est pas
     « la source ne porte rien pour cette commune ». */
  if (etat === ETATS.HORS_LIGNE) {
    return <Vide titre="Ce qui a été décidé n'a pas encore été téléchargé sur cet appareil."
      corps="Le reste de l'application fonctionne hors ligne. Ce fil arrivera à la prochaine connexion."
      lien={{ texte: "Projets financés par l'État — données publiques", url: DGCL_URL }} />;
  }
  if (etat !== ETATS.SERVI) {
    return <Vide titre="Ce qui a été décidé n'est pas arrivé jusqu'à cet appareil."
      corps="Ni les projets financés, ni le relevé des scrutins. Les autres écrans, eux, sont complets."
      lien={{ texte: "Projets financés par l'État — données publiques", url: DGCL_URL }} />;
  }

  /* ---- les faits, chacun ramene a une date ---------------------------------- */
  const faits = [];

  const sourceProjets = (index && index.sources && index.sources.projets) || null;
  const listeProjets = (projets && projets.communes && projets.communes[commune]) || [];
  for (const p of listeProjets) {
    faits.push({ cle: "p" + p.annee + p.intitule, quand: finDAnnee(p.annee), rang: 0,
                 echelon: "ville", type: "projet", p });
  }

  /* Le vote du depute de CETTE commune, et d'aucun autre. Une commune a cheval
     sur deux circonscriptions porte une liste : on prend les deux, chaque vote
     etant nomme par son depute. */
  const circos = Array.isArray(fiche.circo) ? fiche.circo
                 : (fiche.circo === null || fiche.circo === undefined ? [] : [fiche.circo]);
  const base = (cat && cat.url_scrutin) || "";
  if (cat && cat.scrutins && pos && pos.positions && deputes && deputes.deputes) {
    for (const circo of circos) {
      const d = deputes.deputes[dep + "-" + circo];
      const suite = d && d.acteurRef ? pos.positions[d.acteurRef] : null;
      if (!suite) continue;
      cat.scrutins.forEach((sc, i) => {
        if (!estSolennel(sc)) return;          // les lois seulement : decision D-08
        faits.push({ cle: "v" + circo + sc.u, quand: sc.d, rang: 1, echelon: "france",
                     type: "vote", sc, position: suite[i], qui: d.nom });
      });
    }
  }

  /* L'ORDRE, ET RIEN QUE LUI. `rang` departage un projet (date a l'annee) d'un
     vote du meme jour : le vote, qui porte un vrai jour, passe avant. Aucune
     propriete du fait — ni montant, ni echelon — n'entre dans le tri. */
  faits.sort((a, b) => (a.quand < b.quand ? 1 : a.quand > b.quand ? -1 : a.rang - b.rang));

  const sourceScrutins = (cat && cat.source) || {};
  const nomCommune = fiche.nom || "";

  if (!faits.length) {
    return (
      <div className="pile">
        <Vide titre={`Aucune décision datée n'est publiée pour ${nomCommune}.`}
          corps="Ce n'est pas un retard de Repère : sur la période relevée, l'État ne publie aucun projet financé dans cette commune, et la source des scrutins ne porte aucune position pour son député. Les autres écrans restent complets."
          lien={{ texte: "Projets financés par l'État — données publiques", url: DGCL_URL }} />
      </div>
    );
  }

  const nbProjets = faits.filter(f => f.type === "projet").length;
  const nbVotes = faits.filter(f => f.type === "vote").length;

  return (
    <div className="pile">
      <Carte echelon="ville" titre={`Ce qui a été décidé pour ${nomCommune}`}
        sousTitre={ORDRE}
        tag={faits.length + " fait" + (faits.length > 1 ? "s" : "")}>
        <p className="tx-note">
          {nbProjets ? `${nbProjets} projet${nbProjets > 1 ? "s" : ""} financé${nbProjets > 1 ? "s" : ""} par l'État` : ""}
          {nbProjets && nbVotes ? " et " : ""}
          {nbVotes ? `${nbVotes} loi${nbVotes > 1 ? "s" : ""} votée${nbVotes > 1 ? "s" : ""} par votre député` : ""}
          {". "}
          {nbProjets ? "L'État ne publie que l'année d'un projet, pas le jour : un projet est donc placé à la fin de son année. " : ""}
          Ce fil ne prétend pas dire tout ce qui a été décidé chez vous — il dit ce
          qui est publié en donnée ouverte, et d'où ça vient.
        </p>

        {faits.map((f, i) => {
          /* L'EN-TETE NE SE REPETE PAS, ET C'EST UNE CORRECTION SUR CAPTURE.
             Chaque vote portait sa propre ligne « A l'Assemblee nationale, X a
             vote » : huit fois de suite sur l'ecran d'Aubervilliers, avant huit
             titres de loi. La repetition n'apprenait rien et repoussait les
             titres — ce qu'on vient lire — de plusieurs hauteurs d'ecran. Elle
             n'apparait donc qu'en TETE d'une suite, quand le fait precedent n'est
             pas du meme type et du meme auteur. Les projets recoivent la meme
             ligne, pour la meme raison : sans elle, les deux familles se
             confondraient, et « a engage » ne dirait pas qui. */
          const prec = faits[i - 1];
          const nouvelle = !prec || prec.type !== f.type
            || (f.type === "vote" && prec.qui !== f.qui);
          return (
            <div className="ligne fait" key={f.cle}>
              {nouvelle ? (
                <p className="groupe">
                  {f.type === "vote"
                    ? `À l'Assemblée nationale, ${f.qui} a voté`
                    : `Dans votre commune, l'État a financé`}
                </p>
              ) : null}
              {nouvelle && f.type === "projet" ? (
                /* PRINCIPE P15, DIT AU LECTEUR PLUTOT QUE CORRIGE EN SILENCE. La
                   DGCL publie « Renovation » sans accent. Remettre les accents
                   serait reecrire un intitule officiel ; ne rien dire laisserait
                   croire a une faute de Repere. On le dit une fois. */
                <p className="tx-note projets-note">
                  Les intitulés sont recopiés tels que l'État les publie, sans correction.
                </p>
              ) : null}
              {f.type === "projet"
                ? <LigneProjet p={f.p} dispositifs={(projets && projets.dispositifs) || {}} />
                : <LigneVote sc={f.sc} position={f.position} base={base} loi />}
            </div>
          );
        })}

        {/* DEUX FAMILLES DE FAITS, DEUX PROVENANCES. Les melanger sous une seule
            ligne de source dirait que l'Etat publie les votes de l'Assemblee. */}
        {nbProjets && sourceProjets ? (
          <Source producteur={sourceProjets.producteur} licence={sourceProjets.licence}
            maj={sourceProjets.mis_a_jour_le}
            mention={sourceProjets.exercices ? "exercices " + sourceProjets.exercices.join(" et ") : undefined}
            url={sourceProjets.url || DGCL_URL} />
        ) : null}
        {nbVotes ? (
          <Source producteur={sourceScrutins.producteur} licence={sourceScrutins.licence}
            mention={sourceScrutins.releve_le ? "relevé le " + dateFr(sourceScrutins.releve_le) : undefined}
            url={sourceScrutins.url || AN_VOTES_URL} />
        ) : null}
      </Carte>
    </div>
  );
}
