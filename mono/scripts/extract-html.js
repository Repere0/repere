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

  const paquets = new Map();
  for (const insee of Object.keys(libelles)) {
    const d = departementDe(insee);
    if (!paquets.has(d)) paquets.set(d, { d, communes: {} });
    const maire = (RNE.com || {})[insee];
    paquets.get(d).communes[insee] = {
      nom: libelles[insee],
      maire: maire ? { nom: nom(maire[0], maire[1]), fonction: fonction(maire[2]) } : null,
      adjoints: ((RNE.adj || {})[insee] || []).length,
      circo: circos[insee] !== undefined ? circos[insee] : null,
      comptes: communesOfgl[insee] ? communesOfgl[insee].ex : null,
    };
  }

  const meta = {
    v: 1,
    genere_le: new Date().toISOString().slice(0, 10),
    sources: {
      elus: (RNE.meta && { producteur: RNE.meta.producteur, licence: RNE.meta.licence, maj: RNE.meta.maj }) || null,
      comptes: (OFGL && OFGL.meta && { producteur: OFGL.meta.producteur, licence: OFGL.meta.licence, maj: OFGL.meta.maj }) || null,
      circonscriptions: (CIRCOS && { producteur: CIRCOS.source, licence: CIRCOS.licence, decoupage: CIRCOS.decoupage }) || null,
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
    departements: departements.map(d => ({
      code: d,
      communes: Object.keys(paquets.get(d).communes).length,
      octets: tailles[d],
    })),
  };
  ecrire(path.join(SORTIE, "index.json"), index);

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
  console.log("index.json            : " + Math.round(fs.statSync(path.join(SORTIE, "index.json")).size / 1024) + " Ko");
}

extraire();
