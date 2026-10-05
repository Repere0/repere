await pageMot.keyboard.press("Escape");
await ctxMot.close();

console.log("\n--- mouvement reduit -----------------------------------------");
/* LA COUPURE DU MOUVEMENT, MESUREE ET PAS DEDUITE. Le controle statique lit le
   CSS ; celui-ci ouvre une page en declarant le reglage systeme « moins
   d'animations » et demande au navigateur ce qu'il applique reellement. */
const ctxCalme = await nav.newContext({ reducedMotion: "reduce" });
const pageCalme = await ctxCalme.newPage();
await pageCalme.goto(base, { waitUntil: "networkidle" });
await pageCalme.getByLabel(/Où habitez-vous/).fill("64");
await pageCalme.waitForTimeout(200);
await pageCalme.getByRole("button", { name: /^64\b/ }).click();
await pageCalme.getByLabel(/Votre commune/).fill("Ustaritz");
await pageCalme.getByRole("button", { name: "Ustaritz", exact: true }).click();
await pageCalme.waitForTimeout(700);
const calme = await pageCalme.evaluate(() => {
  const animees = [...document.querySelectorAll("*")].filter((e) => {
    const s = getComputedStyle(e);
    return s.animationName !== "none" && s.animationDuration !== "0s";
  });
  return {
    reduit: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    animees: animees.length,
    texte: document.body.innerText,
  };
});
verif("accessibilite — mouvement reduit demande : le navigateur reçoit bien le réglage",
  calme.reduit, JSON.stringify(calme));
verif("accessibilite — mouvement reduit : aucune animation ne se joue",
  calme.animees === 0, JSON.stringify(calme));
verif("accessibilite — mouvement reduit : le contenu est visible d'emblee",
  /Où habitez-vous/.test(calme.texte) && calme.texte.trim().length > 100, JSON.stringify(calme).slice(0, 300));
await ctxCalme.close();

console.log("\n--- zoom texte 200% -------------------------------------------");
/* TROUVE PAR L'AUDIT WCAG DU 16/09/2026 (1.4.4/1.4.10) : a 200% de zoom
 * texte, l'ecran "Qui decide" defilait horizontalement (726 px de contenu
 * pour 390 px de viewport) — cause tracee a `.ligne-h b { white-space:
 * nowrap }`. Le correctif qui tient : `flex-wrap: wrap` sur `.ligne-h`
 * (voir l'historique complet dans app.css).