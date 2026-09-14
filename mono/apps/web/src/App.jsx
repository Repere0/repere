import React, { Suspense, lazy, useCallback, useEffect, useMemo, useState } from "react";
import { Chargement, Vide, Puce } from "@repere/ui";
import {
  chargerIndex, chargerDepartement, chargerCommunesBeta, prechargerDepartement,
  annulerPrechargement, entrer, ETATS, PHRASES,
} from "@repere/data-utils";

/* CHARGEMENT PARESSEUX DES ÉCRANS. Chacun est un module séparé : ouvrir « Qui
   décide » ne télécharge pas le code de « Où va mon argent ». Le socle React est
   dans un morceau à part (voir vite.config.js). */
const CeQuiADecide = lazy(() => import("./routes/CeQuiADecide.jsx"));
const QuiDecide = lazy(() => import("./routes/QuiDecide.jsx"));
const OuVaArgent = lazy(() => import("./routes/OuVaArgent.jsx"));
const Sources = lazy(() => import("./routes/Sources.jsx"));

const ONGLETS = [
  /* « CE QUI A ETE DECIDE » EST LE PREMIER ONGLET, et cet ordre est la decision.
     Les trois ecrans d'avant repondaient a des questions d'etat — qui, combien,
     d'ou — toutes vraies le mois suivant. Le fil date est le seul qui change, et
     c'est celui qui doit s'ouvrir. Le libelle est celui arrete en D-03 : le passe
     compose promet du verifiable, la ou « L'actualite » promettrait une fraicheur
     que la donnee publique ne tient pas. */
  { id: "decide", libelle: "Ce qui a été décidé", echelon: "ville", charge: () => import("./routes/CeQuiADecide.jsx") },
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

/* OU HABITEZ-VOUS — UN SEUL CHAMP, ET C'EST LA CORRECTION LA PLUS IMPORTANTE
 * DE CETTE VERSION.
 *
 * CE QUI N'ALLAIT PAS, MESURE LE 13/09/2026. Le premier ecran affichait les 104
 * departements deplies : 106 cibles cliquables sur 1,1 hauteur de telephone. Et
 * il fallait savoir qu'on habite « dans le 93 » AVANT de pouvoir taper
 * « Bagnolet ». Trois etapes du parcours sur dix n'existaient que parce que les
 * fichiers de donnees sont decoupes par departement : le decoupage avait fuite
 * dans l'interface.
 *
 * CE QUE FAIT CE COMPOSANT. Un champ, et il accepte les deux : une commune
 * d'Ile-de-France (l'index de la beta, 11 Ko) ou n'importe quel departement. Une
 * commune trouvee ouvre son departement toute seule. Rien n'est retire : les
 * 104 departements restent atteignables, replies sous une ligne.
 *
 * CE QU'IL NE FAIT PAS. Il ne compose aucune adresse avec un code de commune :
 * il en deduit deux caracteres — le departement — et c'est le fichier
 * departemental habituel qui part. Le serveur n'apprend donc jamais quelle
 * commune est lue. C'est l'invariant, et le banc le garde.
 *
 * POURQUOI DEUX GROUPES ETIQUETES et pas une liste unique : un citoyen qui tape
 * « 93 » doit voir que Repere lui propose UN DEPARTEMENT, pas une commune dont
 * le nom contiendrait 93. Les deux groupes sont tries alphabetiquement, sans
 * aucun ordre de valeur — l'invariant 3 interdit de classer des territoires. */
function Entree({ index, communesBeta, departement, onOuvrir, onCommuneDirecte, onSurvol }) {
  const [filtre, setFiltre] = useState("");
  const cherches = mots(filtre);

  const communes = useMemo(() => {
    if (!communesBeta || !communesBeta.communes) return [];
    return Object.entries(communesBeta.communes)
      .map(([insee, nom]) => [insee, nom, motsCible(nom)]);
  }, [communesBeta]);

  /* L'ORDRE DES RESULTATS EST CELUI DE LA RECHERCHE, PAS UN ORDRE DE VALEUR.
   *
   * Defaut trouve a l'oeil le 13/09/2026 : taper « paris » proposait
   * « Cormeilles-en-Parisis », puis « Fontenay-en-Parisis », puis Paris — parce
   * que « paris » est bien le debut du mot « Parisis » et que l'ordre etait
   * alphabetique. La commune la plus peuplee de France arrivait troisieme sur son
   * propre nom.
   *
   * On classe donc par PERTINENCE DE LA RECHERCHE : le nom exact d'abord, puis
   * ceux qui commencent par ce qui a ete tape, puis le reste — et l'ordre
   * alphabetique a l'interieur de chaque groupe. Ce n'est pas un ordre
   * d'importance entre territoires, que l'invariant 3 interdit : c'est la reponse
   * a ce que le lecteur vient d'ecrire, et elle ne depend d'aucune propriete de la
   * commune — ni sa taille, ni sa population, ni rien qui la compare a une autre. */
  const rang = (nom) => {
    const n = mots(nom).join(" ");
    const q = cherches.join(" ");
    if (n === q) return 0;
    if (n.startsWith(q)) return 1;
    return 2;
  };
  const trouveesC = cherches.length
    ? communes.filter(([, , cible]) => correspond(cherches, cible))
        .sort((a, b) => rang(a[1]) - rang(b[1]) || a[1].localeCompare(b[1], "fr"))
        .slice(0, 30)
    : [];
  const trouvesD = cherches.length
    ? index.departements.filter(d => correspond(cherches, motsCible(d.code + " " + (d.nom || ""))))
    : [];
  const rien = cherches.length > 0 && trouveesC.length === 0 && trouvesD.length === 0;
  const nomDep = code => {
    const d = index.departements.find(x => x.code === code);
    return d && d.nom ? d.nom : "département " + code;
  };

  return (
    <div className="entree">
      <label className="champ">
        <span>Où habitez-vous ?</span>
        <input type="search" value={filtre} autoComplete="off"
          placeholder="Bagnolet, Créteil, Meaux…"
          onChange={e => setFiltre(e.target.value)} />
      </label>

      {rien ? (
        <Vide titre={`Rien ne correspond à « ${filtre.trim()} ».`}
          corps="Tapez le début du nom de votre commune. Hors d'Île-de-France, cherchez d'abord votre département — son nom ou son numéro." />
      ) : null}

      {trouveesC.length ? (
        <>
          <p className="groupe">Communes</p>
          <div className="rangee liste" role="group" aria-label="Communes trouvées">
            {trouveesC.map(([insee, nom]) => (
              <button key={insee} type="button" className="puce"
                onClick={() => onCommuneDirecte(insee.slice(0, 2), insee)}>
                <span className="pastille" style={{ background: "var(--e-ville)" }} aria-hidden="true" />
                <span className="puce-nom">{nom}</span>
                <span className="puce-code">{nomDep(insee.slice(0, 2))}</span>
              </button>
            ))}
          </div>
        </>
      ) : null}

      {trouvesD.length ? (
        <>
          <p className="groupe">Départements</p>
          <div className="rangee liste-dept" role="group" aria-label="Départements trouvés"
            onMouseLeave={annulerPrechargement} onBlur={annulerPrechargement}>
            {trouvesD.map(d => (
              <Puce key={d.code} actif={d.code === departement} echelon="dept"
                onClick={() => onOuvrir(d.code)} onSurvol={() => onSurvol(d.code)}>
                <span className="puce-code">{d.code}</span>
                {d.nom ? <span className="puce-nom">{d.nom}</span> : null}
              </Puce>
            ))}
          </div>
        </>
      ) : null}

      {/* LE MUR DE 104 PASTILLES NE S'OUVRE PLUS TOUT SEUL. Il reste atteignable
          en un geste, pour qui prefere parcourir plutot que taper — et pour les
          departements hors Ile-de-France, dont aucune commune n'est dans l'index. */}
      {!cherches.length ? (
        <details className="choix">
          <summary><span className="choix-libelle">Voir les {index.departements.length} départements publiés</span></summary>
          <div className="dedans-choix">
            <div className="rangee liste-dept" role="group" aria-label="Tous les départements publiés"
              onMouseLeave={annulerPrechargement} onBlur={annulerPrechargement}>
              {index.departements.map(d => (
                <Puce key={d.code} echelon="dept"
                  onClick={() => onOuvrir(d.code)} onSurvol={() => onSurvol(d.code)}>
                  <span className="puce-code">{d.code}</span>
                  {d.nom ? <span className="puce-nom">{d.nom}</span> : null}
                </Puce>
              ))}
            </div>
          </div>
        </details>
      ) : null}
    </div>
  );
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
  /* LA MEME REGLE QUE POUR LES DEPARTEMENTS, ET ELLE NE L'ETAIT PAS.
   *
   * Cette recherche faisait un simple `toLowerCase().includes()` : « Évry » ne
   * trouvait pas « Evry-Courcouronnes », et « epinay » cessait de trouver
   * « Épinay-sous-Sénart » des l'instant ou les libelles ont porte leurs accents.
   * Deux endroits derivaient la meme regle, et ils avaient diverge — la recherche
   * de departements, elle, normalise depuis le debut. Elles partagent desormais
   * `mots()` et `correspond()`.
   *
   * Mesure du 13/09/2026, avant correction : « Évry » 0 resultat, « Épinay »
   * 0 resultat, sur un departement qui compte les deux. */
  const communes = useMemo(
    () => Object.entries(paquet.communes).map(([insee, c]) => [insee, c, motsCible(c.nom)]),
    [paquet]);
  const cherches = mots(filtre);
  const trouvees = useMemo(() => {
    const base = cherches.length
      ? communes.filter(([, , cible]) => correspond(cherches, cible))
      : communes;
    /* Jamais d'ordre NUMERIQUE : ranger des territoires par un chiffre est
       interdit (invariant 3). Quand rien n'est tape, l'ordre est alphabetique —
       le seul qui ne dise rien de personne. Quand quelque chose est tape, la
       correspondance exacte passe devant, pour la meme raison qu'a l'ecran
       d'entree : « paris » doit proposer Paris avant Cormeilles-en-Parisis. */
    const rangC = nom => {
      const n = mots(nom).join(" "), q = cherches.join(" ");
      return n === q ? 0 : n.startsWith(q) ? 1 : 2;
    };
    return base.slice().sort((a, b) =>
      (cherches.length ? rangC(a[1].nom) - rangC(b[1].nom) : 0)
      || a[1].nom.localeCompare(b[1].nom, "fr"));
  }, [communes, filtre]);
  const vues = trouvees.slice(0, 60);

  /* LE SELECTEUR SE REPLIE DES QUE LA COMMUNE EST CHOISIE.
   *
   * MESURE DU 14/09/2026, A L'OEIL SUR CAPTURE : apres le choix, le selecteur de
   * departement, le champ de recherche et les TRENTE-NEUF pastilles de communes du
   * 93 occupaient encore environ deux hauteurs d'ecran AVANT le premier contenu, et
   * cela sur les QUATRE onglets. Le produit avait mesure et celebre « 106 cibles
   * cliquables ramenees a 2 » a l'ouverture ; il les avait laissees revenir des le
   * deuxieme ecran. C'est la correction la moins chere du rapport produit et celle
   * qui rend le plus de place : elle profite aux quatre ecrans a la fois.
   *
   * REPLIE, PAS SUPPRIME. Changer de commune reste a un clic, et le bouton dit
   * laquelle est ouverte — c'est la meme regle que pour le departement, dont la
   * liste se replie deja apres le choix. */
  const [deplie, setDeplie] = useState(!commune);
  const choisie = (commune && paquet.communes[commune] && paquet.communes[commune].nom) || "";
  if (!deplie && choisie) {
    return (
      <div className="choix-commune replie">
        <button type="button" className="depliant depliant-commune"
          onClick={() => { setDeplie(true); setFiltre(""); }}>
          <b>{choisie}</b> — changer de commune
        </button>
      </div>
    );
  }

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
                onClick={() => { onCommune(insee); setDeplie(false); setFiltre(""); }}>{com.nom}</button>
            ))}
          </div>
          <p className="note" role="status" aria-live="polite">
            {trouvees.length > vues.length
              ? `${trouvees.length.toLocaleString("fr-FR")} communes correspondent, les 60 premières sont affichées. Continuez à taper pour affiner.`
              : `${trouvees.length.toLocaleString("fr-FR")} commune${trouvees.length > 1 ? "s" : ""} ${cherches.length ? "trouvée" + (trouvees.length > 1 ? "s" : "") : "dans ce département"}.`}
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
  /* L'ONGLET OUVERT PAR DEFAUT RESTE « QUI DECIDE », ET CE N'EST PAS UN OUBLI.
     « Ce qui a ete decide » est le PREMIER onglet — l'ordre dit ce qui compte —
     mais il n'est pas encore celui qui s'ouvre. La collecte des projets finances
     n'a jamais tourne pour de vrai : elle ne peut pas s'executer depuis un poste
     de developpement, et les taches planifiees ne se declenchent que sur la
     branche par defaut. Faire atterrir chaque visiteur sur un ecran dont la
     couverture reelle n'a jamais ete mesuree serait un pari ; « Qui decide »,
     lui, est couvert a 100 % sur les huit departements.
     LA CONDITION POUR BASCULER EST ECRITE : quand la collecte aura tourne et que
     la couverture des projets aura ete mesuree sur les 1 262 communes de la beta,
     cette ligne devient useState("decide"). Voir la decision D-23. */
  const [onglet, setOnglet] = useState("qui");
  const [commune, setCommune] = useState(null);
  const [communesBeta, setCommunesBeta] = useState(null);

  useEffect(() => {
    let vivant = true;
    chargerIndex().then(r => {
      if (!vivant) return;
      setEtatIndex(r.etat);
      if (r.donnees) setIndex(r.donnees);
    });
    /* 11 Ko, en meme temps que l'index : sans lui, le premier ecran ne sait
       chercher que des departements. Son absence n'est pas bloquante — la
       recherche par departement continue de fonctionner. */
    chargerCommunesBeta().then(r => { if (vivant && r.donnees) setCommunesBeta(r.donnees); });
    return () => { vivant = false; };
  }, []);

  /* `insee` est FACULTATIF, et il ne sert qu'a selectionner la commune une fois
     le paquet arrive. Il n'entre dans aucune adresse : c'est `dep` seul qui part
     au reseau. */
  const ouvrir = useCallback(async (dep, insee) => {
    /* ENTRER DANS UN TERRITOIRE EST UNE ETAPE : le retour du telephone doit
       ramener a l'ecran d'entree, pas fermer l'application. On n'empile qu'a la
       PREMIERE entree — changer de departement ensuite reste au meme niveau,
       sinon dix changements demanderaient dix retours pour ressortir. */
    setDepartement(prec => {
      if (!prec) {
        entrer(() => { setDepartement(""); setPaquet(null); setCommune(null); setEtat(ETATS.ABSENT); });
      }
      return dep;
    });
    ecrireDepartement(dep);
    setEtat(ETATS.EN_COURS);
    setPaquet(null);
    setCommune(null);
    const r = await chargerDepartement(dep);
    setEtat(r.etat);
    setPaquet(r.donnees);
    /* On ne selectionne que si la commune est bien dans le paquet recu : un code
       venu d'un index plus recent que le fichier departemental ne doit pas
       produire un ecran vide. */
    if (insee && r.donnees && r.donnees.communes && r.donnees.communes[insee]) setCommune(insee);
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
        {/* AVANT UN CHOIX : un seul champ, qui accepte une commune ou un
            departement. APRES : la ligne repliee habituelle, pour changer. */}
        {index && !departement ? (
          <Entree index={index} communesBeta={communesBeta} departement={departement}
            onOuvrir={ouvrir} onCommuneDirecte={ouvrir} onSurvol={prechargerDepartement} />
        ) : null}
        {index && departement ? (
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
                  {onglet === "decide" && fiche ? <CeQuiADecide paquet={paquet} index={index} commune={commune} /> : null}
                  {onglet === "qui" && fiche ? <QuiDecide paquet={paquet} index={index} commune={commune} /> : null}
                  {onglet === "argent" && fiche ? <OuVaArgent paquet={paquet} index={index} commune={commune} /> : null}
                </Suspense>
              </main>
            </>
          ) : null}
        </>
      ) : (
        <p className="invite">Repère ne demande jamais votre adresse : le nom de votre commune suffit, et il ne quitte pas cet appareil.</p>
      )}
    </div>
  );
}
