import React, { useEffect, useState } from "react";
import { Carte, Vide, Source, Chargement, dateFr } from "@repere/ui";
import { chargerCalendrierSenat, ETATS } from "@repere/data-utils";

/* CALENDRIER CITOYEN — PILOTE SENAT, premiere source reelle (17/09/2026).
 *
 * LA QUESTION, PAS LA LISTE. Le porteur du projet l'a pose explicitement :
 * pas « voici un agenda rempli parce qu'il faut remplir un agenda », mais
 * « qu'est-ce qui se passe prochainement dans la vie democratique ? ». Un seul
 * echelon (Senat) est publie pour l'instant, exactement parce que c'est le
 * seul verifie comme un vrai flux structure — voir scripts/calendrier-senat.mjs.
 * Rien n'est fabrique pour completer les autres jours : un jour sans seance
 * n'affiche rien pour cet echelon, jamais un evenement invente.
 *
 * LA LICENCE N'EST PAS ACQUISE, ET L'ECRAN LE DIT — invariant 4 tenu par
 * l'honnetete plutot que par un champ rempli au hasard. */
function heureFr(iso) {
  const m = /T(\d{2}):(\d{2})/.exec(iso || "");
  return m ? `${m[1]}h${m[2]}` : "";
}
function jourFr(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || "");
  if (!m) return "";
  const jours = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  const d = new Date(iso);
  return jours[d.getDay()] + " " + dateFr(`${m[1]}-${m[2]}-${m[3]}`);
}

export default function Calendrier() {
  const [etat, setEtat] = useState(ETATS.EN_COURS);
  const [cal, setCal] = useState(null);

  useEffect(() => {
    let vivant = true;
    chargerCalendrierSenat().then(r => {
      if (!vivant) return;
      setEtat(r.etat);
      setCal(r.donnees);
    });
    return () => { vivant = false; };
  }, []);

  if (etat === ETATS.EN_COURS) {
    return <Chargement titre="Ouverture du calendrier citoyen."
      corps="L'agenda du Sénat, une seule fois, puis il reste sur cet appareil." />;
  }
  if (etat === ETATS.HORS_LIGNE) {
    return <Vide titre="Le calendrier n'a pas encore été téléchargé sur cet appareil."
      corps="Le reste de l'application fonctionne hors ligne. Il arrivera à la prochaine connexion." />;
  }
  if (etat !== ETATS.SERVI || !cal || !Array.isArray(cal.evenements)) {
    return <Vide titre="Le calendrier n'est pas arrivé jusqu'à cet appareil."
      corps="Les autres écrans, eux, sont complets."
      lien={{ texte: "Agenda du Sénat", url: "https://www.senat.fr/agenda.html" }} />;
  }

  const s = cal.source || {};
  const maintenant = new Date().toISOString();
  const aVenir = cal.evenements.filter(e => e.debut + ":00" >= maintenant.slice(0, 16));

  if (!aVenir.length) {
    return (
      <div className="pile">
        <Vide titre="Aucune séance du Sénat n'est annoncée sur la période relevée."
          corps="Ce n'est pas un retard de Repère : le Sénat n'a pas encore publié la suite de son agenda."
          lien={{ texte: "Agenda du Sénat", url: s.url || "https://www.senat.fr/agenda.html" }} />
      </div>
    );
  }

  return (
    <div className="pile">
      <Carte echelon="france" titre="Ce qui se passe prochainement"
        sousTitre="Séances et travaux du Sénat, dans l'ordre du calendrier">
        <p className="tx-note">
          Un seul échelon est couvert pour l'instant. L'Assemblée nationale et les autres
          niveaux viendront quand leur source sera aussi vérifiée qu'un vrai flux structuré,
          pas avant.
        </p>
        {aVenir.map((e, i) => (
          <div className="ligne evenement" key={i}>
            <div className="ligne-h">
              <span>{jourFr(e.debut)}</span>
              <b>{heureFr(e.debut)}</b>
            </div>
            <div className="evenement-titre">{e.titre}</div>
            <div className="ligne-note">
              {e.categorie ? e.categorie + (e.lieu ? " · " + e.lieu : "") : e.lieu}
            </div>
            {e.description ? (
              <details className="repli">
                <summary><span>En savoir plus</span></summary>
                <div className="repli-in"><p className="tx-note">{e.description}</p></div>
              </details>
            ) : null}
          </div>
        ))}
        <Source producteur={s.producteur_affiche || s.producteur} licence={s.licence}
          mention={s.releve_le ? "relevé le " + dateFr(s.releve_le) : undefined}
          url={s.url} />
      </Carte>
    </div>
  );
}
