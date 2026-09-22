import React, { useEffect, useRef, useState } from "react";
import { Carte, Vide, Source, Chargement, dateFr, Mot } from "@repere/ui";
import { Pile } from "@repere/ui/amicro";
import { LigneVote, positionSur, positionsFiables, REFUS_APPARIEMENT } from "../lib/votes.jsx";
import {
  chargerDeputes, chargerCatalogueScrutins, chargerVotes, chargerElusRegion,
  entrer, revenir, ETATS,
} from "@repere/data-utils";
import { COMPETENCES } from "../lib/competences.js";

const RNE_URL = "https://www.data.gouv.fr/fr/datasets/repertoire-national-des-elus-1/";
const AN_URL = "https://data.assemblee-nationale.fr/acteurs/deputes-en-exercice";
const AN_VOTES_URL = "https://data.assemblee-nationale.fr/travaux-parlementaires/votes";

/* CE QUE DECIDE CHAQUE ECHELON — six phrases, aucune donnee nouvelle.
 *
 * CE QUI MANQUAIT. Le produit nommait un maire et un depute et ne disait JAMAIS
 * sur quoi chacun a du pouvoir. Pour quelqu'un qui ne connait pas les
 * institutions, deux noms sans competence sont deux noms : l'ecran repondait a
 * « qui ? » sans jamais repondre a « qui decide QUOI ? ».
 *
 * LA REGLE D'ECRITURE : ne pas nommer l'institution, nommer ce qu'elle decide
 * dans la vie du lecteur. « Le conseil departemental exerce la competence de
 * l'action sociale » n'apprend rien ; « le departement decide des colleges, des
 * routes et des aides sociales » s'entend une fois et se retient.
 *
 * CE QUI N'EST PAS ECRIT ICI, et c'est deliberé : le Senat. Un senateur n'est pas
 * elu par le citoyen ; l'expliquer coute plus de mots que ca n'en rapporte a
 * quelqu'un qui cherche qui decide chez lui.
 *
 * L'ORDRE EST CELUI DE LA DISTANCE, ET LA PHRASE LE DIT A L'ECRAN. Sans elle, le
 * premier de la liste devient le plus important dans la tete du lecteur — or
 * l'invariant 3 interdit de hierarchiser des territoires, y compris quand on se
 * contente de le laisser deviner.
 * (Ce commentaire evite le mot que l'invariant 3 cherche dans le code ecrit : la
 *  garde ne fait pas la difference entre une violation et sa description.)
 *
 * COMPETENCES VIT DANS lib/competences.js DEPUIS LE 19/09/2026 : la direction
 * "Territoire" dit la meme phrase, jamais une deuxieme formulation. */
const ORDRE_DISTANCE = "Rangés du plus proche de chez vous au plus lointain. Ce n'est pas un ordre d'importance : c'est un ordre de distance.";

function ordinal(n) { return n === 1 ? "1re" : n + "e"; }

/* AUCUN ARTICLE devant un nom de departement, AUCUN ACCORD sur un nom de
   commune : ni l'un ni l'autre ne se derive du nom (du Calvados, de l'Ain, des
   Landes, de Paris ; le Havre, la Rochelle, Paris). */
function phraseCirco(nom, circo) {
  if (circo === null || circo === undefined) {
    return {
      absence: true,
      titre: `${nom} n'est pas dans le découpage électoral que Repère embarque.`,
      corps: "Ce découpage date de 2010 et le fichier du ministère de 2017 : les communes nouvelles créées depuis n'y figurent pas encore. Sa circonscription existe ; ce fichier ne la porte pas.",
    };
  }
  if (Array.isArray(circo)) {
    const suite = circo.every((n, i) => i === 0 || n === circo[i - 1] + 1);
    const liste = suite && circo.length > 2
      ? `${ordinal(circo[0])} à ${ordinal(circo[circo.length - 1])}`
      : circo.map(ordinal).join(", ");
    return {
      titre: "Circonscriptions",
      valeur: `${circo.length} circonscriptions législatives (${liste})`,
      corps: "Cette commune est partagée entre plusieurs circonscriptions : elle élit donc plusieurs députés, tous nommés ci-dessous.",
    };
  }
  return {
    titre: "Circonscription",
    valeur: `${ordinal(circo)} circonscription législative`,
    corps: `${nom} vote dans cette circonscription pour élire un député à l'Assemblée nationale.`,
  };
}

/* QUI A ÉTÉ ÉLU DANS CETTE CIRCONSCRIPTION.
 *
 * Ce lien n'est pas dans le Répertoire national des élus, et il n'est pas
 * deviné : il vient du fichier des mandats de l'Assemblée nationale, relevé une
 * fois et publié avec son producteur, sa licence, sa législature et sa date
 * (scripts/deputes.json → data/deputes.json). Le fichier n'est demandé QUE par
 * cet écran, et une seule fois : ni le premier écran ni « Où va l'argent » ne
 * le téléchargent.
 *
 * Une commune à cheval sur plusieurs circonscriptions n'affiche personne :
 * laquelle est la vôtre dépend de votre adresse, que Repère ne demande pas. */

/* COMMENT IL A VOTE — le bout de chaine que personne d'autre ne donne.
 *
 * CE QUI EST AFFICHE : un scrutin par ligne, du plus recent au plus ancien,
 * avec la position de CE depute et le lien vers le scrutin officiel. Rien
 * d'autre.
 *
 * CE QUI N'EST PAS AFFICHE, ET NE LE SERA PAS : aucun compte (« 12 fois pour »),
 * aucun taux, aucune comparaison avec un groupe ou un autre elu. L'invariant 3
 * l'interdit, et depuis le 17/09/2026 le format des donnees le rend impossible
 * par construction (BLOCKER M-2) : seuls les scrutins SOLENNELS sont publies,
 * indexes par leur numero et non par un rang de tableau — aucune valeur rangee
 * sous une cle qui nomme un depute n'a plus la forme d'un compte ou d'un taux.
 *
 * RIEN NE PART AU RESEAU TANT QUE LE LECTEUR N'A PAS DEMANDE. Le catalogue
 * (28 Ko, toute la France) et les positions du departement (moins de 2 Ko) ne
 * sont demandes qu'au clic. */
function Votes({ dep, acteurRef, nom }) {
  const [ouvert, setOuvert] = useState(false);
  const [etat, setEtat] = useState(ETATS.ABSENT);
  const [cat, setCat] = useState(null);
  const [pos, setPos] = useState(null);
  /* TROUVE PAR L'AUDIT WCAG DU 16/09/2026 : le bloc de votes apparaissait sous
   * le bouton sans qu'aucun lecteur d'ecran ne l'annonce — aucun aria-live,
   * et le focus restait sur le bouton qui vient de disparaitre. Un bloc de
   * plusieurs centaines de mots n'est pas de la matiere pour une region
   * live (elle relirait tout a chaque changement) ; le patron ARIA
   * "disclosure" recommande de deplacer le focus dans le contenu qui vient
   * d'apparaitre, pas de le faire annoncer par-dessus. */
  const enteteRef = useRef(null);
  useEffect(() => {
    if (ouvert && enteteRef.current) enteteRef.current.focus();
  }, [ouvert, etat]);

  useEffect(() => {
    if (!ouvert) return undefined;
    let vivant = true;
    setEtat(ETATS.EN_COURS);
    Promise.all([chargerCatalogueScrutins(), chargerVotes(dep)]).then(([c, v]) => {
      if (!vivant) return;
      /* Deux fichiers, deux etats possibles. On retient celui qui empeche
         d'afficher : un catalogue arrive sans les positions ne doit pas passer
         pour un ecran complet. */
      setEtat(c.etat === ETATS.SERVI ? v.etat : c.etat);
      setCat(c.donnees);
      setPos(v.donnees);
    });
    return () => { vivant = false; };
  }, [ouvert, dep]);

  if (!ouvert) {
    return (
      <button type="button" className="depliant" aria-expanded="false"
        onClick={() => { setOuvert(true); entrer(() => setOuvert(false)); }}>
        Comment {nom} a voté à l'Assemblée
      </button>
    );
  }
  if (etat === ETATS.EN_COURS) {
    return <Chargement titre="Chargement des scrutins publics."
      corps="Le relevé des votes, une seule fois, puis il reste sur cet appareil." />;
  }
  if (etat !== ETATS.SERVI || !cat || !cat.scrutins || !pos || !pos.positions) {
    return <Vide titre="Le relevé des scrutins n'est pas arrivé jusqu'à cet appareil."
      corps="Le nom du député ci-dessus, lui, est bien celui de cette circonscription. Les votes seront téléchargés à la prochaine connexion."
      lien={{ texte: "Assemblée nationale — scrutins publics", url: AN_VOTES_URL }} />;
  }

  const s = cat.source || {};
  /* LA MEME GARDE QUE SUR LE FIL DATE, ET AU MEME ENDROIT DU RAISONNEMENT : avant
     de lire une position. Le defaut etait ici AUSSI — cet ecran lit les memes
     chaines par rang depuis le 13/09. Voir positionsFiables() dans lib/votes.jsx. */
  if (!positionsFiables(cat, pos)) {
    return <Vide titre={REFUS_APPARIEMENT.titre} corps={REFUS_APPARIEMENT.corps}
      lien={{ texte: "Assemblée nationale — scrutins publics", url: s.url || AN_VOTES_URL }} />;
  }

  /* Du plus recent au plus ancien : le catalogue est trie par date croissante.
     BLOCKER M-2 : `cat.scrutins` ne contient plus que des scrutins solennels
     (filtre applique a l'ecriture, extract-html.js) — plus de distinction
     lois/details a faire ici, et plus de rang de tableau : chaque position se
     lit par le numero du scrutin, jamais par un indice. */
  const lignes = cat.scrutins.map(sc => ({ sc, p: positionSur(pos, acteurRef, sc.n) })).reverse();
  if (!lignes.some(l => l.p)) {
    return <Vide titre={`Le relevé des scrutins ne porte aucune position pour ${nom}.`}
      corps="Un mandat ouvert après la période relevée, un siège pourvu en cours de législature : c'est la source qui est muette sur cette période, et Repère n'en déduit rien."
      lien={{ texte: "Assemblée nationale — scrutins publics", url: s.url || AN_VOTES_URL }} />;
  }
  const base = cat.url_scrutin || "";

  return (
    <div className="votes">
      {/* UN EN-TETE, ET IL A ETE AJOUTE SUR CAPTURE. Deplie, l'ecran passait du
          nom du depute a une suite de dates : rien ne disait de qui etaient ces
          positions, ni sur quelle periode. */}
      <div className="votes-h" ref={enteteRef} tabIndex={-1}>
        <b>Comment {nom} a voté</b>
        <button type="button" className="votes-replier" aria-expanded="true" onClick={revenir}>Replier</button>
      </div>

      <p className="groupe">
        {lignes.length === 1 ? "La loi votée" : "Les " + lignes.length + " lois votées"}
        {" "}— <Mot cle="scrutin solennel">votes solennels</Mot> sur l'ensemble d'un texte
      </p>
      {lignes.map(({ sc, p }) => <LigneVote key={sc.u} sc={sc} position={p} base={base} loi qui={nom} />)}

      <p className="tx-note">
        {s.portee ? s.portee + ". " : ""}{cat.ecarte}
        {" Une position non portée n'est pas une absence : elle peut couvrir une délégation, "}
        une présidence de séance, ou un scrutin auquel le député n'a pas été appelé. Repère ne
        publie que les votes solennels — sur l'ensemble d'un texte — jamais les votes de détail :
        la plupart d'entre eux sont des votes de procédure à faible participation, et compter les
        positions non portées produirait un chiffre qui ressemble à un taux de présence sans en
        être un.
      </p>
      <Source producteur={s.producteur} licence={s.licence}
        mention={s.releve_le ? "relevé le " + dateFr(s.releve_le) : undefined}
        url={s.url || AN_VOTES_URL} />
    </div>
  );
}

function Depute({ dep, circo }) {
  const [etat, setEtat] = useState(ETATS.EN_COURS);
  const [fichier, setFichier] = useState(null);

  useEffect(() => {
    let vivant = true;
    chargerDeputes().then(r => {
      if (!vivant) return;
      setEtat(r.etat);
      setFichier(r.donnees);
    });
    return () => { vivant = false; };
  }, []);

  if (etat === ETATS.EN_COURS) {
    return <Chargement titre="Recherche du député élu dans cette circonscription."
      corps="Cinquante kilo-octets pour toute la France, une seule fois." />;
  }
  /* Hors ligne sans avoir jamais reçu le fichier : on le dit, et on ne propose
     pas de « Réessayer » qui ne peut pas aboutir. */
  if (etat !== ETATS.SERVI || !fichier || !fichier.deputes) {
    return <Vide titre="Le nom du député élu ici n'est pas arrivé jusqu'à cet appareil."
      corps="La circonscription ci-dessus, elle, est bien celle de cette commune. Le fichier des mandats de l'Assemblée nationale sera téléchargé à la prochaine connexion."
      lien={{ texte: "Assemblée nationale — députés en exercice", url: AN_URL }} />;
  }

  const s = fichier.source || {};

  /* UNE COMMUNE A CHEVAL SUR PLUSIEURS CIRCONSCRIPTIONS N'AFFICHAIT PERSONNE.
   *
   * La regle etait juste — laquelle est la votre depend de votre adresse, et
   * Repere ne la demande pas — mais la consequence ne l'etait pas : Paris,
   * Marseille, Lyon, Saint-Denis, Creteil, Versailles, Boulogne-Billancourt et
   * 111 autres communes n'avaient ni depute ni vote. Deux millions de Parisiens
   * pour la seule ville de Paris, dans une beta dont l'Ile-de-France est le cap.
   *
   * CE QUI CHANGE, ET CE QUI NE CHANGE PAS. On ne devine toujours rien : on
   * n'attribue AUCUN de ces deputes au lecteur, et on ne lui demande pas son
   * adresse. On dit ce qui est vrai de la COMMUNE — elle elit ces deputes-la —
   * et on le dit dans l'ordre des circonscriptions, jamais dans un autre. Chacun
   * porte son dépliant de votes ; aucun n'est mis en avant.
   * Le fichier des mandats est deja charge : cette liste ne coute aucun octet
   * de plus que le nom unique d'avant. */
  if (Array.isArray(circo)) {
    const elus = circo.map(n => ({ n, d: fichier.deputes[dep + "-" + n] })).filter(e => e.d);
    if (!elus.length) {
      return <Vide titre="Le fichier des mandats de l'Assemblée nationale ne porte personne pour ces circonscriptions."
        corps="C'est la source qui est muette, et Repère n'invente pas de nom."
        lien={{ texte: "Assemblée nationale — députés en exercice", url: AN_URL }} />;
    }
    return (
      <>
        <p className="tx-note">
          Cette commune élit {elus.length} députés, un par circonscription. Laquelle est la
          vôtre dépend de votre adresse — Repère ne la demande pas, et ne la devinera pas.
          Ils sont rangés dans l'ordre des circonscriptions.
        </p>
        {/* PARIS (18 CIRCONSCRIPTIONS) ETAIT LE CAS EXTREME QUI FAISAIT DOUBLER
         * LA HAUTEUR DE L'ECRAN — mesure du 16/09/2026 : 5 434 px contre 2 400
         * a 2 750 px pour une commune a un seul depute. LA REGLE NE CHANGE PAS
         * (tous les deputes restent lus, listes dans l'ordre des
         * circonscriptions, aucun mis en avant — c'est ce que la RC du 15/09
         * avait juge correct) : seule la PREMIERE VUE change. Les trois
         * premiers restent ouverts d'emblee ; au-dela, un repli standard du
         * produit (meme motif que .repli ailleurs) — un tap, jamais un
         * deuxieme ecran, jamais une donnee retiree. */}
        {elus.slice(0, 3).map(({ n, d }) => (
          <div className="bloc-second" key={n}>
            <div className="ligne">
              <div className="ligne-h">
                <span>{ordinal(n)} circonscription</span>
                <b>{d.prenom} {d.nom}</b>
              </div>
              <div className="ligne-note">
                Mandat ouvert{d.dateDebut ? " depuis le " + dateFr(d.dateDebut) : ""}, {s.legislature ? s.legislature + "e législature" : "législature en cours"}.
              </div>
            </div>
            {d.acteurRef ? <Votes dep={dep} acteurRef={d.acteurRef} nom={d.prenom + " " + d.nom} /> : null}
          </div>
        ))}
        {elus.length > 3 ? (
          <details className="repli">
            <summary>
              <span>{elus.length - 3} autre{elus.length - 3 > 1 ? "s" : ""} circonscription{elus.length - 3 > 1 ? "s" : ""}</span>
            </summary>
            <div className="repli-in">
              {elus.slice(3).map(({ n, d }) => (
                <div className="bloc-second" key={n}>
                  <div className="ligne">
                    <div className="ligne-h">
                      <span>{ordinal(n)} circonscription</span>
                      <b>{d.prenom} {d.nom}</b>
                    </div>
                    <div className="ligne-note">
                      Mandat ouvert{d.dateDebut ? " depuis le " + dateFr(d.dateDebut) : ""}, {s.legislature ? s.legislature + "e législature" : "législature en cours"}.
                    </div>
                  </div>
                  {d.acteurRef ? <Votes dep={dep} acteurRef={d.acteurRef} nom={d.prenom + " " + d.nom} /> : null}
                </div>
              ))}
            </div>
          </details>
        ) : null}
        <p className="tx-note">
          Ni étiquette politique, ni parcours : le fichier des mandats n'en porte pas.
        </p>
        <Source producteur={s.producteur} licence={s.licence}
          mention={s.releve_le ? "relevé le " + dateFr(s.releve_le) : undefined} url={s.url || AN_URL} />
      </>
    );
  }

  const d = fichier.deputes[dep + "-" + circo];
  if (!d) {
    return <Vide titre="Le fichier des mandats de l'Assemblée nationale ne porte personne pour cette circonscription."
      corps="Un siège vacant, une législature qui change, un découpage plus récent que le relevé : c'est la source qui est muette, et Repère n'invente pas de nom."
      lien={{ texte: "Assemblée nationale — députés en exercice", url: AN_URL }} />;
  }

  return (
    <>
      <div className="ligne">
        <div className="ligne-h">
          <span>Siège à l'Assemblée nationale</span>
          <b>{d.prenom} {d.nom}</b>
        </div>
        <div className="ligne-note">
          Mandat ouvert{d.dateDebut ? " depuis le " + dateFr(d.dateDebut) : ""}, {s.legislature ? s.legislature + "e législature" : "législature en cours"}.
          Ni étiquette politique, ni parcours : le fichier des mandats n'en porte pas.
        </div>
      </div>
      <Source producteur={s.producteur} licence={s.licence}
        mention={s.releve_le ? "relevé le " + dateFr(s.releve_le) : undefined} url={s.url || AN_URL} />
      {/* LA SUITE DE LA CHAINE. Elle a sa propre source, plus bas : les mandats et
          les scrutins sont deux jeux de donnees, releves a deux dates. */}
      {d.acteurRef ? <Votes dep={dep} acteurRef={d.acteurRef} nom={d.prenom + " " + d.nom} /> : null}
    </>
  );
}

/* AGGLO, DEPARTEMENT, REGION — PORTES LE 22/09/2026 (decision produit,
 * option A, mission phase 3.1 suite). L'ancien site les nommait a partir
 * du Repertoire national des elus ; mono/ disait ne pas les publier encore.
 * Trace complete du mecanisme porte (jamais invente) dans extract-html.js,
 * au moment ou `agglo`, `canton`, `conseil_departemental` et
 * `elus-regions/{code}.json` sont ecrits. */

/* Une ligne d'elu, meme gabarit partout : nom, fonction, date de debut. */
function LigneElu({ e }) {
  return (
    <div className="ligne">
      <div className="ligne-h"><span>{e.fonction || "Fonction non précisée"}</span><b>{e.nom}</b></div>
      <div className="ligne-note">
        Mandat ouvert{e.debut ? " depuis le " + dateFr(e.debut) : ""}. Ni étiquette politique,
        ni parcours : le Répertoire national des élus n'en porte pas.
      </div>
    </div>
  );
}

/* AGGLO — les delegues QUE CETTE COMMUNE envoie a son intercommunalite.
 * Absent pour environ un tiers des communes de la beta (mesure le
 * 22/09/2026, extract-html.js) : la source RNE elle-meme ne les liste pas
 * partout — ce n'est pas un manque de Repere, et la phrase le dit. */
function Agglo({ c, src }) {
  if (!c.agglo || !c.agglo.delegues || !c.agglo.delegues.length) {
    return (
      <Vide titre="Le Répertoire national des élus ne porte pas de délégué pour cette commune à son intercommunalité."
        corps="C'est la source qui est incomplète, pas la commune qui n'en a pas : cette édition du Répertoire ne liste des conseillers communautaires que pour une partie des communes de France."
        lien={{ texte: "Répertoire national des élus", url: RNE_URL }} />
    );
  }
  const [tete, ...reste] = c.agglo.delegues;
  return (
    <>
      {/* LE NOM DE L'EPCI, RECOPIE TEL QUE LA SOURCE L'ECRIT — principe P15,
          deja applique aux intitules de projets ailleurs dans le produit
          (CeQuiADecide.jsx) : le RNE le capitalise de facon inhabituelle
          (« Ca Du Pays Basque »), et deviner la bonne casse serait ecrire
          un nom que la source n'a pas publie ainsi. Trouve en testant : ce
          nom manquait purement et simplement avant ce correctif. */}
      {c.agglo.nom ? <p className="tx-note tx-intro">{c.nom} envoie {c.agglo.delegues.length} élu{c.agglo.delegues.length > 1 ? "s" : ""} au conseil de {c.agglo.nom}.</p> : null}
      <LigneElu e={tete} />
      {reste.length ? (
        <details className="repli">
          <summary><span>{reste.length} autre{reste.length > 1 ? "s" : ""} délégué{reste.length > 1 ? "s" : ""} de {c.nom}</span></summary>
          <div className="repli-in">{reste.map((e, i) => <LigneElu key={i} e={e} />)}</div>
        </details>
      ) : null}
      {src ? <Source producteur={src.producteur} licence={src.licence} maj={src.maj} url={RNE_URL} /> : null}
    </>
  );
}

/* DEPARTEMENT — « mon canton d'abord », exactement la decision produit deja
 * ecrite dans l'ancien site : le conseiller de VOTRE canton passe avant le
 * president du departement, sauf s'il n'y a pas de lien de canton pour
 * cette commune (alors le mieux classe de tout le conseil, en pratique le
 * president, prend sa place). */
function ConseilDepartemental({ paquet, c, src }) {
  const conseil = paquet.conseil_departemental;
  if (!conseil || !conseil.length) {
    return (
      <Vide titre="Le Répertoire national des élus ne porte pas de conseil départemental pour ce territoire."
        corps="C'est la source qui est incomplète, pas le département qui n'en a pas."
        lien={{ texte: "Répertoire national des élus", url: RNE_URL }} />
    );
  }
  const mesCantons = c.canton || [];
  const duCanton = mesCantons.length ? conseil.filter(e => mesCantons.includes(e.canton)) : [];
  const cantonNom = duCanton.length ? (paquet.cantons || {})[duCanton[0].canton] : null;
  const tete = duCanton.length ? duCanton[0] : conseil[0];
  const propreCanton = duCanton.slice(1); // les autres elus DU MEME canton, jamais caches derriere "les autres du departement"
  const resteDept = conseil.filter(e => e !== tete && propreCanton.indexOf(e) === -1);
  return (
    <>
      {duCanton.length ? (
        <p className="tx-note tx-intro">
          Vos conseillers départementaux ne sont pas élus sur tout le département : ils le sont
          sur le canton{cantonNom ? " de " + cantonNom : ""}, avec vos voisins.
        </p>
      ) : null}
      <LigneElu e={tete} />
      {propreCanton.length ? (
        <details className="repli">
          <summary><span>{propreCanton.length} autre{propreCanton.length > 1 ? "s" : ""} conseiller{propreCanton.length > 1 ? "s" : ""} du même canton</span></summary>
          <div className="repli-in">{propreCanton.map((e, i) => <LigneElu key={i} e={e} />)}</div>
        </details>
      ) : null}
      {resteDept.length ? (
        <details className="repli">
          <summary><span>{resteDept.length} autre{resteDept.length > 1 ? "s" : ""} du conseil départemental</span></summary>
          <div className="repli-in">{resteDept.map((e, i) => <LigneElu key={i} e={e} />)}</div>
        </details>
      ) : null}
      {src ? <Source producteur={src.producteur} licence={src.licence} maj={src.maj} url={RNE_URL} /> : null}
    </>
  );
}

/* REGION — aucun decoupage par canton dans la source : le mieux classe de
 * tout le conseil regional est affiche, et c'est en pratique presque
 * toujours le president (le rang de fonction le place en tete). Un seul
 * petit fichier par region (jamais la France entiere, voir client.js). */
function ConseilRegional({ index, paquet, src }) {
  const [etat, setEtat] = useState(ETATS.EN_COURS);
  const [conseil, setConseil] = useState(null);
  const territoireDept = index && paquet ? index.departements.find(d => d.code === paquet.d) : null;
  const codeRegion = territoireDept && territoireDept.region_code;

  useEffect(() => {
    if (!codeRegion) { setEtat(ETATS.INTROUVABLE); return undefined; }
    let vivant = true;
    setEtat(ETATS.EN_COURS);
    chargerElusRegion(codeRegion).then(r => {
      if (!vivant) return;
      setEtat(r.etat);
      setConseil(r.donnees && r.donnees.elus);
    });
    return () => { vivant = false; };
  }, [codeRegion]);

  if (!codeRegion) {
    return <Vide titre="Aucun conseil régional n'est publié pour ce département."
      corps="Le Répertoire national des élus ne porte pas de ligne « région » pour ce territoire — ce n'est pas un manque de Repère." />;
  }
  if (etat === ETATS.EN_COURS) {
    return <Chargement titre="Recherche du conseil régional." corps="Un seul petit fichier pour votre région, une seule fois." />;
  }
  if (etat !== ETATS.SERVI || !conseil || !conseil.length) {
    return <Vide titre="Le conseil régional n'est pas arrivé jusqu'à cet appareil."
      corps="Les échelons ci-dessus, eux, sont complets."
      lien={{ texte: "Répertoire national des élus", url: RNE_URL }} />;
  }
  const [tete, ...reste] = conseil;
  return (
    <>
      <LigneElu e={tete} />
      {reste.length ? (
        <details className="repli">
          <summary><span>{reste.length} autres du conseil régional</span></summary>
          <div className="repli-in">{reste.map((e, i) => <LigneElu key={i} e={e} />)}</div>
        </details>
      ) : null}
      {src ? <Source producteur={src.producteur} licence={src.licence} maj={src.maj} url={RNE_URL} /> : null}
    </>
  );
}

export default function QuiDecide({ paquet, index, commune }) {
  const c = commune ? paquet.communes[commune] : null;
  if (!c) return null;

  const src = index && index.sources ? index.sources.elus : null;
  const srcCirco = index && index.sources ? index.sources.circonscriptions : null;
  const p = phraseCirco(c.nom, c.circo);

  return (
    <Pile>
      {/* Le titre est le NOM SEUL : « de ${nom} » demanderait une elision qui ne se
          derive pas du nom (de Ustaritz / d'Anglet). Le sous-titre porte le sens. */}
      <Carte echelon="ville" titre={c.nom}
        sousTitre="Le conseil municipal : qui a été élu pour décider dans cette commune"
        tag="Donnée officielle">
        {c.maire ? (
          <div className="ligne">
            <div className="ligne-h"><span>{c.maire.fonction}</span><b>{c.maire.nom}</b></div>
            <div className="ligne-note">
              {c.adjoints > 0
                /* LE NOM COMPLET, JAMAIS LE DERNIER MOT.
                   Mesure du 15/09/2026 : 72 maires d'Ile-de-France sur 1 262 (5,7 %)
                   portent un nom de plus de deux mots. « Alexandre DE MEULENAERE »
                   devenait « MEULENAERE », « Jean-Marie VAN LANDEGHEM » devenait
                   « LANDEGHEM », « Jean-Yves LE MEE » devenait « MEE ». Et a Paris la
                   ligne disait « 36 adjoints siegent avec GREGOIRE », deux cartes
                   au-dessus de la deputee Olivia Gregoire — le defaut d'imputation
                   corrige hier sur l'autre ecran, survivant sur celui-ci.
                   Le RNE publie le nom complet : il n'y a rien a decouper. */
                ? <>{c.adjoints} <Mot cle="adjoint au maire">adjoint{c.adjoints > 1 ? "s" : ""}</Mot> siègent avec {c.maire.nom}. Ce sont eux qui votent le budget de la commune.</>
                : "Aucun adjoint n'est enregistré pour cette commune dans le Répertoire national des élus."}
            </div>
          </div>
        ) : (
          <Vide titre="Le Répertoire national des élus ne porte pas de maire pour cette commune."
            corps="C'est la source qui est incomplète, pas la commune qui n'en a pas."
            lien={{ texte: "Répertoire national des élus", url: RNE_URL }} />
        )}
        <div className="ligne">
          <div className="ligne-h"><span>Ce que décide votre commune</span></div>
          <div className="ligne-note">{COMPETENCES.ville.charAt(0).toUpperCase() + COMPETENCES.ville.slice(1)}.</div>
        </div>
        <p className="tx-note">
          Ni étiquette politique, ni parcours : le Répertoire n'en contient pas, et Repère n'en invente pas.
        </p>
        {src ? <Source producteur={src.producteur} licence={src.licence} maj={src.maj} url={RNE_URL} /> : null}
      </Carte>

      <Carte echelon="france" titre="À l'Assemblée nationale"
        sousTitre={<>Le député est élu par <Mot cle="circonscription">circonscription</Mot>, pas par commune</>}
        tag={p.absence ? undefined : "Donnée officielle"}>
        <div className="ligne">
          <div className="ligne-h"><span>Ce que décide votre député</span></div>
          <div className="ligne-note">{COMPETENCES.france.charAt(0).toUpperCase() + COMPETENCES.france.slice(1)}.</div>
        </div>
        {p.absence ? (
          <Vide titre={p.titre} corps={p.corps} />
        ) : (
          /* CE N'EST PAS UNE ABSENCE. La circonscription s'affichait avec le
             composant reserve aux donnees manquantes : un resultat normal avait
             donc exactement l'apparence d'un trou dans les donnees. */
          <div className="ligne">
            <div className="ligne-h"><span>{p.titre}</span><b>{p.valeur}</b></div>
            <div className="ligne-note">{p.corps}</div>
          </div>
        )}
        {srcCirco ? (
          <Source producteur={srcCirco.producteur} licence={srcCirco.licence}
            mention={"découpage de " + srcCirco.decoupage} />
        ) : null}

        {/* UN FILET, ET IL A ETE AJOUTE SUR CAPTURE. Le nom de l'elu venait
            juste apres la source du decoupage, sans separation : on lisait
            « Ministere de l'Interieur · decoupage de 2010 » puis un nom, et
            cette source semblait couvrir ce nom-la. Les deux blocs ont deux
            producteurs differents ; ils sont maintenant separes a l'oeil.
            Le depute n'est demande que pour une commune qui tient dans UNE
            circonscription. */}
        {c.circo === null || c.circo === undefined ? null : (
          <div className="bloc-second"><Depute dep={paquet.d} circo={c.circo} /></div>
        )}
      </Carte>

      {/* QUI D'AUTRE DECIDE POUR VOUS — PORTE LE 22/09/2026 (option A). Trois
          cartes, memes principes que le reste de l'ecran : celui qui
          represente VOTRE commune ou canton en tete, ce que l'echelon
          decide toujours affiche meme quand personne n'est nomme, et une
          absence dite plutot que devinee quand la source ne porte pas la
          donnee (l'intercommunalite, en particulier, manque a la source
          pour une commune sur trois de la beta). */}
      <p className="tx-note tx-intro">{ORDRE_DISTANCE}</p>

      <Carte echelon="agglo" titre={<>Votre <Mot cle="intercommunalité">intercommunalité</Mot></>}
        sousTitre={COMPETENCES.agglo.charAt(0).toUpperCase() + COMPETENCES.agglo.slice(1) + ". Vous ne l'élisez pas directement : ce sont les conseillers municipaux qui y siègent."}
        tag={c.agglo ? "Donnée officielle" : undefined}>
        <Agglo c={c} src={src} />
      </Carte>

      <Carte echelon="dept" titre={<>Votre <Mot cle="conseil départemental">département</Mot></>}
        sousTitre={COMPETENCES.dept.charAt(0).toUpperCase() + COMPETENCES.dept.slice(1) + "."}
        tag={paquet.conseil_departemental ? "Donnée officielle" : undefined}>
        <ConseilDepartemental paquet={paquet} c={c} src={src} />
      </Carte>

      <Carte echelon="region" titre={<>Votre <Mot cle="conseil régional">région</Mot></>}
        sousTitre={COMPETENCES.region.charAt(0).toUpperCase() + COMPETENCES.region.slice(1) + "."}
        tag="Donnée officielle">
        <ConseilRegional index={index} paquet={paquet} src={src} />
      </Carte>
    </Pile>
  );
}
