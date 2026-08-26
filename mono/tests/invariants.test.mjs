/* Les invariants, éprouvés SANS navigateur.
 *
 * Ce fichier ne teste pas des fonctions : il teste des règles de produit. Chaque
 * contrôle porte le numéro de l'invariant qu'il garde, et son message d'échec dit
 * ce qui casse pour un lecteur — pas ce qui casse pour un développeur.
 *
 * Ce qu'il ne peut pas mesurer — le rendu, le hors-ligne, les adresses réellement
 * demandées — est dans tests/runtime.test.mjs, qui ouvre un vrai navigateur. Un
 * banc vert sur une page cassée reste un banc vert.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  INVARIANTS, ECHELONS, AMPLITUDE_MAX, amplitude, adresseFautive,
  CHAMPS_INTERDITS, MOTS_CLASSEMENT, MOTS_GAMIFICATION, MOTS_A_ACCENTS,
} from "../packages/data-utils/src/invariants.js";
import { estDonneePublique, MAGASIN } from "../packages/data-utils/src/store.js";
import { adresseDepartement, PHRASES, ETATS } from "../packages/data-utils/src/client.js";

const RACINE = path.resolve(import.meta.dirname, "..");
const lire = p => fs.readFileSync(path.join(RACINE, p), "utf8");
const existe = p => fs.existsSync(path.join(RACINE, p));

/* Le code écrit à la main, hors données engendrées et hors dépendances. */
function sourcesEcrites() {
  const out = [];
  const marche = d => {
    for (const e of fs.readdirSync(path.join(RACINE, d), { withFileTypes: true })) {
      const rel = path.join(d, e.name);
      if (e.isDirectory()) {
        if (["node_modules", "dist", ".git", "data", ".turbo"].includes(e.name)) continue;
        marche(rel);
      } else if (/\.(js|jsx|mjs|css)$/.test(e.name)) out.push(rel);
    }
  };
  marche(".");
  return out;
}

test("invariant 0 — chaque invariant déclare le contrôle qui le garde", () => {
  assert.equal(INVARIANTS.length, 8);
  for (const i of INVARIANTS) {
    assert.ok(i.garde && i.garde.length > 10,
      `l'invariant ${i.n} n'a pas de garde declaree : c'est une intention, pas une regle`);
  }
});

test("invariant 2 — une seule clé de stockage, nommée, et rien d'autre", () => {
  const cles = new Set();
  for (const f of sourcesEcrites()) {
    /* Les tests LISENT document.cookie et sessionStorage pour prouver qu'ils sont
       vides : les inclure ici ferait echouer un produit sain. Quatrieme fois dans
       ce projet qu'une garde trebuche sur ce qui la verifie. */
    if (f.includes("tests")) continue;
    const s = lire(f);
    for (const m of s.matchAll(/localStorage\.(?:get|set|remove)Item\(\s*([^),]+)/g)) {
      cles.add(m[1].trim());
    }
    assert.ok(!/sessionStorage\./.test(s), `${f} utilise sessionStorage`);
    assert.ok(!/document\.cookie/.test(s), `${f} touche aux cookies`);
  }
  const litteraux = [...cles].filter(c => /^["']/.test(c));
  assert.deepEqual(litteraux, ["CLE"].filter(() => false),
    "aucune cle ne doit etre ecrite en dur : " + litteraux.join(", "));
});

test("invariant 2 — IndexedDB ne peut contenir que de la donnée publique", () => {
  /* Le contrôle historique disait « indexedDB jamais utilisée ». Il ne visait pas
     la technique, il visait le risque : que le produit garde des traces de son
     lecteur. On garde la protection en la resserrant — un seul magasin, et une
     garde qui refuse tout ce qui n'est pas un paquet départemental. */
  assert.equal(MAGASIN, "departements", "un seul magasin est autorise");
  assert.ok(estDonneePublique("dep:64", { d: "64", communes: {} }));
  assert.ok(estDonneePublique("socle:IDX", { departements: [] }));
  for (const [cle, valeur, pourquoi] of [
    ["utilisateur:1", { nom: "x" }, "une cle qui designe une personne"],
    ["dep:64", { d: "64", communes: {}, email: "a@b.c" }, "un courriel"],
    ["dep:64", { d: "64", communes: {}, historique: [] }, "un historique de navigation"],
    ["dep:64", { d: "64", communes: {}, commune_choisie: "64547" }, "la commune du lecteur"],
  ]) {
    assert.equal(estDonneePublique(cle, valeur), false, "aurait accepte " + pourquoi);
  }
});

test("invariant 2 — aucune adresse ne porte un code de commune", () => {
  assert.equal(adresseDepartement("64"), "/data/departments/64.json");
  assert.equal(adresseDepartement("2a"), "/data/departments/2A.json");
  assert.throws(() => adresseDepartement("64547"), /invalide/);
  for (const u of ["/data/64547.json", "/api/x?insee=64547", "/d/2A004/", "/data/index.json?commune=64547"]) {
    assert.ok(adresseFautive(u), "aurait laisse passer " + u);
  }
  for (const u of ["/data/departments/64.json", "/data/departments/2A.json", "/data/departments/988.json"]) {
    assert.ok(!adresseFautive(u), "a refuse une adresse departementale legitime : " + u);
  }
});

test("invariant 3 — aucun vocabulaire de classement dans le code écrit", () => {
  for (const f of sourcesEcrites()) {
    if (f.includes("invariants.js") || f.includes("tests")) continue;   /* ils citent la liste */
    const s = lire(f).toLowerCase();
    for (const mot of MOTS_CLASSEMENT) {
      assert.ok(!s.includes(mot), `${f} contient « ${mot} »`);
    }
  }
});

test("invariant 6 — rien ne gamifie le vote", () => {
  for (const f of sourcesEcrites()) {
    if (f.includes("invariants.js") || f.includes("tests")) continue;
    const s = lire(f).toLowerCase();
    for (const mot of MOTS_GAMIFICATION) assert.ok(!s.includes(mot), `${f} contient « ${mot} »`);
  }
});

test("invariant 7 — palette gelée, et aucune couleur hors palette", () => {
  const gelees = Object.values(ECHELONS);
  const css = lire("packages/ui/src/tokens.css");
  for (const [nom, hex] of Object.entries(ECHELONS)) {
    assert.ok(css.includes(hex), `la couleur d'echelon ${nom} (${hex}) a disparu des jetons`);
  }
  let controlees = 0;
  for (const f of sourcesEcrites()) {
    for (const m of lire(f).matchAll(/#[0-9a-fA-F]{6}\b/g)) {
      const hex = m[0].toLowerCase();
      if (gelees.includes(hex)) continue;
      controlees++;
      assert.ok(amplitude(hex) <= AMPLITUDE_MAX,
        `${f} : ${hex} a une amplitude de ${amplitude(hex)} (plafond ${AMPLITUDE_MAX}) — c'est une couleur, pas un neutre`);
    }
  }
  assert.ok(controlees > 5, "trop peu de couleurs controlees : le test ne mesure rien");
});

/* TOUS les JSON produits, pas seulement ceux de data/departments. La garde ne
   lisait que ce dossier : un fichier national depose a cote — c'est arrive avec
   un data/deputes.json — n'etait controle par rien du tout. */
function donneesProduites() {
  const out = [];
  const marche = d => {
    for (const e of fs.readdirSync(path.join(RACINE, d), { withFileTypes: true })) {
      const rel = path.join(d, e.name);
      if (e.isDirectory()) marche(rel);
      else if (e.name.endsWith(".json")) out.push(rel);
    }
  };
  if (existe("data")) marche("data");
  return out;
}

test("invariant 8 — aucun champ de patrimoine ni de présence dans les données produites", () => {
  if (!existe("data/index.json")) {
    assert.ok(false, "data/index.json absent : lance `pnpm extract` avant les tests");
  }
  const fichiers = fs.readdirSync(path.join(RACINE, "data/departments"));
  assert.ok(fichiers.length > 90, `seulement ${fichiers.length} departements produits`);
  /* On lit TOUS les fichiers, pas un échantillon : un champ interdit qui
     n'apparaîtrait que dans un département passerait un échantillonnage. */
  const tous = donneesProduites();
  assert.ok(tous.length > 90, "la marche dans data/ n'a rien trouve : le controle ne mesure rien");
  for (const f of tous) {
    const brut = lire(f);
    for (const champ of CHAMPS_INTERDITS) {
      assert.ok(!brut.includes(`"${champ}"`), `${f} porte le champ interdit « ${champ} »`);
    }
  }
});

test("langue — les libellés de source engendrés portent leurs accents", () => {
  /* Ils sont recopies depuis le fichier d'origine et affiches tels quels par
     l'ecran « Sources ». L'un d'eux arrivait sans accents. */
  if (!existe("data/index.json")) return;
  const sources = JSON.parse(lire("data/index.json")).sources || {};
  for (const [nom, s] of Object.entries(sources)) {
    if (!s || !s.producteur) continue;
    const fautifs = MOTS_A_ACCENTS.filter(m =>
      new RegExp("(?:^|[^A-Za-zÀ-ÿ./-])" + m + "(?![A-Za-zÀ-ÿ./-])").test(s.producteur));
    assert.deepEqual(fautifs, [],
      `le libelle de la source « ${nom} » s'affiche sans accents : ${s.producteur}`);
  }
});

test("invariant 4 — aucune donnée n'est servie sans source déclarée", () => {
  /* Un fichier depose dans data/ et branche dans le client, mais dont personne
     ne sait qui le publie ni quand, ne peut rien afficher : l'invariant 4 exige
     une source. La garde tient par les adresses — le client ne compose que les
     deux familles dont index.json declare la provenance. */
  const client = lire("packages/data-utils/src/client.js");
  const composees = [...client.matchAll(/\$\{BASE_DONNEES\}(\/[A-Za-z0-9_${}./-]*)/g)].map(m => m[1]);
  assert.deepEqual([...new Set(composees)].sort(), ["/departments/${d}.json", "/index.json"],
    "client.js compose une adresse de donnees inattendue : " + composees.join(", "));
  const sources = existe("data/index.json") ? (JSON.parse(lire("data/index.json")).sources || {}) : {};
  for (const attendue of ["elus", "comptes", "circonscriptions"]) {
    assert.ok(sources[attendue] && sources[attendue].producteur,
      `index.json ne declare pas la source « ${attendue} »`);
  }
});

test("architecture — aucun hook React au niveau module", () => {
  /* Un `const [x, setX] = useState(...)` ecrit hors composant s'execute au
     chargement du module : React leve, et RIEN ne s'affiche. Ni le build ni les
     controles statiques ne le voyaient — seul le navigateur. C'est arrive, et la
     page est restee blanche avec un build vert. */
  const hooks = /^(?:const|let|var)\s[^\n]*\buse(?:State|Effect|Memo|Callback|Ref|Context|Reducer)\s*\(/;
  for (const f of sourcesEcrites()) {
    if (f.includes("tests")) continue;
    lire(f).split("\n").forEach((ligne, i) => {
      assert.ok(!hooks.test(ligne),
        `${f}:${i + 1} appelle un hook React au niveau module — la page ne s'affichera pas`);
    });
  }
});

test("qualité — aucun fichier source ne commence par un BOM", () => {
  for (const f of sourcesEcrites()) {
    const brut = fs.readFileSync(path.join(RACINE, f));
    assert.ok(!(brut[0] === 0xef && brut[1] === 0xbb && brut[2] === 0xbf),
      `${f} commence par un BOM UTF-8 : il ressort dans le rendu et dans les diffs`);
  }
});

test("architecture — le build ne dépend d'aucune commande propre à un système", () => {
  /* `xcopy` a fait echouer le build sur toute machine qui n'est pas Windows —
     apres un `vite build` reussi, donc un dist/ sans donnees et un code de
     sortie qui, lui, disait bien qu'il fallait regarder. */
  const propres = ["xcopy", "robocopy", "copy /", "del /", "powershell", "cmd /c"];
  for (const f of ["package.json", "apps/web/package.json", "apps/api/package.json",
                   "packages/ui/package.json", "packages/data-utils/package.json"]) {
    const scripts = JSON.parse(lire(f)).scripts || {};
    for (const [nom, cmd] of Object.entries(scripts)) {
      for (const mot of propres) {
        assert.ok(!cmd.toLowerCase().includes(mot),
          `${f} · script « ${nom} » depend de « ${mot} » : il ne tournera que sur un systeme`);
      }
    }
  }
});

test("invariant 4 — le composant Source existe et sait annoncer un calcul", () => {
  const s = lire("packages/ui/src/composants.jsx");
  assert.ok(/export function Source/.test(s), "aucun composant Source");
  assert.ok(s.includes("ce n'est pas un chiffre publié"),
    "Source ne distingue pas un calcul d'une donnee publiee : l'invariant 4 tombe");
});

test("invariant 5 — chaque état d'absence a sa phrase, et elles diffèrent", () => {
  const etats = [ETATS.EN_COURS, ETATS.ECHEC, ETATS.HORS_LIGNE, ETATS.INTROUVABLE];
  const titres = new Set();
  for (const e of etats) {
    assert.ok(PHRASES[e] && PHRASES[e].titre, `l'etat « ${e} » n'a pas de phrase`);
    titres.add(PHRASES[e].titre);
  }
  assert.equal(titres.size, etats.length,
    "deux etats d'absence partagent la meme phrase : le produit mentirait sur la cause");
  /* « Hors ligne » et « le serveur a echoue » ne sont pas la meme chose : proposer
     « Reessayer » a quelqu'un dans un tunnel est un cul-de-sac. */
  assert.ok(!PHRASES[ETATS.HORS_LIGNE].action, "un bouton Reessayer est propose hors ligne");
  assert.ok(PHRASES[ETATS.ECHEC].action, "aucune action proposee quand le reseau a echoue");
});

test("invariant 5 — aucun composant « squelette » ne remplace une phrase", () => {
  for (const f of sourcesEcrites()) {
    if (f.includes("tests")) continue;   /* ce fichier cite les mots qu'il interdit */
    const s = lire(f);
    assert.ok(!/skeleton|Skeleton|shimmer/.test(s),
      `${f} introduit un squelette : une forme grise qui palpite est un contenant sans contenu`);
  }
});

test("invariant 1 — le service worker sépare la coquille des données", () => {
  const sw = lire("apps/web/public/sw.js");
  assert.ok(/const DONNEES = "repere-donnees-v1"/.test(sw),
    "le cache de donnees doit exister et NE PAS etre versionne par le build");
  assert.ok(/const COQUILLE = "repere-coquille-" \+ VERSION/.test(sw),
    "la coquille doit etre versionnee par le build");
  assert.ok(sw.includes("estDocument"), "aucun controle de type sur les documents mis en cache");
  assert.ok(/n\.startsWith\("repere-coquille-"\)/.test(sw),
    "l'activation efface autre chose que les anciennes coquilles");
});

test("architecture — une seule fabrique d'adresses dans tout le produit", () => {
  const fautifs = [];
  for (const f of sourcesEcrites()) {
    if (f.includes("client.js") || f.includes("tests") || f.includes("server.js")) continue;
    if (/["'`]\/data\/departments\//.test(lire(f))) fautifs.push(f);
  }
  assert.deepEqual(fautifs, [],
    "une adresse de donnees est composee ailleurs que dans client.js : deux endroits qui derivent la meme regle finissent par diverger");
});
