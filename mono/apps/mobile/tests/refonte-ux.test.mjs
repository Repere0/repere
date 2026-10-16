/* GARDE : la refonte UX ne revient pas aux libelles techniques (16/10/2026).
 *  1. le calendrier n'affiche jamais « fin non publiée » : il dit « heure de fin non précisée » ;
 *  2. les etiquettes ne sont plus en capitales de style (theme.ts, TYPO.etiquette) ;
 *  3. « Chez vous » garde ses deux rubriques de circonscription pliables, et ne redit pas la chaine des elus.
 * Lancer : node --test tests/refonte-ux.test.mjs (MOBILE_SRC pour prouver la garde). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ici = dirname(fileURLToPath(import.meta.url));
const SRC = process.env.MOBILE_SRC || join(ici, "..", "src");
const lire = p => readFileSync(join(SRC, p), "utf8");

test("le calendrier ne dit jamais « fin non publiée » : une formulation naturelle", () => {
  const cal = lire("app/(onglets)/a-venir.tsx");
  assert.doesNotMatch(cal, /fin non publiée/, "le calendrier affiche encore « fin non publiée »");
  assert.match(cal, /heure de fin non précisée/);
});

test("les etiquettes ne sont plus en capitales de style", () => {
  assert.doesNotMatch(lire("lib/theme.ts"), /textTransform/, "les etiquettes repassent en capitales de style");
});

test("votes : l'etiquette ne dit pas « Dernier scrutin » au-dessus du total de l'archive", () => {
  const v = lire("app/scrutins.tsx");
  assert.doesNotMatch(v, />\s*Dernier scrutin\s*</, "l'etiquette « Dernier scrutin » est revenue au-dessus du total");
  assert.match(v, /Dans l'archive/);
});

test("« Où va l'argent » : un seul projet aidé ouvert, les autres sous un repli annoncé", () => {
  const a = lire("app/argent.tsx");
  assert.match(a, /Voir les \$\{listeProjets\.length - 1\} autres projets aidés/, "les projets suivants ne sont plus sous un repli annonce");
  assert.match(a, /<CarteProjet p=\{listeProjets\[0\]\}/, "le premier projet n'est plus rendu seul");
  assert.match(a, /listeProjets\.length > 1 \? \(/, "le repli n'est plus conditionne a la presence d'autres projets");
  assert.doesNotMatch(a, /listeProjets\.map\(/, "tous les projets sont a nouveau affiches d'un coup");
});

test("« Chez vous » : circonscription pliable, et pas de chaine des elus", () => {
  const t = lire("app/(onglets)/territoire.tsx");
  assert.match(t, /<Depli titre="(Pourquoi|C'est quoi)/, "la circonscription n'a plus son explication pliable");
  assert.doesNotMatch(t, /\bChaine\b|chaineDecision/, "« Chez vous » reprend la chaine des elus");
});

test("détail d'un rendez-vous : une route, reliée au calendrier, sans heure devinée", () => {
  const ev = lire("app/evenement.tsx");
  assert.match(lire("app/_layout.tsx"), /name="evenement"/, "le détail du rendez-vous n'est pas déclaré dans la pile");
  assert.match(lire("app/(onglets)/a-venir.tsx"), /pathname: "\/evenement"/, "le calendrier ne mène plus au détail");
  assert.match(ev, /regrouperParJour/, "le détail ne relit pas le même regroupement que la liste");
  assert.doesNotMatch(ev, /fin non publiée/, "le détail affiche « fin non publiée »");
});

test("sources : la donnée d'origine reste au premier niveau, la licence se déplie", () => {
  const src = lire("app/sources.tsx");
  assert.match(src, /<Depli/, "les sources n'ont plus de repli pour la licence et l'usage");
  const lien = src.indexOf('texte="Voir la donnée originale"');
  const repli = src.indexOf("<Depli");
  assert.ok(lien > 0 && repli > lien, "le lien vers la donnée originale est passé dans le repli");
});

test("dictionnaire : cibles tactiles à 48 pt, pas à 40", () => {
  const dico = lire("app/dictionnaire.tsx");
  assert.doesNotMatch(dico, /minHeight: 40\b/, "une commande du dictionnaire est revenue à 40 pt");
  assert.doesNotMatch(dico, /width: 40\b/, "une lettre du dictionnaire est revenue à 40 pt");
});

test("un seul lien d'action : LienAction, à 48 pt", () => {
  assert.match(lire("lib/composants.tsx"), /export function LienAction\s*\(/, "le lien d'action n'est plus factorisé");
  assert.match(lire("app/(onglets)/qui-decide.tsx"), /<LienAction\b/, "Qui décide n'utilise plus le lien d'action partagé");
  /* 16/10/2026 : dans le calendrier, la LIGNE ENTIERE est le lien vers le detail
     (une cible pleine largeur, au moins 48 pt), au lieu d'un lien sous chaque ligne. */
  const cal = lire("app/(onglets)/a-venir.tsx");
  assert.match(cal, /testID="cal-ligne" accessibilityRole="button"/, "la ligne du calendrier n'est plus un bouton");
  assert.match(cal, /testID="cal-ligne"[\s\S]{0,600}?minHeight: CIBLE/, "la ligne du calendrier n'a plus sa cible de 48 pt");
  assert.match(cal, /Voir le détail et la source/, "la ligne ne dit plus qu'elle mène au détail et à la source");
});

test("votes : un intitulé long se lit en taille de lecture, pas en affiche", () => {
  const v = lire("app/scrutins.tsx");
  assert.match(v, /titreLisible\(detail\.t\)\.length > 90 && s\.detailTitreLongue/, "un long intitulé de scrutin repasse en affiche");
  assert.match(lire("app/scrutins.tsx"), /detailTitreLongue:/, "le style de lecture du titre long a disparu");
});

test("votes : une question ou une réponse du Gouvernement longue se replie, sans être réécrite", () => {
  const v = lire("app/scrutins.tsx");
  assert.match(v, /<Extrait texte=\{textePropre\(qagDetail\.question\) \|\| ""\} \/>/, "la question n'est plus pliée");
  assert.match(v, /<Extrait texte=\{textePropre\(qagDetail\.reponse\) \|\| ""\} \/>/, "la réponse n'est plus pliée");
  assert.match(v, /Depli titre="Lire le texte en entier"/, "le repli n'annonce pas ce qu'il contient");
});

test("votes : les groupes se reconnaissent à leur sigle, pas à une couleur neutre", () => {
  const v = lire("app/scrutins.tsx");
  assert.match(v, /SIGLES_GROUPES\[groupe\.nom\]/, "le sigle du groupe n'est plus utilisé");
  const table = lire("lib/groupes.ts");
  const entrees = table.match(/^\s*"[^"]+": "[^"]+",?$/gm) || [];
  assert.ok(entrees.length >= 12, `la table des sigles compte ${entrees.length} entrées, 12 groupes sont publiés`);
});

test("le detail d'un rendez-vous ecrit la date du releve, et dit une seule fois que la fin manque (16/10/2026)", () => {
  const ev = lire("app/evenement.tsx");
  /* invariant 9 : « l'agenda peut changer » ne suffit pas, le lecteur doit voir de quand il date */
  assert.match(ev, /relevé le \$\{dateFr\(releve\)\}/, "le detail ne dit plus la date du releve");
  assert.doesNotMatch(ev, /aux horaires ci-dessus/, "la phrase redondante sur le nombre de seances est revenue");
});

test("doctrine du vide : chaque absence donne une phrase ET un lien ou une action (16/10/2026)", async () => {
  const { readdirSync, statSync } = await import("node:fs");
  const fichiers = [];
  const parcourir = d => { for (const n of readdirSync(d)) { const p = join(d, n); statSync(p).isDirectory() ? parcourir(p) : /\.tsx$/.test(n) && fichiers.push(p); } };
  parcourir(SRC);
  /* Les phrases qui portent deja leur lien (verifie ci-dessous ou dans le socle). */
  const PORTENT_UN_LIEN = /\.\.\.(VOTE_AUCUN|projetsAucun|comptesAbsents|comptesIncoherents|circoInconnue|agendaVide|refusAppariement|\(phraseEc \? comptesIncoherents)/;
  /* Exceptions, chacune avec sa raison. */
  const EXCEPTIONS = [
    /Aucune commune n'est choisie/,                  /* le bouton « Revenir à l'accueil » suit, hors du composant */
    /c'est nous qui n'avons pas encore sa fiche/,     /* recherche : la liste des communes reste a l'ecran */
    /Aucune commune d'Île-de-France ne correspond/,   /* recherche : une faute de frappe, pas une donnee absente */
  ];
  const fautifs = [];
  for (const f of fichiers) {
    for (const m of readFileSync(f, "utf8").matchAll(/<Vide\b([\s\S]*?)\/>/g)) {
      const t = m[1];
      if (/\blien=|\baction=|Chargement/.test(t) || PORTENT_UN_LIEN.test(t) || EXCEPTIONS.some(e => e.test(t))) continue;
      fautifs.push(f.slice(SRC.length + 1) + " : " + t.replace(/\s+/g, " ").slice(0, 90));
    }
  }
  assert.deepEqual(fautifs, [], "absence sans lien ni action :\n" + fautifs.join("\n"));
  const abs = lire("lib/absences.ts");
  for (const nom of ["circoInconnue", "agendaVide", "refusAppariement"]) {
    const corps = abs.slice(abs.indexOf(`export const ${nom}`), abs.indexOf(`export const ${nom}`) + 600);
    assert.match(corps.split(/\nexport /)[0], /lien/, nom + " ne porte plus de lien");
  }
});

test("carte de partage : aucune etape « suivante » deduite de l'ordre pedagogique (16/10/2026)", () => {
  /* « Suite : Lecture definitive » etait annonce pour un texte adopte en commission mixte
     paritaire. La procedure bifurque : la source ne dit pas l'etape suivante. */
  const p = lire("app/partager.tsx");
  assert.doesNotMatch(p, /ETAPES_LOI\[\s*idx\s*\+\s*1\s*\]/, "la carte relit l'etape suivante dans l'ordre lineaire");
  assert.doesNotMatch(p, />\s*Suite\s*:/, "la carte annonce de nouveau une « Suite »");
});

test("ecran du vote : l'etape du vote sans rang « N sur 6 » (16/10/2026)", () => {
  const v = lire("app/vote.tsx");
  assert.doesNotMatch(v, /sur \$\{ETAPES_LOI\.length\}/, "le rang « N sur 6 » est revenu : il suggere des etapes restantes");
  assert.match(v, /Étape de ce vote : \$\{etapeCourante\.titre\}/);
});
