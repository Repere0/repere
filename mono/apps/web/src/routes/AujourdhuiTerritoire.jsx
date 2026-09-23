import React from "react";
import { Vide, Source, Chargement, dateFr } from "@repere/ui";
import { useAujourdhui } from "../lib/useAujourdhui.js";
import { LigneVote } from "../lib/votes.jsx";
import { COMPETENCES } from "../lib/competences.js";

/* DIRECTION B — « LE TERRITOIRE » (19/09/2026), NON RETENUE — voir
 * Aujourdhui.jsx (direction C, « la question ») pour celle qui l'est, et
 * AujourdhuiJournal.jsx (direction A, « le journal ») pour la troisième.
 * Non branchée par défaut ; App.jsx pour comment basculer temporairement
 * l'une ou l'autre dans l'onglet "aujourdhui" pour capture d'écran. Rien
 * n'est supprimé : les trois fichiers restent dans le dépôt.
 *
 * POURQUOI ELLE N'EST PAS RETENUE, MESURE SUR CAPTURE : trois de ses cinq
 * sections (intercommunalité, département, région) disent la même phrase
 * — « Repère ne publie pas encore les données de cet échelon » — coup sur
 * coup. Ça allonge l'écran de plusieurs centaines de pixels sans rien
 * apprendre au lecteur, l'inverse de « deux minutes par jour ». L'hypothèse
 * territoriale reste valable : elle attend juste d'avoir des données à ces
 * échelons pour ne plus répéter la même absence trois fois.
 *
 * L'HYPOTHESE TESTEE : partir des ECHELONS plutôt que des FAITS — « voici
 * les niveaux qui décident chez vous, et ce qui s'y passe » plutôt que « voici
 * ce qui s'est passé, peu importe qui l'a décidé ». Les phrases de compétence
 * sont les MÊMES que QuiDecide.jsx (lib/competences.js) : aucune reformulation
 * qui pourrait diverger. */

function Echelon({ echelon, nom, corps, enfants }) {
  return (
    <section className="terr-echelon" style={{ "--e": `var(--e-${echelon})` }}>
      <div className="terr-h">
        <span className="pastille" style={{ background: `var(--e-${echelon})` }} aria-hidden="true" />
        <b>{nom}</b>
      </div>
      <p className="ligne-note">{corps.charAt(0).toUpperCase() + corps.slice(1)}.</p>
      {enfants}
    </section>
  );
}

export default function AujourdhuiTerritoire({ paquet, index, commune, aller }) {
  const a = useAujourdhui(paquet, index, commune);
  if (!a.fiche) return null;
  if (!a.pret) {
    return <Chargement titre="Ouverture du territoire." corps="Les mêmes fichiers que les autres écrans, une seule fois." />;
  }
  const { nomCommune, fiche, dernierVote, dernierFait, rapportDette, srcComptes,
          srcProjets, srcScrutins, prochain, srcCal, base } = a;

  return (
    <div className="terr">
      <header className="auj-entete">
        <p className="eyebrow">Votre territoire</p>
        <h2>{nomCommune}</h2>
      </header>

      <Echelon echelon="ville" nom="Votre commune" corps={COMPETENCES.ville}
        enfants={
          <>
            {fiche.maire ? (
              <p className="ligne-note"><b>{fiche.maire.nom}</b>, {fiche.maire.fonction.toLowerCase()}.</p>
            ) : null}
            {dernierFait && dernierFait.type === "projet" ? (
              <>
                <p className="ligne-note"><b>{dernierFait.p.intitule}</b></p>
                {srcProjets ? <Source producteur={srcProjets.producteur} licence={srcProjets.licence} maj={srcProjets.mis_a_jour_le} /> : null}
              </>
            ) : null}
            {rapportDette ? (
              <>
                <p className="ligne-note">{rapportDette.l} : <b>{rapportDette.v}</b>.</p>
                <Source calcul producteur={srcComptes ? srcComptes.producteur : ""} licence={srcComptes ? srcComptes.licence : ""} maj={srcComptes ? srcComptes.maj : ""} />
              </>
            ) : null}
          </>
        } />

      <Echelon echelon="agglo" nom="Votre intercommunalité" corps={COMPETENCES.agglo}
        enfants={<p className="ligne-note">Repère ne publie pas encore les données de cet échelon.</p>} />

      <Echelon echelon="dept" nom="Votre département" corps={COMPETENCES.dept}
        enfants={<p className="ligne-note">Repère ne publie pas encore les données de cet échelon.</p>} />

      <Echelon echelon="region" nom="Votre région" corps={COMPETENCES.region}
        enfants={<p className="ligne-note">Repère ne publie pas encore les données de cet échelon.</p>} />

      <Echelon echelon="france" nom="La Nation" corps={COMPETENCES.france}
        enfants={
          <>
            {dernierVote ? (
              <>
                <LigneVote sc={dernierVote.sc} position={dernierVote.position} base={base} loi qui={dernierVote.qui} />
                {srcScrutins ? <Source producteur={srcScrutins.producteur} licence={srcScrutins.licence}
                  mention={srcScrutins.releve_le ? "relevé le " + dateFr(srcScrutins.releve_le) : undefined} /> : null}
              </>
            ) : (
              <p className="ligne-note">Aucun vote solennel de votre député sur la période relevée.</p>
            )}
            {prochain ? (
              <>
                <p className="ligne-note">À venir : <b>{prochain.titre}</b>, {new Date(prochain.debut).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}.</p>
                <Source producteur={srcCal.producteur_affiche || srcCal.producteur} licence={srcCal.licence} url={srcCal.url} />
              </>
            ) : null}
          </>
        } />

      <nav className="auj-suite" aria-label="Approfondir">
        <button type="button" onClick={() => aller("decide")}>Toutes les décisions</button>
        <button type="button" onClick={() => aller("argent")}>Où va l'argent</button>
      </nav>
    </div>
  );
}
