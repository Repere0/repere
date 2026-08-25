# -*- coding: utf-8 -*-
"""patch_27_banc_accents.py — un controle contre une faute que j'ai faite deux fois.

Le 25 aout, deux fois dans la meme journee, j'ai ecrit du texte AFFICHE sans
accents : « Les memes comptes », « depenses », « impots » le matin ; « decoupage
electoral », « partagee », « Repere » l'apres-midi. Chaque fois, la capture d'ecran
l'a vu et aucune assertion ne l'avait vu. Une faute qui revient deux fois est une
faute de methode : elle doit devenir un controle.

CE QUE LE CONTROLE MESURE : le TEXTE REELLEMENT AFFICHE, ecran par ecran, dans le
navigateur — pas le code source. Les commentaires du fichier sont volontairement
sans accents (regle du projet, pour que les ancres de patch restent stables) ; les
lire ferait echouer un fichier juste.

POURQUOI UNE LISTE DE MOTS ET PAS UNE REGLE GENERALE : « aucun mot francais sans
accent » n'est pas calculable sans dictionnaire. Une liste des mots que ce produit
emploie reellement l'est, elle se maintient en une ligne, et elle attrape la faute
telle qu'elle se produit — un mot du vocabulaire du projet, tape sans accent.

DEUX FAUSSES ALERTES ECARTEES, MESUREES :
  - « interieur » apparait sur l'ecran Agenda dans le nom de domaine
    « resultats-elections.interieur.gouv.fr ». Un nom de domaine n'a pas d'accents.
    Le motif refuse donc un mot colle a un point, un tiret ou une barre oblique.
  - le reste de l'application est deja propre : la sonde ne trouve rien d'autre
    sur les dix-sept ecrans. Le controle part donc au vert, sans exception a poser.
"""
import io

F = "test_repere.mjs"
s = io.open(F, encoding="utf-8").read()
n0 = len(s)

ancre = 'verif("rendu — aucune erreur JavaScript sur tout le parcours",'
assert s.count(ancre) == 1, "ancre introuvable ou multiple"

bloc = '''/* Le francais affiche porte ses accents. Mesure sur le rendu, jamais sur la
   source : les commentaires du fichier sont sans accents par regle. */
{
  const MOTS_SANS_ACCENT = ["Repere", "decoupage", "depute", "deputes", "legislative",
    "legislatives", "partagee", "creee", "creees", "electoral", "Repertoire", "elu",
    "elus", "depense", "depenses", "annee", "annees", "impots", "verifie", "verifies",
    "donnees", "numero", "reponse", "present", "apres", "different", "differente",
    "interieur", "ministere", "precedent", "resultat", "resultats", "memes", "meme",
    "eleve", "elevee", "exterieur", "regulier", "irregulieres", "facon", "reel"];

  const ids = await page.evaluate(() =>
    [...document.querySelectorAll('.screen[id^="s-"]')].map(e => e.id));
  for (const id of ids) {
    try { await page.evaluate(i => show(i, i), id); await page.waitForTimeout(110); }
    catch (e) { /* un ecran qui refuse de s'ouvrir est deja signale ailleurs */ }
  }

  const fautes = await page.evaluate(mots => {
    const vus = [];
    document.querySelectorAll(".screen").forEach(e => {
      const t = e.innerText || "";
      mots.forEach(m => {
        /* Un mot colle a un point, un tiret ou une barre oblique appartient a un
           nom de domaine ou a une adresse : ceux-la n'ont pas d'accents. */
        const re = new RegExp("(?:^|[^A-Za-zÀ-ÿ./-])" + m + "(?![A-Za-zÀ-ÿ./-])");
        if (re.test(t)) vus.push(e.id + " : " + m);
      });
    });
    return vus;
  }, MOTS_SANS_ACCENT);

  verif("langue — le francais affiche porte ses accents",
    fautes.length === 0, fautes.slice(0, 6).join(" | "));
}

'''
s = s.replace(ancre, bloc + ancre, 1)
assert "’" not in bloc
io.open(F, "w", encoding="utf-8").write(s)
print("patch 27 : %d -> %d caracteres" % (n0, len(s)))
