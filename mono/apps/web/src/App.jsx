import React, { Suspense, lazy, useCallback, useEffect, useMemo, useState } from "react";
import { Chargement, Vide, Puce } from "@repere/ui";
import {
  chargerIndex, chargerDepartement, prechargerDepartement, annulerPrechargement,
  ETATS, PHRASES,
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

/* Comparer « Pyrenees at » et « Pyrénées-Atlantiques » : au clavier, personne ne
   tape les accents, et le trait d'union se tape en espace une fois sur deux. On
   ramene donc tout a des mots nus, et on demande que chaque mot cherche soit le
   debut d'un mot du territoire — « cotes armor », « val doise », « 64 ». */
function mots(t) {
  return String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(" ").filter(Boolean);
}
/* L'apostrophe se tape rarement : « val doise » doit trouver Val-d'Oise, et
   « cote dor » la Cote-d'Or. On indexe donc aussi la forme sans apostrophe, ou
   « d'Oise » devient un seul mot. */
function motsCible(t) {
  return [...new Set([...mots(t), ...mots(String(t || "").replace(/['\u2019]/g, ""))])];
}
function correspond(cherches, cible) {
  return cherches.every(m => cible.some(w => w.startsWith(m)));
}

/* LE DEPARTEMENT SE CHERCHE PAR SON NOM, PAS SEULEMENT PAR SON NUMERO.
 *
 * L'ecran d'accueil affichait cent quatre numeros et rien d'autre. Il fallait
 * savoir que sa commune est « dans le 64 » pour entrer dans le produit — un
 * savoir de plaque d'immatriculation, que tout le monde n'a pas. Les noms
 * viennent des fichiers officiels (voir scripts/noms-territoires.json) et sont
 * fondus dans index.json : aucune requete de plus. */
function ChoixDepartement({ index, departement, onOuvrir, onSurvol }) {
  const [filtre, setFiltre] = useState("");
  const cherches = mots(filtre);
  const choisi = index.departements.find(d => d.code === departement);
  const vus = cherches.length
    ? index.departements.filter(d => correspond(cherches, motsCible(d.code + " " + (d.nom || ""))))
    : index.departements;

  /* COMPTES DERIVES, JAMAIS ECRITS A LA MAIN. « les 101 départements et trois
     collectivités » etait vrai le jour ou je l'ai tape, et le serait reste dans
     le texte le jour ou il aurait cesse de l'etre. Le fichier porte le type de
     chaque territoire : la phrase se lit dedans. */
  const outreMer = index.departements.filter(d => d.type && d.type !== "département").length;
  const departements = index.departements.length - outreMer;

  return (
    <details className="choix" open={!departement}>
      {/* Un seul element de flexbox pour tout l'intitule : sans ce span, chaque
          fragment de texte devenait un element a part et la ligne se cassait
          n'importe ou des que le nom du departement s'y ajoutait. */}
      <summary>
        <span className="choix-libelle">
          {departement
            ? <>Département <b>{departement}</b>{choisi && choisi.nom ? " · " + choisi.nom : ""}<span className="choix-action"> — changer</span></>
            : <>Choisir un département <span className="note">({index.departements.length} publiés)</span></>}
        </span>
      </summary>
      <div className="dedans-choix">
        <label className="champ">
          <span>Votre département — son nom ou son numéro</span>
          <input type="search" value={filtre} placeholder="Pyrénées, 64, Nord…"
            autoComplete="off" onChange={e => setFiltre(e.target.value)} />
        </label>
        {vus.length === 0 ? (
          <Vide titre={`Aucun territoire publié ne correspond à « ${filtre.trim()} ».`}
            corps={`Repère publie ${departements} départements${outreMer ? ` et ${outreMer} collectivités d'outre-mer` : ""}. Essayez le début du nom, ou le numéro.`} />
        ) : (
          <>
            {/* Quitter la liste annule l'intention de prechargement en cours :
                le doigt ou le focus qui passe n'est pas une demande. */}
            <div className="rangee liste-dept" role="group" aria-label="Départements publiés"
              onMouseLeave={annulerPrechargement} onBlur={annulerPrechargement}>
              {vus.map(d => (
                <Puce key={d.code} actif={d.code === departement} echelon="dept"
                  onClick={() => onOuvrir(d.code)} onSurvol={() => onSurvol(d.code)}>
                  <span className="puce-code">{d.code}</span>
                  {d.nom ? <span className="puce-nom">{d.nom}</span> : null}
                </Puce>
              ))}
            </div>
            <p className="note" role="status" aria-live="polite">
              {cherches.length
                ? `${vus.length} territoire${vus.length > 1 ? "s" : ""} correspond${vus.length > 1 ? "ent" : ""}.`
                : `${departements} départements${outreMer ? `, puis ${outreMer} collectivités d'outre-mer en fin de liste` : ""}.`}
            </p>
          </>
        )}
      </div>
    </details>
  );
}

/* LA COMMUNE EST CHOISIE UNE FOIS, PAS UNE FOIS PAR ONGLET.
 *
 * Avant, « Qui décide » et « Où va l'argent » portaient chacun leur champ de
 * recherche et leur propre sélection : passer d'un onglet à l'autre effaçait le
 * choix, et les deux écrans pouvaient afficher deux communes différentes en même
 * temps. Le lecteur perdait sa place à chaque va-et-vient. Le choix vit donc
 * ici, au-dessus des onglets, et les écrans le reçoivent. */
function ChoixCommune({ paquet, nomDepartement, commune, onCommune }) {
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
        {/* « dans le 64 » se dit, « dans le Pyrenees-Atlantiques » non : ni
            l'article ni l'elision ne se derivent d'un nom de departement. On
            juxtapose donc, sans rien accorder. */}
        <span>Votre commune — département {paquet.d}{nomDepartement ? " · " + nomDepartement : ""}</span>
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
  const territoire = index && paquet
    ? index.departements.find(d => d.code === paquet.d) : null;
  const nomDepartement = territoire ? territoire.nom : null;

  /* LE TITRE DE L'ONGLET DIT OU L'ON EST. Il valait « Repère — qui décide chez
     vous » du debut a la fin : deux onglets ouverts sur deux communes etaient
     indiscernables dans la barre du navigateur, et un signet ne disait rien.
     Le titre ne porte QUE ce qui est deja affiche a l'ecran — jamais plus. */
  useEffect(() => {
    if (typeof document === "undefined") return;
    const base = "Repère — qui décide chez vous";
    document.title = fiche
      ? `${fiche.nom} — Repère`
      : (nomDepartement ? `${nomDepartement} — Repère` : base);
  }, [fiche, nomDepartement]);

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
        {/* CENT QUATRE PASTILLES REMPLISSAIENT L'ECRAN — vu sur une capture, pas
            dans une assertion. Une fois le departement choisi, la liste se replie
            sur une seule ligne : ce que le lecteur est venu voir passe devant le
            moyen d'y arriver. Le details reste ouvert tant que rien n'est choisi. */}
        {index ? (
          <ChoixDepartement index={index} departement={departement}
            onOuvrir={ouvrir} onSurvol={prechargerDepartement} />
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
              <ChoixCommune paquet={paquet} nomDepartement={nomDepartement}
                commune={commune} onCommune={setCommune} />

              {/* JE SUIS OÙ. Une seule ligne, toujours au même endroit, qui ne
                  bouge plus quand on change d'onglet. */}
              {fiche ? (
                <p className="situe" role="status" aria-live="polite">
                  <b>{fiche.nom}</b> · {nomDepartement ? nomDepartement + " (" + paquet.d + ")" : "département " + paquet.d}
                </p>
              ) : null}

              {/* Les onglets apparaissent des que le departement est la. « Sources »
                  ne parle pas d'une commune : exiger d'en choisir une pour lire
                  d'ou viennent les donnees rendait le seul ecran de verification du
                  produit inatteignable tant qu'on n'avait pas fini le parcours. */}
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
                  {onglet === "sources" ? <Sources index={index} paquet={paquet} /> : null}
                  {onglet !== "sources" && !fiche ? (
                    <p className="invite">
                      Choisissez votre commune ci-dessus : Repère affichera ses élus, sa
                      circonscription et ses comptes.
                    </p>
                  ) : null}
                  {onglet === "qui" && fiche ? <QuiDecide paquet={paquet} index={index} commune={commune} /> : null}
                  {onglet === "argent" && fiche ? <OuVaArgent paquet={paquet} index={index} commune={commune} /> : null}
                </Suspense>
              </main>
            </>
          ) : null}
        </>
      ) : (
        <p className="invite">Choisissez un département pour commencer. Repère ne demande jamais votre adresse.</p>
      )}
    </div>
  );
}
