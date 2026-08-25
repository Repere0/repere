# -*- coding: utf-8 -*-
"""patch_23_banc_traduction.py — trois controles pour la carte de traduction.

CE QU'ILS MESURENT, ET POURQUOI CEUX-LA :

 1. La carte existe et porte ses rapports, MESUREE dans le navigateur. Un bloc
    calcule mais jamais peint est le defaut que le contradicteur a trouve sur le
    re-rendu de l'ecran argent : on ne repete pas la faute.

 2. Le chiffre affiche est RECALCULE par le banc a partir des montants bruts, et
    compare a ce que la page montre. C'est le seul controle qui distingue « la
    division est faite » de « la division est juste ». Sans lui, une erreur de
    signe ou d'indice d'agregat passerait en silence — et une application qui
    traduit des comptes publics ne peut pas se tromper sur une division.

 3. Aucun vocabulaire de comparaison ni de jugement dans la carte (invariant 3),
    et la phrase qui dit que ce sont des divisions et non des chiffres publies
    est bien la (invariant 4).

CE QUE JE N'AJOUTE PAS, ET POURQUOI : aucun controle sur l'etat vide de la carte.
Mesure faite sur les 34 875 communes du fichier : 32 857 obtiennent les cinq
rapports, 1 890 en obtiennent quatre, 120 trois, 8 deux, et AUCUNE moins de deux.
La branche vide existe pour un exercice futur plus pauvre ; la calibrer
aujourd'hui donnerait un controle qui echoue au premier tour, qu'il faudrait
desactiver, et qui ne reviendrait jamais.
"""
import io

F = "test_repere.mjs"
s = io.open(F, encoding="utf-8").read()
n0 = len(s)

ancre = 'verif("rendu — aucune erreur JavaScript sur tout le parcours",'
assert s.count(ancre) == 1, "ancre introuvable ou multiple"

bloc = '''/* La carte de traduction des comptes, MESUREE dans le navigateur. */
{
  await page.evaluate(() => showTab("s-argent"));
  await page.waitForTimeout(700);

  const t = await page.evaluate(() => {
    const corps = document.getElementById("arg-body");
    if (!corps) return null;
    const cartes = [...corps.querySelectorAll(".arg-card")];
    const carte = cartes.find(c => /veulent dire/.test(c.textContent || ""));
    if (!carte) return { trouvee: false };
    /* Recalcul independant : on relit les montants BRUTS dans les donnees, on
       refait la division ici, et on la compare a ce que la page affiche. */
    const ex = (typeof ofglExerciceAffiche === "function")
      ? (ofglExerciceAffiche("ville") || {}).ex : null;
    const val = i => (typeof ofglVal === "function") ? ofglVal(ex, i) : null;
    const dep = val(1), sal = val(4);
    const attendu = (dep && sal && dep.m > 0)
      ? Math.round(sal.m / dep.m * 100) : null;
    return {
      trouvee: true,
      rapports: carte.querySelectorAll(".arg-row").length,
      texte: (carte.innerText || ""),
      attenduSalaires: attendu
    };
  });

  verif("traduction — la carte des rapports est peinte a l'ecran",
    t && t.trouvee === true, t ? "carte absente de #arg-body" : "#arg-body introuvable");

  verif("traduction — au moins deux rapports affiches",
    t && t.rapports >= 2, t ? t.rapports + " rapport(s)" : "");

  /* Le controle qui distingue « la division est faite » de « elle est juste ». */
  if (t && t.attenduSalaires !== null) {
    const attendu = t.attenduSalaires + " € de salaires";
    verif("traduction — le rapport affiche est celui que redonne le calcul",
      t.texte.indexOf(attendu) !== -1,
      "attendu « " + attendu + " », absent du texte de la carte");
  } else {
    verif("traduction — le rapport affiche est celui que redonne le calcul",
      false, "les montants bruts n'ont pas pu etre relus pour recalculer");
  }

  /* Invariant 3 et invariant 4, dans la carte elle-meme. Les mots cherches sont
     ceux qui trahiraient une comparaison ou un jugement ; « compare » est exclu
     de la recherche parce que la carte contient « ne compare ce territoire a un
     autre », qui est exactement la promesse et non sa violation. */
  const fautifs = (t && t.texte ? t.texte : "")
    .split(/\\s+/).join(" ")
    .match(/moyenne nationale|classement|palmar|mieux que|moins bien|bien g[ée]r|mal g[ée]r/i);
  verif("traduction — aucun jugement ni comparaison entre territoires",
    fautifs === null, fautifs ? fautifs[0] : "");

  verif("traduction — la carte dit que ce sont des divisions, pas des chiffres publies",
    (t && t.texte || "").indexOf("ce sont des divisions") !== -1,
    "la mention manque : un calcul passerait pour une donnee officielle");
}

'''
s = s.replace(ancre, bloc + ancre, 1)
assert "’" not in bloc, "apostrophe typographique"
io.open(F, "w", encoding="utf-8").write(s)
print("patch 23 : %d -> %d caracteres" % (n0, len(s)))
