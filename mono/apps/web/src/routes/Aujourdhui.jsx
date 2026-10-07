import React from "react";
import "./aujourdhui-semaine.css";
import { Vide, Source, Chargement, dateFr, jourFr } from "@repere/ui";
import { useAujourdhui } from "../lib/useAujourdhui.js";
import { LigneVote } from "../lib/votes.jsx";
import { noteRattachement } from "../lib/faits.js";
import { phraseCirconscription, phraseProjet, phraseProjetLocal, DGCL_URL, LIBELLES } from "@repere/core";

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

/* DGCL_URL, et les phrases du vote et du projet, viennent de @repere/core
   (phrases.js) depuis le 29/09/2026 : l'application mobile ecrit les memes. */

export default function Aujourdhui({ paquet, index, commune, aller, derniereVisite }) {
  const a = useAujourdhui(paquet, index, commune);
  if (!a.fiche) return null;
  if (!a.pret) {
    return <Chargement titre="Ouverture de la question du jour."
      corps="Les mêmes fichiers que les autres écrans, une seule fois." />;
  }
  const { nomCommune, dernierVote, dernierFait, faits, rapportDette, srcComptes,
          srcProjets, srcScrutins, prochains, prochainsDansLaSemaine, semaineSelectionnee, semaineTotal, base,
          nbCircos, nomDep, dernierProjet, semaineParlement: sp } = a;

  /* "DEPUIS VOTRE DERNIERE VISITE", SINON "CETTE SEMAINE" — decision produit,
   * 23/09/2026. `derniereVisite` vient d'App.jsx : un instant de visite, gele
   * au demarrage de CETTE session, lu depuis la meme cle de stockage que le
   * departement (voir la note d'invariant 2 dans App.jsx). Trois etats
   * possibles, et les trois sont geres proprement plutot que devines :
   *   - un marqueur existe (visite precedente reelle) -> on compare a LUI ;
   *   - aucun marqueur (premiere visite depuis que cette fonction existe, ou
   *     stockage indisponible — mode prive, quota) -> on retombe sur une
   *     fenetre de sept jours, qui ne pretend jamais connaitre une visite
   *     passee qu'elle n'a pas vue.
   * Dans les deux cas, un pur calcul sur des faits deja charges par
   * useAujourdhui.js (lib/faits.js, partage avec "Ce qui a ete decide") —
   * aucune deuxieme source, aucun deuxieme calcul qui pourrait diverger. */
  const ilYA7Jours = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const depuisVisite = !!derniereVisite;
  const seuil = depuisVisite ? derniereVisite.slice(0, 10) : ilYA7Jours;
  const faitPrincipalCle = dernierVote ? dernierVote.cle
    : (dernierFait && (dernierFait.type === "projet" || dernierFait.type === "editorial") ? dernierFait.cle : null);
  const nouveautes = (faits || [])
    .filter(f => (depuisVisite ? f.quand > seuil : f.quand >= seuil) && f.cle !== faitPrincipalCle)
    .slice(0, 4);
  const titreNouveautes = depuisVisite
    ? `Depuis votre visite du ${dateFr(seuil)}`
    : "Quoi d'autre cette semaine ?";
  const nouveautesProjets = nouveautes.some(f => f.type === "projet");
  const nouveautesVotes = nouveautes.some(f => f.type === "vote");
  /* RIEN DE NOUVEAU SE DIT — doctrine du vide, 28/09/2026. Mesure en
   * production : un lecteur revenu apres sa visite voyait la meme page qu'au
   * premier passage, sans que rien ne lui dise qu'aucun fait n'avait ete
   * publie entre-temps. Une absence doit produire une phrase. Le test porte
   * sur TOUS les faits, y compris la reponse principale : si elle est
   * elle-meme posterieure a la visite, il y a du nouveau, et la phrase
   * serait fausse. */
  const rienDepuisVisite = depuisVisite && !(faits || []).some(f => f.quand > seuil);
  const sourcesAVenir = [];
  for (const e of prochains || []) {
    if (!sourcesAVenir.some(s => s.institution === e.institution)) sourcesAVenir.push({ institution: e.institution, s: e.source });
  }

  return (
    <div className="quest">
      <h1 className="quest-q">Que s'est-il décidé près de chez vous ?</h1>
      {rienDepuisVisite ? (
        <p className="ligne-note auj-rien">
          Rien de nouveau depuis votre visite du {dateFr(seuil)} : aucune décision datée n'a été publiée
          pour {nomCommune} entre-temps.{faitPrincipalCle ? " Voici la plus récente." : ""}
        </p>
      ) : null}

      {/* LA REPONSE — vote si disponible, sinon le dernier projet finance,
          sinon une phrase honnete. Doctrine du vide, meme ici. */}
      {dernierVote ? (
        <div className="quest-r">
          {/* QUI, ET POURQUOI CE VOTE ME CONCERNE : c'est le depute elu dans la
              circonscription du lecteur. Une commune partagee entre plusieurs
              circonscriptions ne permet pas de dire laquelle est la sienne :
              on le dit, plutot que d'ecrire « votre depute » au hasard. */}
          <p className="ligne-note auj-qui">
            {phraseCirconscription({ nbCircos, nomCommune, nomDep }, dernierVote.circo)}
          </p>
          <LigneVote sc={dernierVote.sc} position={dernierVote.position} base={base} loi qui={dernierVote.qui} />
          {srcScrutins ? <Source producteur={srcScrutins.producteur} licence={srcScrutins.licence} url={srcScrutins.url}
            mention={srcScrutins.releve_le ? "relevé le " + dateFr(srcScrutins.releve_le) : undefined} /> : null}
        </div>
      ) : dernierFait && dernierFait.type === "projet" ? (
        <div className="quest-r">
          <p><b>{dernierFait.p.intitule}</b></p>
          <p className="ligne-note">{phraseProjet(dernierFait.p)}</p>
          {noteRattachement(dernierFait.p) ? <p className="ligne-note">{noteRattachement(dernierFait.p)}</p> : null}
          {srcProjets ? <Source producteur={srcProjets.producteur} licence={srcProjets.licence} maj={srcProjets.mis_a_jour_le} url={srcProjets.url} /> : null}
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
          {/* GRANDS AXES, SOURCE DISTINCTE DU VOTE — meme motif que CeQuiADecide.jsx,
              voir ce fichier pour le detail. */}
          {dernierFait.e.axes ? (
            <>
              <p className="ligne-note">{dernierFait.e.axes}</p>
              {dernierFait.e.axes_src ? (
                <Source producteur={dernierFait.e.axes_srcn || "voir la source"} url={dernierFait.e.axes_src} />
              ) : null}
            </>
          ) : null}
        </div>
      ) : (
        <Vide titre={`Aucune décision datée n'est publiée pour ${nomCommune}.`}
          corps="Ni projet financé par l'État, ni vote solennel du député sur la période relevée."
          lien={{ texte: "Projets financés par l'État — données publiques", url: DGCL_URL }} />
      )}

      {/* LES QUESTIONS SUIVANTES SONT PLUS DISCRETES — meme structure que la
          premiere aurait repete trois fois le meme motif (chasse au
          « look IA », phase 3 de la mission du 19/09). */}
      {/* LE FAIT REELLEMENT LOCAL, QUAND IL EXISTE ET N'EST PAS DEJA LA
          REPONSE CI-DESSUS. Meme donnee et meme formulation que la branche
          « projet » plus haut ; l'exercice est dit, le jour ne l'est pas (la
          source ne le publie pas). */}
      {dernierProjet && dernierProjet.cle !== faitPrincipalCle ? (
        <div className="quest-suivante auj-local">
          <p className="quest-q2">Et dans votre commune ?</p>
          <p className="ligne-note"><b>{dernierProjet.p.intitule}</b></p>
          <p className="ligne-note">{phraseProjetLocal(dernierProjet.p, nomCommune)}</p>
          {srcProjets ? <Source producteur={srcProjets.producteur} licence={srcProjets.licence} maj={srcProjets.mis_a_jour_le} url={srcProjets.url} /> : null}
        </div>
      ) : null}

      {/* UNE DONNEE, SON UNITE, SA PERIODE, SA SOURCE — 07/10/2026. L'exercice
          vient de @repere/core (rapportDette.an), attache au chiffre qu'il date.
          Sans exercice connu, le bloc ne s'affiche pas : un ratio de comptes sans
          son annee laisserait le lecteur la deviner. data-exercice sert au banc. */}
      {rapportDette && rapportDette.an ? (
        <div className="quest-suivante" data-exercice={rapportDette.an}>
          <p className="quest-q2">Combien ça représente ?</p>
          <p className="ligne-note">{rapportDette.l}, comptes {rapportDette.an} : <b>{rapportDette.v}</b>. {rapportDette.d}</p>
          <Source calcul url={srcComptes ? srcComptes.url : undefined} producteur={srcComptes ? srcComptes.producteur : ""} licence={srcComptes ? srcComptes.licence : ""} maj={srcComptes ? srcComptes.maj : ""} />
        </div>
      ) : null}

      {nouveautes.length > 0 ? (
        <div className="quest-suivante">
          <p className="quest-q2">{titreNouveautes}</p>
          {nouveautes.map(f => (
            <p className="ligne-note" key={f.cle}>
              {f.type === "projet" ? f.p.intitule : f.type === "vote" ? f.sc.t : f.e.t}
            </p>
          ))}
          {nouveautesProjets && srcProjets ? (
            <Source producteur={srcProjets.producteur} licence={srcProjets.licence} maj={srcProjets.mis_a_jour_le} url={srcProjets.url} />
          ) : null}
          {nouveautesVotes && srcScrutins ? (
            <Source producteur={srcScrutins.producteur} licence={srcScrutins.licence} url={srcScrutins.url}
              mention={srcScrutins.releve_le ? "relevé le " + dateFr(srcScrutins.releve_le) : undefined} />
          ) : null}
          {nouveautes.filter(f => f.type === "editorial").map(f => (
            <Source key={f.cle} producteur={f.e.srcn || "voir la source"} url={f.e.src}
              mention={f.e.conf === "verifie" ? "relu et validé par la rédaction" : "relevé, en attente de confirmation par la rédaction"} />
          ))}
        </div>
      ) : null}

      {prochains && prochains.length ? (
        <div className="quest-suivante auj-a-venir">
          <p className="quest-q2">{prochainsDansLaSemaine ? "Qu'est-ce qui arrive cette semaine ?" : "Qu'est-ce qui arrive ?"}</p>
          {/* LA SEMAINE D'UN COUP D'OEIL — 07/10/2026 (@repere/core, semaineParlement).
              Un point par seance publique annoncee ; le nombre est ecrit pour le
              lecteur d'ecran. Un jour sans seance le dit, il n'est pas vide. */}
          {sp && sp.institutions.length ? (
            <ol className="auj-semaine" aria-label={"Séances publiques des sept prochains jours, " + sp.institutions.map(x => x.institution).join(" et ")}>
              {sp.jours.map((j, i) => (
                <li key={j.date} className={i === 0 ? "auj-jour auj-jour-aujourdhui" : "auj-jour"}
                  aria-label={jourFr(j.date) + " : " + (j.seances ? j.seances + " séance" + (j.seances > 1 ? "s" : "") + " publique" + (j.seances > 1 ? "s" : "") : "aucune séance publique")}>
                  <span className="auj-jour-nom" aria-hidden="true">{i === 0 ? "Auj." : new Date(j.date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", "")}</span>
                  <span className="auj-jour-num" aria-hidden="true">{Number(j.date.slice(8, 10))}</span>
                  <span className="auj-jour-points" aria-hidden="true">{j.seances ? Array.from({ length: Math.min(j.seances, 4) }, (_, k) => <i key={k} />) : "–"}</span>
                </li>
              ))}
            </ol>
          ) : null}
          {sp && sp.votesSolennels.length ? (
            <div className="auj-solennels">
              <p className="ligne-note"><b>Votes solennels annoncés</b> — chaque député votera à son nom. Règle d'affichage : ils passent en premier, quel que soit le texte.</p>
              {sp.votesSolennels.map((v, i) => (
                <p className="ligne-note" key={i}>{jourFr(v.debut)}{v.debut.length > 10 ? ", " + v.debut.slice(11, 13).replace(/^0/, "") + " h" + (v.debut.slice(14, 16) !== "00" ? " " + v.debut.slice(14, 16) : "") : ""} — {v.institution} : <b>{v.texte}</b></p>
              ))}
            </div>
          ) : null}
          {prochainsDansLaSemaine && semaineSelectionnee ? (
            <p className="ligne-note auj-regle">
              3 rendez-vous sur {semaineTotal} cette semaine. Les séances publiques passent en premier : c'est là que
              chaque assemblée débat et vote les textes. Tout le reste est dans le calendrier.
            </p>
          ) : null}
          {prochains.map((e, i) => (
            <p className="ligne-note" key={i}>
              {jourFr(e.debut)}
              {" — "}{e.institution} : <b>{e.titre}</b>
            </p>
          ))}
          {sourcesAVenir.map(({ institution, s }) => (
            <Source key={institution} producteur={s.producteur_affiche || s.producteur || institution} licence={s.licence}
              mention={s.releve_le ? "relevé le " + dateFr(s.releve_le) : undefined} url={s.url} />
          ))}
        </div>
      ) : null}

      <nav className="auj-suite" aria-label="Approfondir">
        <button type="button" onClick={() => aller("decide")}>{LIBELLES.decide}</button>
        <button type="button" onClick={() => aller("qui")}>{LIBELLES.qui}</button>
        <button type="button" onClick={() => aller("argent")}>{LIBELLES.argent}</button>
        <button type="button" onClick={() => aller("calendrier")}>{LIBELLES.calendrier}</button>
      </nav>
    </div>
  );
}
