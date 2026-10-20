import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const base = "http://127.0.0.1:8110";
for (const theme of ["light", "dark"]) {
  const n = await chromium.launch();
  const c = await n.newContext({ viewport: { width: 390, height: 844 }, colorScheme: theme, deviceScaleFactor: 2 });
  const p = await c.newPage();
  const d = `/tmp/elu/${theme}`; mkdirSync(d, { recursive: true });
  await p.goto(base, { waitUntil: "networkidle" }); await p.waitForTimeout(900);
  await p.getByLabel(/Où habitez-vous/).fill("meaux"); await p.waitForTimeout(600);
  await p.getByText("Meaux", { exact: false }).first().click(); await p.waitForTimeout(2000);
  await p.getByRole("tab", { name: /Qui décide/ }).first().click(); await p.waitForTimeout(2000);
  /* le nom est un lien dans la carte d'un niveau */
  const lien = p.getByRole("link").filter({ hasText: /COPE|PARIGI|Préfet/ }).first();
  try { await lien.click({ timeout: 5000 }); } catch {
    const noms = await p.getByRole("link").allTextContents();
    console.log(theme, "liens vus :", noms.slice(0, 8));
  }
  await p.waitForTimeout(2200);
  await p.screenshot({ path: `${d}/elu.png`, fullPage: true });
  console.log(theme, "ok");
  await n.close();
}
