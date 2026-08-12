/* ============================================================================
   test_repere.mjs — le banc de Repere, reecrit le 12 aout 2026.
   L'ancien banc n'existait plus : il n'a jamais quitte le conteneur d'une session
   passee. Celui-ci est reconstruit a partir des HUIT INVARIANTS du projet, plus
   les defauts reellement trouves ce jour-la — chacun a son controle, pour qu'il ne
   revienne pas en silence.

   Usage :  node test_repere.mjs app_repere_v18_13.html
   Sortie :  une ligne par controle, puis « VERDICT : tout passe » ou la liste des
             echecs et un code de sortie 1.

   REGLE DE CONCEPTION : un banc vert sur une page cassee reste un banc vert. La
   moitie des controles ci-dessous ouvrent donc reellement l'application dans un
   navigateur et MESURENT le rendu, au lieu de relire le texte du fichier.
   ========================================================================== */
import fs from "node:fs";
import path from "node:path";
import pkg from "/home/claude/.npm-global/lib/node_modules/playwright/index.js";
const { chromium } = pkg;

const CIBLE = process.argv[2];
if (!CIBLE || !fs.existsSync(CIBLE)) {
  console.error("Usage : node test_repere.mjs <app_repere_vXX.html>");
  process.exit(2);
}
const SRC = fs.readFileSync(CIBLE, "utf8");

const resultats = [];
function verif(nom, condition, detail) {
  resultats.push({ nom, ok: !!condition, detail: condition ? "" : (detail || "") });
  const marque = condition ? "  ok  " : " ECHEC";
  console.log(marque + " | " + nom + (condition ? "" : "  -> " + (detail || "")));
}

/* ==========================================================================
   PARTIE 1 — controles statiques, sur le texte du fichier
   ========================================================================== */
console.log("\n--- statique --------------------------------------------------");

/* Invariant 2 — une seule cle de stockage, et rien d'autre. */
{
  const cles = [...SRC.matchAll(/localStorage\.(?:get|set|remove)Item\(\s*([^),]+)/g)].map(m => m[1].trim());
  const litteraux = cles.filter(c => /^["']/.test(c));
  verif("invariant 2 — localStorage n'utilise qu'une constante nommee",
    litteraux.length === 0, "cles ecrites en dur : " + litteraux.join(", "));
  verif("invariant 2 — la constante vaut exactement repere.serie",
    /SERIE_CLE\s*=\s*"repere\.serie"/.test(SRC));
  verif("invariant 2 — sessionStorage jamais utilise", !/sessionStorage\./.test(SRC));
  /* On cherche un USAGE (indexedDB.open, window.indexedDB), pas le mot : l\'app
     promet en toutes lettres de ne pas s\'en servir, et cette promesse contient
     le mot. Un banc qui confond la promesse et la violation ne sert a rien. */
  verif("invariant 2 — indexedDB jamais utilise",
    !/(?:window\.)?indexedDB\s*[.(\[]/.test(SRC));
  verif("invariant 2 — aucun document.cookie", !/document\.cookie/.test(SRC));
}

/* Methode — le fichier n'utilise que des apostrophes ASCII : une ancre de patch
   contenant une apostrophe typographique echoue silencieusement. */
{
  /* Les lignes de donnees engendrees contiennent des apostrophes typographiques
     parce que les noms officiels en contiennent (« Plateau d’Hauteville », INSEE).
     L'invariant porte sur la partie ECRITE A LA MAIN, celle ou se posent les ancres
     de patch : on ne regarde donc que les lignes de moins de 5 000 caracteres. */
  const mainLignes = SRC.split("\n").filter(l => l.length < 5000);
  const n = (mainLignes.join("\n").match(/’/g) || []).length;
  verif("methode — aucune apostrophe typographique dans le code ecrit a la main",
    n === 0, n + " occurrence(s)");
  const nData = (SRC.match(/’/g) || []).length - n;
  if (nData) console.log("  note | " + nData + " apostrophe(s) typographique(s) dans les donnees"
    + " embarquees (noms officiels) : une ancre de patch qui les traverse doit les recopier telles quelles.");
}

/* Invariant 7 — couleurs d'echelon figees. */
{
  const attendues = { ville: "#0e7490", agglo: "#0891b2", departement: "#b45309",
                      region: "#6d28d9", national: "#1d1d1f" };
  for (const [nom, hex] of Object.entries(attendues)) {
    verif("invariant 7 — couleur d'echelon " + nom + " (" + hex + ")",
      SRC.toLowerCase().includes(hex), "introuvable");
  }
}

/* Invariant 8 — jamais le patrimoine : aucun CHAMP de donnee ne doit le porter.
   Les mentions en toutes lettres sont autorisees : l'app explique justement
   pourquoi elle ne l'affichera pas. */
{
  const champs = [...SRC.matchAll(/["']?patrimoine["']?\s*:/gi)].map(m => m[0]);
  verif("invariant 8 — aucun champ de donnee « patrimoine »",
    champs.length === 0, champs.join(", "));
}

/* Invariant 4 — les deux tampons de verification existent tous les deux. */
{
  verif("invariant 4 — le tampon « chiffres verifies » existe", /CHIFFRES V[EÉ]RIFI[EÉ]S/i.test(SRC));
  verif("invariant 4 — le tampon « a confirmer » existe", /[àa] confirmer/i.test(SRC));
}

/* Defaut du 12 aout — un texte qui contredit le code. Deux controles cibles :
   la charte ne peut pas nier la serie de jours si la serie existe, et les prix
   affiches doivent correspondre a l'offre declaree en JavaScript. */
{
  const serieExiste = /SERIE_CLE\s*=/.test(SRC);
  /* Le journal public des corrections CITE l'ancienne formulation pour dire qu'elle
     a ete corrigee. Un controle naif tombe donc sur la trace du correctif et declare
     le defaut toujours present. On retire les passages entre guillemets francais
     avant de chercher : une citation n'est pas une affirmation. */
  const sansCitations = SRC.replace(/«[^»]*»/g, "");
  const charteNie = /Pas de s[eé]rie de jours/i.test(sansCitations);
  verif("coherence — la charte ne nie pas la serie de jours qui existe",
    !(serieExiste && charteNie), "la charte dit le contraire du code");

  const prixJS = (SRC.match(/price\s*:\s*"([^"]+)"/g) || []).map(s => s.match(/"([^"]+)"/)[1]);
  const prixMorts = ["4,99 € <span>une fois</span>", "9,99 € une fois", "Payer une fois"];
  const restes = prixMorts.filter(p => SRC.includes(p));
  verif("coherence — aucun prix de l'ancienne offre ne subsiste a l'ecran",
    restes.length === 0, restes.join(" | "));
  verif("coherence — l'offre JavaScript declare un prix", prixJS.length >= 1, "aucun prix declare");
}

/* Defaut du 12 aout — une promesse d'ecran non tenue. Si un texte renvoie vers
   les mentions legales, le repli doit exister. */
{
  const promet = /Mentions l[eé]gales/i.test(SRC);
  verif("coherence — la promesse de mentions legales est tenue",
    !promet || SRC.includes('id="repli-legal"'), "aucun repli id=repli-legal");
  verif("legal — une adresse de contact existe", /mailto:[^"]+@/.test(SRC));
}

/* Invariant 3 — aucun classement dans le TEXTE VISIBLE. Les commentaires du
   fichier expliquent la regle et emploient donc les mots interdits : on les
   retire avant de chercher. */
{
  let visible = SRC.replace(/<!--[\s\S]*?-->/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
  const pieges = [/\bpalmar[eè]s\b/i, /\bclassement des\b/i, /\bnote sur \d/i, /\bmieux class/i];
  const trouves = pieges.filter(r => r.test(visible)).map(r => String(r));
  verif("invariant 3 — aucun vocabulaire de classement visible",
    trouves.length === 0, trouves.join(", "));
}

/* ==========================================================================
   PARTIE 2 — controles au navigateur, sur le rendu reel
   ========================================================================== */
console.log("\n--- rendu -----------------------------------------------------");

const erreursJS = [];
const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 420, height: 900 } });
const page = await ctx.newPage();
page.on("pageerror", e => erreursJS.push("pageerror: " + e.message));
page.on("console", m => { if (m.type() === "error") erreursJS.push("console: " + m.text().slice(0, 160)); });

await page.goto("file://" + path.resolve(CIBLE));
await page.waitForTimeout(4500);

/* Defaut du 12 aout — le bandeau de troncature se posait sur un fichier entier. */
verif("chargement — le drapeau de fin de fichier est pose",
  await page.evaluate(() => window.REPERE_COMPLET === true));
verif("chargement — aucun bandeau « fichier non charge »",
  !(await page.evaluate(() => !!document.getElementById("repere-tronque"))));

/* Le parcours reel : #ob-input, obValidateTyped(), finishOnboard(). Un obPick()
   avec code INSEE vide donnerait un ecran vide et un banc vert menteur. */
await page.fill("#ob-input", "Ustaritz");
await page.evaluate(() => obValidateTyped());
await page.waitForTimeout(900);
await page.evaluate(() => finishOnboard());
await page.waitForTimeout(1200);
const commune = await page.evaluate(() => ({ nom: STATE.commune, insee: STATE.insee }));
verif("parcours — la commune saisie est bien celle retenue",
  commune.nom === "Ustaritz" && commune.insee === "64547",
  JSON.stringify(commune));

/* Tous les ecrans s'ouvrent, et aucun n'est vide. */
{
  const ids = await page.evaluate(() =>
    [...document.querySelectorAll('.screen[id^="s-"]')].map(e => e.id));
  verif("navigation — au moins quinze ecrans declares", ids.length >= 15, ids.length + " ecran(s)");
  const vides = [];
  for (const id of ids) {
    try {
      await page.evaluate(i => show(i, i), id);
      await page.waitForTimeout(260);
      const h = await page.evaluate(i => {
        const e = document.getElementById(i);
        return e ? Math.round(e.getBoundingClientRect().height) : 0;
      }, id);
      if (h < 120) vides.push(id + " (" + h + "px)");
    } catch (e) { vides.push(id + " (" + e.message.slice(0, 40) + ")"); }
  }
  verif("navigation — aucun ecran ne s'ouvre vide", vides.length === 0, vides.join(", "));
}

/* Aucun lien de navigation ne pointe vers un ecran inexistant. */
{
  const morts = await page.evaluate(() => {
    const ids = new Set([...document.querySelectorAll("[id]")].map(e => e.id));
    const morts = [];
    document.querySelectorAll("[onclick]").forEach(e => {
      const m = [...e.getAttribute("onclick").matchAll(/show(?:Tab)?\(\s*['"]([^'"]+)['"]/g)];
      m.forEach(x => { if (!ids.has(x[1])) morts.push(x[1]); });
    });
    return [...new Set(morts)];
  });
  verif("navigation — aucun bouton ne mene a un ecran inexistant", morts.length === 0, morts.join(", "));
}

/* Invariant 2, verifie APRES le parcours : c'est la seule mesure qui compte. */
{
  const cles = await page.evaluate(() => Object.keys(localStorage));
  verif("invariant 2 — une seule cle ecrite sur l'appareil",
    cles.length <= 1 && (cles.length === 0 || cles[0] === "repere.serie"), cles.join(", "));
  verif("invariant 2 — sessionStorage reste vide",
    (await page.evaluate(() => Object.keys(sessionStorage).length)) === 0);
}

/* Invariant 7 — hors echelon et famille politique, l'interface reste grise.
   Ce controle a ete ajoute parce qu'un lien mailto s'affichait en bleu par
   defaut du navigateur : aucune assertion ne l'avait vu, seule la capture. */
{
  const fautes = await page.evaluate(() => {
    const ech = ["14, 116, 144", "8, 145, 178", "180, 83, 9", "109, 40, 217", "29, 29, 31"];
    const sortis = [];
    document.querySelectorAll("a, button, .k, summary, p, span, h1, h2, h3, h4, li").forEach(e => {
      const r = e.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      const c = getComputedStyle(e).color;
      const m = /rgba?\((\d+), (\d+), (\d+)/.exec(c);
      if (!m) return;
      const v = [+m[1], +m[2], +m[3]];
      const amplitude = Math.max(...v) - Math.min(...v);
      if (amplitude <= 24) return;
      if (ech.some(x => c.includes(x))) return;
      if (e.closest("[data-famille], .fam, .pol, .money-bar, .money-leg, .hemi")) return;
      sortis.push(e.tagName.toLowerCase() + " " + c + " « " + e.textContent.trim().slice(0, 34) + " »");
    });
    return [...new Set(sortis)].slice(0, 8);
  });
  verif("invariant 7 — aucune couleur hors palette dans le texte", fautes.length === 0, fautes.join(" | "));
}

/* Invariant 7 — cibles tactiles de 44 px. */
{
  const petites = await page.evaluate(() => {
    const p = [];
    document.querySelectorAll("button, a, input, [role=switch], summary").forEach(e => {
      const r = e.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      /* Un lien EN LIGNE dans une phrase n'est pas une cible tactile au sens de la
         regle : la recommandation d'accessibilite exempte explicitement les cibles
         situees dans du texte courant. On ne les compte pas — mais on ne relache
         rien d'autre : tout ce qui est bouton, interrupteur ou champ reste soumis
         aux 44 px. */
      if (e.tagName === "A" && getComputedStyle(e).display === "inline") return;
      if (r.height < 44) p.push(e.tagName.toLowerCase() + " " + Math.round(r.height) + "px « "
        + e.textContent.trim().slice(0, 26) + " »");
    });
    return [...new Set(p)].slice(0, 8);
  });
  verif("invariant 7 — cibles tactiles d'au moins 44 px", petites.length === 0, petites.join(" | "));
}

/* Defaut du 12 aout — .src-block li est en display:flex : un <b> place
   directement dedans devient une colonne etroite et le texte se casse en deux. */
{
  const casses = await page.evaluate(() => {
    const p = [];
    document.querySelectorAll("li").forEach(e => {
      if (getComputedStyle(e).display !== "flex") return;
      const enfants = [...e.children];
      if (enfants.length > 1 && enfants.some(c => ["B", "STRONG", "I", "EM"].includes(c.tagName)))
        p.push(e.textContent.trim().slice(0, 44));
    });
    return p.slice(0, 6);
  });
  verif("rendu — aucun texte gras transforme en colonne par un conteneur flex",
    casses.length === 0, casses.join(" | "));
}

/* Doctrine du vide — la ou une donnee manque, il ne doit y avoir aucun element
   graphique de mesure. On verifie qu'aucune barre de largeur nulle ou minuscule
   n'est rendue : une barre de 1 % se lit comme une petite valeur, pas comme une
   absence. */
{
  const minuscules = await page.evaluate(() => {
    const p = [];
    document.querySelectorAll(".money-bar i, .b i, .bar i, [class*=bar] i").forEach(e => {
      const r = e.getBoundingClientRect();
      const parent = e.parentElement ? e.parentElement.getBoundingClientRect().width : 0;
      if (parent > 10 && r.width > 0 && r.width / parent < 0.012)
        p.push(Math.round(r.width) + "px sur " + Math.round(parent) + "px");
    });
    return p.slice(0, 6);
  });
  verif("doctrine du vide — aucune barre minuscule qui ferait passer une absence pour une petite valeur",
    minuscules.length === 0, minuscules.join(" | "));
}

/* Le jeu ne recompense ni ne punit : les medailles ne parlent que d'assiduite. */
{
  await page.evaluate(() => showTab("s-moi", "Moi")).catch(() => {});
  await page.waitForTimeout(700);
  const texte = await page.evaluate(() => {
    const e = document.getElementById("moi-medailles");
    return e ? e.innerText : "";
  });
  verif("invariant 6 — les medailles ne parlent pas de bonne reponse",
    !/bonne r[eé]ponse\s*[:.]/i.test(texte) || /jamais une bonne r[eé]ponse/i.test(texte),
    texte.slice(0, 90));
}

verif("rendu — aucune erreur JavaScript sur tout le parcours",
  erreursJS.length === 0, erreursJS.slice(0, 4).join(" | "));

await nav.close();

/* ==========================================================================
   VERDICT
   ========================================================================== */
const echecs = resultats.filter(r => !r.ok);
console.log("\n---------------------------------------------------------------");
console.log(resultats.length + " controles, " + echecs.length + " echec(s).");
if (echecs.length) {
  console.log("\nA CORRIGER :");
  echecs.forEach(e => console.log("  - " + e.nom + (e.detail ? "  -> " + e.detail : "")));
  console.log("\nVERDICT : il reste " + echecs.length + " probleme(s).");
  process.exit(1);
}
console.log("\nVERDICT : tout passe");
