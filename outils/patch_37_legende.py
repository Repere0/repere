# -*- coding: utf-8 -*-
"""patch_37_legende.py — la legende de la colonne « vu » ne dit pas ce qu'elle compte.

Elle annonce : « vu = sur combien des N fichiers analyses la cle est presente ».
Mesure sur une archive de 120 scrutins fabriquee ici : la cle des votants affiche
1 320, soit onze groupes politiques multiplies par cent vingt fichiers. Le compte
n'est pas un nombre de FICHIERS, c'est un nombre d'OCCURRENCES — ce qui est plus
informatif, mais pas ce que la legende promet.

On corrige la legende, pas le compte : savoir qu'une cle apparait 1 320 fois dit
qu'elle est dans chaque groupe de chaque scrutin ; savoir qu'elle apparait dans
120 fichiers ne le dirait pas.
"""
import io

F = "outils/echantillon_scrutins.py"
s = io.open(F, encoding="utf-8").read()
n0 = len(s)

a = '''    s.write("`vu` = sur combien des %d scrutins analyses la cle est presente. Une cle vue\\n"
            "moins de %d fois est optionnelle, et l'ingestion doit la traiter comme telle.\\n\\n"
            % (len(ECHANTILLON), len(ECHANTILLON)))'''
assert s.count(a) == 1, "ancre introuvable ou multiple"
b = '''    s.write("`vu` = nombre d'OCCURRENCES de la cle, tous fichiers confondus — pas un\\n"
            "nombre de fichiers : une cle situee dans une liste est comptee une fois par\\n"
            "element. Une cle vue beaucoup moins souvent que les autres est un cas\\n"
            "particulier, et l'ingestion doit la traiter comme facultative. Les cles vues\\n"
            "une seule fois sont reprises a part, plus bas.\\n\\n")'''
s = s.replace(a, b, 1)

assert "sur combien des %d scrutins analyses" not in s
io.open(F, "w", encoding="utf-8").write(s)
print("echantillon_scrutins.py : %d -> %d caracteres" % (n0, len(s)))
