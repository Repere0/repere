import React, { useEffect, useState } from "react";
import { Carte, Vide, Source, Chargement, dateFr } from "@repere/ui";
import { Pile } from "@repere/ui/amicro";
import {
  chargerProjets, chargerDeputes, chargerCatalogueScrutins, chargerVotes,
  chargerCalendrierSenat, ETATS,
} from "@repere/data-utils";
import { LigneVote } from "../lib/votes.jsx";
import { calculerFaits } from "../lib/faits.js";
import { rapports, dernierExercice } from "../lib/comptes.jsx";

/* PROTOTYPE, PAS UN SIXIEME ONGLET — pose le 18/09/2026 pour eprouver
 * l'hypothese que Repere est UNE experience territoriale a plusieurs
 * profondeurs, pas cinq bases de donnees cote a cote (mission du porteur du
 * projet, meme date). AUCUNE DONNEE NOUVELLE : chaque fait ci-dessous est
 * calcule par la MEME fonction que l'onglet complet qui le porte
 * (lib/faits.js, lib/comptes.jsx) — jamais un second calcul qui pourrait
 * diverger. Reversible en un fichier + une ligne dans App.jsx (ONGLETS et le
 * useState initial).
 *
 * CE QUE CET ECRAN NE FAIT PAS : il n'invente aucun evenement, ne transforme
 * aucune donnee nationale (le calendrier Senat) en donnee locale, et dit une
 * phrase honnete plutot qu'une carte vide quand un fait manque. */

const DGCL_URL = "https://www.data.gouv.fr/datasets/projets-finances-par-les-dotations-"
  + "de-soutien-a-linvestissement-des-collectivites-territoriales";
const AN_VOTES_URL = "https://data.assemblee-nationale.fr/travaux-parlementaires/votes";

function euros(n) { return new Intl.NumberFormat("fr-FR").format(n) + " €"; }

/* LES DEUX VARIANTES DU FAIT D'OUVERTURE (phase 4 de la mission).
 * A : le vote reel et personnalise du depute. B : la traduction financiere.
 * Aucune n'est supprimee — VARIANTE choisit laquelle s'affiche, pour pouvoir
 * capturer les deux dans le meme navigateur reel plutot que de trancher sur
 * une theorie. Voir le livrable pour la comparaison mesuree. */
const VARIANTE = "A";

function HeroVote({ fait, nomCommune }) {
  return (
    <Carte echelon="france" titre="Ce que votre député a réellement voté"
      sousTitre={`À l'Assemblée nationale, au nom de ${nomCommune}`} tag="Donnée officielle">
      <LigneVote sc={fait.sc} position={fait.position} base={fait.base} loi qui={fait.qui} />
    </Carte>
  );
}

function HeroArgent({ rapport, nomCommune, exercice, src }) {
  return (
    <Carte echelon="ville" titre="Ce que ça représente concrètement"
      sousTitre={`Les comptes de ${nomCommune}, exercice ${exercice}`} tag="Calcul Repère">
      <div className="ligne">
        <div className="ligne-h"><span>{rapport.l}</span><b>{rapport.v}</b></div>
        <div className="ligne-note">{rapport.d}</div>
      </div>
      <Source calcul producteur={src ? src.producteur : ""} licence={src ? src.licence : ""} maj={src ? src.maj : ""} />
    </Carte>
  );
}

export default function Aujourdhui({ paquet, index, commune, aller }) {
  const [etat, setEtat] = useState(ETATS.EN_COURS);
  const [projets, setProjets] = useState(null);
  const [cat, setCat] = useState(null);
  const [pos, setPos] = useState(null);
  const [deputes, setDeputes] = useState(null);
  const [cal, setCal] = useState(null);

  const dep = paquet && paquet.d;
  const fiche = commune && paquet && paquet.communes ? paquet.communes[commune] : null;

  useEffect(() => {
    if (!dep || !commune) return undefined;
    let vivant = true;
    setEtat(ETATS.EN_COURS);
    /* MEMES CINQ FICHIERS QUE "Ce qui a ete decide" + "Ou va l'argent" + le
       calendrier — tous deja en cache des la deuxieme visite d'un onglet
       classique. Ce prototype n'ajoute AUCUN telechargement nouveau. */
    Promise.all([
      chargerProjets(dep), chargerDeputes(), chargerCatalogueScrutins(),
      chargerVotes(dep), chargerCalendrierSenat(),
    ]).then(([pr, de, c, v, ca]) => {
      if (!vivant) return;
      setProjets(pr.donnees); setDeputes(de.donnees); setCat(c.donnees);
      setPos(v.donnees); setCal(ca.donnees);
      setEtat(ETATS.SERVI);
    });
    return () => { vivant = false; };
  }, [dep, commune]);

  if (!fiche) return null;
  if (etat === ETATS.EN_COURS) {
    return <Chargement titre="Ouverture d'aujourd'hui chez vous."
      corps="Les mêmes fichiers que les autres écrans, une seule fois." />;
  }

  const nomCommune = fiche.nom || "";
  const faits = calculerFaits({ dep, fiche, projets, commune, cat, pos, deputes });
  const base = (cat && cat.url_scrutin) || "";
  const dernierVote = faits.find(f => f.type === "vote" && f.position);
  const dernierFait = faits[0];

  const agregats = (index && index.agregats) || [];
  const srcComptes = index && index.sources ? index.sources.comptes : null;
  const exercice = dernierExercice(fiche, agregats);
  const rr = exercice ? rapports(exercice.ex) : [];
  const rapportDette = rr[0];

  const aVenir = cal && Array.isArray(cal.evenements)
    ? cal.evenements.filter(e => e.debut + ":00" >= new Date().toISOString().slice(0, 16))
    : [];
  const prochain = aVenir[0];
  const srcCal = (cal && cal.source) || {};

  return (
    <Pile>
      <header className="auj-entete">
        <p className="eyebrow">Aujourd'hui</p>
        <h2>{nomCommune}</h2>
      </header>

      {/* LE FAIT D'OUVERTURE — voir VARIANTE ci-dessus. Aucune des deux cartes
          n'est affichee si la donnee qu'elle demande n'existe pas : la
          doctrine du vide s'applique aussi au prototype. */}
      {VARIANTE === "A" && dernierVote ? (
        <HeroVote fait={{ ...dernierVote, base }} nomCommune={nomCommune} />
      ) : VARIANTE === "B" && rapportDette ? (
        <HeroArgent rapport={rapportDette} nomCommune={nomCommune} exercice={exercice.an} src={srcComptes} />
      ) : dernierFait ? (
        <Carte echelon={dernierFait.echelon} titre="Ce qui a été décidé le plus récemment"
          sousTitre={nomCommune} tag="Donnée officielle">
          {dernierFait.type === "vote"
            ? <LigneVote sc={dernierFait.sc} position={dernierFait.position} base={base} loi qui={dernierFait.qui} />
            : <div className="ligne fait">
                <b className="fait-titre">{dernierFait.p.intitule}</b>
                <div className="ligne-h"><span>L'État a engagé {euros(dernierFait.p.subvention)}</span>
                  <b>exercice {dernierFait.p.annee}</b></div>
              </div>}
        </Carte>
      ) : (
        <Vide titre={`Aucune décision datée n'est publiée pour ${nomCommune}.`}
          corps="Ni projet financé par l'État, ni vote solennel du député sur la période relevée."
          lien={{ texte: "Projets financés par l'État — données publiques", url: DGCL_URL }} />
      )}

      {/* LA TRADUCTION FINANCIERE, SI CE N'ETAIT PAS DEJA LE FAIT D'OUVERTURE. */}
      {VARIANTE !== "B" && rapportDette ? (
        <HeroArgent rapport={rapportDette} nomCommune={nomCommune} exercice={exercice.an} src={srcComptes} />
      ) : null}

      {/* CE QUI ARRIVE — le pilote Senat integre au fil, pas un sixieme
          bouton. Un seul echelon est couvert : on le dit, on n'en invente
          pas d'autre pour "remplir" l'ecran (phase 7 de la mission). */}
      {prochain ? (
        <Carte echelon="france" titre="Ce qui arrive"
          sousTitre="Un seul échelon est couvert pour l'instant : le Sénat">
          <div className="ligne fait">
            <b className="fait-titre">{prochain.titre}</b>
            <div className="ligne-note">
              {new Date(prochain.debut).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
              {prochain.lieu ? " · " + prochain.lieu : ""}
            </div>
          </div>
          <Source producteur={srcCal.producteur_affiche || srcCal.producteur} licence={srcCal.licence}
            mention={srcCal.releve_le ? "relevé le " + dateFr(srcCal.releve_le) : undefined} url={srcCal.url} />
        </Carte>
      ) : (
        <Vide titre="Aucune séance du Sénat n'est annoncée sur la période relevée."
          corps="Ce n'est pas un retard de Repère : le Sénat n'a pas encore publié la suite de son agenda." />
      )}

      {/* APPROFONDIR — la profondeur reste entiere, elle change de porte
          d'entree. Rien n'est retire des cinq ecrans existants. */}
      <nav className="auj-suite" aria-label="Approfondir">
        <button type="button" onClick={() => aller("decide")}>Toutes les décisions</button>
        <button type="button" onClick={() => aller("qui")}>Qui décide</button>
        <button type="button" onClick={() => aller("argent")}>Où va l'argent</button>
        <button type="button" onClick={() => aller("calendrier")}>Le calendrier</button>
      </nav>
    </Pile>
  );
}
