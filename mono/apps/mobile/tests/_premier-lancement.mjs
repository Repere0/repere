/* PREMIER LANCEMENT (13/11/2026, ADR 0009) : sans profil gardé, l'accueil laisse la place à la question du prénom.
 * Un test qui part de l'accueil comme un lecteur répond donc d'abord « Passer », comme lui. Aucune clé n'est écrite
 * ici à la main : c'est le bouton de l'application qui garde les réglages par défaut. */
export async function passerBienvenue(page) {
  await page.waitForURL(/\/bienvenue/, { timeout: 2500 }).catch(() => {});
  if (!page.url().includes("/bienvenue")) return false;
  /* 13/11/2026 : trois ecrans. Logo -> prenom (passe) -> valeurs -> l'application. */
  await page.getByTestId("continuer-0").click();
  await page.getByRole("button", { name: /^Passer, sans/ }).click();
  await page.getByTestId("continuer-2").click();
  await page.waitForURL(u => !String(u).includes("/bienvenue"), { timeout: 10000 });
  await page.waitForLoadState("networkidle").catch(() => {});
  return true;
}
