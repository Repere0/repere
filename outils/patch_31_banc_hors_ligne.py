# -*- coding: utf-8 -*-
"""patch_31_banc_hors_ligne.py — l'invariant 1 n'avait aucun controle.

« L'application fonctionne hors ligne, sans serveur applicatif » est le premier
des huit invariants, et le banc, avec ses 55 controles, ne l'avait jamais mesure.
Il verifiait que le fichier autonome ne demande rien au reseau — ce qui est autre
chose : un fichier qui ne demande rien peut tres bien s'ouvrir vide.

CE QUE CE CONTROLE FAIT : il installe reellement le service worker dans un
navigateur, COUPE LE RESEAU, recharge la page, refait le parcours complet, et
mesure ce qui s'affiche. C'est le seul protocole qui distingue « la coquille est
declaree » de « l'application marche dans le metro ».

MESURE DU 25/08/2026, AVANT D'ECRIRE LE CONTROLE — et c'est ce qui l'a rendu
ecrivable : hors ligne, apres rechargement, on obtient le maire (Piero ROUGET),
la circonscription (6e), cinq cartes d'argent, onze lignes de comptes, l'agenda
de l'Assemblee, les 34 626 communes de la table des circonscriptions, le fil a
quatorze cartes dont la decision du Conseil constitutionnel — et zero erreur
JavaScript. L'invariant tient. Le controle est donc calibre sur un etat atteint,
pas sur un espoir.

CE QU'IL NE FAIT PAS : tourner sur le fichier autonome. Celui-ci n'a pas de
service worker et n'a rien a aller chercher ; l'ouvrir hors ligne ne prouverait
rien de plus que ce que les autres controles disent deja. Le bloc se saute donc
proprement, en le disant.

UN DEFAUT LATENT, TROUVE EN CHEMIN ET LAISSE TEL QUEL, PAR HONNETETE : au tout
premier rendu, EV_ETAT vaut « absent », parce que renderFeed() s'execute avant le
script qui declare window.REPERE_EVENEMENTS_URL. Le fil ne se remplit qu'au second
rendu, declenche par finishOnboard(). Ca marche — le chargeur ne verrouille pas
l'etat « absent » et retente — mais ca tient a l'ordre des appels au demarrage.
Le jour ou la refonte de la barre d'onglets deplacera cet ordre, le fil perdra ses
faits collectes en silence. C'est ecrit ici pour que ce ne soit pas une surprise.
"""
import io

F = "test_repere.mjs"
s = io.open(F, encoding="utf-8").read()
n0 = len(s)

ancre = 'verif("rendu — aucune erreur JavaScript sur tout le parcours",'
assert s.count(ancre) == 1, "ancre introuvable ou multiple"

bloc = '''/* INVARIANT 1, MESURE POUR DE VRAI : service worker installe, reseau coupe,
   rechargement, parcours complet. Second contexte pour ne pas polluer le premier. */
if (serveur) {
  const ctx2 = await nav.newContext({ viewport: { width: 420, height: 900 } });
  const p2 = await ctx2.newPage();
  const erreurs2 = [];
  p2.on("pageerror", e => erreurs2.push("pageerror: " + e.message));
  p2.on("console", m => { if (m.type() === "error") erreurs2.push("console: " + m.text().slice(0, 120)); });

  await p2.goto(base);
  await p2.waitForTimeout(6500);
  const installe = await p2.evaluate(async () => {
    const r = await navigator.serviceWorker.getRegistration();
    if (!r || !r.active) return { actif: false, fichiers: [] };
    const noms = await caches.keys();
    const c = await caches.open(noms[0]);
    const k = await c.keys();
    return { actif: true, fichiers: k.map(x => new URL(x.url).pathname).sort() };
  });
  verif("invariant 1 — le service worker s'installe et remplit son cache",
    installe.actif && installe.fichiers.length >= 8,
    installe.actif ? installe.fichiers.length + " fichier(s) en cache" : "aucun service worker actif");
  /* Les donnees servies doivent etre DANS la coquille : sans elles, l'application
     installee perd ses faits des qu'elle est hors ligne — un manque invisible. */
  verif("invariant 1 — les donnees servies sont dans la coquille",
    installe.fichiers.some(f => /donnees\\/agenda_an\\.json$/.test(f))
    && installe.fichiers.some(f => /donnees\\/evenements\\.json$/.test(f)),
    installe.fichiers.filter(f => /donnees/.test(f)).join(", ") || "aucun fichier de donnees en cache");

  await ctx2.setOffline(true);
  await p2.reload({ waitUntil: "load" }).catch(() => {});
  await p2.waitForTimeout(5500);

  const horsLigne = await p2.evaluate(() => ({
    coupe: navigator.onLine === false,
    complet: window.REPERE_COMPLET === true,
    tronque: !!document.getElementById("repere-tronque"),
    onboard: !!document.getElementById("ob-input")
  }));
  verif("invariant 1 — le reseau est bien coupe pendant la mesure",
    horsLigne.coupe === true, "navigator.onLine vaut encore true : la mesure ne prouverait rien");
  verif("invariant 1 — hors ligne, l'application se charge en entier",
    horsLigne.complet && !horsLigne.tronque && horsLigne.onboard,
    JSON.stringify(horsLigne));

  if (horsLigne.onboard) {
    await p2.fill("#ob-input", "Ustaritz");
    await p2.evaluate(() => obValidateTyped());
    await p2.waitForTimeout(900);
    await p2.evaluate(() => finishOnboard());
    await p2.waitForTimeout(1800);
    const vu = await p2.evaluate(() => {
      showTab("s-qui");
      const carte = [...document.querySelectorAll("#s-qui .who")]
        .find(e => /Députés et sénateurs/.test(e.textContent || ""));
      const t2 = document.querySelector("#s-qui .who .t2");
      return {
        maire: (t2 && t2.textContent || "").trim(),
        circo: !!(carte && /circonscription/.test(carte.innerText || "")),
        ev: typeof EV_ETAT === "string" ? EV_ETAT : "?",
        cartes: (typeof FEED !== "undefined") ? FEED.length : -1
      };
    });
    await p2.waitForTimeout(400);
    const argent = await p2.evaluate(() => {
      showTab("s-argent");
      return new Promise(r => setTimeout(() => {
        const c = document.getElementById("arg-body");
        r(c ? c.querySelectorAll(".arg-row").length : -1);
      }, 800));
    });

    verif("invariant 1 — hors ligne, le nom du maire s'affiche",
      vu.maire.length > 2, "« " + vu.maire + " »");
    verif("invariant 1 — hors ligne, la circonscription s'affiche",
      vu.circo === true, "la phrase manque : la table embarquee n'a pas ete lue");
    verif("invariant 1 — hors ligne, les faits collectes sont servis depuis le cache",
      vu.ev === "servi", "EV_ETAT = " + vu.ev + " (le cache du service worker n'a pas repondu)");
    verif("invariant 1 — hors ligne, les comptes s'affichent",
      argent >= 5, argent + " ligne(s) dans #arg-body");
  }

  verif("invariant 1 — aucune erreur JavaScript hors ligne",
    erreurs2.length === 0, erreurs2.slice(0, 3).join(" | "));
  await ctx2.close();
} else {
  console.log("  note | fichier autonome : pas de service worker, controle hors ligne sans objet");
}

'''
s = s.replace(ancre, bloc + ancre, 1)
assert "’" not in bloc, "apostrophe typographique"
io.open(F, "w", encoding="utf-8").write(s)
print("patch 31 : %d -> %d caracteres" % (n0, len(s)))
