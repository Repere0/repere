import React, { useMemo } from "react";
import { Carte, Vide, Tuile, BarreEchelon, Source, Mot } from "@repere/ui";
import { Pile } from "@repere/ui/amicro";
import { valeur, rapports, population, dernierExercice } from "../lib/comptes.jsx";

/* `valeur`, `rapports`, `population`, `dernierExercice` VIVENT DANS
 * lib/comptes.jsx DEPUIS LE 18/09/2026 — voir ce fichier pour l'historique de
 * la garde zero/absence (15/09/2026, Mulcent 78439) et la raison du partage :
 * le prototype "Aujourd'hui" a besoin exactement des memes traductions, pour
 * le meme exercice de la meme commune. */

export default function OuVaArgent({ paquet, index, commune }) {
  const agregats = (index && index.agregats) || [];
  const src = index && index.sources ? index.sources.comptes : null;

  const c = commune ? paquet.communes[commune] : null;
  const exercice = useMemo(() => dernierExercice(c, agregats), [c, agregats]);

  if (!c) return null;

  const rr = exercice ? rapports(exercice.ex) : [];
  const maxAgregat = exercice
    ? Math.max(...agregats.map((_, i) => (valeur(exercice.ex, i) || {}).m || 0))
    : 0;

  if (!exercice) {
    /* DOCTRINE DU VIDE. Avant, les communes sans comptes disparaissaient
       simplement de la liste : le lecteur cherchait la sienne, ne la trouvait
       pas, et rien ne lui disait pourquoi. Une absence se dit. */
    return (
      <Vide titre={`${c.nom} : ses comptes ne figurent pas dans le fichier officiel.`}
        corps="Un montant absent n'est pas un montant nul : Repère n'affiche rien plutôt qu'un zéro qui pourrait être faux. Les très petites communes et celles qui viennent de fusionner manquent souvent à ce fichier."
        lien={{ texte: "Chercher cette commune dans les comptes publics", url: "https://data.ofgl.fr/" }} />
    );
  }

  return (
    <Pile>
      {/* Nom seul : « les comptes de X » demanderait une elision non derivable. */}
      <Carte echelon="ville" titre={c.nom}
        sousTitre={<>Les comptes de la commune · <Mot cle="exercice">exercice</Mot> {exercice.an}{population(exercice.ex) ? ` · ${population(exercice.ex).toLocaleString("fr-FR")} habitants` : ""} · budget principal</>}
        tag="Donnée officielle">
        <p className="tx-note tx-intro">
          Les six lignes ci-dessous sont publiées telles quelles par l'Observatoire des finances
          locales. Elles sont en euros, pour cette commune seule, sur une seule année.
        </p>
        {agregats.map((a, i) => {
          const v = valeur(exercice.ex, i);
          /* TROIS ETATS, TROIS PHRASES — voir le commentaire de valeur().
             L'absence dit qu'on ne sait pas ; le zero dit qu'il n'y a rien. Ce ne
             sont pas les memes nouvelles, et pour la dette la seconde est bonne. */
          if (!v) return (
            <div className="ligne" key={i}>
              <div className="ligne-h"><span>{a[1]}</span><b>—</b></div>
              <div className="ligne-note">Non renseigné pour l'exercice {exercice.an}. Le fichier ne porte pas cette ligne — ce n'est pas un montant nul.</div>
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

      {rr.length >= 2 ? (
        <Carte echelon="dept" titre="Ce que ces chiffres veulent dire"
          sousTitre={`Les mêmes comptes, exercice ${exercice.an}, rapportés les uns aux autres`}
          tag="Calcul Repère">
          <p className="tx-note tx-intro">
            Aucun de ces rapports n'est publié : Repère les calcule à partir des six montants
            ci-dessus, et explique sous chacun ce qu'il ne veut pas dire.
          </p>
          <div className="tuiles">
            {rr.map((o, i) => <Tuile key={i} k={o.l} v={o.v} n={o.d} />)}
          </div>
          <Source calcul producteur={src ? src.producteur : ""} licence={src ? src.licence : ""} maj={src ? src.maj : ""} />
        </Carte>
      ) : (
        <Vide titre="Pas assez de montants pour traduire ces comptes."
          corps={`Les rapports se calculent à partir de plusieurs lignes à la fois ; pour l'exercice ${exercice.an}, le fichier officiel n'en porte pas assez.`} />
      )}
    </Pile>
  );
}
