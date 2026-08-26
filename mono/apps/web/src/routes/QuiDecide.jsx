import React, { useMemo, useState } from "react";
import { Carte, Vide, Source } from "@repere/ui";

function ordinal(n) { return n === 1 ? "1re" : n + "e"; }

/* AUCUN ARTICLE devant un nom de departement, AUCUN ACCORD sur un nom de
   commune : ni l'un ni l'autre ne se derive du nom (du Calvados, de l'Ain, des
   Landes, de Paris ; le Havre, la Rochelle, Paris). */
function phraseCirco(nom, circo) {
  if (circo === null || circo === undefined) {
    return {
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
      titre: `${nom} : ${circo.length} circonscriptions législatives (${liste}).`,
      corps: "Laquelle est la vôtre dépend de votre adresse — Repère ne la demande pas, et ne la devinera pas.",
    };
  }
  return {
    titre: `${nom} vote dans la ${ordinal(circo)} circonscription législative.`,
    corps: "Repère ne peut pas encore dire qui y a été élu : ce lien n'existe pas dans le Répertoire national des élus, et il ne sera pas deviné.",
  };
}

export default function QuiDecide({ paquet, index }) {
  const [filtre, setFiltre] = useState("");
  const [choisie, setChoisie] = useState(null);

  const communes = useMemo(() => Object.entries(paquet.communes), [paquet]);
  const vues = useMemo(() => {
    const q = filtre.trim().toLowerCase();
    const base = q
      ? communes.filter(([, c]) => c.nom.toLowerCase().includes(q))
      : communes;
    /* Tri ALPHABÉTIQUE, jamais numérique : classer des territoires par un
       chiffre est interdit (invariant 3), et l'ordre alphabétique est le seul
       qui ne dise rien de personne. */
    return base.sort((a, b) => a[1].nom.localeCompare(b[1].nom, "fr")).slice(0, 60);
  }, [communes, filtre]);

  const c = choisie ? paquet.communes[choisie] : null;
  const src = index && index.sources ? index.sources.elus : null;

  return (
    <div className="pile">
      <label className="champ">
        <span>Chercher une commune du département {paquet.d}</span>
        <input type="search" value={filtre} placeholder="Ustaritz, Bayonne…"
          onChange={e => { setFiltre(e.target.value); setChoisie(null); }} />
      </label>

      {vues.length === 0 ? (
        <Vide titre={`Aucune commune du département ${paquet.d} ne porte ce nom.`}
          corps="Le découpage ne contient que les communes de ce département : essayez un autre département si la vôtre est ailleurs." />
      ) : (
        <div className="rangee liste">
          {vues.map(([insee, com]) => (
            <button key={insee} type="button"
              className={"puce" + (insee === choisie ? " actif" : "")}
              onClick={() => setChoisie(insee)}>{com.nom}</button>
          ))}
          {communes.length > vues.length && !filtre
            ? <span className="note">{communes.length - vues.length} autres — affinez la recherche.</span>
            : null}
        </div>
      )}

      {c ? (
        <>
          <Carte echelon="ville" titre={c.nom} sousTitre={`Commune du département ${paquet.d}`} tag="Source officielle">
            {c.maire ? (
              <div className="ligne">
                <div className="ligne-h"><span>{c.maire.fonction}</span><b>{c.maire.nom}</b></div>
                <div className="ligne-note">
                  {c.adjoints > 0
                    ? `${c.adjoints} adjoint${c.adjoints > 1 ? "s" : ""} siègent avec ${c.maire.nom.split(" ").slice(-1)[0]}.`
                    : "Aucun adjoint n'est enregistré pour cette commune dans le Répertoire."}
                </div>
              </div>
            ) : (
              <Vide titre="Le Répertoire national des élus ne porte pas de maire pour cette commune."
                corps="C'est la source qui est incomplète, pas la commune qui n'en a pas."
                lien={{ texte: "Répertoire national des élus", url: "https://www.data.gouv.fr/fr/datasets/repertoire-national-des-elus-1/" }} />
            )}
            <p className="tx-note">
              Ni étiquette politique, ni parcours : le Répertoire n'en contient pas, et Repère n'en invente pas.
            </p>
            {src ? <Source producteur={src.producteur} licence={src.licence} maj={src.maj}
              url="https://www.data.gouv.fr/fr/datasets/repertoire-national-des-elus-1/" /> : null}
          </Carte>

          <Carte echelon="france" titre="À l'Assemblée nationale" sousTitre="La circonscription de cette commune">
            {(() => { const p = phraseCirco(c.nom, c.circo); return <Vide titre={p.titre} corps={p.corps} />; })()}
            {index && index.sources && index.sources.circonscriptions ? (
              <Source producteur={index.sources.circonscriptions.producteur}
                licence={index.sources.circonscriptions.licence}
                maj={"découpage de " + index.sources.circonscriptions.decoupage} />
            ) : null}
          </Carte>
        </>
      ) : null}
    </div>
  );
}
