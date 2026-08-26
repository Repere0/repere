import React from "react";
import { Carte, Vide, Source } from "@repere/ui";

const RNE_URL = "https://www.data.gouv.fr/fr/datasets/repertoire-national-des-elus-1/";

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
    corps: `${nom} vote dans cette circonscription pour élire un député à l'Assemblée nationale. Repère ne peut pas encore dire qui y a été élu : ce lien n'existe pas dans le Répertoire national des élus, et il ne sera pas deviné.`,
  };
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
      </Carte>
    </div>
  );
}
