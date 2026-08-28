import React, { useEffect, useState } from "react";
import { Carte, Vide, Source, Chargement, dateFr } from "@repere/ui";
import { chargerDeputes, ETATS } from "@repere/data-utils";

const RNE_URL = "https://www.data.gouv.fr/fr/datasets/repertoire-national-des-elus-1/";
const AN_URL = "https://data.assemblee-nationale.fr/acteurs/deputes-en-exercice";

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
      corps: "Cette commune est partagée entre plusieurs circonscriptions. Laquelle est la vôtre dépend de votre adresse — Repère ne la demande pas, et ne la devinera pas.",
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

  const d = fichier.deputes[dep + "-" + circo];
  const s = fichier.source || {};
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
    <div className="pile">
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
        {typeof c.circo === "number" ? (
          <div className="bloc-second"><Depute dep={paquet.d} circo={c.circo} /></div>
        ) : null}
      </Carte>
    </div>
  );
}
