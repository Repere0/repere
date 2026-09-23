import React, { useEffect, useState } from "react";
import { Carte, Vide, Source, Chargement, dateFr } from "@repere/ui";
import { chargerCalendrierSenat, chargerAgendaAN, ETATS } from "@repere/data-utils";

/* CALENDRIER CITOYEN — SENAT (17/09/2026) PUIS ASSEMBLEE NATIONALE
 * (23/09/2026), MEME MODELE D'EVENEMENT POUR LES DEUX.
 *
 * LA QUESTION, PAS LA LISTE. Le porteur du projet l'a pose explicitement :
 * pas « voici un agenda rempli parce qu'il faut remplir un agenda », mais
 * « qu'est-ce qui se passe prochainement dans la vie democratique ? ». Rien
 * n'est fabrique pour completer les autres jours : un jour sans seance
 * n'affiche rien, jamais un evenement invente.
 *
 * DEUX SOURCES, DEUX CHARGEMENTS INDEPENDANTS. Si l'une echoue (hors ligne,
 * fichier absent), l'autre s'affiche seule plutot que de tout cacher - un
 * echec partiel n'est pas un echec total. L'INSTITUTION est posee sur
 * chaque evenement au moment de la fusion, jamais dans le fichier source
 * lui-meme (chaque fichier ne connait que sa propre institution).
 *
 * LA LICENCE N'EST PAS ACQUISE POUR LE SENAT, ET L'ECRAN LE DIT — invariant
 * 4 tenu par l'honnetete plutot que par un champ rempli au hasard. */
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

/* Les deux institutions, listees une fois — utilisees pour lancer les deux
   chargements et pour retrouver, a l'affichage, la fonction de chargement
   et le libelle propres a chacune, sans dupliquer la logique de fusion. */
const INSTITUTIONS = [
  { cle: "senat", nom: "Sénat", charger: chargerCalendrierSenat,
    urlRepli: "https://www.senat.fr/agenda.html" },
  { cle: "an", nom: "Assemblée nationale", charger: chargerAgendaAN,
    urlRepli: "https://www.assemblee-nationale.fr/dyn/17/agenda" },
];

export default function Calendrier() {
  const [charges, setCharges] = useState({});

  useEffect(() => {
    let vivant = true;
    for (const inst of INSTITUTIONS) {
      inst.charger().then(r => {
        if (!vivant) return;
        setCharges(prec => ({ ...prec, [inst.cle]: r }));
      });
    }
    return () => { vivant = false; };
  }, []);

  const resultats = INSTITUTIONS.map(inst => ({ inst, r: charges[inst.cle] }));
  const enAttente = resultats.filter(({ r }) => !r);
  if (enAttente.length === INSTITUTIONS.length) {
    return <Chargement titre="Ouverture du calendrier citoyen."
      corps="Le Sénat et l'Assemblée nationale, une seule fois, puis ils restent sur cet appareil." />;
  }
  /* On n'attend pas que LES DEUX chargements finissent pour afficher ce qui
     est deja arrive : un echec (ou une lenteur) d'une institution ne doit
     jamais retarder l'autre. */

  const arrivees = resultats.filter(({ r }) => r);
  const toutesHorsLigne = arrivees.length && arrivees.every(({ r }) => r.etat === ETATS.HORS_LIGNE);
  if (toutesHorsLigne && enAttente.length === 0) {
    return <Vide titre="Le calendrier n'a pas encore été téléchargé sur cet appareil."
      corps="Le reste de l'application fonctionne hors ligne. Il arrivera à la prochaine connexion." />;
  }

  const valides = arrivees.filter(({ r }) =>
    r.etat === ETATS.SERVI && r.donnees && Array.isArray(r.donnees.evenements));

  if (enAttente.length === 0 && valides.length === 0) {
    return <Vide titre="Le calendrier n'est arrivé jusqu'à cet appareil pour aucune institution."
      corps="Les autres écrans, eux, sont complets."
      lien={{ texte: "Agenda du Sénat", url: INSTITUTIONS[0].urlRepli }} />;
  }

  const maintenant = new Date().toISOString().slice(0, 16);
  const fusion = [];
  for (const { inst, r } of valides) {
    const s = r.donnees.source || {};
    const aVenir = r.donnees.evenements.filter(e => e.debut + ":00" >= maintenant + ":00");
    for (const e of aVenir) fusion.push({ ...e, institution: inst.nom, cle: inst.cle, source: s });
  }
  fusion.sort((a, b) => (a.debut < b.debut ? -1 : a.debut > b.debut ? 1 : 0));

  if (!fusion.length) {
    return (
      <div className="pile">
        <Vide titre="Aucune séance n'est annoncée sur la période relevée, ni au Sénat ni à l'Assemblée."
          corps="Ce n'est pas un retard de Repère : les institutions n'ont pas encore publié la suite de leur agenda."
          lien={{ texte: "Agenda du Sénat", url: INSTITUTIONS[0].urlRepli }} />
      </div>
    );
  }

  /* Une citation de source par institution effectivement affichee - jamais
     une seule citation generique qui melangerait deux producteurs. */
  const sourcesAffichees = valides
    .filter(({ inst }) => fusion.some(e => e.cle === inst.cle))
    .map(({ r }) => r.donnees.source || {});

  return (
    <div className="pile">
      <Carte echelon="france" titre="Ce qui se passe prochainement"
        sousTitre="Séances et travaux du Sénat et de l'Assemblée nationale, dans l'ordre du calendrier">
        {fusion.map((e, i) => (
          <div className="ligne fait" key={i}>
            <div className="ligne-h">
              <span>{jourFr(e.debut)}</span>
              <b>{heureFr(e.debut)}</b>
            </div>
            <div className="tag">{e.institution}</div>
            <b className="fait-titre">{e.titre}</b>
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
        {sourcesAffichees.map((s, i) => (
          <Source key={i} producteur={s.producteur_affiche || s.producteur} licence={s.licence}
            mention={s.releve_le ? "relevé le " + dateFr(s.releve_le) : undefined}
            url={s.url} />
        ))}
      </Carte>
    </div>
  );
}
