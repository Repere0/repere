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

test("B — la phrase dit que les autres exercices ne sont pas couverts (couverture partielle, pas exhaustive)", () => {
  assert.match(absences, /Les autres exercices ne sont pas couverts/, "une couverture partielle doit être dite comme telle");
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

test("C — « n'est porté par le relevé » est remplacé : la phrase dit le périmètre et la date du relevé", () => {
  assert.doesNotMatch(absences, /n'est porté par le relevé de l'Assemblée/, "formule catégorique retirée");
  assert.match(absences, /export const voteAucun = \(releve\?: string\)/, "voteAucun reçoit la date du relevé");
  assert.match(absences, /17e législature/, "le périmètre (législature) est dit");
  assert.match(absences, /texte entier/, "la définition de « vote solennel » reste visible");
});

test("C — les deux écrans qui affichent l'état vide passent la date du relevé", () => {
  assert.match(chez, /voteAucun\(srcScrutins\(d\)\?\.releve\)/, "chez-vous doit passer le relevé");
  assert.match(vote, /voteAucun\(srcScrutins\(d\)\?\.releve\)/, "vote.tsx doit passer le relevé");
});
