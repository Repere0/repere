import React from "react";
import { Vide, Source, Chargement, dateFr } from "@repere/ui";
import { useAujourdhui } from "../lib/useAujourdhui.js";
import { LigneVote } from "../lib/votes.jsx";

/* « AUJOURD'HUI », DIRECTION RETENUE LE 19/09/2026 — « LA QUESTION ».
 *
 * Trois directions ont ete construites et captees en navigateur reel sur
 * Bagnolet avant de choisir : celle-ci, AujourdhuiJournal.jsx (« le journal »,
 * un simple « Bonjour »), et AujourdhuiTerritoire.jsx (« le territoire »,
 * organise par echelon — trois de ses cinq sections disent « pas encore
 * publie », ce qui allonge l'ecran sans rien apprendre). Les deux autres
 * fichiers restent intacts dans le depot : rien n'est supprime, voir le
 * livrable de cette session pour la comparaison.
 *
 * POURQUOI CELLE-CI. La question posee est celle qu'un citoyen qui ne suit
 * pas la politique se pose deja ("qu'est-ce qui a change chez moi ?"), et la
 * reponse arrive immediatement — sans salutation, sans decor. C'est le
 * format le plus proche d'une conversation plutot que d'une navigation dans
 * une base de donnees, sur la meme quantite de contenu que les deux autres.
 *
 * TOUJOURS UN PROTOTYPE, PAS UN SIXIEME ONGLET : atteint par un lien "Voir
 * aujourd'hui a [commune]" (App.jsx), jamais un bouton de plus dans la barre
 * — un essai anterieur avec un sixieme bouton avait reproduit la regression
 * a 3 lignes deja mesuree et corrigee. AUCUNE DONNEE NOUVELLE : chaque fait
 * vient de lib/useAujourdhui.js, qui appelle les memes chargeurs et les
 * memes fonctions (lib/faits.js, lib/comptes.jsx) que les ecrans complets. */

const DGCL_URL = "https://www.data.gouv.fr/datasets/projets-finances-par-les-dotations-"
  + "de-soutien-a-linvestissement-des-collectivites-territoriales";
function euros(n) { return new Intl.NumberFormat("fr-FR").format(n) + " €"; }

export default function Aujourdhui({ paquet, index, commune, aller }) {
  const a = useAujourdhui(paquet, index, commune);
  if (!a.fiche) return null;
  if (!a.pret) {
    return <Chargement titre="Ouverture de la question du jour."
      corps="Les mêmes fichiers que les autres écrans, une seule fois." />;
  }
  const { nomCommune, dernierVote, dernierFait, rapportDette, srcComptes,
          srcProjets, srcScrutins, prochain, srcCal, base } = a;

  return (
    <div className="quest">
      <p className="quest-lieu">{nomCommune}</p>
      <h1 className="quest-q">Que s'est-il décidé près de chez vous ?</h1>

      {/* LA REPONSE — vote si disponible, sinon le dernier projet finance,
          sinon une phrase honnete. Doctrine du vide, meme ici. */}
      {dernierVote ? (
        <div className="quest-r">
          <LigneVote sc={dernierVote.sc} position={dernierVote.position} base={base} loi qui={dernierVote.qui} />
          {srcScrutins ? <Source producteur={srcScrutins.producteur} licence={srcScrutins.licence}
            mention={srcScrutins.releve_le ? "relevé le " + dateFr(srcScrutins.releve_le) : undefined} /> : null}
        </div>
      ) : dernierFait && dernierFait.type === "projet" ? (
        <div className="quest-r">
          <p><b>{dernierFait.p.intitule}</b></p>
          <p className="ligne-note">L'État a engagé {euros(dernierFait.p.subvention)}, exercice {dernierFait.p.annee}.</p>
          {srcProjets ? <Source producteur={srcProjets.producteur} licence={srcProjets.licence} maj={srcProjets.mis_a_jour_le} /> : null}
        </div>
      ) : dernierFait && dernierFait.type === "editorial" ? (
        /* FAIT REDACTIONNEL — BLOCKER #3, MISSION DU 22/09/2026. Chaque fait
           porte sa propre source officielle (e.src/e.srcn) ; la mention
           supplementaire dit qui a relu et valide le texte, pour ne jamais
           laisser croire a une detection automatique. */
        <div className="quest-r">
          <p><b>{dernierFait.e.t}</b></p>
          <Source producteur={dernierFait.e.srcn || "Rédaction Repère"} url={dernierFait.e.src}
            mention={dernierFait.e.conf === "verifie" ? "relu et validé par la rédaction" : "relevé, en attente de confirmation"} />
        </div>
      ) : (
        <Vide titre={`Aucune décision datée n'est publiée pour ${nomCommune}.`}
          corps="Ni projet financé par l'État, ni vote solennel du député sur la période relevée."
          lien={{ texte: "Projets financés par l'État — données publiques", url: DGCL_URL }} />
      )}

      {/* LES QUESTIONS SUIVANTES SONT PLUS DISCRETES — meme structure que la
          premiere aurait repete trois fois le meme motif (chasse au
          « look IA », phase 3 de la mission du 19/09). */}
      {rapportDette ? (
        <div className="quest-suivante">
          <p className="quest-q2">Combien ça représente ?</p>
          <p className="ligne-note">{rapportDette.l} : <b>{rapportDette.v}</b>. {rapportDette.d}</p>
          <Source calcul producteur={srcComptes ? srcComptes.producteur : ""} licence={srcComptes ? srcComptes.licence : ""} maj={srcComptes ? srcComptes.maj : ""} />
        </div>
      ) : null}

      {prochain ? (
        <div className="quest-suivante">
          <p className="quest-q2">Qu'est-ce qui arrive ?</p>
          <p className="ligne-note"><b>{prochain.titre}</b>, {new Date(prochain.debut).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}.</p>
          <Source producteur={srcCal.producteur_affiche || srcCal.producteur} licence={srcCal.licence} url={srcCal.url} />
        </div>
      ) : null}

      <nav className="auj-suite" aria-label="Approfondir">
        <button type="button" onClick={() => aller("decide")}>Toutes les décisions</button>
        <button type="button" onClick={() => aller("qui")}>Qui décide</button>
        <button type="button" onClick={() => aller("argent")}>Où va l'argent</button>
        <button type="button" onClick={() => aller("calendrier")}>Le calendrier</button>
      </nav>
    </div>
  );
}
