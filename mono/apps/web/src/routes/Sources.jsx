import React from "react";
import { Carte, Source, Tuile, dateFr } from "@repere/ui";
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
          licence={s.circonscriptions.licence} mention={"découpage de " + s.circonscriptions.decoupage} /> : null}
        {/* Le decoupage dit dans quelle circonscription vote une commune ; le
            fichier des mandats dit qui y siege. Deux producteurs, deux lignes :
            les confondre laisserait croire que le ministere publie le nom des
            deputes, ce qu'il ne fait pas. */}
        {s.deputes ? <Source producteur={"Députés — " + s.deputes.producteur}
          licence={s.deputes.licence}
          mention={s.deputes.legislature
            ? s.deputes.legislature + "e législature, relevé le " + dateFr(s.deputes.releve_le)
            : undefined}
          url={s.deputes.url} /> : null}
        {/* Les noms des territoires ne viennent pas du meme fichier que le reste :
            ils ont leurs propres producteurs, et ils le disent. */}
        {Array.isArray(s.territoires) ? s.territoires.map((t, i) => (
          <Source key={i} producteur={"Noms des territoires — " + t.producteur}
            licence={t.licence} mention={t.portee} url={t.url} />
        )) : null}
        {/* Le nom d'une commune est une donnee comme une autre, avec son propre
            producteur : il vient du Code officiel geographique, pas du Repertoire
            national des elus, qui l'ecrit en capitales. */}
        {s.communes ? <Source producteur={"Noms des communes — " + s.communes.producteur}
          licence={s.communes.licence}
          mention={s.communes.releve_le ? "relevé le " + dateFr(s.communes.releve_le) : s.communes.portee}
          url={s.communes.url} /> : null}
        {/* LES SCRUTINS MANQUAIENT A CET ECRAN, et le defaut a ete vu a l'oeil sur
            capture, pas par une assertion : l'application affichait la position de
            vote d'un depute alors que la page qui recense les sources n'en
            nommait pas le producteur. Le controle plus bas echoue desormais si une
            source declaree dans index.json n'apparait pas ici. */}
        {s.scrutins ? <Source producteur={"Scrutins — " + s.scrutins.producteur}
          licence={s.scrutins.licence}
          mention={s.scrutins.legislature
            ? s.scrutins.legislature + "e législature, relevé le " + dateFr(s.scrutins.releve_le)
            : undefined}
          url={s.scrutins.url} /> : null}
        <div className="tuiles">
          <Tuile k="Département ouvert" v={paquet.d} echelon="dept" />
          <Tuile k="Communes dans ce fichier" v={Object.keys(paquet.communes).length.toLocaleString("fr-FR")} />
          <Tuile k="Départements publiés" v={(index ? index.departements.length : 0).toString()} />
        </div>
        {/* La date des SOURCES et celle des FICHIERS ne sont pas la meme chose :
            l'une dit quand le ministere a publie, l'autre quand Repere a decoupe
            ce qu'il avait publie. Les confondre laisserait croire a une donnee
            plus fraiche qu'elle ne l'est. */}
        {index && index.genere_le ? (
          <p className="tx-note">
            Repère a découpé ces fichiers le {dateFr(index.genere_le)}. Cette date est
            celle du découpage, pas celle des chiffres : chaque source porte la sienne
            ci-dessus.
          </p>
        ) : null}
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
