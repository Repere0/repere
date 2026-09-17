import React, { useEffect, useState } from "react";
import { Carte, Vide, Source, Chargement, dateFr } from "@repere/ui";
import {
  chargerProjets, chargerDeputes, chargerCatalogueScrutins, chargerVotes, ETATS,
} from "@repere/data-utils";
import { LigneVote, positionSur, positionsFiables, REFUS_APPARIEMENT } from "../lib/votes.jsx";

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
  /* DOCTRINE DU 16/09/2026, TROUVEE PAR LA RED TEAM. `!pr.donnees` ne distingue
   * pas « le fichier a echoue a charger » de « le fichier a charge et ne porte
   * rien pour cette commune » — INTROUVABLE (404, le pipeline n'a jamais
   * produit ce fichier pour ce departement) et ECHEC/HORS_LIGNE rendent tous
   * `donnees: null`, EXACTEMENT comme un fichier SERVI qui ne porte rien.
   * Consequence mesuree : la collecte des projets n'a jamais tourne pour de
   * vrai (voir plus bas) ; sans cette distinction, l'ecran affirmait quand
   * meme « Ce n'est pas un manque de Repere : l'Etat ne publie aucun projet »
   * — la MEME faute que Ville-d'Avray, une absence chez nous devenue une
   * affirmation sur l'Etat. On garde donc l'etat de CHAQUE chargement, pas
   * seulement son contenu. */
  const [etatProjets, setEtatProjets] = useState(ETATS.EN_COURS);
  const [etatScrutins, setEtatScrutins] = useState(ETATS.EN_COURS);

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
      /* Le volet scrutins demande TROIS fichiers a la fois (catalogue, votes du
         departement, deputes) : il n'est SERVI que si les trois le sont. */
      const okProjets = pr.etat === ETATS.SERVI;
      const okScrutins = c.etat === ETATS.SERVI && v.etat === ETATS.SERVI && de.etat === ETATS.SERVI;
      setEtatProjets(pr.etat);
      setEtatScrutins(okScrutins ? ETATS.SERVI : (c.etat !== ETATS.SERVI ? c.etat : (v.etat !== ETATS.SERVI ? v.etat : de.etat)));
      /* Le fil vit avec ce qui arrive : un seul des deux types de faits suffit a
         faire un ecran. Il n'echoue que si les DEUX manquent. */
      const rienDuTout = !okProjets && !okScrutins;
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
  const apparie = positionsFiables(cat, pos);
  /* BLOCKER M-2 (17/09/2026) : `cat.scrutins` ne contient plus que des scrutins
     solennels (filtre applique a l'ecriture, extract-html.js) — plus besoin de
     `estSolennel` ici, et `pos.positions` s'indexe par numero de scrutin, pas
     par depute : `positionSur()` fait la lecture. */
  if (cat && cat.scrutins && pos && pos.positions && deputes && deputes.deputes && apparie) {
    for (const circo of circos) {
      const d = deputes.deputes[dep + "-" + circo];
      if (!d || !d.acteurRef) continue;
      /* LE NOM COMPLET, ET JAMAIS LE PATRONYME SEUL.
         Trouve par la red team le 14/09/2026, et c'etait une faute grave. Le
         maire de Paris dans nos donnees est Emmanuel GREGOIRE ; la deputee de la
         12e de Paris est Olivia Gregoire. L'ecran affichait « Gregoire a vote
         Contre » : un lecteur parisien attribuait au MAIRE une position qu'il n'a
         jamais emise. Deux personnes, deux familles politiques. Et 15 patronymes
         sont partages par plusieurs deputes au national (Rousseau -> Sandrine
         75-9 et Aurelien 78-7 ; Cazeneuve -> Jean-Rene 32-1 et Pierre 92-7).
         Imputer publiquement a une personne identifiee une position qu'elle n'a
         pas prise, c'est le terrain de la diffamation — et le prenom etait dans
         le fichier, a cote, non utilise. */
      const nomComplet = [d.prenom, d.nom].filter(Boolean).join(" ") || d.nom || "";
      for (const sc of cat.scrutins) {
        const position = positionSur(pos, d.acteurRef, sc.n);
        faits.push({ cle: "v" + circo + sc.u, quand: sc.d, rang: 1, echelon: "france",
                     /* `ref` et non le nom : deux deputes homonymes d'une commune a
                        deux circonscriptions verraient sinon leurs votes fusionnes
                        sous un seul en-tete. */
                     type: "vote", sc, position, qui: nomComplet, ref: d.acteurRef });
      }
    }
  }

  /* L'ORDRE, ET RIEN QUE LUI. `rang` departage un projet (date a l'annee) d'un
     vote du meme jour : le vote, qui porte un vrai jour, passe avant. Aucune
     propriete du fait — ni montant, ni echelon — n'entre dans le tri. */
  faits.sort((a, b) => (a.quand < b.quand ? 1 : a.quand > b.quand ? -1 : a.rang - b.rang));

  const sourceScrutins = (cat && cat.source) || {};
  const nomCommune = fiche.nom || "";

  if (!faits.length) {
    /* DEUX CAUSES POSSIBLES, DEUX PHRASES — jamais l'inverse. `etatProjets`/
     * `etatScrutins` disent lequel des deux volets a vraiment ete SERVI ; seul
     * un volet SERVI et vide autorise a dire que la source ne publie rien. */
    const projetsServi = etatProjets === ETATS.SERVI;
    const scrutinsServi = etatScrutins === ETATS.SERVI;
    const corps = projetsServi && scrutinsServi
      ? "Ce n'est pas un retard de Repère : sur la période relevée, l'État ne publie aucun projet financé dans cette commune, et la source des scrutins ne porte aucune position pour son député."
      : !projetsServi && scrutinsServi
      ? "La source des scrutins ne porte aucune position pour son député sur la période relevée. Pour les projets financés par l'État, en revanche, Repère n'a pas réussi à obtenir le fichier de ce département — ce n'est ni un « aucun projet », ni une preuve que l'État n'a rien financé ici."
      : projetsServi && !scrutinsServi
      ? "L'État ne publie aucun projet financé dans cette commune sur la période relevée. Pour les votes, en revanche, Repère n'a pas réussi à obtenir le relevé des scrutins de ce département — ce silence-là est de notre côté, pas de celui de l'Assemblée."
      : "Repère n'a pas réussi à obtenir ni le fichier des projets financés, ni le relevé des scrutins pour ce département. Ce n'est pas une information sur ce que l'État ou l'Assemblée ont ou n'ont pas fait — c'est un manque de notre côté.";
    return (
      <div className="pile">
        <Vide titre={`Aucune décision datée n'est publiée pour ${nomCommune}.`}
          corps={corps + " Les autres écrans restent complets."}
          lien={{ texte: "Projets financés par l'État — données publiques", url: DGCL_URL }} />
      </div>
    );
  }

  const nbProjets = faits.filter(f => f.type === "projet").length;
  /* ON COMPTE DES TEXTES, PAS DES LIGNES. Paris a 18 circonscriptions : le fil
     portait 18 x 8 = 144 « faits » de vote pour 8 textes, et l'annoncait. 118
     communes en France elisent plusieurs deputes, et ce sont les plus peuplees.
     `sc.u` est l'identifiant du scrutin : deux deputes qui votent le meme texte
     produisent deux lignes et UN texte. */
  const nbVotes = new Set(faits.filter(f => f.type === "vote").map(f => f.sc.u)).size;
  const nbDeputes = new Set(faits.filter(f => f.type === "vote").map(f => f.ref)).size;

  return (
    <div className="pile">
      {/* PLUS DE PASTILLE DE COMPTAGE. Elle affichait « 12 FAITS » a Aubervilliers
          et « 8 FAITS » a Bagnolet : comme le nombre de votes est une constante
          nationale, le total etait une fonction directe du nombre de projets. Un
          chiffre unique, mis en exergue, qui classe les communes — exactement ce
          que la decision D-13 interdit. La garde de l'invariant 3 cherche des mots
          dans le code ; elle ne pouvait pas voir un nombre. */}
      <Carte echelon="ville" titre={`Ce qui a été décidé pour ${nomCommune}`}
        sousTitre={ORDRE}>
        <p className="tx-note">
          {nbProjets ? `${nbProjets} projet${nbProjets > 1 ? "s" : ""} financé${nbProjets > 1 ? "s" : ""} par l'État` : ""}
          {nbProjets && nbVotes ? " et " : ""}
          {nbVotes ? `${nbVotes} texte${nbVotes > 1 ? "s" : ""} voté${nbVotes > 1 ? "s" : ""} à l'Assemblée`
            + (nbDeputes > 1 ? ` par vos ${nbDeputes} députés` : " par votre député") : ""}
          {". "}
          {nbProjets ? "L'État ne publie que l'année d'un projet, pas le jour : un projet est donc placé à la fin de son année. " : ""}
          Ce fil ne prétend pas dire tout ce qui a été décidé chez vous — il dit ce
          qui est publié en donnée ouverte, et d'où ça vient.
        </p>

        {/* L'ABSENCE PARTIELLE PRODUIT UNE PHRASE, ELLE AUSSI.
            La doctrine du vide n'etait honoree que pour l'absence TOTALE : si les
            projets manquaient et que les votes arrivaient, aucune phrase ne le
            disait. Un habitant de Bagnolet lisait un ecran de huit votes nationaux
            sous un titre communal, et ne pouvait pas savoir si l'Etat n'avait rien
            finance ou si Repere ne savait pas. C'est le contraire exact de ce que
            l'invariant 5 demande, et c'est la faute la plus grave de cet ecran
            apres l'imputation. */}
        {/* MEME DOCTRINE QU'AU-DESSUS : le titre et la phrase ne peuvent affirmer
            « l'Etat n'a rien finance » QUE si le fichier des projets a ete
            reellement SERVI. Sinon, l'absence est chez nous, et le titre le dit. */}
        {!nbProjets ? (
          etatProjets === ETATS.SERVI ? (
            <Vide titre={`Sur les exercices publiés, l'État n'a financé aucun projet à ${nomCommune}.`}
              corps="Ce n'est pas un manque de Repère : le fichier de la Direction générale des collectivités locales ne porte aucune ligne pour cette commune sur ces exercices. Il en portera peut-être pour le suivant."
              lien={{ texte: "Projets financés par l'État — données publiques", url: DGCL_URL }} />
          ) : (
            <Vide titre="Repère n'a pas réussi à obtenir les projets financés par l'État pour ce département."
              corps="Ce n'est pas une information sur ce que l'État a ou n'a pas financé à cet endroit : c'est notre chaîne de collecte qui n'a pas le fichier pour ce département. Les votes affichés ci-dessous ne dépendent pas de ce fichier."
              lien={{ texte: "Projets financés par l'État — données publiques", url: DGCL_URL }} />
          )
        ) : null}

        {/* LE TROU SYMETRIQUE, SIGNALE PAR LA RED TEAM DU 16/09/2026 : si les
            projets arrivent et que les votes echouent, rien ne le disait —
            silence plutot qu'affirmation fausse, mais la doctrine du vide
            demande une phrase pour CHAQUE absence, pas seulement celles qui
            auraient pu devenir une fausse affirmation. */}
        {!nbVotes ? (
          etatScrutins === ETATS.SERVI ? (
            <Vide titre={`Le relevé des scrutins ne porte aucune position pour le député de ${nomCommune}.`}
              corps="Les projets financés affichés ci-dessus ne dépendent pas de ce fichier."
              lien={{ texte: "Votes de l'Assemblée nationale — données publiques", url: AN_VOTES_URL }} />
          ) : (
            <Vide titre="Repère n'a pas réussi à obtenir le relevé des scrutins pour ce département."
              corps="Ce n'est pas une information sur ce que votre député a ou n'a pas voté : c'est notre chaîne de collecte qui n'a pas ce fichier pour ce département. Les projets affichés ci-dessus ne dépendent pas de ce fichier."
              lien={{ texte: "Votes de l'Assemblée nationale — données publiques", url: AN_VOTES_URL }} />
          )
        ) : null}

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
            || (f.type === "vote" && prec.ref !== f.ref);
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
                : <LigneVote sc={f.sc} position={f.position} base={base} loi qui={f.qui} />}
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
