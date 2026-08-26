# -*- coding: utf-8 -*-
"""patch_34_listes.py — le descripteur ne regardait que le PREMIER element de chaque liste.

TROUVE EN EPROUVANT LE PATCH 33 SUR UNE ARCHIVE FABRIQUEE, et c'est plus grave que
ce que le patch 33 corrigeait.

`parcourir()` ecrivait :
    if noeud:
        parcourir(noeud[0], prefixe + "[]")
Un acteur de l'Assemblee porte une LISTE de mandats. Le mandat en cours a
l'Assemblee — celui qui porte election.lieu.numCirco, le champ dont la jointure
« depute -> circonscription » a besoin — n'est pas forcement le premier de la
liste. Le descripteur ne le voyait donc jamais, quel que soit le fichier ouvert.

MESURE. Archive fabriquee ici : 3 000 acteurs, trois d'entre eux portant un second
mandat de type ASSEMBLEE avec election.lieu.numCirco. Avec le seul patch 33 —
tirage glouton sur toute l'archive — le document engendre annonce 8 cles et ne
mentionne PAS numCirco : le tirage etait devenu bon, la lecture restait aveugle.
Le patch 33 seul n'aurait donc rien change.

CE QUE CE PATCH FAIT : parcourir TOUS les elements d'une liste, jusqu'a 50 par
liste. La borne evite d'ouvrir 600 votants un par un sur un scrutin, ou l'on sait
que les elements sont homogenes ; cinquante suffisent tres largement a faire
apparaitre une forme rare, et le cout reste borne.
"""
import io

F = "outils/echantillon_scrutins.py"
s = io.open(F, encoding="utf-8").read()
n0 = len(s)

# ------------------------------------------------- 1. l'inventaire des cles
a1 = '''        elif isinstance(noeud, list):
            vu.add(prefixe + "[]")
            if noeud:
                marche(noeud[0], prefixe + "[]")'''
assert s.count(a1) == 1, "ancre 1"
b1 = '''        elif isinstance(noeud, list):
            vu.add(prefixe + "[]")
            for x in noeud[:ELEMENTS]:
                marche(x, prefixe + "[]")'''
s = s.replace(a1, b1, 1)

# ------------------------------------------------- 2. l'arborescence decrite
a2 = '''    elif isinstance(noeud, list):
        # On note la liste, puis on decrit son PREMIER element : le reste a la meme forme.
        note(prefixe + "[]", "liste (%d)" % len(noeud), "")
        if noeud:
            parcourir(noeud[0], prefixe + "[]")'''
assert s.count(a2) == 1, "ancre 2"
b2 = '''    elif isinstance(noeud, list):
        # TOUS les elements, jusqu'a ELEMENTS. « Le reste a la meme forme » etait
        # l'hypothese ecrite ici jusqu'au 25/08/2026, et elle est fausse : la liste
        # des mandats d'un acteur melange des formes differentes, et celle qui porte
        # le numero de circonscription n'est presque jamais la premiere.
        note(prefixe + "[]", "liste (%d)" % len(noeud), "")
        for x in noeud[:ELEMENTS]:
            parcourir(x, prefixe + "[]")'''
s = s.replace(a2, b2, 1)

# ------------------------------------------------- 3. la borne, declaree une fois
a3 = "BALAYAGE = 3000     # fichiers ouverts au plus, repartis dans toute l'archive"
assert s.count(a3) == 1, "ancre 3"
b3 = (a3 + "\n"
      "ELEMENTS = 50       # elements parcourus au plus DANS UNE LISTE. Les listes\n"
      "                    # nominatives d'un scrutin comptent des centaines d'entrees\n"
      "                    # homogenes ; cinquante suffisent a faire sortir une forme\n"
      "                    # rare, et le cout reste borne.")
s = s.replace(a3, b3, 1)

assert "parcourir(noeud[0]" not in s, "l'ancienne lecture du premier element subsiste"
assert "marche(noeud[0]" not in s
io.open(F, "w", encoding="utf-8").write(s)
print("echantillon_scrutins.py : %d -> %d caracteres" % (n0, len(s)))
