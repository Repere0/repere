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

/* Le code écrit à la main, hors données engendrées et hors dépendances.
 *
 * LE BALAYAGE NE LISAIT QUE .js .jsx .mjs .css. Le document HTML et le manifeste
 * de la PWA y echappaient donc entierement — et ils portaient une couleur
 * absente de la palette gelee, portee par `theme-color`, que le controle de
 * l'invariant 7 ne pouvait pas voir. Un fichier non lu est un fichier non garde. */
function sourcesEcrites() {
  const out = [];
  const marche = d => {
    for (const e of fs.readdirSync(path.join(RACINE, d), { withFileTypes: true })) {
      const rel = path.join(d, e.name);
      if (e.isDirectory()) {
        if (["node_modules", "dist", ".git", "data", ".turbo"].includes(e.name)) continue;
        marche(rel);
      } else if (/\.(js|jsx|mjs|css|html|svg|webmanifest)$/.test(e.name)) {
        /* CHEMINS EN BARRES OBLIQUES, SUR LES DEUX SYSTEMES. `path.join` rend
           « apps\\web\\index.html » sous Windows : les comparaisons et les
           messages d'echec de ce fichier differaient donc d'un poste a l'autre,
           et un controle est passe au rouge la-bas en restant vert ici. Un
           identifiant de fichier ne doit pas dependre du systeme qui le lit. */
        out.push(rel.split(path.sep).join("/"));
      }
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
  /* La liste balayee doit contenir le document et le manifeste : c'est la ou la
     couleur hors palette s'etait glissee. */
  const balayes = sourcesEcrites();
  for (const f of ["apps/web/index.html", "apps/web/public/manifest.webmanifest"]) {
    assert.ok(balayes.includes(f), `${f} n'est pas relu par le controle de la palette`);
  }
});

test("PWA — le manifeste declare des icones, et elles existent", () => {
  /* Un manifeste sans icone n'est pas installable : le navigateur ne propose
     rien, et la PWA « sur le telephone » n'existe pas. Le champ etait un tableau
     vide. */
  const m = JSON.parse(lire("apps/web/public/manifest.webmanifest"));
  assert.ok(Array.isArray(m.icons) && m.icons.length >= 2,
    "le manifeste ne declare pas assez d'icones pour etre installable");
  assert.ok(m.icons.some(i => /512/.test(i.sizes || "")), "aucune icone de 512 px");
  assert.ok(m.icons.some(i => i.purpose === "maskable"), "aucune icone masquable");
  for (const i of m.icons) {
    assert.ok(existe(path.join("apps/web/public", i.src.replace(/^\//, ""))),
      `le manifeste declare ${i.src}, qui n'existe pas`);
  }
  const doc = lire("apps/web/index.html");
  assert.ok(/rel="icon"/.test(doc), "aucune icone d'onglet : chaque ouverture demande un /favicon.ico inexistant");
  assert.equal(m.theme_color, JSON.parse('"#0e7490"'),
    "la couleur du manifeste doit etre un echelon gele");
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
     TROIS familles dont index.json declare la provenance.
     La troisieme, /deputes.json, a ete ajoutee le 28/08/2026 : elle n'est
     autorisee ici que parce que sa source est declaree juste en dessous, et
     l'ordre des deux assertions est volontaire.
     Les quatrieme et cinquieme, /scrutins.json et /scrutins/{dep}.json, sont
     ajoutees le 13/09/2026, a la meme condition : la source « scrutins » est
     exigee dans index.json quelques lignes plus bas. Elargir cette liste sans
     elargir l'autre fait echouer le test — c'est le but. */
  const client = lire("packages/data-utils/src/client.js");
  const composees = [...client.matchAll(/\$\{BASE_DONNEES\}(\/[A-Za-z0-9_${}./-]*)/g)].map(m => m[1]);
  assert.deepEqual([...new Set(composees)].sort(),
    ["/departments/${d}.json", "/deputes.json", "/index.json",
     "/scrutins.json", "/scrutins/${d}.json"],
    "client.js compose une adresse de donnees inattendue : " + composees.join(", "));
  const sources = existe("data/index.json") ? (JSON.parse(lire("data/index.json")).sources || {}) : {};
  for (const attendue of ["elus", "comptes", "circonscriptions", "deputes", "scrutins", "communes"]) {
    assert.ok(sources[attendue] && sources[attendue].producteur,
      `index.json ne declare pas la source « ${attendue} »`);
  }
});

test("invariant 4 — le fichier des députés emporte sa source avec lui", () => {
  /* Ce fichier n'est pas lu par le premier ecran : l'ecran qui l'affiche ne peut
     donc pas aller chercher sa provenance dans index.json au moment ou il rend.
     Il la porte lui-meme, et sans les quatre champs, l'extraction doit refuser
     de le publier. Un nom d'elu affiche sans producteur ni date, c'est
     exactement ce que l'invariant 4 interdit. */
  if (!existe("data/deputes.json")) {
    assert.fail("data/deputes.json absent — lance `pnpm extract` avant les controles");
  }
  const f = JSON.parse(lire("data/deputes.json"));
  for (const champ of ["producteur", "licence", "releve_le", "legislature"]) {
    assert.ok(f.source && f.source[champ], `data/deputes.json ne porte pas « ${champ} »`);
  }
  assert.match(f.source.releve_le, /^\d{4}-\d{2}-\d{2}$/, "la date de releve n'est pas une date");
  const cles = Object.keys(f.deputes || {});
  assert.ok(cles.length > 500, `${cles.length} circonscriptions seulement dans data/deputes.json`);
  for (const k of cles) {
    assert.match(k, /^(\d{1,3}|2[AB])-\d{1,2}$/, `cle de circonscription mal formee : ${k}`);
  }
  /* Ni patrimoine ni presence, ni etiquette politique : on verifie la FORME des
     entrees, pas seulement l'absence de mots interdits. Un champ de plus ici
     serait passe inapercu. */
  const attendus = new Set(["prenom", "nom", "acteurRef", "dateDebut"]);
  for (const [k, v] of Object.entries(f.deputes)) {
    for (const champ of Object.keys(v)) {
      assert.ok(attendus.has(champ), `champ inattendu « ${champ} » sur ${k}`);
    }
  }
});

test("invariant 4 — le relevé des députés est versionné, pas engendré au réseau", () => {
  /* Le build ne doit toucher au reseau NI POUR CE FICHIER : le releve vit dans
     scripts/, comme les noms de territoires, et l'extraction le recopie. Sans
     cela, la chaine publique produirait un jour un site sans deputes sans que
     rien n'echoue. */
  assert.ok(existe("scripts/deputes.json"),
    "scripts/deputes.json absent : data/deputes.json ne serait pas reproductible");
  const extraction = lire("scripts/extract-html.js");
  assert.ok(/deputes\.json/.test(extraction), "extract-html.js ne lit pas le releve des deputes");
  for (const f of ["scripts/extract-html.js", "scripts/deputes.json"]) {
    assert.ok(!/https?:\/\/(?!www\.data\.gouv|data\.assemblee|geo\.api|www\.insee)/.test(lire(f)),
      `${f} pointe vers un hote qui n'est pas une source officielle`);
  }
});

test("amicro — le mouvement ne part pas au premier écran", () => {
  /* framer-motion pese 122 Ko (40 Ko compresses). Le premier ecran de Repere en
     pese 59. Le paquet n'est donc tolerable QU'A UNE CONDITION : n'etre importe
     que par les ecrans, qui sont eux-memes charges a la demande. Deux gardes,
     parce qu'une seule ne suffirait pas.

     1. Personne d'autre que les ecrans ne l'importe. Un `import` d'amicro dans
        App.jsx, main.jsx ou l'index de @repere/ui le ferait basculer dans le
        morceau du premier ecran, et le plafond sauterait sans que rien ne le
        dise avant la mesure navigateur.
     2. Le decoupage du build lui garde son propre morceau. */
  for (const f of ["apps/web/src/App.jsx", "apps/web/src/main.jsx", "packages/ui/src/index.js"]) {
    const src = lire(f);
    assert.ok(!/@repere\/ui\/amicro|framer-motion|"motion"/.test(src),
      `${f} importe le mouvement : il partirait au premier ecran`);
  }
  const vite = lire("apps/web/vite.config.js");
  assert.match(vite, /return "mouvement"/,
    "vite.config.js ne donne plus son propre morceau a framer-motion");

  /* Et si le build a tourne, on VERIFIE la separation sur le resultat, pas sur
     l'intention : le morceau du socle ne doit pas contenir le moteur d'animation. */
  if (existe("apps/web/dist")) {
    const dossier = path.join(RACINE, "apps/web/dist/assets");
    if (fs.existsSync(dossier)) {
      const socle = fs.readdirSync(dossier).find(n => n.startsWith("socle-"));
      if (socle) {
        const contenu = fs.readFileSync(path.join(dossier, socle), "utf8");
        assert.ok(!/framer-motion|useReducedMotion/.test(contenu),
          "le morceau du socle contient le moteur d'animation");
      }
    }
  }
});

test("amicro — toute animation se coupe si le lecteur l'a demandé", () => {
  /* Un reglage systeme « moins d'animations » n'est pas une preference de gout :
     vertiges, migraines, troubles vestibulaires. Un composant anime qui ne lit
     pas ce reglage est un defaut d'accessibilite, pas un detail.

     CE CONTROLE A CHANGE DE MOYEN LE 13/09/2026, PAS DE REGLE. Il exigeait
     `useReducedMotion` et un retour anticipe en JavaScript ; framer-motion ayant
     ete retire, la coupure est desormais faite par le navigateur, en CSS. La
     regle est la meme, la garde est plus large : ce n'est plus « amicro appelle
     la bonne fonction » mais « aucune animation declaree dans le produit n'echappe
     a la media query ». Le banc navigateur, lui, mesure la coupure pour de vrai. */
  const src = lire("packages/ui/src/amicro.jsx");
  assert.ok(!/from ["'](framer-motion|motion)["']/.test(src),
    "amicro.jsx reimporte une bibliotheque d'animation : 40 Ko compresses pour une apparition de carte");

  /* Chaque selecteur qui declare une animation doit etre neutralise sous
     prefers-reduced-motion, dans le meme fichier. */
  for (const f of sourcesEcrites().filter(f => f.endsWith(".css"))) {
    const css = lire(f);
    const animes = [...css.matchAll(/(^|\n)\s*(\.[A-Za-z0-9_-]+)[^{}]*\{[^}]*\banimation\s*:/g)]
      .map(m => m[2]);
    if (!animes.length) continue;
    const reduit = css.match(/@media \(prefers-reduced-motion: reduce\)[\s\S]*$/);
    assert.ok(reduit, `${f} anime ${animes.join(", ")} sans jamais couper le mouvement`);
    for (const sel of new Set(animes)) {
      assert.ok(reduit[0].includes(sel),
        `${f} anime ${sel} mais ne le neutralise pas quand le lecteur demande moins d'animations`);
    }
  }

  /* Attribution : l'idee et le code d'origine viennent d'ailleurs, sous licence
     MIT. La licence exige que l'avis de copyright voyage avec. */
  assert.match(src, /MIT/, "amicro.jsx ne porte pas la licence de son auteur");
  assert.match(src, /Syed Subhan/, "amicro.jsx ne porte pas le nom de son auteur");
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
  const propres = ["xcopy", "robocopy", "copy /", "del /", "powershell", "cmd /c",
                   "rm -rf", "cp -r", "mkdir -p", "&& :"];
  for (const f of ["package.json", "apps/web/package.json", "apps/api/package.json",
                   "packages/ui/package.json", "packages/data-utils/package.json"]) {
    const scripts = JSON.parse(lire(f)).scripts || {};
    for (const [nom, cmd] of Object.entries(scripts)) {
      for (const mot of propres) {
        assert.ok(!cmd.toLowerCase().includes(mot),
          `${f} · script « ${nom} » depend de « ${mot} » : il ne tournera que sur un systeme`);
      }
      /* LES MOTIFS DE FICHIERS AUSSI. `node --test tests/*.test.mjs` compte sur
         le shell pour developper l'etoile : bash le fait, cmd.exe non — c'est
         alors Node qui doit s'en charger, et il ne le sait que depuis peu. Le
         script marchait ici et pouvait echouer la-bas, pour la meme raison
         qu'`xcopy`. Un dossier ou un nom de fichier ne demande rien a personne. */
      assert.ok(!/[*?]/.test(cmd),
        `${f} · script « ${nom} » contient un motif de fichier (« ${cmd} ») : ` +
        "son developpement depend du shell, donc du systeme");
    }
  }
});

test("territoires — chaque département publié porte son nom officiel et sa source", () => {
  /* Le fichier d'origine ne connait que les codes. Un premier ecran qui n'affiche
     que des numeros demande au lecteur de savoir que sa commune est « dans le
     64 » — un savoir de plaque d'immatriculation. Les noms viennent de fichiers
     officiels releves une fois ; ils doivent couvrir TOUS les codes produits,
     sinon le premier ecran redevient muet pour ceux qui manquent. */
  const noms = JSON.parse(lire("scripts/noms-territoires.json"));
  assert.ok(Array.isArray(noms.sources) && noms.sources.length >= 1, "le fichier de noms ne declare aucune source");
  for (const src of noms.sources) {
    for (const champ of ["producteur", "licence", "url", "releve_le"]) {
      assert.ok(src[champ], `une source des noms de territoires n'a pas de ${champ}`);
    }
  }
  if (!existe("data/index.json")) return;
  const index = JSON.parse(lire("data/index.json"));
  const sansNom = index.departements.filter(d => !d.nom).map(d => d.code);
  assert.deepEqual(sansNom, [],
    "des territoires publies n'ont pas de nom : " + sansNom.join(", "));
  assert.ok(Array.isArray(index.sources.territoires) && index.sources.territoires.length >= 1,
    "index.json affiche des noms sans declarer d'ou ils viennent");
  /* Le nom affiche est du texte francais : il porte ses accents. */
  const fautifs = index.departements.filter(d =>
    MOTS_A_ACCENTS.some(m => new RegExp("(?:^|[^A-Za-zÀ-ÿ./-])" + m + "(?![A-Za-zÀ-ÿ./-])").test(d.nom)));
  assert.deepEqual(fautifs.map(d => d.nom), [], "un nom de territoire s'affiche sans accents");
});

test("banc — le balayage voit tout le depot, pas une copie amputee", () => {
  /* CE CONTROLE EXISTE A CAUSE D'UNE PANNE DE CE BANC, PAS DU PRODUIT.
   *
   * Le 26 aout 2026, le banc etait vert sur un poste et rouge sur un autre : la
   * copie de travail du premier ne contenait pas orchestrator/orchestrator.mjs,
   * et les controles qui lisent « toutes les sources » n'avaient donc jamais lu
   * ce fichier — qui portait un BOM. Un banc qui ne voit qu'une partie du depot
   * ne dit rien de l'autre, et il le dit en vert.
   *
   * On verifie donc la BATTERIE elle-meme : les dossiers attendus existent, ils
   * contiennent chacun au moins une source, et le compte total ne s'effondre pas
   * en silence. */
  const balayes = sourcesEcrites();
  const racines = ["apps/web/src", "apps/web/public", "apps/api", "packages/ui/src",
                   "packages/data-utils/src", "scripts", "tests", "orchestrator"];
  for (const r of racines) {
    assert.ok(balayes.some(f => f.startsWith(r + "/")),
      `aucune source lue sous ${r}/ : la copie de travail est incomplete, ` +
      "ou le balayage exclut un dossier qu'il ne devrait pas exclure");
  }
  assert.ok(balayes.length >= 20,
    `seulement ${balayes.length} sources balayees : un banc vert ne prouverait presque rien`);
  /* Et il ne doit PAS lire ce qui n'est pas ecrit a la main. */
  for (const interdit of ["node_modules", "/dist/", "data/departments"]) {
    assert.deepEqual(balayes.filter(f => f.includes(interdit)), [],
      `le balayage lit ${interdit}, qui n'est pas du code ecrit a la main`);
  }
});

test("banc — tous les fichiers de test sont réellement lancés", () => {
  /* Le script nomme ses fichiers un par un, parce qu'un motif comme
     `tests/*.test.mjs` compte sur le shell pour l'etendre — et cmd.exe ne le
     fait pas. Le prix de cette precision, c'est qu'un fichier ajoute et oublie
     ne serait jamais lance, et personne ne le verrait : le banc resterait vert
     avec un test de moins. Ce controle ferme la boucle. */
  const script = (JSON.parse(lire("package.json")).scripts || {}).test || "";
  const surDisque = fs.readdirSync(path.join(RACINE, "tests"))
    .filter(f => /\.test\.mjs$/.test(f));
  assert.ok(surDisque.length >= 2, "moins de deux fichiers de test sur le disque");
  const oublies = surDisque.filter(f => !script.includes("tests/" + f));
  assert.deepEqual(oublies, [],
    "des fichiers de test existent mais ne sont pas lances par `pnpm test` : " + oublies.join(", "));
});

test("données — chaque paquet départemental a la forme que l'application attend", () => {
  /* L'extraction se relit elle-meme, mais RIEN ne revérifie les fichiers ensuite.
     Un paquet tronque, une commune sans nom, un index qui ne correspond plus aux
     fichiers : l'application afficherait du vide sans que rien ne l'annonce. On
     relit donc tout, et on compare a ce que l'index promet. */
  if (!existe("data/index.json")) return;
  const index = JSON.parse(lire("data/index.json"));
  const annonce = new Map(index.departements.map(d => [d.code, d]));
  const fichiers = fs.readdirSync(path.join(RACINE, "data/departments"))
    .filter(f => f.endsWith(".json"));
  assert.equal(fichiers.length, index.departements.length,
    `${fichiers.length} fichiers pour ${index.departements.length} territoires annonces`);

  let communesLues = 0;
  for (const f of fichiers) {
    const code = f.replace(/\.json$/, "");
    const brut = lire(path.join("data/departments", f));
    const p = JSON.parse(brut);
    assert.equal(p.d, code, `${f} porte le code « ${p.d} »`);
    assert.ok(p.communes && typeof p.communes === "object", `${f} n'a pas de communes`);

    const dit = annonce.get(code);
    assert.ok(dit, `${f} n'est pas annonce dans index.json`);
    const n = Object.keys(p.communes).length;
    assert.equal(n, dit.communes, `${f} porte ${n} communes, l'index en annonce ${dit.communes}`);
    /* En OCTETS, pas en caracteres : « Alçay-Alçabéhéty » ne pese pas le meme
       nombre de l'un et de l'autre, et l'index compte des octets. */
    const octets = fs.statSync(path.join(RACINE, "data/departments", f)).size;
    assert.equal(octets, dit.octets,
      `${f} pese ${octets} octets, l'index en annonce ${dit.octets} — l'index et les fichiers ont diverge`);
    communesLues += n;

    for (const [insee, c] of Object.entries(p.communes)) {
      assert.ok(/^(\d{5}|2[AB]\d{3})$/.test(insee), `${f} : code commune invalide « ${insee} »`);
      assert.ok(typeof c.nom === "string" && c.nom.length > 0, `${f} : ${insee} sans nom`);
      assert.ok(c.maire === null || (c.maire && typeof c.maire.nom === "string"),
        `${f} : ${insee} porte un maire de forme inattendue`);
      assert.ok(Number.isInteger(c.adjoints) && c.adjoints >= 0,
        `${f} : ${insee} porte un nombre d'adjoints inattendu`);
      assert.ok(c.circo === null || Number.isInteger(c.circo) || Array.isArray(c.circo),
        `${f} : ${insee} porte une circonscription de forme inattendue`);
      assert.ok(c.comptes === null || typeof c.comptes === "object",
        `${f} : ${insee} porte des comptes de forme inattendue`);
    }
  }
  assert.ok(communesLues > 30000, `seulement ${communesLues} communes relues`);
});

test("langue — aucun nom de commune ne s'affiche sans ses accents", () => {
  /* Les noms viennent de la source et s'affichent tels quels : ils sont du texte
     francais au meme titre que le reste. Le controle existant ne regardait que
     les libelles de source. */
  if (!existe("data/index.json")) return;
  const fichiers = fs.readdirSync(path.join(RACINE, "data/departments")).filter(f => f.endsWith(".json"));
  const fautifs = [];
  for (const f of fichiers) {
    const p = JSON.parse(lire(path.join("data/departments", f)));
    for (const c of Object.values(p.communes)) {
      for (const m of MOTS_A_ACCENTS) {
        if (new RegExp("(?:^|[^A-Za-zÀ-ÿ./'-])" + m + "(?![A-Za-zÀ-ÿ./'-])").test(c.nom)) {
          fautifs.push(f + " : " + c.nom); break;
        }
      }
    }
    if (fautifs.length > 5) break;
  }
  assert.deepEqual(fautifs, [], "des noms de communes s'affichent sans accents");
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

test("architecture — le socle de rendu est preact, et l'alias est complet", () => {
  /* Repere n'utilise de React que createRoot, StrictMode, lazy, Suspense et les
     hooks : preact/compat les implemente, pour 20 Ko au lieu de 142. Le socle
     pesait 82 % du premier ecran d'un produit dont l'argument est de peser peu.
     Rien n'est reecrit dans l'application — seul l'alias change. Un alias
     incomplet ferait revenir un vrai React dans le paquet, sans bruit. */
  const conf = lire("apps/web/vite.config.js");
  for (const attendu of ["react/jsx-dev-runtime", "react/jsx-runtime", "react-dom/client", "react-dom", "react"]) {
    const motif = "/^" + attendu.split("/").join("\\/") + "$/";
    assert.ok(conf.includes(motif),
      `l'alias de « ${attendu} » manque (${motif}) : ce module reviendrait au vrai React`);
  }
  const pkg = JSON.parse(lire("apps/web/package.json"));
  assert.ok(pkg.dependencies.preact, "apps/web ne declare pas preact");
  /* Le socle produit doit rester petit : la mesure, pas l'intention. */
  const assets = path.join(RACINE, "apps/web/dist/assets");
  if (!fs.existsSync(assets)) return;
  const socle = fs.readdirSync(assets).find(f => /^socle-.*\.js$/.test(f));
  assert.ok(socle, "aucun morceau « socle » dans le build");
  const octets = fs.statSync(path.join(assets, socle)).size;
  assert.ok(octets < 60 * 1024,
    `le socle pese ${Math.round(octets / 1024)} Ko : un vrai React est revenu dans le paquet`);
});

/* Les controles qui suivent lisent le BUILD, pas les sources : ils mesurent ce
   qui serait reellement publie. */
const DIST = "apps/web/dist";
function build() {
  assert.ok(existe(path.join(DIST, "index.html")),
    "build absent : lance `pnpm build` avant les tests");
  return fs.readdirSync(path.join(RACINE, DIST, "assets"));
}

test("invariant 2 — le site publié ne charge AUCUNE ressource d'un autre hôte", () => {
  /* Le README en fait une decision : un lien vers un hote tiers lui ferait
     connaitre l'adresse IP de chaque lecteur, a chaque ouverture. Jusqu'ici, la
     seule garantie etait un commentaire dans index.html. On mesure maintenant le
     produit fini.
     ATTENTION A CE QUE LE CONTROLE VISE : un LIEN vers data.gouv.fr est legitime,
     c'est le lecteur qui clique. Ce qui est interdit, c'est ce que la page va
     CHERCHER toute seule. */
  const actifs = build();
  const doc = lire(path.join(DIST, "index.html"));
  for (const m of doc.matchAll(/<(?:script|link|img|iframe|source)\b[^>]*\b(?:src|href)\s*=\s*["']([^"']+)["']/gi)) {
    assert.ok(!/^(?:https?:)?\/\//i.test(m[1]),
      `index.html charge « ${m[1]} » depuis un autre hote`);
  }
  for (const f of actifs) {
    const brut = lire(path.join(DIST, "assets", f));
    if (f.endsWith(".css")) {
      for (const m of brut.matchAll(/url\(\s*["']?((?:https?:)?\/\/[^)"']+)/gi)) {
        assert.ok(false, `${f} charge « ${m[1]} » depuis un autre hote`);
      }
      assert.ok(!/@import\s+["']?(?:https?:)?\/\//i.test(brut), `${f} importe une feuille distante`);
    }
    if (f.endsWith(".js")) {
      for (const m of brut.matchAll(/\b(?:fetch|importScripts)\s*\(\s*["'`]((?:https?:)?\/\/[^"'`]+)/gi)) {
        assert.ok(false, `${f} va chercher « ${m[1]} » sur un autre hote`);
      }
    }
  }
  /* Le service worker non plus : c'est lui qui parle au reseau le plus souvent. */
  const sw = lire(path.join(DIST, "sw.js"));
  assert.ok(/url\.origin !== self\.location\.origin/.test(sw),
    "le service worker n'ecarte plus explicitement les autres origines");
});

test("invariant 1 — le service worker précharge exactement ce que le build a produit", () => {
  /* La liste est REECRITE au build. Si elle derive des fichiers reellement
     produits — un actif oublie, un actif fantome — la PWA installee s'ouvre sur
     une coquille incomplete, et seul un vrai hors-ligne le revele. */
  const actifs = build();
  const sw = lire(path.join(DIST, "sw.js"));
  const m = /const A_PRECHARGER = (\[[^\]]*\]);/.exec(sw);
  assert.ok(m, "A_PRECHARGER introuvable dans le service worker publie");
  const liste = JSON.parse(m[1]);

  const attendus = actifs.filter(f => /\.(js|css|woff2?)$/.test(f)).map(f => "/assets/" + f);
  const manquants = attendus.filter(a => !liste.includes(a));
  assert.deepEqual(manquants, [],
    "des fichiers produits par le build ne sont pas precharges : hors ligne, ils manqueront");

  const fantomes = liste.filter(u => u.startsWith("/assets/") && !attendus.includes(u));
  assert.deepEqual(fantomes, [],
    "le service worker precharge des fichiers qui n'existent plus dans le build");

  for (const socle of ["/", "/index.html", "/manifest.webmanifest", "/data/index.json"]) {
    assert.ok(liste.includes(socle), `${socle} n'est pas precharge : l'application ne s'ouvrira pas hors ligne`);
  }
  for (const u of liste) {
    if (u === "/" || u.startsWith("/data/")) continue;
    assert.ok(existe(path.join(DIST, u.replace(/^\//, ""))),
      `le service worker precharge ${u}, qui n'existe pas dans le build`);
  }
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

/* ===========================================================================
   LES VOTES — quatre controles ajoutes le 13/09/2026 avec la chaine
   commune -> circonscription -> depute -> position.

   Ils relisent les fichiers PUBLIES, pas les variables du script qui les a
   ecrits : c'est la seule facon de voir un jour ou la sortie changera de forme
   sans que personne ne l'ait voulu.
   =========================================================================== */

const BETA_IDF = ["75", "77", "78", "91", "92", "93", "94", "95"];
const litData = f => JSON.parse(lire(path.join("data", f)));

test("votes — la chaine commune → circonscription → député → position tient en Île-de-France", () => {
  if (!existe("data/scrutins.json")) return;   /* extraction pas encore lancee */
  const cat = litData("scrutins.json");
  const mandats = litData("deputes.json");
  const manquants = BETA_IDF.filter(d => !existe(`data/scrutins/${d}.json`));
  assert.deepEqual(manquants, [],
    "un departement de la beta n'a pas de fichier de votes : l'ecran afficherait un blanc");

  let chaines = 0;
  for (const dep of BETA_IDF) {
    const votes = litData(`scrutins/${dep}.json`);
    const communes = litData(`departments/${dep}.json`).communes;
    for (const c of Object.values(communes)) {
      if (typeof c.circo !== "number") continue;
      const m = mandats.deputes[`${dep}-${c.circo}`];
      if (!m || !m.acteurRef) continue;
      const pos = votes.positions[m.acteurRef];
      if (!pos) continue;
      assert.equal(pos.length, cat.scrutins.length,
        `${dep} : ${m.nom} porte ${pos.length} positions pour ${cat.scrutins.length} scrutins`);
      chaines++;
    }
  }
  assert.ok(chaines > 1000,
    `seulement ${chaines} communes d'Ile-de-France remontent jusqu'a un vote : la chaine est rompue`);
});

test("votes — le catalogue ne porte aucune position, et chaque scrutin porte son lien", () => {
  if (!existe("data/scrutins.json")) return;
  const cat = litData("scrutins.json");
  assert.ok(cat.url_scrutin && /^https:\/\//.test(cat.url_scrutin),
    "le catalogue ne porte pas l'adresse ou le lecteur peut verifier un scrutin");
  for (const s of cat.scrutins) {
    for (const champ of ["p", "c", "a", "positions", "votants"]) {
      assert.ok(!(champ in s),
        `le scrutin ${s.n} porte « ${champ} » : les positions n'ont rien a faire dans le catalogue commun`);
    }
    assert.ok(s.n && s.d && s.t, `le scrutin ${s.u} n'a pas de numero, de date ou d'intitule`);
  }
});

test("invariant 4 — les votes publiés portent producteur, licence, date et adresse", () => {
  if (!existe("data/scrutins.json")) return;
  const s = litData("scrutins.json").source || {};
  for (const champ of ["producteur", "licence", "url", "releve_le", "legislature"]) {
    assert.ok(s[champ], `la source des scrutins ne declare pas « ${champ} »`);
  }
  assert.match(s.releve_le, /^\d{4}-\d{2}-\d{2}$/, "la date de releve des scrutins n'est pas une date");
});

test("invariant 3 — le format des positions rend tout classement impossible", () => {
  if (!existe("data/scrutins.json")) return;
  const largeur = litData("scrutins.json").scrutins.length;
  let lourd = 0, fichiers = 0;
  for (const f of fs.readdirSync(path.join(RACINE, "data", "scrutins"))) {
    fichiers++;
    const octets = fs.statSync(path.join(RACINE, "data", "scrutins", f)).size;
    if (octets > lourd) lourd = octets;
    const v = JSON.parse(lire(path.join("data", "scrutins", f)));
    for (const [ref, pos] of Object.entries(v.positions)) {
      assert.equal(typeof pos, "string",
        `${f} range autre chose qu'une suite de positions pour ${ref} : un objet peut porter un compte, une chaine non`);
      assert.equal(pos.length, largeur, `${f} : ${ref} porte ${pos.length} positions pour ${largeur} scrutins`);
      assert.ok(!/[^pca.]/.test(pos), `${f} : ${ref} porte un caractere qui n'est pas une position`);
    }
  }
  assert.ok(fichiers > 100, `seulement ${fichiers} departements ont un fichier de votes`);
  /* SERVIR PETIT. Le jour ou un fichier de votes departemental depassera huit
     kilo-octets, c'est que quelqu'un y aura range autre chose que des positions. */
  assert.ok(lourd < 8192, `le plus lourd fichier de votes pese ${lourd} octets`);
});

test("bêta Île-de-France — aucune commune ne reste sans député nommable", () => {
  if (!existe("data/deputes.json")) return;
  /* CE CONTROLE EXISTE A CAUSE DE PARIS. Une commune a cheval sur plusieurs
     circonscriptions n'affichait personne : Paris, Saint-Denis, Creteil,
     Versailles, Boulogne-Billancourt, Vitry, Colombes — quatorze communes
     d'Ile-de-France, dont deux millions d'habitants pour la seule ville de Paris,
     dans une beta dont l'Ile-de-France est le cap. Nommer n'est pas attribuer :
     l'ecran dit qui la COMMUNE elit, jamais qui est « votre » depute. */
  const mandats = litData("deputes.json").deputes;
  const muettes = [];
  for (const dep of BETA_IDF) {
    for (const [insee, c] of Object.entries(litData(`departments/${dep}.json`).communes)) {
      const circos = Array.isArray(c.circo) ? c.circo : (typeof c.circo === "number" ? [c.circo] : []);
      if (!circos.length) { muettes.push(`${insee} ${c.nom} (pas de circonscription)`); continue; }
      if (!circos.some(n => mandats[`${dep}-${n}`])) muettes.push(`${insee} ${c.nom}`);
    }
  }
  assert.deepEqual(muettes, [],
    "des communes de la beta n'ont aucun depute a nommer : " + muettes.slice(0, 5).join(", "));
});

test("langue — les noms de communes portent leur orthographe officielle", () => {
  if (!existe("data/departments/91.json")) return;
  /* MESURE DU 13/09/2026 : 9 198 communes sur 34 637 — UNE SUR QUATRE —
     s'affichaient mal. Le Repertoire national des elus ecrit en capitales, et la
     recapitalisation du produit mettait une majuscule aux articles internes
     (« Choisy-Le-Roi ») et perdait les accents des initiales
     (« Evry-Courcouronnes »). Le libelle vient desormais du Code officiel
     geographique, par le decoupage administratif d'Etalab.

     DEUX ASSERTIONS, ET L'ORDRE COMPTE : la premiere est une regle
     typographique verifiable partout, la seconde des temoins nommes. Sans les
     temoins, une source qui deviendrait muette laisserait passer des libelles
     tronques sans qu'aucune majuscule fautive n'apparaisse. */
  const fautifs = [];
  for (const dep of BETA_IDF) {
    for (const c of Object.values(litData(`departments/${dep}.json`).communes)) {
      if (/-(Le|La|Les|Sur|Sous|En|Aux|Au|Du|De|Des|Et|Lez|Les|D'|L')-/.test(c.nom)) fautifs.push(c.nom);
    }
  }
  assert.deepEqual(fautifs.slice(0, 5), [],
    "des noms de communes capitalisent un article interne : " + fautifs.slice(0, 5).join(", "));

  const temoins = {
    "91": { "91228": "Évry-Courcouronnes", "91215": "Épinay-sous-Sénart" },
    "94": { "94022": "Choisy-le-Roi", "94018": "Charenton-le-Pont" },
  };
  for (const [dep, attendus] of Object.entries(temoins)) {
    const communes = litData(`departments/${dep}.json`).communes;
    for (const [insee, nom] of Object.entries(attendus)) {
      assert.equal(communes[insee] && communes[insee].nom, nom,
        `${insee} devrait s'ecrire « ${nom} »`);
    }
  }
});

test("architecture — une seule règle de recherche, pour les territoires comme pour les communes", () => {
  /* Les deux recherches derivaient la meme regle a deux endroits, et elles avaient
     diverge : celle des communes faisait un `toLowerCase().includes()` sans
     normalisation. Mesure avant correction : « Évry » 0 resultat dans un
     departement qui compte Évry-Courcouronnes, et « evry » aurait cesse de la
     trouver des que le libelle a porte son accent. */
  const app = lire("apps/web/src/App.jsx");
  assert.ok(!/c\.nom\.toLowerCase\(\)\.includes/.test(app),
    "la recherche de communes compare des chaines brutes : un accent la fait echouer");
  const usages = (app.match(/correspond\(cherches,/g) || []).length;
  assert.ok(usages >= 2,
    `la fonction de correspondance n'est utilisee que ${usages} fois : les deux recherches doivent la partager`);
});

test("invariant 4 — toute source déclarée dans l'index est affichée sur l'écran Sources", () => {
  if (!existe("data/index.json")) return;
  /* Le defaut qui a impose ce controle : les scrutins etaient publies, leur
     source etait declaree dans index.json, l'ecran des votes la portait — mais la
     page qui recense les sources ne la nommait pas. Elle enumerait une liste
     ecrite a la main, et personne ne l'avait rouverte en ajoutant un jeu de
     donnees. Trouve a l'oeil sur capture, pas par une assertion. */
  const declarees = Object.entries(litData("index.json").sources || {})
    .filter(([, v]) => v && (Array.isArray(v) ? v.length : true))
    .map(([k]) => k);
  const ecran = lire("apps/web/src/routes/Sources.jsx");
  const absentes = declarees.filter(k => !new RegExp("s\\." + k + "\\b").test(ecran));
  assert.deepEqual(absentes, [],
    "une source declaree n'apparait pas sur l'ecran Sources : " + absentes.join(", "));
});
