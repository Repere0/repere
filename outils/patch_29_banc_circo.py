# -*- coding: utf-8 -*-
"""patch_29_banc_circo.py — quatre controles sur la circonscription.

Ce que chacun garde, et pourquoi :

 1. La phrase est PEINTE dans la carte des parlementaires. Calculee et jamais
    affichee, elle ne servirait a personne — c'est le defaut que le contradicteur
    avait trouve sur le re-rendu de l'ecran argent.

 2. Le numero affiche est celui que porte la table, RELU independamment. Comme
    pour la carte des comptes : le controle ne verifie pas que quelque chose est
    ecrit, il verifie que c'est le bon.

 3. La phrase ne NOMME AUCUN depute. Le rattachement depute -> circonscription
    n'existe pas dans les donnees embarquees ; le jour ou quelqu'un croira pouvoir
    l'inferer du departement, ce controle refusera.

 4. Sur les 34 626 communes de la table, la phrase se fabrique sans trou : ni
    chaine vide, ni « undefined », ni ordinal absent. Un balayage complet coute
    moins d'une seconde et couvre ce qu'aucun cas d'exemple ne couvre.
"""
import io

F = "test_repere.mjs"
s = io.open(F, encoding="utf-8").read()
n0 = len(s)

ancre = 'verif("rendu — aucune erreur JavaScript sur tout le parcours",'
assert s.count(ancre) == 1, "ancre introuvable ou multiple"

bloc = '''/* La circonscription, MESUREE dans le navigateur. */
{
  await page.evaluate(() => showTab("s-qui"));
  await page.waitForTimeout(600);

  const c = await page.evaluate(() => {
    if (typeof circoOk !== "function" || !circoOk()) return { absent: true };
    const carte = [...document.querySelectorAll("#s-qui .who")]
      .find(e => /Députés et sénateurs/.test(e.textContent || ""));
    const T = window.REPERE_CIRCOS.communes;
    /* Relecture independante : on va rechercher le numero dans la table, on
       refabrique l'ordinal ici, et on le cherche dans le texte affiche. */
    const v = T[STATE.insee];
    const attendu = (typeof v === "number") ? (v === 1 ? "1re" : v + "e") : null;

    /* Balayage complet : la phrase doit se fabriquer pour chaque commune. */
    let creux = 0, exemple = "";
    const codes = Object.keys(T);
    for (let i = 0; i < codes.length; i++) {
      const p = circoPhrase(codes[i], "Commune", "Territoire");
      if (!p || /undefined|NaN|\\bnulle?\\b/.test(p) || p.indexOf("circonscription") === -1) {
        creux++; if (!exemple) exemple = codes[i] + " -> " + String(p).slice(0, 60);
      }
    }
    return {
      absent: false,
      peinte: !!(carte && /circonscription/.test(carte.innerText || "")),
      texte: carte ? (carte.innerText || "") : "",
      attendu: attendu,
      total: codes.length,
      creux: creux,
      exemple: exemple
    };
  });

  if (c.absent) {
    verif("circonscription — la table est embarquee", false,
      "window.REPERE_CIRCOS absent : outils/circos_injecter.py n'a pas tourne");
  } else {
    verif("circonscription — la phrase est peinte dans la carte des parlementaires",
      c.peinte === true, "aucune mention de circonscription dans la carte");

    if (c.attendu) {
      verif("circonscription — le numero affiche est celui de la table",
        c.texte.indexOf("la " + c.attendu + " circonscription") !== -1,
        "attendu « la " + c.attendu + " circonscription », absent du texte");
    } else {
      verif("circonscription — le numero affiche est celui de la table",
        /circonscriptions législatives/.test(c.texte),
        "commune partagee : la phrase plurielle est attendue");
    }

    /* Aucun nom propre de parlementaire dans la phrase : le lien depute ->
       circonscription n'existe pas dans les donnees, il ne doit pas etre invente. */
    const phrase = (c.texte.match(/[^\\n]*circonscription[^\\n]*/) || [""])[0];
    verif("circonscription — la phrase ne nomme aucun depute",
      !/\\b[A-ZÀ-Ý]{2,}[A-ZÀ-Ý\\s-]{2,}\\b/.test(phrase.replace(/REPÈRE/gi, "")),
      phrase.slice(0, 90));

    verif("circonscription — la phrase se fabrique pour les " + c.total + " communes",
      c.creux === 0, c.creux + " creux, ex. " + c.exemple);
  }
}

'''
s = s.replace(ancre, bloc + ancre, 1)
assert "’" not in bloc
io.open(F, "w", encoding="utf-8").write(s)
print("patch 29 : %d -> %d caracteres" % (n0, len(s)))
