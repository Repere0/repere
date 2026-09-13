import React, { useEffect, useState } from "react";
import { Carte, Vide, Source, Chargement, dateFr } from "@repere/ui";
import { Pile } from "@repere/ui/amicro";
import { chargerDeputes, chargerCatalogueScrutins, chargerVotes, ETATS } from "@repere/data-utils";

const RNE_URL = "https://www.data.gouv.fr/fr/datasets/repertoire-national-des-elus-1/";
const AN_URL = "https://data.assemblee-nationale.fr/acteurs/deputes-en-exercice";
const AN_VOTES_URL = "https://data.assemblee-nationale.fr/travaux-parlementaires/votes";

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
const MOTS = { p: "Pour", c: "Contre", a: "Abstention" };
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
      <button type="button" className="depliant" onClick={() => setOuvert(true)}>
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

  const suite = pos.positions[acteurRef];
  const s = cat.source || {};
  if (!suite) {
    return <Vide titre={`Le relevé des scrutins ne porte aucune position pour ${nom}.`}
      corps="Un mandat ouvert après la période relevée, un siège pourvu en cours de législature : c'est la source qui est muette sur cette période, et Repère n'en déduit rien."
      lien={{ texte: "Assemblée nationale — scrutins publics", url: s.url || AN_VOTES_URL }} />;
  }

  /* Du plus recent au plus ancien : le catalogue est trie par date croissante. */
  const lignes = cat.scrutins
    .map((sc, i) => ({ sc, p: suite[i] }))
    .reverse();
  const montres = lignes.slice(0, combien);
  const reste = lignes.length - montres.length;

  return (
    <div className="votes">
      {/* UN EN-TETE, ET IL A ETE AJOUTE SUR CAPTURE. Deplie, l'ecran passait du
          nom du depute a une suite de dates : rien ne disait de qui etaient ces
          positions, ni sur quelle periode. Le lecteur devait le deduire. */}
      <div className="votes-h">
        <b>Comment {nom} a voté</b>
        <button type="button" className="votes-replier" onClick={() => setOuvert(false)}>Replier</button>
      </div>
      <p className="tx-note votes-portee">{s.portee || ""}</p>
      {montres.map(({ sc, p }) => (
        <div className="ligne" key={sc.u}>
          <div className="ligne-h">
            <span>{dateFr(sc.d)}</span>
            <b>{MOTS[p] || "Position non portée"}</b>
          </div>
          <div className="ligne-note">
            {sc.t}
            {" — "}
            {sc.sl || sc.s}
            {" ("}{sc.dec.pour} pour, {sc.dec.contre} contre, {sc.dec.abstentions} abstention
            {Number(sc.dec.abstentions) > 1 ? "s" : ""}{")."}
            {" "}
            <a href={(cat.url_scrutin || "") + sc.n} target="_blank" rel="noopener noreferrer">
              Scrutin n° {sc.n} sur le site de l'Assemblée
            </a>
          </div>
        </div>
      ))}
      {reste > 0 ? (
        <button type="button" className="depliant" onClick={() => setCombien(combien + PAR_TRANCHE)}>
          Afficher {Math.min(reste, PAR_TRANCHE)} scrutin{Math.min(reste, PAR_TRANCHE) > 1 ? "s" : ""} de plus
          {" "}({reste} restant{reste > 1 ? "s" : ""})
        </button>
      ) : null}
      <p className="tx-note">
        {cat.ecarte}
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
        {elus.map(({ n, d }) => (
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
                ? `${c.adjoints} adjoint${c.adjoints > 1 ? "s" : ""} siègent avec ${c.maire.nom.split(" ").slice(-1)[0]}. Ce sont eux qui votent le budget de la commune.`
                : "Aucun adjoint n'est enregistré pour cette commune dans le Répertoire national des élus."}
            </div>
          </div>
        ) : (
          <Vide titre="Le Répertoire national des élus ne porte pas de maire pour cette commune."
            corps="C'est la source qui est incomplète, pas la commune qui n'en a pas."
            lien={{ texte: "Répertoire national des élus", url: RNE_URL }} />
        )}
        <p className="tx-note">
          Ni étiquette politique, ni parcours : le Répertoire n'en contient pas, et Repère n'en invente pas.
        </p>
        {src ? <Source producteur={src.producteur} licence={src.licence} maj={src.maj} url={RNE_URL} /> : null}
      </Carte>

      <Carte echelon="france" titre="À l'Assemblée nationale"
        sousTitre="Le député est élu par circonscription, pas par commune"
        tag={p.absence ? undefined : "Donnée officielle"}>
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
    </Pile>
  );
}
