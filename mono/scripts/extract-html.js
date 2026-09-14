/* Extraction : du fichier mono-HTML vers des JSON par département.
 *
 * CE QUE LE SQUELETTE FAISAIT, ET POURQUOI ÇA NE POUVAIT PAS MARCHER. La version
 * fournie cherchait `document.querySelectorAll("[data-department]")`. Mesuré sur
 * app_repere_v18_20.html (17,3 Mo) : ZÉRO nœud porte cet attribut. Les données
 * de Repère ne sont pas dans le DOM — elles sont dans trois affectations
 * JavaScript sur une ligne chacune, entre marqueurs :
 *     window.REPERE_RNE    élus            6,78 Mo
 *     window.REPERE_OFGL   comptes         8,83 Mo
 *     window.REPERE_CIRCOS circonscriptions 342 Ko
 * Le script aurait donc produit un index.json vide, sans erreur, tous les jours.
 * On lit les blocs, pas le balisage — et on n'a besoin ni de jsdom ni d'aucune
 * dépendance : une expression rationnelle sur une ligne suffit, et 17 Mo passent
 * en flux plutôt que dans un arbre DOM.
 *
 * LA RÈGLE DU CODE DE DÉPARTEMENT EST ÉCRITE ICI ET NULLE PART AILLEURS. Deux
 * endroits qui la dérivent finissent par diverger : c'est arrivé, et 65 communes
 * du Pacifique recevaient un 404.
 *
 * Usage : node scripts/extract-html.js [chemin/app.html] [dossier/sortie]
 */
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

/* LES NOMS DES TERRITOIRES NE SONT PAS DANS LE FICHIER D'ORIGINE.
 *
 * Il ne connait que les codes. Le premier ecran demandait donc au lecteur de
 * savoir que sa commune est « dans le 64 ». Les noms viennent d'un fichier
 * releve une fois aupres de sources officielles (voir scripts/noms-territoires.json,
 * qui porte ses sources et ses licences) et sont fondus dans index.json : le
 * build ne touche pas au reseau, et l'application ne demande pas un fichier de
 * plus. Si le fichier manque, l'extraction continue sans les noms — les codes
 * seuls restent justes. */
const ICI = path.dirname(fileURLToPath(import.meta.url));
function nomsTerritoires() {
  const f = path.join(ICI, "noms-territoires.json");
  if (!fs.existsSync(f)) { console.warn("noms-territoires.json absent : index.json n'aura que les codes"); return null; }
  try { return JSON.parse(fs.readFileSync(f, "utf8")); }
  catch (e) { console.error("noms-territoires.json illisible : " + e.message); process.exit(6); }
}

/* LE DEPUTE ELU N'EST PAS DANS LE FICHIER D'ORIGINE NON PLUS.
 *
 * Le fichier mono-HTML porte la circonscription d'une commune ; il ne dit pas
 * qui y a ete elu, et le Repertoire national des elus ne porte pas ce lien.
 * L'Assemblee nationale, elle, le publie. Le releve est versionne dans
 * scripts/deputes.json AVEC son producteur, sa licence, sa legislature et sa
 * date : sans ces quatre choses, l'invariant 4 interdit de l'afficher. Il est
 * recopie dans data/deputes.json — le build ne touche pas au reseau, et la
 * chaine publique reconstruit le meme fichier. */
function relevesDeputes() {
  const f = path.join(ICI, "deputes.json");
  if (!fs.existsSync(f)) { console.warn("deputes.json absent : aucun depute ne sera publie"); return null; }
  let d;
  try { d = JSON.parse(fs.readFileSync(f, "utf8")); }
  catch (e) { console.error("deputes.json illisible : " + e.message); process.exit(7); }
  const s = d && d.source;
  /* Un fichier sans source ne s'affiche pas : mieux vaut echouer au build que
     publier un nom d'elu que rien ne date ni ne rattache a un producteur. */
  if (!s || !s.producteur_affiche || !s.licence || !s.releve_le || !s.legislature) {
    console.error("deputes.json sans producteur, licence, legislature ou date");
    process.exit(7);
  }
  if (!d.deputes || !Object.keys(d.deputes).length) {
    console.error("deputes.json ne porte aucun depute");
    process.exit(7);
  }
  return d;
}

/* LES VOTES : LE CHAINON QUI MANQUAIT ENTRE UNE COMMUNE ET CE QUI SE DECIDE.
 *
 * Une commune donne une circonscription, une circonscription donne un depute :
 * jusqu'ici la chaine s'arretait au nom. Elle continue maintenant jusqu'a ce que
 * ce depute a VOTE — c'est la seule chose que l'electeur ne peut pas obtenir
 * ailleurs en moins de dix minutes.
 *
 * CE FICHIER NE PORTE PAS DE JUGEMENT, ET LE FORMAT L'INTERDIT : aucune somme,
 * aucun taux, aucun compte par depute. Une position par scrutin, dans l'ordre du
 * catalogue, et le lien vers le scrutin officiel. Le releve amont (scrutins_an.py)
 * ecarte deja les non-votants : un silence dans ce fichier veut dire « la source
 * ne porte pas de position pour ce depute sur ce scrutin », jamais « absent ».
 *
 * Comme pour les deputes : sans producteur, licence, url et date, on n'ecrit rien. */
function relevesScrutins() {
  const f = path.join(ICI, "scrutins.json");
  if (!fs.existsSync(f)) { console.warn("scrutins.json absent : aucun vote ne sera publie"); return null; }
  let d;
  try { d = JSON.parse(fs.readFileSync(f, "utf8")); }
  catch (e) { console.error("scrutins.json illisible : " + e.message); process.exit(8); }
  const s = d && d.source;
  if (!s || !s.producteur_affiche || !s.licence || !s.url || !s.releve_le || !s.legislature) {
    console.error("scrutins.json sans producteur, licence, url, legislature ou date");
    process.exit(8);
  }
  if (!Array.isArray(d.r) || !d.r.length || !Array.isArray(d.acteurs) || !d.acteurs.length) {
    console.error("scrutins.json ne porte aucun scrutin");
    process.exit(8);
  }
  return d;
}

/* LES PROJETS FINANCES PAR L'ETAT — le premier fait DATE du produit.
 *
 * Jusqu'ici Repere ne montrait que des etats : qui est maire, combien depense la
 * commune. Rien ne changeait entre deux visites, et rien ne justifiait de rouvrir
 * l'application. Un projet finance porte un intitule, un montant et une annee :
 * c'est le premier objet que l'on peut ranger dans le temps.
 *
 * LA MAILLE EST LE DEPARTEMENT, comme pour les votes, et pour la meme raison :
 * une adresse par commune dirait au serveur ou habite celui qui lit. Le paquet
 * departemental porte les projets de toutes ses communes ; le navigateur choisit.
 *
 * L'INTITULE EST RECOPIE MOT POUR MOT. La source ecrit « Renovation de la halle
 * du Montfort » sans accents : les remettre serait reecrire un intitule officiel.
 *
 * Comme partout : sans producteur, licence, url et date, on n'ecrit rien. Mais
 * l'absence du fichier n'arrete PAS le build — elle retire l'ecran date, elle ne
 * casse pas le reste du produit. Voir outils/projets_etat.py. */
function relevesProjets() {
  const f = path.join(ICI, "projets.json");
  if (!fs.existsSync(f)) { console.warn("::warning::projets.json absent : aucun projet finance ne sera publie (voir outils/projets_etat.py)"); return null; }
  let d;
  try { d = JSON.parse(fs.readFileSync(f, "utf8")); }
  catch (e) { console.error("projets.json illisible : " + e.message); process.exit(10); }
  const s = d && d.source;
  if (!s || !s.producteur_affiche || !s.licence || !s.url || !s.releve_le) {
    console.error("projets.json sans producteur, licence, url ou date");
    process.exit(10);
  }
  if (!d.communes || !Object.keys(d.communes).length) {
    console.error("projets.json ne porte aucune commune");
    process.exit(10);
  }
  return d;
}

/* LE NOM DE LA COMMUNE, TEL QU'IL S'ECRIT.
 *
 * Le Repertoire national des elus ecrit les communes EN CAPITALES ; le produit les
 * recapitalisait lettre par lettre, et cette transformation etait fautive pour UNE
 * COMMUNE SUR QUATRE — 9 198 sur 34 637, mesure du 13/09/2026. Deux fautes :
 * « Choisy-Le-Roi » au lieu de « Choisy-le-Roi », et « Evry-Courcouronnes » au lieu
 * d'« Évry-Courcouronnes ». La premiere se corrigerait avec une liste de mots ; la
 * seconde, non — aucune regle ne sait qu'Evry prend un accent et Ermont pas. On
 * prend donc le libelle officiel entier, ou on ne touche a rien.
 *
 * SANS SOURCE, PAS DE SUBSTITUTION : le fichier doit porter producteur, licence et
 * date, sinon on garde les noms d'origine et on le dit. Voir outils/noms_communes.py. */
function nomsOfficiels() {
  const f = path.join(ICI, "noms-communes.json");
  if (!fs.existsSync(f)) { console.warn("::warning::noms-communes.json absent : les noms de communes restent ceux du Repertoire national des elus"); return null; }
  let d;
  try { d = JSON.parse(fs.readFileSync(f, "utf8")); }
  catch (e) { console.error("noms-communes.json illisible : " + e.message); process.exit(9); }
  const s = d && d.source;
  if (!s || !s.producteur_affiche || !s.licence || !s.releve_le || !d.noms) {
    console.error("noms-communes.json sans producteur, licence, date ou libelles");
    process.exit(9);
  }
  return d;
}

/* LES HUIT DEPARTEMENTS DE LA BETA. Ecrits une fois, ici, et repris par le banc :
   deux listes qui divergent produiraient un index incomplet que rien ne verrait. */
const BETA = ["75", "77", "78", "91", "92", "93", "94", "95"];

const ENTREE = process.argv[2] || "./input/index.html";
const SORTIE = process.argv[3] || "./data";

const BLOCS = ["REPERE_RNE", "REPERE_OFGL", "REPERE_CIRCOS"];

/* MÊME RÈGLE QUE L'APPLICATION, mot pour mot :
   c.startsWith("97") || c.startsWith("98") ? c.slice(0,3) : c.slice(0,2) */
export function departementDe(insee) {
  const c = String(insee);
  return (c.startsWith("97") || c.startsWith("98")) ? c.slice(0, 3) : c.slice(0, 2);
}

async function lireBlocs(fichier) {
  if (!fs.existsSync(fichier)) {
    console.error("source absente : " + fichier);
    process.exit(2);
  }
  const trouves = {};
  const flux = readline.createInterface({
    input: fs.createReadStream(fichier, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });
  for await (const ligne of flux) {
    for (const nom of BLOCS) {
      if (trouves[nom]) continue;
      const prefixe = "window." + nom + " = ";
      if (ligne.startsWith(prefixe)) {
        const brut = ligne.slice(prefixe.length).replace(/;\s*$/, "");
        try { trouves[nom] = JSON.parse(brut); }
        catch (e) { console.error("bloc " + nom + " illisible : " + e.message); process.exit(3); }
      }
    }
    if (BLOCS.every(n => trouves[n])) break;
  }
  return trouves;
}

function ecrire(fichier, valeur) {
  fs.mkdirSync(path.dirname(fichier), { recursive: true });
  fs.writeFileSync(fichier, JSON.stringify(valeur));
  return fs.statSync(fichier).size;
}

async function extraire() {
  const { REPERE_RNE: RNE, REPERE_OFGL: OFGL, REPERE_CIRCOS: CIRCOS } = await lireBlocs(ENTREE);
  if (!RNE) { console.error("bloc REPERE_RNE introuvable — ce fichier n'est pas une application Repere."); process.exit(4); }

  const libelles = RNE.cl || {};
  const communesOfgl = (OFGL && OFGL.ech && OFGL.ech.commune && OFGL.ech.commune.terr) || {};
  const circos = (CIRCOS && CIRCOS.communes) || {};

  /* Les tables de noms sont partagées et indexées globalement : une tranche qui
     ne porterait que des index serait inutilisable. On MATÉRIALISE les noms dans
     chaque paquet — quelques kilo-octets de plus, et plus aucune classe de panne
     où une fiche affiche le nom de quelqu'un d'autre. */
  const nom = (p, n) => [(RNE.p || [])[p], (RNE.n || [])[n]].filter(Boolean).join(" ");
  const fonction = f => (RNE.f || [])[f] || "";

  /* Lu AVANT la boucle qui remplit les paquets : c'est elle qui s'en sert. */
  const officiels = nomsOfficiels();
  let redresses = 0;
  const sansLibelleOfficiel = [];
  const paquets = new Map();
  for (const insee of Object.keys(libelles)) {
    const d = departementDe(insee);
    if (!paquets.has(d)) paquets.set(d, { d, communes: {} });
    const maire = (RNE.com || {})[insee];
    /* Le libelle officiel s'il existe, celui du Repertoire sinon — jamais un
       melange des deux, et jamais un nom fabrique. Les cas sans correspondance
       sont comptes et annonces plus bas. */
    const officiel = officiels && officiels.noms[insee];
    if (officiel && officiel !== libelles[insee]) redresses++;
    else if (!officiel) sansLibelleOfficiel.push(insee);
    paquets.get(d).communes[insee] = {
      nom: officiel || libelles[insee],
      maire: maire ? { nom: nom(maire[0], maire[1]), fonction: fonction(maire[2]) } : null,
      adjoints: ((RNE.adj || {})[insee] || []).length,
      circo: circos[insee] !== undefined ? circos[insee] : null,
      comptes: communesOfgl[insee] ? communesOfgl[insee].ex : null,
    };
  }

  /* LES LIBELLES DE SOURCE SONT DU TEXTE AFFICHE.
   *
   * Un des trois blocs porte son libelle sans accents (« Ministere de
   * l'Interieur — communes et cantons par circonscription legislative ») et
   * l'ecran « Sources » le rendait tel quel. La regle du projet est explicite :
   * les commentaires du code sont sans accents, le texte affiche jamais.
   * On ne renomme personne : seuls les mots de la table ci-dessous sont touches,
   * un mot absent de la table est recopie tel quel. Un controle statique relit
   * data/index.json et echoue si un libelle affiche reste sans accents. */
  const ACCENTS = {
    Ministere: "Ministère", ministere: "ministère",
    Interieur: "Intérieur", interieur: "intérieur",
    legislative: "législative", legislatives: "législatives",
    Repertoire: "Répertoire", repertoire: "répertoire",
    elus: "élus", Elus: "Élus",
    donnees: "données", Donnees: "Données",
    generale: "générale", Generale: "Générale",
    decoupage: "découpage", Decoupage: "Découpage",
    financiere: "financière", publiques: "publiques",
  };
  const reaccentuer = t => String(t || "").replace(/[A-Za-z]+/g, m => ACCENTS[m] || m);

  const noms = nomsTerritoires();
  const deputes = relevesDeputes();
  const scrutins = relevesScrutins();
  const projets = relevesProjets();
  const meta = {
    v: 1,
    genere_le: new Date().toISOString().slice(0, 10),
    sources: {
      elus: (RNE.meta && { producteur: reaccentuer(RNE.meta.producteur), licence: RNE.meta.licence, maj: RNE.meta.maj }) || null,
      comptes: (OFGL && OFGL.meta && { producteur: reaccentuer(OFGL.meta.producteur), licence: OFGL.meta.licence, maj: OFGL.meta.maj }) || null,
      circonscriptions: (CIRCOS && { producteur: reaccentuer(CIRCOS.source), licence: CIRCOS.licence, decoupage: CIRCOS.decoupage }) || null,
      territoires: (noms && noms.sources) || null,
      /* Les libelles de communes ont leur propre producteur, distinct de celui des
         elus : ce sont deux jeux de donnees, releves a deux dates. */
      communes: (officiels && {
        producteur: officiels.source.producteur_affiche,
        licence: officiels.source.licence,
        url: officiels.source.url,
        portee: officiels.source.portee,
        releve_le: officiels.source.releve_le,
      }) || null,
      /* La source des deputes est annoncee dans l'index — donc sur l'ecran
         « Sources » — meme si le fichier des deputes, lui, n'est demande que
         par l'ecran qui l'affiche. */
      deputes: (deputes && {
        producteur: deputes.source.producteur_affiche,
        licence: deputes.source.licence,
        url: deputes.source.url,
        legislature: deputes.source.legislature,
        portee: deputes.source.portee,
        releve_le: deputes.source.releve_le,
      }) || null,
      /* Annoncee sur l'ecran « Sources » comme les autres, meme si le catalogue
         des scrutins n'est demande que par l'ecran qui l'affiche. */
      scrutins: (scrutins && {
        producteur: scrutins.source.producteur_affiche,
        licence: scrutins.source.licence,
        url: scrutins.source.url,
        legislature: scrutins.source.legislature,
        portee: scrutins.source.portee,
        releve_le: scrutins.source.releve_le,
      }) || null,
      /* La source des projets finances porte DEUX dates a ne pas confondre :
         `mis_a_jour_le`, quand l'Etat a publie, et `releve_le`, quand Repere est
         alle le chercher. L'ecran affiche la premiere — c'est celle qui dit
         l'age du fait — et « Sources » les montre toutes les deux. */
      projets: (projets && {
        producteur: projets.source.producteur_affiche,
        producteur_citoyen: projets.source.producteur_citoyen,
        licence: projets.source.licence,
        url: projets.source.url,
        exercices: projets.source.exercices,
        mis_a_jour_le: projets.source.mis_a_jour_le,
        releve_le: projets.source.releve_le,
      }) || null,
    },
    agregats: (OFGL && OFGL.meta && OFGL.meta.agregats) || [],
  };

  const departements = [...paquets.keys()].sort();
  const tailles = {};
  for (const d of departements) {
    tailles[d] = ecrire(path.join(SORTIE, "departments", d + ".json"), paquets.get(d));
  }
  const index = {
    ...meta,
    departements: departements.map(d => {
      const t = noms && noms.territoires ? noms.territoires[d] : null;
      return {
        code: d,
        /* Un code sans nom garde le code : on n'invente pas de libelle. */
        ...(t ? { nom: t.nom, type: t.type } : {}),
        communes: Object.keys(paquets.get(d).communes).length,
        octets: tailles[d],
      };
    }),
  };
  ecrire(path.join(SORTIE, "index.json"), index);

  /* Le fichier des deputes est publie A PART, et pas fondu dans index.json :
     l'index part au premier ecran, ce fichier ne part que si le lecteur ouvre
     « Qui decide ». Il emporte sa source avec lui, pour que l'ecran n'ait pas a
     aller la chercher ailleurs. */
  let octetsDeputes = 0;
  if (deputes) {
    octetsDeputes = ecrire(path.join(SORTIE, "deputes.json"), {
      v: 1,
      source: index.sources.deputes,
      deputes: deputes.deputes,
    });
  }

  /* LES VOTES, PUBLIES EN DEUX MORCEAUX, ET C'EST LE POINT DE L'AFFAIRE.
   *
   *   data/scrutins.json        le catalogue : ce sur quoi on a vote. Commun a
   *                             toute la France, aucune position dedans.
   *   data/scrutins/{dep}.json  les positions des SEULS deputes de ce
   *                             departement, dans l'ordre du catalogue.
   *
   * Pourquoi pas un seul fichier : 80 scrutins x 577 deputes, c'est 90 Ko envoyes
   * a quelqu'un qui veut lire UNE ligne. Decoupe par departement, la Seine-Saint-
   * Denis pese moins de deux kilo-octets. La maille reste le departement — jamais
   * la commune, jamais le depute : le serveur ne doit pas apprendre qui on lit.
   *
   * LE FORMAT DES POSITIONS est une chaine d'un caractere par scrutin, dans
   * l'ordre du catalogue : p (pour), c (contre), a (abstention), . (la source ne
   * porte pas de position). Une chaine de 80 caracteres remplace 80 objets, et
   * surtout elle rend impossible d'y ranger autre chose qu'une position — pas de
   * place pour un compte, un taux ou un rang. */
  let octetsScrutins = 0, positionsEcrites = 0;
  const depsAvecVotes = [];
  if (scrutins && deputes) {
    const catalogue = scrutins.r.map(e => ({
      u: e.u, n: e.n, d: e.d, t: e.t, s: e.s, sl: e.sl, tv: e.tv, dec: e.dec, nv: e.nv,
    }));
    octetsScrutins = ecrire(path.join(SORTIE, "scrutins.json"), {
      v: 1,
      source: index.sources.scrutins,
      url_scrutin: scrutins.source.url_scrutin,
      ecarte: scrutins.source.ecarte,
      total_source: scrutins.total_source,
      scrutins: catalogue,
    });

    /* Position de chaque acteur, scrutin par scrutin, avant tout decoupage. */
    const parActeur = new Map();
    scrutins.r.forEach((e, i) => {
      for (const [champ, lettre] of [["p", "p"], ["c", "c"], ["a", "a"]]) {
        for (const idx of e[champ] || []) {
          const ref = scrutins.acteurs[idx];
          if (!ref) continue;
          if (!parActeur.has(ref)) parActeur.set(ref, new Array(scrutins.r.length).fill("."));
          parActeur.get(ref)[i] = lettre;
        }
      }
    });

    /* Un depute appartient au departement de sa circonscription : la cle du
       fichier des mandats porte les deux (« 93-6 »). Aucune autre derivation. */
    const parDep = new Map();
    for (const [cle, d] of Object.entries(deputes.deputes)) {
      const dep = cle.slice(0, cle.lastIndexOf("-"));
      if (!d.acteurRef || !parActeur.has(d.acteurRef)) continue;
      if (!parDep.has(dep)) parDep.set(dep, {});
      parDep.get(dep)[d.acteurRef] = parActeur.get(d.acteurRef).join("");
    }
    for (const dep of [...parDep.keys()].sort()) {
      ecrire(path.join(SORTIE, "scrutins", dep + ".json"), {
        v: 1, d: dep, releve_le: scrutins.source.releve_le, positions: parDep.get(dep),
      });
      depsAvecVotes.push(dep);
      positionsEcrites += Object.keys(parDep.get(dep)).length;
    }
  }

  /* LES PROJETS, DECOUPES PAR DEPARTEMENT.
   *
   *   data/projets/{dep}.json   { insee : [ {annee, dispositif, intitule,
   *                               subvention, cout} ] }
   *
   * On ne trie RIEN ici, et c'est voulu : le fil est ordonne dans le navigateur,
   * par annee decroissante puis dans l'ordre ou l'Etat publie ses lignes. Trier
   * par montant mettrait le plus gros projet en tete, et l'ecran le presenterait
   * comme un ordre d'importance.
   *
   * Le code INSEE ne sert que de cle A L'INTERIEUR du fichier : il n'entre dans
   * aucune adresse. C'est ce que garde l'invariant 2. */
  const depsAvecProjets = [];
  let projetsEcrits = 0;
  /* UNE DONNEE DONT LA SOURCE A DISPARU NE DOIT PAS SURVIVRE AU RELEVE.
     Trouve par le banc le 14/09/2026 : projets.json retire, l'extraction a
     poursuivi sans lui — et data/projets/ est reste sur le disque avec ses
     fichiers de la veille, publies, pendant qu'index.json ne declarait plus
     aucune source pour eux. C'est la faute exacte que l'invariant 4 existe pour
     empecher, et elle etait invisible : les fichiers etaient valides, seulement
     orphelins. On efface donc ce qui n'a plus de source, et on le dit. */
  if (!projets && fs.existsSync(path.join(SORTIE, "projets"))) {
    fs.rmSync(path.join(SORTIE, "projets"), { recursive: true, force: true });
    console.warn("::warning::data/projets efface : le releve a disparu, ses fichiers ne doivent pas lui survivre");
  }
  if (projets) {
    const parDepProjets = new Map();
    for (const [insee, liste] of Object.entries(projets.communes)) {
      if (!Array.isArray(liste) || !liste.length) continue;
      /* Le departement d'un code INSEE : deux caracteres, trois en outre-mer.
         Aucune autre derivation, et une commune hors des paquets connus est
         ecartee plutot que rangee au hasard. */
      const dep = insee.startsWith("97") ? insee.slice(0, 3) : insee.slice(0, 2);
      if (!paquets.has(dep)) continue;
      if (!parDepProjets.has(dep)) parDepProjets.set(dep, {});
      parDepProjets.get(dep)[insee] = liste;
    }
    for (const dep of [...parDepProjets.keys()].sort()) {
      ecrire(path.join(SORTIE, "projets", dep + ".json"), {
        v: 1, d: dep,
        mis_a_jour_le: projets.source.mis_a_jour_le,
        releve_le: projets.source.releve_le,
        exercices: projets.source.exercices,
        dispositifs: projets.dispositifs || {},
        communes: parDepProjets.get(dep),
      });
      depsAvecProjets.push(dep);
      projetsEcrits += Object.values(parDepProjets.get(dep))
        .reduce((n, l) => n + l.length, 0);
    }
  }

  /* CONTRÔLE INDÉPENDANT : on relit ce qu'on vient d'écrire, sans réutiliser une
     variable d'au-dessus. Son absence côté comptes a déjà laissé passer 103
     fichiers vides pendant des jours. */
  let relues = 0;
  for (const d of departements) {
    const p = JSON.parse(fs.readFileSync(path.join(SORTIE, "departments", d + ".json"), "utf8"));
    relues += Object.keys(p.communes).length;
  }
  if (relues !== Object.keys(libelles).length) {
    console.error(`ECHEC : ${relues} communes reparties pour ${Object.keys(libelles).length} attendues`);
    process.exit(5);
  }

  const octets = Object.values(tailles).sort((a, b) => a - b);
  const median = octets[Math.floor(octets.length / 2)];
  console.log("departements          : " + departements.length);
  console.log("communes reparties    : " + relues);
  console.log("departement median    : " + Math.round(median / 1024) + " Ko");
  console.log("le plus lourd         : " + Math.round(octets[octets.length - 1] / 1024) + " Ko");
  console.log("source d'origine      : " + Math.round(fs.statSync(ENTREE).size / 1048576) + " Mo");
  /* CONTROLE INDEPENDANT DU LIEN COMMUNE -> CIRCONSCRIPTION -> DEPUTE.
     Il relit les DEUX fichiers ecrits sur le disque, sans reutiliser une
     variable d'au-dessus, et compte les communes dont la circonscription unique
     trouve un depute. Un jour ou le format des cles changera, ce compte
     tombera a zero et le dira — l'ecran, lui, ne dirait rien. */
  if (deputes) {
    const relu = JSON.parse(fs.readFileSync(path.join(SORTIE, "deputes.json"), "utf8"));
    const cles = Object.keys(relu.deputes);
    const malFormees = cles.filter(k => !/^(\d{1,3}|2[AB])-\d{1,2}$/.test(k));
    if (malFormees.length) {
      console.error("cles de deputes mal formees : " + malFormees.slice(0, 5).join(", "));
      process.exit(7);
    }
    let avec = 0, sans = 0, plusieurs = 0;
    for (const d of departements) {
      const p = JSON.parse(fs.readFileSync(path.join(SORTIE, "departments", d + ".json"), "utf8"));
      for (const c of Object.values(p.communes)) {
        if (Array.isArray(c.circo)) { plusieurs++; continue; }
        if (c.circo === null || c.circo === undefined) { sans++; continue; }
        if (relu.deputes[d + "-" + c.circo]) avec++; else sans++;
      }
    }
    if (avec === 0) { console.error("ECHEC : aucune commune ne trouve son depute"); process.exit(7); }
    console.log("deputes.json          : " + Math.round(octetsDeputes / 1024) + " Ko, " + cles.length + " circonscriptions");
    console.log("communes -> depute    : " + avec + " nommees, " + plusieurs + " a cheval sur plusieurs circos, " + sans + " sans");
  }

  /* CONTROLE INDEPENDANT DE LA CHAINE COMPLETE : commune -> circo -> depute ->
     position. Il relit les TROIS fichiers sur le disque et refait le trajet pour
     une commune reelle de chaque departement de la beta. Un jour ou une cle
     changera de forme, ce compte tombera et le build s'arretera — l'ecran, lui,
     afficherait simplement un blanc. */
  if (scrutins && deputes && depsAvecVotes.length) {
    const cat = JSON.parse(fs.readFileSync(path.join(SORTIE, "scrutins.json"), "utf8"));
    const mandats = JSON.parse(fs.readFileSync(path.join(SORTIE, "deputes.json"), "utf8"));
    const largeur = cat.scrutins.length;
    let chaines = 0, deputesVus = 0;
    const horsCommunes = [];
    for (const dep of depsAvecVotes) {
      const v = JSON.parse(fs.readFileSync(path.join(SORTIE, "scrutins", dep + ".json"), "utf8"));
      for (const [ref, pos] of Object.entries(v.positions)) {
        deputesVus++;
        if (pos.length !== largeur) {
          console.error(`ECHEC : ${dep}/${ref} porte ${pos.length} positions pour ${largeur} scrutins`);
          process.exit(8);
        }
        if (/[^pca.]/.test(pos)) {
          console.error(`ECHEC : ${dep}/${ref} porte un caractere qui n'est pas une position`);
          process.exit(8);
        }
      }
      /* 099 = les Francais etablis hors de France : onze circonscriptions, aucune
         commune. Leurs deputes votent comme les autres et leur fichier de votes
         est publie ; il n'y a simplement pas de commune d'ou partir. Sauter en
         silence serait un trou muet — on le compte et on l'annonce. */
      const fichierCommunes = path.join(SORTIE, "departments", dep + ".json");
      if (!fs.existsSync(fichierCommunes)) { horsCommunes.push(dep); continue; }
      const p = JSON.parse(fs.readFileSync(fichierCommunes, "utf8"));
      for (const c of Object.values(p.communes)) {
        if (typeof c.circo !== "number") continue;
        const m = mandats.deputes[dep + "-" + c.circo];
        if (m && v.positions[m.acteurRef]) chaines++;
      }
    }
    if (chaines === 0) {
      console.error("ECHEC : aucune commune ne remonte jusqu'a une position de vote");
      process.exit(8);
    }
    const octets = depsAvecVotes.map(d => fs.statSync(path.join(SORTIE, "scrutins", d + ".json")).size);
    console.log("scrutins.json         : " + Math.round(octetsScrutins / 1024) + " Ko, " + largeur + " scrutins");
    console.log("votes par departement : " + depsAvecVotes.length + " fichiers, "
      + deputesVus + " deputes, le plus lourd " + Math.round(Math.max(...octets) / 1024) + " Ko");
    /* LA FRAICHEUR SE DIT, ET ELLE S'ANNONCE QUAND ELLE MANQUE.
       Les deux releves ont ete poses a la main, tous deux dates du 26 aout, et
       l'ecran a servi des votes vieillissants pendant deux semaines sans que rien
       ne le signale. La collecte les refait maintenant chaque matin ; ce controle
       est ce qui dira le jour ou elle cessera de le faire. Il AVERTIT, il n'arrete
       pas : des donnees officielles d'il y a trois semaines restent publiables tant
       que leur date est affichee au lecteur — et elle l'est. */
    const jours = d => Math.round((Date.now() - Date.parse(d)) / 86400000);
    for (const [quoi, releve] of [["mandats", mandats.source && mandats.source.releve_le],
                                  ["scrutins", cat.source && cat.source.releve_le]]) {
      if (!releve) continue;
      const age = jours(releve);
      if (age > 7) {
        console.warn(`::warning::le releve des ${quoi} date du ${releve}, soit ${age} jours : `
          + "la collecte quotidienne ne le rafraichit plus (voir outils/mono_donnees.py dans le journal du pipeline)");
      }
    }
    console.log("communes -> position  : " + chaines
      + (horsCommunes.length ? "  (sans commune : " + horsCommunes.join(", ") + ")" : ""));
  }

  /* CONTROLE INDEPENDANT DES PROJETS : on relit sur le disque, on refait le
     trajet commune -> projets, et on verifie qu'aucune ligne publiee ne sort de
     son departement. Une cle mal formee afficherait chez un habitant une
     decision qui n'est pas la sienne — c'est la faute la plus grave que cet
     ecran puisse commettre, donc elle arrete le build et n'avertit pas. */
  if (projets && depsAvecProjets.length) {
    let lignes = 0, communesServies = 0;
    for (const dep of depsAvecProjets) {
      const f = JSON.parse(fs.readFileSync(path.join(SORTIE, "projets", dep + ".json"), "utf8"));
      const habitantes = JSON.parse(fs.readFileSync(
        path.join(SORTIE, "departments", dep + ".json"), "utf8")).communes;
      for (const [insee, liste] of Object.entries(f.communes)) {
        const attendu = insee.startsWith("97") ? insee.slice(0, 3) : insee.slice(0, 2);
        if (attendu !== dep) {
          console.error(`ECHEC : ${insee} publie dans le paquet ${dep}`);
          process.exit(10);
        }
        if (!habitantes[insee]) {
          console.error(`ECHEC : ${insee} porte des projets mais n'existe pas dans ${dep}.json`);
          process.exit(10);
        }
        communesServies++;
        for (const pr of liste) {
          lignes++;
          if (!pr.intitule || typeof pr.subvention !== "number" || !pr.annee) {
            console.error(`ECHEC : ${insee} porte une ligne sans intitule, sans montant ou sans annee`);
            process.exit(10);
          }
        }
      }
    }
    const octets = depsAvecProjets.map(d => fs.statSync(path.join(SORTIE, "projets", d + ".json")).size);
    console.log("projets par departement: " + depsAvecProjets.length + " fichiers, "
      + lignes + " projets sur " + communesServies + " communes, le plus lourd "
      + Math.round(Math.max(...octets) / 1024) + " Ko");
    /* Meme regle de fraicheur que pour les votes : la source est ANNUELLE, donc
       le seuil n'est pas sept jours mais quatorze mois. Au-dela, l'Etat a publie
       un nouvel exercice que la collecte n'est pas allee chercher. */
    const moisDepuis = d => (Date.now() - Date.parse(d)) / 2629800000;
    const maj = projets.source.mis_a_jour_le;
    if (maj && moisDepuis(maj) > 14) {
      console.warn(`::warning::les projets finances datent de la publication du ${maj}, `
        + `soit ${Math.round(moisDepuis(maj))} mois : un exercice plus recent existe `
        + "probablement (voir outils/projets_etat.py)");
    }
  } else if (projets) {
    console.warn("::warning::projets.json lu mais aucun departement servi : verifier les codes INSEE");
  }

  /* L'INDEX DE LA BETA : CHERCHER SA COMMUNE SANS SAVOIR SON DEPARTEMENT.
   *
   * MESURE DU 13/09/2026 : entre l'ouverture et « je sais comment mon depute a
   * vote », il y avait dix etapes, dont TROIS n'existaient que parce que les
   * fichiers sont decoupes par departement — il fallait savoir qu'on habite
   * « dans le 93 » avant de pouvoir taper « Bagnolet ». Personne ne pense comme
   * ca. Le decoupage des donnees avait fuite dans l'interface.
   *
   * CE FICHIER LE REPARE SANS RIEN CHANGER AU DECOUPAGE. Il porte le nom et le
   * code de chaque commune des huit departements de la beta ; l'ecran cherche
   * dedans, en deduit le DEPARTEMENT, et demande le fichier departemental
   * habituel. Le serveur n'apprend donc toujours que le departement — l'invariant
   * tient, et il est garde par le controle des adresses.
   *
   * POURQUOI L'ILE-DE-FRANCE SEULEMENT, mesure a l'appui : 1 262 communes pesent
   * 11 Ko compresses, la France entiere en pesant 271. On ne fait pas payer
   * 271 Ko au premier ecran de tout le monde pour supprimer une etape. Les autres
   * departements gardent leur parcours actuel, qui n'est pas retire. */
  let octetsBeta = 0;
  if (BETA.length) {
    const communesBeta = {};
    for (const dep of BETA) {
      const f = path.join(SORTIE, "departments", dep + ".json");
      if (!fs.existsSync(f)) { console.warn(`::warning::departement ${dep} de la beta absent`); continue; }
      for (const [insee, c] of Object.entries(JSON.parse(fs.readFileSync(f, "utf8")).communes)) {
        communesBeta[insee] = c.nom;
      }
    }
    octetsBeta = ecrire(path.join(SORTIE, "communes-beta.json"), {
      v: 1,
      /* Le departement se DEDUIT du code INSEE, il n'est pas stocke : deux
         caracteres par commune economises, et surtout une seule verite. */
      departements: BETA,
      source: index.sources.communes || null,
      communes: communesBeta,
    });

    /* CONTROLE INDEPENDANT : on relit le fichier ecrit et on refait le trajet
       complet pour une commune de chaque departement de la beta. */
    const relu = JSON.parse(fs.readFileSync(path.join(SORTIE, "communes-beta.json"), "utf8"));
    const codes = Object.keys(relu.communes);
    const horsBeta = codes.filter(c => !BETA.includes(c.slice(0, 2)));
    if (horsBeta.length) {
      console.error("l'index de la beta porte des communes hors beta : " + horsBeta.slice(0, 3).join(", "));
      process.exit(10);
    }
    for (const dep of BETA) {
      const attendues = Object.keys(JSON.parse(fs.readFileSync(path.join(SORTIE, "departments", dep + ".json"), "utf8")).communes);
      const dedans = codes.filter(c => c.slice(0, 2) === dep);
      if (dedans.length !== attendues.length) {
        console.error(`index de la beta : ${dedans.length} communes pour ${attendues.length} dans le departement ${dep}`);
        process.exit(10);
      }
    }
    console.log("index de la beta      : " + Math.round(octetsBeta / 1024) + " Ko, "
      + codes.length + " communes sur " + BETA.length + " departements");
  }

  const sansNom = index.departements.filter(d => !d.nom).map(d => d.code);
  if (officiels) {
    console.log("noms officiels        : " + redresses + " libelles redresses"
      + (sansLibelleOfficiel.length
          ? ", " + sansLibelleOfficiel.length + " sans correspondance (gardes tels quels : "
            + sansLibelleOfficiel.slice(0, 3).join(", ") + ")"
          : ", aucune commune sans correspondance"));
  }
  console.log("index.json            : " + Math.round(fs.statSync(path.join(SORTIE, "index.json")).size / 1024) + " Ko");
  console.log("territoires nommes    : " + (index.departements.length - sansNom.length) + "/" + index.departements.length
    + (sansNom.length ? "  (sans nom : " + sansNom.join(", ") + ")" : ""));
}

extraire();
