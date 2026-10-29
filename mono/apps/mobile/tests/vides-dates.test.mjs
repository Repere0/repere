/* VIDES DATES — CHAQUE CHIFFRE ET CHAQUE ABSENCE DIT SA SOURCE ET SA PERIODE — 29/10/2026.
 *
 * Trois défauts relevés à la lecture du code (AUDIT_PARCOURS_ET_PRIORITES, 29/10) :
 *  A. Le préfet de région s'affiche sans date de contrôle et sans lien vers sa page.
 *  B. « sur les années relevées » ne nomme aucune année ; l'écran « Argent » vide n'a
 *     pas de pastille source. La source porte pourtant ses exercices (2024, 2025).
 *  C. « Aucun vote solennel… n'est porté par le relevé » ne dit ni la période ni
 *     le périmètre : seule la date du relevé et la législature sont connues.
 * Gardes statiques : les fichiers sont lus et leur texte est contrôlé. */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { dateFr } from "../../../packages/core/src/format.js";

const RACINE = path.resolve(import.meta.dirname, "..");
const lire = (...p) => fs.readFileSync(path.join(RACINE, ...p), "utf8");
const prefet = lire("src", "lib", "prefet.ts");
const absences = lire("src", "lib", "absences.ts");
const qui = lire("src", "app", "(onglets)", "qui-decide.tsx");
const argent = lire("src", "app", "argent.tsx");
const chez = lire("src", "app", "(onglets)", "chez-vous.tsx");
const vote = lire("src", "app", "vote.tsx");

/* ── A. Préfet de région ─────────────────────────────────────────────────── */

test("A — le préfet porte la date de son contrôle (la dernière consignée, pas une date inventée)", () => {
  assert.match(prefet, /titreControleLe:\s*"13\/10\/2026"/, "la date du contrôle du titre doit être dans PREFET_IDF");
});

test("A — le préfet annonce le DERNIER contrôle réussi, sans le présenter comme une vérification du jour", () => {
  assert.match(qui, /Dernier contrôle réussi du titre de la page : \{prefet\.titreControleLe\}/, "formulation explicite du dernier contrôle réussi");
  assert.doesNotMatch(qui, /titre contrôlé le/, "l'ancienne formulation ne doit plus apparaître");
});

test("A — le préfet dit que la date de nomination n'est pas contrôlée", () => {
  assert.match(qui, /n'est pas contrôlée/, "l'écran doit dire ce qui n'est pas vérifié");
});

test("A — le préfet a un lien vers sa page source, ouvert par Linking", () => {
  assert.match(qui, /import \{[^}]*\bLinking\b[^}]*\} from "react-native"/, "Linking doit être importé dans qui-decide.tsx");
  assert.match(qui, /Linking\.openURL\(prefet\.url\)/, "le lien vers la page de la préfecture doit exister");
});

/* ── B. Projets aidés vides ───────────────────────────────────────────────── */

test("B — « sur les années relevées » n'existe plus : la phrase nomme les exercices de la source", () => {
  assert.doesNotMatch(absences, /sur les années relevées/, "formule vague remplacée par les exercices réels");
  assert.match(absences, /export const projetsAucun = \(nom: string, exercices\?: string\[\]/, "projetsAucun reçoit les exercices");
});

test("B — le texte public parle d'années budgétaires et nomme les années couvertes dans le titre", () => {
  assert.match(absences, /sur les années budgétaires \$\{ex\} couvertes par la source/, "titre avec les années réelles");
  assert.doesNotMatch(absences, /sur les exercices/, "« exercices » ne doit plus apparaître dans le texte public");
  assert.doesNotMatch(absences, /Les autres exercices/, "« exercices » ne doit plus apparaître dans le texte public");
  assert.match(absences, /Les autres années budgétaires ne sont pas couvertes/, "une couverture partielle doit être dite comme telle");
});

test("B — la date de publication de la source est écrite dans le texte, pas seulement derrière la pastille", () => {
  assert.match(absences, /export const projetsAucun = \(nom: string, exercices\?: string\[\], publieLe\?: string\)/, "projetsAucun reçoit la date de publication");
  assert.match(absences, /Données publiées le \$\{dateFr\(publieLe\)\}/, "la date est écrite dans le corps");
  assert.match(argent, /projetsAucun\(nom, [^)]*mis_a_jour_le[^)]*\)/, "argent.tsx passe mis_a_jour_le");
  assert.match(chez, /projetsAucun\(nom, [^)]*mis_a_jour_le[^)]*\)/, "chez-vous.tsx passe mis_a_jour_le");
});

test("B — l'écran « Argent » vide passe les exercices et affiche la pastille source avec sa date", () => {
  assert.match(argent, /projetsAucun\(nom, [^)]*exercices[^)]*\)/, "argent.tsx doit passer les exercices de la source");
  assert.match(argent, /<PastilleSource source=\{srcProjets\(d\)\} \/>[\s\S]{0,20}/, "pastille source sur l'état vide");
  const bloc = argent.slice(argent.indexOf("!listeProjets.length"), argent.indexOf("<PastilleSource source={srcProjets(d, true)}"));
  assert.match(bloc, /PastilleSource source=\{srcProjets\(d\)\}/, "la pastille doit être dans la branche vide, pas seulement dans la liste");
});

test("B — chez-vous passe aussi les exercices à l'état vide", () => {
  assert.match(chez, /projetsAucun\(nom, [^)]*exercices[^)]*\)/, "chez-vous.tsx doit passer les exercices");
});

/* ── C. Vote solennel absent ─────────────────────────────────────────────── */

test("C — formulation factuelle : « trouvé dans les données disponibles pour la législature actuelle »", () => {
  assert.match(absences, /Aucun vote solennel trouvé dans les données disponibles\./, "formule retenue, sans « législature actuelle » (voir E)");
  /* Garde sur le TEXTE AFFICHÉ seulement : le commentaire au-dessus de voteAucun peut garder « 17e législature ». */
  const affiche = absences.slice(absences.indexOf("export const voteAucun"), absences.indexOf("export const AGENDA_PAS_ARRIVE"));
  assert.doesNotMatch(affiche, /17e/, "« 17e législature » n'apparaît pas dans le texte affiché");
  assert.doesNotMatch(affiche, /législature de la|scrutins solennels/, "pas de vocabulaire technique affiché");
  assert.doesNotMatch(affiche, /n'apparaît/, "aucune tournure qui laisse entendre une absence du député");
  assert.doesNotMatch(absences, /n'est porté par le relevé/, "formule catégorique retirée");
  assert.match(absences, /export const voteAucun = \(releve\?: string, portee\?: string\)/, "voteAucun reçoit la date du relevé et le périmètre");
  assert.match(absences, /Données récupérées le \$\{dateFr\(releve\)\}/, "la date de récupération est affichée quand elle est connue");
  assert.match(absences, /La date à laquelle ces données ont été récupérées n'est pas connue/, "sans date, l'état le dit");
  assert.match(absences, /vote d'ensemble d'un texte majeur/, "la définition de « vote solennel » reste visible, telle que la source la formule");
  assert.doesNotMatch(absences, /adoption ou le rejet formel/, "la paraphrase non étayée est retirée");
});

test("C — les deux écrans qui affichent l'état vide passent la date du relevé", () => {
  assert.match(chez, /voteAucun\(srcScrutins\(d\)\?\.releve/, "chez-vous doit passer le relevé");
  assert.match(vote, /voteAucun\(srcScrutins\(d\)\?\.releve/, "vote.tsx doit passer le relevé");
});

/* D — le mot « solennel » est expliqué là où il apparaît sur la liste des votes. */
test("D — la liste des votes explique « solennel » là où le mot apparaît", () => {
  assert.doesNotMatch(vote, /Scrutins solennels relevés/, "l'intitulé technique est remplacé");
  assert.match(vote, /Derniers votes solennels récupérés par Repère[^<]*vote d'ensemble d'un texte majeur/, "la liste dit qu'il s'agit des derniers votes récupérés, pas de tous");
  assert.doesNotMatch(vote, /Votes solennels publiés par l'Assemblée/, "« publiés par l'Assemblée » laissait croire à une liste complète");
  assert.doesNotMatch(vote, /adoption ou le rejet formel/, "la paraphrase non étayée est retirée");
});

/* E — le périmètre des votes est dit par la SOURCE (srcScrutins.portee), pas supposé. */
test("E — l'état vide des votes n'affirme pas « législature actuelle » : il donne le périmètre de la source", () => {
  assert.doesNotMatch(absences, /pour la législature actuelle/, "la législature entière n'est pas couverte : les données sont les derniers votes");
  assert.match(absences, /export const voteAucun = \(releve\?: string, portee\?: string\)/, "voteAucun reçoit le périmètre de la source");
  assert.match(absences, /Ce que couvrent les données : \$\{portee/, "le périmètre écrit par la source est affiché, en clair");
  assert.match(absences, /Les données ne portent que sur les derniers votes/, "la limite de couverture est dite");
  assert.match(chez, /voteAucun\(srcScrutins\(d\)\?\.releve, d\.srcScrutins && d\.srcScrutins\.portee\)/, "chez-vous passe le périmètre");
  assert.match(vote, /voteAucun\(srcScrutins\(d\)\?\.releve, d\.srcScrutins && d\.srcScrutins\.portee\)/, "vote.tsx passe le périmètre");
});

/* ── F. Rendu réel de voteAucun ───────────────────────────────────────────────
 * absences.ts est transpilé en mémoire (TypeScript de apps/mobile) et exécuté :
 * on teste le TEXTE que l'utilisateur lit, pour chaque cas de la source. */
const requireMobile = createRequire(path.join(RACINE, "package.json"));
const ts = requireMobile("typescript");
const sortie = ts.transpileModule(absences, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const modul = { exports: {} };
new Function("require", "exports", "module", sortie)(
  (nom) => { if (nom === "@repere/core") return { DGCL_URL: "https://example.test/dgcl", dateFr }; throw new Error("import inattendu : " + nom); },
  modul.exports, modul);
const { voteAucun } = modul.exports;
const PORTEE = "les 12 derniers scrutins solennels (votes sur l'ensemble d'un texte) de la 17e législature, sur 9155 scrutins publics publiés à la date du relevé";

test("F — périmètre et date présents : la source est écrite telle quelle, la date en toutes lettres", () => {
  const v = voteAucun("2026-10-28", PORTEE);
  assert.equal(v.titre, "Aucun vote solennel trouvé dans les données disponibles.");
  assert.match(v.corps, /Ce que couvrent les données : les 12 derniers scrutins solennels/);
  assert.match(v.corps, /Données récupérées le 28 octobre 2026\./);
  assert.match(v.corps, /Les données ne portent que sur les derniers votes, pas sur toute la législature\./);
  assert.doesNotMatch(v.corps, /undefined|null/);
});

test("F — périmètre absent, null ou vide : la phrase le dit, sans mot technique ni valeur vide", () => {
  for (const portee of [undefined, null, ""]) {
    const v = voteAucun("2026-10-28", portee);
    assert.match(v.corps, /Ce que couvrent les données : la source ne l'indique pas\./, `portee=${portee}`);
    assert.doesNotMatch(v.corps, /undefined|null|Périmètre|relevé/, `portee=${portee}`);
  }
});

test("F — date de relevé absente, null ou vide : la phrase le dit, sans inventer de date", () => {
  for (const releve of [undefined, null, ""]) {
    const v = voteAucun(releve, PORTEE);
    assert.match(v.corps, /La date à laquelle ces données ont été récupérées n'est pas connue\./, `releve=${releve}`);
    assert.doesNotMatch(v.corps, /récupérées le|undefined|null/, `releve=${releve}`);
  }
});

test("F — jamais « pour la législature actuelle », quel que soit le cas", () => {
  for (const [releve, portee] of [["2026-10-28", PORTEE], [undefined, undefined], [undefined, null]]) {
    const v = voteAucun(releve, portee);
    assert.doesNotMatch(v.titre + " " + v.corps, /législature actuelle/);
  }
});
