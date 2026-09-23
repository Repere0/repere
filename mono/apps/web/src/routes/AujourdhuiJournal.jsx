import React from "react";
import { Vide, Source, Chargement, dateFr } from "@repere/ui";
import { useAujourdhui } from "../lib/useAujourdhui.js";
import { LigneVote } from "../lib/votes.jsx";

/* DIRECTION A — « LE JOURNAL » (19/09/2026), NON RETENUE POUR LA VERSION
 * BRANCHEE — voir Aujourdhui.jsx (direction C, « la question ») pour celle
 * qui l'est, et la comparaison des trois dans le livrable de cette session.
 * Ce fichier reste intact, atteignable en changeant l'import dans App.jsx :
 * rien n'est supprime.
 *
 * L'HYPOTHESE TESTEE : remplacer la question « quel onglet ouvrir ? » par
 * une lecture verticale : Bonjour, puis ce qui s'est passe, sans classer les
 * faits par leur base de donnees d'origine. PAS DE CARTE : la chasse au
 * « look IA » de cette session a retire les boites (fond, bordure, coin
 * arrondi) qui ne portaient aucune hierarchie — un simple trait horizontal
 * separe les faits, comme dans une page qu'on lit plutot qu'un tableau de
 * bord qu'on consulte.
 *
 * CE QUI A FAIT PENCHER POUR LA DIRECTION C PLUTOT QUE CELLE-CI : « Bonjour »
 * est un ton, pas une raison d'ouvrir l'application. La direction C pose la
 * question que le citoyen se pose deja et y repond immediatement — un
 * accroche plus forte pour la meme quantite de contenu, mesuree a l'oeil sur
 * les deux captures. */

const DGCL_URL = "https://www.data.gouv.fr/datasets/projets-finances-par-les-dotations-"
  + "de-soutien-a-linvestissement-des-collectivites-territoriales";
function euros(n) { return new Intl.NumberFormat("fr-FR").format(n) + " €"; }

/* UN FAIT, PAS UNE CARTE. `echelon` ne colore qu'un trait vertical de 3px —
   le meme code couleur que le reste du produit, sans fond ni bordure. */
function Fait({ echelon, titre, enfants, source }) {
  return (
    <article className="jour-fait" style={{ "--e": `var(--e-${echelon})` }}>
      <h3>{titre}</h3>
      {enfants}
      {source}
    </article>
  );
}

export default function AujourdhuiJournal({ paquet, index, commune, aller }) {
  const a = useAujourdhui(paquet, index, commune);
  if (!a.fiche) return null;
  if (!a.pret) {
    return <Chargement titre="Ouverture d'aujourd'hui chez vous."
      corps="Les mêmes fichiers que les autres écrans, une seule fois." />;
  }
  const { nomCommune, dernierVote, dernierFait, rapportDette, srcComptes,
          srcProjets, srcScrutins, prochain, srcCal, base } = a;

  return (
    <div className="jour">
      <header className="auj-entete">
        <p className="eyebrow">Bonjour</p>
        <h2>Voici ce qui s'est passé à {nomCommune}</h2>
      </header>

      {/* LE FAIT LE PLUS RECENT — vote si disponible, sinon le dernier projet
          finance, sinon une phrase honnete. Doctrine du vide, meme ici. */}
      {dernierVote ? (
        <Fait echelon="france" titre="Votre député a voté"
          enfants={<LigneVote sc={dernierVote.sc} position={dernierVote.position} base={base} loi qui={dernierVote.qui} />}
          source={srcScrutins ? <Source producteur={srcScrutins.producteur} licence={srcScrutins.licence}
            mention={srcScrutins.releve_le ? "relevé le " + dateFr(srcScrutins.releve_le) : undefined} /> : null} />
      ) : dernierFait && dernierFait.type === "projet" ? (
        <Fait echelon="ville" titre={dernierFait.p.intitule}
          enfants={<p className="ligne-note">L'État a engagé {euros(dernierFait.p.subvention)}, exercice {dernierFait.p.annee}.</p>}
          source={srcProjets ? <Source producteur={srcProjets.producteur} licence={srcProjets.licence} maj={srcProjets.mis_a_jour_le} /> : null} />
      ) : (
        <Vide titre={`Aucune décision datée n'est publiée pour ${nomCommune}.`}
          corps="Ni projet financé par l'État, ni vote solennel du député sur la période relevée."
          lien={{ texte: "Projets financés par l'État — données publiques", url: DGCL_URL }} />
      )}

      {rapportDette ? (
        <Fait echelon="ville" titre={`Votre argent : ${rapportDette.v}`}
          enfants={<p className="ligne-note">{rapportDette.d}</p>}
          source={<Source calcul producteur={srcComptes ? srcComptes.producteur : ""}
            licence={srcComptes ? srcComptes.licence : ""} maj={srcComptes ? srcComptes.maj : ""} />} />
      ) : null}

      {prochain ? (
        <Fait echelon="france" titre={`Ce qui arrive : ${prochain.titre}`}
          enfants={<p className="ligne-note">
            {new Date(prochain.debut).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
            {prochain.lieu ? " · " + prochain.lieu : ""}
          </p>}
          source={<Source producteur={srcCal.producteur_affiche || srcCal.producteur} licence={srcCal.licence}
            mention={srcCal.releve_le ? "relevé le " + dateFr(srcCal.releve_le) : undefined} url={srcCal.url} />} />
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
