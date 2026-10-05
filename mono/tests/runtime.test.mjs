const pageMot = await ctxMot.newPage();
await pageMot.goto(base, { waitUntil: "networkidle" });
await pageMot.getByLabel(/Où habitez-vous/).fill("bagnolet");
await pageMot.waitForTimeout(300);
await pageMot.getByRole("button", { name: /Bagnolet/ }).click();
await pageMot.waitForTimeout(1200);
await pageMot.getByRole("button", { name: "Qui décide", exact: true }).click();
await pageMot.waitForTimeout(900);
const motCirco = pageMot.locator("button.mot").filter({ hasText: "circonscription" }).first();
verif("langue du citoyen — le mot « circonscription » est bien un declencheur",
  await motCirco.count() > 0, "aucun bouton .mot ne contient ce texte");
await motCirco.click();
await pageMot.waitForTimeout(200);
const ficheTexte = await pageMot.evaluate(() => document.querySelector(".mot-fiche-in")?.innerText || "");
verif("langue du citoyen — la fiche affiche la definition exacte",
  /Territoire dans lequel les électeurs élisent un député/.test(ficheTexte),
  ficheTexte.slice(0, 160));
await pageMot.keyboard.press("Escape");
await pageMot.waitForTimeout(200);
const ficheFermee = await pageMot.evaluate(() => document.querySelector(".mot-fiche-in") === null);
verif("langue du citoyen — Echap referme la fiche", ficheFermee, "la fiche est restee ouverte");