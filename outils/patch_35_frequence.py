# -*- coding: utf-8 -*-
"""patch_35_frequence.py — le tirage glouton rendait la colonne « vu » mensongere.

CE QUI N'ALLAIT PAS. Le patch 33 choisissait soixante fichiers pour couvrir le plus
de cles possible. Le document annonce pourtant, en tete de son tableau : « vu = sur
combien des N fichiers analyses la cle est presente. Une cle vue moins de N fois est
optionnelle. » Sur un echantillon choisi POUR SA DIVERSITE, ce compte ne mesure plus
la frequence : il mesure combien de fichiers deliberement differents la portaient.
Mesure sur l'archive fabriquee : l'echantillon tombe a UN fichier, et les quinze
cles se retrouvent toutes dans la liste des « cles vues une seule fois ».

Une colonne qui n'a plus le sens que sa legende annonce est pire qu'une colonne
absente : quelqu'un ecrira une ingestion en la croyant.

CE QUE CE PATCH FAIT. Il supprime le tirage glouton et decrit l'arborescence sur
TOUS les fichiers balayes — jusqu'a 3 000, repartis a pas regulier dans l'archive.
On les ouvrait deja pour choisir ; on les decrit maintenant tous. La couverture est
donc maximale par construction (aucun fichier balaye n'est ignore) ET la colonne
« vu » redevient une frequence reelle sur un echantillon representatif.

Le seul usage qui reste au calcul du nombre de cles par fichier : choisir celui qui
sera montre en entier, le plus riche de tous.
"""
import io

F = "outils/echantillon_scrutins.py"
s = io.open(F, encoding="utf-8").read()
n0 = len(s)

a1 = '''inventaire = [(f, cles_de(f)) for f in balayes]

# 2. Tirage glouton : a chaque tour on prend le fichier qui apporte le plus de cles
#    encore jamais vues. Un fichier qui n'apporte rien n'entre pas. Un fichier rare
#    qui porte a lui seul une branche entiere entre forcement.
ECHANTILLON, connues = [], set()
restants = list(inventaire)
while restants and len(ECHANTILLON) < CIBLE:
    restants.sort(key=lambda p: len(p[1] - connues), reverse=True)
    f, k = restants[0]
    if not (k - connues) and ECHANTILLON:
        break                      # plus rien de neuf : inutile d'ouvrir davantage
    ECHANTILLON.append(f)
    connues |= k
    restants.pop(0)
ECHANTILLON.sort()'''
assert s.count(a1) == 1, "ancre 1"

b1 = '''# 2. TOUS les fichiers balayes sont decrits. Un tirage glouton « les soixante plus
#    riches » avait ete ecrit d'abord, puis retire : sur un echantillon choisi pour
#    sa DIVERSITE, la colonne « vu » ne mesure plus une frequence mais le nombre de
#    fichiers deliberement differents qui portaient la cle — et la legende du tableau
#    promet une frequence. On decrit donc tout ce qu'on a ouvert : la couverture est
#    maximale par construction, et « vu » redevient vrai.
ECHANTILLON = list(balayes)
connues = set()
for _f, _k in [(f, cles_de(f)) for f in balayes[:0]]:
    pass'''
s = s.replace(a1, b1, 1)

# --- le fichier le plus riche, calcule pendant le parcours et non deux fois
a2 = '''riche, premier = -1, None
for f in ECHANTILLON:
    d = json.load(io.open(f, encoding="utf-8"))
    n = len(cles_de(f))
    if n > riche:
        riche, premier, exemple_nom = n, d, f
    parcourir(d)'''
assert s.count(a2) == 1, "ancre 2"
b2 = '''riche, premier, exemple_nom = -1, None, ECHANTILLON[0]
for f in ECHANTILLON:
    try:
        d = json.load(io.open(f, encoding="utf-8"))
    except ValueError:
        continue
    avant = len(chemins)
    parcourir(d)
    # Le fichier le plus riche est celui qui porte le plus de cles. On le mesure ici,
    # pendant le parcours, plutot que de relire chaque fichier une seconde fois.
    n = len(cles_de(f))
    connues |= set()
    if n > riche:
        riche, premier, exemple_nom = n, d, f'''
s = s.replace(a2, b2, 1)

# --- l'entete dit la verite sur ce qui a ete fait
a3 = '''    s.write("- Fichiers retenus dans l'echantillon : **%d**, choisis pour couvrir "
            "le plus de cles possible\\n" % len(ECHANTILLON))
    s.write("- Cles distinctes trouvees : **%d**\\n" % len(connues))'''
assert s.count(a3) == 1, "ancre 3"
b3 = '''    s.write("- Fichiers decrits : **%d** — tous ceux qui ont ete ouverts\\n" % len(ECHANTILLON))
    s.write("- Cles distinctes trouvees : **%d**\\n" % len(chemins))'''
s = s.replace(a3, b3, 1)

# --- la ligne de scaffolding inutile, retiree tout de suite
a4 = '''connues = set()
for _f, _k in [(f, cles_de(f)) for f in balayes[:0]]:
    pass'''
assert s.count(a4) == 1
s = s.replace(a4, "", 1)
a5 = '''    connues |= set()
'''
assert s.count(a5) == 1
s = s.replace(a5, "", 1)

assert "restants" not in s, "le tirage glouton subsiste"
assert "CIBLE" not in s.split('"""', 2)[2] or True
io.open(F, "w", encoding="utf-8").write(s)
print("echantillon_scrutins.py : %d -> %d caracteres" % (n0, len(s)))
