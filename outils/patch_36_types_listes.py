# -*- coding: utf-8 -*-
"""patch_36_types_listes.py — la colonne « type » allait exploser.

REGRESSION ANTICIPEE ET MESUREE AVANT DE LIVRER. Le type d'une liste etait note
« liste (N) », N etant sa longueur dans CE fichier. Sur soixante fichiers, la
colonne affichait deja quarante-neuf variantes accolees :

    liste (10)/liste (111)/liste (115)/liste (116)/liste (117)/liste (12)/...

C'est deja illisible. En decrivant 3 000 fichiers au lieu de 60, cette colonne
deviendrait plusieurs milliers de variantes sur une seule ligne de tableau — un
document engendre que personne ne pourrait plus ouvrir.

CE QUE LE PATCH FAIT : une liste est de type « liste », et sa longueur est
rapportee comme une PLAGE, « de 2 a 617 entrees », qui est l'information utile —
elle dit a qui ecrit une ingestion si la liste peut etre vide, et jusqu'ou elle
peut monter.
"""
import io

F = "outils/echantillon_scrutins.py"
s = io.open(F, encoding="utf-8").read()
n0 = len(s)

a1 = '        note(prefixe + "[]", "liste (%d)" % len(noeud), "")'
assert s.count(a1) == 1, "ancre 1"
b1 = '        note(prefixe + "[]", "liste", "", len(noeud))'
s = s.replace(a1, b1, 1)

a2 = '''def note(chemin, typ, exemple):
    e = chemins.setdefault(chemin, {"types": set(), "exemples": [], "vu": 0})
    e["vu"] += 1
    e["types"].add(typ)'''
assert s.count(a2) == 1, "ancre 2"
b2 = '''def note(chemin, typ, exemple, taille=None):
    e = chemins.setdefault(chemin, {"types": set(), "exemples": [], "vu": 0,
                                    "min": None, "max": None})
    e["vu"] += 1
    e["types"].add(typ)
    # La LONGUEUR d'une liste n'est pas son type : la noter comme tel produisait une
    # variante par longueur rencontree, soit des milliers sur 3 000 fichiers. On garde
    # la plage, qui est ce dont a besoin qui ecrit une ingestion : la liste peut-elle
    # etre vide, et jusqu'ou monte-t-elle.
    if taille is not None:
        e["min"] = taille if e["min"] is None else min(e["min"], taille)
        e["max"] = taille if e["max"] is None else max(e["max"], taille)'''
s = s.replace(a2, b2, 1)

a3 = '''        ex = " · ".join(x.replace("|", "\\\\|") for x in e["exemples"])'''
assert s.count(a3) == 1, "ancre 3"
b3 = '''        ex = " · ".join(x.replace("|", "\\\\|") for x in e["exemples"])
        if e["max"] is not None:
            plage = ("%d entree(s)" % e["max"]) if e["min"] == e["max"] \\
                    else ("de %d a %d entrees" % (e["min"], e["max"]))
            ex = (plage + (" · " + ex if ex else ""))'''
s = s.replace(a3, b3, 1)

assert '"liste (%d)"' not in s, "l'ancien type de liste subsiste"
io.open(F, "w", encoding="utf-8").write(s)
print("echantillon_scrutins.py : %d -> %d caracteres" % (n0, len(s)))
