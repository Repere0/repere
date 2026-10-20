// Garde de neutralite (decision du porteur, 20/10/2026) : le bloc « Ce que vous payez
// a la commune » de l'ecran argent n'emploie aucun mot qui evalue un gain, une perte
// ou une valeur « reelle ». REPERE_ARGENT permet de pointer une copie pour la preuve
// (prouver-une-garde : le garde doit echouer sur un texte interdit).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SRC = process.env.REPERE_ARGENT || fileURLToPath(new URL("../src/app/argent.tsx", import.meta.url));
const DEBUT = "CE QUE VOUS PAYEZ A LA COMMUNE";
const FIN = "LES PROJETS AIDES PAR L'ETAT";
const INTERDITS = [/\bgain/i, /\bperte/i, /retour direct/i, /valeur réelle/i, /coût réel/i, /\bnet\b/i];

test("neutralite : le bloc « Ce que vous payez » n'emploie aucun mot interdit", () => {
  const texte = readFileSync(SRC, "utf8");
  const i = texte.indexOf(DEBUT);
  const j = texte.indexOf(FIN, i);
  assert.ok(i > 0 && j > i, "bloc introuvable dans l'ecran argent");
  const bloc = texte.slice(i, j);
  for (const re of INTERDITS) assert.doesNotMatch(bloc, re);
});
