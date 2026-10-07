import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chargement, Vide, Puce, DefinitionProvider } from "@repere/ui";
import { mots, motsCible, correspond, trouverCommunes, LIBELLES } from "@repere/core";
import {
  chargerIndex, chargerDepartement, chargerCommunesBeta, prechargerDepartement,
  annulerPrechargement, entrer, ETATS, PHRASES,
} from "@repere/data-utils";
import { NouvelleVersion } from "./NouvelleVersion.jsx";
import { Fraicheur } from "./Fraicheur.jsx";

/* CHARGEMENT PARESSEUX DES ÉCRANS. Chacun est un module séparé : ouvrir « Qui
   décide » ne télécharge pas le code de « Où va mon argent ». Le socle React est
   dans un morceau à part (voir vite.config.js). */
const CeQuiADecide = lazy(() => import("./routes/CeQuiADecide.jsx"));
const QuiDecide = lazy(() => import("./routes/QuiDecide.jsx"));
const OuVaArgent = lazy(() => import("./routes/OuVaArgent.jsx"));
const Sources = lazy(() => import("./routes/Sources.jsx"));
const Calendrier = lazy(() => import("./routes/Calendrier.jsx"));
const Aujourdhui = lazy(() => import("./routes/Aujourdhui.jsx"));

/* « AUJOURD'HUI » EST LE PREMIER ÉCRAN : le fil date répond directement à
   « qu'est-ce qui se passe chez moi ? ». Les autres écrans restent disponibles
   comme approfondissements. */
const ONGLETS = [
  { id: "aujourdhui", libelle: LIBELLES.aujourdhui, echelon: "ville", charge: () => import("./routes/Aujourdhui.jsx") },
  /* « CE QUI A ETE DECIDE » EST LE DEUXIEME ONGLET, et cet ordre est la decision.
     Les trois ecrans d'avant repondaient a des questions d'etat — qui, combien,
     d'ou — toutes vraies le mois suivant. Le fil date est le seul qui change, et
     c'est celui qui doit s'ouvrir. Le libelle est celui arrete en D-03 : le passe
     compose promet du verifiable, la ou « L'actualite » promettrait une fraicheur
     que la donnee publique ne tient pas. */
  { id: "decide", libelle: LIBELLES.decide, echelon: "ville", charge: () => import("./routes/CeQuiADecide.jsx") },
  { id: "qui", libelle: LIBELLES.qui, echelon: "ville", charge: () => import("./routes/QuiDecide.jsx") },
  { id: "argent", libelle: LIBELLES.argent, echelon: "dept", charge: () => import("./routes/OuVaArgent.jsx") },
  /* CALENDRIER, COMME SOURCES : PAS PROPRE A UNE COMMUNE. Le pilote du
     17/09/2026 ne publie que le Sénat — un echelon national, aucune raison
     d'attendre le choix d'une commune pour l'ouvrir. */
  { id: "calendrier", libelle: LIBELLES.calendrier, echelon: "france", charge: () => import("./routes/Calendrier.jsx") },
  { id: "sources", libelle: LIBELLES.sources, echelon: "france", charge: () => import("./routes/Sources.jsx") },
];
const ONGLETS_SANS_COMMUNE = new Set(["sources", "calendrier"]);

/* INVARIANT 2 : une seule clé, nommée, et rien d'autre. Ni compte, ni courriel,
   ni identifiant. La commune choisie, elle, ne survit PAS au rechargement, et
   c'est délibéré : elle désignerait le domicile du lecteur, ce que Repère
   refuse d'écrire sur son appareil.
 *
 * LA CLE PORTE DESORMAIS UN DEPARTEMENT ET UN INSTANT DE VISITE — decision
 * produit du 23/09/2026, prise pour "depuis votre derniere visite" (voir
 * Aujourdhui.jsx). Ce que cette ligne disait avant ("jamais un horodatage
 * d'usage") n'est plus vrai a la lettre, et c'est assume, pas glisse en
 * silence : cet horodatage ne designe AUCUN lieu (contrairement a la
 * commune, expressement exclue ci-dessus), ne quitte jamais l'appareil, et
 * ne sert qu'a distinguer "deja vu" de "nouveau" dans le calcul de faits
 * qui tourne deja pour "Ce qui a ete decide". Une seule cle, toujours ; ce
 * qu'elle contient a change. */
const CLE = "repere.departement";

function lireEtatStocke() {
  try {
    const brut = localStorage.getItem(CLE);
    if (!brut) return { d: "", v: null };
    try {
      const j = JSON.parse(brut);
      if (j && typeof j === "object" && typeof j.d === "string") {
        return { d: j.d, v: typeof j.v === "string" ? j.v : null };
      }
    } catch { /* ancien format : une chaine nue de departement, pas du JSON */ }
    return { d: brut, v: null }; /* compatibilite avec un lecteur deja installe avant ce jour */
  } catch { return { d: "", v: null }; } /* mode prive, quota, ou stockage desactive */
}
function lireDepartement() { return lireEtatStocke().d; }
function ecrireDepartement(d, v) {
  try { d ? localStorage.setItem(CLE, JSON.stringify({ d, v: v || null })) : localStorage.removeItem(CLE); }
  catch { /* mode privé */ }
}

/* LA REGLE DE RECHERCHE (mots, motsCible, correspond) VIT DANS @repere/core
   DEPUIS LE 29/09/2026 : l'application mobile cherche exactement comme le site. */
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
function Entree({ index, communesBeta, onBesoinCommunes, departement, onOuvrir, onCommuneDirecte, onSurvol }) {
  const [filtre, setFiltre] = useState("");
  const cherches = mots(filtre);

  const communes = useMemo(() => {
    if (!communesBeta || !communesBeta.communes) return [];
    return Object.entries(communesBeta.communes)
      .map(([insee, nom]) => [insee, nom, motsCible(nom)]);
  }, [communesBeta]);

  /* MEME DOCTRINE QU'A ChoixCommune (16/09/2026), POSEE ICI LE 22/09/2026.
   * Mesure en direct : taper "Ville-d'Avray" sur cet ecran — le premier —
   * repondait "Rien ne correspond... Hors d'Ile-de-France, cherchez d'abord
   * votre departement", alors que Ville-d'Avray EST en Ile-de-France, dans
   * les Hauts-de-Seine : elle manque seulement au Repertoire national des
   * elus, comme 320 autres communes en France. Meme donnee que
   * `paquet.manquantes` (extract-html.js), agregee ici pour les huit
   * departements de la beta — jamais une deuxieme regle qui pourrait diverger. */
  const manquantes = useMemo(() => {
    if (!communesBeta || !communesBeta.manquantes) return [];
    return Object.entries(communesBeta.manquantes)
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
  /* La regle de rang vit dans @repere/core (rangRecherche, trouverCommunes)
     depuis le 29/09/2026 : l'application mobile trouve les memes communes. */
  const trouveesC = trouverCommunes(communes, cherches);
  const trouvesD = cherches.length
    ? index.departements.filter(d => correspond(cherches, motsCible(d.code + " " + (d.nom || ""))))
    : [];
  const manquanteTrouvee = useMemo(() => {
    if (!cherches.length) return null;
    const m = manquantes.find(([, , cible]) => correspond(cherches, cible));
    return m ? m[1] : null;
  }, [manquantes, cherches]);
  const rien = cherches.length > 0 && trouveesC.length === 0 && trouvesD.length === 0 && !manquanteTrouvee;
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
          onFocus={onBesoinCommunes} onPointerDown={onBesoinCommunes}
          onChange={e => { if (onBesoinCommunes) onBesoinCommunes(); setFiltre(e.target.value); }} />
      </label>

      {manquanteTrouvee ? (
        <Vide titre={`${manquanteTrouvee} existe bien en Île-de-France : c'est nous qui n'avons pas encore sa fiche.`}
          corps="Le Répertoire national des élus ne porte aucune ligne pour cette commune. Ce n'est pas une erreur de votre part, et ce n'est pas la preuve que la commune n'existe pas." />
      ) : null}

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
function ChoixCommune({ paquet, nomDepartement, commune, onCommune, deplie, setDeplie }) {
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
  /* DOCTRINE DU 16/09/2026 : ABSENCE CHEZ NOUS N'EST PAS ABSENCE DANS LE MONDE.
   *
   * MESURE : chercher « Ville-d'Avray » dans le 92 rendait « Aucune commune du
   * departement 92 ne porte ce nom » — alors que Ville-d'Avray existe bel et
   * bien dans les Hauts-de-Seine, elle manque seulement au Repertoire national
   * des elus. Une commune officiellement nommee dans ce departement (voir
   * `paquet.manquantes`, pose par extract-html.js depuis le Code officiel
   * geographique) recoit donc une PHRASE DIFFERENTE d'une commune qui n'existe
   * nulle part sous ce nom — les deux causes ne sont pas la meme absence. */
  const manquantes = useMemo(
    () => Object.entries(paquet.manquantes || {}).map(([insee, nomOff]) => [insee, nomOff, motsCible(nomOff)]),
    [paquet]);
  const cherches = mots(filtre);
  const manquanteTrouvee = useMemo(() => {
    if (!cherches.length) return null;
    const m = manquantes.find(([, , cible]) => correspond(cherches, cible));
    return m ? m[1] : null;
  }, [manquantes, cherches]);
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
  /* REPLIE : PLUS RIEN ICI (29/09/2026). La commune choisie et le moyen d'en
     changer tiennent desormais sur UNE ligne, rendue par App (« .situe ») : voir
     le commentaire qui l'accompagne. L'etat « deplie » vit dans App, qui en a
     besoin pour montrer aussi le choix du departement. */
  const choisie = (commune && paquet.communes[commune] && paquet.communes[commune].nom) || "";
  if (!deplie && choisie) return null;

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
        manquanteTrouvee ? (
          <Vide titre={`${manquanteTrouvee} existe bien dans ce département : c'est nous qui n'avons pas encore sa fiche.`}
            corps="Le Répertoire national des élus ne porte aucune ligne pour cette commune. Ce n'est pas une erreur de votre part, et ce n'est pas la preuve que la commune n'existe pas." />
        ) : (
          <Vide titre={`Aucune commune du département ${paquet.d} ne porte ce nom.`}
            corps="Ce fichier ne contient que les communes de ce département. Si la vôtre est ailleurs, changez de département au-dessus." />
        )
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
  /* GELE UNE SEULE FOIS, AU PREMIER RENDU — AVANT que quoi que ce soit
   * n'ecrive dans le stockage. C'est ce qui permet de repondre a "depuis
   * QUAND" pour toute la duree de cette visite : si on relisait le
   * stockage plus tard, on y trouverait deja l'instant present, ecrit par
   * cette meme visite (voir vSessionRef ci-dessous), et "depuis votre
   * derniere visite" deviendrait "depuis il y a deux secondes". */
  const [derniereVisite] = useState(() => lireEtatStocke().v);
  /* L'INSTANT DE CETTE VISITE, A ECRIRE DESORMAIS A CHAQUE fois que la cle
   * est reecrite (un changement de departement, par exemple) — jamais mis
   * a jour APRES ce premier calcul : une seule "derniere visite" par
   * ouverture de l'application, pas une qui glisse a chaque interaction. */
  const vSessionRef = useRef(new Date().toISOString());
  const [paquet, setPaquet] = useState(null);
  const [etat, setEtat] = useState(ETATS.ABSENT);
  /* « AUJOURD'HUI » est l'écran ouvert par défaut. Les autres écrans restent disponibles comme approfondissements. */
  const [onglet, setOnglet] = useState("aujourdhui");
  const [commune, setCommune] = useState(null);
  // Dernière commune choisie pendant cette session uniquement. Elle ne quitte jamais cet appareil.
  const dernierChoixRef = useRef(null);
  /* Le choix de commune est-il ouvert ? Replie des qu'une commune est choisie ;
     rouvert par « changer ». Tant qu'il est ouvert, le choix du departement
     l'est aussi (on change de departement en changeant de commune). */
  const [choixOuvert, setChoixOuvert] = useState(true);
  const [communesBeta, setCommunesBeta] = useState(null);

  useEffect(() => {
    let vivant = true;
    chargerIndex().then(r => {
      if (!vivant) return;
      setEtatIndex(r.etat);
      if (r.donnees) setIndex(r.donnees);
    });
    return () => { vivant = false; };
  }, []);

  /* LA LISTE DES COMMUNES ARRIVE AU PREMIER CONTACT AVEC LE CHAMP — 07/10/2026.
     Mesure : le premier ecran pesait 119 Ko pour un plafond de 120 (57 Ko le
     23/09), dont 30 Ko de cette liste (et non plus 11) qui ne sert qu'a la
     recherche directe. Elle n'est pas necessaire pour AFFICHER l'ecran : elle
     part quand le lecteur touche ou remplit le champ « Ou habitez-vous ? ».
     Meme fichier pour tout le monde : le serveur n'apprend rien du lecteur.
     Une seule demande, quoi qu'il arrive ; son absence n'est pas bloquante —
     la recherche par departement continue de fonctionner. */
  const communesDemandees = useRef(false);
  const demanderCommunes = useCallback(() => {
    if (communesDemandees.current) return;
    communesDemandees.current = true;
    chargerCommunesBeta().then(r => { if (r.donnees) setCommunesBeta(r.donnees); });
  }, []);

  /* CHANGER D'ONGLET EST AUSSI UNE ETAPE, DEPUIS LE 18/09/2026. Mesure en
     navigateur reel la veille : passer de "Qui decide" a "Ou va l'argent" ne
     pousse rien dans l'historique, donc le retour du telephone ne defait rien
     — il ejecte carrement de Repere, ou ne fait rien de visible. Meme
     mecanisme que `ouvrir()` juste en dessous et que le depliant de vote dans
     QuiDecide.jsx : aucune URL ne bouge, aucun nom de commune n'entre dans
     l'historique (voir historique.js), seul un compteur est pousse. */
  const irA = useCallback((id) => {
    setOnglet(prec => {
      if (prec !== id) entrer(() => setOnglet(prec));
      return id;
    });
  }, []);

  /* `insee` est FACULTATIF, et il ne sert qu'a selectionner la commune une fois
     le paquet arrive. Il n'entre dans aucune adresse : c'est `dep` seul qui part
     au reseau. */
  const ouvrir = useCallback(async (dep, insee, restauration = false) => {
    /* ENTRER DANS UN TERRITOIRE EST UNE ETAPE : le retour du telephone doit
       ramener a l'ecran d'entree, pas fermer l'application. On n'empile qu'a la
       PREMIERE entree — changer de departement ensuite reste au meme niveau,
       sinon dix changements demanderaient dix retours pour ressortir. */
    setDepartement(prec => {
      if (!prec && !restauration) {
        entrer(() => {
          const dernier = dernierChoixRef.current;
          if (dernier) void ouvrir(dernier.dep, dernier.insee, true);
          else { setDepartement(""); setPaquet(null); setCommune(null); setEtat(ETATS.ABSENT); }
        });
      }
      return dep;
    });
    ecrireDepartement(dep, vSessionRef.current);
    setEtat(ETATS.EN_COURS);
    setPaquet(null);
    setCommune(null);
    if (!insee) dernierChoixRef.current = null;
    setChoixOuvert(true);
    const r = await chargerDepartement(dep);
    setEtat(r.etat);
    setPaquet(r.donnees);
    /* On ne selectionne que si la commune est bien dans le paquet recu : un code
       venu d'un index plus recent que le fichier departemental ne doit pas
       produire un ecran vide. */
    if (insee && r.donnees && r.donnees.communes && r.donnees.communes[insee]) {
      setCommune(insee);
      dernierChoixRef.current = { dep, insee };
      setChoixOuvert(false);
    }
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
    <DefinitionProvider>
    <div className="app">
      {/* L'EN-TETE SE FAIT PETIT UNE FOIS LA COMMUNE CHOISIE — 28/09/2026. Mesure a
          390 px : titre, chapeau et selecteurs occupaient environ 460 px sur 800
          sur CHAQUE ecran, et le contenu commencait sous la ligne de flottaison.
          La promesse (« rien ne quitte votre appareil ») reste lue au premier
          ecran, la ou elle decide de l'usage ; ensuite, la place revient a ce
          que le lecteur est venu voir. */}
      <header className={"entete" + (fiche ? " compacte" : "")}>
        <p className="eyebrow">Repère</p>
        <h1>Qui décide chez vous, et où va votre argent.</h1>
        {fiche ? null : (
          <p className="chapeau">
            Les élus, les comptes et la circonscription de votre commune, à partir des sources
            officielles. Aucun compte, aucun courriel, rien ne quitte votre appareil.
          </p>
        )}
      </header>

      <NouvelleVersion />
      <Fraicheur />

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
          <Entree index={index} communesBeta={communesBeta} onBesoinCommunes={demanderCommunes} departement={departement}
            onOuvrir={ouvrir} onCommuneDirecte={ouvrir} onSurvol={prechargerDepartement} />
        ) : null}
        {/* OU SUIS-JE, EN UNE LIGNE (29/09/2026). Mesure a 360 et 390 px, commune
            choisie : trois lignes disaient la meme chose — « Departement 93 ·
            Seine-Saint-Denis — changer », « Aubervilliers — changer de commune »,
            « Aubervilliers · Seine-Saint-Denis (93) » — soit environ 230 px avant
            la barre des ecrans, sur CHAQUE ecran. Une fois la commune choisie, le
            choix du departement se replie avec celui de la commune, derriere un
            seul « changer ». Rien n'est retire : « changer » rouvre les deux. */}
        {index && departement && (!fiche || choixOuvert) ? (
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
                commune={commune} onCommune={setCommune}
                deplie={choixOuvert || !fiche} setDeplie={setChoixOuvert} />

              {/* JE SUIS OÙ. Une seule ligne, toujours au même endroit, qui ne
                  bouge plus quand on change d'onglet — et qui porte le moyen d'en
                  changer, commune comme département. */}
              {fiche ? (
                <p className="situe" role="status" aria-live="polite">
                  <b>{fiche.nom}</b> · {nomDepartement ? nomDepartement + " (" + paquet.d + ")" : "département " + paquet.d}
                  {!choixOuvert ? (
                    <> {" "}<button type="button" className="situe-changer"
                      onClick={() => setChoixOuvert(true)}>changer</button></>
                  ) : null}
                </p>
              ) : null}

              {/* LIEN DE RETOUR VERS « AUJOURD'HUI » (ecran par defaut depuis
                  la PR #79). Deux choses a savoir :
                  1. "Aujourd'hui" n'est JAMAIS un bouton de plus dans la barre
                     classique. Le premier essai (sixieme bouton parmi les cinq
                     autres) a immediatement reproduit la regression mesuree le
                     17/09 — six boutons au lieu de cinq, le maire encore plus
                     enfoui.
                  2. Sur "Aujourd'hui", la barre classique disparait et ce lien
                     aussi : on en sort par ses boutons « Toutes les decisions »,
                     « Qui decide »... Sur les autres ecrans, ce lien y ramene. */}
              {onglet !== "aujourdhui" && fiche ? (
                <button type="button" className="auj-retour" onClick={() => irA("aujourdhui")}>
                  Voir aujourd'hui à {fiche.nom} →
                </button>
              ) : null}
              {onglet !== "aujourdhui" ? (
                <nav className="onglets" aria-label="Ce que vous voulez savoir">
                  {ONGLETS.filter(o => o.id !== "aujourdhui").map(o => (
                    <button key={o.id} type="button"
                      className={"onglet" + (onglet === o.id ? " actif" : "")}
                      aria-current={onglet === o.id ? "page" : undefined}
                      onMouseEnter={o.charge} onFocus={o.charge}
                      onClick={() => { o.charge(); irA(o.id); }}>
                      {o.libelle}
                    </button>
                  ))}
                </nav>
              ) : null}

              <main>
                <Suspense fallback={<Chargement titre="Ouverture de l'écran."
                  corps="Le code de cet écran est téléchargé à la demande, une seule fois." />}>
                  {onglet === "sources" ? <Sources index={index} paquet={paquet} /> : null}
                  {onglet === "calendrier" ? <Calendrier /> : null}
                  {!ONGLETS_SANS_COMMUNE.has(onglet) && !fiche ? (
                    <p className="invite">
                      Choisissez votre commune ci-dessus : Repère affichera ses élus, sa
                      circonscription et ses comptes.
                    </p>
                  ) : null}
                  {onglet === "aujourdhui" && fiche ? (
                    <Aujourdhui paquet={paquet} index={index} commune={commune} aller={irA}
                      derniereVisite={derniereVisite} />
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
    </DefinitionProvider>
  );
}
