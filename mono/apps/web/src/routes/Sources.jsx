import React from "react";
import { Carte, Source, Tuile } from "@repere/ui";
import { INVARIANTS, PROMESSES } from "@repere/data-utils/invariants";

/* Cet écran n'est pas décoratif : il rend le produit vérifiable par son lecteur.
   Il dit d'où vient chaque chiffre, sous quelle licence, et ce que Repère
   s'interdit — y compris ce qu'il s'interdit de faire de vous. */
export default function Sources({ index, paquet }) {
  const s = (index && index.sources) || {};
  return (
    <div className="pile">
      <Carte echelon="france" titre="D'où viennent ces chiffres" sousTitre="Toutes les sources sont publiques et ouvertes">
        {s.elus ? <Source producteur={"Élus — " + s.elus.producteur} licence={s.elus.licence} maj={s.elus.maj}
          url="https://www.data.gouv.fr/fr/datasets/repertoire-national-des-elus-1/" /> : null}
        {s.comptes ? <Source producteur={"Comptes — " + s.comptes.producteur} licence={s.comptes.licence} maj={s.comptes.maj}
          url="https://data.ofgl.fr/" /> : null}
        {s.circonscriptions ? <Source producteur={"Circonscriptions — " + s.circonscriptions.producteur}
          licence={s.circonscriptions.licence} maj={"découpage de " + s.circonscriptions.decoupage} /> : null}
        <div className="tuiles">
          <Tuile k="Département ouvert" v={paquet.d} echelon="dept" />
          <Tuile k="Communes dans ce fichier" v={Object.keys(paquet.communes).length.toLocaleString("fr-FR")} />
          <Tuile k="Départements publiés" v={(index ? index.departements.length : 0).toString()} />
        </div>
      </Carte>

      <Carte echelon="region" titre="Ce que Repère s'interdit" sousTitre="Huit règles, et le contrôle qui garde chacune">
        <ol className="invariants">
          {INVARIANTS.map(i => (
            <li key={i.n}>
              <b>{i.regle}</b>
              <span className="ligne-note">Gardé par : {i.garde}</span>
            </li>
          ))}
        </ol>
        {PROMESSES.map((t, i) => <p className="tx-note" key={i}>{t}</p>)}
      </Carte>
    </div>
  );
}
