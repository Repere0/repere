import React, { Suspense, lazy, useCallback, useEffect, useMemo, useState } from "react";
import { Chargement, Vide, Puce } from "@repere/ui";
import {
  chargerIndex, chargerDepartement, prechargerDepartement, ETATS, PHRASES,
} from "@repere/data-utils";

/* CHARGEMENT PARESSEUX DES ÉCRANS. Chacun est un module séparé : ouvrir « Qui
   décide » ne télécharge pas le code de « Où va mon argent ». Le socle React est
   dans un morceau à part (voir vite.config.js). */
const QuiDecide = lazy(() => import("./routes/QuiDecide.jsx"));
const OuVaArgent = lazy(() => import("./routes/OuVaArgent.jsx"));
const Sources = lazy(() => import("./routes/Sources.jsx"));

const ONGLETS = [
  { id: "qui", libelle: "Qui décide", echelon: "ville", charge: () => import("./routes/QuiDecide.jsx") },
  { id: "argent", libelle: "Où va l'argent", echelon: "dept", charge: () => import("./routes/OuVaArgent.jsx") },
  { id: "sources", libelle: "Sources", echelon: "france", charge: () => import("./routes/Sources.jsx") },
];

/* INVARIANT 2 : une seule clé, nommée, et rien d'autre. Ni compte, ni courriel,
   ni identifiant. Elle ne contient qu'un code de département — jamais une
   commune, jamais un horodatage d'usage. La commune choisie, elle, ne survit
   PAS au rechargement, et c'est délibéré : elle désignerait le domicile du
   lecteur, ce que Repère refuse d'écrire sur son appareil. */
const CLE = "repere.departement";

function lireDepartement() {
  try { return localStorage.getItem(CLE) || ""; } catch { return ""; }
}
function ecrireDepartement(d) {
  try { d ? localStorage.setItem(CLE, d) : localStorage.removeItem(CLE); } catch { /* mode privé */ }
}

/* LA COMMUNE EST CHOISIE UNE FOIS, PAS UNE FOIS PAR ONGLET.
 *
 * Avant, « Qui décide » et « Où va l'argent » portaient chacun leur champ de
 * recherche et leur propre sélection : passer d'un onglet à l'autre effaçait le
 * choix, et les deux écrans pouvaient afficher deux communes différentes en même
 * temps. Le lecteur perdait sa place à chaque va-et-vient. Le choix vit donc
 * ici, au-dessus des onglets, et les écrans le reçoivent. */
function ChoixCommune({ paquet, commune, onCommune }) {
  const [filtre, setFiltre] = useState("");
  const communes = useMemo(() => Object.entries(paquet.communes), [paquet]);
  const q = filtre.trim().toLowerCase();
  const trouvees = useMemo(() => {
    const base = q ? communes.filter(([, c]) => c.nom.toLowerCase().includes(q)) : communes;
    /* Tri ALPHABÉTIQUE, jamais numérique : classer des territoires par un
       chiffre est interdit (invariant 3), et l'ordre alphabétique est le seul
       qui ne dise rien de personne. */
    return base.slice().sort((a, b) => a[1].nom.localeCompare(b[1].nom, "fr"));
  }, [communes, q]);
  const vues = trouvees.slice(0, 60);

  return (
    <div className="choix-commune">
      <label className="champ">
        <span>Votre commune, dans le département {paquet.d}</span>
        <input type="search" value={filtre} placeholder="Tapez les premières lettres — Ustaritz, Bayonne…"
          autoComplete="off" onChange={e => setFiltre(e.target.value)} />
      </label>

      {trouvees.length === 0 ? (
        <Vide titre={`Aucune commune du département ${paquet.d} ne porte ce nom.`}
          corps="Ce fichier ne contient que les communes de ce département. Si la vôtre est ailleurs, changez de département au-dessus." />
      ) : (
        <>
          <div className="rangee liste" role="group" aria-label="Communes trouvées">
            {vues.map(([insee, com]) => (
              <button key={insee} type="button" aria-pressed={insee === commune}
                className={"puce" + (insee === commune ? " actif" : "")}
                onClick={() => onCommune(insee)}>{com.nom}</button>
            ))}
          </div>
          <p className="note" role="status" aria-live="polite">
            {trouvees.length > vues.length
              ? `${trouvees.length.toLocaleString("fr-FR")} communes correspondent, les 60 premières sont affichées. Continuez à taper pour affiner.`
              : `${trouvees.length.toLocaleString("fr-FR")} commune${trouvees.length > 1 ? "s" : ""} ${q ? "trouvée" + (trouvees.length > 1 ? "s" : "") : "dans ce département"}.`}
          </p>
        </>
      )}
    </div>
  );
}

export default function App() {
  const [index, setIndex] = useState(null);
  const [etatIndex, setEtatIndex] = useState(ETATS.EN_COURS);
  const [departement, setDepartement] = useState(lireDepartement);
  const [paquet, setPaquet] = useState(null);
  const [etat, setEtat] = useState(ETATS.ABSENT);
  const [onglet, setOnglet] = useState("qui");
  const [commune, setCommune] = useState(null);

  useEffect(() => {
    let vivant = true;
    chargerIndex().then(r => {
      if (!vivant) return;
      setEtatIndex(r.etat);
      if (r.donnees) setIndex(r.donnees);
    });
    return () => { vivant = false; };
  }, []);

  const ouvrir = useCallback(async (dep) => {
    setDepartement(dep);
    ecrireDepartement(dep);
    setEtat(ETATS.EN_COURS);
    setPaquet(null);
    setCommune(null);
    const r = await chargerDepartement(dep);
    setEtat(r.etat);
    setPaquet(r.donnees);
  }, []);

  /* Un département déjà choisi se recharge tout seul : le lecteur ne redit pas
     chaque matin où il habite. */
  useEffect(() => { if (departement) ouvrir(departement); }, []);   // eslint-disable-line

  const fiche = paquet && commune ? paquet.communes[commune] : null;

  return (
    <div className="app">
      <header className="entete">
        <p className="eyebrow">Repère</p>
        <h1>Qui décide chez vous, et où va votre argent.</h1>
        <p className="chapeau">
          Les élus, les comptes et la circonscription de votre commune, à partir des sources
          officielles. Aucun compte, aucun courriel, rien ne quitte votre appareil.
        </p>
      </header>

      <nav className="departements" aria-label="Choisir un département">
        {etatIndex === ETATS.EN_COURS && !index
          ? <Chargement titre="Chargement de la liste des départements."
              corps="Cinq kilo-octets, une seule fois." />
          : null}
        {etatIndex !== ETATS.SERVI && !index
          ? <Vide {...(PHRASES[etatIndex] || PHRASES[ETATS.ECHEC])} onAction={() => location.reload()} />
          : null}
        {index ? (
          /* CENT QUATRE PASTILLES REMPLISSAIENT L'ECRAN — vu sur une capture, pas
             dans une assertion. Une fois le departement choisi, la liste se replie
             sur une seule ligne : ce que le lecteur est venu voir passe devant le
             moyen d'y arriver. Le details reste ouvert tant que rien n'est choisi. */
          <details className="choix" open={!departement}>
            <summary>
              {departement
                ? <>Département <b>{departement}</b> — changer</>
                : <>Choisir un département <span className="note">({index.departements.length} publiés)</span></>}
            </summary>
            <p className="note note-choix">
              Les départements sont désignés par leur numéro, comme sur une plaque d'immatriculation.
            </p>
            <div className="rangee liste-dept">
              {index.departements.map(d => (
                <Puce key={d.code} actif={d.code === departement} echelon="dept"
                  onClick={() => ouvrir(d.code)}>
                  <span onMouseEnter={() => prechargerDepartement(d.code)}
                        onFocus={() => prechargerDepartement(d.code)}>{d.code}</span>
                </Puce>
              ))}
            </div>
          </details>
        ) : null}
      </nav>

      {departement ? (
        <>
          {etat === ETATS.EN_COURS ? <Chargement {...PHRASES[ETATS.EN_COURS]} /> : null}
          {etat !== ETATS.SERVI && etat !== ETATS.EN_COURS
            ? <Vide {...(PHRASES[etat] || PHRASES[ETATS.ECHEC])} onAction={() => ouvrir(departement)} />
            : null}

          {etat === ETATS.SERVI && paquet ? (
            <>
              <ChoixCommune paquet={paquet} commune={commune} onCommune={setCommune} />

              {fiche ? (
                <>
                  {/* JE SUIS OÙ. Une seule ligne, toujours au même endroit, qui ne
                      bouge plus quand on change d'onglet. */}
                  <p className="situe" role="status" aria-live="polite">
                    <b>{fiche.nom}</b> · département {paquet.d}
                  </p>

                  <nav className="onglets" aria-label="Ce que vous voulez savoir">
                    {ONGLETS.map(o => (
                      <button key={o.id} type="button"
                        className={"onglet" + (onglet === o.id ? " actif" : "")}
                        aria-current={onglet === o.id ? "page" : undefined}
                        onMouseEnter={o.charge} onFocus={o.charge}
                        onClick={() => { o.charge(); setOnglet(o.id); }}>
                        {o.libelle}
                      </button>
                    ))}
                  </nav>

                  <main>
                    <Suspense fallback={<Chargement titre="Ouverture de l'écran."
                      corps="Le code de cet écran est téléchargé à la demande, une seule fois." />}>
                      {onglet === "qui" ? <QuiDecide paquet={paquet} index={index} commune={commune} /> : null}
                      {onglet === "argent" ? <OuVaArgent paquet={paquet} index={index} commune={commune} /> : null}
                      {onglet === "sources" ? <Sources index={index} paquet={paquet} /> : null}
                    </Suspense>
                  </main>
                </>
              ) : (
                <p className="invite">
                  Choisissez votre commune ci-dessus : Repère affichera ses élus, sa circonscription
                  et ses comptes.
                </p>
              )}
            </>
          ) : null}
        </>
      ) : (
        <p className="invite">Choisissez un département pour commencer. Repère ne demande jamais votre adresse.</p>
      )}
    </div>
  );
}
