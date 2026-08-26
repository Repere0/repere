import React, { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { Chargement, Vide, Puce } from "@repere/ui";
import {
chargerIndex, chargerDepartement, chargerDeputes, prechargerDepartement, ETATS, PHRASES,} from "@repere/data-utils";
const [deputes, setDeputes] = useState(null);
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
   commune, jamais un horodatage d'usage. */
const CLE = "repere.departement";

function lireDepartement() {
  try { return localStorage.getItem(CLE) || ""; } catch { return ""; }
}
function ecrireDepartement(d) {
  try { d ? localStorage.setItem(CLE, d) : localStorage.removeItem(CLE); } catch { /* mode privé */ }
}

export default function App() {
  const [index, setIndex] = useState(null);
  const [etatIndex, setEtatIndex] = useState(ETATS.EN_COURS);
  const [departement, setDepartement] = useState(lireDepartement);
  const [paquet, setPaquet] = useState(null);
  const [etat, setEtat] = useState(ETATS.ABSENT);
  const [onglet, setOnglet] = useState("qui");

  useEffect(() => {chargerDeputes().then(r => {
  if (vivant && r.donnees) setDeputes(r.donnees);
});
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
    const r = await chargerDepartement(dep);
    setEtat(r.etat);
    setPaquet(r.donnees);
  }, []);

  /* Un département déjà choisi se recharge tout seul : le lecteur ne redit pas
     chaque matin où il habite. */
  useEffect(() => { if (departement) ouvrir(departement); }, []);   // eslint-disable-line

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
          ? <Chargement titre="Chargement de la liste des départements." corps="Cinq kilo-octets, une seule fois." />
          : null}
        {etatIndex !== ETATS.SERVI && !index
          ? <Vide {...PHRASES[etatIndex] || PHRASES[ETATS.ECHEC]} onAction={() => location.reload()} />
          : null}
        {index ? (
          /* CENT QUATRE PASTILLES REMPLISSAIENT L'ECRAN — vu sur une capture, pas
             dans une assertion. Une fois le departement choisi, la liste se replie
             sur une seule ligne : ce que le lecteur est venu voir passe devant le
             moyen d'y arriver. Le details reste ouvert tant que rien n'est choisi. */
          <details className="choix" open>
            <summary>
              {departement
                ? <>Département <b>{departement}</b> — changer</>
                : <>Choisir un département <span className="note">({index.departements.length} publiés)</span></>}
            </summary>
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
          <nav className="onglets" aria-label="Sections">
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
            {etat === ETATS.EN_COURS ? <Chargement {...PHRASES[ETATS.EN_COURS]} /> : null}
            {etat !== ETATS.SERVI && etat !== ETATS.EN_COURS
              ? <Vide {...(PHRASES[etat] || PHRASES[ETATS.ECHEC])} onAction={() => ouvrir(departement)} />
              : null}
            {etat === ETATS.SERVI && paquet ? (
              <Suspense fallback={<Chargement titre="Ouverture de l'écran." corps="Le code de cet écran est téléchargé à la demande." />}>
                {onglet === "qui" ? <QuiDecide paquet={paquet} index={index} deputes={deputes} /> : null}
                {onglet === "argent" ? <OuVaArgent paquet={paquet} index={index} /> : null}
                {onglet === "sources" ? <Sources index={index} paquet={paquet} /> : null}
              </Suspense>
            ) : null}
          </main>
        </>
      ) : (
        <p className="invite">Choisissez un département pour commencer. Repère ne demande jamais votre adresse.</p>
      )}
    </div>
  );
}

