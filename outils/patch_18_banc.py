# -*- coding: utf-8 -*-
"""
patch_18_banc.py — LOT 3 : le banc, avant la refonte.

Trois manques que la refonte a venir rendrait invisibles :

 1. « au moins quinze ecrans » est un seuil, pas un inventaire. La cible de la
    refonte en compte douze : le controle resterait vert en perdant cinq ecrans.
    Remplace par la LISTE NOMMEE des ecrans mesures aujourd'hui, comparee comme
    un ensemble — une disparition ET une apparition sont toutes deux rapportees.

 2. Le fil lit desormais evenements.json (patch 16). Rien ne le verifiait.

 3. L'ecran argent trace desormais une serie et un comparatif (patch 17). Rien
    ne verifiait que les barres existent quand les comptes existent.

Methode : ancres relues, comptees, verifiees avant toute ecriture.
"""
import io, sys

F = "test_repere.mjs"
src = io.open(F, encoding="utf-8").read()
avant = len(src)

# ---------------------------------------------------------------- 1. inventaire
ancien = '  verif("navigation — au moins quinze ecrans declares", ids.length >= 15, ids.length + " ecran(s)");'
assert src.count(ancien) == 1, "ancre 1 introuvable ou multiple"

nouveau = '''  /* Un seuil (« au moins quinze ») laisse disparaitre un ecran sans rien dire.
     La refonte a venir vise douze ecrans : ce controle doit donc etre un
     INVENTAIRE, pas un plancher. Toute disparition et toute apparition sont
     rapportees ; changer la cible se fait ICI, deliberement, jamais par accident. */
  const ATTENDUS = ["s-fil", "s-agenda", "s-jeu", "s-qui", "s-partis", "s-debats",
    "s-elus", "s-vote", "s-argent", "s-influence", "s-suivis", "s-moi", "s-carte",
    "s-sources", "s-2027", "s-an", "s-dico"];
  {
    const vus = new Set(ids), att = new Set(ATTENDUS);
    const manquants = ATTENDUS.filter(i => !vus.has(i));
    const surnumeraires = ids.filter(i => !att.has(i));
    verif("navigation — l'inventaire des ecrans est exactement celui declare",
      manquants.length === 0 && surnumeraires.length === 0,
      (manquants.length ? "absent(s) : " + manquants.join(", ") : "")
      + (manquants.length && surnumeraires.length ? " ; " : "")
      + (surnumeraires.length ? "non declare(s) : " + surnumeraires.join(", ") : ""));
  }'''
src = src.replace(ancien, nouveau, 1)

# ------------------------------------------------- 2 et 3. fil et argent, mesures
ancre2 = 'verif("rendu — aucune erreur JavaScript sur tout le parcours",'
assert src.count(ancre2) == 1, "ancre 2 introuvable ou multiple"

bloc = '''/* Le fil, MESURE. Deux situations, deux verites differentes :
   - fichier source autonome : aucune adresse d'evenements n'est declaree, l'etat
     doit rester « absent » et le fil garder ses cartes ecrites a la main ;
   - index engendre, servi en HTTP : l'adresse existe, la lecture doit ABOUTIR.
   Un controle qui accepterait les deux cas indifferemment ne protegerait rien. */
{
  const f = await page.evaluate(() => ({
    url: window.REPERE_EVENEMENTS_URL || null,
    etat: typeof EV_ETAT === "string" ? EV_ETAT : "inconnu",
    cartes: Array.isArray(window.FEED) ? FEED.length : 0
  }));
  if (f.url) {
    verif("fil — le fichier d'evenements servi est bien consomme",
      f.etat === "servi", "EV_ETAT = " + f.etat + " pour " + f.url);
  } else {
    verif("fil — sans fichier servi, le chargeur ne tente rien et n'echoue pas",
      f.etat === "absent", "EV_ETAT = " + f.etat);
  }
  verif("fil — le fil n'est jamais vide", f.cartes >= 13, f.cartes + " carte(s)");
}

/* L'ecran argent, MESURE dans le navigateur. La regle : quand les comptes OFGL
   existent pour la commune du parcours, les barres doivent EXISTER. Un ecran
   argent qui affiche « pas encore releve » alors que la donnee est embarquee
   est exactement le defaut que le patch 17 corrigeait. */
{
  await page.evaluate(() => showTab("s-argent"));
  await page.waitForTimeout(700);
  const a = await page.evaluate(() => {
    const donnee = (typeof ARGENT_SERIE !== "undefined") ? ARGENT_SERIE.length : -1;
    const corps = document.getElementById("arg-body");
    const barres = corps ? corps.querySelectorAll(".ig-cmp .r").length : -1;
    const larg = corps ? [...corps.querySelectorAll(".ig-cmp .r .b i")]
      .map(i => Math.round(i.getBoundingClientRect().width)) : [];
    return { donnee, barres, nulles: larg.filter(w => w === 0).length,
             txt: (corps ? corps.innerText : "").slice(0, 0) };
  });
  verif("argent — la serie annuelle est alimentee par les comptes embarques",
    a.donnee >= 2, "ARGENT_SERIE = " + a.donnee + " point(s)");
  verif("argent — les barres sont reellement tracees, pas seulement calculees",
    a.barres >= 2, a.barres + " barre(s) dans #arg-body");
  /* Doctrine du vide, appliquee ici : une barre de largeur nulle ferait passer
     une valeur pour une absence. Aucune ne doit mesurer zero pixel. */
  verif("argent — aucune barre de largeur nulle",
    a.nulles === 0, a.nulles + " barre(s) a 0 px");
}

'''
src = src.replace(ancre2, bloc + ancre2, 1)

# -------------------------------------------------------------- garde-fous
assert "ids.length >= 15" not in src, "l'ancien seuil subsiste"
assert src.count("EV_ETAT") >= 3
assert src.count("arg-body") >= 1
assert "’" not in bloc + nouveau, "apostrophe typographique dans le code ecrit"

io.open(F, "w", encoding="utf-8").write(src)
print("patch 18 applique : %d -> %d octets" % (avant, len(src)))
