/* Mode démo et avis des lecteurs (17/11/2026) : un lien mailto pré-rempli, encodé, sans serveur. */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const { corpsAvis, lienAvis } = await import("../src/lib/avis.ts");
const sys = { version: "0.1.0", date: new Date("2026-11-17T10:00:00Z"), plateforme: "web", navigateur: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)" };

test("le message porte la version, la date, la plateforme et le navigateur", () => {
  const c = corpsAvis(sys);
  for (const t of ["Version : 0.1.0", "Date : 2026-11-17", "Plateforme : web", "Navigateur : Mozilla/5.0"]) assert.ok(c.includes(t), t);
  assert.ok(!corpsAvis({ ...sys, navigateur: null }).includes("Navigateur"), "sans navigateur, pas de ligne vide de sens");
});

test("le lien mailto est encodé : ni espace, ni retour à la ligne, ni « & » nu dans le corps", () => {
  const l = lienAvis("avis@example.org", { ...sys, navigateur: "a & b ; c=d" });
  assert.match(l, /^mailto:avis@example\.org\?subject=[^ ]+&body=[^ \n]+$/);
  const corps = decodeURIComponent(l.split("&body=")[1]);
  assert.ok(corps.includes("Navigateur : a & b ; c=d"));
});

test("aucune adresse inventée : sans variable de build, pas de bouton", () => {
  const src = fs.readFileSync(new URL("../src/lib/avis.ts", import.meta.url), "utf8");
  assert.doesNotMatch(src.replace(/\/\*[\s\S]*?\*\//g, ""), /@[a-z0-9-]+\.(fr|com|org)/i, "une adresse écrite en dur dans avis.ts");
});
