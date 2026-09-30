import React, { useEffect, useMemo, useState } from "react";
import { Carte, Vide, Tuile, BarreEchelon, Source, Chargement } from "@repere/ui";
import { Pile } from "@repere/ui/amicro";
import { valeur, rapports, population, dernierExercice, evolution } from "../lib/comptes.jsx";
import { chargerComptesRegions, ETATS } from "@repere/data-utils";
/* Les phrases de cet ecran vivent dans @repere/core (phrases.js) depuis le
   30/09/2026 : l'application mobile ecrit les memes, mot pour mot. */
import { introRapports, comptesAbsents, comptesInsuffisants, exercicesEcartes, phraseEcartes as phraseDesEcartes, comptesIncoherents,
  INTRO_EVOLUTION, NOTE_EVOLUTION, diffEuros, perimetreChange } from "@repere/core";

/* `valeur`, `rapports`, `population`, `dernierExercice` VIVENT DANS
 * lib/comptes.jsx DEPUIS LE 18/09/2026 — voir ce fichier pour l'historique de
 * la garde zero/absence (15/09/2026, Mulcent 78439) et la raison du partage :
 * le prototype "Aujourd'hui" a besoin exactement des memes traductions, pour
 * le meme exercice de la meme commune. */

/* COMPTES DEPARTEMENTAUX ET REGIONAUX — BLOCKER #2 DE LA MISSION DU
 * 22/09/2026. Meme composant que pour la commune, meme fonctions de
 * traduction (rapports/valeur/dernierExercice) : la seule difference est la
 * source des donnees et l'echelon affiche sur la pastille. Ne PAS dupliquer
 * la traduction ici — c'est exactement le piege que lib/comptes.jsx evite.
 * Le departement lit `paquet.comptes_departement` (deja telecharge avec le
 * reste du departement, zero requete de plus) ; la region seule vient d'un
 * petit fichier a part (voir chargerComptesRegions ci-dessous) — mesure qui a
 * fait deplacer les comptes departementaux hors de ce fichier le jour meme
 * (voir extract-html.js pour le detail des deux versions mesurees). */
const euros = n => Math.round(n).toLocaleString("fr-FR") + " €";

/* D'UN EXERCICE A L'AUTRE — voir evolution() dans lib/comptes.jsx. */
function Evolution({ e, nom, src }) {
  if (e.perimetreChange) {
    return <Vide {...perimetreChange(e, nom)} />;
  }
  return (
    <Carte echelon="ville" titre="D'une année à l'autre"
      sousTitre={<>comptes {e.an1} → comptes {e.an2} · budget principal</>}
      tag="Calcul Repère">
      <p className="tx-note tx-intro">{INTRO_EVOLUTION}</p>
      {e.lignes.map((l, i) => (
        <div className="ligne evolution" key={i}>
          <div className="ligne-h"><span>{l.libelle}</span>
            <b>{diffEuros(l.diff)}</b>
          </div>
          <div className="ligne-note">
            {l.diff === null
              ? `Non comparable : le fichier ne porte pas cette ligne pour ${l.m1 === null ? e.an1 : e.an2}.`
              : `${e.an1} : ${euros(l.m1)} · ${e.an2} : ${euros(l.m2)}`}
          </div>
        </div>
      ))}
      <p className="tx-note">{NOTE_EVOLUTION}</p>
      <Source calcul producteur={src ? src.producteur : ""} licence={src ? src.licence : ""} maj={src ? src.maj : ""} url={src ? src.url : undefined} />
    </Carte>
  );
}

function CompteTerritoire({ titre, echelon, exerciceAn, ex, agregats, src }) {
  const rr = rapports(ex);
  const maxAgregat = Math.max(...agregats.map((_, i) => (valeur(ex, i) || {}).m || 0));
  return (
    <Carte echelon={echelon} titre={titre}
      sousTitre={<>Ce que ça représente · comptes {exerciceAn}{population(ex) ? ` · ${population(ex).toLocaleString("fr-FR")} habitants` : ""}</>}
      tag={rr.length ? "Calcul Repère" : undefined}>
      {rr.length >= 2 ? (
        <>
          <div className="tuiles">{rr.map((o, i) => <Tuile key={i} k={o.l} v={o.v} n={o.d} />)}</div>
          <Source calcul producteur={src ? src.producteur : ""} licence={src ? src.licence : ""} maj={src ? src.maj : ""} url={src ? src.url : undefined} />
        </>
      ) : (
        <Vide titre={`Pas assez de montants publiés pour traduire les comptes de ce territoire (exercice ${exerciceAn}).`}
          corps="Repère ne calcule un rapport qu'à partir d'au moins deux montants publiés." />
      )}
    </Carte>
  );
}

export default function OuVaArgent({ paquet, index, commune }) {
  const agregats = (index && index.agregats) || [];
  const src = index && index.sources ? index.sources.comptes : null;

  const c = commune ? paquet.communes[commune] : null;
  const exercice = useMemo(() => dernierExercice(c, agregats), [c, agregats]);
  const evo = useMemo(() => evolution(c, agregats), [c, agregats]);

  /* Le departement est deja dans le paquet en cours (aucune requete de plus) ;
     seule la region vient d'un petit fichier a part, commun a la France
     entiere, charge une fois quel que soit le nombre de communes visitees
     ensuite. */
  const [etatTerr, setEtatTerr] = useState(ETATS.EN_COURS);
  const [regions, setRegions] = useState(null);
  useEffect(() => {
    let vivant = true;
    chargerComptesRegions().then(r => { if (vivant) { setEtatTerr(r.etat); setRegions(r.donnees); } });
    return () => { vivant = false; };
  }, []);

  const territoireDept = index && paquet ? index.departements.find(d => d.code === paquet.d) : null;
  const exerciceDept = useMemo(() => {
    if (!paquet || !paquet.comptes_departement) return null;
    return dernierExercice({ comptes: paquet.comptes_departement }, agregats);
  }, [paquet, agregats]);
  const exerciceRegion = useMemo(() => {
    if (!regions || !regions.regions || !territoireDept || !territoireDept.region_code) return null;
    const ex = regions.regions[territoireDept.region_code];
    return ex ? dernierExercice({ comptes: ex }, agregats) : null;
  }, [regions, territoireDept, agregats]);

  if (!c) return null;

  const rr = exercice ? rapports(exercice.ex) : [];
  const maxAgregat = exercice
    ? Math.max(...agregats.map((_, i) => (valeur(exercice.ex, i) || {}).m || 0))
    : 0;

  /* EXERCICES ECARTES PAR LA REGLE V-2 (29/09/2026, voir extract-html.js) : le
     fichier les porte, mais leurs montants ne correspondent pas a la population
     publiee sur la meme ligne. C'est une autre cause d'absence que « le fichier
     ne porte pas cette commune » : elle a donc sa propre phrase. */
  const ecartes = exercicesEcartes(c, exercice);
  const phraseEcartes = phraseDesEcartes(ecartes, c ? c.nom : null);

  if (!exercice && phraseEcartes) {
    return (
      <Vide {...comptesIncoherents(c.nom, phraseEcartes)} />
    );
  }

  if (!exercice) {
    /* DOCTRINE DU VIDE. Avant, les communes sans comptes disparaissaient
       simplement de la liste : le lecteur cherchait la sienne, ne la trouvait
       pas, et rien ne lui disait pourquoi. Une absence se dit. */
    return (
      <Vide {...comptesAbsents(c.nom)} />
    );
  }

  /* ORDRE INVERSE DEPUIS LE 19/09/2026 (phase 8 de la mission « conception
     produit ») : la traduction passe AVANT les six montants bruts. Mesure sur
     capture reelle qui a motive le changement : un lecteur qui ouvre cet
     ecran faisait defiler les six lignes source — DONNEE OFFICIELLE, sans
     hierarchie entre elles — avant d'atteindre « 16,0 mois de recettes », la
     seule phrase qui repond a « et donc ? ». La preuve doit soutenir la
     comprehension, pas la precede. Aucune phrase de doctrine n'a change : le
     zero-vs-absence, le refus de comparer deux communes, la distinction
     calcul/donnee publiee sont exactement les memes qu'avant, seul l'ordre
     de lecture change. */
  return (
    <Pile>
      {rr.length >= 2 ? (
        <Carte echelon="ville" titre={c.nom}
          sousTitre={<>Ce que ça représente · comptes {exercice.an}{population(exercice.ex) ? ` · ${population(exercice.ex).toLocaleString("fr-FR")} habitants` : ""}</>}
          tag="Calcul Repère">
          <p className="tx-note tx-intro">{introRapports({ detailPlusBas: true })}</p>
          <div className="tuiles">
            {rr.map((o, i) => <Tuile key={i} k={o.l} v={o.v} n={o.d} />)}
          </div>
          <Source calcul producteur={src ? src.producteur : ""} licence={src ? src.licence : ""} maj={src ? src.maj : ""} url={src ? src.url : undefined} />
        </Carte>
      ) : (
        <Vide {...comptesInsuffisants(exercice.an)} />
      )}

      {evo ? <Evolution e={evo} nom={c.nom} src={src} /> : null}

      {/* Nom seul : « les comptes de X » demanderait une elision non derivable. */}
      <Carte echelon="dept" titre={rr.length >= 2 ? "Le détail publié" : c.nom}
        sousTitre={<>Les comptes de la commune · comptes {exercice.an}{population(exercice.ex) ? ` · ${population(exercice.ex).toLocaleString("fr-FR")} habitants` : ""} · budget principal</>}
        tag="Donnée officielle">
        <p className="tx-note tx-intro">
          Les six lignes ci-dessous sont publiées telles quelles par l'Observatoire des finances
          locales. Elles sont en euros, pour cette commune seule, sur une seule année.
        </p>
        {phraseEcartes ? <p className="tx-note">{phraseEcartes}</p> : null}
        {agregats.map((a, i) => {
          const v = valeur(exercice.ex, i);
          /* TROIS ETATS, TROIS PHRASES — voir le commentaire de valeur().
             L'absence dit qu'on ne sait pas ; le zero dit qu'il n'y a rien. Ce ne
             sont pas les memes nouvelles, et pour la dette la seconde est bonne. */
          if (!v) return (
            <div className="ligne" key={i}>
              <div className="ligne-h"><span>{a[1]}</span><b>—</b></div>
              <div className="ligne-note">Non renseigné dans les comptes {exercice.an}. Le fichier ne porte pas cette ligne — ce n'est pas un montant nul.</div>
            </div>
          );
          if (v.zero) return (
            <div className="ligne" key={i}>
              <div className="ligne-h"><span>{a[1]}</span><b>0 €</b></div>
              <div className="ligne-note">
                {i === 2
                  ? `L'Observatoire publie un encours de dette nul pour l'exercice ${exercice.an} : cette commune ne doit rien.`
                  : `L'Observatoire publie un montant nul pour l'exercice ${exercice.an}. Ce n'est pas une donnée manquante : la source écrit zéro.`}
              </div>
            </div>
          );
          return <BarreEchelon key={i} libelle={a[1]} valeur={v.m} maximum={maxAgregat} echelon="ville" />;
        })}
        <p className="tx-note">
          La longueur des barres compare ces six montants entre eux, pour cette commune uniquement.
          Repère ne compare jamais deux communes.
        </p>
        {src ? <Source producteur={src.producteur} licence={src.licence} maj={src.maj} url="https://data.ofgl.fr/" /> : null}
      </Carte>

      {/* COMPTES DU DEPARTEMENT — BLOCKER #2 DE LA MISSION DU 22/09/2026.
       * L'ancien site les affichait (chips ville/departement/region), mono/
       * ne le pouvait pas avant l'extraction. Aucun etat de chargement ici :
       * `paquet.comptes_departement` est deja arrive avec le reste du
       * departement, avant meme l'ouverture de cet ecran. */}
      {territoireDept ? (
        exerciceDept ? (
          <CompteTerritoire titre={territoireDept.nom || `Département ${territoireDept.code}`}
            echelon="dept" exerciceAn={exerciceDept.an} ex={exerciceDept.ex} agregats={agregats} src={src} />
        ) : (
          <Vide titre={`${territoireDept.nom || "Ce département"} : ses comptes ne figurent pas dans le fichier officiel.`}
            corps="Un montant absent n'est pas un montant nul : Repère n'affiche rien plutôt qu'un zéro qui pourrait être faux." />
        )
      ) : null}

      {/* COMPTES DE LA REGION — seul echelon qui demande encore une requete
          (voir client.js) : une region couvre plusieurs departements, ses
          comptes ne peuvent pas vivre dans un seul paquet departemental. */}
      {etatTerr === ETATS.EN_COURS ? (
        <Chargement titre="Chargement des comptes de la région."
          corps="Un seul petit fichier pour toute la France, une seule fois." />
      ) : null}
      {etatTerr !== ETATS.SERVI && etatTerr !== ETATS.EN_COURS ? (
        <Vide titre="Les comptes de la région n'ont pas pu être obtenus."
          corps="Ceux de votre commune et de votre département, ci-dessus, restent complets." />
      ) : null}
      {etatTerr === ETATS.SERVI && territoireDept && territoireDept.region_code ? (
        exerciceRegion ? (
          <CompteTerritoire titre={territoireDept.region || `Région ${territoireDept.region_code}`}
            echelon="region" exerciceAn={exerciceRegion.an} ex={exerciceRegion.ex} agregats={agregats} src={src} />
        ) : (
          <Vide titre={`${territoireDept.region || "Cette région"} : ses comptes ne figurent pas dans le fichier officiel.`}
            corps="Un montant absent n'est pas un montant nul : Repère n'affiche rien plutôt qu'un zéro qui pourrait être faux." />
        )
      ) : null}
      {/* MAYOTTE, ET ELLE SEULE : L'ABSENCE EST DE LA SOURCE, PAS DE MONO/.
          window.REPERE_OFGL.ech.region ne porte aucune ligne pour Mayotte
          (verifie le 22/09/2026, voir extract-html.js) — le departement 976
          n'a donc jamais de region_code, et la doctrine du vide l'exige dit
          ici plutot que de se taire. Hors du perimetre IDF de la beta : ce
          cas ne peut se produire que si mono/ publie un jour au-dela des huit
          departements d'Ile-de-France. */}
      {etatTerr === ETATS.SERVI && territoireDept && !territoireDept.region_code ? (
        <Vide titre="Aucune donnée régionale n'est publiée pour ce département."
          corps="L'Observatoire des finances locales ne porte pas de ligne « région » pour ce territoire dans le fichier source — ce n'est pas un manque de Repère." />
      ) : null}
    </Pile>
  );
}
