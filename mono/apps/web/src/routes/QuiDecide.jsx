import React, { useEffect, useRef, useState } from "react";
import { Carte, Vide, Source, Chargement, dateFr, Mot } from "@repere/ui";
import { Pile } from "@repere/ui/amicro";
import { LigneVote, estSolennel, positionsFiables, REFUS_APPARIEMENT } from "../lib/votes.jsx";
import {
  chargerDeputes, chargerCatalogueScrutins, chargerVotes, entrer, revenir, ETATS,
} from "@repere/data-utils";

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
 *  garde ne fait pas la difference entre une violation et sa description.) */
const COMPETENCES = {
  ville: "l'école primaire, la cantine, les permis de construire, la voirie et l'état civil",
  agglo: "les transports, les déchets, l'eau, et souvent les piscines et les médiathèques",
  dept: "les collèges, les routes départementales, les aides sociales et la protection de l'enfance",
  region: "les lycées, les trains du quotidien, la formation professionnelle et le développement économique",
  france: "les lois qui s'appliquent partout, et le budget de l'État",
};
const ORDRE_DISTANCE = "Rangés du plus proche de chez vous au plus lointain. Ce n'est pas un ordre d'importance : c'est un ordre de distance.";

/* Une ligne d'echelon : sa pastille de couleur, son nom, ce qu'il decide. La
   pastille reprend le jeton gele de l'echelon — aucune autre couleur n'entre. */
function LigneEchelon({ echelon, nom, corps, note }) {
  return (
    <div className="ligne echelon">
      <div className="echelon-h">
        <span className="pastille" style={{ background: `var(--e-${echelon})` }} aria-hidden="true" />
        <b>{nom}</b>
      </div>
      <div className="ligne-note">{corps}{note ? " " + note : ""}</div>
    </div>
  );
}

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
const PAR_TRANCHE = 10;

/* COMMENT IL A VOTE — le bout de chaine que personne d'autre ne donne.
 *
 * CE QUI EST AFFICHE : un scrutin par ligne, du plus recent au plus ancien,
 * avec la position de CE depute et le lien vers le scrutin officiel. Rien
 * d'autre.
 *
 * CE QUI N'EST PAS AFFICHE, ET NE LE SERA PAS : aucun compte (« 12 fois pour »),
 * aucun taux, aucune comparaison avec un groupe ou un autre elu. L'invariant 3
 * l'interdit, et le format des donnees le rend impossible : le fichier ne porte
 * qu'une suite de positions. Un compteur d'absences, lui, ne peut meme pas etre
 * calcule — le releve amont n'embarque aucun non-votant.
 *
 * RIEN NE PART AU RESEAU TANT QUE LE LECTEUR N'A PAS DEMANDE. Le catalogue
 * (28 Ko, toute la France) et les positions du departement (moins de 2 Ko) ne
 * sont demandes qu'au clic. */
function Votes({ dep, acteurRef, nom }) {
  const [ouvert, setOuvert] = useState(false);
  const [etat, setEtat] = useState(ETATS.ABSENT);
  const [cat, setCat] = useState(null);
  const [pos, setPos] = useState(null);
  const [combien, setCombien] = useState(PAR_TRANCHE);
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

  const suite = pos.positions[acteurRef];
  if (!suite) {
    return <Vide titre={`Le relevé des scrutins ne porte aucune position pour ${nom}.`}
      corps="Un mandat ouvert après la période relevée, un siège pourvu en cours de législature : c'est la source qui est muette sur cette période, et Repère n'en déduit rien."
      lien={{ texte: "Assemblée nationale — scrutins publics", url: s.url || AN_VOTES_URL }} />;
  }

  /* Du plus recent au plus ancien : le catalogue est trie par date croissante. */
  const lignes = cat.scrutins.map((sc, i) => ({ sc, p: suite[i] })).reverse();
  const lois = lignes.filter(l => estSolennel(l.sc));
  const details = lignes.filter(l => !estSolennel(l.sc));
  const montres = details.slice(0, combien);
  const reste = details.length - montres.length;
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

      {lois.length ? (
        <>
          <p className="groupe">
            {lois.length === 1 ? "La loi votée" : "Les " + lois.length + " lois votées"}
            {" "}— <Mot cle="scrutin solennel">votes solennels</Mot> sur l'ensemble d'un texte
          </p>
          {lois.map(({ sc, p }) => <LigneVote key={sc.u} sc={sc} position={p} base={base} loi qui={nom} />)}
        </>
      ) : (
        <p className="tx-note">
          Sur la période relevée, l'Assemblée n'a tenu aucun vote solennel sur l'ensemble
          d'un texte. Les votes de détail ci-dessous sont les seuls que la source porte.
        </p>
      )}

      {details.length ? (
        <>
          <p className="groupe">
            Les {details.length} votes de détail — amendements, motions, articles
          </p>
          <p className="tx-note votes-portee">
            Ce sont les votes qui construisent un texte ligne à ligne. Ils sont nombreux,
            et leur intitulé est celui de l'Assemblée, sans reformulation.
          </p>
          {montres.map(({ sc, p }) => <LigneVote key={sc.u} sc={sc} position={p} base={base} qui={nom} />)}
          {reste > 0 ? (
            <button type="button" className="depliant" onClick={() => setCombien(combien + PAR_TRANCHE)}>
              Afficher {Math.min(reste, PAR_TRANCHE)} vote{Math.min(reste, PAR_TRANCHE) > 1 ? "s" : ""} de plus
              {" "}({reste} restant{reste > 1 ? "s" : ""})
            </button>
          ) : null}
        </>
      ) : null}

      <p className="tx-note">
        {s.portee ? s.portee + ". " : ""}{cat.ecarte}
        {" Une position non portée n'est pas une absence : elle peut couvrir une délégation, "}
        une présidence de séance, ou un scrutin auquel le député n'a pas été appelé.
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

      {/* LES ECHELONS QUE REPERE NE PUBLIE PAS ENCORE. On ne nomme personne — les
          donnees ne sont pas la — mais on dit ce que ces echelons decident. Se
          taire laisserait croire qu'entre la commune et l'Assemblee il n'y a
          rien, alors que c'est la que se decident les transports, les colleges
          et les lycees. Une absence se dit, elle ne s'escamote pas. */}
      <Carte echelon="dept" titre="Qui d'autre décide pour vous"
        sousTitre="Trois échelons que Repère ne publie pas encore, et ce qu'ils décident">
        <p className="tx-note tx-intro">{ORDRE_DISTANCE}</p>
        <LigneEchelon echelon="agglo" nom={<>Votre <Mot cle="intercommunalité">intercommunalité</Mot></>} corps={COMPETENCES.agglo.charAt(0).toUpperCase() + COMPETENCES.agglo.slice(1) + "."}
          note="Vous ne l'élisez pas directement : ce sont les conseillers municipaux qui y siègent." />
        <LigneEchelon echelon="dept" nom={<>Votre <Mot cle="conseil départemental">département</Mot></>} corps={COMPETENCES.dept.charAt(0).toUpperCase() + COMPETENCES.dept.slice(1) + "."} />
        <LigneEchelon echelon="region" nom={<>Votre <Mot cle="conseil régional">région</Mot></>} corps={COMPETENCES.region.charAt(0).toUpperCase() + COMPETENCES.region.slice(1) + "."} />
        <p className="tx-note">
          Repère ne nomme pas encore les élus de ces trois échelons : les fichiers officiels
          qui les portent ne sont pas publiés ici. Ce qu'ils décident, en revanche, ne dépend
          d'aucune donnée — c'est la loi qui le fixe.
        </p>
      </Carte>
    </Pile>
  );
}
