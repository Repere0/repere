import React, { useEffect, useState, useId } from "react";
import { Carte, Vide, Source, Chargement, dateFr, jourFr } from "@repere/ui";
import {
  chargerCalendrierSenat, chargerAgendaAN,
  chargerScrutinsSolennelsRecents, chargerScrutinsSolennels, ETATS,
} from "@repere/data-utils";
import { minuteParis } from "@repere/core";

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
function licenceSource(s) {
  if (s?.licence) return s.licence;
  const producteur = s?.producteur_affiche || s?.producteur || "";
  return /Sénat/i.test(producteur) ? "non précisée par le Sénat" : undefined;
}

function heureFr(iso) {
  const m = /T(\d{2}):(\d{2})/.exec(iso || "");
  return m ? `${m[1]}h${m[2]}` : "";
}

/* COUCHE D'EXPLORATION, PAS UN ECRAN A PART (decision produit, 23/09/2026).
 * Le teaser (8 plus recents, ~1,3 Ko) charge en meme temps que le Senat et
 * l'Assemblee, ci-dessous : mesure le 23/09/2026, +4,7% du poids de
 * l'onglet contre 0% pour un teaser invisible qui ne resoudrait rien, et
 * +100% pour tout embarquer d'emblee. Le detail complet (~29,8 Ko, 95
 * scrutins depuis le debut de la legislature) n'arrive qu'au clic
 * "Voir les details complets" — jamais avant, jamais devine.
 *
 * ERREUR GRACIEUSE : chaque ligne du teaser porte DEJA son lien source
 * direct. Si le detail complet echoue au clic, la liste reste entierement
 * visible et utilisable — seule la zone de detail dit l'echec. */
function ScrutinsRecents() {
  const idPanneau = useId();
  const [teaser, setTeaser] = useState(null);
  const [ouvert, setOuvert] = useState(false);
  const [etatDetail, setEtatDetail] = useState(null);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    let vivant = true;
    chargerScrutinsSolennelsRecents().then(r => { if (vivant) setTeaser(r); });
    return () => { vivant = false; };
  }, []);

  function basculer() {
    const prochain = !ouvert;
    setOuvert(prochain);
    if (prochain && etatDetail === null) {
      setEtatDetail(ETATS.EN_COURS);
      chargerScrutinsSolennels().then(r => { setEtatDetail(r.etat); setDetail(r.donnees); });
    }
  }

  if (!teaser || teaser.etat === ETATS.EN_COURS) return null;
  if (teaser.etat !== ETATS.SERVI || !teaser.donnees || !Array.isArray(teaser.donnees.recents)
      || !teaser.donnees.recents.length) {
    return null; /* doctrine du vide : rien plutot qu'une carte vide sans contenu */
  }

  const s = teaser.donnees.source || {};
  const detailParNumero = {};
  if (detail && Array.isArray(detail.scrutins)) {
    for (const d of detail.scrutins) detailParNumero[d.numero] = d;
  }

  return (
    <Carte echelon="france" titre="Les derniers scrutins importants"
      sousTitre="Assemblée nationale — votes solennels et motions de censure">
      <button type="button" className="onglet" aria-expanded={ouvert} aria-controls={idPanneau}
        onClick={basculer}>
        {ouvert ? "Masquer les détails complets" : "Voir les détails complets"}
      </button>
      <div id={idPanneau}>
        {teaser.donnees.recents.map((e, i) => {
          const d = detailParNumero[e.n];
          return (
            <div className="ligne fait" key={i}>
              <div className="ligne-h">
                <span>{jourFr(e.d)}</span>
                <b>{e.ty === "censure" ? "Motion de censure" : "Scrutin solennel"}</b>
              </div>
              <b className="fait-titre">{e.t}</b>
              {ouvert ? (
                etatDetail === ETATS.EN_COURS ? (
                  <div className="ligne-note">Chargement du détail…</div>
                ) : d ? (
                  <div className="ligne-note">
                    {d.sort} — Pour : {d.pour} · Contre : {d.contre} · Abstentions : {d.abstentions}
                  </div>
                ) : (
                  <div className="ligne-note">
                    Détails momentanément indisponibles — <a href={e.url} target="_blank" rel="noreferrer">voir la source officielle</a>.
                  </div>
                )
              ) : null}
              <div className="source">
                <a href={e.url} target="_blank" rel="noreferrer">Scrutin n° {e.n} — source officielle</a>
              </div>
            </div>
          );
        })}
      </div>
      <Source producteur={s.producteur_affiche || s.producteur} licence={licenceSource(s)}
        mention={s.releve_le ? "relevé le " + dateFr(s.releve_le) : undefined} url={s.url} />
    </Carte>
  );
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

/* UNE INSTITUTION ABSENTE EST NOMMEE, JAMAIS OMISE — 07/10/2026. Mesure : sans
   le fichier du Senat, l'ecran titrait « Seances et travaux du Senat et de
   l'Assemblee nationale » et ne montrait que l'Assemblee, sans un mot. Deux
   absences differentes, deux phrases differentes : le calendrier n'est pas
   arrive (cause de notre cote ou du reseau), ou il est arrive mais l'institution
   n'y annonce rien a venir (fait de la source, avec sa date de releve). */
function noteAbsence(inst, r) {
  const nom = inst.nom === "Sénat" ? "du Sénat" : "de l'Assemblée nationale";
  if (r.etat === ETATS.SERVI && r.donnees && Array.isArray(r.donnees.evenements)) {
    const s = r.donnees.source || {};
    return `Le calendrier ${nom} ne contient aucune séance à venir`
      + (s.releve_le ? ` au relevé du ${dateFr(s.releve_le)}` : "") + ". Ce n'est pas un retard de Repère.";
  }
  if (r.etat === ETATS.HORS_LIGNE) return `Le calendrier ${nom} n'a pas encore été téléchargé sur cet appareil.`;
  return `Le calendrier ${nom} n'est pas disponible dans Repère en ce moment : il n'est pas affiché, et rien n'est inventé à sa place.`;
}

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
    return (
      <div className="pile">
        <Vide titre="Le calendrier n'a pas encore été téléchargé sur cet appareil."
          corps="Le reste de l'application fonctionne hors ligne. Il arrivera à la prochaine connexion." />
        <ScrutinsRecents />
      </div>
    );
  }

  const valides = arrivees.filter(({ r }) =>
    r.etat === ETATS.SERVI && r.donnees && Array.isArray(r.donnees.evenements));

  if (enAttente.length === 0 && valides.length === 0) {
    return (
      <div className="pile">
        <Vide titre="Le calendrier n'est arrivé jusqu'à cet appareil pour aucune institution."
          corps="Les autres écrans, eux, sont complets."
          lien={{ texte: "Agenda du Sénat", url: INSTITUTIONS[0].urlRepli }} />
        <ScrutinsRecents />
      </div>
    );
  }

  /* heure de Paris, comme l'agenda publie : `toISOString()` est l'heure UTC (07/10/2026) */
  const maintenant = minuteParis(new Date());
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
        <ScrutinsRecents />
      </div>
    );
  }

  /* Une citation de source par institution effectivement affichee - jamais
     une seule citation generique qui melangerait deux producteurs. */
  const absentes = enAttente.length ? [] : resultats.filter(({ inst }) => !fusion.some(e => e.cle === inst.cle));
  const sourcesAffichees = valides
    .filter(({ inst }) => fusion.some(e => e.cle === inst.cle))
    .map(({ r }) => r.donnees.source || {});

  /* DEUX SEMAINES DEPLIEES, LE RESTE REPLIE — 28/09/2026. Mesure sur telephone
     (390 px) : l'ecran faisait 19 hauteurs d'ecran, soit une soixantaine de
     rendez-vous a plat, du plus proche au plus lointain. Personne ne lit la
     troisieme semaine avant d'avoir compris la premiere. L'ordre reste celui du
     calendrier ; rien n'est retire, le repli dit combien de rendez-vous il
     contient et pour quelle institution, pour qu'aucune ne disparaisse de
     l'ecran. Si les deux semaines sont vides, on deplie les premiers suivants
     plutot que d'afficher un ecran vide au-dessus d'un repli. */
  const limite = minuteParis(new Date(Date.now() + 14 * 864e5));
  let proches = fusion.filter(e => e.debut < limite);
  let plusTard = fusion.filter(e => e.debut >= limite);
  if (!proches.length) { proches = plusTard.slice(0, 5); plusTard = plusTard.slice(5); }
  const compte = (liste, cle) => liste.filter(e => e.cle === cle).length;
  const resumeTard = INSTITUTIONS
    .map(inst => [inst.nom, compte(plusTard, inst.cle)])
    .filter(([, n]) => n > 0)
    .map(([nom, n]) => `${n} ${nom === "Sénat" ? "au Sénat" : "à l'Assemblée nationale"}`)
    .join(", ");
  const ligne = (e, i) => (
    <div className="ligne fait" key={i} data-debut={e.debut}>
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
  );

  return (
    <div className="pile">
      <Carte echelon="france" titre="Ce qui se passe prochainement"
        sousTitre="Séances et travaux du Sénat et de l'Assemblée nationale, dans l'ordre du calendrier">
        {absentes.map(({ inst, r }) => (
          <p className="ligne-note absence-institution" key={"abs-" + inst.cle}>
            {noteAbsence(inst, r)}{" "}
            <a href={inst.urlRepli} target="_blank" rel="noopener noreferrer">Agenda officiel {inst.nom === "Sénat" ? "du Sénat" : "de l'Assemblée"} ↗</a>
          </p>
        ))}
        {proches.map(ligne)}
        {plusTard.length ? (
          <details className="repli plus-tard">
            <summary>
              <span>
                Plus tard : {plusTard.length} rendez-vous jusqu'au {dateFr(plusTard[plusTard.length - 1].debut.slice(0, 10))}
                {resumeTard ? " (" + resumeTard + ")" : ""}
              </span>
            </summary>
            <div className="repli-in">{plusTard.map((e, i) => ligne(e, "t" + i))}</div>
          </details>
        ) : null}
        {sourcesAffichees.map((s, i) => (
          <Source key={i} producteur={s.producteur_affiche || s.producteur} licence={s.licence}
            mention={s.releve_le ? "relevé le " + dateFr(s.releve_le) : undefined}
            url={s.url} />
        ))}
      </Carte>
      <ScrutinsRecents />
    </div>
  );
}
