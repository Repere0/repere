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

/* ── C. Vote solennel absent : un seul texte, dans le cœur partagé ─────────── */

test("C — le texte du vide des votes n'est plus écrit dans l'application (il vient de @repere/core)", () => {
  assert.doesNotMatch(absences, /Aucun vote solennel|Données récupérées|Ce que couvrent les données/, "la phrase vit dans votesVides.js");
});

test("C — les deux écrans passent l'état du vide, la date et le périmètre de la source", () => {
  assert.match(vote, /copieVoteVide\(d\.etatVote, \{ nom: d\.nomCommune, releve: srcScrutins\(d\)\?\.releve, portee: d\.srcScrutins && d\.srcScrutins\.portee \}\)/, "vote.tsx");
  assert.match(chez, /copieVoteVide\(d\.etatVote, \{ nom, releve: srcScrutins\(d\)\?\.releve, portee: d\.srcScrutins && d\.srcScrutins\.portee \}\)/, "chez-vous.tsx");
});

test("C — un relevé non lu ou incohérent a son propre texte, jamais « aucun vote »", () => {
  assert.match(vote, /copieVoteVide\(ETAT_VOTE\.RELEVE_NON_LU\)/, "vote.tsx : relevé non lu");
  assert.match(chez, /copieVoteVide\(ETAT_VOTE\.RELEVE_NON_LU\)/, "chez-vous.tsx : relevé non lu");
  assert.match(vote, /copieVoteVide\(ETAT_VOTE\.RELEVE_INCOHERENT\)/, "vote.tsx : relevé incohérent");
});

/* D — le mot « solennel » est expliqué là où il apparaît sur la liste des votes. */
test("D — la liste des votes explique « solennel » là où le mot apparaît", () => {
  assert.doesNotMatch(vote, /Scrutins solennels relevés/, "l'intitulé technique est remplacé");
  assert.match(vote, /Derniers votes solennels récupérés par Repère[^<]*vote d'ensemble d'un texte majeur/, "la liste dit qu'il s'agit des derniers votes récupérés, pas de tous");
  assert.doesNotMatch(vote, /Votes solennels publiés par l'Assemblée/, "« publiés par l'Assemblée » laissait croire à une liste complète");
  assert.doesNotMatch(vote, /adoption ou le rejet formel/, "la paraphrase non étayée est retirée");
});

/* E — le périmètre des votes est dit par la SOURCE (srcScrutins.portee), pas supposé. */
test("E — l'application n'affirme nulle part « pour la législature actuelle »", () => {
  assert.doesNotMatch(vote + chez + absences, /pour la législature actuelle/, "la législature entière n'est pas couverte : les données sont les derniers votes");
});

