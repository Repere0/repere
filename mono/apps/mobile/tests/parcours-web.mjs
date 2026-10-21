/* LE PARCOURS DE LA TRANCHE VERTICALE, MESURE DANS UN NAVIGATEUR — 29/09/2026.
 *
 * Sur l'export web de l'application mobile (meme code React Native, rendu par
 * react-native-web), a trois largeurs de telephone : 360, 390, 430 px.
 * Ce n'est pas un telephone : ni VoiceOver, ni TalkBack, ni le clavier natif
 * ne sont eprouves ici. Ce que ce controle mesure vraiment :
 *   1. le parcours accueil -> recherche -> commune -> retour aboutit ;
 *   2. aucune adresse demandee ne porte un code de commune (invariant 2) ;
 *   3. aucun debordement horizontal ;
 *   4. toute cible tactile fait au moins 44 px de haut ;
 *   5. chaque bouton et lien a un nom accessible ;
 *   5b. aucun mot de MOTS_A_ACCENTS n'est affiche sans ses accents ;
 *   6. l'ecran de commune affiche un maire, une source datee et une phrase
 *      pour chaque absence — jamais une carte vide.
 *
 * Usage :
 *   EXPO_PUBLIC_REPERE_DONNEES=/data npx expo export --platform web --output-dir dist-web
 *   cp -r ../../data dist-web/data
 *   node ../../scripts/serveur-statique.mjs dist-web 8811 &
 *   node tests/parcours-web.mjs http://localhost:8811 [dossier-captures]
 */
import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";

/* Le parcours et toutes ses pages partagent un seul instant, y compris au changement de jour. */
const INSTANTANE = new Date();

/* Playwright : celui de l'application si elle l'a (CI mobile), sinon celui de
   mono/ (poste de developpement ou il est deja installe par pnpm). */
let chromium;
for (const racine of ["../package.json", "../../../package.json"]) {
  try { ({ chromium } = createRequire(path.resolve(import.meta.dirname, racine))("playwright")); break; } catch { /* suivant */ }
}
if (!chromium) { console.error("playwright introuvable"); process.exit(2); }
const { adresseFautive, MOTS_A_ACCENTS } = await import("../../../packages/data-utils/src/invariants.js");

const BASE = process.argv[2] || "http://localhost:8811";
const CAPTURES = process.argv[3] || null;
if (CAPTURES) fs.mkdirSync(CAPTURES, { recursive: true });
const COMMUNE = { saisie: "meaux", nom: "Meaux" };
/* Le nom du maire, lu dans les donnees servies (jamais recopie ici). */
const MAIRE = await (async () => {
  try { const r = await fetch(BASE + "/data/departments/77.json"); const j = await r.json(); return j.communes["77284"].maire.nom.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  catch { return "Maire introuvable dans les données servies"; }
})();
/* Le calendrier attendu, recalcule par le socle sur les fichiers servis (07/10/2026) :
   « a venir » vient de deriverAujourdhui lui-meme, jamais d'une regle recopiee ici. */
const CAL = await (async () => {
  const { regrouperParJour, ageReleve, AGE_RELEVE_NORMAL } = await import("../../../packages/core/src/calendrier.js");
  const { jourParis, deriverAujourdhui } = await import("../../../packages/core/src/aujourdhui.js");
  const lire = async f => { try { const r = await fetch(BASE + "/data/" + f); return r.ok ? await r.json() : null; } catch { return null; } };
  const cal = await lire("calendrier-senat.json"), agendaAN = await lire("agenda-an.json");
  const vieux = [];
  for (const [de, j] of [["du Sénat", cal], ["de l'Assemblée nationale", agendaAN]]) {
    const age = j && j.source ? ageReleve(j.source.releve_le) : null;
    if (age !== null && age > AGE_RELEVE_NORMAL) vieux.push({ de, age });
  }
  /* ce qui a commence aujourd'hui compte aussi (16/10/2026 : lib/calendrier rendezVousAffiches) */
  const { aVenir: aVenirSeul, commenceesAujourdhui } = deriverAujourdhui({ fiche: { nom: "x", circo: null }, commune: "00000", dep: "77", index: { agregats: [], sources: {} },
    projets: null, cat: null, pos: null, deputes: null, cal, agendaAN, evenements: null, maintenant: INSTANTANE });
  const aVenir = [...(commenceesAujourdhui || []), ...aVenirSeul];
  const limite = jourParis(new Date(INSTANTANE.getTime() + 14 * 864e5));
  let proches = aVenir.filter(e => e.debut.slice(0, 10) < limite);
  if (!proches.length) proches = aVenir.slice(0, 5);
  /* agendaLu : au moins un agenda servi. La CI « Mobile » n'extrait que le fichier autonome :
     aucun agenda, l'ecran dit l'absence et n'a pas de frise (constate le 17/10/2026). */
  return { lignes: regrouperParJour(proches).length, vieux, agendaLu: !!(cal || agendaAN) };
})();
/* Les elus du canton de Meaux, lus dans les donnees servies (07/10/2026). */
const ELUS_CANTON = await (async () => {
  try { const r = await fetch(BASE + "/data/departments/77.json"); const j = await r.json(); const f = j.communes["77284"]; return (j.conseil_departemental || []).filter(e => (f.canton || []).includes(e.canton)).map(e => e.nom); }
  catch { return []; }
})();
/* La semaine au Parlement attendue, calculee par le socle sur les fichiers servis
   (07/10/2026). Un fichier absent n'est pas compte, comme dans l'application. */
const { semaineParlement, jourParis } = await import("../../../packages/core/src/aujourdhui.js");
const servi = async f => { try { const r = await fetch(BASE + "/data/" + f); return r.ok ? await r.json() : null; } catch { return null; } };
const SEMAINE = semaineParlement({ agendaAN: await servi("agenda-an.json"), cal: await servi("calendrier-senat.json"), maintenant: INSTANTANE });
/* Les explications de la carte sont repliees (16/10/2026) : on les ouvre avant de lire. */
const lireSemaine = async page => {
  const r = page.getByTestId("semaine-parlement").getByRole("button", { name: "Le détail (semaine)", expanded: false });
  if (await r.count()) { await r.first().click(); await page.waitForTimeout(200); }
  return lireSemaineDom(page);
};
const lireSemaineDom = page => page.evaluate(() => {
  const c = document.querySelector('[data-testid="semaine-parlement"]');
  if (!c || !c.offsetParent) return null;
  const reps = [...document.querySelectorAll('[data-testid="reponse"]')].filter(e => e.offsetParent);
  const ordre = { haut: Math.round(c.getBoundingClientRect().top), basReponses: reps.map(e => Math.round(e.getBoundingClientRect().bottom)) };
  return {
    sous: reps.length > 0 && ordre.basReponses.every(b => b <= ordre.haut), ordre,
    jours: [...c.querySelectorAll('[data-testid="semaine-jour"]')].map(e => e.getAttribute("aria-label")),
    votes: c.querySelectorAll('[data-testid="semaine-vote"]').length,
    texte: c.innerText,
  };
});
let echecs = 0;
/* 07/10/2026 : sur GitHub, chaque echec devient une annotation du run - le
   journal complet n'est lisible ni depuis le conteneur de travail ni depuis un
   telephone (meme principe que banc() dans outils/pipeline.sh). */
const verifier = (ok, texte) => {
  console.log((ok ? "ok   " : "ECHEC") + " " + texte);
  if (!ok) { echecs++; if (process.env.GITHUB_ACTIONS) console.log("::error title=parcours mobile::" + String(texte).replace(/\r?\n/g, " ").slice(0, 900)); }
};

const navigateur = await chromium.launch();
async function installerHorloge(page) {
  await page.clock.setFixedTime(INSTANTANE);
  await page.waitForTimeout(10);
  const lu = await page.evaluate(() => Date.now());
  if (lu !== INSTANTANE.getTime()) throw new Error(`Horloge Playwright non fixée : ${lu} au lieu de ${INSTANTANE.getTime()}`);
  return page;
}
const nouvellePage = async options => installerHorloge(await navigateur.newPage(options));
const pageDuContexte = async contexte => installerHorloge(await contexte.newPage());
/* GARDE-TEMPS — 08/10/2026. Le 07/10, la CI mobile de #94 a tourne 24 minutes
   sans un seul echec, puis a ete coupee par la limite du travail (25 min) : rien
   ne disait ou elle s'etait arretee. Un parcours normal dure 3 a 5 minutes. Passe
   ce delai, le parcours s'arrete de lui-meme et NOMME le dernier controle passe,
   en annotation lisible sans les journaux. */
const LIMITE_MS = Number(process.env.REPERE_PARCOURS_LIMITE_MS || 12 * 60e3);
let dernierControle = "(aucun controle encore)";
const ecrire = console.log;
console.log = (...a) => { dernierControle = a.join(" ").slice(0, 200); ecrire(...a); };
setTimeout(() => {
  const msg = `parcours bloque depuis ${Math.round(LIMITE_MS / 1000)} s ; dernier controle passe : ${dernierControle}`;
  ecrire(process.env.GITHUB_ACTIONS ? `::error title=parcours mobile::${msg}` : "ECHEC " + msg);
  process.exit(3);
}, LIMITE_MS).unref();
/* LE PARCOURS PASSE AUSSI EN THEME SOMBRE (20/10/2026). Le theme sombre est arrive
   ce jour-la, et trois de ses defauts ont ete trouves a l'oeil sur des captures : un
   fond de page reste clair, un bloc inverse devenu une glacure, une carte de partage
   qui suivait le theme. L'oeil ne passe pas sur tous les ecrans ; ce parcours, si.
   Il mesure deja le contraste, les debordements, les cibles tactiles et les noms
   accessibles de CHAQUE ecran — il suffisait de le refaire en sombre.
   Une seule largeur en sombre (390 px) : le theme ne change pas la mise en page, et
   tripler le parcours le ferait sortir de son garde-temps. */
for (const { largeur, theme } of [
  { largeur: 360, theme: "light" }, { largeur: 390, theme: "light" },
  { largeur: 430, theme: "light" }, { largeur: 390, theme: "dark" },
]) {
  const etq = theme === "dark" ? largeur + "px sombre" : largeur + "px";
  const page = await nouvellePage({ viewport: { width: largeur, height: 800 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: theme });
  const demandees = [];
  page.on("request", r => demandees.push(r.url()));
  await page.goto(BASE + "/", { waitUntil: "networkidle" });

  const champ = page.getByLabel(/Où habitez-vous/);
  await champ.fill(COMMUNE.saisie);
  const resultat = page.getByRole("button", { name: new RegExp("^" + COMMUNE.nom + ",") }).first();
  await resultat.waitFor({ timeout: 10000 });
  if (CAPTURES) await page.screenshot({ path: path.join(CAPTURES, `accueil-${largeur}.png`), fullPage: true });
  await resultat.click();

  await page.getByText("Aller plus loin").first().waitFor({ timeout: 15000 });
  await page.waitForLoadState("networkidle");
  /* Le ScrollView de React Native defile a l'interieur de la page : une capture
     « pleine page » n'en montrerait que le haut. On le fait defiler. */
  if (CAPTURES) {
    for (let i = 0; i < 6; i++) {
      await page.screenshot({ path: path.join(CAPTURES, `chez-vous-${largeur}-${i}.png`) });
      const fini = await page.evaluate(() => {
        const el = [...document.querySelectorAll("div")].filter(e => e.scrollHeight > e.clientHeight + 4 && /(auto|scroll)/.test(getComputedStyle(e).overflowY))
          .sort((x, y) => y.scrollHeight - x.scrollHeight)[0];
        if (!el) return true;
        const avant = el.scrollTop; el.scrollTop += el.clientHeight - 120; return el.scrollTop === avant;
      });
      if (fini) break;
      await page.waitForTimeout(150);
    }
  }

  /* LE CHIFFRE AGRANDI — 21/10/2026.
     La carte agrandit le morceau de sa phrase qui EST sa reponse. Deux choses
     peuvent casser sans que rien ne rougisse :
       a) la phrase affichee n'est plus la phrase entiere (le decoupage mange un
          morceau) — le lecteur d'ecran, lui, doit toujours recevoir la phrase ;
       b) c'est le MAUVAIS nombre qui grossit. C'est arrive : le premier jet
          devinait le premier montant et a grossi le cout du projet (1,5 million)
          au lieu de ce que l'Etat paie (726 800 €), ce qui induit en erreur.
     Cette garde a ete eprouvee en inversant `chiffre` sur la carte des projets :
     elle tombe (« le chiffre agrandi ... n'est pas la reponse »). */
  {
    const gros = await page.evaluate(() => {
      const out = [];
      for (const e of document.querySelectorAll('[data-testid="reponse"] *')) {
        if (e.children.length || !(e.textContent || "").trim()) continue;
        if (parseFloat(getComputedStyle(e).fontSize) < 24) continue;
        const porteur = e.closest("[aria-label]");
        out.push({ gros: e.textContent.trim(), phrase: porteur ? porteur.getAttribute("aria-label") : null });
      }
      return out;
    });
    for (const g of gros) {
      verifier(g.phrase !== null && g.phrase.includes(g.gros),
        `chiffre agrandi : « ${g.gros} » est dans la phrase entiere lue par le lecteur d'ecran`);
      verifier(/\d/.test(g.gros) && /[%€]|million|milliard/.test(g.gros),
        `chiffre agrandi : « ${g.gros} » est bien un montant`);
    }
    /* QUAND LA PHRASE POSE SA REPONSE APRES UN DEUX-POINTS, c'est elle qu'on
       agrandit. « L'Etat finance pres de la moitie d'un projet de 1,5 million
       d'euros hors taxes a Meaux : 726 800 €. » porte deux montants ; le premier
       jet a grossi le cout du projet, qui n'est pas la reponse. Cette regle ne
       depend d'aucun nom de champ : elle se lit dans la phrase affichee.
       (Une premiere version de cette garde interrogeait `communes[].projets`,
       qui n'existe pas dans le fichier departemental : elle ne s'executait
       jamais. Une garde muette ne garde rien.) */
    let posees = 0;
    for (const g of gros) {
      if (!g.phrase) continue;
      const apres = g.phrase.split(/\s:\s/).pop();
      const dernier = (apres.match(/[\d][\d \u00a0\u202f]*(?:,\d+)?\s*[%€]/g) || []).pop();
      if (!dernier) continue;
      posees++;
      verifier(g.gros.replace(/\s/g, "") === dernier.replace(/\s/g, ""),
        `chiffre agrandi : « ${g.gros} » est bien la reponse que pose la phrase (${dernier.trim()})`);
    }
    verifier(posees > 0, `chiffre agrandi : ${posees} phrase(s) reellement mesuree(s) — la garde n'est pas muette`);
  }

  /* Mesure d'un ecran : debordement, cibles, noms accessibles, texte (avec et
     sans capitales de style). Appliquee a l'accueil ET aux trois ecrans de
     detail depuis la refonte du 30/09/2026. */
  const mesurer = () => page.evaluate(() => {
    const d = document.documentElement;
    const cibles = [...document.querySelectorAll('[role="button"],[role="link"],button,a,input')]
      .filter(e => e.offsetParent !== null);
    return {
      deborde: d.scrollWidth > d.clientWidth + 1,
      petites: cibles.map(e => ({ t: (e.getAttribute("aria-label") || e.textContent || "").trim().slice(0, 40), h: e.getBoundingClientRect().height }))
        .filter(c => c.h < 44),
      sansNom: cibles.filter(e => !(e.getAttribute("aria-label") || e.textContent || "").trim()).length,
      texte: document.body.innerText,
      etiquettes: [...document.querySelectorAll("[aria-label]")].map(e => e.getAttribute("aria-label")).join(" | "),
      /* CONTRASTE AA MESURE SUR LE RENDU (spike du 30/09/2026) : chaque texte
         visible contre le fond REELLEMENT PEINT sous lui. 4,5:1, ou 3:1 pour le
         grand texte (24 px, ou 18,66 px gras). Il a trouve, au premier tour, les
         libelles d'echelon de la chaine : l'intercommunalite a 3,21:1.

         20/10/2026 — LE FOND N'EST PAS TOUJOURS CELUI D'UN PARENT. La mesure
         remontait les ancetres. En theme sombre, elle a declare le bouton retour de
         l'en-tete a 1,08:1 sur TOUS les ecrans : son premier ancetre opaque est le
         conteneur de navigation, reste clair, alors que la barre sombre est peinte
         A COTE de cette chaine, au-dessus de lui. A l'oeil, le texte est lisible ;
         la mesure avait tort. Elle demande donc au navigateur ce qu'il peint sous
         le texte (elementsFromPoint) et ne retombe sur les ancetres que si ce point
         ne donne rien. Une mesure fausse qui crie est aussi dangereuse qu'une
         mesure absente : elle apprend a ignorer les alertes. */
      contrastes: (() => {
        const rgb = x => (x.match(/[\d.]+/g) || []).map(Number);
        const lum = ([r, g, b]) => [r, g, b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; })
          .reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
        const opaque = x => { const c = rgb(x); return c.length >= 3 && (c.length < 4 || c[3] > 0.5) ? c : null; };
        const parAncetres = e => { for (; e; e = e.parentElement) { const c = opaque(getComputedStyle(e).backgroundColor); if (c) return c; } return null; };
        const fond = e => {
          /* Le point n'est interrogeable que si l'element est VRAIMENT dans la
             fenetre : plus bas, elementsFromPoint echantillonnerait un autre endroit
             de l'ecran (mesure du 20/10/2026 : en bornant les coordonnees, la garde
             a declare faux 15 textes parfaitement lisibles). Hors fenetre, les
             ancetres restent la meilleure approximation. */
          const b = e.getBoundingClientRect();
          const visible = b.width > 0 && b.height > 0
            && b.top >= 0 && b.bottom <= innerHeight && b.left >= 0 && b.right <= innerWidth;
          /* Et le point doit tomber SUR ce texte : s'il tombe sur autre chose (un
             element par-dessus, un decalage de rendu), la pile interrogee n'est pas
             celle du texte. Mesure du 20/10/2026 : sans cette condition, « Qui décide
             chez vous ? » etait declare a 1,12:1 a 430 px seulement. */
          const x = b.left + b.width / 2, y = b.top + b.height / 2;
          const dessus = visible ? document.elementFromPoint(x, y) : null;
          if (visible && dessus && (dessus === e || e.contains(dessus) || dessus.contains(e))) {
            for (const sous of document.elementsFromPoint(x, y)) {
              const c = opaque(getComputedStyle(sous).backgroundColor);
              if (c) return c;
            }
          }
          return parAncetres(e) || [255, 255, 255];
        };
        const out = new Set();
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n; (n = w.nextNode());) {
          const t = n.textContent.trim(), e = n.parentElement;
          if (!t || !e || e.offsetParent === null) continue;
          /* L'ECRAN PRECEDENT RESTE DANS LE DOM. expo-router garde les ecrans montes
             et marque les inactifs aria-hidden="true" : ni le lecteur ni un lecteur
             d'ecran ne les voient. Les mesurer faisait crier la garde sur des textes
             invisibles (20/10/2026 : « Qui décide chez vous ? » declare illisible
             depuis l'ecran du calendrier). Une garde qui crie a tort apprend a
             ignorer les alertes. */
          if (e.closest('[aria-hidden="true"]')) continue;
          const st = getComputedStyle(e), c = rgb(st.color);
          if (c.length >= 4 && c[3] < 1) continue;
          const [a, b] = [lum(c), lum(fond(e))].sort((x, y) => y - x);
          const r = (a + 0.05) / (b + 0.05), px = parseFloat(st.fontSize);
          const seuil = px >= 24 || (Number(st.fontWeight) >= 700 && px >= 18.66) ? 3 : 4.5;
          if (r < seuil) out.add(`${r.toFixed(2)}:1 « ${t.slice(0, 30)} »`);
        }
        return [...out];
      })(),
      /* Le texte SANS les capitales de style : sous textTransform, « DEPUTE »
         echappait a la recherche de « depute » (29/09/2026). */
      brut: (() => {
        const st = document.createElement("style");
        st.textContent = "*{text-transform:none!important}";
        document.head.appendChild(st);
        const t = document.body.innerText;
        st.remove();
        return t;
      })(),
    };
  });
  const communs = (m, ecran) => {
    verifier(!m.deborde, `${etq} · ${ecran} : aucun débordement horizontal`);
    verifier(m.petites.length === 0, `${etq} · ${ecran} : cibles tactiles >= 44 px ${JSON.stringify(m.petites)}`);
    verifier(m.sansNom === 0, `${etq} · ${ecran} : chaque contrôle a un nom accessible (${m.sansNom} sans nom)`);
    verifier(m.contrastes.length === 0, `${etq} · ${ecran} : tout texte visible atteint le contraste AA ${JSON.stringify(m.contrastes)}`);
    const sansAccents = MOTS_A_ACCENTS.filter(x => new RegExp("(^|[^\\p{L}])" + x + "($|[^\\p{L}])", "u").test(m.brut));
    verifier(sansAccents.length === 0, `${etq} · ${ecran} : aucun mot affiché sans ses accents ${JSON.stringify(sansAccents)}`);
    /* AUCUNE ABREVIATION DE MONTANT A L'ECRAN (20/10/2026). « 121,3 M€ » ne se lit
       pas a voix haute et ne se comprend pas en cinq secondes ; le produit dit
       « 121,3 millions d'euros » (montantEnMots). La garde porte sur une
       PROPRIETE du texte affiche, pas sur la liste des ecrans ou des fonctions :
       une nouvelle carte qui emploierait montantCourt la fera rougir. */
    const abreges = (m.brut.match(/\d[\s\u00a0]?(?:M€|Md€|K€|k€)/g) || []);
    verifier(abreges.length === 0, `${etq} · ${ecran} : aucun montant abrégé affiché ${JSON.stringify(abreges)}`);
  };

  /* L'ACCUEIL « AUJOURD'HUI » (« Chez vous » avant le 07/10/2026) : cinq questions, chacune avec sa source */
  const mesure = await mesurer();
  communs(mesure, "Aujourd'hui");
  verifier(new RegExp(MAIRE).test(mesure.texte), `${etq} : le maire est nommé (${MAIRE})`);
  verifier(/Publication Repère du \d/.test(mesure.texte), `${etq} : la date de la publication affichée est dite`);
  verifier((mesure.etiquettes.match(/D'où vient cette information/g) || []).length >= 3, `${etq} : chaque réponse de l'accueil porte sa source`);
  /* 20/10/2026 : la phrase dit « a voté pour » et non plus « son vote : pour » —
     une reponse, pas un paragraphe (packages/core/src/phrases.js). */
  verifier(/a voté (pour|contre|l'abstention)/.test(mesure.texte) && /députés ayant pris part au vote/.test(mesure.etiquettes),
    `${etq} : le vote du député s'affiche, et sa répartition se lit aussi en phrase`);
  verifier(/a dépensé [\d\s]+€ par habitant/.test(mesure.texte), `${etq} : l'argent de la commune se dit en une phrase`);
  /* « Réponses d'abord » (30/09/2026) : une reponse, pas une rubrique ; jamais
     une donnee de presence, jamais « dernier ». */
  verifier(!/a participé|n'a pas participé|dernier vote/i.test(mesure.brut), `${etq} : aucune donnée de présence, aucun « dernier vote »`);
  /* Spike du 30/09/2026 : la source devient discrete, mais un calcul se dit
     calcul A L'OEIL (invariant 4), pas seulement dans la feuille. */
  verifier(/Calcul Repère/.test(mesure.texte), `${etq} : un chiffre calculé se dit calculé sans ouvrir la feuille`);
  verifier(/Le calendrier/.test(mesure.brut), `${etq} : la carte « ce qui arrive » est présente (ou sa phrase d'absence)`);
  /* LA SEMAINE AU PARLEMENT (PR B, 07/10/2026) : sous les trois reponses, jamais
     parmi elles ; nationale, dite comme telle ; ce qu'elle compte est recalcule
     ici depuis les fichiers SERVIS, par la meme fonction du socle. */
  {
    const vu = await lireSemaine(page);
    verifier(vu && vu.sous, `${etq} · semaine : la carte est sous les trois réponses ${JSON.stringify(vu && vu.ordre)}`);
    if (SEMAINE.institutions.length) {
      const total = vu.jours.reduce((n, l) => n + (Number((/: (\d+) séance/.exec(l) || [])[1]) || 0), 0);
      verifier(vu.jours.length === 7 && total === SEMAINE.total,
        `${etq} · semaine : sept jours, ${SEMAINE.total} séance(s) publique(s), comme le socle (${total} lues)`);
      verifier(vu.votes === Math.min(2, SEMAINE.votesSolennels.length), `${etq} · semaine : les votes solennels annoncés sont montrés (${vu.votes})`);
      verifier(/tout le pays, pas seulement Meaux/.test(vu.texte), `${etq} · semaine : la carte dit qu'elle est nationale`);
      /* 08/10/2026 : un releve de plus d'un jour le dit, sur l'accueil aussi */
      {
        const { ageReleve, AGE_RELEVE_NORMAL } = await import("../../../packages/core/src/calendrier.js");
        const vieux = SEMAINE.institutions.map(x => ({ de: x.institution === "Sénat" ? "du Sénat" : "de l'Assemblée nationale", age: ageReleve(x.source && x.source.releve_le) }))
          .filter(x => x.age !== null && x.age > AGE_RELEVE_NORMAL);
        verifier(vieux.every(x => new RegExp("Agenda " + x.de + " relevé le .+, il y a " + x.age + " jours").test(vu.texte)),
          `${etq} · semaine : un relevé ancien le dit ${JSON.stringify(vieux)}`);
      }
    } else {
      verifier(/n'est arrivé jusqu'à cet appareil pour aucune institution/.test(vu.texte),
        `${etq} · semaine : sans calendrier servi, la phrase d'absence (jamais une semaine vide)`);
    }
  }
  const fautives = demandees.filter(u => adresseFautive(u));
  verifier(fautives.length === 0, `${etq} : aucune adresse ne porte un code de commune ${JSON.stringify(fautives)}`);
  verifier(!/77284/.test(page.url()), `${etq} : l'adresse de la page ne porte pas le code de la commune`);

  /* LA FEUILLE DE SOURCE (niveau 4) */
  await page.getByRole("button", { name: /D'où vient cette information/ }).first().click();
  await page.getByText("Comment Repère l'utilise").first().waitFor({ timeout: 5000 });
  const feuille = await page.evaluate(() => document.body.innerText);
  verifier(/Données publiées le \d/.test(feuille) && /↗/.test(feuille),
    `${etq} : une pastille ouvre la feuille de source : producteur, date, usage et lien vers la donnée originale`);
  verifier(/Traitées par Repère le \d/.test(feuille), `${etq} : la feuille distingue la date de la source de celle du traitement par Repère`);
  await page.getByRole("button", { name: "Fermer" }).first().click();
  await page.waitForTimeout(400);

  /* LES QUESTIONS SUIVANTES : deux depuis les reponses, une depuis le bloc sombre
     « Qui décide chez vous ? » (16/10/2026 : il remplace l'entree « Qui décide » de
     « Aller plus loin »), deux depuis « Aller plus loin ». */
  const QUI = "Voir la chaîne complète : qui décide pour Meaux";
  for (const [action, question, preuve] of [
    ["Où va cet argent ?", /Où va l'argent de Meaux/, /Sur 100 € dépensés, \d+ € servent à payer les personnes employées par la commune/],
    ["Comprendre ce vote", /Qu'a voté votre député/, /Le parcours d'une loi|Où en est ce texte/],
    [QUI, /Qui décide pour Meaux/, /Décide : /],
    /* L'écran du calendrier porte, depuis le canevas du 13/10/2026, le titre « Calendrier »
       et la phrase « Les séances annoncées… » : c'est elle qui répond à la question. */
    ["Le calendrier", /Les séances annoncées à l'Assemblée nationale/, /concernent tout le pays/],
    ["Sources", /Repère a traité ces fichiers/, /Repère a traité ces fichiers le \d.*Données publiées le \d.*Données relevées le \d/s],
  ]) {
    await page.getByRole("button", { name: action, exact: true }).first().click();
    await page.getByText(question).first().waitFor({ timeout: 10000 });
    await page.waitForTimeout(800);
    /* Les explications sont repliees (16/10/2026) : on les ouvre toutes, en deux
       passes, avant de mesurer — le contraste, les cibles et le texte se verifient
       aussi dans les replis. */
    /* Le premier repli ferme, jusqu'a ce qu'il n'en reste aucun : la liste se
       recalcule apres chaque ouverture (replis imbriques). Plafond : 40. */
    const fermes = page.getByRole("button", { name: /^Le détail|^En savoir plus|Ce que veut dire chaque étape|^Le parcours d'une loi|^Voir ses \d+ autres votes|^Voir les \d+ autres rendez-vous/, expanded: false }).filter({ visible: true });
    for (let k = 0; k < 40 && await fermes.count(); k++) await fermes.first().click();
    await page.waitForTimeout(300);
    const m = await mesurer();
    communs(m, action);
    if (action === "Le calendrier") {
      /* PAR JOURNEE (07/10/2026) : autant de lignes que de groupes calcules par le
         socle sur les fichiers servis, pour les deux prochaines semaines. */
      const lignes = await page.evaluate(() => document.querySelectorAll('[data-testid="cal-ligne"]').length);
      verifier(lignes === CAL.lignes, `${etq} · Le calendrier : une ligne par texte et par jour (${lignes} affichées, ${CAL.lignes} attendues)`);
      verifier(CAL.vieux.every(x => new RegExp("Agenda " + x.de + " relevé le .+, il y a " + x.age + " jours").test(m.brut)),
        `${etq} · Le calendrier : un relevé ancien le dit, avec sa date ${JSON.stringify(CAL.vieux)}`);
      /* 17/10/2026 : « 13 octobre, 0 élément » pour un jour passe qui avait deux seances.
         Chaque case dit l'un des quatre etats du socle, et les jours deja passes de la
         semaine sont dits passes (ni « 0 », ni « aucun »). */
      const cases = await page.evaluate(() => [...document.querySelectorAll('[role="button"]')].filter(e => e.checkVisibility())
        .map(e => e.getAttribute("aria-label") || "").filter(l => /^(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche) \d/.test(l)));
      const forme = /^(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche) \d{1,2}(er)? \S+, (jour passé|\d+ rendez-vous publiés?|aucun rendez-vous publié|agenda pas encore publié)$/;
      const rangAujourdhui = (new Date(INSTANTANE.toLocaleString("en-US", { timeZone: "Europe/Paris" })).getDay() + 6) % 7;
      if (CAL.agendaLu) {
        verifier(cases.length === 7 && cases.every(l => forme.test(l)) && cases.filter(l => /jour passé$/.test(l)).length === rangAujourdhui,
          `${etq} · Le calendrier : chaque jour de la semaine dit vrai, les ${rangAujourdhui} jours passés le disent ${JSON.stringify(cases)}`);
      } else {
        /* sans agenda servi, aucune case ne pretend dire un jour (ni « 0 », ni « aucun ») */
        verifier(cases.length === 0, `${etq} · Le calendrier sans agenda servi : aucune case de jour n'annonce quoi que ce soit ${JSON.stringify(cases)}`);
      }
    }
    if (action === QUI) verifier(/Île-de-France Mobilités/.test(m.brut) && !/Décide : les transports/.test(m.brut), `${etq} · Qui décide : en Île-de-France, l'intercommunalité ne « décide » pas des transports`);
    verifier(preuve.test(m.brut), `${etq} · ${action} : l'écran répond à sa question`);
    if (action === "Sources") {
      /* Depuis le 15/10/2026 (360b264, « sources repliées »), la licence est sous
         « Ce que Repère en tire et sa licence » : un geste l'ouvre. On l'ouvre, puis on
         lit. Le controle reste le meme : la licence est dite, et la source des noms des
         deputes est citee. */
      const repli = page.getByRole("button", { name: /Ce que Repère en tire et sa licence/ }).first();
      if (await repli.count()) { await repli.click(); await page.waitForTimeout(400); }
      const brut = await page.evaluate(() => document.body.innerText);
      verifier(/Licence : /.test(brut) && /Les noms des députés/.test(brut), `${etq} · Sources : chaque source dit sa licence, et la source des noms des députés est citée`);
    }
    if (action === QUI) verifier(ELUS_CANTON.length >= 2 && ELUS_CANTON.every(n => m.brut.includes(n)), `${etq} · Qui décide : tous les élus du canton sont nommés ${JSON.stringify(ELUS_CANTON)}`);
    /* 16/10/2026 : toucher le point « Région » amene la carte Région en haut de l'ecran. */
    if (action === QUI) {
      const point = page.getByRole("button", { name: /^Région :.*Aller à ce niveau$/ }).first();
      /* Point de depart connu : le haut de l'ecran, la ou sont les points. Le parcours a
         deja fait defiler la page plus haut ; sans ce retour, la carte pouvait etre deja
         en vue et le controle ne prouvait rien. */
      await page.evaluate(() => { for (const d of document.querySelectorAll("div")) if (d.scrollHeight > d.clientHeight + 4 && /(auto|scroll)/.test(getComputedStyle(d).overflowY)) d.scrollTop = 0; });
      await page.waitForTimeout(300);
      const avant = await page.evaluate(() => { const e = [...document.querySelectorAll("div")].filter(d => d.checkVisibility() && d.children.length === 0).find(d => (d.innerText || "").startsWith("Région ·")); return e ? Math.round(e.getBoundingClientRect().top) : null; });
      if (await point.count()) { await point.click(); await page.waitForTimeout(900); }
      const apres = await page.evaluate(() => { const e = [...document.querySelectorAll("div")].filter(d => d.checkVisibility() && d.children.length === 0).find(d => (d.innerText || "").startsWith("Région ·")); return e ? Math.round(e.getBoundingClientRect().top) : null; });
      verifier(apres !== null && apres >= 0 && apres < 260 && avant !== null && avant > 260 && apres < avant, `${etq} · Qui décide : le point « Région » amène à sa carte (${avant} px -> ${apres} px)`);
    }
    if (action !== "Sources") verifier(/D'où vient cette information/.test(m.etiquettes) || /Le calendrier n'est arrivé/.test(m.texte), `${etq} · ${action} : la source est à portée de doigt`);
    if (/argent/.test(action)) {
      verifier(/Calculé par Repère · source/.test(m.texte), `${etq} · ${action} : les parts calculées se disent calculées`);
      /* 08/10/2026 (audit) : chaque carte de chiffres dit l'annee de ses comptes */
      const titres = (m.brut.match(/(Où vont 100 € dépensés|D'où vient l'argent|Sa dette|Chaque jour, en moyenne)[^\n]*/g) || []);
      verifier(titres.length > 0 && titres.every(t => /\d{4}/.test(t)), `${etq} · ${action} : chaque carte de chiffres porte l'année de ses comptes ${JSON.stringify(titres)}`);
      await page.getByRole("button", { name: "Détails du calcul" }).first().click();
      await page.getByText(/ce n'est pas un chiffre publié/).first().waitFor({ timeout: 5000 });
      verifier(true, `${etq} · ${action} : le détail du calcul s'ouvre`);
    }
    /* Qui décide et Le calendrier sont des onglets (13/10/2026) : on y revient par la
       barre basse, pas par un bouton « Revenir ». Les autres écrans gardent le bouton. */
    if (action === QUI || action === "Le calendrier") {
      await page.getByText("Aujourd'hui", { exact: true }).last().click();
    } else {
      await page.getByRole("button", { name: "Revenir à l'écran précédent" }).last().click();
    }
    await page.getByText("Aller plus loin").first().waitFor({ timeout: 5000 });
  }

  await page.getByRole("button", { name: "Revenir à l'accueil" }).last().click();
  await page.getByText("Où habitez-vous ?").waitFor({ timeout: 5000 });
  verifier(true, `${etq} : retour à l'accueil`);
  await page.close();
}
/* UNE DETTE NULLE PUBLIEE SE DIT — 08/10/2026 (audit). Bassevelle (77024) publie
   un encours de dette nul : la carte disparaissait sans un mot. */
{
  const page = await nouvellePage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.getByLabel(/Où habitez-vous/).fill("bassevelle");
  await page.getByRole("button", { name: /^Bassevelle,/ }).first().click();
  await page.getByText("Aller plus loin").first().waitFor({ timeout: 15000 });
  await page.getByRole("button", { name: "Où va cet argent ?", exact: true }).first().click();
  await page.getByText(/Où va l'argent de Bassevelle/).first().waitFor({ timeout: 10000 });
  await page.waitForTimeout(800);
  const t = await page.evaluate(() => document.body.innerText);
  verifier(/publie un encours de dette nul pour Bassevelle en \d{4}, sur le budget principal : aucun emprunt n'y reste à rembourser/.test(t), "argent : une dette nulle publiée se dit, la carte ne disparaît pas");
  await page.close();
}
/* HORS D'ILE-DE-FRANCE — 08/10/2026 : une commune d'ailleurs n'est jamais dite
   introuvable ; la phrase dit que la beta ne la couvre pas encore. */
{
  const page = await nouvellePage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.getByLabel(/Où habitez-vous/).fill("Lyon");
  await page.waitForTimeout(800);
  const t = await page.evaluate(() => document.body.innerText);
  verifier(/Aucune commune d'Île-de-France ne correspond à «\s?Lyon\s?»/.test(t) && /pas encore disponibles ici/.test(t) && !/Rien ne correspond/.test(t),
    "recherche : hors d'Île-de-France, la couverture de la bêta est dite, jamais une absence");
  await page.close();
}
/* LES PANNES PARTIELLES DISENT « PAS ARRIVE », JAMAIS « ABSENT » — audit de
   #45, 29/09/2026. Avant correction, un fichier de projets ou de votes coupe
   faisait afficher « Aucun projet ... n'est publie » : une phrase fausse. */
async function ouvrirAvecPanne(motif) {
  const page = await nouvellePage({ viewport: { width: 390, height: 800 }, isMobile: true, hasTouch: true });
  await page.route(motif, r => r.abort());
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.getByLabel(/Où habitez-vous/).fill(COMMUNE.saisie);
  await page.getByRole("button", { name: new RegExp("^" + COMMUNE.nom + ",") }).first().click();
  await page.waitForTimeout(1500);
  await page.waitForLoadState("networkidle");
  const texte = await page.evaluate(() => document.body.textContent);
  await page.close();
  return texte;
}
{
  const t = await ouvrirAvecPanne("**/data/projets/**");
  verifier(/projets financés par l'État ne sont pas arrivés/.test(t) && !/Aucun projet financé/.test(t),
    "panne des projets : « pas arrivés », jamais « aucun projet »");
  verifier(new RegExp(MAIRE).test(t) && /a voté /.test(t), "panne des projets : le reste de l'écran s'affiche");
}
{
  const t = await ouvrirAvecPanne("**/data/scrutins/**");
  verifier(/votes de l'Assemblée ne sont pas arrivés/.test(t) && !/Aucun vote solennel/.test(t),
    "panne des votes : « pas arrivés », jamais « aucun vote »");
}
{
  const t = await ouvrirAvecPanne("**/data/departments/**");
  verifier(/n'a pas réussi à joindre le serveur/.test(t) && /Réessayer/.test(t),
    "panne du département : phrase d'échec et bouton Réessayer");
}

/* MOUVEMENT REDUIT (refonte du 30/09/2026) : quand le systeme demande moins
   d'animations, le montant s'affiche d'emblee a sa valeur finale. Mesure a
   100 ms, bien avant la fin d'une animation (520 ms). Et sans reduction, le
   compteur part bien de plus bas : preuve que le controle voit la difference. */
async function montantA100ms(reduit) {
  const ctx = await navigateur.newContext({ viewport: { width: 390, height: 800 }, isMobile: true, hasTouch: true, reducedMotion: reduit ? "reduce" : "no-preference" });
  const page = await pageDuContexte(ctx);
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.getByLabel(/Où habitez-vous/).fill(COMMUNE.saisie);
  await page.getByRole("button", { name: new RegExp("^" + COMMUNE.nom + ",") }).first().click();
  /* Depuis le spike du 30/09/2026, le compteur anime vit sur l'ecran « Où va l'argent ». */
  await page.getByRole("button", { name: "Où va cet argent ?" }).first().click();
  /* La moyenne par jour est repliee depuis le 16/10/2026 : on ouvre son repli. */
  await page.getByRole("button", { name: /^Le détail : par jour/ }).first().click();
  const cible = page.locator('[aria-label$="€ par jour"]').first();
  await cible.waitFor({ timeout: 15000 });
  await page.waitForTimeout(100);
  const r = await cible.evaluate(e => ({ final: e.getAttribute("aria-label"), vu: e.innerText }));
  await ctx.close();
  const chiffres = t => Number(String(t).replace(/[^\d]/g, "").slice(0, 12));
  return { final: chiffres(r.final), vu: chiffres(r.vu.split("\n")[0]) };
}
{
  const a = await montantA100ms(true);
  verifier(a.vu === a.final, `mouvement réduit : le montant est final d'emblée (${a.vu} / ${a.final})`);
  const b = await montantA100ms(false);
  verifier(b.vu < b.final, `sans réduction, le compteur se révèle (${b.vu} < ${b.final}) : le contrôle ci-dessus mesure bien quelque chose`);
}

/* SE SOUVENIR DE LA COMMUNE, SEULEMENT SI LE LECTEUR LE DEMANDE — D-M3,
   29/09/2026. Mesure sur la version web de l'application (sur telephone, le
   meme code ecrit un fichier du cache, voir lib/memoire.ts) :
   rien n'est garde avant la demande ; apres, une seule cle, deux codes
   publics ; la commune est proposee au retour ; « Oublier » efface tout ;
   et aucune requete ne porte jamais le code de la commune. */
{
  const ctx = await navigateur.newContext({ viewport: { width: 390, height: 800 }, isMobile: true, hasTouch: true });
  const page = await pageDuContexte(ctx);
  const demandees = [];
  page.on("request", r => demandees.push(r.url()));
  const stockage = () => page.evaluate(() => ({
    ls: Object.fromEntries(Object.keys(localStorage).map(k => [k, localStorage.getItem(k)])),
    ss: sessionStorage.length, cookies: document.cookie,
  }));
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.getByLabel(/Où habitez-vous/).fill(COMMUNE.saisie);
  await page.getByRole("button", { name: new RegExp("^" + COMMUNE.nom + ",") }).first().click();
  await page.getByText("Aller plus loin").first().waitFor({ timeout: 15000 });
  let st = await stockage();
  verifier(Object.keys(st.ls).length === 0, "mémoire : rien n'est gardé tant que le lecteur ne l'a pas demandé " + JSON.stringify(st.ls));
  await page.getByRole("button", { name: "Retenir Meaux sur ce téléphone" }).click();
  await page.getByText(/Meaux est retenue sur ce téléphone/).waitFor({ timeout: 5000 });
  st = await stockage();
  verifier(JSON.stringify(st.ls) === JSON.stringify({ "repere.departement": '{"d":"77","c":"77284"}' }),
    "mémoire : une seule clé, deux codes publics, rien d'autre " + JSON.stringify(st.ls));
  verifier(st.ss === 0 && st.cookies === "", "mémoire : ni sessionStorage, ni cookie");
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  const reprendre = page.getByRole("button", { name: "Voir ce qui se passe à Meaux" });
  await reprendre.waitFor({ timeout: 10000 });
  verifier(true, "mémoire : Meaux est proposée à la réouverture");
  await reprendre.click();
  await page.getByText("Aller plus loin").first().waitFor({ timeout: 15000 });
  verifier(true, "mémoire : un geste suffit pour retrouver sa commune");
  await page.getByRole("button", { name: "Oublier Meaux" }).click();
  st = await stockage();
  verifier(Object.keys(st.ls).length === 0, "mémoire : « Oublier » efface tout " + JSON.stringify(st.ls));
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.getByText("Où habitez-vous ?").waitFor({ timeout: 10000 });
  verifier(await page.getByText("Votre commune, sur ce téléphone").count() === 0, "mémoire : oubliée, elle n'est plus proposée");
  /* Une valeur trafiquee n'est jamais affichee : elle est effacee. */
  await page.evaluate(() => localStorage.setItem("repere.departement", '{"d":"77","c":"<script>"}'));
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.getByText("Où habitez-vous ?").waitFor({ timeout: 10000 });
  st = await stockage();
  verifier(Object.keys(st.ls).length === 0 && await page.getByText("Votre commune, sur ce téléphone").count() === 0,
    "mémoire : une valeur mal formée est effacée, jamais affichée");
  /* Un departement qui n'est pas celui de la commune (07/10/2026) : « 97 » pour
     97101 passait, parce que seuls les deux premiers chiffres etaient compares. */
  await page.evaluate(() => localStorage.setItem("repere.departement", '{"d":"97","c":"97101"}'));
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.getByText("Où habitez-vous ?").waitFor({ timeout: 10000 });
  st = await stockage();
  verifier(Object.keys(st.ls).length === 0 && await page.getByText("Votre commune, sur ce téléphone").count() === 0,
    "mémoire : un département qui n'est pas celui de la commune (97 pour 97101) est effacé");
  const fautives = demandees.filter(u => adresseFautive(u) || /77284/.test(u));
  verifier(fautives.length === 0, "mémoire : aucune requête ne porte le code de la commune " + JSON.stringify(fautives));
  await ctx.close();
}

/* LA SEMAINE, CAS FABRIQUES — 07/10/2026. Un agenda de l'Assemblee construit a
   partir d'aujourd'hui (heure de Paris), le Senat coupe, un telephone regle en
   Guadeloupe. Ce que la carte doit dire : le texte du vote mot pour mot, le
   Senat manquant nomme, « agenda pas encore publié » au-dela du dernier jour
   publie (jamais « aucune séance »), l'heure de Paris dite. Puis les deux
   institutions coupees : la phrase d'absence. */
async function ouvrirSemaine({ agenda, senatCoupe, fuseau }) {
  const ctx = await navigateur.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce", ...(fuseau ? { timezoneId: fuseau } : {}) });
  await ctx.route("**/data/agenda-an.json", r => agenda ? r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(agenda) }) : r.abort());
  if (senatCoupe) await ctx.route("**/data/calendrier-senat.json", r => r.abort());
  const page = await pageDuContexte(ctx);
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.getByLabel(/Où habitez-vous/).fill(COMMUNE.saisie);
  await page.getByRole("button", { name: new RegExp("^" + COMMUNE.nom + ",") }).first().click();
  await page.getByText("Aller plus loin").first().waitFor({ timeout: 15000 });
  await page.waitForTimeout(600);
  const vu = await lireSemaine(page);
  const m = await page.evaluate(() => ({ deborde: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 }));
  await ctx.close();
  return { ...vu, ...m };
}
{
  const J = k => jourParis(new Date(INSTANTANE.getTime() + k * 864e5));
  const seance = (jour, heure, titre, description = null) => ({ debut: `${jour}T${heure}`, titre, description, categorie: "Séance publique" });
  const agenda = {
    source: { producteur: "Assemblée nationale", licence: "Licence ouverte", url: "https://www.assemblee-nationale.fr/dyn/agenda", releve_le: J(0) },
    evenements: [
      seance(J(1), "15:00", "Questions au Gouvernement", "Également à l'ordre du jour : Vote solennel sur le projet de loi témoin relatif aux essais ; Débat d'orientation"),
      seance(J(1), "17:00", "Vote solennel sur la proposition de loi A"),
      seance(J(2), "09:30", "Vote solennel sur la proposition de loi B"),
    ],
  };
  const vu = await ouvrirSemaine({ agenda, senatCoupe: true, fuseau: "America/Guadeloupe" });
  verifier(vu && /Vote solennel sur le projet de loi témoin relatif aux essais/.test(vu.texte), "semaine (cas fabriqué) : le vote solennel est cité mot pour mot");
  verifier(vu && vu.votes === 2 && /Et 1 autre vote solennel dans le calendrier/.test(vu.texte), "semaine (cas fabriqué) : deux votes montrés, le troisième compté, pas tu");
  verifier(vu && /Le calendrier du Sénat n'est pas arrivé\s: seules les séances de l'Assemblée nationale sont comptées/.test(vu.texte), "semaine (cas fabriqué) : le Sénat manquant est nommé");
  verifier(vu && vu.jours.length === 7 && vu.jours.slice(3).every(l => /agenda pas encore publié/.test(l)) && /aucune séance publique annoncée/.test(vu.jours[0]),
    "semaine (cas fabriqué) : au-delà du dernier jour publié, « agenda pas encore publié », jamais « aucune séance » " + JSON.stringify(vu && vu.jours));
  verifier(vu && /: 2 séances publiques/.test(vu.jours[1]) && /: 1 séance publique/.test(vu.jours[2]), "semaine (cas fabriqué) : les séances sont comptées par jour");
  verifier(vu && /à l'heure de Paris/.test(vu.texte), "semaine (cas fabriqué) : réglé hors de Paris, le téléphone dit que les heures sont celles de Paris");
  verifier(vu && !vu.deborde, "semaine (cas fabriqué) : aucun débordement horizontal");
  const coupe = await ouvrirSemaine({ agenda: null, senatCoupe: true });
  verifier(coupe && /Le calendrier n'est arrivé jusqu'à cet appareil pour aucune institution/.test(coupe.texte) && coupe.jours.length === 0,
    "semaine (cas fabriqué) : les deux calendriers coupés, une phrase vraie, aucune semaine prétendue");
  const paris = await ouvrirSemaine({ agenda, senatCoupe: true, fuseau: "Europe/Paris" });
  verifier(paris && !/à l'heure de Paris/.test(paris.texte), "semaine (cas fabriqué) : à Paris, la précision d'heure n'encombre pas la carte");
}

/* RÉPONSES D'ABORD — 30/09/2026. A 390 x 844 (iPhone 12 a 16), les trois
   reponses de Meaux tiennent entieres dans le premier ecran, sans defiler.
   Mesure honnete des limites, ecrite dans docs/ux/reponses-dabord-2026.md :
   a 360 x 740, deux reponses seulement ; un intitule de projet tres long
   (Boulogne-Billancourt) repousse la troisieme de 36 px. */
{
  const HAUTEUR = Number(process.env.REPERE_HAUTEUR_PLI || 844);
  const page = await nouvellePage({ viewport: { width: 390, height: HAUTEUR }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.getByLabel(/Où habitez-vous/).fill(COMMUNE.saisie);
  await page.getByRole("button", { name: new RegExp("^" + COMMUNE.nom + ",") }).first().click();
  await page.getByText("Aller plus loin").first().waitFor({ timeout: 15000 });
  await page.waitForTimeout(600);
  const bas = await page.evaluate(() => [...document.querySelectorAll('[data-testid="reponse"]')].filter(e => e.offsetParent).map(e => Math.round(e.getBoundingClientRect().bottom)));
  verifier(bas.length === 3 && bas.every(b => b <= HAUTEUR), `390 x ${HAUTEUR} : les trois réponses tiennent dans le premier écran ${JSON.stringify(bas)}`);
  await page.close();
}

/* INVARIANT 9 — FRAICHEUR (30/09/2026). Serveur injoignable apres une premiere
   lecture : la donnee gardee reste lisible, mais l'ecran ne pretend pas qu'elle
   est a jour. En ligne, aucun bandeau : rien a signaler. */
{
  const ctx = await navigateur.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const page = await pageDuContexte(ctx);
  const ouvrir = async () => {
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await page.getByLabel(/Où habitez-vous/).fill(COMMUNE.saisie);
    await page.getByRole("button", { name: new RegExp("^" + COMMUNE.nom + ",") }).first().click();
    await page.getByText("Aller plus loin").first().waitFor({ timeout: 15000 });
    await page.waitForTimeout(600);
    return { texte: await page.evaluate(() => document.body.innerText), bandeau: await page.getByTestId("fraicheur").count() };
  };
  const enLigne = await ouvrir();
  verifier(enLigne.bandeau === 0, "fraîcheur : en ligne, publication vérifiée, aucun bandeau");
  await ctx.route("**/data/**", r => r.abort("internetdisconnected"));
  const coupe = await ouvrir();
  verifier(coupe.bandeau === 1 && /n'a pas pu vérifier s'il existe une publication plus récente/.test(coupe.texte),
    "fraîcheur : serveur injoignable, l'écran dit que la publication n'a pas pu être vérifiée");
  verifier(new RegExp(MAIRE).test(coupe.texte), "fraîcheur : serveur injoignable, la donnée gardée reste lisible");
  verifier(!/Mis à jour/.test(coupe.texte), "fraîcheur : aucun « mis à jour » affiché quand rien n'a pu être vérifié");
  await ctx.close();
}

await navigateur.close();
if (CAPTURES) console.log("captures : " + fs.readdirSync(CAPTURES).filter(f => f.endsWith(".png")).join(", "));
console.log(echecs ? `${echecs} échec(s)` : "parcours complet, zéro échec");
process.exit(echecs ? 1 : 0);
